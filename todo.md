# Sofia Control Panel - TODO

## Fase 1: Arquitetura e Planejamento
- [x] Analisar relatório de contexto
- [x] Clonar repositório GitHub
- [x] Inicializar projeto com scaffold web-db-user
- [x] Criar plano de desenvolvimento

## Fase 2: Schema de Banco de Dados
- [x] Implementar 11 tabelas no schema.ts (agents, tasks, taskStatuses, taskPriorities, messages, messageTypes, activityLogs, activityEventTypes, contextReports, scheduledTasks)
- [x] Gerar migrations via drizzle-kit
- [x] Aplicar migrations via webdev_execute_sql
- [x] Validar schema no banco de dados

## Fase 3: Database Helpers
- [x] Implementar helpers para agentes (CRUD completo)
- [x] Implementar helpers para tarefas (CRUD completo)
- [x] Implementar helpers para mensagens (CRUD com threads)
- [x] Implementar helpers para logs de atividade
- [x] Implementar helpers para relatórios de contexto
- [x] Implementar helpers para tarefas agendadas
- [ ] Escrever testes vitest para database helpers

## Fase 4: Routers tRPC
- [x] Criar router para agentes (list, create, update, delete, updateStatus)
- [x] Criar router para tarefas (list, create, update, delete, updateStatus, getByAgent)
- [x] Criar router para mensagens (create, getByTask, getByParentId, markAsRead)
- [x] Criar router para logs de atividade (create, getByAgent, getByTask, getRecent)
- [x] Criar router para relatórios de contexto (create, getRecent, updateGitHub)
- [x] Implementar procedures protegidas (public, protected, admin, owner)
- [ ] Escrever testes vitest para routers

## Fase 5: Tema Visual CAD/Arquitetônico
- [x] Atualizar client/src/index.css com cores e componentes CAD
- [x] Criar classes CSS customizadas (.cad-box, .cad-card, .status-indicator, .technical-header, .grid-separator)
- [ ] Aplicar tema globalmente em App.tsx
- [ ] Testar tema em todos os componentes

## Fase 6: Dashboard Principal
- [ ] Criar página Home.tsx com DashboardLayout
- [ ] Implementar métricas (total agentes, tarefas, mensagens não lidas)
- [ ] Implementar gráficos de atividade recente (Recharts)
- [ ] Implementar cards de status dos agentes
- [ ] Adicionar navegação para outras páginas

## Fase 7: Gerenciamento de Instâncias (Agentes)
- [ ] Criar página Agents.tsx
- [ ] Implementar listagem de agentes com cards
- [ ] Implementar modal de criação de agente
- [ ] Implementar botões: pausar, retomar, encerrar
- [ ] Implementar indicadores visuais de status em tempo real
- [ ] Adicionar filtros e busca

## Fase 8: Gerenciamento de Tarefas
- [ ] Criar página Tasks.tsx
- [ ] Implementar listagem de tarefas com tabela
- [ ] Implementar filtros por status, prioridade e agente
- [ ] Implementar modal para criar/editar tarefa
- [ ] Implementar atribuição de tarefas a agentes
- [ ] Adicionar paginação

## Fase 9: Sistema de Mensagens
- [ ] Criar página Messages.tsx
- [ ] Implementar interface de chat/threads
- [ ] Implementar polling automático para novas mensagens
- [ ] Implementar notificações de mensagens não lidas
- [ ] Implementar visualização de conversas com parent_message_id
- [ ] Adicionar indicador de mensagens não lidas no sidebar

## Fase 10: Endpoints para Agentes Externos
- [ ] Criar router agents.listStaged para listar tarefas STAGED
- [ ] Criar router messages.create para criar perguntas
- [ ] Criar router messages.getByParentId para verificar respostas
- [ ] Implementar logging de atividade de agentes
- [ ] Documentar endpoints para agentes externos

## Fase 11: Monitoramento de Créditos e Heartbeat
- [ ] Implementar heartbeat para monitorar créditos
- [ ] Criar endpoint /api/scheduled/generateContextReport
- [ ] Implementar geração automática de relatório ao atingir ~50 créditos
- [ ] Implementar push automático para GitHub
- [ ] Implementar notificação ao owner
- [ ] Configurar cron via manus-heartbeat

## Fase 12: Testes e Validação
- [ ] Executar testes vitest
- [ ] Validar fluxos principais no browser
- [ ] Testar autenticação OAuth
- [ ] Testar CRUD de agentes, tarefas e mensagens
- [ ] Testar filtros e busca
- [ ] Testar responsividade

## Fase 13: Documentação e Entrega
- [ ] Gerar relatório de passagem de contexto detalhado
- [ ] Documentar endpoints da API
- [ ] Criar guia de uso do painel
- [ ] Fazer checkpoint final
- [ ] Push para GitHub

---

## Status de Créditos
- Créditos iniciais: ~200
- Objetivo: Atingir ~50 créditos antes de gerar relatório
- Estratégia: Implementação incremental com checkpoints intermediários
