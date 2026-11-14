# ARCHAEOLOGICAL_CONTEXT — Memória evolutiva operacional da SOFIA

Escopo transversal: Skills, protocolos, blueprints, instruções de agentes e demais documentos de orientação das missões. Preserva incrementalmente contexto, constatações, decisões, motivações, evidências, alterações e resultados. Não substitui documentos normativos, OR ou FOR.

## Diretrizes aprovadas em 31/10/2026

1. O contexto arqueológico é central e transversal, não restrito às Skills.
2. O ORACULO_AGENT é o maestro da evolução operacional, trabalha com o agente responsável pela leitura dos OR, propõe atualizações dentro de sua autoridade e elabora o FOR de cada missão a partir dos OR das etapas.
3. Cada OR submetido aciona análise do Oráculo. A melhoria contínua não aguarda o FOR.
4. Autonomia operacional é a regra dentro das permissões e políticas vigentes. Diante de risco iminente, suspende imediatamente a tarefa/etapa causadora, preserva estado e evidências, avalia e corrige autonomamente quando autorizado e seguro; a suspensão limita-se à atividade afetada. Aguarda intervenção humana somente quando a decisão realmente exigir intervenção humana.
5. Alterações de arquitetura, objetivos fundamentais, políticas, permissões ou escopo fora da autoridade delegada exigem aprovação expressa.

## Registro evolutivo

### AC-001 — Escopo transversal
Decisão explícita do responsável: ampliar o documento arqueológico inicialmente pensado para Skills para todos os documentos de orientação das missões e toda a evolução da execução.

### AC-002 — Oráculo como maestro
Decisão explícita do responsável: o Oráculo coordena a evolução, trabalha com o agente responsável pela leitura dos OR e elabora o FOR ao final da missão.

### AC-003 — Análise a cada OR
Decisão explícita do responsável: decidir otimizações a cada OR, não apenas no FOR; corrigir imediatamente quando necessário.

### AC-004 — Autonomia adaptativa e suspensão localizada
Decisão explícita do responsável: suspender imediatamente a tarefa/etapa que produz risco iminente; na maioria dos casos, avaliar, ajustar e retomar autonomamente. Escalar ao humano somente quando a decisão realmente exigir intervenção humana.

## Piloto Meeting Preparation
A Skill meeting-preparation-dossier v0.1.1 permanece DRAFT e ainda não foi validada end-to-end. Piloto supervisionado: Gonçalo Salgueiro (NW-LI-0031), reunião 03/11/2026, 12:00–12:45, videoconferência, America/Sao_Paulo, escopo MWC/UMS. Não promover a Skill nem iniciar Renato Barros (NW-LI-0023, 06/11/2026) antes da avaliação e aprovação do piloto.

## Integridade
Registrar cada nova entrada com data, OR/FOR, missão/etapa, orientação anterior, fato/evidência, classificação (fato, declaração, decisão, hipótese, inferência ou pendência), decisão, autoridade, documentos/versões afetados, commit e validação. Não inventar dados nem reescrever histórico. A existência desta memória não significa que o Oráculo autônomo já esteja implementado.


### AC-005 — 2026-11-05 — OR_MEETING_PREP_2026-11-05_GONCALGO_PILOT

- **Missão/etapa:** operações contínuas MeshWave Network; reprocessamento supervisionado do dossiê MWC/UMS de Gonçalo / NW-LI-0031.
- **Orientação anterior:** Skill meeting-preparation-dossier v0.1.1 em DRAFT; piloto Gonçalo; não iniciar Renato antes da avaliação/aprovação do piloto.
- **Fato/evidência:** o pacote foi reaberto e validado contra v0.1.1. Os seis materiais obrigatórios existem; 21 links relativos válidos, zero quebrados; claims/maturidade, demo/fallback, limites e fontes estão explicitados. O relatório operacional `meshwave65/network: docs/reports/OPERATIONAL_REPORT_MEETING_PREP_2026-11-05_GONCALGO_PILOT.md` registra a QA. A data 03/11/2026 passou, mas ocorrência/resultado não foi verificado; minutos/follow-up permanecem em branco.
- **Classificação:** fato de execução + decisão operacional + pendências humanas.
- **Decisão:** quality gate do piloto **passou com revisão do responsável pendente**. A Skill permanece DRAFT e não é promovida. A instrução explícita do responsável em 05/11 inclui o encontro separado de Renato Barros / NW-LI-0023 em 06/11; isso autoriza continuar a reprocessar esse dossiê existente como piloto supervisionado, não aprovar/promover a Skill. Não criar pasta duplicada, não enviar mensagens, não alterar calendário.
- **Autoridade:** instrução explícita atual do responsável, dentro do escopo de Meeting Prep.
- **Documentos/versões:** Skill v0.1.1 (file SHA `c373642329208881ea5c2b7bc1d9c061f3530543`); contexto anterior AC-004 (file SHA `11cd52a7b6034ae32a78afc17895ac35e206b1b5`); OR commit `eb8563b52e05e13949a68b8ed7d4ae64c56308f1`; Gonçalo README commit `f7dae41698b1c3c424ed8774a320d6beb3b4b613`; meeting_prep commit `9636d341e73d2c377ae001eb602ca4f9c32ae882`.
- **Validação:** os arquivos foram relidos remotamente; qualidade/links aprovados; blueprints não alterados; lab de duas VMs continua congelado. A referência do usuário a Renato em 03/11 conflita com a correção explícita de 31/10 (“somente Gonçalo”); identidade não atribuída e exige esclarecimento humano.


### AC-006 — 2026-11-05 — OR_MEETING_PREP_2026-11-05_RENATO_1106

- **Missão/etapa:** reprocessamento supervisionado do dossiê SOFIA/SWE de Renato Barros / NW-LI-0023 para 06/11/2026, após a avaliação do piloto Gonçalo (AC-005).
- **Orientação anterior:** Skill v0.1.1 permanece DRAFT; o responsável explicitamente incluiu Renato 06/11 na instrução atual. A continuação é um piloto supervisionado, não promoção da Skill.
- **Fato/evidência:** identidade resolvida por placeholder existente, evento “VIDEOCONF RENATO BARROS”, registro Secretary de 23/10 e correção de 31/10. O pacote foi reprocessado; seis materiais obrigatórios criados; 22 links relativos válidos, zero quebrados. O relatório `meshwave65/network: docs/reports/OPERATIONAL_REPORT_MEETING_PREP_2026-11-05_RENATO_1106.md` registra QA. Reunião registrada para 06/11, 16:00–16:45 America/Sao_Paulo; não houve leitura nova de calendário.
- **Classificação:** fato de execução + decisão operacional + pendências humanas.
- **Decisão:** quality gate passou com revisão do responsável pendente. Skill continua DRAFT, sem promoção. Não enviar mensagem, não alterar calendário, não executar teste/demo/latência, não mudar blueprint. A mensagem de 17/10 não foi reenviada.
- **Autoridade:** instrução explícita atual do responsável, após a avaliação do piloto AC-005.
- **Documentos/versões:** Skill v0.1.1 (file SHA `c373642329208881ea5c2b7bc1d9c061f3530543`); contexto anterior AC-005 (file SHA `cded377e06f147a18af096deef637abc45d62310`); OR final commit `37d35b788765ed723ee1b16a51a443928cbe24ba`; Renato README `320431b31b0ebc7f85005f0568d817db8ec8ef38`; main dossier `4deb3fb3c1cf93d283bf2a8159defbd8500e2012`; materials README `073aec930a55c22d4068c7434857e366e8e1afb8`; link fix `e991f4d218796b8d96e7cd501e42c833961b5845`.
- **Validação:** arquivos relidos; 22/22 links válidos; blueprints não alterados; lab de duas VMs continua congelado. A referência do usuário a Renato em 03/11 ainda conflita com a correção explícita de 31/10; nenhuma identidade foi atribuída.


### AC-007 — 2026-11-05 — OR_MEETING_PREP_BLOCKER_2026-11-05_RENATO_0311

- **Missão/etapa:** resolver sem inferência a identidade do Renato reportado para 03/11/2026.
- **Orientação anterior:** AC-005/AC-006 distinguem o piloto Gonçalo 03/11 e o encontro Renato Barros / NW-LI-0023 em 06/11; o placeholder de 03/11 Renato permanece com nove candidatos.
- **Fato/evidência:** a correção de 31/10 diz que somente Gonçalo estava confirmado e que referências anteriores a Renato eram erro material; a atualização de 02/11 reativa um encontro com Renato como reportado pelo responsável, mas sem identidade canônica; a instrução atual de 05/11 volta a listar Renato e Gonçalo. A identidade não é resolvida por esses registros. O encontro de 06/11 é separado e explicitamente NW-LI-0023.
- **Classificação:** conflito de evidência / bloqueio humano.
- **Decisão:** manter `MEETING_REPORTED_BY_OWNER / BLOCKED_IDENTITY`; não escolher entre os nove registros, não atribuir NW-LI-0023, não duplicar/mover placeholder, não personalizar briefing, não enviar mensagem ou alterar calendário. Solicitar ao responsável qual ID canônico corresponde ao Renato de 03/11.
- **Autoridade:** instrução explícita atual do responsável, com protocolo de não inferência.
- **Documentos:** blocker report `meshwave65/network: docs/reports/MEETING_PREP_BLOCKER_2026-11-05_RENATO_0311.md`, commit `8c04332049239180508b00d2d8261be15bd62f09`; README existente, commit `524c17bd4f941871b95f42d2b22e5cf74ca86d4b`; briefing preliminar, commit `2b3f91d82661a0ff47abcdd1776d5f16882dfe61`; esclarecimento no OR Renato 06/11, commit `6d29ef3e00fd38ad46827238bb9bc6c6927d8177`.
- **Validação:** placeholder e report relidos; nenhuma blueprint ou network_master alterada; nenhum envio ou ação externa.


### AC-008 — 2026-11-14 — Missões pertencem ao sistema; agentes são executores atribuídos
- **Missão/etapa:** MISSION_0020 / tarefa 20.4 — diagnóstico de ciclo de missão e fatorização.
- **Orientação anterior:** código tratava `agentId` como reserva exclusiva enquanto tarefa permanecesse PROGRESS; fatorização colocava pai em PROGRESS e copiava agente/pin para filhas, criando bloqueio.
- **Declaração e decisão explícita do responsável:** missões pertencem ao SCP, não aos agentes. Atribuição de agente é operacional/temporária. Sem pinagem humana, o sistema deve poder encaminhar/reatribuir para outro agente disponível quando houver impedimento, principalmente falta de créditos. Quando o operador fixa um agente específico, a restrição deve ser respeitada e impedimentos apresentados, sem transferência silenciosa.
- **Decisão explícita sobre fatorização padrão:** agente que inicia a fatorização assume uma das tarefas; as demais são distribuídas a outros agentes disponíveis. Pai/filhas é estrutura de rastreabilidade/consolidação, não propriedade nem reserva. Registro de coordenação sem trabalho próprio não deve reservar agente nem bloquear tarefas executáveis.
- **Classificação:** decisão arquitetural do responsável, motivada por conflito estático confirmado em OR-20261114-0017.
- **Pendência não inferida:** semântica da pinagem humana quando uma missão é fatorizada (uma tarefa ou todas as subtarefas), bem como fairness, prioridades e limites de concorrência.
- **Autoridade:** decisão explícita do responsável; princípios de arquitetura/contrato devem ser revistos pelo Oracle conforme governança.
- **Documentos:** OR-20261114-0018; MISSION_0020 PROGRESS; MISSION_0020 TASKS PROGRESS.
- **Validação:** documentos versionados e relidos no remoto. Nenhum código, DB ou produção alterados; nenhum dispatch/consumo de crédito/Manus/LLM/deploy/restart.


### AC-009 — 2026-11-14 — Missão fatorizada permanece um único resultado consolidado
- **Missão/etapa:** MISSION_0020 / tarefa 20.4 — contrato de fatorização e consolidação.
- **Orientação anterior:** AC-008 definiu titularidade sistêmica das missões, atribuição temporária de agentes e deixou pendente a pinagem humana em missão fatorizada.
- **Decisão explícita do responsável:** pai é a missão principal/consolidadora e único resultado final. O agente fixado excepcionalmente pelo operador permanece no pai, gera Draft e aguarda a execução das filhas. Filhas são auxiliares, não entregáveis finais independentes; seus resultados são curados e integrados pelo pai. O pai só conclui a missão após consolidar seu resultado.
- **Exemplo:** Capítulo pai + Subcapítulos 1, 2 e 3 filhos = um Capítulo integrado, não quatro documentos separados.
- **Regra de atribuição:** pinagem do agente consolidador não é herdada automaticamente pelas filhas; filhas são distribuídas a outros agentes elegíveis sem bloqueio pelo pai.
- **Distinção de domínio:** não confundir a hierarquia de tarefas com o sistema de documentos vivos que compõe recursivamente fragmentos/parágrafos via `parent_task_id`; o campo é contextual e não tem semântica universal única.
- **Classificação:** decisão arquitetural explícita do responsável.
- **Autoridade:** responsável pelo produto.
- **Documentos:** OR-20261114-0018 (aditivo); MISSION_0020 PROGRESS; MISSION_0020 TASKS PROGRESS.
- **Validação:** atualização documental versionada no GitHub; nenhuma implementação de produto, alteração de DB, dispatch, consumo de créditos, chamada Manus/LLM, deploy ou restart.


### AC-010 — 2026-11-14 — Atribuição do consolidador é efêmera e transferível
- **Missão/etapa:** MISSION_0020 / tarefa 20.4 — ciclo de vida de missão fatorizada.
- **Orientação anterior:** AC-008/AC-009 definiram missão sistêmica, pai consolidador e filhas auxiliares; faltava explicitar a efemeridade do agente associado ao pai.
- **Decisão explícita do responsável:** o agente consolidador não é proprietário do pai. É executor temporário. Qualquer agente elegível pode assumir a continuidade se o atual ficar impedido, preservando Draft, contexto, histórico, resultados das filhas, dependências e estado. Pinagem humana explícita impede transferência silenciosa; impedimento deve ser escalado ao operador.
- **Classificação:** decisão arquitetural explícita do responsável.
- **Autoridade:** responsável pelo produto.
- **Documentos:** OR-20261114-0018 (aditivo); MISSION_0020 PROGRESS; MISSION_0020 TASKS PROGRESS.
- **Validação:** atualização documental versionada e relida no GitHub; nenhuma implementação de produto/DB/produção ou execução externa.


### AC-011 — 2026-11-14 — Identificação de execução externa e comunicação direta com agente
- **Missão/etapa:** MISSION_0020 / tarefa 20.4 — Messenger e rastreabilidade das missões.
- **Orientação anterior:** o Messenger está vinculado à execução Manus associada à missão; agentId identifica o agente e manusTaskId identifica a execução externa. A integração conhecida envia mensagens a uma execução específica.
- **Proposta apresentada pelo responsável:** tornar o Agent Task ID (Manus Task ID) claramente identificável na missão e permitir conversa direta com a conta original do agente, mesmo quando ele não estiver mais atribuído à missão.
- **Requisitos derivados:** (a) exibir separadamente Mission ID, Agent ID e Agent Task ID; (b) permitir canal de conversa independente da atribuição atual da missão, usando a credencial da conta do agente; (c) manter histórico próprio e contexto de missão explicitamente selecionado; (d) não alterar estado/resultado da missão por efeito colateral da conversa.
- **Hipótese técnica, não fato confirmado:** a API atualmente usada requer task_id em /task.sendMessage; o código também dispõe de /task.create. Se não existir endpoint de inbox genérico, avaliar uma execução Manus dedicada e persistente por conversa/agente. Validar o contrato oficial da API antes de afirmar entrega à conta ou implementar.
- **Classificação:** proposta de produto/requisito em avaliação, não decisão técnica final.
- **Autoridade:** proposta do responsável; contrato técnico pendente de validação.
- **Documentos:** OR-20261114-0018 (aditivo); MISSION_0020 PROGRESS; MISSION_0020 TASKS PROGRESS.
- **Validação:** requisito registrado. Nenhuma alteração de código, banco, credencial, chamada Manus/LLM, envio de mensagem, deploy ou restart.


### AC-012 — 2026-11-14 — SOFIA como plano cognitivo e operacional central do SCP
- **Missão/etapa:** MISSION_0020 / tarefa 20.4 — evolução do Messenger e governança cognitiva.
- **Decisão explícita do responsável:** implementar a SOFIA como interlocutora do operador e camada cognitiva central do SCP, responsável por compreender intenções, consultar contexto, propor/encaminhar ações e coordenar inteligências/agentes federados. O operador conversa prioritariamente com o SCP, não com a conta externa do agente.
- **Princípio:** missões, contexto operacional, governança e continuidade pertencem ao SCP. Agentes externos são executores federados e substituíveis, salvo pinagem humana explícita.
- **Arquitetura aprovada:** (1) camada cognitiva LLM/Sofia; (2) camada determinística de política, autorização, estado e execução no SCP; (3) adaptadores de agentes externos. O LLM interpreta e planeja, mas não acessa diretamente banco, credenciais ou APIs administrativas. Todas as ferramentas são tipadas, validadas no servidor e auditáveis.
- **Modelo existente identificado:** `server/_core/llm.ts` usa `gemini-2.5-flash` via endpoint compatível com Chat Completions do gateway Manus Forge. Isso confirma uma capacidade LLM integrada, não um modelo proprietário da SOFIA.
- **Primeiro incremento aprovado:** toda mensagem do operador passa pela Sofia; encaminhamento ao agente atual somente mediante decisão/tool call coerente com pedido explícito do operador, Agent ID e Agent Task ID existentes. Perguntas/análises ficam com Sofia. Ausência de resposta externa não é confirmação de entrega/leitura.
- **Ações de controle:** transferência, pausa/retomada, prioridade e criação/cancelamento de execução exigem ferramentas governadas, validação de estado/política e confirmação conforme impacto. O modelo não é autoridade de execução.
- **Memória:** contexto de missão e contexto operacional delimitados por ownership/finalidade; não carregar indiscriminadamente histórico de outras missões, dados privados ou credenciais.
- **Classificação:** decisão arquitetural explícita do responsável; implementação incremental aprovada.
- **Autoridade:** responsável pelo produto.
- **Documentos:** `governance/architecture/SOFIA_COGNITIVE_CONTROL_PLANE.md`; OR-20261114-0022; MISSION_0020 PROGRESS; TASKS PROGRESS.
- **Limite da primeira entrega:** não inclui transferência, pausa/retomada, persistência de planos, memória global, canal direto independente de missão ou mudanças de schema. Sem deploy, DB/produção, chamadas externas reais ou consumo de créditos.


### AC-013 — 2026-11-14 — Identidade sistêmica do SOFIA, SCP frontend e arquitetura BBC/BCE
- **Declaração e decisão explícita do responsável:** SOFIA é o sistema integrado completo, composto por módulos especializados e capacidades transversais. SCP (SOFIA Control Panel) é exclusivamente o painel central de comando/frontend do SOFIA; não é um módulo funcional independente nem o nome de uma camada *control plane*.
- **Módulos de conhecimento:** SWE (SOFIA Web Extractor) extrai conhecimento das fontes do usuário e alimenta a BBC; SCur (SOFIA Curator) trabalha sobre a BBC, realiza curadoria e mantém a BCE e seus documentos vivos; SVec (SOFIA Vectorizer) vetoriza a BCE curada, não a BBC como fonte primária.
- **Terminologia oficial:** BBC = Base Bruta de Conhecimento; BCE = Base de Conhecimento Evolutivo. BBC preserva fontes, históricos, arquivos e evidências de origem. BCE representa o conhecimento curado, organizado e evolutivo, com documentos vivos que expressam o estado da arte dos temas/domínios.
- **Fluxo conceitual:** SWE → BBC → SCur → BCE → SVec. Módulos arqueológicos, de otimização e segurança, entre outros, são componentes/capacidades do sistema integrado, não subprodutos do SCP.
- **Capacidades transversais:** cognição, governança, segurança e orquestração pertencem ao SOFIA como sistema. O SCP oferece a interface de interação e controle do operador; módulos especializados mantêm suas responsabilidades próprias e contratos explícitos.
- **Relação com Foundation_MeshWave:** a estrutura documental consultada registra BCE curada separada das fontes brutas em KNOWLEDGE/. A nomenclatura sistêmica BBC formaliza a camada bruta; esta decisão não renomeia diretórios do Foundation nem altera aquele repositório.
- **Classificação:** decisão arquitetural explícita do responsável; nomenclatura e responsabilidades conceituais adotadas. Não implica implementação dos módulos ou do pipeline completo.
- **Documentos afetados:** substituído `governance/architecture/SOFIA_COGNITIVE_CONTROL_PLANE.md` por `governance/architecture/SOFIA_COGNITIVE_ORCHESTRATION_ARCHITECTURE.md`; OR-20261114-0022; PR #15.
- **Autoridade:** responsável pelo produto.


### AC-014 — 2026-11-14 — TR como compreensão, validação e memória evolutiva das missões

- **Decisão explícita do responsável:** toda missão deve receber um primeiro TR após sua criação e antes de qualquer execução. O TR inicial documenta a compreensão da SOFIA sobre origem, motivação, objetivo, escopo, resultados esperados, estratégia, premissas, dúvidas e critérios de conclusão.
- **Missão originada por humano:** o primeiro TR deve ser apresentado ao operador solicitante para validar se a SOFIA compreendeu a intenção. O operador pode corrigir, complementar ou redirecionar; a execução só começa após validação explícita. Versões anteriores devem ser preservadas.
- **Missão originada pela SOFIA:** também exige primeiro TR, mas não exige avaliação/aprovação humana preliminar. A SOFIA pode executar autonomamente dentro das permissões, políticas e limites de autonomia; deve registrar a origem, motivação operacional e evidências que sustentam a iniciativa.
- **Intervenção contínua:** um operador pode consultar, questionar e reorientar qualquer missão durante seu ciclo de vida, respeitando gates de governança e impacto.
- **Integridade documental:** TR não inventa motivação, decisões, progresso ou resultados. Deve distinguir declaração do operador, fato documentado, decisão, interpretação da SOFIA, hipótese/inferência, reconstrução e informação não localizada. Missão antiga sem justificativa deve declarar que a motivação original não foi localizada; eventual reconstrução deve ser rotulada e fundamentada. Resultados realizados exigem evidência.
- **Documento vivo:** atualizar e versionar após eventos materiais, preservando histórico, autoria/origem, fontes e alterações. Captura de eventos, consolidação narrativa e publicação da versão são responsabilidades separadas.
- **Experiência SCP:** ao abrir missão, TR é a visão principal; tarefas, ORs, checkpoints, decisões, evidências e FOR ficam acessíveis como detalhamento secundário. Estados documentais não se confundem com estados técnicos de missão/tarefa.
- **Correlação:** relações entre missões (origem comum, dependência, continuidade, complementaridade, conflito/sobreposição) exigem evidência e justificativa; similaridade temática não basta.
- **Distinção TR/FOR:** TR é narrativa viva de compreensão humana da missão; FOR é aprendizado operacional final para evolução dos procedimentos e eficiência da SOFIA. Não são intercambiáveis.
- **Classificação:** decisão arquitetural explícita do responsável; contrato aprovado, implementação pendente.
- **Documento normativo:** governance/architecture/MISSION_TR_SPECIFICATION.md. Referência sistêmica: governance/architecture/SOFIA_COGNITIVE_ORCHESTRATION_ARCHITECTURE.md.
- **Limites:** nenhum schema, runtime, UI, DB, produção, dispatch, chamada externa, crédito ou deploy alterado nesta etapa. Task 20.3/Mateus permanece intocada.

### AC-015 — 2026-11-14 — Blueprint como plano de trabalho derivado do TR

- **Decisão explicitada pelo responsável:** Blueprint é o plano de trabalho operacional da missão, direcionado aos agentes/executores; TR é a compreensão narrativa da missão, prioritariamente direcionada ao operador humano.
- **Derivação:** o Blueprint deve derivar de uma versão específica do TR consolidado. Em missão humana, a validação explícita do TR inicial antecede a liberação da execução. Em missão autônoma da SOFIA, o TR inicial continua obrigatório, mas não exige aprovação humana preliminar; a SOFIA pode produzir o Blueprint e executar dentro das políticas e limites de autonomia.
- **Escopo:** o Blueprint traduz o escopo validado em etapas, tarefas, dependências, recursos, restrições, critérios de aceite e evidências. Não pode ampliar silenciosamente o escopo aprovado. Mudanças materiais exigem análise de impacto e nova versão antes de executar o trabalho afetado.
- **Hierarquia:** a missão-pai mantém TR e Blueprint mestre; tarefas-filhas são unidades auxiliares e referenciam a versão do plano e a unidade executada. Não são missões independentes por padrão.
- **Agentes:** executores temporários, não proprietários da missão. Cada executor recebe apenas o pacote de trabalho e contexto necessários/autorizados. Troca de agente não altera identidade da missão nem rompe proveniência.
- **Artefatos complementares:** Blueprint prescreve o trabalho; OR registra execução e evidências; TR consolida evolução narrativa; FOR consolida aprendizado operacional final.
- **Classificação:** decisão arquitetural explícita; especificação documental aprovada para orientar a implementação.
- **Documento normativo:** `governance/architecture/MISSION_BLUEPRINT_SPECIFICATION.md`; relação TR/Blueprint também registrada em `MISSION_TR_SPECIFICATION.md` e na arquitetura de orquestração.
- **Limites:** definição documental apenas. Nenhum schema, runtime, UI, banco, produção, dispatch, chamada externa, crédito, deploy ou restart alterado. Task 20.3/Mateus permanece intocada.
