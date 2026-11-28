-- Append-only conversational interaction blocks. Safe to execute on every application bootstrap.
CREATE TABLE IF NOT EXISTS "sofia"."textContexts" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "ownerId" integer NOT NULL,
  "taskId" integer,
  "title" varchar(255),
  "contextType" varchar(32) DEFAULT 'conversation' NOT NULL,
  "status" varchar(24) DEFAULT 'active' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sofia"."textBlocks" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "contextId" integer NOT NULL,
  "ownerId" integer NOT NULL,
  "taskId" integer,
  "parentBlockId" integer,
  "operatorContent" text NOT NULL,
  "assistantContent" text,
  "responseStatus" varchar(24) DEFAULT 'pending' NOT NULL,
  "sourceModel" varchar(128),
  "sourceAgentId" integer,
  "sourceMetadata" jsonb,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "completedAt" timestamp
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textContexts_ownerId_users_id_fk' AND conrelid = 'sofia."textContexts"'::regclass) THEN
    ALTER TABLE "sofia"."textContexts" ADD CONSTRAINT "textContexts_ownerId_users_id_fk"
      FOREIGN KEY ("ownerId") REFERENCES "sofia"."users"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textContexts_taskId_tasks_id_fk' AND conrelid = 'sofia."textContexts"'::regclass) THEN
    ALTER TABLE "sofia"."textContexts" ADD CONSTRAINT "textContexts_taskId_tasks_id_fk"
      FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textBlocks_contextId_textContexts_id_fk' AND conrelid = 'sofia."textBlocks"'::regclass) THEN
    ALTER TABLE "sofia"."textBlocks" ADD CONSTRAINT "textBlocks_contextId_textContexts_id_fk"
      FOREIGN KEY ("contextId") REFERENCES "sofia"."textContexts"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textBlocks_ownerId_users_id_fk' AND conrelid = 'sofia."textBlocks"'::regclass) THEN
    ALTER TABLE "sofia"."textBlocks" ADD CONSTRAINT "textBlocks_ownerId_users_id_fk"
      FOREIGN KEY ("ownerId") REFERENCES "sofia"."users"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textBlocks_taskId_tasks_id_fk' AND conrelid = 'sofia."textBlocks"'::regclass) THEN
    ALTER TABLE "sofia"."textBlocks" ADD CONSTRAINT "textBlocks_taskId_tasks_id_fk"
      FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textBlocks_parentBlockId_textBlocks_id_fk' AND conrelid = 'sofia."textBlocks"'::regclass) THEN
    ALTER TABLE "sofia"."textBlocks" ADD CONSTRAINT "textBlocks_parentBlockId_textBlocks_id_fk"
      FOREIGN KEY ("parentBlockId") REFERENCES "sofia"."textBlocks"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textBlocks_sourceAgentId_agents_id_fk' AND conrelid = 'sofia."textBlocks"'::regclass) THEN
    ALTER TABLE "sofia"."textBlocks" ADD CONSTRAINT "textBlocks_sourceAgentId_agents_id_fk"
      FOREIGN KEY ("sourceAgentId") REFERENCES "sofia"."agents"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'textBlocks_responseStatus_check' AND conrelid = 'sofia."textBlocks"'::regclass) THEN
    ALTER TABLE "sofia"."textBlocks" ADD CONSTRAINT "textBlocks_responseStatus_check"
      CHECK ("responseStatus" IN ('pending', 'replied', 'failed'));
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textContexts_ownerId_idx" ON "sofia"."textContexts" USING btree ("ownerId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textContexts_taskId_idx" ON "sofia"."textContexts" USING btree ("taskId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textBlocks_contextId_idx" ON "sofia"."textBlocks" USING btree ("contextId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textBlocks_ownerId_idx" ON "sofia"."textBlocks" USING btree ("ownerId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textBlocks_taskId_idx" ON "sofia"."textBlocks" USING btree ("taskId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textBlocks_parentBlockId_idx" ON "sofia"."textBlocks" USING btree ("parentBlockId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textBlocks_createdAt_idx" ON "sofia"."textBlocks" USING btree ("createdAt");
