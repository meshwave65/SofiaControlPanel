-- MISSION_0033: bind the known 22-Nov test artifacts to a legacy session and expire it.
-- The session is intentionally centralIdentityId=NULL because these rows were created
-- before the central Auth integration; ownerUserId remains the local FK projection.
-- The Edge Function performs the actual idempotent database + Storage purge.

CREATE OR REPLACE FUNCTION sandbox.reject_mission_document_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('sandbox.purge', true) = 'on' THEN
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE'
     AND current_setting('sandbox.session_backfill', true) = 'on'
     AND (to_jsonb(NEW) - 'sandboxSessionId') = (to_jsonb(OLD) - 'sandboxSessionId') THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Mission document versions are immutable; create a new version instead';
END;
$function$;

DO $legacy$
DECLARE
  v_owner_id integer;
  v_session_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM sandbox.agents
     WHERE id = 1 AND name = 'mateus' AND "ownerId" = 1
  ) THEN
    RAISE EXCEPTION 'Expected legacy Sandbox test agent id=1/name=mateus was not found; refusing broad cleanup';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM sandbox.tasks
     WHERE id = 1 AND "createdBy" = 1 AND "missionKey" = 'SCP-TASK-000001'
  ) THEN
    RAISE EXCEPTION 'Expected legacy test mission SCP-TASK-000001 was not found; refusing broad cleanup';
  END IF;

  IF (SELECT count(*) FROM sandbox."missionDocuments" WHERE "taskId" = 1) <> 2
     OR (SELECT count(*) FROM sandbox."missionDocumentVersions" v
          JOIN sandbox."missionDocuments" d ON d.id = v."documentId"
         WHERE d."taskId" = 1) <> 4 THEN
    RAISE EXCEPTION 'Legacy test mission document inventory changed; refusing broad cleanup';
  END IF;

  SELECT "ownerId" INTO v_owner_id FROM sandbox.agents WHERE id = 1;

  INSERT INTO sandbox.sessions (
    "centralIdentityId","ownerUserId","startedAt","expiresAt"
  )
  VALUES (
    NULL,
    v_owner_id,
    now() - interval '1 hour',
    now() + interval '23 hours'
  )
  RETURNING id INTO v_session_id;

  PERFORM set_config('sandbox.session_backfill','on',true);

  UPDATE sandbox.users
     SET "activeSandboxSessionId" = v_session_id
   WHERE id = v_owner_id;

  UPDATE sandbox.agents
     SET "sandboxSessionId" = v_session_id
   WHERE id = 1;

  UPDATE sandbox.tasks
     SET "sandboxSessionId" = v_session_id
   WHERE id = 1;

  UPDATE sandbox."missionDocuments"
     SET "sandboxSessionId" = v_session_id
   WHERE "taskId" = 1;

  UPDATE sandbox."missionDocumentVersions" v
     SET "sandboxSessionId" = v_session_id
    FROM sandbox."missionDocuments" d
   WHERE d.id = v."documentId"
     AND d."taskId" = 1;

  UPDATE sandbox.sessions
     SET "startedAt" = now() - interval '72 hours',
         "expiresAt" = now() - interval '48 hours',
         status = 'EXPIRED',
         "purgeReason" = 'TTL',
         "closedAt" = now(),
         "updatedAt" = now()
   WHERE id = v_session_id;
END;
$legacy$;
