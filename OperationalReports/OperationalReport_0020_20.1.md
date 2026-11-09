---
or_id: "OR-20261109-0003"
task_id: "MISSION_0020-20.1"
skill_name: "operational-task-lifecycle"
skill_version: "0.2.0-DRAFT"
skill_commit: "main — SHA imutável não capturado"
agent: "Manus (sandbox)"
environment: "sandbox:root:DjAJNQVaYKEDJthVvvdKHh"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-09T08:09:00Z"
---

# OperationalReport — OR-20261109-0003

## Objective

Executar a tarefa 20.1 da MISSION_0020: inventariar funcionalidades, contratos e evidências pertinentes ao runtime do SofiaControlPanel, localizar a primeira fronteira divergente sem conjectura e produzir uma hipótese testável para a reprodução seguinte.

## Inputs, outputs, and tools

- Inputs: `AGENTS.md`, `GOVERNANCE.md`, blueprint e definição da MISSION_0020, quadro de tarefas, skill `operational-task-lifecycle`, catálogo de skills, código de criação/claim/despacho/polling/persistência/UI e histórico da MISSION_0016.
- Outputs: `docs/MISSION_0020-20.1-BASELINE.md`; atualização do quadro `MISSION_0020 - TASKS - PROGRESS.md`; este relatório e uma linha no índice.
- Tools: Git/GitHub CLI para clone e reconciliação; leitura estática; `pnpm check`, `pnpm test` e `pnpm build` executados sem serviços externos.

## Execution summary

1. Repositório reconciliado em `main`, alinhado a `origin/main` no commit `0ae0237` antes das alterações desta unidade; a tarefa 20.1 já estava formalmente atribuída a `Manus (sandbox)`.
2. Consultados blueprint, governança, skill de ciclo operacional e catálogo. A skill selecionada foi `operational-task-lifecycle` 0.2.0-DRAFT; não há skill técnica adicional ACTIVE no catálogo para esse diagnóstico.
3. Mapeados os caminhos de criação, claim/seleção, despacho tRPC, trigger/endpoint interno, heartbeat, chamada Manus, polling, persistência e apresentação na UI.
4. Registrada a matriz baseline com classificação por fronteira e referências de arquivo/linha.
5. Validações locais foram tentadas. O ambiente não possui dependências instaladas (`vitest`/`vite` ausentes) nem tipos `node`/`vite/client`; não foi iniciado servidor.
6. A primeira divergência não foi confirmada no runtime. O bloqueio observável é ambiental: não há banco, credenciais/segredo de dispatch ou autorização para chamada externa nesta sandbox. A tarefa 20.2 permanece necessária e deve começar com fixtures/mocks controlados.

## Problems and workarounds

- **Sintoma:** `pnpm check` falha antes de verificar o código por tipos `node`/`vite/client` ausentes e aviso fatal de `baseUrl` sem `ignoreDeprecations`.
  **Causa conhecida:** dependências/tipos locais ausentes e versão de TypeScript incompatível com a configuração atual.
  **Workaround:** registrar a falha sem instalar ou alterar dependências no escopo de inventário.
  **Risco residual:** baseline de compilação não pode ser considerado PASS nesta sandbox.
- **Sintoma:** `pnpm test` e `pnpm build` falham porque `vitest` e `vite` não estão disponíveis.
  **Workaround:** separar testes mockados existentes, que foram inspecionados estaticamente, de execução efetiva; deixar instalação/revalidação para tarefa/ambiente apropriado.
- **Sintoma:** não foi possível reproduzir a execução ponta a ponta.
  **Causa/gate:** `DATABASE_URL`, `CREDENTIAL_ENCRYPTION_KEY` e segredos/credenciais de runtime não estão disponíveis; não foram lidos nem inventariados por valor.
  **Workaround:** produzir hipótese ordenada e testável; não chamar Manus, não iniciar heartbeat e não tocar produção.

## Evidence and uncertainty

Verificado: os três caminhos de despacho estão ligados ao bootstrap; o claim usa transação/lock; a integração Manus e o polling existem; o teste do orchestrator cobre mocks de não duplicação; a UI exibe estados e erro de banco. Verificado também: os comandos baseline falham por ambiente incompleto.

Não verificado: qual fronteira falha no ambiente implantado, se o trigger/Vault está configurado, se existem agentes elegíveis, se a API key Manus é válida, se a persistência/polling real atualizam a UI e se o smoke test externo foi autorizado. Alegações históricas da MISSION_0016 foram tratadas como contexto, não como prova atual.

## Improvement proposals

- **P20.1-01:** adicionar um harness de integração local para `startTask` com banco/fixtures descartáveis e cliente Manus mockado; razão: reproduzir claim, falha, idempotência e persistência sem custo externo; benefício: primeira fronteira observável; risco baixo; prioridade alta; backward-compatible: sim.
- **P20.1-02:** expor health/readiness sanitizado para indicar apenas presença de configuração (sem valores), incluindo dispatch, banco e credencial por agente; razão: diferenciar gate ambiental de falha funcional; benefício: diagnóstico operacional; risco baixo se sem segredos; prioridade alta; backward-compatible: sim.

## Privacy, safety, and scope review

Nenhum segredo, token, payload privado ou valor de variável foi registrado. Nenhuma chamada Manus, escrita em banco, deploy, alteração de schema/RLS/credenciais ou comunicação externa ocorreu. A MISSION_0019 não foi editada nem duplicada. O escopo ficou restrito aos arquivos e contratos pertinentes ao fluxo de execução.

## Oracle handoff

- Confirmar se `OR-20261109-0003` e a matriz baseline atendem o critério da tarefa 20.1.
- Inspecionar `docs/MISSION_0020-20.1-BASELINE.md`, `server/sofiaOrchestrator.ts`, `server/db.ts`, `server/manusExecutionService.ts`, `server/heartbeat.ts`, `server/dispatchEndpoint.ts`, `drizzle/0003_automatic_task_dispatch.sql` e o commit desta unidade.
- Confirmar que o bloqueio de runtime foi corretamente classificado como gate ambiental, sem declarar causa-raiz.
