import postgres from "postgres";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Render PR previews copy the base service's environment, including DATABASE_URL.
// Never run startup DDL or reinstall dispatch triggers against the base database.
if (process.env.IS_PULL_REQUEST === "true") {
  console.log(
    "[Database] Render PR preview detected; skipping database bootstrap to protect the shared database.",
  );
  process.exit(0);
}

const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
if (!url) {
  console.error("[Database] DATABASE_URL is required before starting SofiaControlPanel");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 10 });

// Postgres error codes worth retrying: lock_not_available (lock_timeout) and
// deadlock_detected. Another session (for example the previous Render instance
// during a rolling deploy) may briefly hold a lock on the table we need to alter.
const RETRYABLE_CODES = new Set(["55P03", "40P01"]);
const MAX_ATTEMPTS = Math.max(1, Number(process.env.DB_BOOTSTRAP_LOCK_ATTEMPTS) || 4);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runStep(label, operation) {
  console.log(`[Database] ${label}...`);
  for (let attempt = 1; ; attempt++) {
    try {
      await operation();
      break;
    } catch (error) {
      if (!RETRYABLE_CODES.has(error?.code) || attempt >= MAX_ATTEMPTS) throw error;
      const waitMs = attempt * 3000;
      console.warn(
        `[Database] ${label}: ${error.code} (attempt ${attempt}/${MAX_ATTEMPTS}); retrying in ${waitMs / 1000}s`,
      );
      await sleep(waitMs);
    }
  }
  console.log(`[Database] ${label}: OK`);
}

// Read-only helpers. They take no table locks, so the common case (schema already
// up to date) never competes with other sessions. DDL only runs when needed.
async function existingColumns(regclass) {
  const rows = await sql`
    SELECT attname
      FROM pg_catalog.pg_attribute
     WHERE attrelid = to_regclass(${regclass})
       AND attnum > 0
       AND NOT attisdropped`;
  return new Set(rows.map((row) => row.attname));
}

async function isColumnNotNull(regclass, column) {
  const rows = await sql`
    SELECT attnotnull
      FROM pg_catalog.pg_attribute
     WHERE attrelid = to_regclass(${regclass})
       AND attname = ${column}
       AND NOT attisdropped`;
  // Missing table/column => treat as "needs migration" so the real error surfaces.
  return rows.length === 0 ? true : rows[0].attnotnull;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

const DISPATCH_MARKER_PREFIX = "sofia-migration:0003_automatic_task_dispatch sha256=";

try {
  // Supabase roles may impose a short statement_timeout. Schema verification
  // includes DDL and trigger installation, which can legitimately take longer.
  await runStep("Set migration timeouts", async () => {
    await sql`SET statement_timeout = '60s'`;
    await sql`SET lock_timeout = '15s'`;
  });

  await runStep("Ensure sofia schema", () =>
    sql`CREATE SCHEMA IF NOT EXISTS "sofia"`,
  );

  const columns = [
    ['isAssistant', 'boolean NOT NULL DEFAULT false'],
    ['agentPinned', 'boolean NOT NULL DEFAULT false'],
    ['creatorType', "varchar(16) NOT NULL DEFAULT 'user'"],
    ['missionKey', 'varchar(64)'],
    ['githubPath', 'varchar(512)'],
    ['githubSha', 'varchar(128)'],
    ['githubSyncStatus', "varchar(32) NOT NULL DEFAULT 'pending'"],
    ['githubSyncError', 'text'],
    ['githubSyncedAt', 'timestamp'],
    ['manusTaskId', 'varchar(128)'],
    ['manusStatus', 'varchar(32)'],
    ['creditsUsed', 'integer'],
    ['lastSyncedAt', 'timestamp'],
  ];

  // ALTER TABLE ... ADD COLUMN IF NOT EXISTS takes an ACCESS EXCLUSIVE lock even
  // when the column is already there, so only touch the table for missing columns.
  const present = await existingColumns('sofia.tasks');
  const missing = columns.filter(([name]) => !present.has(name));
  if (missing.length === 0) {
    console.log("[Database] tasks execution columns already present; no DDL needed");
  }
  for (const [name, definition] of missing) {
    await runStep(`Add tasks.${name}`, () =>
      sql.unsafe(
        `ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "${name}" ${definition}`,
      ),
    );
  }

  // The dispatch migration drops and recreates the trigger on sofia.tasks (strong
  // lock). Skip it when the trigger exists and the function matches the migration
  // file, which is tracked with a hash stored as a comment on the function.
  const dispatchMigration = await readFile(
    new URL("../drizzle/0003_automatic_task_dispatch.sql", import.meta.url),
    "utf8",
  );
  const dispatchMarker = `${DISPATCH_MARKER_PREFIX}${sha256(dispatchMigration)}`;
  const [dispatchState] = await sql`
    SELECT
      EXISTS (
        SELECT 1
          FROM pg_catalog.pg_trigger
         WHERE tgrelid = to_regclass('sofia.tasks')
           AND tgname = 'tasks_dispatch_staged'
           AND NOT tgisinternal
      ) AS trigger_exists,
      obj_description(to_regprocedure('sofia.notify_task_dispatch()'), 'pg_proc') AS marker`;
  if (dispatchState.trigger_exists && dispatchState.marker === dispatchMarker) {
    console.log("[Database] Automatic task dispatch trigger already up to date; skipping");
  } else {
    await runStep("Install automatic task dispatch trigger", () =>
      sql.unsafe(dispatchMigration),
    );
    try {
      await sql.unsafe(
        `COMMENT ON FUNCTION sofia.notify_task_dispatch() IS '${dispatchMarker}'`,
      );
    } catch (error) {
      // Not fatal: without the marker the migration is simply re-applied next boot.
      console.warn("[Database] Could not record dispatch migration marker:", error?.message);
    }
  }

  // Both remaining migrations are ALTER COLUMN ... DROP NOT NULL, which also lock
  // the table even if the column is already nullable. Apply only when still NOT NULL.
  if (await isColumnNotNull('sofia."activityLogs"', "agentId")) {
    const activityLogMigration = await readFile(
      new URL("../drizzle/0008_activity_logs_optional_agent.sql", import.meta.url),
      "utf8",
    );
    await runStep("Allow task-level activity logs without an assigned agent", () =>
      sql.unsafe(activityLogMigration),
    );
  } else {
    console.log("[Database] activityLogs.agentId already nullable; skipping");
  }

  if (await isColumnNotNull('sofia."messages"', "taskId")) {
    const messageContextMigration = await readFile(
      new URL("../drizzle/0015_message_general_context.sql", import.meta.url),
      "utf8",
    );
    await runStep("Allow general messages without a mission", () =>
      sql.unsafe(messageContextMigration),
    );
  } else {
    console.log("[Database] messages.taskId already nullable; skipping");
  }

  console.log("[Database] Execution columns verified successfully");
  console.log("[Database] Automatic task dispatch trigger verified successfully");
} catch (error) {
  console.error("[Database] Database initialization failed:", error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}