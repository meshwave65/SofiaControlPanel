import { describe, expect, it } from "vitest";
import { validateActionPlan } from "./actionPlan";

const basePlan = {
  schemaVersion: 1 as const,
  objective: "Restaurar a consulta de missões.",
  expectedOutcome: "Consulta read-only funcional e auditável.",
  tasks: [{
    id: "T01",
    title: "Mapear contrato",
    description: "Identificar entradas e saídas reais.",
    dependsOn: [],
    proposedAgentId: 7,
    agentRationale: "Agente consta como elegível no snapshot.",
    estimatedCredits: null,
    creditEstimateBasis: "Não existe modelo de custo verificado.",
    acceptanceCriteria: "Contrato documentado e validado.",
    risks: ["Escopo incompleto."],
    reversibility: "Alteração documental reversível por nova versão.",
  }],
  globalRisks: ["Dependência de ambiente externo."],
  reversibility: "Plano pode ser substituído por nova versão.",
  approvalRequired: true as const,
  approvalReason: "Aprovação explícita do proprietário antes de qualquer execução.",
};

describe("structured action plan validation", () => {
  it("accepts a plan with eligible proposed agents and explicit unknown cost", () => {
    expect(validateActionPlan(basePlan, [7]).tasks[0].proposedAgentId).toBe(7);
  });

  it("rejects an agent outside the eligibility snapshot", () => {
    expect(() => validateActionPlan(basePlan, [8])).toThrow("não consta como elegível");
  });

  it("rejects invented credit estimates when no pricing model exists", () => {
    const invalid = { ...basePlan, tasks: [{ ...basePlan.tasks[0], estimatedCredits: 3 }] };
    expect(() => validateActionPlan(invalid, [7])).toThrow("modelo de custo/crédito");
  });

  it("rejects missing dependencies and duplicate task IDs", () => {
    const missingDependency = { ...basePlan, tasks: [{ ...basePlan.tasks[0], dependsOn: ["T99"] }] };
    expect(() => validateActionPlan(missingDependency, [7])).toThrow("dependência inexistente");
    const duplicate = { ...basePlan, tasks: [basePlan.tasks[0], { ...basePlan.tasks[0] }] };
    expect(() => validateActionPlan(duplicate, [7])).toThrow("duplicados");
  });
});
