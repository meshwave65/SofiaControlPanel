-- Session-scoped Storage access: only the active owner session may read/write its artifacts.
CREATE OR REPLACE FUNCTION public.verify_sandbox_session_access(
  p_session_id uuid,
  p_central_identity_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox', 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
      FROM sandbox.sessions s
      JOIN sandbox.users u ON u.id = s."ownerUserId"
     WHERE s.id = p_session_id
       AND s."centralIdentityId" = p_central_identity_id
       AND u."openId" = p_central_identity_id::text
       AND s.status = 'ACTIVE'
       AND s."expiresAt" > now()
  );
$function$;

REVOKE ALL ON FUNCTION public.verify_sandbox_session_access(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_sandbox_session_access(uuid,uuid) TO service_role;
