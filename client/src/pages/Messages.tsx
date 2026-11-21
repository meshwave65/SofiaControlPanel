import { useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  AlertCircle,
  ClipboardList,
  File as FileIcon,
  FilePlus2,
  Inbox,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  SquarePen,
  X,
} from "lucide-react";

type TaskStatus = "open" | "in_progress" | "on_hold" | "done";

const taskStatuses: { value: TaskStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "on_hold", label: "On hold" },
  { value: "done", label: "Done" },
];

export default function Messages() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedMessageTypeId, setSelectedMessageTypeId] = useState<number | null>(null);
  const [selectedParentMessageId, setSelectedParentMessageId] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("open");
  const [messageContent, setMessageContent] = useState("");
  const [search, setSearch] = useState("");
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasksQuery = trpc.tasks.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const messageContext = selectedTaskId === null ? "general" : "mission";
  const messageTypesQuery = trpc.messages.types.useQuery({
    context: messageContext,
    hasParent: selectedParentMessageId !== null,
  }, {
    enabled: isAuthenticated,
    refetchInterval: (query) => query.state.data?.length ? false : 3000,
  });
  const generalMessagesQuery = trpc.messages.getGeneral.useQuery(undefined, {
    enabled: isAuthenticated && selectedTaskId === null,
    refetchInterval: 5000,
  });
  const utils = trpc.useUtils();
  const taskMessagesQuery = trpc.messages.getByTask.useQuery(
    { taskId: selectedTaskId ?? 0 },
    { enabled: isAuthenticated && selectedTaskId !== null, refetchInterval: 5000 },
  );

  const createMissionMessage = trpc.messages.create.useMutation({
    onSuccess: async (result) => {
      await utils.tasks.list.invalidate();
      if (selectedTaskId !== null) await taskMessagesQuery.refetch();
      setMessageContent("");
      setSelectedParentMessageId(null);
      setAttachments([]);
      toast.success(result.responseStatus === "replied" ? "Interação registrada e respondida pela SOFIA." : "Interação registrada; resposta da SOFIA pendente.");
    },
    onError: (error) => toast.error(error.message),
  });
  const createGeneralMessage = trpc.messages.createGeneral.useMutation({
    onSuccess: async (result) => {
      await Promise.all([generalMessagesQuery.refetch(), utils.tasks.list.invalidate()]);
      setMessageContent("");
      setSelectedParentMessageId(null);
      setAttachments([]);
      if (result.createdMission) {
        toast.success(`Missão #${result.createdMission.id} criada em PAUSED. A solicitação original permanece na conversa geral.`);
      } else {
        toast.success(result.responseStatus === "replied" ? "Interação geral registrada e respondida pela SOFIA." : "Interação registrada; resposta da SOFIA pendente.");
      }
    },
    onError: (error) => toast.error(error.message),
  });
  const tasks = tasksQuery.data || [];
  const messages = selectedTaskId === null
    ? generalMessagesQuery.data || []
    : taskMessagesQuery.data || [];
  const selectedParentMessage = messages.find((message: any) => message.id === selectedParentMessageId);
  const availableMessageTypes = messageTypesQuery.data || [];
  const selectedMessageType = availableMessageTypes.find((type: any) => type.id === selectedMessageTypeId)
    ?? (selectedParentMessageId !== null
      ? availableMessageTypes.find((type: any) => String(type.name).toLowerCase() === "reply")
      : undefined)
    ?? availableMessageTypes.find((type: any) => String(type.name).toLowerCase() === "message")
    ?? availableMessageTypes[0];

  const selectedTask = tasks.find((task: any) => task.id === selectedTaskId);
  const filteredTasks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return tasks;
    return tasks.filter((task: any) =>
      String(task.title || "").toLocaleLowerCase().includes(term) ||
      String(task.id).includes(term)
    );
  }, [tasks, search]);

  const resetComposer = () => {
    setMessageContent("");
    setAttachments([]);
    setSelectedMessageTypeId(null);
    setSelectedParentMessageId(null);
    setTaskStatus("open");
    setEditorMode("create");
  };

  const handleCancel = () => {
    resetComposer();
    toast.info("Edição cancelada.");
  };

  const handleAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length) setAttachments((current) => [...current, ...selected]);
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handlePrepare = () => {
    if (!messageContent.trim()) {
      toast.error("Digite o conteúdo da interação.");
      return;
    }
    if (!selectedMessageType) {
      toast.error("Não há tipos de interação disponíveis neste contexto.");
      return;
    }

    const normalizedTypeName = String(selectedMessageType.name).toLowerCase().replace(/[\\s_-]/g, "");
    if (normalizedTypeName === "createtask" && selectedTaskId !== null) {
      toast.error("Solicitações de criação de missão devem ser enviadas pela Conversa geral.");
      return;
    }
    if (normalizedTypeName === "reply" && selectedParentMessageId === null) {
      toast.error("Selecione a mensagem original que receberá esta resposta.");
      return;
    }

    const payload = {
      typeId: selectedMessageType.id,
      content: messageContent.trim(),
      ...(selectedParentMessageId !== null ? { parentMessageId: selectedParentMessageId } : {}),
    };
    if (selectedTaskId === null) {
      createGeneralMessage.mutate(payload);
    } else {
      createMissionMessage.mutate({ ...payload, taskId: selectedTaskId });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Acesso restrito. Entre para acessar o Message Manager.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-4 overflow-hidden pb-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Message Manager</h1>
              <Badge variant="outline" className="font-normal">BBC</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Central de interações e comunicação da SOFIA</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={resetComposer}>
            <FilePlus2 className="mr-1.5 h-4 w-4" /> Nova interação
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="mr-1.5 h-4 w-4" /> Cancelar
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="flex min-h-[220px] flex-col overflow-hidden rounded-xl border bg-card xl:min-h-0">
          <div className="border-b p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Contextos</h2>
              <Badge variant="secondary" className="font-normal">{tasks.length} missões</Badge>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar missão..."
                className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-1 p-2">
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${selectedTaskId === null ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Inbox className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Conversa geral</p>
                  <p className="text-xs text-muted-foreground">Sem missão vinculada</p>
                </div>
                {selectedTaskId === null && <span className="h-2 w-2 rounded-full bg-primary" />}
              </button>

              <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Missões
              </div>
              {tasksQuery.isLoading && (
                <p className="px-3 py-4 text-xs text-muted-foreground">Carregando missões...</p>
              )}
              {!tasksQuery.isLoading && filteredTasks.length === 0 && (
                <p className="px-3 py-4 text-xs text-muted-foreground">Nenhuma missão encontrada.</p>
              )}
              {filteredTasks.map((task: any) => {
                const active = selectedTaskId === task.id;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      resetComposer();
                    }}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary/10" : "bg-muted"}`}>
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium leading-5">{task.title}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">TSK-{String(task.id).padStart(5, "0")}</p>
                    </div>
                    {active && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="border-t p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Painel conectado
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold">
                  {selectedTask ? selectedTask.title : "Conversa geral"}
                </h2>
                {selectedTask && <Badge variant="outline">TSK-{String(selectedTask.id).padStart(5, "0")}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedTask ? "Interação vinculada à missão selecionada" : "Interação independente de missão ou tarefa"}
              </p>
            </div>
            {selectedTask && (
              <Button type="button" size="sm" variant="outline" onClick={() => navigate("/tasks/" + selectedTask.id)}>
                <FileIcon className="mr-2 h-4 w-4" /> Abrir missão / TR
              </Button>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {tasksQuery.isFetching ? "Atualizando missões" : "Pronto"}
            </div>
          </div>

          <div className="grid gap-4 border-b bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Missão / tarefa (opcional)</span>
              <select
                value={selectedTaskId === null ? "" : String(selectedTaskId)}
                onChange={(event) => setSelectedTaskId(event.target.value ? Number(event.target.value) : null)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Conversa geral — sem vínculo</option>
                {tasks.map((task: any) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tipo de interação</span>
              <select
                value={selectedMessageType ? String(selectedMessageType.id) : ""}
                onChange={(event) => {
                  const nextType = availableMessageTypes.find((type: any) => type.id === Number(event.target.value));
                  setSelectedMessageTypeId(nextType?.id ?? null);
                  if (String(nextType?.name).toLowerCase().replace(/[\\s_-]/g, "") === "createtask") {
                    setSelectedTaskId(null);
                    setSelectedParentMessageId(null);
                  }
                }}
                disabled={messageTypesQuery.isLoading || availableMessageTypes.length === 0}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
              >
                {availableMessageTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.uiLabel || type.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r">
              <div className="border-b px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mensagem original / contexto</h3>
                  <Badge variant="secondary" className="font-normal">Somente leitura</Badge>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto border-b bg-muted/10 px-5 py-4">
                {selectedParentMessage ? (
                  <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-primary">Mensagem selecionada para resposta</span>
                      <button type="button" onClick={() => setSelectedParentMessageId(null)} className="text-[11px] text-muted-foreground hover:text-foreground">Desvincular</button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{selectedParentMessage.content}</p>
                  </div>
                ) : null}
                {messages.length === 0 ? (
                  <div className="flex h-full items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background"><MessageSquare className="h-4 w-4" /></div>
                    <p>{generalMessagesQuery.isLoading || taskMessagesQuery.isLoading ? "Carregando interações..." : "Ainda não há interações neste contexto."}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message: any) => (
                      <div key={message.id} className={`rounded-lg border p-3 ${message.isAssistant ? "bg-muted/40" : "bg-background"}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold">{message.isAssistant ? "SOFIA" : "Operador"}{user?.role === "admin" ? ` · Conta #${message.senderId}` : ""} · #{message.id}</span>
                          <button type="button" disabled={message.senderId !== user?.id} onClick={() => { setSelectedParentMessageId(message.id); setSelectedMessageTypeId(null); }} className="text-[11px] font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-40">Responder</button>
                        </div>
                        <p className="whitespace-pre-wrap text-xs leading-5">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Nova interação</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Escreva a mensagem que compõe este bloco contextual.</p>
                  </div>
                  <Badge variant="outline">{editorMode === "create" ? "Criar" : "Editar"}</Badge>
                </div>
                <Textarea
                  value={messageContent}
                  onChange={(event) => setMessageContent(event.target.value)}
                  placeholder="Digite sua mensagem, pergunta, orientação ou informação..."
                  className="min-h-[120px] flex-1 resize-none overflow-y-auto bg-background text-sm leading-6"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Uma interação = pergunta / informação + resposta</span>
                  <span>{messageContent.length.toLocaleString()} caracteres</span>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-background px-5 py-4 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAttach}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="mr-2 h-4 w-4" /> Anexar
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {attachments.length ? `${attachments.length} arquivo(s) selecionado(s)` : "Nenhum arquivo anexado"}
                  </span>
                </div>
                <Button type="button" onClick={handlePrepare} disabled={createGeneralMessage.isPending || createMissionMessage.isPending}>
                  <Send className="mr-2 h-4 w-4" /> {createGeneralMessage.isPending || createMissionMessage.isPending
                    ? (String(selectedMessageType?.name).toLowerCase().replace(/[\\s_-]/g, "") === "createtask" ? "Criando missão..." : "Enviando...")
                    : String(selectedMessageType?.name).toLowerCase().replace(/[\\s_-]/g, "") === "createtask" ? "Criar missão" : "Enviar mensagem"}
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t px-5 py-3">
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs">
                      <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="max-w-[220px] truncate">{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(index)} aria-label={`Remover ${file.name}`} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-5 p-4">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status da tarefa</h3>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <select
                    value={taskStatus}
                    onChange={(event) => setTaskStatus(event.target.value as TaskStatus)}
                    disabled={!selectedTask}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {taskStatuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </label>
                {!selectedTask && (
                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground">O status fica indisponível na conversa geral.</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arquivos anexados</h3>
                {attachments.length ? (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={`side-${file.name}-${index}`} className="flex items-center gap-2 text-xs">
                        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(index)} aria-label={`Remover ${file.name}`} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed px-3 py-5 text-center">
                    <FilePlus2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
                    <p className="text-xs text-muted-foreground">Os arquivos selecionados aparecerão aqui.</p>
                  </div>
                )}
              </div>

              <div className="mt-auto rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Etapa de interface
                </div>
                <p className="text-[11px] leading-5 text-muted-foreground">
                  Mensagens e respostas já são persistidas por conta e contexto. Anexos, edição e atualização de status serão conectados em etapas próprias.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
