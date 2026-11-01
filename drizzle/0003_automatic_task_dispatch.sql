-- Automatically dispatch assigned STAGED tasks to the Sofia backend.
-- The URL and shared secret are stored encrypted in Supabase Vault:
--   sofia_dispatch_url
--   sofia_dispatch_secret

CREATE OR REPLACE FUNCTION sofia.notify_task_dispatch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, sofia, vault, net
AS $function$
DECLARE
  staged_status_id integer;
  dispatch_url text;
  dispatch_secret text;
BEGIN
  SELECT id
    INTO staged_status_id
    FROM sofia."taskStatuses"
   WHERE name = 'STAGED'
   LIMIT 1;

  IF staged_status_id IS NULL
     OR NEW."statusId" IS DISTINCT FROM staged_status_id
     OR NEW."agentId" IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD."statusId" IS NOT DISTINCT FROM NEW."statusId"
       AND OLD."agentId" IS NOT DISTINCT FROM NEW."agentId" THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT decrypted_secret
    INTO dispatch_url
    FROM vault.decrypted_secrets
   WHERE name = 'sofia_dispatch_url'
   LIMIT 1;

  SELECT decrypted_secret
    INTO dispatch_secret
    FROM vault.decrypted_secrets
   WHERE name = 'sofia_dispatch_secret'
   LIMIT 1;

  IF dispatch_url IS NULL OR dispatch_secret IS NULL THEN
    RAISE WARNING 'Sofia automatic dispatch skipped: required Vault secrets are missing';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := dispatch_url,
    body := jsonb_build_object('taskId', NEW.id, 'agentId', NEW."agentId"),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sofia-dispatch-secret', dispatch_secret
    ),
    timeout_milliseconds := 60000
  );

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION sofia.notify_task_dispatch() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tasks_dispatch_staged ON sofia.tasks;

CREATE TRIGGER tasks_dispatch_staged
AFTER INSERT OR UPDATE OF "statusId", "agentId"
ON sofia.tasks
FOR EACH ROW
EXECUTE FUNCTION sofia.notify_task_dispatch();
