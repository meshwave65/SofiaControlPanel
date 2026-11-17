import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  AlertCircle,
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardList,
  File,
  FilePlus2,
  Filter,
  Inbox,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  SquarePen,
  X,
} from "lucide-react";

type InteractionType = "message" | "order" | "reply" | "report" | "create-task";
type TaskStatus = "open" | "in_progress" | "on_hold" | "done";

const interactionTypes: { value: InteractionType; label: string }[] = [
  { value: "message", label: "Mensagem" },
  { value: "order", label: "Ordem" },
  { value: "reply", label: "Resposta" },
  { value: "report", label: "Relatório" },
  { value: "create-task", label: "Criar tarefa" },
];

const taskStatuses: { value: TaskStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "on_hold", label: "On hold" },
  { value: "done", label: "Done" },
];

export default function Messages() {
  const { isAuthenticated } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [interactionType, setInteractionType] = useState<InteractionType>("message");
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

  const tasks = tasksQuery.data || [];
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
    setInteractionType("message");
    setTaskStatus("open");
    setEditorMode("create");
  };

  const startNewInteraction = () => {
    resetComposer();
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
    toast.info("Interface pronta. A persistência e o envio serão conectados na etapa funcional.");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Acesso restrito. Entre para acessar o Message Manager.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-[680px] w-full max-w-[1600px] flex-col gap-4 pb-4">
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
          <Button size="sm" onClick={startNewInteraction}>
            <Plus className="mr-1.5 h-4 w-4" /> Criar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditorMode("edit")}>
            <SquarePen className="mr-1.5 h-4 w-4" /> Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="mr-1.5 h-4 w-4" /> Cancelar
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
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

        <section className="flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card xl:min-h-0">
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
                value={interactionType}
                onChange={(event) => setInteractionType(event.target.value as InteractionType)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {interactionTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="flex min-h-[380px] min-w-0 flex-col border-b lg:border-b-0 lg:border-r">
              <div className="border-b px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mensagem original / contexto</h3>
                  <Badge variant="secondary" className="font-normal">Somente leitura</Badge>
                </div>
              </div>

              <div className="min-h-[105px] border-b bg-muted/10 px-5 py-4">
                <div className="flex h-full items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <p>
                    {interactionType === "reply"
                      ? "Selecione a interação original à qual esta resposta será vinculada."
                      : "O conteúdo de referência será exibido aqui quando uma interação existente for selecionada."}
                  </p>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col p-5">
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
                  className="min-h-[180px] flex-1 resize-y bg-background text-sm leading-6"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Uma interação = pergunta / informação + resposta</span>
                  <span>{messageContent.length.toLocaleString()} caracteres</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-5 py-4">
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
                <Button type="button" onClick={handlePrepare} disabled={!messageContent.trim()}>
                  <Send className="mr-2 h-4 w-4" /> Preparar interação
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t px-5 py-3">
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs">
                      <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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
                        <File className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                  Esta versão organiza a experiência visual. Envio, persistência dos blocos, respostas da SOFIA e atualização de status ainda não estão conectados.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
