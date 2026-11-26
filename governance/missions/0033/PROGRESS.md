# MISSION_0033 — Progresso

## 2026-11-25 — Abertura e inventário inicial
- Missão de sistema criada e autorizada para execução autônoma.
- Origem confirmada: MeshWave65 Supabase `ufylccbdjfzydbwhpmpp`, schema `sofia`.
- Destino correto confirmado: projeto Supabase `sandbox`, ref `detstgxofjnnggxluqtl`, conexão Primary, região us-west-2.
- Correção crítica: `rqvjsjfypuojuaetxkig` é outro projeto (“meshwave65's Project”) e não deve ser tratado como Sandbox. Consultas anteriores nele não representam o estado do destino desta missão.
- `list_tables` no destino correto, schemas sandbox e public, retornou zero tabelas. Nenhuma alteração de schema ou dado foi realizada.
- Inventário de origem: schema sofia com 25 tabelas, 1 view, RLS nas 25 tabelas, 22 policies, 11 funções e 12 eventos de trigger. DDL completo e dependências ainda em extração/revisão.
- Identificada `sofia.agent_catalog_public` como candidata de catálogo seguro; seu acesso precisa ser validado.
- Publicados SCOPE-MATRIX.md e SANDBOX-SESSION-LIFECYCLE.md.
- Publicado BLUEPRINT-v1.1.0.md com identidade central, matriz de ambientes, distinção catálogo/instância, TTL de 24h e expurgo.
- README corrigido com o projeto de destino real.
- OR-20261125-0002 publicado e indexado. Nenhuma migration, cópia ou exclusão executada.
- Pesquisa oficial Supabase identificou OAuth 2.1/OIDC server e custom OIDC providers como possível base de federação; configuração real ainda não feita.

## Requisitos arquiteturais incorporados
- Usuário sandbox-only não acessa SCP.
- Usuário normal acessa SCP e pode acessar Sandbox se autorizado.
- Identidade canônica central; não copiar auth.users nem confiar em email como chave de autorização.
- Agentes instanciados no Sandbox pertencem à sessão e são efêmeros; catálogo de metadados pode ser sincronizado SCP→Sandbox sem segredos.
- Encerramento manual ou expiração automática dispara expurgo de agentes, missões, tarefas, mensagens, documentos, versões, logs, relatórios e arquivos da sessão.
- TTL padrão: 24 horas, política central pode reduzir e não pode ampliar o máximo.
- Identidade, permissões, catálogo, templates e configurações compartilhadas ficam fora do expurgo.
- Objetivo de automação sistêmica: missões criadas pelo SCP executam sem confirmações intermediárias após os gates documentais; em missão futura com owner humano, a única intervenção de painel será aprovar o TR, exceto gates explícitos de segurança/ação externa.

## Estado atual
- WP33.1: PROGRESS.
- WP33.2: primeira matriz publicada; revisão final depende das tarefas filhas e DDL.
- WP33.3: PROGRESS; pesquisa OIDC e estratégia de migração em andamento.
- WP33.4–33.6: aguardam DDL completo e estratégia.
- WP33.7: arquitetura de sessão publicada; federação e expurgo ainda não implementados.
- WP33.8–33.9: pendentes.
- Nenhuma migration aplicada. Nenhum dado operacional copiado. Origem inalterada.


## 2026-11-26 — Hardening e teste de ciclo de vida
- Revalidado o destino canônico nos documentos: projeto `detstgxofjnnggxluqtl`, conexão Primary. Projeto `rqvjsjfypuojuaetxkig` permanece fora do escopo e não foi alterado nesta etapa.
- Estado real do Sandbox: 25 tabelas do núcleo + `sandbox.sessions`; RLS habilitado nas 26 tabelas; zero policies; 19 agentes `SCP_CATALOG` preservados; zero usuários projetados e zero dados operacionais em tarefas/missões/documentos.
- Edge Functions `sandbox-session-purge` e `sandbox-session-storage` ativas; bucket privado `sandbox-session-artifacts`; cron de manutenção a cada minuto.
- Aplicada migration `mission_0033_revoke_public_sandbox_function_execute`; removido EXECUTE de PUBLIC das funções no schema sandbox e ajustados default privileges. ACL verificada; grants de `sandbox_app` preservados.
- Testes sintéticos aprovados: encerramento manual (HTTP 200, PURGED) e expiração TTL (PURGED, motivo TTL). Usuários sintéticos removidos; sessões de teste anonimizadas mantidas para auditoria; catálogo de 19 agentes preservado.
- OR-20261126-0001 publicado em GitHub e persistido no Supabase como novo documento/versionamento; `artifactCount=8`.
- Limitações: onboarding central para `sandbox.users` e criação de sessão no backend/UI ainda não implementados; RLS sem policies mantém API fail-closed; teste real de upload/expurgo Storage pendente; diff DDL integral pendente.


## 2026-11-26 — Auditoria de identidade central
- Revisado `server/_core/context.ts` e `server/db.ts`: o SCP valida Bearer tokens com Supabase Auth central e mapeia UUID Auth para `openId` na base operacional; autorização atual de admin ainda usa lista de emails/ownerOpenId e não aplica os claims de ambiente propostos.
- Auditoria agregada de `auth.users`: 83 identidades centrais; nenhuma contém `meshwave_user_type` ou `meshwave_environments` em `raw_app_meta_data`.
- Sandbox `sandbox.users` permanece vazio. A Edge Function de Storage exige os claims confiáveis em `app_metadata`, portanto nenhum acesso experimental foi liberado.
- Nenhum usuário central foi modificado/classificado por inferência. Deny-by-default preservado.
- OR-20261126-0002 publicado no GitHub e persistido no Supabase; artifactCount atualizado.
- Bloqueio funcional identificado: falta integrar no backend SCP o provisionamento mínimo de identidade, sessão e autorização por ambiente. A próxima implementação deve validar claims centrais, projetar usuário, abrir/recuperar sessão e fechar sessão autenticadamente.


## 2026-11-26 — Integração backend/UI e isolamento por sessão
- Criada a integração de identidade do serviço Sandbox com o Auth central `ufylccbdjfzydbwhpmpp`: validação exclusiva por URL/chave centrais e leitura de claims confiáveis em `app_metadata`.
- Contrato de acesso aplicado no middleware global do Sandbox: `sandbox` permite somente Sandbox; `normal_user/admin` precisam de `meshwave_environments` contendo `sandbox`. Todas as rotas protegidas, inclusive administrativas, exigem sessão ativa.
- O backend projeta identidade mínima em `sandbox.users` e abre/recupera sessão via `sandbox.ensure_active_session`.
- Listagem agora inclui os 19 agentes `SCP_CATALOG` sem `ownerId`; catálogo é somente leitura. Agentes novos são `SANDBOX_SESSION` e recebem owner + sessão.
- Consultas legadas com schema `sofia` no repositório Sandbox foram corrigidas para `sandbox`. Leituras de tarefas, mensagens, logs e missões nas rotas protegidas foram escopadas à sessão.
- Triggers `sandbox.assign_active_session_scope` instalados em 16 tabelas efêmeras; derivam a sessão do usuário ou do registro-pai, bloqueiam gravações sem sessão ativa e impedem transferência de propriedade da sessão.
- Logout solicita fechamento autenticado da sessão; cron mantém expurgo de TTL. Rotas públicas de dispatch, heartbeat e escrita de logs externos foram bloqueadas.
- Render: builds anteriores concluídos; último deploy com fail-fast de DB estava em processamento na atualização deste relatório.
- Teste transacional sintético de atribuição de sessão em tasks/messages/activityLogs/contextReports passou sem erro e foi revertido; não deixou fixtures. Testes anteriores de fechamento manual/TTL permanecem aprovados.
- Bloqueios: nenhuma das 83 identidades centrais auditadas tem claims de ambiente; nenhuma conta foi classificada. Teste ponta a ponta com usuário real e fixture Storage ainda pendentes. A missão continua PROGRESS.
- OR-20261126-0003 publicado no GitHub; persistência Supabase correspondente em andamento.


## 2026-11-26 — Auditoria estrutural completa e bloqueio de conexão Render
- DDL origem `ufylccbdjfzydbwhpmpp.sofia` vs destino `detstgxofjnnggxluqtl.sandbox` comparado por catálogos PostgreSQL.
- Paridade: 25/25 tabelas e 272/272 colunas de origem; destino acrescenta `sessions` e 36 campos de sessão/origem. 109 constraints e 88 índices de origem preservados; destino adiciona 25 constraints e 22 índices de sessão. Enums 6/6 idênticos; 25 sequências e ownership preservados.
- Diferenças intencionais documentadas: RLS 26/26 sem policies no destino (backend-only); triggers de dispatch externo ausentes; funções de purge ajustadas; view `agent_catalog_public` filtrada; `agents.ownerId` nullable para catálogo.
- Catálogo: 19/19 mapeados por `sourceAgentId`, campos operacionais coincidentes, descrições de conta/email sanitizadas e nenhuma credencial copiada (0 account/password/token no Sandbox).
- Incidente crítico: Render `srv-dc1itplg1s2s73dgk9i0` estava conectado ao projectRef `rqvjsjfypuojuaetxkig` via pooler `aws-1-us-east-1.pooler.supabase.com`, não ao destino canônico. O script antigo executou verificações/DDL idempotentes e migrations 0008/0015 nesse endpoint; logs não permitem dizer quais alterações eram novas. Nenhum dado de negócio ou catálogo foi copiado para esse projeto.
- Correção: backend exige `SANDBOX_DATABASE_URL`, valida projectRef `detstgxofjnnggxluqtl`; startup script agora é somente leitura e valida 26 tabelas, 19 agentes, RLS, policies e triggers. Não há mais fallback para `DATABASE_URL` nem DDL no startup.
- O destino possui role `sandbox_app` com LOGIN/BYPASSRLS e grants de aplicação. Render ainda não tem connection string válida para esse role/projeto; deploy está falhando fechado até configurar a variável. A versão antiga live ainda aponta ao projeto errado, mas sem claims as rotas protegidas negam acesso.
- OR-20261126-0004 e DDL-STRUCTURAL-AUDIT-20261126.md persistidos no GitHub; persistência Supabase correspondente em andamento. MISSION_0033 permanece PROGRESS.


## 2026-11-26 — Storage integrado ao ciclo de sessão
- O backend deixou de gravar relatórios no bucket legado `sofia-controlpanel-artifacts` em caminho sem sessão.
- `server/controlPanelStorage.ts` agora chama a Edge Function `sandbox-session-storage` com Bearer central, `sessionId` e `taskId`. Upload/download/delete usam o bucket `sandbox-session-artifacts` e prefixo UUID que o expurgo remove.
- As rotas de consolidação, leitura de relatório e geração do FOR propagam token e sessão validados pelo middleware.
- `SUPABASE_URL` do Render foi apontada ao projeto canônico `detstgxofjnnggxluqtl`; `VITE_SUPABASE_URL` permanece no Auth central.
- O startup `ensure-database.mjs` é somente leitura e exige `SANDBOX_DATABASE_URL` com projectRef canônico. O Render ainda não tem essa variável, então o deploy falha fechado. Não foi usada a URL antiga do projeto `rqvjsjfypuojuaetxkig`.
- Auditoria read-only de `rqvjsjfypuojuaetxkig` não encontrou agentes, tarefas, mensagens, activityLogs ou contextReports; havia duas projeções de usuários e uma sessão preexistentes. Nenhuma limpeza foi feita nesse projeto.
- OR-20261126-0005 publicado no GitHub. Teste de Storage real e login com usuário autorizado continuam bloqueados pela conexão de banco canônica ausente e pela falta de identidade com claims.


## 2026-11-26 — Storage access contract verified
- Render `SUPABASE_URL` explicitly configured to the Sandbox API project `detstgxofjnnggxluqtl`; central Auth remains isolated in `CENTRAL_AUTH_SUPABASE_URL` and `VITE_SUPABASE_URL`.
- `server/controlPanelStorage.ts` already routes consolidated reports through `sandbox-session-storage` with central Bearer token + session ID.
- Edge Function reviewed: it validates central `app_metadata`, verifies the session via `public.verify_sandbox_session_access`, writes only under `{sessionId}/tasks/{taskId}/consolidated-report.md`, and returns a private signed URL.
- A rollback-only synthetic SQL test confirmed the matching identity/session is accepted and a different identity is rejected. Bucket `sandbox-session-artifacts` confirmed private. Purge Edge Function recursively removes every object under the session prefix before finalizing DB purge.
- Real upload/download/delete fixture remains pending until a real authorized central identity and the Render-to-canonical-database connection are available. No Storage objects were created by this test.


## 2026-11-26 — Minimização de identidade e separação de credenciais
- Identidades centrais sem autorização Sandbox não são mais projetadas em `sandbox.users`: recebem somente representação transitória em memória para a tela de acesso negado, sem sessão ou persistência.
- `auth.me` informa `sandboxAccess`; a UI apresenta explicitamente acesso não autorizado e permite logout.
- `drizzle.config.ts` exige `SANDBOX_MIGRATION_DATABASE_URL` separado; `SANDBOX_DATABASE_URL` fica reservado à credencial runtime de `sandbox_app`.
- Supabase Vault contém `sandbox_app_db_password` provisionado para Render; segredo não foi exposto nem versionado.
- Falta o hostname exato do Session Pooler do projeto `detstgxofjnnggxluqtl` para montar a URL runtime. O deploy permanece fail-closed enquanto `SANDBOX_DATABASE_URL` estiver ausente.
- OR-20261126-0006 publicado no GitHub e persistido no Supabase. Nenhuma identidade central recebeu claims.
