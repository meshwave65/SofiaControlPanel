import { drizzle } from "drizzle-kit/node_modules/drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema";

async function diagnose() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL não definida!");
    process.exit(1);
  }

  console.log("🔍 Verificando conexão com o banco...");
  try {
    const connection = await mysql.createConnection(url);
    console.log("✅ Conexão estabelecida com sucesso.");
    
    const [rows] = await connection.execute("SELECT COUNT(*) as count FROM users");
    console.log(`✅ Tabela 'users' acessível. Total de usuários: ${(rows as any)[0].count}`);

    const [statusRows] = await connection.execute("SELECT COUNT(*) as count FROM taskStatuses");
    console.log(`✅ Tabela 'taskStatuses' acessível. Total: ${(statusRows as any)[0].count}`);

    const [priorityRows] = await connection.execute("SELECT COUNT(*) as count FROM taskPriorities");
    console.log(`✅ Tabela 'taskPriorities' acessível. Total: ${(priorityRows as any)[0].count}`);

    const [agentRows] = await connection.execute("SELECT COUNT(*) as count FROM agents");
    console.log(`✅ Tabela 'agents' acessível. Total: ${(agentRows as any)[0].count}`);

    await connection.end();
  } catch (error) {
    console.error("❌ Erro ao acessar o banco:", error.message);
  }
}

diagnose();
