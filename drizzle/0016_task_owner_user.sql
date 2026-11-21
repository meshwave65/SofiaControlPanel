-- Add explicit task ownership, separate from technical creator identity.
ALTER TABLE sofia.tasks
  ADD COLUMN "ownerUserId" integer;

UPDATE sofia.tasks
SET "ownerUserId" = CASE
  WHEN "creatorType" = 'system' THEN 1425
  ELSE "createdBy"
END;

UPDATE sofia.tasks
SET "createdBy" = 1425
WHERE "creatorType" = 'system'
  AND "createdBy" <> 1425;

ALTER TABLE sofia.tasks
  ADD CONSTRAINT tasks_ownerUserId_fkey
  FOREIGN KEY ("ownerUserId") REFERENCES sofia.users(id) ON DELETE RESTRICT;

CREATE INDEX tasks_ownerUserId_idx ON sofia.tasks ("ownerUserId");
