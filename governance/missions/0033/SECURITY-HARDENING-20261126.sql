-- MISSION_0033 / 2026-11-26
-- Remove implicit PUBLIC execution from Sandbox routines.
-- Preserve existing explicit grants to the internal sandbox_app role.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA sandbox FROM PUBLIC;

-- Prevent newly created functions in this schema from inheriting PUBLIC EXECUTE.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sandbox
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
