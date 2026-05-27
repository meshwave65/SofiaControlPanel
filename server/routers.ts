import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

/**
 * Admin-only procedure that extends protectedProcedure.
 * Requires user role to be "admin" or the user to be the owner.
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can perform this action",
    });
  }
  return next({ ctx });
});

/**
 * Owner-only procedure that extends protectedProcedure.
 * Requires user to be the system owner.
 */
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the owner can perform this action",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // AGENTS ROUTER
  // ============================================================================
  agents: router({
    /**
     * List all agents owned by the current user.
     * Protected: requires authentication.
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAgentsByOwnerId(ctx.user.id);
    }),

    /**
     * Create a new agent.
     * Admin: requires admin role.
     */
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          config: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createAgent({
          ownerId: ctx.user.id,
          name: input.name,
          description: input.description,
          config: input.config,
          status: "offline",
        });
      }),

    /**
     * Get a specific agent by ID.
     * Protected: requires authentication.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAgentById(input.id);
      }),

    /**
     * Update agent status (online, offline, idle, paused).
     * Admin: requires admin role.
     */
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["online", "offline", "idle", "paused"]),
        })
      )
      .mutation(async ({ input }) => {
        return await db.updateAgentStatus(input.id, input.status);
      }),

    /**
     * Agent heartbeat endpoint (public).
     * Called by external agents to signal they are alive.
     */
    heartbeat: publicProcedure
      .input(z.object({ agentId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateAgentHeartbeat(input.agentId);
        return { success: true };
      }),

    /**
     * Update agent details.
     * Admin: requires admin role.
     */
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          config: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAgent(id, data);
      }),

    /**
     * Delete an agent.
     * Admin: requires admin role.
     */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAgent(input.id);
      }),

    /**
     * Get all agents (admin only).
     */
    listAll: adminProcedure.query(async () => {
      return await db.getAllAgents();
    }),
  }),

  // ============================================================================
  // TASKS ROUTER
  // ============================================================================
  tasks: router({
    /**
     * List tasks for a specific agent.
     * Protected: requires authentication.
     */
    list: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByAgentId(input.agentId);
      }),

    /**
     * Create a new task.
     * Protected: requires authentication.
     */
    create: protectedProcedure
      .input(
        z.object({
          agentId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          statusId: z.number(),
          priorityId: z.number(),
          dueDate: z.date().optional(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createTask({
          agentId: input.agentId,
          title: input.title,
          description: input.description,
          statusId: input.statusId,
          priorityId: input.priorityId,
          createdBy: ctx.user.id,
          dueDate: input.dueDate,
          metadata: input.metadata,
        });
      }),

    /**
     * Get a specific task by ID.
     * Protected: requires authentication.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskById(input.id);
      }),

    /**
     * Get tasks by agent ID.
     * Protected: requires authentication.
     */
    getByAgent: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByAgentId(input.agentId);
      }),

    /**
     * Get tasks by status.
     * Protected: requires authentication.
     */
    getByStatus: protectedProcedure
      .input(z.object({ statusId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByStatus(input.statusId);
      }),

    /**
     * Update task status.
     * Protected: requires authentication.
     */
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), statusId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateTaskStatus(input.id, input.statusId);
      }),

    /**
     * Update task details.
     * Protected: requires authentication.
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          statusId: z.number().optional(),
          priorityId: z.number().optional(),
          dueDate: z.date().optional(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTask(id, data);
      }),

    /**
     * Delete a task.
     * Protected: requires authentication.
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTask(input.id);
      }),

    /**
     * Get all tasks.
     */
    listAll: protectedProcedure.query(async () => {
      return await db.getAllTasks();
    }),
  }),

  // ============================================================================
  // MESSAGES ROUTER
  // ============================================================================
  messages: router({
    /**
     * Create a new message or question.
     * Protected: requires authentication.
     */
    create: protectedProcedure
      .input(
        z.object({
          taskId: z.number(),
          typeId: z.number(),
          content: z.string().min(1),
          parentMessageId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createMessage({
          taskId: input.taskId,
          senderId: ctx.user.id,
          typeId: input.typeId,
          content: input.content,
          parentMessageId: input.parentMessageId,
        });
      }),

    /**
     * Get messages for a specific task.
     * Protected: requires authentication.
     */
    getByTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByTaskId(input.taskId);
      }),

    /**
     * Get messages in a thread (by parent message ID).
     * Public: can be called by external agents.
     */
    getByParentId: publicProcedure
      .input(z.object({ parentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByParentId(input.parentId);
      }),

    /**
     * Mark a message as read.
     * Protected: requires authentication.
     */
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markMessageAsRead(input.id);
      }),

    /**
     * Get a specific message by ID.
     * Protected: requires authentication.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessageById(input.id);
      }),

    /**
     * Delete a message.
     * Protected: requires authentication.
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteMessage(input.id);
      }),
  }),

  // ============================================================================
  // ACTIVITY LOGS ROUTER
  // ============================================================================
  activityLogs: router({
    /**
     * Create an activity log entry.
     * Public: can be called by external agents.
     */
    create: publicProcedure
      .input(
        z.object({
          agentId: z.number().optional(),
          taskId: z.number().optional(),
          eventTypeId: z.number(),
          description: z.string().optional(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createActivityLog({
          agentId: input.agentId,
          taskId: input.taskId,
          eventTypeId: input.eventTypeId,
          description: input.description,
          metadata: input.metadata,
        });
      }),

    /**
     * Get activity logs for a specific agent.
     * Protected: requires authentication.
     */
    getByAgent: protectedProcedure
      .input(z.object({ agentId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getActivityLogsByAgentId(input.agentId, input.limit);
      }),

    /**
     * Get recent activity logs.
     * Protected: requires authentication.
     */
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getRecentActivityLogs(input.limit);
      }),

    /**
     * Get activity logs for a specific task.
     * Protected: requires authentication.
     */
    getByTask: protectedProcedure
      .input(z.object({ taskId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getActivityLogsByTaskId(input.taskId, input.limit);
      }),

    /**
     * Delete an activity log.
     * Admin: requires admin role.
     */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteActivityLog(input.id);
      }),
  }),

  // ============================================================================
  // CONTEXT REPORTS ROUTER
  // ============================================================================
  contextReports: router({
    /**
     * Create a context report.
     * Admin: requires admin role.
     */
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          content: z.string().min(1),
          creditsRemaining: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createContextReport({
          ownerId: ctx.user.id,
          title: input.title,
          content: input.content,
          creditsRemaining: input.creditsRemaining,
        });
      }),

    /**
     * Get recent context reports for the current user.
     * Protected: requires authentication.
     */
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        return await db.getRecentContextReports(ctx.user.id, input.limit);
      }),

    /**
     * Update context report with GitHub URL.
     * Admin: requires admin role.
     */
    updateGitHub: adminProcedure
      .input(z.object({ id: z.number(), url: z.string() }))
      .mutation(async ({ input }) => {
        return await db.updateContextReportGitHub(input.id, input.url);
      }),

    /**
     * Get a specific context report by ID.
     * Protected: requires authentication.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getContextReportById(input.id);
      }),

    /**
     * Delete a context report.
     * Admin: requires admin role.
     */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteContextReport(input.id);
      }),
  }),

  // ============================================================================
  // LOOKUP TABLES ROUTER
  // ============================================================================
  lookups: router({
    /**
     * Get or create a task status.
     * Public: can be called by external agents.
     */
    getOrCreateTaskStatus: publicProcedure
      .input(z.object({ name: z.string(), color: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getOrCreateTaskStatus(input.name, input.color);
      }),

    /**
     * Get or create a task priority.
     * Public: can be called by external agents.
     */
    getOrCreateTaskPriority: publicProcedure
      .input(z.object({ name: z.string(), level: z.number(), color: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getOrCreateTaskPriority(input.name, input.level, input.color);
      }),

    /**
     * Get or create a message type.
     * Public: can be called by external agents.
     */
    getOrCreateMessageType: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        return await db.getOrCreateMessageType(input.name);
      }),

    /**
     * Get or create an activity event type.
     * Public: can be called by external agents.
     */
    getOrCreateActivityEventType: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        return await db.getOrCreateActivityEventType(input.name);
      }),

    /**
     * Get all task statuses.
     * Public: can be called by external agents.
     */
    getAllTaskStatuses: publicProcedure.query(async () => {
      return await db.getAllTaskStatuses();
    }),

    /**
     * Get all task priorities.
     * Public: can be called by external agents.
     */
    getAllTaskPriorities: publicProcedure.query(async () => {
      return await db.getAllTaskPriorities();
    }),

    /**
     * Get all message types.
     * Public: can be called by external agents.
     */
    getAllMessageTypes: publicProcedure.query(async () => {
      return await db.getAllMessageTypes();
    }),

    /**
     * Get all activity event types.
     * Public: can be called by external agents.
     */
    getAllActivityEventTypes: publicProcedure.query(async () => {
      return await db.getAllActivityEventTypes();
    }),
  }),

  // ============================================================================
  // SCHEDULED TASKS ROUTER
  // ============================================================================
  scheduledTasks: router({
    /**
     * Create a scheduled task.
     * Owner: requires owner role.
     */
    create: ownerProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          cronExpression: z.string(),
          handler: z.string(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createScheduledTask({
          name: input.name,
          description: input.description,
          cronExpression: input.cronExpression,
          handler: input.handler,
          metadata: input.metadata,
          isActive: true,
        });
      }),

    /**
     * Get all active scheduled tasks.
     * Owner: requires owner role.
     */
    getActive: ownerProcedure.query(async () => {
      return await db.getActiveScheduledTasks();
    }),

    /**
     * Update scheduled task next run time.
     * Owner: requires owner role.
     */
    updateNextRun: ownerProcedure
      .input(z.object({ id: z.number(), nextRun: z.date() }))
      .mutation(async ({ input }) => {
        return await db.updateScheduledTaskNextRun(input.id, input.nextRun);
      }),

    /**
     * Get a specific scheduled task by ID.
     * Owner: requires owner role.
     */
    getById: ownerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getScheduledTaskById(input.id);
      }),

    /**
     * Update a scheduled task.
     * Owner: requires owner role.
     */
    update: ownerProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          cronExpression: z.string().optional(),
          handler: z.string().optional(),
          isActive: z.boolean().optional(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateScheduledTask(id, data);
      }),

    /**
     * Delete a scheduled task.
     * Owner: requires owner role.
     */
    delete: ownerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteScheduledTask(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
