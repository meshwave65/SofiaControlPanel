# Sandbox — acesso ao catálogo central de agentes

O Sandbox mantém suas próprias tarefas e sua projeção local de agentes, mas a fonte canônica dos agentes SCP e das credenciais Manus é o projeto central:

- Supabase project: `ufylccbdjfzydbwhpmpp`
- Schema: `sofia`
- Table: `agents`
- Relação Sandbox → central: `sandbox.agents.sourceAgentId`

## Variáveis no serviço Render do Sandbox

Configurar no serviço Sandbox, sem compartilhar os valores em chats ou commits:

| Variável | Conteúdo |
| --- | --- |
| `CENTRAL_SCP_DATABASE_URL` | Connection string PostgreSQL do projeto central SCP, preferencialmente com usuário somente leitura |
| `CENTRAL_SCP_CREDENTIAL_ENCRYPTION_KEY` | Mesmo segredo usado pelo serviço central em `CREDENTIAL_ENCRYPTION_KEY` para criptografar `manusToken` |

O usuário PostgreSQL precisa apenas de `USAGE` no schema `sofia` e `SELECT` na tabela `sofia.agents`. O código do Sandbox consulta os metadados e descriptografa as credenciais em memória quando necessário; não grava tokens ou senhas na projeção local.

## Comportamento sem configuração

Se a conexão central ou a chave de descriptografia estiver ausente, os agentes SCP_CATALOG não entram na lista de elegíveis. O inventário local continua visível como projeção, mas não é tratado como fonte de credenciais.

O espelhamento dos documentos e das transições da missão também exige `GITHUB_PAT` no serviço Sandbox. Sem esse segredo, o trabalho pode ser persistido no Supabase, mas a missão permanece em `github_sync_pending` e não é marcada como `DONE` até o espelhamento ser concluído.

A lista de elegíveis é atualizada a cada 60 segundos. A reserva de um agente para uma missão continua sendo validada atomicamente no banco do Sandbox.
