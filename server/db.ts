import { eq, and, desc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertAgent, users, agents, tasks, messages, activityLogs, contextReports, taskStatuses, taskPriorities, messageTypes, activityEventTypes } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
    if (url) {
      try {
        _db = drizzle(url);
        console.log("[Database] Connected successfully");
      } catch (error) {
        console.error("[Database] Failed to connect:", error);
        _db = null;
      }
    } else {
      console.error("[Database] DATABASE_URL is not defined in environment variables");
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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
    manusPassword: data.manusPassword,
    manusToken: data.manusToken,
    status: "offline",
  });
  
  return result;
}

export async function getAgentsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agents).where(eq(agents.ownerId, ownerId));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
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
  
  return db.update(agents).set({ ...data, updatedAt: new Date() }).where(eq(agents.id, id));
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
  
  const result = await db.insert(taskStatuses).values({ name });
  return { id: result[0].insertId, name };
}

export async function getOrCreateTaskPriority(name: string, level: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(taskPriorities).where(eq(taskPriorities.name, name)).limit(1);
  if (existing.length > 0) return existing[0];
  
  const result = await db.insert(taskPriorities).values({ name, level });
  return { id: result[0].insertId, name, level };
}

export async function getOrCreateMessageType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(messageTypes).where(eq(messageTypes.name, name)).limit(1);
  if (existing.length > 0) return existing[0];
  
  const result = await db.insert(messageTypes).values({ name });
  return { id: result[0].insertId, name };
}

export async function getOrCreateActivityEventType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(activityEventTypes).where(eq(activityEventTypes.name, name)).limit(1);
  if (existing.length > 0) return existing[0];
  
  const result = await db.insert(activityEventTypes).values({ name });
  return { id: result[0].insertId, name };
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
  
  return db.select().from(tasks);
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
