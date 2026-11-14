# MISSION_0021 — Progresso e ponto de continuidade

**Estado da missão:** PROGRESS  
**Última atualização:** 2026-11-14  
**Repositório de produto:** `meshwave65/newsite`  
**Governança:** `meshwave65/SofiaControlPanel`

## Objetivo persistente

Concluir uma MW-Ex proprietária, privada e funcional, com segregação contábil UMS/MWN, controles de acesso MeshWalker, experiência de carteira/exchange e fluxos operacionais auditáveis. O BLUEPRINT.md permanece a fonte de escopo e gates; este arquivo registra apenas o estado corrente de continuidade.

## Estado confirmado em 2026-11-14

### Produção

- A PR #29 foi integrada; a produção está no commit `58eae07f128f4d84ca4929adfcdb314ce0a45aa6`.
- O ticket de compra/venda permanece disponível.
- O seletor de ativo-alvo lê a elegibilidade em `mwex_assets`; somente MWN está habilitada para compra/venda neste momento. BTC e ETH permanecem como referências, não ativos negociáveis.
- OR: [OR-20261114-0003](../../operational_reports/OR-20261114-0003.md).
- Nenhuma movimentação financeira foi realizada na fase de restauração do seletor.

### PR #30 — busca de destinatário e largura do histórico

- PR: https://github.com/meshwave65/newsite/pull/30
- Branch: `feat/mwex-recipient-lookup-activity-layout`
- Base: `main` em `58eae07f128f4d84ca4929adfcdb314ce0a45aa6`
- Head atual: `354b12c0d488ac4fd1be7a5e3585bf702a6c638a`
- Estado: OPEN, mergeable; não integrada.
- Preview Vercel: READY — deployment `dpl_2qWNmSKFn99UUY3QBRSWzSZTonAg`, URL https://newsite-jn001fb8a-meshwaves-projects.vercel.app
- Build: Vite concluído em 3,58 s. Warning não bloqueante de bundle JS principal de 737,02 kB.
- Arquivos: `src/pages/MwEx.jsx`, `src/pages/MwEx.css`, `supabase/migrations/20261114130000_mwex_search_transfer_recipients.sql`.

#### Regras de destinatário persistidas

1. Busca por nome/username pode apresentar sugestões com nome e username.
2. Busca por CPF/NIF só consulta documento completo: CPF com 11 dígitos ou NIF com 9 dígitos. Entrada numérica parcial não dispara pesquisa nem sugestões.
3. A consulta fiscal exata retorna somente status genérico FOUND, NOT_FOUND ou AMBIGUOUS. Em match único, o identificador é mantido internamente para a RPC; a interface não mostra nome, username ou fragmentos do documento.
4. Correspondência fiscal ambígua não escolhe destinatário arbitrariamente.
5. UUID integral permanece apenas no estado interno usado pela RPC `mwex_transfer_mwn`; interface mostra UUID mascarada.
6. Usuário que já conhece a UUID pode colá-la diretamente; após a colagem, a UI também exibe somente a versão mascarada.
7. UUIDs em registros/atividade também são mascaradas.
8. O card “Atividade da conta” ocupa toda a largura disponível em desktop.

#### Gates ainda abertos

- Migration da busca não aplicada ao Supabase.
- Teste autenticado da RPC e teste de ponta a ponta com contas de teste pendentes.
- Teste da migration em banco isolado pendente.
- Validação visual autenticada desktop/mobile pendente; o build READY não constitui QA visual.
- Lint e testes automatizados não foram confirmados nesta fase.
- Nenhum merge ou deploy de produção autorizado/executado para PR #30.

### Gate crítico de dados pessoais — Supabase canônico

Inspeção read-only anterior identificou `public.profiles` com RLS desabilitado e grants amplos de SELECT/INSERT/UPDATE/DELETE para `anon` e `authenticated`. A tabela contém dados pessoais, inclusive CPF/NIF. Esse problema é preexistente e independente da RPC nova.

- Nenhuma correção de RLS foi aplicada.
- Nenhuma migration de RLS foi autorizada nesta continuidade.
- PR #30 não deve ser integrada/publicada antes de tratar esse gate com desenho mínimo de policies, preservando os fluxos legítimos de cadastro e leitura.
- Não desligar grants nem aplicar policies por inferência; primeiro auditar dependências e testar.

## Missão complementar MISSION_0023

MISSION_0023 permanece PROGRESS e mantém seu próprio escopo de integridade operacional e segregação UMS/MWN. O quadro persistido de tarefas 23.2–23.5 continua PROGRESS; 23.6 permanece STAGED — GATE HUMANO. Esta atualização não altera os estados nem autoriza rollout da MISSION_0023.

## Próxima sequência de trabalho

1. Concluir revisão técnica da PR #30 e checks do Preview.
2. Preparar e executar testes isolados/autenticados sem transações financeiras reais.
3. Resolver o gate de exposição de `profiles` por uma fase específica, após autorização explícita para alterações de banco.
4. Reavaliar integração da PR #30 somente depois dos gates de segurança e testes.
5. Manter merge, migration em produção e deploy de produção como ações separadas e dependentes de autorização explícita.

## Referências

- [BLUEPRINT.md](./BLUEPRINT.md)
- [Especificação de UI 21.4](./MWEX_UI_PRODUCT_SPEC_21_4.md)
- [Inventário de estado 21.1](./MWEX_STATE_INVENTORY_21_1.md)
- [OR-20261114-0002](../../operational_reports/OR-20261114-0002.md)
- [OR-20261114-0003](../../operational_reports/OR-20261114-0003.md)
- [OR-20261114-0004](../../operational_reports/OR-20261114-0004.md)
- [OR-20261114-0005](../../operational_reports/OR-20261114-0005.md)


## Segurança de perfis e preparação do rollout — 2026-11-14

### PR #31 — RLS e cadastro controlado
- PR draft: https://github.com/meshwave65/newsite/pull/31
- Branch: `fix/profiles-rls-safe-onboarding`
- Head: `c9f0c3c7c6e46ed0b225c4ff71a6b59720323649`
- Migration proposta: `20261114150000_secure_profiles_rls_and_signup.sql`.
- Escopo: RLS owner-only em `profiles`, sem INSERT/DELETE direto pelo cliente; criação via trigger em `auth.users`; RPC administrativa retorna somente IDs e nomes; signup e painéis atualizados.
- Migration não aplicada; PR draft, sem merge ou deploy de produção.
- Preview do head atual `c9f0c3c` READY — deployment `dpl_Des6nhYyc63afWjyeYyCdUG9iFmr`; acesso público à rota `/mw-ex` redireciona para Vercel Login/SSO, então QA visual autenticado permanece pendente.
- Lint exploratório identificou 6 erros preexistentes e 2 warnings; a tentativa de tornar lint bloqueante foi revertida para não ampliar o escopo. Lint não validado.

### Dados existentes e dependências
- `auth.users` contém 77 contas; 40 não possuem linha correspondente em `public.profiles`.
- Entre as 40, 4 são MeshWalkers elegíveis e 3 têm aquisições. A migration não faz backfill dessas contas.
- PR #30 foi corrigida para pesquisar a partir de `mwc_meshwalker_profiles` e usar LEFT JOIN de `profiles`, preservando a busca desses elegíveis sem linha de perfil.
- PR #30: https://github.com/meshwave65/newsite/pull/30 — head `483bafc8038ba1304eabcb17b7e3152c3504cb39`; Preview READY em https://newsite-hoy4u3lz8-meshwaves-projects.vercel.app. Nenhuma migration aplicada.

### Gate adicional — `public.clients`
- RLS habilitado, mas políticas permitem SELECT aberto para `anon` e `authenticated`, INSERT aberto para ambos e UPDATE aberto para `authenticated`.
- Grants diretos incluem TRUNCATE para `anon` e `authenticated`.
- Colunas incluem nome, e-mail, telefone, UUIDs e invite_code.
- Não foram encontrados views, triggers ou funções públicas dependentes. O repositório consulta o registro próprio e usa nomes nos painéis administrativos.
- Não alterar ainda: auditar consumidores externos antes de revogar grants/policies. Este é gate separado para aprovação de segurança global.

### QA e rollout
- Não foi criada branch de banco Supabase: a ferramenta exigiu confirmação de custo. Nenhuma cobrança ocorreu.
- Necessário obter autorização para consultar o custo e criar branch de QA na organização `remwpkmiaavakbgcftob`.
- Testes RLS anon/owner/admin, signup com e sem confirmação de e-mail, indicação, migration isolada e QA visual autenticado permanecem pendentes.
- PR #30 e PR #31 não devem ser integradas/publicadas antes desses gates. Migration em produção, merge e deploy continuam ações separadas.

## Reavaliação read-only no banco de produção — 2026-11-14

- O proprietário decidiu não criar branch Supabase de QA; consultas e validações serão conduzidas no projeto canônico, de forma controlada. Nenhuma branch foi criada e nenhum custo foi incorrido.
- OR: [OR-20261114-0008](../../operational_reports/OR-20261114-0008.md).
- Rechecagem confirmou `public.profiles` com RLS desabilitado e grants amplos para `anon`/`authenticated`, incluindo TRUNCATE.
- `public.clients` mantém RLS habilitado, porém policies abertas de SELECT para anon/authenticated, INSERT para ambos e UPDATE para authenticated; grants incluem TRUNCATE.
- Security Advisors reportam 30 tabelas públicas com RLS desabilitado, 15 tabelas com RLS sem policies, 3 funções com search_path mutável e múltiplas funções SECURITY DEFINER acessíveis por authenticated. A lista requer avaliação por tabela/função; não prova exposição pública de todas elas.
- Nenhuma alteração DDL, grant, policy, dado ou fluxo financeiro foi realizada. PR #30 e PR #31 permanecem abertas; migrations não aplicadas; sem merge/deploy.
- Próxima fase: mapear consumidores e permissões reais de profiles/clients e revisar RPCs privilegiadas relevantes antes de preparar correções pequenas e testáveis diretamente no banco canônico.
