import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, CheckSquare, MessageSquare, Activity, CreditCard, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Mock data para estatísticas
  const stats = {
    totalAgents: 8,
    onlineAgents: 5,
    totalTasks: 24,
    pendingTasks: 12,
    unreadMessages: 3,
    totalLogs: 156,
  };

  // Mock data para o gráfico
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
        <div className="text-center p-8 border-2 border-accent/20 bg-card/50 backdrop-blur-sm max-w-md">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter italic text-accent">Sofia</h1>
          <p className="text-sm mb-8 text-muted-foreground uppercase tracking-[0.2em] font-bold">
            Protocolo de Orquestração de Agentes
          </p>
          <a href={`/api/oauth/login?returnPath=${encodeURIComponent(window.location.pathname)}`}>
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black uppercase tracking-widest h-14">
              Inicializar Acesso
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30 bg-foreground/5">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-accent animate-pulse"></div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">Command Center</h1>
            </div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
              Operador: <span className="text-accent font-bold">{user?.name || "Agente Sofia"}</span> // Sistema: <span className="text-accent font-bold">Ativo</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-accent mb-1 justify-end">
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Créditos de Processamento</span>
            </div>
            <p className="text-3xl font-mono font-black text-foreground tracking-tighter">1.250,00 <span className="text-xs text-muted-foreground">MNUS</span></p>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total de Agentes */}
            <Card className="cad-card cursor-pointer hover:border-accent transition-all group" onClick={() => setLocation("/agents")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-black">Unidades Ativas</p>
                  <p className="text-4xl font-mono font-black text-accent tracking-tighter">
                    {stats.totalAgents}
                  </p>
                </div>
                <Users className="w-10 h-10 text-accent/20 group-hover:text-accent/40 transition-colors" />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-foreground/5 pt-3">
                <div className="status-indicator online"></div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-widest">
                  {stats.onlineAgents} Online / {stats.totalAgents - stats.onlineAgents} Standby
                </span>
              </div>
            </Card>

            {/* Total de Tarefas */}
            <Card className="cad-card cursor-pointer hover:border-accent transition-all group" onClick={() => setLocation("/tasks")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-black">Missões Pendentes</p>
                  <p className="text-4xl font-mono font-black text-accent tracking-tighter">
                    {stats.pendingTasks}
                  </p>
                </div>
                <CheckSquare className="w-10 h-10 text-accent/20 group-hover:text-accent/40 transition-colors" />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-foreground/5 pt-3">
                <div className="status-indicator idle"></div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-widest">
                  Total de {stats.totalTasks} Protocolos
                </span>
              </div>
            </Card>

            {/* Mensagens Não Lidas */}
            <Card className="cad-card cursor-pointer hover:border-accent transition-all group" onClick={() => setLocation("/messages")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-black">Comunicações</p>
                  <p className="text-4xl font-mono font-black text-accent tracking-tighter">
                    {stats.unreadMessages}
                  </p>
                </div>
                <MessageSquare className="w-10 h-10 text-accent/20 group-hover:text-accent/40 transition-colors" />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-foreground/5 pt-3">
                <div className={stats.unreadMessages > 0 ? "status-indicator paused" : "status-indicator online"}></div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-widest">
                  {stats.unreadMessages > 0 ? "Transmissões Pendentes" : "Canais Limpos"}
                </span>
              </div>
            </Card>

            {/* Atividade Recente */}
            <Card className="cad-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-black">Logs de Sistema</p>
                  <p className="text-4xl font-mono font-black text-accent tracking-tighter">
                    {stats.totalLogs}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-accent/20 group-hover:text-accent/40 transition-colors" />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-foreground/5 pt-3">
                <div className="status-indicator online"></div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-widest">
                  Monitoramento em Tempo Real
                </span>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="cad-card border-2">
              <div className="flex justify-between items-center mb-6 border-b border-foreground/10 pb-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground">
                  Fluxo de Operações
                </h3>
                <Activity className="w-4 h-4 text-accent/50" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.05)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.3)" fontSize={10} fontBold="bold" />
                  <YAxis stroke="rgba(232, 240, 255, 0.3)" fontSize={10} fontBold="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.95)",
                      border: "2px solid rgba(6, 182, 212, 0.5)",
                      borderRadius: "0px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Bar dataKey="agents" fill="#06b6d4" name="Unidades" />
                  <Bar dataKey="tasks" fill="#1e40af" name="Missões" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="cad-card border-2">
              <div className="flex justify-between items-center mb-6 border-b border-foreground/10 pb-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground">
                  Frequência de Dados
                </h3>
                <MessageSquare className="w-4 h-4 text-accent/50" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.05)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.3)" fontSize={10} fontBold="bold" />
                  <YAxis stroke="rgba(232, 240, 255, 0.3)" fontSize={10} fontBold="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.95)",
                      border: "2px solid rgba(6, 182, 212, 0.5)",
                      borderRadius: "0px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Line
                    type="stepAfter"
                    dataKey="messages"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                    name="Transmissões"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-8">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4 text-muted-foreground border-l-4 border-accent pl-4">
              Protocolos de Acesso Rápido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="cad-box border-2 h-16 font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-6 group"
                onClick={() => setLocation("/agents")}
              >
                Gerenciar Agentes
                <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100" />
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-2 h-16 font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-6 group"
                onClick={() => setLocation("/tasks")}
              >
                Lista de Missões
                <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100" />
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-2 h-16 font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-6 group"
                onClick={() => setLocation("/messages")}
              >
                Terminal de Transmissão
                <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100" />
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-2 h-16 font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-6 group"
                onClick={() => setLocation("/")}
              >
                Relatórios Operacionais
                <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
