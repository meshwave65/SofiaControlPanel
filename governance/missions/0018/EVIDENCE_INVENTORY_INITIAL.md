# MISSION_0018 — Inventário inicial de evidências da base funcional MeshWave

**Tarefa:** 18.1 — Reconciliar estado factual e montar inventário de evidências  
**Snapshot:** 2026-11-07  
**Estado deste artefato:** levantamento documental inicial; não é auditoria técnica completa nem material de divulgação.

## Critério de leitura

- **Evidência documental:** artefato persistido no repositório que descreve arquitetura, missão, estudo ou implementação. Não prova, sozinho, execução em produção.
- **Declaração do responsável:** informação contextual registrada nas conversas e orientações do projeto; deve ser validada em fonte canônica quando aplicável.
- **Status de maturidade:** a classificação abaixo descreve o grau sustentado pelas fontes consultadas, não presume uso, receita, usuários ativos, integração, segurança auditada ou prontidão de mercado.

## Mapa de componentes e evidências

| Componente | Estado documental preliminar | Evidência disponível | Limite / validação pendente |
|---|---|---|---|
| MeshWave / MWN estratégia de lançamento | Estratégia em estruturação | [Blueprint MISSION_0018](../governance/missions/0018/BLUEPRINT.md); missão e tarefas MISSION_0018 na raiz | Não há confirmação aqui de emissão, cadeia, contrato, direitos, lançamento ou listagem; verificar repositórios e registros canônicos |
| UMS e carteiras | Arquitetura proposta / declarada | Blueprint MISSION_0018 define a hipótese de unidade interna e registra arquitetura discutida; memória de projeto descreve carteiras individuais segregadas e ausência de transferências diretas | Implementação e controles precisam ser confirmados nos artefatos de produto; não afirmar conversão existente |
| MW-Ex | Conceito / proposta | Blueprint MISSION_0018 a trata como exchange interna proposta | Não certificada como implementada ou operacional; requer desenho, compliance, segurança, operação e aprovação |
| Jardim do Éden | Conceito / desenvolvimento estratégico, com dependências futuras | Diretriz do responsável: adaptação/evolução sobre a base reconhecível do SimCity; materiais de conceito em conversas recentes | Não afirmar licença EA/Maxis; qualquer contato/licenciamento é exploratório. Microsoft expressamente fora da proposta. Não declarar parceria oficial |
| SimCity (base reconhecível) | Referência de posicionamento, não parceria comprovada | Diretriz do responsável sobre uso do reconhecimento popular de SimCity para contextualizar Jardim do Éden | Não afirmar aquisição pela Microsoft/EA ou licença. Confirmar direitos e enquadramento antes de comunicação externa |
| SOFIA / SWE | Produto em desenvolvimento concreto; estado por componente | Contexto de projeto registra SWE MVP, stack React/Vite + FastAPI + Supabase, extração de conversas e artefatos; repositórios identificados incluem [SofiaControlPanel](https://github.com/meshwave65/SofiaControlPanel) e [engines](https://github.com/meshwave65/engines) | Contexto não substitui inspeção de builds, testes, deployment e usuários. Evitar generalizar status do SWE a todo o ecossistema SOFIA |
| MeshWalker / processamento e armazenamento federados | Proposta/arquitetura e estudo econômico subordinado | [MISSION_0017 blueprint](../governance/missions/0017/BLUEPRINT.md); MISSION_0017 é estudo de potencial econômico/capacidade | Cálculos e cenários são estimativas, não capacidade instalada, demanda, monetização ou receita comprovada |
| MIA-D / Condenser | Conceito/MVP em amadurecimento segundo declaração do responsável | Contexto de projeto descreve Condenser como otimizador de consultas e MIA-D como metodologia/índice evolutivo | Necessário localizar versões, resultados de teste e evidência de uso; não tratar como validação científica definitiva ou accounting certificado |
| Candidatura Binance | Alegação declarada; status não verificado neste levantamento | Blueprint registra candidatura informada pelo responsável como item de auditoria | Sem aprovação/listagem presumida; obter confirmação documental e data/status |
| Comunidade, apoiadores, capital e parceiros | Prospeção e preparação | [MISSION_0012](../../MISSION_0012%20-%20Mobilizacao%20de%20apoiadores%20iniciais%20da%20MeshWave%20-%20STAGED.md); [MISSION_0013](../../MISSION_0013%20-%20Prospeccao%20de%20investidores%20e%20parceiros%20de%20capital%20MeshWave%20-%20PROGRESS.md) | Missões não comprovam compromissos, aportes, parceiros contratados ou comunidade ativa |

## Fontes canônicas consultadas

1. [AGENTS.md](../../AGENTS.md) — procedimento operacional e obrigação de OR.
2. [GOVERNANCE.md](../../GOVERNANCE.md) — estados e governança de missões.
3. [Blueprint MISSION_0018](../governance/missions/0018/BLUEPRINT.md) — escopo e gates.
4. [Blueprint MISSION_0017](../governance/missions/0017/BLUEPRINT.md) — estudo econômico subordinado.
5. [MISSION_0018 PROGRESS](../../MISSION_0018%20-%20Estrat%C3%A9gia-base%20de%20lan%C3%A7amento%20da%20criptomoeda%20MeshWave%20(MWN)%20-%20PROGRESS.md) e [TASKS PROGRESS](../../MISSION_0018%20-%20TASKS%20-%20PROGRESS.md).
6. Registros MISSION_0012, MISSION_0013, MISSION_0017, MISSION_0018 na raiz do SCP.

## Lacunas prioritárias para fechar a tarefa 18.1

1. Obter árvore atual e evidências canônicas de cada repositório do ecossistema (especialmente aplicações, contratos/token, exchange, game, Condenser/MIA-D e MeshWalker).
2. Confrontar status de missões e tarefas com os arquivos de progresso, PRs, commits, testes e deployments.
3. Registrar por componente: evidência direta, última atividade verificável, classificação, dependências, limitações e nível de confiança.
4. Auditar status documental da candidatura Binance e a arquitetura UMS/MWN, sem extrapolar.
5. Produzir índice de evidências navegável com link executivo → dossier temático → fonte primária.
6. Somente após cobertura suficiente fechar 18.1 e avançar para tarefas dependentes.

## Conclusão provisória

O repositório de governança comprova que existe uma estratégia estruturada e um portfólio de missões em andamento; ele não basta para provar, sozinho, que cada componente do ecossistema está operacional. O pitch deve usar a distinção explícita entre entregas documentadas, declarações, desenvolvimento e propostas. A tese de “base funcional” precisa ser demonstrada com evidência primária de cada componente antes de ser usada como afirmação pública.


## Complemento — presença de repositórios canônicos (consulta de árvore GitHub)

Em 2026-11-07 foram consultadas as árvores de diretório na branch padrão `main` dos seguintes repositórios. **A existência de arquivos/estrutura é evidência de artefato de desenvolvimento, não de execução em produção.** Os links permitem inspeção da fonte:

| Frente | Repositório e sinais documentais observados | Classificação conservadora |
|---|---|---|
| Núcleo MeshWave | [MeshWave-Core](https://github.com/meshwave65/MeshWave-Core): documentação arquitetural, app Android, app_engine, clients, tasks e relatórios | Artefatos de desenvolvimento; funcionalidade/atividade de runtime não validada nesta consulta |
| Arquitetura e documentação da rede | [Foundation_MeshWave](https://github.com/meshwave65/Foundation_MeshWave): documentação de arquitetura, integração, rede mesh, armazenamento/processamento, segurança e BCE | Base documental e de desenvolvimento; módulos precisam de evidência funcional individual |
| Blockchain / camada MWN | [meshwave-blockchain](https://github.com/meshwave65/meshwave-blockchain): ARCHITECTURE.md, README, src, tests e diretório Supabase | Implementação de software presente; deploy, contratos/ledger efetivo, testes executados e estado operacional não validados |
| Simulador MWC/UMS | [mwc-ums-sim](https://github.com/meshwave65/mwc-ums-sim): documentação técnica, src, node-agent, projects, Supabase e tests | Simulador/artefatos de desenvolvimento; não prova economia UMS em produção ou conversão real |
| Aplicação SOFIA MIA | [sofia-mia](https://github.com/meshwave65/sofia-mia): app web com src, package.json e configuração Vite | Aplicação de desenvolvimento; build/deployment/uso não validados |
| SOFIA legado/monorepo | [sofia](https://github.com/meshwave65/sofia): código Python, documentação/arquitetura, scripts, módulos e relatórios | Código e documentação existentes; estado de operação e atualidade heterogêneos, necessitam auditoria por componente |
| SWE / extração | [SofiaWebExtractor](https://github.com/meshwave65/SofiaWebExtractor): backend e projetos Vite; [engines](https://github.com/meshwave65/engines): extractor universal, workers, downloader e requirements | Componentes de software identificados; não validar funcionamento de ponta a ponta apenas pela árvore |
| Condenser | [condenser-pro-poc](https://github.com/meshwave65/condenser-pro-poc) e [sofia-condenser-pro](https://github.com/meshwave65/sofia-condenser-pro): aplicações Vite com src/view | POCs/projetos de software; não provar MIA-D validado nem benefício ambiental medido |
| App MeshWave | [AppMeshWave](https://github.com/meshwave65/AppMeshWave): projeto Android (app/, Gradle) | Artefato de desenvolvimento; versão distribuída, testes e usuários não validados |
| Inventário/gestão de rede | [network](https://github.com/meshwave65/network): AGENTS.md, INDEX.md, NETWORK_INVENTORY.md, projects, docs, governance e validation | Inventário e governança persistidos; não presumir que todos os projetos listados estejam ativos |

### Limite desta rodada

Foi feita consulta de presença e estrutura em nível de raiz, não leitura integral dos READMEs, histórico de commits, CI, testes, deployments, stores, blockchain explorers ou demonstrações. Portanto, os rótulos acima permanecem conservadores. O próximo trabalho deve aprofundar repositórios e localizar evidência de execução verificável antes de promover qualquer item a “funcional/ativo” ou “implementado e validado”.


## Complemento — leitura de fontes primárias e distinção de pilotos

A leitura dos READMEs e documentos de estado dos repositórios revelou evidência mais específica que a consulta de árvore. Os status abaixo são limitados ao escopo que a própria fonte descreve:

| Componente | Evidência primária | Classificação sustentada | O que não se pode afirmar |
|---|---|---|---|
| Ledger econômico piloto MWC | [README blockchain](https://github.com/meshwave65/meshwave-blockchain/blob/main/README.md), [estado do piloto em 24/10/2026](https://github.com/meshwave65/meshwave-blockchain/blob/main/docs/PILOT_STATE_2026-10-24.md), [runbook](https://github.com/meshwave65/meshwave-blockchain/blob/main/docs/PILOT_RUNBOOK.md) | **Piloto operacional controlado, centralizado em um operador e com registros Supabase hash-linked**, conforme estado documentado: dois blocos e dois eventos descritos no snapshot | Não é blockchain distribuída de produção, Genesis canônico ou consenso independente. Snapshot declara canonical=false; não há aquisições de terceiros no snapshot. A taxa de referência R$ 1 milhão não comprova depósito, reserva, auditoria ou valuation independente. O snapshot não equivale a leitura direta ao vivo do banco nesta sessão |
| Simulador de economia MWN/UMS | [README do simulador](https://github.com/meshwave65/mwc-ums-sim/blob/main/README.md), [relatório técnico](https://github.com/meshwave65/mwc-ums-sim/blob/main/RELATORIO_TECNICO.md) | **Protótipo local de simulação econômica**, explicitamente em memória | Não é moeda, investimento, pagamento ou operação financeira; não emite créditos reais nem comprova preço, conversibilidade ou demanda |
| Protótipo de armazenamento compartilhado | [README do simulador](https://github.com/meshwave65/mwc-ums-sim/blob/main/README.md), [agente de nó](https://github.com/meshwave65/mwc-ums-sim/blob/main/node-agent/README.md), [blueprint V0 congelado](https://github.com/meshwave65/network/blob/main/projects/mwc/blueprints/PROTOTIPO_ARMAZENAMENTO_VOLUNTARIO_V0.md) | **Implementação de laboratório/protótipo**, com descrição de persistência local, leitura/verificação por hash e sincronização remota Supabase em escopo inicial | Não comprova rede distribuída autônoma, replicação entre nós, validação PoUW independente, emissão UMS, consenso, segurança operacional ou uso por participantes reais. O próprio documento aponta limitações e controles ainda necessários |
| Arquitetura UMS/MWN/PoUW | [registro conceitual BCE](https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/temas/economia-ums-mwn-pouw-liquidez-distribuida.md) | **Conceito/arquitetura em consolidação** | O documento declara não ser especificação final nem comprovação de implementação |
| Condenser / MIA-D | [repositórios de aplicação](https://github.com/meshwave65/sofia-condenser-pro) e [POC](https://github.com/meshwave65/condenser-pro-poc) | **Artefatos de aplicação/POC**, sem evidência suficiente nesta rodada para atestar medição MIA-D validada | Não afirmar impacto ambiental efetivo, metodologia certificada, resultados científicos validados ou adoção |
| SOFIA MIA | [README](https://github.com/meshwave65/sofia-mia/blob/main/README.md) | **Repositório web presente**, mas README ainda é template Vue/Vite | Não usar a mera existência deste repo como prova de produto funcional ou implantação |
| MeshWave-Core / app mesh Android | [README](https://github.com/meshwave65/MeshWave-Core/blob/main/README.md), [blueprint](https://github.com/meshwave65/MeshWave-Core/blob/main/PROJECT_BLUEPRINT.md) | **Artefatos de desenvolvimento e arquitetura**; blueprint descreve Project C3 e tecnologias de referência | Não é prova de rede mesh produtiva, interconexão distribuída ou usuários conectados |

### Evidência positiva versus maturidade

Há base documental e software concreto — inclusive um ledger piloto operacional documentado e um protótipo de armazenamento —, mas esses são estados específicos e limitados. A tese executiva adequada é que **MeshWave já possui artefatos e pilotos que podem sustentar evolução**, não que todo o ecossistema ou a economia UMS/MWN estejam plenamente operacionais. Jardim do Éden permanece uma frente de conceito/proposta nesta auditoria; SimCity é somente referência reconhecível, sem parceria/licença afirmada.


## Complemento — evidência CI de testes e build (consulta 2026-11-07)

Foram consultados os registros de GitHub Actions (status e etapas dos jobs). Isto comprova que workflows específicos terminaram com sucesso na revisão associada; **não comprova deploy em produção, uso por usuários, auditoria de segurança ou validade operacional além do escopo dos testes**.

| Componente | Workflow/run verificado | Resultado | Limite |
|---|---|---|---|
| Software blockchain | [tests — run 40085064692 (24/10/2026)](https://github.com/meshwave65/meshwave-blockchain/actions/runs/40085064692) | Job test, instalação e etapa Run tests concluíram com sucesso | Não valida ledger em produção, consenso distribuído ou estado financeiro |
| Simulador MWC/UMS | [CI — run 41635964106 (03/11/2026)](https://github.com/meshwave65/mwc-ums-sim/actions/runs/41635964106) | Build e Regression tests concluíram com sucesso | Não prova emissão/conversão UMS real |
| Agente de armazenamento | [Storage Node tests — run 40104678215 (24/10/2026)](https://github.com/meshwave65/mwc-ums-sim/actions/runs/40104678215) | unit-tests e Run storage node tests concluíram com sucesso | Não comprova rede multi-nó independente ou produção |
| Laboratório storage | [VM Lab smoke test — run 40104678212 (24/10/2026)](https://github.com/meshwave65/mwc-ums-sim/actions/runs/40104678212) | Smoke test de runner/VM única, testes e upload de evidência concluíram com sucesso | Não valida topologia distribuída |

**Maturidade ajustada:** estes componentes podem ser descritos como “CI de build/testes automatizados aprovado em revisões específicas”. MWC segue “piloto controlado/documentado”; storage, “laboratório/protótipo”. Nada aqui comprova rede produtiva, economia real, adoção ou produção descentralizada.


## Complemento — reconciliação de missões estratégicas e snapshots de atividade (07/11/2026)

A leitura dos registros de missão e dos dossiês factuais acrescenta contexto necessário à estratégia MWN. Os dados abaixo são **snapshots datados**, não consultas ao banco ao vivo nesta sessão.

| Frente | Status nos registros canônicos | Evidência e limites |
|---|---|---|
| MISSION_0012 — apoiadores voluntários | STAGED | Registro declara que nenhuma campanha foi publicada, contribuição solicitada/recebida ou pessoa/grupo contatado; o fluxo precisa de auditoria e enquadramento. Esta trilha é expressamente distinta de investimento ou venda de MWN. |
| MISSION_0013 — investidores | PROGRESS | O dossiê factual de 29/10/2026 documenta consulta read-only ao Supabase com snapshot de 10 blocos, 10 transações, 8 aquisições validadas e 1 rejeitada, 8 carteiras e valor agregado de R$13,02. É atividade piloto registrada, não volume de mercado, receita recorrente, valuation, adoção ampla ou liquidez. A seção de progresso registra envio de dois contatos exploratórios; entrega/leitura não foram confirmadas independentemente. |
| MISSION_0013 — oferta e direitos | Parcial / dependente de definição | A matriz de lacunas não localizou documentos suficientes para definir entidade/instrumento de equity, direitos do ativo, supply, transferibilidade externa, liquidez ou termos completos. Não há oferta concreta sustentada por esses registros. |
| MISSION_0017 — capacidade distribuída/economia | STAGED | Missão subordinada à MISSION_0018. 17.1 deve recuperar cálculo histórico de storage/AWS; cenário de contribuição de 1% é premissa declarada, não capacidade ativa mensurada nem caixa/receita. |
| MISSION_0018 — estratégia MWN | PROGRESS | 18.1 continua em curso; 18.2–18.9 permanecem STAGED, sem decisões finais sobre tokenomics, MW-Ex, lançamento, compliance ou mercado. |

### Divergências que exigem reconciliação antes de material externo

- O dossiê MISSION_0013, datado 29/10, registra 10 blocos/10 transações e atividade de aquisição. O snapshot do blockchain consultado em outro documento, datado 24/10, descreve apenas dois blocos/dois eventos. As datas e versões explicam que podem ser snapshots diferentes; não devem ser fundidos nem apresentados como um único estado. Priorizar os registros mais recentes e realizar consulta direta ao banco quando a comunicação depender do estado atual.
- O arquivo de progresso da MISSION_0013 contém uma seção anterior dizendo que nenhum envio ocorreu, seguida de atualizações posteriores registrando dois contatos enviados. O estado mais recente indica envios, mas o registro deve ser limpo/reconciliado cronologicamente para evitar contradição documental.
- O histórico técnico permanece com código/ledger legado MWC apesar da designação atual MWN informada pelo responsável. Não declarar migração integral, equivalência técnica ou mudança de contrato/supply apenas com base na renomeação.

### Formulação permitida para a tese

Existe evidência documental de um ledger piloto e de aquisições registradas em ambiente controlado, além de protótipos e software com CI aprovado em revisões específicas. O valor demonstrativo é a **base técnica em evolução**, não prova de blockchain pública, liquidez, usuários em escala, caixa gerado, preço de mercado ou prontidão para listagem.


## Complemento — auditoria de atividade recente dos repositórios (2026-11-08)

Consulta read-only dos três commits mais recentes em cada repositório listado, com abertura do commit mais recente por frente para confirmar data e mensagem. **Commit recente prova atividade de versionamento, não funcionamento em runtime.** Datas em UTC; o conteúdo deve ser lido conforme o escopo do commit.

| Frente | Último commit observado | Data | O que sinaliza / limite |
|---|---|---|---|
| [MeshWave-Core](https://github.com/meshwave65/MeshWave-Core/commit/726b9e4bfde4c61e798867462b96ebf875876f37) | “Congela estado do projeto antes da migração para arquitetura SOFIA” | 2025-07-29 | Base congelada/documentação de transição; não evidência de execução atual. |
| [Foundation_MeshWave](https://github.com/meshwave65/Foundation_MeshWave/commit/7e8b3864414f2ce8810dcea5ca67d2036bf65b8e) | “index phased investment proposal” | 2026-11-06 | Atualização documental recente; não comprova capital captado ou operação. |
| [meshwave-blockchain](https://github.com/meshwave65/meshwave-blockchain/commit/f6785f54bdbd7d8c016f21f2989797beed207ac2) | “specify wallet-level and automatic MWC reconversion” | 2026-10-24 | Especificação de fluxo/carteira; confirmar implementação e execução antes de afirmar reconversão operacional. |
| [mwc-ums-sim](https://github.com/meshwave65/mwc-ums-sim/commit/3517623a8376dc1ea4327b695e6da2d9137581a0) | “Update MWC reference to MWN in briefing.md” | 2026-11-03 | Atualização terminológica em briefing; não altera por si só o estado do piloto MWC. |
| [SofiaWebExtractor](https://github.com/meshwave65/SofiaWebExtractor/commit/51783f82be05cc87845b0b72c7b2d90aed66da10) | “Add supabase to requirements” | 2026-09-22 | Alteração de dependências; não valida ponta a ponta. |
| [engines](https://github.com/meshwave65/engines/commit/febe5446bdfa80dc2959167768c35713fa67c0c4) | “continue monitoring delegated tasks” | 2026-10-19 | Ajuste no worker online; deployment/serviço em runtime não confirmado nesta consulta. |
| [sofia-mia](https://github.com/meshwave65/sofia-mia/commit/eac2860ced958f1c9745ec9a767eaa2c3340ef7f) | “Update GlobalAquometer.vue” | 2025-10-13 | Commit de UI; atividade atual/build/deploy não comprovados. |
| [sofia-condenser-pro](https://github.com/meshwave65/sofia-condenser-pro/commit/a66dbc32ac68b5e06f3cbd32098e88fd0bad5e4c) | “Update App.vue” | 2025-10-12 | Commit de aplicação; não comprova métrica MIA-D validada. |
| [condenser-pro-poc](https://github.com/meshwave65/condenser-pro-poc/commit/8967b5de6e92ba437f96fd675c652ef1f6d2ba1f) | “Forçando sincronização completa a partir do ambiente local funcional” | 2025-10-10 | A mensagem registra alegação de ambiente local funcional, mas não há teste independente nesta auditoria. |
| [AppMeshWave](https://github.com/meshwave65/AppMeshWave/commit/38b6f7450205f0349f98f3320731d02470e7da8b) | “Add project files and CC-BY-NC-SA-4.0 license” | 2026-04-16 | Publicação inicial de arquivos/licença; sem prova de distribuição ou usuários. |
| [network](https://github.com/meshwave65/network/commit/6e499e0d9b4f3f01ce1b3b21afb452d2ae5f7dcb) | “map Joana Marçal B Prime Office Agency” | 2026-11-06 | Atividade de inventário/OCINT; não deve ser interpretada como parceria contratada. |

### Reavaliação de evidência

- A atividade recente é desigual: Foundation_MeshWave, network, simulator e blockchain têm commits recentes, enquanto MeshWave-Core, SOFIA MIA, Condenser e POC têm commits de 2025 ou anteriores/menos recentes na consulta. O SWE e engines apresentam alterações de 2026, mas o estado online e o caminho ponta a ponta continuam sem prova nesta rodada.
- As classificações anteriores permanecem conservadoras. Não há promoção para “funcional/ativo” baseada apenas em commit.
- O item de maior valor para fechar 18.1 agora é validar deployments/runtime por serviço e reconciliar os estados canônicos de token, UMS, MW-Ex, candidatura Binance e evidências de uso, sem extrapolar snapshots.


## Complemento — CI e vínculo de deployments (2026-11-08)

### Workflow observado em Foundation_MeshWave

Na revisão de Actions para o commit `7e8b3864414f2ce8810dcea5ca67d2036bf65b8e` (06 nov 2026), foram encontrados múltiplos workflows acionados simultaneamente pelo mesmo push. Há pelo menos um workflow de estrutura com sucesso e outros com falha. Inspeção dos jobs/logs confirmou causas distintas:

- [Run 42229976423](https://github.com/meshwave65/Foundation_MeshWave/actions/runs/42229976423): workflow “Create Directory Structure” concluiu com sucesso.
- [Run 42229976417](https://github.com/meshwave65/Foundation_MeshWave/actions/runs/42229976417): passo de criação de diretórios falhou com erro shell na linha 17; o caminho `Estrutura/Armazenamento_Processamento/FASE1` foi interpretado como comando inexistente, indicando quebra/continuação incorreta da linha de shell.
- [Run 42229976425](https://github.com/meshwave65/Foundation_MeshWave/actions/runs/42229976425): etapa de commit/push falhou com HTTP 403, “Permission to ... denied to github-actions[bot]”; o job tentou push mesmo sem mudanças.
- [Run 42229976254](https://github.com/meshwave65/Foundation_MeshWave/actions/runs/42229976254): commit/push também falhou por permissão 403 do `github-actions[bot]`.

Interpretação: os workflows automatizados de estruturação do Foundation não devem ser apresentados como processo CI saudável/estável. A execução bem-sucedida de um workflow separado não elimina as falhas paralelas; estas são tarefas de automação documental/estrutura, não testes de produto. O estado de correção posterior não foi verificado.

### Vínculo Vercel

Consulta read-only do contexto de projetos Vercel retornou a equipe e os projetos Git vinculados disponíveis, mas não identificou os repositórios consultados `sofia-mia`, `sofia-condenser-pro`, `condenser-pro-poc`, `SofiaWebExtractor` ou `AppMeshWave` entre os projetos Vercel vinculados. Isto **não prova ausência de deployment** em outras plataformas ou contas; significa apenas que a conexão consultada não forneceu um vínculo Vercel direto para estes repositórios. Deployment/runtime deve continuar como “não validado” até fonte específica.

### Ajuste de leitura da evidência

- CI aprovado permanece ligado a revisões e testes específicos (blockchain, simulador e laboratório MWC), não é atestado global de saúde do ecossistema.
- Foundation_MeshWave tem evidência atual de falhas em workflows utilitários e não pode ser categorizado como “CI verde” com base no run de sucesso isolado.
- Nenhum deploy, produção, usuários, receita, conversão, liquidez ou operação de rede foi confirmado nesta consulta.


## Complemento — reconciliação do estado de prospecção MISSION_0013 (2026-11-08)

A documentação canônica da MISSION_0013 apresenta atualização cronológica divergente: seções anteriores afirmam “nenhum envio”, enquanto a atualização mais recente descreve dois primeiros contatos enviados em 29/30 de outubro. O arquivo da missão já contém os IDs Gmail, que foram verificados em modo somente leitura por metadados na caixa autenticada:

- Registro OKX Ventures: remetente info@meshwave.com.br, destinatário ventures@okx.com, data 2026-10-30T00:54:17Z, label SENT, ID registrado 1a18a4ce5645ca3f.
- Registro Blockchain Founders Fund: remetente info@meshwave.com.br, destinatário contact@bff.com, data 2026-10-30T00:54:21Z, label SENT, ID registrado 1a18a4cf39ef2210.

Conclusão reconciliada: os registros Gmail corroboram que dois emails foram enviados e estão marcados como SENT. Isso não comprova entrega, leitura, resposta, interesse, reunião ou negociação. O texto “nenhum envio” em blocos anteriores da missão e do task board 13.6 está desatualizado em relação ao registro posterior; deve ser mantido como histórico com indicação explícita de supersessão, não como status corrente. Nenhum follow-up foi enviado nesta auditoria.

### Estado de tarefas cruzadas

- MISSION_0012 continua STAGED; o registro diz que não houve campanha ou solicitação de contribuição.
- MISSION_0013 está PROGRESS; 13.5/13.6 permanecem em andamento segundo o arquivo da missão, e 13.6 já tem dois envios verificados por metadados Gmail, com entrega/leitura não confirmadas.
- MISSION_0017 continua STAGED; contribuição de 1% é premissa declarada para estudo, não capacidade instalada/medida ou receita.
- MISSION_0018 permanece PROGRESS; 18.1 não fecha até reconciliar os estados, o inventário e as lacunas de runtime.


## Complemento — reconciliação técnica de UMS, MWN e fronteira de especificação (2026-11-08)

### Identidade da moeda e limites de migração

O crosswalk de [network — MWN↔MWC, 29/10/2026](https://github.com/meshwave65/network/blob/main/docs/blueprints/MWN_MWC_RECONCILIATION_2026-10-29.md) registra a instrução do responsável de que **MWN é o nome atual da criptomoeda** e MWC permanece como legado. O mesmo documento delimita que a renomeação não aprova supply, direitos, emissão, utilidade, circulação, preço, conversão ou estado operacional, e preserva o workspace histórico `projects/mwc/` sem migração textual destrutiva. Registra ainda uma divergência explícita: o simulador possui relação paramétrica `1.000 UMS = 1 MWN = R$ 1,00`, que não pode ser apresentada como especificação normativa ou preço.

### UMS: evidência de protótipo e controle implementado no piloto

- [Relatório G4 — reconciliação UMS](https://github.com/meshwave65/network/blob/main/docs/blueprints/G4_UMS_RECONCILIATION_REPORT.md) classifica o ledger experimental como `PROTOTYPE_TESTED_LOCAL`; coeficientes são provisórios, não benchmark aprovado nem preço. A fonte registra 23 testes executados localmente em 22/10/2026.
- [Migração blockchain 20261024080000](https://github.com/meshwave65/meshwave-blockchain/blob/main/supabase/migrations/20261024080000_enforce_ums_nontransferability_via_mwc.sql) contém guardas para impedir transferências diretas de UMS entre participantes e exigir evento de protocolo associado. [Migração 20261024081000](https://github.com/meshwave65/meshwave-blockchain/blob/main/supabase/migrations/20261024081000_allow_authenticated_own_ums_conversion.sql) concede execução autenticada à conversão própria UMS→MWC e restringe anon/public.
- [Estado do piloto de 24/10/2026](https://github.com/meshwave65/meshwave-blockchain/blob/main/docs/PILOT_STATE_2026-10-24.md) relata aplicação e verificação dessas migrations em ambiente Supabase, teste negativo rejeitado e cadeia de dois blocos/dois eventos naquele snapshot; o documento marca `canonical=false`, operador único, e deixa a cerimônia Genesis formal independente pendente. Trata-se de estado reportado por documentação do projeto, não leitura live de banco realizada nesta tarefa.
- O estado de piloto documentado ainda usa MWC, inclui parâmetros de referência e dados de carteira do fundador. Esses valores não devem ser reutilizados como tokenomics aprovada, reserva fiat, valuation auditado, oferta pública ou parâmetros MWN atuais.

### Arquitetura conceitual versus implementação

O [registro BCE de PoUW/UMS/MWN](https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/temas/economia-ums-mwn-pouw-liquidez-distribuida.md) declara expressamente que é conceitual/arquitetural, não especificação final nem comprovação de implementação. A [governança do mercado MWN](https://github.com/meshwave65/Foundation_MeshWave/blob/main/BCE/temas/governanca-mercado-mwn-prioridade-meshwalkers.md) registra fases e requisitos de mercado propostos; não comprova MW-Ex ativa. A [reconciliação documental MWN/MWC](https://github.com/meshwave65/network/blob/main/docs/blueprints/MWN_MWC_RECONCILIATION_2026-10-29.md) indica que o blueprint normativo permanece `DRAFT_FOR_VALIDATION` e decisões econômicas relevantes seguem abertas.

**Classificação consolidada:**
- Ledger Supabase MWC: **piloto controlado documentado**; não cadeia pública/descentralizada ou Genesis canônico.
- Conversão e não-transferibilidade UMS no piloto: **controles de banco descritos como aplicados/verificados no snapshot do projeto**, mas não comprovados em consulta live nesta tarefa nem migrados automaticamente para um protocolo MWN final.
- Ledger UMS experimental em `network`: **protótipo local testado**, fatores experimentais.
- Relação UMS↔MWN, PoUW, suprimento, liquidez e regras de mercado: **conceito/decisão pendente**.
- MW-Ex: **proposta**, sem evidência de operação.
- Binance: a missão-base alega candidatura prévia, mas nesta rodada não foi encontrado documento primário suficiente para afirmar estado atual, recebimento, análise, aprovação ou listagem. **Status de candidatura permanece não verificado.**

### Conclusão de maturidade

A evidência fortalece a descrição de uma base em evolução com código, controles e pilotos delimitados; não sustenta a afirmação de uma economia UMS/MWN plenamente operacional. A próxima validação de alto valor seria obter uma evidência read-only datada do estado atual do Supabase e uma fonte primária do status Binance, sem expor dados pessoais ou credenciais. A decisão de parâmetros econômicos permanece humana.


## Complemento — consulta read-only do Supabase mwn (2026-11-08)

### Estado observado no banco conectado

Foi feita consulta SQL somente leitura ao projeto Supabase `mwn` (`vkjurxxrlchnytnkkrvq`), limitada a agregados e metadados técnicos; nenhum identificador de usuário/carteira foi retornado no inventário.

| Métrica | Resultado observado |
|---|---:|
| Chain ID | `meshwave-genesis-v1` |
| Network | `pilot` |
| Latest block number / total blocks | 17 / 18 (blocos 0–17) |
| Total transactions | 18 |
| Timestamp do bloco mais recente | 2026-11-03 20:03:52 UTC |
| Wallet records | 8 |
| Acquisition records | 9: 8 validated, 1 rejected |
| BRL agregado de aquisições validated | R$ 13,02 |
| MWC agregado nas aquisições validated | 602,63827817 MWC |
| Tipos de transação | 1 Genesis UMS allocation; 1 UMS→MWC conversion; 8 MWC acquisition transfers; 1 Genesis MWN→UMS reconversion; 7 MeshWalker MWN→UMS reconversions |
| Account-ledger entries | 35: 25 MWC, 10 UMS |

Os valores são agregados de registros do piloto e não representam volume de exchange, mercado secundário, receita recorrente, capitalização, preço de mercado, liquidez ou adoção ampla. O banco contém eventos de reconversão, mas isso não torna a economia normativa MWN aprovada nem comprova que todos os fluxos propostos estejam disponíveis ao usuário em produção.

### Estado do controle técnico consultado

- A listagem atual de tabelas mostra 13 tabelas públicas com RLS habilitado.
- A consulta de catálogo PostgreSQL encontrou funções `mw_convert_ums_to_mwc` e `mw_convert_mwc_to_ums` com `SECURITY DEFINER`; grants retornados incluem `authenticated` e `service_role`. A função de append `mw_append_event` aparece restrita a `postgres`/`service_role`.
- O trigger `mw_guard_ums_ledger_transfer` está habilitado na tabela `mw_account_ledger`.
- A tabela de migrations do projeto conectado lista versões até `20261103200629` (`phase1_add_ums_quantity_to_acquisitions`). As migrations com timestamp `20261024...` citadas no repositório de código não aparecem com esses mesmos IDs na tabela de migrations consultada. O controle/trigger existe no catálogo; a proveniência exata de implantação deve ser reconciliada antes de alegar correspondência um-a-um entre arquivos e histórico do Supabase.
- O último timestamp de bloco observado é 03/11, embora a consulta tenha sido feita em 08/11. Isso é um sinal de que o piloto não apresentou novos blocos no período observado; não é prova de indisponibilidade, pois nenhuma transação de teste foi submetida.

### Revisão de classificação

A fonte anteriormente usada (snapshot de 24/10) está agora complementada por uma leitura direta read-only do banco conectado em 08/11. O estado do ledger pode ser classificado como **piloto Supabase ativo/documentado com 18 blocos e registros agregados de aquisição/conversão**. Permanecem fora do que a evidência sustenta: blockchain distribuída, consenso independente, Genesis canônico, mercado MW-Ex, listagem, liquidez externa, receita de mercado, tokenomics aprovada ou atividade contínua após 03/11.


## Corrective source-selection control — Supabase acquisition records (OR-20261108-0006)

**Authoritative project for this acquisition history:** MeshWave65 Supabase project `ufylccbdjfzydbwhpmpp`, table `public.mwc_acquisitions`.

A prior snapshot (OR-20261108-0005) selected project `mwn` (`vkjurxxrlchnytnkkrvq`) by mistake. That separate project contained 9 rows and returned R$13.02 across 8 validated records; it does **not** represent the full MeshWave65 acquisition history and must not be used as the total for this task. The error was project/source selection and coverage, not a discrepancy in the same records.

Read-only aggregate on MeshWave65: **20 validated BRL acquisitions totaling R$136.03**, recorded quantity **6,296.22772505 MWC**. The 20 values are enumerated in OR-20261108-0006. User reported that omitted acquisitions included those associated with Marcos Vita, Dinelson, Gustavo, and Tatiane; this report does not perform identity-level retrieval.

**Agent instruction (mandatory):** For future acquisition totals, verify the Supabase project ref before querying. Use MeshWave65 `ufylccbdjfzydbwhpmpp` for this history; do not select `mwn` `vkjurxxrlchnytnkkrvq` merely because it has a same-named table. Confirm project, table, currency, status filter, and row coverage before summing. Do not merge the two projects. If sources conflict, pause and document the project refs and coverage instead of asserting a total. OR-0005 remains in the audit trail but is superseded for acquisition totals by OR-0006.


## Complemento — contexto da migração do projeto dedicado MWN/UMS e banco consolidado (declaração do responsável, 2026-11-08)

O responsável esclareceu que um dos projetos Supabase conectados corresponde a uma tentativa de migrar as tabelas para uma conta/projeto exclusivo de MWN/UMS. Segundo a declaração, **as estruturas/tabelas foram migradas corretamente, mas os dados não**; o caso mais importante é a tabela OAuth, que contém usuários e registros de login. A migração foi interrompida e deixada para investigação posterior. A causa não foi determinada. Não presumir que OAuth/usuários/logins foram migrados com sucesso, não diagnosticar a causa sem evidência e não retomar a migração sem tarefa/autorização específica.

O banco discutido é intencionalmente consolidado: contém tabelas originárias de diferentes projetos. Essa composição, por si só, não significa contaminação acidental nem invalida a origem de cada tabela. A regra de seleção da fonte em OR-20261108-0006 aplica-se à consulta do histórico de aquisições; não significa que todas as tabelas do banco consolidado pertençam ao mesmo projeto funcional.

Sobre RLS, o responsável informa que 29 tabelas estão sem RLS de forma deliberada, pois pertencem a projetos que naquele estágio não lidavam com dados sensíveis, utilizavam placeholders e priorizavam funcionalidade e simplicidade. Trata-se de **contexto declarado, não de auditoria independente de segurança por tabela**. Não classificar todo o banco como inseguro apenas pelo número 29, nem concluir que todas essas tabelas são seguras. Qualquer avaliação deverá identificar origem/projeto, sensibilidade, dados reais versus placeholders, exposição e caminhos de acesso de cada tabela. Não modificar RLS ou estado de migração sem escopo e aprovação explícitos.


## Binance application — submission route and confirmation anomaly (owner statement, 2026-11-08)

The responsible user clarified that the MeshWave application was submitted through a dedicated form on Binance's own website. A response appeared in relation to the submission, but the user found it unusual that no separate email or message confirming the application was received. This is an owner-reported fact; the exact response text, its meaning, and the application's current review status have not been independently verified. **Do not describe the application as unsubmitted, rejected, accepted, or under active review based only on the missing email.** Treat the web-form submission and response as a reported evidence lead; if status verification is required, inspect the exact submission response or ask the owner for the relevant screenshot/text, without exploring unrelated project data.


## Estratégia faseada de MW-Ex e acesso externo — declaração do responsável (2026-11-08)

O responsável esclareceu a mudança de foco após a submissão anterior da candidatura Binance. A candidatura foi realmente enviada, mas a estratégia subsequente passou a priorizar a carteira e a exchange próprias (**MW-Ex**) como canal primário inicial de negócios, construindo uma entrada gradual no mercado externo. A Binance deve ser tratada como uma iniciativa anterior, não como o canal primário assumido na estratégia atual.

### Sequência estratégica relatada

1. **Fase inicial — canal orgânico/MW-Ex:** desenvolver carteira e exchange próprias para conduzir os negócios iniciais do ecossistema. A meta de captação orgânica declarada é de **R$ 50 mil a R$ 100 mil**, destinada ao desenvolvimento do ecossistema.
2. **Fase intermediária — primeira porta pública externa:** buscar listagem em uma exchange externa de menor prestígio e, potencialmente, com menor alcance, liquidez e volume que uma exchange top 10, privilegiando exigências de listagem mais simples. A intenção é tornar o token acessível publicamente fora do ecossistema e ampliar possibilidades de negociação. A meta de captação declarada para essa etapa é de **R$ 250 mil a R$ 500 mil**.
3. **Fase posterior — exchange de maior prestígio:** usar a etapa intermediária como preparação para uma possível listagem em exchange de maior prestígio, com uma meta aspiracional de captação de **alguns milhões de reais** para desenvolvimento mais significativo do ecossistema.

O responsável esclareceu que os cenários de lançamento previamente estudados poderiam envolver milhões ou bilhões de reais, mas esse volume não é uma necessidade do ecossistema na fase atual; a necessidade de capital declarada é muito menor. As faixas acima são **metas estratégicas relatadas**, não previsões, garantias de captação, ofertas, compromissos de listagem, avaliação de mercado ou demonstração de viabilidade.

### Classificação e validações ainda necessárias

- A existência/operacionalidade de MW-Ex e carteira própria, o modelo de negócios, a custódia, a segurança, a liquidez e os fluxos UMS/MWN precisam ser confirmados por evidência técnica e operacional pertinente; esta declaração não os comprova.
- Nenhuma exchange externa foi identificada ou selecionada nesta declaração. Requisitos simplificados, elegibilidade, custos e probabilidade de aceitação ainda precisam de pesquisa e validação.
- A estratégia exige gates próprios para conformidade legal/regulatória, segurança, custódia, divulgação de riscos, economia, liquidez, operação e autorização humana. A progressão para qualquer listagem, captação ou comunicação externa não é autorizada por este registro.
- Manter a candidatura Binance histórica no inventário sem inferir seu estado atual, e separar explicitamente **plano estratégico** de **estado implementado/validado**.


## Prioridade imediata: MW-Ex operacional e materiais de investidores sob a tese ROB — complemento do responsável (2026-11-08)

O responsável esclareceu que **não é objetivo escolher ou pesquisar agora qual exchange externa receberá a listagem**. A prioridade de execução é tornar a MW-Ex operacional e desenvolver materiais destinados a potenciais investidores de risco, apresentados sob a visão de **ROB (Return on Building), não ROI (Return on Investment)**. A intenção é comunicar que o capital buscado serve para construir e ampliar o ecossistema, e que podem existir investidores procurando projetos desta natureza, mas a MeshWave ainda precisa criar meios efetivos de encontrá-los e estabelecer contato.

Segundo o responsável, na carteira MWN do website e do PWA já aparecem um ícone de acesso à MW-Ex e uma tela rudimentar que representa a interface planejada. Isso é **evidência declarada de presença de elementos de interface**, não demonstração de que exchange esteja operacional, de que ordens sejam executadas, nem de custódia, liquidez, segurança ou integração ponta a ponta. Esses aspectos requerem validação técnica e testes específicos.

As tentativas anteriores de contato, incluindo dois e-mails enviados, devem ser entendidas como **iniciativas de criação de pontes/canais com potenciais interessados**, não como evidência de interesse, resposta, investimento ou validação externa. Não iniciar contato externo nem escolher exchanges sem autorização específica. A pesquisa de venues/listagem fica fora da prioridade imediata e poderá ser retomada em fase posterior.

### Consequência para o trabalho da missão

- Priorizar a coleta de evidências e a definição do caminho de entrega para MW-Ex operacional, incluindo a experiência de acesso pela carteira web/PWA e critérios verificáveis de funcionamento.
- Preparar a tese e os materiais para investidores de risco com a narrativa ROB, distinguindo construção de capacidade/infraestrutura de promessas de ROI, retorno financeiro, captação ou valorização de token.
- Fazer das tentativas de outreach um histórico de canalização/ponte; medir resposta e interesse apenas quando houver evidência objetiva.
- Manter as faixas de captação previamente declaradas como objetivos estratégicos, não previsões ou garantias.
- Não selecionar exchange externa nesta etapa. Preservar gates de conformidade, segurança, custódia, liquidez, disclosure e aprovação humana antes de qualquer execução ou comunicação financeira externa.
