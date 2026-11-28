CREATE TABLE "sofia"."textContexts" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "ownerId" integer NOT NULL,
  "taskId" integer,
  "title" varchar(255),
  "contextType" varchar(32) DEFAULT 'conversation' NOT NULL,
  "status" varchar(24) DEFAULT 'active' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "textContexts_ownerId_users_id_fk"
    FOREIGN KEY ("ownerId") REFERENCES "sofia"."users"("id") ON DELETE RESTRICT,
  CONSTRAINT "textContexts_taskId_tasks_id_fk"
    FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."textBlocks" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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
  "completedAt" timestamp,
  CONSTRAINT "textBlocks_contextId_textContexts_id_fk"
    FOREIGN KEY ("contextId") REFERENCES "sofia"."textContexts"("id") ON DELETE RESTRICT,
  CONSTRAINT "textBlocks_ownerId_users_id_fk"
    FOREIGN KEY ("ownerId") REFERENCES "sofia"."users"("id") ON DELETE RESTRICT,
  CONSTRAINT "textBlocks_taskId_tasks_id_fk"
    FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE SET NULL,
  CONSTRAINT "textBlocks_parentBlockId_textBlocks_id_fk"
    FOREIGN KEY ("parentBlockId") REFERENCES "sofia"."textBlocks"("id") ON DELETE RESTRICT,
  CONSTRAINT "textBlocks_sourceAgentId_agents_id_fk"
    FOREIGN KEY ("sourceAgentId") REFERENCES "sofia"."agents"("id") ON DELETE SET NULL,
  CONSTRAINT "textBlocks_responseStatus_check"
    CHECK ("responseStatus" IN ('pending', 'replied', 'failed'))
);
--> statement-breakpoint
CREATE INDEX "textContexts_ownerId_idx" ON "sofia"."textContexts" USING btree ("ownerId");
--> statement-breakpoint
CREATE INDEX "textContexts_taskId_idx" ON "sofia"."textContexts" USING btree ("taskId");
--> statement-breakpoint
CREATE INDEX "textBlocks_contextId_idx" ON "sofia"."textBlocks" USING btree ("contextId");
--> statement-breakpoint
CREATE INDEX "textBlocks_ownerId_idx" ON "sofia"."textBlocks" USING btree ("ownerId");
--> statement-breakpoint
CREATE INDEX "textBlocks_taskId_idx" ON "sofia"."textBlocks" USING btree ("taskId");
--> statement-breakpoint
CREATE INDEX "textBlocks_parentBlockId_idx" ON "sofia"."textBlocks" USING btree ("parentBlockId");
--> statement-breakpoint
CREATE INDEX "textBlocks_createdAt_idx" ON "sofia"."textBlocks" USING btree ("createdAt");
