-- ARC-011: operational telemetry and confidence snapshots.
-- No GPS, IP, network hash or device fingerprint is collected in this phase.
CREATE TABLE IF NOT EXISTS "sofia"."arcAccessEvents" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "sofia"."users"("id") ON DELETE CASCADE,
  "agentId" integer REFERENCES "sofia"."agents"("id") ON DELETE SET NULL,
  "taskId" integer REFERENCES "sofia"."tasks"("id") ON DELETE SET NULL,
  "sessionId" varchar(128), "source" varchar(64) NOT NULL DEFAULT 'task_detail',
  "observedAt" timestamp NOT NULL DEFAULT now(), "agentStatus" varchar(32),
  "agentVersion" varchar(64), "connectionStatus" varchar(32),
  "heartbeatRecent" boolean NOT NULL DEFAULT false, "activityCount" integer NOT NULL DEFAULT 0,
  "completedTasks" integer NOT NULL DEFAULT 0, "observedTasks" integer NOT NULL DEFAULT 0, "metadata" jsonb
);
CREATE INDEX IF NOT EXISTS "arcAccessEvents_userId_idx" ON "sofia"."arcAccessEvents" ("userId");
CREATE INDEX IF NOT EXISTS "arcAccessEvents_agentId_idx" ON "sofia"."arcAccessEvents" ("agentId");
CREATE INDEX IF NOT EXISTS "arcAccessEvents_taskId_idx" ON "sofia"."arcAccessEvents" ("taskId");
CREATE INDEX IF NOT EXISTS "arcAccessEvents_observedAt_idx" ON "sofia"."arcAccessEvents" ("observedAt");

CREATE TABLE IF NOT EXISTS "sofia"."arcDeviceProfiles" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "ownerId" integer NOT NULL REFERENCES "sofia"."users"("id") ON DELETE CASCADE,
  "agentId" integer NOT NULL REFERENCES "sofia"."agents"("id") ON DELETE CASCADE,
  "known" boolean NOT NULL DEFAULT false, "firstSeenAt" timestamp NOT NULL DEFAULT now(),
  "lastSeenAt" timestamp NOT NULL DEFAULT now(), "observationCount" integer NOT NULL DEFAULT 0,
  "lastVersion" varchar(64), "lastConnectionStatus" varchar(32),
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "arcDeviceProfiles_agentId_unique" UNIQUE ("agentId")
);
CREATE INDEX IF NOT EXISTS "arcDeviceProfiles_ownerId_idx" ON "sofia"."arcDeviceProfiles" ("ownerId");

CREATE TABLE IF NOT EXISTS "sofia"."arcConfidenceSnapshots" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "sofia"."users"("id") ON DELETE CASCADE,
  "agentId" integer REFERENCES "sofia"."agents"("id") ON DELETE SET NULL,
  "taskId" integer REFERENCES "sofia"."tasks"("id") ON DELETE SET NULL,
  "assessmentId" integer REFERENCES "sofia"."arcAssessments"("id") ON DELETE SET NULL,
  "accessEventId" integer REFERENCES "sofia"."arcAccessEvents"("id") ON DELETE SET NULL,
  "score" numeric(5,2) NOT NULL, "posterior" numeric(7,6) NOT NULL, "decision" varchar(16) NOT NULL,
  "anomalyCount" integer NOT NULL DEFAULT 0, "trigger" varchar(64) NOT NULL DEFAULT 'assessment',
  "signals" jsonb NOT NULL, "observedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "arcConfidenceSnapshots_userId_idx" ON "sofia"."arcConfidenceSnapshots" ("userId");
CREATE INDEX IF NOT EXISTS "arcConfidenceSnapshots_agentId_idx" ON "sofia"."arcConfidenceSnapshots" ("agentId");
CREATE INDEX IF NOT EXISTS "arcConfidenceSnapshots_taskId_idx" ON "sofia"."arcConfidenceSnapshots" ("taskId");
CREATE INDEX IF NOT EXISTS "arcConfidenceSnapshots_observedAt_idx" ON "sofia"."arcConfidenceSnapshots" ("observedAt");

ALTER TABLE "sofia"."arcAccessEvents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."arcDeviceProfiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."arcConfidenceSnapshots" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "sofia"."arcAccessEvents", "sofia"."arcDeviceProfiles", "sofia"."arcConfidenceSnapshots" FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "arcAccessEvents_server_only" ON "sofia"."arcAccessEvents";
CREATE POLICY "arcAccessEvents_server_only" ON "sofia"."arcAccessEvents" FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "arcDeviceProfiles_server_only" ON "sofia"."arcDeviceProfiles";
CREATE POLICY "arcDeviceProfiles_server_only" ON "sofia"."arcDeviceProfiles" FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "arcConfidenceSnapshots_server_only" ON "sofia"."arcConfidenceSnapshots";
CREATE POLICY "arcConfidenceSnapshots_server_only" ON "sofia"."arcConfidenceSnapshots" FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
