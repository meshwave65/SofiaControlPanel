# Mission Execution Governance — Plano Técnico de Implementação TR/Blueprint

**Status:** plano técnico derivado da auditoria de código em 2026-11-14  
**Referências:** AC-014, AC-015, OR-20261114-0024 e OR-20261114-0025  
**Branch:** `feat/sofia-cognitive-control-plane`

## 1. Objetivo

Implementar persistência versionada de TR e Blueprint e impedir que qualquer caminho de execução inicie trabalho sem cumprir os gates documentais e de governança. A proteção deve existir no servidor e no banco, não apenas na interface.

## 2. Fatos do código atual que condicionam a solução

1. `sofia.tasks` é o registro operacional da missão; não há tabela separada `missions` no schema inspecionado.
2. `tasks.create` aceita `statusId` arbitrário e insere diretamente nesse status.
3. A migration `0003_automatic_task_dispatch.sql` cria trigger AFTER INSERT OR UPDATE OF `statusId`, `agentId`; quando a linha fica STAGED, chama o endpoint de dispatch por `net.http_post`.
4. `scripts/ensure-database.mjs` instala explicitamente a migration 0003 durante a inicialização. Portanto, a instalação é parte do processo de startup/build configurado, embora a situação efetiva de produção não tenha sido consultada nesta auditoria.
5. `tasks.updateStatus` permite alteração genérica de status e pode, se o trigger estiver instalado, gerar dispatch ao definir STAGED.
6. `tasks.start` chama `SofiaOrchestrator.startTask`; o endpoint interno chama o mesmo método.
7. `startTask` contém a condição `alreadyClaimedWithoutExecution`: tarefa fora de STAGED, com agente e sem `manusTaskId`, pode continuar pelo fluxo de início. Um gate documental apenas na transição para STAGED não cobre esse caminho.
8. `factorizeTask` cria filhas STAGED e atualmente copia `agentId` e `agentPinned` do pai. A definição de fatorização já aprovada determina que pai mantém papel consolidador e filhas são unidades auxiliares executadas por outros agentes elegíveis; a implementação precisa respeitar essa decisão.
9. `taskStatuses` é tabela lookup, não enum PostgreSQL. Os nomes e IDs devem ser resolvidos pelo banco, sem hardcode de IDs.
10. O processo de startup executa scripts de banco; qualquer migration nova precisa ser idempotente, explícita, auditável e não pode ser executada manualmente contra produção nesta etapa.

## 3. Modelo de persistência recomendado

### 3.1 Tabela de versões documentais da missão

Criar tabela dedicada, por exemplo `missionDocumentVersions`, com:
- `id` PK;
- `taskId` FK para missão-pai;
- `documentType` restrito a TR ou BLUEPRINT;
- `version` inteiro crescente por missão e tipo;
- `documentState` (estados documentais, não status de tarefa);
- `content` (conteúdo integral legível);
- `origin` (human ou sofia);
- `authorType` e `authorId` quando aplicável;
- `sourceDocumentId` e `sourceVersion` para Blueprint referenciar o TR exato;
- `sourceRefs` JSONB com eventos, mensagens, ORs, arquivos e evidências consultados;
- `changeReason`, `createdAt`;
- unicidade em (`taskId`, `documentType`, `version`).

As versões são append-only. Correções e replanejamentos criam nova linha; não sobrescrevem conteúdo anterior. A versão corrente é a maior versão válida por tipo, com transição controlada e concorrência protegida por transação/constraint.

### 3.2 Vínculo das tarefas-filhas

A missão-pai é dona do TR e do Blueprint mestre. Filhas devem registrar vínculo explícito à versão do Blueprint e à unidade de trabalho que executam. A implementação deve evitar que uma filha se torne uma missão documental independente por acidente.

A decomposição deve criar filhas sem copiar a atribuição/pinagem do pai. Cada filha recebe sua própria atribuição efêmera, de acordo com elegibilidade e disponibilidade, e referencia o pacote/unidade do Blueprint mestre. A semântica de pinagem/consolidação aprovada em AC-008 a AC-010 permanece inalterada.

### 3.3 Segurança e RLS

A migration deve habilitar RLS na tabela documental e definir acesso por ownership da missão-pai via `tasks.createdBy`, incluindo leitura e escrita. Não presumir que o fato de o frontend ocultar registros seja controle de acesso. Validar se as chamadas de servidor usam credencial privilegiada e manter validação de ownership em cada router.

## 4. Ciclo seguro de criação e liberação

### Missão de origem humana
1. Criar a missão em estado não executável (DRAFT ou equivalente), sem status STAGED.
2. Preservar solicitação original, criador e origem.
3. SOFIA gera e persiste TR v1.
4. TR fica AWAITING_HUMAN_VALIDATION.
5. Operador corrige ou valida explicitamente; cada correção cria versão nova.
6. Após validação, SOFIA gera Blueprint vinculado à versão validada do TR.
7. Política determinística verifica escopo, permissões, orçamento, riscos, recursos e gates adicionais.
8. Somente então, transação controlada libera a missão para STAGED.

Falha na geração/persistência de TR ou Blueprint mantém missão não executável. Não fazer fallback para STAGED.

### Missão originada pela SOFIA
1. Registrar origem SOFIA, motivação operacional e evidências que sustentam a iniciativa.
2. Criar missão em estado não executável.
3. Persistir TR inicial antes de qualquer execução.
4. Produzir Blueprint vinculado ao TR.
5. Validar políticas e limites de autonomia.
6. Liberar para STAGED sem validação humana preliminar, apenas se todos os gates aplicáveis forem satisfeitos.

### Tarefas-filhas
Filhas são criadas sob o Blueprint validado/ativo do pai, recebem referência à versão e unidade do plano e não exigem nova validação humana do TR quando permanecerem dentro do escopo aprovado. O gate do banco deve verificar o vínculo e a autorização documental do pai antes de aceitar uma filha em STAGED.

## 5. Defesa em profundidade do dispatch

Aplicar as seguintes barreiras, todas necessárias:

1. **API de criação:** não aceitar `statusId` arbitrário como autorização de execução; criar missão humana sempre em estado não executável.
2. **API de status:** retirar a possibilidade genérica de promover missão para STAGED; usar operação de liberação governada e transacional.
3. **Rota start:** validar TR/Blueprint e estado de liberação antes de chamar o orquestrador.
4. **Orquestrador:** `startTask` deve validar o gate independentemente de quem o invoca; remover o bypass `alreadyClaimedWithoutExecution` ou condicioná-lo ao mesmo gate e a uma lease válida.
5. **Endpoint interno:** validar gate no servidor mesmo quando chamado por trigger.
6. **Trigger SQL:** antes de fazer `net.http_post`, verificar a existência/estado do TR e Blueprint apropriados para raiz ou filha. Em caso de ausência/inconsistência, impedir dispatch; não confiar somente no TypeScript.
7. **Fatorização:** criação de filha e vínculo à unidade Blueprint devem ocorrer em transação ou mecanismo que não permita uma filha STAGED sem referência válida. Trigger não deve disparar antes de o vínculo estar persistido.
8. **Idempotência e concorrência:** dupla validação, retries e chamadas concorrentes não podem gerar versões duplicadas ou múltiplas execuções externas.

O trigger não deve tentar gerar TR ou Blueprint nem chamar LLM. Sua responsabilidade é apenas validar invariantes persistidos e encaminhar uma tarefa já liberada.

## 6. Alterações de TR e Blueprint durante execução

- Mudança material no TR cria nova versão e exige análise de impacto.
- A SOFIA cria nova versão de Blueprint para refletir o escopo reorientado.
- Tarefas ainda não iniciadas podem ser atualizadas para a nova versão mediante vínculo explícito.
- Tarefas em execução mantêm a versão sob a qual começaram até receber instrução governada de migração/continuidade.
- Versões substituídas permanecem disponíveis para auditoria.
- Um OR pode motivar revisão, mas não altera plano automaticamente.

## 7. Sequência de implementação

**Incremento A — persistência e segurança**
- Migration idempotente e schema Drizzle para versões documentais.
- RLS/ownership e funções de leitura/gravação append-only.
- Testes de versionamento, unicidade, ownership e referência TR→Blueprint.

**Incremento B — gate e criação**
- Estado não executável inicial e fluxos separados human/sofia.
- Geração/persistência TR antes de qualquer liberação.
- Validação explícita humana.
- Geração/persistência Blueprint vinculado ao TR.
- Liberação transacional governada.

**Incremento C — defesa do dispatch**
- Gate na API, orquestrador, endpoint interno e trigger SQL.
- Corrigir bypass `alreadyClaimedWithoutExecution`.
- Garantir gate/herança de Blueprint nas filhas e corrigir atribuição/pinagem conforme decisões aprovadas.

**Incremento D — UI**
- TR como visão principal da missão.
- Interface de validação/correção do TR.
- Visualização do Blueprint e seus pacotes/unidades.
- Histórico de versões e proveniência.
- Tarefas/ORs/evidências como detalhamento secundário.

## 8. Testes obrigatórios antes de integrar

- Missão humana nunca entra em execução antes da validação explícita do TR.
- Falha LLM ou falha de persistência mantém missão não executável.
- Blueprint só pode referenciar versão existente e válida do TR.
- Missão autônoma pode prosseguir sem aprovação humana preliminar, mas não sem TR/Blueprint e gates de política.
- Criação direta em STAGED sem documentos é rejeitada pelo banco.
- `updateStatus`, `tasks.start`, endpoint interno e trigger não contornam o gate.
- Tarefa não STAGED com agente e sem `manusTaskId` não contorna o gate.
- Filhas herdam referência e escopo do Blueprint mestre; não recebem pinagem do pai.
- Concorrência/retry não duplica versões nem cria múltiplas execuções.
- RLS impede acesso entre proprietários.
- Alterações materiais preservam versões anteriores e referências de execução.

## 9. Limites

Este documento é plano técnico; não altera schema, migration, runtime, UI, banco ou produção. A instalação real do trigger e o estado da produção permanecem não verificados. A primeira implementação deve ocorrer na branch isolada, com testes e revisão, sem deploy automático ou execução real até gate específico.

## 10. UX de gerenciamento da missão — AC-016

A ação **Gerenciar** na listagem de Missões abre `/tasks/:id`; essa tela deve abrir diretamente na visão **TR — Missão**, que é a apresentação principal para o operador.

A descrição original submetida na criação é preservada como fonte/proveniência, mas não substitui o TR e não deve ser rotulada como Blueprint.

O Blueprint terá área/aba própria na mesma tela. A organização recomendada é:
1. TR — visão padrão e narrativa principal;
2. Blueprint — plano de trabalho versionado;
3. Execução — subtarefas, ORs, checkpoints e evidências;
4. Consolidação — entregável final e FOR.

Para missão humana em `AWAITING_HUMAN_VALIDATION`, o TR deve disponibilizar correção e validação explícita, deixando o bloqueio de execução inequívoco. Para missão SOFIA-originada, mostrar origem e motivação/evidências autônomas, permitindo inspeção e intervenção do operador sem criar gate humano preliminar.

A implementação visual fica no Incremento D, após as APIs e persistência dos Incrementos A–C. Não apresentar a descrição atual como TR ou Blueprint provisório.


## Incremento A — adendo AC-017: catálogo e instâncias documentais

A persistência de TR/Blueprint deve ser integrada ao modelo genérico de documentos da missão, sem criar tabelas ou APIs exclusivas para cada tipo. Separar conceitualmente:

1. **Catálogo de tipos documentais:** chave estável, nome, finalidade/categoria, público, ordenação, indicação de padrão, renderizador suportado, visibilidade/permissões e estado ativo/depreciado.
2. **Instâncias documentais:** missão, tipo, identidade, versão, estado, conteúdo ou referência segura, autoria/origem, timestamps, proveniência, auditoria e eventual referência à versão de outro documento (Blueprint → TR exato).

O modelo deve admitir múltiplas instâncias do mesmo tipo por missão, em especial ORs por tarefa/etapa. A API de leitura deve listar somente instâncias existentes e acessíveis; a seleção no frontend não é controle de acesso. Não aceitar caminhos arbitrários de Storage fornecidos pelo cliente. Versões publicadas são imutáveis.

A tela Gerenciar Missão terá um visualizador único, com dropdown dinâmico baseado no catálogo e nas instâncias. TR é o documento padrão; Blueprint, OR, FOR e tipos futuros aparecem quando existirem e forem autorizados. A descrição original permanece fonte histórica separada. A troca de documento é somente leitura e não altera execução.

O desenho físico precisa ser reconciliado com schema, ownership, estratégia de RLS e convenções existentes antes de migrations. A UI do visualizador fica no incremento posterior, após APIs de listagem e conteúdo. Especificação: governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md.
