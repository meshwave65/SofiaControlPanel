# MISSION_0020 — Diagnóstico e Restauração Integral das Funcionalidades do SCP

> **Projeto:** SofiaControlPanel (SCP)  
> **Data e hora de criação:** 2026-11-09 04:58 (-03:00)  
> **Orquestrador:** SofiaControlPanel (SCP)  
> **Status:** PROGRESS
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


## Checkpoint 2026-11-14 — tarefa 20.4 assumida

- **Instância:** ChatGPT/GPT-6.
- **Status:** PROGRESS.
- **Escopo:** auditoria funcional dos fluxos de gestão de missões e Messenger, separando lacunas de produto, falhas de integração/configuração e falhas do runtime publicado.
- **Ownership:** tarefa 20.3 permanece atribuída a Agente Mateus; tarefa 20.4 foi assumida sem sobreposição no commit `d95e6e7becec1ad207ac2a13190e5868eedcb123`.
- **Achados iniciais:** ausência de pausa/transferência manual na UI/API; condição de habilitação do botão iniciar impede retomada quando `manusTaskId` já existe e não cobre PAUSED; Messenger apresenta `Link Ativo` sem health-check e encaminha para LLM interno ou execução Manus conforme a missão, sem integração direta com conta externa do operador comprovada.
- **Limite da evidência:** inspeção estática apenas. Commit efetivamente publicado, logs/health do Render, estado real do banco/agentes e conta externa pretendida ainda não foram verificados. Nenhuma chamada Manus/LLM, consumo de crédito, escrita de produção ou deploy.
- **Operational Report:** `OR-20261114-0017.md` (SUBMITTED; Oracle PENDING).

## Checkpoint 2026-11-14 — validação read-only do Render (tarefa 20.4)

- **Serviço:** SofiaControlPanel-web, Render web service, não suspenso.
- **Deploy live:** rollback para 255a01601ae3f95f40de2071d53508cf6a41faf5 em 13/11; deploy automático desativado.
- **Divergência crítica:** comparação GitHub confirma main 146 commits à frente do commit live (0 commits atrás). A produção não executa a revisão atual auditada.
- **Runtime:** logs de 14/11 confirmam processo Node iniciado, servidor escutando na porta 10000, heartbeat iniciado, conexão DB verificada e verificações de colunas/trigger concluídas. Avisos PostgreSQL 42701 são de colunas já existentes e foram tratados como skipping; não interromperam a inicialização observada.
- **Histórico:** eventos registram processos encerrados com exit code 1 em 12/11; causa ainda não isolada.
- **Classificação:** inicialização do serviço/DB = PASS limitado; alinhamento produção-main = FAIL; funcionalidade real de missões/Messenger = BLOCKED até comparação de versões e reprodução segura.
- **Próximos passos:** comparar os arquivos de ciclo de missão, Messenger, DB e despacho entre o commit live e main; examinar logs sanitizados dos exits; confirmar readiness HTTP. Não fazer deploy, restart, ativar auto-deploy nem disparar tarefas externas durante o diagnóstico.
- **Segurança:** consulta Render somente leitura; nenhum valor de variável de ambiente consultado; nenhuma escrita, chamada Manus/LLM, mensagem, consumo de crédito ou deploy.
- **OR:** OR-20261114-0017.md, complemento de runtime registrado; status SUBMITTED / Oracle PENDING.
## Checkpoint 2026-11-14 — comparação entre produção e main (tarefa 20.4)

- **Messenger em produção:** confirmado no commit live 255a016 que messages.create apenas persiste a mensagem do operador via db.createMessage e retorna; não chama Manus, LLM nem cria resposta de Sofia. Isso explica diretamente a ausência de resposta no Messenger da versão publicada.
- **Correção existente fora de produção:** main contém fluxo ampliado que, após persistir a mensagem, encaminha para a tarefa Manus associada quando há agentId + manusTaskId; caso contrário usa LLM interno; persiste a resposta assistant e retorna replied/pending/failed. A UI de main passou a refletir o resultado e erros. Esse código não está publicado no Render.
- **Limite de identidade:** o fluxo atual de main usa a tarefa Manus associada à missão/agente; não constitui sessão direta com uma conta pessoal externa arbitrária. O provedor/identidade esperado ainda precisa ser esclarecido.
- **Sinalização enganosa ainda presente:** Link Ativo continua hardcoded nas duas revisões; Sincronizado é estado visual padrão, não prova handshake.
- **Controles de missão:** TaskDetail.tsx permanece essencialmente igual entre live e main; canStartExecution continua bloqueando PROGRESS com manusTaskId e PAUSED. Tasks.tsx, sofiaOrchestrator.ts e heartbeat.ts não apresentaram diferenças no comparativo. A auditoria anterior não encontrou endpoints/ações de pausa ou transferência manual.
- **Causa confirmada até aqui:** Messenger live não tem caminho de resposta; correção de código existe em main, mas não foi publicada. Não executar deploy automático: Render aponta para rollback e há 146 commits de divergência; é necessário reconciliar intencionalidade do rollback e segurança da versão.
- **Status da tarefa 20.4:** PROGRESS. Próxima etapa: revisar histórico/razão do rollback e diferenças de release; inspecionar erros sanitizados dos exits; verificar se a rota Manus da main está coberta por testes e contrato; não disparar mensagens nem tarefas reais.
## Checkpoint 2026-11-14 — causa dos exits no Render (tarefa 20.4)

- Logs filtrados de 12/11 mostram **sete falhas** do prestart entre 20:25:30 e 20:37:00 UTC.
- Cada falha registra PostgresError: canceling statement due to lock timeout durante Verify tasks.agentPinned, antes das demais verificações do inicializador.
- O prestart executa scripts/ensure-database.mjs; o script define lock_timeout=15s e executa ALTER TABLE sofia.tasks ADD COLUMN IF NOT EXISTS agentPinned. O mesmo comportamento relevante está no commit que falhou, no rollback live e em main.
- **Causa imediata confirmada:** timeout ao adquirir lock para a operação DDL de tasks.agentPinned; o prestart retorna exit code 1 e o Render tenta reiniciar.
- **Causa subjacente não identificada:** os logs não mostram qual sessão/transação detinha o lock. Não afirmar que era migration, query ou schema sem consultar pg_locks/pg_stat_activity.
- Em 14/11 a inicialização posterior passou pelas verificações de schema e conexão; o incidente não estava bloqueando continuamente o startup naquele momento.
- Não foi executada consulta ao Supabase, DDL, restart ou reprodução. Próxima etapa DB exige sessão read-only autorizada e captura do lock holder; sem isso, manter a causa subjacente como desconhecida.
- **Precisão sobre pausa:** existe tasks.updateStatus genérico em live e main (id + statusId), mas não uma operação dedicada de pause/resume nem lógica de transição/coordenação de execução externa; a UI TaskDetail não oferece botão de pausa. Alterar status para PAUSED por setter genérico não comprova pausa operacional segura.
## Checkpoint 2026-11-14 — ações de missão e cobertura de testes

- Live e main têm os mesmos procedures principais no trecho auditado: updateStatus, factorize, start e consolidate; não há pause/resume ou transfer manual dedicado.
- updateStatus é setter genérico de statusId, sem matriz de transição nem coordenação da execução Manus; não equivale a pausa operacional.
- Fatoração é idempotente e cria subtarefas faltantes; a UI refaz consultas, mas não mostra toast de sucesso. Consolidação captura erro apenas no console, sem feedback visual explícito.
- startTask não retoma execução Manus já existente por ação manual; TaskDetail bloqueia o botão quando manusTaskId existe e também não habilita PAUSED.
- Testes atuais usam DB/Manus/LLM mocks. messages.test.ts cobre o ramo LLM interno, não o ramo Manus; manusExecutionService.test.ts não exercita sendManusMessageAndWait completo. Não comprovam integração em produção.
## Matriz operacional preliminar — tarefa 20.4

| Capacidade | Estado da evidência |
|---|---|
| Listar/criar missão | UI/API presentes; runtime autenticado não testado — BLOCKED |
| Iniciar STAGED | UI/API/orchestrator presentes; execução ponta a ponta não testada — BLOCKED |
| Retomar PROGRESS com manusTaskId | botão desabilitado e startTask não retoma execução existente — FAIL |
| Pausar | sem ação dedicada; updateStatus genérico não pausa execução externa — FAIL |
| Transferir manualmente | ausente; só existe reassignment automático por condição específica de créditos — FAIL |
| Fatorizar | implementação idempotente presente; runtime não testado e sem toast de sucesso — BLOCKED |
| Consolidar | implementação presente; runtime não testado e falha sem feedback visual — BLOCKED |
| Messenger em produção | grava mensagem, não envia a Manus/LLM nem gera resposta — FAIL |
| Messenger em main | rota Manus/LLM e resposta persistida existem, mas código não publicado — BLOCKED |
| Identidade externa do Messenger | não há sessão arbitrária de conta pessoal; usa agente/tarefa Manus ou LLM interno — BLOCKED |
| Indicador de conexão | Link Ativo hardcoded / Sincronizado sem handshake — FAIL |

Esta matriz é preliminar: ações marcadas BLOCKED exigem reprodução autenticada controlada; não declarar sucesso a partir de testes mockados.

### Checkpoint 20.4 — reconciliação do rollback Render (2026-11-14)
- Evento Render confirma rollback manual iniciado em 13/11 00:53:36 UTC pelo usuário proprietário conectado, com destino explícito no deploy `dep-dbr5c5n6km5c73c44dr0`, commit `255a016`.
- Deploy imediatamente anterior era `fef7880`, concluído com sucesso; o diff desse commit contém somente documentação/índice de missões, sem alterações em código de aplicação. Logo, o rollback conhecido não prova reversão de uma versão de código mais recente.
- O evento não informa motivo do rollback. Issue/PR #14 não tem comentários; não foi encontrada justificativa rastreável. Não associar o rollback ao lock timeout de `496dd00` sem evidência.
- `496dd00` falhou no prestart por lock timeout; deploys posteriores ocorreram e o destino atual do rollback é posterior a essa falha.
- Comparação atual informa main 167 commits à frente de live 255a016 (era 146 no checkpoint anterior); a distância mudou com novos commits em main, incluindo registros de governança. Não interpretar o número como quantidade de funcionalidades ausentes.
- Nenhum deploy, restart, operação DB, dispatch, chamada Manus/LLM ou envio de mensagem executado.


### Checkpoint 20.4 — revisão do delta de código Messenger e ciclo de missão (2026-11-14)
- Main melhora `messages.create`: valida propriedade da missão/tipo/mensagem pai, normaliza e limita conteúdo, persiste mensagem do operador, encaminha para tarefa Manus vinculada ou LLM interno e persiste resposta com status replied/pending/failed.
- O ramo Manus envia para a execução associada ao agente e consulta mensagens por até 8 ciclos de 1,5s. A ausência de resposta gera placeholder pending; não é garantia de entrega/resposta real.
- Testes de rota cobrem explicitamente LLM interno e validação de mensagem pai, mas não exercitam o ramo Manus nem o ciclo completo before/send/poll/after. Integração Manus permanece não validada.
- A UI mostra estados de processamento/resposta/falha, mas Link Ativo continua hardcoded e Sincronizado não representa handshake.
- TaskDetail mantém a mesma condição de iniciar; PROGRESS com manusTaskId existente e PAUSED continuam sem retomada manual. Tasks, orchestrator e heartbeat permanecem iguais no diff consultado; pause/resume/transferência manual seguem sem implementação dedicada.
- ensure-database continua com lock_timeout 15s e DDL de agentPinned; main não elimina o risco de lock observado.
- Conclusão: main contém melhoria Messenger ainda não validada, mas não é release candidate integralmente seguro para produção. Nenhum código de produto foi alterado ou implantado.


### Checkpoint 20.4 — risco de reserva de agente na fatorização (2026-11-14)
- Análise estática identificou conflito: `startTask` coloca a missão pai em PROGRESS e reserva agente antes de criar subtarefas; `factorizeTask` copia agente e agentPinned do pai para cada filha. A consulta de claim rejeita agente já ocupado por outra missão PROGRESS, inclusive o pai. Mesmo sem conflito com o pai, o primeiro filho em PROGRESS bloqueia o mesmo agente para os demais filhos concorrentes.
- O comportamento esperado de dispatch automático de todas as subtarefas não está demonstrado pelos testes atuais, que mockam DB/Manus e não validam ocupação real entre pai e filhos. Registrar como risco estático de alta confiança, pendente de confirmar função trigger real e regras de status no banco.
- Handler de consolidação ainda registra erro somente em console, sem toast visível; também não mostra confirmação explícita de sucesso.
- Próximo passo: localizar/inspecionar trigger real e criar testes determinísticos para 1 agente, múltiplas subtarefas, múltiplos agentes e retry parcial. Não alterar reserva sem definir semântica do status do pai.
- Nenhuma alteração de código, dado de produção, dispatch, chamada externa, deploy ou restart.


### Checkpoint 20.4 — confirmação da reserva de agente na fatorização (2026-11-14)
- Localizada a migration-fonte `drizzle/0003_automatic_task_dispatch.sql`: trigger AFTER INSERT/UPDATE para tarefa STAGED usa `net.http_post` para despachar cada filha assincronamente. `scripts/ensure-database.mjs` instala a migration; não foi consultado o catálogo do DB de produção para verificar instalação ativa.
- Claim SQL exclui agentes atribuídos a outra tarefa PROGRESS. Como `startTask` coloca o pai em PROGRESS antes da fatorização e as filhas herdam agente/pin, pai com agente fixado cria bloqueio persistente: filhas exigem agente reservado pelo pai e heartbeat apenas repete a tentativa a cada 30s. Pai automático com um único agente também retém o único agente; com vários agentes, filhas podem usar agentes livres.
- Qualificação: não é correto afirmar que o primeiro filho sempre bloqueia todos os outros. A claim automática usa FOR UPDATE OF agent SKIP LOCKED e pode distribuir filhos entre agentes distintos; a falha depende da capacidade elegível e da reserva do pai.
- O retorno `executionStarted` do ramo de fatorização é baseado em `subtaskIds.length > 0`, não em confirmação de execução real das filhas; indicador pode ser falso positivo operacional.
- Heartbeat reprocessa a cada 30s apenas tarefas STAGED marcadas waiting_for_available_agent/waiting_for_pinned_agent. Não libera a reserva do pai nem resolve o caso pinned.
- Testes atuais não exercitam trigger/SQL real nem o modelo de ocupação. Próximo passo: testes para pinned/automatico com 1 agente, vários agentes/filhas concorrentes, retry após liberação válida e retorno executionStarted. Definir semântica de status/reserva do pai antes de alterar implementação.
- Sem alterações de produto/DB, chamadas externas, dispatch, créditos, deploy ou restart.


### Decisão arquitetural do responsável — propriedade da missão e atribuição de agentes (2026-11-14)
- **Decisão explícita:** missões pertencem ao sistema SCP, não a agentes. `agentId` representa atribuição operacional/temporária, não propriedade ou titularidade da missão.
- **Regra padrão:** quando o operador não fixa expressamente um agente, o SCP pode encaminhar, retirar e reatribuir a missão entre agentes elegíveis/disponíveis. Impedimentos — principalmente insuficiência de créditos — devem acionar busca por outro agente elegível, em vez de tornar a missão propriedade ou responsabilidade exclusiva do agente anterior.
- **Exceção de pinagem humana:** quando o operador escolhe explicitamente um agente específico, essa escolha é uma restrição de atribuição. O sistema não deve transferir silenciosamente a missão para outro agente; deve expor o impedimento ao operador. A semântica detalhada de pinagem em fatorização (uma tarefa ou todas as subtarefas no agente fixado) permanece pendente de definição antes da implementação.
- **Fatorização sem pinagem:** a missão é decomposta em tarefas executáveis; o agente que iniciou a fatorização assume uma dessas tarefas e as demais são distribuídas entre outros agentes disponíveis. A hierarquia pai/filhas é estrutural (rastreabilidade, dependência e consolidação), não uma relação de propriedade nem uma reserva de capacidade.
- **Sem pai executor artificial:** não deve existir reserva separada de agente para um registro-pai que não execute trabalho próprio. O registro original pode permanecer como referência de coordenação/consolidação, mas não pode bloquear a seleção/claim de agentes para as tarefas efetivas.
- **Consequência para o diagnóstico:** o conflito estático pai-PROGRESS/filhas continua confirmado no modelo atual; a correção deve alinhar claim, fatorização, pinagem, retentativa por falta de créditos e estado do registro de coordenação a estas regras. Não liberar reserva nem alterar status isoladamente sem revisar transições e concorrência.
- **Limite desta decisão:** isto estabelece o princípio de propriedade/roteamento e o comportamento de fatorização no caso padrão. Não define ainda política de prioridade, fairness, limite de concorrência, compatibilidade de capacidades, nem execução das filhas quando existe pinagem humana; esses contratos devem ser especificados por evidência e necessidade antes de codificar.


## Decisão do responsável — fatorização como missão única e pai consolidador (2026-11-14)
- A tarefa pai permanece como missão principal e único resultado final apresentado como missão cumprida.
- O pai é consolidador: o agente explicitamente designado pelo operador permanece atribuído ao pai, cria o Draft do resultado principal e aguarda as subtarefas necessárias.
- As filhas são tarefas auxiliares de execução. Seus resultados alimentam o pai; não representam missões/entregáveis finais independentes. Podem permanecer como histórico arqueológico/evidências.
- Ao terminar as filhas, o agente do pai avalia, cura e integra o conteúdo ao Draft/artefato principal. A missão só termina após a conclusão e consolidação do pai.
- Exemplo: Capítulo + Subcapítulos 1, 2 e 3 resulta em um único Capítulo integrado, não quatro documentos separados.
- Em pinagem humana excepcional, o agente fixado permanece no pai como responsável pelo Draft/consolidação. A pinagem não é herdada automaticamente pelas filhas; elas devem ser distribuídas a outros agentes elegíveis, sem bloqueio causado pela atribuição do pai.
- Esta regra não redefine documentos vivos nem a composição recursiva por `parent_task_id`. Esse campo é contextual e não deve ser interpretado universalmente como mecanismo de composição documental.
- Consequência: separar agente consolidador do pai e agentes executores das filhas; não copiar `agentId`/`agentPinned` do pai para as filhas; filhas concluídas não concluem a missão sem consolidação do pai.
- Referência: OR-20261114-0018, aditivo de 2026-11-14.


## Decisão do responsável — agente consolidador efêmero (2026-11-14)
- O papel consolidador pertence funcionalmente ao pai; não pertence ao agente que o iniciou ou assumiu primeiro.
- A atribuição do agente ao pai é temporária. Em impedimento, o SCP pode transferir a continuidade para qualquer agente elegível, salvo pinagem humana explícita.
- A transferência preserva Draft, contexto, histórico, resultados das filhas, dependências e estado de consolidação; o novo agente continua a mesma missão.
- Pinagem humana impede transferência silenciosa; se o agente fixado ficar impedido, sinalizar ao operador.
- Missão e papel consolidador persistem; identidade do executor não.
- Referência: OR-20261114-0018, aditivo de 2026-11-14.


## Requisitos em avaliação — Messenger e identificação de execução (2026-11-14)
- Exibir o **Agent Task ID / Manus Task ID** associado à missão, distinguindo-o do ID local da missão e do Agent ID. Disponibilizar cópia do identificador; quando não houver execução externa, indicar isso explicitamente.
- Oferecer conversa direta com a conta original do agente, independente de sua atribuição atual a uma missão. O canal deve ser independente do ciclo de execução da missão e utilizar a credencial vinculada ao Agent ID.
- Manter histórico próprio para a conversa direta e permitir anexar/fornecer contexto de missão de forma explícita e controlada. A conversa não deve alterar automaticamente estado, atribuição, Draft ou conclusão de missão.
- A API conhecida exige task_id em /task.sendMessage; validar se existe endpoint de inbox ou se será necessária uma execução Manus dedicada e persistente para a conversa direta. Não presumir recebimento em inbox genérica.
- Classificação: proposta de produto do responsável; desenho técnico pendente. Referência: OR-20261114-0018, aditivo e AC-011. Sem implementação ou chamadas externas nesta etapa.


## Checkpoint 2026-11-14 — SOFIA como plano cognitivo central (AC-012)
- O responsável aprovou a evolução da SOFIA como interlocutora do operador e camada cognitiva central do SCP, separada da camada determinística de política/execução e dos agentes federados.
- Modelo atualmente configurado identificado em `server/_core/llm.ts`: `gemini-2.5-flash` via gateway Manus Forge.
- Criada branch `feat/sofia-cognitive-control-plane`; primeira entrega faz o Messenger passar pela Sofia antes de qualquer encaminhamento Manus e adiciona ferramenta tipada para encaminhamento explícito ao agente/execução atualmente atribuídos.
- Requisitos e limites documentados em AC-012 e `governance/architecture/SOFIA_COGNITIVE_CONTROL_PLANE.md`.
- Testes escritos, ainda não executados; check/test/build pendentes. Implementação ainda não integrada nem implantada.
- Próximas fases: ferramentas read-only para estado/elegibilidade, planos estruturados com confirmação persistente, transferência/pausa/retomada governadas, memória operacional e UI de telemetria real.
- Nenhuma chamada externa real, dispatch, consumo de crédito, alteração DB/produção, deploy ou restart. Task 20.3 permanece sob Mateus.
- OR-20261114-0022 SUBMITTED; Oracle PENDING.


## Checkpoint 2026-11-14 — definição sistêmica SOFIA / SCP e BBC / BCE
- O responsável esclareceu que **SOFIA** é o sistema integrado completo e modular; **SCP (SOFIA Control Panel)** é exclusivamente o frontend/painel central de comando, não um módulo independente.
- Módulos de conhecimento: **SWE** extrai fontes e alimenta a **BBC (Base Bruta de Conhecimento)**; **SCur (SOFIA Curator)** cura a BBC e mantém a **BCE (Base de Conhecimento Evolutivo)** por documentos vivos/estado da arte; **SVec** vetoriza a BCE curada, não a BBC como fonte primária.
- Módulos arqueológicos, de otimização, segurança e demais especializações integram o SOFIA. Cognição, governança e orquestração são capacidades transversais do sistema.
- AC-013 registra a decisão; documento normativo: `governance/architecture/SOFIA_COGNITIVE_ORCHESTRATION_ARCHITECTURE.md`.
- A correção documental não implementa os módulos nem altera o pipeline atual; PR #15 continua sem validação de check/test/build, sem merge/deploy e sem alterações de DB/produção. Task 20.3 permanece atribuída a Mateus.


### AC-014 — TR como compreensão e memória viva da missão (2026-11-14)
- Primeiro TR obrigatório após criação e antes de qualquer execução.
- Missão humana: validação explícita do primeiro TR pelo operador solicitante antes da execução; correções e redirecionamentos geram versões preservadas.
- Missão autônoma da SOFIA: primeiro TR obrigatório, sem aprovação humana preliminar; execução dentro das políticas e limites de autonomia, com motivação e evidências registradas.
- Operador pode consultar e reorientar qualquer missão a qualquer momento, observadas as políticas de governança.
- Integridade documental: não inventar motivação, decisões ou resultados; classificar fatos, declarações, interpretações, hipóteses, reconstruções e dados não localizados. Missão antiga sem justificativa deve declarar ausência de localização; reconstrução precisa ser identificada. Resultados exigem evidência.
- TR versionado e atualizado continuamente; TR é a visão principal ao abrir missão no SCP. Correlações entre missões exigem justificativa e proveniência. TR e FOR são distintos.
- Especificação: governance/architecture/MISSION_TR_SPECIFICATION.md. Implementação pendente; nenhuma alteração de runtime/DB/produção/deploy nesta etapa. Task 20.3/Mateus intocada.


### OR-20261114-0024 — Diagnóstico técnico do caminho de criação e início da missão
- A auditoria da branch confirmou que `sofia.tasks` é o registro operacional atual; não foi localizada tabela `missions` separada no schema analisado.
- Os dados de intenção capturados na criação são essencialmente título e descrição. O formulário oferece status inicial e usa STAGED como padrão.
- A migration `0003_automatic_task_dispatch.sql` define trigger após INSERT/UPDATE para dispatch quando a missão entra em STAGED. A definição está no repositório; sua instalação/ativação em produção não foi consultada.
- **Implicação:** a geração/validação do TR deve anteceder a transição que dispara o dispatch. A implementação precisa fechar caminhos alternativos (status selecionável, `tasks.start`, endpoint interno e subtarefas fatoradas).
- Mensagens e ORs são armazenados em `messages`; logs pontuais em `activityLogs`; relatório consolidado em Storage. O mirror GitHub da missão contém metadados e descrição, não TR versionado.
- UI atual de detalhe não tem TR e inicia pela descrição/ações; tabs atuais: subtarefas, relatórios e consolidado.
- Sem alterações de código funcional, schema, banco, produção, dispatch, chamadas externas, créditos, deploy ou restart. Task 20.3/Mateus intocada. Estado de produção não verificado.
- Próximo passo: especificar gate pré-dispatch e contrato de TR inicial para origem humana, origem SOFIA e subtarefas antes de implementar.


### Checkpoint 20.4 — AC-017: visualizador dinâmico de documentos (2026-11-14)

- Definido visualizador genérico de documentos na tela Gerenciar, com dropdown dinâmico e TR como seleção padrão; Blueprint, ORs, FOR e tipos futuros são exibidos no mesmo espaço quando existirem e forem acessíveis.
- Catálogo de tipos documentais é separado das instâncias/versionamentos vinculados à missão; modelo permite múltiplas instâncias por tipo.
- Descrição original é preservada como fonte da solicitação e não substitui TR/Blueprint. Seleção é somente leitura; backend/RLS garantem acesso.
- Especificação: governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md; OR-20261114-0028 indexado. Contratos TR, Blueprint e arquitetura geral atualizados.
- Implementação permanece pendente; sem runtime/schema/banco/produção/dispatch/LLM/Manus/créditos/deploy/restart. Task 20.3/Mateus intocada.


### Incremento A — persistência documental (2026-11-14)

O modelo físico inicial do catálogo e versionamento foi adicionado à branch (schema Drizzle + migration SQL 0010). Tabelas: missionDocumentTypes, missionDocuments e missionDocumentVersions. Ownership deriva de tasks.createdBy; versões são append-only; Blueprint pode apontar para versão exata do TR; catálogo inicial inclui ORIGINAL_REQUEST, TR, BLUEPRINT, OR e FOR.

A migration não foi conectada ao ensure-database/startup e não foi aplicada a banco. APIs, serviços, geração, backfill e UI permanecem pendentes. Não houve testes executáveis, deploy, restart ou chamadas externas. OR-20261114-0029.


A camada server-side de persistência também foi adicionada em server/db.ts: catálogo, listagem, consulta de versões, histórico, criação transacional de documento + versão inicial e criação serializada de revisões. Ownership é validado pelo registro da missão; Blueprint só aceita versão TR da mesma missão. Ainda sem procedures tRPC, UI ou testes executáveis. OR-20261114-0029 atualizado.

- server/db.test.ts recebeu assertions de exportação para as seis funções de persistência; teste escrito, ainda não executado. OR-20261114-0029 registra limites.


### Incremento B — APIs documentais, TR inicial e bloqueio pré-execução (2026-11-14)

Implementado na branch isolada: criação humana em PAUSED; snapshot ORIGINAL_REQUEST; primeira versão do TR pela SOFIA em AWAITING_HUMAN_VALIDATION (ou DRAFT quando a geração falha); procedures para listar documentos, consultar versões/histórico, corrigir, regenerar e validar o TR; validação cria versão append-only VALIDATED e libera STAGED. O gate também existe no updateStatus, no orquestrador (start/process/factorize) e como trigger BEFORE na migration 0010, cobrindo mudanças de agente em tarefas já STAGED e herança de autorização pelas filhas. Fatorização não copia a lease/pinagem do pai.

TaskDetail agora usa visualizador documental único com TR padrão, seleção dinâmica por instâncias, histórico e controles de correção/regeneração/validação. Os formulários exibem PAUSED como estado inicial e levam o operador ao TR.

**Não validado:** pnpm check/test/build, parser SQL e integração. Migration 0010 não aplicada e deve ser aplicada em gate separado antes de deploy deste código. Sem alterações de banco/produção, deploy, restart, dispatch, chamada LLM/Manus real ou consumo de créditos. OR-20261114-0030. Task 20.3/Mateus intocada.


### Incremento B.1 — Blueprint e gate de liberação por versão exata (2026-11-14)

A validação do TR deixou de liberar execução isoladamente. Após a validação humana, a SOFIA gera o Blueprint com referência ao ID e número da versão exata do TR. O Blueprint só é persistido como READY se cumprir seções estruturais obrigatórias e declarar ausência de bloqueios de escopo não resolvidos; falha ou bloqueio mantém missão PAUSED. Há procedure de retry para Blueprint e liberação posterior, restrita à missão PAUSED sem execução externa.

O helper server-side, os caminhos de início/retomada/fatoração/encaminhamento e o trigger BEFORE da migration 0010 exigem TR vigente validado + Blueprint READY/ACTIVE cujo sourceDocumentVersionId corresponda exatamente à versão atual do TR. Reorientação do TR antes da primeira execução cria nova versão e torna o Blueprint anterior inelegível. O visualizador permite retry/liberação e filhas consultam o contexto documental da missão raiz.

READY representa prontidão documental e estrutural; não substitui o motor completo de política para risco, orçamento e permissões. Missões SOFIA-originadas, atualização event-driven do TR, vínculo de unidades do Blueprint às filhas e backfill permanecem pendentes. OR-20261114-0030.

Sem pnpm check/test/build, parser SQL ou testes de integração. Migration 0010 não aplicada; sem alteração em banco/produção, deploy, restart, dispatch, chamada LLM/Manus real ou créditos. Task 20.3/Mateus intocada.

 
### Revisão técnica B.2 — defesa dos caminhos alternativos (2026-11-14)

A revisão encontrou e corrigiu duas brechas de fluxo: o início de tarefa `PAUSED/PROGRESS` com agente atribuído e a fatoração direta de missão `PAUSED`, que poderia criar subtarefas `STAGED` e acionar o dispatch. Agora `startTask` aceita apenas `STAGED`; o claim concorrente é relido antes de gravar estado de espera; fatoração exige missão raiz `STAGED/PROGRESS`; migration 0010 verifica também o estado real da raiz antes de liberar subtarefa `STAGED`. A UI reflete os mesmos limites. O validador do Blueprint exige estrutura própria, ordenada e preenchida, com declaração de bloqueios consistente. Testes adicionados, ainda não executados. Sem check/build/parser SQL/integration; migration 0010 não aplicada; sem produção/deploy/dispatch/LLM real/Manus/créditos. OR-20261114-0030.

A procedure genérica de status foi endurecida: a promoção para `PROGRESS` é reservada ao claim atômico do orquestrador ou à retomada de execução externa já existente. A migration 0010 reforça a mesma regra no banco, exige TR/Blueprint vigente também em transições para `PROGRESS` e impede criar/dispatchar subtarefas quando a missão raiz está `PAUSED`. OR-20261114-0030.

- Criação de missão agora faz preflight do catálogo e exige `ORIGINAL_REQUEST`, `TR` e `BLUEPRINT` ativos antes de inserir a linha em `tasks`; migration 0010 ausente/incompleta não deixa missão órfã. OR-20261114-0030.

- Limite de validação registrado: a ausência de bloqueios é verificada no conteúdo integral do Blueprint; a UI só sinaliza prontidão quando o TR vigente está validado. Testes/check/build continuam pendentes porque esta sessão não dispõe de checkout/dependências locais. OR-20261114-0030.


### Incremento C — pipeline de validação reproduzível (2026-11-14)

Foi criado workflow dedicado para executar `pnpm check`, `pnpm test`, `pnpm build` com dependências congeladas e validar a migration 0010 em PostgreSQL 16 descartável, usando fixture isolado de pré-requisitos. O resultado do workflow ainda não foi confirmado nesta etapa. A migration não foi aplicada a banco persistente; nenhum deploy, restart, dispatch, chamada real a LLM/Manus ou consumo de créditos ocorreu. Task 20.3/Mateus permanece intocada. OR-20261114-0030.
