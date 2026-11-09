# Blueprint da MISSION_0020 — Diagnóstico e Restauração Integral das Funcionalidades do SCP

**Missão:** `MISSION_0020`  
**Estado:** STAGED  
**Data de criação:** 2026-11-09 04:58 (-03:00)  
**Orquestrador:** SofiaControlPanel (SCP)  
**Definição da missão:** `MISSION_0020 - Diagnóstico e Restauração Integral das Funcionalidades do SCP - STAGED.md`

## 1. Motivação e evidência inicial

O responsável relata que o SCP aparenta estar funcional, mas não consegue executar missões. A MISSION_0015 documentou o início de missões no banco/UI e observou que a execução por agente externo dependia de worker/runtime. A MISSION_0016 implementou integração Manus real, mas deixou a observação ponta a ponta em produção como validação futura, condicionada a uma missão de baixo custo e credenciais válidas. O código atual contém despacho manual via tRPC, despacho periódico via heartbeat e endpoint interno, bem como chamadas Manus e testes unitários do orchestrator com mocks.

Essa topologia demonstra vários pontos de integração, mas não informa qual está falhando no runtime do usuário. A primeira unidade deve buscar evidência não destrutiva: logs pertinentes, configuração presente/ausente sem revelar valores, estados de tarefas e reproduções em ambiente de teste autorizado. Não inferir a causa a partir apenas de existência de código ou testes mockados.

## 2. Objetivo

Localizar e corrigir as causas-raiz que impedem o SCP de executar missões e validar sistematicamente as funcionalidades declaradas/implementadas do produto contra seus contratos, de forma rastreável e sem falsos positivos, chamadas externas inadvertidas ou alterações não autorizadas em produção.

## 3. Unidades de trabalho

O quadro `MISSION_0020 - TASKS - STAGED.md` decompõe a missão em unidades sequenciais/paralelizáveis quando não houver sobreposição. Nenhuma tarefa deve ser assumida até passar a missão a `PROGRESS`, reconciliar branch/locks/dependências e registrar responsável. A tarefa 20.1 deve estabelecer inventário, sinais de falha e primeira fronteira divergente antes de implementar correções. Correções devem ser atribuídas a tarefas próprias ou adicionadas por decomposição rastreável antes da edição.

## 4. Limites e autorização

- Inspecionar apenas tabelas, logs e serviços necessários ao objetivo; evitar inventário genérico de dados.
- Redigir evidência sem segredos, dados pessoais desnecessários ou payloads confidenciais.
- Usar testes locais/fixtures como padrão; mocks não contam como comprovação de execução externa real.
- Não usar credenciais para execução real, não consumir créditos, não gravar no banco de produção e não fazer deploy sem autorização específica e ambiente aprovado.
- Não contornar autenticação, limites, aprovação humana, lock ou ownership.
- Não duplicar trabalho de Oracle Dispatcher, coberto pela MISSION_0019; documentar interface/dependência e coordenar mudanças necessárias.
- Não tratar funcionalidades não especificadas ou serviços indisponíveis como falhas do SCP sem classificar a dependência.

## 5. Entregáveis

- Inventário funcional delimitado e matriz de evidências/estados.
- Diagnóstico da fronteira de falha, com logs/reprodução/teste mínimos e causa confirmada ou impedimento explícito.
- Correções pontuais acompanhadas de testes de regressão e commits rastreáveis.
- Testes de fluxo integrado para estados/retentativas/erros e caminho de execução real somente quando autorizado.
- Guia de diagnóstico operacional e checklist de configuração/health sem segredos.
- Operational Reports por unidade, índice atualizado e handoff final com validação, bloqueios e limitações.

## 6. Critérios de aceite

1. A matriz cobre todos os módulos/ações presentes no inventário inicial aprovado e diferencia implementado, ausente, simulado, dependente de serviço e operacional.
2. O fluxo de missão atravessa criação → seleção/claim → despacho → integração externa ou erro explícito → polling/retomada → persistência → UI/consolidação; toda falha relevante é observável.
3. Testes reproduzem a causa-raiz antes da correção (quando viável) e demonstram o comportamento corrigido, além de duplicação, corrida, timeout e configuração ausente sem efeito externo.
4. O ambiente e a autorização de qualquer ensaio de ponta a ponta real estão documentados; se ausentes, esse gate permanece bloqueado e não é declarado concluído.
5. `pnpm check`, `pnpm test` e `pnpm build` passam, com saída anexada/resumida nos ORs pertinentes.
6. Nenhuma correção reduz salvaguardas nem altera produção sem aprovação explícita; mudanças de DB/segurança/contratos têm migração, compatibilidade e aprovação apropriadas.
7. A missão só pode ser `DONE` quando todas as tarefas e gates aplicáveis estiverem comprovados; bloqueios externos mantêm estado aberto.

## 7. Dependências

- Governança: `AGENTS.md`, `GOVERNANCE.md`, `governance/skills/operational-task-lifecycle/SKILL.md`, `governance/skills/skill-governance-oracle/SKILL.md`.
- Base técnica: `server/sofiaOrchestrator.ts`, `server/manusExecutionService.ts`, `server/heartbeat.ts`, `server/dispatchEndpoint.ts`, `server/routers.ts`, `server/db.ts`, interfaces de tarefa do cliente e testes atuais, a serem reconciliados novamente no início da tarefa.
- MISSIONS_0015 e 0016: precedentes de início/execução real; critérios e validação histórica devem ser reconfirmados contra código/ambiente atuais.
- MISSION_0019: integração de governança Oracle é dependência de coordenação, não autorização para modificar tarefas/arquivos daquela missão.
- Habilitação de quaisquer credenciais/serviços de teste e autorização para chamadas externas é um gate explícito.
