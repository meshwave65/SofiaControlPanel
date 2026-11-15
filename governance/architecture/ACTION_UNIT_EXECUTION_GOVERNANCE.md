# Pré-avaliação de governança de execução por unidade

**Identificador:** AC-019  
**Relatório:** OR-20261114-0037  
**Estado:** motor read-only implementado; autorização e execução não implementadas.

## 1. Princípio

Um ACTION_PLAN aprovado é um documento de intenção e decomposição. Não autoriza automaticamente a execução de suas unidades. Cada unidade deve passar por avaliação determinística própria, com evidências atuais e verificáveis.

## 2. Fatos exigidos pelo motor

A função `evaluateExecutionGate` recebe fatos tipados e avalia:

1. Plano integral aprovado.
2. Versões exatas de TR e Blueprint ainda vigentes.
3. Todas as dependências concluídas.
4. Classe de risco e limite permitido pela política.
5. Estimativa de créditos verificada e orçamento autorizado suficiente.
6. Permissão explícita para a ação e a unidade.
7. Executor elegível para aquela unidade no momento da avaliação.
8. Chave de idempotência persistida.
9. Adaptador validado para converter a unidade estruturada em execução.
10. Confirmação humana individual da unidade.

Valores ausentes ou não verificáveis falham fechados.

## 3. Decisões

- `BLOCKED`: existe pelo menos uma pré-condição ausente, falsa ou acima do limite.
- `AWAITING_UNIT_APPROVAL`: todas as pré-condições verificáveis foram satisfeitas, mas falta confirmação explícita desta unidade.
- `READY_FOR_SEPARATE_DISPATCH_GATE`: fatos e confirmação individual existem; ainda assim, esta decisão não despacha. O mecanismo de dispatch deve revalidar estado, idempotência, lease e autorização sob concorrência.

A resposta inclui `dispatchPerformed: false` em todos os resultados.

## 4. API e interface

`tasks.documents.evaluateActionPlanUnit` é query somente leitura. Deriva a missão raiz do task ID autorizado, valida ownership, carrega ACTION_PLAN atual, identifica unidade e revalida a cadeia Blueprint→TR. A UI mostra os bloqueios da unidade selecionada.

Dependências não vazias ficam `null`/não verificadas enquanto não existir mapeamento persistido Txx→task ID e evidência de conclusão. Elegibilidade do agente da missão-pai não é reutilizada como elegibilidade de uma tarefa-filha.

## 5. Trigger de dispatch — restrição crítica

A migration `0003_automatic_task_dispatch.sql` cria trigger `tasks_dispatch_staged` AFTER INSERT OR UPDATE OF `statusId`, `agentId`. Ao detectar STAGED, faz `net.http_post` para o endpoint de dispatch. `scripts/ensure-database.mjs` instala a migration na inicialização.

Portanto, inserir uma filha já STAGED pode despachar automaticamente antes de qualquer fluxo posterior. Não criar tarefas operacionais para materializar Txx até existir um protocolo transacional seguro. A autorização futura precisa ser verificada pelo servidor, orquestrador, endpoint interno e pelo próprio trigger SQL. Nenhuma camada isolada é suficiente.

## 6. O que ainda não existe

- Persistência do vínculo Txx→task ID, com versão imutável do plano/Blueprint.
- Estados operacionais por unidade sincronizados com dependências.
- Taxonomia de risco e política configurada/versionada.
- Modelo de custo por tarefa e orçamento autorizado verificável.
- Permissões por unidade/ação.
- Verificação de elegibilidade específica da tarefa-filha.
- Chave de idempotência persistida e proteção de concorrência ponta a ponta.
- Adaptador que traduza unidade estruturada para instrução de execução com escopo limitado.
- Confirmação humana individual persistida e vinculada a hash/versão.
- Defesa SQL do trigger para exigir autorização persistida antes do HTTP dispatch.

## 7. Critérios para o próximo incremento

- Nenhuma tarefa-filha STAGED pode existir sem vínculo imutável à unidade e aprovação correspondente.
- Inserção/update de tarefa sem autorização persistida é rejeitada pelo trigger/servidor.
- Repetição do mesmo pedido não pode gerar dispatch duplicado.
- Troca de plano/Blueprint invalida autorização não iniciada e preserva trilha histórica.
- Atribuição do executor é específica à unidade, respeita pinagem e é validada no claim atômico.
- Nenhuma aprovação do plano pai libera todas as unidades automaticamente.


## 8. Identidade persistente e barreira de dispatch (AC-020 / OR-20261115-0038)

A migration 0012 introduz `missionActionUnits`, com vínculo à missão raiz, ACTION_PLAN e versão/hash exatos, identificador/título Txx, idempotency key, tarefa operacional, estado e aprovação humana. A identidade do plano/unidade/chave é imutável; constraints impedem duplicação de unidade por versão, chave ou tarefa operacional. A tabela é server-only sob RLS.

O trigger de validação da tabela confirma que a versão referenciada é a versão APPROVED mais recente do ACTION_PLAN, que o hash e o conteúdo Txx correspondem exatamente, que a aprovação é do proprietário e que a tarefa operacional, quando vinculada, é filha direta da mesma missão.

A defesa foi integrada aos quatro pontos de execução:
- SQL trigger `tasks_dispatch_staged`: se houver ACTION_PLAN vigente, bloqueia a raiz e qualquer filha sem registro de unidade aprovado, vinculado à tarefa e em `READY_FOR_DISPATCH`, antes de `net.http_post`.
- Endpoint interno: recebe a chave de idempotência do callback autenticado.
- Orquestrador: revalida o registro e exige a chave persistida para ACTION_PLAN; chamada de UI/tRPC sem chave não inicia execução.
- Repositório: verifica versão/hash, vínculo Txx/título e estado do registro antes de autorizar o início.

`ensure-database.mjs` continua instalando a migration 0003; por isso a própria definição reinstalada do trigger foi atualizada, não apenas uma migration avulsa. Se o catálogo documental estiver presente mas a tabela 0012 ainda não estiver instalada, ACTION_PLAN falha fechado. Missões legadas sem ACTION_PLAN preservam o caminho anterior.

O incremento não cria nem aprova registros de unidade e não cria tarefas operacionais. `READY_FOR_DISPATCH` só poderá ser atribuído por fluxo futuro que conclua dependências, risco, orçamento, permissão, elegibilidade específica, adaptador e aprovação humana individual. Nenhum dispatch foi realizado.

A retomada de tarefas bloqueadas por créditos também revalida a autorização da unidade antes de enviar continuação ao executor ou criar nova execução após reatribuição. A autorização de dispatch não pode ser contornada pelo caminho de recuperação.

A migration 0012 também define uma máquina de estados monotônica: `REGISTERED → AWAITING_APPROVAL → APPROVED → READY_FOR_DISPATCH → DISPATCHED`, com saídas controladas para `BLOCKED/CANCELLED`. Não se insere uma unidade diretamente aprovada/pronta; a aprovação é registrada depois da criação e vinculada ao proprietário. Depois de definido, o vínculo à tarefa operacional não pode ser removido ou reatribuído. A tarefa deve ser filha direta da missão raiz, condição repetida no repositório e no trigger 0003.

A migration valida formato do hash SHA-256, comprimento da idempotency key, título não vazio, unicidade e ownership. A query de autorização também falha fechado se existir documento ACTION_PLAN sem versão persistida. CI final [43699884914](https://github.com/meshwave65/SofiaControlPanel/actions/runs/43699884914): TypeScript, testes, build, migrations 0010–0012, instalação do trigger e teste de barreira PostgreSQL 16 descartável passaram.


## 9. Registro e aprovação individual (AC-021 / OR-20261115-0039)

O fluxo registra todas as unidades da versão APPROVED vigente em `missionActionUnits`, com chave de idempotência por unidade e evidência da versão/hash de origem. O registro inicial fica em `AWAITING_APPROVAL`; somente o proprietário da missão raiz pode aprovar uma unidade individual. A transação revalida ownership, versão mais recente, estado APPROVED e hash SHA-256 antes de persistir `approvalUserId`, `approvedAt` e a evidência de aprovação.

A aprovação individual confirma apenas a intenção/escopo daquela unidade. Não satisfaz os gates de dependências, risco/política, orçamento, permissão, elegibilidade do executor ou adaptador e não altera estado de tarefa. A UI permite registrar o conjunto e aprovar Txx individualmente, mantendo a pré-avaliação de execução separada. Nenhuma tarefa operacional é criada neste incremento.

A validação integral de AC-021 permanece pendente: o job PostgreSQL do workflow #283 passou, mas o job de aplicação falhou no TypeScript antes dos testes/build. A correção posterior foi commitada; não foi possível confirmar execução verde no commit corrigido. Ver OR-20261115-0039. Migration 0012 não aplicada em banco persistente.


## 10. Materialização estrutural em PAUSED (AC-022 / OR-20261115-0040)

A mutation `tasks.documents.materializeApprovedActionPlanUnits` materializa somente unidades com aprovação individual persistida pelo proprietário. A função server-side:

- trava a missão raiz e o documento ACTION_PLAN para serializar a operação contra materializações concorrentes e revisões do plano;
- revalida ownership, versão APPROVED vigente, hash SHA-256, contrato estruturado e correspondência integral entre unidades do plano e registros persistidos;
- cria cada tarefa-filha em `PAUSED`, com `agentId = NULL`, sem pinagem e sem execução externa;
- grava `operationalTaskId` e evidência de materialização na mesma transação, mantendo a unidade no estado `APPROVED`;
- é idempotente: vínculos já existentes são retornados e não geram uma segunda tarefa;
- reverte toda a operação se uma tarefa ou vínculo falhar.

A migration 0012 valida imediatamente qualquer `operationalTaskId` preenchido: a tarefa deve existir, pertencer ao mesmo proprietário e ser filha direta da missão raiz, mesmo quando a unidade continua APPROVED.

A UI mostra a ação de materialização e o ID da tarefa-filha. A mensagem de estado deixa explícito que a tarefa está PAUSED, sem executor e sem dispatch.

O teste PostgreSQL descartável agora verifica que o vínculo de uma tarefa PAUSED mantém a unidade APPROVED e que a tarefa não pode chegar a STAGED antes da transição independente para READY_FOR_DISPATCH. O caminho de produção continua fechado: AC-022 não promove estados, não atribui agentes, não faz claim, não chama Manus e não consome créditos.

CI validado no workflow [#317](https://github.com/meshwave65/SofiaControlPanel/actions/runs/43707809264): TypeScript, 56/56 testes, build e PostgreSQL 16 descartável com migrations 0010–0012, trigger e teste de barreira SUCCESS. O mesmo workflow confirmou a correção de AC-021. Nenhuma migration persistente, tarefa real, merge ou deploy.


## 11. AC-023 — auditoria das fontes de evidência (OR-20261115-0041)

A auditoria do schema encontrou 21 tabelas, mas não encontrou fontes dedicadas de orçamento por missão/unidade, risco operacional, permissões granulares, catálogo de capacidade de executores ou capacidades de adaptadores.

Os dados ARC/PGC permanecem limitados à confiança/telemetria do agente. `arcPolicies` não é política de risco da ação; `arcAssessments`/ `arcEvidence` não concedem permissão. `agents.creditsRemaining` é snapshot do saldo do executor, não orçamento da missão nem ledger. `ActionPlanSchema` rejeita estimativas numéricas enquanto não existir modelo verificável.

Dependências podem ser verificadas somente por ACTION_PLAN vigente + vínculo Txx→operationalTaskId + status DONE da tarefa predecessora. Elegibilidade do executor precisa ser específica da tarefa-filha e revalidada no runtime. A existência do adaptador Manus não demonstra compatibilidade com qualquer unidade.

Contrato para a próxima implementação:
- ledger de evidências append-only tipadas por gate, vinculado à missão, ACTION_PLAN version/hash e Txx;
- categorias fechadas: DEPENDENCY, RISK_POLICY, BUDGET_AUTHORIZATION, UNIT_PERMISSION, EXECUTOR_ELIGIBILITY e ADAPTER_CAPABILITY;
- evidência com origem/autor, status, payload validado, observedAt e validade quando aplicável;
- RLS server-only, constraints de identidade e trigger de imutabilidade;
- ausência, obsolescência ou incompatibilidade mantém BLOCKED;
- nenhuma evidência ou aprovação isolada promove para READY_FOR_DISPATCH.

A auditoria e as decisões estão em OR-20261115-0041. AC-023a deve implementar o ledger e a verificação de dependências sem inventar política permissiva. Contratos de risco, orçamento e permissão continuam gates fechados até existirem fontes explícitas.
