# Especificação — Plano de ação estruturado da missão

**Identificador:** AC-018  
**Status:** contrato inicial implementado na branch da PR #15; runtime externo e banco persistente ainda não validados.

## 1. Responsabilidade

O plano de ação transforma o entendimento aprovado da missão e seu Blueprint operacional em unidades de trabalho verificáveis. Ele é uma proposta da SOFIA, não uma ordem de execução.

- TR: contexto e entendimento vigente da missão.
- Blueprint: escopo operacional e estrutura de trabalho derivada de uma versão exata do TR.
- Plano de ação: decomposição estruturada, dependências, propostas de executor, estimativas verificáveis, riscos, reversibilidade e critérios de aceite.
- OR: evidências do que foi tentado/executado.
- FOR: consolidação final e aprendizado.

O plano de ação não substitui nem altera o Blueprint.

## 2. Pré-condições para geração

1. A missão raiz deve pertencer ao operador autenticado.
2. A versão vigente do TR deve estar VALIDATED, ACTIVE ou REORIENTED.
3. A versão vigente do Blueprint deve estar READY ou ACTIVE.
4. O Blueprint deve referenciar exatamente a versão vigente do TR.
5. O servidor carrega o conteúdo das versões autorizadas e consulta elegibilidade por função read-only.
6. O LLM não escolhe IDs de missão, proprietário ou documento; esses identificadores são derivados/validados no servidor.

## 3. Contrato de dados

O conteúdo é JSON versionado com `schemaVersion=1` e os campos:

- `objective`, `expectedOutcome`;
- `tasks[]`: ID estável local, título, descrição, `dependsOn[]`, agente proposto ou null, justificativa, créditos estimados, base da estimativa, critério de aceite, riscos e reversibilidade;
- `globalRisks[]`, reversibilidade global;
- `approvalRequired=true` e justificativa.

Validação determinística:
- IDs de tarefas únicos e no formato T01…;
- dependências devem existir, não podem apontar para a própria tarefa, repetir a mesma referência ou formar ciclos;
- Agent ID proposto deve pertencer ao snapshot de elegibilidade consultado;
- `estimatedCredits` deve permanecer null enquanto não houver modelo de preço/consumo verificável;
- propriedades desconhecidas são rejeitadas.

O saldo disponível de um agente não é estimativa de custo de execução.

## 4. Persistência e proveniência

O tipo `ACTION_PLAN` utiliza as tabelas documentais existentes, sem uma segunda estrutura paralela:
- instância lógica `missionDocuments`, chave ACTION_PLAN;
- versão imutável `missionDocumentVersions`;
- estado inicial PROPOSED;
- hash SHA-256 do JSON canônico persistido;
- `sourceDocumentVersionId` aponta para a versão exata do Blueprint;
- proveniência inclui IDs/números exatos do TR e Blueprint e o snapshot de elegibilidade.

A migration 0011 somente adiciona o tipo ACTION_PLAN ao catálogo já protegido por RLS server-only. Não é executada automaticamente no startup.

## 5. Aprovação explícita

A aprovação é uma transação append-only:
1. operador autenticado deve ser o proprietário da missão;
2. cliente informa o número e hash da versão que estava exibida;
3. servidor bloqueia a instância documental e verifica que a versão ainda é a última e está PROPOSED;
4. servidor recalcula SHA-256 e compara com o hash armazenado;
5. servidor confirma que o Blueprint de origem continua sendo o vigente e READY/ACTIVE, e que ele continua derivado do TR vigente validado;
6. servidor cria nova versão com conteúdo idêntico, estado APPROVED, autor HUMAN e identidade do proprietário;
7. proveniência registra ID, número e hash da proposta aprovada.

Se a proposta mudou, foi substituída ou ficou obsoleta, a aprovação é rejeitada e o operador deve recarregar/revisar.

## 6. Limite da aprovação

APPROVED significa somente que o operador aprovou aquela versão documental do plano. Não:
- cria tarefas-filhas;
- atribui ou reserva agentes;
- inicia, pausa ou retoma execução;
- despacha instruções para Manus;
- autoriza automaticamente consumo de créditos;
- substitui avaliação de risco, orçamento, permissões, credenciais, idempotência ou concorrência.

Cada ação futura exige serviço determinístico, escopo e pré-condições próprios, além da confirmação humana aplicável.

## 7. Interface

O plano é exibido no visualizador documental dinâmico existente. A UI oferece:
- geração de proposta somente quando TR/Blueprint vigentes cumprem os pré-requisitos;
- exibição do JSON estruturado e estado documental;
- aprovação somente da versão PROPOSED vigente, enviando versão e hash exatos;
- confirmação visual de que a aprovação não iniciou execução.

## 8. Critérios de aceite

- [x] Geração exige TR validado e Blueprint vigente vinculado ao TR exato.
- [x] Contrato JSON validado no servidor.
- [x] Agentes sugeridos limitados ao snapshot de elegibilidade.
- [x] Créditos estimados ficam desconhecidos sem modelo verificável.
- [x] Proposta persistida como documento versionado e hash.
- [x] Aprovação append-only, identificada pelo operador e vinculada à versão/hash.
- [x] Aprovação rejeita versão obsoleta ou fonte TR/Blueprint desatualizada.
- [x] UI integrada ao visualizador existente.
- [x] Nenhum dispatch ou execução é iniciado pela aprovação.
- [x] CI final e validação de migration 0011 em PostgreSQL 16 descartável (run 43668299189).
- [ ] Runtime LLM integrado e banco persistente permanecem sem validação.

## 9. Próxima fronteira

O estágio seguinte deve implementar gates determinísticos de risco, orçamento, permissões e autorização por unidade de trabalho. Não deve tratar a aprovação do plano inteiro como autorização ampla para execução.
