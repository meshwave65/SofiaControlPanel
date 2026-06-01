# Sofia Control Panel - TODO

## Fases Concluídas

- [x] Fase 1: Schema de banco de dados com 11 tabelas (agents, tasks, messages, activityLogs, contextReports, etc)
- [x] Fase 2: Database helpers completos em server/db.ts (50+ funções)
- [x] Fase 3: Routers tRPC com três níveis de acesso (public, protected, admin, owner)

## Fases em Progresso

- [ ] Fase 4: Tema visual CAD/arquitetônico em client/src/index.css (componentes .cad-box, .cad-card, .status-indicator)
- [ ] Fase 5: Dashboard principal com DashboardLayout
- [ ] Fase 6: Página Agents.tsx com listagem em cards CAD
- [ ] Fase 7: Página Tasks.tsx com tabela e filtros
- [ ] Fase 8: Página Messages.tsx com interface de chat/threads
- [ ] Fase 9: Endpoints públicos para agentes externos (heartbeat, activity logs, messages)
- [ ] Fase 10: Sistema de heartbeat e monitoramento com relatório de contexto
- [ ] Fase 11: Arquivo UPDATES.md com automação de commits

## Observações

- Commits escalonados a cada alteração significativa
- Arquivo UPDATES.md deve ser atualizado automaticamente a cada commit
- Monitoramento de créditos com disparo de relatório ao atingir ~40
- PAT do GitHub configurado para push automático
