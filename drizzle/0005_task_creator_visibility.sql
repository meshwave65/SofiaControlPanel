-- Track whether a task was created by an authenticated user or by a trusted system/AI workflow.
-- Existing tasks remain user-created for backward compatibility.
ALTER TABLE "sofia"."tasks"
  ADD COLUMN IF NOT EXISTS "creatorType" varchar(16) NOT NULL DEFAULT 'user';
