import { createHash } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  missionActionUnitGateEvidence,
  missionActionUnits,
  tasks,
  taskStatuses,
} from "../drizzle/schema";
import { ActionPlanSchema } from "./actionPlan";

type DependencyRecord = {
  unitId: string;
  operationalTaskId: number | null;
  taskOwnerId: number | null;
  parentTaskId: number | null;
  taskStatus: string | null;
};

export function deriveDependencyEvidence(
  dependencies: string[],
  records: DependencyRecord[],
  missionTaskId: number,
  ownerId: number,
) {
  const byUnit = new Map(records.map((record) => [record.unitId, record]));
  const details = dependencies.map((unitId) => {
    const record = byUnit.get(unitId);
    const completed = Boolean(
      record
      && record.operationalTaskId !== null
      && record.taskOwnerId === ownerId
      && record.parentTaskId === missionTaskId
      && record.taskStatus === "DONE"
    );
    return {
      unitId,
      operationalTaskId: record?.operationalTaskId ?? null,
      taskStatus: record?.taskStatus ?? null,
      verified: completed,
      reason: !record
        ? "dependency_unit_not_registered"
        : record.operationalTaskId === null
          ? "dependency_not_materialized"
          : record.taskOwnerId !== ownerId || record.parentTaskId !== missionTaskId
            ? "dependency_task_scope_mismatch"
            : record.taskStatus !== "DONE"
              ? "dependency_task_not_done"
              : "verified",
    };
  });
  return {
    decision: details.every((item) => item.verified) ? "VERIFIED" as const : "BLOCKED" as const,
    dependencies: details,
  };
}

/**
 * Recomputes the DEPENDENCY gate from the exact current approved ACTION_PLAN.
 * Only persisted Txx links to DONE direct-child tasks count as completion.
 * This writes evidence, never authorization or operational state.
 */
export async function refreshActionUnitDependencyEvidence(input: {
  missionTaskId: number;
  ownerId: number;
  actionPlanDocumentId: number;
  actionPlanVersionId: number;
  actionPlanVersionNumber: number;
  actionPlanContentHash: string;
  unitId: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [mission] = await database.select({
    id: tasks.id,
    createdBy: tasks.createdBy,
    parentTaskId: tasks.parentTaskId,
  }).from(tasks).where(eq(tasks.id, input.missionTaskId)).limit(1);

  if (!mission || mission.parentTaskId !== null || mission.createdBy !== input.ownerId) {
    throw new Error("A avaliação de dependências exige o proprietário da missão raiz.");
  }

  const [unit] = await database.select({
    id: missionActionUnits.id,
    state: missionActionUnits.state,
    approvalUserId: missionActionUnits.approvalUserId,
    approvedAt: missionActionUnits.approvedAt,
    idempotencyKey: missionActionUnits.idempotencyKey,
    unitTitle: missionActionUnits.unitTitle,
  }).from(missionActionUnits).where(and(
    eq(missionActionUnits.missionTaskId, input.missionTaskId),
    eq(missionActionUnits.actionPlanDocumentId, input.actionPlanDocumentId),
    eq(missionActionUnits.actionPlanVersionId, input.actionPlanVersionId),
    eq(missionActionUnits.actionPlanVersionNumber, input.actionPlanVersionNumber),
    eq(missionActionUnits.actionPlanContentHash, input.actionPlanContentHash),
    eq(missionActionUnits.unitId, input.unitId),
  )).limit(1);

  if (!unit) throw new Error("A unidade Txx não está registrada na versão/hash atual do ACTION_PLAN.");

  const [planVersion] = await database.execute(sql`
    SELECT v.content, v.state, v.version, v."contentHash"
    FROM sofia."missionDocumentVersions" v
    WHERE v.id = ${input.actionPlanVersionId}
      AND v."documentId" = ${input.actionPlanDocumentId}
      AND v.version = (
        SELECT MAX(latest.version)
        FROM sofia."missionDocumentVersions" latest
        WHERE latest."documentId" = ${input.actionPlanDocumentId}
      )
    LIMIT 1
  `) as any;

  if (!planVersion
    || Number(planVersion.version) !== input.actionPlanVersionNumber
    || planVersion.state !== "APPROVED"
    || planVersion.contentHash !== input.actionPlanContentHash
    || createHash("sha256").update(planVersion.content, "utf8").digest("hex") !== input.actionPlanContentHash) {
    throw new Error("A avaliação de dependências exige a versão APPROVED, mais recente e íntegra do ACTION_PLAN.");
  }

  const parsed = ActionPlanSchema.parse(JSON.parse(planVersion.content));
  const planUnit = parsed.tasks.find((candidate) => candidate.id === input.unitId);
  if (!planUnit || planUnit.title !== unit.unitTitle) {
    throw new Error("A unidade persistida não corresponde ao conteúdo da versão atual do ACTION_PLAN.");
  }

  const dependencies = planUnit.dependsOn;
  const records = dependencies.length === 0 ? [] : await database.select({
    unitId: missionActionUnits.unitId,
    operationalTaskId: missionActionUnits.operationalTaskId,
    taskOwnerId: tasks.createdBy,
    parentTaskId: tasks.parentTaskId,
    taskStatus: taskStatuses.name,
  }).from(missionActionUnits)
    .leftJoin(tasks, eq(missionActionUnits.operationalTaskId, tasks.id))
    .leftJoin(taskStatuses, eq(tasks.statusId, taskStatuses.id))
    .where(and(
      eq(missionActionUnits.missionTaskId, input.missionTaskId),
      eq(missionActionUnits.actionPlanDocumentId, input.actionPlanDocumentId),
      eq(missionActionUnits.actionPlanVersionId, input.actionPlanVersionId),
      eq(missionActionUnits.actionPlanVersionNumber, input.actionPlanVersionNumber),
      eq(missionActionUnits.actionPlanContentHash, input.actionPlanContentHash),
      inArray(missionActionUnits.unitId, dependencies),
    ));

  const derived = deriveDependencyEvidence(dependencies, records, input.missionTaskId, input.ownerId);
  const observedAt = new Date();
  const [evidenceRow] = await database.insert(missionActionUnitGateEvidence).values({
    actionUnitId: unit.id,
    missionTaskId: input.missionTaskId,
    actionPlanDocumentId: input.actionPlanDocumentId,
    actionPlanVersionId: input.actionPlanVersionId,
    actionPlanVersionNumber: input.actionPlanVersionNumber,
    actionPlanContentHash: input.actionPlanContentHash,
    unitId: input.unitId,
    gateKey: "DEPENDENCY",
    decision: derived.decision,
    actorType: "SYSTEM",
    actorUserId: null,
    source: "action_plan_dependency_evaluator",
    sourceRef: `ACTION_PLAN:${input.actionPlanDocumentId}:v${input.actionPlanVersionNumber}:${input.actionPlanContentHash}`,
    evidence: {
      evaluatedAt: observedAt.toISOString(),
      dependencyCount: dependencies.length,
      dependencies: derived.dependencies,
      rule: "Each dependency must have an exact-version Txx registration, a persisted operational task link, same owner, direct-child relationship, and task status DONE.",
    },
    observedAt,
  }).returning({ id: missionActionUnitGateEvidence.id });

  return {
    evidenceId: evidenceRow?.id ?? null,
    decision: derived.decision,
    dependencies: derived.dependencies,
    unitApproved: ["APPROVED", "READY_FOR_DISPATCH", "DISPATCHED"].includes(unit.state)
      && unit.approvalUserId === input.ownerId
      && unit.approvedAt !== null,
    idempotencyKey: unit.idempotencyKey,
  };
}
