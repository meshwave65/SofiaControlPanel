# MISSION_0020 / tarefa 20.1 — baseline do fluxo de execução

**Observação:** inventário estático e validação local não destrutiva realizados em 2026-11-09. Nenhuma chamada Manus, escrita de banco, deploy ou alteração de produção foi realizada.

## Escopo e fontes consultadas

- Blueprint: `governance/missions/0020/BLUEPRINT.md`.
- Definição e quadro: `MISSION_0020 - Diagnóstico e Restauração Integral das Funcionalidades do SCP - PROGRESS.md` e `MISSION_0020 - TASKS - PROGRESS.md`.
- Código: `client/src/pages/TaskCreate.tsx`, `client/src/pages/Tasks.tsx`, `server/routers.ts`, `server/sofiaOrchestrator.ts`, `server/db.ts`, `server/manusExecutionService.ts`, `server/heartbeat.ts`, `server/dispatchEndpoint.ts`, `server/_core/index.ts`.
- Contrato de despacho: `drizzle/0003_automatic_task_dispatch.sql`.
- Teste existente: `server/sofiaOrchestrator.test.ts`.
- Histórico: `MISSION_0016 - Execução Real de Missões e Créditos Manus - DONE.md`.

## Matriz baseline — criação até apresentação

| Fronteira | Caminho/contrato | Estado observado | Evidência | Classificação |
|---|---|---|---|---|
| Criação | `TaskCreate.tsx` e `Tasks.tsx` → `trpc.tasks.create` | Formulário envia título, descrição, status, prioridade, agente opcional; mutation protegida | `client/src/pages/TaskCreate.tsx:45-64`, `client/src/pages/Tasks.tsx:113-132`, `server/routers.ts:263-284` | IMPLEMENTADO; runtime não exercitado |
| Claim/seleção | `SofiaOrchestrator.startTask` → `claimStagedTaskWithAvailableAgent` | Claim transacional com `FOR UPDATE`; agente precisa estar online, configurado/conectado, ter token, crédito atualizado e não ter tarefa `PROGRESS` concorrente | `server/sofiaOrchestrator.ts:184-243`, `server/db.ts:418-504` | IMPLEMENTADO; depende de banco/estado |
| Despacho manual | `tasks.start` via tRPC protegido por ownership/admin | Chama `startTask`; sem agente elegível mantém `STAGED` e marca espera; falha de criação registra `dispatch_failed`/`FAIL` | `server/routers.ts:321-339`, `server/sofiaOrchestrator.ts:229-243,281-309` | IMPLEMENTADO; não validado em runtime |
| Despacho automático | trigger `tasks_dispatch_staged` → `/api/internal/task-dispatch` | Trigger lê URL/segredo do Vault; endpoint exige `SOFIA_DISPATCH_SECRET`, header constante no tempo e `taskId` inteiro positivo | `drizzle/0003_automatic_task_dispatch.sql:7-77`, `server/dispatchEndpoint.ts:7-59`, `server/_core/index.ts:54-56` | IMPLEMENTADO; BLOCKED sem Supabase/Vault/segredo |
| Heartbeat/retomada | `startHeartbeatSystem` a cada 30s/5min | Verifica timeout, reabre somente tarefas marcadas como aguardando agente, sincroniza créditos/tarefas Manus e tenta retomada por crédito | `server/heartbeat.ts:23-45,92-114`, `server/sofiaOrchestrator.ts:16-46` | IMPLEMENTADO; processo não iniciado |
| Execução externa | `createManusTask` → `POST https://api.manus.ai/v2/task.create` | Recupera token somente no servidor, envia tarefa privada e persiste `manusTaskId`/`running` | `server/manusExecutionService.ts:42-79` | IMPLEMENTADO; BLOCKED por credencial/autorização |
| Polling/retomada | `syncRunningManusTasks` → `task.detail`; crédito via `usage.availableCredits` | Normaliza `stopped`, `error`, `waiting_credit`; atualiza consumo, timestamps e status local | `server/manusExecutionService.ts:141-194` | IMPLEMENTADO; sem chamada externa |
| Persistência | `updateTaskExecution`, `updateTaskStatus`, logs de falha | Estado externo e estado local são persistidos; erro de despacho tenta registrar evento e marcar `FAIL` | `server/db.ts:411-415,521-530`, `server/sofiaOrchestrator.ts:290-308` | IMPLEMENTADO; depende de banco |
| Apresentação | `Tasks.tsx` lista estados `STAGED/PROGRESS/PAUSED/DONE/FAIL`; polling de 10s; erro de banco não vira lista vazia | UI tem indicadores para status e mensagem explícita de erro de carregamento | `client/src/pages/Tasks.tsx:31-37,64-67,297-306` | IMPLEMENTADO; visualização real não exercitada |
| Testes | `server/sofiaOrchestrator.test.ts` | Cobre fatoração, não reinício e não duplicação usando mocks | `server/sofiaOrchestrator.test.ts:28-152` | PASS estático; não prova integração externa |

## Evidência de ambiente local

- `git status`: árvore limpa em `main`, alinhada a `origin/main` no commit `0ae0237` antes dos artefatos desta tarefa.
- Variáveis sanitizadas ausentes no shell: `DATABASE_URL`, `CREDENTIAL_ENCRYPTION_KEY`, `MANUS_API_KEY`, `MANUS_API_BASE_URL`, `INTERNAL_DISPATCH_SECRET`. O código usa ainda `SOFIA_DISPATCH_SECRET` e credenciais por agente em banco; seus valores não foram lidos.
- Dependências locais não estão instaladas: `pnpm check` falhou por tipos `node`/`vite/client` ausentes e incompatibilidade de `baseUrl`; `pnpm test` falhou porque `vitest` não está disponível; `pnpm build` falhou porque `vite` não está disponível.
- Nenhum servidor foi iniciado e nenhum endpoint foi chamado.

## Primeira fronteira divergente e hipótese testável

A primeira fronteira não foi localizada em runtime. O bloqueio reproduzível nesta sandbox ocorre antes da execução: não há dependências/configuração para iniciar o serviço e não há ambiente autorizado com banco, Vault/segredo e credencial Manus para atravessar o fluxo. Isso é um **gate ambiental**, não uma causa-raiz do produto.

Hipóteses para a tarefa 20.2, em ordem de observação segura:

1. **Dispatch automático não configurado:** ausência de `sofia_dispatch_url`/`sofia_dispatch_secret` no Vault ou ausência de `SOFIA_DISPATCH_SECRET` no serviço faria a tarefa permanecer `STAGED`/aguardando sem chamada externa.
2. **Elegibilidade/claim:** agente não online, sem `connectionStatus` compatível, token ausente, crédito não atualizado há 60s ou tarefa concorrente faria `claimStagedTaskWithAvailableAgent` retornar `null`.
3. **Integração Manus:** token inválido/ausente, timeout ou resposta sem `task_id` faria `createManusTask` falhar e deveria resultar em `dispatch_failed`/`FAIL`.
4. **Persistência/polling/UI:** somente depois de confirmar as fronteiras anteriores deve-se comparar `manusTaskId`, `manusStatus`, `lastSyncedAt`, status local e atualização da lista.

A tarefa 20.2 deve usar fixtures/mocks locais para testar essas fronteiras sem consumo de crédito; o gate de smoke test externo continua bloqueado até ambiente e autorização explícitos.
