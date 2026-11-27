import { ENV } from "./_core/env";
import * as db from "./db";

type MirrorTask = {
  id: number;
  missionKey?: string | null;
  githubPath?: string | null;
  title: string;
  description?: string | null;
  statusId: number;
  priorityId: number;
  parentTaskId?: number | null;
  dueDate?: Date | null;
  createdBy: number;
  creatorType?: string | null;
  creatorName?: string | null;
  creatorEmail?: string | null;
};

type MirrorResult = {
  status: "synced" | "not_configured" | "failed";
  missionKey: string;
  path: string;
  sha?: string;
  error?: string;
};

function missionKeyFor(task: MirrorTask) {
  return task.missionKey || `SCP-TASK-${String(task.id).padStart(6, "0")}`;
}

function pathFor(task: MirrorTask, missionKey: string) {
  return task.githubPath || `missions/${missionKey}.md`;
}

function markdownValue(value: unknown) {
  return String(value ?? "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

function missionMarkdown(task: MirrorTask, missionKey: string) {
  const creator = task.creatorType === "system"
    ? "system"
    : task.creatorEmail || task.creatorName || `user:${task.createdBy}`;
  const dueDate = task.dueDate ? new Date(task.dueDate).toISOString() : "";

  return `# ${markdownValue(task.title)}

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | ${missionKey} |
| taskId | ${task.id} |
| source | SofiaControlPanel interface |
| creator | ${markdownValue(creator)} |
| creatorType | ${markdownValue(task.creatorType || "user")} |
| statusId | ${task.statusId} |
| priorityId | ${task.priorityId} |
| parentTaskId | ${task.parentTaskId ?? ""} |
| dueDate | ${dueDate} |

## Description

${task.description || "Sem descrição fornecida."}

## Synchronization contract

- Supabase task ID: \`${task.id}\`
- GitHub path: \`${pathFor(task, missionKey)}\`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
`;
}

async function githubRequest<T>(url: string, init: RequestInit): Promise<{ response: Response; body: T | null }> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${ENV.githubPat}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body: T | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as T;
    } catch {
      body = null;
    }
  }
  return { response, body };
}


export type MissionDocumentsMirrorResult = {
  status: "synced" | "not_configured" | "failed";
  count: number;
  errors: string[];
};

function missionDocumentMarkdown(document: any, version: any) {
  const metadata = [
    ["documentKey", document.documentKey],
    ["type", document.typeKey],
    ["version", version.version],
    ["state", version.state],
    ["authorType", version.authorType],
    ["authorAgentId", version.authorAgentId ?? ""],
    ["sourceDocumentVersionId", version.sourceDocumentVersionId ?? ""],
    ["contentHash", version.contentHash ?? ""],
    ["publishedAt", version.publishedAt ? new Date(version.publishedAt).toISOString() : ""],
  ];
  return `# ${markdownValue(document.title)}

> Documento versionado da missão ${document.taskId}. O conteúdo-fonte e o histórico de versões permanecem no Supabase; este arquivo é o espelho versionado no GitHub.

## Metadata

| Campo | Valor |
| --- | --- |
${metadata.map(([key, value]) => `| ${markdownValue(key)} | ${markdownValue(value)} |`).join("\n")}

## Content

${version.content || ""}
`;
}

/** Mirrors mission metadata and every latest document version, then records combined sync state. */
export async function mirrorMissionToGitHub(taskId: number, taskOverride?: MirrorTask) {
  const task = taskOverride ?? await db.getTaskById(taskId);
  if (!task) throw new Error(`Missão ${taskId} não encontrada para espelhamento.`);
  const [taskMirror, documentMirror] = await Promise.all([
    mirrorTaskToGitHub(task),
    mirrorMissionDocumentsToGitHub(taskId, task.createdBy),
  ]);
  const status = taskMirror.status === "failed" || documentMirror.status === "failed"
    ? "failed"
    : taskMirror.status === "not_configured" || documentMirror.status === "not_configured"
      ? "not_configured"
      : "synced";
  const errors = [taskMirror.error, ...documentMirror.errors].filter(Boolean);
  await db.updateTaskGitHubSync(taskId, {
    missionKey: taskMirror.missionKey,
    githubPath: taskMirror.path,
    githubSha: taskMirror.sha,
    githubSyncStatus: status,
    githubSyncError: errors.length ? errors.join("; ").slice(0, 1000) : null,
  });
  return {
    ...taskMirror,
    status,
    error: errors.length ? errors.join("; ").slice(0, 1000) : undefined,
    mirroredDocumentCount: documentMirror.count,
  };
}

/** Mirrors the latest version of every mission artifact without copying secrets. */
export async function mirrorMissionDocumentsToGitHub(taskId: number, ownerId?: number): Promise<MissionDocumentsMirrorResult> {
  if (!ENV.githubPat) {
    return { status: "not_configured", count: 0, errors: ["GITHUB_PAT não configurado no Render."] };
  }
  const task = await db.getTaskById(taskId);
  if (!task) return { status: "failed", count: 0, errors: [`Missão ${taskId} não encontrada.`] };
  const missionRootId = await db.getMissionRootTaskId(taskId);
  if (missionRootId == null) return { status: "failed", count: 0, errors: [`Missão raiz não encontrada para ${taskId}.`] };
  const rootTask = missionRootId === task.id ? task : await db.getTaskById(missionRootId);
  if (!rootTask) return { status: "failed", count: 0, errors: [`Missão raiz ${missionRootId} não encontrada.`] };
  const documents = await db.getMissionDocumentsForTask(missionRootId, ownerId ?? rootTask.createdBy, false);
  const missionKey = missionKeyFor(rootTask);
  const errors: string[] = [];
  let count = 0;

  for (const document of documents as any[]) {
    if (!document.latestVersion) continue;
    const stored = await db.getMissionDocumentVersionForTask(
      missionRootId,
      document.id,
      document.latestVersion.version,
      ownerId ?? rootTask.createdBy,
      false,
    );
    if (!stored?.version) continue;

    const safeDocumentKey = String(document.documentKey).replace(/[^A-Za-z0-9_-]/g, "_");
    const path = `missions/${missionKey}/documents/${safeDocumentKey}.md`;
    const baseUrl = `https://api.github.com/repos/${encodeURIComponent(ENV.githubOwner)}/${encodeURIComponent(ENV.githubRepo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
    const markdown = missionDocumentMarkdown(document, stored.version);
    const content = Buffer.from(markdown, "utf8").toString("base64");

    try {
      const current = await githubRequest<{ sha?: string; content?: string; encoding?: string }>(
        `${baseUrl}?ref=${encodeURIComponent(ENV.githubBranch)}`,
        { method: "GET" },
      );
      if (current.response.ok && current.body?.content) {
        const existing = Buffer.from(current.body.content.replace(/\s/g, ""), "base64").toString("utf8");
        if (existing === markdown) {
          count += 1;
          continue;
        }
      } else if (!current.response.ok && current.response.status !== 404) {
        errors.push(`${safeDocumentKey}: GET GitHub HTTP ${current.response.status}`);
        continue;
      }

      const result = await githubRequest<{ content?: { sha?: string }; commit?: { sha?: string } }>(baseUrl, {
        method: "PUT",
        body: JSON.stringify({
          message: `docs(mission): mirror ${missionKey} ${safeDocumentKey} v${stored.version.version}`,
          content,
          branch: ENV.githubBranch,
          ...(current.response.ok && current.body?.sha ? { sha: current.body.sha } : {}),
        }),
      });
      if (!result.response.ok) {
        const detail = result.body ? JSON.stringify(result.body) : `HTTP ${result.response.status}`;
        errors.push(`${safeDocumentKey}: ${detail.slice(0, 500)}`);
        continue;
      }
      count += 1;
    } catch (error) {
      errors.push(`${safeDocumentKey}: ${error instanceof Error ? error.message : "falha desconhecida"}`);
    }
  }

  return { status: errors.length ? "failed" : "synced", count, errors };
}

export async function mirrorTaskToGitHub(task: MirrorTask): Promise<MirrorResult> {
  const missionKey = missionKeyFor(task);
  const path = pathFor(task, missionKey);

  if (!ENV.githubPat) {
    return { status: "not_configured", missionKey, path, error: "GITHUB_PAT não configurado no Render." };
  }

  const baseUrl = `https://api.github.com/repos/${encodeURIComponent(ENV.githubOwner)}/${encodeURIComponent(ENV.githubRepo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
  const content = Buffer.from(missionMarkdown(task, missionKey), "utf8").toString("base64");

  try {
    const current = await githubRequest<{ sha?: string }>(`${baseUrl}?ref=${encodeURIComponent(ENV.githubBranch)}`, {
      method: "GET",
    });
    const currentSha = current.response.ok ? current.body?.sha : undefined;
    const result = await githubRequest<{ content?: { sha?: string }; commit?: { sha?: string } }>(baseUrl, {
      method: "PUT",
      body: JSON.stringify({
        message: `docs(mission): mirror ${missionKey}`,
        content,
        branch: ENV.githubBranch,
        ...(currentSha ? { sha: currentSha } : {}),
      }),
    });

    if (!result.response.ok) {
      const detail = result.body ? JSON.stringify(result.body) : `HTTP ${result.response.status}`;
      return { status: "failed", missionKey, path, error: detail.slice(0, 1000) };
    }

    return {
      status: "synced",
      missionKey,
      path,
      sha: result.body?.content?.sha || result.body?.commit?.sha,
    };
  } catch (error) {
    return {
      status: "failed",
      missionKey,
      path,
      error: error instanceof Error ? error.message : "Falha desconhecida ao espelhar missão no GitHub.",
    };
  }
}
