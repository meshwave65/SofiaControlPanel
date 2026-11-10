---
or_id: "OR-20261109-0006"
task_id: "SCP-TASK-GITHUB-MIRROR"
skill_name: "operational-task-lifecycle"
skill_version: "0.2.0-DRAFT"
skill_commit: "main — SHA imutável não capturado"
agent: "Manus (sandbox)"
environment: "sandbox:root:DjAJNQVaYKEDJthVvvdKHh"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-09T21:55:00-03:00"
---

# OperationalReport — OR-20261109-0006

## Objective

Estabelecer espelhamento das missões criadas pela interface: o registro operacional permanece no Supabase e um arquivo versionado é criado/atualizado no repositório `meshwave65/SofiaControlPanel`.

## Execution summary

- Adicionados metadados `missionKey`, `githubPath`, `githubSha`, `githubSyncStatus`, `githubSyncError` e `githubSyncedAt` à tabela de tarefas.
- Novas missões recebem uma chave determinística `SCP-TASK-XXXXXX` imediatamente após persistência no Supabase.
- A procedure `tasks.create` grava a tarefa e chama o espelho GitHub por API Contents, criando `missions/SCP-TASK-XXXXXX.md` na branch configurada.
- A procedure `tasks.updateStatus` exige ownership/admin e atualiza o arquivo espelhado quando a missão muda de status.
- O estado do espelho é persistido como `synced`, `not_configured` ou `failed`; falhas não apagam nem ocultam a missão do Supabase.
- O texto do arquivo deixa explícito que o Supabase é a fonte executável e o GitHub é a fonte versionada de proveniência/contexto; edição manual do Markdown não inicia execução.
- O diretório `missions/` é separado dos arquivos históricos `MISSION_*.md` para evitar colisão entre documentação governada e tarefas criadas pela UI.

## Configuration contract

O Render precisa conter:

- `GITHUB_PAT`: token com permissão de conteúdo no repositório.
- `GITHUB_OWNER=meshwave65`.
- `GITHUB_REPO=SofiaControlPanel`.
- `GITHUB_BRANCH=main`.

Sem `GITHUB_PAT`, a missão continua válida no Supabase, mas fica marcada `not_configured` e não é apresentada como sincronizada.

## Validation

`pnpm check`, `pnpm test` (3 arquivos, 9 testes) e `pnpm build` passaram após a implementação. A migration `0006_task_github_mirror.sql` e o `ensure-database.mjs` usam alterações aditivas e idempotentes.

## Scope and limitations

O espelhamento novo está implementado no fluxo da interface. As cinco tarefas históricas existentes no Supabase precisam de backfill único para preencher os metadados e criar seus arquivos; esse backfill é separado para não confundir registros históricos com as missões documentais `MISSION_0018`–`MISSION_0020` já versionadas no repositório.

## Privacy and safety

O arquivo espelhado inclui título, descrição, IDs operacionais e identificador do criador, mas não inclui senha, token ou segredo. O PAT nunca é gravado no repositório nem em logs de resposta.
