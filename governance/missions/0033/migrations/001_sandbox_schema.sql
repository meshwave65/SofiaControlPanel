-- MISSION_0033: schema-only mirror of the 25 SCP sofia tables.

-- Generated from live source catalog metadata; no application rows are copied.

CREATE SCHEMA IF NOT EXISTS sandbox;

CREATE TYPE sandbox."agent_status" AS ENUM ('online', 'offline', 'idle', 'paused');

CREATE TYPE sandbox."role" AS ENUM ('user', 'admin');

CREATE TABLE sandbox."activityEventTypes" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name" character varying(64) NOT NULL,
  "description" text,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."activityLogs" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "agentId" integer,
  "taskId" integer,
  "eventTypeId" integer NOT NULL,
  "details" text,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."agents" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "ownerId" integer NOT NULL,
  "name" character varying(255) NOT NULL,
  "description" text,
  "status" sandbox.agent_status DEFAULT 'offline'::sandbox.agent_status NOT NULL,
  "version" character varying(64),
  "manusAccount" character varying(255),
  "manusPassword" character varying(255),
  "manusToken" text,
  "lastHeartbeat" timestamp without time zone,
  "connectionStatus" character varying(32) DEFAULT 'not_configured'::character varying NOT NULL,
  "connectionError" text,
  "creditsRemaining" numeric(12,2),
  "creditsUpdatedAt" timestamp without time zone,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."arcAccessEvents" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "userId" integer NOT NULL,
  "agentId" integer,
  "taskId" integer,
  "sessionId" character varying(128),
  "source" character varying(64) DEFAULT 'task_detail'::character varying NOT NULL,
  "observedAt" timestamp without time zone DEFAULT now() NOT NULL,
  "agentStatus" character varying(32),
  "agentVersion" character varying(64),
  "connectionStatus" character varying(32),
  "heartbeatRecent" boolean DEFAULT false NOT NULL,
  "activityCount" integer DEFAULT 0 NOT NULL,
  "completedTasks" integer DEFAULT 0 NOT NULL,
  "observedTasks" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb
);

CREATE TABLE sandbox."arcAssessments" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "taskId" integer NOT NULL,
  "agentId" integer,
  "policyId" integer NOT NULL,
  "prior" numeric(7,6) NOT NULL,
  "posterior" numeric(7,6) NOT NULL,
  "decision" character varying(16) NOT NULL,
  "mode" character varying(16) DEFAULT 'shadow'::character varying NOT NULL,
  "explanation" text NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."arcConfidenceSnapshots" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "userId" integer NOT NULL,
  "agentId" integer,
  "taskId" integer,
  "assessmentId" integer,
  "accessEventId" integer,
  "score" numeric(5,2) NOT NULL,
  "posterior" numeric(7,6) NOT NULL,
  "decision" character varying(16) NOT NULL,
  "anomalyCount" integer DEFAULT 0 NOT NULL,
  "trigger" character varying(64) DEFAULT 'assessment'::character varying NOT NULL,
  "signals" jsonb NOT NULL,
  "observedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."arcDeviceProfiles" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "ownerId" integer NOT NULL,
  "agentId" integer NOT NULL,
  "known" boolean DEFAULT false NOT NULL,
  "firstSeenAt" timestamp without time zone DEFAULT now() NOT NULL,
  "lastSeenAt" timestamp without time zone DEFAULT now() NOT NULL,
  "observationCount" integer DEFAULT 0 NOT NULL,
  "lastVersion" character varying(64),
  "lastConnectionStatus" character varying(32),
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."arcEvidence" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "assessmentId" integer NOT NULL,
  "key" character varying(128) NOT NULL,
  "value" numeric(7,6) NOT NULL,
  "reliability" numeric(7,6) NOT NULL,
  "likelihoodRatio" numeric(12,6) NOT NULL,
  "source" character varying(128) NOT NULL,
  "observedAt" timestamp without time zone NOT NULL,
  "metadata" jsonb
);

CREATE TABLE sandbox."arcPolicies" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name" character varying(128) NOT NULL,
  "prior" numeric(7,6) DEFAULT 0.500000 NOT NULL,
  "allowThreshold" numeric(7,6) DEFAULT 0.850000 NOT NULL,
  "reviewThreshold" numeric(7,6) DEFAULT 0.550000 NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "version" character varying(32) DEFAULT '0.1.0'::character varying NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."contextReports" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "ownerId" integer NOT NULL,
  "title" character varying(255) NOT NULL,
  "content" text NOT NULL,
  "creditsUsed" numeric(10,2),
  "gitHubUrl" character varying(512),
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

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

CREATE TABLE sandbox."messageTypes" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name" character varying(64) NOT NULL,
  "description" text,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "uiLabel" character varying(80),
  "contexts" character varying(16)[] DEFAULT ARRAY['general'::character varying(16), 'mission'::character varying(16)] NOT NULL,
  "isUserSelectable" boolean DEFAULT true NOT NULL
);

CREATE TABLE sandbox."messages" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "taskId" integer,
  "senderId" integer NOT NULL,
  "parentMessageId" integer,
  "typeId" integer NOT NULL,
  "content" text NOT NULL,
  "isRead" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "isAssistant" boolean DEFAULT false NOT NULL,
  "origin" character varying(16) DEFAULT 'internal'::character varying NOT NULL
);

CREATE TABLE sandbox."missionActionUnitGateEvidence" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "actionUnitId" integer NOT NULL,
  "missionTaskId" integer NOT NULL,
  "actionPlanDocumentId" integer NOT NULL,
  "actionPlanVersionId" integer NOT NULL,
  "actionPlanVersionNumber" integer NOT NULL,
  "actionPlanContentHash" character varying(64) NOT NULL,
  "unitId" character varying(8) NOT NULL,
  "gateKey" character varying(40) NOT NULL,
  "decision" character varying(16) NOT NULL,
  "actorType" character varying(16) NOT NULL,
  "actorUserId" integer,
  "source" character varying(128) NOT NULL,
  "sourceRef" text,
  "evidence" jsonb NOT NULL,
  "observedAt" timestamp without time zone DEFAULT now() NOT NULL,
  "validUntil" timestamp without time zone,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."missionActionUnits" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "missionTaskId" integer NOT NULL,
  "actionPlanDocumentId" integer NOT NULL,
  "actionPlanVersionId" integer NOT NULL,
  "actionPlanVersionNumber" integer NOT NULL,
  "actionPlanContentHash" character varying(64) NOT NULL,
  "unitId" character varying(8) NOT NULL,
  "unitTitle" character varying(255) NOT NULL,
  "idempotencyKey" character varying(128) NOT NULL,
  "operationalTaskId" integer,
  "state" character varying(32) DEFAULT 'REGISTERED'::character varying NOT NULL,
  "approvalUserId" integer,
  "approvedAt" timestamp without time zone,
  "dispatchRequestedAt" timestamp without time zone,
  "dispatchAttempts" integer DEFAULT 0 NOT NULL,
  "governanceEvidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."missionDocumentTypes" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "typeKey" character varying(64) NOT NULL,
  "label" character varying(128) NOT NULL,
  "description" text,
  "category" character varying(32) NOT NULL,
  "audience" character varying(32) NOT NULL,
  "sortOrder" integer DEFAULT 100 NOT NULL,
  "isDefault" boolean DEFAULT false NOT NULL,
  "renderer" character varying(32) DEFAULT 'markdown'::character varying NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."missionDocumentVersions" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "documentId" integer NOT NULL,
  "version" integer NOT NULL,
  "state" character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
  "content" text NOT NULL,
  "authorType" character varying(16) NOT NULL,
  "authorUserId" integer,
  "authorAgentId" integer,
  "sourceDocumentVersionId" integer,
  "provenance" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "changeSummary" text,
  "contentHash" character varying(64),
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "publishedAt" timestamp without time zone
);

CREATE TABLE sandbox."missionDocuments" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "taskId" integer NOT NULL,
  "documentTypeId" integer NOT NULL,
  "documentKey" character varying(128) NOT NULL,
  "title" character varying(255) NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
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

CREATE TABLE sandbox."scheduledTasks" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name" character varying(255) NOT NULL,
  "description" text,
  "cronExpression" character varying(64) NOT NULL,
  "endpoint" character varying(512) NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "lastRun" timestamp without time zone,
  "nextRun" timestamp without time zone,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."taskPriorities" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name" character varying(64) NOT NULL,
  "level" integer NOT NULL,
  "description" text,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."taskStatuses" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name" character varying(64) NOT NULL,
  "description" text,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE sandbox."tasks" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "agentId" integer,
  "createdBy" integer NOT NULL,
  "title" character varying(255) NOT NULL,
  "description" text,
  "statusId" integer NOT NULL,
  "priorityId" integer NOT NULL,
  "parentTaskId" integer,
  "dueDate" timestamp without time zone,
  "completedAt" timestamp without time zone,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
  "manusTaskId" character varying(128),
  "manusStatus" character varying(32),
  "creditsUsed" integer,
  "lastSyncedAt" timestamp without time zone,
  "agentPinned" boolean DEFAULT false NOT NULL,
  "creatorType" character varying(16) DEFAULT 'user'::character varying NOT NULL,
  "missionKey" character varying(64),
  "githubPath" character varying(512),
  "githubSha" character varying(128),
  "githubSyncStatus" character varying(32) DEFAULT 'pending'::character varying NOT NULL,
  "githubSyncError" text,
  "githubSyncedAt" timestamp without time zone,
  "isAssistant" boolean DEFAULT false NOT NULL,
  "ownerUserId" integer
);

CREATE TABLE sandbox."users" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "openId" character varying(64) NOT NULL,
  "name" text,
  "email" character varying(320),
  "loginMethod" character varying(64),
  "role" sandbox.role DEFAULT 'user'::sandbox.role NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
  "lastSignedIn" timestamp without time zone DEFAULT now() NOT NULL
);














































































































ALTER TABLE sandbox."activityEventTypes" ADD CONSTRAINT "activityEventTypes_name_key" UNIQUE (name);
ALTER TABLE sandbox."activityEventTypes" ADD CONSTRAINT "activityEventTypes_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."activityLogs" ADD CONSTRAINT "activityLogs_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."agents" ADD CONSTRAINT "agents_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."arcAccessEvents" ADD CONSTRAINT "arcAccessEvents_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."arcAssessments" ADD CONSTRAINT "arcAssessments_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."arcConfidenceSnapshots" ADD CONSTRAINT "arcConfidenceSnapshots_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."arcDeviceProfiles" ADD CONSTRAINT "arcDeviceProfiles_agentId_unique" UNIQUE ("agentId");
ALTER TABLE sandbox."arcDeviceProfiles" ADD CONSTRAINT "arcDeviceProfiles_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."arcEvidence" ADD CONSTRAINT "arcEvidence_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."arcPolicies" ADD CONSTRAINT "arcPolicies_name_unique" UNIQUE (name);
ALTER TABLE sandbox."arcPolicies" ADD CONSTRAINT "arcPolicies_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."contextReports" ADD CONSTRAINT "contextReports_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."governanceMissions" ADD CONSTRAINT "governanceMissions_missionKey_key" UNIQUE ("missionKey");
ALTER TABLE sandbox."governanceMissions" ADD CONSTRAINT "governanceMissions_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."messages" ADD CONSTRAINT "messages_origin_allowed_check" CHECK (((origin)::text = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::text[])));
ALTER TABLE sandbox."messages" ADD CONSTRAINT "messages_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."messageTypes" ADD CONSTRAINT "messageTypes_contexts_allowed_check" CHECK ((contexts <@ ARRAY['general'::character varying(16), 'mission'::character varying(16)]));
ALTER TABLE sandbox."messageTypes" ADD CONSTRAINT "messageTypes_name_key" UNIQUE (name);
ALTER TABLE sandbox."messageTypes" ADD CONSTRAINT "messageTypes_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_actor_pair_check" CHECK ((((("actorType")::text = 'OWNER'::text) AND ("actorUserId" IS NOT NULL)) OR ((("actorType")::text = 'SYSTEM'::text) AND ("actorUserId" IS NULL))));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_actor_type_check" CHECK ((("actorType")::text = ANY ((ARRAY['SYSTEM'::character varying, 'OWNER'::character varying])::text[])));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_decision_check" CHECK (((decision)::text = ANY ((ARRAY['VERIFIED'::character varying, 'BLOCKED'::character varying, 'UNKNOWN'::character varying])::text[])));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_evidence_object" CHECK ((jsonb_typeof(evidence) = 'object'::text));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_gate_key_check" CHECK ((("gateKey")::text = ANY ((ARRAY['DEPENDENCY'::character varying, 'RISK_POLICY'::character varying, 'BUDGET_AUTHORIZATION'::character varying, 'UNIT_PERMISSION'::character varying, 'EXECUTOR_ELIGIBILITY'::character varying, 'ADAPTER_CAPABILITY'::character varying])::text[])));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_hash_format" CHECK ((("actionPlanContentHash")::text ~ '^[a-f0-9]{64}$'::text));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_source_nonempty" CHECK ((length(TRIM(BOTH FROM source)) > 0));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_unit_id_format" CHECK ((("unitId")::text ~ '^T[0-9]{2}$'::text));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_validity_check" CHECK ((("validUntil" IS NULL) OR ("validUntil" > "observedAt")));
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_version_positive" CHECK (("actionPlanVersionNumber" > 0));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_approval_pair_check" CHECK ((("approvalUserId" IS NULL) = ("approvedAt" IS NULL)));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_dispatch_attempts_check" CHECK (("dispatchAttempts" >= 0));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_hash_format" CHECK ((("actionPlanContentHash")::text ~ '^[a-f0-9]{64}$'::text));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_idempotency_length" CHECK (((char_length(("idempotencyKey")::text) >= 16) AND (char_length(("idempotencyKey")::text) <= 128)));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_idempotencyKey_key" UNIQUE ("idempotencyKey");
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_mission_version_unit_unique" UNIQUE ("missionTaskId", "actionPlanVersionId", "unitId");
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_operationalTaskId_key" UNIQUE ("operationalTaskId");
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_state_check" CHECK (((state)::text = ANY ((ARRAY['REGISTERED'::character varying, 'AWAITING_APPROVAL'::character varying, 'APPROVED'::character varying, 'READY_FOR_DISPATCH'::character varying, 'DISPATCHED'::character varying, 'BLOCKED'::character varying, 'CANCELLED'::character varying])::text[])));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_title_nonempty" CHECK ((length(TRIM(BOTH FROM "unitTitle")) > 0));
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_unit_id_format" CHECK ((("unitId")::text ~ '^T[0-9]{2}$'::text));
ALTER TABLE sandbox."missionDocuments" ADD CONSTRAINT "missionDocuments_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionDocuments" ADD CONSTRAINT "missionDocuments_task_documentKey_unique" UNIQUE ("taskId", "documentKey");
ALTER TABLE sandbox."missionDocumentTypes" ADD CONSTRAINT "missionDocumentTypes_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionDocumentTypes" ADD CONSTRAINT "missionDocumentTypes_typeKey_key" UNIQUE ("typeKey");
ALTER TABLE sandbox."missionDocumentVersions" ADD CONSTRAINT "missionDocumentVersions_document_version_unique" UNIQUE ("documentId", version);
ALTER TABLE sandbox."missionDocumentVersions" ADD CONSTRAINT "missionDocumentVersions_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionParameterOptions" ADD CONSTRAINT "missionParameterOptions_parameterId_value_key" UNIQUE ("parameterId", value);
ALTER TABLE sandbox."missionParameterOptions" ADD CONSTRAINT "missionParameterOptions_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_missionKey_parameterKey_key" UNIQUE ("missionKey", "parameterKey");
ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_validation_check" CHECK ((jsonb_typeof(validation) = 'object'::text));
ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_valueType_check" CHECK ((("valueType")::text = ANY ((ARRAY['enum'::character varying, 'boolean'::character varying, 'decimal'::character varying, 'integer'::character varying, 'datetime'::character varying, 'text'::character varying])::text[])));
ALTER TABLE sandbox."scheduledTasks" ADD CONSTRAINT "scheduledTasks_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."taskPriorities" ADD CONSTRAINT "taskPriorities_name_key" UNIQUE (name);
ALTER TABLE sandbox."taskPriorities" ADD CONSTRAINT "taskPriorities_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."taskStatuses" ADD CONSTRAINT "taskStatuses_name_key" UNIQUE (name);
ALTER TABLE sandbox."taskStatuses" ADD CONSTRAINT "taskStatuses_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."users" ADD CONSTRAINT "users_openId_key" UNIQUE ("openId");
ALTER TABLE sandbox."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);
ALTER TABLE sandbox."activityLogs" ADD CONSTRAINT "activityLogs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES sandbox.agents(id) ON DELETE CASCADE;
ALTER TABLE sandbox."activityLogs" ADD CONSTRAINT "activityLogs_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES sandbox."activityEventTypes"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."activityLogs" ADD CONSTRAINT "activityLogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES sandbox.tasks(id) ON DELETE SET NULL;
ALTER TABLE sandbox."agents" ADD CONSTRAINT "agents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES sandbox.users(id) ON DELETE CASCADE;
ALTER TABLE sandbox."arcAccessEvents" ADD CONSTRAINT "arcAccessEvents_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES sandbox.agents(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcAccessEvents" ADD CONSTRAINT "arcAccessEvents_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES sandbox.tasks(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcAccessEvents" ADD CONSTRAINT "arcAccessEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES sandbox.users(id) ON DELETE CASCADE;
ALTER TABLE sandbox."arcAssessments" ADD CONSTRAINT "arcAssessments_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES sandbox.agents(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcAssessments" ADD CONSTRAINT "arcAssessments_policyId_arcPolicies_id_fk" FOREIGN KEY ("policyId") REFERENCES sandbox."arcPolicies"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."arcAssessments" ADD CONSTRAINT "arcAssessments_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES sandbox.tasks(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."arcConfidenceSnapshots" ADD CONSTRAINT "arcConfidenceSnapshots_accessEventId_fkey" FOREIGN KEY ("accessEventId") REFERENCES sandbox."arcAccessEvents"(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcConfidenceSnapshots" ADD CONSTRAINT "arcConfidenceSnapshots_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES sandbox.agents(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcConfidenceSnapshots" ADD CONSTRAINT "arcConfidenceSnapshots_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES sandbox."arcAssessments"(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcConfidenceSnapshots" ADD CONSTRAINT "arcConfidenceSnapshots_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES sandbox.tasks(id) ON DELETE SET NULL;
ALTER TABLE sandbox."arcConfidenceSnapshots" ADD CONSTRAINT "arcConfidenceSnapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES sandbox.users(id) ON DELETE CASCADE;
ALTER TABLE sandbox."arcDeviceProfiles" ADD CONSTRAINT "arcDeviceProfiles_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES sandbox.agents(id) ON DELETE CASCADE;
ALTER TABLE sandbox."arcDeviceProfiles" ADD CONSTRAINT "arcDeviceProfiles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES sandbox.users(id) ON DELETE CASCADE;
ALTER TABLE sandbox."arcEvidence" ADD CONSTRAINT "arcEvidence_assessmentId_arcAssessments_id_fk" FOREIGN KEY ("assessmentId") REFERENCES sandbox."arcAssessments"(id) ON DELETE CASCADE;
ALTER TABLE sandbox."contextReports" ADD CONSTRAINT "contextReports_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES sandbox.users(id) ON DELETE CASCADE;
ALTER TABLE sandbox."messages" ADD CONSTRAINT "messages_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES sandbox.messages(id) ON DELETE CASCADE;
ALTER TABLE sandbox."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES sandbox.users(id) ON DELETE CASCADE;
ALTER TABLE sandbox."messages" ADD CONSTRAINT "messages_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES sandbox.tasks(id) ON DELETE CASCADE;
ALTER TABLE sandbox."messages" ADD CONSTRAINT "messages_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES sandbox."messageTypes"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_actionPlanDocumentId_fkey" FOREIGN KEY ("actionPlanDocumentId") REFERENCES sandbox."missionDocuments"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_actionPlanVersionId_fkey" FOREIGN KEY ("actionPlanVersionId") REFERENCES sandbox."missionDocumentVersions"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_actionUnitId_fkey" FOREIGN KEY ("actionUnitId") REFERENCES sandbox."missionActionUnits"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES sandbox.users(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnitGateEvidence" ADD CONSTRAINT "missionActionUnitGateEvidence_missionTaskId_fkey" FOREIGN KEY ("missionTaskId") REFERENCES sandbox.tasks(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_actionPlanDocumentId_fkey" FOREIGN KEY ("actionPlanDocumentId") REFERENCES sandbox."missionDocuments"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_actionPlanVersionId_fkey" FOREIGN KEY ("actionPlanVersionId") REFERENCES sandbox."missionDocumentVersions"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_approvalUserId_fkey" FOREIGN KEY ("approvalUserId") REFERENCES sandbox.users(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_missionTaskId_fkey" FOREIGN KEY ("missionTaskId") REFERENCES sandbox.tasks(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionActionUnits" ADD CONSTRAINT "missionActionUnits_operationalTaskId_fkey" FOREIGN KEY ("operationalTaskId") REFERENCES sandbox.tasks(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionDocuments" ADD CONSTRAINT "missionDocuments_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES sandbox."missionDocumentTypes"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionDocuments" ADD CONSTRAINT "missionDocuments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES sandbox.tasks(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionDocumentVersions" ADD CONSTRAINT "missionDocumentVersions_authorAgentId_fkey" FOREIGN KEY ("authorAgentId") REFERENCES sandbox.agents(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionDocumentVersions" ADD CONSTRAINT "missionDocumentVersions_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES sandbox.users(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionDocumentVersions" ADD CONSTRAINT "missionDocumentVersions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES sandbox."missionDocuments"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionDocumentVersions" ADD CONSTRAINT "missionDocumentVersions_sourceDocumentVersionId_fkey" FOREIGN KEY ("sourceDocumentVersionId") REFERENCES sandbox."missionDocumentVersions"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."missionParameterOptions" ADD CONSTRAINT "missionParameterOptions_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES sandbox."missionParameters"(id) ON DELETE CASCADE;
ALTER TABLE sandbox."missionParameters" ADD CONSTRAINT "missionParameters_missionKey_fkey" FOREIGN KEY ("missionKey") REFERENCES sandbox."governanceMissions"("missionKey");
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES sandbox.agents(id) ON DELETE SET NULL;
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES sandbox.users(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_owneruserid_fkey" FOREIGN KEY ("ownerUserId") REFERENCES sandbox.users(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES sandbox.tasks(id) ON DELETE CASCADE;
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES sandbox."taskPriorities"(id) ON DELETE RESTRICT;
ALTER TABLE sandbox."tasks" ADD CONSTRAINT "tasks_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES sandbox."taskStatuses"(id) ON DELETE RESTRICT;
CREATE INDEX "activityLogs_agentId_idx" ON sandbox."activityLogs" USING btree ("agentId");

CREATE INDEX "activityLogs_createdAt_idx" ON sandbox."activityLogs" USING btree ("createdAt");

CREATE INDEX "activityLogs_eventTypeId_idx" ON sandbox."activityLogs" USING btree ("eventTypeId");

CREATE INDEX "activityLogs_taskId_idx" ON sandbox."activityLogs" USING btree ("taskId");

CREATE INDEX "agents_ownerId_idx" ON sandbox.agents USING btree ("ownerId");

CREATE INDEX agents_status_idx ON sandbox.agents USING btree (status);

CREATE INDEX "arcAccessEvents_agentId_idx" ON sandbox."arcAccessEvents" USING btree ("agentId");

CREATE INDEX "arcAccessEvents_observedAt_idx" ON sandbox."arcAccessEvents" USING btree ("observedAt");

CREATE INDEX "arcAccessEvents_taskId_idx" ON sandbox."arcAccessEvents" USING btree ("taskId");

CREATE INDEX "arcAccessEvents_userId_idx" ON sandbox."arcAccessEvents" USING btree ("userId");

CREATE INDEX "arcAssessments_agentId_idx" ON sandbox."arcAssessments" USING btree ("agentId");

CREATE INDEX "arcAssessments_createdAt_idx" ON sandbox."arcAssessments" USING btree ("createdAt");

CREATE INDEX "arcAssessments_policyId_idx" ON sandbox."arcAssessments" USING btree ("policyId");

CREATE INDEX "arcAssessments_taskId_idx" ON sandbox."arcAssessments" USING btree ("taskId");

CREATE INDEX "arcConfidenceSnapshots_agentId_idx" ON sandbox."arcConfidenceSnapshots" USING btree ("agentId");

CREATE INDEX "arcConfidenceSnapshots_observedAt_idx" ON sandbox."arcConfidenceSnapshots" USING btree ("observedAt");

CREATE INDEX "arcConfidenceSnapshots_taskId_idx" ON sandbox."arcConfidenceSnapshots" USING btree ("taskId");

CREATE INDEX "arcConfidenceSnapshots_userId_idx" ON sandbox."arcConfidenceSnapshots" USING btree ("userId");

CREATE INDEX "arcDeviceProfiles_ownerId_idx" ON sandbox."arcDeviceProfiles" USING btree ("ownerId");

CREATE INDEX "arcEvidence_assessmentId_idx" ON sandbox."arcEvidence" USING btree ("assessmentId");

CREATE INDEX "arcEvidence_key_idx" ON sandbox."arcEvidence" USING btree (key);

CREATE INDEX "arcEvidence_observedAt_idx" ON sandbox."arcEvidence" USING btree ("observedAt");

CREATE INDEX "arcPolicies_enabled_idx" ON sandbox."arcPolicies" USING btree (enabled);

CREATE INDEX "contextReports_createdAt_idx" ON sandbox."contextReports" USING btree ("createdAt");

CREATE INDEX "contextReports_ownerId_idx" ON sandbox."contextReports" USING btree ("ownerId");

CREATE INDEX "messages_parentMessageId_idx" ON sandbox.messages USING btree ("parentMessageId");

CREATE INDEX "messages_senderId_idx" ON sandbox.messages USING btree ("senderId");

CREATE INDEX "messages_taskId_idx" ON sandbox.messages USING btree ("taskId");

CREATE INDEX "missionActionUnitGateEvidence_action_unit_idx" ON sandbox."missionActionUnitGateEvidence" USING btree ("actionUnitId");

CREATE INDEX "missionActionUnitGateEvidence_gate_observed_idx" ON sandbox."missionActionUnitGateEvidence" USING btree ("actionUnitId", "gateKey", "observedAt" DESC);

CREATE INDEX "missionActionUnits_mission_state_idx" ON sandbox."missionActionUnits" USING btree ("missionTaskId", state);

CREATE INDEX "missionActionUnits_operational_task_idx" ON sandbox."missionActionUnits" USING btree ("operationalTaskId");

CREATE INDEX "missionActionUnits_plan_version_idx" ON sandbox."missionActionUnits" USING btree ("actionPlanVersionId");

CREATE INDEX "missionDocumentTypes_active_sort_idx" ON sandbox."missionDocumentTypes" USING btree ("isActive", "sortOrder");

CREATE INDEX "missionDocumentTypes_category_idx" ON sandbox."missionDocumentTypes" USING btree (category);

CREATE INDEX "missionDocumentVersions_documentId_idx" ON sandbox."missionDocumentVersions" USING btree ("documentId");

CREATE INDEX "missionDocumentVersions_sourceVersion_idx" ON sandbox."missionDocumentVersions" USING btree ("sourceDocumentVersionId");

CREATE INDEX "missionDocuments_documentTypeId_idx" ON sandbox."missionDocuments" USING btree ("documentTypeId");

CREATE INDEX "missionDocuments_taskId_idx" ON sandbox."missionDocuments" USING btree ("taskId");

CREATE INDEX mission_parameter_options_lookup_idx ON sandbox."missionParameterOptions" USING btree ("parameterId", "isActive", "sortOrder");

CREATE INDEX mission_parameters_lookup_idx ON sandbox."missionParameters" USING btree ("missionKey", "isActive", "sortOrder");

CREATE INDEX "scheduledTasks_isActive_idx" ON sandbox."scheduledTasks" USING btree ("isActive");

CREATE INDEX "tasks_agentId_idx" ON sandbox.tasks USING btree ("agentId");

CREATE INDEX "tasks_createdBy_idx" ON sandbox.tasks USING btree ("createdBy");

CREATE UNIQUE INDEX "tasks_missionKey_unique" ON sandbox.tasks USING btree ("missionKey");

CREATE INDEX tasks_owneruserid_idx ON sandbox.tasks USING btree ("ownerUserId");

CREATE INDEX "tasks_statusId_idx" ON sandbox.tasks USING btree ("statusId");

ALTER TABLE sandbox."activityEventTypes" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."activityEventTypes" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."activityLogs" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."activityLogs" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."agents" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."agents" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."arcAccessEvents" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."arcAccessEvents" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."arcAssessments" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."arcAssessments" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."arcConfidenceSnapshots" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."arcConfidenceSnapshots" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."arcDeviceProfiles" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."arcDeviceProfiles" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."arcEvidence" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."arcEvidence" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."arcPolicies" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."arcPolicies" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."contextReports" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."contextReports" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."governanceMissions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."governanceMissions" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."messageTypes" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."messageTypes" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."messages" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."messages" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionActionUnitGateEvidence" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionActionUnitGateEvidence" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionActionUnits" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionActionUnits" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionDocumentTypes" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionDocumentTypes" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionDocumentVersions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionDocumentVersions" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionDocuments" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionDocuments" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionParameterOptions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionParameterOptions" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."missionParameters" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."missionParameters" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."scheduledTasks" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."scheduledTasks" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."taskPriorities" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."taskPriorities" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."taskStatuses" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."taskStatuses" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."tasks" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."tasks" FROM PUBLIC, anon, authenticated;

ALTER TABLE sandbox."users" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sandbox."users" FROM PUBLIC, anon, authenticated;

REVOKE ALL ON SCHEMA sandbox FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA sandbox TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA sandbox REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA sandbox REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

-- Safe, non-secret projection of the agent catalog. It does not expose credential columns.
CREATE OR REPLACE VIEW sandbox.agent_catalog_public WITH (security_invoker = true) AS
SELECT id, name, description, status, version, "connectionStatus", "lastHeartbeat", "createdAt", "updatedAt"
FROM sandbox.agents;

REVOKE ALL ON sandbox.agent_catalog_public FROM PUBLIC, anon, authenticated;
