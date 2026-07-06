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
        setTimeout(() => {
          import('./seed').catch(err => console.error("[Database] Seed error:", err));
        }, 1000);
      } catch (error) {
        console.error("[Database] Failed to connect:", error);
        _db = null;
      }
    } else {
      console.error("[Database] DATABASE_URL is not defined");
    }
  }
  return _db;
}

// ============================================
// USERS
// ============================================
export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(users).values(user).onDuplicateKeyUpdate({
      set: user
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// AGENTS
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

  return db.insert(agents).values({
    ownerId: data.ownerId,
    name: data.name,
    description: data.description,
    version: data.version,
    manusAccount: data.manusAccount,
    manusPassword: data.manusPassword,
    manusToken: data.manusToken,
    status: "offline",
  });
}

export async function getAgentsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents).where(eq(agents.ownerId, ownerId));
}

// ============================================
// TASKS
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
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(tasks).values({
    client_id: data.createdBy,
    title: data.title,
    description: data.description,
    status_id: data.statusId,
    priority_id: data.priorityId,
    parent_task_id: data.parentTaskId,
    due_date: data.dueDate,
  });
}

export async function getAllTasks(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tasks).where(eq(tasks.client_id, ownerId)).orderBy(desc(tasks.created_at));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tasks).where(eq(tasks.task_id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Adicione as outras funções conforme necessário...

export async function getDashboardStats(ownerId: number) {
  const db = await getDb();
  if (!db) return { totalAgents: 0, onlineAgents: 0, totalTasks: 0, pendingTasks: 0, unreadMessages: 0 };

  const allAgents = await db.select().from(agents).where(eq(agents.ownerId, ownerId));
  const allTasks = await db.select().from(tasks).where(eq(tasks.client_id, ownerId));

  return {
    totalAgents: allAgents.length,
    onlineAgents: allAgents.filter(a => a.status === "online").length,
    totalTasks: allTasks.length,
    pendingTasks: allTasks.filter(t => t.status_id !== 130).length,
    unreadMessages: 0,
  };
}
