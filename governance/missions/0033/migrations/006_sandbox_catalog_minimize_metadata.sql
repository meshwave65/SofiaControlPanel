-- Exclude free-form descriptions from the Sandbox catalog: source descriptions may contain emails/account labels.
DROP VIEW sandbox.agent_catalog_public;

CREATE VIEW sandbox.agent_catalog_public WITH (security_invoker = true) AS
SELECT
  a."sourceAgentId" AS id,
  a.name,
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
