-- MISSION_0033: session ownership, TTL, automatic database purge and Storage dispatch.
-- Requires Supabase pg_net, pg_cron, pgcrypto and Vault extensions (enabled by the deployment step).

DO $preflight$ BEGIN
  IF to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') IS NULL THEN
    RAISE EXCEPTION 'pg_net extension must be enabled before Sandbox session migration';
  END IF;
  IF to_regprocedure('cron.schedule(text,text,text)') IS NULL THEN
    RAISE EXCEPTION 'pg_cron extension must be enabled before Sandbox session migration';
  END IF;
END; $preflight$;

CREATE OR REPLACE VIEW sandbox.agent_catalog_public WITH (security_invoker = true) AS
SELECT id, name, description, status, version, "connectionStatus", "lastHeartbeat", "createdAt", "updatedAt"
FROM sandbox.agents a;

REVOKE ALL ON sandbox.agent_catalog_public FROM PUBLIC, anon, authenticated;

CREATE TABLE sandbox.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "centralIdentityId" uuid,
  "ownerUserId" integer NOT NULL REFERENCES sandbox.users(id) ON DELETE RESTRICT,
  status varchar(16) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','CLOSING','EXPIRED','PURGING','PURGED')),
  "startedAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  "closedAt" timestamptz,
  "purgedAt" timestamptz,
  "purgeReason" varchar(16) CHECK ("purgeReason" IN ('MANUAL','TTL')),
  "purgeResult" jsonb,
  "purgeAttempts" integer NOT NULL DEFAULT 0,
  "purgeStartedAt" timestamptz,
  "lastDispatchedAt" timestamptz,
  "lastPurgeError" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sandbox_sessions_ttl_check
    CHECK ("expiresAt" > "startedAt" AND "expiresAt" <= "startedAt" + interval '24 hours')
);

CREATE INDEX sandbox_sessions_owner_status_idx
  ON sandbox.sessions ("ownerUserId", status, "expiresAt");
CREATE UNIQUE INDEX sandbox_sessions_one_active_per_owner_idx
  ON sandbox.sessions ("ownerUserId") WHERE status = 'ACTIVE';

ALTER TABLE sandbox.users
  ADD COLUMN "activeSandboxSessionId" uuid;

ALTER TABLE sandbox.users
  ADD CONSTRAINT users_active_sandbox_session_fk
  FOREIGN KEY ("activeSandboxSessionId") REFERENCES sandbox.sessions(id) ON DELETE SET NULL;

CREATE INDEX users_active_sandbox_session_idx
  ON sandbox.users ("activeSandboxSessionId");

ALTER TABLE sandbox.agents
  ADD COLUMN "sandboxSessionId" uuid,
  ADD COLUMN "agentOrigin" varchar(24) NOT NULL DEFAULT 'SANDBOX_SESSION',
  ADD CONSTRAINT agents_origin_check CHECK ("agentOrigin" IN ('SCP_CATALOG','SANDBOX_SESSION'));

DO $$
DECLARE
  table_name text;
  tables text[] := ARRAY[
    'activityLogs','arcAccessEvents','arcAssessments','arcConfidenceSnapshots',
    'arcDeviceProfiles','arcEvidence','contextReports','governanceMissions',
    'messages','missionActionUnitGateEvidence','missionActionUnits',
    'missionDocumentVersions','missionDocuments','missionParameters',
    'scheduledTasks','tasks'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE sandbox.%I ADD COLUMN "sandboxSessionId" uuid', table_name);
  END LOOP;
END;
$$;

DO $$
DECLARE
  table_name text;
  tables text[] := ARRAY[
    'agents','activityLogs','arcAccessEvents','arcAssessments','arcConfidenceSnapshots',
    'arcDeviceProfiles','arcEvidence','contextReports','governanceMissions',
    'messages','missionActionUnitGateEvidence','missionActionUnits',
    'missionDocumentVersions','missionDocuments','missionParameters',
    'scheduledTasks','tasks'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables LOOP
    EXECUTE format(
      'ALTER TABLE sandbox.%I ADD CONSTRAINT %I FOREIGN KEY ("sandboxSessionId") REFERENCES sandbox.sessions(id) ON DELETE RESTRICT',
      table_name, table_name || '_sandbox_session_fk'
    );
    EXECUTE format(
      'CREATE INDEX %I ON sandbox.%I ("sandboxSessionId")',
      table_name || '_sandbox_session_idx', table_name
    );
  END LOOP;
END;
$$;

ALTER TABLE sandbox.sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE sandbox.sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SCHEMA sandbox FROM PUBLIC, anon, authenticated;

-- Session attribution is derived server-side from the authenticated local user projection
-- and the parent task/agent/document. Clients cannot choose another session.
CREATE OR REPLACE FUNCTION sandbox.assign_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  row_data jsonb := to_jsonb(NEW);
  v_session uuid;
  v_owner_id integer;
  v_session_owner integer;
  v_status text;
  v_expires_at timestamptz;
  v_required boolean := false;
BEGIN
  IF TG_TABLE_NAME = 'agents' THEN
    IF row_data->>'agentOrigin' = 'SCP_CATALOG' THEN
      NEW := jsonb_populate_record(NEW, jsonb_build_object('sandboxSessionId', NULL));
      RETURN NEW;
    END IF;
    v_required := true;
    v_owner_id := nullif(row_data->>'ownerId','')::integer;

  ELSIF TG_TABLE_NAME = 'tasks' THEN
    v_required := true;
    v_owner_id := coalesce(nullif(row_data->>'ownerUserId','')::integer,
                           nullif(row_data->>'createdBy','')::integer);

  ELSIF TG_TABLE_NAME = 'messages' THEN
    v_required := true;
    v_owner_id := nullif(row_data->>'senderId','')::integer;
    IF row_data->>'taskId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session
      FROM sandbox.tasks WHERE id = (row_data->>'taskId')::integer;
    END IF;

  ELSIF TG_TABLE_NAME = 'activityLogs' THEN
    IF row_data->>'taskId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session
      FROM sandbox.tasks WHERE id = (row_data->>'taskId')::integer;
    ELSIF row_data->>'agentId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session
      FROM sandbox.agents WHERE id = (row_data->>'agentId')::integer;
    END IF;

  ELSIF TG_TABLE_NAME = 'contextReports' THEN
    v_required := true;
    v_owner_id := nullif(row_data->>'ownerId','')::integer;

  ELSIF TG_TABLE_NAME = 'arcAssessments' THEN
    v_required := true;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox.tasks WHERE id = (row_data->>'taskId')::integer;

  ELSIF TG_TABLE_NAME = 'arcEvidence' THEN
    v_required := true;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox."arcAssessments" WHERE id = (row_data->>'assessmentId')::integer;

  ELSIF TG_TABLE_NAME = 'arcAccessEvents' THEN
    v_required := true;
    v_owner_id := nullif(row_data->>'userId','')::integer;
    IF row_data->>'taskId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session
      FROM sandbox.tasks WHERE id = (row_data->>'taskId')::integer;
    ELSIF row_data->>'agentId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session
      FROM sandbox.agents WHERE id = (row_data->>'agentId')::integer;
    END IF;

  ELSIF TG_TABLE_NAME = 'arcDeviceProfiles' THEN
    v_required := true;
    v_owner_id := nullif(row_data->>'ownerId','')::integer;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox.agents WHERE id = (row_data->>'agentId')::integer;

  ELSIF TG_TABLE_NAME = 'arcConfidenceSnapshots' THEN
    v_required := true;
    v_owner_id := nullif(row_data->>'userId','')::integer;
    IF row_data->>'taskId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session FROM sandbox.tasks WHERE id = (row_data->>'taskId')::integer;
    ELSIF row_data->>'assessmentId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session FROM sandbox."arcAssessments" WHERE id = (row_data->>'assessmentId')::integer;
    ELSIF row_data->>'accessEventId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session FROM sandbox."arcAccessEvents" WHERE id = (row_data->>'accessEventId')::integer;
    ELSIF row_data->>'agentId' IS NOT NULL THEN
      SELECT "sandboxSessionId" INTO v_session FROM sandbox.agents WHERE id = (row_data->>'agentId')::integer;
    END IF;

  ELSIF TG_TABLE_NAME = 'missionDocuments' THEN
    v_required := true;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox.tasks WHERE id = (row_data->>'taskId')::integer;

  ELSIF TG_TABLE_NAME = 'missionDocumentVersions' THEN
    v_required := true;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox."missionDocuments" WHERE id = (row_data->>'documentId')::integer;

  ELSIF TG_TABLE_NAME = 'missionActionUnits' THEN
    v_required := true;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox.tasks WHERE id = (row_data->>'missionTaskId')::integer;

  ELSIF TG_TABLE_NAME = 'missionActionUnitGateEvidence' THEN
    v_required := true;
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox."missionActionUnits" WHERE id = (row_data->>'actionUnitId')::integer;

  ELSIF TG_TABLE_NAME = 'governanceMissions' THEN
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox.tasks WHERE "missionKey" = row_data->>'missionKey'
    ORDER BY id DESC LIMIT 1;

  ELSIF TG_TABLE_NAME = 'missionParameters' THEN
    SELECT "sandboxSessionId" INTO v_session
    FROM sandbox."governanceMissions" WHERE "missionKey" = row_data->>'missionKey'
    ORDER BY id DESC LIMIT 1;
  END IF;

  IF row_data->>'sandboxSessionId' IS NOT NULL THEN
    v_session := (row_data->>'sandboxSessionId')::uuid;
  ELSIF v_session IS NULL AND v_owner_id IS NOT NULL THEN
    SELECT "activeSandboxSessionId" INTO v_session
    FROM sandbox.users WHERE id = v_owner_id;
  END IF;

  IF v_session IS NULL AND v_required THEN
    RAISE EXCEPTION 'Active Sandbox session is required for %.%', TG_TABLE_NAME, TG_OP;
  END IF;

  IF v_session IS NOT NULL THEN
    SELECT "ownerUserId", status, "expiresAt"
      INTO v_session_owner, v_status, v_expires_at
    FROM sandbox.sessions WHERE id = v_session;

    IF NOT FOUND OR v_status <> 'ACTIVE' OR v_expires_at <= now() THEN
      RAISE EXCEPTION 'Sandbox session % is not active', v_session;
    END IF;

    IF v_owner_id IS NOT NULL AND v_session_owner <> v_owner_id THEN
      RAISE EXCEPTION 'Sandbox session owner mismatch';
    END IF;
  END IF;

  NEW := jsonb_populate_record(NEW, jsonb_build_object('sandboxSessionId', v_session));
  RETURN NEW;
END;
$function$;

CREATE TRIGGER agents_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox.agents
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER tasks_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox.tasks
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER messages_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox.messages
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER activity_logs_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."activityLogs"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER context_reports_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."contextReports"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER arc_assessments_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."arcAssessments"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER arc_evidence_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."arcEvidence"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER arc_access_events_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."arcAccessEvents"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER arc_device_profiles_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."arcDeviceProfiles"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER arc_confidence_snapshots_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."arcConfidenceSnapshots"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER mission_documents_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."missionDocuments"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER mission_document_versions_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."missionDocumentVersions"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER mission_action_units_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."missionActionUnits"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER mission_action_unit_evidence_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."missionActionUnitGateEvidence"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER governance_missions_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."governanceMissions"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER mission_parameters_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."missionParameters"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();
CREATE TRIGGER scheduled_tasks_assign_sandbox_session
BEFORE INSERT OR UPDATE ON sandbox."scheduledTasks"
FOR EACH ROW EXECUTE FUNCTION sandbox.assign_session();

CREATE OR REPLACE FUNCTION sandbox.sync_mission_registry_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  IF NEW."missionKey" IS NOT NULL AND NEW."sandboxSessionId" IS NOT NULL THEN
    UPDATE sandbox."governanceMissions"
       SET "sandboxSessionId" = NEW."sandboxSessionId"
     WHERE "missionKey" = NEW."missionKey"
       AND "sandboxSessionId" IS NULL;
    UPDATE sandbox."missionParameters"
       SET "sandboxSessionId" = NEW."sandboxSessionId"
     WHERE "missionKey" = NEW."missionKey"
       AND "sandboxSessionId" IS NULL;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER tasks_sync_mission_registry_session
AFTER INSERT OR UPDATE OF "missionKey", "sandboxSessionId" ON sandbox.tasks
FOR EACH ROW EXECUTE FUNCTION sandbox.sync_mission_registry_session();

CREATE TRIGGER governance_missions_sync_parameters_session
AFTER INSERT OR UPDATE OF "sandboxSessionId" ON sandbox."governanceMissions"
FOR EACH ROW EXECUTE FUNCTION sandbox.sync_mission_registry_session();

CREATE OR REPLACE FUNCTION sandbox.ensure_active_session(
  p_owner_user_id integer,
  p_central_identity_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  v_session uuid;
BEGIN
  PERFORM 1 FROM sandbox.users WHERE id = p_owner_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sandbox user projection % not found', p_owner_user_id;
  END IF;

  UPDATE sandbox.sessions
     SET status = 'EXPIRED',
         "purgeReason" = 'TTL',
         "closedAt" = coalesce("closedAt", now()),
         "updatedAt" = now()
   WHERE "ownerUserId" = p_owner_user_id
     AND status = 'ACTIVE'
     AND "expiresAt" <= now();

  SELECT id INTO v_session
    FROM sandbox.sessions
   WHERE "ownerUserId" = p_owner_user_id
     AND status = 'ACTIVE'
     AND "expiresAt" > now()
   ORDER BY "startedAt" DESC
   LIMIT 1;

  IF v_session IS NULL THEN
    INSERT INTO sandbox.sessions ("centralIdentityId", "ownerUserId")
    VALUES (p_central_identity_id, p_owner_user_id)
    RETURNING id INTO v_session;
  END IF;

  UPDATE sandbox.users
     SET "activeSandboxSessionId" = v_session
   WHERE id = p_owner_user_id;

  RETURN v_session;
END;
$function$;

CREATE OR REPLACE FUNCTION sandbox.enforce_session_ttl()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  IF NEW."expiresAt" <= NEW."startedAt"
     OR NEW."expiresAt" > NEW."startedAt" + interval '24 hours' THEN
    RAISE EXCEPTION 'Sandbox session maximum lifetime is 24 hours';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER sessions_enforce_max_ttl
BEFORE INSERT OR UPDATE OF "startedAt", "expiresAt" ON sandbox.sessions
FOR EACH ROW EXECUTE FUNCTION sandbox.enforce_session_ttl();

-- Vault holds the internal Edge Function dispatch token; the secret is never stored in source control.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'sandbox_session_purge_token'
  ) THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'sandbox_session_purge_token',
      'Internal token for the Sandbox session purge Edge Function'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION sandbox.dispatch_pending_session_purges()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox', 'vault', 'net'
AS $function$
DECLARE
  v_token text;
  v_session record;
  v_count integer := 0;
BEGIN
  SELECT decrypted_secret INTO v_token
    FROM vault.decrypted_secrets
   WHERE name = 'sandbox_session_purge_token'
   LIMIT 1;

  IF v_token IS NULL THEN
    RAISE WARNING 'Sandbox purge token is unavailable; pending sessions remain queued';
    RETURN 0;
  END IF;

  FOR v_session IN
    SELECT id
      FROM sandbox.sessions
     WHERE status IN ('CLOSING','EXPIRED')
       AND ("lastDispatchedAt" IS NULL OR "lastDispatchedAt" < now() - interval '1 minute')
     ORDER BY "createdAt"
     LIMIT 50
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE sandbox.sessions
       SET "lastDispatchedAt" = now(),
           "purgeAttempts" = "purgeAttempts" + 1,
           "updatedAt" = now()
     WHERE id = v_session.id;

    PERFORM net.http_post(
      url := 'https://rqvjsjfypuojuaetxkig.supabase.co/functions/v1/sandbox-session-purge',
      body := jsonb_build_object('session_id', v_session.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Internal-Token', v_token
      ),
      timeout_milliseconds := 10000
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$function$;

CREATE OR REPLACE FUNCTION sandbox.dispatch_after_session_close()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  PERFORM sandbox.dispatch_pending_session_purges();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER sessions_dispatch_purge
AFTER UPDATE OF status ON sandbox.sessions
FOR EACH ROW
WHEN (OLD.status = 'ACTIVE' AND NEW.status IN ('CLOSING','EXPIRED'))
EXECUTE FUNCTION sandbox.dispatch_after_session_close();

CREATE OR REPLACE FUNCTION sandbox.run_session_maintenance()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  v_dispatched integer;
BEGIN
  UPDATE sandbox.sessions
     SET status = 'EXPIRED',
         "purgeReason" = 'TTL',
         "closedAt" = coalesce("closedAt", now()),
         "updatedAt" = now()
   WHERE status = 'ACTIVE'
     AND "expiresAt" <= now();

  v_dispatched := sandbox.dispatch_pending_session_purges();
  RETURN v_dispatched;
END;
$function$;

CREATE OR REPLACE FUNCTION sandbox.close_session(
  p_session_id uuid,
  p_owner_user_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  UPDATE sandbox.sessions
     SET status = 'CLOSING',
         "purgeReason" = 'MANUAL',
         "closedAt" = now(),
         "updatedAt" = now()
   WHERE id = p_session_id
     AND "ownerUserId" = p_owner_user_id
     AND status = 'ACTIVE';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active Sandbox session not found for this owner';
  END IF;
END;
$function$;

-- The two append-only source triggers permit DELETE only inside the controlled purge transaction.
CREATE OR REPLACE FUNCTION sandbox.reject_mission_document_version_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('sandbox.purge', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Mission document versions are immutable; create a new version instead';
END;
$function$;

CREATE OR REPLACE FUNCTION sandbox.validate_mission_action_unit_gate_evidence()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  unit_row record;
  mission_owner_id integer;
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('sandbox.purge', true) = 'on' THEN
    RETURN OLD;
  END IF;
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'Mission action-unit gate evidence is append-only';
  END IF;

  SELECT *
    INTO unit_row
    FROM sandbox."missionActionUnits"
   WHERE id = NEW."actionUnitId";
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Action-plan unit not found';
  END IF;

  IF NEW."missionTaskId" IS DISTINCT FROM unit_row."missionTaskId"
     OR NEW."actionPlanDocumentId" IS DISTINCT FROM unit_row."actionPlanDocumentId"
     OR NEW."actionPlanVersionId" IS DISTINCT FROM unit_row."actionPlanVersionId"
     OR NEW."actionPlanVersionNumber" IS DISTINCT FROM unit_row."actionPlanVersionNumber"
     OR NEW."actionPlanContentHash" IS DISTINCT FROM unit_row."actionPlanContentHash"
     OR NEW."unitId" IS DISTINCT FROM unit_row."unitId" THEN
    RAISE EXCEPTION 'Gate evidence identity must match the immutable ACTION_PLAN unit identity';
  END IF;

  SELECT "createdBy" INTO mission_owner_id
    FROM sandbox.tasks
   WHERE id = NEW."missionTaskId"
     AND "parentTaskId" IS NULL;
  IF mission_owner_id IS NULL THEN
    RAISE EXCEPTION 'Gate evidence must reference a root mission';
  END IF;

  IF NEW."actorType" = 'OWNER' AND NEW."actorUserId" IS DISTINCT FROM mission_owner_id THEN
    RAISE EXCEPTION 'Owner-authored gate evidence must be recorded by the mission owner';
  END IF;

  RETURN NEW;
END;
$function$;

-- Copy the non-dispatch governance functions with the schema rebound to Sandbox.
CREATE OR REPLACE FUNCTION sandbox.enforce_execution_documents_before_staged()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  staged_status_id integer;
  progress_status_id integer;
  paused_status_id integer;
  mission_id integer;
  mission_status_id integer;
  latest_tr_id integer;
  latest_tr_state text;
  latest_blueprint_state text;
  latest_blueprint_source_id integer;
BEGIN
  SELECT id INTO staged_status_id FROM sandbox."taskStatuses" WHERE name = 'STAGED' LIMIT 1;
  SELECT id INTO progress_status_id FROM sandbox."taskStatuses" WHERE name = 'PROGRESS' LIMIT 1;
  SELECT id INTO paused_status_id FROM sandbox."taskStatuses" WHERE name = 'PAUSED' LIMIT 1;

  IF progress_status_id IS NOT NULL AND NEW."statusId" = progress_status_id THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Execution blocked: tasks cannot be inserted directly in PROGRESS';
    END IF;
    IF OLD."statusId" IS DISTINCT FROM progress_status_id
       AND OLD."statusId" IS DISTINCT FROM staged_status_id
       AND NOT (OLD."statusId" IS NOT DISTINCT FROM paused_status_id AND NEW."manusTaskId" IS NOT NULL) THEN
      RAISE EXCEPTION 'Execution blocked: PROGRESS requires a STAGED claim or an existing external execution resumed from PAUSED';
    END IF;
  ELSIF staged_status_id IS NULL OR NEW."statusId" IS DISTINCT FROM staged_status_id THEN
    RETURN NEW;
  END IF;
  IF NEW."parentTaskId" IS NULL THEN
    mission_id := NEW.id;
  ELSE
    WITH RECURSIVE ancestors AS (
      SELECT id, "parentTaskId", ARRAY[id] AS path
        FROM sandbox.tasks WHERE id = NEW."parentTaskId"
      UNION ALL
      SELECT parent.id, parent."parentTaskId", child.path || parent.id
        FROM sandbox.tasks parent
        JOIN ancestors child ON parent.id = child."parentTaskId"
       WHERE NOT parent.id = ANY(child.path)
    )
    SELECT id INTO mission_id FROM ancestors WHERE "parentTaskId" IS NULL LIMIT 1;
  END IF;
  IF mission_id IS NULL THEN RAISE EXCEPTION 'Execution blocked: top-level mission could not be resolved for task %', NEW.id; END IF;

  IF NEW.id = mission_id THEN
    mission_status_id := NEW."statusId";
  ELSE
    SELECT "statusId" INTO mission_status_id FROM sandbox.tasks WHERE id = mission_id;
  END IF;
  IF mission_status_id IS DISTINCT FROM staged_status_id
     AND mission_status_id IS DISTINCT FROM progress_status_id THEN
    RAISE EXCEPTION 'Execution blocked: root mission % must be STAGED or PROGRESS before child tasks can be dispatched', mission_id;
  END IF;

  SELECT version_row.id, version_row.state
    INTO latest_tr_id, latest_tr_state
    FROM sandbox."missionDocuments" document_row
    JOIN sandbox."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
    JOIN sandbox."missionDocumentVersions" version_row ON version_row."documentId" = document_row.id
   WHERE document_row."taskId" = mission_id AND document_row."documentKey" = 'TR' AND type_row."typeKey" = 'TR'
   ORDER BY version_row.version DESC LIMIT 1;

  SELECT version_row.state, version_row."sourceDocumentVersionId"
    INTO latest_blueprint_state, latest_blueprint_source_id
    FROM sandbox."missionDocuments" document_row
    JOIN sandbox."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
    JOIN sandbox."missionDocumentVersions" version_row ON version_row."documentId" = document_row.id
   WHERE document_row."taskId" = mission_id AND document_row."documentKey" = 'BLUEPRINT' AND type_row."typeKey" = 'BLUEPRINT'
   ORDER BY version_row.version DESC LIMIT 1;

  IF latest_tr_id IS NULL OR latest_tr_state NOT IN ('VALIDATED', 'ACTIVE', 'REORIENTED')
     OR latest_blueprint_state NOT IN ('READY', 'ACTIVE')
     OR latest_blueprint_source_id IS DISTINCT FROM latest_tr_id THEN
    RAISE EXCEPTION 'Execution blocked: mission % requires a validated TR and a READY Blueprint derived from its latest version', mission_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION sandbox.get_mission_parameters(p_mission_key text)
 RETURNS TABLE(parameter_key text, label text, description text, value_type text, validation jsonb, is_required boolean, sort_order integer, options jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'sofia', 'public', 'pg_temp'
AS $function$
SELECT p."parameterKey",p.label,p.description,p."valueType",p.validation,p."isRequired",p."sortOrder",coalesce(jsonb_agg(jsonb_build_object('value',o.value,'label',o.label,'description',o.description,'sort_order',o."sortOrder") ORDER BY o."sortOrder",o.id) FILTER (WHERE o.id IS NOT NULL),'[]'::jsonb) FROM sandbox."missionParameters" p LEFT JOIN sandbox."missionParameterOptions" o ON o."parameterId"=p.id AND o."isActive"=true WHERE p."missionKey"=p_mission_key AND p."isActive"=true GROUP BY p.id,p."parameterKey",p.label,p.description,p."valueType",p.validation,p."isRequired",p."sortOrder" ORDER BY p."sortOrder",p.id;
$function$;

CREATE OR REPLACE FUNCTION sandbox.validate_mission_parameters(p_mission_key text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'sofia', 'public', 'pg_temp'
AS $function$
DECLARE v_param record; v_value jsonb; v_errors jsonb:='[]'::jsonb; v_found boolean:=false;
BEGIN
IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' THEN RETURN jsonb_build_object('valid',false,'errors',jsonb_build_array(jsonb_build_object('code','INVALID_PAYLOAD','message','Payload must be a JSON object'))); END IF;
FOR v_param IN SELECT "parameterKey" AS key,"valueType" AS value_type,"isRequired" AS is_required FROM sandbox."missionParameters" WHERE "missionKey"=p_mission_key AND "isActive"=true ORDER BY "sortOrder" LOOP
 v_value:=p_payload->v_param.key;
 IF v_value IS NULL OR v_value='null'::jsonb THEN IF v_param.is_required THEN v_errors:=v_errors||jsonb_build_array(jsonb_build_object('code','REQUIRED','parameter',v_param.key,'message','Required parameter is missing')); END IF; CONTINUE; END IF;
 IF v_param.value_type='enum' AND NOT EXISTS (SELECT 1 FROM sandbox."missionParameters" p JOIN sandbox."missionParameterOptions" o ON o."parameterId"=p.id WHERE p."missionKey"=p_mission_key AND p."parameterKey"=v_param.key AND o.value=v_value#>>'{}' AND o."isActive"=true) THEN v_errors:=v_errors||jsonb_build_array(jsonb_build_object('code','INVALID_ENUM','parameter',v_param.key,'message','Value is not present in the active catalog')); ELSIF v_param.value_type='boolean' AND jsonb_typeof(v_value)<>'boolean' THEN v_errors:=v_errors||jsonb_build_array(jsonb_build_object('code','INVALID_TYPE','parameter',v_param.key,'message','Boolean value expected')); ELSIF v_param.value_type IN ('decimal','integer') AND jsonb_typeof(v_value)<>'number' THEN v_errors:=v_errors||jsonb_build_array(jsonb_build_object('code','INVALID_TYPE','parameter',v_param.key,'message','Numeric value expected')); END IF;
END LOOP;
SELECT true INTO v_found FROM sandbox."missionParameters" WHERE "missionKey"=p_mission_key AND "isActive"=true LIMIT 1;
IF NOT v_found THEN v_errors:=v_errors||jsonb_build_array(jsonb_build_object('code','UNKNOWN_MISSION','message','Mission parameter catalog not found')); END IF;
RETURN jsonb_build_object('valid',jsonb_array_length(v_errors)=0,'errors',v_errors,'mission_key',p_mission_key);
END;
$function$;

CREATE OR REPLACE FUNCTION sandbox.validate_mission_action_unit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  mission_owner_id integer;
  task_owner_id integer;
  task_parent_id integer;
  plan_state text;
  plan_document_id integer;
  plan_version_number integer;
  plan_content_hash text;
  plan_content text;
  plan_type text;
  latest_plan_version_id integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW."state" NOT IN ('REGISTERED', 'AWAITING_APPROVAL')
       OR NEW."approvalUserId" IS NOT NULL
       OR NEW."approvedAt" IS NOT NULL THEN
      RAISE EXCEPTION 'Action-plan units must be registered before individual approval';
    END IF;
  ELSE
    IF OLD."missionTaskId" IS DISTINCT FROM NEW."missionTaskId"
       OR OLD."actionPlanDocumentId" IS DISTINCT FROM NEW."actionPlanDocumentId"
       OR OLD."actionPlanVersionId" IS DISTINCT FROM NEW."actionPlanVersionId"
       OR OLD."actionPlanVersionNumber" IS DISTINCT FROM NEW."actionPlanVersionNumber"
       OR OLD."actionPlanContentHash" IS DISTINCT FROM NEW."actionPlanContentHash"
       OR OLD."unitId" IS DISTINCT FROM NEW."unitId"
       OR OLD."unitTitle" IS DISTINCT FROM NEW."unitTitle"
       OR OLD."idempotencyKey" IS DISTINCT FROM NEW."idempotencyKey"
       OR (OLD."operationalTaskId" IS NOT NULL
         AND OLD."operationalTaskId" IS DISTINCT FROM NEW."operationalTaskId") THEN
      RAISE EXCEPTION 'Action-plan unit identity is immutable';
    END IF;

    IF OLD."approvalUserId" IS NOT NULL
       AND (OLD."approvalUserId" IS DISTINCT FROM NEW."approvalUserId"
         OR OLD."approvedAt" IS DISTINCT FROM NEW."approvedAt") THEN
      RAISE EXCEPTION 'Action-plan unit approval is immutable';
    END IF;

    IF OLD.state IS DISTINCT FROM NEW.state THEN
      IF NOT (
        (OLD.state = 'REGISTERED' AND NEW.state IN ('AWAITING_APPROVAL', 'BLOCKED', 'CANCELLED'))
        OR (OLD.state = 'AWAITING_APPROVAL' AND NEW.state IN ('APPROVED', 'BLOCKED', 'CANCELLED'))
        OR (OLD.state = 'APPROVED' AND NEW.state IN ('READY_FOR_DISPATCH', 'BLOCKED', 'CANCELLED'))
        OR (OLD.state = 'READY_FOR_DISPATCH' AND NEW.state IN ('DISPATCHED', 'BLOCKED', 'CANCELLED'))
        OR (OLD.state = 'BLOCKED' AND NEW.state = 'CANCELLED')
      ) THEN
        RAISE EXCEPTION 'Invalid action-plan unit state transition: % -> %', OLD.state, NEW.state;
      END IF;
    END IF;
  END IF;

  SELECT "createdBy" INTO mission_owner_id
    FROM sandbox.tasks
   WHERE id = NEW."missionTaskId"
     AND "parentTaskId" IS NULL;
  IF mission_owner_id IS NULL THEN
    RAISE EXCEPTION 'Action-plan unit mission must reference an owned root mission';
  END IF;

  SELECT type_row."typeKey",
         document_row."taskId",
         version_row."documentId",
         version_row."version",
         version_row."state",
         version_row."contentHash",
         version_row."content"
    INTO plan_type,
         task_parent_id,
         plan_document_id,
         plan_version_number,
         plan_state,
         plan_content_hash,
         plan_content
    FROM sandbox."missionDocumentVersions" version_row
    JOIN sandbox."missionDocuments" document_row ON document_row.id = version_row."documentId"
    JOIN sandbox."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
   WHERE version_row.id = NEW."actionPlanVersionId";

  IF plan_type IS DISTINCT FROM 'ACTION_PLAN'
     OR task_parent_id IS DISTINCT FROM NEW."missionTaskId"
     OR plan_document_id IS DISTINCT FROM NEW."actionPlanDocumentId"
     OR plan_version_number IS DISTINCT FROM NEW."actionPlanVersionNumber"
     OR plan_content_hash IS DISTINCT FROM NEW."actionPlanContentHash"
     OR plan_state IS DISTINCT FROM 'APPROVED' THEN
    RAISE EXCEPTION 'Action-plan unit must reference the exact approved ACTION_PLAN version';
  END IF;

  SELECT MAX(id) INTO latest_plan_version_id
    FROM sandbox."missionDocumentVersions"
   WHERE "documentId" = NEW."actionPlanDocumentId";
  IF latest_plan_version_id IS DISTINCT FROM NEW."actionPlanVersionId" THEN
    RAISE EXCEPTION 'Action-plan unit cannot reference a stale plan version';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM jsonb_array_elements(plan_content::jsonb -> 'tasks') AS plan_task
     WHERE plan_task ->> 'id' = NEW."unitId"
       AND plan_task ->> 'title' = NEW."unitTitle"
  ) THEN
    RAISE EXCEPTION 'Action-plan unit identity does not match the approved plan content';
  END IF;

  IF NEW."approvalUserId" IS NOT NULL AND NEW."approvalUserId" <> mission_owner_id THEN
    RAISE EXCEPTION 'Action-plan unit approval must be recorded by the mission owner';
  END IF;

  IF NEW."state" IN ('APPROVED', 'READY_FOR_DISPATCH', 'DISPATCHED')
     AND (NEW."approvalUserId" IS NULL OR NEW."approvedAt" IS NULL) THEN
    RAISE EXCEPTION 'Action-plan unit state requires explicit human approval';
  END IF;

  -- Any established operational-task link is validated immediately, even
  -- while the unit remains APPROVED and the child is safely PAUSED.
  IF NEW."operationalTaskId" IS NOT NULL THEN
    SELECT "createdBy", "parentTaskId"
      INTO task_owner_id, task_parent_id
      FROM sandbox.tasks
     WHERE id = NEW."operationalTaskId";
    IF task_owner_id IS DISTINCT FROM mission_owner_id
       OR task_parent_id IS DISTINCT FROM NEW."missionTaskId" THEN
      RAISE EXCEPTION 'Operational task must be a direct child of the same mission owner';
    END IF;
  END IF;

  IF NEW."state" IN ('READY_FOR_DISPATCH', 'DISPATCHED')
     AND NEW."operationalTaskId" IS NULL THEN
    RAISE EXCEPTION 'Dispatchable action-plan unit requires an operational task';
  END IF;

  NEW."updatedAt" := now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER tasks_require_validated_tr
BEFORE INSERT OR UPDATE OF "statusId", "agentId" ON sandbox.tasks
FOR EACH ROW EXECUTE FUNCTION sandbox.enforce_execution_documents_before_staged();

CREATE TRIGGER mission_action_units_validate
BEFORE INSERT OR UPDATE ON sandbox."missionActionUnits"
FOR EACH ROW EXECUTE FUNCTION sandbox.validate_mission_action_unit();

CREATE TRIGGER mission_action_unit_gate_evidence_validate
BEFORE INSERT OR DELETE OR UPDATE ON sandbox."missionActionUnitGateEvidence"
FOR EACH ROW EXECUTE FUNCTION sandbox.validate_mission_action_unit_gate_evidence();

CREATE TRIGGER mission_document_versions_immutable
BEFORE DELETE OR UPDATE ON sandbox."missionDocumentVersions"
FOR EACH ROW EXECUTE FUNCTION sandbox.reject_mission_document_version_mutation();

-- Service-role-only RPCs used by the purge Edge Function.
CREATE OR REPLACE FUNCTION public.verify_sandbox_session_purge_token(p_token text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'vault'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
     WHERE name = 'sandbox_session_purge_token'
       AND decrypted_secret = p_token
  );
$function$;

CREATE OR REPLACE FUNCTION public.claim_sandbox_session_purge(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  v_claimed boolean := false;
BEGIN
  UPDATE sandbox.sessions
     SET status = 'PURGING',
         "purgeStartedAt" = now(),
         "lastPurgeError" = NULL,
         "updatedAt" = now()
   WHERE id = p_session_id
     AND (
       status IN ('CLOSING','EXPIRED')
       OR (status = 'PURGING' AND "purgeStartedAt" < now() - interval '5 minutes')
     )
  RETURNING true INTO v_claimed;

  RETURN coalesce(v_claimed,false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.purge_sandbox_session_data(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_count bigint;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sandbox.sessions WHERE id = p_session_id AND status = 'PURGING') THEN
    RAISE EXCEPTION 'Session is not claimed for purge';
  END IF;

  PERFORM set_config('sandbox.purge','on',true);

  DELETE FROM sandbox."missionActionUnitGateEvidence" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('missionActionUnitGateEvidence',v_count);

  DELETE FROM sandbox."missionActionUnits" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('missionActionUnits',v_count);

  DELETE FROM sandbox."missionDocumentVersions" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('missionDocumentVersions',v_count);

  DELETE FROM sandbox."missionDocuments" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('missionDocuments',v_count);

  DELETE FROM sandbox.messages WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('messages',v_count);

  DELETE FROM sandbox."activityLogs" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('activityLogs',v_count);

  DELETE FROM sandbox."arcEvidence" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('arcEvidence',v_count);

  DELETE FROM sandbox."arcConfidenceSnapshots" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('arcConfidenceSnapshots',v_count);

  DELETE FROM sandbox."arcAccessEvents" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('arcAccessEvents',v_count);

  DELETE FROM sandbox."arcDeviceProfiles" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('arcDeviceProfiles',v_count);

  DELETE FROM sandbox."arcAssessments" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('arcAssessments',v_count);

  DELETE FROM sandbox."contextReports" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('contextReports',v_count);

  DELETE FROM sandbox."scheduledTasks" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('scheduledTasks',v_count);

  DELETE FROM sandbox.tasks WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('tasks',v_count);

  DELETE FROM sandbox.agents
   WHERE "sandboxSessionId" = p_session_id
     AND "agentOrigin" = 'SANDBOX_SESSION';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('agents',v_count);

  DELETE FROM sandbox."missionParameterOptions" o
   USING sandbox."missionParameters" p
   WHERE o."parameterId" = p.id AND p."sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('missionParameterOptions',v_count);

  DELETE FROM sandbox."missionParameters" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('missionParameters',v_count);

  DELETE FROM sandbox."governanceMissions" WHERE "sandboxSessionId" = p_session_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('governanceMissions',v_count);

  UPDATE sandbox.users
     SET "activeSandboxSessionId" = NULL
   WHERE "activeSandboxSessionId" = p_session_id;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_sandbox_session_purge(
  p_session_id uuid,
  p_result jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  UPDATE sandbox.sessions
     SET status = 'PURGED',
         "purgedAt" = now(),
         "purgeResult" = coalesce(p_result,'{}'::jsonb),
         "lastPurgeError" = NULL,
         "purgeStartedAt" = NULL,
         "updatedAt" = now()
   WHERE id = p_session_id AND status = 'PURGING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session purge completion state mismatch';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fail_sandbox_session_purge(
  p_session_id uuid,
  p_error text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  UPDATE sandbox.sessions
     SET status = CASE WHEN "purgeReason" = 'TTL' THEN 'EXPIRED' ELSE 'CLOSING' END,
         "lastPurgeError" = left(coalesce(p_error,'unknown purge error'),1000),
         "purgeStartedAt" = NULL,
         "lastDispatchedAt" = NULL,
         "updatedAt" = now()
   WHERE id = p_session_id AND status = 'PURGING';
END;
$function$;

REVOKE ALL ON FUNCTION public.verify_sandbox_session_purge_token(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_sandbox_session_purge(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_sandbox_session_data(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_sandbox_session_purge(uuid,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_sandbox_session_purge(uuid,text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verify_sandbox_session_purge_token(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_sandbox_session_purge(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_sandbox_session_data(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_sandbox_session_purge(uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_sandbox_session_purge(uuid,text) TO service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES ('sandbox-session-artifacts', 'sandbox-session-artifacts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DO $$
DECLARE
  existing_job bigint;
BEGIN
  SELECT jobid INTO existing_job FROM cron.job WHERE jobname = 'sandbox-session-maintenance';
  IF existing_job IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job);
  END IF;
  PERFORM cron.schedule(
    'sandbox-session-maintenance',
    '* * * * *',
    'SELECT sandbox.run_session_maintenance();'
  );
END;
$$;
