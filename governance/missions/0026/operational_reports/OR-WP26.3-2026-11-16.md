# OR — WP26.3 — PoUW e arquitetura de consenso

**Data:** 2026-11-16  
**Executor:** análise manual assistida por ChatGPT, usando fontes públicas gratuitas  
**Estado:** DONE — análise técnica inicial concluída  
**Missão:** MISSION_0026

## 1. Escopo executado

Separação entre consenso, execução EVM, computação útil, verificação do resultado e remuneração. Revisão de literatura recente e de exemplos públicos de mercados de computação descentralizada.

## 2. Distinções necessárias

| Camada | Pergunta que responde | O que não prova |
|---|---|---|
| Consenso | Qual estado/bloco é aceito pela rede e com que segurança/finalidade? | Que o trabalho executado foi útil |
| Execução EVM | Como transações e contratos transformam deterministicamente o estado? | Que entradas off-chain são verdadeiras |
| Trabalho computacional | O recurso/trabalho foi efetivamente executado? | Que havia demanda legítima ou benefício |
| Verificação de utilidade | O resultado atendeu uma necessidade legítima e foi correto/útil? | Que a recompensa é economicamente sustentável |
| Recompensa/ledger | Quem recebe, quanto, por qual evidência e com quais limites? | Que a prova original é verdadeira se a fonte de evidência não for confiável |

Ethereum Mainnet utiliza Proof of Stake desde The Merge, em 2022-09-15. A EVM continua sendo a camada de execução. Ethereum não é uma implementação de PoUW.

## 3. Literatura e projetos verificáveis

### 3.1 Literatura

- Uma revisão sistemática publicada em 2025 selecionou 53 estudos primários sobre algoritmos de consenso PoUW e classificou suas abordagens.
- Uma pesquisa de 2026 em ACM Surveys identificou 36 sistemas propostos e concluiu que a utilidade entra em conflito com propriedades importantes exigidas de mecanismos de consenso; não encontrou um desenho que substitua completamente as cryptopuzzles e satisfaça todos os requisitos analisados.
- O artigo de Rafael Pass, submetido ao arXiv em 2026-06-04, modela o equilíbrio econômico entre mineração, trabalho útil e trabalho duplex. Ele analisa a preocupação de que atacantes possam ser remunerados pelo trabalho útil e mostra que o resultado depende dos incentivos e parâmetros econômicos. Não é correto concluir genericamente que PoUW é sempre inseguro ou automaticamente seguro.

A literatura trata majoritariamente PoUW como substituição/combinação de trabalho útil com o mecanismo de consenso PoW. Isso não é automaticamente equivalente ao conceito MeshWave de reconhecimento de contribuições úteis em sentido amplo.

### 3.2 Mercados de computação

- Golem descreve requestors e providers que oferecem recursos computacionais e recebem compensação em GLM. Isso é um mercado P2P de recursos e tarefas, não prova de consenso PoUW.
- Akash registra providers, ofertas e leases; sua documentação de verificação orienta checagens de disponibilidade, status, registro on-chain, atributos e auditoria. O roadmap AEP-86 propõe atestações em níveis de verificação. Isso é um padrão de reputação/atestado de provider, não prova geral de utilidade de qualquer contribuição.

Esses projetos podem fornecer padrões de marketplace, registro de oferta, reputação, medição de serviço e liquidação. Não demonstram uma solução pronta para o modelo amplo de PoUW da MeshWave.

## 4. PoUW da MeshWave: natureza e implicações

A documentação conceitual atual da Foundation define PoUW de forma mais ampla que execução computacional. Inclui contribuições mensuráveis úteis ao ecossistema, podendo abranger processamento, armazenamento, rede e contribuições financeiras ao desenvolvimento.

O princípio conceitual registrado é que contribuição útil comprovada gera UMS. Entretanto, categorias elegíveis, evidências, mensuração, limites, fatores de remuneração, antifraude, atribuição única e contestação ainda precisam de especificação. A documentação declara que esses mecanismos não estão comprovados como implementados.

Consequência: o PoUW MeshWave deve ser analisado primariamente como **camada de reconhecimento/validação de contribuições e contabilização de recompensas**, não como consenso de bloco. Se no futuro houver interesse em usar trabalho útil para segurança de consenso, isso exigirá uma investigação separada, com modelo de ameaça e propriedades de segurança próprias.

## 5. Ameaças e requisitos de verificabilidade

| Ameaça | Risco | Controle/requisito a especificar |
|---|---|---|
| Sybil/múltiplas identidades | Multiplicar recompensas sem utilidade equivalente | Identidade/limites, custo de ataque e correlação de evidências |
| Demanda artificial | Criar tarefas para gerar UMS sem benefício líquido | Legitimidade da demanda, autorização do solicitante e análise do resultado |
| Trabalho duplicado | Remunerar repetidamente o mesmo resultado | Identificador único, deduplicação e idempotência |
| Resultado falso/inválido | Pagar por saída incorreta | Verificação independente, amostragem, redundância ou prova específica ao tipo de tarefa |
| Conluio solicitante–executor | Fabricar demanda e atestar resultado | Separação de papéis, auditoria, contestação e detecção de padrões |
| Autoindução de demanda | Transferir custos entre dispositivos do mesmo titular e gerar UMS artificial | Avaliar utilidade líquida do trabalho, sem presumir fraude apenas pela titularidade |
| Medição manipulada | Inflar CPU, armazenamento, tráfego ou disponibilidade | Telemetria verificável, desafio aleatório e reconciliação |
| Oráculo/atestado comprometido | Contrato registra fato falso com aparência de imutabilidade | Fontes independentes, múltiplas assinaturas, reputação e trilha de contestação |
| Recompensa insustentável | Emissão superar utilidade econômica produzida | Modelo de incentivos, orçamento, limites e revisão de equilíbrio |
| Contribuição financeira sem confirmação | Creditar UMS por promessa ou pagamento não liquidado | Evidência de entrada financeira efetivamente confirmada e registro auditável |

## 6. Relação possível com EVM

Contratos EVM podem:
- registrar atestações e hashes de evidências;
- impor papéis, limites, janelas, idempotência e regras determinísticas de distribuição;
- registrar eventos de emissão/conversão e facilitar auditoria pública;
- aplicar timelocks e controles administrativos.

Contratos EVM não conseguem, sozinhos:
- saber se um trabalho off-chain foi realmente útil;
- medir CPU/armazenamento/rede de forma confiável sem instrumentação e evidência externa;
- validar a qualidade de um resultado sem mecanismo específico de verificação;
- confirmar liquidação bancária sem integração/oráculo confiável;
- impedir conluio se as fontes de atestado estiverem comprometidas.

Logo, EVM pode executar regras de liquidação após evidências verificadas; não substitui o sistema de prova de utilidade.

## 7. Conclusão do WP26.3

Recomendação técnica preliminar: manter PoUW separado de consenso e execução EVM. Tratar o PoUW MeshWave como camada própria de reconhecimento de contribuição útil, verificação e atribuição de UMS. Reutilizar padrões de mercado, identidade, reputação, atestação, idempotência e liquidação de projetos existentes quando compatíveis, sem importar a alegação de que isso constitui consenso PoUW.

A hipótese de substituir PoS/PoW por PoUW não está demonstrada e não deve ser assumida. A implementação de PoUW deve permanecer fora do escopo desta missão até haver especificação verificável, critérios de governança e decisão própria.

## 8. Fontes consultadas

- Revisão sistemática PoUW (2025): https://doi.org/10.1016/j.bcra.2025.100387
- ACM Computing Surveys, “On Replacing Cryptopuzzles with Useful Computation in Blockchain Proof-of-Work Protocols” (2026-07-31): https://doi.org/10.1145/3828717
- Rafael Pass, “The Economics of Proof-of-Useful-Work” (arXiv, 2026-06-04): https://arxiv.org/abs/2606.06700
- Ethereum The Merge: https://ethereum.org/roadmap/merge/
- Golem Providers: https://docs.golem.network/docs/providers
- Akash Provider Verification: https://akash.network/docs/providers/operations/provider-verification/
- Akash AEP-86 Provider Verifications: https://akash.network/roadmap/aep-86/
- Foundation MeshWave, documento conceitual: https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/temas/economia-ums-mwn-pouw-liquidez-distribuida.md
- Foundation MeshWave, checkpoint PoUW/Genesis UMS: https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/sessoes/2026-11-01_pouw-contribuicoes-e-genesis-ums.md
