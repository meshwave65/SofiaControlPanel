ALTER TABLE "sofia"."tasks" ADD COLUMN "manusTaskId" varchar(128);--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD COLUMN "manusStatus" varchar(32);--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD COLUMN "creditsUsed" integer;--> statement-breakpoint
ALTER TABLE "sofia"."tasks" ADD COLUMN "lastSyncedAt" timestamp;