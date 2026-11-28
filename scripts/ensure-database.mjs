import postgres from "postgres";
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

async function runStep(label, operation) {
  console.log(`[Database] ${label}...`);
  await operation();
  console.log(`[Database] ${label}: OK`);
}

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

  for (const [name, definition] of columns) {
    await runStep(`Verify tasks.${name}`, () =>
      sql.unsafe(
        `ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "${name}" ${definition}`,
      ),
    );
  }

  const dispatchMigration = await readFile(
    new URL("../drizzle/0003_automatic_task_dispatch.sql", import.meta.url),
    "utf8",
  );
  await runStep("Install automatic task dispatch trigger", () =>
    sql.unsafe(dispatchMigration),
  );

  const activityLogMigration = await readFile(
    new URL("../drizzle/0008_activity_logs_optional_agent.sql", import.meta.url),
    "utf8",
  );
  await runStep("Allow task-level activity logs without an assigned agent", () =>
    sql.unsafe(activityLogMigration),
  );

  const messageContextMigration = await readFile(
    new URL("../drizzle/0015_message_general_context.sql", import.meta.url),
    "utf8",
  );
  await runStep("Allow general messages without a mission", () =>
    sql.unsafe(messageContextMigration),
  );

  const textBlocksMigration = await readFile(
    new URL("../drizzle/0017_text_blocks.sql", import.meta.url),
    "utf8",
  );
  await runStep("Create conversational text contexts and blocks", () =>
    sql.unsafe(textBlocksMigration),
  );

  console.log("[Database] Execution columns verified successfully");
  console.log("[Database] Automatic task dispatch trigger verified successfully");
} catch (error) {
  console.error("[Database] Database initialization failed:", error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
