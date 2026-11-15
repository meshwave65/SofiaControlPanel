-- Exercises the ACTION_PLAN dispatch boundary on disposable PostgreSQL only.
-- Requires migrations 0010, 0011, 0012 and the 0003 dispatch trigger.

CREATE OR REPLACE FUNCTION net.http_post(
  url text,
  body jsonb,
  headers jsonb,
  timeout_milliseconds integer
) RETURNS bigint
LANGUAGE sql
AS $$ SELECT 1::bigint $$;

DO $test$
DECLARE
  owner_id integer;
  root_id integer;
  child_id integer;
  unauthorized_child_id integer;
  tr_document_id integer;
  blueprint_document_id integer;
  action_plan_document_id integer;
  tr_version_id integer;
  blueprint_version_id integer;
  action_plan_version_id integer;
  action_plan_content text := '{"schemaVersion":1,"objective":"fixture","expectedOutcome":"fixture","tasks":[{"id":"T01","title":"Unidade autorizada"}],"globalRisks":[],"reversibility":"fixture","approvalRequired":true,"approvalReason":"fixture"}';
  action_plan_hash text := repeat('a', 64);
BEGIN
  INSERT INTO sofia.users DEFAULT VALUES RETURNING id INTO owner_id;

  INSERT INTO sofia.tasks ("statusId", "createdBy", title)
  VALUES ((SELECT id FROM sofia."taskStatuses" WHERE name = 'PAUSED'), owner_id, 'Mission fixture')
  RETURNING id INTO root_id;

  INSERT INTO sofia."missionDocuments" ("taskId", "documentTypeId", "documentKey", title)
  VALUES (root_id, (SELECT id FROM sofia."missionDocumentTypes" WHERE "typeKey" = 'TR'), 'TR', 'TR')
  RETURNING id INTO tr_document_id;
  INSERT INTO sofia."missionDocumentVersions" ("documentId", version, state, content, "authorType")
  VALUES (tr_document_id, 1, 'VALIDATED', 'TR fixture', 'HUMAN')
  RETURNING id INTO tr_version_id;

  INSERT INTO sofia."missionDocuments" ("taskId", "documentTypeId", "documentKey", title)
  VALUES (root_id, (SELECT id FROM sofia."missionDocumentTypes" WHERE "typeKey" = 'BLUEPRINT'), 'BLUEPRINT', 'Blueprint')
  RETURNING id INTO blueprint_document_id;
  INSERT INTO sofia."missionDocumentVersions" ("documentId", version, state, content, "authorType", "sourceDocumentVersionId")
  VALUES (blueprint_document_id, 1, 'READY', 'Blueprint fixture', 'SOFIA', tr_version_id)
  RETURNING id INTO blueprint_version_id;

  INSERT INTO sofia."missionDocuments" ("taskId", "documentTypeId", "documentKey", title)
  VALUES (root_id, (SELECT id FROM sofia."missionDocumentTypes" WHERE "typeKey" = 'ACTION_PLAN'), 'ACTION_PLAN', 'Action plan')
  RETURNING id INTO action_plan_document_id;
  INSERT INTO sofia."missionDocumentVersions" (
    "documentId", version, state, content, "authorType", "sourceDocumentVersionId", "contentHash"
  )
  VALUES (
    action_plan_document_id, 1, 'APPROVED', action_plan_content, 'HUMAN', blueprint_version_id, action_plan_hash
  )
  RETURNING id INTO action_plan_version_id;

  -- Root missions cannot bypass an approved plan and dispatch as one opaque task.
  BEGIN
    UPDATE sofia.tasks
       SET "statusId" = (SELECT id FROM sofia."taskStatuses" WHERE name = 'STAGED')
     WHERE id = root_id;
    RAISE EXCEPTION 'TEST FAILURE: approved ACTION_PLAN root was dispatched without a unit';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE 'TEST FAILURE:%' THEN RAISE; END IF;
  END;

  -- Existing root execution can remain PROGRESS; child units are individually gated.
  UPDATE sofia.tasks
     SET "statusId" = (SELECT id FROM sofia."taskStatuses" WHERE name = 'PROGRESS'),
         "manusTaskId" = 'fixture-root-external-id'
   WHERE id = root_id;

  INSERT INTO sofia.tasks ("statusId", "createdBy", "parentTaskId", title)
  VALUES ((SELECT id FROM sofia."taskStatuses" WHERE name = 'PAUSED'), owner_id, root_id, 'Unidade T01')
  RETURNING id INTO child_id;

  INSERT INTO sofia."missionActionUnits" (
    "missionTaskId", "actionPlanDocumentId", "actionPlanVersionId", "actionPlanVersionNumber",
    "actionPlanContentHash", "unitId", "unitTitle", "idempotencyKey", "operationalTaskId",
    state, "approvalUserId", "approvedAt"
  )
  VALUES (
    root_id, action_plan_document_id, action_plan_version_id, 1,
    action_plan_hash, 'T01', 'Unidade autorizada', 'fixture-idempotency-key-0001', child_id,
    'READY_FOR_DISPATCH', owner_id, now()
  );

  -- The exact approved unit mapping permits the trigger to reach the callback.
  -- Vault has no secrets in this fixture, so no network request is made.
  UPDATE sofia.tasks
     SET "statusId" = (SELECT id FROM sofia."taskStatuses" WHERE name = 'STAGED')
   WHERE id = child_id;

  INSERT INTO sofia.tasks ("statusId", "createdBy", "parentTaskId", title)
  VALUES ((SELECT id FROM sofia."taskStatuses" WHERE name = 'PAUSED'), owner_id, root_id, 'Unmapped child')
  RETURNING id INTO unauthorized_child_id;

  BEGIN
    UPDATE sofia.tasks
       SET "statusId" = (SELECT id FROM sofia."taskStatuses" WHERE name = 'STAGED')
     WHERE id = unauthorized_child_id;
    RAISE EXCEPTION 'TEST FAILURE: unmapped child was dispatched';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE 'TEST FAILURE:%' THEN RAISE; END IF;
  END;
END;
$test$;
