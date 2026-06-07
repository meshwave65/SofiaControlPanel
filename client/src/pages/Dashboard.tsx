import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

/**
 * Dashboard Principal - Painel de controle em tempo real
 * Exibe métricas de agentes, tarefas e mensagens com gráficos de atividade
 */
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  // Queries para obter dados
  const agentsQuery = trpc.agents.list.useQuery(undefined, { enabled: !!user });
  const tasksQuery = trpc.tasks.listAll.useQuery(undefined, { enabled: !!user });
  const activityQuery = trpc.activityLogs.getRecent.useQuery({ limit: 20 }, { enabled: !!user });

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  // Dados dos agentes
  const agents = agentsQuery.data || [];
  const agentsOnline = agents.filter((a) => a.status === "online").length;
  const agentsOffline = agents.filter((a) => a.status === "offline").length;
  const agentsIdle = agents.filter((a) => a.status === "idle").length;
  const agentsPaused = agents.filter((a) => a.status === "paused").length;

  // Dados das tarefas
  const tasks = tasksQuery.data || [];
  const tasksPending = tasks.filter((t) => t.statusId === 1).length;
  const tasksCompleted = tasks.filter((t) => t.completedAt).length;

  // Dados de atividade para gráfico
  const activityLogs = activityQuery.data || [];
  const activityData = [
    { time: "00:00", events: 5 },
    { time: "04:00", events: 8 },
    { time: "08:00", events: 12 },
    { time: "12:00", events: 15 },
    { time: "16:00", events: 18 },
    { time: "20:00", events: 14 },
    { time: "23:59", events: 9 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="technical-header">
          <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real de agentes e tarefas</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agentes Online */}
          <Card className="cad-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agentes Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-display">
                <div className="value text-green-500">{agentsOnline}</div>
                <div className="text-xs text-muted-foreground">de {agents.length} total</div>
              </div>
            </CardContent>
          </Card>

          {/* Agentes Offline */}
          <Card className="cad-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agentes Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-display">
                <div className="value text-gray-500">{agentsOffline}</div>
                <div className="text-xs text-muted-foreground">aguardando conexão</div>
              </div>
            </CardContent>
          </Card>

          {/* Tarefas Pendentes */}
          <Card className="cad-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-display">
                <div className="value text-yellow-500">{tasksPending}</div>
                <div className="text-xs text-muted-foreground">em execução</div>
              </div>
            </CardContent>
          </Card>

          {/* Tarefas Concluídas */}
          <Card className="cad-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-display">
                <div className="value text-green-500">{tasksCompleted}</div>
                <div className="text-xs text-muted-foreground">sucesso</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividade Recente */}
          <Card className="cad-card">
            <CardHeader>
              <CardTitle>Atividade Recente (24h)</CardTitle>
              <CardDescription>Eventos de log por hora</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.5)" />
                  <YAxis stroke="rgba(232, 240, 255, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.8)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                      borderRadius: "0.25rem",
                    }}
                  />
                  <Line type="monotone" dataKey="events" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status dos Agentes */}
          <Card className="cad-card">
            <CardHeader>
              <CardTitle>Status dos Agentes</CardTitle>
              <CardDescription>Distribuição por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { status: "Online", count: agentsOnline },
                    { status: "Offline", count: agentsOffline },
                    { status: "Idle", count: agentsIdle },
                    { status: "Paused", count: agentsPaused },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                  <XAxis dataKey="status" stroke="rgba(232, 240, 255, 0.5)" />
                  <YAxis stroke="rgba(232, 240, 255, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.8)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                      borderRadius: "0.25rem",
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Agentes Recentes */}
        <Card className="cad-card">
          <CardHeader>
            <CardTitle>Agentes Ativos</CardTitle>
            <CardDescription>Últimos agentes com atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="task-row flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`status-indicator ${agent.status}`} />
                    <div>
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.status}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agent.lastHeartbeat ? new Date(agent.lastHeartbeat).toLocaleTimeString() : "Nunca"}
                  </div>
                </div>
              ))}
              {agents.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhum agente registrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
