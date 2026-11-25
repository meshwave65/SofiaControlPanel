# INVENTORY — MISSION_0033
**Snapshot:** 2026-11-25  
**Origem:** Supabase MeshWave65 `ufylccbdjfzydbwhpmpp`  
**Destino:** Supabase Sandbox `detstgxofjnnggxluqtl`  
**Natureza:** inventário estrutural; nenhuma linha de dados operacionais foi extraída para este documento.

## 1. Resumo quantitativo

| Objeto | Quantidade |
|---|---:|
| Schemas não sistêmicos identificados | 14 |
| Schemas com tabelas | 10 |
| Tabelas | 138 |
| Views | 4 |
| Funções | 188 |
| Eventos de trigger | 36 |
| Policies RLS | 80 |
| Constraints | 536 |
| Índices | 397 |
| Tipos ENUM | 14 |
| Labels ENUM | 56 |

Os números abrangem também schemas gerenciados pelo Supabase. Não representam o escopo que será replicado no Sandbox.

## 2. Distribuição por schema

| Schema | Tabelas | Views | Funções | Policies |
|---|---:|---:|---:|---:|
| auth | 27 | 0 | 4 | 0 |
| drizzle | 1 | 0 | 0 | 0 |
| extensions | 0 | 2 | 55 | 0 |
| graphql | 0 | 0 | 0 | 0 |
| graphql_public | 0 | 0 | 1 | 0 |
| net | 2 | 0 | 12 | 0 |
| private | 0 | 0 | 1 | 0 |
| public | 66 | 0 | 55 | 51 |
| realtime | 3 | 0 | 19 | 0 |
| sofia | 25 | 1 | 11 | 22 |
| storage | 10 | 0 | 24 | 7 |
| supabase_functions | 2 | 0 | 1 | 0 |
| supabase_migrations | 1 | 0 | 0 | 0 |
| vault | 1 | 1 | 5 | 0 |

## 3. Inventário de tabelas

### auth — 27 tabelas
`audit_log_entries`, `custom_oauth_providers`, `flow_state`, `identities`, `instances`, `mfa_amr_claims`, `mfa_challenges`, `mfa_factors`, `mfa_recovery_code_sets`, `mfa_recovery_codes`, `oauth_authorizations`, `oauth_client_states`, `oauth_clients`, `oauth_consents`, `one_time_tokens`, `refresh_tokens`, `saml_providers`, `saml_relay_states`, `schema_migrations`, `scim_tokens`, `scim_users`, `sessions`, `sso_domains`, `sso_providers`, `users`, `webauthn_challenges`, `webauthn_credentials`.

### drizzle — 1 tabela
`__drizzle_migrations`.

### net — 2 tabelas
`_http_response`, `http_request_queue`.

### public — 66 tabelas
`Artifacts`, `appsofia_artifacts`, `appsofia_downloader_queue`, `appsofia_tasks`, `clients`, `clients_dev`, `communities`, `devices`, `invites_dev`, `message_types`, `messages`, `metadata_types`, `metadata_values`, `modules`, `mw_account_ledger`, `mw_blocks`, `mw_chain_metadata`, `mw_state_snapshots`, `mw_transactions`, `mw_wallets`, `mwc_acquisition_events`, `mwc_acquisitions`, `mwc_meshwalker_profiles`, `mwc_operation_types`, `mwc_sale_admins`, `mwc_sale_prices`, `mwc_storage_objects`, `mwc_wallet_ledger`, `mwex_asset_status_history`, `mwex_assets`, `mwex_business_configs`, `mwex_fiat_accounts`, `mwex_fiat_acquisitions`, `mwex_fiat_audit_log`, `mwex_fiat_ledger_entries`, `mwex_fiat_payment_events`, `mwex_ledger_entries`, `mwex_order_fills`, `mwex_order_reservations`, `mwex_order_status_history`, `mwex_orders`, `mwex_transactions`, `mwex_wallets`, `persona_skills`, `personas`, `profile_communities`, `profiles`, `sco_task_blocks`, `sco_task_history`, `sco_task_priorities`, `sco_task_statuses`, `sco_task_titles`, `sco_tasks`, `segments`, `skills`, `task_blocks`, `task_history`, `task_priorities`, `task_statuses`, `task_titles`, `tasks`, `ums_transactions`, `user_agents`, `user_origin_providers`, `whitepaper_artifacts`, `workspace_configs`.

### realtime — 3 tabelas
`messages`, `schema_migrations`, `subscription`.

### sofia — 25 tabelas
`activityEventTypes`, `activityLogs`, `agents`, `arcAccessEvents`, `arcAssessments`, `arcConfidenceSnapshots`, `arcDeviceProfiles`, `arcEvidence`, `arcPolicies`, `contextReports`, `governanceMissions`, `messageTypes`, `messages`, `missionActionUnitGateEvidence`, `missionActionUnits`, `missionDocumentTypes`, `missionDocumentVersions`, `missionDocuments`, `missionParameterOptions`, `missionParameters`, `scheduledTasks`, `taskPriorities`, `taskStatuses`, `tasks`, `users`.

### storage — 10 tabelas
`bucket_lifecycle_states`, `buckets`, `buckets_analytics`, `buckets_vectors`, `lifecycle_abandoned_artifacts`, `migrations`, `objects`, `s3_multipart_uploads`, `s3_multipart_uploads_parts`, `vector_indexes`.

### supabase_functions — 2 tabelas
`hooks`, `migrations`.

### supabase_migrations — 1 tabela
`schema_migrations`.

### vault — 1 tabela
`secrets`.

## 4. Schemas sem tabelas

- `extensions`: 2 views e 55 funções; inclui extensões e funções gerenciadas.
- `graphql`: sem tabelas/views/funções catalogadas no levantamento.
- `graphql_public`: 1 função.
- `private`: 1 função.

## 5. Núcleo SCP — schema sofia

- 25 tabelas; todas com RLS habilitado.
- 22 policies.
- 11 funções.
- 12 eventos de trigger.
- 1 view: `sofia.agent_catalog_public`.

A view `sofia.agent_catalog_public` usa `security_invoker=true` e projeta somente `id`, `name`, `description`, `status`, `version`, `connectionStatus`, `lastHeartbeat`, `createdAt` e `updatedAt`. Não projeta `manusAccount`, `manusPassword` nem `manusToken`. É um candidato relevante para o catálogo do Sandbox, mas a política RLS de `sofia.agents` restringe leitura a owner/admin; o modo seguro de disponibilização ainda precisa ser validado.

## 6. Segurança RLS — schema public

A consulta direta a `pg_tables` + `pg_class.relrowsecurity` identificou **28 tabelas de public sem RLS habilitado**:

`Artifacts`, `appsofia_artifacts`, `appsofia_downloader_queue`, `clients_dev`, `communities`, `devices`, `invites_dev`, `message_types`, `messages`, `metadata_types`, `metadata_values`, `modules`, `mwex_business_configs`, `persona_skills`, `personas`, `profile_communities`, `profiles`, `segments`, `skills`, `task_blocks`, `task_history`, `task_priorities`, `task_statuses`, `task_titles`, `tasks`, `ums_transactions`, `user_origin_providers`, `whitepaper_artifacts`.

**Correção do levantamento preliminar:** o número inicial de 30 foi uma estimativa baseada no advisory. A contagem direta por catálogo PostgreSQL retornou 28 tabelas em `public` com RLS desabilitado. A diferença fica registrada para conciliação com os advisors.

## 7. Extensões instaladas

| Extensão | Versão | Schema |
|---|---|---|
| pg_net | 0.19.5 | extensions |
| pg_stat_statements | 1.11 | extensions |
| pgcrypto | 1.3 | extensions |
| plpgsql | 1.0 | pg_catalog |
| supabase_vault | 0.3.1 | vault |
| uuid-ossp | 1.1 | extensions |

## 8. Views identificadas

- `extensions.pg_stat_statements`
- `extensions.pg_stat_statements_info`
- `sofia.agent_catalog_public`
- `vault.decrypted_secrets`

A view `vault.decrypted_secrets` e o schema `vault` são sensíveis e não devem ser espelhados como objetos de aplicação.

## 9. Classificação preliminar — ainda não é decisão final de escopo

| Grupo | Tratamento inicial |
|---|---|
| `sofia` | candidato principal à réplica estrutural; revisar cada função/policy e dependências |
| `public.appsofia_*` | investigar relação com SWE e necessidade no Sandbox |
| `public.sco_*` | investigar origem e dependência; não assumir equivalência com `sofia.tasks` |
| `public.mw_*`, `mwc_*`, `mwex_*) | provável escopo de produtos MeshWave/financeiro; excluir do espelhamento SCP salvo dependência comprovada |
| tabelas legadas genéricas em `public` | investigar origem/uso antes de incluir |
| `auth`, `storage`, `realtime`, `vault`, `drizzle`, `supabase_*` | serviços gerenciados; não copiar indiscriminadamente |

## 10. Limitações e próximos levantamentos

Este snapshot ainda não contém DDL completo de cada objeto, definições de todas as 188 funções, conteúdo de todas as policies, dependências cruzadas, grants por role, ownership, regras de Storage, buckets e parâmetros do projeto. Esses itens permanecem no WP33.1 e devem ser extraídos em lotes, revisados e classificados antes de gerar migrations.

Nenhuma linha de dados operacionais foi copiada. Nenhuma alteração foi realizada na origem ou no Sandbox.
