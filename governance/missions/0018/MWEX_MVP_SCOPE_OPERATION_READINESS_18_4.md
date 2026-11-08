# MISSION_0018 / Task 18.4 — Escopo mínimo, operação e readiness gates MW-Ex

**Versão:** 0.1.0-DRAFT_FOR_OWNER_DECISION  |  **Data:** 2026-11-08  |  **Status:** especificação documental; não autoriza implementação, depósito, trading ou lançamento.

## 1. Estado de partida

- O website possui rota e componente MW-Ex; o componente é explicitamente “Em breve”, saldo não conectado, livro de ordens vazio e dados de mercado ausentes.
- A fonte declara que a tela não consulta preços, não recebe ordens e não executa compra, venda ou conversão.
- O fluxo de aquisição atual é um piloto centralizado de UMS com comprovação e validação administrativa. Ele não é ledger de exchange nem fluxo de depósito/saque.
- O ledger de blockchain piloto declara `canonical=false` e `consensus=single-operator`; o código de geração de endereço não demonstra lifecycle de chave/signing/custody.
- A regra de prioridade dos MeshWalkers sobre ordens próprias da MeshWave está registrada como princípio, mas matching engine e controles não estão comprovados como implementados.

Conclusão de partida: **MW-Ex deve ser tratada como projeto de mercado a especificar, não como exchange operacional.**

## 2. Escopo mínimo candidato

### 2.1 MVP privado de validação (sandbox/closed beta)

Objetivo: validar a arquitetura e o comportamento de ledger/matching sem ativos reais, pagamentos, depósitos, saques ou mercado público.

Capacidades mínimas:
- contas de teste e balances sintéticos, identificados visualmente e em API como TEST/SANDBOX;
- um mercado de teste e um ativo de teste, sem confundir MWN real, MWC legado ou UMS;
- submissão, cancelamento e execução simulada de ordens; suporte a execução parcial;
- matching determinístico, regra de preço/tempo e testes da prioridade de MeshWalkers sobre ordens próprias;
- ledger de partidas dobradas com hold/reserve/release, idempotency keys, eventos únicos e audit trail;
- APIs privadas e market-data de teste, com timestamp e sem volume/preço fabricado apresentado como real;
- observabilidade, testes de concorrência, reconciliação e fail-closed em caso de inconsistência.

Fora do sandbox: dinheiro real, depósitos/saques reais, emissão, conversão UMS↔MWN, market-making, listing externo, leverage, margin, futures, staking/earn, bridge e promessa de liquidez.

### 2.2 MVP público de spot — candidato, sujeito a aprovação

Escopo inicial mais restrito que uma exchange ampla:
- uma única classe de mercado: spot;
- inicialmente um par de negociação, a escolher pelo responsável após aprovação da identidade do ativo e da moeda de cotação; MWN/USDT e MWN/BRL são exemplos de análise, não escolhas;
- candidate order types: limit, cancel and partial fill; market orders somente após gate de liquidez, price protection e slippage controls;
- book/order history/trade history com preço, quantidade, timestamp, taxa e estado real;
- balances available/reserved e ledger de partidas dobradas; reserva de saldo ao abrir ordem e liberação correta em cancelamento/expiração/falha;
- depósitos/saques só após chain/asset canonical, custody/signing, confirmations, withdrawal authorization and reconciliation approved;
- usuário, elegibilidade, disclosures, support, KYC/AML/sanctions controls conforme análise legal por jurisdição;
- monitoramento, incident response, status page, pause/cancel-all controls e recovery.

Não incluir no MVP público: derivativos, margem, empréstimos, staking/earn, mercados de ações/índices, multi-chain bridge, multi-asset markets, launchpad, auto-market-maker, synthetic volume ou conversão instantânea de UMS sem regra aprovada.

## 3. Modelos operacionais — opções para decisão

| Modelo | Funcionamento | Vantagens | Riscos/dependências |
|---|---|---|---|
| A — Custodial CEX, ledger interno + matching off-chain | A plataforma controla ativos/carteiras de depósito/saque; ordens e saldos são compensados em ledger interno. | UX/latência simples; compatível com mercado interno e execução frequente. | Risco de custódia, chaves, reconciliação, insolvência, abuso administrativo e regulação; requer controls/audit muito fortes. |
| B — Non-custodial/on-chain | Usuário controla chaves; ordens/settlement executados on-chain ou por contratos. | Menor dependência de custódia central; verificabilidade potencial. | Exige chain/contract canonical, contratos auditados, UX, gas, throughput, MEV, reorg/finality e liquidez; atual piloto não comprova prontidão. |
| C — Híbrido | Ordens off-chain com autorização assinada e settlement por mecanismo on-chain/escrow, ou outra arquitetura combinada. | Pode equilibrar experiência e verificabilidade. | Complexidade alta; “híbrido” não elimina custody nem bridge risk por si só. |

**Recomendação técnica preliminar para debate:** começar por sandbox com matching/ledger isolados e sem ativos reais. Para o MVP público, comparar A/B/C depois de definir asset/chain, custody e requisitos legais; não escolher agora.

## 4. Invariantes de mercado e ledger

1. **Double-entry:** todo movimento de ativo tem débito e crédito correspondentes; nenhum saldo nasce de UI ou cache.
2. **Reserved balance:** ordem aberta reserva o saldo suficiente; saldo reservado não pode ser gasto, sacado ou reservado novamente.
3. **Idempotency:** submissão, fill, cancel, deposit, withdrawal e callbacks devem ser idempotentes e resistentes a replay/duplicação.
4. **Atomicity/consistency:** fill, fees, hold/release e ledger updates devem ocorrer em transação ou mecanismo compensatório formal, com reconciliation.
5. **Price-time priority:** entre ordens de usuários compatíveis, preço e timestamp/sequence determinam a prioridade publicada.
6. **MeshWalker priority:** ordens de usuários têm prioridade sobre ordens próprias/relacionadas da MeshWave em condições compatíveis, conforme princípio do responsável; implementação no matching engine, não apenas interface.
7. **Related/self-trade prevention:** identificar contas próprias/relacionadas e impedir self-trade, wash trading ou volume apresentado como independente.
8. **Primary vs secondary:** Genesis, aquisição primária, treasury distribution e trades secundários devem ser rotulados e reportados separadamente.
9. **No synthetic market data:** preços, volume, spread, depth e trades devem derivar de eventos reais; market data deve ter timestamp e source.
10. **No unapproved conversion:** UMS↔MWN é fluxo distinto de negociação e fica desabilitado até regra econômica aprovada, ledger/reconciliation definidos e gate de risco fechado.
11. **Fail-closed:** divergência de ledger, chain, supply, sequence, custody ou market state suspende a operação afetada e gera alerta; não corrigir silenciosamente.
12. **Privacy:** market transparency não deve expor DID, dados fiscais, comprovantes de pagamento, credenciais ou dados pessoais; public market data é agregado/minimizado.

## 5. Custódia, signing e depósitos/saques

Antes de qualquer produção, definir:
- quem controla chaves e endereços (usuário, MeshWave, custodiante ou contrato);
- key lifecycle: generation, storage, access, rotation, backup/recovery, destruction, incident response;
- HSM/multisig/MPC options, segregation of duties, privileged access and approvals;
- hot/warm/cold wallet limits and treasury segregation;
- deposit lifecycle: address assignment, confirmations/finality, reorg handling, asset/network match, credit only after threshold;
- withdrawal lifecycle: request, eligibility, limits, risk screening, approval, signing, broadcast, confirmation, failed/replaced transaction, reconciliation;
- fees, network selection, nonce/sequence, replay protection, address validation, whitelists, delays and exception handling;
- no secrets in browser, public API, Supabase-readable table, logs, or client-side configuration.

## 6. Controles, segurança e operações

| Domínio | Requisito mínimo de desenho |
|---|---|
| Authentication/authorization | MFA for privileged users; RBAC; least privilege; separation of duties; secure session lifecycle; user/account controls. |
| Ledger/RLS | Double-entry, immutable event trail, server-side privileged functions, RLS tests, separation of admin and user, controlled corrections/reversals. |
| Matching | Deterministic sequence, price-time rules, MeshWalker priority, self-trade/related-account prevention, partial fill/cancel correctness, concurrent order tests. |
| Custody | Independent key-management service, signing authorization, limits, approvals, hot/cold segregation, audited access. |
| API | Authentication, rate limits, schema validation, idempotency, versioning, pagination, error semantics, abuse protection. |
| Monitoring | Order/execution latency, matching failures, balances/reserves, deposit/withdrawal status, chain height/hash, reconciliation drift, suspicious activity, admin changes, security events. |
| Market safety | Price collars, volatility halt, cancel-all, suspend deposits/withdrawals/trading separately, clear user notices and resumption criteria. |
| Reliability | Backups, disaster recovery, tested restore, RPO/RTO defined, incident playbooks, on-call/escalation and status page. |
| Privacy/LGPD | Purpose limitation, data minimization, required vs optional fields, retention/deletion, access audit, data subject rights and no identity exposure in market data. |
| Security assurance | Threat model, code review, dependency/SBOM review, penetration test, smart-contract/chain audit if applicable, independent review and remediation sign-off. |

## 7. Liquidez e integridade de mercado

- Liquidez não pode ser prometida; precisa ser medida por spread, order-book depth, executable size, slippage and volume quality.
- A política de market-maker/treasury é uma decisão separada; nenhuma atividade própria pode ser apresentada como demanda independente.
- Se a MeshWave fornecer liquidez, todas as ordens próprias/relacionadas devem ser identificáveis, sujeitas à regra de prioridade de MeshWalkers e publicadas de forma transparente sem expor dados pessoais.
- Define minimum liquidity/market quality thresholds only after pilot data and owner approval; do not invent numerical thresholds in this draft.
- Define fees, market-maker agreement, treasury conflicts, market halt, abnormal volume and delisting policy before public launch.

## 8. Readiness gates

| Gate | Critério bloqueante | Evidência exigida |
|---|---|---|
| G0 — Decision baseline | MWN identity, chain/asset, UMS/MWN roles, supply/Genesis, conversion and pair decision registered and approved. | Versioned decision record; owner approval; reconciled source docs. |
| G1 — Sandbox | No real assets; test users; matching/ledger behavior deterministic and repeatable. | Automated tests for order lifecycle, reserve/release, partial fills, cancellation, concurrency, idempotency, user-priority and self-trade. |
| G2 — Ledger/chain integrity | Ledger-to-chain consistency, supply/balance invariants, deposit/withdrawal semantics. | Reconciliation report, verifier/explorer/API spec, no unexplained drift. |
| G3 — Custody/security | Custody model, keys, signing, recovery, privileged access, RLS and incident response approved. | Threat model, security test, external review, remediation sign-off, recovery rehearsal. |
| G4 — Legal/compliance | Jurisdictions, entity, asset classification, marketing, KYC/AML/sanctions and consumer disclosures reviewed. | Professional legal/compliance opinion and operational policy; detailed analysis belongs to task 18.6. |
| G5 — Liquidity/market integrity | Pair, liquidity model, fees, user-priority, related-party controls and market monitoring approved. | Market-quality plan and simulated/observed depth; no wash/synthetic activity. |
| G6 — Operational readiness | Support, monitoring, alerts, status page, backup/restore, pause/resume, incident playbooks. | Operational rehearsal, restore test, incident/tabletop, on-call and escalation path. |
| G7 — Public launch | All prior gates signed off; user-facing statements match actual capabilities. | Release checklist, owner approval, test evidence, published risk/disclosure/support pages. |
| G8 — External venue | Exchange terms, jurisdiction, wallet/chain integration, deposits/withdrawals, security and legal reviewed. | Written terms, exchange sandbox, integration tests and venue-specific approval. |

## 9. Dependencies and sequence

- **18.2:** tokenomics and UMS↔MWN conversion decisions. G0 cannot close without approved asset/supply/conversion definitions.
- **18.3:** market strategy and external venue sequence; own MW-Ex remains primary intention, no venue selected.
- **18.5:** ecosystem utility/demand map; informs the pair's use cases but does not prove liquidity.
- **18.6:** legal, security and risk analysis; gates G3/G4 and must not be skipped.
- **18.7:** integrated roadmap, owners, estimates and gates.
- Existing newsite wallet/acquisition pilot is a reference implementation, not a production exchange ledger; current blockchain is single-operator/noncanonical.

## 10. Decisions reserved to the owner

1. Custodial, non-custodial or hybrid public-market model.
2. Initial quote asset and market pair (MWN/USDT, MWN/BRL or another); no pair selected.
3. Spot order types and initial market scope; recommended limit-only first is a candidate, not final.
4. UMS↔MWN conversion eligibility, rate, reserve/burn/reissue and transaction handling.
5. Custody, key management, signing, deposit/withdrawal approval, fees and limits.
6. Treasury/market-maker participation and liquidity budget/policy.
7. KYC/AML, eligibility, supported jurisdictions and legal entity.
8. Public launch criteria, market-quality thresholds and launch date.

## 11. Investor-safe wording

“A MW-Ex está em fase de especificação. O portal contém uma prévia visual, mas a negociação ainda não está habilitada. A arquitetura mínima prevê um mercado spot controlado, ledger auditável, controles de ordem/custódia, monitoramento e gates de segurança, liquidez e conformidade. O escopo final e os parâmetros dependem de decisão do responsável e de validação técnica/legal.”

## 12. Sources

- [Newsite exchange-readiness audit (01/11/2026)](https://github.com/meshwave65/newsite/blob/main/docs/audit/mwn-exchange-readiness.md)
- [Newsite accounting model (04/11/2026)](https://github.com/meshwave65/newsite/blob/main/docs/modelo-contabil-ums-mwn.md)
- [MW-Ex preview component](https://github.com/meshwave65/newsite/blob/main/src/pages/MwEx.jsx)
- [Market governance — MeshWalker priority](https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/temas/governanca-mercado-mwn-prioridade-meshwalkers.md)
- [Unified wallet/DID economics](https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/temas/economia-centrada-no-meshwalker-carteira-unificada.md)
- [Mission 18.2 economic architecture draft](ARCHITECTURA_ECONOMICA_UMS_MWN_DECISION_DRAFT.md) and [18.3 market strategy](ESTRATEGIA_MERCADO_E_LISTAGEM_18_3.md)
- [Blockchain pilot README](https://github.com/meshwave65/meshwave-blockchain/blob/main/README.md)