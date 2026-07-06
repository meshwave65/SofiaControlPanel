import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json, bigint } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  agenttype: varchar("agenttype", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("idle"),
  description: text("description"),
  modelversion: varchar("modelversion", { length: 100 }),
  isenabled: boolean("isenabled").default(true),
  lastactive: timestamp("lastactive"),
  currenttaskid: bigint("currenttaskid", { mode: "number" }),
  metadata: json("metadata"),
  createdat: timestamp("createdat").defaultNow(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow(),
});

export const tasks = mysqlTable("tasks", {
  task_id: int("task_id").autoincrement().primaryKey(),
  task_code: varchar("task_code", { length: 20 }),
  client_id: int("client_id"),
  client_request_uuid: varchar("client_request_uuid", { length: 36 }),
  parent_task_id: int("parent_task_id"),
  conversation_root_id: int("conversation_root_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  status_id: int("status_id").notNull().default(1),
  priority_id: int("priority_id").notNull().default(3),
  persona_id: int("persona_id"),
  deadline: int("deadline").default(300),
});

export const taskStatuses = mysqlTable("task_statuses", {
  status_id: int("status_id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  is_terminal: boolean("is_terminal").default(false),
});

export const taskPriorities = mysqlTable("task_priorities", {
  priority_id: int("priority_id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  order_level: int("order_level").notNull().unique(),
});

export const personas = mysqlTable("personas", {
  persona_id: int("persona_id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  cbo_group: int("cbo_group"),
  cbo_ocup: int("cbo_ocup"),
  persona_prompt_path: varchar("persona_prompt_path", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const clients = mysqlTable("clients", {
  client_id: int("client_id").autoincrement().primaryKey(),
  full_name: varchar("full_name", { length: 255 }),
  user_name: varchar("user_name", { length: 100 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  client_uuid: varchar("client_uuid", { length: 36 }),
  friendly_name: varchar("friendly_name", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const messages = mysqlTable("messages", {
  message_id: bigint("message_id", { mode: "number" }).autoincrement().primaryKey(),
  task_id: int("task_id"),
  message_type_id: int("message_type_id").notNull(),
  parent_message_id: bigint("parent_message_id", { mode: "number" }),
  sender_id: varchar("sender_id", { length: 255 }).notNull(),
  recipient_id: varchar("recipient_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  is_read: boolean("is_read").default(false),
});

export const taskBlocks = mysqlTable("task_blocks", {
  block_id: int("block_id").autoincrement().primaryKey(),
  task_id: int("task_id").notNull(),
  sequence: int("sequence").notNull(),
  author_id: varchar("author_id", { length: 100 }),
  block_type: varchar("block_type", { length: 50 }).notNull(),
  content: text("content"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  parent_block_id: int("parent_block_id"),
});

export const taskTitles = mysqlTable("task_titles", {
  task_id: int("task_id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  generated_at: timestamp("generated_at").defaultNow(),
});
