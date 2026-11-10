import { ENV } from "./_core/env";

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
| mirroredAt | ${new Date().toISOString()} |

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
