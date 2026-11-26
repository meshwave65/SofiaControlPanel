import postgres from "postgres";

// Sandbox já possui suas tabelas e dados. Não executar migrations nem DDL
// do SCP durante o start: apenas confirmar que a conexão aponta ao schema certo.
const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
if (!url) {
  console.error("[Database] DATABASE_URL is required before starting Sandbox");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 10 });

try {
  const result = await sql`
    SELECT to_regclass('sandbox.tasks') AS tasks_table
  `;
  if (!result[0]?.tasks_table) {
    throw new Error('Tabela sandbox.tasks não encontrada. Verifique DATABASE_URL do serviço Sandbox.');
  }
  console.log("[Database] Sandbox database connection verified: sandbox.tasks");
} catch (error) {
  console.error("[Database] Sandbox database check failed:", error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
