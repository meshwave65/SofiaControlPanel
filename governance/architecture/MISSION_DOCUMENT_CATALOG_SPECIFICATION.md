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
