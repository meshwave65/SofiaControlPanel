-- Automatically dispatch eligible STAGED tasks to the Sofia backend.
-- For missions with an ACTION_PLAN, only an explicitly approved and persisted
-- operational unit may reach this callback. Legacy missions without ACTION_PLAN
-- retain the original automatic-dispatch behavior.
-- The URL and shared secret are stored encrypted in Supabase Vault:
--   sofia_dispatch_url
--   sofia_dispatch_secret

CREATE OR REPLACE FUNCTION sofia.notify_task_dispatch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia, vault, net
AS $function$
DECLARE
  staged_status_id integer;
  dispatch_url text;
  dispatch_secret text;
  mission_id integer;
  latest_action_plan_version_id integer;
  latest_action_plan_state text;
  latest_action_plan_hash text;
  action_plan_document_exists boolean := false;
  authorized_unit_row_id integer;
  authorized_unit_id text;
  authorized_unit_key text;
  authorized_unit_title text;
BEGIN
  SELECT id
    INTO staged_status_id
    FROM sofia."taskStatuses"
   WHERE name = 'STAGED'
   LIMIT 1;

  IF staged_status_id IS NULL
     OR NEW."statusId" IS DISTINCT FROM staged_status_id
     THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD."statusId" IS NOT DISTINCT FROM NEW."statusId"
       AND OLD."agentId" IS NOT DISTINCT FROM NEW."agentId" THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Older installations may not yet have the mission-document schema.
  -- In that case no ACTION_PLAN can exist and the legacy path remains valid.
  IF to_regclass('sofia."missionDocuments"') IS NOT NULL
     AND to_regclass('sofia."missionDocumentVersions"') IS NOT NULL
     AND to_regclass('sofia."missionDocumentTypes"') IS NOT NULL THEN
    WITH RECURSIVE ancestors AS (
      SELECT id, "parentTaskId", ARRAY[id] AS path
        FROM sofia.tasks
       WHERE id = NEW.id
      UNION ALL
      SELECT parent.id, parent."parentTaskId", child.path || parent.id
        FROM sofia.tasks parent
        JOIN ancestors child ON parent.id = child."parentTaskId"
       WHERE NOT parent.id = ANY(child.path)
    )
    SELECT id INTO mission_id
      FROM ancestors
     WHERE "parentTaskId" IS NULL
     LIMIT 1;

    IF mission_id IS NULL THEN
      RAISE EXCEPTION 'Sofia dispatch blocked: root mission could not be resolved for task %', NEW.id;
    END IF;

    SELECT version_row.id, version_row.state, version_row."contentHash"
      INTO latest_action_plan_version_id, latest_action_plan_state, latest_action_plan_hash
      FROM sofia."missionDocuments" document_row
      JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
      JOIN sofia."missionDocumentVersions" version_row ON version_row."documentId" = document_row.id
     WHERE document_row."taskId" = mission_id
       AND document_row."documentKey" = 'ACTION_PLAN'
       AND type_row."typeKey" = 'ACTION_PLAN'
     ORDER BY version_row.version DESC
     LIMIT 1;

    SELECT EXISTS (
      SELECT 1
        FROM sofia."missionDocuments" document_row
        JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
       WHERE document_row."taskId" = mission_id
         AND document_row."documentKey" = 'ACTION_PLAN'
         AND type_row."typeKey" = 'ACTION_PLAN'
    ) INTO action_plan_document_exists;

    IF action_plan_document_exists AND latest_action_plan_version_id IS NULL THEN
      RAISE EXCEPTION 'Sofia dispatch blocked: ACTION_PLAN document exists without a persisted version';
    END IF;

    IF latest_action_plan_version_id IS NOT NULL THEN
      IF NEW."parentTaskId" IS DISTINCT FROM mission_id THEN
        RAISE EXCEPTION 'Sofia dispatch blocked: ACTION_PLAN operational task must be a direct child of its mission root';
      END IF;
      IF latest_action_plan_state IS DISTINCT FROM 'APPROVED'
         OR latest_action_plan_hash IS NULL THEN
        RAISE EXCEPTION 'Sofia dispatch blocked: current ACTION_PLAN is not approved or has no integrity hash';
      END IF;

      IF to_regclass('sofia."missionActionUnits"') IS NULL THEN
        RAISE EXCEPTION 'Sofia dispatch blocked: action-unit governance migration is not installed';
      END IF;

      SELECT id, "idempotencyKey", "unitId", "unitTitle"
        INTO authorized_unit_row_id, authorized_unit_key, authorized_unit_id, authorized_unit_title
        FROM sofia."missionActionUnits"
       WHERE "missionTaskId" = mission_id
         AND "operationalTaskId" = NEW.id
         AND "actionPlanVersionId" = latest_action_plan_version_id
         AND "actionPlanContentHash" = latest_action_plan_hash
         AND state = 'READY_FOR_DISPATCH'
         AND "approvalUserId" IS NOT NULL
         AND "approvedAt" IS NOT NULL
       LIMIT 1;

      IF authorized_unit_row_id IS NULL OR authorized_unit_key IS NULL OR authorized_unit_id IS NULL THEN
        RAISE EXCEPTION 'Sofia dispatch blocked: task % has no approved, dispatch-ready ACTION_PLAN unit mapping', NEW.id;
      END IF;

      IF NOT EXISTS (
        SELECT 1
          FROM sofia."missionDocumentVersions" plan_version
          CROSS JOIN LATERAL jsonb_array_elements(plan_version.content::jsonb -> 'tasks') AS plan_task
         WHERE plan_version.id = latest_action_plan_version_id
           AND plan_task ->> 'id' = authorized_unit_id
           AND plan_task ->> 'title' = authorized_unit_title
      ) THEN
        RAISE EXCEPTION 'Sofia dispatch blocked: persisted unit does not match the exact approved ACTION_PLAN content';
      END IF;
    END IF;
  END IF;

  SELECT decrypted_secret
    INTO dispatch_url
    FROM vault.decrypted_secrets
   WHERE name = 'sofia_dispatch_url'
   LIMIT 1;

  SELECT decrypted_secret
    INTO dispatch_secret
    FROM vault.decrypted_secrets
   WHERE name = 'sofia_dispatch_secret'
   LIMIT 1;

  IF dispatch_url IS NULL OR dispatch_secret IS NULL THEN
    RAISE WARNING 'Sofia automatic dispatch skipped: required Vault secrets are missing';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := dispatch_url,
    body := jsonb_build_object(
      'taskId', NEW.id,
      'agentId', NEW."agentId",
      'actionPlanUnitId', authorized_unit_id,
      'idempotencyKey', authorized_unit_key
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sofia-dispatch-secret', dispatch_secret
    ),
    timeout_milliseconds := 60000
  );

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION sofia.notify_task_dispatch() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tasks_dispatch_staged ON sofia.tasks;

CREATE TRIGGER tasks_dispatch_staged
AFTER INSERT OR UPDATE OF "statusId", "agentId"
ON sofia.tasks
FOR EACH ROW
EXECUTE FUNCTION sofia.notify_task_dispatch();
