import postgres from "postgres";

const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
if (!url) {
  console.error("[Database] DATABASE_URL is required before starting SofiaControlPanel");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 10 });

try {
  await sql`CREATE SCHEMA IF NOT EXISTS "sofia"`;
  await sql`ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "manusTaskId" varchar(128)`;
  await sql`ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "manusStatus" varchar(32)`;
  await sql`ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "creditsUsed" integer`;
  await sql`ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "lastSyncedAt" timestamp`;
  console.log("[Database] Execution columns verified successfully");
} catch (error) {
  console.error("[Database] Failed to verify execution columns:", error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
