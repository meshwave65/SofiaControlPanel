import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index, foreignKey } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// AGENT MANAGEMENT TABLES
// ============================================

export const agents = mysqlTable(
  "agents",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["online", "offline", "idle", "paused"]).default("offline").notNull(),
    version: varchar("version", { length: 64 }),
    manusAccount: varchar("manusAccount", { length: 255 }),
    manusPassword: varchar("manusPassword", { length: 255 }),
    manusToken: text("manusToken"),
    lastHeartbeat: timestamp("lastHeartbeat"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("agents_ownerId_idx").on(table.ownerId),
    statusIdx: index("agents_status_idx").on(table.status),
    ownerIdFk: foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  })
);

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// ============================================
// TASK MANAGEMENT TABLES
// ============================================

export const taskStatuses = mysqlTable("taskStatuses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskStatus = typeof taskStatuses.$inferSelect;
export type InsertTaskStatus = typeof taskStatuses.$inferInsert;

export const taskPriorities = mysqlTable("taskPriorities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  level: int("level").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskPriority = typeof taskPriorities.$inferSelect;
export type InsertTaskPriority = typeof taskPriorities.$inferInsert;

export const tasks = mysqlTable(
  "tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId"),
    createdBy: int("createdBy").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    statusId: int("statusId").notNull(),
    priorityId: int("priorityId").notNull(),
    parentTaskId: int("parentTaskId"),
    dueDate: timestamp("dueDate"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("tasks_agentId_idx").on(table.agentId),
    statusIdIdx: index("tasks_statusId_idx").on(table.statusId),
    createdByIdx: index("tasks_createdBy_idx").on(table.createdBy),
    agentIdFk: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agents.id],
    }).onDelete("set null"),
    createdByFk: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    statusIdFk: foreignKey({
      columns: [table.statusId],
      foreignColumns: [taskStatuses.id],
    }).onDelete("restrict"),
    priorityIdFk: foreignKey({
      columns: [table.priorityId],
      foreignColumns: [taskPriorities.id],
    }).onDelete("restrict"),
    parentTaskIdFk: foreignKey({
      columns: [table.parentTaskId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
  })
);

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================
// MESSAGE SYSTEM TABLES
// ============================================

export const messageTypes = mysqlTable("messageTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageType = typeof messageTypes.$inferSelect;
export type InsertMessageType = typeof messageTypes.$inferInsert;

export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    taskId: int("taskId").notNull(),
    senderId: int("senderId").notNull(),
    parentMessageId: int("parentMessageId"),
    typeId: int("typeId").notNull(),
    content: text("content").notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    taskIdIdx: index("messages_taskId_idx").on(table.taskId),
    senderIdIdx: index("messages_senderId_idx").on(table.senderId),
    parentMessageIdIdx: index("messages_parentMessageId_idx").on(table.parentMessageId),
    taskIdFk: foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
    }).onDelete("cascade"),
    senderIdFk: foreignKey({
      columns: [table.senderId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    parentMessageIdFk: foreignKey({
      columns: [table.parentMessageId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
    typeIdFk: foreignKey({
      columns: [table.typeId],
      foreignColumns: [messageTypes.id],
    }).onDelete("restrict"),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================
// ACTIVITY LOGGING TABLES
// ============================================

export const activityEventTypes = mysqlTable("activityEventTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityEventType = typeof activityEventTypes.$inferSelect;
export type InsertActivityEventType = typeof activityEventTypes.$inferInsert;

export const activityLogs = mysqlTable(
  "activityLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    taskId: int("taskId"),
    eventTypeId: int("eventTypeId").notNull(),
    details: text("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("activityLogs_agentId_idx").on(table.agentId),
    taskIdIdx: index("activityLogs_taskId_idx").on(table.taskId),
    eventTypeIdIdx: index("activityLogs_eventTypeId_idx").on(table.eventTypeId),
    createdAtIdx: index("activityLogs_createdAt_idx").on(table.createdAt),
    agentIdFk: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agents.id],
    }).onDelete("cascade"),
    taskIdFk: foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
    }).onDelete("set null"),
    eventTypeIdFk: foreignKey({
      columns: [table.eventTypeId],
      foreignColumns: [activityEventTypes.id],
    }).onDelete("restrict"),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ============================================
// CONTEXT REPORT TABLES
// ============================================

export const contextReports = mysqlTable(
  "contextReports",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    creditsUsed: decimal("creditsUsed", { precision: 10, scale: 2 }),
    gitHubUrl: varchar("gitHubUrl", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("contextReports_ownerId_idx").on(table.ownerId),
    createdAtIdx: index("contextReports_createdAt_idx").on(table.createdAt),
    ownerIdFk: foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  })
);

export type ContextReport = typeof contextReports.$inferSelect;
export type InsertContextReport = typeof contextReports.$inferInsert;

// ============================================
// SCHEDULED TASKS TABLE
// ============================================

export const scheduledTasks = mysqlTable(
  "scheduledTasks",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    cronExpression: varchar("cronExpression", { length: 64 }).notNull(),
    endpoint: varchar("endpoint", { length: 512 }).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    lastRun: timestamp("lastRun"),
    nextRun: timestamp("nextRun"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("scheduledTasks_isActive_idx").on(table.isActive),
  })
);

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  tasksCreated: many(tasks, { relationName: "createdBy" }),
  messages: many(messages),
  contextReports: many(contextReports),
  activityLogs: many(activityLogs),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  owner: one(users, {
    fields: [agents.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const taskStatusesRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(tasks),
}));

export const taskPrioritiesRelations = relations(taskPriorities, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  agent: one(agents, {
    fields: [tasks.agentId],
    references: [agents.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdBy",
  }),
  status: one(taskStatuses, {
    fields: [tasks.statusId],
    references: [taskStatuses.id],
  }),
  priority: one(taskPriorities, {
    fields: [tasks.priorityId],
    references: [taskPriorities.id],
  }),
  messages: many(messages),
  activityLogs: many(activityLogs),
}));

export const messageTypesRelations = relations(messageTypes, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  task: one(tasks, {
    fields: [messages.taskId],
    references: [tasks.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  type: one(messageTypes, {
    fields: [messages.typeId],
    references: [messageTypes.id],
  }),
}));

export const messagesThreadRelations = relations(messages, ({ one, many }) => ({
  parentMessage: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
    relationName: "replies",
  } as any),
  replies: many(messages, { relationName: "replies" }),
}))

export const activityEventTypesRelations = relations(activityEventTypes, ({ many }) => ({
  activityLogs: many(activityLogs),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  agent: one(agents, {
    fields: [activityLogs.agentId],
    references: [agents.id],
  }),
  task: one(tasks, {
    fields: [activityLogs.taskId],
    references: [tasks.id],
  }),
  eventType: one(activityEventTypes, {
    fields: [activityLogs.eventTypeId],
    references: [activityEventTypes.id],
  }),
}));

export const contextReportsRelations = relations(contextReports, ({ one }) => ({
  owner: one(users, {
    fields: [contextReports.ownerId],
    references: [users.id],
  }),
}));
