# CHECKPOINT — ARC-006 — Avaliação real em shadow mode

**Checkpoint:** ARC-006
**Data:** 2026-10-29
**Repositório:** `https://github.com/meshwave65/SofiaControlPanel`
**Código:** `3ba580c`
**Checkpoint anterior:** `bd64b82`
**Estado:** Implementação rudimentar real concluída; persistência e execução contra PostgreSQL real ainda dependem da aplicação da migration ARC-004

## Operacionalidade implementada

A procedure protegida `arc.evaluateTask({ taskId })` agora executa uma avaliação real, sem receber posterior/decision prontos do chamador:

1. Carrega a tarefa pelo `taskId`.
2. Valida que o usuário é dono da tarefa ou admin.
3. Seleciona a política ARC habilitada mais recente em `arcPolicies`.
4. Carrega o agente vinculado, quando existir.
5. Carrega as tarefas observadas do agente e os activity logs existentes.
6. Calcula cinco sinais heurísticos objetivos:
   - `heartbeat_recent`: heartbeat nos últimos 5 minutos;
   - `agent_online`: status atual do agente;
   - `task_assignment_match`: agente da tarefa corresponde ao agente observado;
   - `recent_success_history`: proporção de tarefas do agente com `completedAt`;
   - `activity_consistency`: atribuição compatível e existência de atividade.
7. Aplica inferência Bayesiana por odds/log-odds, reduzindo cada evidência pela confiabilidade.
8. Classifica o posterior em `ALLOW`, `REVIEW` ou `DENY` conforme a política.
9. Persiste assessment e evidências na mesma transação.
10. Retorna a avaliação em `shadow`; não bloqueia, não muda status da tarefa e não autoriza ações externas.

## Artefatos

- `server/arcEvaluator.ts`: coletor/cálculo local determinístico e substituível.
- `server/db.ts`: `evaluateTaskInShadow`, leitura dos sinais e persistência.
- `server/routers.ts`: `arc.evaluateTask` atualizado para avaliação real.

## Limites conscientes

Os sinais ainda são heurísticos e não calibrados estatisticamente. `ALLOW` não é autenticação, identidade criptográfica nem prova de presença física. O histórico usa os dados disponíveis no SCP e não diferencia ainda tipos de evento ou janelas temporais sofisticadas. O agente avaliado não chama serviços externos e o modo `assisted`/`enforced` continua desabilitado por comportamento.

O pacote separado `SofiaARC-PGC` continua sendo a referência conceitual do coletor/avaliador. Como ele é privado e não possui artefato distribuível, esta etapa colocou uma implementação equivalente, pequena e rastreável no SCP para permitir execução real imediata. Uma etapa futura pode substituir o módulo local por dependência versionada ou workspace compartilhado.

## Validação

- `pnpm check`: aprovado.
- `pnpm test -- --run server/db.test.ts server/auth.logout.test.ts`: 5 testes aprovados.
- `git diff --check`: aprovado.
- Commit `3ba580c` confirmado em `origin/main`.
- Não foi possível confirmar execução end-to-end sem aplicar a migration ARC-004 a um PostgreSQL autorizado.

## Próxima etapa

Publicar OR da ARC-006, atualizar o quadro e então preparar ARC-007. Antes do uso operacional, aplicar migrations ARC-004 e criar ao menos uma `arcPolicies` habilitada. Depois adicionar teste de integração com banco real e activity-event types mais específicos.
