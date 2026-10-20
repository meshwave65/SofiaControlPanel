import { eq, and, desc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, InsertAgent, users, agents, tasks, messages, activityLogs, contextReports, taskStatuses, taskPriorities, messageTypes, activityEventTypes } from "../drizzle/schema";
import { ENV } from './_core/env';
import { encryptCredential } from './credentials';

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
    if (user.role !== undefined) {
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

export async function getAgentsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(agents).where(eq(agents.ownerId, ownerId));
  return rows.map(toPublicAgent);
}
export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? toPublicAgent(result[0]) : null;
}

export async function getAgentByIdForOwner(id: number, ownerId: number) {
  const database = await getDb();
  if (!database) return null;
  const result = await database
    .select()
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.ownerId, ownerId)))
    .limit(1);
  return result.length > 0 ? toPublicAgent(result[0]) : null;
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
  createdBy: number;
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

  return db.insert(tasks).values(data);
}

export async function getTasksByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(eq(tasks.agentId, agentId));
}

export async function getTasksByAgentIdForOwner(agentId: number, ownerId: number) {
  const agent = await getAgentByIdForOwner(agentId, ownerId);
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

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTaskStatus(id: number, statusId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(tasks).set({ statusId, updatedAt: new Date() }).where(eq(tasks.id, id));
}

// ============================================
// MESSAGES HELPERS
// ============================================

export async function createMessage(data: { taskId: number; senderId: number; parentMessageId?: number; typeId: number; content: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(messages).values(data);
}

export async function getMessagesByTaskId(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(messages).where(eq(messages.taskId, taskId)).orderBy(desc(messages.createdAt));
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

export async function createActivityLog(data: { agentId: number; taskId?: number; eventTypeId: number; details?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(activityLogs).values(data);
}

export async function getActivityLogsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(activityLogs).where(eq(activityLogs.agentId, agentId)).orderBy(desc(activityLogs.createdAt));
}

export async function getActivityLogsByAgentIdForOwner(agentId: number, ownerId: number) {
  const agent = await getAgentByIdForOwner(agentId, ownerId);
  if (!agent) return [];
  return getActivityLogsByAgentId(agentId);
}

export async function getRecentActivityLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

export async function getAllTasks(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(eq(tasks.createdBy, ownerId)).orderBy(desc(tasks.createdAt));
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

  // Unread messages are messages sent TO the owner (senderId != ownerId) that are not read
  const unreadMessages = await db.select().from(messages).where(and(eq(messages.isRead, false)));

  // Um agente é considerado online se o heartbeat foi nos últimos 5 minutos
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineAgents = allAgents.filter(a => (a.lastHeartbeat && a.lastHeartbeat > fiveMinutesAgo) || a.status === "online").length;

  return {
    totalAgents: allAgents.length,
    onlineAgents,
    totalTasks: allTasks.length,
    pendingTasks: allTasks.filter(t => t.statusId !== 130).length, // 130 is 'DONE'
    unreadMessages: unreadMessages.length,
  };
}

export async function getLookups() {
  const db = await getDb();
  if (!db) return { statuses: [], priorities: [], messageTypes: [], eventTypes: [] };

  const [statuses, priorities, mTypes, eTypes] = await Promise.all([
    db.select().from(taskStatuses),
    db.select().from(taskPriorities),
    db.select().from(messageTypes),
    db.select().from(activityEventTypes),
  ]);

  return { statuses, priorities, messageTypes: mTypes, eventTypes: eTypes };
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
