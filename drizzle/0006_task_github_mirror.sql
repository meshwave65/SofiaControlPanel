-- Persist stable provenance and synchronization state for the GitHub mission mirror.
ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "missionKey" varchar(64);
ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "githubPath" varchar(512);
ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "githubSha" varchar(128);
ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "githubSyncStatus" varchar(32) NOT NULL DEFAULT 'pending';
ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "githubSyncError" text;
ALTER TABLE "sofia"."tasks" ADD COLUMN IF NOT EXISTS "githubSyncedAt" timestamp;
CREATE UNIQUE INDEX IF NOT EXISTS "tasks_missionKey_unique" ON "sofia"."tasks" ("missionKey");
