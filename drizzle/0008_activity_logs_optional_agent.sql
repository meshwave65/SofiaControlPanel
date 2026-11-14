-- Activity events can describe mission-level operations before an agent is assigned.
-- Keep the foreign key: non-null agent IDs must still reference a real agent.
ALTER TABLE "sofia"."activityLogs"
  ALTER COLUMN "agentId" DROP NOT NULL;
