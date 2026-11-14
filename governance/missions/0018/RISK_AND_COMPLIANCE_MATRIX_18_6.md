# MISSION_0018 / Task 18.6 — Matriz de segurança, conformidade e riscos de lançamento

**Versão:** 0.1.0-DRAFT_FOR_PROFESSIONAL_REVIEW | **Data:** 2026-11-08 | **Natureza:** análise documental de readiness, não parecer jurídico, fiscal, regulatório ou de segurança.

## 1. Síntese executiva

**Postura atual de risco: ALTA / BLOQUEADA PARA OPERAÇÃO PÚBLICA.** Essa classificação reflete ausência de evidência de autorização regulatória, entidade operacional definida, custody/signing, security audit, exchange ledger/matching, KYC/AML program, liquidity plan e operação pública — não uma constatação de incidente ou falha explorada.

Fatos de partida:
- O portal e o frontend de carteira existem; MW-Ex é preview visual explicitamente sem preço, ordens ou transações.
- O ledger MWC/UMS é piloto controlado; a documentação de blockchain declara single-operator e non-canonical.
- A classificação jurídica de MWN/UMS e a entidade que prestaria os serviços não estão aprovadas.
- A Resolução BCB 520 entrou em vigor em 02/02/2026 e foi atualizada em 30/09/2026; a alteração do art. 91 pela Resolução 589 estabelece restrição com marco de 06/11/2026 para certas instituições autorizadas facilitarem operações com prestadores não autorizados/em processo, sujeita a exceções expressas. Esse ponto é gate imediato para qualquer estrutura brasileira de on/off-ramp, custódia ou intermediação.
- A consulta tributária à RFB consta como submetida, sem resposta formal confirmada; não equivale a parecer ou clearance.

## 2. Matriz de riscos

Escala: **Impacto** preliminar (Crítico/Alto/Médio). Probabilidade não pontuada porque não existe threat model, auditoria independente ou dados de incidentes suficientes. Estado “OPEN/BLOCKING” significa que a evidência/controle ainda não foi demonstrado.

| ID | Risco | Impacto | Estado atual | Mitigação/gate necessário | Revisão profissional |
|---|---|---|---|---|---|
| R-01 | Classificação de MWN/UMS e oferta pública (payment/utility/asset/security/collective investment) | Crítico | OPEN/BLOCKING | Analisar direitos, promessas, uso, distribuição, governança, venda primária, marketing e mercado; classificação não pode depender só do rótulo “utility”. | Advogado de mercado de capitais/criptoativos no Brasil e em cada mercado de oferta; CVM se potencial security. |
| R-02 | Prestação de serviços de ativos virtuais sem autorização/estrutura adequada no Brasil | Crítico | OPEN/BLOCKING | Definir entidade, atividades, modalidade, autorização BCB, capital/viabilidade, governança, estrutura e plano de negócios; revisar art. 91 e parceiros bancários/PSPs. | Counsel regulatório BCB/SPSVA; confirmar aplicabilidade de Res. 519/520/589 e exceções. |
| R-03 | Câmbio, pagamentos e capitais internacionais | Crítico | OPEN/BLOCKING | Mapear fluxos BRL/foreign currency, transferências internacionais, carteiras autocustodiadas, origem/destino, finalidade, reporting e limites; Res. 521 deve ser aplicada por fluxo. | Counsel cambial/BCB e fiscal; instituições autorizadas para rails pertinentes. |
| R-04 | AML/CFT/CPF/PEP/sanctions, fraude financeira e Travel Rule | Crítico | OPEN/BLOCKING | Risk-based CDD/KYC, beneficial ownership, PEP/sanctions screening, transaction monitoring, suspicious reporting, recordkeeping, originator/beneficiary info and unhosted-wallet risk controls. | Compliance officer/AML specialist; counsel; auditor de programa PLD/FT. |
| R-05 | Custódia, chaves privadas, signing e recuperação | Crítico | OPEN/BLOCKING | Definir custodial/non-custodial/hybrid; key lifecycle, HSM/MPC/multisig options, segregation, hot/cold limits, approvals, recovery, withdrawal controls, audit trail and incident response. | Especialista de custody/crypto security e auditor independente; counsel sobre custodian responsibilities. |
| R-06 | Integridade de blockchain, supply, Genesis e ledger | Crítico | OPEN/BLOCKING | Canonical asset/chain, consensus/validator model, supply invariants, Genesis audit, issuance/burn, independent verifier, chain-to-ledger reconciliation and reorg/finality policy. | Auditor blockchain/cryptography; economic/accounting reviewer. |
| R-07 | Exploração de smart contracts, API, RLS, admin, supply or signing | Crítico | OPEN/BLOCKING | Threat model, secure SDLC, code review, dependency/SBOM, least privilege, RLS tests, privileged separation, secrets management, penetration test and remediation sign-off. | Independent cybersecurity auditor; application/security engineer. |
| R-08 | Manipulação de mercado, wash/self-trading, spoofing, related-party conflict | Crítico | OPEN/BLOCKING | Price-time matching, user priority over MeshWave's own/related orders, self-trade prevention, surveillance, immutable logs, market halt and related-party disclosure. | Market-integrity specialist, exchange counsel and independent reviewer. |
| R-09 | Liquidez inexistente, spread, price discovery and misleading volume | Alto | OPEN/BLOCKING | No guarantee; publish real order book/trades only; establish pair, market-quality metrics, treasury/market-maker policy, concentration controls and disclosures. | Market operations/market-maker diligence; financial risk review. |
| R-10 | LGPD: excess identity/payment/telemetry data, improper purpose/basis, rights failure | Alto | OPEN/BLOCKING | Data inventory; purpose and legal basis per field; required/optional distinction; minimization; access controls; retention/deletion; rights workflow; DPIA where appropriate; vendor contracts; audit. | DPO/privacy counsel; LGPD specialist. |
| R-11 | Data breach / failure to notify or mitigate | Alto | OPEN/BLOCKING | Incident response playbook, classification, evidence preservation, controller/operator roles, notification workflow and affected-user communications; ANPD rule can require notice within 3 business days for relevant risk/damage incidents. | DPO/counsel and security incident response specialist. |
| R-12 | Fraud, phishing, impersonation, fake listing agents, wallet/address substitution | Alto | OPEN/BLOCKING | Official channels, verified counterparties, allowlists, address confirmation, anti-phishing UX, BD payment controls, signed communications, user education and takedown process. | Fraud/AML specialist; exchange due diligence. |
| R-13 | Operational failure, outage, data loss, reconciliation drift, withdrawal backlog | Alto | OPEN/BLOCKING | Monitoring, alerting, backups, restore test, RPO/RTO, fail-closed, pause/resume, incident/communication playbooks, support and on-call ownership. | SRE/operations audit; business continuity reviewer. |
| R-14 | Investor marketing, ROI/price/liquidity/listing claims, consumer harm | Alto | OPEN/BLOCKING | Investor materials evidence-linked; disclose concept/pilot/development; no guaranteed ROI, price, listing, liquidity, redemption or measured impact; review any offer/advertising. | Securities/consumer counsel; investor-disclosure reviewer. |
| R-15 | External exchange/custodian/vendor counterparty and delisting | Alto | OPEN/BLOCKING | Entity/beneficial ownership, jurisdiction/authorization, custody, proof of reserves/liabilities, security, fees, market quality, withdrawal, termination, incident and sanctions review. | Counsel and independent counterparty due diligence. |
| R-16 | PoUW/Sybil/replay/double counting/fraudulent contribution | Alto | OPEN/BLOCKING | Utility criteria, unique event IDs, provenance, validation, idempotency, anti-replay, rate/eligibility limits, disputes and independent verification. | Protocol/economic reviewer and security auditor. |
| R-17 | Conflict of interest: issuer, treasury, market-maker, admin and user priority | Alto | OPEN/BLOCKING | Segregate duties, identify own/related accounts, user-priority rule in engine, approval matrix, immutable logs, disclosure and governance process. | Corporate governance/counsel; market-integrity reviewer. |
| R-18 | Cross-border user access and inconsistent jurisdictional treatment | Alto | OPEN/BLOCKING | Select target jurisdictions; geofence/eligibility where necessary; review offering, CASP/VASP, local exchange, AML, data transfer and marketing obligations. | Local counsel in each target jurisdiction. |
| R-19 | Sustainability/quality claims (MIA-D, QoS) overstate measurement | Alto | OPEN/BLOCKING | Method validation, independent measurement, uncertainty, provenance, consent/privacy, no fixed demo counter represented as measured impact. | Environmental methodology/scientific reviewer and privacy counsel. |
| R-20 | Premature capital spending/listing/development before external validation | Médio/Alto | OPEN | Keep tasks concept/specification; investor interest/approval gate before build, listing fees, market-making or public offer. | Owner/investment governance. |

## 3. Blocking gates before any public financial/market operation

1. **Entity and legal scope:** identify issuer/operator/custodian/market operator and jurisdictions; professional opinion on activity classification and authorizations.
2. **Token classification and offer:** approved rights, use, supply, Genesis, distribution, primary sale, conversion and disclosures; no assumption that “utility token” avoids securities/financial regulation.
3. **Brazil authorization/banking:** determine if MeshWave's planned services are SPSVA activities; authorization and partner bank/payment arrangements; explicitly assess BCB 520 art. 91 as amended by Res. 589 effective from 06/11/2026.
4. **AML/CFT:** documented risk assessment, CDD/KYC, beneficial ownership, PEP/sanctions, monitoring, suspicious reporting, record retention, Travel Rule and unhosted-wallet procedures.
5. **Custody/security:** selected custody model, audited key management, wallet/ledger invariants, external security review, recovery and incident drills.
6. **Market integrity/liquidity:** matching, user priority, related-party controls, market surveillance, real data, pair/fees and liquidity policy.
7. **LGPD/privacy:** data map, legal basis, minimization, rights, retention/deletion, incident notification and vendor contracts.
8. **Operations:** support, monitoring, incident, business continuity, restore test, withdrawal pause and public status/disclosures.
9. **Public communication:** investor materials and token descriptions reviewed; no ROI/price/listing/liquidity guarantee or unsupported ecosystem maturity.
10. **External venue:** written terms, regulatory/counterparty, wallet/chain, deposits/withdrawals, custody, market depth, sanctions and termination due diligence.

## 4. Required professional reviews

- Brazilian cryptoasset/BCB regulatory counsel: Res. 519/520/521/589, authorization, SPSVA classification, bank/PSP access and cross-border flows.
- CVM/securities and public-offering counsel: MWN/UMS rights, primary acquisition, investment language, investor outreach and exchange market.
- Tax/accounting specialist: issuance, UMS accounting, conversion, sale, treasury, customer assets, reporting and RFB consultation follow-up.
- AML/CFT compliance officer: risk-based program, KYC, monitoring, Travel Rule, sanctions and reporting.
- DPO/LGPD counsel: profile data, financial/payment proofs, telemetry, consent, legal basis, retention, rights, incident response and cross-border transfers.
- Independent blockchain/custody/security auditor: consensus, Genesis/supply, key lifecycle, smart contract, API, RLS, matching, reconciliation and incident controls.
- Market integrity/liquidity specialist: orderbook, market maker, related-party activity, price discovery and volume quality.
- Local counsel for any target market (EEA, U.S. or other) and exchange-specific counsel before external listing.

## 5. Current status and investor-safe framing

- **No public exchange operation is evidenced.** MW-Ex remains a visual preview; no trading, deposit/withdrawal, conversion, custody or liquidity claim.
- **No authorization is evidenced.** Do not say MeshWave is a licensed/regulated exchange or VASP.
- **No legal classification is approved.** Do not call MWN definitively a security, non-security, payment token or utility token without professional review.
- **No guaranteed return, price, listing, liquidity, redemption or environmental impact.** Investor thesis is a concept/risk-capital proposition with milestone gates.
- **RFB consultation is pending/unconfirmed.** Do not state that tax treatment has been approved.

## 6. Sources

- [BCB Res. 519/2025 authorization](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=519&tipo=Resolu%C3%A7%C3%A3o+BCB)
- [BCB Res. 520/2025 current version (updated 30/09/2026)](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=resolu%C3%A7%C3%A3o+bcb)
- [BCB Res. 521/2025 FX/capital rules](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=521&tipo=Resolu%C3%A7%C3%A3o+BCB)
- [BCB Res. 589/2026 amendment](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=589&tipo=Resolu%C3%A7%C3%A3o+BCB)
- [CVM Parecer de Orientação 40](https://www.gov.br/cvm/pt-br/assuntos/noticias/2022/cvm-divulga-parecer-de-orientacao-sobre-criptoativos-e-o-mercado-de-valores-mobiliarios), [CVM FAQ updated 06/02/2026](https://www.gov.br/cvm/pt-br/acesso-a-informacao-cvm/perguntas-frequentes-da-cvm/criptoativos-quando-se-aplicam-as)
- [ANPD Res. 15/2024 incident notice](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca), [ANPD current incident communication FAQ](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis), [data subject rights](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares)
- [FATF 2026 VASP targeted update](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/targeted-updated-virtualassets-vasps-2026.html), [FATF Travel Rule guidance](https://www.fatf-gafi.org/content/dam/fatf/documents/recommendations/Updated-Guidance-VA-VASP.pdf)
- [ESMA MiCA register](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica), [MiCA Art. 59 CASP authorization](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-59-authorisation), [MiCA Art. 4 public offers](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-4-offers-public-crypto-assets-other), [EUR-Lex MiCA](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1114)
- [SEC 2026 crypto-assets interpretation](https://www.sec.gov/rules-regulations/2026/03/s7-2026-09), [SEC crypto asset transaction guidance](https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/transactions-involving-crypto-assets), [SEC proposed Regulation Crypto Assets (not final)](https://www.sec.gov/rules-regulations/2026/08/s7-2026-27)
- [FinCEN virtual currency exchanger/admin guidance](https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering), [FinCEN MSB registration](https://www.fincen.gov/resources/money-services-business-msb-registration), [CFTC spot/derivatives scope](https://www.cftc.gov/check)