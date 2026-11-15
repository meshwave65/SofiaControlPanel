# SOFIA — Arquitetura Cognitiva, Modular e de Orquestração

**Status:** definição arquitetural aprovada pelo responsável; implementação incremental  
**Sistema:** SOFIA — Sistema de Orquestração Federada de Inteligências Artificiais  
**Frontend:** SCP — SOFIA Control Panel  
**Missão de implementação inicial:** MISSION_0020 / tarefa 20.4  
**Branch de trabalho:** `feat/sofia-cognitive-control-plane`

## 1. Identidade do sistema

SOFIA significa **Sistema de Orquestração Federada de Inteligências Artificiais**. SOFIA é o sistema integrado completo, composto por módulos especializados, capacidades transversais, mecanismos de conhecimento, cognição, governança, segurança e orquestração.

O **SCP (SOFIA Control Panel)** é o painel central de comando e frontend do SOFIA. Não é, por si só, um módulo funcional do sistema, nem uma camada autônoma que seja proprietária dos demais módulos. É a interface pela qual o operador acompanha, solicita, configura e controla as capacidades disponibilizadas pelo SOFIA.

A expressão inglesa *control plane* não deve ser usada como sinônimo de SCP nem como nome do sistema. A arquitetura pode conter mecanismos técnicos de política e controle determinístico, mas eles são responsabilidades internas do SOFIA, não uma redefinição do SCP.

## 2. Modelo sistêmico e modular

SOFIA integra módulos especializados que cooperam por contratos explícitos de entrada, saída, estado, proveniência e responsabilidade. Os módulos não são produtos independentes apenas conectados a um painel; são componentes funcionais do sistema integrado.

Módulos e capacidades inicialmente definidos:

- **SWE — SOFIA Web Extractor:** extrai conhecimento das fontes e materiais do usuário, preservando evidências e proveniência, e alimenta a BBC.
- **SCur — SOFIA Curator:** trabalha sobre a BBC, organiza, reconcilia e cura o conhecimento, produzindo e mantendo a BCE e seus documentos vivos.
- **SVec — SOFIA Vectorizer:** vetoriza e indexa a BCE curada e organizada. A BBC não é sua fonte primária de vetorização.
- **Módulos arqueológicos:** preservam e reconstroem a evolução, as fontes, decisões, versões, conflitos e proveniência do conhecimento.
- **Módulos de otimização:** identificam e aplicam otimizações dentro das políticas e dos contratos do sistema.
- **Módulos de segurança:** aplicam controles de identidade, acesso, proteção de dados, integridade, auditoria e segurança operacional.
- **Cognição e orquestração:** capacidades transversais que interpretam intenções, planejam, coordenam módulos e agentes federados, administram continuidade e submetem ações às regras determinísticas do sistema.

Esta lista registra módulos/capacidades já nomeados conceitualmente; não afirma que todos estejam implementados ou que sua decomposição técnica esteja concluída.

## 3. Arquitetura do conhecimento: BBC e BCE

### 3.1 BBC — Base Bruta de Conhecimento

A **BBC (Base Bruta de Conhecimento)** é a camada que reúne o material extraído ou incorporado ao sistema antes da curadoria: fontes originais, históricos, arquivos, evidências, referências e demais artefatos de origem.

A BBC deve preservar a rastreabilidade e a integridade das fontes. A curadoria não deve destruir nem sobrescrever a evidência original; classificação, deduplicação lógica, descarte e tratamento de ruído devem ser rastreáveis e não destrutivos por padrão.

### 3.2 BCE — Base de Conhecimento Evolutivo

A **BCE (Base de Conhecimento Evolutivo)** é a base curada, organizada e continuamente evoluída. Ela representa o conhecimento consolidado por domínio/tema, com seus documentos vivos e o estado da arte correspondente.

Os documentos vivos não são simples resumos. Devem manter, conforme aplicável, estado atual, arquitetura, evidências, proveniência, evolução arqueológica, decisões, alternativas, otimizações, conflitos, incertezas e lacunas.

### 3.3 Fluxo principal

`SWE → BBC → SCur → BCE → SVec`

1. SWE captura e extrai fontes e materiais relevantes.
2. O conteúdo de origem é preservado e organizado na BBC.
3. SCur examina e cura o conteúdo da BBC.
4. SCur cria ou atualiza os documentos vivos e a estrutura da BCE.
5. SVec consome a BCE curada para produzir vetores/índices semânticos.

Esse fluxo descreve a responsabilidade conceitual dos módulos. Detalhes de pipeline, versionamento, sincronização, formatos e contratos técnicos devem ser especificados por etapa, sem presumir implementação já existente.

## 4. SCP — frontend do SOFIA

O SCP é a interface central do operador. Deve oferecer visibilidade e controle coerentes sobre o sistema integrado, seus módulos, missões, agentes federados, bases de conhecimento, políticas e resultados.

O SCP:
- apresenta o estado real dos módulos e das operações;
- recebe a intenção do operador e a encaminha à capacidade cognitiva do SOFIA;
- exibe planos, solicitações de esclarecimento, confirmações, progresso, resultados e falhas;
- permite administrar missões e acompanhar a execução dos módulos/agentes, respeitando permissões;
- não substitui os módulos especializados nem deve duplicar suas responsabilidades internas.

A interface não deve anunciar como ativa, conectada, sincronizada ou concluída uma capacidade sem evidência operacional correspondente.

## 5. Cognição, governança e execução federada

A cognição e a orquestração são capacidades do SOFIA como sistema, acessíveis pelo SCP. A arquitetura separa responsabilidades internas:

### 5.1 Capacidade cognitiva

- Interpreta mensagens em linguagem natural e contexto pertinente.
- Distingue perguntas, análises, propostas e instruções explícitas.
- Consulta capacidades e informações autorizadas.
- Formula planos e solicita esclarecimentos quando necessário.
- Propõe ou solicita ações por interfaces tipadas.
- Comunica o que foi analisado, proposto, tentado e efetivamente confirmado.

Implementação identificada nesta aplicação: `server/_core/llm.ts`, atualmente configurado com `gemini-2.5-flash` por endpoint compatível com Chat Completions do gateway Manus Forge. Isso não significa que o modelo seja o próprio SOFIA: o LLM é um recurso utilizado pela capacidade cognitiva do sistema.

### 5.2 Política e controle determinístico

- Valida identidade, ownership, permissões e escopo.
- Consulta o estado real das missões, módulos, agentes, créditos, dependências e execuções.
- Valida argumentos e pré-condições de cada ferramenta no servidor.
- Impõe políticas, transições, leases, concorrência, compatibilidade e idempotência.
- Registra decisões e ações com resultados observáveis.

O LLM não recebe acesso direto ao banco, credenciais, APIs administrativas ou ferramentas irrestritas. A decisão final de autorização e execução pertence aos mecanismos determinísticos do SOFIA.

### 5.3 Agentes federados

Manus e outros agentes externos podem executar unidades de trabalho por meio de adaptadores do SOFIA. São executores federados, não proprietários do sistema ou das missões. Sua atribuição é temporária, salvo pinagem humana explícita, conforme AC-008 a AC-010.

## 6. Fluxo de interação do operador

`Operador → SCP → capacidade cognitiva do SOFIA → política/serviços do SOFIA → módulo ou agente executor → resultado → SOFIA → SCP → operador`

Nem toda interação exige agente externo: o SOFIA pode responder, consultar estado, pedir esclarecimento ou executar uma operação interna autorizada. Quando houver execução federada, o SCP apresenta o vínculo e o estado reais, sem confundir Mission ID, Agent ID e Agent Task ID.

## 7. Classes de ação e autorização

1. **Leitura:** consulta de estado, conhecimento, missão, módulo, agente, crédito e histórico autorizado, após validação de acesso.
2. **Ação operacional explicitamente solicitada:** encaminhamento de instrução ou acionamento de operação já autorizada, dentro do escopo e das pré-condições.
3. **Mudança de controle ou impacto elevado:** transferência/reatribuição, pausa/retomada, prioridade, criação/cancelamento de execução, alterações financeiras ou de credenciais. Exige política explícita, validação de estado e confirmação humana conforme o risco.

Uma intenção em linguagem natural não substitui autorização, ownership, validação de estado nem idempotência.

## 8. Memória e contexto

- **Contexto de missão:** missão selecionada, mensagens pertinentes, estado, checkpoints, resultados auxiliares e decisões.
- **Contexto operacional:** políticas, contratos e arquitetura pertinentes ao trabalho atual.
- **Contexto de módulos:** capacidades, versões, disponibilidade, entradas/saídas e estado necessários à decisão.
- **Contexto de agentes:** capacidades e disponibilidade necessárias, sem expor credenciais.
- **Contexto global do operador:** somente quando houver finalidade e autorização claras.

O contexto deve ser minimizado, rastreável e delimitado por ownership. Não carregar indiscriminadamente dados de outras missões ou bases.

## 9. Primeira entrega implementada nesta branch

- O fluxo `messages.create` passa a chamar a capacidade cognitiva da Sofia antes de qualquer encaminhamento externo.
- A Sofia recebe os identificadores e o estado operacional disponíveis da missão: Mission ID, Agent ID, pinagem, Agent Task ID e estado Manus.
- Foi adicionada a ferramenta tipada `forward_operator_instruction_to_assigned_agent`.
- A ferramenta só deve ser acionada quando o operador pedir explicitamente o envio de uma instrução ao agente atualmente atribuído.
- O servidor valida os argumentos e exige Agent ID e Agent Task ID existentes antes de enviar.
- Perguntas e pedidos de análise ficam com a Sofia; não são encaminhados automaticamente ao agente.
- A resposta distingue encaminhamento e resposta efetivamente recebida; ausência de resposta fica como `pending`, sem alegação de leitura/recebimento.
- Testes de regressão foram adicionados e executados no CI do PR #15; o incremento de inspeção somente leitura passou em 41/41 testes, além de check, build e migration 0010 em PostgreSQL 16 descartável (OR-20261114-0034).

## 10. Próximas entregas

1. Ferramentas somente de leitura para consultar missões, módulos, agentes elegíveis, créditos e dependências, sempre filtradas por ownership. Incremento inicial implementado: `inspect_current_mission` consulta a missão aberta, raiz, filhas diretas, agentes atribuídos e snapshots de créditos; consulta de candidatos elegíveis, módulos e outras missões permanece pendente.
2. Planos de ação estruturados com intenção, alvo, pré-condições, impacto, confirmação necessária e resultado esperado.
3. Registro persistente de propostas/decisões e confirmação humana vinculada à proposta.
4. Serviços governados para pause/resume, reassignment, retry e prioridade, respeitando pinagem, leases, idempotência e concorrência.
5. Memória operacional de missão e consolidação do Draft pai com resultados das filhas, conforme AC-008 a AC-010.
6. Integração progressiva dos módulos de conhecimento (BBC/BCE), incluindo contratos de ingestão, curadoria e vetorização.
7. UI do SCP com telemetria real dos módulos, operações, agentes, processamento, resposta e falha.
8. Seleção/configuração de provedores e modelos sem acoplamento a identificadores hardcoded.

## 11. Limites e estado de implementação

Esta definição arquitetural não declara todos os módulos implementados. Os incrementos iniciais desta branch incluem mediação cognitiva do Messenger, encaminhamento explícito para a execução atualmente atribuída e consulta somente leitura do contexto operacional da missão aberta.

Não estão implementados por esta entrega: pipeline completo SWE/BBC/SCur/BCE/SVec, consulta de candidatos elegíveis e módulos, planos persistentes, confirmação humana vinculada a propostas, transferência, pausa/retomada, memória operacional persistente, telemetria completa do SCP ou canal independente de missão.

A chamada LLM e a chamada Manus existentes só são invocadas pelo fluxo de runtime quando uma mensagem for enviada. Não houve execução externa real. Os testes automatizados foram executados com os adaptadores externos mockados; a integração real do tool calling com o gateway Manus Forge permanece não validada.

## 12. Critérios de aceite arquitetural

- SOFIA é descrito como o sistema integrado e modular.
- SCP é descrito exclusivamente como painel central de comando/frontend do SOFIA, não como módulo independente nem como sinônimo de *control plane*.
- BBC é a Base Bruta de Conhecimento; BCE é a Base de Conhecimento Evolutivo curada.
- SWE alimenta a BBC; SCur cura a BBC e mantém a BCE; SVec vetoriza a BCE curada, não a BBC como fonte primária.
- Módulos especializados possuem responsabilidades e contratos próprios, integrados ao SOFIA.
- Cognição, governança e orquestração são capacidades transversais do SOFIA.
- Implementação, especificação, proposta e hipótese permanecem claramente distinguidas.
- Nenhuma ferramenta ignora ownership, pinagem, estado ou políticas.
- `pnpm check`, `pnpm test` e `pnpm build` passam antes de integrar.
- Nenhum deploy, restart, alteração de DB/produção, dispatch ou consumo de créditos sem gate específico.


## 13. TR — compreensão, validação e memória evolutiva das missões (AC-014)

Toda missão deve receber um primeiro TR após sua criação e antes da execução. O TR é um documento narrativo vivo, versionado e rastreável que permite compreender origem, motivação, objetivo, escopo, evolução, resultados comprovados, situação atual, decisões, relações e próximos passos.

- **Origem humana:** a SOFIA gera o TR inicial e o apresenta ao operador solicitante. A execução depende da validação explícita do entendimento; o operador pode corrigir ou redirecionar e cada versão é preservada.
- **Origem SOFIA:** a SOFIA também gera o TR inicial e pode prosseguir sem validação humana preliminar, desde que permaneça dentro das permissões e políticas de autonomia. Deve registrar que a iniciativa e a motivação operacional são do sistema, com evidências.
- **Intervenção:** o operador pode consultar e reorientar qualquer missão durante sua execução, respeitando os gates de governança aplicáveis.
- **Integridade:** o TR não inventa motivação ou resultados. Distingue declarações, fatos, decisões, interpretações, hipóteses, reconstruções e dados não localizados. Para missão antiga sem justificativa, declara que a motivação original não foi localizada; reconstrução é sempre rotulada. Resultados realizados exigem evidência.
- **Ciclo documental:** captura de eventos/fontes, consolidação narrativa e publicação versionada são etapas distintas; versões anteriores não são sobrescritas.
- **SCP:** ao abrir missão, o TR é a visão principal; tarefas, ORs, checkpoints, decisões, evidências e FOR são detalhamento secundário.
- **Correlação:** relações entre missões só são apresentadas com fundamento e proveniência. Similaridade de termos não basta.
- **TR ≠ FOR:** TR atende à compreensão humana e preserva contexto vivo; FOR consolida aprendizado operacional para melhorar a SOFIA.

O contrato completo, estados documentais e critérios de aceite estão em governance/architecture/MISSION_TR_SPECIFICATION.md. Esta definição não presume que geração, versionamento, eventos ou UI já estejam implementados.

## 14. Blueprint — plano de trabalho derivado do TR (AC-015)

O Blueprint é o plano de trabalho operacional que a SOFIA deriva de uma versão específica do TR. TR e Blueprint não são sinônimos:

- TR apresenta ao operador a compreensão e a evolução da missão.
- Blueprint orienta o executor sobre etapas, tarefas, dependências, recursos, restrições, critérios de aceite e evidências.

Para missões humanas, a validação explícita do TR inicial precede a liberação do trabalho. Para missões autônomas, o TR inicial continua obrigatório e a SOFIA pode produzir o Blueprint e prosseguir dentro dos limites de autonomia e governança.

O Blueprint referencia a versão exata do TR, não amplia silenciosamente o escopo aprovado e é versionado quando houver replanejamento material. A missão-pai mantém o Blueprint mestre; tarefas-filhas referenciam a unidade de trabalho que executam. Agentes recebem pacotes de trabalho limitados ao contexto e às permissões necessários, e sua atribuição permanece temporária.

OR documenta a execução e suas evidências; TR consolida a narrativa da missão; FOR consolida o aprendizado operacional final. O contrato completo está em `governance/architecture/MISSION_BLUEPRINT_SPECIFICATION.md`. Esta decisão arquitetural não implica implementação atual do Blueprint em schema, UI ou runtime.

## 15. Interface de missão orientada pelo TR (AC-016)

A ação **Gerenciar** na listagem de Missões deve abrir a tela de detalhe diretamente na visão **TR — Missão**. O TR é o conteúdo principal e a visão padrão para o operador, não uma aba secundária.

A descrição original informada na criação permanece preservada como fonte primária da missão e proveniência do pedido. Ela não deve ser confundida com o TR consolidado nem com o Blueprint.

Na mesma tela, o **Blueprint — Plano de trabalho** fica disponível em área/aba própria, como visão operacional direcionada aos executores. A ordem de leitura deve privilegiar:
1. TR — compreensão, origem, motivação, objetivo, escopo, evolução, decisões, resultados comprovados e estado atual;
2. Blueprint — plano operacional versionado, etapas, unidades de trabalho, dependências, executores, critérios de aceite e evidências;
3. Execução — subtarefas, ORs, checkpoints e evidências;
4. Consolidação — entregável final e FOR.

Identificação, estado da missão e controles governados permanecem visíveis. Em missão humana aguardando validação, o próprio TR oferece leitura, correção e validação explícita e informa que a execução está bloqueada até essa validação. Em missão de origem SOFIA, a interface informa a origem autônoma e permite inspeção/intervenção sem exigir aprovação humana preliminar.

A descrição original não deve ser exibida como se fosse um TR já consolidado ou um plano de execução. Esta é uma decisão de UX; sua implementação depende das APIs e da persistência versionada de TR/Blueprint.


## 16. Visualizador dinâmico de documentos da missão (AC-017)

A tela Gerenciar Missão utiliza um único espaço de leitura, controlado por seletor dinâmico alimentado por catálogo de tipos documentais e pelas instâncias efetivamente existentes e acessíveis da missão. Não haverá abas fixas nem páginas específicas para cada tipo.

- TR é selecionado por padrão e permanece a visão prioritária do operador.
- Blueprint, ORs, FOR e futuros documentos são apresentados no mesmo espaço quando existirem e forem autorizados.
- O catálogo descreve tipos, rótulos, finalidade, ordenação, renderização e regras de visibilidade; instâncias registram documentos concretos, versões, estado, autoria, proveniência e vínculo com a missão.
- O modelo permite várias instâncias do mesmo tipo, por exemplo ORs por tarefa ou etapa.
- A descrição original da solicitação permanece preservada separadamente como fonte/proveniência; não é TR nem Blueprint.
- Selecionar um documento altera somente a visualização. Não altera missão, execução, atribuição ou gates.
- Backend/RLS são responsáveis por ownership e acesso; a UI lista apenas documentos existentes e acessíveis e distingue ausência, elaboração, carregamento, erro e acesso negado.

Contrato normativo: governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md. A decisão define UX e modelo lógico; persistência, APIs, RLS e UI ainda dependem de implementação.

## 17. Ferramenta cognitiva de inspeção da missão (OR-20261114-0034)

A ferramenta `inspect_current_mission` permite que a SOFIA consulte dados operacionais estruturados da missão atualmente aberta no Messenger. O LLM não escolhe Mission ID nem fornece identificadores de registros: o servidor deriva o escopo da missão já autorizada no contexto da requisição.

O snapshot contém a missão raiz, suas tarefas-filhas diretas, estados locais, Agent IDs, pinagem, Agent Task IDs/Manus Task IDs, estado externo, créditos utilizados, agentes efetivamente atribuídos e o gate documental TR/Blueprint.

Controles:
- Ownership da missão é validado antes da consulta; tarefas-filhas de outro proprietário são excluídas.
- Apenas dados públicos mínimos dos agentes atribuídos são projetados; tokens, senhas e credenciais nunca entram no contexto do LLM.
- Créditos são identificados como último snapshot persistido, com data e indicação de atualidade; não são consultados em tempo real.
- Status online/conectado não é interpretado como elegibilidade para nova atribuição.
- A ferramenta não altera missão, estado, atribuição, prioridade, execução ou créditos.
- O resultado é sintetizado pela SOFIA em uma segunda chamada cognitiva; testes automatizados mockam o provedor.

Esta primeira ferramenta cobre somente a missão aberta, sua raiz e filhas diretas. A consulta de candidatos elegíveis foi implementada separadamente pela ferramenta `inspect_agent_eligibility` (OR-20261114-0035), com o predicado do claim reproduzido em modo somente leitura. Consultas de módulos e planos estruturados permanecem fases posteriores.

## 18. Ferramenta cognitiva de elegibilidade de agentes (OR-20261114-0035)

A ferramenta `inspect_agent_eligibility` permite à SOFIA responder quais agentes do proprietário da tarefa atendem ao predicado atual de `claimStagedTaskWithAvailableAgent`, e por quais razões os demais não atendem.

A função de banco `inspectTaskAgentEligibility(taskId, ownerId)` deriva o escopo da tarefa já validada pelo Messenger. O LLM não fornece owner ID, agent IDs ou filtros de consulta.

O predicado reproduzido é:
- tarefa em `STAGED`;
- pinagem humana: quando há agente pinado, somente esse agente pode ser elegível;
- status do agente `online`;
- conexão `configured` ou `connected`;
- credencial presente, exposta ao contexto cognitivo somente como booleano;
- saldo de créditos positivo;
- `creditsUpdatedAt` nos últimos 60 segundos;
- ausência de outra tarefa do mesmo agente em `PROGRESS`.

A ordenação de candidatos elegíveis acompanha a seleção automática do claim: saldo decrescente, snapshot mais antigo e Agent ID.

Controles e limites:
- A consulta não usa `FOR UPDATE`, `SKIP LOCKED`, reserva, transação de claim ou escrita.
- O resultado é um snapshot e pode mudar antes de uma tentativa posterior de claim.
- Não valida credencial com o provedor externo nem atualiza créditos; usa a presença da credencial e o snapshot persistido.
- O status `configured` permanece elegível porque o claim atual o aceita; esta entrega não modifica a regra de atribuição.
- O claim transacional continua sendo a única autoridade para reservar agente sob concorrência.
- Testes do Messenger mockam banco e provedor; a execução SQL em banco persistente e a integração cognitiva externa real permanecem pendentes.

## 19. Plano de ação estruturado e aprovação humana versionada (AC-018 / OR-20261114-0036)

A SOFIA pode propor um plano de ação estruturado somente a partir do TR vigente validado e do Blueprint vigente READY/ACTIVE que referencia aquela versão exata do TR. O conteúdo é JSON validado deterministicamente no servidor e persistido como documento ACTION_PLAN, usando o catálogo e o versionamento imutável existentes.

O plano inclui objetivo, resultado esperado, unidades de trabalho, dependências, critérios de aceite, propostas de agentes, riscos, reversibilidade e aprovação obrigatória. Agentes propostos devem pertencer ao snapshot read-only de elegibilidade. O snapshot não reserva agente e pode ficar obsoleto. Enquanto não existir modelo verificável de custo/crédito por unidade, estimativas de créditos permanecem null; saldo do agente não é custo de execução.

A proposta é persistida como versão PROPOSED, com hash SHA-256 e proveniência para as versões exatas do TR e Blueprint. A aprovação humana é uma nova versão imutável APPROVED, de autoria do proprietário, com referência à versão e hash aprovados. A transação verifica versão/hash, integridade e atualidade das fontes; proposta alterada ou desatualizada não pode ser aprovada.

A aprovação documental não cria tarefas-filhas, não atribui/reserva agentes, não altera status, não inicia execução, não despacha Manus e não autoriza consumo de créditos. Gates de risco, orçamento, permissões, idempotência e execução por unidade continuam sendo responsabilidades determinísticas futuras.

A migration 0011 somente registra ACTION_PLAN no catálogo documental já protegido por RLS server-only; não cria nova tabela e não é executada automaticamente no startup. A validação externa do LLM e banco persistente não foi realizada.

## 20. Pré-avaliação determinística de governança por unidade (AC-019 / OR-20261114-0037)

O ACTION_PLAN aprovado não autoriza automaticamente a execução de suas unidades. O motor `evaluateExecutionGate` aplica avaliação determinística fail-closed para aprovação do plano, atualidade de TR/Blueprint, dependências concluídas, classificação/limite de risco, estimativa e orçamento verificados, permissão por unidade, elegibilidade específica do executor, idempotência e adaptador de execução.

A query `tasks.documents.evaluateActionPlanUnit` é somente leitura, valida ownership, carrega a versão vigente do ACTION_PLAN, identifica a unidade e revalida a cadeia de origem Blueprint→TR. A UI permite selecionar uma unidade e visualizar os bloqueios. Evidência desconhecida resulta em bloqueio; elegibilidade do agente-pai não é usada como prova para futura tarefa-filha.

Restrição crítica identificada: `drizzle/0003_automatic_task_dispatch.sql` cria trigger AFTER INSERT OR UPDATE OF `statusId`, `agentId`; uma tarefa que entra em STAGED dispara `net.http_post`. `scripts/ensure-database.mjs` instala esse trigger na inicialização. Assim, criar subtarefa STAGED pode iniciar dispatch antes de qualquer confirmação posterior. Não materializar Txx em tarefas operacionais até existir protocolo transacional e defesa no servidor, orquestrador, endpoint interno e trigger SQL.

A pré-avaliação atual bloqueia por ausência de mapeamento de dependências, política de risco, orçamento verificado, permissão por unidade, elegibilidade do executor-filho, idempotência persistida e adaptador específico. Mesmo o resultado positivo futuro será apenas `READY_FOR_SEPARATE_DISPATCH_GATE`; a função sempre declara `dispatchPerformed=false`. Nenhuma migration, alteração de trigger, tarefa-filho, dispatch ou execução foi realizada.


## 21. Identidade persistente e autorização transacional de unidades ACTION_PLAN (AC-020 / OR-20261115-0038)

A tabela server-only `missionActionUnits` registra a identidade operacional de cada Txx vinculada à missão raiz e à versão/hash imutáveis do ACTION_PLAN aprovado. Guarda chave de idempotência única, vínculo opcional à tarefa operacional, estado e autoria/data da aprovação individual. O trigger da tabela rejeita plano desatualizado, conteúdo Txx divergente, aprovação que não seja do proprietário e tarefa operacional fora da árvore direta da missão.

A barreira de dispatch foi integrada à migration 0003, que é reinstalada pelo `scripts/ensure-database.mjs`. Para missões com ACTION_PLAN, a raiz e qualquer tarefa sem registro de unidade aprovado, em `READY_FOR_DISPATCH`, e vinculado à tarefa não chegam ao HTTP callback. A função verifica também o conteúdo exato Txx/título e a versão/hash atual do plano. Se a migration 0012 ainda não existir numa instalação que já tenha o catálogo documental, o fluxo falha fechado.

O repositório server-side e o orquestrador repetem a validação. O endpoint interno recebe a chave de idempotência do trigger; chamadas diretas da UI/tRPC sem essa chave não podem iniciar unidades ACTION_PLAN. Missões legadas sem ACTION_PLAN preservam o dispatch existente.

Esta etapa não implementa ainda a API/UI para registrar/aprovar unidade, materialização transacional da tarefa-filha ou atualização de estado após execução. Nenhum registro foi colocado em `READY_FOR_DISPATCH`, nenhuma subtarefa foi criada e nenhum dispatch foi executado. A etapa seguinte deverá persistir pré-condições operacionais (dependências, risco, orçamento, permissões, elegibilidade e adaptador), aprovação individual e criação atômica em PAUSED → vínculo → STAGED.

A migration 0012 impõe ciclo monotônico `REGISTERED → AWAITING_APPROVAL → APPROVED → READY_FOR_DISPATCH → DISPATCHED`, com transições de bloqueio/cancelamento controladas. A unidade não pode ser inserida diretamente como aprovada ou pronta; a aprovação é do proprietário e imutável. O vínculo à tarefa operacional torna-se imutável depois de preenchido, e a tarefa deve ser filha direta da missão raiz. Hash, idempotency key e título têm constraints próprias. A verificação server-side e o trigger SQL rejeitam também ACTION_PLAN sem versão persistida. A retomada após bloqueio de créditos revalida a autorização antes de enviar mensagem ou criar execução por reatribuição.

CI final [43699884914](https://github.com/meshwave65/SofiaControlPanel/actions/runs/43699884914): TypeScript, testes, build, migrations 0010–0012 e teste de dispatch no PostgreSQL 16 descartável: SUCCESS.
