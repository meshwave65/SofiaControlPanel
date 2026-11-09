# MISSION_0020 — Diagnóstico e Restauração Integral das Funcionalidades do SCP

> **Projeto:** SofiaControlPanel (SCP)  
> **Data e hora de criação:** 2026-11-09 04:58 (-03:00)  
> **Orquestrador:** SofiaControlPanel (SCP)  
> **Status:** STAGED  
> **Blueprint:** `governance/missions/0020/BLUEPRINT.md`

## Objetivo

Identificar, com evidências reproduzíveis, por que o SofiaControlPanel não executa missões de ponta a ponta como esperado; corrigir as causas-raiz dentro dos limites aprovados; e validar que as funcionalidades declaradas e implementadas do SCP funcionam de forma integrada, rastreável e segura, sem apresentar fluxos simulados como execução real.

## Diagnóstico inicial (evidências observadas em 2026-11-09)

- Há múltiplos caminhos de despacho implementados: `tasks.start` via tRPC/UI (`server/routers.ts`, `server/sofiaOrchestrator.ts`), varredura de tarefas pendentes no heartbeat (`server/heartbeat.ts`) e endpoint interno (`server/dispatchEndpoint.ts`) ligado ao servidor em `server/_core/index.ts`.
- `server/manusExecutionService.ts` contém chamadas à API Manus para criação/consulta de tarefas; o histórico da MISSION_0016 afirma que a integração real foi implementada e que o teste em produção ainda precisava ser observado com uma missão de baixo custo.
- Existem testes unitários do orchestrator com respostas mockadas (`server/sofiaOrchestrator.test.ts`), mas isso, por si só, não demonstra entrega do evento no ambiente implantado, autenticação/configuração real, execução externa, persistência nem sincronização do resultado de ponta a ponta.
- A MISSION_0019 cobre especificamente o Oracle Dispatcher e o worker de governança; não substitui a auditoria do ciclo de execução das funcionalidades do produto.

**Hipótese ainda não comprovada:** a falha percebida pode estar em qualquer fronteira entre criação/atribuição da tarefa, trigger/endpoint ou heartbeat, seleção de agente e credenciais, chamada Manus, polling, persistência, atualização de estado/resultados ou apresentação na UI. Não se deve eleger uma causa antes de obter logs e reproduções seguras.

## Escopo

1. Inventariar os fluxos de produto e contratos implementados, reconciliando UI, API/tRPC, banco, serviços externos, heartbeat/agendamento e documentação.
2. Reproduzir a falha de execução de missões em ambiente seguro e identificar a primeira fronteira que diverge do comportamento esperado.
3. Corrigir causas-raiz confirmadas no ciclo de vida de tarefas: criação, elegibilidade, atribuição/claim, despacho, execução externa, polling/retomada, persistência, consolidação e exibição de estados/erros.
4. Verificar as demais funcionalidades de produto atualmente declaradas como operacionais e implementar correções confirmadas, mantendo uma matriz requisito → fluxo → teste/evidência.
5. Acrescentar testes automatizados apropriados (unidade, integração e contrato) que cubram os caminhos reais relevantes, falhas, repetição/idempotência e concorrência, sem chamadas externas involuntárias.
6. Executar validação ponta a ponta controlada quando houver ambiente, credenciais e autorização já configurados; documentar limitações quando esses pré-requisitos não estiverem disponíveis.
7. Atualizar documentação operacional, critérios de health/observabilidade e handoff para que outro agente consiga repetir o diagnóstico e verificar a correção.

## Fora de escopo e limites

- Não revelar, copiar, registrar em logs ou transmitir credenciais, tokens, conteúdo de tarefas privadas ou segredos de ambiente.
- Não iniciar missões externas, consumir créditos Manus, fazer deploy, alterar dados de produção, schema, RLS ou credenciais sem autorização específica e ambiente de teste aprovado.
- Não enviar mensagens/comunicações externas nem tomar decisões humanas em nome do responsável.
- Não enfraquecer autenticação, ownership, isolamento entre agentes, aprovações, locks ou salvaguardas para fazer uma execução passar.
- Não duplicar nem assumir tarefas da MISSION_0019. Alterações do Oracle Dispatcher permanecem sob a MISSION_0019; registrar dependências e coordenar interfaces por contrato.
- Não declarar “todas as funcionalidades” validadas sem inventário delimitado, critérios observáveis e evidência por caminho. Funcionalidade ausente, descontinuada ou dependente de serviço externo deve ser classificada explicitamente.

## Organização e dependências

- MISSION_0019 permanece independente e `PROGRESS`; mudanças necessárias no Oracle/worker devem ser encaminhadas às tarefas elegíveis dessa missão e coordenadas, não duplicadas aqui.
- A execução de validação externa só pode ocorrer em escopo de teste e com pré-requisitos/autorizações comprovados. Se não houver, concluir diagnóstico local e deixar o gate externo claramente `BLOCKED`.
- Cada tarefa deve ser atribuída no quadro antes de editar arquivos, evitar sobreposição e produzir evidências e seu próprio Operational Report.

## Critérios globais de aceite

- Causa-raiz da falha reportada identificada ou, se bloqueada por indisponibilidade de evidência/ambiente, o ponto de bloqueio e o próximo desbloqueio estão demonstrados sem conjectura apresentada como fato.
- Cada funcionalidade no inventário acordado tem status `PASS`, `FAIL`, `BLOCKED` ou `NOT_APPLICABLE`, caminho rastreável e evidência/teste correspondente.
- O caminho de missão ponta a ponta passa por criação, claim/despacho, aceitação externa ou falha explícita, atualização/persistência e apresentação coerente de estado/resultado.
- Retentativas, concorrência, erros de configuração/credenciais e indisponibilidade externa não criam execução duplicada nem deixam a UI declarar sucesso falso.
- `pnpm check`, `pnpm test` e `pnpm build` passam após as correções; testes adicionais da missão passam e são repetíveis.
- Nenhuma chamada real de custo, escrita em produção ou ação externa ocorre sem o gate/autorização correspondente; documentação e handoff refletem precisamente o que foi validado.
- Operational Reports, índice, commits e estado final da missão/quadro concordam; itens bloqueados permanecem abertos.
