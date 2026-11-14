# Relatório de Missão - Sofia Control Panel
## Plataforma de Monitoramento de Agentes Autônomos

---

## 1. OBJETIVO
Construir uma plataforma web full-stack para **orquestração e monitoramento em tempo real de agentes autônomos** executando tarefas reais, com interface visual estilo CAD e endpoints públicos para integração com agentes externos.

---

## 2. ETAPAS REALIZADAS

### Fase 1: Estrutura de Dados (11 Tabelas)

| Tabela | Propósito | Campos Principais |
|--------|----------|------------------|
| **users** | Usuários do sistema | id, openId, name, email, role (admin/user) |
| **agents** | Agentes autônomos gerenciados | id, ownerId, name, status (online/offline/idle/paused), lastHeartbeat, config |
| **tasks** | Tarefas a executar | id, agentId, title, statusId, priorityId, completedAt |
| **taskStatuses** | Lookup: status de tarefas | id, name (pending, running, completed, failed) |
| **taskPriorities** | Lookup: prioridades | id, name (low, medium, high, critical) |
| **messages** | Chat/comunicação entre agentes e sistema | id, taskId, senderId, typeId, content, parentMessageId (threads), isRead |
| **messageTypes** | Lookup: tipos de mensagem | id, name (question, update, error, info) |
| **activityLogs** | Auditoria de eventos | id, agentId, taskId, eventTypeId, description, metadata |
| **activityEventTypes** | Lookup: tipos de evento | id, name (heartbeat, timeout, task_started, task_completed) |
| **contextReports** | Relatórios de contexto automáticos | id, ownerId, title, content, creditsRemaining, gitHubUrl |
| **scheduledTasks** | Tarefas agendadas para execução periódica | id, name, cronExpression, handler, nextRun |

**Índices**: Criados em campos críticos (ownerId, statusId, createdAt, agentId) para performance.

---

## 3. ENDPOINTS PÚBLICOS PARA AGENTES EXTERNOS

### POST `/api/public/heartbeat`
**Propósito**: Agente envia sinal de vida (heartbeat)
```json
Request:
{
  "agentId": 1,
  "status": "online" (opcional)
}

Response:
{
  "success": true,
  "message": "Heartbeat recebido com sucesso",
  "timestamp": "2026-05-27T13:45:30Z"
}
```
**Ação**: Atualiza `lastHeartbeat` do agente e registra evento em `activityLogs`

---

### POST `/api/public/activity`
**Propósito**: Registrar evento de atividade do agente
```json
Request:
{
  "agentId": 1,
  "taskId": 5,
  "eventType": "task_completed",
  "description": "Tarefa processada com sucesso",
  "metadata": {"duration_ms": 1234, "items_processed": 100}
}

Response:
{
  "success": true,
  "message": "Atividade registrada com sucesso",
  "logId": 42
}
```
**Ação**: Cria entrada em `activityLogs` com tipo de evento automático

---

### POST `/api/public/message`
**Propósito**: Agente envia mensagem para tarefa (com suporte a threads)
```json
Request:
{
  "agentId": 1,
  "taskId": 5,
  "messageType": "update",
  "content": "Processamento 50% completo",
  "parentMessageId": 10 (opcional, para responder em thread)
}

Response:
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "messageId": 123
}
```
**Ação**: Cria mensagem em `messages` com suporte a threads via `parentMessageId`

---

### GET `/api/public/messages/:taskId`
**Propósito**: Recuperar todas as mensagens de uma tarefa
```
Response:
{
  "success": true,
  "messages": [...],
  "count": 15
}
```

---

### GET `/api/public/agent/:agentId`
**Propósito**: Obter informações de um agente específico
```
Response:
{
  "success": true,
  "agent": {
    "id": 1,
    "name": "Agent-001",
    "status": "online",
    "lastHeartbeat": "2026-05-27T13:45:30Z"
  }
}
```

---

### GET `/api/public/tasks/:agentId`
**Propósito**: Listar todas as tarefas de um agente
```
Response:
{
  "success": true,
  "tasks": [...],
  "count": 8
}
```

---

## 4. PÁGINAS E INTERFACES

### Dashboard Principal (`/dashboard`)
- **Métricas em tempo real**: Agentes online/offline, tarefas pendentes/concluídas
- **Gráficos Recharts**: Atividade recente (24h) e distribuição de status
- **Cards de status**: Indicadores visuais com cores (verde=online, cinza=offline, amarelo=pendente)
- **Tabela de agentes ativos**: Com último heartbeat e status

**Interação**: Clique em agente para ver detalhes e histórico de tarefas

---

### Página de Agentes (`/agents`)
- **Listagem em cards CAD**: Cada agente em card com nome, status, última atividade
- **Modal de Criação**: Formulário para registrar novo agente (nome, descrição, config JSON)
- **Botões de Ação**: Pausar, Retomar, Deletar agente
- **Indicadores visuais**: Cores por status (online, offline, idle, paused)
- **Card de estatísticas**: Total de agentes por status

**Interação**: 
1. Clique em "Novo Agente" para abrir modal
2. Preencha nome, descrição e configuração
3. Clique em "Criar" para registrar
4. Use botões para pausar/retomar/deletar

---

### Página de Tarefas (`/tasks`)
- **Tabela com filtros**: Status, prioridade, agente responsável
- **Paginação**: Navegação entre páginas de tarefas
- **Modal de Criação/Edição**: Campos para título, descrição, prioridade, agente
- **Status visual**: Cores indicando progresso (pendente, executando, concluído, falha)

**Interação**: Selecione filtros para refinar busca, clique em tarefa para editar

---

### Página de Mensagens (`/messages`)
- **Seletor de tarefa**: Lista de tarefas no painel esquerdo
- **Chat com threads reais**: Mensagens agrupadas por `parentMessageId`
- **Expand/Collapse**: Visualizar respostas em thread
- **Polling automático**: Atualização a cada 3 segundos
- **Notificações**: Contador de mensagens não lidas
- **Botão "Responder"**: Responder em thread (parentMessageId)

**Interação**:
1. Selecione uma tarefa na lista
2. Veja mensagens agrupadas por thread
3. Clique "Responder" para replicar em thread
4. Digite mensagem e pressione Ctrl+Enter

---

## 5. SISTEMA DE MONITORAMENTO (Heartbeat)

### Verificação de Agentes Offline
- **Frequência**: A cada 30 segundos
- **Lógica**: Se agente não enviar heartbeat por 5 minutos, marca como offline
- **Ação**: Registra evento em `activityLogs` com tipo "timeout"

### Geração Automática de Relatório de Contexto
- **Trigger**: Ao atingir aproximadamente 40 créditos
- **Conteúdo**: Resumo do sistema gerado por LLM
  - Total de agentes e status
  - Total de tarefas e progresso
  - Logs recentes
- **Ações**:
  1. Cria entrada em `contextReports`
  2. Notifica owner via `notifyOwner()`
  3. Sincroniza com GitHub via PAT

### Sincronização com GitHub
- **Arquivo**: `UPDATES.md` atualizado automaticamente
- **Autenticação**: Personal Access Token (PAT)
- **Conteúdo**: Histórico de commits com data, hash, fase e descrição

---

## 6. TEMA VISUAL CAD/ARQUITETÔNICO

**Paleta OKLCH**:
- Azul Royal Escuro: `#0a1628` (fundo)
- Cyan: `#06b6d4` (acentos, linhas técnicas)
- Branco Bold: `#e8f0ff` (texto)

**Componentes CSS**:
- `.cad-box`: Moldura técnica com linhas cyan
- `.cad-card`: Card com sombra interna técnica
- `.status-indicator`: Indicador de status com cores
- `.technical-header`: Header com linha decorativa cyan
- `.grid-separator`: Separador com padrão de grade

---

## 7. FLUXO DE INTERAÇÃO COMPLETO

### Cenário: Monitorar Agente Executando Tarefa

1. **Cadastro de Agente** (`/agents`)
   - Clique "Novo Agente"
   - Preencha: nome="Agent-001", descrição="Processador de dados", config=`{}`
   - Clique "Criar"
   - Agente registrado em `agents` com status "offline"

2. **Agente Envia Heartbeat** (via endpoint público)
   ```bash
   curl -X POST http://localhost:3000/api/public/heartbeat \
     -H "Content-Type: application/json" \
     -d '{"agentId": 1, "status": "online"}'
   ```
   - Status do agente muda para "online" em `agents`
   - Evento registrado em `activityLogs`
   - Dashboard mostra agente como "online"

3. **Criar Tarefa** (`/tasks`)
   - Clique "Nova Tarefa"
   - Preencha: título="Processar dados", agente="Agent-001", prioridade="high"
   - Tarefa criada em `tasks` com statusId="pending"

4. **Agente Registra Atividade** (via endpoint público)
   ```bash
   curl -X POST http://localhost:3000/api/public/activity \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": 1,
       "taskId": 1,
       "eventType": "task_started",
       "description": "Iniciando processamento",
       "metadata": {"items": 1000}
     }'
   ```
   - Log criado em `activityLogs`
   - Dashboard atualiza gráfico de atividade

5. **Agente Envia Mensagens** (via endpoint público com threads)
   ```bash
   # Mensagem raiz
   curl -X POST http://localhost:3000/api/public/message \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": 1,
       "taskId": 1,
       "messageType": "update",
       "content": "Processamento iniciado"
     }'
   
   # Resposta em thread (parentMessageId=1)
   curl -X POST http://localhost:3000/api/public/message \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": 1,
       "taskId": 1,
       "messageType": "update",
       "content": "50% concluído",
       "parentMessageId": 1
     }'
   ```
   - Mensagens criadas em `messages` com threads
   - Página `/messages` mostra conversa agrupada

6. **Monitorar em Tempo Real** (`/dashboard`)
   - Veja agente online
   - Veja tarefa em progresso
   - Veja gráfico de atividade atualizado
   - Veja últimas mensagens

7. **Relatório Automático** (ao atingir ~40 créditos)
   - Sistema gera relatório em `contextReports`
   - Owner recebe notificação
   - `UPDATES.md` atualizado no GitHub

---

## 8. MELHORIAS SUGERIDAS

### 1. **Página de Registro de Agentes Melhorada**
   - **Problema Atual**: Modal simples sem validação
   - **Melhoria**: 
     - Validação de nome único
     - Preview de configuração JSON em tempo real
     - Teste de conexão antes de salvar
     - Suporte a upload de arquivo de configuração

### 2. **Dashboard com Filtros Avançados**
   - **Problema Atual**: Visão geral apenas
   - **Melhoria**:
     - Filtrar por período (24h, 7d, 30d)
     - Filtrar por status de agente
     - Gráfico de taxa de sucesso/falha de tarefas
     - Alertas para agentes offline por muito tempo

### 3. **Sistema de Alertas em Tempo Real**
   - **Problema Atual**: Sem notificações
   - **Melhoria**:
     - Toast notifications para eventos críticos
     - Email/SMS para agentes offline
     - Webhook customizável para integrações

### 4. **Histórico e Auditoria Detalhada**
   - **Problema Atual**: Logs básicos
   - **Melhoria**:
     - Timeline visual de eventos por agente
     - Exportar relatórios em PDF
     - Busca full-text em logs
     - Filtros por tipo de evento

### 5. **Integração com Stripe para Créditos**
   - **Problema Atual**: Créditos simulados
   - **Melhoria**:
     - Compra de créditos via Stripe
     - Planos de assinatura
     - Tracking de consumo por agente
     - Alertas de créditos baixos

### 6. **Webhooks para Agentes Externos**
   - **Problema Atual**: Polling apenas
   - **Melhoria**:
     - Registrar webhook URL do agente
     - Push automático de eventos críticos
     - Retry automático em caso de falha
     - Histórico de tentativas

### 7. **Painel de Configuração de Agentes**
   - **Problema Atual**: Config JSON manual
   - **Melhoria**:
     - Editor visual de configuração
     - Validação de schema
     - Histórico de mudanças
     - Rollback de configuração

---

## 9. RESUMO TÉCNICO

| Aspecto | Detalhes |
|---------|----------|
| **Banco de Dados** | 11 tabelas MySQL com foreign keys e índices |
| **API Backend** | 20+ tRPC procedures + 6 endpoints públicos |
| **Frontend** | React 19 + Tailwind 4 + Recharts |
| **Autenticação** | OAuth Manus + JWT |
| **Monitoramento** | Heartbeat a cada 30s + Relatório automático |
| **Sincronização** | GitHub via PAT com UPDATES.md automático |
| **Tema** | CAD/Arquitetônico com paleta OKLCH |

---

## 10. PRÓXIMAS AÇÕES RECOMENDADAS

1. **Testar fluxo completo**: Cadastrar agente → Enviar heartbeat → Criar tarefa → Registrar atividade
2. **Configurar GitHub PAT**: Definir variáveis de ambiente para sincronização automática
3. **Implementar alertas**: Adicionar notificações para agentes offline
4. **Adicionar webhooks**: Permitir que agentes recebam eventos via webhook
5. **Integrar Stripe**: Implementar sistema de créditos com pagamento real

---

**Data**: 2026-05-27  
**Status**: ✅ Projeto Completo com 11 Fases  
**Commits**: 20+ commits escalonados com histórico em UPDATES.md
