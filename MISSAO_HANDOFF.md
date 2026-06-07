# 🎯 MISSÃO HANDOFF - Sofia Control Panel
## Para Próximo Agente Assumir

---

## CONTEXTO ATUAL

A plataforma **Sofia Control Panel** foi construída com sucesso nas 11 fases iniciais:
- ✅ Schema de banco de dados (11 tabelas)
- ✅ Database helpers (50+ funções)
- ✅ Routers tRPC (20+ procedures)
- ✅ Tema visual CAD/arquitetônico
- ✅ Dashboard principal
- ✅ Páginas de Agents, Tasks, Messages
- ✅ Endpoints públicos para agentes externos
- ✅ Sistema de heartbeat e monitoramento
- ✅ GitHub sync com PAT

**Versão Atual**: `1d60060d`  
**Checkpoint**: [manus-webdev://1d60060d](manus-webdev://1d60060d)

---

## 🚨 PRIORIDADE CRÍTICA

### Tarefa 1: Melhorar Página de Cadastro de Agentes
**Status**: ⚠️ CRÍTICA - Necessário melhorias significativas  
**Arquivo**: `client/src/pages/Agents.tsx`

#### Problemas Atuais:
1. Modal de criação é muito simples (apenas nome, descrição, config JSON)
2. Sem validação de dados
3. Sem preview de configuração
4. Sem teste de conexão antes de salvar
5. Config JSON como texto puro (difícil de editar)
6. Sem suporte a upload de arquivo de configuração

#### Melhorias Necessárias:
```
[ ] Validação de nome único (não permitir duplicatas)
[ ] Validação de email do agente (se aplicável)
[ ] Editor visual para configuração JSON (com syntax highlighting)
[ ] Preview em tempo real da configuração
[ ] Teste de conexão com agente antes de salvar
[ ] Suporte a upload de arquivo de configuração (.json)
[ ] Campos adicionais:
    - Versão do agente
    - Tipo de agente (worker, scheduler, monitor)
    - Timeout de heartbeat (padrão 5min)
    - Webhook URL (opcional)
    - Tags/Labels para categorização
[ ] Indicador visual de agente válido/inválido
[ ] Histórico de tentativas de criação
```

---

### Tarefa 2: Criar Tabela de Configuração de Agentes
**Status**: ⚠️ CRÍTICA - Nova tabela necessária  
**Arquivo**: `drizzle/schema.ts`

#### Tabela Necessária: `agentConfigs`

```sql
CREATE TABLE agentConfigs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agentId INT NOT NULL,
  configKey VARCHAR(255) NOT NULL,
  configValue LONGTEXT NOT NULL,
  configType ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  isEncrypted BOOLEAN DEFAULT FALSE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agentId) REFERENCES agents(id) ON DELETE CASCADE,
  UNIQUE KEY unique_agent_config (agentId, configKey),
  INDEX idx_agentId (agentId),
  INDEX idx_configKey (configKey)
);
```

#### Campos:
| Campo | Tipo | Propósito |
|-------|------|----------|
| id | INT | Identificador único |
| agentId | INT | FK para agents |
| configKey | VARCHAR | Nome da configuração (ex: "max_workers", "timeout") |
| configValue | LONGTEXT | Valor da configuração |
| configType | ENUM | Tipo de dado (string, number, boolean, json) |
| isEncrypted | BOOLEAN | Se deve ser criptografado (senhas, tokens) |
| description | TEXT | Descrição da configuração |
| createdAt | TIMESTAMP | Data de criação |
| updatedAt | TIMESTAMP | Data de atualização |

#### Índices:
- `UNIQUE(agentId, configKey)` - Uma config por chave por agente
- `INDEX(agentId)` - Buscar configs de um agente
- `INDEX(configKey)` - Buscar configs por nome

#### Exemplos de Configurações:
```json
{
  "agentId": 1,
  "configKey": "max_workers",
  "configValue": "10",
  "configType": "number"
}

{
  "agentId": 1,
  "configKey": "api_token",
  "configValue": "encrypted_token_here",
  "configType": "string",
  "isEncrypted": true
}

{
  "agentId": 1,
  "configKey": "retry_policy",
  "configValue": "{\"max_retries\": 3, \"backoff\": \"exponential\"}",
  "configType": "json"
}
```

---

## 📋 TAREFAS SECUNDÁRIAS

### Tarefa 3: Adicionar Database Helpers para agentConfigs
**Arquivo**: `server/db.ts`

```typescript
// Adicionar funções:
[ ] createAgentConfig(agentId, configKey, configValue, configType, isEncrypted)
[ ] getAgentConfig(agentId, configKey)
[ ] getAllAgentConfigs(agentId)
[ ] updateAgentConfig(agentId, configKey, configValue)
[ ] deleteAgentConfig(agentId, configKey)
[ ] getEncryptedConfig(agentId, configKey) // Descriptografar
[ ] setEncryptedConfig(agentId, configKey, value) // Criptografar
```

---

### Tarefa 4: Adicionar tRPC Procedures para agentConfigs
**Arquivo**: `server/routers.ts`

```typescript
// Adicionar router: agentConfigs com procedures:
[ ] agentConfigs.getAll - Listar todas as configs de um agente
[ ] agentConfigs.get - Obter uma config específica
[ ] agentConfigs.create - Criar nova config
[ ] agentConfigs.update - Atualizar config
[ ] agentConfigs.delete - Deletar config
[ ] agentConfigs.bulkUpdate - Atualizar múltiplas configs
```

---

### Tarefa 5: Melhorar UI de Cadastro de Agentes
**Arquivo**: `client/src/pages/Agents.tsx`

```
[ ] Adicionar abas no modal:
    - Aba 1: Informações Básicas (nome, tipo, versão)
    - Aba 2: Configurações (editor visual de configs)
    - Aba 3: Avançado (webhook, timeout, tags)
    - Aba 4: Preview (visualizar como será salvo)

[ ] Implementar editor de configuração:
    - Usar componente JSON editor (ex: react-json-editor)
    - Syntax highlighting
    - Validação em tempo real
    - Sugestões de campos comuns

[ ] Adicionar teste de conexão:
    - Botão "Testar Conexão"
    - Enviar heartbeat para agente
    - Mostrar resultado (conectado/desconectado)

[ ] Adicionar upload de arquivo:
    - Aceitar arquivo .json
    - Parsear e preencher formulário
    - Validar estrutura

[ ] Melhorar tabela de agentes:
    - Adicionar coluna "Tipo" (worker, scheduler, monitor)
    - Adicionar coluna "Versão"
    - Adicionar coluna "Webhook" (sim/não)
    - Adicionar coluna "Última Config" (data)
    - Adicionar ação "Editar Configurações"
```

---

### Tarefa 6: Criar Página de Configuração de Agentes
**Novo Arquivo**: `client/src/pages/AgentConfig.tsx`

```
[ ] Página dedicada para gerenciar configurações de um agente
[ ] Componentes:
    - Seletor de agente (dropdown)
    - Tabela de configurações atuais
    - Botão "Adicionar Config"
    - Botão "Editar" por config
    - Botão "Deletar" por config
    - Botão "Exportar Configs" (JSON)
    - Botão "Importar Configs" (JSON)

[ ] Modal de Edição de Config:
    - Campo: chave (nome da config)
    - Campo: valor (com validação por tipo)
    - Dropdown: tipo (string, number, boolean, json)
    - Checkbox: criptografar
    - Campo: descrição

[ ] Validações:
    - Chave não pode ser duplicada para mesmo agente
    - Valor deve respeitar o tipo
    - JSON deve ser válido se tipo=json

[ ] Histórico:
    - Mostrar quando config foi criada/atualizada
    - Opção de reverter para versão anterior
```

---

### Tarefa 7: Adicionar Rota para Página de Configuração
**Arquivo**: `client/src/App.tsx`

```typescript
[ ] Importar AgentConfig
[ ] Adicionar rota: <Route path={"/agent-config"} component={AgentConfig} />
[ ] Adicionar link no sidebar do DashboardLayout
```

---

## 🔄 FLUXO DE TRABALHO SUGERIDO

1. **Ler este documento completamente**
2. **Executar Tarefa 2**: Criar migration para `agentConfigs`
3. **Executar Tarefa 3**: Adicionar database helpers
4. **Executar Tarefa 4**: Adicionar tRPC procedures
5. **Executar Tarefa 5**: Melhorar UI de Agents.tsx
6. **Executar Tarefa 6**: Criar página AgentConfig.tsx
7. **Executar Tarefa 7**: Adicionar rota no App.tsx
8. **Testar fluxo completo**: Cadastrar agente → Configurar → Visualizar
9. **Fazer commits escalonados** a cada tarefa
10. **Atualizar UPDATES.md** com progresso

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

```
Tarefa 2: Tabela agentConfigs
[ ] Criar migration SQL
[ ] Executar migration com webdev_execute_sql
[ ] Verificar tabela criada

Tarefa 3: Database Helpers
[ ] Implementar 7 funções
[ ] Testar com vitest
[ ] Commit: "feat: database helpers para agentConfigs"

Tarefa 4: tRPC Procedures
[ ] Implementar 6 procedures
[ ] Adicionar validações
[ ] Testar com vitest
[ ] Commit: "feat: tRPC procedures para agentConfigs"

Tarefa 5: UI Agents.tsx
[ ] Adicionar abas no modal
[ ] Implementar editor JSON
[ ] Adicionar teste de conexão
[ ] Adicionar upload de arquivo
[ ] Melhorar tabela
[ ] Commit: "feat: melhorar UI de cadastro de agentes"

Tarefa 6: Página AgentConfig.tsx
[ ] Criar componente
[ ] Implementar CRUD de configs
[ ] Adicionar import/export
[ ] Adicionar histórico
[ ] Commit: "feat: página de configuração de agentes"

Tarefa 7: Rota
[ ] Adicionar rota em App.tsx
[ ] Adicionar link no sidebar
[ ] Commit: "feat: adicionar rota /agent-config"

Testes
[ ] Testar fluxo: cadastrar → configurar → visualizar
[ ] Testar validações
[ ] Testar import/export
[ ] Testar criptografia de senhas

Final
[ ] Atualizar UPDATES.md
[ ] Fazer checkpoint final
[ ] Criar novo relatório de missão
```

---

## 🛠️ FERRAMENTAS E TECNOLOGIAS

- **Frontend**: React 19, Tailwind 4, shadcn/ui
- **Backend**: Express, tRPC, Drizzle ORM
- **Database**: MySQL
- **Testes**: Vitest
- **Editor JSON**: Recomendado usar `react-json-editor-ajrm` ou `monaco-editor`

---

## 📚 REFERÊNCIAS

- **Relatório de Missão**: `/home/ubuntu/SofiaControlPanelApp/RELATORIO_MISSAO.md`
- **Histórico de Commits**: `/home/ubuntu/SofiaControlPanelApp/UPDATES.md`
- **Documentação GitHub Sync**: `/home/ubuntu/SofiaControlPanelApp/GITHUB_SYNC.md`
- **Schema Atual**: `/home/ubuntu/SofiaControlPanelApp/drizzle/schema.ts`
- **Database Helpers**: `/home/ubuntu/SofiaControlPanelApp/server/db.ts`
- **Routers tRPC**: `/home/ubuntu/SofiaControlPanelApp/server/routers.ts`

---

## ⚠️ NOTAS IMPORTANTES

1. **Commits Escalonados**: Fazer commit a cada tarefa concluída
2. **Atualizações de UPDATES.md**: Atualizar após cada commit
3. **Testes**: Implementar vitest para cada nova função
4. **Validações**: Adicionar validações no frontend E backend
5. **Segurança**: Criptografar configs sensíveis (tokens, senhas)
6. **Performance**: Adicionar índices para queries frequentes

---

## 🎯 SUCESSO ESPERADO

Ao final desta missão, a plataforma terá:
- ✅ Página robusta de cadastro de agentes
- ✅ Tabela de configurações de agentes
- ✅ UI intuitiva para gerenciar configs
- ✅ Suporte a import/export de configurações
- ✅ Validações completas
- ✅ Histórico de mudanças
- ✅ Criptografia de dados sensíveis

---

**Última Atualização**: 2026-05-27  
**Status**: 🟡 Aguardando Próximo Agente  
**Prioridade**: 🚨 CRÍTICA
