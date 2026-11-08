# MW-Ex — Readiness gate matrix (18.4)

| Gate | Type | Owner/approver suggested | Blocking? | Evidence/artifact | Current state |
|---|---|---|---|---|---|
| G0 Asset and economic baseline | Decision | Responsible owner / economic review | Yes | Approved MWN identity, supply/Genesis, UMS↔MWN, pair, rights and conversion decision record | OPEN; 18.2 is a framework with open parameters |
| G1 Sandbox matching/ledger | Engineering | Product/engineering | Yes before closed beta | Tests for order placement, reservation, matching, partial fill, cancel, idempotency, concurrency, price-time and MeshWalker priority | Not evidenced; MW-Ex UI is preview |
| G2 Chain/ledger integrity | Engineering/operations | Engineering + independent reviewer | Yes before real deposit/withdrawal | Reconciliation report, block/transaction verifier, supply and balance invariants | Current chain pilot noncanonical/single operator |
| G3 Custody and security | Security | Security lead / independent auditor | Yes before real assets | Threat model, key lifecycle, signing, custody controls, RLS tests, penetration/security audit, recovery test | OPEN; wallet address generation does not establish key custody |
| G4 Legal/compliance | Legal/compliance | Qualified professionals / owner | Yes before public trading | Jurisdiction/asset classification, AML/KYC/sanctions, consumer disclosure, terms, privacy | Deferred to 18.6 |
| G5 Liquidity and integrity | Market operations | Owner / market ops | Yes before open market | Market pair, fee policy, depth/spread thresholds, treasury conflict, user-priority test, no wash/synthetic volume | OPEN; no market data/ordermatching |
| G6 Operations | SRE/operations | Operations owner | Yes before public launch | Monitoring, alerting, status page, backup/restore, RPO/RTO, pause/resume and incident playbooks | OPEN |
| G7 Public launch | Release governance | Owner | Yes | Signed checklist for G0–G6, E2E test, disclosure, support, rollback | Not eligible |
| G8 External venue | Integration | Owner + exchange BD/technical | Yes before external integration | Written listing terms, sandbox, chain/wallet integration, legal and security review | Venue not selected; 18.3 documents conditional candidates only |

## MVP boundaries

- Private sandbox: test balances only, no real money, no external asset, no deposits/withdrawals, no public trading claims.
- Public spot MVP: one pair, approved asset, selected custody model, secure ledger/matching, real market data, operational controls, legal and liquidity gates complete.
- Explicitly out: leverage, derivatives, lending, staking/earn, cross-chain bridge, multi-asset listing, synthetic volume, unapproved UMS↔MWN conversion, market-maker/treasury orders without policy.