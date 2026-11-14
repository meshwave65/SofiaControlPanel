# MISSION_0015 — Implementação do Início de Missões

> **Projeto:** Triangulo  
> **Email do usuário:** não informado  
> **Data e hora:** 2026-10-31 17:29 (UTC-03:00)

## Objetivo

Permitir que o SofiaControlPanel inicie uma missão `STAGED` diretamente pela interface, movendo-a para `PROGRESS` e fatorando-a em subtarefas quando a descrição exigir múltiplas etapas.

## Diagnóstico

A classe `SofiaOrchestrator` já continha `processTask`, mas o método não era chamado por nenhuma procedure tRPC nem por um controle da interface. O método também deixava a missão-pai em `STAGED` depois de fatorá-la. Assim, o painel podia criar, fatorar e consolidar tarefas, mas não possuía um fluxo de inicialização efetivo.

## Implementação

- Adicionada a procedure protegida `tasks.start` em `server/routers.ts`.
- Adicionada a transição idempotente em `SofiaOrchestrator.processTask`:
  - rejeita reinício de tarefas que já não estejam em `STAGED`;
  - fatoriza somente quando necessário e quando não existem subtarefas;
  - move a missão-pai para `PROGRESS`;
  - retorna a missão atualizada e os IDs de subtarefas criadas.
- Adicionado botão **Iniciar missão** em `client/src/pages/TaskDetail.tsx`, habilitado somente para missões `STAGED`.
- Adicionado feedback visual de carregamento, sucesso, missão já iniciada e erro.
- Adicionados testes de unidade para fatoração/início e idempotência.

## Validação

- `pnpm check` — aprovado.
- `pnpm test` — aprovado: 3 arquivos, 7 testes.
- `pnpm build` — aprovado; apenas avisos existentes de tamanho de chunk e atualização de `baseline-browser-mapping`.

## Limitações

A implementação inicia o ciclo de vida no banco e prepara/fatora subtarefas. A execução efetiva por um agente externo continua dependendo do runtime/worker que consome tarefas `PROGRESS`/`STAGED`; não foram inventadas chamadas externas à API Manus.
