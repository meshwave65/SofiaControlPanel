import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, CheckSquare, MessageSquare, Activity, CreditCard, ExternalLink, Zap, Shield, Cpu } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: agents = [] } = trpc.agents.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tasks = [] } = trpc.tasks.list.useQuery(undefined, { enabled: isAuthenticated });
 
  const stats = {
    totalAgents: agents.length || 0,
    onlineAgents: agents.filter((a: any) => a.status === 'online').length || 0,
    totalTasks: tasks.length || 0,
    pendingTasks: tasks.filter((t: any) => t.statusId === 100 || t.statusId === 110).length || 0,
    unreadMessages: 0,
    totalLogs: 0,
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
          
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ 
              provider: 'google',
              options: { redirectTo: window.location.origin }
            })}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black uppercase tracking-[0.2em] h-14 border-2 border-accent shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          >
            Inicializar Acesso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
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

          {/* Gráficos e resto do código permanecem iguais */}
          {/* ... (o resto do seu código) ... */}
        </div>
      </div>
    </div>
  );
}
