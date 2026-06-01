# Sofia Control Panel - Histórico de Atualizações

## [2026-05-27] Fase 8 Completa: Página Messages.tsx
**Commit**: `60dbfd2`
**Descrição**: Interface de chat/threads com polling automático, notificações de mensagens não lidas e agrupamento por tarefa.
**Arquivos Modificados**: `client/src/pages/Messages.tsx`

## [2026-05-27] Fase 7 Completa: Página Tasks.tsx
**Commit**: `e1d1269`
**Descrição**: Página de gerenciamento de tarefas com tabela, filtros por status/prioridade/agente e paginação.
**Arquivos Modificados**: `client/src/pages/Tasks.tsx`

## [2026-05-27] Fase 6 Completa: Página Agents.tsx
**Commit**: `6bcaa05`
**Descrição**: Página de gerenciamento de agentes com listagem em cards CAD, modal de criação e botões pausar/retomar/deletar.
**Arquivos Modificados**: `client/src/pages/Agents.tsx`

## [2026-05-27] Fase 5 Completa: Dashboard Principal
**Commit**: `ddc5804`
**Descrição**: Dashboard com DashboardLayout, métricas em tempo real e gráficos Recharts para atividade e status de agentes.
**Arquivos Modificados**: `client/src/pages/Dashboard.tsx`

## [2026-05-27] Fase 4 Completa: Tema Visual CAD/Arquitetônico
**Commit**: `e218eba`
**Descrição**: Paleta OKLCH com componentes CSS: .cad-box, .cad-card, .status-indicator, .technical-header, .grid-separator, etc.
**Arquivos Modificados**: `client/src/index.css`, `todo.md`

## [2026-05-27] Fase 3 Completa: Routers tRPC
**Commit**: `2a67384`
**Descrição**: 20+ procedures tRPC com 4 níveis de acesso (public, protected, admin, owner) para agentes, tarefas, mensagens, logs e relatórios.
**Arquivos Modificados**: `server/routers.ts`

## [2026-05-27] Fase 2 Completa: Database Helpers
**Commit**: `90b68b5`
**Descrição**: 50+ funções de database helpers cobrindo CRUD de agentes, tarefas, mensagens, logs de atividade, relatórios e lookup tables.
**Arquivos Modificados**: `server/db.ts`

## [2026-05-27] Fase 1 Completa: Schema de Banco de Dados
**Commit**: `b06f833`
**Descrição**: 11 tabelas com foreign keys e índices: users, agents, tasks, taskStatuses, taskPriorities, messages, messageTypes, activityLogs, activityEventTypes, contextReports, scheduledTasks.
**Arquivos Modificados**: `drizzle/schema.ts`, `drizzle/0001_previous_dorian_gray.sql`

---

## Próximas Fases

- [ ] Fase 9: Endpoints públicos para agentes externos (heartbeat, activity logs, messages)
- [ ] Fase 10: Sistema de heartbeat e monitoramento com relatório de contexto
- [ ] Fase 11: Automação de commits e sincronização com GitHub via PAT
