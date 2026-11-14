# Matriz de estrutura e lacunas — equity x MWN

**Missão:** MISSION_0013  
**Tarefa:** 13.2  
**Data:** 2026-10-29  
**Base:** dossiê factual MISSION_0013; consulta read-only ao Supabase `mwn`; repositórios `network` e `mwc-ums-sim`.

## 1. Duas modalidades, duas diligências

| Dimensão | Equity MeshWave | Ativo digital MWN |
|---|---|---|
| O que o investidor recebe | Quotas/ações ou direitos econômicos definidos em instrumento | Unidades do ativo digital MWN, com direitos e limitações definidos |
| Contraparte/emissor | Entidade jurídica a identificar | Emissor/administrador e titularidade de supply a identificar |
| Evidência atual | Nenhum documento societário/cap table foi localizado nas fontes examinadas | Banco piloto contém chain ledger, aquisições e carteiras; nomenclatura técnica ainda MWC |
| Disponibilidade | Não demonstrada | Existe fluxo de aquisição registrado e ativo configurado no banco piloto; condições completas carecem de reconciliação |
| Preço/valuation | Não informado | BRL/EUR com parâmetros internos; não são cotação de mercado |
| Direitos do investidor | Não documentados | Direitos de titular, transferência, uso e resgate não estão consolidados em documento aprovado |
| Liquidez/saída | Não documentada | Mercado externo/liquidez não demonstrados |
| Risco principal | Ausência de entidade, instrumento, direitos e governança definidos | Maturidade piloto, reconciliação MWC/MWN, titularidade, transferibilidade, economia e ausência de validação externa |
| Material necessário | Corporate deck, cap table, term sheet, estatuto/contrato social, IP assignments, financial model | Whitepaper/asset specification, tokenomics, supply, chain explorer/evidence, acquisition terms, wallet/custody/transfer policy |
| Gate | Não ofertar até estrutura societária e direitos serem definidos e revisados | Não descrever como negociável/liquido externamente sem prova e decisão formal |

## 2. Equity — dados necessários

**Não encontrados nas fontes consultadas:**
- razão social, CNPJ/registro, jurisdição e entidade que emitiria a participação;
- quadro societário/cap table atual e titularidade de participações;
- percentual disponível, valuation pre-money/post-money, ticket mínimo e máximo;
- direitos econômicos, voto, governança, informação, preferência, diluição e saída;
- titularidade/cessão de propriedade intelectual, marcas, código e domínios;
- demonstrações financeiras, orçamento, runway, passivos e compromissos;
- instrumento jurídico (quotas/ações, SAFE, mútuo conversível ou outro) e aprovações.

**Gate de equity:** até que o responsável identifique entidade, instrumento, percentual/quantidade e condições, a missão pode pesquisar investidores e preparar tese geral, mas não pode apresentar uma oferta concreta de equity.

## 3. MWN — dados necessários e evidência atual

### Evidência existente
- Supabase `mwn`: chain `meshwave-genesis-v1`, rede rotulada `pilot`, 10 blocos, 10 transações, 19 lançamentos de ledger e 8 carteiras.
- 8 aquisições validadas, 1 rejeitada, 8 com hash de transação; total agregado das validadas: R$ 13,02 e 602,63827817 unidades com nomenclatura MWC.
- Parâmetros internos habilitados: R$ 0,021605/MWC e EUR 0,00382918/MWC.
- O banco possui tabelas de aquisição, eventos, preços, perfis, wallets, blocos, transações e ledger.

### Lacunas
- prova de que o ticker/asset code já foi migrado integralmente de MWC para MWN;
- supply total, emitido, reservado, circulante, alocado e saldo do emissor;
- política de emissão Genesis e sua relação com MWN;
- titularidade jurídica/econômica do ativo e entidade emissora;
- cadeia de custódia, chaves, carteiras, processo de transferência e recuperabilidade;
- validação independente do hash-chain, consenso, validadores e segurança;
- prova de transferências para carteiras externas ou de mercado secundário;
- natureza jurídica da aquisição e termos de venda/distribuição;
- justificativa/metodologia do preço configurado, distinguindo preço interno de preço de mercado;
- revisão jurídica/regulatória/tributária e política KYC/AML aplicável.

**Gate MWN:** pode ser descrito como ativo digital com aquisição e ledger piloto registrados. Não pode ser descrito como listado, líquido, livremente transferível, resgatável ou suportado por blockchain descentralizada sem evidência adicional.

## 4. Riscos de comunicação

1. Não chamar o preço de aquisição configurado de cotação ou valuation.
2. Não chamar registros do ledger piloto de volume de mercado.
3. Não extrapolar 8 aquisições validadas para demanda, adoção ou tração comercial.
4. Não tratar o simulador econômico como prova de execução real.
5. Não afirmar que equity está disponível antes de conhecer entidade e instrumento.
6. Não apresentar MWN como investimento com retorno garantido ou expectativa de valorização.
7. Não usar o kit de apoiadores voluntários em nenhuma das duas trilhas.
8. Não confundir MISSION_0011 (orquestração de contatos), MISSION_0012 (apoiadores voluntários) e MISSION_0013 (investidores).

## 5. Perguntas objetivas ao responsável — bloqueios de oferta

1. **Equity:** qual é a entidade jurídica que receberá o investimento e emitirá a participação?
2. **Equity:** qual percentual/quantidade está disponível e qual valuation ou faixa de negociação pretende considerar?
3. **MWN:** a aquisição atual registrada no Supabase representa compra de MWN transferida para a carteira do adquirente? Qual é o processo real de liquidação e entrega?
4. **MWN:** a nomenclatura MWC ainda presente no banco e nas transações é apenas legado técnico, ou ainda é o código de ativo efetivamente usado na operação?
5. **MWN:** existe transferência para carteiras externas hoje, ou a operação limita-se ao ambiente/plataforma MeshWave?
6. **Investidores:** há um alvo de captação/ticket por investidor ou a abordagem deve começar por investidores estratégicos sem valor predefinido?

## 6. Próximo passo

Tarefa 13.2 concluída como mapa de evidências e lacunas. A tarefa 13.3 pode começar com segmentação e pesquisa pública de investidores potenciais. A seleção final de investidores e a formulação de oferta concreta dependem dos dados de equity e dos esclarecimentos sobre o ativo MWN. Nenhuma abordagem externa está autorizada por esta matriz.
