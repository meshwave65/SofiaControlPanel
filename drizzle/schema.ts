import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: index("openId_idx").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agentes autônomos gerenciados pelo sistema.
 * Cada agente representa uma instância de automação/orquestração.
 */
export const agents = mysqlTable(
  "agents",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["online", "offline", "idle", "paused"]).default("offline").notNull(),
    lastHeartbeat: timestamp("lastHeartbeat"),
    config: text("config"), // JSON string with agent configuration
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("agents_ownerId_idx").on(table.ownerId),
    statusIdx: index("agents_status_idx").on(table.status),
  })
);

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Status de tarefas (lookup table).
 */
export const taskStatuses = mysqlTable("taskStatuses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  color: varchar("color", { length: 32 }).default("#6b7280"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskStatus = typeof taskStatuses.$inferSelect;
export type InsertTaskStatus = typeof taskStatuses.$inferInsert;

/**
 * Prioridades de tarefas (lookup table).
 */
export const taskPriorities = mysqlTable("taskPriorities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  level: int("level").notNull(), // 1=low, 2=medium, 3=high, 4=critical
  color: varchar("color", { length: 32 }).default("#6b7280"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskPriority = typeof taskPriorities.$inferSelect;
export type InsertTaskPriority = typeof taskPriorities.$inferInsert;

/**
 * Tarefas a serem executadas por agentes.
 */
export const tasks = mysqlTable(
  "tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    statusId: int("statusId").notNull(),
    priorityId: int("priorityId").notNull(),
    createdBy: int("createdBy").notNull(),
    dueDate: timestamp("dueDate"),
    completedAt: timestamp("completedAt"),
    metadata: text("metadata"), // JSON string with task-specific data
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("tasks_agentId_idx").on(table.agentId),
    statusIdIdx: index("tasks_statusId_idx").on(table.statusId),
    createdByIdx: index("tasks_createdBy_idx").on(table.createdBy),
    createdAtIdx: index("tasks_createdAt_idx").on(table.createdAt),
  })
);

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Tipos de mensagens (lookup table).
 */
export const messageTypes = mysqlTable("messageTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageType = typeof messageTypes.$inferSelect;
export type InsertMessageType = typeof messageTypes.$inferInsert;

/**
 * Mensagens e perguntas associadas a tarefas.
 * Suporta threads via parent_message_id.
 */
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    taskId: int("taskId").notNull(),
    senderId: int("senderId").notNull(),
    typeId: int("typeId").notNull(),
    content: text("content").notNull(),
    parentMessageId: int("parentMessageId"),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    taskIdIdx: index("messages_taskId_idx").on(table.taskId),
    senderIdIdx: index("messages_senderId_idx").on(table.senderId),
    parentMessageIdIdx: index("messages_parentMessageId_idx").on(table.parentMessageId),
    createdAtIdx: index("messages_createdAt_idx").on(table.createdAt),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Tipos de eventos de atividade (lookup table).
 */
export const activityEventTypes = mysqlTable("activityEventTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityEventType = typeof activityEventTypes.$inferSelect;
export type InsertActivityEventType = typeof activityEventTypes.$inferInsert;

/**
 * Logs de atividade para auditoria e monitoramento.
 */
export const activityLogs = mysqlTable(
  "activityLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId"),
    taskId: int("taskId"),
    eventTypeId: int("eventTypeId").notNull(),
    description: text("description"),
    metadata: text("metadata"), // JSON string with event details
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("activityLogs_agentId_idx").on(table.agentId),
    taskIdIdx: index("activityLogs_taskId_idx").on(table.taskId),
    createdAtIdx: index("activityLogs_createdAt_idx").on(table.createdAt),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Relatórios de passagem de contexto para continuidade entre sessões.
 */
export const contextReports = mysqlTable(
  "contextReports",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(), // Markdown content
    creditsRemaining: int("creditsRemaining"),
    gitHubUrl: varchar("gitHubUrl", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("contextReports_ownerId_idx").on(table.ownerId),
    createdAtIdx: index("contextReports_createdAt_idx").on(table.createdAt),
  })
);

export type ContextReport = typeof contextReports.$inferSelect;
export type InsertContextReport = typeof contextReports.$inferInsert;

/**
 * Tarefas agendadas para execução periódica.
 */
export const scheduledTasks = mysqlTable(
  "scheduledTasks",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    cronExpression: varchar("cronExpression", { length: 128 }).notNull(),
    handler: varchar("handler", { length: 255 }).notNull(), // Endpoint ou função a chamar
    isActive: boolean("isActive").default(true).notNull(),
    lastRun: timestamp("lastRun"),
    nextRun: timestamp("nextRun"),
    metadata: text("metadata"), // JSON string with task configuration
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("scheduledTasks_isActive_idx").on(table.isActive),
    nextRunIdx: index("scheduledTasks_nextRun_idx").on(table.nextRun),
  })
);

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;
