# TR — Termo de Referência

**Identificador:** TR  
**Denominação oficial:** Termo de Referência  
**Status:** contrato aprovado; implementação parcial na PR #15, com atualização contínua e origem autônoma ainda pendentes  
**Missão de referência:** MISSION_0020 / tarefa 20.4  
**Branch:** feat/sofia-cognitive-control-plane

> **Nota histórica sobre a sigla:** TR foi originalmente criado com a denominação *Transactional Report*. Posteriormente, por sugestão do assistente, sua denominação foi alterada para **Termo de Referência**, mudança aceita pelo operador e adotada como definição canônica. A denominação anterior é apenas a origem histórica da sigla; não representa um significado alternativo vigente. Toda referência documental, técnica ou de interface deve utilizar **Termo de Referência**.

## 1. Finalidade

O TR é o documento vivo, versionado e legível por pessoas que permite compreender uma missão sem reconstruir seu contexto a partir de tarefas, mensagens, logs e relatórios técnicos dispersos.

Deve responder, com base em evidências, por que a missão foi criada; o que pretende alcançar; como evoluiu; o que efetivamente produziu, descobriu, corrigiu, implementou ou descartou; qual é sua situação atual; quais decisões determinaram seu percurso; como se relaciona com outras missões/projetos/domínios; e quais são os próximos passos coerentes.

O TR não é log bruto, painel de indicadores, lista de tarefas nem substituto dos ORs. É uma síntese narrativa contextualizada, com rastreabilidade para suas fontes.

## 2. Primeiro TR: obrigatório antes da execução

Toda missão deve receber uma primeira versão de TR após sua criação e antes do início de qualquer execução de tarefa ou ação operacional da missão.

O primeiro TR registra a compreensão inicial da missão, não resultados inexistentes. Deve conter:
1. origem da missão e autor da iniciativa (operador humano ou SOFIA);
2. motivação declarada ou necessidade identificada;
3. objetivo compreendido;
4. escopo incluído e exclusões conhecidas;
5. resultados esperados;
6. estratégia/plano inicial proposto;
7. premissas, dependências, riscos e dúvidas;
8. critérios de conclusão e evidências esperadas;
9. classificação dos elementos como declaração, fato, interpretação, hipótese ou pendência.

O primeiro TR deve existir mesmo quando a missão for criada autonomamente pela SOFIA. A ausência do TR inicial impede o início da execução. Eventual exceção de emergência dependerá de política própria e não é criada por este requisito.

## 3. Dois fluxos de origem

### 3.1 Missão solicitada por operador humano

1. O operador submete a solicitação.
2. A SOFIA interpreta a solicitação e gera o TR inicial em elaboração.
3. O operador recebe o TR para avaliar se a compreensão corresponde à intenção original.
4. O operador pode validar, corrigir, complementar, restringir ou redirecionar a proposta.
5. Cada alteração gera nova versão, preservando as anteriores.
6. A execução somente pode começar após validação explícita do TR pelo operador responsável.

A validação confirma o entendimento documentado e autoriza a passagem para execução dentro do escopo validado. Não substitui confirmações adicionais exigidas por políticas de risco, segurança, finanças, credenciais ou operações de alto impacto.

O sistema deve preservar a solicitação original e, quando disponível, as palavras do operador. A interpretação da SOFIA deve aparecer separadamente; nunca atribuir ao operador uma motivação ou formulação que ele não declarou.

### 3.2 Missão originada autonomamente pela SOFIA

1. A SOFIA identifica e registra uma necessidade, oportunidade, obrigação ou problema.
2. Cria a missão e gera o primeiro TR antes de executar tarefas.
3. Registra que a iniciativa, a motivação operacional e a formulação inicial são da própria SOFIA, indicando evidências, sinais ou regras que levaram à decisão.
4. Pode iniciar a execução sem aprovação preliminar humana, desde que a iniciativa esteja dentro das permissões, políticas, limites de autonomia e orçamento vigentes.
5. O operador pode consultar, questionar, corrigir ou reorientar a missão a qualquer momento.

A autonomia não elimina governança. Ações que excedam permissões, limites ou políticas continuam sujeitas aos gates correspondentes. Este fluxo dispensa somente a validação humana preliminar do TR, não controles de segurança ou autorizações específicas.

## 4. Estados documentais do TR

Estados mínimos:
- **DRAFT:** primeira versão gerada, ainda em elaboração.
- **AWAITING_HUMAN_VALIDATION:** missão de origem humana aguardando avaliação do operador.
- **VALIDATED:** entendimento inicial validado pelo operador.
- **ACTIVE:** TR em atualização durante a execução.
- **REORIENTED:** objetivo, escopo ou estratégia recebeu alteração relevante, com nova versão e origem identificadas.
- **CLOSED:** missão encerrada e narrativa final consolidada.

Missões autônomas podem passar de DRAFT para ACTIVE sem AWAITING_HUMAN_VALIDATION, respeitados os gates de governança.

Esses estados documentais não substituem nem duplicam os estados técnicos da missão ou das tarefas. A interface deve apresentar ambos sem os confundir.

## 5. Atualização contínua e versionamento

O TR é atualizado quando ocorrer evento material, incluindo criação e registro da motivação; validação/correção do entendimento; alteração de objetivo, escopo, estratégia ou critérios; decisão relevante; início, avanço, conclusão, falha, bloqueio, abandono ou retomada de tarefa; entrega ou descoberta com evidência; checkpoint ou OR relevante; intervenção humana/reorientação; e encerramento.

O processo separa:
1. captura persistente do evento/fato e de sua fonte;
2. consolidação narrativa pela SOFIA com base nos registros;
3. publicação de nova versão do TR, mantendo histórico e diferenças.

Não se sobrescrevem versões anteriores silenciosamente. Cada versão identifica data/hora, autor/origem da alteração, eventos/fontes considerados e mudanças materiais.

## 6. Integridade, evidência e incerteza

O TR não pode inventar motivação, decisão, progresso, entrega ou resultado que não esteja documentado.

Toda afirmação material deve ser classificada como:
- **Fato documentado:** sustentado por artefato, evento, tarefa, decisão ou evidência verificável.
- **Declaração do operador:** conteúdo efetivamente declarado pelo humano, com referência à solicitação ou correção.
- **Decisão:** decisão registrada, com autoridade, data e justificativa disponível.
- **Interpretação da SOFIA:** leitura produzida pelo sistema, não apresentada como fala ou intenção declarada do operador.
- **Hipótese/inferência:** interpretação não comprovada, identificada como tal e acompanhada de fundamento e grau de confiança quando possível.
- **Reconstrução:** tentativa explícita de reconstruir contexto ausente, separada dos fatos e com fontes, premissas e confiança.
- **Não localizado/desconhecido:** informação que não foi encontrada nas fontes consultadas.

Para missões antigas sem justificativa registrada, o TR deve declarar: **“A motivação original não foi localizada nos registros consultados.”** Pode apresentar reconstrução identificada como reconstrução, nunca como motivação original confirmada.

Resultados só podem ser descritos como realizados quando houver evidência. Objetivos, resultados esperados, propostas, tarefas planejadas e ações tentadas não podem ser apresentados como resultados concluídos. Ausência de registro não prova que algo não ocorreu; o TR deve dizer que não foi localizado ou verificado.

## 7. Estrutura narrativa recomendada

1. Origem e motivação.
2. Objetivo e resultados esperados.
3. Escopo, exclusões, premissas e critérios de conclusão.
4. Evolução — cronologia descritiva dos eventos relevantes.
5. Resultados efetivamente alcançados, com evidências.
6. Situação atual — progresso, bloqueios, abandonos e pendências.
7. Decisões importantes, razões e consequências.
8. Relações com outras missões, projetos, módulos ou domínios.
9. Próximos passos coerentes com o objetivo vigente.
10. Fontes, proveniência, versão e última atualização.

A narrativa deve ser concisa para leitura operacional, mas completa para preservar contexto. Detalhes técnicos extensos permanecem nos artefatos de origem, acessíveis por referências.

## 8. Correlação entre missões

O TR pode apresentar relações com outras missões quando houver evidência explícita. Tipos possíveis: origem comum; dependência; continuidade; complementaridade; conflito ou sobreposição.

Cada relação indica natureza, justificativa e fonte. Similaridade de palavras-chave, tema ou participantes, isoladamente, não comprova correlação. Relações inferidas são rotuladas como hipóteses, nunca como dependências confirmadas.

## 9. Experiência no SCP

Ao abrir uma missão, o TR deve ser a visão principal e inicial. O operador não deve precisar reconstruir propósito e trajetória a partir de dezenas de tarefas, mensagens ou logs.

A partir do TR, o SCP oferece navegação secundária para tarefas, ORs, checkpoints, decisões, evidências, artefatos técnicos e, quando produzido, FOR. Deve exibir versão, estado documental, última atualização e origem da missão.

O operador deve conseguir validar o primeiro TR de missão humana, consultar versões anteriores e registrar correções/reorientações com autoria e proveniência.

## 10. TR e FOR são artefatos distintos

- **TR:** documento vivo de contexto e compreensão da missão, voltado à leitura humana. Explica origem, objetivo, evolução, resultados, situação, decisões, relações e próximos passos.
- **FOR — Final Operational Report:** documento de aprendizado operacional produzido no encerramento, consolidando ORs e evidências para melhorar eficiência, otimização, procedimentos e qualidade de execução da SOFIA.

Podem compartilhar fontes, mas não finalidade. O TR não substitui o FOR, e o FOR não substitui a narrativa contextual da missão.

## 11. Critérios de aceite

- Toda missão recebe primeiro TR antes de qualquer execução.
- Missão humana exige validação explícita do primeiro TR antes de executar.
- Missão autônoma da SOFIA não exige aprovação preliminar humana, mas registra motivação, origem e evidências e respeita políticas de autonomia.
- Operador pode consultar e reorientar qualquer missão a qualquer momento, conforme governança.
- Versões anteriores são preservadas e alterações rastreáveis.
- Nenhuma motivação, decisão ou resultado é inventado ou atribuído indevidamente.
- Missões antigas sem motivação registrada declaram a ausência; reconstruções são rotuladas.
- Resultados concluídos possuem evidências e links para fontes.
- Correlações entre missões possuem justificativa e proveniência.
- Abrir missão no SCP apresenta TR como visão principal.
- TR e FOR permanecem artefatos distintos.
- Implementação técnica não presume schema, UI ou eventos existentes: esses elementos devem ser inspecionados antes de projetar alterações.

## 12. Relação normativa entre TR e Blueprint

O TR e o Blueprint são artefatos distintos e complementares.

- **TR:** documento narrativo vivo, destinado prioritariamente ao operador, que registra compreensão, origem, motivação, objetivo, escopo, evolução, decisões, resultados comprovados e situação da missão.
- **Blueprint:** plano de trabalho operacional, destinado aos executores, que traduz uma versão específica do TR em etapas, tarefas, dependências, recursos, restrições, critérios de aceite e evidências exigidas.

O Blueprint deriva do TR consolidado. Em missão humana, a validação explícita do TR inicial precede a liberação da execução. Em missão autônoma, a SOFIA pode produzir TR e Blueprint e prosseguir dentro das políticas e limites de autonomia.

O Blueprint deve referenciar a versão exata do TR que o fundamenta e não pode ampliar silenciosamente o escopo validado. Mudanças materiais no TR exigem análise de impacto e atualização/versionamento do Blueprint afetado antes de executar o trabalho correspondente.

A missão-pai mantém o TR e o Blueprint mestre. Tarefas-filhas são unidades auxiliares de execução e referenciam a versão do Blueprint e a unidade que executam; não são missões independentes por padrão. Agentes são executores temporários, não proprietários da missão, e recebem somente o pacote de trabalho/contexto autorizado necessário.

OR registra execução, tentativas, ocorrências e evidências; o TR consolida a evolução narrativa; FOR consolida o aprendizado operacional final. O OR pode motivar revisão do plano, mas não altera o Blueprint automaticamente.

O contrato completo do plano de trabalho está em `governance/architecture/MISSION_BLUEPRINT_SPECIFICATION.md`. A definição é normativa para a arquitetura, mas não afirma que geração, persistência, versionamento, UI ou gates de runtime estejam implementados.


## 13. Apresentação no visualizador dinâmico de documentos (AC-017)

O TR é a seleção padrão do visualizador único de documentos da missão, quando houver versão publicada e acessível. Não terá uma tela isolada nem dependerá de uma aba fixa. O mesmo espaço de leitura apresenta Blueprint, ORs, FOR e outros tipos documentais conforme o operador os selecionar no catálogo/instâncias disponíveis.

A descrição original da solicitação permanece preservada e acessível como proveniência, mas nunca substitui ou simula o TR. A seleção de documento é somente leitura e não altera estado, execução ou autorização da missão.

Contrato completo: governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md. A especificação define UX e modelo lógico; não afirma implementação de catálogo, APIs, RLS ou visualizador.
