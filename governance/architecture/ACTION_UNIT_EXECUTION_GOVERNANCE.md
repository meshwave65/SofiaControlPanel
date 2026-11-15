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
