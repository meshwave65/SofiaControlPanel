# Análise Estrutural: Restaurar interação real entre operador e Sofia no painel de mensagens

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo preserva a proveniência, o contrato e as evidências da missão.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000019 |
| taskId | 19 |
| source | SofiaControlPanel interface |
| creator | info@meshwave.com.br |
| creatorType | user |
| status | PROGRESS |
| statusId | 2 |
| priority | Crítica |
| priorityId | 4 |
| parentTaskId |  |
| githubPath | missions/SCP-TASK-000019.md |
| mirroredAt | 2026-11-13T10:57:00Z |

## Objective

Corrigir estruturalmente o SofiaControlPanel para que mensagens enviadas pelo operador sejam validadas, persistidas no Supabase, encaminhadas ao serviço de IA ou à execução Manus vinculada, respondidas pela Sofia e exibidas no painel web.

## Acceptance criteria

- [x] `messages.create` valida ownership da missão, tipo de mensagem, mensagem pai e conteúdo antes da persistência.
- [x] A mensagem do operador é persistida com conteúdo normalizado e a resposta é persistida com `isAssistant=true`, vinculada por `parentMessageId`.
- [x] O procedimento envia o histórico recente persistido ao LLM, sem duplicar o turno atual, e encaminha missões Manus ao serviço externo.
- [x] Respostas Manus novas não são confundidas com respostas antigas quando a API não fornece IDs.
- [x] A interface exibe operador, Sofia, processamento, pendência e falha sem declarar sucesso indevido.
- [x] O schema Drizzle, a migration `0009_messages_assistant_flag.sql`, o script de garantia e o schema Supabase preservam `isAssistant`.
- [x] Testes, typecheck e build são executados antes do fechamento; limitações não relacionadas são registradas.
- [x] O espelho GitHub e o registro Supabase permanecem vinculados por `missionKey` e `githubPath`.

## Synchronization contract

- Supabase project: `ufylccbdjfzydbwhpmpp`
- Supabase schema/table: `sofia.tasks`, `sofia.messages`
- Supabase task ID: `19`
- GitHub repository: `meshwave65/SofiaControlPanel`
- GitHub path: `missions/SCP-TASK-000019.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.

## Execution evidence

- Implementação funcional: `server/routers.ts`, `server/messageService.ts`, `server/db.ts`, `server/manusExecutionService.ts` e `client/src/pages/Messages.tsx`.
- Regressões: validação/normalização, contexto com papéis operador/Sofia, extração de blocos LLM e correlação de resposta Manus.
- Schema confirmado ao vivo no Supabase: `sofia.messages.isAssistant` existe como `boolean NOT NULL DEFAULT false`; a migration `drizzle/0009_messages_assistant_flag.sql` e `scripts/ensure-database.mjs` mantêm a mesma definição.
- `pnpm check`: aprovado.
- `pnpm build`: aprovado; apenas avisos existentes de chunk grande e baseline-browser-mapping.
- Commit publicado no GitHub: `92ab7f4c2ddca51a430c26f7d74b2f61a21c3d48`.
- Registro Supabase atualizado: `githubPath=missions/SCP-TASK-000019.md`, `githubSyncStatus=synced`; o SHA do último conteúdo publicado é mantido no registro operacional.
- `pnpm test`: 6 arquivos e 27 testes aprovados, incluindo o fluxo `messages.create`; o isolamento do teste preexistente de fatoração foi corrigido para eliminar falso negativo entre casos.
- Ensaio real com credencial Manus/LLM não executado, conforme o gate do blueprint; não houve consumo de créditos nem gravação de mensagens de teste no Supabase.
