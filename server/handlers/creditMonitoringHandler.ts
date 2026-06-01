import { Request, Response } from "express";
import { authenticateRequest } from "../_core/sdk";
import * as db from "../db";

/**
 * Heartbeat handler para monitoramento de créditos
 * Verifica se os créditos estão abaixo de 50 e gera relatório de passagem de contexto
 * Path: /api/scheduled/creditMonitoring
 */
export async function creditMonitoringHandler(req: Request, res: Response) {
  try {
    const user = await authenticateRequest(req);

    // Validar que é uma requisição de cron
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    // Simular obtenção de créditos (em produção, viria de uma API externa)
    const estimatedCredits = 45; // Valor simulado

    // Se créditos abaixo de 50, gerar relatório
    if (estimatedCredits <= 50) {
      const contextReport = await db.createContextReport({
        ownerId: user.id,
        title: `Relatório de Passagem de Contexto - Créditos em ${estimatedCredits}`,
        content: `Créditos disponíveis: ${estimatedCredits}. Relatório gerado automaticamente pelo heartbeat de monitoramento.`,
        creditsUsed: 100 - estimatedCredits,
      });

      // Log de atividade
      await db.createActivityLog({
        ownerId: user.id,
        eventTypeId: 5, // SYSTEM event
        details: `Relatório de contexto gerado automaticamente (créditos: ${estimatedCredits})`,
      });

      return res.json({
        ok: true,
        action: "report_generated",
        contextReportId: contextReport.id,
        creditsRemaining: estimatedCredits,
      });
    }

    return res.json({
      ok: true,
      action: "no_action_needed",
      creditsRemaining: estimatedCredits,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[creditMonitoringHandler] Error:", err);

    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: {
        url: req.url,
        taskUid: req.body?.taskUid,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
