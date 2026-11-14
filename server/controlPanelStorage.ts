import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

const BUCKET_NAME = "sofia-controlpanel-artifacts";
const SIGNED_URL_TTL_SECONDS = 15 * 60;
const REPORT_FILE_NAME = "consolidated-report.md";

let storageClient: SupabaseClient | undefined;

function hasStorageCredentials() {
  return Boolean(ENV.supabaseUrl.trim() && ENV.supabaseStorageKey.trim());
}

function getStorage() {
  const rawUrl = ENV.supabaseUrl.trim();
  const key = ENV.supabaseStorageKey.trim();
  if (!rawUrl || !key) {
    throw new Error("Configure SUPABASE_URL e uma chave server-side do Supabase no ambiente do ControlPanel.");
  }

  // O conector REST pode fornecer a URL terminada em /rest/v1; o SDK Storage requer a raiz do projeto.
  const baseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  if (!storageClient) {
    storageClient = createClient(baseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return storageClient.storage.from(BUCKET_NAME);
}

function reportPath(taskId: number) {
  if (!Number.isSafeInteger(taskId) || taskId <= 0) {
    throw new Error("ID de tarefa inválido para armazenamento do relatório.");
  }
  return `tasks/${taskId}/${REPORT_FILE_NAME}`;
}

async function createDownloadUrl(storage: ReturnType<typeof getStorage>, path: string) {
  const { data, error } = await storage.createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    throw new Error(`Não foi possível gerar um link privado para o relatório${error?.message ? `: ${error.message}` : "."}`);
  }
  return data.signedUrl;
}

export async function uploadConsolidatedTaskReport(taskId: number, content: string) {
  const path = reportPath(taskId);
  const storage = getStorage();
  const { error } = await storage.upload(path, Buffer.from(content, "utf8"), {
    contentType: "text/markdown",
    cacheControl: "3600",
    upsert: true,
  });
  if (error) {
    throw new Error(`Não foi possível enviar o relatório ao bucket privado: ${error.message}`);
  }

  return {
    content,
    downloadUrl: await createDownloadUrl(storage, path),
  };
}

export async function getConsolidatedTaskReport(taskId: number) {
  if (!hasStorageCredentials()) return null;

  const path = reportPath(taskId);
  const storage = getStorage();
  const { data, error } = await storage.download(path);
  if (error) {
    const message = error.message ?? "";
    if (error.statusCode === "404" && /object not found/i.test(message)) return null;
    throw new Error(`Não foi possível ler o relatório no Supabase Storage: ${message || error.name}`);
  }
  if (!data) return null;

  return {
    content: await data.text(),
    downloadUrl: await createDownloadUrl(storage, path),
  };
}
