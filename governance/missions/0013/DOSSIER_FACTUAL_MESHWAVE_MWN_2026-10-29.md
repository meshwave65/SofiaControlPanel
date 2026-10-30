# Dossiê factual MeshWave / MWN — baseline para prospecção de investidores

**Missão:** MISSION_0013  
**Tarefas cobertas:** 13.1 (dossiê factual) e insumos de 13.2 (estrutura/lacunas)  
**Data da coleta:** 2026-10-29  
**Estado:** baseline documental e operacional parcial; não é offering memorandum, valuation, parecer jurídico ou auditoria independente.

## 1. Mandato confirmado pelo responsável

O responsável esclareceu que a missão deve prospectar **investidores**, e não apoiadores voluntários. A contrapartida pretendida tem duas alternativas distintas:

1. **Equity:** participação societária/direitos econômicos na estrutura empresarial da MeshWave.
2. **MWN:** o próprio ativo digital/criptomoeda MWN, em uma operação de aquisição ou alocação negociada com o investidor.

O responsável também declarou que a captação orgânica já está implementada e que já existem pessoas adquirindo o ativo. A declaração foi confrontada, em modo somente leitura, com o projeto Supabase identificado como `mwn`; os registros agregados abaixo confirmam atividade de aquisição e ledger piloto, sem revelar identidades ou dados pessoais.

O kit “MeshWave — kit de comunicação para apoiadores”, versão 1.0, não define esta oferta: seu texto afirma expressamente que a contribuição voluntária não compra MWN, investimento, participação societária ou ativo financeiro. Deve permanecer separado e não pode ser usado como pitch ou termo de investimento.

## 2. Evidência operacional observada no Supabase `mwn`

Consulta somente leitura ao projeto Supabase `mwn`, em 2026-10-29. Foram consultados metadados, tabelas, migrações e agregações sem selecionar nomes, emails, documentos fiscais, carteiras ou identificadores individuais.

### 2.1 Ledger piloto

| Indicador | Resultado observado |
|---|---:|
| Identificador da cadeia | `meshwave-genesis-v1` |
| Nome | MeshWave Genesis Ledger |
| Rótulo de rede | `pilot` |
| Schema | 1 |
| Último bloco declarado | 9 |
| Blocos persistidos | 10 |
| Transações persistidas | 10 |
| Entradas no ledger de contas | 19 |
| Carteiras registradas | 8 |
| Snapshots de estado | 0 |
| Último bloco | 2026-10-26 20:57:59 UTC |

Tipos de transação observados, todos com status `confirmed`:
- 8 `MWC_ACQUISITION_TRANSFER`;
- 1 `GENESIS_UMS_ALLOCATION`;
- 1 `UMS_MWC_CONVERSION`.

O ledger de contas contém 17 entradas para o ativo legado `MWC` (9 créditos e 8 débitos) e 2 entradas UMS (1 crédito e 1 débito).

**Interpretação permitida:** há um ledger de cadeia piloto persistido no banco, com blocos encadeados, hashes e registros de transação. Isso confirma uma implementação rudimentar/piloto em operação.  
**Interpretação não permitida:** esses registros, isoladamente, não provam blockchain pública, consenso descentralizado independente, nós validadores independentes, resistência adversarial, auditoria externa, disponibilidade em escala ou listagem em exchange. O rótulo do banco é `pilot`.

### 2.2 Aquisições registradas

| Indicador | Resultado observado |
|---|---:|
| Solicitações totais | 9 |
| Validadas | 8 |
| Rejeitadas | 1 |
| Pendentes | 0 |
| Validadas com hash de transação informado | 8 |
| Total BRL das aquisições validadas | R$ 13,02 |
| Quantidade agregada registrada | 602,63827817 unidades MWC |
| Carteiras | 8 |

As solicitações observadas ocorreram entre 2026-10-25 e 2026-10-26. Os números são o estado agregado do banco consultado nesta data; não representam volume de mercado, valuation, receita recorrente ou demanda externa.

### 2.3 Parâmetros de aquisição configurados

A tabela de preços do projeto registra:
- BRL: 0,021605 por unidade MWC, habilitado, instruções de pagamento configuradas;
- EUR: 0,00382918 por unidade MWC, habilitado, instruções de pagamento configuradas.

Esses valores são **parâmetros internos configurados para aquisição**, não cotação independente, preço de mercado, garantia de recompra, liquidez ou valuation. Não houve teste de pagamento nem transação financeira nesta tarefa.

### 2.4 Estrutura de aquisição no código/migrações

O repositório `meshwave65/mwc-ums-sim` contém migrações para:
- perfis de participantes;
- tabela de preços BRL/EUR e habilitação;
- solicitações de aquisição com estado `pending_validation`;
- submissão de referência/comprovante;
- decisão administrativa `validated` ou `rejected`;
- registro de hash de transação e eventos.

O fluxo codificado é autenticado e depende de validação administrativa. A migração prevê registro de ledger após aprovação. A existência do código e das migrações não prova, por si só, que cada etapa está publicamente disponível ou que pagamentos foram liquidados; os registros agregados no banco confirmam solicitações e validações registradas.

## 3. Evidências técnicas e limites

### 3.1 Repositório `meshwave65/mwc-ums-sim`

O README atual descreve o projeto como simulador visual Vite/React/TypeScript e qualifica os números econômicos como didáticos. O painel `MWBlockchain` deriva blocos do estado da simulação, valida hashes localmente e envia dados para Supabase com o identificador `mwc-ums-simulator-v1`. O próprio código o denomina “Observador do simulador” e declara que não possui saldos nem lógica econômica própria.

O mesmo repositório contém migrações e funcionalidades de aquisição/ledger que devem ser distinguidas do simulador visual. Não se deve usar a demonstração econômica do simulador como prova de operação financeira real.

### 3.2 Repositório `meshwave65/network`

`projects/mwn/README.md` registra a identidade MWN, mas mantém o estado `IDENTITY_RECORDED / BLUEPRINT_PENDING`. Declara que o README não é blueprint técnico, econômico, jurídico ou de investimento e não valida emissão, distribuição, utilidade, preço, liquidez, conversão, lastro, rendimento ou negociação.

O blueprint normativo `docs/blueprints/MESHWAVE_BLUEPRINT_NORMATIVE_v0.1.md` permanece `DRAFT_FOR_VALIDATION`, com caso mínimo UMS/SOFIA-SWE. Ele não é uma especificação aprovada da moeda MWN.

### 3.3 Divergência de nomenclatura

Apesar da instrução do responsável de que o nome atual da criptomoeda é **MWN**, a implementação consultada ainda contém nomenclatura legada:
- tabelas `mwc_acquisitions`, `mwc_sale_prices`, `mwc_wallet_ledger`;
- coluna/constraint de ativo `MWC` em `mw_account_ledger`;
- tipos de transação `MWC_ACQUISITION_TRANSFER` e `UMS_MWC_CONVERSION`;
- repositório `mwc-ums-sim` e identificadores de simulador legados.

O banco consultado contém uma tabela `mwc_wallet_ledger` com zero linhas, enquanto `mw_account_ledger` contém 19 entradas. Isso não prova falha, mas exige reconciliação do papel de cada ledger antes de qualquer apresentação técnica.

## 4. Evidência pública e comunicação

A homepage pública consultada em 2026-10-29 apresenta a MeshWave como uma infraestrutura de identidade soberana, inteligência coletiva, economia de recursos computacionais e coordenação SOFIA. Essas afirmações de visão devem ser classificadas como proposta/posicionamento, salvo demonstração específica.

O checkpoint de auditoria pública 12.1 no SCP registrou que as páginas públicas não exibiam um fluxo de contribuição visível. A consulta atual ao banco revela uma estrutura privada/autenticada de aquisição. As duas observações não são incompatíveis: a auditoria 12.1 cobriu páginas públicas, não o backend autenticado.

## 5. Matriz de maturidade para comunicação

| Componente/afirmação | Estado sustentado pelas fontes | Pode ser afirmado a investidor? |
|---|---|---|
| Identidade da moeda como MWN | Declaração formal do responsável; repositório de identidade MWN | Sim, com nota de que artefatos técnicos ainda retêm MWC |
| Ledger de cadeia piloto | Registros reais agregados no Supabase: 10 blocos/10 transações, rede `pilot` | Sim, descrevendo estritamente como ledger piloto |
| Aquisição do ativo | 9 solicitações registradas, 8 validadas, 1 rejeitada; 8 hashes de transação | Sim, como atividade piloto registrada; sem extrapolar demanda |
| Carteiras | 8 registros em `mw_wallets` | Sim, apenas como contagem de registros; não como usuários únicos verificados |
| Preço de aquisição | Parâmetros internos habilitados BRL/EUR | Somente como referência interna configurada, nunca preço de mercado |
| Blockchain descentralizada | Não demonstrada pelas fontes examinadas | Não |
| Exchange/liquidez externa | Não demonstrada | Não |
| Transferência externa para carteiras de terceiros | Não demonstrada nesta coleta | Não |
| Tokenomics final / supply / distribuição completa | Blueprint aprovado não localizado | Não |
| SOFIA/SWE distribuído em produção | Fontes normativas tratam runtime distribuído como pendente | Não |
| Rede MeshWave em escala | Não demonstrada pelas fontes examinadas | Não |
| Equity disponível | Estrutura societária e direitos não localizados | Não até documentação |
| Captação orgânica | Declaração do responsável e registros de aquisição piloto no banco | Sim, em termos estritos e com números agregados datados |

## 6. Fontes consultadas

### Supabase
- Projeto `mwn` (somente leitura; consultas agregadas em 2026-10-29).
- Tabelas: `mw_chain_metadata`, `mw_blocks`, `mw_transactions`, `mw_wallets`, `mw_account_ledger`, `mw_state_snapshots`, `mwc_acquisitions`, `mwc_sale_prices`, `mwc_wallet_ledger`.
- Migrações registradas: `create_mwc_core_schema`, `mwc_admin_check_function`, `mwc_rls_policies`, `mwc_chain_functions_and_triggers`, `mwc_acquisition_and_conversion_functions`, `add_mwn_transfer_function`, `add_mwn_admin_management_functions`.

### GitHub
- [network/projects/mwn/README.md](https://github.com/meshwave65/network/blob/main/projects/mwn/README.md)
- [network/docs/blueprints/MESHWAVE_BLUEPRINT_NORMATIVE_v0.1.md](https://github.com/meshwave65/network/blob/main/docs/blueprints/MESHWAVE_BLUEPRINT_NORMATIVE_v0.1.md)
- [network/docs/blueprints/MWN_MWC_RECONCILIATION_2026-10-29.md](https://github.com/meshwave65/network/blob/main/docs/blueprints/MWN_MWC_RECONCILIATION_2026-10-29.md)
- [mwc-ums-sim/README.md](https://github.com/meshwave65/mwc-ums-sim/blob/main/README.md)
- [mwc-ums-sim/src/simulation/blockchain.ts](https://github.com/meshwave65/mwc-ums-sim/blob/main/src/simulation/blockchain.ts)
- [mwc-ums-sim/src/persistence/sync/chainPersistence.ts](https://github.com/meshwave65/mwc-ums-sim/blob/main/src/persistence/sync/chainPersistence.ts)
- [mwc-ums-sim migration — acquisition portal](https://github.com/meshwave65/mwc-ums-sim/blob/main/supabase/migrations/20261023000000_create_mwc_acquisition_portal.sql)
- [mwc-ums-sim migration — payment proof](https://github.com/meshwave65/mwc-ums-sim/blob/main/supabase/migrations/20261023010000_mwc_acquisition_payment_reference_and_proof.sql)

## 7. Lacunas prioritárias antes de materiais externos

1. Confirmar o crosswalk MWC→MWN em banco, código, UI, transações e documentos, sem substituir histórico.
2. Identificar qual ledger é o registro canônico de titularidade e como aquisições aprovadas se refletem em carteira, chain e saldo.
3. Documentar emissão/supply, alocação inicial, circulação, titularidade, transferência e regras atuais de MWN.
4. Confirmar se há transferências externas e quais carteiras/rede/protocolo as suportam.
5. Obter evidência técnica independente da cadeia piloto, seu modelo de validação e seus limites.
6. Confirmar a política de aquisição vigente, a natureza do preço configurado e os termos contratuais.
7. Para equity: identificar entidade jurídica, jurisdição, cap table, titularidade de IP, direitos oferecidos, valuation, instrumento e aprovações.
8. Obter revisão jurídica/tributária/regulatória antes de qualquer oferta ou solicitação de capital.

## 8. Resultado da tarefa 13.1

**DONE — baseline factual compilado.** Há evidência de uma operação piloto real de aquisição e ledger no banco Supabase `mwn`, coerente com a declaração do responsável de que a captação orgânica já começou. A evidência é limitada e não deve ser apresentada como prova de mercado externo, blockchain descentralizada ou valuation.

O dossiê fornece base para executar a tarefa 13.2 (estrutura e lacunas) e iniciar segmentação de investidores em 13.3. Não houve contato externo, proposta, teste de pagamento, alteração de banco ou mudança de código.
