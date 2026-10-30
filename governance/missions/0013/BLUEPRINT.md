# Blueprint da Missão 0013 — Prospecção de investidores e parceiros de capital para MeshWave

**Missão:** `MISSION_0013`
**Estado:** PROGRESS
**Orquestrador:** SofiaControlPanel (SCP)
**Projeto-alvo:** MeshWave / MWN — ativo digital e ecossistema MeshWave
**Data de registro:** 2026-10-29

## 1. Objetivo

Prospectar investidores para aporte na MeshWave, com duas alternativas distintas de contrapartida: (a) equity/participação societária na estrutura empresarial; ou (b) o próprio ativo digital MWN. A missão deve mapear, qualificar, abordar e acompanhar contatos, mantendo separadas as duas modalidades e validando a disponibilidade real de cada uma:

1. **Equity:** participação societária ou direitos econômicos em entidade/veículo juridicamente identificado, mediante estrutura, instrumento e condições ainda sujeitos a confirmação.
2. **Ativo digital MWN:** aquisição ou negociação do ativo criptográfico MWN como ativo digital real, com base em sua existência, funcionamento, titularidade, emissão, distribuição, transferibilidade, condições de aquisição e riscos verificáveis.

O objetivo é prospecção de investidores — não mobilização de apoiadores voluntários. A captação orgânica já implementada pelo responsável é uma frente existente e independente; não é a finalidade desta missão.

## 2. Histórico de nomenclatura — MWC → MWN

A designação inicial utilizada para a moeda/ativo foi **MWC**. O responsável informa que a denominação MWC já correspondia — ou havia correspondido — a outra moeda em circulação. Para evitar colisão de nomenclatura e possível confusão com esse ativo preexistente, foi tomada a decisão de alterar a designação do ativo MeshWave para **MWN**.

Regras de preservação histórica:
- **MWN** é a designação atual a utilizar em materiais, interfaces e comunicações novas, salvo quando uma referência técnica legada exigir o identificador antigo.
- **MWC** permanece nos registros históricos como denominação anterior do ativo MeshWave, inclusive em operações, transações, tabelas, migrações, commits e documentos produzidos sob essa nomenclatura.
- A mudança de nome não deve ser descrita como migração técnica, conversão automática, troca de contrato, alteração de supply ou mudança de titularidade, a menos que tais eventos sejam comprovados separadamente.
- Não reescrever nem apagar dados históricos MWC. Criar crosswalk explícito MWC (designação histórica do ativo MeshWave) → MWN (designação atual).
- O motivo da mudança é registrado como declaração do responsável; a existência e os detalhes da outra moeda MWC não foram objeto de verificação independente nesta tarefa.
- A data exata da decisão de renomeação não foi informada; não atribuir data retroativa.

Ver também o dossiê factual e os registros técnicos de reconciliação. A nomenclatura legada no banco/código deve ser reconciliada em tarefa técnica própria, com migração controlada e preservação de compatibilidade histórica.

## 3. Distinção de instrumentos

Equity e aquisição de MWN são vias diferentes e não devem ser apresentadas como equivalentes ou intercambiáveis:
- Equity depende da identificação da entidade emissora, titularidade, direitos oferecidos, governança, diluição, instrumento contratual e aprovações aplicáveis.
- MWN deve ser descrito como ativo digital somente na extensão sustentada por evidências técnicas e operacionais atuais. Não presumir que sua existência em blockchain, emissão, titularidade, oferta, transferência, preço, liquidez, resgate, listagem ou enquadramento regulatório estejam comprovados por uma declaração isolada.
- Não prometer retorno, valorização, liquidez, recompra, resgate, listagem, rendimento ou ganho.
- Não combinar equity e MWN em uma oferta híbrida sem decisão explícita e revisão jurídica/financeira apropriada.

## 4. Princípios de evidência e comunicação

Toda comunicação deve distinguir fatos comprovados, declarações do responsável ainda não verificadas, funcionalidades implementadas e testadas, funcionalidades em desenvolvimento e hipóteses/projeções. Não inventar métricas, valuation, cap table, quantidade emitida, tokenomics, preço, volume, liquidez, carteira, transações, parceiros, investidores, compromissos ou resultados. Não reutilizar automaticamente avaliações antigas de MWC como se fossem prova atual de MWN: a mudança de designação não comprova continuidade de especificações.

O material de apoiadores voluntários versão 1.0 não é documento-base desta missão e não pode ser usado para caracterizar a oferta de investimento. A iniciativa de apoiadores e a captação orgânica existente permanecem separadas.

## 5. Escopo de trabalho

- consolidar dossiê factual da MeshWave e do MWN, com evidências técnicas, operacionais, comerciais e societárias;
- identificar lacunas e documentos necessários para due diligence;
- estruturar trilhas separadas de prospecção para equity e MWN;
- identificar e priorizar investidores e parceiros de capital;
- mapear contatos e fontes públicas verificáveis;
- preparar tese, apresentação, FAQ e mensagens específicas por trilha;
- automatizar o envio de mensagens por canal conectado e autorizado, com fila, personalização controlada, registro de tentativa/resultado e prevenção de duplicidade;
- acompanhar respostas, reuniões, pedidos de informação e próximos passos;
- manter um arquivo mestre exportável (CSV) com o histórico individual de cada investidor.

## 6. Controle de contato e automação

O arquivo canônico de acompanhamento é `governance/missions/0013/CONTROLE_INVESTIDORES.csv`. O procedimento e os estados estão em `governance/missions/0013/AUTOMACAO_DE_CONTATOS.md`.

Cada investidor deve ter registro individual de:
- empresa/fundo, prioridade, tese/modalidade, contato público, canal e fonte;
- status de qualificação e de contato;
- mensagem/versão utilizada, data/hora de envio, identificador da mensagem e resultado técnico;
- entrega, rejeição/bounce, resposta, classificação da resposta, reunião, due diligence, follow-up e próxima ação;
- histórico de eventos, sem sobrescrever a evidência anterior.

Estados permitidos incluem: `IDENTIFIED`, `RESEARCHING`, `READY_FOR_APPROVAL`, `QUEUED`, `SENT`, `DELIVERED`, `BOUNCED`, `REPLIED`, `MEETING`, `DUE_DILIGENCE`, `DECLINED`, `NO_RESPONSE`, `FOLLOW_UP`, `ON_HOLD` e `DO_NOT_CONTACT`. Ausência de registro de envio significa **não contactado**, nunca enviado.

A automação não pode inventar destinatários, enviar para endereços inferidos, contornar formulários, disparar mensagens em massa sem personalização ou insistir após recusa. Respostas devem ser associadas ao investidor correto por endereço/identificador; correspondências ambíguas ficam pendentes de revisão humana.

## 7. Limites e autorizações

1. A missão autoriza pesquisa pública, qualificação, preparação de materiais e configuração do fluxo de automação.
2. O envio externo só poderá ocorrer pelo canal efetivamente conectado, usando destinatários verificados, mensagem aprovada e autorização de campanha que identifique o universo de destinatários, a modalidade apresentada e a conta remetente. Uma autorização genérica não autoriza preencher lacunas comerciais ou jurídicas com suposições.
3. Não registrar como enviado, entregue ou respondido sem confirmação observável do canal.
4. Não assumir compromissos em nome do responsável ou de qualquer entidade.
5. Não fornecer aconselhamento jurídico, tributário ou financeiro; estrutura societária, oferta de valores mobiliários, distribuição de criptoativos, KYC/AML, tributação e jurisdição exigem profissionais habilitados.
6. Não apresentar equity como disponível até que entidade emissora, direitos e instrumento estejam documentalmente definidos.
7. Não apresentar MWN como livremente transferível, negociável, resgatável ou líquido sem evidência atual e validação do responsável.
8. Não misturar listas, mensagens, termos ou métricas da captação orgânica de apoiadores com esta missão.
9. Não realizar scraping invasivo, contornar controles de acesso ou coletar dados pessoais além do estritamente necessário para contato profissional.
10. Antes de qualquer primeiro disparo, submeter ao responsável a mensagem-base, personalizações, remetente e lista exata de destinatários para aprovação. Após essa aprovação de campanha, o fluxo pode enviar e registrar automaticamente os destinatários aprovados, sem pedir confirmação mensagem a mensagem, respeitando limites e bloqueios definidos.

## 8. Entregáveis e tarefas

- 13.1 — Dossiê factual e matriz de evidências MeshWave/MWN.
- 13.2 — Matriz de estrutura e lacunas para equity e MWN.
- 13.3 — Segmentação, pesquisa e lista priorizada de investidores potenciais.
- 13.4 — Tese de investimento e materiais separados por modalidade.
- 13.5 — Plano de abordagem e mensagens personalizadas para aprovação.
- 13.6 — Automação de envio e acompanhamento, com controle mestre de contatos, respostas, reuniões e due diligence.

## 9. Critérios de aceite

- afirmações materiais ligadas a evidências ou marcadas como declaração/hipótese;
- equity e MWN claramente separados;
- riscos, limitações e pendências legais apresentados;
- contatos reais e provenientes de fontes públicas verificáveis;
- cada tentativa e resultado de comunicação rastreável;
- relatório exportável com status por investidor;
- histórico MWC→MWN preservado sem apagar dados antigos;
- não duplicar nem confundir MISSION_0011 ou MISSION_0012.

## 10. Dependências e estado

A missão está em PROGRESS. O responsável confirmou que a captação orgânica já está implementada e que esta frente deve prospectar investidores em troca de equity ou MWN. O Supabase `mwn` apresentou evidência agregada de aquisições e ledger piloto; os artefatos técnicos ainda contêm MWC. A estrutura societária para equity e os direitos/condições completos do ativo MWN permanecem pendentes. O kit de apoiadores voluntários v1.0 é explicitamente excluído como base desta missão.
