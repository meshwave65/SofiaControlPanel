# MISSION_0021 — Progresso e ponto de continuidade

**Estado da missão:** PROGRESS  
**Última atualização:** 2026-11-14  
**Repositório de produto:** `meshwave65/newsite`  
**Governança:** `meshwave65/SofiaControlPanel`

## Objetivo persistente

Concluir uma MW-Ex proprietária, privada e funcional, com segregação contábil UMS/MWN, controles de acesso MeshWalker, experiência de carteira/exchange e fluxos operacionais auditáveis. O BLUEPRINT.md permanece a fonte de escopo e gates; este arquivo registra apenas o estado corrente de continuidade.

## Estado confirmado em 2026-11-14

### Produção

- A PR #29 foi integrada. O estado atual de produção está no commit `1acc0b7df9db5cfe25de854bd299fc1e1fd41a11`, com PRs #36 e #37 integradas e migration de destinatários sincronizada.
- O ticket de compra/venda permanece disponível.
- O seletor de ativo-alvo lê a elegibilidade em `mwex_assets`; somente MWN está habilitada para compra/venda neste momento. BTC e ETH permanecem como referências, não ativos negociáveis.
- OR: [OR-20261114-0003](../../operational_reports/OR-20261114-0003.md).
- Nenhuma movimentação financeira foi realizada na fase de restauração do seletor.

### Busca de destinatários para transferência MWN — concluída

- PR #36: https://github.com/meshwave65/newsite/pull/36 — MERGED.
- Commit de integração: `e124e479688f4415becde4a4c5034cadae2af286`.
- A PR #30 foi encerrada como rascunho superado; não foi integrada.
- Migration aplicada ao Supabase canônico: `20261114143556_mwex_transfer_recipient_lookup`.
- Arquivo sincronizado com a versão registrada no banco pela PR #38: `supabase/migrations/20261114143556_mwex_transfer_recipient_lookup.sql`.
- PR #38: https://github.com/meshwave65/newsite/pull/38 — MERGED; commit `1acc0b7df9db5cfe25de854bd299fc1e1fd41a11`.
- A busca parte de `mwc_meshwalker_profiles`, inclui fontes mínimas de nome em `profiles`, `clients` e metadados Auth e considera carteiras existentes não ativas.
- Busca por nome/username usa prefixo, mínimo de 3 caracteres e até 8 sugestões.
- Busca fiscal exige CPF completo (11 dígitos) ou NIF completo (9 dígitos), com correspondência exata. Consulta parcial retorna zero linhas.
- A busca fiscal não devolve documento, fragmentos, nome ou username; retorna estado genérico e somente o user_id interno quando existe correspondência única.
- A busca exclui o próprio usuário e contas Auth removidas. Resultados ambíguos não selecionam destinatário.
- O RPC exposto é SECURITY INVOKER; a leitura privilegiada fica em função SECURITY DEFINER no schema não exposto `private`. EXECUTE público/anon foi revogado; authenticated foi autorizado.
- A UI mascara a UUID selecionada e preserva a alternativa de UUID manual.
- A transferência continua usando exclusivamente `mwex_transfer_mwn`, que valida novamente elegibilidade e estado das carteiras. Nenhuma regra de saldo, ledger ou transferência foi modificada.
- Teste controlado com contexto authenticated no banco canônico: CPF/NIF exato retornou FOUND e o user_id esperado; busca por prefixo encontrou o destinatário esperado; consulta fiscal parcial retornou zero linhas; anon não possui EXECUTE.
- Produção: deployment final `dpl_CydYBqVoGy6x1xDY2g9oAg4dRbSP` — READY; URL https://www.meshwave.com.br/mw-ex.
- Nenhuma transferência real foi executada e nenhum saldo/ledger foi movimentado.
- OR: [OR-20261114-0014](../../operational_reports/OR-20261114-0014.md).

### Gate crítico de dados pessoais — Supabase canônico

Inspeção read-only anterior identificou `public.profiles` com RLS desabilitado e grants amplos de SELECT/INSERT/UPDATE/DELETE para `anon` e `authenticated`. A tabela contém dados pessoais, inclusive CPF/NIF. Esse problema é preexistente e independente da RPC nova.

- Nenhuma correção de RLS foi aplicada.
- Nenhuma migration de RLS foi autorizada nesta continuidade.
- O RPC novo da busca não concede acesso direto às tabelas de perfil: a superfície pública é SECURITY INVOKER e delega à implementação no schema não exposto `private`.
- A função legada `public.mwex_search_meshwalkers(text, integer)` permanece SECURITY DEFINER com EXECUTE concedido a `anon` e `authenticated`; ela chama `mwex_assert_eligible()` internamente, mas não é utilizada pela nova UI. Revisar/restringir grants como tarefa de hardening separada, sem alterar consumidores externos por inferência.
- A exposição direta preexistente de `public.profiles` permanece como risco independente; não foi corrigida pela busca de destinatários.
- PR #31 continua draft, sem migration aplicada. A correção global de RLS e a auditoria de `public.clients` permanecem fora do escopo deste ajuste.
- Não desligar grants nem aplicar policies por inferência; primeiro auditar dependências e testar.

## Missão complementar MISSION_0023

MISSION_0023 permanece PROGRESS e mantém seu próprio escopo de integridade operacional e segregação UMS/MWN. O quadro persistido de tarefas 23.2–23.5 continua PROGRESS; 23.6 permanece STAGED — GATE HUMANO. Esta atualização não altera os estados nem autoriza rollout da MISSION_0023.

## Próxima sequência de trabalho

1. A busca de destinatários por nome e CPF/NIF está entregue e publicada; a validação funcional autenticada pelo responsável em produção permanece como smoke test operacional, sem necessidade de transação real.
2. Manter a revisão global de RLS em `profiles` e a auditoria de `clients` como trabalho de segurança separado; PR #31 permanece draft e não foi aplicada.
3. Continuar as demais frentes da MISSION_0021 conforme prioridade do responsável, sem reabrir o escopo já concluído de destinatário.
4. Não executar transferências reais em testes automatizados; usar contas de teste e confirmação explícita para qualquer operação financeira real.

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
- PR #36 substituiu a implementação preliminar da PR #30 e foi integrada. A função pesquisa a partir de `mwc_meshwalker_profiles` e não depende da existência de linha em `profiles` para identificar elegibilidade ou bloquear carteiras inativas.

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

- OR-0008 corrigida após recuperação do documento de 2026-11-04 e reconciliação nominal do catálogo registrada na OR-20261113-0015.
- As 30 tabelas públicas sem RLS são 29 legadas, deliberadamente fora do escopo de remediação MW-Ex/MWN, mais `public.mwex_business_configs`, criada posteriormente e a ser avaliada individualmente.
- A consulta nominal confirmou que `profiles` está entre as 29 tabelas legadas. A contagem read-only retornou 37 linhas; nenhum conteúdo de linha foi consultado. Não inferir sensibilidade nem afirmar que está vazia; reconciliar a contagem com a descrição documental de placeholders.
- `clients` tem RLS habilitado e não integra o conjunto das 30 tabelas sem RLS. A contagem read-only retornou 15 linhas; policies permissivas foram observadas, mas o escopo funcional/consumidores ainda não foi atribuído.
- Não executar limpeza, migração, ativação de RLS ou revogação de grants nas 29 tabelas legadas por conta deste alerta agregado.
- Nenhuma alteração DDL, grant, policy, dado ou fluxo financeiro foi realizada. PR #30 e PR #31 permanecem abertas; migrations não aplicadas; sem merge/deploy.
- Próxima etapa: reconciliar a caracterização das 37 linhas de `profiles`, mapear consumidores de `clients` e avaliar somente `mwex_business_configs` no escopo MW-Ex.

## Correção de largura da Atividade da conta — 2026-11-14

- Causa: as regras históricas de grade por `:nth-of-type()` tinham maior especificidade que a regra de largura total; a seção de produção também não possuía classe dedicada.
- PR #32: https://github.com/meshwave65/newsite/pull/32 — merged.
- Commit: `82deb2713270ce022e970a980dbfa62e7e48515e`.
- Correção: classe `mwex-account-activity` + seletor desktop de maior especificidade com `grid-column: 1 / -1`, `width: 100%` e `min-width: 0`.
- Produção: deployment `dpl_DLvhFANzX4HBQQ9d8ZfDSzR933EW` READY; domínio `www.meshwave.com.br`.
- Build Vite concluído; QA visual autenticado permanece pendente.
- Escopo limitado a JSX/CSS; nenhuma migration, alteração de banco ou operação financeira.
- OR: [OR-20261114-0009](../../operational_reports/OR-20261114-0009.md).

## Card Patrimônio — FIAT e criptoativos efetivamente em carteira — 2026-11-14

- PR #33: https://github.com/meshwave65/newsite/pull/33 — MERGED por squash.
- Branch: `feat/mwex-wallet-patrimony`; commit da PR `aa70421c39db9bafb34716985cbc2bf9df2f4348`.
- Merge commit em `main`: `99d3b479f8de597a0223d43dcce6ee8afcd3a93e`.
- Produção Vercel: deployment `dpl_5Lo9NpasWAuHdfgUgXQhvEivZrAj` — READY; aliases incluem `www.meshwave.com.br` e `meshwave.com.br`.
- URL: https://www.meshwave.com.br/mw-ex.
- Preview da PR: deployment `dpl_bpHmQu21kRApU65K8jBNwYjxLa9P` — READY; protegido por Vercel SSO.
- Card substitui o resumo de MWN isolado por **Patrimônio**: FIAT no topo, por moeda, e criptoativos abaixo somente com saldo positivo.
- FIAT usa `mwex_fiat_accounts` filtrada pelo `wallet_id` da carteira autenticada; valores pendentes/reservados aparecem separados do disponível.
- Tabela cripto: código, nome, quantidade, preço unitário atualizado e valor referencial FIAT. Valor referencial = quantidade × cotação; não representa saldo realizado nem garantia de liquidação.
- Evidência read-only: `mwex_fiat_accounts` sem linhas no snapshot; `mwex_ledger_entries.asset` aceita somente MWN; BTC/ETH estão cadastrados como referências, não como saldos de carteira.
- Nenhuma migration, alteração de banco/RLS/grants/RPC, ordem, transferência ou movimento financeiro.
- Build de produção concluído: Vite transformou 210 módulos; deployment READY.
- QA visual autenticado desktop/mobile permanece pendente, pois o Preview é protegido por SSO. Teste com FIAT efetivamente creditado também pendente.
- Monitoramento agregado Vercel consultado após deploy: nenhum erro runtime encontrado na janela retornada. Consulta de logs detalhados não disponível por limite de retenção do plano.
- Análise de Mercado continua como aba futura independente; ativos de referência não são inseridos no patrimônio.
- OR: [OR-20261114-0010](../../operational_reports/OR-20261114-0010.md).

## Fila administrativa de créditos FIAT — 2026-11-14

- Diagnóstico: a aba **Créditos FIAT** já existia no Dashboard MWN e `MwexFiatAdminQueue` também, mas faltava a condição JSX para renderizar o componente quando `activeTab === 'fiat'`. A aba ficava vazia.
- PR #34: https://github.com/meshwave65/newsite/pull/34 — MERGED.
- Branch: `fix/mwex-fiat-admin-tab-render`; commit `ecebabf4c663d0af6d84c4f1af962cf3a037ff08`; merge commit `9cb7b3308297a4a311f759396a19a68d9e28db39`.
- Correção limitada a `src/pages/MwcDashboard.jsx`: renderização do componente de fila existente na aba FIAT.
- Produção Vercel: deployment `dpl_5bEjXYbYGJCLGwm2X6Y7hZWa9rHT` — READY; aliases oficiais `www.meshwave.com.br` e `meshwave.com.br`.
- Acesso administrativo: `/mwn/operacao` (ou `/mwn/dashboard`) → aba **Créditos FIAT**.
- Preview READY: `dpl_5VuHGzV9WcGuosPn6Ev1iUKSwB9b`; Preview protegido por Vercel SSO. QA visual autenticado permanece pendente.
- Build Vite: 210 módulos transformados, 3,60 s; warning não bloqueante de bundle principal acima de 500 kB.
- O registro de Genesis não possui linha correspondente em `public.profiles`; a fila administrativa mostra o UUID da conta como identificador, sem nome/e-mail de perfil. UUID: `5b57788b-1abf-4bfe-b810-c48783a68ce0`.
- Caso Genesis confirmado por consulta read-only: aquisição `5620db80-922d-4b43-830c-b18df8d8c5f2`, código `MWEX-FIAT-442CB186DDFB`, BRL 100,00 via PIX, status `pending_validation`. Referência e comprovante ausentes; saldo PENDING 100, AVAILABLE 0, RESERVED 0. Ledger e audit log contêm somente a solicitação pendente; nenhum evento de pagamento ou confirmação.
- Nenhuma confirmação/rejeição executada, nenhuma escrita financeira, migration, alteração de banco/RLS/grants/RPC.
- OR: [OR-20261114-0011](../../operational_reports/OR-20261114-0011.md).
