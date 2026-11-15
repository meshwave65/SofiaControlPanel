-- AC-023a: append-only, version-bound evidence for each ACTION_PLAN unit.
-- This migration is intentionally not wired into startup and is not applied to persistent databases.

CREATE TABLE IF NOT EXISTS "sofia"."missionActionUnitGateEvidence" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "actionUnitId" integer NOT NULL REFERENCES "sofia"."missionActionUnits"("id") ON DELETE RESTRICT,
  "missionTaskId" integer NOT NULL REFERENCES "sofia"."tasks"("id") ON DELETE RESTRICT,
  "actionPlanDocumentId" integer NOT NULL REFERENCES "sofia"."missionDocuments"("id") ON DELETE RESTRICT,
  "actionPlanVersionId" integer NOT NULL REFERENCES "sofia"."missionDocumentVersions"("id") ON DELETE RESTRICT,
  "actionPlanVersionNumber" integer NOT NULL,
  "actionPlanContentHash" varchar(64) NOT NULL,
  "unitId" varchar(8) NOT NULL,
  "gateKey" varchar(40) NOT NULL,
  "decision" varchar(16) NOT NULL,
  "actorType" varchar(16) NOT NULL,
  "actorUserId" integer REFERENCES "sofia"."users"("id") ON DELETE RESTRICT,
  "source" varchar(128) NOT NULL,
  "sourceRef" text,
  "evidence" jsonb NOT NULL,
  "observedAt" timestamp NOT NULL DEFAULT now(),
  "validUntil" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "missionActionUnitGateEvidence_gate_key_check"
    CHECK ("gateKey" IN ('DEPENDENCY', 'RISK_POLICY', 'BUDGET_AUTHORIZATION', 'UNIT_PERMISSION', 'EXECUTOR_ELIGIBILITY', 'ADAPTER_CAPABILITY')),
  CONSTRAINT "missionActionUnitGateEvidence_decision_check"
    CHECK ("decision" IN ('VERIFIED', 'BLOCKED', 'UNKNOWN')),
  CONSTRAINT "missionActionUnitGateEvidence_actor_type_check"
    CHECK ("actorType" IN ('SYSTEM', 'OWNER')),
  CONSTRAINT "missionActionUnitGateEvidence_actor_pair_check"
    CHECK (("actorType" = 'OWNER' AND "actorUserId" IS NOT NULL) OR ("actorType" = 'SYSTEM' AND "actorUserId" IS NULL)),
  CONSTRAINT "missionActionUnitGateEvidence_hash_format"
    CHECK ("actionPlanContentHash" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "missionActionUnitGateEvidence_unit_id_format"
    CHECK ("unitId" ~ '^T[0-9]{2}$'),
  CONSTRAINT "missionActionUnitGateEvidence_version_positive"
    CHECK ("actionPlanVersionNumber" > 0),
  CONSTRAINT "missionActionUnitGateEvidence_source_nonempty"
    CHECK (length(trim("source")) > 0),
  CONSTRAINT "missionActionUnitGateEvidence_evidence_object"
    CHECK (jsonb_typeof("evidence") = 'object'),
  CONSTRAINT "missionActionUnitGateEvidence_validity_check"
    CHECK ("validUntil" IS NULL OR "validUntil" > "observedAt")
);

CREATE INDEX IF NOT EXISTS "missionActionUnitGateEvidence_action_unit_idx"
  ON "sofia"."missionActionUnitGateEvidence" ("actionUnitId");
CREATE INDEX IF NOT EXISTS "missionActionUnitGateEvidence_gate_observed_idx"
  ON "sofia"."missionActionUnitGateEvidence" ("actionUnitId", "gateKey", "observedAt" DESC);

CREATE OR REPLACE FUNCTION sofia.validate_mission_action_unit_gate_evidence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia
AS $function$
DECLARE
  unit_row record;
  mission_owner_id integer;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'Mission action-unit gate evidence is append-only';
  END IF;

  SELECT *
    INTO unit_row
    FROM sofia."missionActionUnits"
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
    FROM sofia.tasks
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

REVOKE ALL ON FUNCTION sofia.validate_mission_action_unit_gate_evidence() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS mission_action_unit_gate_evidence_validate ON "sofia"."missionActionUnitGateEvidence";
CREATE TRIGGER mission_action_unit_gate_evidence_validate
  BEFORE INSERT OR UPDATE OR DELETE ON "sofia"."missionActionUnitGateEvidence"
  FOR EACH ROW EXECUTE FUNCTION sofia.validate_mission_action_unit_gate_evidence();

ALTER TABLE "sofia"."missionActionUnitGateEvidence" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "sofia"."missionActionUnitGateEvidence" FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "missionActionUnitGateEvidence_server_only" ON "sofia"."missionActionUnitGateEvidence";
CREATE POLICY "missionActionUnitGateEvidence_server_only"
  ON "sofia"."missionActionUnitGateEvidence"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);
