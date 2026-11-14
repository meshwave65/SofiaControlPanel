CREATE SCHEMA IF NOT EXISTS "sofia";--> statement-breakpoint
CREATE TYPE "sofia"."agent_status" AS ENUM('online', 'offline', 'idle', 'paused');--> statement-breakpoint
CREATE TYPE "sofia"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "sofia"."activityEventTypes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."activityEventTypes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "activityEventTypes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sofia"."activityLogs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."activityLogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"agentId" integer NOT NULL,
	"taskId" integer,
	"eventTypeId" integer NOT NULL,
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."agents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."agents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ownerId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "sofia"."agent_status" DEFAULT 'offline' NOT NULL,
	"version" varchar(64),
	"manusAccount" varchar(255),
	"manusPassword" varchar(255),
	"manusToken" text,
	"lastHeartbeat" timestamp,
	"connectionStatus" varchar(32) DEFAULT 'not_configured' NOT NULL,
	"connectionError" text,
	"creditsRemaining" numeric(12, 2),
	"creditsUpdatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."contextReports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."contextReports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ownerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"creditsUsed" numeric(10, 2),
	"gitHubUrl" varchar(512),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."messageTypes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."messageTypes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messageTypes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sofia"."messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"taskId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"parentMessageId" integer,
	"typeId" integer NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."scheduledTasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."scheduledTasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"cronExpression" varchar(64) NOT NULL,
	"endpoint" varchar(512) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"lastRun" timestamp,
	"nextRun" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."taskPriorities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."taskPriorities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"level" integer NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "taskPriorities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sofia"."taskStatuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."taskStatuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "taskStatuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sofia"."tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"agentId" integer,
	"createdBy" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"statusId" integer NOT NULL,
	"priorityId" integer NOT NULL,
	"parentTaskId" integer,
	"dueDate" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "sofia"."role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "sofia"."activityLogs" ADD CONSTRAINT "activityLogs_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "sofia"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."activityLogs" ADD CONSTRAINT "activityLogs_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."activityLogs" ADD CONSTRAINT "activityLogs_eventTypeId_activityEventTypes_id_fk" FOREIGN KEY ("eventTypeId") REFERENCES "sofia"."activityEventTypes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."agents" ADD CONSTRAINT "agents_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "sofia"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."contextReports" ADD CONSTRAINT "contextReports_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "sofia"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."messages" ADD CONSTRAINT "messages_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."messages" ADD CONSTRAINT "messages_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "sofia"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."messages" ADD CONSTRAINT "messages_parentMessageId_messages_id_fk" FOREIGN KEY ("parentMessageId") REFERENCES "sofia"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."messages" ADD CONSTRAINT "messages_typeId_messageTypes_id_fk" FOREIGN KEY ("typeId") REFERENCES "sofia"."messageTypes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD CONSTRAINT "tasks_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "sofia"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD CONSTRAINT "tasks_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "sofia"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD CONSTRAINT "tasks_statusId_taskStatuses_id_fk" FOREIGN KEY ("statusId") REFERENCES "sofia"."taskStatuses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD CONSTRAINT "tasks_priorityId_taskPriorities_id_fk" FOREIGN KEY ("priorityId") REFERENCES "sofia"."taskPriorities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD CONSTRAINT "tasks_parentTaskId_tasks_id_fk" FOREIGN KEY ("parentTaskId") REFERENCES "sofia"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activityLogs_agentId_idx" ON "sofia"."activityLogs" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "activityLogs_taskId_idx" ON "sofia"."activityLogs" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "activityLogs_eventTypeId_idx" ON "sofia"."activityLogs" USING btree ("eventTypeId");--> statement-breakpoint
CREATE INDEX "activityLogs_createdAt_idx" ON "sofia"."activityLogs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "agents_ownerId_idx" ON "sofia"."agents" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "agents_status_idx" ON "sofia"."agents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contextReports_ownerId_idx" ON "sofia"."contextReports" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "contextReports_createdAt_idx" ON "sofia"."contextReports" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "messages_taskId_idx" ON "sofia"."messages" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "messages_senderId_idx" ON "sofia"."messages" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "messages_parentMessageId_idx" ON "sofia"."messages" USING btree ("parentMessageId");--> statement-breakpoint
CREATE INDEX "scheduledTasks_isActive_idx" ON "sofia"."scheduledTasks" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "tasks_agentId_idx" ON "sofia"."tasks" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "tasks_statusId_idx" ON "sofia"."tasks" USING btree ("statusId");--> statement-breakpoint
CREATE INDEX "tasks_createdBy_idx" ON "sofia"."tasks" USING btree ("createdBy");
