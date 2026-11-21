-- Add explicit task ownership, separate from technical creator identity.
ALTER TABLE sofia.tasks
  ADD COLUMN IF NOT EXISTS "ownerUserId" integer;

UPDATE sofia.tasks
SET "ownerUserId" = CASE
  WHEN "creatorType" = 'system' THEN 1425
  ELSE "createdBy"
END
WHERE "ownerUserId" IS NULL;

UPDATE sofia.tasks
SET "createdBy" = 1425
WHERE "creatorType" = 'system'
  AND "createdBy" <> 1425;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_ownerUserId_fkey'
      AND conrelid = 'sofia.tasks'::regclass
  ) THEN
    ALTER TABLE sofia.tasks
      ADD CONSTRAINT tasks_ownerUserId_fkey
      FOREIGN KEY ("ownerUserId") REFERENCES sofia.users(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS tasks_ownerUserId_idx ON sofia.tasks ("ownerUserId");
