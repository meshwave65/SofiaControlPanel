# Blueprint — Contrato do Plano de Trabalho de Missão

**Identificador:** Blueprint  
**Status:** definição arquitetural proposta para adoção junto ao AC-015  
**Escopo:** plano operacional derivado do TR de uma missão SOFIA

## 1. Finalidade e distinção do TR

O Blueprint é o plano de trabalho operacional que traduz o entendimento consolidado da missão em uma estrutura executável por agentes humanos, módulos internos ou agentes federados.

- **TR:** explica ao operador o que a missão significa, por que existe, o que pretende alcançar, como evoluiu e o que foi efetivamente obtido.
- **Blueprint:** instrui o executor sobre o que precisa ser feito, em que sequência, sob quais condições, com quais recursos e como demonstrar que cada entrega foi concluída.

O Blueprint não substitui o TR, não é uma segunda narrativa da missão e não constitui autorização irrestrita para agir. É um artefato operacional vinculado a uma missão e a uma versão específica do TR.

## 2. Regra de derivação e precedência

1. A SOFIA consolida o TR inicial.
2. Em missão de origem humana, o operador valida explicitamente o TR antes da liberação da execução.
3. A SOFIA decompõe o escopo validado e produz o Blueprint correspondente.
4. O Blueprint é validado pelos controles determinísticos de política, permissões, risco, recursos e orçamento.
5. A SOFIA libera tarefas elegíveis para os executores.
6. Alterações materiais no TR exigem análise de impacto e atualização/versionamento do Blueprint antes de executar trabalho afetado.

O Blueprint deve registrar o identificador e a versão exata do TR que o fundamenta. Não pode ampliar silenciosamente o objetivo ou escopo aprovado. Se a decomposição revelar ambiguidade, conflito, dependência não autorizada ou necessidade de ampliar escopo, a SOFIA deve suspender a parte afetada e solicitar orientação ou autorização apropriada.

Para missão autônoma originada pela SOFIA, o TR inicial continua obrigatório. A SOFIA pode produzir o Blueprint e prosseguir sem aprovação humana preliminar, dentro das permissões, políticas, limites de autonomia, orçamento e gates de risco.

## 3. Conteúdo mínimo do Blueprint

Cada versão do Blueprint deve registrar:

1. Identidade da missão e vínculo com a versão do TR de origem.
2. Objetivo operacional e resultados/entregáveis esperados.
3. Escopo executável, exclusões e premissas herdadas do TR.
4. Decomposição em etapas e unidades de trabalho.
5. Tarefas, dependências, ordem ou paralelismo permitido.
6. Perfil/capacidade requerida do executor; agente atribuído é referência operacional mutável, não propriedade da missão.
7. Entradas, fontes, artefatos e contexto autorizados para cada unidade.
8. Ferramentas, recursos, orçamento e limites de consumo.
9. Restrições, proibições, riscos e pré-condições.
10. Critérios objetivos de aceite e evidências exigidas por entrega.
11. Estratégia de validação, integração e consolidação pelo responsável funcional da missão.
12. Plano de contingência para falha, bloqueio, retry, substituição ou replanejamento.
13. Pontos que exigem confirmação humana ou gate de política.
14. Versão, autoria/origem, data, justificativa da alteração e histórico/diff.

O Blueprint não deve copiar credenciais, segredos ou dados desnecessários. Referências a recursos sensíveis devem usar identificadores autorizados e resolução server-side.

## 4. Relação entre missão-pai, tarefas-filhas e executores

A missão-pai mantém o TR e o Blueprint mestre, responde pela coerência do objetivo e consolida o resultado final da missão.

Tarefas-filhas são unidades auxiliares de execução, não missões independentes nem entregáveis finais autônomos por padrão. Cada filha deve referenciar:
- missão-pai;
- versão do Blueprint mestre;
- unidade/seção do plano que executa;
- escopo e critérios de aceite aplicáveis;
- dependências e evidências/resultados que deve devolver.

A SOFIA pode gerar instruções derivadas específicas para cada filha, mas elas devem permanecer subordinadas ao Blueprint mestre e não podem ampliar seu escopo.

A atribuição de agente é uma lease operacional. O executor pode mudar sem alterar a identidade ou a titularidade da missão. Uma substituição deve preservar contexto autorizado, estado, evidências, critérios de aceite e versão do plano. Pinagem humana explícita continua sendo respeitada conforme a política de atribuição.

O agente executor recebe apenas o pacote de trabalho e o contexto necessários à sua unidade. O Blueprint mestre é governado pela SOFIA; não se presume que todo executor tenha acesso integral à missão, a outras tarefas ou a dados sensíveis.

## 5. Execução, desvios e mudanças de plano

O executor deve devolver resultados vinculados à unidade de trabalho, com evidências, limitações, falhas e itens não realizados. Planejado, tentado, executado e validado são estados distintos.

Desvio operacional dentro do escopo pode ser registrado e avaliado pela SOFIA. Mudança que altere objetivo, escopo, entregável, risco, orçamento ou autorização exige:
1. registro do evento e da justificativa;
2. avaliação de impacto no TR e no Blueprint;
3. nova versão do Blueprint;
4. validação humana ou gate de política quando aplicável;
5. liberação apenas das unidades afetadas após cumprir os gates.

Versões anteriores nunca são sobrescritas. Uma tarefa já iniciada deve manter a referência ao Blueprint sob o qual começou; migração para nova versão deve ser explícita e auditável.

## 6. Relação com OR, TR e FOR

- **Blueprint:** plano prescritivo de trabalho, versionado.
- **OR — Operational Report:** registro factual de execução, ocorrências, evidências, tentativas, resultados e desvios de uma unidade ou etapa.
- **TR:** narrativa viva da missão, atualizada pela SOFIA a partir de eventos, ORs, decisões e evidências.
- **FOR — Final Operational Report:** análise de encerramento e aprendizado operacional para evolução da SOFIA.

O OR não altera o Blueprint por si só. Um desvio identificado em OR pode motivar proposta de revisão. O TR registra a evolução da missão e o estado efetivo. O FOR consolida aprendizados depois do encerramento.

## 7. Estados e ciclo de vida

Estados mínimos recomendados para o documento Blueprint:
- **DRAFT:** plano em elaboração.
- **READY:** plano coerente, vinculado ao TR e pronto para passar pelos gates de liberação.
- **ACTIVE:** há unidades executando sob esta versão.
- **SUPERSEDED:** substituído por versão posterior, preservado para auditoria.
- **CLOSED:** plano encerrado com a missão.

Esses são estados documentais, não status de tarefa, missão ou agente. A liberação de execução é uma decisão de política do servidor e não decorre apenas do estado READY.

## 8. Critérios de aceite

- Cada Blueprint referencia uma versão específica do TR.
- Missão humana não recebe execução antes da validação explícita do TR inicial.
- Plano não amplia silenciosamente o escopo validado.
- Tarefas-filhas referenciam o Blueprint mestre e a unidade que executam.
- Executor recebe somente o contexto e os recursos necessários/autorizados.
- Agente é atribuição temporária, não proprietário da missão.
- Critérios de aceite e evidências são verificáveis por unidade de trabalho.
- Desvios, replanejamentos e versões anteriores permanecem rastreáveis.
- Mudança material de TR aciona análise e atualização do Blueprint afetado.
- OR registra execução; TR consolida a narrativa; FOR captura aprendizado final.
- Nenhum estado documental substitui gates de autorização, risco, orçamento ou segurança.
- Esta especificação não afirma que schema, UI, versionamento ou runtime já implementem esses contratos.


## 9. Apresentação no visualizador de documentos (AC-017)

O Blueprint é apresentado no mesmo espaço de leitura do TR, selecionável por um dropdown dinâmico alimentado pelos documentos existentes e acessíveis da missão. Não exige aba ou página dedicada. A interface deve identificar versão e versão exata do TR de origem, além do estado e da data de atualização.

O Blueprint só aparece como documento disponível quando houver uma instância persistida e acessível. Sua seleção não libera execução nem altera o estado da missão. O visualizador genérico também comporta ORs, FOR e tipos futuros, conforme o catálogo de documentos.

Contrato completo: governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md.
