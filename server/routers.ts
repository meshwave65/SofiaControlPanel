import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { SofiaOrchestrator } from "./sofiaOrchestrator";
import { TRPCError } from "@trpc/server";
import { getConsolidatedTaskReport, uploadConsolidatedTaskReport } from "./controlPanelStorage";

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

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        version: z.string().optional(),
        manusAccount: z.string().optional(),
        manusPassword: z.string().optional(),
        manusToken: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createAgent({
          ownerId: ctx.user.id,
          name: input.name,
          description: input.description,
          version: input.version,
          manusAccount: input.manusAccount,
          manusPassword: input.manusPassword,
          manusToken: input.manusToken,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getAgentByIdForOwner(input.id, ctx.user.id);
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

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        version: z.string().optional(),
        manusAccount: z.string().optional(),
        manusPassword: z.string().optional(),
        manusToken: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateAgent(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteAgent(input.id);
      }),
  }),

  // ============================================
  // TASKS ROUTER
  // ============================================
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllTasks(ctx.user.id);
    }),

    listAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllTasks(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        statusId: z.number(),
        priorityId: z.number(),
        parentTaskId: z.number().optional(),
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
          parentTaskId: input.parentTaskId,
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
      .query(async ({ input, ctx }) => {
        return db.getTasksByAgentIdForOwner(input.agentId, ctx.user.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        statusId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateTaskStatus(input.id, input.statusId);
      }),

    factorize: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        return SofiaOrchestrator.factorizeTask(input.taskId);
      }),

    consolidate: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }

        const report = await SofiaOrchestrator.consolidateResults(input.taskId);
        return uploadConsolidatedTaskReport(input.taskId, report);
      }),

    getConsolidatedReport: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }
        return getConsolidatedTaskReport(input.taskId);
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
      .query(async ({ input, ctx }) => {
        return db.getActivityLogsByAgentIdForOwner(input.agentId, ctx.user.id);
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
  // ARC / PGC ROUTER
  // ============================================
  arc: router({
    evaluateTask: protectedProcedure
      .input(z.object({
        taskId: z.number().int().positive(),
        policyId: z.number().int().positive(),
        prior: z.string().regex(/^0?\.\d+$/),
        posterior: z.string().regex(/^0?\.\d+$/),
        decision: z.enum(["ALLOW", "REVIEW", "DENY"]),
        mode: z.enum(["shadow", "assisted", "enforced"]).default("shadow"),
        explanation: z.string().min(1).max(4000),
        agentId: z.number().int().positive().nullable().optional(),
        evidence: z.array(z.object({
          key: z.string().min(1).max(128),
          value: z.string().regex(/^0?\.\d+$/),
          reliability: z.string().regex(/^0?\.\d+$/),
          likelihoodRatio: z.string().regex(/^\d+(\.\d+)?$/),
          source: z.string().min(1).max(128),
          observedAt: z.coerce.date(),
          metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
        })).max(100).default([]),
      }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }
        const assessment = await db.createArcAssessment(input);
        return { ...assessment, evidence: input.evidence.map(({ metadata: _metadata, ...item }) => item) };
      }),

    getAssessment: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const assessment = await db.getArcAssessmentByTask(input.taskId, ctx.user.id, ctx.user.role === "admin");
        if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });
        return { ...assessment, evidence: assessment.evidence.map(({ metadata: _metadata, ...item }) => item) };
      }),

    listAssessments: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive(), limit: z.number().int().min(1).max(100).default(20) }))
      .query(async ({ input, ctx }) => {
        const assessments = await db.listArcAssessmentsByTask(input.taskId, ctx.user.id, ctx.user.role === "admin", input.limit);
        return assessments.map((assessment) => ({
          ...assessment,
          evidence: assessment.evidence.map(({ metadata: _metadata, ...item }) => item),
        }));
      }),
  }),

  // ============================================
  // STATS & LOOKUPS
  // ============================================
  stats: router({
    getDashboard: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
  }),

  lookups: router({
    listAll: protectedProcedure.query(async () => {
      return db.getLookups();
    }),
  }),

  // ============================================
  // EXTERNAL AGENTS ENDPOINTS
  // ============================================
  externalAgents: router({
    listStaged: publicProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return db.getTasksByStatus(await db.getTaskStatusIdByName("STAGED"));
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
