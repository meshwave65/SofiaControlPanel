import { z } from "zod";

export const ActionPlanTaskSchema = z.object({
  id: z.string().regex(/^T[0-9]{2}$/),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(3000),
  dependsOn: z.array(z.string().regex(/^T[0-9]{2}$/)).max(40),
  proposedAgentId: z.number().int().positive().nullable(),
  agentRationale: z.string().trim().min(1).max(1000),
  estimatedCredits: z.number().nonnegative().nullable(),
  creditEstimateBasis: z.string().trim().min(1).max(1000),
  acceptanceCriteria: z.string().trim().min(1).max(2000),
  risks: z.array(z.string().trim().min(1).max(500)).max(20),
  reversibility: z.string().trim().min(1).max(1000),
}).strict();

export const ActionPlanSchema = z.object({
  schemaVersion: z.literal(1),
  objective: z.string().trim().min(1).max(5000),
  expectedOutcome: z.string().trim().min(1).max(5000),
  tasks: z.array(ActionPlanTaskSchema).min(1).max(40),
  globalRisks: z.array(z.string().trim().min(1).max(1000)).max(30),
  reversibility: z.string().trim().min(1).max(2000),
  approvalRequired: z.literal(true),
  approvalReason: z.string().trim().min(1).max(2000),
}).strict();

export type ActionPlan = z.infer<typeof ActionPlanSchema>;

export function validateActionPlan(value: unknown, eligibleAgentIds: number[]): ActionPlan {
  const plan = ActionPlanSchema.parse(value);
  const ids = new Set(plan.tasks.map((task) => task.id));
  if (ids.size !== plan.tasks.length) {
    throw new Error("Plano inválido: existem identificadores de tarefa duplicados.");
  }
  for (const task of plan.tasks) {
    if (new Set(task.dependsOn).size !== task.dependsOn.length) {
      throw new Error("Plano inválido: dependência duplicada em " + task.id + ".");
    }
    if (task.dependsOn.some((dependency) => !ids.has(dependency) || dependency === task.id)) {
      throw new Error("Plano inválido: dependência inexistente ou autorreferente em " + task.id + ".");
    }
    if (task.proposedAgentId !== null && !eligibleAgentIds.includes(task.proposedAgentId)) {
      throw new Error("Plano inválido: foi proposto um agente que não consta como elegível no snapshot consultado.");
    }
    if (task.estimatedCredits !== null) {
      throw new Error("Plano inválido: não há modelo de custo/crédito verificado para estimar consumo.");
    }
  }

  const byId = new Map(plan.tasks.map((task) => [task.id, task]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (taskId: string): void => {
    if (visiting.has(taskId)) throw new Error("Plano inválido: ciclo de dependências detectado.");
    if (visited.has(taskId)) return;
    visiting.add(taskId);
    for (const dependency of byId.get(taskId)?.dependsOn ?? []) visit(dependency);
    visiting.delete(taskId);
    visited.add(taskId);
  };
  for (const task of plan.tasks) visit(task.id);

  return plan;
}
