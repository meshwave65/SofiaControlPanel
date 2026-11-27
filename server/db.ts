import { createHash, randomUUID } from "node:crypto";
import { eq, and, asc, desc, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, InsertAgent, users, agents, tasks, messages, activityLogs, contextReports, taskStatuses, taskPriorities, messageTypes, activityEventTypes, arcPolicies, arcAssessments, arcEvidence, arcAccessEvents, arcDeviceProfiles, arcConfidenceSnapshots, missionDocumentTypes, missionDocuments, missionDocumentVersions, missionActionUnits } from "../drizzle/schema";
import { ENV } from './_core/env';
import { decryptCredential, encryptCredential } from './credentials';
import { evaluateArcShadow } from './arcEvaluator';
import { scoreConfidence } from './confidenceScorer';
import { ActionPlanSchema } from "./actionPlan";

let _db: ReturnType<typeof drizzle> | null = null;
let _dbPromise: Promise<ReturnType<typeof drizzle> | null> | null = null;
let _centralSCPClient: ReturnType<typeof postgres> | null = null;

async function getCentralSCPClient() {
  if (_centralSCPClient) return _centralSCPClient;
  const url = process.env.CENTRAL_SCP_DATABASE_URL;
  if (!url) throw new Error("CENTRAL_SCP_DATABASE_URL não configurada no serviço Sandbox.");
  const client = postgres(url, { max: 3, prepare: false, connect_timeout: 10 });
  try {
    await client`select 1`;
    _centralSCPClient = client;
    return client;
  } catch (error) {
    await client.end({ timeout: 1 }).catch(() => undefined);
    throw error;
  }
}

async function getCentralSCPAgentCredentials(sourceAgentId: number) {
  const client = await getCentralSCPClient();
  const [agent] = await client`
    SELECT "manusAccount", "manusToken"
    FROM sofia.agents
    WHERE id = ${sourceAgentId}
    LIMIT 1
  `;
  if (!agent) return null;
  const encryptionKey = process.env.CENTRAL_SCP_CREDENTIAL_ENCRYPTION_KEY;
  if (agent.manusToken && !encryptionKey) {
    throw new Error("CENTRAL_SCP_CREDENTIAL_ENCRYPTION_KEY não configurada no serviço Sandbox.");
  }
  return {
    manusAccount: agent.manusAccount ?? null,
    manusToken: agent.manusToken
      ? decryptCredential(agent.manusToken, encryptionKey)
      : null,
  };
}

async function getAgentCredentialSource(database: Awaited<ReturnType<typeof getDb>>, agentId: number) {
  if (!database) throw new Error("Database not available");
  const [source] = await database.execute(sql`
    SELECT "agentOrigin", "sourceAgentId"
    FROM sandbox.agents
    WHERE id = ${agentId}
    LIMIT 1
  `) as any;
  return source ?? null;
}

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

/**
 * Sandbox inventory is a projection. For SCP_CATALOG agents, the canonical
 * operational metadata and credential-presence flag come from the central SCP DB.
 * Secret values are never copied into the Sandbox database or returned here.
 */
export async function getAgentInventorySnapshot() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const localRows = await database.execute(sql`
    SELECT
      id, "ownerId", name, description, status::text AS status, version,
      "manusAccount", "lastHeartbeat", "connectionStatus", "connectionError",
      "creditsRemaining", "creditsUpdatedAt", "createdAt", "updatedAt",
      "agentOrigin", "sourceAgentId",
      ("manusToken" IS NOT NULL AND length("manusToken") > 0) AS "localHasCredential"
    FROM sandbox.agents
    ORDER BY id
  `) as any[];

  const sourceIds = localRows
    .filter((agent: any) => agent.agentOrigin === "SCP_CATALOG" && agent.sourceAgentId != null)
    .map((agent: any) => Number(agent.sourceAgentId));
  let centralById = new Map<number, any>();
  if (sourceIds.length > 0) {
    try {
      const client = await getCentralSCPClient();
      const centralRows = await client`
        SELECT
          id, name, description, status::text AS status, version, "manusAccount",
          "lastHeartbeat", "connectionStatus", "connectionError",
          "creditsRemaining", "creditsUpdatedAt",
          ("manusToken" IS NOT NULL AND length("manusToken") > 0) AS "hasCredential"
        FROM sofia.agents
        WHERE id = ANY(${client.array(sourceIds, "int4")})
      `;
      centralById = new Map(centralRows.map((agent: any) => [Number(agent.id), agent]));
    } catch (error) {
      console.warn("[AgentInventory] Fonte central SCP indisponível; agentes SCP_CATALOG permanecem sem elegibilidade:", error instanceof Error ? error.message : error);
    }
  }

  return localRows.map((local: any) => {
    const central = local.agentOrigin === "SCP_CATALOG" && local.sourceAgentId != null
      ? centralById.get(Number(local.sourceAgentId))
      : null;
    if (local.agentOrigin === "SCP_CATALOG") {
      return {
        ...local,
        ...(central ? {
          name: central.name,
          description: central.description,
          status: central.status,
          version: central.version,
          manusAccount: central.manusAccount,
          lastHeartbeat: central.lastHeartbeat,
          connectionStatus: central.connectionStatus,
          connectionError: central.connectionError,
          creditsRemaining: central.creditsRemaining,
          creditsUpdatedAt: central.creditsUpdatedAt,
        } : {}),
        hasCredential: Boolean(central?.hasCredential),
        centralSourceAvailable: Boolean(central),
      };
    }
    return { ...local, hasCredential: Boolean(local.localHasCredential), centralSourceAvailable: true };
  });
}

export async function getAgentsByOwnerId(ownerId: number, canViewAll = false) {
  const rows = await getAgentInventorySnapshot();
  return rows.filter((agent: any) => canViewAll || Number(agent.ownerId) === ownerId);
}
export async function getAgentById(id: number) {
  const rows = await getAgentInventorySnapshot();
  return rows.find((agent: any) => Number(agent.id) === id) ?? null;
}

export async function getAgentByIdForOwner(id: number, ownerId: number, canViewAll = false) {
  const agent = await getAgentById(id);
  if (!agent || (!canViewAll && Number(agent.ownerId) !== ownerId)) return null;
  return agent;
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
  const source = await getAgentCredentialSource(database, id);
  if (source?.agentOrigin === "SCP_CATALOG" && source.sourceAgentId != null) {
    return getCentralSCPAgentCredentials(Number(source.sourceAgentId));
  }
  return {
    manusAccount: agent.manusAccount,
    manusToken: agent.manusToken ? decryptCredential(agent.manusToken) : null,
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
  const source = await getAgentCredentialSource(database, id);
  if (source?.agentOrigin === "SCP_CATALOG" && source.sourceAgentId != null) {
    return getCentralSCPAgentCredentials(Number(source.sourceAgentId));
  }
  return {
    manusAccount: agent.manusAccount,
    manusToken: agent.manusToken ? decryptCredential(agent.manusToken) : null,
  };
}

/** Checks central credential availability without loading or decrypting the secret. */
export async function hasManusCredentialsForAgent(id: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const source = await getAgentCredentialSource(database, id);
  if (source?.agentOrigin === "SCP_CATALOG" && source.sourceAgentId != null) {
    const client = await getCentralSCPClient();
    const [row] = await client`
      SELECT ("manusToken" IS NOT NULL AND length("manusToken") > 0) AS "hasCredential"
      FROM sofia.agents
      WHERE id = ${Number(source.sourceAgentId)}
      LIMIT 1
    `;
    return Boolean(row?.hasCredential);
  }
  const [agent] = await database.select({ manusToken: agents.manusToken })
    .from(agents).where(eq(agents.id, id)).limit(1);
  return Boolean(agent?.manusToken);
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
  manusStatus?: string;
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


/**
 * Creates a human-origin mission and its immutable source request + initial TR
 * in one database transaction. A failure cannot leave a mission without its
 * mandatory initial documents.
 */
export async function createMissionWithInitialDocuments(input: {
  task: Parameters<typeof createTask>[0];
  originalRequest: MissionDocumentVersionInput;
  tr: MissionDocumentVersionInput;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (transaction) => {
    const [insertedTask] = await transaction
      .insert(tasks)
      .values({
        ...input.task,
        creatorType: input.task.creatorType ?? "user",
        agentPinned: input.task.agentPinned ?? input.task.agentId !== undefined,
      })
      .returning();

    if (!insertedTask) throw new Error("Mission could not be created");

    const missionKey = `SCP-TASK-${String(insertedTask.id).padStart(6, "0")}`;
    const [task] = await transaction
      .update(tasks)
      .set({ missionKey, githubSyncStatus: "pending", updatedAt: new Date() })
      .where(eq(tasks.id, insertedTask.id))
      .returning();
    if (!task) throw new Error("Mission metadata could not be finalized");

    const persistInitialDocument = async (
      typeKey: "ORIGINAL_REQUEST" | "TR",
      documentKey: "ORIGINAL_REQUEST" | "TR",
      title: string,
      versionInput: MissionDocumentVersionInput,
    ) => {
      const [documentType] = await transaction
        .select()
        .from(missionDocumentTypes)
        .where(and(eq(missionDocumentTypes.typeKey, typeKey), eq(missionDocumentTypes.isActive, true)))
        .limit(1);
      if (!documentType) throw new Error(`Required mission document type is inactive or missing: ${typeKey}`);

      if (typeKey === "ORIGINAL_REQUEST" && (versionInput.authorType === "AGENT" || versionInput.state !== "PUBLISHED")) {
        throw new Error("The original mission request must be published as a HUMAN or SOFIA source snapshot");
      }

      await validateMissionDocumentAuthor(transaction, insertedTask.createdBy, versionInput);
      await validateMissionDocumentSource(transaction, insertedTask.id, typeKey, versionInput.sourceDocumentVersionId);

      const [document] = await transaction
        .insert(missionDocuments)
        .values({ taskId: insertedTask.id, documentTypeId: documentType.id, documentKey, title })
        .returning();

      await transaction.insert(missionDocumentVersions).values({
        documentId: document.id,
        version: 1,
        state: versionInput.state ?? "DRAFT",
        content: versionInput.content,
        authorType: versionInput.authorType,
        authorUserId: versionInput.authorUserId ?? null,
        authorAgentId: versionInput.authorAgentId ?? null,
        sourceDocumentVersionId: versionInput.sourceDocumentVersionId ?? null,
        provenance: versionInput.provenance ?? {},
        changeSummary: versionInput.changeSummary ?? "Initial version",
        contentHash: versionInput.contentHash ?? null,
        publishedAt: versionInput.publishedAt ?? (typeKey === "ORIGINAL_REQUEST" ? new Date() : null),
      });
    };

    await persistInitialDocument(
      "ORIGINAL_REQUEST",
      "ORIGINAL_REQUEST",
      "Solicitação original",
      input.originalRequest,
    );
    await persistInitialDocument("TR", "TR", "TR — " + insertedTask.title, input.tr);

    return task;
  });
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
 * Inspects agent eligibility for a STAGED task without locks or mutations.
 * The predicates intentionally mirror claimStagedTaskWithAvailableAgent.
 */
export async function inspectTaskAgentEligibility(taskId: number, ownerId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [task] = await database.execute(sql`
    SELECT t.id, t."createdBy", t."agentId", t."agentPinned", status.name AS "taskStatus"
    FROM sandbox.tasks t
    JOIN sandbox."taskStatuses" status ON status.id = t."statusId"
    WHERE t.id = ${taskId} AND t."createdBy" = ${ownerId}
    LIMIT 1
  `) as any;
  if (!task) return null;

  const observedAt = new Date();
  const agentsForOwner = await database.execute(sql`
    SELECT
      a.id,
      a.name,
      a.status,
      a."connectionStatus",
      a.version,
      a."lastHeartbeat",
      a."creditsRemaining",
      a."creditsUpdatedAt",
      (a."manusToken" IS NOT NULL) AS "hasCredential",
      (a.status = 'online') AS "isOnline",
      (a."connectionStatus" IN ('configured', 'connected')) AS "connectionEligible",
      (a."creditsRemaining" IS NOT NULL AND a."creditsRemaining"::numeric > 0) AS "hasPositiveCredits",
      (a."creditsUpdatedAt" >= NOW() - INTERVAL '60 seconds') AS "creditSnapshotFresh",
      NOT EXISTS (
        SELECT 1
        FROM sandbox.tasks active_task
        JOIN sandbox."taskStatuses" active_status ON active_status.id = active_task."statusId"
        WHERE active_task."agentId" = a.id
          AND active_task.id <> ${taskId}
          AND active_status.name = 'PROGRESS'
      ) AS "hasNoProgressTask"
    FROM sandbox.agents a
    WHERE a."ownerId" = ${task.createdBy}
  `) as any[];

  const taskIsStaged = task.taskStatus === "STAGED";
  const assignmentMode = task.agentPinned
    ? task.agentId ? "PINNED" : "PINNED_WITHOUT_AGENT"
    : "AUTOMATIC";

  const candidates = agentsForOwner.map((agent: any) => {
    const reasons: string[] = [];
    const isPinnedTarget = assignmentMode !== "PINNED" || agent.id === task.agentId;

    if (!taskIsStaged) reasons.push("task_not_staged");
    if (!isPinnedTarget) reasons.push("excluded_by_human_pin");
    if (assignmentMode === "PINNED_WITHOUT_AGENT") reasons.push("pin_without_agent");
    if (!agent.isOnline) reasons.push("agent_not_online");
    if (!agent.connectionEligible) reasons.push("connection_not_configured_or_connected");
    if (!agent.hasCredential) reasons.push("credential_missing");
    if (!agent.hasPositiveCredits) reasons.push("credits_not_positive");
    if (!agent.hasNoProgressTask) reasons.push("agent_has_progress_task");

    const eligible = taskIsStaged
      && assignmentMode !== "PINNED_WITHOUT_AGENT"
      && isPinnedTarget
      && Boolean(agent.isOnline)
      && Boolean(agent.connectionEligible)
      && Boolean(agent.hasCredential)
      && Boolean(agent.hasPositiveCredits)
      && Boolean(agent.hasNoProgressTask);

    return {
      agentId: Number(agent.id),
      name: agent.name,
      status: agent.status,
      connectionStatus: agent.connectionStatus,
      version: agent.version,
      lastHeartbeat: agent.lastHeartbeat,
      creditsRemaining: agent.creditsRemaining,
      creditsUpdatedAt: agent.creditsUpdatedAt,
      hasCredential: Boolean(agent.hasCredential),
      isOnline: Boolean(agent.isOnline),
      connectionEligible: Boolean(agent.connectionEligible),
      hasPositiveCredits: Boolean(agent.hasPositiveCredits),
      creditSnapshotFresh: Boolean(agent.creditSnapshotFresh),
      hasNoProgressTask: Boolean(agent.hasNoProgressTask),
      eligible,
      reasons,
    };
  });

  candidates.sort((left: any, right: any) => {
    if (left.eligible !== right.eligible) return left.eligible ? -1 : 1;
    const creditDelta = Number(right.creditsRemaining ?? 0) - Number(left.creditsRemaining ?? 0);
    if (creditDelta !== 0) return creditDelta;
    const leftUpdated = left.creditsUpdatedAt ? new Date(left.creditsUpdatedAt).getTime() : Number.NEGATIVE_INFINITY;
    const rightUpdated = right.creditsUpdatedAt ? new Date(right.creditsUpdatedAt).getTime() : Number.NEGATIVE_INFINITY;
    return leftUpdated - rightUpdated || left.agentId - right.agentId;
  });

  return {
    observedAt: observedAt.toISOString(),
    task: {
      taskId: Number(task.id),
      ownerId: Number(task.createdBy),
      status: task.taskStatus,
      assignedAgentId: task.agentId === null ? null : Number(task.agentId),
      agentPinned: Boolean(task.agentPinned),
      assignmentMode,
    },
    candidates,
    interpretationLimits: [
      "Consulta somente leitura, sem FOR UPDATE, SKIP LOCKED, reserva ou alteração de estado.",
      "A idade do snapshot de créditos é informativa e nunca elimina um agente com saldo positivo conhecido.",
      "O resultado é um snapshot; a elegibilidade pode mudar antes de um claim posterior.",
      "A conexão 'configured' é aceita pelo claim atual, assim como 'connected'.",
      "A ordem de candidatos elegíveis segue créditos decrescentes, snapshot mais antigo e Agent ID.",
    ],
  };
}

/**
 * Atomically claims a STAGED task and reserves one eligible agent.
 * Explicitly selected agents are pinned; automatic assignments may be changed.
 */
export async function claimStagedTaskWithAvailableAgent(
  taskId: number,
  stagedStatusId: number,
  progressStatusId: number,
  eligibleAgentIds: number[],
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  if (!eligibleAgentIds.length) return null;

  return database.transaction(async (tx) => {
    const [task] = await tx.execute(sql`
      SELECT id, "createdBy", "agentId", "agentPinned"
      FROM sandbox.tasks
      WHERE id = ${taskId} AND "statusId" = ${stagedStatusId}
      FOR UPDATE
    `) as any;
    if (!task) return null;

    if (task.agentId && task.agentPinned) {
      const [pinned] = await tx.execute(sql`
        SELECT a.id
        FROM sandbox.agents a
        WHERE a.id = ${task.agentId}
          AND a."ownerId" = ${task.createdBy}
          AND a.status = 'online'
          AND a."connectionStatus" IN ('configured', 'connected')
          AND a.id = ANY(${eligibleAgentIds}::int[])
          AND a."creditsRemaining" IS NOT NULL
          AND a."creditsRemaining"::numeric > 0
          AND NOT EXISTS (
            SELECT 1
            FROM sandbox.tasks active_task
            JOIN sandbox."taskStatuses" active_status ON active_status.id = active_task."statusId"
            WHERE active_task."agentId" = a.id
              AND active_task.id <> ${taskId}
              AND active_status.name = 'PROGRESS'
          )
        FOR UPDATE OF a
      `) as any;
      if (!pinned) return null;
      const [claimed] = await tx.execute(sql`
        UPDATE sandbox.tasks
        SET "statusId" = ${progressStatusId}, "updatedAt" = NOW()
        WHERE id = ${taskId} AND "statusId" = ${stagedStatusId}
        RETURNING *
      `) as any;
      return claimed ?? null;
    }

    const [candidate] = await tx.execute(sql`
      SELECT a.id
      FROM sandbox.agents a
      WHERE a."ownerId" = ${task.createdBy}
        AND a.status = 'online'
        AND a."connectionStatus" IN ('configured', 'connected')
        AND a.id = ANY(${eligibleAgentIds}::int[])
        AND a."creditsRemaining" IS NOT NULL
          AND a."creditsRemaining"::numeric > 0
        AND NOT EXISTS (
          SELECT 1
          FROM sandbox.tasks active_task
          JOIN sandbox."taskStatuses" active_status ON active_status.id = active_task."statusId"
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
      UPDATE sandbox.tasks
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

export async function createMessage(data: { taskId?: number | null; senderId: number; parentMessageId?: number; typeId: number; content: string; isAssistant?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

export async function getAllMessageTypes() {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(messageTypes).orderBy(asc(messageTypes.id));
}

export async function getAllGeneralMessages(limit = 200) {
  const database = await getDb();
  if (!database) return [];
  const rows = await database.select().from(messages)
    .where(isNull(messages.taskId))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit);
  return rows.reverse();
}

export async function getMessagesByOwner(ownerId: number, taskId: number | null, limit = 100) {
  const database = await getDb();
  if (!database) return [];
  const contextFilter = taskId === null ? isNull(messages.taskId) : eq(messages.taskId, taskId);
  const rows = await database.select().from(messages)
    .where(and(eq(messages.senderId, ownerId), contextFilter))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit);
  return rows.reverse();
}

export async function getMessagesByParentIdForOwner(parentMessageId: number, ownerId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(messages)
    .where(and(eq(messages.parentMessageId, parentMessageId), eq(messages.senderId, ownerId)))
    .orderBy(asc(messages.createdAt), asc(messages.id));
}

export async function getMessageByIdForOwner(id: number, ownerId: number) {
  const database = await getDb();
  if (!database) return null;
  const [message] = await database.select().from(messages)
    .where(and(eq(messages.id, id), eq(messages.senderId, ownerId))).limit(1);
  return message ?? null;
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
  const database = await getDb();
  if (!database) return [];
  return getAgentInventorySnapshot();
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

export async function getTaskStatusNameById(id: number): Promise<string | null> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const [status] = await database.select({ name: taskStatuses.name }).from(taskStatuses)
    .where(eq(taskStatuses.id, id)).limit(1);
  return status?.name ?? null;
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


// ============================================
// VERSIONED MISSION DOCUMENTS
// ============================================

type MissionDocumentAuthorType = "HUMAN" | "SOFIA" | "AGENT";

type MissionDocumentVersionInput = {
  content: string;
  state?: string;
  authorType: MissionDocumentAuthorType;
  authorUserId?: number | null;
  authorAgentId?: number | null;
  sourceDocumentVersionId?: number | null;
  provenance?: Record<string, unknown>;
  changeSummary?: string | null;
  contentHash?: string | null;
  publishedAt?: Date | null;
};

async function assertMissionDocumentAccess(
  database: Awaited<ReturnType<typeof getDb>>,
  taskId: number,
  ownerId: number,
  canViewAll: boolean,
) {
  if (!database) throw new Error("Database not available");
  const [task] = await database
    .select({ id: tasks.id, createdBy: tasks.createdBy })
    .from(tasks)
    .where(canViewAll
      ? eq(tasks.id, taskId)
      : and(eq(tasks.id, taskId), eq(tasks.createdBy, ownerId)))
    .limit(1);
  if (!task) throw new Error("Mission not found or access denied");
  return task;
}

async function validateMissionDocumentAuthor(
  transaction: any,
  taskOwnerId: number,
  author: Pick<MissionDocumentVersionInput, "authorType" | "authorUserId" | "authorAgentId">,
) {
  if (author.authorType === "HUMAN" && !author.authorUserId) {
    throw new Error("HUMAN document versions require authorUserId");
  }
  if (author.authorType === "HUMAN" && author.authorUserId !== taskOwnerId) {
    throw new Error("Human document authorship must match the mission owner");
  }
  if (author.authorType === "AGENT" && !author.authorAgentId) {
    throw new Error("AGENT document versions require authorAgentId");
  }
  if (author.authorAgentId) {
    const [agent] = await transaction
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.id, author.authorAgentId), eq(agents.ownerId, taskOwnerId)))
      .limit(1);
    if (!agent) throw new Error("Document author agent does not belong to the mission owner");
  }
}

async function validateMissionDocumentSource(
  transaction: any,
  taskId: number,
  typeKey: string,
  sourceDocumentVersionId?: number | null,
) {
  if (!sourceDocumentVersionId) {
    if (typeKey === "BLUEPRINT") {
      throw new Error("Blueprint versions must reference the exact source TR version");
    }
    return;
  }

  const [source] = await transaction
    .select({
      taskId: missionDocuments.taskId,
      typeKey: missionDocumentTypes.typeKey,
    })
    .from(missionDocumentVersions)
    .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(eq(missionDocumentVersions.id, sourceDocumentVersionId))
    .limit(1);

  if (!source || source.taskId !== taskId) {
    throw new Error("Source document version does not belong to this mission");
  }
  if (typeKey === "BLUEPRINT" && source.typeKey !== "TR") {
    throw new Error("Blueprint source must be a TR version");
  }
}

export async function getMissionDocumentTypes() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  return database
    .select()
    .from(missionDocumentTypes)
    .where(eq(missionDocumentTypes.isActive, true))
    .orderBy(asc(missionDocumentTypes.sortOrder), asc(missionDocumentTypes.label));
}

export async function getMissionDocumentsForTask(
  taskId: number,
  ownerId: number,
  canViewAll = false,
) {
  const database = await getDb();
  await assertMissionDocumentAccess(database, taskId, ownerId, canViewAll);

  const documents = await database!
    .select({
      id: missionDocuments.id,
      taskId: missionDocuments.taskId,
      documentKey: missionDocuments.documentKey,
      title: missionDocuments.title,
      createdAt: missionDocuments.createdAt,
      updatedAt: missionDocuments.updatedAt,
      typeKey: missionDocumentTypes.typeKey,
      typeLabel: missionDocumentTypes.label,
      category: missionDocumentTypes.category,
      audience: missionDocumentTypes.audience,
      renderer: missionDocumentTypes.renderer,
      sortOrder: missionDocumentTypes.sortOrder,
    })
    .from(missionDocuments)
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(eq(missionDocuments.taskId, taskId))
    .orderBy(asc(missionDocumentTypes.sortOrder), asc(missionDocuments.createdAt));

  return Promise.all(documents.map(async (document) => {
    const [latestVersion] = await database!
      .select({
        id: missionDocumentVersions.id,
        version: missionDocumentVersions.version,
        state: missionDocumentVersions.state,
        authorType: missionDocumentVersions.authorType,
        createdAt: missionDocumentVersions.createdAt,
        publishedAt: missionDocumentVersions.publishedAt,
        sourceDocumentVersionId: missionDocumentVersions.sourceDocumentVersionId,
        changeSummary: missionDocumentVersions.changeSummary,
      })
      .from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, document.id))
      .orderBy(desc(missionDocumentVersions.version))
      .limit(1);
    return { ...document, latestVersion: latestVersion ?? null };
  }));
}

export async function getMissionDocumentVersionForTask(
  taskId: number,
  documentId: number,
  version: number,
  ownerId: number,
  canViewAll = false,
) {
  const database = await getDb();
  await assertMissionDocumentAccess(database, taskId, ownerId, canViewAll);
  const [result] = await database!
    .select({
      document: missionDocuments,
      type: missionDocumentTypes,
      version: missionDocumentVersions,
    })
    .from(missionDocumentVersions)
    .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(and(
      eq(missionDocuments.taskId, taskId),
      eq(missionDocuments.id, documentId),
      eq(missionDocumentVersions.version, version),
    ))
    .limit(1);
  return result ?? null;
}

export async function createMissionDocumentWithVersion(input: {
  taskId: number;
  ownerId: number;
  canViewAll?: boolean;
  typeKey: string;
  documentKey: string;
  title: string;
  version: MissionDocumentVersionInput;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (transaction) => {
    const [task] = await transaction
      .select({ id: tasks.id, createdBy: tasks.createdBy })
      .from(tasks)
      .where(input.canViewAll
        ? eq(tasks.id, input.taskId)
        : and(eq(tasks.id, input.taskId), eq(tasks.createdBy, input.ownerId)))
      .limit(1);
    if (!task) throw new Error("Mission not found or access denied");

    const [documentType] = await transaction
      .select()
      .from(missionDocumentTypes)
      .where(and(eq(missionDocumentTypes.typeKey, input.typeKey), eq(missionDocumentTypes.isActive, true)))
      .limit(1);
    if (!documentType) throw new Error("Mission document type is not active or does not exist");
    if (documentType.typeKey === "ORIGINAL_REQUEST") {
      if (input.version.authorType === "AGENT" || input.version.state !== "PUBLISHED") {
        throw new Error("The original mission request must be published as a HUMAN or SOFIA source snapshot");
      }
    }

    await validateMissionDocumentAuthor(transaction, task.createdBy, input.version);
    await validateMissionDocumentSource(transaction, task.id, documentType.typeKey, input.version.sourceDocumentVersionId);

    const [document] = await transaction
      .insert(missionDocuments)
      .values({
        taskId: task.id,
        documentTypeId: documentType.id,
        documentKey: input.documentKey,
        title: input.title,
      })
      .returning();

    const [version] = await transaction
      .insert(missionDocumentVersions)
      .values({
        documentId: document.id,
        version: 1,
        state: input.version.state ?? "DRAFT",
        content: input.version.content,
        authorType: input.version.authorType,
        authorUserId: input.version.authorUserId ?? null,
        authorAgentId: input.version.authorAgentId ?? null,
        sourceDocumentVersionId: input.version.sourceDocumentVersionId ?? null,
        provenance: input.version.provenance ?? {},
        changeSummary: input.version.changeSummary ?? "Initial version",
        contentHash: input.version.contentHash ?? null,
        publishedAt: input.version.publishedAt ?? (documentType.typeKey === "ORIGINAL_REQUEST" ? new Date() : null),
      })
      .returning();

    return { document, version };
  });
}

export async function createMissionDocumentRevision(input: {
  taskId: number;
  documentId: number;
  ownerId: number;
  canViewAll?: boolean;
  version: MissionDocumentVersionInput;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (transaction) => {
    const [document] = await transaction
      .select({
        id: missionDocuments.id,
        taskId: missionDocuments.taskId,
        typeKey: missionDocumentTypes.typeKey,
        taskOwnerId: tasks.createdBy,
      })
      .from(missionDocuments)
      .innerJoin(tasks, eq(missionDocuments.taskId, tasks.id))
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .where(input.canViewAll
        ? and(eq(missionDocuments.id, input.documentId), eq(missionDocuments.taskId, input.taskId))
        : and(
          eq(missionDocuments.id, input.documentId),
          eq(missionDocuments.taskId, input.taskId),
          eq(tasks.createdBy, input.ownerId),
        ))
      .limit(1)
      .for("update");
    if (!document) throw new Error("Mission document not found or access denied");
    if (document.typeKey === "ORIGINAL_REQUEST") {
      throw new Error("The original mission request is immutable and cannot be revised");
    }

    await validateMissionDocumentAuthor(transaction, document.taskOwnerId, input.version);
    await validateMissionDocumentSource(transaction, document.taskId, document.typeKey, input.version.sourceDocumentVersionId);

    const [latest] = await transaction
      .select({ version: missionDocumentVersions.version })
      .from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, document.id))
      .orderBy(desc(missionDocumentVersions.version))
      .limit(1);

    const [createdVersion] = await transaction
      .insert(missionDocumentVersions)
      .values({
        documentId: document.id,
        version: (latest?.version ?? 0) + 1,
        state: input.version.state ?? "DRAFT",
        content: input.version.content,
        authorType: input.version.authorType,
        authorUserId: input.version.authorUserId ?? null,
        authorAgentId: input.version.authorAgentId ?? null,
        sourceDocumentVersionId: input.version.sourceDocumentVersionId ?? null,
        provenance: input.version.provenance ?? {},
        changeSummary: input.version.changeSummary ?? null,
        contentHash: input.version.contentHash ?? null,
        publishedAt: input.version.publishedAt ?? null,
      })
      .returning();

    await transaction
      .update(missionDocuments)
      .set({ updatedAt: new Date() })
      .where(eq(missionDocuments.id, document.id));

    return createdVersion;
  });
}


/**
 * Atomically reorients a human-origin mission before its first external execution.
 * The task row lock serializes this operation against the STAGED -> PROGRESS claim.
 */
export async function reorientMissionTRBeforeExecution(input: {
  taskId: number;
  documentId: number;
  ownerId: number;
  content: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (transaction) => {
    const [task] = await transaction
      .select({
        id: tasks.id,
        createdBy: tasks.createdBy,
        parentTaskId: tasks.parentTaskId,
        statusId: tasks.statusId,
        manusTaskId: tasks.manusTaskId,
        manusStatus: tasks.manusStatus,
      })
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.createdBy, input.ownerId)))
      .limit(1)
      .for("update");

    if (!task || task.parentTaskId !== null) {
      throw new Error("Only the mission owner can reorient a top-level mission TR");
    }
    if (task.manusTaskId || task.manusStatus !== "awaiting_tr_validation") {
      throw new Error("Mission has already left the initial execution gate");
    }

    const statuses = await transaction
      .select({ id: taskStatuses.id, name: taskStatuses.name })
      .from(taskStatuses)
      .where(sql`upper(${taskStatuses.name}) in ('PAUSED', 'STAGED')`);
    const pausedStatusId = statuses.find((status) => status.name.toUpperCase() === "PAUSED")?.id;
    const allowedStatusIds = statuses.map((status) => status.id);
    if (!pausedStatusId || !allowedStatusIds.includes(task.statusId)) {
      throw new Error("TR reorientation is allowed only while the mission is PAUSED or STAGED before execution");
    }

    const [document] = await transaction
      .select({
        id: missionDocuments.id,
        taskId: missionDocuments.taskId,
        typeKey: missionDocumentTypes.typeKey,
        taskOwnerId: tasks.createdBy,
      })
      .from(missionDocuments)
      .innerJoin(tasks, eq(missionDocuments.taskId, tasks.id))
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .where(and(
        eq(missionDocuments.id, input.documentId),
        eq(missionDocuments.taskId, task.id),
        eq(missionDocumentTypes.typeKey, "TR"),
      ))
      .limit(1)
      .for("update");

    if (!document) throw new Error("Canonical mission TR not found");

    const [latest] = await transaction
      .select({ id: missionDocumentVersions.id, version: missionDocumentVersions.version, state: missionDocumentVersions.state })
      .from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, document.id))
      .orderBy(desc(missionDocumentVersions.version))
      .limit(1);

    if (!latest || !["DRAFT", "AWAITING_HUMAN_VALIDATION", "VALIDATED", "ACTIVE", "REORIENTED"].includes(latest.state)) {
      throw new Error("Current TR state does not allow pre-execution reorientation");
    }

    // Move STAGED back to PAUSED while holding the same task lock used by the dispatcher claim.
    if (task.statusId !== pausedStatusId) {
      await transaction.update(tasks)
        .set({ statusId: pausedStatusId, manusStatus: "awaiting_tr_validation", updatedAt: new Date() })
        .where(eq(tasks.id, task.id));
    }

    await validateMissionDocumentAuthor(transaction, document.taskOwnerId, {
      authorType: "HUMAN",
      authorUserId: input.ownerId,
    });

    const [createdVersion] = await transaction
      .insert(missionDocumentVersions)
      .values({
        documentId: document.id,
        version: latest.version + 1,
        state: "AWAITING_HUMAN_VALIDATION",
        content: input.content,
        authorType: "HUMAN",
        authorUserId: input.ownerId,
        provenance: {
          origin: "HUMAN",
          action: "operator_reorientation_before_execution",
          supersedesVersion: latest.version,
        },
        changeSummary: "Reorientação do operador antes da primeira execução; nova validação obrigatória",
        publishedAt: new Date(),
      })
      .returning();

    await transaction.update(missionDocuments)
      .set({ updatedAt: new Date() })
      .where(eq(missionDocuments.id, document.id));

    return createdVersion;
  });
}


export async function listMissionDocumentVersionsForTask(
  taskId: number,
  documentId: number,
  ownerId: number,
  canViewAll = false,
) {
  const database = await getDb();
  await assertMissionDocumentAccess(database, taskId, ownerId, canViewAll);

  const [document] = await database!
    .select({ id: missionDocuments.id })
    .from(missionDocuments)
    .where(and(eq(missionDocuments.id, documentId), eq(missionDocuments.taskId, taskId)))
    .limit(1);
  if (!document) return [];

  return database!
    .select({
      id: missionDocumentVersions.id,
      version: missionDocumentVersions.version,
      state: missionDocumentVersions.state,
      authorType: missionDocumentVersions.authorType,
      authorUserId: missionDocumentVersions.authorUserId,
      authorAgentId: missionDocumentVersions.authorAgentId,
      sourceDocumentVersionId: missionDocumentVersions.sourceDocumentVersionId,
      changeSummary: missionDocumentVersions.changeSummary,
      contentHash: missionDocumentVersions.contentHash,
      createdAt: missionDocumentVersions.createdAt,
      publishedAt: missionDocumentVersions.publishedAt,
    })
    .from(missionDocumentVersions)
    .where(eq(missionDocumentVersions.documentId, documentId))
    .orderBy(desc(missionDocumentVersions.version));
}


/** Resolve a task to its top-level mission, rejecting broken or cyclic parent chains. */
async function resolveMissionRootTaskId(database: NonNullable<Awaited<ReturnType<typeof getDb>>>, taskId: number): Promise<number | null> {
  let currentId = taskId;
  const visited = new Set<number>();
  while (true) {
    if (visited.has(currentId)) return null;
    visited.add(currentId);
    const [current] = await database
      .select({ id: tasks.id, parentTaskId: tasks.parentTaskId })
      .from(tasks)
      .where(eq(tasks.id, currentId))
      .limit(1);
    if (!current) return null;
    if (current.parentTaskId == null) return current.id;
    currentId = current.parentTaskId;
  }
}

export async function getMissionRootTaskId(taskId: number): Promise<number | null> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  return resolveMissionRootTaskId(database, taskId);
}

/** Execution authorization is inherited by child tasks from the top-level mission. */
export async function hasValidatedMissionTR(taskId: number): Promise<boolean> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const missionId = await resolveMissionRootTaskId(database, taskId);
  if (missionId == null) return false;

  const [validated] = await database.select({ id: missionDocumentVersions.id })
    .from(missionDocumentVersions)
    .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(and(
      eq(missionDocuments.taskId, missionId),
      eq(missionDocuments.documentKey, "TR"),
      eq(missionDocumentTypes.typeKey, "TR"),
      sql`${missionDocumentVersions.version} = (
        SELECT MAX(v2."version") FROM sandbox."missionDocumentVersions" v2
        WHERE v2."documentId" = ${missionDocuments.id}
      )`,
      sql`${missionDocumentVersions.state} IN ('VALIDATED', 'ACTIVE', 'REORIENTED')`,
    )).limit(1);
  return Boolean(validated);
}


/**
 * A task may execute only when its root mission has a validated current TR
 * and a READY/ACTIVE Blueprint derived from that exact TR version.
 */
export async function hasExecutionReadyMissionDocuments(taskId: number): Promise<boolean> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const missionId = await resolveMissionRootTaskId(database, taskId);
  if (missionId == null) return false;

  const [tr] = await database
    .select({ id: missionDocumentVersions.id, state: missionDocumentVersions.state })
    .from(missionDocumentVersions)
    .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(and(eq(missionDocuments.taskId, missionId), eq(missionDocuments.documentKey, "TR"), eq(missionDocumentTypes.typeKey, "TR")))
    .orderBy(desc(missionDocumentVersions.version))
    .limit(1);
  if (!tr || !["VALIDATED", "ACTIVE", "REORIENTED"].includes(tr.state)) return false;

  const [blueprint] = await database
    .select({
      state: missionDocumentVersions.state,
      sourceDocumentVersionId: missionDocumentVersions.sourceDocumentVersionId,
    })
    .from(missionDocumentVersions)
    .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(and(eq(missionDocuments.taskId, missionId), eq(missionDocuments.documentKey, "BLUEPRINT"), eq(missionDocumentTypes.typeKey, "BLUEPRINT")))
    .orderBy(desc(missionDocumentVersions.version))
    .limit(1);

  return Boolean(
    blueprint
    && ["READY", "ACTIVE"].includes(blueprint.state)
    && blueprint.sourceDocumentVersionId === tr.id
  );
}


/**
 * Checks whether a task belongs to an approved ACTION_PLAN and, if so,
 * requires an exact, persisted unit authorization before any execution path.
 * Legacy missions without an ACTION_PLAN retain their existing dispatch path.
 */
/**
 * Registers every unit from the exact latest approved ACTION_PLAN version.
 * Registration is idempotent and never creates operational tasks or dispatches.
 */
export async function registerMissionActionPlanUnits(input: {
  missionTaskId: number;
  ownerId: number;
  documentId: number;
  expectedVersion: number;
  expectedContentHash: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    const [mission] = await tx.select({ createdBy: tasks.createdBy, parentTaskId: tasks.parentTaskId })
      .from(tasks).where(eq(tasks.id, input.missionTaskId)).for("update").limit(1);
    if (!mission || mission.parentTaskId !== null || mission.createdBy !== input.ownerId) {
      throw new Error("Somente o proprietário da missão principal pode registrar suas unidades.");
    }

    const [plan] = await tx.select({
      documentId: missionDocuments.id,
      versionId: missionDocumentVersions.id,
      version: missionDocumentVersions.version,
      state: missionDocumentVersions.state,
      content: missionDocumentVersions.content,
      contentHash: missionDocumentVersions.contentHash,
    }).from(missionDocuments)
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .innerJoin(missionDocumentVersions, eq(missionDocumentVersions.documentId, missionDocuments.id))
      .where(and(
        eq(missionDocuments.id, input.documentId),
        eq(missionDocuments.taskId, input.missionTaskId),
        eq(missionDocumentTypes.typeKey, "ACTION_PLAN"),
        eq(missionDocuments.documentKey, "ACTION_PLAN"),
        eq(missionDocumentVersions.version, input.expectedVersion),
      )).limit(1);

    if (!plan || plan.state !== "APPROVED" || plan.version !== input.expectedVersion) {
      throw new Error("O registro exige a versão aprovada exata do ACTION_PLAN.");
    }
    const [latest] = await tx.select({ id: missionDocumentVersions.id, version: missionDocumentVersions.version })
      .from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, input.documentId))
      .orderBy(desc(missionDocumentVersions.version)).limit(1);
    if (!latest || latest.id !== plan.versionId || latest.version !== input.expectedVersion) {
      throw new Error("O ACTION_PLAN mudou; atualize o documento antes de registrar as unidades.");
    }
    const actualHash = createHash("sha256").update(plan.content, "utf8").digest("hex");
    if (!plan.contentHash || actualHash !== plan.contentHash || actualHash !== input.expectedContentHash) {
      throw new Error("O hash SHA-256 do ACTION_PLAN não corresponde à versão apresentada.");
    }

    let parsed: any;
    try { parsed = JSON.parse(plan.content); } catch { throw new Error("O ACTION_PLAN aprovado não contém JSON válido."); }
    if (!Array.isArray(parsed?.tasks) || parsed.tasks.length === 0) {
      throw new Error("O ACTION_PLAN não contém unidades registráveis.");
    }
    const registeredAt = new Date().toISOString();
    const rows = parsed.tasks.map((unit: any) => {
      if (!/^T[0-9]{2}$/.test(unit?.id ?? "") || typeof unit?.title !== "string" || !unit.title.trim()) {
        throw new Error("O ACTION_PLAN contém uma unidade sem identificador ou título válido.");
      }
      return {
        missionTaskId: input.missionTaskId,
        actionPlanDocumentId: plan.documentId,
        actionPlanVersionId: plan.versionId,
        actionPlanVersionNumber: plan.version,
        actionPlanContentHash: actualHash,
        unitId: unit.id,
        unitTitle: unit.title,
        idempotencyKey: randomUUID(),
        state: "AWAITING_APPROVAL",
        governanceEvidence: {
          registration: {
            registeredAt,
            source: "approved_action_plan",
            actionPlanVersion: plan.version,
            actionPlanContentHash: actualHash,
          },
        },
      };
    });

    await tx.insert(missionActionUnits).values(rows).onConflictDoNothing();
    return tx.select({
      id: missionActionUnits.id,
      unitId: missionActionUnits.unitId,
      unitTitle: missionActionUnits.unitTitle,
      state: missionActionUnits.state,
      approvalUserId: missionActionUnits.approvalUserId,
      approvedAt: missionActionUnits.approvedAt,
      governanceEvidence: missionActionUnits.governanceEvidence,
    }).from(missionActionUnits)
      .where(and(
        eq(missionActionUnits.missionTaskId, input.missionTaskId),
        eq(missionActionUnits.actionPlanVersionId, plan.versionId),
      )).orderBy(asc(missionActionUnits.unitId));
  });
}

/** Records an explicit owner approval for one registered unit; this does not authorize dispatch. */
export async function approveMissionActionPlanUnit(input: {
  missionTaskId: number;
  ownerId: number;
  unitId: string;
  expectedVersion: number;
  expectedContentHash: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    const [mission] = await tx.select({ createdBy: tasks.createdBy, parentTaskId: tasks.parentTaskId })
      .from(tasks).where(eq(tasks.id, input.missionTaskId)).for("update").limit(1);
    if (!mission || mission.parentTaskId !== null || mission.createdBy !== input.ownerId) {
      throw new Error("Somente o proprietário da missão principal pode aprovar esta unidade.");
    }

    const [planDocument] = await tx.select({ id: missionDocuments.id })
      .from(missionDocuments)
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .where(and(
        eq(missionDocuments.taskId, input.missionTaskId),
        eq(missionDocuments.documentKey, "ACTION_PLAN"),
        eq(missionDocumentTypes.typeKey, "ACTION_PLAN"),
      )).limit(1);
    if (!planDocument) throw new Error("A missão não possui ACTION_PLAN.");
    const [latest] = await tx.select({
      id: missionDocumentVersions.id,
      version: missionDocumentVersions.version,
      state: missionDocumentVersions.state,
      content: missionDocumentVersions.content,
      contentHash: missionDocumentVersions.contentHash,
    }).from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, planDocument.id))
      .orderBy(desc(missionDocumentVersions.version)).limit(1);
    const actualHash = latest ? createHash("sha256").update(latest.content, "utf8").digest("hex") : "";
    if (!latest || latest.state !== "APPROVED"
      || latest.version !== input.expectedVersion
      || actualHash !== latest.contentHash
      || actualHash !== input.expectedContentHash) {
      throw new Error("A versão do ACTION_PLAN mudou ou não confere; a aprovação individual foi bloqueada.");
    }

    const [unit] = await tx.select().from(missionActionUnits)
      .where(and(
        eq(missionActionUnits.missionTaskId, input.missionTaskId),
        eq(missionActionUnits.actionPlanVersionId, latest.id),
        eq(missionActionUnits.unitId, input.unitId),
      )).for("update").limit(1);
    if (!unit) throw new Error("Unidade não registrada para a versão atual. Registre o ACTION_PLAN aprovado primeiro.");
    if (unit.state !== "AWAITING_APPROVAL") {
      throw new Error("A unidade não está aguardando aprovação ou já foi processada.");
    }
    if (latest.version !== unit.actionPlanVersionNumber || actualHash !== unit.actionPlanContentHash) {
      throw new Error("A identidade persistida da unidade não corresponde ao ACTION_PLAN vigente.");
    }

    const approvedAt = new Date();
    const evidence = {
      ...(unit.governanceEvidence as Record<string, unknown> ?? {}),
      individualApproval: {
        approvedAt: approvedAt.toISOString(),
        approvalUserId: input.ownerId,
        actionPlanVersion: latest.version,
        actionPlanContentHash: actualHash,
        scope: "unit_intent_only_no_execution_authorization",
      },
    };
    const [updated] = await tx.update(missionActionUnits).set({
      state: "APPROVED",
      approvalUserId: input.ownerId,
      approvedAt,
      governanceEvidence: evidence,
      updatedAt: approvedAt,
    }).where(eq(missionActionUnits.id, unit.id)).returning({
      id: missionActionUnits.id,
      unitId: missionActionUnits.unitId,
      unitTitle: missionActionUnits.unitTitle,
      state: missionActionUnits.state,
      approvalUserId: missionActionUnits.approvalUserId,
      approvedAt: missionActionUnits.approvedAt,
      governanceEvidence: missionActionUnits.governanceEvidence,
    });
    return updated;
  });
}

/**
 * Materializes only individually approved ACTION_PLAN units as PAUSED child tasks.
 * This is a structural operation only: no executor assignment, STAGED transition,
 * agent reservation, external task creation, or dispatch is performed.
 */
export async function materializeApprovedMissionActionPlanUnits(input: {
  missionTaskId: number;
  ownerId: number;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    const [mission] = await tx.select({
      id: tasks.id,
      createdBy: tasks.createdBy,
      parentTaskId: tasks.parentTaskId,
      title: tasks.title,
      priorityId: tasks.priorityId,
      creatorType: tasks.creatorType,
    }).from(tasks)
      .where(eq(tasks.id, input.missionTaskId))
      .for("update")
      .limit(1);

    if (!mission || mission.parentTaskId !== null || mission.createdBy !== input.ownerId) {
      throw new Error("Somente o proprietário da missão principal pode materializar suas unidades.");
    }

    const [planDocument] = await tx.select({ id: missionDocuments.id })
      .from(missionDocuments)
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .where(and(
        eq(missionDocuments.taskId, input.missionTaskId),
        eq(missionDocuments.documentKey, "ACTION_PLAN"),
        eq(missionDocumentTypes.typeKey, "ACTION_PLAN"),
      ))
      .limit(1)
      .for("update");
    if (!planDocument) throw new Error("A missão não possui ACTION_PLAN.");

    const [latestPlan] = await tx.select({
      id: missionDocumentVersions.id,
      version: missionDocumentVersions.version,
      state: missionDocumentVersions.state,
      content: missionDocumentVersions.content,
      contentHash: missionDocumentVersions.contentHash,
    }).from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, planDocument.id))
      .orderBy(desc(missionDocumentVersions.version))
      .for("update")
      .limit(1);

    if (!latestPlan || latestPlan.state !== "APPROVED") {
      throw new Error("Materialização bloqueada: a versão vigente do ACTION_PLAN não está aprovada.");
    }
    const actualHash = createHash("sha256").update(latestPlan.content, "utf8").digest("hex");
    if (!latestPlan.contentHash || actualHash !== latestPlan.contentHash) {
      throw new Error("Materialização bloqueada: o hash SHA-256 do ACTION_PLAN vigente não confere.");
    }

    let plan: ReturnType<typeof ActionPlanSchema.parse>;
    try {
      plan = ActionPlanSchema.parse(JSON.parse(latestPlan.content));
    } catch {
      throw new Error("Materialização bloqueada: o ACTION_PLAN vigente não corresponde ao contrato estruturado.");
    }

    const [pausedStatus] = await tx.select({ id: taskStatuses.id })
      .from(taskStatuses).where(eq(taskStatuses.name, "PAUSED")).limit(1);
    if (!pausedStatus) throw new Error("Materialização bloqueada: status PAUSED não está configurado.");

    const unitRows = await tx.select().from(missionActionUnits)
      .where(and(
        eq(missionActionUnits.missionTaskId, mission.id),
        eq(missionActionUnits.actionPlanDocumentId, planDocument.id),
        eq(missionActionUnits.actionPlanVersionId, latestPlan.id),
        eq(missionActionUnits.actionPlanVersionNumber, latestPlan.version),
        eq(missionActionUnits.actionPlanContentHash, actualHash),
      ))
      .orderBy(asc(missionActionUnits.unitId))
      .for("update");

    const planUnits = new Map<string, (typeof plan.tasks)[number]>(plan.tasks.map((unit) => [unit.id, unit] as const));
    if (unitRows.length !== plan.tasks.length
      || unitRows.some((row) => {
        const planUnit = planUnits.get(row.unitId);
        return !planUnit || planUnit.title !== row.unitTitle;
      })) {
      throw new Error("Materialização bloqueada: o registro persistido não representa todas as unidades da versão aprovada.");
    }

    const results: Array<{
      unitId: string;
      unitTitle: string;
      taskId: number;
      status: string;
      created: boolean;
    }> = [];

    for (const row of unitRows) {
      const unit = planUnits.get(row.unitId)!;
      if (row.operationalTaskId !== null) {
        const [existingTask] = await tx.select({
          id: tasks.id,
          createdBy: tasks.createdBy,
          parentTaskId: tasks.parentTaskId,
        }).from(tasks).where(eq(tasks.id, row.operationalTaskId)).limit(1);
        if (!existingTask || existingTask.createdBy !== mission.createdBy || existingTask.parentTaskId !== mission.id) {
          throw new Error(`Vínculo operacional inconsistente para ${row.unitId}; materialização interrompida.`);
        }
        results.push({
          unitId: row.unitId,
          unitTitle: row.unitTitle,
          taskId: existingTask.id,
          status: "EXISTING",
          created: false,
        });
        continue;
      }

      if (row.state !== "APPROVED") continue;
      if (row.approvalUserId !== input.ownerId || !row.approvedAt) {
        throw new Error(`Materialização bloqueada: aprovação individual inválida para ${row.unitId}.`);
      }

      const description = [
        `Unidade ${unit.id} do ACTION_PLAN aprovado (versão ${latestPlan.version}).`,
        `Objetivo da missão: ${plan.objective}`,
        `Descrição: ${unit.description}`,
        `Dependências: ${unit.dependsOn.length ? unit.dependsOn.join(", ") : "Nenhuma declarada"}`,
        `Critérios de aceite: ${unit.acceptanceCriteria}`,
        `Agente proposto (não atribuído): ${unit.proposedAgentId ?? "Nenhum"}`,
        `Justificativa do agente: ${unit.agentRationale}`,
        `Risco declarado: ${unit.risks.length ? unit.risks.join("; ") : "Nenhum declarado"}`,
        `Reversibilidade: ${unit.reversibility}`,
        `Riscos globais: ${plan.globalRisks.length ? plan.globalRisks.join("; ") : "Nenhum declarado"}`,
        "Governança: tarefa materializada em PAUSED; sem executor, reserva, autorização de execução ou dispatch. Não promover para STAGED antes da conclusão independente de todos os gates.",
      ].join("\n\n");

      const [inserted] = await tx.insert(tasks).values({
        createdBy: mission.createdBy,
        creatorType: mission.creatorType === "system" ? "system" : "user",
        title: `${unit.id} — ${unit.title}`,
        description,
        statusId: pausedStatus.id,
        priorityId: mission.priorityId,
        parentTaskId: mission.id,
        agentId: null,
        agentPinned: false,
        manusStatus: "awaiting_execution_governance",
        githubSyncStatus: "pending",
      }).returning({ id: tasks.id });

      if (!inserted) throw new Error(`Não foi possível criar a tarefa PAUSED para ${unit.id}.`);
      const missionKey = `SCP-TASK-${String(inserted.id).padStart(6, "0")}`;
      await tx.update(tasks).set({ missionKey, updatedAt: new Date() }).where(eq(tasks.id, inserted.id));

      const materializedAt = new Date();
      const evidence = {
        ...(row.governanceEvidence as Record<string, unknown> ?? {}),
        materialization: {
          materializedAt: materializedAt.toISOString(),
          operationalTaskId: inserted.id,
          operationalStatus: "PAUSED",
          executorAssigned: false,
          dispatchPerformed: false,
          actionPlanVersion: latestPlan.version,
          actionPlanContentHash: actualHash,
        },
      };
      const [linked] = await tx.update(missionActionUnits).set({
        operationalTaskId: inserted.id,
        governanceEvidence: evidence,
        updatedAt: materializedAt,
      }).where(and(
        eq(missionActionUnits.id, row.id),
        eq(missionActionUnits.state, "APPROVED"),
        isNull(missionActionUnits.operationalTaskId),
      )).returning({ id: missionActionUnits.id });

      if (!linked) throw new Error(`O vínculo operacional de ${unit.id} não pôde ser persistido com segurança.`);
      results.push({
        unitId: row.unitId,
        unitTitle: row.unitTitle,
        taskId: inserted.id,
        status: "PAUSED",
        created: true,
      });
    }

    if (results.length === 0) {
      throw new Error("Nenhuma unidade aprovada e ainda não materializada está disponível.");
    }

    return {
      missionTaskId: mission.id,
      actionPlanVersion: latestPlan.version,
      actionPlanContentHash: actualHash,
      dispatchPerformed: false as const,
      units: results,
    };
  });
}

/** Lists persisted unit governance state for the owner of the root mission. */
export async function listMissionActionPlanUnits(missionTaskId: number, ownerId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const [mission] = await database.select({ createdBy: tasks.createdBy, parentTaskId: tasks.parentTaskId })
    .from(tasks).where(eq(tasks.id, missionTaskId)).limit(1);
  if (!mission || mission.parentTaskId !== null || mission.createdBy !== ownerId) {
    throw new Error("Missão não encontrada ou sem permissão de acesso.");
  }
  const [planDocument] = await database.select({ id: missionDocuments.id })
    .from(missionDocuments)
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(and(
      eq(missionDocuments.taskId, missionTaskId),
      eq(missionDocuments.documentKey, "ACTION_PLAN"),
      eq(missionDocumentTypes.typeKey, "ACTION_PLAN"),
    )).limit(1);
  if (!planDocument) return [];
  const [latest] = await database.select({
    id: missionDocumentVersions.id,
    state: missionDocumentVersions.state,
  }).from(missionDocumentVersions)
    .where(eq(missionDocumentVersions.documentId, planDocument.id))
    .orderBy(desc(missionDocumentVersions.version)).limit(1);
  if (!latest || latest.state !== "APPROVED") return [];
  return database.select({
    id: missionActionUnits.id,
    unitId: missionActionUnits.unitId,
    unitTitle: missionActionUnits.unitTitle,
    state: missionActionUnits.state,
    approvalUserId: missionActionUnits.approvalUserId,
    approvedAt: missionActionUnits.approvedAt,
    operationalTaskId: missionActionUnits.operationalTaskId,
  }).from(missionActionUnits)
    .where(and(
      eq(missionActionUnits.missionTaskId, missionTaskId),
      eq(missionActionUnits.actionPlanVersionId, latest.id),
    ))
    .orderBy(asc(missionActionUnits.unitId));
}

export async function inspectTaskDispatchAuthorization(taskId: number): Promise<{
  authorized: boolean;
  requiresActionPlanUnit: boolean;
  idempotencyKey: string | null;
  reason: string | null;
}> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [relations] = await database.execute(sql`
    SELECT
      to_regclass('sandbox."missionDocuments"') IS NOT NULL AS documents_exist,
      to_regclass('sandbox."missionActionUnits"') IS NOT NULL AS action_units_exist
  `) as any;
  if (!relations?.documents_exist) {
    return { authorized: true, requiresActionPlanUnit: false, idempotencyKey: null, reason: null };
  }

  const missionId = await resolveMissionRootTaskId(database, taskId);
  if (missionId == null) {
    return { authorized: false, requiresActionPlanUnit: false, idempotencyKey: null, reason: "A missão raiz não pôde ser resolvida." };
  }

  const [actionPlanDocument] = await database
    .select({ id: missionDocuments.id })
    .from(missionDocuments)
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .where(and(
      eq(missionDocuments.taskId, missionId),
      eq(missionDocuments.documentKey, "ACTION_PLAN"),
      eq(missionDocumentTypes.typeKey, "ACTION_PLAN"),
    ))
    .limit(1);

  if (!actionPlanDocument) {
    return { authorized: true, requiresActionPlanUnit: false, idempotencyKey: null, reason: null };
  }

  const [latestPlan] = await database
    .select({
      documentId: missionDocuments.id,
      versionId: missionDocumentVersions.id,
      version: missionDocumentVersions.version,
      state: missionDocumentVersions.state,
      content: missionDocumentVersions.content,
      contentHash: missionDocumentVersions.contentHash,
    })
    .from(missionDocuments)
    .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
    .innerJoin(missionDocumentVersions, eq(missionDocumentVersions.documentId, missionDocuments.id))
    .where(and(
      eq(missionDocuments.id, actionPlanDocument.id),
      sql`${missionDocumentVersions.version} = (
        SELECT MAX(v2."version") FROM sandbox."missionDocumentVersions" v2
        WHERE v2."documentId" = ${missionDocuments.id}
      )`,
    ))
    .limit(1);

  if (!latestPlan) {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "O documento ACTION_PLAN existe, mas não possui versão persistida íntegra.",
    };
  }
  if (latestPlan.state !== "APPROVED") {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "Existe um ACTION_PLAN vigente sem aprovação humana atual; dispatch está bloqueado.",
    };
  }

  const actualHash = createHash("sha256").update(latestPlan.content, "utf8").digest("hex");
  if (!latestPlan.contentHash || actualHash !== latestPlan.contentHash) {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "A integridade SHA-256 do ACTION_PLAN aprovado não confere.",
    };
  }
  const [operationalTask] = await database
    .select({ parentTaskId: tasks.parentTaskId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  if (!operationalTask || operationalTask.parentTaskId !== missionId) {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "A unidade operacional precisa ser filha direta da missão raiz.",
    };
  }

  if (!relations.action_units_exist) {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "A persistência de identidade/autorização das unidades ainda não está instalada.",
    };
  }

  const [unit] = await database
    .select({
      unitId: missionActionUnits.unitId,
      unitTitle: missionActionUnits.unitTitle,
      idempotencyKey: missionActionUnits.idempotencyKey,
    })
    .from(missionActionUnits)
    .where(and(
      eq(missionActionUnits.missionTaskId, missionId),
      eq(missionActionUnits.actionPlanDocumentId, latestPlan.documentId),
      eq(missionActionUnits.actionPlanVersionId, latestPlan.versionId),
      eq(missionActionUnits.actionPlanVersionNumber, latestPlan.version),
      eq(missionActionUnits.actionPlanContentHash, latestPlan.contentHash),
      eq(missionActionUnits.operationalTaskId, taskId),
      eq(missionActionUnits.state, "READY_FOR_DISPATCH"),
      sql`${missionActionUnits.approvalUserId} IS NOT NULL`,
      sql`${missionActionUnits.approvedAt} IS NOT NULL`,
    ))
    .limit(1);

  if (!unit || !unit.idempotencyKey) {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "A tarefa não possui vínculo aprovado e pronto para dispatch com uma unidade Txx da versão vigente.",
    };
  }

  let planTasks: Array<{ id?: string; title?: string }> = [];
  try {
    const parsed = JSON.parse(latestPlan.content);
    planTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "O conteúdo do ACTION_PLAN não é JSON válido.",
    };
  }
  if (!planTasks.some((item) => item.id === unit.unitId && item.title === unit.unitTitle)) {
    return {
      authorized: false,
      requiresActionPlanUnit: true,
      idempotencyKey: null,
      reason: "A unidade persistida não corresponde ao conteúdo exato do ACTION_PLAN aprovado.",
    };
  }

  return {
    authorized: true,
    requiresActionPlanUnit: true,
    idempotencyKey: unit.idempotencyKey,
    reason: null,
  };
}

/**
 * Approves the exact latest ACTION_PLAN proposal version.
 * Approval is appended as a new immutable document version and never releases execution.
 */
export async function approveMissionActionPlanVersion(input: {
  taskId: number;
  documentId: number;
  ownerId: number;
  expectedVersion: number;
  expectedContentHash: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (transaction) => {
    const [document] = await transaction
      .select({
        id: missionDocuments.id,
        taskId: missionDocuments.taskId,
        typeKey: missionDocumentTypes.typeKey,
        ownerId: tasks.createdBy,
      })
      .from(missionDocuments)
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .innerJoin(tasks, eq(missionDocuments.taskId, tasks.id))
      .where(and(
        eq(missionDocuments.id, input.documentId),
        eq(missionDocuments.taskId, input.taskId),
        eq(tasks.createdBy, input.ownerId),
      ))
      .limit(1)
      .for("update");

    if (!document || document.typeKey !== "ACTION_PLAN") {
      throw new Error("Action plan not found or access denied");
    }

    const [latest] = await transaction
      .select()
      .from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, document.id))
      .orderBy(desc(missionDocumentVersions.version))
      .limit(1);

    if (!latest || latest.state !== "PROPOSED") {
      throw new Error("Only the current PROPOSED action plan can be approved");
    }
    if (latest.version !== input.expectedVersion || !latest.contentHash
      || latest.contentHash !== input.expectedContentHash) {
      throw new Error("The action plan changed after it was displayed; reload and review the current version");
    }

    const actualHash = createHash("sha256").update(latest.content, "utf8").digest("hex");
    if (actualHash !== latest.contentHash) {
      throw new Error("Action plan integrity check failed; approval was rejected");
    }

    const [sourceBlueprint] = await transaction
      .select({
        id: missionDocumentVersions.id,
        documentId: missionDocumentVersions.documentId,
        state: missionDocumentVersions.state,
        sourceDocumentVersionId: missionDocumentVersions.sourceDocumentVersionId,
        typeKey: missionDocumentTypes.typeKey,
        sourceTaskId: missionDocuments.taskId,
      })
      .from(missionDocumentVersions)
      .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .where(eq(missionDocumentVersions.id, latest.sourceDocumentVersionId ?? -1))
      .limit(1);

    if (!sourceBlueprint || sourceBlueprint.typeKey !== "BLUEPRINT" || sourceBlueprint.sourceTaskId !== input.taskId) {
      throw new Error("Action plan source Blueprint is missing or belongs to another mission");
    }
    const [currentBlueprint] = await transaction
      .select({ id: missionDocumentVersions.id })
      .from(missionDocumentVersions)
      .where(eq(missionDocumentVersions.documentId, sourceBlueprint.documentId))
      .orderBy(desc(missionDocumentVersions.version))
      .limit(1);
    const [currentTR] = await transaction
      .select({
        id: missionDocumentVersions.id,
        state: missionDocumentVersions.state,
      })
      .from(missionDocumentVersions)
      .innerJoin(missionDocuments, eq(missionDocumentVersions.documentId, missionDocuments.id))
      .innerJoin(missionDocumentTypes, eq(missionDocuments.documentTypeId, missionDocumentTypes.id))
      .where(and(
        eq(missionDocuments.taskId, input.taskId),
        eq(missionDocuments.documentKey, "TR"),
        eq(missionDocumentTypes.typeKey, "TR"),
      ))
      .orderBy(desc(missionDocumentVersions.version))
      .limit(1);

    if (!currentBlueprint || currentBlueprint.id !== sourceBlueprint.id
      || !["READY", "ACTIVE"].includes(sourceBlueprint.state)
      || !currentTR || !["VALIDATED", "ACTIVE", "REORIENTED"].includes(currentTR.state)
      || sourceBlueprint.sourceDocumentVersionId !== currentTR.id) {
      throw new Error("The action plan is stale: its exact source Blueprint/TR is no longer current and execution-ready");
    }

    await validateMissionDocumentAuthor(transaction, document.ownerId, {
      authorType: "HUMAN",
      authorUserId: input.ownerId,
    });

    const [approvedVersion] = await transaction
      .insert(missionDocumentVersions)
      .values({
        documentId: document.id,
        version: latest.version + 1,
        state: "APPROVED",
        content: latest.content,
        authorType: "HUMAN",
        authorUserId: input.ownerId,
        sourceDocumentVersionId: latest.sourceDocumentVersionId,
        provenance: {
          action: "explicit_human_approval",
          approvedProposalVersionId: latest.id,
          approvedProposalVersion: latest.version,
          approvedProposalContentHash: latest.contentHash,
        },
        changeSummary: "Aprovação humana explícita da proposta v" + latest.version,
        contentHash: latest.contentHash,
        publishedAt: new Date(),
      })
      .returning();

    await transaction.update(missionDocuments)
      .set({ updatedAt: new Date() })
      .where(eq(missionDocuments.id, document.id));

    return approvedVersion;
  });
}
