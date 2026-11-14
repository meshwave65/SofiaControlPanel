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
- Testes de regressão foram adicionados, mas ainda não executados.

## 10. Próximas entregas

1. Ferramentas somente de leitura para consultar missões, módulos, agentes elegíveis, créditos e dependências, sempre filtradas por ownership.
2. Planos de ação estruturados com intenção, alvo, pré-condições, impacto, confirmação necessária e resultado esperado.
3. Registro persistente de propostas/decisões e confirmação humana vinculada à proposta.
4. Serviços governados para pause/resume, reassignment, retry e prioridade, respeitando pinagem, leases, idempotência e concorrência.
5. Memória operacional de missão e consolidação do Draft pai com resultados das filhas, conforme AC-008 a AC-010.
6. Integração progressiva dos módulos de conhecimento (BBC/BCE), incluindo contratos de ingestão, curadoria e vetorização.
7. UI do SCP com telemetria real dos módulos, operações, agentes, processamento, resposta e falha.
8. Seleção/configuração de provedores e modelos sem acoplamento a identificadores hardcoded.

## 11. Limites e estado de implementação

Esta definição arquitetural não declara todos os módulos implementados. O primeiro incremento desta branch limita-se à mediação cognitiva do Messenger e ao encaminhamento explícito para a execução atualmente atribuída.

Não estão implementados por esta entrega: pipeline completo SWE/BBC/SCur/BCE/SVec, ferramentas read-only ampliadas, transferência, pausa/retomada, planos persistentes, memória operacional persistente, telemetria completa do SCP ou canal independente de missão.

A chamada LLM e a chamada Manus existentes só são invocadas pelo fluxo de runtime quando uma mensagem for enviada. Nenhum teste ou execução externa real foi disparado nesta implementação. Testes automatizados devem mockar ambos os adaptadores.

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
