import * as db from "./db";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");
  
  try {
    // Status de Tarefas
    console.log("Populando status de tarefas...");
    await db.getOrCreateTaskStatus("STAGED");
    await db.getOrCreateTaskStatus("PROGRESS");
    await db.getOrCreateTaskStatus("PAUSED");
    await db.getOrCreateTaskStatus("DONE");
    await db.getOrCreateTaskStatus("FAIL");
    
    // Prioridades
    console.log("Populando prioridades...");
    await db.getOrCreateTaskPriority("Baixa", 10);
    await db.getOrCreateTaskPriority("Média", 20);
    await db.getOrCreateTaskPriority("Alta", 30);
    await db.getOrCreateTaskPriority("Crítica", 40);

    // Tipos de Mensagens
    console.log("Populando tipos de mensagens...");
    await db.getOrCreateMessageType("Instruction");
    await db.getOrCreateMessageType("Report");
    await db.getOrCreateMessageType("Question");
    
    // Eventos de Atividade
    console.log("Populando tipos de eventos...");
    await db.getOrCreateActivityEventType("Creation");
    await db.getOrCreateActivityEventType("StatusChange");
    await db.getOrCreateActivityEventType("Heartbeat");
    await db.getOrCreateActivityEventType("Intervention");

    console.log("✅ Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
  }
}

seed();
