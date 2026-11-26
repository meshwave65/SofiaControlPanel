# MIGRATION-STRATEGY — MISSION_0033

## Decisão de arquitetura

**Não criar um segundo provedor de identidade e não copiar usuários entre projetos.** O código atual do SCP já usa Supabase Auth central e valida o Bearer token no servidor com `auth.getUser(accessToken)`. O banco da aplicação é independente e acessado por `DATABASE_URL`; a aplicação cria apenas uma projeção local em `sofia.users`, identificada pelo UUID central em `openId`.

Essa separação permite:

- Auth central MeshWave65: `ufylccbdjfzydbwhpmpp`.
- Banco Sandbox: `detstgxofjnnggxluqtl`, `DATABASE_URL` próprio.
- Storage Sandbox: `SUPABASE_STORAGE_URL` próprio e chave secreta server-side.
- Frontend de ambos os ambientes: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apontam para o Auth central.
- Backend: `SUPABASE_AUTH_URL` e `SUPABASE_AUTH_ANON_KEY` apontam para o Auth central; `DATABASE_URL` e `SUPABASE_STORAGE_URL` apontam para o ambiente de execução.

O código atual mistura URL de Auth e Storage na variável `SUPABASE_URL`; a implementação deve separar explicitamente essas configurações, preservando fallback para o ambiente legado SCP.

## Contrato de identidade central

Claims confiáveis devem estar em `auth.users.raw_app_meta_data` (Supabase `app_metadata`), nunca em `user_metadata` editável pelo próprio usuário.

- `meshwave_user_type`: `sandbox` | `normal_user` | `admin`.
- `meshwave_environments`: array contendo `scp` e/ou `sandbox`.
- `meshwave_permissions`: opcional; permissões granulares por operação.

Política:
- `sandbox`: somente Sandbox; sempre negado no SCP.
- `normal_user`: acesso ao SCP e Sandbox apenas quando cada ambiente estiver na lista.
- `admin`: privilégios administrativos conforme permissões explícitas e ambientes autorizados.
- Identidades legadas sem classificação continuam aceitas apenas no SCP durante a transição; são negadas no Sandbox.
- Em Sandbox, negar também o caminho legado de cookie Manus; exigir token Supabase central.
- No Sandbox, não conceder admin por email nem por OWNER_OPEN_ID local. O papel admin deriva exclusivamente da classificação central confiável.

## Estado real dos claims (origem, consulta somente leitura)

No projeto Auth central existem 83 usuários. As únicas chaves de `app_metadata` observadas são `provider` e `providers`; nenhum dos 83 tem `meshwave_user_type` nem `meshwave_environments`.

Consequência: o código pode ser preparado com negação segura, mas nenhum usuário será autorizado a entrar no Sandbox até que a identidade central receba classificação/escopo por mecanismo administrativo confiável. Não modificar claims de pessoas nesta missão sem atribuição de identidade confirmada.

## Migrações estruturais

- O repositório tem migrations Drizzle 0000–0016, mas elas criam apenas 22 das 25 tabelas do schema `sofia`.
- As três tabelas ausentes do conjunto de migrations são `governanceMissions`, `missionParameters` e `missionParameterOptions`.
- Há divergências conhecidas entre migration e schema ativo: `messageTypes` e `messages` têm colunas adicionais na origem; `tasks` tem campos adicionais; a migration 0016 contém UPDATEs de dados reais e não pode ser aplicada literalmente.
- A migration 0003 configura dispatch externo via Vault/pg_net e não deve ser copiada sem adaptação, pois pode enviar missões Sandbox ao backend operacional.
- As migrations 0010–0013 criam documentos, planos de ação e gates; o seed de tipos documentais é catálogo estrutural e pode ser aplicado, mas não copiar documentos ou tarefas.
- O baseline será reconstruído por DDL observado na origem, não por execução cega de todos os arquivos Drizzle.
- RLS no Sandbox será server-only/deny-by-default inicialmente. O backend com `DATABASE_URL` de servidor faz a autorização; papéis client-side não terão acesso direto ao schema `sandbox`.

## Estratégia de aplicação

1. Extrair DDL completo das 25 tabelas e seus objetos em lotes; reconciliar com Drizzle e catálogo ativo.
2. Construir uma migration inicial independente, idempotente e versionada, com tipos/tabelas/constraints/índices.
3. Adaptar funções e triggers; excluir dispatch para endpoint de produção.
4. Adicionar `session_id` aos recursos efêmeros e separar catálogo de instâncias de agentes.
5. Criar sessões, TTL de 24h, expurgo transacional de banco e limpeza de Storage por prefixo.
6. Habilitar RLS e grants deny-by-default; não usar políticas `auth.uid()` porque o token é validado no backend e a conexão SQL é server-side.
7. Validar diff estrutural, claims, acesso negado/permitido, expurgo, Storage e não-vazamento.
8. Aplicar apenas no projeto `detstgxofjnnggxluqtl`; não escrever na origem.

## Rollback

- Cada migration é separada por etapa.
- Antes de alterar, registrar snapshot de schema do Sandbox (inicialmente vazio).
- Em falha, interromper a etapa, preservar evidência e reverter somente objetos criados pela migration.
- Não apagar/recriar o projeto inteiro.
