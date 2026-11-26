DO $$
DECLARE
  user_one integer;
  user_two integer;
  session_one uuid;
  session_two uuid;
  agent_one integer;
  agent_two integer;
  catalog_agent integer;
  purge_result jsonb;
  token_ok boolean;
BEGIN
  INSERT INTO sandbox.users ("openId",name,role,"createdAt","updatedAt","lastSignedIn")
  VALUES ('test-central-identity-001','CI Sandbox User One','user',now(),now(),now())
  RETURNING id INTO user_one;

  INSERT INTO sandbox.users ("openId",name,role,"createdAt","updatedAt","lastSignedIn")
  VALUES ('test-central-identity-002','CI Sandbox User Two','user',now(),now(),now())
  RETURNING id INTO user_two;

  session_one := sandbox.ensure_active_session(user_one,'00000000-0000-4000-8000-000000000001'::uuid);
  session_two := sandbox.ensure_active_session(user_two,'00000000-0000-4000-8000-000000000002'::uuid);

  INSERT INTO sandbox.agents ("ownerId",name,status,"connectionStatus","createdAt","updatedAt")
  VALUES (user_one,'session-agent-one','idle','disconnected',now(),now())
  RETURNING id INTO agent_one;

  INSERT INTO sandbox.agents ("ownerId",name,status,"connectionStatus","agentOrigin","createdAt","updatedAt")
  VALUES (user_one,'catalog-agent-one','idle','disconnected','SCP_CATALOG',now(),now())
  RETURNING id INTO catalog_agent;

  INSERT INTO sandbox.agents ("ownerId",name,status,"connectionStatus","createdAt","updatedAt")
  VALUES (user_two,'session-agent-two','idle','disconnected',now(),now())
  RETURNING id INTO agent_two;

  IF (SELECT "sandboxSessionId" FROM sandbox.agents WHERE id=agent_one) IS DISTINCT FROM session_one THEN
    RAISE EXCEPTION 'Agent one was not bound to its owner session';
  END IF;
  IF (SELECT "sandboxSessionId" FROM sandbox.agents WHERE id=catalog_agent) IS NOT NULL THEN
    RAISE EXCEPTION 'Catalog agent must not belong to an experimental session';
  END IF;

  SELECT public.verify_sandbox_session_purge_token(repeat('ab',32)) INTO token_ok;
  IF token_ok IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Vault internal token verification failed';
  END IF;

  PERFORM sandbox.close_session(session_one,user_one);
  IF (SELECT status FROM sandbox.sessions WHERE id=session_one) <> 'CLOSING' THEN
    RAISE EXCEPTION 'Manual close did not move session to CLOSING';
  END IF;

  IF public.claim_sandbox_session_purge(session_one) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Manual purge could not claim session';
  END IF;
  purge_result := public.purge_sandbox_session_data(session_one);
  PERFORM public.complete_sandbox_session_purge(session_one,purge_result);

  IF EXISTS (SELECT 1 FROM sandbox.agents WHERE id=agent_one) THEN
    RAISE EXCEPTION 'Session agent survived manual purge';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM sandbox.agents WHERE id=catalog_agent AND "agentOrigin"='SCP_CATALOG') THEN
    RAISE EXCEPTION 'Shared catalog agent was incorrectly purged';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM sandbox.agents WHERE id=agent_two) THEN
    RAISE EXCEPTION 'Another user session was affected by purge';
  END IF;
  IF (SELECT status FROM sandbox.sessions WHERE id=session_one) <> 'PURGED' THEN
    RAISE EXCEPTION 'Manual session was not marked PURGED';
  END IF;
  IF (SELECT "activeSandboxSessionId" FROM sandbox.users WHERE id=user_one) IS NOT NULL THEN
    RAISE EXCEPTION 'Purged session remains active on user projection';
  END IF;

  UPDATE sandbox.sessions
     SET "startedAt" = now() - interval '30 hours',
         "expiresAt" = now() - interval '7 hours'
   WHERE id=session_two;

  PERFORM sandbox.run_session_maintenance();
  IF (SELECT status FROM sandbox.sessions WHERE id=session_two) <> 'EXPIRED' THEN
    RAISE EXCEPTION 'TTL maintenance did not expire the session';
  END IF;

  IF public.claim_sandbox_session_purge(session_two) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Expired session could not be claimed for purge';
  END IF;
  purge_result := public.purge_sandbox_session_data(session_two);
  PERFORM public.complete_sandbox_session_purge(session_two,purge_result);

  IF EXISTS (SELECT 1 FROM sandbox.agents WHERE id=agent_two) THEN
    RAISE EXCEPTION 'Session agent survived TTL purge';
  END IF;
  IF (SELECT status FROM sandbox.sessions WHERE id=session_two) <> 'PURGED' THEN
    RAISE EXCEPTION 'Expired session was not marked PURGED';
  END IF;

  -- Remove only synthetic CI fixtures after assertions.
  DELETE FROM sandbox.agents WHERE id=catalog_agent;
  DELETE FROM sandbox.sessions WHERE id IN (session_one,session_two);
  DELETE FROM sandbox.users WHERE id IN (user_one,user_two);
END;
$$;
