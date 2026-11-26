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
