# MISSION_0016 — Execução Real de Missões e Créditos Manus

> **Projeto:** Triangulo
> **Email do usuário:** não informado
> **Data e hora:** 2026-10-31 17:36 (UTC-03:00)

## Objetivo

Fazer o SofiaControlPanel iniciar missões de fato na API Manus e atualizar os créditos reais de cada agente.

## Implementação

- Criado `server/manusExecutionService.ts`.
- `tasks.start` agora chama `POST /v2/task.create` com a API key Manus do agente.
- IDs externos, status, consumo e sincronização são persistidos na tarefa local.
- Heartbeat consulta `task.detail` para tarefas em execução.
- Heartbeat consulta `usage.availableCredits` para todos os agentes.
- Criado `agents.refreshCredits` e botão manual **Atualizar créditos**.
- Missões antigas em `PROGRESS` sem `manusTaskId` podem ser recuperadas pela interface.
- Criada migration `drizzle/0002_even_vindicator.sql`.

## Critério de aceite

O fluxo está pronto para teste controlado no Render, desde que cada agente tenha API key Manus válida e o serviço possua `DATABASE_URL`. A execução ponta a ponta em produção ainda precisa ser observada com uma missão de teste de baixo custo.
