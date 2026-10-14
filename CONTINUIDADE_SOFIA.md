# Relatório de continuidade — SofiaControlPanel

**Data:** 14/10/2026 14:46 (America/Sao_Paulo)  
**Repositório:** `https://github.com/meshwave65/SofiaControlPanel`  
**Branch:** `main`  
**Deploy:** Render Web Service `SofiaControlPanel-web`

## 1. Objetivo do sistema

O SofiaControlPanel é um painel para gerenciar várias unidades/agentes de IA. Cada agente representa uma conta Manus que deverá ter:

- nome identificador;
- descrição e versão;
- email/conta Manus;
- senha/token armazenados protegidos no backend;
- status operacional;
- heartbeat/conexão;
- créditos remanescentes;
- tarefas associadas;
- mensagens e logs de atividade.

A aplicação ainda está na fase de fundação operacional. O cadastro visual de agentes existe, mas a integração real com login Manus e a leitura automática de créditos ainda não foi implementada.

## 2. Estado do código

Últimos commits publicados:

| Commit | Descrição | Estado |
|---|---|---|
| `2073651` | Remove script de analytics com placeholders inválidos | Enviado ao GitHub; deploy em andamento no momento deste relatório |
| `47401e2` | Adiciona `favicon.svg` e `favicon.ico` válidos | Deploy live confirmado |
| `99018d1` | Isola o schema PostgreSQL no namespace `sofia` | Deploy live anterior |
| `2859794` | Conecta o painel operacional a dados reais | Base funcional anterior |
| `99cf59f` | Alinha backend e protege credenciais dos agentes | Base de segurança |

Validações locais concluídas:

```text
pnpm check  -> aprovado
pnpm build  -> aprovado
 git diff --check -> aprovado
```

### Arquivos importantes

- `client/src/pages/Agents.tsx` — tela de cadastro/listagem de agentes.
- `server/routers.ts` — rotas tRPC de agentes, tarefas, mensagens e logs.
- `server/db.ts` — acesso PostgreSQL via Drizzle/Postgres.js.
- `server/credentials.ts` — proteção/criptografia de credenciais.
- `drizzle/schema.ts` — schema PostgreSQL no namespace `sofia`.
- `drizzle/0000_unusual_wrecker.sql` — migration PostgreSQL gerada e ajustada.
- `client/public/favicon.svg` — ícone principal.
- `client/public/favicon.ico` — fallback para navegadores antigos.

## 3. Banco de dados Supabase

O banco usado é o projeto Supabase:

```text
ufylccbdjfzydbwhpmpp
```

As tabelas do SofiaControlPanel foram criadas com sucesso no schema separado:

```text
sofia
```

Esse isolamento foi necessário porque o banco já continha tabelas legadas em `public`, como `messages`, `message_types` e `task_priorities`, com estrutura incompatível.

### Tabelas criadas em `sofia`

- `users`
- `agents`
- `tasks`
- `taskStatuses`
- `taskPriorities`
- `messageTypes`
- `messages`
- `activityEventTypes`
- `activityLogs`
- `contextReports`
- `scheduledTasks`

Também foram criados:

- enum `sofia.role`;
- enum `sofia.agent_status`;
- chaves estrangeiras;
- índices operacionais;
- Row Level Security habilitado durante a execução pelo SQL Editor.

### Atenção sobre o schema

O Drizzle usa tabelas qualificadas diretamente no schema `sofia` por meio de `pgSchema("sofia")`. Não alterar novamente para `public` sem revisar o banco e todas as migrations.

## 4. Render

Workspace:

```text
MeshWave
workspaceId: tea-d3g1ddogjchc7382sa90
```

Serviço:

```text
SofiaControlPanel-web
serviceId: srv-db7qpead0e5s73erdepg
URL: https://sofiacontrolpanel-web.onrender.com
```

Configuração atual do serviço:

```text
Build: pnpm install --frozen-lockfile && pnpm run build
Start: pnpm start
Branch: main
Region: Oregon
Runtime: Node
```

### Deploys recentes

- `47401e2` — status `live`.
- `2073651` — status `update_in_progress` no momento deste relatório.

### Problema crítico ainda pendente: DATABASE_URL

Os logs do serviço registraram repetidamente:

```text
[Database] DATABASE_URL is not defined in environment variables
```

Isso continuou aparecendo depois do deploy do commit `99018d1`. Portanto, a aplicação está acessível, mas o backend ainda não confirmou conexão com PostgreSQL.

Verificar no serviço correto do Render:

```text
DATABASE_URL
```

A URL esperada é a do Transaction Pooler do Supabase, com a senha real substituída:

```text
postgresql://postgres.ufylccbdjfzydbwhpmpp:SENHA@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

Não colocar a senha no GitHub, neste arquivo ou no chat.

Depois de salvar a variável, executar `Manual Deploy → Deploy latest commit` ou reiniciar o serviço e verificar se aparece:

```text
[Database] Connected successfully
```

## 5. Erros recentes do navegador

### Favicon

O navegador registrava erro porque `/favicon.svg` e `/favicon.ico` estavam caindo no fallback `index.html`, retornando `text/html` em vez de uma imagem.

Correção aplicada:

- criação de `client/public/favicon.svg` válido;
- criação de `client/public/favicon.ico` válido;
- referências adicionadas em `client/index.html`.

Verificação pública realizada:

```text
/favicon.svg -> HTTP 200, content-type: image/svg+xml
/favicon.ico -> HTTP 200, content-type: image/x-icon
```

### Analytics

O HTML continha:

```html
<script src="%VITE_ANALYTICS_ENDPOINT%/umami"></script>
```

Quando as variáveis não existiam, o navegador tentava acessar literalmente uma URL contendo `%VITE_ANALYTICS_ENDPOINT%`, gerando HTTP 400.

Correção aplicada no commit `2073651`: remoção do script estático de analytics. Se analytics for necessário no futuro, implementar carregamento condicional somente quando as duas variáveis existirem:

```text
VITE_ANALYTICS_ENDPOINT
VITE_ANALYTICS_WEBSITE_ID
```

## 6. Testes ainda não concluídos

### Criação de agente real

Ainda não foi possível validar a criação de agente no ambiente publicado porque o backend não confirmou `DATABASE_URL`.

A rota de criação é:

```text
agents.create
```

Payload esperado:

```json
{
  "name": "Agente de teste",
  "description": "Teste de conectividade do painel",
  "version": "1.0.0",
  "manusAccount": "",
  "manusPassword": "",
  "manusToken": ""
}
```

A criação exige sessão autenticada. Para o primeiro teste, usar campos Manus vazios. Não utilizar senha ou token real até a conexão, criptografia e política de acesso estarem validadas.

### Ordem recomendada do teste

1. Confirmar `DATABASE_URL` no Render.
2. Confirmar no log:

   ```text
   [Database] Connected successfully
   ```

3. Acessar `/` e autenticar via Google/Supabase/OAuth.
4. Abrir `/agents`.
5. Criar um agente de teste sem credenciais Manus.
6. Confirmar que o registro aparece na tabela `sofia.agents`.
7. Testar atualização de status.
8. Testar heartbeat.
9. Excluir o agente de teste.

## 7. Integração Manus — estado e cautelas

O backend registra inicialização OAuth com:

```text
[OAuth] Initialized with baseURL: https://api.manus.im
```

Porém, não considerar a integração de contas Manus concluída. Ainda é necessário definir e validar:

- mecanismo oficial de login/API para contas Manus;
- armazenamento e rotação de sessão/token;
- tratamento de MFA e expiração;
- leitura oficial de créditos;
- limites e políticas de uso;
- isolamento por agente;
- auditoria de tarefas executadas;
- não exposição de `manusPassword` e `manusToken` em respostas públicas.

Não implementar automação de login por scraping antes de confirmar a API e os termos do serviço Manus.

## 8. Estado do working tree

No momento do relatório, `main` está sincronizada com `origin/main`, mas existem alterações locais não commitadas relacionadas à migração Drizzle/PostgreSQL:

```text
M drizzle.config.ts
M drizzle/meta/0000_snapshot.json
M drizzle/meta/_journal.json
M package.json
M pnpm-lock.yaml
M server/db.ts
D migrations MySQL antigas na pasta principal
?? drizzle/0000_tricky_hulk.sql
?? drizzle/legacy-mysql/
```

Essas alterações não devem ser apagadas automaticamente. Revisar antes do próximo commit. A intenção foi separar migrations MySQL legadas e manter um histórico PostgreSQL limpo.

## 9. Próxima ação imediata

A próxima instância deve:

1. consultar os logs do Render após o deploy `2073651`;
2. confirmar se `DATABASE_URL` ainda está ausente;
3. corrigir a variável no serviço `SofiaControlPanel-web`, se necessário;
4. confirmar `Connected successfully`;
5. só então executar o teste autenticado de criação de agente;
6. validar o favicon e o HTML sem chamadas para `%VITE_ANALYTICS_ENDPOINT%`;
7. registrar o resultado neste arquivo.
