import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  CheckSquare,
  MessageSquare,
  Activity,
  CreditCard,
  ExternalLink,
  Zap,
  Shield,
  Cpu,
} from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { login, register, startGoogleLogin } from "@/lib/auth";

export default function Home() {
  const { user, isAuthenticated, error: backendAuthError, hasSession } = useAuth();
  const [, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const tasksQuery = trpc.tasks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const agents = agentsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const { data: lookups } = trpc.lookups.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const totalCredits = agents.reduce(
    (sum: number, agent: any) => sum + (Number(agent.creditsRemaining) || 0),
    0
  );
  const pendingStatusIds = new Set(
    (lookups?.statuses ?? [])
      .filter((status) => ["STAGED", "PROGRESS"].includes(status.name.toUpperCase()))
      .map((status) => status.id)
  );
  const stats = {
    totalAgents: agents.length || 0,
    onlineAgents: agents.filter((a: any) => a.status === "online").length || 0,
    totalTasks: tasks.length || 0,
    pendingTasks: tasks.filter((task) => pendingStatusIds.has(task.statusId)).length,
    unreadMessages: 0,
    totalLogs: 0,
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setIsSubmittingAuth(true);

    try {
      if (authMode === "login") {
        await login(email, password);
        window.location.replace("/");
      } else {
        const result = await register(email, password, { full_name: email });
        if (!result.session) {
          setAuthMessage("Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar.");
        } else {
          window.location.replace("/");
        }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Não foi possível concluir a autenticação.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const activityData = [
    { time: "00:00", agents: 2, tasks: 5, messages: 3 },
    { time: "04:00", agents: 3, tasks: 8, messages: 5 },
    { time: "08:00", agents: 5, tasks: 12, messages: 8 },
    { time: "12:00", agents: 4, tasks: 10, messages: 6 },
    { time: "16:00", agents: 6, tasks: 15, messages: 10 },
    { time: "20:00", agents: 3, tasks: 7, messages: 4 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b-2 border-accent/30 px-6 py-6 sm:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-accent animate-pulse" />
              <span className="text-lg font-black uppercase tracking-[0.2em] text-accent">
                SofiaControlPanel
              </span>
            </div>
            <nav className="flex gap-4 text-xs uppercase tracking-wider text-muted-foreground">
              <Link href="/privacity" className="hover:text-accent">
                Privacidade
              </Link>
              <Link href="/terms" className="hover:text-accent">
                Termos
              </Link>
            </nav>
          </div>
        </header>

        {hasSession && backendAuthError && (
          <div role="alert" className="mx-auto mt-6 max-w-6xl border-2 border-red-500/40 bg-red-500/5 p-5 text-sm text-red-300">
            <p className="font-black uppercase tracking-widest">Sessão ativa, mas o painel não conseguiu validar o usuário no backend.</p>
            <p className="mt-2 font-mono text-xs">{backendAuthError.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">Saia da conta e entre novamente. Se o erro persistir, esta mensagem identifica a falha de autenticação da API.</p>
          </div>
        )}

        <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
          <section>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-accent">
              Protocolo de Orquestração de Agentes IA
            </p>
            <h1 className="max-w-3xl text-5xl font-black uppercase tracking-tighter sm:text-7xl">
              Controle claro para missões inteligentes.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              O SofiaControlPanel é o painel de controle e acompanhamento da
              plataforma Sofia. Ele organiza agentes, tarefas, missões e
              mensagens em um espaço operacional único para apoiar a execução e
              a supervisão de processos de IA.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  setAuthError(null);
                  void startGoogleLogin().catch((error) => {
                    setAuthError(error instanceof Error ? error.message : "Não foi possível iniciar o login com Google.");
                  });
                }}
                className="h-14 border-2 border-accent bg-accent px-7 font-black uppercase tracking-[0.15em] text-accent-foreground shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:bg-accent/90"
              >
                Entrar com Google
              </button>
              <Link
                href="/privacity"
                className="text-sm font-bold text-accent underline underline-offset-4 hover:text-foreground"
              >
                Como usamos seus dados
              </Link>
            </div>
          </section>

          <aside className="cad-card space-y-6 border-2 border-accent/30 p-7">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
              Sobre o aplicativo
            </p>
            <div className="space-y-5 text-sm leading-7 text-muted-foreground">
              <div>
                <strong className="text-foreground">Agentes:</strong> acompanhe
                unidades e estados operacionais.
              </div>
              <div>
                <strong className="text-foreground">Missões:</strong> organize
                tarefas e observe seu progresso.
              </div>
              <div>
                <strong className="text-foreground">Comunicação:</strong>{" "}
                concentre mensagens e eventos relevantes.
              </div>
              <div>
                <strong className="text-foreground">Acesso:</strong> entre com
                Google ou com uma conta de e-mail autorizada.
              </div>
            </div>
            <div className="border-t border-foreground/15 pt-5 text-xs leading-6 text-muted-foreground">
              O acesso ao painel interno requer autenticação. Esta página
              pública explica a finalidade do app e apresenta as informações de
              privacidade e uso antes do login.
            </div>
          </aside>

          <section className="cad-card border-2 border-foreground/20 p-7 lg:col-start-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
                  Acesso alternativo
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {authMode === "login" ? "Entrar com e-mail" : "Criar conta"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError(null);
                  setAuthMessage(null);
                }}
                className="text-xs font-bold text-accent underline underline-offset-4"
              >
                {authMode === "login" ? "Criar conta" : "Já tenho conta"}
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest" htmlFor="auth-email">
                E-mail
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="mt-2 h-12 w-full border-2 border-foreground/20 bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-widest" htmlFor="auth-password">
                Senha
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                  className="mt-2 h-12 w-full border-2 border-foreground/20 bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </label>
              {authError && <p role="alert" className="text-sm text-red-500">{authError}</p>}
              {authMessage && <p role="status" className="text-sm text-accent">{authMessage}</p>}
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="h-12 w-full border-2 border-foreground/30 px-5 text-sm font-black uppercase tracking-widest hover:border-accent disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmittingAuth ? "Processando…" : authMode === "login" ? "Entrar" : "Cadastrar"}
              </button>
            </form>
          </section>
        </main>

        <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-foreground/10 px-6 py-8 text-xs text-muted-foreground sm:px-10">
          <span>SofiaControlPanel · MeshWave</span>
          <span>Contato: info@meshwave.com.br</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {(agentsQuery.isError || tasksQuery.isError) && (
        <div role="alert" className="mx-auto max-w-7xl border-2 border-red-500/40 bg-red-500/5 p-5 text-sm text-red-300">
          <p className="font-black uppercase tracking-widest">Falha ao carregar dados operacionais</p>
          {agentsQuery.isError && <p className="mt-2">Agentes: <span className="font-mono text-xs">{agentsQuery.error.message}</span></p>}
          {tasksQuery.isError && <p className="mt-2">Missões: <span className="font-mono text-xs">{tasksQuery.error.message}</span></p>}
        </div>
      )}
      {/* DEPLOY VALIDATION WATERMARK */}
      <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-[10px] font-bold text-center py-1 z-[9999] uppercase tracking-widest animate-pulse pointer-events-none">
        Deploy Verificado: Manus AI - Julho 2026 - Sofia Control Panel v1.2
      </div>

      {/* Header */}
      <div className="technical-header px-8 py-10 border-b-4 border-accent bg-gradient-to-r from-background to-background/50">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-4 h-4 bg-accent animate-pulse"></div>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic text-accent">
                Command Center
              </h1>
              <div className="w-4 h-4 bg-accent animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em] font-bold">
              Operador:{" "}
              <span className="text-accent font-black text-sm">
                {user?.name || "Agente Sofia"}
              </span>{" "}
              // Sistema:{" "}
              <span className="text-accent font-black text-sm">Ativo</span>
            </p>
          </div>
          <div className="text-right bg-accent/5 p-6 rounded-none border-2 border-accent/30">
            <div className="flex items-center gap-2 text-accent mb-2 justify-end">
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Créditos de Processamento
              </span>
            </div>
            <p className="text-4xl font-mono font-black text-accent tracking-tighter">
              {totalCredits > 0
                ? totalCredits.toLocaleString("pt-BR", {
                    maximumFractionDigits: 2,
                  })
                : "—"}{" "}
              <span className="text-xs text-muted-foreground">
                CRÉDITOS CONHECIDOS
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="px-8 py-12 bg-foreground/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total de Agentes */}
            <Card
              className="cad-card cursor-pointer hover:border-accent transition-all group border-4 shadow-lg"
              onClick={() => setLocation("/agents")}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">
                    Unidades Ativas
                  </p>
                  <p className="text-5xl font-mono font-black text-accent tracking-tighter">
                    {stats.totalAgents}
                  </p>
                </div>
                <Users className="w-12 h-12 text-accent/30 group-hover:text-accent/60 transition-colors" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t-2 border-accent/20 pt-4">
                <div className="status-indicator online"></div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.15em]">
                  {stats.onlineAgents} Online /{" "}
                  {stats.totalAgents - stats.onlineAgents} Standby
                </span>
              </div>
            </Card>
            {/* Total de Tarefas */}
            <Card
              className="cad-card cursor-pointer hover:border-accent transition-all group border-4 shadow-lg"
              onClick={() => setLocation("/tasks")}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">
                    Missões Pendentes
                  </p>
                  <p className="text-5xl font-mono font-black text-accent tracking-tighter">
                    {stats.pendingTasks}
                  </p>
                </div>
                <CheckSquare className="w-12 h-12 text-accent/30 group-hover:text-accent/60 transition-colors" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t-2 border-accent/20 pt-4">
                <div className="status-indicator idle"></div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.15em]">
                  Total de {stats.totalTasks} Protocolos
                </span>
              </div>
            </Card>
            {/* Mensagens Não Lidas */}
            <Card
              className="cad-card cursor-pointer hover:border-accent transition-all group border-4 shadow-lg"
              onClick={() => setLocation("/messages")}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">
                    Comunicações
                  </p>
                  <p className="text-5xl font-mono font-black text-accent tracking-tighter">
                    {stats.unreadMessages}
                  </p>
                </div>
                <MessageSquare className="w-12 h-12 text-accent/30 group-hover:text-accent/60 transition-colors" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t-2 border-accent/20 pt-4">
                <div
                  className={
                    stats.unreadMessages > 0
                      ? "status-indicator paused"
                      : "status-indicator online"
                  }
                ></div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.15em]">
                  {stats.unreadMessages > 0
                    ? "Transmissões Pendentes"
                    : "Canais Limpos"}
                </span>
              </div>
            </Card>
            {/* Atividade Recente */}
            <Card className="cad-card group border-4 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">
                    Logs de Sistema
                  </p>
                  <p className="text-5xl font-mono font-black text-accent tracking-tighter">
                    {stats.totalLogs}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-accent/30 group-hover:text-accent/60 transition-colors" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t-2 border-accent/20 pt-4">
                <div className="status-indicator online"></div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.15em]">
                  Monitoramento em Tempo Real
                </span>
              </div>
            </Card>
          </div>

          {/* Gráficos e resto do código permanecem iguais */}
          {/* ... (o resto do seu código) ... */}
        </div>
      </div>
    </div>
  );
}
