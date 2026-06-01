import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, CheckSquare, MessageSquare, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

// Mock data para demonstração (será substituído por dados reais)
const mockActivityData = [
  { time: "00:00", agents: 2, tasks: 5, messages: 3 },
  { time: "04:00", agents: 3, tasks: 8, messages: 5 },
  { time: "08:00", agents: 5, tasks: 12, messages: 8 },
  { time: "12:00", agents: 4, tasks: 10, messages: 6 },
  { time: "16:00", agents: 6, tasks: 15, messages: 10 },
  { time: "20:00", agents: 3, tasks: 7, messages: 4 },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState({
    totalAgents: 0,
    totalTasks: 0,
    unreadMessages: 0,
    recentActivity: 0,
  });

  // Queries tRPC
  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const activityQuery = trpc.activityLogs.getRecent.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  // Calcular métricas
  useEffect(() => {
    if (agentsQuery.data) {
      setMetrics((prev) => ({
        ...prev,
        totalAgents: agentsQuery.data?.length || 0,
      }));
    }
  }, [agentsQuery.data]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, <span className="text-accent font-semibold">{user?.name || "Agente"}</span>
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total de Agentes */}
            <Card className="cad-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Agentes</p>
                  <p className="text-3xl font-bold text-accent">
                    {agentsQuery.isLoading ? "..." : metrics.totalAgents}
                  </p>
                </div>
                <Users className="w-12 h-12 text-accent/50" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="status-indicator online"></div>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(metrics.totalAgents * 0.6)} online
                </span>
              </div>
            </Card>

            {/* Total de Tarefas */}
            <Card className="cad-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tarefas Ativas</p>
                  <p className="text-3xl font-bold text-accent">
                    {metrics.totalTasks || "0"}
                  </p>
                </div>
                <CheckSquare className="w-12 h-12 text-accent/50" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="status-indicator idle"></div>
                <span className="text-xs text-muted-foreground">
                  {Math.floor((metrics.totalTasks || 0) * 0.3)} em progresso
                </span>
              </div>
            </Card>

            {/* Mensagens Não Lidas */}
            <Card className="cad-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mensagens Não Lidas</p>
                  <p className="text-3xl font-bold text-accent">
                    {metrics.unreadMessages}
                  </p>
                </div>
                <MessageSquare className="w-12 h-12 text-accent/50" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="status-indicator paused"></div>
                <span className="text-xs text-muted-foreground">
                  Requer atenção
                </span>
              </div>
            </Card>

            {/* Atividade Recente */}
            <Card className="cad-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Atividade (24h)</p>
                  <p className="text-3xl font-bold text-accent">
                    {activityQuery.data?.length || "0"}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-accent/50" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="status-indicator online"></div>
                <span className="text-xs text-muted-foreground">
                  Eventos registrados
                </span>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras - Atividade por Hora */}
            <Card className="cad-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Atividade por Hora
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.1)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.5)" />
                  <YAxis stroke="rgba(232, 240, 255, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.9)",
                      border: "1px solid rgba(232, 240, 255, 0.3)",
                      borderRadius: "4px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="agents" fill="#06b6d4" name="Agentes" />
                  <Bar dataKey="tasks" fill="#1e40af" name="Tarefas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de Linhas - Tendência */}
            <Card className="cad-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Tendência de Mensagens
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.1)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.5)" />
                  <YAxis stroke="rgba(232, 240, 255, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.9)",
                      border: "1px solid rgba(232, 240, 255, 0.3)",
                      borderRadius: "4px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Mensagens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="cad-box border-2 h-12 font-semibold">
                ➕ Novo Agente
              </Button>
              <Button variant="outline" className="cad-box border-2 h-12 font-semibold">
                ➕ Nova Tarefa
              </Button>
              <Button variant="outline" className="cad-box border-2 h-12 font-semibold">
                💬 Mensagens
              </Button>
              <Button variant="outline" className="cad-box border-2 h-12 font-semibold">
                📊 Relatórios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
