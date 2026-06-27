import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, CheckSquare, MessageSquare, Activity, CreditCard, ExternalLink, Zap, Shield, Cpu } from "lucide-react";
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
        <div className="text-center p-12 border-4 border-accent bg-card/80 backdrop-blur-sm max-w-lg shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-4 h-4 bg-accent animate-pulse"></div>
            <h1 className="text-6xl font-black uppercase tracking-tighter italic text-accent">Sofia</h1>
            <div className="w-4 h-4 bg-accent animate-pulse"></div>
          </div>
          <p className="text-sm mb-10 text-muted-foreground uppercase tracking-[0.3em] font-black">
            Protocolo de Orquestração de Agentes IA
          </p>
          <a href={`/api/oauth/login?returnPath=${encodeURIComponent(window.location.pathname)}`}>
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black uppercase tracking-[0.2em] h-14 border-2 border-accent shadow-[0_0_20px_rgba(6,182,212,0.5)]">
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
      <div className="technical-header px-8 py-10 border-b-4 border-accent bg-gradient-to-r from-background to-background/50">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-4 h-4 bg-accent animate-pulse"></div>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic text-accent">Command Center</h1>
              <div className="w-4 h-4 bg-accent animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em] font-bold">
              Operador: <span className="text-accent font-black text-sm">{user?.name || "Agente Sofia"}</span> // Sistema: <span className="text-accent font-black text-sm">Ativo</span>
            </p>
          </div>
          <div className="text-right bg-accent/5 p-6 rounded-none border-2 border-accent/30">
            <div className="flex items-center gap-2 text-accent mb-2 justify-end">
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Créditos de Processamento</span>
            </div>
            <p className="text-4xl font-mono font-black text-accent tracking-tighter">1.250,00 <span className="text-xs text-muted-foreground">MNUS</span></p>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="px-8 py-12 bg-foreground/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total de Agentes */}
            <Card className="cad-card cursor-pointer hover:border-accent transition-all group border-4 shadow-lg" onClick={() => setLocation("/agents")}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">Unidades Ativas</p>
                  <p className="text-5xl font-mono font-black text-accent tracking-tighter">
                    {stats.totalAgents}
                  </p>
                </div>
                <Users className="w-12 h-12 text-accent/30 group-hover:text-accent/60 transition-colors" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t-2 border-accent/20 pt-4">
                <div className="status-indicator online"></div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.15em]">
                  {stats.onlineAgents} Online / {stats.totalAgents - stats.onlineAgents} Standby
                </span>
              </div>
            </Card>

            {/* Total de Tarefas */}
            <Card className="cad-card cursor-pointer hover:border-accent transition-all group border-4 shadow-lg" onClick={() => setLocation("/tasks")}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">Missões Pendentes</p>
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
            <Card className="cad-card cursor-pointer hover:border-accent transition-all group border-4 shadow-lg" onClick={() => setLocation("/messages")}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">Comunicações</p>
                  <p className="text-5xl font-mono font-black text-accent tracking-tighter">
                    {stats.unreadMessages}
                  </p>
                </div>
                <MessageSquare className="w-12 h-12 text-accent/30 group-hover:text-accent/60 transition-colors" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t-2 border-accent/20 pt-4">
                <div className={stats.unreadMessages > 0 ? "status-indicator paused" : "status-indicator online"}></div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.15em]">
                  {stats.unreadMessages > 0 ? "Transmissões Pendentes" : "Canais Limpos"}
                </span>
              </div>
            </Card>

            {/* Atividade Recente */}
            <Card className="cad-card group border-4 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-black">Logs de Sistema</p>
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

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="cad-card border-4 shadow-lg">
              <div className="flex justify-between items-center mb-8 border-b-2 border-accent/30 pb-6">
                <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-foreground">
                  Fluxo de Operações
                </h3>
                <Activity className="w-5 h-5 text-accent/60" />
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.08)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.4)" fontSize={11} fontBold="bold" />
                  <YAxis stroke="rgba(232, 240, 255, 0.4)" fontSize={11} fontBold="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.95)",
                      border: "3px solid rgba(6, 182, 212, 0.8)",
                      borderRadius: "0px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Bar dataKey="agents" fill="#06b6d4" name="Unidades" />
                  <Bar dataKey="tasks" fill="#1e40af" name="Missões" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="cad-card border-4 shadow-lg">
              <div className="flex justify-between items-center mb-8 border-b-2 border-accent/30 pb-6">
                <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-foreground">
                  Frequência de Dados
                </h3>
                <MessageSquare className="w-5 h-5 text-accent/60" />
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 240, 255, 0.08)" />
                  <XAxis dataKey="time" stroke="rgba(232, 240, 255, 0.4)" fontSize={11} fontBold="bold" />
                  <YAxis stroke="rgba(232, 240, 255, 0.4)" fontSize={11} fontBold="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 22, 40, 0.95)",
                      border: "3px solid rgba(6, 182, 212, 0.8)",
                      borderRadius: "0px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Line
                    type="stepAfter"
                    dataKey="messages"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    dot={{ fill: "#06b6d4", r: 5, strokeWidth: 2 }}
                    activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
                    name="Transmissões"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mb-8">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black mb-6 text-accent border-l-4 border-accent pl-4">
              Protocolos de Acesso Rápido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Button 
                variant="outline" 
                className="cad-box border-4 h-20 font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-8 group shadow-lg"
                onClick={() => setLocation("/agents")}
              >
                <span className="flex items-center gap-3">
                  <Cpu className="w-5 h-5" />
                  Gerenciar Agentes
                </span>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-4 h-20 font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-8 group shadow-lg"
                onClick={() => setLocation("/tasks")}
              >
                <span className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5" />
                  Lista de Missões
                </span>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-4 h-20 font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-8 group shadow-lg"
                onClick={() => setLocation("/messages")}
              >
                <span className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Terminal de Transmissão
                </span>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
              </Button>
              <Button 
                variant="outline" 
                className="cad-box border-4 h-20 font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between px-8 group shadow-lg"
                onClick={() => setLocation("/")}
              >
                <span className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Relatórios Operacionais
                </span>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
