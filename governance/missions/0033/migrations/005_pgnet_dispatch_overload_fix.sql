-- MISSION_0033 corrective migration: explicit pg_net argument types for deterministic overload resolution.
CREATE OR REPLACE FUNCTION sandbox.dispatch_pending_session_purges()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'sandbox', 'vault', 'net'
AS $function$
DECLARE
  v_token text;
  v_session record;
  v_count integer := 0;
BEGIN
  SELECT decrypted_secret INTO v_token
    FROM vault.decrypted_secrets
   WHERE name = 'sandbox_session_purge_token'
   LIMIT 1;

  IF v_token IS NULL THEN
    RAISE WARNING 'Sandbox purge token is unavailable; pending sessions remain queued';
    RETURN 0;
  END IF;

  FOR v_session IN
    SELECT id
      FROM sandbox.sessions
     WHERE status IN ('CLOSING','EXPIRED')
       AND ("lastDispatchedAt" IS NULL OR "lastDispatchedAt" < now() - interval '1 minute')
     ORDER BY "createdAt"
     LIMIT 50
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE sandbox.sessions
       SET "lastDispatchedAt" = now(),
           "purgeAttempts" = "purgeAttempts" + 1,
           "updatedAt" = now()
     WHERE id = v_session.id;

    PERFORM net.http_post(
      url := 'https://rqvjsjfypuojuaetxkig.supabase.co/functions/v1/sandbox-session-purge'::text,
      params := '{}'::jsonb,
      body := jsonb_build_object('session_id', v_session.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Internal-Token', v_token
      ),
      timeout_milliseconds := 10000
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$function$;
