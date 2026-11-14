# MISSION_0021 / Tarefa 21.1 — Inventário de estado real da MW-Ex

**Projeto:** SofiaControlPanel / MeshWave  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data da auditoria:** 10/11/2026, 08:47 (-03:00)  
**Estado:** CHECKPOINT_READ_ONLY  
**Fonte principal:** `meshwave65/newsite`, commit `3108a5a07059f6bb4263e62460dff92209579c26` (`feat: publish ROB investor material v0.5.4`, 2026-11-10T05:45:20Z)

## 1. Escopo e método

A auditoria foi somente leitura. O repositório `newsite` foi clonado em diretório temporário e foram examinados a rota MW-Ex, a carteira integrada, a carteira UMS/MWN, proteção de rotas, configuração econômica, documentação de readiness, modelo contábil e migrações Supabase. Não foram executados comandos contra produção, consultas autenticadas, alterações de banco, deploy, operação de carteira ou movimentação de ativos.

A classificação abaixo separa fato verificado no commit auditado, declaração/documentação do projeto, hipótese de implementação e dependência/gate. Commits, telas, nomes de tabelas ou referências de interface não são tratados como prova de operação financeira ou liquidez.

## 2. Matriz requisito → evidência → estado

| Requisito MW-Ex | Evidência verificada | Estado atual | Lacuna/gate |
|---|---|---|---|
| Rota de acesso | `src/main.jsx:88` registra `/mw-ex` dentro de `ProtectedRoute` | Implementado como rota autenticada | `ProtectedRoute` só verifica sessão; não verifica elegibilidade MeshWalker no servidor/rota MW-Ex |
| Tela MW-Ex | `src/pages/MwEx.jsx:5-45` contém cartões MWN/BTC/ETH/IBOV/S&P500/IPCA, saldo `—`, ordens vazias e status `Em breve` | Preview visual | Sem leitura de saldo MWN, ordens, preço, conversão, transferência ou execução |
| Disclaimer | `src/pages/MwEx.jsx:41` afirma que não consulta preços, não recebe ordens e não executa compra/venda/conversão | Limite explícito correto | Deve permanecer até implementação e validação dos gates |
| Carteira UMS | `src/pages/MwcWallet.jsx` usa `mwc_acquisitions`, `mwc_meshwalker_profiles`, RPCs de aquisição e `mw_account_ledger` | Fluxo UMS/aquisição existente | Não é ledger MW-Ex; aquisição validada não prova conversão MWN nem mercado |
| Carteira integrada | `src/pages/MeshwalkerWallet.jsx:33-42` lê `mw_account_ledger` filtrado por usuário; `:59-66` soma UMS e calcula `MWN = UMS / 1000` | Equivalência derivada da carteira UMS | Não existe saldo MWN independente, histórico MWN próprio ou ponte explícita |
| Relação econômica | `src/config.js:5-8` define `umsPerMwn: 1000` e `mwnValueBrl: 0.021605` | Parâmetro de referência centralizado no frontend | Valor é estático/configurado; não é cotação verificável nem autorização de mercado |
| Elegibilidade MeshWalker | Há perfil `mwc_meshwalker_profiles` e formulários de perfil; acesso geral usa `ProtectedRoute` | Perfil existe; acesso autenticado existe | Não foi encontrada verificação específica de elegibilidade MeshWalker na rota `/mw-ex`; confirmar fonte canônica e enforcement servidor/RLS |
| Ledger/chain atual | `docs/audit/mwn-exchange-readiness.md` identifica `mw_blocks`, `mw_transactions`, `mw_account_ledger`, `mw_wallets`, `mw_chain_metadata`, `mwc_acquisitions`; chain `meshwave-genesis-v1`, `canonical=false`, `consensus=single-operator` | Piloto centralizado e razão de aquisição/UMS | Sem ledger MWN autônomo, custody/signing, exchange deposit/withdrawal ou verificação independente |
| Aquisições | `supabase/migrations/20261104020000_ums_accounting_reconversion_and_acquisition.sql` define `create_ums_acquisition`, `admin_decide_ums_acquisition` e crédito UMS após validação | Aquisição UMS administrativa e append-only | Não implementar MW-Ex sobre este caminho sem separar domínio contábil e autorização |
| Conversão/transferência | Modelo contábil declara transferência UMS direta proibida e conversão UMS→MWN indisponível na Fase 1 | Regra histórica/documental | Tarefa 21.2 deve fechar modelo e gates; 21.3 deve especificar ponte; nenhuma transação real autorizada |
| Cotação/indicadores | `MwEx.jsx` não consulta fontes; `config.js` contém referência BRL estática; candidatos são apenas nomes | Não implementado | Definir fonte, frescor, TTL, moeda, limites e comportamento stale/ausente em 21.2/21.5 |
| Deploy/produção | O commit auditado e docs não demonstram deploy funcional de MW-Ex | Não verificado | Confirmar ambientes, versão publicada e controles antes de qualquer release |

## 3. Constatações principais

1. A MW-Ex existente é uma prévia visual autenticada, não uma exchange funcional. A própria tela declara que não consulta preços, não recebe ordens e não executa compra, venda ou conversão.
2. A autenticação da rota não equivale a autorização MeshWalker-only. A rota `/mw-ex` usa `ProtectedRoute`, que verifica sessão; a elegibilidade específica e sua aplicação server-side/RLS ainda precisam ser demonstradas.
3. O “MWN” exibido na carteira integrada é uma equivalência calculada a partir do saldo UMS. Isso não constitui saldo emitido MWN nem ledger MW-Ex próprio.
4. O sistema atual contém um chain/ledger centralizado para eventos e aquisições UMS, com `canonical=false` e consenso single-operator segundo a auditoria técnica datada de 01/11/2026. Isso não deve ser reutilizado como prova de exchange, custody ou liquidez.
5. A referência `1 MWN = 1.000 UMS` está registrada em documentação/configuração, mas deve ser reconfirmada como parâmetro normativo e implementada com precisão, arredondamento, resíduos e idempotência antes de operação.
6. `mwnValueBrl: 0.021605` é uma referência estática centralizada no frontend, não uma fonte atual de mercado. A interface futura deve distinguir referência indicativa de cotação verificável.
7. A auditoria de readiness recomenda fases de especificação de ativo, custody/signing, leitura segura, reconciliação, sandbox e revisão independente antes de integração de exchange. Nenhuma dessas fases autoriza movimentação real por si só.

## 4. Decisões e gates encaminhados

- **Gate de arquitetura:** manter UMS e MWN em domínios contábeis separados; não derivar o saldo MWN de leitura lateral do ledger UMS.
- **Gate de autorização:** confirmar fonte canônica de elegibilidade MeshWalker e aplicar negação por padrão no servidor/políticas de dados.
- **Gate econômico:** tarefa 21.2 deve fechar natureza da cotação, contraparte/liquidez, conversão, arredondamento e tratamento Genesis; nenhuma escolha foi inventada nesta tarefa.
- **Gate técnico:** somente ambientes/ativos sintéticos podem ser usados por padrão; sem migração Genesis, alteração de produção, ordens, depósito/saque ou deploy nesta etapa.
- **Gate de preço:** `mwnValueBrl` não pode ser rotulado como preço de mercado atual sem fonte, horário, TTL e proveniência.

## 5. Próximas tarefas seguras

A tarefa 21.1 pode ser encerrada documentalmente após revisão do OR e deste inventário. A próxima tarefa recomendada é 21.2, para fechar o modelo funcional mínimo e os gates econômicos antes de qualquer ledger, ponte ou UI operacional. Em seguida, 21.3 deve especificar isolamento e autorização; somente depois 21.4/21.5/21.6 podem implementar componentes, preferencialmente em fixtures/sandbox.

## 6. Limitações

Não houve login no site, consulta autenticada ao Supabase, inspeção de dados vivos, verificação de RLS em ambiente conectado, validação de deploy, teste de runtime, consulta de preço, análise de chaves privadas ou auditoria independente. A ausência de evidência nesta matriz não prova inexistência; classifica o item como não confirmado no commit auditado.

## 7. Proveniência

- `meshwave65/newsite@3108a5a07059f6bb4263e62460dff92209579c26`
- `src/pages/MwEx.jsx`
- `src/pages/MeshwalkerWallet.jsx`
- `src/pages/MwcWallet.jsx`
- `src/main.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/config.js`
- `docs/audit/mwn-exchange-readiness.md` (01/11/2026)
- `docs/modelo-contabil-ums-mwn.md` (04/11/2026)
- `supabase/migrations/20261104020000_ums_accounting_reconversion_and_acquisition.sql`
- `governance/missions/0021/BLUEPRINT.md`
- `governance/missions/0018/README.md`
