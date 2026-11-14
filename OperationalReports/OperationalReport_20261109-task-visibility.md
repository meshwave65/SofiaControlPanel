---
or_id: "OR-20261109-0005"
task_id: "SCP-TASK-VISIBILITY-ADMIN-MASTER"
skill_name: "operational-task-lifecycle"
skill_version: "0.2.0-DRAFT"
skill_commit: "main — SHA imutável não capturado"
agent: "Manus (sandbox)"
environment: "sandbox:root:DjAJNQVaYKEDJthVvvdKHh"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-09T21:29:00-03:00"
---

# OperationalReport — OR-20261109-0005

## Objective

Implementar a política solicitada para missões do SCP: cada usuário autenticado vê somente as missões que criou; as contas master `info@meshwave.com.br` e `meshwave65@gmail.com` recebem papel `admin`, veem todas as missões e visualizam o criador; missões de automação/IA podem ser marcadas como criadas pelo sistema.

## Inputs, outputs, and tools

- Inputs: `drizzle/schema.ts`, `server/_core/env.ts`, `server/db.ts`, `server/routers.ts`, `client/src/pages/Tasks.tsx`, `server/sofiaOrchestrator.ts`, `scripts/ensure-database.mjs`.
- Outputs: regra de visibilidade no backend; promoção das contas master; coluna `creatorType`; coluna administrativa de criador; migration `drizzle/0005_task_creator_visibility.sql`; este OR e índice.
- Tools: inspeção estática, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm build`, Git/GitHub CLI.

## Execution summary

- `upsertUser` normaliza o e-mail e promove para `admin` as duas contas master, sem permitir que uma conta master seja rebaixada por um login posterior.
- `tasks.list` e `tasks.listAll` passam `canViewAll` somente quando `ctx.user.role === "admin"`; usuários comuns continuam filtrados por `createdBy`.
- A listagem administrativa faz `leftJoin` com `users` e retorna `creatorLabel`, `creatorEmail` e `creatorType` para a UI.
- `creatorType` foi adicionado ao schema e à verificação de banco, com default `user`; `system` é preservado na fatoração de subtarefas e apresentado como “Sistema”.
- A UI mostra a coluna “Criada por” somente para administradores.
- A migração é compatível com bancos existentes: `ADD COLUMN IF NOT EXISTS ... DEFAULT 'user'`.

## Problems and workarounds

- A primeira execução do TypeScript revelou que espalhar a tabela Drizzle em `select` quebrava a inferência. A consulta foi corrigida para selecionar explicitamente cada coluna da tarefa; a validação final passou.
- A conta master existente precisa autenticar novamente após o deploy para que `upsertUser` atualize seu papel no banco; não foi feita escrita direta no banco de produção.

## Evidence and uncertainty

Verificado localmente: `pnpm check` passou; `pnpm test` passou com 3 arquivos e 9 testes; `pnpm build` passou. Verificado no código: filtragem de usuários comuns, acesso global de admins, exibição do criador e suporte a `system`. Não executado: login real das duas contas master no Render e inspeção do banco de produção, pois não houve autorização/credenciais para alterar ou consultar dados de produção.

## Improvement proposals

- **P-TASK-01:** adicionar testes de integração com usuários `user`, `admin` e tarefas `system`; benefício: comprovar isolamento e visão global; risco baixo; prioridade alta; backward-compatible: sim.
- **P-TASK-02:** criar uma procedure interna autenticada para criação de tarefas `system`, com segredo/assinatura e auditoria; benefício: evitar que a origem `system` seja declarada arbitrariamente pela UI; risco médio; prioridade alta; backward-compatible: sim.

## Privacy, safety, and scope review

Apenas os dois e-mails fornecidos pelo responsável foram registrados como configuração funcional. Nenhuma credencial, senha, token ou dado de missão foi copiado. Usuários comuns não recebem tarefas de outros usuários; a visão global depende do papel `admin` no servidor, não apenas da UI. Nenhuma escrita de produção, deploy manual ou mudança de RLS foi realizada.

## Oracle handoff

Inspecionar `server/db.ts`, `server/routers.ts`, `server/_core/env.ts`, `drizzle/schema.ts`, `drizzle/0005_task_creator_visibility.sql`, `scripts/ensure-database.mjs` e `client/src/pages/Tasks.tsx`. Confirmar que as duas contas master podem ser promovidas somente por e-mail normalizado e que `creatorType=system` deve ficar reservado a fluxos internos confiáveis.
