import { integer, pgEnum, pgTable, pgSchema, text, timestamp, varchar, boolean, numeric, jsonb, index, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
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
    agentPinned: boolean("agentPinned").default(false).notNull(),
    createdBy: integer("createdBy").notNull(),
    creatorType: varchar("creatorType", { length: 16 }).default("user").notNull(),
    missionKey: varchar("missionKey", { length: 64 }).unique(),
    githubPath: varchar("githubPath", { length: 512 }),
    githubSha: varchar("githubSha", { length: 128 }),
    githubSyncStatus: varchar("githubSyncStatus", { length: 32 }).default("pending").notNull(),
    githubSyncError: text("githubSyncError"),
    githubSyncedAt: timestamp("githubSyncedAt"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    statusId: integer("statusId").notNull(),
    priorityId: integer("priorityId").notNull(),
    parentTaskId: integer("parentTaskId"),
    dueDate: timestamp("dueDate"),
    manusTaskId: varchar("manusTaskId", { length: 128 }),
    manusStatus: varchar("manusStatus", { length: 32 }),
    creditsUsed: integer("creditsUsed"),
    lastSyncedAt: timestamp("lastSyncedAt"),
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
    taskId: integer("taskId"),
    // Account owner for the whole interaction, including Sofia replies; isAssistant identifies the speaker.\n    senderId: integer("senderId").notNull(),
    parentMessageId: integer("parentMessageId"),
    typeId: integer("typeId").notNull(),
    content: text("content").notNull(),
    isAssistant: boolean("isAssistant").default(false).notNull(),
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
    agentId: integer("agentId"),
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
// ARC / PGC TELEMETRY AND CONFIDENCE TABLES
// ============================================

export const arcAccessEvents = sofia.table("arcAccessEvents", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  agentId: integer("agentId"),
  taskId: integer("taskId"),
  sessionId: varchar("sessionId", { length: 128 }),
  source: varchar("source", { length: 64 }).notNull().default("task_detail"),
  observedAt: timestamp("observedAt").defaultNow().notNull(),
  agentStatus: varchar("agentStatus", { length: 32 }),
  agentVersion: varchar("agentVersion", { length: 64 }),
  connectionStatus: varchar("connectionStatus", { length: 32 }),
  heartbeatRecent: boolean("heartbeatRecent").notNull().default(false),
  activityCount: integer("activityCount").notNull().default(0),
  completedTasks: integer("completedTasks").notNull().default(0),
  observedTasks: integer("observedTasks").notNull().default(0),
  metadata: jsonb("metadata"),
}, (table) => ({
  userIdIdx: index("arcAccessEvents_userId_idx").on(table.userId),
  agentIdIdx: index("arcAccessEvents_agentId_idx").on(table.agentId),
  taskIdIdx: index("arcAccessEvents_taskId_idx").on(table.taskId),
  observedAtIdx: index("arcAccessEvents_observedAt_idx").on(table.observedAt),
  userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  agentIdFk: foreignKey({ columns: [table.agentId], foreignColumns: [agents.id] }).onDelete("set null"),
  taskIdFk: foreignKey({ columns: [table.taskId], foreignColumns: [tasks.id] }).onDelete("set null"),
}));

export type ArcAccessEvent = typeof arcAccessEvents.$inferSelect;
export type InsertArcAccessEvent = typeof arcAccessEvents.$inferInsert;

export const arcDeviceProfiles = sofia.table("arcDeviceProfiles", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  ownerId: integer("ownerId").notNull(),
  agentId: integer("agentId").notNull(),
  known: boolean("known").notNull().default(false),
  firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  observationCount: integer("observationCount").notNull().default(0),
  lastVersion: varchar("lastVersion", { length: 64 }),
  lastConnectionStatus: varchar("lastConnectionStatus", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  agentIdUnique: uniqueIndex("arcDeviceProfiles_agentId_unique").on(table.agentId),
  ownerIdIdx: index("arcDeviceProfiles_ownerId_idx").on(table.ownerId),
  ownerIdFk: foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }).onDelete("cascade"),
  agentIdFk: foreignKey({ columns: [table.agentId], foreignColumns: [agents.id] }).onDelete("cascade"),
}));

export type ArcDeviceProfile = typeof arcDeviceProfiles.$inferSelect;
export type InsertArcDeviceProfile = typeof arcDeviceProfiles.$inferInsert;

export const arcConfidenceSnapshots = sofia.table("arcConfidenceSnapshots", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  agentId: integer("agentId"),
  taskId: integer("taskId"),
  assessmentId: integer("assessmentId"),
  accessEventId: integer("accessEventId"),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  posterior: numeric("posterior", { precision: 7, scale: 6 }).notNull(),
  decision: varchar("decision", { length: 16 }).notNull(),
  anomalyCount: integer("anomalyCount").notNull().default(0),
  trigger: varchar("trigger", { length: 64 }).notNull().default("assessment"),
  signals: jsonb("signals").notNull(),
  observedAt: timestamp("observedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("arcConfidenceSnapshots_userId_idx").on(table.userId),
  agentIdIdx: index("arcConfidenceSnapshots_agentId_idx").on(table.agentId),
  taskIdIdx: index("arcConfidenceSnapshots_taskId_idx").on(table.taskId),
  observedAtIdx: index("arcConfidenceSnapshots_observedAt_idx").on(table.observedAt),
  userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  agentIdFk: foreignKey({ columns: [table.agentId], foreignColumns: [agents.id] }).onDelete("set null"),
  taskIdFk: foreignKey({ columns: [table.taskId], foreignColumns: [tasks.id] }).onDelete("set null"),
  assessmentIdFk: foreignKey({ columns: [table.assessmentId], foreignColumns: [arcAssessments.id] }).onDelete("set null"),
  accessEventIdFk: foreignKey({ columns: [table.accessEventId], foreignColumns: [arcAccessEvents.id] }).onDelete("set null"),
}));

export type ArcConfidenceSnapshot = typeof arcConfidenceSnapshots.$inferSelect;
export type InsertArcConfidenceSnapshot = typeof arcConfidenceSnapshots.$inferInsert;

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


// ============================================
// MISSION DOCUMENT CATALOG AND VERSIONED INSTANCES
// ============================================

export const missionDocumentTypes = sofia.table("missionDocumentTypes", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  typeKey: varchar("typeKey", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 32 }).notNull(),
  audience: varchar("audience", { length: 32 }).notNull(),
  sortOrder: integer("sortOrder").notNull().default(100),
  isDefault: boolean("isDefault").notNull().default(false),
  renderer: varchar("renderer", { length: 32 }).notNull().default("markdown"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("missionDocumentTypes_category_idx").on(table.category),
  activeSortIdx: index("missionDocumentTypes_active_sort_idx").on(table.isActive, table.sortOrder),
}));

export type MissionDocumentType = typeof missionDocumentTypes.$inferSelect;
export type InsertMissionDocumentType = typeof missionDocumentTypes.$inferInsert;

export const missionDocuments = sofia.table("missionDocuments", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  taskId: integer("taskId").notNull(),
  documentTypeId: integer("documentTypeId").notNull(),
  documentKey: varchar("documentKey", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  taskIdIdx: index("missionDocuments_taskId_idx").on(table.taskId),
  documentTypeIdx: index("missionDocuments_documentTypeId_idx").on(table.documentTypeId),
  taskDocumentKeyUnique: uniqueIndex("missionDocuments_task_documentKey_unique").on(table.taskId, table.documentKey),
  taskIdFk: foreignKey({ columns: [table.taskId], foreignColumns: [tasks.id] }).onDelete("restrict"),
  documentTypeIdFk: foreignKey({ columns: [table.documentTypeId], foreignColumns: [missionDocumentTypes.id] }).onDelete("restrict"),
}));

export type MissionDocument = typeof missionDocuments.$inferSelect;
export type InsertMissionDocument = typeof missionDocuments.$inferInsert;

export const missionDocumentVersions = sofia.table("missionDocumentVersions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  documentId: integer("documentId").notNull(),
  version: integer("version").notNull(),
  state: varchar("state", { length: 32 }).notNull().default("DRAFT"),
  content: text("content").notNull(),
  authorType: varchar("authorType", { length: 16 }).notNull(),
  authorUserId: integer("authorUserId"),
  authorAgentId: integer("authorAgentId"),
  sourceDocumentVersionId: integer("sourceDocumentVersionId"),
  provenance: jsonb("provenance").notNull().default({}),
  changeSummary: text("changeSummary"),
  contentHash: varchar("contentHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  documentIdIdx: index("missionDocumentVersions_documentId_idx").on(table.documentId),
  sourceVersionIdx: index("missionDocumentVersions_sourceVersion_idx").on(table.sourceDocumentVersionId),
  documentVersionUnique: uniqueIndex("missionDocumentVersions_document_version_unique").on(table.documentId, table.version),
  documentIdFk: foreignKey({ columns: [table.documentId], foreignColumns: [missionDocuments.id] }).onDelete("restrict"),
  authorUserIdFk: foreignKey({ columns: [table.authorUserId], foreignColumns: [users.id] }).onDelete("restrict"),
  authorAgentIdFk: foreignKey({ columns: [table.authorAgentId], foreignColumns: [agents.id] }).onDelete("restrict"),
  sourceDocumentVersionIdFk: foreignKey({ columns: [table.sourceDocumentVersionId], foreignColumns: [table.id] }).onDelete("restrict"),
}));

export type MissionDocumentVersion = typeof missionDocumentVersions.$inferSelect;
export type InsertMissionDocumentVersion = typeof missionDocumentVersions.$inferInsert;

export const missionActionUnits = sofia.table("missionActionUnits", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  missionTaskId: integer("missionTaskId").notNull(),
  actionPlanDocumentId: integer("actionPlanDocumentId").notNull(),
  actionPlanVersionId: integer("actionPlanVersionId").notNull(),
  actionPlanVersionNumber: integer("actionPlanVersionNumber").notNull(),
  actionPlanContentHash: varchar("actionPlanContentHash", { length: 64 }).notNull(),
  unitId: varchar("unitId", { length: 8 }).notNull(),
  unitTitle: varchar("unitTitle", { length: 255 }).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 128 }).notNull(),
  operationalTaskId: integer("operationalTaskId"),
  state: varchar("state", { length: 32 }).notNull().default("REGISTERED"),
  approvalUserId: integer("approvalUserId"),
  approvedAt: timestamp("approvedAt"),
  dispatchRequestedAt: timestamp("dispatchRequestedAt"),
  dispatchAttempts: integer("dispatchAttempts").notNull().default(0),
  governanceEvidence: jsonb("governanceEvidence").notNull().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  missionStateIdx: index("missionActionUnits_mission_state_idx").on(table.missionTaskId, table.state),
  planVersionIdx: index("missionActionUnits_plan_version_idx").on(table.actionPlanVersionId),
  operationalTaskIdx: index("missionActionUnits_operational_task_idx").on(table.operationalTaskId),
  idempotencyUnique: uniqueIndex("missionActionUnits_idempotencyKey_key").on(table.idempotencyKey),
  missionVersionUnitUnique: uniqueIndex("missionActionUnits_mission_version_unit_unique").on(table.missionTaskId, table.actionPlanVersionId, table.unitId),
  operationalTaskUnique: uniqueIndex("missionActionUnits_operationalTaskId_key").on(table.operationalTaskId),
  missionTaskFk: foreignKey({ columns: [table.missionTaskId], foreignColumns: [tasks.id] }).onDelete("restrict"),
  actionPlanDocumentFk: foreignKey({ columns: [table.actionPlanDocumentId], foreignColumns: [missionDocuments.id] }).onDelete("restrict"),
  actionPlanVersionFk: foreignKey({ columns: [table.actionPlanVersionId], foreignColumns: [missionDocumentVersions.id] }).onDelete("restrict"),
  operationalTaskFk: foreignKey({ columns: [table.operationalTaskId], foreignColumns: [tasks.id] }).onDelete("restrict"),
  approvalUserFk: foreignKey({ columns: [table.approvalUserId], foreignColumns: [users.id] }).onDelete("restrict"),
}));

export const missionActionUnitGateEvidence = sofia.table("missionActionUnitGateEvidence", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  actionUnitId: integer("actionUnitId").notNull(),
  missionTaskId: integer("missionTaskId").notNull(),
  actionPlanDocumentId: integer("actionPlanDocumentId").notNull(),
  actionPlanVersionId: integer("actionPlanVersionId").notNull(),
  actionPlanVersionNumber: integer("actionPlanVersionNumber").notNull(),
  actionPlanContentHash: varchar("actionPlanContentHash", { length: 64 }).notNull(),
  unitId: varchar("unitId", { length: 8 }).notNull(),
  gateKey: varchar("gateKey", { length: 40 }).notNull(),
  decision: varchar("decision", { length: 16 }).notNull(),
  actorType: varchar("actorType", { length: 16 }).notNull(),
  actorUserId: integer("actorUserId"),
  source: varchar("source", { length: 128 }).notNull(),
  sourceRef: text("sourceRef"),
  evidence: jsonb("evidence").notNull(),
  observedAt: timestamp("observedAt").notNull().defaultNow(),
  validUntil: timestamp("validUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  actionUnitIdx: index("missionActionUnitGateEvidence_action_unit_idx").on(table.actionUnitId),
  gateObservedIdx: index("missionActionUnitGateEvidence_gate_observed_idx").on(table.actionUnitId, table.gateKey, table.observedAt),
  actionUnitFk: foreignKey({ columns: [table.actionUnitId], foreignColumns: [missionActionUnits.id] }).onDelete("restrict"),
  missionFk: foreignKey({ columns: [table.missionTaskId], foreignColumns: [tasks.id] }).onDelete("restrict"),
  documentFk: foreignKey({ columns: [table.actionPlanDocumentId], foreignColumns: [missionDocuments.id] }).onDelete("restrict"),
  versionFk: foreignKey({ columns: [table.actionPlanVersionId], foreignColumns: [missionDocumentVersions.id] }).onDelete("restrict"),
  actorUserFk: foreignKey({ columns: [table.actorUserId], foreignColumns: [users.id] }).onDelete("restrict"),
}));

export type MissionActionUnit = typeof missionActionUnits.$inferSelect;
export type InsertMissionActionUnit = typeof missionActionUnits.$inferInsert;
export type MissionActionUnitGateEvidence = typeof missionActionUnitGateEvidence.$inferSelect;
export type InsertMissionActionUnitGateEvidence = typeof missionActionUnitGateEvidence.$inferInsert;

export const missionActionUnitsRelations = relations(missionActionUnits, ({ one }) => ({
  mission: one(tasks, { fields: [missionActionUnits.missionTaskId], references: [tasks.id] }),
  actionPlanDocument: one(missionDocuments, { fields: [missionActionUnits.actionPlanDocumentId], references: [missionDocuments.id] }),
  actionPlanVersion: one(missionDocumentVersions, { fields: [missionActionUnits.actionPlanVersionId], references: [missionDocumentVersions.id] }),
  operationalTask: one(tasks, { fields: [missionActionUnits.operationalTaskId], references: [tasks.id], relationName: "actionUnitOperationalTask" }),
  approvalUser: one(users, { fields: [missionActionUnits.approvalUserId], references: [users.id] }),
}));

export const missionActionUnitGateEvidenceRelations = relations(missionActionUnitGateEvidence, ({ one }) => ({
  actionUnit: one(missionActionUnits, { fields: [missionActionUnitGateEvidence.actionUnitId], references: [missionActionUnits.id] }),
  mission: one(tasks, { fields: [missionActionUnitGateEvidence.missionTaskId], references: [tasks.id] }),
  actionPlanDocument: one(missionDocuments, { fields: [missionActionUnitGateEvidence.actionPlanDocumentId], references: [missionDocuments.id] }),
  actionPlanVersion: one(missionDocumentVersions, { fields: [missionActionUnitGateEvidence.actionPlanVersionId], references: [missionDocumentVersions.id] }),
  actorUser: one(users, { fields: [missionActionUnitGateEvidence.actorUserId], references: [users.id] }),
}));

export const missionDocumentTypesRelations = relations(missionDocumentTypes, ({ many }) => ({
  documents: many(missionDocuments),
}));

export const missionDocumentsRelations = relations(missionDocuments, ({ one, many }) => ({
  task: one(tasks, {
    fields: [missionDocuments.taskId],
    references: [tasks.id],
  }),
  documentType: one(missionDocumentTypes, {
    fields: [missionDocuments.documentTypeId],
    references: [missionDocumentTypes.id],
  }),
  versions: many(missionDocumentVersions),
}));

export const missionDocumentVersionsRelations = relations(missionDocumentVersions, ({ one }) => ({
  document: one(missionDocuments, {
    fields: [missionDocumentVersions.documentId],
    references: [missionDocuments.id],
  }),
  authorUser: one(users, {
    fields: [missionDocumentVersions.authorUserId],
    references: [users.id],
  }),
  authorAgent: one(agents, {
    fields: [missionDocumentVersions.authorAgentId],
    references: [agents.id],
  }),
  sourceVersion: one(missionDocumentVersions, {
    fields: [missionDocumentVersions.sourceDocumentVersionId],
    references: [missionDocumentVersions.id],
    relationName: "sourceVersion",
  }),
}));
