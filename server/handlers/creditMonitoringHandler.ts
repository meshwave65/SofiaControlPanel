import { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { syncAllAgentCredits } from "../manusExecutionService";

/**
 * Endpoint reservado para o integrador oficial de créditos.
 * Enquanto nenhuma fonte autorizada estiver configurada, o painel deve
 * informar indisponibilidade em vez de publicar um saldo inventado.
 */
export async function creditMonitoringHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const agents = await syncAllAgentCredits();
    return res.json({ ok: true, action: "credits_synced", agents });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[creditMonitoringHandler] Error:", err);
    return res.status(500).json({
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
