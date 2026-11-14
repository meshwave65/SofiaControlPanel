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
- Head atual: `29ef67f2cadca4d9e3a9543cbc99860bb04c6054`
- Estado: OPEN, mergeable; não integrada.
- Preview Vercel: READY — deployment `dpl_GRt2reNc4q5BPDMNXjumm7dzNXNM`, URL https://newsite-j37a00anz-meshwaves-projects.vercel.app
- Build: Vite concluído em 3,31 s. Warning não bloqueante de bundle JS principal de 736,78 kB.
- Arquivos: `src/pages/MwEx.jsx`, `src/pages/MwEx.css`, `supabase/migrations/20261114130000_mwex_search_transfer_recipients.sql`.

#### Regras de destinatário persistidas

1. Busca por nome/username pode apresentar sugestões com nome e username.
2. Busca por CPF/NIF só consulta documento completo: CPF com 11 dígitos ou NIF com 9 dígitos. Entrada numérica parcial não dispara pesquisa nem sugestões.
3. A consulta fiscal exata retorna somente status genérico FOUND, NOT_FOUND ou AMBIGUOUS. Em match único, o identificador é mantido internamente para a RPC; a interface não mostra nome, username ou fragmentos do documento.
4. Correspondência fiscal ambígua não escolhe destinatário arbitrariamente.
5. UUID integral permanece apenas no estado interno usado pela RPC `mwex_transfer_mwn`; interface mostra UUID mascarada.
6. Usuário que já conhece a UUID pode colá-la diretamente.
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
