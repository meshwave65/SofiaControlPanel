import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Sistema de Sincronização com GitHub via PAT
 * 
 * Responsável por:
 * 1. Fazer commit e push de alterações para o repositório remoto
 * 2. Atualizar arquivo UPDATES.md com histórico de commits
 * 3. Gerenciar autenticação via Personal Access Token (PAT)
 */

/**
 * Configuração de autenticação GitHub
 */
interface GitHubConfig {
  pat: string;
  owner: string;
  repo: string;
  branch: string;
}

/**
 * Obtém configuração do GitHub a partir de variáveis de ambiente
 */
function getGitHubConfig(): GitHubConfig | null {
  const pat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!pat || !owner || !repo) {
    console.warn("[GitHub] Configuração incompleta. Variáveis necessárias:");
    console.warn("  - GITHUB_PAT");
    console.warn("  - GITHUB_OWNER");
    console.warn("  - GITHUB_REPO");
    return null;
  }

  return { pat, owner, repo, branch };
}

/**
 * Configura credenciais do Git com PAT
 */
function configureGitCredentials(config: GitHubConfig) {
  try {
    // Configurar credenciais globais do Git
    execSync(`git config --global user.email "bot@sofia-control-panel.local"`, { stdio: "ignore" });
    execSync(`git config --global user.name "Sofia Control Panel Bot"`, { stdio: "ignore" });

    // Configurar URL remota com autenticação via PAT
    const remoteUrl = `https://${config.pat}@github.com/${config.owner}/${config.repo}.git`;
    execSync(`git remote set-url origin ${remoteUrl}`, { stdio: "ignore" });

    console.log("[GitHub] Credenciais configuradas com sucesso");
  } catch (error) {
    console.error("[GitHub] Erro ao configurar credenciais:", error);
    throw error;
  }
}

/**
 * Faz commit com mensagem descritiva
 */
function commitChanges(message: string, files: string[] = []) {
  try {
    if (files.length > 0) {
      execSync(`git add ${files.join(" ")}`, { stdio: "pipe" });
    } else {
      execSync(`git add -A`, { stdio: "pipe" });
    }

    execSync(`git commit -m "${message}"`, { stdio: "pipe" });
    console.log(`[GitHub] Commit realizado: "${message}"`);
  } catch (error: any) {
    if (error.message.includes("nothing to commit")) {
      console.log("[GitHub] Nenhuma alteração para fazer commit");
    } else {
      console.error("[GitHub] Erro ao fazer commit:", error.message);
      throw error;
    }
  }
}

/**
 * Faz push das alterações para o repositório remoto
 */
function pushChanges(config: GitHubConfig) {
  try {
    execSync(`git push origin ${config.branch}`, { stdio: "pipe" });
    console.log(`[GitHub] Push realizado para ${config.owner}/${config.repo}:${config.branch}`);
  } catch (error) {
    console.error("[GitHub] Erro ao fazer push:", error);
    throw error;
  }
}

/**
 * Obtém o hash do último commit
 */
function getLastCommitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch (error) {
    console.error("[GitHub] Erro ao obter hash do commit:", error);
    return "unknown";
  }
}

/**
 * Atualiza arquivo UPDATES.md com novo commit
 */
function updateUpdatesFile(message: string, phase: string = "Desenvolvimento") {
  try {
    const updatesPath = path.join(process.cwd(), "UPDATES.md");
    const commitHash = getLastCommitHash();
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const entry = `## [${timestamp}] ${message}
**Commit**: \`${commitHash}\`
**Fase**: ${phase}
**Timestamp**: ${new Date().toISOString()}

`;

    if (fs.existsSync(updatesPath)) {
      const content = fs.readFileSync(updatesPath, "utf-8");
      // Inserir após o header
      const lines = content.split("\n");
      const headerIndex = lines.findIndex((line) => line.startsWith("# Sofia Control Panel"));

      if (headerIndex !== -1) {
        lines.splice(headerIndex + 2, 0, entry);
        fs.writeFileSync(updatesPath, lines.join("\n"));
      }
    } else {
      const header = `# Sofia Control Panel - Histórico de Atualizações

${entry}`;
      fs.writeFileSync(updatesPath, header);
    }

    console.log("[GitHub] UPDATES.md atualizado");
  } catch (error) {
    console.error("[GitHub] Erro ao atualizar UPDATES.md:", error);
  }
}

/**
 * Sincroniza alterações com GitHub
 * Fluxo completo: commit -> atualizar UPDATES.md -> push
 */
export async function syncWithGitHub(
  message: string,
  phase: string = "Desenvolvimento",
  files: string[] = []
) {
  try {
    const config = getGitHubConfig();
    if (!config) {
      console.warn("[GitHub] Sincronização pulada - configuração incompleta");
      return false;
    }

    console.log("[GitHub] Iniciando sincronização...");

    // Configurar credenciais
    configureGitCredentials(config);

    // Fazer commit
    commitChanges(message, files);

    // Atualizar UPDATES.md
    updateUpdatesFile(message, phase);

    // Fazer commit do UPDATES.md
    commitChanges(`docs: atualizar UPDATES.md com ${message}`, ["UPDATES.md"]);

    // Fazer push
    pushChanges(config);

    console.log("[GitHub] Sincronização concluída com sucesso");
    return true;
  } catch (error) {
    console.error("[GitHub] Erro durante sincronização:", error);
    return false;
  }
}

/**
 * Sincroniza apenas o arquivo UPDATES.md
 */
export async function syncUpdatesFile(message: string, phase: string = "Desenvolvimento") {
  try {
    const config = getGitHubConfig();
    if (!config) {
      console.warn("[GitHub] Sincronização pulada - configuração incompleta");
      return false;
    }

    console.log("[GitHub] Sincronizando UPDATES.md...");

    configureGitCredentials(config);
    updateUpdatesFile(message, phase);
    commitChanges(`docs: atualizar UPDATES.md - ${message}`, ["UPDATES.md"]);
    pushChanges(config);

    console.log("[GitHub] UPDATES.md sincronizado com sucesso");
    return true;
  } catch (error) {
    console.error("[GitHub] Erro ao sincronizar UPDATES.md:", error);
    return false;
  }
}

/**
 * Retorna o status do repositório Git
 */
export function getGitStatus(): string {
  try {
    return execSync("git status --short", { encoding: "utf-8" });
  } catch (error) {
    console.error("[GitHub] Erro ao obter status:", error);
    return "";
  }
}

/**
 * Retorna o histórico recente de commits
 */
export function getRecentCommits(count: number = 10): string {
  try {
    return execSync(`git log --oneline -${count}`, { encoding: "utf-8" });
  } catch (error) {
    console.error("[GitHub] Erro ao obter histórico:", error);
    return "";
  }
}
