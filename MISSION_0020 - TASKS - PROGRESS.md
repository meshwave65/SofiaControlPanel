# MISSION_0020 — TASKS — PROGRESS

**Missão:** 0020 — Diagnóstico e Restauração Integral das Funcionalidades do SCP  
**Projeto:** SofiaControlPanel  
**Data de criação:** 2026-11-09 04:58 (-03:00)  
**Blueprint:** `governance/missions/0020/BLUEPRINT.md`

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 20.1 | Inventariar funcionalidades, contratos e evidências do runtime; localizar a primeira fronteira de falha | DONE | Manus (sandbox) | Matriz baseline de módulos/ações e hipótese testável; logs/config apenas pertinentes e sanitizados; nenhuma causa conjecturada como fato |
| 20.2 | Reproduzir falha de missão em ambiente local/de teste e fechar causa-raiz do ciclo de execução | DONE | Manus (sandbox) — 2026-11-11/12 | Harness controlado reproduz claim/despacho, criação Manus mockada, polling, persistência, espera por agente inelegível, falha explícita e estados DONE/PAUSED/FAIL; smoke test externo permanece bloqueado por credenciais/autorização ausentes |
| 20.3 | Corrigir causas-raiz confirmadas no fluxo de execução e adicionar regressões | PROGRESS | Agente Mateus | Correções pequenas e atribuídas, testes falhando antes/passando depois, idempotência/concorrência/erros cobertos sem chamada real não autorizada |
| 20.4 | Auditar fluxos operacionais de missões e Messenger; classificar lacunas de UI/API/serviços/runtime e definir correções prioritárias | PROGRESS | ChatGPT/GPT-6 — diagnóstico e auditoria funcional | Matriz de evidências para criar/iniciar/retomar/pausar/transferir/fatorizar/consolidar missões e enviar/receber mensagens; distinguir lacuna de produto, falha de configuração e falha de runtime; sem duplicar MISSION_0019 |
| 20.5 | Executar validação integrada e, somente se autorizado, smoke test externo de baixo impacto | STAGED | — | `pnpm check`, `pnpm test`, `pnpm build`, integração repetível; gate externo comprovado ou explicitamente bloqueado |
| 20.6 | Documentar operação/observabilidade, revisar cruzadamente e preparar handoff final | STAGED | — | Checklist sem segredos, procedimento reproduzível, limites e dependências registrados; todos os ORs e índices reconciliados |

## Regras de execução

- A missão permanece `STAGED` até uma instância assumir formalmente. Antes de qualquer edição, reconciliar branch, `origin/main`, árvore, tarefas/locks e dependências, e atualizar missão/quadro conforme `GOVERNANCE.md`.
- Uma instância assume uma tarefa por vez; não editar em paralelo os mesmos arquivos sem coordenação e lock.
- Tarefas 20.1–20.2 precedem correção. Se a análise identificar trabalhos independentes, decompor e atribuir antes de editar. Reordenar só com justificativa registrada.
- Usar testes e ambientes descartáveis por padrão. Chamada real Manus, consumo de crédito, alteração de dados ou deploy exigem autorização específica e ambiente aprovado.
- Não assumir nem duplicar tarefas da MISSION_0019; dependências/interseções devem ser documentadas e coordenadas.
- Cada tarefa concluída, parcial, bloqueada ou malsucedida requer Operational Report próprio, atualização do quadro e handoff conforme `AGENTS.md`.


## Checkpoint 20.3 — assunção formal (2026-11-12)
- **Instância:** Agente Mateus.
- **Status:** PROGRESS.
- **Escopo assumido:** corrigir somente causas-raiz confirmadas no fluxo de execução e adicionar regressões reproduzíveis.
- **Guardrails:** sem chamada real à API Manus, consumo de créditos, alteração de produção ou deploy; não duplicar a MISSION_0019.
- **Base de entrada:** MISSION_0020 / tarefa 20.2 concluída com harness controlado; smoke test externo permanece bloqueado por credenciais/autorização ausentes.
- **Próximo passo:** revisar o diff e os testes associados ao fluxo de claim/despacho antes de editar qualquer código.


## Checkpoint 20.4 — assunção e ampliação do diagnóstico (2026-11-14)
- **Instância:** ChatGPT/GPT-6.
- **Status:** PROGRESS.
- **Escopo assumido:** auditoria funcional dos fluxos de gestão de missões e Messenger, com rastreamento UI → tRPC/API → serviços → persistência → retorno visual; classificação das capacidades presentes, ausentes, condicionais e não comprovadas em produção.
- **Contexto:** o responsável relata que não consegue iniciar, transferir, pausar ou fatorizar missões pela interface e que o Messenger não envia/recebe mensagens com a conta. A MISSION_0020 já cobre a restauração integral do SCP; a tarefa 20.4 é a unidade apropriada e independente da tarefa 20.3, que permanece atribuída a Agente Mateus.
- **Primeira evidência estática:** a UI de Tasks só abre o detalhe; o detalhe expõe iniciar/fatorizar/consolidar, mas não há fluxo de pausa nem transferência manual; o botão de iniciar depende de `status` e `manusTaskId`; o Messenger declara `Link Ativo` sem checagem e alterna entre serviço LLM interno e tarefa Manus conforme os identificadores da missão. Isso ainda não comprova o comportamento do deploy/runtime.
- **Guardrails:** nenhuma chamada Manus, consumo de créditos, escrita no banco de produção, alteração de credenciais ou deploy; validar com testes/ambiente controlado e manter qualquer smoke test externo condicionado à autorização e ambiente aprovados.

### Checkpoint 20.4 — Render e reconciliação produção/main (2026-11-14)
- **Render:** serviço SofiaControlPanel-web não suspenso; deploy live é rollback para 255a016, com auto-deploy desligado.
- **Divergência:** main está 146 commits à frente do commit live. A produção não contém a revisão atual da auditoria.
- **Causa confirmada no Messenger live:** no commit publicado, messages.create somente persiste a mensagem do operador; não aciona Manus/LLM nem cria resposta. Em main, existe implementação que encaminha para a tarefa Manus associada ou LLM interno, persiste a resposta e retorna replied/pending/failed; ainda não está implantada.
- **UI Messenger:** Link Ativo permanece hardcoded; Sincronizado não representa handshake real.
- **Missões:** TaskDetail mantém o bloqueio de iniciar quando PROGRESS já possui manusTaskId e não permite PAUSED; não há evidência de pausa/transferência manual adicionada em main.
- **Runtime:** processo, heartbeat e DB iniciaram/verificaram em 14/11; exits com código 1 em 12/11 seguem sem causa isolada.
- **Próxima etapa:** reconciliar intenção do rollback, revisar deltas de release e logs de erro; não fazer deploy/restart, dispatch de missão, envio de mensagem ou chamada Manus/LLM sem gate específico.
- **OR:** OR-20261114-0017 atualizado com evidências de Render e causa do Messenger live.
### Checkpoint 20.4 — incidente de lock no prestart (2026-11-14)
- Render registrou sete falhas do ensure-database entre 20:25:30 e 20:37:00 UTC em 12/11; todas falharam em Verify tasks.agentPinned com PostgreSQL lock timeout.
- Script prestart define lock_timeout=15s e executa ALTER TABLE ... ADD COLUMN IF NOT EXISTS para tasks.agentPinned; o comportamento persiste no código atual. O lock holder não foi identificado.
- Classificação: timeout DDL no startup = causa imediata confirmada; sessão bloqueadora = desconhecida; startup em 14/11 passou posteriormente.
- Nenhuma consulta ao banco, escrita, DDL, restart ou deploy foi executado.
- **Precisão sobre pausa:** tasks.updateStatus genérico existe e aceita statusId; não equivale a pause/resume operacional, pois não define transições nem coordena execução externa. A UI não oferece ação de pausa. Transferência manual segue sem fluxo identificado.
### Checkpoint 20.4 — feedback UI e limites de testes
- Factorize é idempotente no orchestrator e a UI refaz consultas, mas não confirma sucesso visualmente; consolidate registra falha apenas no console.
- messages.test.ts cobre o ramo de resposta LLM interna, não o ramo Manus; sendManusMessageAndWait não tem teste integrado de ciclo before/send/poll/after.
- Testes atuais são mocks e não substituem validação de banco, trigger, runtime ou conta externa.
### Matriz preliminar 20.4
- **FAIL:** Messenger live sem despacho/resposta; retomada manual com manusTaskId existente; pausa operacional dedicada; transferência manual; indicador de conexão não real.
- **BLOCKED:** listagem/criação/início STAGED/fatorização/consolidação em runtime autenticado; rota Messenger de main ainda não implantada; identidade externa esperada não definida.
- **Evidência estática:** factorizeTask idempotente; start/claim/dispatch e consolidate têm código presente. Testes atuais são mockados e não substituem integração.

### Checkpoint 20.4 — motivo do rollback ainda não rastreado (2026-11-14)
- Render confirmou rollback manual em 13/11 00:53:36 UTC para o deploy de `255a016`; o deploy imediatamente anterior era `fef7880`, cujo diff é documental, sem mudança em código de aplicação.
- O evento não registra justificativa. A falha de prestart em `496dd00` ocorreu antes e não pode ser declarada causa do rollback.
- Distância atual entre live e main: 167 commits (146 no checkpoint anterior), número móvel que inclui documentação; comparar arquivos de aplicação separadamente.
- Estado: alvo do rollback conhecido; motivação operacional desconhecida. Não implantar main até revisar deltas de código e critérios de release.
- Nenhuma ação mutável ou chamada externa foi executada.


### Checkpoint 20.4 — revisão de código da resposta Messenger
- `messages.create` em main tem validações e rota de resposta; usa tarefa Manus vinculada ao agente quando `agentId` e `manusTaskId` existem, caso contrário usa LLM interno.
- Polling Manus: snapshot anterior, envio, até 8 leituras em intervalos de 1,5s; sem resposta observada, persiste estado/placeholder pending.
- Teste de rota cobre LLM interno, não o ramo Manus; ciclo completo de envio/polling não tem teste integrado. Identidade destino é a conta/token Manus configurada no agente da missão, não sessão pessoal arbitrária.
- A UI melhorou o feedback, mas Link Ativo e Sincronizado ainda não provam conectividade.
- Main não corrige retomada PROGRESS com manusTaskId, pausa operacional ou transferência manual; o código de lifecycle consultado permanece essencialmente igual ao live.
- ensure-database mantém lock_timeout 15s; main não está liberada como release completa por esta auditoria.


### Checkpoint 20.4 — fatorização e dispatch automático (2026-11-14)
- Risco estático: missão pai é marcada PROGRESS/reserva agente antes de criar subtarefas; filhos herdam agente e a regra de elegibilidade exclui agentes já ocupados em outra missão PROGRESS. Um filho também pode bloquear os demais ao assumir PROGRESS. Validar trigger SQL real e semântica antes de corrigir.
- Testes existentes não validam dispatch de todas as filhas com regras reais de ocupação; acrescentar casos de um/múltiplos agentes e retry parcial.
- Consolidação ainda não fornece toast de sucesso/erro no handler UI.
- Nenhuma execução ou alteração de produto/produção realizada.


### Checkpoint 20.4 — trigger e reserva de agentes aprofundados (2026-11-14)
- Fonte do trigger localizada: `drizzle/0003_automatic_task_dispatch.sql`; instalação declarada em `scripts/ensure-database.mjs`. `net.http_post` dispara requisições assíncronas por filha STAGED. Catálogo do DB de produção não consultado; instalação ativa não comprovada.
- Confirmado estaticamente: pai passa a PROGRESS e reserva agente antes da fatorização; filhos herdam `agentId`/`agentPinned`; claim exclui agente ocupado em outra tarefa PROGRESS. Pai com agente fixado bloqueia as filhas que herdam o pin; pai automático com um único agente também retém o único agente. Com múltiplos agentes, filhos automáticos podem ser distribuídos entre agentes livres via SKIP LOCKED.
- Heartbeat reprocessa tarefas em espera a cada 30s, mas não libera reserva do pai. Retorno `executionStarted` usa número de IDs de subtarefas, não confirmação de dispatch efetivo.
- Testes de regressão pendentes: pinned/automatico com um agente; múltiplas filhas e múltiplos agentes; concorrência SKIP LOCKED; retry após liberação válida; semântica do pai e sinalizador executionStarted.
- Não tocar na tarefa 20.3/Mateus. Nenhuma alteração de produto/DB ou chamada externa executada.


### Decisão do responsável — contrato de atribuição e fatorização (2026-11-14)
- Missões pertencem ao SCP; agentes não são proprietários. `agentId` é atribuição operacional/temporária.
- Sem pinagem explícita, o SCP pode reatribuir a missão a outro agente elegível quando houver impedimento, especialmente falta de créditos. Pinagem humana é exceção e não pode ser ignorada silenciosamente.
- Na fatorização padrão sem pinagem, o agente que iniciou assume uma tarefa executável e as demais são distribuídas a outros agentes disponíveis.
- Pai/filhas é hierarquia estrutural para rastreabilidade e consolidação; pai sem trabalho próprio não reserva agente nem bloqueia claims.
- Pendência antes da implementação: definir se a pinagem humana em missão fatorizada se aplica a todas as subtarefas ou apenas a uma tarefa. Também não estão definidos fairness/prioridade/limites de concorrência.
- Referência: OR-20261114-0018; contexto arqueológico AC-008. Nenhuma implementação de produto nesta etapa.


### Decisão do responsável — semântica final da fatorização (2026-11-14)
- Pai = missão principal, Draft e consolidação; é o único registro cujo resultado final representa a missão cumprida.
- Filhas = tarefas auxiliares; seus resultados são insumos curados/integrados pelo pai, não entregáveis finais autônomos. Permanecem como histórico/evidência arqueológica.
- Na pinagem humana excepcional, o agente fixado permanece no pai, produz o Draft e aguarda as filhas; a pinagem não deve ser copiada às filhas, que precisam ser executadas por outros agentes elegíveis.
- O pai conclui a missão somente depois de receber, avaliar, curar e integrar os resultados das filhas e finalizar seu próprio resultado.
- Exemplo funcional: Capítulo (pai) + Subcapítulos 1–3 (filhas) = um Capítulo integrado, não quatro documentos distintos.
- Não confundir essa hierarquia de missão com o sistema de documentos vivos que compõe fragmentos/parágrafos recursivamente usando `parent_task_id`; o campo tem semântica contextual e versátil.
- Implicações de implementação: não herdar `agentId`/`agentPinned` do pai; separar lease do consolidador e leases dos executores; modelar estado de espera/consolidação do pai; não concluir missão ao concluir somente as filhas.
- A pendência anterior sobre aplicação da pinagem em fatorização está resolvida por esta decisão. Fairness, prioridade, limites de concorrência e compatibilidade de capacidades continuam pendentes.
- Referência: OR-20261114-0018, aditivo de 2026-11-14.


### Decisão do responsável — agente consolidador também é efêmero (2026-11-14)
- O pai não pertence ao agente que o iniciou/fatorizou/assumiu primeiro. O papel consolidador é funcional e está vinculado à tarefa pai.
- O agente atribuído ao pai é executor temporário; em caso de impedimento, o SCP pode retirar a atribuição e encaminhar a continuidade a qualquer outro agente elegível, salvo pinagem humana explícita.
- A transferência preserva Draft, contexto, histórico, resultados das filhas, dependências e estado de consolidação; o novo agente dá continuidade à mesma missão.
- Se houver pinagem humana e o agente fixado ficar impedido, sinalizar o bloqueio ao operador; não transferir silenciosamente.
- Agentes atribuídos às filhas também são temporários; a atribuição do pai não reserva nem bloqueia agentes necessários às filhas.
- Síntese: missão e papel consolidador persistem; identidade do executor não. A continuidade é responsabilidade do SCP.
- Referência: OR-20261114-0018, aditivo de 2026-11-14.


### Requisito em avaliação — Agent Task ID e conversa direta do agente (2026-11-14)
- Mostrar o Manus Task ID da execução externa na missão, separado do ID local da missão e do Agent ID, com opção de copiar e estado claro quando ainda não existir execução.
- Permitir conversa direta com a conta original do agente mesmo sem atribuição atual à missão; canal e histórico independentes do ciclo da missão.
- Contexto de missão fornecido explicitamente/selecionado pelo operador; não injetar automaticamente todo o histórico ou dados privados. Mensagens/respostas diretas não mudam o estado da missão.
- Validar a API Manus: o código atual envia por /task.sendMessage com task_id; uma conversa persistente dedicada criada sob a credencial do agente é hipótese técnica, não endpoint confirmado.
- Classificação: requisito proposto, desenho técnico pendente. Referência: OR-20261114-0018 / AC-011. Sem código, DB ou chamadas externas alterados.


### Checkpoint 20.4 — decisão e primeiro incremento cognitivo SOFIA (2026-11-14)
- O responsável aprovou a SOFIA como camada cognitiva e interlocutora central do SCP; arquitetura registrada em `governance/architecture/SOFIA_COGNITIVE_CONTROL_PLANE.md` e AC-012.
- Branch isolada: `feat/sofia-cognitive-control-plane`, baseada no main em `5e77db55c2b397d92cabb7a40237125802a2bb71`.
- Implementação inicial: mensagens passam primeiro pela Sofia; ferramenta tipada permite encaminhar instrução somente mediante tool call e pedido explícito, exigindo agente e execução externa identificados. Perguntas/análises são respondidas pela Sofia.
- Testes adicionados para mediação, não encaminhamento automático e bloqueio sem execução externa; ainda não executados. Check/test/build pendentes.
- Não implementados ainda: ferramentas read-only de estado/elegibilidade, transferência, pausa/retomada, plano persistente/confirmável, memória operacional persistente e UI de telemetria.
- Sem deploy, restart, alteração de DB/produção, chamada LLM/Manus real, mensagem externa, dispatch ou consumo de créditos. Task 20.3/Mateus intocada.
- OR: `OR-20261114-0022.md` (SUBMITTED; Oracle PENDING).


### Checkpoint 20.4 — correção da identidade arquitetural SOFIA (2026-11-14)
- Decisão AC-013: SOFIA é o sistema integrado e modular; SCP é somente seu painel central de comando/frontend, não um módulo independente nem sinônimo de *control plane*.
- Terminologia oficial de conhecimento: BBC = Base Bruta de Conhecimento; BCE = Base de Conhecimento Evolutivo curada.
- Fluxo conceitual: SWE → BBC → SCur → BCE → SVec. SVec consome a BCE curada; não usa a BBC como fonte primária de vetorização.
- Cognição, governança, segurança e orquestração são capacidades transversais do SOFIA. Módulos especializados mantêm contratos e responsabilidades próprios.
- Documento atualizado: `governance/architecture/SOFIA_COGNITIVE_ORCHESTRATION_ARCHITECTURE.md`; nome ambíguo `SOFIA_COGNITIVE_CONTROL_PLANE.md` removido.
- Foundation_MeshWave consultado: `KNOWLEDGE/` preserva fontes brutas e `BCE/` contém documentos curados. A decisão BBC não altera diretórios nem arquivos do Foundation.
- Esta alteração é documental/arquitetural; pipeline SWE/BBC/SCur/BCE/SVec não está declarado implementado. PR #15 permanece isolada; testes/check/build pendentes; sem merge, deploy, DB ou produção. Task 20.3/Mateus intocada.


### Checkpoint 20.4 — AC-014: TR como contrato do ciclo de vida da missão (2026-11-14)
- Decisão do responsável registrada: toda missão deve receber primeiro TR antes da execução.
- Missão humana: primeiro TR apresenta a compreensão da SOFIA e aguarda validação explícita do operador solicitante; correções/redirecionamentos criam novas versões preservando histórico.
- Missão originada pela SOFIA: primeiro TR obrigatório, sem validação humana preliminar; autonomia permanece subordinada a permissões, políticas e limites vigentes. Operador pode intervir e reorientar a qualquer momento.
- TR não inventa motivação, decisão ou resultado. Fatos, declarações, interpretações, hipóteses, reconstruções e dados não localizados devem ser distinguidos. Missões antigas sem justificativa declaram que a motivação original não foi localizada.
- TR vivo, versionado e sustentado por eventos/fontes; abertura da missão no SCP deve mostrar TR primeiro. Correlações exigem evidência. TR e FOR permanecem distintos.
- Especificação: governance/architecture/MISSION_TR_SPECIFICATION.md; arquitetura: governance/architecture/SOFIA_COGNITIVE_ORCHESTRATION_ARCHITECTURE.md.
- **Estado:** requisito e documentação registrados; geração/versionamento/UI não implementados nem presumidos. Inspeção de schema, eventos, APIs e UI será necessária antes da implementação.
- Nenhuma alteração de runtime, DB, produção, dispatch, chamada externa, crédito, deploy ou restart. Task 20.3/Mateus intocada.


### Checkpoint 20.4 — Auditoria do fluxo de criação/execução para o TR (OR-20261114-0024)
- Inspecionados na branch `feat/sofia-cognitive-control-plane`: `drizzle/schema.ts`, migrations `0000`, `0003`, `0006`, `0009`; `server/routers.ts`, `server/db.ts`, `server/sofiaOrchestrator.ts`, `server/dispatchEndpoint.ts`, `server/storage.ts`, `server/githubMissionMirror.ts`; telas `TaskCreate.tsx`, `Tasks.tsx`, `TaskDetail.tsx`.
- O registro de missão hoje é `sofia.tasks`; não foi encontrada entidade `missions` separada no schema inspecionado. Campos de intenção limitam-se essencialmente a `title` e `description`; não há campos próprios para motivação, objetivo/escopo validados ou resultados esperados.
- Ponto crítico: formulários usam STAGED como status inicial padrão; `tasks.create` aceita status inicial e grava diretamente; migration `0003_automatic_task_dispatch.sql` define trigger AFTER INSERT OR UPDATE de status/agente que chama dispatch quando a linha fica STAGED. A migration comprova a definição no repositório, não a instalação/ativação no banco de produção.
- Logo, primeiro TR precisa integrar o caminho crítico de criação/liberação. Não é seguro apenas acrescentar TR depois do INSERT STAGED. É necessário introduzir estado pré-execução/gate ou mecanismo equivalente, bloquear dispatch até a condição documental apropriada e impedir bypass via seleção arbitrária de status/rotas internas.
- Fluxo de execução adicional: `tasks.start` chama `SofiaOrchestrator.startTask`; o endpoint interno de dispatch também chama o mesmo método. A fatoração cria subtarefas em STAGED, que também podem disparar o trigger; subtarefas são criadas pelo orquestrador e não passam por validação humana preliminar individual. O contrato do TR deve definir se subtarefas herdam o TR/plano validado da missão-pai ou precisam de artefato derivado antes do dispatch; recomendação técnica a validar: herdar escopo aprovado e registrar proveniência/decomposição, sem pedir validação humana repetitiva.
- Persistência existente: `messages` guarda conversas e ORs por taskId; `activityLogs` guarda eventos pontuais; `contextReports` é tabela de relatórios gerais, não relacionada diretamente a missão; relatório consolidado é armazenado por mecanismo de Storage. Nenhuma dessas estruturas, isoladamente, implementa TR versionado com proveniência.
- GitHub mirror (`missions/{missionKey}.md`) atualmente espelha título, descrição e metadados operacionais; não armazena TR. A rotina de espelhamento é regenerativa e não deve ser reaproveitada como histórico de TR sem alterar o contrato para preservar versões e evitar sobrescrita.
- UI: criação em `TaskCreate.tsx` e modal em `Tasks.tsx`; detalhe em `TaskDetail.tsx` apresenta descrição/ações e tabs Subtarefas/Relatórios/Consolidado, sem TR. Tab padrão atual é Subtarefas.
- **Não verificado:** estado real das migrations/triggers no banco; dados de produção; execução real do dispatch; instalação de triggers; conteúdo e volume dos registros atuais. A auditoria foi somente leitura do código/migrations da branch.
- **Sem alterações funcionais:** nenhum schema/migration, runtime, UI, DB, produção, dispatch, chamada Manus/LLM, consumo de crédito, deploy ou restart foi realizado. Task 20.3/Mateus intocada.
- Próxima etapa: desenhar e validar arquitetura mínima de gate pré-dispatch, primeiro TR persistente/versionado e integração do TR inicial com os fluxos humano, SOFIA autônoma e subtarefas; depois implementar em PR com testes que provem que nenhuma rota/trigger inicia missão humana antes da validação.

### Checkpoint 20.4 — AC-015: distinção TR / Blueprint (2026-11-14)

- Decisão registrada: TR é a compreensão narrativa e viva da missão, voltada prioritariamente ao operador humano; Blueprint é o plano de trabalho operacional derivado de uma versão específica do TR, direcionado aos executores.
- Em missão humana, validação explícita do TR inicial precede a liberação do Blueprint para execução. Em missão autônoma da SOFIA, TR inicial também é obrigatório, mas não há aprovação humana preliminar; a execução permanece dentro dos limites de autonomia e governança.
- Blueprint decompõe o escopo validado em etapas, tarefas, dependências, recursos, restrições, critérios de aceite e evidências. Não pode ampliar silenciosamente o escopo.
- Missão-pai mantém TR e Blueprint mestre; filhas referenciam a versão e unidade do plano. Agentes são executores temporários e recebem contexto mínimo autorizado.
- OR registra execução/evidências; TR consolida a narrativa; FOR consolida aprendizado operacional.
- Especificação: `governance/architecture/MISSION_BLUEPRINT_SPECIFICATION.md`; relação adicionada a `MISSION_TR_SPECIFICATION.md` e à arquitetura SOFIA.
- OR-20261114-0025 criado e indexado. Apenas documentação; sem schema/runtime/UI/DB/produção/dispatch/LLM/Manus/créditos/deploy/restart. Task 20.3/Mateus intocada.
- Próxima etapa: projeto técnico do gate pré-dispatch e persistência/versionamento de TR e Blueprint, com testes para criação humana/autônoma, início direto, trigger interno e tarefas-filhas.
### Checkpoint 20.4 — Plano técnico de persistência e gate TR/Blueprint (2026-11-14)

- Inspeção complementar confirmou: `taskStatuses` é lookup; criação aceita status arbitrário; `updateStatus` permite promover qualquer tarefa; `startTask` possui caminho `alreadyClaimedWithoutExecution` fora de STAGED; `ensure-database.mjs` executa a migration do trigger durante inicialização.
- Também foi confirmado que `factorizeTask` copia atualmente agente/pinagem do pai às filhas, divergindo da decisão de pai consolidador e filhas executadas por agentes elegíveis.
- Criado `governance/architecture/MISSION_EXECUTION_GOVERNANCE_IMPLEMENTATION.md` com modelo append-only para versões de TR/Blueprint, vínculo exato Blueprint→TR, RLS/ownership, fluxo humano/autônomo, herança de escopo nas filhas e defesa em profundidade.
- OR-20261114-0026 criado e indexado.
- **Estado:** planejamento técnico; Incremento A (persistência/versionamento + RLS + testes) ainda não implementado. Sem schema/migration/runtime/UI/DB/produção/dispatch/LLM/Manus/créditos/deploy/restart. Task 20.3/Mateus intocada.
- Próximo passo: implementar Incremento A após conferir o modelo real de autenticação/ownership e a estratégia de RLS do banco; não presumir que uma policy baseada em auth.uid() corresponda ao identificador inteiro de users.id.

### Checkpoint 20.4 — AC-016: TR como visão principal em Gerenciar Missão (2026-11-14)

- Inspecionada a UI atual: `Tasks.tsx` possui botão Gerenciar que abre `/tasks/:id`; `TaskDetail.tsx` apresenta a descrição da missão e abas Subtarefas, Relatórios e Consolidado, sem TR/Blueprint.
- Decisão: Gerenciar abre a missão diretamente na visão TR, como conteúdo principal/padrão para o operador. Blueprint terá área/aba própria, como plano operacional para executores.
- A descrição original permanece fonte/proveniência do pedido, não TR consolidado nem Blueprint.
- Hierarquia da tela: TR → Blueprint → Execução (subtarefas/ORs/checkpoints/evidências) → Consolidação (entregável/FOR).
- Missão humana aguardando validação terá correção/validação no próprio TR e indicação inequívoca de execução bloqueada. Missão SOFIA-originada mostrará origem e permitirá inspeção/intervenção sem aprovação humana preliminar.
- AC-016 registrado na arquitetura/contexto; OR-20261114-0027 criado e indexado.
- Estado: decisão de UX persistida; UI ainda não implementada. Implementação fica no Incremento D, após APIs e persistência A–C. Sem alterações funcionais/DB/produção/dispatch/LLM/Manus/créditos/deploy/restart. Task 20.3/Mateus intocada.


### Checkpoint 20.4 — AC-017: visualizador dinâmico de documentos (2026-11-14)

- Decisão: Gerenciar Missão terá um único visualizador de documentos, com dropdown dinâmico alimentado pelo catálogo e pelas instâncias documentais da missão; não serão criadas abas fixas TR/Blueprint nem uma tela por tipo.
- TR é selecionado por padrão; Blueprint, ORs, FOR e documentos futuros aparecem somente quando houver instância existente e acessível. A seleção apenas altera o documento exibido.
- Modelo separa catálogo de tipos (metadados e regras de apresentação) de instâncias documentais (missão, tipo, versão, estado, conteúdo/referência segura, autoria, datas e proveniência). Permite múltiplos ORs ou outras instâncias do mesmo tipo.
- Descrição original permanece fonte histórica separada; não pode ser tratada como TR nem Blueprint.
- Segurança de listagem/conteúdo é server-side/RLS; estados de ausência, elaboração, carregamento, erro e acesso negado são distintos.
- Especificação: governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md; integração registrada nos contratos TR/Blueprint e arquitetura geral. OR-20261114-0028 criado.
- Estado: contrato de UX/modelo lógico documentado; catálogo, persistência, APIs, RLS e UI ainda não implementados. Próximo passo é incorporar catálogo/instâncias ao desenho físico do Incremento A após verificar schema e ownership reais; UI vem após APIs de leitura.
- Apenas documentação. Sem código funcional, schema/migration, banco, produção, dispatch, LLM/Manus, créditos, deploy ou restart. Task 20.3/Mateus intocada.


### Checkpoint 20.4 — Incremento A: persistência documental (2026-11-14)

- Inspecionado schema Drizzle, migrations SQL, RLS server-only, ensure-database.mjs, ownership e tela TaskDetail.
- Adicionado modelo físico Drizzle: missionDocumentTypes (catálogo), missionDocuments (instâncias por missão) e missionDocumentVersions (histórico append-only).
- Adicionada migration 0010 com catálogo ORIGINAL_REQUEST/TR/BLUEPRINT/OR/FOR, índices, FKs, RLS/policies server-only, revogação de privilégios diretos e trigger de imutabilidade das versões.
- Ownership documental herda tasks.createdBy; não foi duplicado. Blueprint poderá referenciar a versão exata do TR.
- A versão corrente é derivada do maior número de versão, sem ponteiro mutável.
- Migration 0010 NÃO foi conectada ao ensure-database.mjs e NÃO foi aplicada a banco. Essa separação evita DDL automático em deploy/startup.
- Sem camada de serviço, APIs, geração de documentos, backfill de solicitações originais, UI ou testes executáveis nesta etapa.
- OR-20261114-0029 criado. Task 20.3/Mateus intocada. Sem deploy, restart, dispatch, LLM/Manus ou consumo de créditos.


### Incremento A — camada de persistência server-side (2026-11-14)

- server/db.ts recebeu operações para consultar catálogo, listar documentos da missão com versão vigente, recuperar versão específica, listar histórico, criar instância + primeira versão transacionalmente e criar revisões serializadas.
- Toda leitura/escrita de documento verifica acesso à missão por tasks.createdBy; administrador usa a permissão global já existente. Autoria AGENT exige agente pertencente ao proprietário da missão. Blueprint exige versão-fonte TR da mesma missão.
- Funções ainda não estão expostas em tRPC e não foram exercitadas contra banco; testes/check/build permanecem pendentes.
- OR-20261114-0029 complementado com o estado da camada de repositório.
