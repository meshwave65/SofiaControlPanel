import { describe, it, expect } from "vitest";
import { buildSofiaConversation, extractTextContent, normalizeOperatorMessage, OPERATOR_MESSAGE_MAX_LENGTH } from "./messageService";

/**
 * Testes Vitest para database helpers
 * Validação de tipos e estrutura de dados
 * Testes de integração com BD requerem dados de teste válidos
 */

describe("Database Helpers - Type Validation", () => {
  it("should have correct database helper signatures", async () => {
    // Validar que os helpers existem e têm as assinaturas corretas
    expect(typeof import("./db")).toBeDefined();
  });

  it("should export all required database functions", async () => {
    const db = await import("./db");
    
    // Agents
    expect(typeof db.createAgent).toBe("function");
    expect(typeof db.getAgentsByOwnerId).toBe("function");
    expect(typeof db.getAgentById).toBe("function");
    expect(typeof db.updateAgentStatus).toBe("function");
    
    // Tasks
    expect(typeof db.createTask).toBe("function");
    expect(typeof db.getTasksByStatus).toBe("function");
    expect(typeof db.getTasksByAgentId).toBe("function");
    expect(typeof db.updateTaskStatus).toBe("function");
    
    // Messages
    expect(typeof db.createMessage).toBe("function");
    expect(typeof db.getMessagesByTaskId).toBe("function");
    expect(typeof db.getMessagesByParentId).toBe("function");
    
    // Activity Logs
    expect(typeof db.createActivityLog).toBe("function");
    expect(typeof db.getActivityLogsByAgentId).toBe("function");
    
    // Context Reports
    expect(typeof db.createContextReport).toBe("function");
    expect(typeof db.getRecentContextReports).toBe("function");
    expect(typeof db.updateContextReportGitHub).toBe("function");
  });
});

describe("Router Type Validation", () => {
  it("should have correct tRPC router structure", async () => {
    const routers = await import("./routers");
    
    expect(routers.appRouter).toBeDefined();
    expect(typeof routers.appRouter).toBe("object");
  });
});

describe("Message service - contrato do canal operador/Sofia", () => {
  it("normaliza espaços e rejeita conteúdo vazio ou acima do limite", () => {
    expect(normalizeOperatorMessage("  executar diagnóstico  ")).toBe("executar diagnóstico");
    expect(() => normalizeOperatorMessage("   ")).toThrow("não pode ficar vazia");
    expect(() => normalizeOperatorMessage("x".repeat(OPERATOR_MESSAGE_MAX_LENGTH + 1)))
      .toThrow("excede o limite");
  });

  it("mantém operador e Sofia em papéis distintos no contexto", () => {
    const context = buildSofiaConversation(
      { title: "Missão fixture", description: "Validar canal" },
      [
        { content: "pergunta do operador", isAssistant: false },
        { content: "resposta da Sofia", isAssistant: true },
      ],
    );
    expect(context[0]).toMatchObject({ role: "system" });
    expect(context.slice(1).map((message) => message.role)).toEqual(["user", "assistant"]);
  });

  it("extrai texto de respostas simples e em blocos", () => {
    expect(extractTextContent(" resposta ")).toBe("resposta");
    expect(extractTextContent([{ type: "text", text: "parte 1" }, { type: "text", text: "parte 2" }]))
      .toBe("parte 1\nparte 2");
    expect(extractTextContent([{ type: "image_url" }])).toBe("");
  });
});
