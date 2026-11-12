---
or_id: "OR-20261112-0001"
task_id: "MISSION_0020-20.2"
skill_name: "operational-task-lifecycle"
skill_version: "0.2.0-DRAFT"
skill_commit: "origin/main após rebase em 2026-11-12; SHA do commit desta unidade será registrado após publicação"
agent: "Manus (sandbox)"
environment: "sandbox:root:DjAJNQVaYKEDJthVvvdKHh"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-12T08:01:00Z"
---

# OperationalReport — OR-20261112-0001

## Objective

Executar a tarefa 20.2 da MISSION_0020: reproduzir, em ambiente local controlado, o ciclo de execução de missão — claim/despacho, integração Manus mockada, polling, persistência e estados — e distinguir causa funcional de gate ambiental, sem chamada externa real, consumo de crédito ou alteração de produção.

## Inputs, outputs, and tools

- Inputs: `AGENTS.md`, `GOVERNANCE.md`, `governance/missions/0020/BLUEPRINT.md`, `MISSION_0020 - TASKS - PROGRESS.md`, `docs/MISSION_0020-20.1-BASELINE.md`, `OperationalReports/OperationalReport_0020_20.1.md`, `server/sofiaOrchestrator.ts`, `server/manusExecutionService.ts`, `server/db.ts`, `server/routers.ts` e testes existentes.
- Outputs and artifact paths: `server/manusExecutionService.test.ts`; ampliação de `server/sofiaOrchestrator.test.ts`; fechamento da tarefa 20.2 no quadro; este relatório; linha correspondente no índice de ORs.
- Tools and external sources: Git/GitHub CLI para reconciliação; Vitest; TypeScript; Vite/esbuild. Nenhum serviço externo foi chamado.

## Execution summary

1. A cópia local foi reconciliada com `origin/main`; alterações em andamento foram preservadas via stash temporário e restauradas após o rebase. A árvore estava limpa antes da atribuição da unidade, sem lock/claim concorrente identificado para 20.2.
2. A tarefa 20.2 foi assumida no quadro antes da edição. A skill selecionada foi `operational-task-lifecycle` 0.2.0-DRAFT, registrada no catálogo do SCO; não há skill técnica ACTIVE mais específica para este diagnóstico.
3. O teste de serviço reproduz criação Manus com `fetch` mockado, exige `task_id`, persiste `manusTaskId`/`running`, converte polling `stopped` em `DONE` quando há créditos e em `waiting_credit`/`PAUSED` quando o saldo é zero.
4. O teste do orchestrator reproduz claim bem-sucedido, prevenção de segunda execução, espera explícita quando não há agente elegível e persistência de `dispatch_failed`/`FAIL` com log de atividade quando o adaptador externo falha.
5. Resultado das validações: `pnpm test` — 4 arquivos, 15 testes, todos PASS; `pnpm check` — PASS; `pnpm build` — PASS. O build emitiu apenas avisos não bloqueantes de tamanho de chunk e baseline-browser-mapping desatualizado.
6. O caminho UI/tRPC foi confirmado por inspeção estática em `server/routers.ts`: `tasks.start` valida ownership/admin e delega a `SofiaOrchestrator.startTask`. A execução do endpoint real não foi feita porque exigiria banco/serviço autenticado.

## Problems and workarounds

- **Gate externo:** não foi autorizado nem disponibilizado ambiente com banco, credencial Manus e segredo de dispatch para smoke test real. **Workaround:** usar fixtures e `fetch` mockado, sem ler ou registrar valores sensíveis. **Risco residual:** o runtime implantado ainda pode divergir do comportamento controlado.
- **Rebase com alterações locais:** o primeiro rebase foi recusado por alterações não commitadas. **Workaround:** stash temporário com arquivos não rastreados, rebase sobre `origin/main`, restauração e verificação de diff. Nenhum trabalho foi descartado.
- **Avisos de build:** chunk frontend acima de 500 kB e baseline-browser-mapping antigo. **Workaround:** registrados como avisos; não afetam o critério funcional desta unidade. Code-splitting é melhoria posterior.

## Evidence and uncertainty

Verificado diretamente: claim/despacho mockado, não duplicação, espera por agente inelegível, falha explícita, criação mockada com ID, persistência de execução, polling terminal com créditos, polling pausado por falta de créditos, suíte completa com 15 testes, `pnpm check` e `pnpm build`.

Não verificado ao vivo: configuração do Render/Supabase/Vault, elegibilidade de agentes reais, validade de tokens, trigger HTTP automático, heartbeat em processo implantado, chamada real à API Manus, persistência real e atualização da UI autenticada. Portanto, não foi atribuída causa-raiz funcional ao produto; o bloqueio comprovado nesta sandbox é ambiental para a validação externa.

## Improvement proposals

- **P20.2-01:** adicionar harness de integração com banco descartável e adaptador Manus injetável. Razão: cobrir tRPC, transação de claim e persistência real sem produção. Benefício: localizar divergências entre mocks e Drizzle. Risco: médio, por manutenção de fixtures. Prioridade: alta. Backward-compatible: sim, se isolado em testes.
- **P20.2-02:** permitir injeção de `MANUS_API_BASE_URL` somente em testes/ambientes aprovados, mantendo produção fixa ou explicitamente configurada. Razão: controlar o endpoint sem monkey patch global. Benefício: reprodução mais fiel e segura. Risco: médio, se configuração for exposta indevidamente. Prioridade: média. Backward-compatible: sim, com fail-closed.
- **P20.2-03:** expor health/readiness sanitizado para presença de banco, dispatch e credencial, sem valores. Razão: distinguir gate ambiental antes de iniciar uma missão. Benefício: diagnóstico operacional. Risco: baixo. Prioridade: alta. Backward-compatible: sim.

## Privacy, safety, and scope review

Nenhum segredo, token, payload privado, dado pessoal ou valor de variável foi registrado. Nenhuma chamada Manus, escrita em banco, deploy, alteração de schema/RLS/credenciais ou comunicação externa ocorreu. A MISSION_0019 não foi editada nem duplicada. O novo teste usa token e respostas fictícios exclusivamente em memória.

## Oracle handoff

- Confirmar se os 15 testes e os artefatos cobrem suficientemente o critério de reprodução da tarefa 20.2.
- Revisar `server/manusExecutionService.test.ts`, `server/sofiaOrchestrator.test.ts`, `server/sofiaOrchestrator.ts`, `server/manusExecutionService.ts`, `server/routers.ts` e o quadro da MISSION_0020.
- Confirmar a classificação conservadora: comportamento controlado comprovado; smoke test real e causa no ambiente implantado permanecem não verificados/bloqueados.
- Avaliar se P20.2-01 deve ser decomposta antes da tarefa 20.3 ou encaminhada como parte da validação integrada 20.5.
