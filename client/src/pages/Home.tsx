import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, CheckSquare, MessageSquare, Activity, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Queries tRPC com polling de 15s
  const statsQuery = trpc.stats.getDashboard.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const activityQuery = trpc.activityLogs.getRecent.useQuery(
    { limit: 24 },
    { 
      enabled: isAuthenticated,
      refetchInterval: 15000,
    }
  );

  // Mock data para o gráfico baseado em dados reais se possível, ou mantendo mock para visual
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Sofia Control Panel</h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Plataforma de Orquestração de Agentes de IA
          </p>
          <a href={`/api/oauth/login?returnPath=${encodeURIComponent(window.location.pathname)}`}>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Entrar com Manus
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data || {
    totalAgents: 0,
    onlineAgents: 0,
    totalTasks: 0,
    pendingTasks: 0,
    unreadMessages: 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-tighter">Command Center</h1>
            <p className="text-muted-foreground">
              Operador: <span className="text-accent font-semibold">{user?.name || "Agente"}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-accent mb-1 justify-end">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-bold uppercase">Créditos Disponíveis</span>
            </div>
            <p className="text-2xl font-mono font-bold">1,250.00 <span className="text-xs text-muted-foreground">MANUS</span></p>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total de Agentes */}
            <Card className="cad-card cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setLocation("/agents")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Agentes Ativos</p>
                  <p className="text-3xl font-mono font-bold text-accent">
                    {statsQuery.isLoading ? "---" : stats.totalAgents}
                  </p>
                </div>
                <Users className="w-10 h-10 text-accent/30" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className={`status-indicator ${stats.onlineAgents > 0 ? 'online' : 'offline'}`}></div>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {stats.onlineAgents} Online / {stats.totalAgents - stats.onlineAgents} Offline
                </span>
              </div>
            </Card>

            {/* Total de Tarefas */}
            <Card className="cad-card cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setLocation("/tasks")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Tarefas Pendentes</p>
                  <p className="text-3xl font-mono font-bold text-accent">
                    {statsQuery.isLoading ? "---" : stats.pendingTasks}
                  </p>
                </div>
                <CheckSquare className="w-10 h-10 text-accent/30" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="status-indicator idle"></div>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  Total de {stats.totalTasks} Registradas
                </span>
              </div>
            </Card>

            {/* Mensagens Não Lidas */}
            <Card className="cad-card cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setLocation("/messages")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Mensagens</p>
                  <p className="text-3xl font-mono font-bold text-accent">
                    {statsQuery.isLoading ? "---" : stats.unreadMessages}
                  </p>
                </div>
                <MessageSquare className="w-10 h-10 text-accent/30" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className={stats.unreadMessages > 0 ? "status-indicator paused" : "status-indicator online"}></div>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {stats.unreadMessages > 0 ? "Requer Atenção" : "Sistema Limpo"}
                </span>
              </div>
            </Card>

            {/* Atividade Recente */}
            <Card className="cad-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Logs (24h)</p>
                  <p className="text-3xl font-mono font-bold text-accent">
                    {activityQuery.isLoading ? "---" : activityQuery.data?.length || "0"}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-accent/30" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="status-indicator online"></div>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  Monitoramento Ativo
                </span>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="cad-card">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-6 text-foreground border-b border-foreground/10 pb-2">
                Fluxo de Atividade do Sistema
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.05)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.3)" fontSize={10} />
                  <YAxis stroke="rgba(232, 240, 255, 0.3)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.95)",
                      border: "1px solid rgba(232, 240, 255, 0.2)",
                      borderRadius: "0px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                  <Bar dataKey="agents" fill="#06b6d4" name="Agentes" />
                  <Bar dataKey="tasks" fill="#1e40af" name="Tarefas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="cad-card">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-6 text-foreground border-b border-foreground/10 pb-2">
                Tendência de Comunicação
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.05)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.3)" fontSize={10} />
                  <YAxis stroke="rgba(232, 240, 255, 0.3)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.95)",
                      border: "1px solid rgba(232, 240, 255, 0.2)",
                      borderRadius: "0px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                  <Line
                    type="stepAfter"
                    dataKey="messages"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Mensagens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-widest font-bold mb-4 text-foreground">Protocolos de Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="cad-box border-2 h-14 font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all"
                onClick={() => setLocation("/agents")}
              >
                Gerenciar Agentes
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-2 h-14 font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all"
                onClick={() => setLocation("/tasks")}
              >
                Lista de Missões
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-2 h-14 font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all"
                onClick={() => setLocation("/messages")}
              >
                Terminal de Mensagens
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-2 h-14 font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all"
                onClick={() => setLocation("/")}
              >
                Relatórios Operacionais
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
