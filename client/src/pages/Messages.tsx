import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, User, Cpu, Reply, X, Loader2, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export default function Messages() {
  const { isAuthenticated, user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [replyToId, setReplyToId] = useState<number | null>(null);

  // Mock data para tarefas (sidebar)
  const mockTasks = [
    { id: 1, title: "Análise de Portfólio Q3", status: "PROGRESS" },
    { id: 2, title: "Scraping de Dados Competitivos", status: "DONE" },
    { id: 3, title: "Monitoramento de Sentiment Analysis", status: "STAGED" },
    { id: 4, title: "Relatório de Performance Mensal", status: "PROGRESS" },
  ];

  // Mock data para mensagens
  const [allMessages, setAllMessages] = useState([
    { id: 1, taskId: 1, senderId: 0, content: "Iniciando análise dos ativos do terceiro trimestre.", createdAt: new Date(Date.now() - 3600000).toISOString(), parentMessageId: null },
    { id: 2, taskId: 1, senderId: user?.id || 999, content: "Priorize os ativos de tecnologia.", createdAt: new Date(Date.now() - 3000000).toISOString(), parentMessageId: 1 },
    { id: 3, taskId: 1, senderId: 0, content: "Entendido. Focando em ativos TECH.", createdAt: new Date(Date.now() - 2500000).toISOString(), parentMessageId: 2 },
    { id: 4, taskId: 2, senderId: 0, content: "Scraping concluído para 15 sites concorrentes.", createdAt: new Date(Date.now() - 1800000).toISOString(), parentMessageId: null },
  ]);

  const selectedTask = mockTasks.find(t => t.id === selectedTaskId);

  const threadedMessages = useMemo(() => {
    const taskMessages = allMessages.filter(m => m.taskId === selectedTaskId);
    const messages = [...taskMessages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const roots = messages.filter(m => !m.parentMessageId);
    const replies = messages.filter(m => m.parentMessageId);
    
    return roots.map(root => ({
      ...root,
      replies: replies.filter(r => r.parentMessageId === root.id)
    }));
  }, [allMessages, selectedTaskId]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedTaskId) {
      toast.error("Preencha a mensagem e selecione uma tarefa");
      return;
    }

    const newMessage = {
      id: allMessages.length + 1,
      taskId: selectedTaskId,
      senderId: user?.id || 999,
      content: messageContent,
      createdAt: new Date().toISOString(),
      parentMessageId: replyToId,
    };

    setAllMessages([...allMessages, newMessage]);
    setMessageContent("");
    setReplyToId(null);
    toast.success("Transmissão enviada com sucesso!");

    // Simular resposta do agente
    setTimeout(() => {
      const response = {
        id: allMessages.length + 2,
        taskId: selectedTaskId,
        senderId: 0, // ID do agente
        content: "Recebido. Processando informações no kernel...",
        createdAt: new Date().toISOString(),
        parentMessageId: newMessage.id,
      };
      setAllMessages(prev => [...prev, response]);
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest">Acesso Negado // Requer Autenticação</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30 bg-foreground/5">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Terminal de Comunicação</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
              Protocolo de Sincronização // Status: <span className="text-accent font-black">Link Ativo</span>
            </p>
          </div>
          <Terminal className="w-10 h-10 text-accent/30" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tarefas */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="cad-card flex flex-col h-[650px] p-0 overflow-hidden border-2">
              <div className="p-4 border-b-2 border-foreground/10 bg-foreground/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Canais de Missão</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {mockTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setReplyToId(null);
                      }}
                      className={`w-full text-left p-4 rounded-none transition-all border-2 ${
                        selectedTaskId === task.id 
                          ? "bg-accent/10 border-accent text-accent" 
                          : "border-foreground/5 hover:border-foreground/20 text-muted-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-mono font-black opacity-50 uppercase">CH-{task.id.toString().padStart(3, '0')}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 uppercase font-black border-2 ${task.status === 'DONE' ? 'border-green-500/50 text-green-500' : 'border-accent/50 text-accent'}`}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-tight leading-tight">{task.title}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="cad-card p-4 border-2">
              <h3 className="text-[9px] font-black uppercase tracking-widest mb-4 text-muted-foreground">Configurações de Terminal</h3>
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-black text-foreground">Sincronização Auto</span>
                <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${autoRefresh ? 'bg-accent' : 'bg-foreground/20'}`} onClick={() => setAutoRefresh(!autoRefresh)}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main - Chat */}
          <div className="lg:col-span-3">
            <Card className="cad-card h-[650px] flex flex-col p-0 overflow-hidden relative border-2">
              {selectedTaskId === null ? (
                <div className="flex items-center justify-center h-full text-muted-foreground bg-foreground/[0.02]">
                  <div className="text-center p-8 border-2 border-dashed border-foreground/10">
                    <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-10" />
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em]">Selecione um Canal Operacional</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Task Header */}
                  <div className="p-5 border-b-2 border-foreground/10 bg-foreground/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tighter text-accent italic">{selectedTask?.title}</h3>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest mt-1">
                        Link Criptografado // Canal: {selectedTaskId.toString().padStart(4, '0')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black uppercase text-green-500">Sincronizado</span>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-6 bg-foreground/[0.01]">
                    <div className="space-y-8">
                      {threadedMessages.length > 0 ? (
                        threadedMessages.map((thread) => (
                          <div key={thread.id} className="space-y-4">
                            {/* Root Message */}
                            <div className={`flex ${thread.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] space-y-2 ${thread.senderId === user?.id ? "items-end" : "items-start"} flex flex-col`}>
                                <div className="flex items-center gap-3 mb-1">
                                  {thread.senderId === user?.id ? <User className="w-3 h-3 text-accent" /> : <Cpu className="w-3 h-3 text-muted-foreground" />}
                                  <span className="text-[9px] font-black uppercase tracking-widest">{thread.senderId === user?.id ? "Operador" : "Sofia Kernel"}</span>
                                  <span className="text-[9px] font-mono opacity-40 font-bold">{new Date(thread.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className={`px-5 py-4 border-2 ${
                                  thread.senderId === user?.id 
                                    ? "bg-accent/10 border-accent/40 text-foreground" 
                                    : "bg-card border-foreground/10 text-foreground"
                                }`}>
                                  <p className="text-xs leading-relaxed font-bold">{thread.content}</p>
                                </div>
                                <button 
                                  onClick={() => setReplyToId(thread.id)}
                                  className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent flex items-center gap-2 mt-1 transition-colors"
                                >
                                  <Reply className="w-3 h-3" /> Responder
                                </button>
                              </div>
                            </div>

                            {/* Replies */}
                            {thread.replies.map((reply: any) => (
                              <div key={reply.id} className={`flex ${reply.senderId === user?.id ? "justify-end" : "justify-start"} ml-12`}>
                                <div className={`max-w-[85%] space-y-2 ${reply.senderId === user?.id ? "items-end" : "items-start"} flex flex-col`}>
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{reply.senderId === user?.id ? "Operador" : "Sofia Kernel"}</span>
                                    <span className="text-[9px] font-mono opacity-40 font-bold">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <div className={`px-4 py-3 border-l-4 ${
                                    reply.senderId === user?.id 
                                      ? "bg-accent/5 border-accent text-foreground" 
                                      : "bg-foreground/5 border-foreground/20 text-foreground"
                                  }`}>
                                    <p className="text-[11px] leading-relaxed font-bold">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20">
                          <p className="font-mono text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Nenhuma transmissão registrada.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-6 border-t-2 border-foreground/10 bg-card">
                    {replyToId && (
                      <div className="mb-4 p-3 bg-accent/5 border-l-4 border-accent flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-accent tracking-widest">Respondendo à transmissão #{replyToId.toString().padStart(3, '0')}</span>
                        <button onClick={() => setReplyToId(null)} className="hover:text-accent transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder="Compor nova transmissão..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          className="bg-foreground/5 border-2 border-foreground/10 resize-none font-mono text-xs focus:border-accent min-h-[100px] p-4 font-bold"
                        />
                        <div className="absolute bottom-2 right-2 text-[8px] font-black text-muted-foreground uppercase">Modo: Criptografado</div>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageContent.trim()}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 self-stretch px-8 flex flex-col gap-2 font-black uppercase text-[10px] tracking-widest"
                      >
                        <Send className="w-5 h-5" />
                        Enviar
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
