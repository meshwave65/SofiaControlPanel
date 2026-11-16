# Termo de Referência — MISSION_0026

## Avaliação Estratégica e Técnica de Reaproveitamento da Stack Ethereum no Ecossistema MeshWave

**Versão:** 0.1.0 — APROVADO  
**Aprovado por:** responsável pelo produto, nesta conversa, em 2026-11-16  
**Prioridade:** CRÍTICA — nível máximo cadastrado no SCP  
**Estado:** VALIDATED  
**Execução autorizada:** análise e recomendação, conforme limites deste TR  
**Documento anterior:** [TR-v0.1.0-DRAFT.md](./TR-v0.1.0-DRAFT.md), preservado como histórico e substituído por esta versão aprovada.

## 1. Objetivo

Avaliar se e como MeshWave pode acelerar sua evolução adotando tecnologias maduras do ecossistema Ethereum, evitando reconstruir do zero funcionalidades que já tenham soluções robustas, auditáveis, interoperáveis e economicamente vantajosas.

A avaliação cobre MWN, UMS, MW-Ex, carteiras, ledger, blockchain/rede MeshWave, PoUW e infraestrutura relacionada. O resultado será uma recomendação fundamentada sobre o que adotar, integrar, adaptar, manter próprio, substituir ou não utilizar.

## 2. Perguntas centrais

1. Quais partes da arquitetura atual MeshWave já reproduzem capacidades disponíveis no Ethereum/EVM?
2. Quais componentes podem ser reutilizados diretamente (EVM, Solidity, padrões ERC, bibliotecas, SDKs, clientes, indexadores, carteiras, ferramentas de auditoria e infraestrutura)?
3. É preferível construir sobre Ethereum mainnet, uma L2 EVM, uma appchain/sidechain EVM, um runtime compatível com EVM, ou manter uma cadeia própria com integração seletiva?
4. O que deve permanecer fora da blockchain por razões de privacidade, custo, desempenho, governança ou regras internas?
5. Como preservar as regras de UMS, MWN, MW-Ex e ledger sem abrir transferências ou operações proibidas pelo modelo econômico MeshWave?
6. Qual é a relação tecnicamente defensável entre PoUW e uma arquitetura de execução EVM? PoUW seria consenso, mercado de computação, camada de contribuição, mecanismo de recompensa ou combinação?
7. Quais custos, riscos, dependências, limites de escalabilidade, segurança, governança e lock-in surgem em cada alternativa?
8. Qual é o menor caminho de adoção que reduz esforço proprietário sem criar reengenharia ou dependência desnecessária?
9. Quais componentes atualmente construídos pela MeshWave devem deixar de ser desenvolvidos caso exista alternativa madura e comprovadamente superior?

## 3. Escopo de investigação

### 3.1 Estado atual MeshWave — evidência obrigatória

Inspecionar somente os repositórios, componentes e dados diretamente relacionados a:
- implementação de blockchain/rede e seu estado real;
- MWN: emissão, supply, contratos, transferências, carteiras e integração;
- UMS: ledger, saldos, regras de transferência e conversão;
- MW-Ex: negociação, lista de ativos habilitados, ordens e gateway UMS↔MWN;
- mecanismos PoUW e contribuições computacionais/armazenamento;
- infraestrutura de nós, validação, indexação, RPC e observabilidade, quando existentes.

Para cada componente, classificar: operacional comprovado, produção parcial, piloto/protótipo, desenvolvimento, conceito/roadmap ou não localizado. Exigir commit, arquivo, teste, deployment, consulta read-only ou outra evidência rastreável. Documentos históricos isolados não comprovam estado atual.

### 3.2 Ecossistema Ethereum e tecnologias adjacentes

Investigar documentação e implementações atuais, incluindo:
- Ethereum Virtual Machine (EVM) e execução de contratos;
- Solidity e, quando relevante, outras linguagens compatíveis;
- padrões de tokens e interfaces (ERC-20, ERC-721, ERC-1155 e padrões pertinentes);
- clientes de execução/consenso e ferramentas de desenvolvimento;
- carteiras, gestão de chaves, account abstraction e padrões de assinatura;
- bibliotecas, SDKs, indexadores, explorers, RPC e infraestrutura;
- redes L2/rollups e appchains EVM;
- práticas de auditoria, testes, verificação formal, upgradeability e governança;
- custos de execução, finalização, disponibilidade, liquidez, interoperabilidade e riscos de bridges.

Usar documentação primária atualizada, especificações, repositórios oficiais e evidências independentes de segurança. Separar capacidades do protocolo Ethereum das capacidades de fornecedores e serviços externos.

### 3.3 PoUW — análise separada e rigorosa

Distinguir explicitamente:
- consenso e seleção/finalização de blocos;
- execução de contratos e transações;
- computação útil realizada por participantes;
- verificação do resultado útil;
- atribuição de recompensas e contabilização de contribuições.

Analisar literatura técnica recente e projetos verificáveis de Proof-of-Useful-Work, incluindo segurança contra Sybil, trabalho falso, duplicado ou não verificável, verificação determinística/probabilística, incentivos, dificuldade, heterogeneidade de hardware, latência, energia, centralização e custo de validação.

Não afirmar que Ethereum usa PoUW. Registrar que Ethereum migrou de Proof-of-Work para Proof-of-Stake em 15/09/2022; essa transição é um estudo de consenso, não uma implementação de PoUW. Não presumir que PoUW possa substituir diretamente PoW ou PoS.

### 3.4 Alternativas arquiteturais a comparar

Comparar no mínimo:
A. Ethereum mainnet + contratos MeshWave.
B. L2 EVM existente + contratos MeshWave.
C. Appchain/sidechain EVM própria ou gerenciada.
D. Cadeia/runtime próprio com EVM incorporada ou compatibilidade seletiva.
E. Manter a arquitetura atual e adotar apenas padrões, ferramentas e bibliotecas Ethereum.
F. Alternativa não-EVM relevante, somente se houver benefício técnico demonstrável.

Comparar segurança e maturidade, custo, throughput/finalidade, descentralização, governança, interoperabilidade, esforço de desenvolvimento, manutenção, lock-in, privacidade, disponibilidade de tooling, liquidez e compatibilidade com PoUW.

## 4. Regras econômicas e arquiteturais invariáveis para avaliação

- UMS é a unidade econômica interna; as carteiras são individualizadas.
- Transferências diretas entre carteiras de usuários UMS não são permitidas.
- UMS não é livremente negociável no mercado externo.
- A conversão UMS↔MWN ocorre exclusivamente pela MW-Ex, respeitando controles e registros correspondentes.
- MWN é o ativo-ponte entre a economia interna e o mercado externo.
- A MW-Ex preserva compra e venda, mas só apresenta como negociáveis ativos explicitamente habilitados; MWN é atualmente o ativo operacional padrão.
- FIAT só pode ser creditado contra entrada financeira confirmada, com registro auditável no ledger.
- Saldos, emissão, aquisição, conversão, reversão, liquidação e retirada precisam ser reconciliáveis e auditáveis.
- Não introduzir transferibilidade, bridges, wrapping, mint/burn ou permissões administrativas que contornem essas regras sem decisão explícita do responsável.

A análise pode recomendar mudança de arquitetura, mas não pode redefinir silenciosamente a economia MeshWave.

## 5. Entregáveis obrigatórios

1. Inventário do estado atual com classificação de maturidade e evidências.
2. Mapa de equivalências entre capacidades MeshWave e soluções maduras Ethereum.
3. Matriz de decisão comparando alternativas A–F, com critérios e pesos justificados.
4. Arquitetura recomendada e responsabilidades de EVM/contratos, MWN, UMS, MW-Ex, ledger e PoUW.
5. Matriz de reaproveitamento: ADOTAR, INTEGRAR, ADAPTAR, MANTER PRÓPRIO, SUBSTITUIR ou NÃO USAR.
6. Análise de migração/compatibilidade: contratos, carteiras, saldos, histórico, supply, endereços, custódia e integração MW-Ex.
7. Riscos e controles: contratos, chaves, bridges, oráculos, upgrades, consenso, disponibilidade, governança, privacidade, conformidade e fornecedores.
8. Plano faseado, dependências, esforço/custo qualitativo, gates e critérios go/no-go.
9. Recomendação executiva: o que parar de construir, reaproveitar e manter próprio.
10. Referências atuais, primárias e independentes, com data de consulta e distinção entre fato e opinião.

## 6. Critérios de aceite

- Estado atual sustentado por evidências atuais, não por documentos históricos isolados.
- Ethereum, Bitcoin, PoW, PoS e PoUW corretamente diferenciados.
- Execução EVM, consenso, liquidação, economia de tokens e computação útil avaliados como responsabilidades distintas.
- Alternativas comparadas pelos mesmos critérios.
- Regras UMS/MWN/MW-Ex preservadas ou incompatibilidades explicitamente demonstradas.
- Reaproveitamento distinguido entre adoção imediata, adaptação e rejeição.
- Riscos de contratos, custódia, bridges, governança e operação tratados com evidências.
- Conclusão com recomendação e condições objetivas de avanço/rejeição.
- Nenhum código, contrato, dado econômico, carteira, chave, configuração ou ambiente alterado durante a análise.
- Nenhuma POC executável, transação, deploy ou contratação de serviço realizada.

## 7. Limites e exclusões

- Não implementar contratos Solidity nem fazer deploy em testnet/mainnet.
- Não criar ou migrar tokens, carteiras, chaves, RPCs, bridges, validadores ou infraestrutura.
- Não alterar emissão, supply, ledger, saldos, ordens, ativos habilitados, FIAT ou regras econômicas.
- Não realizar transações, testes com fundos reais ou movimentação de ativos.
- Não alterar schema, dados econômicos, RLS, policies ou grants de módulos financeiros.
- Não alterar código dos repositórios MeshWave nem iniciar refatoração.
- Não contratar serviços, assinar provedores, adquirir domínio ou assumir custos.
- Não realizar auditoria geral de módulos sem relação com a decisão arquitetural.
- Não tratar benchmark isolado ou marketing de fornecedor como prova suficiente.

**Exceção de governança autorizada pelo responsável:** aplicar correções de segurança estritamente necessárias ao registro de governança da própria MISSION_0026, incluindo RLS de `sofia."governanceMissions"`. Essa autorização não se estende a tabelas financeiras, carteiras, ledger, saldos ou políticas de outros módulos. Qualquer ampliação exige autorização específica.

## 8. Método e governança

1. TR aprovado em 2026-11-16.
2. Blueprint derivado desta versão aprovada, com tarefas, dependências, evidências e critérios de aceite.
3. Reconciliar repositórios, commits e ambientes atuais antes de concluir sobre implementação.
4. Selecionar fontes primárias atuais e registrar datas, versões, commits e evidências.
5. Separar fatos observados, hipóteses, inferências, recomendações e decisões humanas.
6. Cada unidade executada produz Operational Report próprio e atualiza o índice operacional.
7. Lacunas materiais de acesso/evidência devem ser registradas como bloqueios, nunca preenchidas por inferência.
8. Não designar agente fixo. O SCP centraliza mensagens, ordens, validação e atribuição conforme elegibilidade e disponibilidade.
9. A conclusão será submetida ao responsável. Aprovação da análise não autoriza implementação.

## 9. Gate humano e autorização

**TR VALIDATED — 2026-11-16.**

A aprovação deste TR autoriza a análise e a recomendação descritas no Blueprint derivado. Não autoriza POC executável, implementação, migração, transação ou deploy. Qualquer desenvolvimento posterior dependerá de decisão humana e missão/gate próprios.

Mantém-se a diretriz de validar interesse externo antes de investimento em desenvolvimento além do conceito: sem investimento externo, não avançar além da análise conceitual e arquitetural.

## 10. Registro de aprovação e integridade

A aprovação foi expressamente dada pelo responsável nesta conversa. A versão aprovada substitui o draft para execução e deve ser registrada como versão VALIDATED no repositório e no registro documental do SCP. O draft original permanece preservado como histórico.

Nenhum código MeshWave, contrato, token, carteira, chave ou dado financeiro foi alterado pela aprovação deste TR.
