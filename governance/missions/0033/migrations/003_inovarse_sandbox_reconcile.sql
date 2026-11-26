-- MISSION_0033: incremental structural reconciliation for the existing Inovarse sandbox schema.

-- Preserves all existing rows. Does not import source application data or dispatch triggers.

ALTER TABLE sandbox."messageTypes"
  ADD COLUMN "uiLabel" varchar(80),
  ADD COLUMN contexts varchar(16)[] NOT NULL DEFAULT ARRAY['general'::varchar(16), 'mission'::varchar(16)],
  ADD COLUMN "isUserSelectable" boolean NOT NULL DEFAULT true;

ALTER TABLE sandbox.messages
  ADD COLUMN origin varchar(16) NOT NULL DEFAULT 'internal'::character varying;

CREATE TABLE sandbox."governanceMissions" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "missionKey" character varying(32) NOT NULL,
  "title" character varying(255) NOT NULL,
  "status" character varying(32) NOT NULL,
  "description" text,
  "canonicalPath" character varying(512) NOT NULL,
  "legacyPath" character varying(512),
  "artifactCount" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."missionParameters" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "missionKey" character varying NOT NULL,
  "parameterKey" character varying NOT NULL,
  "label" text NOT NULL,
  "description" text NOT NULL,
  "valueType" character varying NOT NULL,
  "validation" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "isRequired" boolean DEFAULT false NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."missionParameterOptions" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "parameterId" integer NOT NULL,
  "value" text NOT NULL,
  "label" text NOT NULL,
  "description" text NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE sandbox."governanceMissions" ADD CONSTRAINT "governanceMissions_missionKey_key" UNIQUE ("missionKey");

ALTER TABLE sandbox."governanceMissions" ADD CONSTRAINT "governanceMissions_pkey" PRIMARY KEY (id);

ALTER TABLE sandbox."missionParameterOptions" ADD CONSTRAINT "missionParameterOptions_parameterId_value_key" UNIQUE ("parameterId", value);

ALTER TABLE sandbox."missionParameterOptions" ADD CONSTRAINT "missionParameterOptions_pkey" PRIMARY KEY (id);

ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_missionKey_parameterKey_key" UNIQUE ("missionKey", "parameterKey");

ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_pkey" PRIMARY KEY (id);

ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_validation_check" CHECK ((jsonb_typeof(validation) = 'object'::text));

ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_valueType_check" CHECK ((("valueType")::text = ANY ((ARRAY['enum'::character varying, 'boolean'::character varying, 'decimal'::character varying, 'integer'::character varying, 'datetime'::character varying, 'text'::character varying])::text[])));

ALTER TABLE sandbox."missionParameterOptions" ADD CONSTRAINT "missionParameterOptions_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES sandbox."missionParameters"(id) ON DELETE CASCADE;

ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_missionKey_fkey" FOREIGN KEY ("missionKey") REFERENCES sandbox."governanceMissions"("missionKey");

CREATE INDEX mission_parameter_options_lookup_idx ON sandbox."missionParameterOptions" USING btree ("parameterId", "isActive", "sortOrder");

CREATE INDEX mission_parameters_lookup_idx ON sandbox."missionParameters" USING btree ("missionKey", "isActive", "sortOrder");

ALTER TABLE sandbox."messageTypes"
  ADD CONSTRAINT "messageTypes_contexts_allowed_check"
  CHECK (contexts <@ ARRAY['general'::varchar(16), 'mission'::varchar(16)]);

ALTER TABLE sandbox.messages
  ADD CONSTRAINT "messages_origin_allowed_check"
  CHECK (origin IN ('internal','external'));

CREATE OR REPLACE VIEW sandbox.agent_catalog_public WITH (security_invoker = true) AS
SELECT id, name, description, status, version, "connectionStatus", "lastHeartbeat", "createdAt", "updatedAt"
FROM sandbox.agents a;
REVOKE ALL ON sandbox.agent_catalog_public FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION sandbox.get_mission_parameters(p_mission_key text)
 RETURNS TABLE(parameter_key text, label text, description text, value_type text, validation jsonb, is_required boolean, sort_order integer, options jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'sofia', 'public', 'pg_temp'
AS $function$
SELECT p."parameterKey",p.label,p.description,p."valueType",p.validation,p."isRequired",p."sortOrder",coalesce(jsonb_agg(jsonb_build_object('value',o.value,'label',o.label,'description',o.description,'sort_order',o."sortOrder") ORDER BY o."sortOrder",o.id) FILTER (WHERE o.id IS NOT NULL),'[]'::jsonb) FROM sandbox."missionParameters" p LEFT JOIN sandbox."missionParameterOptions" o ON o."parameterId"=p.id AND o."isActive"=true WHERE p."missionKey"=p_mission_key AND p."isActive"=true GROUP BY p.id,p."parameterKey",p.label,p.description,p."valueType",p.validation,p."isRequired",p."sortOrder" ORDER BY p."sortOrder",p.id;
$function$


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
$function$


REVOKE ALL ON FUNCTION sandbox.get_mission_parameters(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION sandbox.validate_mission_parameters(text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION sandbox.get_mission_parameters(text) TO postgres;
GRANT EXECUTE ON FUNCTION sandbox.validate_mission_parameters(text,jsonb) TO postgres;

DO $policy$
DECLARE p record;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname
             FROM pg_policies WHERE schemaname = 'sandbox'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END;
$policy$;

DO $rls$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'activityEventTypes','activityLogs','agents','arcAccessEvents','arcAssessments',
    'arcConfidenceSnapshots','arcDeviceProfiles','arcEvidence','arcPolicies','contextReports',
    'governanceMissions','messageTypes','messages','missionActionUnitGateEvidence',
    'missionActionUnits','missionDocumentTypes','missionDocumentVersions','missionDocuments',
    'missionParameterOptions','missionParameters','scheduledTasks','taskPriorities',
    'taskStatuses','tasks','users'
  ] LOOP
    EXECUTE format('ALTER TABLE sandbox.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE sandbox.%I FROM PUBLIC, anon, authenticated', table_name);
  END LOOP;
END;
$rls$;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA sandbox FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SCHEMA sandbox FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA sandbox TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA sandbox REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA sandbox REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
