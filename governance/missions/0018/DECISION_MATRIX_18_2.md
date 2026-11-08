# MISSION_0018 / Task 18.2 — Matriz compacta de decisão UMS ↔ MWN

**Estado:** `DRAFT_FOR_OWNER_DECISION`; opções organizadas, nenhuma decisão normativa ou parâmetro numérico fixado.

| Decisão | Baseline candidato para revisão | Alternativas consideradas | Estado / aprovação necessária |
|---|---|---|---|
| Função da UMS | Unidade interna de contabilização de utilidade/contribuição; não moeda fiduciária nem ativo de mercado | Unidade de serviço pura; crédito interno; modelo híbrido de contabilização | Conceitualmente consistente com documentos, mas precisa de norma/definição aprovada |
| Reconhecimento PoUW | UMS somente após utilidade efetiva verificada; mensuração versionada e sem dupla contagem | Fator fixo; benchmark por classe; híbrido de benchmark + utilidade | Princípio de utilidade documentado; fatores, classes e remuneração pendentes |
| Carteira | Uma carteira lógica por DID/MeshWalker, consolidando vários nós e mantendo origem de eventos | Carteira por nó; DID + subcontas; carteira unificada | Princípio registrado; DID, custódia, recuperação e implementação pendentes |
| Transferência UMS | Bloquear transferência direta entre carteiras comuns de MeshWalkers | Transferência direta; somente movimentação institucional; UMS não transferível | A proibição é princípio documentado e controle de piloto; precisa permanecer consistente na norma |
| MWN | Ativo fungível para circulação/mercado externo, distinto de UMS | Token de circulação; token de governança; outro papel | Finalidade geral registrada; direitos, escopo jurídico e utilidades ainda não aprovados |
| Supply / Genesis | Não tratar o piloto como supply; Genesis oficial finita e auditada antes de qualquer emissão canônica | Supply fixo; emissão vinculada a PoUW; híbrido Genesis + conversão/emissão limitada | Nenhuma alternativa aprovada; cap, alocação, emissão, burn e cronograma pendentes |
| Conversão UMS↔MWN | Não assumir taxa fixa ou conversibilidade garantida; habilitar apenas por regra aprovada e operação elegível | Taxa fixa; variável/market-derived; sob demanda via reserva; adiar até MW-Ex | Relação 1.000:1 e referências BRL são conflitantes/não normativas; decisão expressa necessária |
| MWN transferibilidade | Separar conversão de transferência; habilitar circulação só após controles e regra de ledger/mercado | Transferência direta entre wallets; apenas via MW-Ex; transferibilidade externa | Não implementado/comprovado em produção; custódia/signing/fees/recovery pendentes |
| MW-Ex | Exchange própria como canal primário de negócio planejado, com prioridade de ordens MeshWalker no matching | Custodial vs non-custodial; order book vs outro mecanismo; market maker vs sem market making | Princípio de prioridade documentado; modelo operacional, segurança, liquidação, fees e liquidez pendentes |
| Exchange externa | Venue externa de menor atrito como porta pública posterior; não Binance-first | CEX de menor exigência; DEX; Binance; outras CEXs | Estratégia do responsável; nenhuma venue escolhida nem listing confirmado |
| Liquidez/preço | Sem promessa de preço, resgate, buyback, estabilidade ou liquidez; referências internas separadas do mercado | Reserva/tesouraria; market-making; pool; mercado aberto | Qualquer política exige autorização, controles e avaliação legal/econômica |
| PoUW financeira | Pode ser elegível conceitualmente se contribuição útil for reconhecida com critérios auditáveis | Não elegível; categoria separada; crédito UMS por regra de contribuição | Princípio informado; elegibilidade, prova, limites, anti-fraude e tratamento tributário pendentes |
| Aferição de serviços | Categoria potencial de PoUW com adesão individual opcional e privacidade por padrão | Continuous/sampled; provider; third-party homologated | Conceito registrado; protocolos, métricas, contrato, homologação e remuneração pendentes |

## Baseline conceitual proposto para revisão

1. **UMS** é a unidade interna e não transferível entre carteiras comuns; reconhece contribuição útil e consumo de serviços.
2. **MWN** é o ativo externo/circulável, separado de UMS; a exposição ao mercado ocorre somente por conversão e gateways aprovados.
3. **DID/MeshWalker** é a unidade de titularidade econômica; múltiplos nós compartilham uma carteira lógica, com proveniência por evento.
4. **PoUW** exige utilidade verificável, critérios objetivos, idempotência, antifraude e fator versionado; não remunera mero uso de CPU/storage/atividade.
5. **Genesis/supply** não deriva de quantidades de piloto; exige decisão de cap/allocation, auditoria, artefato canônico e custódia.
6. **Conversão UMS↔MWN** fica como decisão aberta; não assumir 1.000:1, preço BRL, resgate ou liquidez garantidos.
7. **MW-Ex** é projeto de mercado futuro, não funcionalidade atual; regras de prioridade MeshWalker devem ser codificadas e auditáveis.
8. **Exchange externa** permanece fase posterior, após escolha diligente; Binance não é a estratégia primária de lançamento segundo a decisão de mercado registrada.

## Referências de valores — não combinar nem publicar como paridade

- Modelo contábil newsite (04/11) registra referência 1 MWN = 1.000 UMS e informa que MWN não é saldo emitido por padrão; conversão comercial não está disponível na Fase 1.
- Crosswalk network (29/10) e D-005 negam caráter normativo/preço à relação antiga 1 MWC = 1.000 UMS.
- O simulador contém `1.000 UMS = 1 MWN = R$ 1,00` como parâmetro demonstrativo não aprovado.
- O frontend usa um valor BRL de referência distinto; o runbook do piloto também separa referência de custo/serviço e preço de negociação.
- Essas representações são snapshots e implementações distintas; nenhuma prova um peg, market price, redemption promise, fixed supply or guaranteed liquidity.

## Gates antes de qualquer especificação normativa

1. Owner approval of purpose/rights and canonical asset definition.
2. Approved supply, Genesis, issuance, burn and accounting rules.
3. Approved UMS benchmark/factors and utility/anti-fraud/contest criteria.
4. Approved conversion mechanism, rate model, eligibility, reserves and failure handling.
5. Approved wallet/DID, custody/signing, recovery, transferability and ledger invariants.
6. MW-Ex operational spec, security threat model, user-priority matching, settlement and audit trail.
7. Legal/tax/regulatory review; RFB consultation status must be updated, not presumed.
8. Versioned decision entry, requirement matrix update and explicit approval before changing normative source.

**Conclusão:** tarefa 18.2 pode ser considerada documentalmente concluída com parâmetros abertos. A arquitetura e as alternativas estão organizadas para decisão; a aprovação executiva de parâmetros é uma etapa distinta e não foi feita.