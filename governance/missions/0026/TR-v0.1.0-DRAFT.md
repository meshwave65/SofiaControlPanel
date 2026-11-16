# Termo de Referência — MISSION_0026

## Avaliação Estratégica e Técnica de Reaproveitamento da Stack Ethereum no Ecossistema MeshWave

**Versão:** 0.1.0-DRAFT  
**Criado em:** 2026-11-16  
**Prioridade:** CRÍTICA  
**Estado:** AWAITING_HUMAN_VALIDATION  
**Execução autorizada:** NÃO  
**Gate de início:** aprovação explícita deste TR pelo responsável

## 1. Objetivo

Avaliar se e como MeshWave pode acelerar sua evolução adotando tecnologias maduras do ecossistema Ethereum, evitando reconstruir do zero funcionalidades que já tenham soluções robustas, auditáveis, interoperáveis e economicamente vantajosas.

A avaliação deve cobrir a arquitetura econômica e técnica de MWN, UMS, MW-Ex, carteiras, ledger, blockchain/rede MeshWave e PoUW, culminando em recomendação fundamentada de arquitetura e plano de decisão.

## 2. Perguntas centrais

1. Quais partes da arquitetura atual MeshWave já reproduzem capacidades disponíveis no Ethereum/EVM?
2. Quais componentes podem ser reutilizados diretamente (EVM, Solidity, padrões ERC, bibliotecas, SDKs, clientes, indexadores, carteiras, ferramentas de auditoria e infraestrutura)?
3. É preferível construir sobre Ethereum mainnet, uma L2 EVM, uma appchain/sidechain EVM, um runtime compatível com EVM, ou manter uma cadeia própria com integração seletiva?
4. O que deve permanecer fora da blockchain, por razões de privacidade, custo, desempenho, governança ou regras internas?
5. Como preservar as regras de UMS, MWN, MW-Ex e ledger sem abrir transferências ou operações que o modelo econômico MeshWave proíbe?
6. Qual é a relação tecnicamente defensável entre PoUW e uma arquitetura de execução EVM? PoUW seria consenso, mercado de computação, camada de contribuição, mecanismo de recompensa ou combinação? Quais evidências sustentam cada opção?
7. Quais custos, riscos, dependências, limites de escalabilidade, segurança, governança e lock-in surgem em cada alternativa?
8. Qual é o menor caminho de adoção que reduz esforço proprietário sem criar uma reengenharia ou dependência desnecessária?

## 3. Escopo de investigação

### 3.1 Estado atual MeshWave — evidência obrigatória

Inspecionar somente os repositórios, componentes e dados diretamente relacionados a:
- implementação de blockchain/rede e seu estado real;
- MWN: emissão, supply, contratos, transferências, carteiras e integração;
- UMS: ledger, saldos, regras de transferência e conversão;
- MW-Ex: negociação, lista de ativos habilitados, ordens e gateway UMS↔MWN;
- mecanismos PoUW e contribuições computacionais/armazenamento;
- infraestrutura de nós, validação, indexação, RPC e observabilidade, quando existentes.

Para cada componente, classificar: operacional comprovado, produção parcial, piloto/protótipo, desenvolvimento, conceito/roadmap ou não localizado. Exigir commit, arquivo, teste, deployment, consulta read-only ou outra evidência rastreável. Não inferir estado operacional a partir de documentação isolada.

### 3.2 Ecossistema Ethereum e tecnologias adjacentes

Investigar documentação e implementações atuais, incluindo, sem limitar:
- Ethereum Virtual Machine (EVM) e execução de contratos;
- Solidity e, quando relevante, outras linguagens compatíveis;
- padrões de tokens e interfaces (ERC-20, ERC-721, ERC-1155 e padrões pertinentes);
- clientes de execução/consenso e ferramentas de desenvolvimento;
- carteiras, gestão de chaves, account abstraction e padrões de assinatura;
- bibliotecas, SDKs, indexadores, explorers, RPC e infraestrutura;
- redes L2/rollups e appchains EVM;
- práticas de auditoria, testes, verificação formal, upgradeability e governança;
- custos de execução, finalização, disponibilidade, liquidez, interoperabilidade e riscos de bridges.

Usar documentação primária e atualizada, especificações, repositórios oficiais e evidências independentes de segurança. Separar capacidades do protocolo Ethereum das capacidades de fornecedores/serviços externos.

### 3.3 PoUW — análise separada e rigorosa

Distinguir explicitamente:
- consenso e seleção/finalização de blocos;
- execução de contratos e transações;
- computação útil realizada por participantes;
- verificação do resultado útil;
- atribuição de recompensas e contabilização de contribuições.

Analisar literatura técnica recente e projetos verificáveis de Proof-of-Useful-Work, incluindo segurança contra Sybil, trabalho falso, duplicado ou não verificável, verificação determinística/probabilística, incentivos, dificuldade, heterogeneidade de hardware, latência, energia, centralização e custo de validação.

Não afirmar que Ethereum usa PoUW. Registrar que Ethereum migrou de Proof-of-Work para Proof-of-Stake em 15/09/2022 e que essa transição é um estudo de consenso, não uma implementação de PoUW.

### 3.4 Alternativas arquiteturais a comparar

Comparar no mínimo:
A. Ethereum mainnet + contratos MeshWave.
B. L2 EVM existente + contratos MeshWave.
C. Appchain/sidechain EVM própria ou gerenciada.
D. Cadeia/runtime próprio com EVM incorporada ou compatibilidade seletiva.
E. Manter a arquitetura atual e adotar apenas padrões, ferramentas e bibliotecas Ethereum.
F. Alternativa não-EVM relevante, somente se houver benefício técnico demonstrável.

A comparação deve considerar segurança e maturidade, custo, throughput/finalidade, descentralização, governança, interoperabilidade, esforço de desenvolvimento, manutenção, lock-in, privacidade, disponibilidade de tooling, liquidez e compatibilidade com PoUW.

## 4. Regras econômicas e arquiteturais invariáveis para avaliação

A análise deve testar compatibilidade com estas regras já estabelecidas pelo responsável:

- UMS é a unidade econômica interna; as carteiras são individualizadas.
- Transferências diretas entre carteiras de usuários UMS não são permitidas.
- UMS não é livremente negociável no mercado externo.
- A conversão UMS↔MWN ocorre exclusivamente pela MW-Ex, respeitando os controles e registros correspondentes.
- MWN é o ativo-ponte entre a economia interna e o mercado externo.
- A MW-Ex preserva compra e venda, mas só apresenta como negociáveis ativos explicitamente habilitados; MWN é atualmente o ativo operacional padrão.
- FIAT só pode ser creditado contra entrada financeira confirmada, com registro auditável no ledger.
- Saldos, emissão, aquisição, conversão, reversão, liquidação e retirada precisam ser reconciliáveis e auditáveis.
- Não introduzir transferibilidade, bridges, wrapping, mint/burn ou permissões administrativas que contornem essas regras sem decisão explícita do responsável.

A análise pode recomendar mudança de arquitetura, mas não pode redefinir silenciosamente a economia MeshWave.

## 5. Entregáveis obrigatórios

1. **Inventário de estado atual:** componentes MeshWave e classificação por maturidade, com evidências.
2. **Mapa de equivalências:** capacidades já existentes no MeshWave versus capacidades maduras disponíveis no ecossistema Ethereum.
3. **Matriz de decisão:** comparação das alternativas A–F, com critérios, pesos justificados, riscos e incertezas.
4. **Arquitetura recomendada:** diagrama lógico e responsabilidades de cada camada, incluindo o lugar de EVM/contratos, MWN, UMS, MW-Ex, ledger e PoUW.
5. **Matriz de reaproveitamento:** para cada componente, decisão explícita — ADOTAR, INTEGRAR, ADAPTAR, MANTER PRÓPRIO, SUBSTITUIR ou NÃO USAR — com justificativa.
6. **Análise de migração/compatibilidade:** impacto sobre contratos, carteiras, saldos, histórico, supply, endereços, custódia, integração com a MW-Ex e operação existente.
7. **Riscos e controles:** segurança de contratos, chaves, bridges, oráculos, upgrades, consenso, disponibilidade, governança, privacidade, conformidade e dependência de fornecedores.
8. **Plano faseado:** sequência mínima, dependências, estimativa qualitativa de esforço/custo, gates de decisão e critérios de go/no-go.
9. **Recomendação executiva:** o que MeshWave deve parar de construir, o que deve reaproveitar e o que precisa continuar sendo próprio.
10. **Referências:** fontes primárias atuais, especificações, repositórios e estudos independentes, com data de consulta e distinção entre fato e opinião.

## 6. Critérios de aceite

- O estado atual de MeshWave está sustentado por evidências atuais e não por documentos históricos isolados.
- A análise não confunde Ethereum com Bitcoin nem PoW com PoS/PoUW.
- EVM/execução, consenso, liquidação, economia de tokens e computação útil são avaliados como responsabilidades distintas.
- Cada alternativa arquitetural é comparada com os mesmos critérios.
- As regras econômicas de UMS/MWN/MW-Ex são preservadas ou qualquer incompatibilidade é explicitamente demonstrada.
- A recomendação distingue o que pode ser reaproveitado imediatamente, o que exige adaptação e o que não deve ser adotado.
- Riscos de contratos, custódia, bridges, governança e operação são tratados com evidências.
- A conclusão contém decisão recomendada e condições objetivas para avançar ou rejeitar.
- Nenhum código, contrato, dado, carteira, configuração ou ambiente foi alterado durante a análise.
- Não houve POC executável, transação, deploy nem consumo de créditos pagos.

## 7. Limites e exclusões

- Não implementar contratos Solidity nem fazer deploy em testnet/mainnet.
- Não criar ou migrar tokens, carteiras, chaves, RPCs, bridges, validadores ou infraestrutura.
- Não alterar emissão, supply, ledger, saldos, ordens, ativos habilitados, FIAT ou regras econômicas.
- Não realizar transações, testes com fundos reais ou movimentação de ativos.
- Não alterar schema, dados, RLS, policies, grants ou configurações Supabase.
- Não alterar código dos repositórios MeshWave nem iniciar refatoração.
- Não contratar serviços, assinar provedores, adquirir domínio ou assumir custos.
- Não realizar auditoria geral de todos os módulos MeshWave sem relação com esta decisão.
- Não tratar um benchmark isolado ou marketing de fornecedor como prova suficiente.

## 8. Método e governança

1. Após aprovação do TR, produzir Blueprint derivado e quadro de tarefas executável.
2. Reconciliar o estado atual dos repositórios e ambientes antes de qualquer conclusão sobre implementação.
3. Selecionar fontes primárias atuais e registrar datas, versões, commits e evidências.
4. Separar fatos observados, hipóteses, inferências, recomendações e decisões humanas.
5. Cada unidade assumida produz Operational Report próprio e atualiza o índice.
6. Se houver lacuna material de acesso ou evidência, registrar bloqueio específico; não preencher por inferência.
7. Não designar agente fixo. O SCP centraliza mensagens, ordens, validação e atribuição; qualquer agente elegível poderá assumir uma unidade não reivindicada.
8. Ao final, submeter recomendação ao responsável. A aprovação desta análise não autoriza implementação.

## 9. Gate humano

**AWAITING_HUMAN_VALIDATION.**

Este TR define a investigação, não uma decisão de adoção tecnológica. A missão só passa a PROGRESS após aprovação explícita do responsável. A aprovação do TR autoriza a análise descrita no Blueprint derivado; não autoriza POC, implementação, migração ou deploy.

## 10. Declaração de não execução

Na criação deste TR:
- nenhum código MeshWave foi alterado;
- nenhum banco ou configuração foi modificado;
- nenhum contrato ou token foi criado ou implantado;
- nenhuma carteira ou chave foi criada, migrada ou movimentada;
- nenhuma transação foi realizada;
- nenhuma POC executável foi iniciada;
- nenhum serviço pago foi contratado ou utilizado.
