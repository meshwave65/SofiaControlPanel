-- Stable source identity for the one-way SCP agent catalog projection.
ALTER TABLE sandbox.agents ADD COLUMN "sourceAgentId" integer;

ALTER TABLE sandbox.agents
  DROP CONSTRAINT agents_catalog_or_session_owner_check;

ALTER TABLE sandbox.agents
  ADD CONSTRAINT agents_origin_identity_check
  CHECK (
    (
      "agentOrigin" = 'SCP_CATALOG'
      AND "sourceAgentId" IS NOT NULL
      AND "ownerId" IS NULL
      AND "sandboxSessionId" IS NULL
    )
    OR
    (
      "agentOrigin" = 'SANDBOX_SESSION'
      AND "sourceAgentId" IS NULL
      AND "ownerId" IS NOT NULL
      AND "sandboxSessionId" IS NOT NULL
    )
  );

CREATE UNIQUE INDEX agents_scp_catalog_source_id_uidx
  ON sandbox.agents ("sourceAgentId")
  WHERE "agentOrigin" = 'SCP_CATALOG';

CREATE OR REPLACE VIEW sandbox.agent_catalog_public WITH (security_invoker = true) AS
SELECT
  a."sourceAgentId" AS id,
  a.name,
  a.description,
  a.status,
  a.version,
  a."connectionStatus",
  a."lastHeartbeat",
  a."createdAt",
  a."updatedAt"
FROM sandbox.agents a
WHERE a."agentOrigin" = 'SCP_CATALOG';

REVOKE ALL ON sandbox.agent_catalog_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON sandbox.agent_catalog_public TO sandbox_app;
