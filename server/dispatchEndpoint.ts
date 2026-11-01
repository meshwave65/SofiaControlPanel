import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { SofiaOrchestrator } from "./sofiaOrchestrator";

const router = Router();

function hasValidDispatchSecret(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length
    && timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * POST /api/internal/task-dispatch
 * Called asynchronously by the Supabase trigger when an assigned task enters STAGED.
 * The orchestrator atomically claims the task before contacting the execution provider.
 */
router.post("/task-dispatch", async (req, res) => {
  const expectedSecret = process.env.SOFIA_DISPATCH_SECRET;
  const providedSecret = req.get("x-sofia-dispatch-secret") ?? "";

  if (!expectedSecret) {
    console.error("[Task Dispatch] SOFIA_DISPATCH_SECRET is not configured");
    return res.status(503).json({ success: false, error: "dispatch_not_configured" });
  }

  if (!hasValidDispatchSecret(providedSecret, expectedSecret)) {
    return res.status(401).json({ success: false, error: "unauthorized" });
  }

  const taskId = req.body?.taskId;
  if (!Number.isSafeInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ success: false, error: "invalid_task_id" });
  }

  try {
    const result = await SofiaOrchestrator.startTask(taskId);
    if (!result) {
      return res.status(404).json({ success: false, error: "task_not_found" });
    }

    return res.status(200).json({
      success: true,
      taskId,
      started: result.started,
      executionStarted: result.executionStarted,
      factorized: result.factorized,
      subtaskIds: result.subtaskIds,
      externalTaskIds: result.externalTaskIds,
    });
  } catch (error) {
    console.error(`[Task Dispatch] Failed to dispatch task ${taskId}:`, error);
    return res.status(500).json({
      success: false,
      taskId,
      error: error instanceof Error ? error.message : "dispatch_failed",
    });
  }
});

export default router;
