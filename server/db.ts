import { eq, and, desc, asc, isNull, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  InsertAgent,
  tasks,
  InsertTask,
  messages,
  InsertMessage,
  activityLogs,
  InsertActivityLog,
  contextReports,
  InsertContextReport,
  taskStatuses,
  InsertTaskStatus,
  taskPriorities,
  InsertTaskPriority,
  messageTypes,
  InsertMessageType,
  activityEventTypes,
  InsertActivityEventType,
  scheduledTasks,
  InsertScheduledTask,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// AGENT OPERATIONS
// ============================================================================

export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(data);
  return result;
}

export async function getAgentsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agents).where(eq(agents.ownerId, ownerId));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAgentStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(agents).set({ status: status as any }).where(eq(agents.id, id));
}

export async function updateAgentHeartbeat(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(agents)
    .set({ lastHeartbeat: new Date(), status: "online" })
    .where(eq(agents.id, id));
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(agents).set(data).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(agents).where(eq(agents.id, id));
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agents);
}

// ============================================================================
// TASK OPERATIONS
// ============================================================================

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(tasks).values(data);
}

export async function getTasksByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks).where(eq(tasks.agentId, agentId));
}

export async function getTasksByStatus(statusId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks).where(eq(tasks.statusId, statusId));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTaskStatus(id: number, statusId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(tasks).set({ statusId }).where(eq(tasks.id, id));
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(tasks).where(eq(tasks.id, id));
}

export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks);
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(messages).values(data);
}

export async function getMessagesByTaskId(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.taskId, taskId))
    .orderBy(asc(messages.createdAt));
}

export async function getMessagesByParentId(parentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.parentMessageId, parentId))
    .orderBy(asc(messages.createdAt));
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
}

export async function getMessageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(messages).where(eq(messages.id, id));
}

// ============================================================================
// ACTIVITY LOG OPERATIONS
// ============================================================================

export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(activityLogs).values(data);
}

export async function getActivityLogsByAgentId(agentId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.agentId, agentId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getRecentActivityLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getActivityLogsByTaskId(taskId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.taskId, taskId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function deleteActivityLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(activityLogs).where(eq(activityLogs.id, id));
}

// ============================================================================
// CONTEXT REPORT OPERATIONS
// ============================================================================

export async function createContextReport(data: InsertContextReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(contextReports).values(data);
}

export async function getRecentContextReports(ownerId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(contextReports)
    .where(eq(contextReports.ownerId, ownerId))
    .orderBy(desc(contextReports.createdAt))
    .limit(limit);
}

export async function updateContextReportGitHub(id: number, url: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(contextReports).set({ gitHubUrl: url }).where(eq(contextReports.id, id));
}

export async function getContextReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(contextReports)
    .where(eq(contextReports.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteContextReport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(contextReports).where(eq(contextReports.id, id));
}

// ============================================================================
// LOOKUP TABLE OPERATIONS
// ============================================================================

export async function getOrCreateTaskStatus(name: string, color = "#6b7280") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(taskStatuses)
    .where(eq(taskStatuses.name, name))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(taskStatuses).values({ name, color });
  const newStatus = await db
    .select()
    .from(taskStatuses)
    .where(eq(taskStatuses.name, name))
    .limit(1);

  return newStatus[0];
}

export async function getOrCreateTaskPriority(name: string, level: number, color = "#6b7280") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(taskPriorities)
    .where(eq(taskPriorities.name, name))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(taskPriorities).values({ name, level, color });
  const newPriority = await db
    .select()
    .from(taskPriorities)
    .where(eq(taskPriorities.name, name))
    .limit(1);

  return newPriority[0];
}

export async function getOrCreateMessageType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(messageTypes)
    .where(eq(messageTypes.name, name))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(messageTypes).values({ name });
  const newType = await db
    .select()
    .from(messageTypes)
    .where(eq(messageTypes.name, name))
    .limit(1);

  return newType[0];
}

export async function getOrCreateActivityEventType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(activityEventTypes)
    .where(eq(activityEventTypes.name, name))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(activityEventTypes).values({ name });
  const newType = await db
    .select()
    .from(activityEventTypes)
    .where(eq(activityEventTypes.name, name))
    .limit(1);

  return newType[0];
}

export async function getAllTaskStatuses() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(taskStatuses);
}

export async function getAllTaskPriorities() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(taskPriorities).orderBy(asc(taskPriorities.level));
}

export async function getAllMessageTypes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messageTypes);
}

export async function getAllActivityEventTypes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityEventTypes);
}

// ============================================================================
// SCHEDULED TASK OPERATIONS
// ============================================================================

export async function createScheduledTask(data: InsertScheduledTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scheduledTasks).values(data);
}

export async function getActiveScheduledTasks() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scheduledTasks)
    .where(eq(scheduledTasks.isActive, true))
    .orderBy(asc(scheduledTasks.nextRun));
}

export async function updateScheduledTaskNextRun(id: number, nextRun: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(scheduledTasks)
    .set({ lastRun: new Date(), nextRun })
    .where(eq(scheduledTasks.id, id));
}

export async function getScheduledTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(scheduledTasks)
    .where(eq(scheduledTasks.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateScheduledTask(id: number, data: Partial<InsertScheduledTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(scheduledTasks).set(data).where(eq(scheduledTasks.id, id));
}

export async function deleteScheduledTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(scheduledTasks).where(eq(scheduledTasks.id, id));
}
