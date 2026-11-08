# MISSION_0018 / Task 18.3 — Estratégia de mercado e opções de lançamento/listagem

**Versão:** 0.1.0-DRAFT_FOR_OWNER_DECISION  |  **Data da pesquisa:** 08/11/2026  |  **Status:** comparação documental; venue não selecionada; nenhuma candidatura, pagamento ou contato realizado.

## 1. Estratégia registrada pelo responsável

- MW-Ex e a carteira própria devem ser o canal primário inicial de negócio, em vez de depender de uma exchange global desde o começo.
- Uma exchange externa de menor atrito pode ser a porta pública posterior, mesmo que tenha menor alcance, liquidez e volume potencial que Binance.
- Binance foi objeto de candidatura anterior, mas deixou de ser a estratégia primária. Estado atual da candidatura não foi verificado; não comunicar como aprovação, revisão ativa ou listing.
- A regra de projeto é validar interesse externo antes de comprometer desenvolvimento/custos: sem investimento/validação externa, a evolução deve permanecer no conceito e nos materiais de apresentação.

## 2. Sequência recomendada para decisão

1. **Conceito e validação:** apresentar a tese MWN, a arquitetura de UMS/MWN e os gates de MW-Ex; medir interesse de investidores/parceiros sem prometer preço, listing, liquidez ou retorno.
2. **Canal próprio:** desenvolver e operar MW-Ex somente após decisão de capital, especificação econômica, segurança, custódia/controles, liquidação, compliance e readiness. A UI atual é preview, não uma exchange funcional.
3. **Gateway externo:** depois de existir ativo canônico, chain/mainnet ou contrato, wallet/deposit/withdrawal, legal package e market readiness, comparar uma shortlist de venues ativas e obter termos escritos. O listing externo é uma porta de acesso/discovery, não promessa de liquidez.
4. **Exchange de maior alcance:** reavaliar Binance e outras venues de maior barreira após produto funcional, adoção comprovável, security review, tokenomics aprovada e operação de mercado rastreável.
5. **DEX opcional:** pode reduzir a necessidade de aprovação central, mas não é “listing grátis”: exige token em chain suportada, contrato, auditoria, pool e liquidez inicial. Não é atualmente uma alternativa pronta para MWN.

## 3. Comparação documental das opções

| Venue / caminho | Processo público e custos | Adequação à estratégia | Risco / conclusão de triagem |
|---|---|---|---|
| **MW-Ex própria** | Sem listing externo; custo é produto/infraestrutura/operação. Modelo, custos e capital precisam de plano aprovado. | **Canal primário pretendido** pelo responsável, com controle da experiência e relação com MeshWalkers. | Hoje é preview visual não funcional. Não pode ser apresentada como operação; exige gates de mercado, segurança, custody, settlement, AML/KYC quando aplicável, suporte e liquidez. |
| **LBank** | [Portal oficial](https://www.lbank.com/listing): candidatura online; avaliação inicial anunciada em até 48h; depois negociação comercial, plano promocional e integração. Não publica tarifa universal na página consultada. | **Candidato condicional para diligência**, por processo publicamente simples. | A rapidez é somente avaliação inicial, não aprovação. Há alertas regulatórios em jurisdições específicas: FSA do Japão lista LBank/LBK como operação de exchange não registrada; o registro MiCA deve ser conferido antes de qualquer alcance EEE. A decisão judicial AIFC de setembro/2026 foi alterada para retirar LBank após bloqueio local; não tratar a ordem inicial como status atual sem ler a emenda. Fees, contracting entity, legal availability, custody and liquidity require written diligence. |
| **CoinW** | [Formulário oficial](https://www.coinw.com/coin-apply) solicita informações básicas e campo “Listing Fee Budget”, seguido de documentação detalhada. Não publica fee, prazo ou critérios completos no formulário. | **Candidato condicional para diligência**; aplicação simples, mas custo/avaliação desconhecidos. | CoinGecko apresenta Trust Score 8/10, mas avaliação de liquidez da página consultada é “Low” e spread médio mostrado é 1,62%; o score não garante liquidez do par MWN nem autorização regulatória. Requer revisão jurídica/regulatória independente e termos escritos. |
| **WEEX** | [Página oficial](https://www.weex.com/help/articles/a0putj7536mror4ulppk93o3) exige mainnet e endereço de contrato; publica pacotes-orçamento de US$20k/30k/40k, que não são taxa universal nem garantia de aprovação. | Não é o “baixo atrito” ideal neste estágio. | Alertas/ações regulatórias em jurisdições específicas (Georgia C&D; FIU-IND notice) e ausência de MiCA confirmada por tracker que consulta ESMA. **Não incluir na shortlist pública sem due diligence jurídica reforçada**; pacotes promocionais não substituem aprovação ou liquidez. |
| **Bitget** | [Página oficial](https://www.bitget.com/launchhub/application-for-listing) afirma não cobrar application/evaluation/listing fee adicional; ainda conduz revisão legal, compliance, segurança e integração. | Processo sem taxa anunciada, mas não significa baixa exigência. | SEC da Tailândia apresentou queixa criminal em 05/11/2026 e informou bloqueio de acesso efetivo em 05/12/2026; outros alertas regionais existem. **Hold/excluir da shortlist por ora** até clarificação da entidade, alcance geográfico e status regulatório. |
| **Binance** | [FAQ oficial](https://www.binance.com/en-AU/support/faq/detail/053e4bdc48364343b863d1833618d8ba): due diligence rigorosa; não há requisitos fixos publicados; recomenda MVP e adoção de usuários. | Venue de alcance maior para fase posterior; não é o gateway inicial pretendido. | Candidatura anterior é owner-reported; status atual desconhecido. Não assumir aprovação nem listing. A estratégia foi alterada para MW-Ex primeiro e gateway externo de menor atrito. |
| **Gate** | [Processo oficial](https://www.gate.com/pt-br/listing) solicita whitepaper, equipe, tokenomics, documentação técnica e use case; screening e due diligence legal, técnica e de mercado. | Pode ser opção de fase posterior, não claramente de menor exigência. | Requisitos e aprovação são amplos; custos/termos devem ser confirmados diretamente. |
| **DEX (PancakeSwap/Uniswap)** | [PancakeSwap](https://docs.pancakeswap.finance/welcome-to-pancakeswap/contact-us/business-partnerships/commonly-asked-business-partnerships-questions) informa que tokens suportados podem ser negociados sem aprovação central, desde que exista pool/liquidez; [Uniswap](https://support.uniswap.org/hc/en-us/articles/8671577468813-How-does-the-Uniswap-protocol-work) descreve pool AMM financiado por provedores de liquidez. | Alternativa de acesso permissionless, não equivalente à exchange própria nem a CEX pública. | MWN ainda não tem, nesta evidência, um contrato público canônico em chain compatível. Wrapper/bridge ou emissão em outra chain introduz riscos de contrato, bridge, custody, audit e liquidez. Não é recomendação de lançamento nesta fase. |

## 4. Shortlist e exclusões após triagem atualizada

### Candidatos apenas para diligência futura

1. **LBank** — processo inicial simples, mas taxa, contracting entity, regiões atendidas e legal status precisam ser documentados por escrito.
2. **CoinW** — formulário com orçamento, mas custo, critérios, entidade e liquidez para um par novo precisam ser esclarecidos.

Esses nomes não são recomendação de exchange nem aprovação de listing. A diligência deve ser concluída antes de contato/candidatura/pagamento e só após validação de interesse/capital.

### Hold/excluir da shortlist atual

| Venue | Motivo documentado na pesquisa de 08/11/2026 |
|---|---|
| XT.com | A própria exchange anunciou retirada de serviços no EEE a partir de julho/2026; FCA, VARA, FSA Seychelles e outros reguladores publicaram alertas/ações em jurisdições específicas. |
| BitMart | Comunicado oficial: wind-down; trading cessou em 26/08/2026 e o aviso de novembro orienta não depositar; reestruturação ainda incerta. |
| MEXC | VARA publicou notice of fines (22/06/2026); FinCEN/Treasury dos EUA emitiu ordem de 06/11/2026 restringindo acesso ao sistema financeiro dos EUA. |
| CoinEx | Canal oficial anunciou cessação ordenada de serviços a partir de 15/09/2026. |
| ProBit Global | Pesquisa encontrou anúncio de término de serviços em 26/02/2026 em fonte secundária; status não confirmado em canal oficial nesta rodada, portanto não usar como candidato até verificação oficial. |
| KCEX | Alertas de caution list de BCSC/ASC em 2026 sobre não registro para securities/derivatives em suas jurisdições. |
| WEEX | Pacotes publicados de US$20k–40k, contrato/mainnet obrigatórios e alertas regulatórios; hold, não shortlist. |
| Bitget | Processo sem taxa, mas ação recente da SEC da Tailândia e bloqueio anunciado; hold, não shortlist. |

**Nota de jurisdição:** alertas e restrições de reguladores se aplicam a entidades/serviços e jurisdições específicas. Eles não substituem parecer sobre Brasil, mas são sinais materiais de risco de contraparte e alcance internacional. Não presumir que um listing numa venue offshore torna MWN disponível legalmente em todos os países.

## 5. Requisitos comuns antes de enviar qualquer candidatura

- Definição canônica de MWN: chain/mainnet, contract/asset ID, ticker, tokenomics aprovada, supply/circulação, Genesis e direitos.
- Explorer, documentação de node/wallet, APIs, depósitos/saques, confirmações, fees e integração de custódia.
- Whitepaper técnico/econômico coerente com a evidência atual; equipe/entidade legal e contatos verificáveis.
- Auditoria de contrato/chain, threat model, custody/signing, recovery, incident response e controles anti-fraude.
- Legal/compliance pack por jurisdição; classificação do ativo, AML/KYC, marketing, sanctions screening, consumer protection e tratamento tributário.
- Modelo de mercado: orderbook/pair, market-maker (se houver), capital de liquidez, spreads/depth, fees, conflito de tesouraria e política de delisting.
- Term sheet oficial, fee schedule, service level, custody/settlement responsibilities, listing obligations, marketing package optionality and termination/withdrawal clauses.
- Verificação da identidade do BD e pagamento somente a entidade contratual oficial; nunca a carteira de agente/intermediário nem por “listing garantido”.

## 6. Indicadores de comparação

Não usar volume anunciado como único indicador. CoinGecko Trust Score é recalculado semanalmente e sua metodologia pondera liquidez (50%), cybersecurity (20%), regulação (15%), incidentes (10%) e proof of reserves (5%). Mesmo um score da exchange não prova a liquidez do par MWN. Para o par, medir bid-ask spread, depth próximo do preço, volume consistente, atividade real e concentração de market makers.

## 7. Investor-safe wording

“A estratégia de entrada de mercado prioriza a carteira e a MW-Ex próprias como canal primário de negócio. Uma exchange externa de menor atrito poderá ser escolhida posteriormente como porta pública de acesso, sem depender inicialmente de Binance. A candidatura anterior à Binance é histórica e seu status atual não está confirmado. Nenhuma exchange foi selecionada, nenhuma listagem foi aprovada e não há garantia de preço, liquidez ou volume.”

## 8. Decisões abertas

1. Aprovar a sequência MW-Ex própria → gateway CEX externo → venues de maior alcance.
2. Definir os mercados/regiões prioritários (Brasil, EEE, outros) para a diligência de licenças e disponibilidade.
3. Aprovar a shortlist para contato; LBank/CoinW permanecem apenas candidatos condicionais.
4. Definir critérios mínimos de contraparte (licenças/registro aplicável, custody, PoR, audit, market depth, incident history, delisting/withdrawal clauses).
5. Decidir se DEX é opção de fase futura, e em qual chain, sem criar wrapper ou pool agora.
6. Autorizar somente após validação externa/capital o envio de candidaturas, negociação de fees e quaisquer pagamentos.

## 9. Fontes oficiais e referências

- Binance listing FAQ: https://www.binance.com/en-AU/support/faq/detail/053e4bdc48364343b863d1833618d8ba
- LBank listing process: https://www.lbank.com/listing; Japan FSA warning: https://www.fsa.go.jp/ordinary/chuui/mutouroku/04.html; AIFC amendment: https://afsa.aifc.kz/aifc-court-issues-injunctions-against-operators-of-several-unlicensed-crypto-platforms/
- CoinW listing form: https://www.coinw.com/coin-apply; CoinGecko profile: https://www.coingecko.com/en/exchanges/coinw; Trust Score methodology: https://support.coingecko.com/articles/6652614191-trust-score-methodology
- WEEX listing packages: https://www.weex.com/help/articles/a0putj7536mror4ulppk93o3; Georgia order: https://dbf.georgia.gov/press-releases/2025-03-27/order-cease-and-desist-issued-weex-international-exchange-ltd-dba-weex; India FIU-IND notice: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2308131&lang=2&reg=48
- Bitget official listing process: https://www.bitget.com/launchhub/application-for-listing; Thailand SEC 05/11/2026 notice: https://www.sec.or.th/EN/Pages/News_Detail.aspx?Lang=EN&NewsNo=241&NewsYear=2026
- XT EEA cessation: https://support.xt.com/hc/en-us/articles/59810866958745-XT-COM-Discontinues-Services-in-European-Economic-Area; FCA warning: https://www.fca.org.uk/news/warnings/xtcom; VARA notice: https://www.vara.ae/en/regulations/regulatory-notices/vara-consumer-and-marketplace-alert-xt/
- BitMart wind-down notice: https://bitmart.zendesk.com/hc/en-us/articles/58276355031579-Important-Notice-Please-Do-Not-Deposit-and-Update-on-the-Restructuring
- MEXC VARA: https://www.vara.ae/en/regulations/regulatory-notices/vara-notice-of-fines-mx-global-ltd-mexc/; FinCEN: https://www.fincen.gov/news/news-releases/operation-economic-outcast-severs-mexc-globals-access-us-financial-system
- CoinEx official announcement channel: https://t.me/s/CoinEx_Announcement
- Gate listing process: https://www.gate.com/pt-br/listing
- PancakeSwap listing FAQ: https://docs.pancakeswap.finance/welcome-to-pancakeswap/contact-us/business-partnerships/commonly-asked-business-partnerships-questions; Uniswap: https://support.uniswap.org/hc/en-us/articles/8671577468813-How-does-the-uniswap-protocol-work
- CoinGecko Trust Score methodology: https://support.coingecko.com/articles/6652614191-trust-score-methodology