# Catálogo e visualizador dinâmico de documentos da missão

**Identificador:** AC-017  
**Status:** decisão de UX e contrato funcional aprovados; implementação pendente

## 1. Objetivo

A tela de detalhe aberta pela ação **Gerenciar** oferece um espaço único de leitura de documentos da missão. O conteúdo muda conforme o operador seleciona o documento desejado.

Não criar abas fixas nem uma tela exclusiva para cada tipo documental. A solução é um visualizador genérico orientado por catálogo, com seleção dinâmica do documento e renderização do conteúdo/versionamento correspondente.

## 2. Comportamento da interface

1. Ao abrir uma missão, o visualizador seleciona o TR vigente por padrão, quando existir.
2. O operador escolhe outro documento por um seletor (dropdown) alimentado pelos documentos disponíveis para aquela missão.
3. A seleção troca o conteúdo no mesmo espaço de leitura, sem navegar para outra tela e sem alterar a missão ou seu estado.
4. O seletor apresenta nome, tipo e, quando pertinente, estado/versão do documento.
5. Não apresenta como disponível um documento que ainda não existe.
6. Se não houver TR persistido, apresenta ausência/geração pendente; nunca simula um TR com a descrição original.
7. Quando houver versões, permite consultar a versão vigente e versões anteriores, respeitando autorização e retenção.
8. A troca de documento é somente consulta. Não inicia, pausa, libera, reatribui ou modifica execução.

O TR permanece a visão padrão e prioritária para leitura humana. O Blueprint é acessível no mesmo espaço, como plano operacional direcionado aos executores.

## 3. Separação entre catálogo e instâncias

### 3.1 Catálogo de tipos documentais

Define quais tipos a SOFIA conhece e como o visualizador deve apresentá-los. Campos conceituais mínimos:

- chave estável do tipo (TR, BLUEPRINT, OR, FOR);
- nome e descrição apresentados ao operador;
- categoria/finalidade e público principal;
- prioridade de ordenação e indicação de documento padrão;
- estratégia/formato de renderização suportado;
- regra de visibilidade e permissões;
- indicador de tipo ativo/depreciado.

O catálogo pode conhecer tipos mesmo quando uma missão ainda não possui uma instância. A UI lista por padrão apenas documentos existentes e acessíveis.

### 3.2 Instâncias documentais da missão

Registra cada documento efetivamente produzido para uma missão, com vínculo ao tipo do catálogo. Campos conceituais mínimos:

- identificador da missão e do tipo documental;
- identificador estável da instância;
- versão e estado documental;
- conteúdo ou referência segura ao conteúdo armazenado;
- autor/origem e responsável pela publicação;
- datas de criação/publicação/atualização;
- referência à versão de origem (por exemplo, Blueprint → versão exata do TR);
- proveniência: eventos, solicitações, decisões, ORs e evidências;
- política de acesso e metadados de auditoria.

A relação permite várias instâncias do mesmo tipo quando fizer sentido, por exemplo ORs por etapa/tarefa.

## 4. Regras de apresentação

- **TR:** primeira opção e documento padrão da missão; narrativa viva e legível para o operador.
- **Blueprint:** plano de trabalho versionado, vinculado à versão exata do TR de origem.
- **OR:** registros operacionais/evidências; podem existir várias instâncias identificadas por etapa, tarefa ou período.
- **FOR:** relatório final de aprendizado operacional, exibido quando produzido.
- **Descrição original:** fonte da solicitação, preservada separadamente e acessível como proveniência; nunca rotulada como TR ou Blueprint.
- **Futuros tipos:** entram por cadastro no catálogo e publicação de instâncias, sem exigir nova aba/tela dedicada.

Documentos podem ser agrupados por finalidade (contexto, planejamento, execução, consolidação), mas o conteúdo é exibido no mesmo visualizador.

## 5. Leitura, versão e segurança

- A listagem retorna somente documentos da missão atual e acessíveis ao usuário.
- Backend e RLS são a autoridade para ownership e permissões; ocultar opções no frontend não é controle de acesso.
- O conteúdo é buscado por identificadores autorizados, sem aceitar caminho arbitrário de Storage fornecido pelo cliente.
- Versões publicadas são imutáveis; revisão cria nova versão e preserva autoria, data, origem e diff.
- O visualizador indica tipo, título, versão, estado, origem/autoria e data de atualização.
- A UI distingue ausência, elaboração, carregamento, falha e acesso negado.
- Seleção não altera estado de missão/tarefa nem satisfaz gates de validação ou autorização.

## 6. Relação com o ciclo da missão

- TR descreve compreensão e evolução da missão.
- Blueprint deriva de uma versão específica do TR e orienta o trabalho.
- ORs registram execução, tentativas, ocorrências e evidências.
- TR pode ser atualizado a partir de eventos e evidências relevantes.
- FOR consolida o aprendizado operacional no encerramento.
- A descrição original permanece fonte histórica independente.

O visualizador consulta esses artefatos; não é mecanismo de geração, validação, versionamento ou autorização.

## 7. Critérios de aceite

- Gerenciar abre a missão com TR selecionado por padrão quando disponível.
- TR, Blueprint, OR, FOR e futuros documentos utilizam o mesmo espaço.
- Seletor é preenchido dinamicamente por catálogo/instâncias, sem lista hardcoded no frontend.
- Tipos sem instância não aparecem como documentos existentes.
- Múltiplas instâncias e versões são identificáveis e consultáveis.
- Descrição original nunca é apresentada como TR ou Blueprint.
- Seleção não altera missão, execução, atribuição ou permissões.
- Backend/RLS protegem listagem e conteúdo independentemente da UI.
- Estados vazios, carregamento, erro e acesso negado são distintos.
- Novo tipo documental não exige nova aba ou página dedicada.
- UI não presume implementação antes de APIs e persistência compatíveis.

## 8. Limite

Este contrato define a experiência e o modelo lógico. Não declara que catálogo, tabelas, APIs, RLS, persistência versionada ou visualizador estejam implementados. O desenho físico deve ser reconciliado com schema, ownership e estratégia de RLS reais antes de migrations ou alterações de runtime.


## 9. Mapeamento físico inicial — Incremento A

O primeiro mapeamento Drizzle/PostgreSQL usa três tabelas no schema privado `sofia`:

| Tabela | Responsabilidade |
|---|---|
| `sofia.missionDocumentTypes` | Catálogo estável dos tipos documentais e metadados de apresentação. |
| `sofia.missionDocuments` | Instância lógica do documento vinculada à missão (`tasks.id`), com `documentKey` estável dentro da missão. |
| `sofia.missionDocumentVersions` | Conteúdo e proveniência de cada versão, com autoria, estado, timestamps e vínculo opcional à versão-fonte. |

A versão vigente é derivada da maior versão registrada para a instância; não há ponteiro mutável que possa divergir do histórico. A combinação `documentId + version` é única. A combinação `taskId + documentKey` identifica uma instância lógica sem impedir múltiplas instâncias do mesmo tipo (por exemplo, vários ORs).

O vínculo `sourceDocumentVersionId` permite que um Blueprint aponte para a versão exata do TR que o originou. A validação semântica de que a versão-fonte pertence à mesma missão e é do tipo TR será responsabilidade da camada de serviço antes de aceitar uma nova versão.

### Catálogo inicial

A migration cadastra `ORIGINAL_REQUEST`, `TR`, `BLUEPRINT`, `OR` e `FOR`. `ORIGINAL_REQUEST` representa a fonte histórica, não é substituto do TR. TR é o único tipo marcado como padrão.

### Segurança e imutabilidade

As três tabelas recebem RLS habilitado, políticas server-only com negação para os papéis de acesso direto e revogação de privilégios de `PUBLIC`, `anon` e `authenticated`. O SCP utiliza autenticação própria e conexão PostgreSQL server-side; portanto, as políticas não usam `auth.uid()`. A autorização de ownership deve ser verificada na API usando o proprietário da missão (`tasks.createdBy`) antes de listar ou ler documentos. A conexão server-side deve permanecer restrita ao backend.

As linhas de `missionDocumentVersions` são append-only: trigger bloqueia UPDATE e DELETE; qualquer correção cria nova versão. Instâncias documentais e missões usam exclusão restrita para evitar apagar acidentalmente histórico.

### Artefatos de implementação

- Schema Drizzle: `drizzle/schema.ts`.
- Migration: `drizzle/0010_mission_document_catalog.sql`.

A migration 0010 **não foi adicionada ao `scripts/ensure-database.mjs`** e não foi aplicada a banco algum. A rotina de inicialização atual executa verificações e instala explicitamente somente migrations já selecionadas; ligar 0010 ao startup poderia alterar banco automaticamente durante deploy. A aplicação fica reservada a uma etapa de migração controlada, após validação do SQL, backup/rollback e autorização específica.

A migration é compatível com o padrão server-only observado em `drizzle/0004_arc_server_only_rls.sql` e `drizzle/0007_arc_telemetry_confidence.sql`, mas a presença do arquivo no repositório não comprova execução no banco.


## 10. Estado de implementação — Incremento B (2026-11-14)

Na branch de implementação, foram adicionadas procedures server-side para listar instâncias, obter conteúdo por versão, listar histórico, revisar o TR inicial, regenerá-lo após falha e validá-lo explicitamente. A criação de missão humana registra ORIGINAL_REQUEST e o primeiro TR; o visualizador de TaskDetail usa as instâncias retornadas pelo backend, seleciona TR por padrão e permite consultar versões anteriores.

A listagem do visualizador é baseada nas instâncias documentais vinculadas à missão e nos rótulos do catálogo. Tipos sem instância não aparecem. A migration 0010 permanece não aplicada; logo, APIs e UI dependem de sua aplicação controlada antes de qualquer deploy.

Ainda não estão implementados geração de Blueprint, fluxo de missão autônoma SOFIA-originada, atualização event-driven do TR, backfill de missões legadas, diff visual ou geração de OR/FOR no ciclo completo. OR-20261114-0030.


## 11. Incremento B.1 — vínculo de Blueprint ao TR vigente

O visualizador identifica o Blueprint canônico da missão e a versão de origem. A prontidão de execução não é inferida pela simples existência de um Blueprint: a versão mais recente precisa estar em READY/ACTIVE e seu `sourceDocumentVersionId` deve apontar exatamente para o ID da versão vigente do TR canônico, que precisa estar VALIDATED/ACTIVE/REORIENTED.

A API e o trigger SQL aplicam a mesma condição. Uma nova versão/reorientação do TR torna o Blueprint anterior inelegível até que seja criada uma nova versão derivada do TR atualizado. Tarefas-filhas resolvem os documentos da missão raiz; não criam cópias documentais independentes. OR-20261114-0030.
