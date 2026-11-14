# SOFIA — Cognitive Control Plane do SofiaControlPanel

**Status:** arquitetura aprovada para implementação incremental  
**Responsável pelo produto:** operador humano  
**Missão de implementação inicial:** MISSION_0020 / tarefa 20.4  
**Branch de trabalho:** `feat/sofia-cognitive-control-plane`

## 1. Princípio central

SOFIA significa **Sistema de Orquestração Federada de Inteligências Artificiais**. O SofiaControlPanel (SCP) é o plano de controle cognitivo e operacional do ecossistema: recebe a intenção do operador, mantém o contexto da missão, aplica governança, coordena agentes e preserva a continuidade do trabalho.

Missões pertencem ao SCP. Agentes externos são executores substituíveis, salvo quando o operador fixa explicitamente um agente. A identidade do executor não é a identidade nem a propriedade da missão.

## 2. Separação de responsabilidades

### 2.1 Camada cognitiva — Sofia

- Interpreta mensagens em linguagem natural.
- Considera o contexto da missão e o histórico pertinente.
- Distingue perguntas, análises, propostas e instruções explícitas.
- Planeja ações e solicita esclarecimentos quando a intenção é ambígua.
- Aciona ferramentas tipadas somente quando a intenção e as condições de uso forem satisfeitas.
- Comunica ao operador o que foi analisado, proposto, tentado e efetivamente confirmado.

Implementação existente identificada: `server/_core/llm.ts`, com modelo `gemini-2.5-flash` por endpoint compatível com Chat Completions, configurado pelo gateway Manus Forge. O nome SOFIA identifica a camada de aplicação/orquestração, não um modelo próprio.

### 2.2 Camada de governança e controle — SCP

- Autentica o operador e valida ownership/permissões.
- Lê estado real de missões, agentes, créditos, pinagem, dependências e execução externa.
- Valida cada chamada de ferramenta e seus argumentos no servidor.
- Impõe transições, leases, concorrência, compatibilidade e políticas.
- Registra decisões e ações com resultado observável.
- Mantém missão e contexto independentes da identidade temporária do executor.

O LLM não recebe acesso direto ao banco, credenciais, APIs administrativas ou ferramentas irrestritas. Toda ação passa por serviços determinísticos do SCP.

### 2.3 Camada de execução — agentes federados

- Manus e outros agentes recebem unidades de trabalho encaminhadas pelo SCP.
- Devolvem resultados, erros e checkpoints.
- Não são o canal primário de comunicação com o operador.
- Não são proprietários da missão; sua atribuição é temporária, salvo pinagem humana explícita.

## 3. Fluxo de comunicação

`Operador → Sofia (LLM) → Policy/Action Engine do SCP → Adaptador do agente → Resultado → Sofia → Operador`

Toda mensagem do operador passa primeiro pela Sofia. O SCP decide se responde diretamente, consulta estado, pede esclarecimento, propõe uma ação ou encaminha uma instrução a um executor.

A comunicação com agentes é canal operacional subordinado ao SCP, não a interface primária do operador.

## 4. Classes de ferramentas e autorização

1. **Leitura:** consulta de missão, estado, agente, créditos e histórico autorizado. Pode ser executada automaticamente após validação de acesso.
2. **Ação operacional solicitada explicitamente:** encaminhamento de instrução a uma execução já associada à missão, dentro do escopo e da autorização do operador.
3. **Ação de impacto ou mudança de controle:** transferência/reatribuição, pausa/retomada, alteração de prioridade, criação/cancelamento de execução, mudanças financeiras ou de credenciais. Exige política explícita, validação de estado e confirmação humana quando definida pelo risco.

O modelo pode propor uma ação, mas nunca é a autoridade final para executá-la. A intenção em linguagem natural não substitui autorização, ownership, validação de estado nem idempotência.

## 5. Memória e contexto

- Contexto de missão: dados da missão selecionada, mensagens pertinentes, estado, checkpoints, resultados auxiliares e decisões.
- Contexto operacional: políticas e contratos arquiteturais do SCP, sem carregar indiscriminadamente dados de outras missões.
- Contexto de agente: capacidades e disponibilidade necessárias à decisão, sem expor credenciais.
- Contexto global do operador: somente quando houver finalidade e autorização claras.

O contexto deve ser minimizado, rastreável e delimitado por ownership. Conversas diretas independentes de missão, se implementadas, terão histórico e contexto próprios, sem efeitos colaterais sobre missões.

## 6. Primeira entrega implementada nesta branch

- O fluxo `messages.create` passa a chamar a Sofia antes de qualquer encaminhamento externo.
- A Sofia recebe os identificadores e o estado operacional disponíveis da missão: Mission ID, Agent ID, pinagem, Agent Task ID e estado Manus.
- Foi adicionada a ferramenta tipada `forward_operator_instruction_to_assigned_agent`.
- A ferramenta só deve ser acionada quando o operador pedir explicitamente o envio de uma instrução ao agente atualmente atribuído.
- O servidor valida os argumentos e exige Agent ID e Agent Task ID existentes antes de enviar.
- Perguntas e pedidos de análise ficam com a Sofia; não são encaminhados automaticamente ao agente.
- A resposta distingue encaminhamento e resposta efetivamente recebida; ausência de resposta fica como `pending`, sem alegação de leitura/recebimento.
- Teste de regressão adicionado para o fluxo mediado de encaminhamento.

## 7. Próximas entregas

1. Ferramentas somente de leitura para consultar missão, agentes elegíveis, créditos e dependências, sempre filtradas por ownership.
2. Plano de ação estruturado: intenção, alvo, pré-condições, impacto, confirmação necessária e resultado esperado.
3. Registro persistente de propostas/decisões e confirmação humana vinculada à proposta, evitando confirmação ambígua ou replay.
4. Serviços governados para pause/resume, reassignment, retry e alteração de prioridade, respeitando pinagem, leases, idempotência e concorrência.
5. Memória operacional de missão e consolidação do Draft pai com resultados das filhas, conforme AC-008 a AC-010.
6. Canal independente de missão com agente/conta, somente após validação do contrato Manus e isolamento de contexto.
7. UI do Messenger com estados reais de processamento, encaminhamento, resposta e falha; remover indicadores de conexão não comprovados.
8. Seleção/configuração de provedor e modelo sem acoplamento ao identificador hardcoded, preservando compatibilidade.

## 8. Limites desta entrega

Esta primeira entrega não implementa transferência de missão, pausa/retomada, gestão autônoma de prioridade, memória persistente global, canal direto independente de missão ou nova persistência/schema. Não executa ações em produção.

A chamada LLM e a chamada Manus existentes são invocadas somente pelo fluxo de runtime quando uma mensagem for enviada; nenhum teste ou execução externa real foi disparado nesta implementação. Testes automatizados devem mockar ambos os adaptadores.

## 9. Critérios de aceite

- Toda mensagem do operador é primeiro processada pela Sofia.
- A Sofia responde sem encaminhar perguntas ou análises como se fossem instruções externas.
- O encaminhamento exige tool call válido, instrução não vazia e execução Manus identificada.
- Falha/ausência de resposta não é apresentada como entrega ou leitura confirmada.
- Nenhuma ferramenta pode ignorar ownership, pinagem, estado ou políticas do SCP.
- Testes cobrem resposta cognitiva, encaminhamento explícito, execução ausente, argumentos inválidos e falha externa.
- `pnpm check`, `pnpm test` e `pnpm build` passam antes de integrar.
- Nenhum deploy, restart, alteração de DB/produção, dispatch ou consumo de créditos sem gate específico.
