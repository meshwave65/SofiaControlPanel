import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "sandbox-session-artifacts";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StorageEntry = { name: string; id: string | null };

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const internalToken = req.headers.get("X-Internal-Token");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");

  if (!internalToken || !supabaseUrl || !serviceKey) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: validToken, error: tokenError } = await supabase.rpc(
    "verify_sandbox_session_purge_token",
    { p_token: internalToken },
  );
  if (tokenError || validToken !== true) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let sessionId: string;
  try {
    const payload = await req.json();
    sessionId = String(payload?.session_id ?? "");
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!UUID_RE.test(sessionId)) {
    return Response.json({ error: "invalid_session_id" }, { status: 400 });
  }

  const { data: claimed, error: claimError } = await supabase.rpc(
    "claim_sandbox_session_purge",
    { p_session_id: sessionId },
  );
  if (claimError) {
    console.error("session_purge_claim_failed", { sessionId, code: claimError.code });
    return Response.json({ error: "claim_failed" }, { status: 500 });
  }
  if (claimed !== true) {
    return Response.json({ status: "not_claimed" }, { status: 200 });
  }

  try {
    const paths: string[] = [];
    const walk = async (prefix: string): Promise<void> => {
      let offset = 0;
      while (true) {
        const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
          limit: 1000,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
        if (error) throw new Error(`storage_list_failed:${error.message}`);
        const entries = (data ?? []) as StorageEntry[];
        for (const entry of entries) {
          const path = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.id === null) {
            await walk(path);
          } else {
            paths.push(path);
          }
        }
        if (entries.length < 1000) break;
        offset += 1000;
      }
    };

    await walk(sessionId);

    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);
      const { error } = await supabase.storage.from(BUCKET).remove(batch);
      if (error) throw new Error(`storage_remove_failed:${error.message}`);
    }

    const { data: databaseResult, error: purgeError } = await supabase.rpc(
      "purge_sandbox_session_data",
      { p_session_id: sessionId },
    );
    if (purgeError) throw new Error(`database_purge_failed:${purgeError.message}`);

    const result = {
      database: databaseResult ?? {},
      storageObjectsRemoved: paths.length,
    };
    const { error: completeError } = await supabase.rpc(
      "complete_sandbox_session_purge",
      { p_session_id: sessionId, p_result: result },
    );
    if (completeError) throw new Error(`purge_completion_failed:${completeError.message}`);

    return Response.json({ status: "purged", session_id: sessionId, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_purge_error";
    await supabase.rpc("fail_sandbox_session_purge", {
      p_session_id: sessionId,
      p_error: message,
    });
    console.error("session_purge_failed", { sessionId, message });
    return Response.json({ error: "purge_failed", session_id: sessionId }, { status: 500 });
  }
});
