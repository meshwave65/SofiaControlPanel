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


### Checkpoint 20.4 — incidente de autenticação do SCP (2026-11-14)
- **Sintoma:** o responsável não consegue entrar no SCP; a UI informa que a inicialização da autenticação excedeu 15 segundos. Avisos de Self-XSS, WebGPU e extensões do YouTube não explicam a falha.
- **Runtime:** Render `SofiaControlPanel-web` está ativo, com deploy live no commit `255a01601ae3f95f40de2071d53508cf6a41faf5`, branch configurada `main`, auto-deploy desligado. Logs anteriores registraram `Invalid Supabase access token` e timeout de consulta a `sofia.agents`; o timeout de consulta não foi correlacionado ao login.
- **Supabase Auth:** logs do projeto associado ao SCP registram trocas PKCE bem-sucedidas para a origem do painel. Isso afasta indisponibilidade total do provedor, mas não prova que o backend valida o mesmo token/projeto.
- **Código live:** `client/src/main.tsx` aguardava `supabase.auth.getSession()` antes de enviar qualquer requisição tRPC; `useAuth` também chamava `getSession()` durante a inscrição em `onAuthStateChange`. A concorrência é uma causa plausível do bloqueio de bootstrap, ainda não comprovada por reprodução de runtime.
- **Correção preparada:** PR #16 remove a recuperação concorrente, mantém token e snapshot de sessão em memória por eventos Supabase e valida explicitamente o código PKCE no callback. PR: https://github.com/meshwave65/SofiaControlPanel/pull/16.
- **Validação da PR/main:** `pnpm check`, `pnpm test` e `pnpm build` passaram em GitHub Actions run #43653652236.
- **Compatibilidade com a base live:** branch isolada `hotfix/auth-restore-live`, derivada de `255a016`; `pnpm build` passou. `pnpm check` expôs três erros preexistentes fora dos arquivos alterados (`TaskDetail.tsx`, `server/_core/env.ts`, `server/sofiaOrchestrator.ts`). `pnpm test`: 20/21 passaram; a falha restante é teste de profundidade de fatorização em `server/sofiaOrchestrator.test.ts`, sem relação com autenticação.
- **Gate de release:** `main` está 204 commits à frente de live e a comparação contém 72 arquivos alterados, incluindo API/serviços e migration SQL. O deploy Render disponível usa a branch configurada e não permite selecionar o commit isolado; publicar `main` incluiria mudanças fora do hotfix. Nenhum merge, deploy, mudança de configuração ou alteração de DB foi feito.
- **Próximo passo:** obter caminho de deploy isolado do commit hotfix no serviço Render existente; depois validar login autenticado e observar `auth.me` no backend. Até lá, correção permanece preparada, não publicada.
- **Guardrails:** tarefa 20.3/Mateus não foi tocada; nenhuma chamada Manus/LLM ou crédito consumido.
- **OR:** OR-20261114-0022.
