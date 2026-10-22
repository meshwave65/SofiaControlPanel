# Mapa relacional do Supabase — SOFIA

**Projeto consultado:** `meshwave65's Project` (`ufylccbdjfzydbwhpmpp`)  
**Escopo:** inventário de `public` e `sofia`, chaves estrangeiras, contagens das tabelas do fluxo, lookups e revisão de migrations. A consulta foi somente de leitura; nenhum registro ou schema foi alterado.

## Resumo executivo

O inventário detalhado refeito em 21/10/2026 confirma **46 tabelas** nos schemas `public` e `sofia` e **40 constraints de chave estrangeira** distintas. O mapa completo, com PKs, FKs por tabela, estado RLS e divergências, está em [SUPABASE-FULL-RELATIONAL-MAP.md](./SUPABASE-FULL-RELATIONAL-MAP.md). Há dois modelos de tarefas separados:

- `public.tasks` é o modelo do backend/engine. Ele referencia `public.task_statuses`, `public.task_priorities` e `public.clients`.
- `sofia.tasks` é o modelo do painel. Ele referencia `sofia.taskStatuses`, `sofia.taskPriorities`, `sofia.agents` e `sofia.users`.

Os lookups do painel já estão preenchidos: cinco status (IDs 1–5), quatro prioridades (IDs 1–4) e três tipos de mensagem (IDs 1–3). No modelo público do engine, `task_statuses`, `task_priorities` e `message_types` estão vazias; `public.tasks` também está vazia. `public.clients` contém quatro registros. As tabelas vazias não têm tarefas existentes que seriam afetadas por uma carga.

A falha anterior no painel (`sofia.tasks.statusId=100`) não é corrigida inserindo uma linha em `public.task_statuses`: a FK de `sofia.tasks` aponta para `sofia.taskStatuses`. A branch `fix/dynamic-task-status-lookups` já enviada ao GitHub corrige essa parte no código usando os IDs fornecidos pelo lookup do schema `sofia`.

## Relações em `public`

### Tarefas, mensagens e artefatos

- `public.tasks.status_id` → `public.task_statuses.status_id`.
- `public.tasks.priority_id` → `public.task_priorities.priority_id`.
- `public.tasks.client_id` → `public.clients.client_id`.
- `public.tasks.parent_task_id` e `conversation_root_id` → `public.tasks.task_id` (relações da tarefa consigo mesma).
- `public.task_titles.task_id`, `public.task_blocks.task_id` e `public.task_history.task_id` → `public.tasks.task_id`.
- `public.Artifacts.task_id` → `public.tasks.task_id`; `public.Artifacts.message_id` → `public.messages.message_id`.
- `public.messages.parent_message_id` → `public.messages.message_id`.

**Divergência de schema observada:** o modelo SQLAlchemy do engine declara FKs de `messages.task_id` → `tasks.task_id` e de `messages.message_type_id` → `message_types.type_id`; o catálogo ativo do Supabase não mostra essas duas constraints. A coluna `message_type_id` existe e não aceita nulo, mas não está protegida por FK no banco atual. Recomendo reconciliar o modelo e o schema antes de depender dessas relações.

`public.task_history.old_status` e `new_status` são texto, sem FK para `task_statuses`; são snapshots de auditoria, não relações referenciais.

### Clientes, perfis e comunidades

- `public.profiles.id` → `auth.users.id`.
- `public.profile_communities.profile_id` → `public.profiles.id`.
- `public.profile_communities.community_id` → `public.communities.id`.
- `public.devices.profile_id` → `public.profiles.id`.
- `public.ums_transactions.profile_id` → `public.profiles.id`.
- `public.clients.invite_code` → `public.invites_dev.code`.
- `public.tasks.client_id` → `public.clients.client_id` (também listado acima).

### Catálogo, metadados e outras áreas

- `public.persona_skills.persona_id` → `public.personas.persona_id`.
- `public.persona_skills.skill_id` → `public.skills.skill_id`.
- `public.metadata_values.metadata_type_id` → `public.metadata_types.metadata_type_id`.
- `public.modules.segment_id` → `public.segments.segment_id`.
- `public.appsofia_artifacts.task_id` → `public.appsofia_tasks.id`.
- `public.mw_state_snapshots.chain_id`, `public.mw_transactions.chain_id` e `public.mw_blocks.chain_id` → `public.mw_chain_metadata.chain_id`.
- `public.mw_transactions.block_id` → `public.mw_blocks.id`.

`public.appsofia_tasks` é outro sistema, com 1.086 registros e status textual; não tem FK para `public.tasks` nem para `sofia.tasks`.

## Relações em `sofia`

- `sofia.tasks.createdBy` → `sofia.users.id`.
- `sofia.tasks.agentId` → `sofia.agents.id`; `sofia.agents.ownerId` → `sofia.users.id`.
- `sofia.tasks.statusId` → `sofia.taskStatuses.id`.
- `sofia.tasks.priorityId` → `sofia.taskPriorities.id`.
- `sofia.tasks.parentTaskId` → `sofia.tasks.id`.
- `sofia.messages.taskId` → `sofia.tasks.id`; `sofia.messages.senderId` → `sofia.users.id`.
- `sofia.messages.typeId` → `sofia.messageTypes.id`.
- `sofia.messages.parentMessageId` → `sofia.messages.id`.
- `sofia.activityLogs.agentId` → `sofia.agents.id`; `sofia.activityLogs.taskId` → `sofia.tasks.id`.
- `sofia.activityLogs.eventTypeId` → `sofia.activityEventTypes.id`.
- `sofia.contextReports.ownerId` → `sofia.users.id`.

Lookups lidos no schema `sofia`:

| Tabela | Registros observados |
|---|---|
| `sofia.taskStatuses` | 1 STAGED, 2 PROGRESS, 3 PAUSED, 4 DONE, 5 FAIL |
| `sofia.taskPriorities` | 1 Baixa, 2 Média, 3 Alta, 4 Crítica |
| `sofia.messageTypes` | 1 Instruction, 2 Report, 3 Question |

## Situação dos lookups públicos

| Tabela | Registros observados | Uso/relação |
|---|---:|---|
| `public.task_statuses` | 0 | Referenciada por `public.tasks.status_id`; o serviço do engine cria com status 1 |
| `public.task_priorities` | 0 | Referenciada por `public.tasks.priority_id`; o modelo do engine usa default 1 e RH usa 2 |
| `public.message_types` | 0 | O modelo do engine declara relação obrigatória; a constraint correspondente não aparece no Supabase |
| `public.tasks` | 0 | Tabela operacional; ainda sem tarefas |
| `public.clients` | 4 | Referenciada por `public.tasks.client_id` |

O histórico de migrations retornado pelo Supabase contém somente três migrations, todas relacionadas à persistência MW Blockchain; não há migrations listadas para o modelo público de tarefas/status.

## Inconsistência que impede um seed seguro de status sem alinhar o fluxo

O código atual do engine usa IDs numéricos fixos e possui protocolos conflitantes:

- O serviço `tasks_service.create_task()` força o status **1**, ignorando o `status_id` recebido no POST; a consulta de tarefas pendentes e o Worker também usam 1.
- O Worker transita **1 → 2 → 3**, ou **5** em falha.
- `run_mission.py` envia **6** (“Aguardando Descrição e Título”), e o Escriba consome **6**, usa **40** durante o processamento e emite **7**.
- O serviço RH trata **7** como “Aguardando Recrutamento”.
- Outra versão do Executor envia **11** (mas o serviço de criação sobrescreve esse valor) e depois atualiza para **31**; o agente RH separado consome **31**, usa **40** e emite **8**.

Os códigos sugerem estas entradas: `1, 2, 3, 5, 6, 7, 8, 11, 31, 40`. Porém, os nomes de `7` e `31` representam filas de RH em caminhos diferentes, `11` é enviado mas descartado pelo serviço de criação, e o fluxo desejado Executor → Escriba → RH → Worker não é implementado de forma única. Inserir rótulos/IDs agora pode fazer as FKs deixarem de falhar, mas **não faz o pipeline funcionar corretamente**.

O `seed_database.py` atual não semeia `task_statuses`, `task_priorities` nem `message_types`; ele tenta gerar o roadmap. Também apaga o arquivo local `sofia.db` quando executado como script, portanto não deve ser rodado como se fosse um seed seguro do Supabase.

### Seed que deve ser feito após decidir o contrato de status

No mínimo, para o backend público criar tarefas sem erro de FK, devem existir status e prioridade correspondentes aos valores aceitos pelo engine. Também é recomendável popular `message_types` antes de criar mensagens. Minha recomendação é primeiro escolher uma única máquina de estados, atualizar o engine para consultar IDs pelo nome (em vez de espalhar números mágicos) e então inserir os lookups idempotentemente por nome, com prioridades alinhadas ao painel. Nenhum registro foi inserido nesta análise.

## Alerta de segurança crítico

O Supabase retornou um advisory indicando **RLS desabilitado em 29 tabelas públicas**, expostas a papéis `anon` e `authenticated`, incluindo `public.tasks`, `public.task_statuses`, `public.task_priorities`, `public.messages` e `public.workspace_configs`. Esta última contém colunas de credenciais como `db_key`, `storage_key` e `api_key`. Não li valores dessas colunas.

**Não habilitei RLS automaticamente**: fazê-lo sem políticas adequadas pode bloquear os acessos legítimos. O alerta recomenda revisar as políticas de cada tabela antes de aplicar a remediação. Documentação: [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

Tabelas listadas pelo advisory: `profiles`, `communities`, `profile_communities`, `devices`, `ums_transactions`, `personas`, `messages`, `metadata_types`, `metadata_values`, `segments`, `modules`, `skills`, `persona_skills`, `whitepaper_artifacts`, `invites_dev`, `clients_dev`, `user_agents`, `user_origin_providers`, `appsofia_downloader_queue`, `message_types`, `task_statuses`, `task_priorities`, `tasks`, `Artifacts`, `task_titles`, `task_blocks`, `task_history`, `workspace_configs`, `appsofia_artifacts`.

## Ações feitas

- Acesso autorizado ao projeto e inspeção somente de leitura.
- Nenhum `INSERT`, `UPDATE`, `DELETE`, migration ou alteração de política RLS foi executado.
- Correção do painel publicada na branch [`fix/dynamic-task-status-lookups`](https://github.com/meshwave65/SofiaControlPanel/tree/fix/dynamic-task-status-lookups), commit `f9aeea6`; typecheck, cinco testes e build passaram.


## Storage e artefatos gerados

O bucket existente `sofia_storage_user` continua **público** e reservado à BCE. Não listei seus objetos nem li seu conteúdo. Para o ControlPanel, foi criado o bucket separado `sofia-controlpanel-artifacts`, configurado como **privado**, com limite de 20 MiB por arquivo e tipos permitidos para Markdown, texto, PDF, JSON, CSV, DOCX e imagens PNG/JPEG/WebP.

Uma cópia deste relatório de estado também foi enviada para `system/SUPABASE-SCHEMA-MAP.md` nesse bucket.

Na branch de trabalho, o ControlPanel grava cada relatório consolidado em `tasks/<task_id>/consolidated-report.md`, usando overwrite para manter a versão mais recente. O arquivo é lido novamente do Storage na tela da tarefa; o download usa URL assinada com validade de 15 minutos. Esse fluxo não grava arquivos em disco local e não exige migration de banco. O acesso ao relatório é validado no servidor para o dono da tarefa ou para um administrador. A implementação só estará ativa na aplicação publicada após o deploy da branch e a configuração das variáveis server-side.

O engine do repositório `meshwave65/sofia` ainda grava os artefatos próprios em diretórios locais; essa integração foi mantida fora do escopo do bucket do ControlPanel. Para habilitar uploads no serviço de produção, configure no ambiente **server-side** do ControlPanel `SUPABASE_URL` e uma chave secreta em `SUPABASE_SECRET_KEY` (preferível), `SUPABASE_SERVICE_ROLE_KEY` ou `SUPABASE_KEY`. Nunca coloque a chave no frontend, no Git ou em arquivos `.env` versionados. O backend remove automaticamente o sufixo `/rest/v1` caso a URL venha nesse formato.
