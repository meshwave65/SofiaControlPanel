import { integer, pgEnum, pgTable, pgSchema, text, timestamp, varchar, boolean, numeric, jsonb, index, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const sofia = pgSchema("sofia");

export const roleEnum = sofia.enum("role", ["user", "admin"]);
export const agentStatusEnum = sofia.enum("agent_status", ["online", "offline", "idle", "paused"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sofia.table("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// AGENT MANAGEMENT TABLES
// ============================================

export const agents = sofia.table(
  "agents",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    ownerId: integer("ownerId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: agentStatusEnum("status").default("offline").notNull(),
    version: varchar("version", { length: 64 }),
    manusAccount: varchar("manusAccount", { length: 255 }),
    manusPassword: varchar("manusPassword", { length: 255 }),
    manusToken: text("manusToken"),
    lastHeartbeat: timestamp("lastHeartbeat"),
    connectionStatus: varchar("connectionStatus", { length: 32 }).default("not_configured").notNull(),
    connectionError: text("connectionError"),
    creditsRemaining: numeric("creditsRemaining", { precision: 12, scale: 2 }),
    creditsUpdatedAt: timestamp("creditsUpdatedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

export const taskStatuses = sofia.table("taskStatuses", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskStatus = typeof taskStatuses.$inferSelect;
export type InsertTaskStatus = typeof taskStatuses.$inferInsert;

export const taskPriorities = sofia.table("taskPriorities", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  level: integer("level").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskPriority = typeof taskPriorities.$inferSelect;
export type InsertTaskPriority = typeof taskPriorities.$inferInsert;

export const tasks = sofia.table(
  "tasks",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    agentId: integer("agentId"),
    createdBy: integer("createdBy").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    statusId: integer("statusId").notNull(),
    priorityId: integer("priorityId").notNull(),
    parentTaskId: integer("parentTaskId"),
    dueDate: timestamp("dueDate"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

export const messageTypes = sofia.table("messageTypes", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageType = typeof messageTypes.$inferSelect;
export type InsertMessageType = typeof messageTypes.$inferInsert;

export const messages = sofia.table(
  "messages",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    taskId: integer("taskId").notNull(),
    senderId: integer("senderId").notNull(),
    parentMessageId: integer("parentMessageId"),
    typeId: integer("typeId").notNull(),
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

export const activityEventTypes = sofia.table("activityEventTypes", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityEventType = typeof activityEventTypes.$inferSelect;
export type InsertActivityEventType = typeof activityEventTypes.$inferInsert;

export const activityLogs = sofia.table(
  "activityLogs",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    agentId: integer("agentId").notNull(),
    taskId: integer("taskId"),
    eventTypeId: integer("eventTypeId").notNull(),
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

export const contextReports = sofia.table(
  "contextReports",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    ownerId: integer("ownerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    creditsUsed: numeric("creditsUsed", { precision: 10, scale: 2 }),
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

export const scheduledTasks = sofia.table(
  "scheduledTasks",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    cronExpression: varchar("cronExpression", { length: 64 }).notNull(),
    endpoint: varchar("endpoint", { length: 512 }).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    lastRun: timestamp("lastRun"),
    nextRun: timestamp("nextRun"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("scheduledTasks_isActive_idx").on(table.isActive),
  })
);

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;

// ============================================
// ARC / PGC ASSESSMENT TABLES
// ============================================

export const arcPolicies = sofia.table(
  "arcPolicies",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    name: varchar("name", { length: 128 }).notNull().unique(),
    prior: numeric("prior", { precision: 7, scale: 6 }).notNull().default("0.500000"),
    allowThreshold: numeric("allowThreshold", { precision: 7, scale: 6 }).notNull().default("0.850000"),
    reviewThreshold: numeric("reviewThreshold", { precision: 7, scale: 6 }).notNull().default("0.550000"),
    enabled: boolean("enabled").notNull().default(true),
    version: varchar("version", { length: 32 }).notNull().default("0.1.0"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    enabledIdx: index("arcPolicies_enabled_idx").on(table.enabled),
  }),
);

export type ArcPolicy = typeof arcPolicies.$inferSelect;
export type InsertArcPolicy = typeof arcPolicies.$inferInsert;

export const arcAssessments = sofia.table(
  "arcAssessments",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    taskId: integer("taskId").notNull(),
    agentId: integer("agentId"),
    policyId: integer("policyId").notNull(),
    prior: numeric("prior", { precision: 7, scale: 6 }).notNull(),
    posterior: numeric("posterior", { precision: 7, scale: 6 }).notNull(),
    decision: varchar("decision", { length: 16 }).notNull(),
    mode: varchar("mode", { length: 16 }).notNull().default("shadow"),
    explanation: text("explanation").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    taskIdIdx: index("arcAssessments_taskId_idx").on(table.taskId),
    agentIdIdx: index("arcAssessments_agentId_idx").on(table.agentId),
    policyIdIdx: index("arcAssessments_policyId_idx").on(table.policyId),
    createdAtIdx: index("arcAssessments_createdAt_idx").on(table.createdAt),
    taskIdFk: foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
    }).onDelete("restrict"),
    agentIdFk: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agents.id],
    }).onDelete("set null"),
    policyIdFk: foreignKey({
      columns: [table.policyId],
      foreignColumns: [arcPolicies.id],
    }).onDelete("restrict"),
  }),
);

export type ArcAssessment = typeof arcAssessments.$inferSelect;
export type InsertArcAssessment = typeof arcAssessments.$inferInsert;

export const arcEvidence = sofia.table(
  "arcEvidence",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    assessmentId: integer("assessmentId").notNull(),
    key: varchar("key", { length: 128 }).notNull(),
    value: numeric("value", { precision: 7, scale: 6 }).notNull(),
    reliability: numeric("reliability", { precision: 7, scale: 6 }).notNull(),
    likelihoodRatio: numeric("likelihoodRatio", { precision: 12, scale: 6 }).notNull(),
    source: varchar("source", { length: 128 }).notNull(),
    observedAt: timestamp("observedAt").notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    assessmentIdIdx: index("arcEvidence_assessmentId_idx").on(table.assessmentId),
    keyIdx: index("arcEvidence_key_idx").on(table.key),
    observedAtIdx: index("arcEvidence_observedAt_idx").on(table.observedAt),
    assessmentIdFk: foreignKey({
      columns: [table.assessmentId],
      foreignColumns: [arcAssessments.id],
    }).onDelete("cascade"),
  }),
);

export type ArcEvidence = typeof arcEvidence.$inferSelect;
export type InsertArcEvidence = typeof arcEvidence.$inferInsert;

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
  arcAssessments: many(arcAssessments),
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
  arcAssessments: many(arcAssessments),
}));

export const arcPoliciesRelations = relations(arcPolicies, ({ many }) => ({
  assessments: many(arcAssessments),
}));

export const arcAssessmentsRelations = relations(arcAssessments, ({ one, many }) => ({
  task: one(tasks, {
    fields: [arcAssessments.taskId],
    references: [tasks.id],
  }),
  agent: one(agents, {
    fields: [arcAssessments.agentId],
    references: [agents.id],
  }),
  policy: one(arcPolicies, {
    fields: [arcAssessments.policyId],
    references: [arcPolicies.id],
  }),
  evidence: many(arcEvidence),
}));

export const arcEvidenceRelations = relations(arcEvidence, ({ one }) => ({
  assessment: one(arcAssessments, {
    fields: [arcEvidence.assessmentId],
    references: [arcAssessments.id],
  }),
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
