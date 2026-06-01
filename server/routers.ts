import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // AGENTS ROUTER
  // ============================================
  agents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentsByOwnerId(ctx.user.id);
    }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        version: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createAgent({
          ownerId: ctx.user.id,
          name: input.name,
          description: input.description,
          version: input.version,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getAgentById(input.id);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["online", "offline", "idle", "paused"]),
      }))
      .mutation(async ({ input }) => {
        return db.updateAgentStatus(input.id, input.status);
      }),

    heartbeat: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateAgentHeartbeat(input.id);
      }),
  }),

  // ============================================
  // TASKS ROUTER
  // ============================================
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // TODO: Implementar filtros por status, prioridade, agente
      return db.getRecentActivityLogs(100);
    }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        statusId: z.number(),
        priorityId: z.number(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createTask({
          agentId: input.agentId,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          statusId: input.statusId,
          priorityId: input.priorityId,
          dueDate: input.dueDate,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTaskById(input.id);
      }),

    getByAgent: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return db.getTasksByAgentId(input.agentId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        statusId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateTaskStatus(input.id, input.statusId);
      }),
  }),

  // ============================================
  // MESSAGES ROUTER
  // ============================================
  messages: router({
    create: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        parentMessageId: z.number().optional(),
        typeId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createMessage({
          taskId: input.taskId,
          senderId: ctx.user.id,
          parentMessageId: input.parentMessageId,
          typeId: input.typeId,
          content: input.content,
        });
      }),

    getByTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByTaskId(input.taskId);
      }),

    getByParentId: publicProcedure
      .input(z.object({ parentMessageId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByParentId(input.parentMessageId);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.markMessageAsRead(input.id);
      }),
  }),

  // ============================================
  // ACTIVITY LOGS ROUTER
  // ============================================
  activityLogs: router({
    create: publicProcedure
      .input(z.object({
        agentId: z.number(),
        taskId: z.number().optional(),
        eventTypeId: z.number(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createActivityLog(input);
      }),

    getByAgent: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return db.getActivityLogsByAgentId(input.agentId);
      }),

    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getRecentActivityLogs(input.limit);
      }),
  }),

  // ============================================
  // CONTEXT REPORTS ROUTER
  // ============================================
  contextReports: router({
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        creditsUsed: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createContextReport({
          ownerId: ctx.user.id,
          title: input.title,
          content: input.content,
          creditsUsed: input.creditsUsed,
        });
      }),

    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input, ctx }) => {
        return db.getRecentContextReports(ctx.user.id, input.limit);
      }),

    updateGitHub: adminProcedure
      .input(z.object({
        id: z.number(),
        gitHubUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        return db.updateContextReportGitHub(input.id, input.gitHubUrl);
      }),
  }),

  // ============================================
  // EXTERNAL AGENTS ENDPOINTS
  // ============================================
  externalAgents: router({
    listStaged: publicProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return db.getTasksByStatus(1);
      }),

    createQuestion: publicProcedure
      .input(z.object({
        taskId: z.number(),
        agentId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return db.createMessage({
          taskId: input.taskId,
          senderId: input.agentId,
          typeId: 1,
          content: input.content,
        });
      }),

    getAnswers: publicProcedure
      .input(z.object({ parentMessageId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByParentId(input.parentMessageId);
      }),

    logActivity: publicProcedure
      .input(z.object({
        agentId: z.number(),
        taskId: z.number().optional(),
        eventTypeId: z.number(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createActivityLog(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
