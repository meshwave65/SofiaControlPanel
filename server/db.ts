import { eq, and, asc, desc, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, InsertAgent, users, agents, tasks, messages, activityLogs, contextReports, taskStatuses, taskPriorities, messageTypes, activityEventTypes, arcPolicies, arcAssessments, arcEvidence, arcAccessEvents, arcDeviceProfiles, arcConfidenceSnapshots } from "../drizzle/schema";
import { ENV } from './_core/env';
import { decryptCredential, encryptCredential } from './credentials';
import { evaluateArcShadow } from './arcEvaluator';
import { scoreConfidence } from './confidenceScorer';

let _db: ReturnType<typeof drizzle> | null = null;
let _dbPromise: Promise<ReturnType<typeof drizzle> | null> | null = null;

export async function getDb() {
  if (_db) return _db;
  if (_dbPromise) return _dbPromise;

  const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  if (!url) {
    console.error("[Database] DATABASE_URL is not defined in environment variables");
    return null;
  }

  _dbPromise = (async () => {
    const client = postgres(url, { max: 5, prepare: false, connect_timeout: 10 });
    try {
      await client`select 1`;
      _db = drizzle(client);
      console.log("[Database] Connection verified successfully");
      setTimeout(() => {
        import('./seed').catch(err => console.error("[Database] Seed error:", err));
      }, 1000);
      return _db;
    } catch (error) {
      console.error("[Database] Connection check failed:", error);
      await client.end({ timeout: 1 }).catch(() => undefined);
      return null;
    } finally {
      _dbPromise = null;
    }
  })();

  return _dbPromise;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database unavailable: configure DATABASE_URL before authenticating users");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    const normalizedEmail = user.email?.trim().toLowerCase();
    const isMasterAdmin = Boolean(normalizedEmail && ENV.masterAdminEmails.includes(normalizedEmail));
    if (isMasterAdmin || user.role === "admin") {
      values.role = "admin";
      updateSet.role = "admin";
    } else if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// AGENTS HELPERS
// ============================================

export async function createAgent(data: {
  ownerId: number;
  name: string;
  description?: string;
  version?: string;
  manusAccount?: string;
  manusPassword?: string;
  manusToken?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values({
    ownerId: data.ownerId,
    name: data.name,
    description: data.description,
    version: data.version,
    manusAccount: data.manusAccount,
    manusPassword: encryptCredential(data.manusPassword),
    manusToken: encryptCredential(data.manusToken),
    status: "offline",
    connectionStatus: data.manusAccount || data.manusToken ? "configured" : "not_configured",
  });

  return result;
}

function toPublicAgent(agent: any) {
  const { manusPassword, manusToken, ...safe } = agent;
  return { ...safe, hasCredential: Boolean(manusPassword || manusToken) };
}

export async function getAgentsByOwnerId(ownerId: number, canViewAll = false) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível. Verifique DATABASE_URL no Render.");
  const query = db.select().from(agents);
  const rows = canViewAll
    ? await query
    : await query.where(eq(agents.ownerId, ownerId));
  return rows.map(toPublicAgent);
}
export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? toPublicAgent(result[0]) : null;
}

export async function getAgentByIdForOwner(id: number, ownerId: number, canViewAll = false) {
  const database = await getDb();
  if (!database) return null;
  const result = await database
    .select()
    .from(agents)
    .where(canViewAll ? eq(agents.id, id) : and(eq(agents.id, id), eq(agents.ownerId, ownerId)))
    .limit(1);
  return result.length > 0 ? toPublicAgent(result[0]) : null;
}

/**
 * Internal server-only credential access. Never expose this result through an API response.
 */
export async function getManusCredentialsForAgentForOwner(id: number, ownerId: number, canViewAll = false) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [agent] = await database
    .select({
      manusAccount: agents.manusAccount,
      manusToken: agents.manusToken,
    })
    .from(agents)
    .where(canViewAll ? eq(agents.id, id) : and(eq(agents.id, id), eq(agents.ownerId, ownerId)))
    .limit(1);

  if (!agent) return null;
  if (!agent.manusToken) {
    return { manusAccount: agent.manusAccount, manusToken: null };
  }

  return {
    manusAccount: agent.manusAccount,
    manusToken: decryptCredential(agent.manusToken),
  };
}

/** Internal server-only credential access for the execution worker. */
export async function getManusCredentialsForAgent(id: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [agent] = await database
    .select({ manusAccount: agents.manusAccount, manusToken: agents.manusToken })
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);

  if (!agent) return null;
  return {
    manusAccount: agent.manusAccount,
    manusToken: agent.manusToken ? decryptCredential(agent.manusToken) : null,
  };
}
export async function updateAgentStatus(id: number, status: "online" | "offline" | "idle" | "paused") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(agents).set({ status, updatedAt: new Date() }).where(eq(agents.id, id));
}

export async function updateAgentHeartbeat(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(agents).set({ lastHeartbeat: new Date(), updatedAt: new Date() }).where(eq(agents.id, id));
}

export async function updateAgentCredits(id: number, creditsRemaining: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(agents).set({
    creditsRemaining: String(Math.max(0, creditsRemaining)),
    creditsUpdatedAt: new Date(),
    connectionStatus: "connected",
    connectionError: null,
    updatedAt: new Date(),
  }).where(eq(agents.id, id));
}

/**
 * Records a failed balance refresh without changing the last known balance
 * or its successful-update timestamp.
 */
export async function recordAgentCreditSyncError(id: number, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(agents).set({
    connectionError: message,
    updatedAt: new Date(),
  }).where(eq(agents.id, id));
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.manusPassword) updateData.manusPassword = encryptCredential(data.manusPassword);
  else delete updateData.manusPassword;
  if (data.manusToken) updateData.manusToken = encryptCredential(data.manusToken);
  else delete updateData.manusToken;
  if (data.manusAccount || data.manusToken) updateData.connectionStatus = "configured";
  return db.update(agents).set(updateData as any).where(eq(agents.id, id));
}
export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(agents).where(eq(agents.id, id));
}

// ============================================
// TASKS HELPERS
// ============================================

export async function createTask(data: {
  agentId?: number;
  agentPinned?: boolean;
  createdBy: number;
  creatorType?: "user" | "system";
  title: string;
  description?: string;
  statusId: number;
  priorityId: number;
  parentTaskId?: number;
  dueDate?: Date;
  completedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values({
    ...data,
    creatorType: data.creatorType ?? "user",
    agentPinned: data.agentPinned ?? data.agentId !== undefined,
  }).returning({ id: tasks.id });

  const taskId = result[0]?.id;
  if (taskId) {
    await db.update(tasks).set({
      missionKey: `SCP-TASK-${String(taskId).padStart(6, "0")}`,
      githubSyncStatus: "pending",
      updatedAt: new Date(),
    }).where(eq(tasks.id, taskId));
  }
  return result;
}

export async function updateTaskGitHubSync(
  taskId: number,
  data: {
    missionKey: string;
    githubPath: string;
    githubSha?: string;
    githubSyncStatus: string;
    githubSyncError?: string | null;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set({
    ...data,
    githubSyncedAt: data.githubSyncStatus === "synced" ? new Date() : undefined,
    updatedAt: new Date(),
  }).where(eq(tasks.id, taskId));
}

export async function getTasksByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(eq(tasks.agentId, agentId));
}

export async function getTasksByAgentIdForOwner(agentId: number, ownerId: number, canViewAll = false) {
  const agent = await getAgentByIdForOwner(agentId, ownerId, canViewAll);
  if (!agent) return [];
  return getTasksByAgentId(agentId);
}

export async function getTasksByParentId(parentTaskId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(eq(tasks.parentTaskId, parentTaskId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByStatus(statusId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(eq(tasks.statusId, statusId));
}

/**
 * Retorna somente as missões pendentes atribuídas ao agente solicitante.
 * O agente externo consome esta fila e inicia o processamento em seu próprio runtime.
 */
export async function getStagedTasksByAgentId(agentId: number, statusId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(
    and(eq(tasks.agentId, agentId), eq(tasks.statusId, statusId))
  ).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function evaluateTaskInShadow(taskId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const task = await getTaskById(taskId);
  if (!task) return null;
  const policyRows = await database.select().from(arcPolicies).where(eq(arcPolicies.enabled, true)).orderBy(desc(arcPolicies.createdAt)).limit(1);
  const policy = policyRows[0];
  if (!policy) throw new Error("Nenhuma política ARC habilitada");
  const agent = task.agentId ? await getAgentById(task.agentId) : null;
  const agentTasks = task.agentId ? await getTasksByAgentId(task.agentId) : [];
  const activity = task.agentId ? await getActivityLogsByAgentId(task.agentId) : [];
  const completedTasks = agentTasks.filter((item) => item.completedAt !== null).length;
  const observedAt = new Date();
  const heartbeatRecent = Boolean(agent?.lastHeartbeat && observedAt.getTime() - agent.lastHeartbeat.getTime() >= 0 && observedAt.getTime() - agent.lastHeartbeat.getTime() <= 5 * 60 * 1000);
  const assignmentMatch = Boolean(agent && task.agentId === agent.id);
  const profile = agent
    ? (await database.select().from(arcDeviceProfiles).where(eq(arcDeviceProfiles.agentId, agent.id)).limit(1))[0]
    : undefined;
  const confidence = scoreConfidence({
    profileKnown: Boolean(profile?.known),
    heartbeatRecent,
    agentOnline: agent?.status === "online",
    assignmentMatch,
    successRate: agentTasks.length > 0 ? completedTasks / agentTasks.length : 0,
    activityEvents: activity.length,
    connectionStatus: agent?.connectionStatus ?? null,
  });
  const assessment = evaluateArcShadow({
    taskId,
    taskAgentId: task.agentId,
    agent: agent ? { id: agent.id, status: agent.status, lastHeartbeat: agent.lastHeartbeat } : null,
    completedTasks,
    observedTasks: agentTasks.length,
    activityEvents: activity.length,
  }, {
    prior: Number(policy.prior),
    allowThreshold: Number(policy.allowThreshold),
    reviewThreshold: Number(policy.reviewThreshold),
  });
  const created = await createArcAssessment({
    taskId: assessment.taskId,
    agentId: assessment.agentId,
    policyId: policy.id,
    prior: assessment.prior.toFixed(6),
    posterior: assessment.posterior.toFixed(6),
    decision: assessment.decision,
    mode: assessment.mode,
    explanation: assessment.explanation,
    evidence: assessment.evidence.map((item) => ({
      ...item,
      value: item.value.toFixed(6),
      reliability: item.reliability.toFixed(6),
      likelihoodRatio: item.likelihoodRatio.toFixed(6),
    })),
  });
  const [event] = await database.insert(arcAccessEvents).values({
    userId: task.createdBy,
    agentId: agent?.id ?? null,
    taskId: task.id,
    source: "task_detail",
    observedAt,
    agentStatus: agent?.status ?? null,
    agentVersion: agent?.version ?? null,
    connectionStatus: agent?.connectionStatus ?? null,
    heartbeatRecent,
    activityCount: activity.length,
    completedTasks,
    observedTasks: agentTasks.length,
    metadata: { anomalies: confidence.anomalies },
  }).returning({ id: arcAccessEvents.id });
  if (agent?.id) {
    if (profile) {
      await database.update(arcDeviceProfiles).set({
        known: true,
        lastSeenAt: observedAt,
        observationCount: sql`${arcDeviceProfiles.observationCount} + 1`,
        lastVersion: agent.version,
        lastConnectionStatus: agent.connectionStatus,
        updatedAt: observedAt,
      }).where(eq(arcDeviceProfiles.id, profile.id));
    } else {
      await database.insert(arcDeviceProfiles).values({
        ownerId: task.createdBy,
        agentId: agent.id,
        known: false,
        firstSeenAt: observedAt,
        lastSeenAt: observedAt,
        observationCount: 1,
        lastVersion: agent.version,
        lastConnectionStatus: agent.connectionStatus,
        createdAt: observedAt,
        updatedAt: observedAt,
      });
    }
  }
  await database.insert(arcConfidenceSnapshots).values({
    userId: task.createdBy,
    agentId: agent?.id ?? null,
    taskId: task.id,
    assessmentId: created.id,
    accessEventId: event?.id ?? null,
    score: confidence.score.toFixed(2),
    posterior: assessment.posterior.toFixed(6),
    decision: assessment.decision,
    anomalyCount: confidence.anomalyCount,
    trigger: "assessment",
    signals: confidence.signals,
    observedAt,
  });
  return created;
}

/**
 * Materializa o primeiro relatório ARC da tarefa sem duplicá-lo em cada
 * abertura do painel. Reavaliações posteriores continuam explícitas.
 */
export async function ensureArcAssessment(taskId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const existing = await database
    .select({ id: arcAssessments.id })
    .from(arcAssessments)
    .where(eq(arcAssessments.taskId, taskId))
    .orderBy(desc(arcAssessments.createdAt))
    .limit(1);

  if (existing.length > 0) {
    return getArcAssessmentByTask(taskId, 0, true);
  }

  return evaluateTaskInShadow(taskId);
}

export async function updateTaskStatus(id: number, statusId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(tasks).set({ statusId, updatedAt: new Date() }).where(eq(tasks.id, id));
}

/**
 * Atomically claims a STAGED task and reserves one eligible agent.
 * Explicitly selected agents are pinned; automatic assignments may be changed.
 */
export async function claimStagedTaskWithAvailableAgent(
  taskId: number,
  stagedStatusId: number,
  progressStatusId: number,
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    const [task] = await tx.execute(sql`
      SELECT id, "createdBy", "agentId", "agentPinned"
      FROM sofia.tasks
      WHERE id = ${taskId} AND "statusId" = ${stagedStatusId}
      FOR UPDATE
    `) as any;
    if (!task) return null;

    if (task.agentId && task.agentPinned) {
      const [pinned] = await tx.execute(sql`
        SELECT a.id
        FROM sofia.agents a
        WHERE a.id = ${task.agentId}
          AND a."ownerId" = ${task.createdBy}
          AND a.status = 'online'
          AND a."connectionStatus" IN ('configured', 'connected')
          AND a."manusToken" IS NOT NULL
          AND a."creditsRemaining" IS NOT NULL
          AND a."creditsRemaining"::numeric > 0
          AND a."creditsUpdatedAt" >= NOW() - INTERVAL '60 seconds'
          AND NOT EXISTS (
            SELECT 1
            FROM sofia.tasks active_task
            JOIN sofia."taskStatuses" active_status ON active_status.id = active_task."statusId"
            WHERE active_task."agentId" = a.id
              AND active_task.id <> ${taskId}
              AND active_status.name = 'PROGRESS'
          )
        FOR UPDATE OF a
      `) as any;
      if (!pinned) return null;
      const [claimed] = await tx.execute(sql`
        UPDATE sofia.tasks
        SET "statusId" = ${progressStatusId}, "updatedAt" = NOW()
        WHERE id = ${taskId} AND "statusId" = ${stagedStatusId}
        RETURNING *
      `) as any;
      return claimed ?? null;
    }

    const [candidate] = await tx.execute(sql`
      SELECT a.id
      FROM sofia.agents a
      WHERE a."ownerId" = ${task.createdBy}
        AND a.status = 'online'
        AND a."connectionStatus" IN ('configured', 'connected')
        AND a."manusToken" IS NOT NULL
        AND a."creditsRemaining" IS NOT NULL
          AND a."creditsRemaining"::numeric > 0
          AND a."creditsUpdatedAt" >= NOW() - INTERVAL '60 seconds'
        AND NOT EXISTS (
          SELECT 1
          FROM sofia.tasks active_task
          JOIN sofia."taskStatuses" active_status ON active_status.id = active_task."statusId"
          WHERE active_task."agentId" = a.id
            AND active_task.id <> ${taskId}
            AND active_status.name = 'PROGRESS'
        )
      ORDER BY a."creditsRemaining"::numeric DESC, a."creditsUpdatedAt" ASC NULLS FIRST, a.id
      FOR UPDATE OF a SKIP LOCKED
      LIMIT 1
    `) as any;
    if (!candidate) return null;

    const [claimed] = await tx.execute(sql`
      UPDATE sofia.tasks
      SET "agentId" = ${Number(candidate.id)},
          "statusId" = ${progressStatusId},
          "updatedAt" = NOW()
      WHERE id = ${taskId} AND "statusId" = ${stagedStatusId} AND "agentPinned" = false
      RETURNING *
    `) as any;
    return claimed ?? null;
  });
}

/** Atomically reserves a STAGED task by moving it to PROGRESS. Only one caller can win. */
export async function claimStagedTask(id: number, stagedStatusId: number, progressStatusId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [claimed] = await database
    .update(tasks)
    .set({ statusId: progressStatusId, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.statusId, stagedStatusId)))
    .returning();

  return claimed ?? null;
}

export async function updateTaskExecution(id: number, data: {
  manusTaskId?: string;
  manusStatus?: string;
  creditsUsed?: number | null;
  completedAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(tasks).set({ ...data, lastSyncedAt: new Date(), updatedAt: new Date() }).where(eq(tasks.id, id));
}

export async function reassignTaskAgent(id: number, agentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set({ agentId, agentPinned: false, updatedAt: new Date() }).where(eq(tasks.id, id));
}

// ============================================
// ARC / PGC HELPERS
// ============================================

type ArcEvidenceInput = {
  key: string;
  value: string;
  reliability: string;
  likelihoodRatio: string;
  source: string;
  observedAt: Date;
  metadata?: Record<string, string | number | boolean>;
};

type ArcAssessmentInput = {
  taskId: number;
  agentId?: number | null;
  policyId: number;
  prior: string;
  posterior: string;
  decision: string;
  mode: string;
  explanation: string;
  evidence: ArcEvidenceInput[];
};

async function canAccessTask(taskId: number, ownerId: number, isAdmin: boolean) {
  const database = await getDb();
  if (!database) return false;
  if (isAdmin) {
    const result = await database.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, taskId)).limit(1);
    return result.length > 0;
  }
  const result = await database
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.createdBy, ownerId)))
    .limit(1);
  return result.length > 0;
}

export async function createArcAssessment(data: ArcAssessmentInput) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    const [assessment] = await tx.insert(arcAssessments).values({
      taskId: data.taskId,
      agentId: data.agentId ?? null,
      policyId: data.policyId,
      prior: data.prior,
      posterior: data.posterior,
      decision: data.decision,
      mode: data.mode,
      explanation: data.explanation,
    }).returning();

    if (!assessment) throw new Error("Failed to create ARC assessment");

    if (data.evidence.length > 0) {
      await tx.insert(arcEvidence).values(data.evidence.map((item) => ({
        assessmentId: assessment.id,
        key: item.key,
        value: item.value,
        reliability: item.reliability,
        likelihoodRatio: item.likelihoodRatio,
        source: item.source,
        observedAt: item.observedAt,
        metadata: item.metadata,
      })));
    }

    return assessment;
  });
}

export async function getArcAssessmentByTask(taskId: number, ownerId: number, isAdmin: boolean) {
  if (!(await canAccessTask(taskId, ownerId, isAdmin))) return null;
  const database = await getDb();
  if (!database) return null;
  const assessments = await database
    .select()
    .from(arcAssessments)
    .where(eq(arcAssessments.taskId, taskId))
    .orderBy(desc(arcAssessments.createdAt));
  if (assessments.length === 0) return null;
  const evidence = await database
    .select()
    .from(arcEvidence)
    .where(eq(arcEvidence.assessmentId, assessments[0].id));
  return { ...assessments[0], evidence };
}

export async function listArcAssessmentsByTask(taskId: number, ownerId: number, isAdmin: boolean, limit: number) {
  if (!(await canAccessTask(taskId, ownerId, isAdmin))) return [];
  const database = await getDb();
  if (!database) return [];
  const assessments = await database
    .select()
    .from(arcAssessments)
    .where(eq(arcAssessments.taskId, taskId))
    .orderBy(desc(arcAssessments.createdAt))
    .limit(limit);
  if (assessments.length === 0) return [];
  const result = [];
  for (const assessment of assessments) {
    const evidence = await database
      .select()
      .from(arcEvidence)
      .where(eq(arcEvidence.assessmentId, assessment.id));
    result.push({ ...assessment, evidence });
  }
  return result;
}

export async function listArcConfidenceSnapshotsByTask(taskId: number, ownerId: number, isAdmin: boolean, limit: number) {
  if (!(await canAccessTask(taskId, ownerId, isAdmin))) return [];
  const database = await getDb();
  if (!database) return [];
  return database.select().from(arcConfidenceSnapshots)
    .where(eq(arcConfidenceSnapshots.taskId, taskId))
    .orderBy(desc(arcConfidenceSnapshots.observedAt))
    .limit(limit);
}

// ============================================
// MESSAGES HELPERS
// ============================================

export async function createMessage(data: { taskId: number; senderId: number; parentMessageId?: number; typeId: number; content: string; isAssistant?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

export async function getMessageTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [messageType] = await db.select().from(messageTypes).where(eq(messageTypes.id, id)).limit(1);
  return messageType ?? null;
}
export async function getMessageByIdForTask(id: number, taskId: number) {
  const db = await getDb();
  if (!db) return null;
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, id), eq(messages.taskId, taskId)))
    .limit(1);
  return message ?? null;
}
export async function getMessagesByTaskId(taskId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  if (limit !== undefined) {
    const recent = await db
      .select()
      .from(messages)
      .where(eq(messages.taskId, taskId))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(limit);
    return recent.reverse();
  }
  return db
    .select()
    .from(messages)
    .where(eq(messages.taskId, taskId))
    .orderBy(asc(messages.createdAt), asc(messages.id));
}

export async function getMessagesByParentId(parentMessageId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(messages).where(eq(messages.parentMessageId, parentMessageId)).orderBy(desc(messages.createdAt));
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
}

// ============================================
// ACTIVITY LOGS HELPERS
// ============================================

export async function createActivityLog(data: { agentId?: number | null; taskId?: number; eventTypeId: number; details?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(activityLogs).values(data);
}

export async function getActivityLogsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(activityLogs).where(eq(activityLogs.agentId, agentId)).orderBy(desc(activityLogs.createdAt));
}

export async function getActivityLogsByAgentIdForOwner(agentId: number, ownerId: number, canViewAll = false) {
  const agent = await getAgentByIdForOwner(agentId, ownerId, canViewAll);
  if (!agent) return [];
  return getActivityLogsByAgentId(agentId);
}

export async function getRecentActivityLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

export async function getAllTasks(ownerId: number, canViewAll = false) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível. Verifique DATABASE_URL no Render.");

  const query = db
    .select({
      id: tasks.id,
      agentId: tasks.agentId,
      agentPinned: tasks.agentPinned,
      createdBy: tasks.createdBy,
      creatorType: tasks.creatorType,
      missionKey: tasks.missionKey,
      githubPath: tasks.githubPath,
      githubSha: tasks.githubSha,
      githubSyncStatus: tasks.githubSyncStatus,
      githubSyncError: tasks.githubSyncError,
      githubSyncedAt: tasks.githubSyncedAt,
      title: tasks.title,
      description: tasks.description,
      statusId: tasks.statusId,
      priorityId: tasks.priorityId,
      parentTaskId: tasks.parentTaskId,
      dueDate: tasks.dueDate,
      manusTaskId: tasks.manusTaskId,
      manusStatus: tasks.manusStatus,
      creditsUsed: tasks.creditsUsed,
      lastSyncedAt: tasks.lastSyncedAt,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.createdBy, users.id));
  const rows = canViewAll
    ? await query.orderBy(desc(tasks.createdAt))
    : await query.where(eq(tasks.createdBy, ownerId)).orderBy(desc(tasks.createdAt));

  return rows.map((task) => ({
    ...task,
    creatorLabel: task.creatorType === "system"
      ? "Sistema"
      : task.creatorName || task.creatorEmail || `Usuário #${task.createdBy}`,
  }));
}

// ============================================
// CONTEXT REPORTS HELPERS
// ============================================

export async function createContextReport(data: { ownerId: number; title: string; content: string; creditsUsed?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(contextReports).values(data);
}

export async function getRecentContextReports(ownerId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(contextReports).where(eq(contextReports.ownerId, ownerId)).orderBy(desc(contextReports.createdAt)).limit(limit);
}

export async function updateContextReportGitHub(id: number, gitHubUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(contextReports).set({ gitHubUrl }).where(eq(contextReports.id, id));
}

// ============================================
// LOOKUP TABLES HELPERS
// ============================================

export async function getOrCreateTaskStatus(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(taskStatuses).where(eq(taskStatuses.name, name)).limit(1);
  if (existing.length > 0) return existing[0];

  const result = await db.insert(taskStatuses).values({ name }).returning({ id: taskStatuses.id });
  return { id: result[0].id, name };
}

export async function getOrCreateTaskPriority(name: string, level: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(taskPriorities).where(eq(taskPriorities.name, name)).limit(1);
  if (existing.length > 0) return existing[0];

  const result = await db.insert(taskPriorities).values({ name, level }).returning({ id: taskPriorities.id });
  return { id: result[0].id, name, level };
}

export async function getOrCreateMessageType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(messageTypes).where(eq(messageTypes.name, name)).limit(1);
  if (existing.length > 0) return existing[0];

  const result = await db.insert(messageTypes).values({ name }).returning({ id: messageTypes.id });
  return { id: result[0].id, name };
}

export async function getOrCreateActivityEventType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(activityEventTypes).where(eq(activityEventTypes.name, name)).limit(1);
  if (existing.length > 0) return existing[0];

  const result = await db.insert(activityEventTypes).values({ name }).returning({ id: activityEventTypes.id });
  return { id: result[0].id, name };
}

// ============================================
// BATCH HELPERS
// ============================================

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function getAllAgentsGlobal() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents);
}

export async function getAllTasksAdmin() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getAllTasksGlobal() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getDashboardStats(ownerId: number) {
  const db = await getDb();
  if (!db) return { totalAgents: 0, onlineAgents: 0, totalTasks: 0, pendingTasks: 0, unreadMessages: 0 };

  const allAgents = await db.select().from(agents).where(eq(agents.ownerId, ownerId));
  const allTasks = await db.select().from(tasks).where(eq(tasks.createdBy, ownerId));
  const [doneStatus] = await db.select({ id: taskStatuses.id }).from(taskStatuses).where(eq(taskStatuses.name, "DONE")).limit(1);

  // Unread messages are messages sent TO the owner (senderId != ownerId) that are not read
  const unreadMessages = await db.select().from(messages).where(and(eq(messages.isRead, false)));

  // Um agente é considerado online se o heartbeat foi nos últimos 5 minutos
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineAgents = allAgents.filter(a => (a.lastHeartbeat && a.lastHeartbeat > fiveMinutesAgo) || a.status === "online").length;

  return {
    totalAgents: allAgents.length,
    onlineAgents,
    totalTasks: allTasks.length,
    pendingTasks: allTasks.filter(t => t.statusId !== doneStatus?.id).length,
    unreadMessages: unreadMessages.length,
  };
}

export async function getLookups() {
  const db = await getDb();
  if (!db) return { statuses: [], priorities: [], messageTypes: [], eventTypes: [] };

  // Ensure the mission form's required lookup values exist even when the
  // background seed has not run yet (or the lookup tables were initially empty).
  // Unique constraints plus onConflictDoNothing make this safe to repeat.
  await Promise.all([
    db.insert(taskStatuses).values([
      { name: "STAGED" },
      { name: "PROGRESS" },
      { name: "PAUSED" },
      { name: "DONE" },
      { name: "FAIL" },
    ]).onConflictDoNothing({ target: taskStatuses.name }),
    db.insert(taskPriorities).values([
      { name: "Baixa", level: 10 },
      { name: "Média", level: 20 },
      { name: "Alta", level: 30 },
      { name: "Crítica", level: 40 },
    ]).onConflictDoNothing({ target: taskPriorities.name }),
  ]);

  const [statuses, priorities, mTypes, eTypes] = await Promise.all([
    db.select().from(taskStatuses),
    db.select().from(taskPriorities),
    db.select().from(messageTypes),
    db.select().from(activityEventTypes),
  ]);

  return { statuses, priorities, messageTypes: mTypes, eventTypes: eTypes };
}

export async function getTaskStatusIdByName(name: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [status] = await db
    .select({ id: taskStatuses.id })
    .from(taskStatuses)
    .where(eq(taskStatuses.name, name))
    .limit(1);

  if (!status) throw new Error(`Task status \"${name}\" is not configured`);
  return status.id;
}

// ============================================
// SCHEDULED TASKS HELPERS
// ============================================

export async function createScheduledTask(data: { agentId: number; taskId: number; nextRun: Date; frequency?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Note: scheduledTasks table não foi criada no schema
  // Esta é uma função placeholder para evitar erros de compilação
  console.log("[DB] createScheduledTask called but table not implemented:", data);
  return { success: false };
}

export async function getActiveScheduledTasks() {
  const db = await getDb();
  if (!db) return [];

  // Note: scheduledTasks table não foi criada no schema
  // Esta é uma função placeholder para evitar erros de compilação
  return [];
}

export async function updateScheduledTaskNextRun(id: number, nextRun: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Note: scheduledTasks table não foi criada no schema
  // Esta é uma função placeholder para evitar erros de compilação
  console.log("[DB] updateScheduledTaskNextRun called but table not implemented:", { id, nextRun });
  return { success: false };
}
