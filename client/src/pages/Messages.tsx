import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Send, MessageSquare, Loader2, User, Cpu, Reply } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Messages() {
  const { isAuthenticated, user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [replyToId, setReplyToId] = useState<number | null>(null);

  // Queries
  const tasksQuery = trpc.tasks.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const messagesQuery = trpc.messages.getByTask.useQuery(
    { taskId: selectedTaskId || 0 },
    { 
      enabled: isAuthenticated && selectedTaskId !== null, 
      refetchInterval: autoRefresh ? 5000 : false 
    }
  );

  // Agrupar mensagens por threads (parentMessageId)
  const threadedMessages = useMemo(() => {
    if (!messagesQuery.data) return [];
    
    const messages = [...messagesQuery.data].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const roots = messages.filter(m => !m.parentMessageId);
    const replies = messages.filter(m => m.parentMessageId);
    
    return roots.map(root => ({
      ...root,
      replies: replies.filter(r => r.parentMessageId === root.id)
    }));
  }, [messagesQuery.data]);

  // Mutations
  const sendMessageMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada!");
      setMessageContent("");
      setReplyToId(null);
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedTaskId) {
      toast.error("Preencha a mensagem e selecione uma tarefa");
      return;
    }

    sendMessageMutation.mutate({
      taskId: selectedTaskId,
      typeId: 1, // Tipo padrão
      content: messageContent,
      parentMessageId: replyToId || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Você precisa estar autenticado para acessar esta página.</p>
      </div>
    );
  }

  const selectedTask = tasksQuery.data?.find(t => t.id === selectedTaskId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-tighter italic">Terminal de Comunicação</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            Protocolo de Sincronização de Mensagens // Status: <span className="text-accent font-bold">Conectado</span>
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tarefas */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="cad-card flex flex-col h-[600px] p-0 overflow-hidden">
              <div className="p-4 border-b border-foreground/10 bg-foreground/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Missões Ativas</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {tasksQuery.isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-accent" /></div>
                  ) : tasksQuery.data?.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setReplyToId(null);
                      }}
                      className={`w-full text-left p-3 rounded transition-all border ${
                        selectedTaskId === task.id 
                          ? "bg-accent/10 border-accent text-accent" 
                          : "border-transparent hover:bg-foreground/5 text-muted-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono opacity-50">#{task.id.toString().padStart(4, '0')}</span>
                        {task.statusId === 3 && <Badge variant="outline" className="text-[8px] h-4 uppercase">Concluída</Badge>}
                      </div>
                      <p className="text-xs font-bold uppercase truncate">{task.title}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="cad-card p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4">Configurações</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Auto-Refresh (5s)</span>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
              </div>
            </Card>
          </div>

          {/* Main - Chat */}
          <div className="lg:col-span-3">
            <Card className="cad-card h-[600px] flex flex-col p-0 overflow-hidden relative">
              {selectedTaskId === null ? (
                <div className="flex items-center justify-center h-full text-muted-foreground bg-foreground/[0.02]">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-mono text-xs uppercase tracking-[0.2em]">Aguardando Seleção de Missão</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Task Header */}
                  <div className="p-4 border-b border-foreground/10 bg-foreground/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-accent italic">{selectedTask?.title}</h3>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase">Canal Seguro // Task-ID: {selectedTaskId}</p>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {messagesQuery.isLoading ? (
                        <div className="text-center py-8"><Loader2 className="animate-spin text-accent mx-auto" /></div>
                      ) : threadedMessages.length > 0 ? (
                        threadedMessages.map((thread) => (
                          <div key={thread.id} className="space-y-3">
                            {/* Root Message */}
                            <div className={`flex ${thread.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] space-y-1 ${thread.senderId === user?.id ? "items-end" : "items-start"} flex flex-col`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {thread.senderId === user?.id ? <User className="w-3 h-3 text-accent" /> : <Cpu className="w-3 h-3 text-muted-foreground" />}
                                  <span className="text-[9px] font-mono uppercase font-bold">{thread.senderId === user?.id ? "Operador" : "Agente Sofia"}</span>
                                  <span className="text-[9px] font-mono opacity-40">{new Date(thread.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className={`px-4 py-3 border-2 ${
                                  thread.senderId === user?.id 
                                    ? "bg-accent/10 border-accent/30 text-foreground" 
                                    : "bg-muted/50 border-foreground/10 text-foreground"
                                }`}>
                                  <p className="text-xs leading-relaxed">{thread.content}</p>
                                </div>
                                <button 
                                  onClick={() => setReplyToId(thread.id)}
                                  className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent flex items-center gap-1 mt-1"
                                >
                                  <Reply className="w-3 h-3" /> Responder
                                </button>
                              </div>
                            </div>

                            {/* Replies */}
                            {thread.replies.map((reply: any) => (
                              <div key={reply.id} className={`flex ${reply.senderId === user?.id ? "justify-end" : "justify-start"} ml-8`}>
                                <div className={`max-w-[80%] space-y-1 ${reply.senderId === user?.id ? "items-end" : "items-start"} flex flex-col`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-mono uppercase font-bold opacity-60">{reply.senderId === user?.id ? "Operador" : "Agente Sofia"}</span>
                                    <span className="text-[9px] font-mono opacity-40">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <div className={`px-3 py-2 border-l-2 ${
                                    reply.senderId === user?.id 
                                      ? "bg-accent/5 border-accent/50 text-foreground" 
                                      : "bg-muted/30 border-foreground/20 text-foreground"
                                  }`}>
                                    <p className="text-[11px] leading-relaxed">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20">
                          <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Nenhuma transmissão registrada neste canal.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t border-foreground/20 bg-card">
                    {replyToId && (
                      <div className="mb-2 p-2 bg-accent/5 border-l-2 border-accent flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase text-accent">Respondendo à mensagem #{replyToId}</span>
                        <button onClick={() => setReplyToId(null)}><X className="w-3 h-3 text-muted-foreground" /></button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Compor transmissão..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="bg-foreground/5 border-foreground/20 resize-none font-mono text-xs focus:border-accent min-h-[80px]"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || !messageContent.trim()}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 self-stretch px-6"
                      >
                        {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
