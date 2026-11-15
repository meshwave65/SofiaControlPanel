-- AC-019 / Increment H: persistent identity and dispatch authorization for ACTION_PLAN units.
-- This migration is intentionally NOT wired into ensure-database.mjs.
-- Apply only through the separately approved database migration procedure.

CREATE TABLE IF NOT EXISTS "sofia"."missionActionUnits" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "missionTaskId" integer NOT NULL REFERENCES "sofia"."tasks"("id") ON DELETE RESTRICT,
  "actionPlanDocumentId" integer NOT NULL REFERENCES "sofia"."missionDocuments"("id") ON DELETE RESTRICT,
  "actionPlanVersionId" integer NOT NULL REFERENCES "sofia"."missionDocumentVersions"("id") ON DELETE RESTRICT,
  "actionPlanVersionNumber" integer NOT NULL,
  "actionPlanContentHash" varchar(64) NOT NULL,
  "unitId" varchar(8) NOT NULL,
  "unitTitle" varchar(255) NOT NULL,
  "idempotencyKey" varchar(128) NOT NULL UNIQUE,
  "operationalTaskId" integer UNIQUE REFERENCES "sofia"."tasks"("id") ON DELETE RESTRICT,
  "state" varchar(32) NOT NULL DEFAULT 'REGISTERED',
  "approvalUserId" integer REFERENCES "sofia"."users"("id") ON DELETE RESTRICT,
  "approvedAt" timestamp,
  "dispatchRequestedAt" timestamp,
  "dispatchAttempts" integer NOT NULL DEFAULT 0,
  "governanceEvidence" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "missionActionUnits_mission_version_unit_unique"
    UNIQUE ("missionTaskId", "actionPlanVersionId", "unitId"),
  CONSTRAINT "missionActionUnits_unit_id_format"
    CHECK ("unitId" ~ '^T[0-9]{2}
  CONSTRAINT "missionActionUnits_state_check"
    CHECK ("state" IN ('REGISTERED', 'AWAITING_APPROVAL', 'APPROVED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'BLOCKED', 'CANCELLED')),
  CONSTRAINT "missionActionUnits_approval_pair_check"
    CHECK (("approvalUserId" IS NULL) = ("approvedAt" IS NULL)),
  CONSTRAINT "missionActionUnits_dispatch_attempts_check"
    CHECK ("dispatchAttempts" >= 0)
);

CREATE INDEX IF NOT EXISTS "missionActionUnits_mission_state_idx"
  ON "sofia"."missionActionUnits" ("missionTaskId", "state");
CREATE INDEX IF NOT EXISTS "missionActionUnits_plan_version_idx"
  ON "sofia"."missionActionUnits" ("actionPlanVersionId");
CREATE INDEX IF NOT EXISTS "missionActionUnits_operational_task_idx"
  ON "sofia"."missionActionUnits" ("operationalTaskId");

-- The plan identity, unit identity and idempotency key are immutable. A unit
-- can become dispatchable only after an explicit human approval and complete
-- linkage to a child task of the same mission.
CREATE OR REPLACE FUNCTION sofia.validate_mission_action_unit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia
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
  IF TG_OP = 'UPDATE' THEN
    IF OLD."missionTaskId" IS DISTINCT FROM NEW."missionTaskId"
       OR OLD."actionPlanDocumentId" IS DISTINCT FROM NEW."actionPlanDocumentId"
       OR OLD."actionPlanVersionId" IS DISTINCT FROM NEW."actionPlanVersionId"
       OR OLD."actionPlanVersionNumber" IS DISTINCT FROM NEW."actionPlanVersionNumber"
       OR OLD."actionPlanContentHash" IS DISTINCT FROM NEW."actionPlanContentHash"
       OR OLD."unitId" IS DISTINCT FROM NEW."unitId"
       OR OLD."unitTitle" IS DISTINCT FROM NEW."unitTitle"
       OR OLD."idempotencyKey" IS DISTINCT FROM NEW."idempotencyKey" THEN
      RAISE EXCEPTION 'Action-plan unit identity is immutable';
    END IF;
    IF OLD."approvalUserId" IS NOT NULL
       AND (OLD."approvalUserId" IS DISTINCT FROM NEW."approvalUserId"
         OR OLD."approvedAt" IS DISTINCT FROM NEW."approvedAt") THEN
      RAISE EXCEPTION 'Action-plan unit approval is immutable';
    END IF;
  END IF;

  SELECT "createdBy" INTO mission_owner_id
    FROM sofia.tasks WHERE id = NEW."missionTaskId" AND "parentTaskId" IS NULL;
  IF mission_owner_id IS NULL THEN
    RAISE EXCEPTION 'Action-plan unit mission must reference an owned root mission';
  END IF;

  SELECT type_row."typeKey", document_row."taskId", version_row."documentId",
         version_row."version", version_row."state", version_row."contentHash", version_row."content"
    INTO plan_type, task_parent_id, plan_document_id, plan_version_number,
         plan_state, plan_content_hash, plan_content
    FROM sofia."missionDocumentVersions" version_row
    JOIN sofia."missionDocuments" document_row ON document_row.id = version_row."documentId"
    JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
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
    FROM sofia."missionDocumentVersions"
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

  IF NEW."state" IN ('READY_FOR_DISPATCH', 'DISPATCHED') THEN
    IF NEW."operationalTaskId" IS NULL THEN
      RAISE EXCEPTION 'Dispatchable action-plan unit requires an operational task';
    END IF;
    SELECT "createdBy", "parentTaskId"
      INTO task_owner_id, task_parent_id
      FROM sofia.tasks WHERE id = NEW."operationalTaskId";
    IF task_owner_id IS DISTINCT FROM mission_owner_id
       OR task_parent_id IS DISTINCT FROM NEW."missionTaskId" THEN
      RAISE EXCEPTION 'Operational task must be a direct child of the same mission owner';
    END IF;
  END IF;

  NEW."updatedAt" := now();
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION sofia.validate_mission_action_unit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS mission_action_units_validate ON "sofia"."missionActionUnits";
CREATE TRIGGER mission_action_units_validate
  BEFORE INSERT OR UPDATE ON "sofia"."missionActionUnits"
  FOR EACH ROW EXECUTE FUNCTION sofia.validate_mission_action_unit();

ALTER TABLE "sofia"."missionActionUnits" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "sofia"."missionActionUnits" FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "missionActionUnits_server_only" ON "sofia"."missionActionUnits";
CREATE POLICY "missionActionUnits_server_only"
  ON "sofia"."missionActionUnits"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
),
  CONSTRAINT "missionActionUnits_hash_format"
    CHECK ("actionPlanContentHash" ~ '^[a-f0-9]{64}
  CONSTRAINT "missionActionUnits_state_check"
    CHECK ("state" IN ('REGISTERED', 'AWAITING_APPROVAL', 'APPROVED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'BLOCKED', 'CANCELLED')),
  CONSTRAINT "missionActionUnits_approval_pair_check"
    CHECK (("approvalUserId" IS NULL) = ("approvedAt" IS NULL)),
  CONSTRAINT "missionActionUnits_dispatch_attempts_check"
    CHECK ("dispatchAttempts" >= 0)
);

CREATE INDEX IF NOT EXISTS "missionActionUnits_mission_state_idx"
  ON "sofia"."missionActionUnits" ("missionTaskId", "state");
CREATE INDEX IF NOT EXISTS "missionActionUnits_plan_version_idx"
  ON "sofia"."missionActionUnits" ("actionPlanVersionId");
CREATE INDEX IF NOT EXISTS "missionActionUnits_operational_task_idx"
  ON "sofia"."missionActionUnits" ("operationalTaskId");

-- The plan identity, unit identity and idempotency key are immutable. A unit
-- can become dispatchable only after an explicit human approval and complete
-- linkage to a child task of the same mission.
CREATE OR REPLACE FUNCTION sofia.validate_mission_action_unit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia
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
  IF TG_OP = 'UPDATE' THEN
    IF OLD."missionTaskId" IS DISTINCT FROM NEW."missionTaskId"
       OR OLD."actionPlanDocumentId" IS DISTINCT FROM NEW."actionPlanDocumentId"
       OR OLD."actionPlanVersionId" IS DISTINCT FROM NEW."actionPlanVersionId"
       OR OLD."actionPlanVersionNumber" IS DISTINCT FROM NEW."actionPlanVersionNumber"
       OR OLD."actionPlanContentHash" IS DISTINCT FROM NEW."actionPlanContentHash"
       OR OLD."unitId" IS DISTINCT FROM NEW."unitId"
       OR OLD."unitTitle" IS DISTINCT FROM NEW."unitTitle"
       OR OLD."idempotencyKey" IS DISTINCT FROM NEW."idempotencyKey" THEN
      RAISE EXCEPTION 'Action-plan unit identity is immutable';
    END IF;
    IF OLD."approvalUserId" IS NOT NULL
       AND (OLD."approvalUserId" IS DISTINCT FROM NEW."approvalUserId"
         OR OLD."approvedAt" IS DISTINCT FROM NEW."approvedAt") THEN
      RAISE EXCEPTION 'Action-plan unit approval is immutable';
    END IF;
  END IF;

  SELECT "createdBy" INTO mission_owner_id
    FROM sofia.tasks WHERE id = NEW."missionTaskId" AND "parentTaskId" IS NULL;
  IF mission_owner_id IS NULL THEN
    RAISE EXCEPTION 'Action-plan unit mission must reference an owned root mission';
  END IF;

  SELECT type_row."typeKey", document_row."taskId", version_row."documentId",
         version_row."version", version_row."state", version_row."contentHash", version_row."content"
    INTO plan_type, task_parent_id, plan_document_id, plan_version_number,
         plan_state, plan_content_hash, plan_content
    FROM sofia."missionDocumentVersions" version_row
    JOIN sofia."missionDocuments" document_row ON document_row.id = version_row."documentId"
    JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
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
    FROM sofia."missionDocumentVersions"
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

  IF NEW."state" IN ('READY_FOR_DISPATCH', 'DISPATCHED') THEN
    IF NEW."operationalTaskId" IS NULL THEN
      RAISE EXCEPTION 'Dispatchable action-plan unit requires an operational task';
    END IF;
    SELECT "createdBy", "parentTaskId"
      INTO task_owner_id, task_parent_id
      FROM sofia.tasks WHERE id = NEW."operationalTaskId";
    IF task_owner_id IS DISTINCT FROM mission_owner_id
       OR task_parent_id IS DISTINCT FROM NEW."missionTaskId" THEN
      RAISE EXCEPTION 'Operational task must be a direct child of the same mission owner';
    END IF;
  END IF;

  NEW."updatedAt" := now();
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION sofia.validate_mission_action_unit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS mission_action_units_validate ON "sofia"."missionActionUnits";
CREATE TRIGGER mission_action_units_validate
  BEFORE INSERT OR UPDATE ON "sofia"."missionActionUnits"
  FOR EACH ROW EXECUTE FUNCTION sofia.validate_mission_action_unit();

ALTER TABLE "sofia"."missionActionUnits" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "sofia"."missionActionUnits" FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "missionActionUnits_server_only" ON "sofia"."missionActionUnits";
CREATE POLICY "missionActionUnits_server_only"
  ON "sofia"."missionActionUnits"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
),
  CONSTRAINT "missionActionUnits_idempotency_length"
    CHECK (char_length("idempotencyKey") BETWEEN 16 AND 128),
  CONSTRAINT "missionActionUnits_title_nonempty"
    CHECK (length(trim("unitTitle")) > 0),
  CONSTRAINT "missionActionUnits_state_check"
    CHECK ("state" IN ('REGISTERED', 'AWAITING_APPROVAL', 'APPROVED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'BLOCKED', 'CANCELLED')),
  CONSTRAINT "missionActionUnits_approval_pair_check"
    CHECK (("approvalUserId" IS NULL) = ("approvedAt" IS NULL)),
  CONSTRAINT "missionActionUnits_dispatch_attempts_check"
    CHECK ("dispatchAttempts" >= 0)
);

CREATE INDEX IF NOT EXISTS "missionActionUnits_mission_state_idx"
  ON "sofia"."missionActionUnits" ("missionTaskId", "state");
CREATE INDEX IF NOT EXISTS "missionActionUnits_plan_version_idx"
  ON "sofia"."missionActionUnits" ("actionPlanVersionId");
CREATE INDEX IF NOT EXISTS "missionActionUnits_operational_task_idx"
  ON "sofia"."missionActionUnits" ("operationalTaskId");

-- The plan identity, unit identity and idempotency key are immutable. A unit
-- can become dispatchable only after an explicit human approval and complete
-- linkage to a child task of the same mission.
CREATE OR REPLACE FUNCTION sofia.validate_mission_action_unit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia
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
  IF TG_OP = 'UPDATE' THEN
    IF OLD."missionTaskId" IS DISTINCT FROM NEW."missionTaskId"
       OR OLD."actionPlanDocumentId" IS DISTINCT FROM NEW."actionPlanDocumentId"
       OR OLD."actionPlanVersionId" IS DISTINCT FROM NEW."actionPlanVersionId"
       OR OLD."actionPlanVersionNumber" IS DISTINCT FROM NEW."actionPlanVersionNumber"
       OR OLD."actionPlanContentHash" IS DISTINCT FROM NEW."actionPlanContentHash"
       OR OLD."unitId" IS DISTINCT FROM NEW."unitId"
       OR OLD."unitTitle" IS DISTINCT FROM NEW."unitTitle"
       OR OLD."idempotencyKey" IS DISTINCT FROM NEW."idempotencyKey" THEN
      RAISE EXCEPTION 'Action-plan unit identity is immutable';
    END IF;
    IF OLD."approvalUserId" IS NOT NULL
       AND (OLD."approvalUserId" IS DISTINCT FROM NEW."approvalUserId"
         OR OLD."approvedAt" IS DISTINCT FROM NEW."approvedAt") THEN
      RAISE EXCEPTION 'Action-plan unit approval is immutable';
    END IF;
  END IF;

  SELECT "createdBy" INTO mission_owner_id
    FROM sofia.tasks WHERE id = NEW."missionTaskId" AND "parentTaskId" IS NULL;
  IF mission_owner_id IS NULL THEN
    RAISE EXCEPTION 'Action-plan unit mission must reference an owned root mission';
  END IF;

  SELECT type_row."typeKey", document_row."taskId", version_row."documentId",
         version_row."version", version_row."state", version_row."contentHash", version_row."content"
    INTO plan_type, task_parent_id, plan_document_id, plan_version_number,
         plan_state, plan_content_hash, plan_content
    FROM sofia."missionDocumentVersions" version_row
    JOIN sofia."missionDocuments" document_row ON document_row.id = version_row."documentId"
    JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
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
    FROM sofia."missionDocumentVersions"
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

  IF NEW."state" IN ('READY_FOR_DISPATCH', 'DISPATCHED') THEN
    IF NEW."operationalTaskId" IS NULL THEN
      RAISE EXCEPTION 'Dispatchable action-plan unit requires an operational task';
    END IF;
    SELECT "createdBy", "parentTaskId"
      INTO task_owner_id, task_parent_id
      FROM sofia.tasks WHERE id = NEW."operationalTaskId";
    IF task_owner_id IS DISTINCT FROM mission_owner_id
       OR task_parent_id IS DISTINCT FROM NEW."missionTaskId" THEN
      RAISE EXCEPTION 'Operational task must be a direct child of the same mission owner';
    END IF;
  END IF;

  NEW."updatedAt" := now();
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION sofia.validate_mission_action_unit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS mission_action_units_validate ON "sofia"."missionActionUnits";
CREATE TRIGGER mission_action_units_validate
  BEFORE INSERT OR UPDATE ON "sofia"."missionActionUnits"
  FOR EACH ROW EXECUTE FUNCTION sofia.validate_mission_action_unit();

ALTER TABLE "sofia"."missionActionUnits" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "sofia"."missionActionUnits" FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "missionActionUnits_server_only" ON "sofia"."missionActionUnits";
CREATE POLICY "missionActionUnits_server_only"
  ON "sofia"."missionActionUnits"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
