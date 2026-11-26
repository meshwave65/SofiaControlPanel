-- Retain only non-identifying purge audit metadata after successful session expunge.
ALTER TABLE sandbox.sessions ALTER COLUMN "ownerUserId" DROP NOT NULL;

ALTER TABLE sandbox.sessions
  DROP CONSTRAINT sessions_ownerUserId_fkey;

ALTER TABLE sandbox.sessions
  ADD CONSTRAINT sessions_ownerUserId_fkey
  FOREIGN KEY ("ownerUserId") REFERENCES sandbox.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.complete_sandbox_session_purge(
  p_session_id uuid,
  p_result jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox'
AS $function$
BEGIN
  UPDATE sandbox.users
     SET "activeSandboxSessionId" = NULL
   WHERE "activeSandboxSessionId" = p_session_id;

  UPDATE sandbox.sessions
     SET status = 'PURGED',
         "centralIdentityId" = NULL,
         "ownerUserId" = NULL,
         "purgedAt" = now(),
         "purgeResult" = coalesce(p_result,'{}'::jsonb),
         "lastPurgeError" = NULL,
         "purgeStartedAt" = NULL,
         "updatedAt" = now()
   WHERE id = p_session_id AND status = 'PURGING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session purge completion state mismatch';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_sandbox_session_purge(uuid,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_sandbox_session_purge(uuid,jsonb) TO service_role;
