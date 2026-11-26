import { sql } from "drizzle-orm";
import { getDb } from "./db";

type QueryRow = { sessionId?: string; session_id?: string };

export async function ensureSandboxSession(
  ownerUserId: number,
  centralIdentityId: string,
): Promise<string> {
  const database = await getDb();
  if (!database) throw new Error("Sandbox database is unavailable");

  const result = await database.execute(sql`
    SELECT sandbox.ensure_active_session(
      ${ownerUserId},
      ${centralIdentityId}::uuid
    ) AS "sessionId"
  `);
  const rows = result as unknown as QueryRow[];
  const sessionId = rows[0]?.sessionId ?? rows[0]?.session_id;
  if (!sessionId) throw new Error("Sandbox session could not be created or resolved");
  return sessionId;
}

export async function closeSandboxSession(
  sessionId: string,
  ownerUserId: number,
): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Sandbox database is unavailable");

  await database.execute(sql`
    SELECT sandbox.close_session(
      ${sessionId}::uuid,
      ${ownerUserId}
    )
  `);
}
