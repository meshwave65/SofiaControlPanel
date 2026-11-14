-- AC-017 / Increment A: generic mission-document catalog and immutable versions.
-- This migration is intentionally NOT wired into ensure-database.mjs.
-- Apply only through the separately approved database migration procedure.

CREATE TABLE IF NOT EXISTS "sofia"."missionDocumentTypes" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "typeKey" varchar(64) NOT NULL UNIQUE,
  "label" varchar(128) NOT NULL,
  "description" text,
  "category" varchar(32) NOT NULL,
  "audience" varchar(32) NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 100,
  "isDefault" boolean NOT NULL DEFAULT false,
  "renderer" varchar(32) NOT NULL DEFAULT 'markdown',
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "missionDocumentTypes_category_idx"
  ON "sofia"."missionDocumentTypes" ("category");
CREATE INDEX IF NOT EXISTS "missionDocumentTypes_active_sort_idx"
  ON "sofia"."missionDocumentTypes" ("isActive", "sortOrder");

CREATE TABLE IF NOT EXISTS "sofia"."missionDocuments" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "taskId" integer NOT NULL REFERENCES "sofia"."tasks"("id") ON DELETE RESTRICT,
  "documentTypeId" integer NOT NULL REFERENCES "sofia"."missionDocumentTypes"("id") ON DELETE RESTRICT,
  "documentKey" varchar(128) NOT NULL,
  "title" varchar(255) NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "missionDocuments_task_documentKey_unique" UNIQUE ("taskId", "documentKey")
);
CREATE INDEX IF NOT EXISTS "missionDocuments_taskId_idx"
  ON "sofia"."missionDocuments" ("taskId");
CREATE INDEX IF NOT EXISTS "missionDocuments_documentTypeId_idx"
  ON "sofia"."missionDocuments" ("documentTypeId");

CREATE TABLE IF NOT EXISTS "sofia"."missionDocumentVersions" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "documentId" integer NOT NULL REFERENCES "sofia"."missionDocuments"("id") ON DELETE RESTRICT,
  "version" integer NOT NULL,
  "state" varchar(32) NOT NULL DEFAULT 'DRAFT',
  "content" text NOT NULL,
  "authorType" varchar(16) NOT NULL,
  "authorUserId" integer REFERENCES "sofia"."users"("id") ON DELETE RESTRICT,
  "authorAgentId" integer REFERENCES "sofia"."agents"("id") ON DELETE RESTRICT,
  "sourceDocumentVersionId" integer REFERENCES "sofia"."missionDocumentVersions"("id") ON DELETE RESTRICT,
  "provenance" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "changeSummary" text,
  "contentHash" varchar(64),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "publishedAt" timestamp,
  CONSTRAINT "missionDocumentVersions_document_version_unique" UNIQUE ("documentId", "version")
);
CREATE INDEX IF NOT EXISTS "missionDocumentVersions_documentId_idx"
  ON "sofia"."missionDocumentVersions" ("documentId");
CREATE INDEX IF NOT EXISTS "missionDocumentVersions_sourceVersion_idx"
  ON "sofia"."missionDocumentVersions" ("sourceDocumentVersionId");

-- Version rows are append-only. A correction or revision is a new version,
-- never an UPDATE/DELETE of an existing version.
CREATE OR REPLACE FUNCTION sofia.reject_mission_document_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'Mission document versions are immutable; create a new version instead';
END;
$function$;

REVOKE ALL ON FUNCTION sofia.reject_mission_document_version_mutation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS mission_document_versions_immutable
  ON "sofia"."missionDocumentVersions";
CREATE TRIGGER mission_document_versions_immutable
  BEFORE UPDATE OR DELETE ON "sofia"."missionDocumentVersions"
  FOR EACH ROW
  EXECUTE FUNCTION sofia.reject_mission_document_version_mutation();

-- These tables are accessed only through the authenticated SCP server.
-- The server uses its database connection and enforces task ownership before
-- every document read/write; browser roles receive no direct table privileges.
ALTER TABLE "sofia"."missionDocumentTypes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."missionDocuments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."missionDocumentVersions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  "sofia"."missionDocumentTypes",
  "sofia"."missionDocuments",
  "sofia"."missionDocumentVersions"
FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "missionDocumentTypes_server_only" ON "sofia"."missionDocumentTypes";
CREATE POLICY "missionDocumentTypes_server_only"
  ON "sofia"."missionDocumentTypes"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "missionDocuments_server_only" ON "sofia"."missionDocuments";
CREATE POLICY "missionDocuments_server_only"
  ON "sofia"."missionDocuments"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "missionDocumentVersions_server_only" ON "sofia"."missionDocumentVersions";
CREATE POLICY "missionDocumentVersions_server_only"
  ON "sofia"."missionDocumentVersions"
  FOR ALL TO PUBLIC USING (false) WITH CHECK (false);

-- Stable catalog: ORIGINAL_REQUEST is the immutable source snapshot, not a
-- substitute for TR. TR is the default operator-facing mission document.
INSERT INTO "sofia"."missionDocumentTypes"
  ("typeKey", "label", "description", "category", "audience", "sortOrder", "isDefault", "renderer")
VALUES
  ('ORIGINAL_REQUEST', 'Solicitação original', 'Snapshot da solicitação humana ou origem autônoma, preservado como proveniência.', 'origin', 'operator', 0, false, 'markdown'),
  ('TR', 'TR — Contexto da missão', 'Relatório narrativo vivo e versionado do entendimento e evolução da missão.', 'context', 'operator', 10, true, 'markdown'),
  ('BLUEPRINT', 'Blueprint — Plano de trabalho', 'Plano operacional derivado de uma versão específica do TR.', 'planning', 'executor', 20, false, 'markdown'),
  ('OR', 'OR — Relatório operacional', 'Registro operacional e evidências de execução; admite múltiplas instâncias.', 'execution', 'operator', 30, false, 'markdown'),
  ('FOR', 'FOR — Relatório operacional final', 'Consolidação de aprendizados operacionais ao encerramento da missão.', 'closure', 'operator', 40, false, 'markdown')
ON CONFLICT ("typeKey") DO NOTHING;


-- Execution gate: a validated latest TR plus a READY Blueprint derived from
-- that exact TR version release the top-level mission. Child tasks inherit it.
CREATE OR REPLACE FUNCTION sofia.enforce_execution_documents_before_staged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia
AS $function$
DECLARE
  staged_status_id integer;
  mission_id integer;
  latest_tr_id integer;
  latest_tr_state text;
  latest_blueprint_state text;
  latest_blueprint_source_id integer;
BEGIN
  SELECT id INTO staged_status_id FROM sofia."taskStatuses" WHERE name = 'STAGED' LIMIT 1;
  IF staged_status_id IS NULL OR NEW."statusId" IS DISTINCT FROM staged_status_id THEN RETURN NEW; END IF;
  IF NEW."parentTaskId" IS NULL THEN
    mission_id := NEW.id;
  ELSE
    WITH RECURSIVE ancestors AS (
      SELECT id, "parentTaskId", ARRAY[id] AS path
        FROM sofia.tasks WHERE id = NEW."parentTaskId"
      UNION ALL
      SELECT parent.id, parent."parentTaskId", child.path || parent.id
        FROM sofia.tasks parent
        JOIN ancestors child ON parent.id = child."parentTaskId"
       WHERE NOT parent.id = ANY(child.path)
    )
    SELECT id INTO mission_id FROM ancestors WHERE "parentTaskId" IS NULL LIMIT 1;
  END IF;
  IF mission_id IS NULL THEN RAISE EXCEPTION 'Execution blocked: top-level mission could not be resolved for task %', NEW.id; END IF;
  SELECT version_row.id, version_row.state
    INTO latest_tr_id, latest_tr_state
    FROM sofia."missionDocuments" document_row
    JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
    JOIN sofia."missionDocumentVersions" version_row ON version_row."documentId" = document_row.id
   WHERE document_row."taskId" = mission_id AND document_row."documentKey" = 'TR' AND type_row."typeKey" = 'TR'
   ORDER BY version_row.version DESC LIMIT 1;

  SELECT version_row.state, version_row."sourceDocumentVersionId"
    INTO latest_blueprint_state, latest_blueprint_source_id
    FROM sofia."missionDocuments" document_row
    JOIN sofia."missionDocumentTypes" type_row ON type_row.id = document_row."documentTypeId"
    JOIN sofia."missionDocumentVersions" version_row ON version_row."documentId" = document_row.id
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
REVOKE ALL ON FUNCTION sofia.enforce_execution_documents_before_staged() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS tasks_require_validated_tr ON sofia.tasks;
CREATE TRIGGER tasks_require_validated_tr BEFORE INSERT OR UPDATE OF "statusId", "agentId" ON sofia.tasks
  FOR EACH ROW EXECUTE FUNCTION sofia.enforce_execution_documents_before_staged();
