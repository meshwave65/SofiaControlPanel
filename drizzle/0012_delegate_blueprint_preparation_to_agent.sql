-- Sandbox only: a validated TR authorizes delegation.
-- The assigned agent prepares the BP after the mission is claimed.
CREATE OR REPLACE FUNCTION sandbox.enforce_execution_documents_before_staged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sandbox
AS $function$
DECLARE
  staged_status_id integer;
  progress_status_id integer;
  paused_status_id integer;
  mission_id integer;
  mission_status_id integer;
  latest_tr_state text;
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
  IF mission_id IS NULL THEN
    RAISE EXCEPTION 'Execution blocked: top-level mission could not be resolved for task %', NEW.id;
  END IF;

  IF NEW.id = mission_id THEN
    mission_status_id := NEW."statusId";
  ELSE
    SELECT "statusId" INTO mission_status_id FROM sandbox.tasks WHERE id = mission_id;
  END IF;
  IF mission_status_id IS DISTINCT FROM staged_status_id
     AND mission_status_id IS DISTINCT FROM progress_status_id THEN
    RAISE EXCEPTION 'Execution blocked: root mission % must be STAGED or PROGRESS before child tasks can be dispatched', mission_id;
  END IF;

  SELECT version_row.state
    INTO latest_tr_state
    FROM sandbox."missionDocuments" document_row
    JOIN sandbox."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
    JOIN sandbox."missionDocumentVersions" version_row ON version_row."documentId" = document_row.id
   WHERE document_row."taskId" = mission_id
     AND document_row."documentKey" = 'TR'
     AND type_row."typeKey" = 'TR'
   ORDER BY version_row.version DESC
   LIMIT 1;

  IF latest_tr_state IS NULL OR latest_tr_state NOT IN ('VALIDATED', 'ACTIVE', 'REORIENTED') THEN
    RAISE EXCEPTION 'Execution blocked: mission % requires a validated current TR before delegation', mission_id;
  END IF;

  RETURN NEW;
END;
$function$;
