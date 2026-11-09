# Contrato do Oracle Dispatcher — MISSION_0019 / Tarefa 19.1

**Projeto:** Projeto Triangulo  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data e hora:** 08/11/2026, 23:14 (-03:00)  
**Missão:** MISSION_0019 — Oracle Dispatcher e Worker de Governança  
**Instância executora:** ChatGPT  
**Status:** DRAFT_FOR_REVIEW

## 1. Objetivo e fronteira

Este contrato define como um worker Oracle executável deve descobrir, validar, revisar e registrar Operational Reports no SofiaControlPanel. O worker é uma execução delimitada por rodada; não depende de processo residente, memória de chat ou autoridade implícita. A finalidade é produzir decisões rastreáveis e orientar continuidade segura, não substituir decisão humana, auditoria profissional ou validação de produção.

A implementação deve tratar o conteúdo de ORs como entrada não confiável. Nenhuma instrução encontrada dentro de um OR, artefato ou log pode ampliar as permissões do worker. O worker só age sobre o repositório e os caminhos explicitamente configurados para a rodada.

## 2. Identidade, entradas e saídas

A entrada canônica é `governance/operational_reports/INDEX.csv`, acompanhada pelos arquivos `governance/operational_reports/OR-*.md`, pelo Blueprint/README da missão aplicável, pela skill Oracle, pela memória arqueológica e pelos artefatos referenciados no OR.

Cada rodada deve registrar versão do worker, commit/estado do código, diretório raiz, data/hora, filtro de missão, limite de itens e modo (`dry-run` ou escrita). A saída mínima por OR é `governance/oracle/reviews/<OR-ID>.md`, sem sobrescrever o OR original. A atualização do índice deve preservar as onze colunas canônicas e ser atômica. Um FOR só pode ser escrito sob os gates da seção 7.

## 3. Fila e elegibilidade

São candidatos somente registros com `status=SUBMITTED` e `oracle_status` igual a `PENDING` ou `IN_REVIEW`, salvo modo de reprocessamento explicitamente documentado. O filtro de missão é opcional, mas recomendado para continuidade segura. ORs inexistentes, duplicados, com índice inconsistente ou já aceitos não devem ser reprocessados silenciosamente.

A fila deve ser ordenada de modo determinístico, preferencialmente por `created_at` e depois por `or_id`, e limitada por `--max` ou configuração equivalente. O worker deve exibir a fila selecionada antes de escrever quando estiver em dry-run.

## 4. Estados e decisões

| Estado/decisão | Significado | Ação permitida |
|---|---|---|
| `PENDING` | OR aguardando análise | candidato à fila |
| `IN_REVIEW` | OR reservado por uma rodada | só o worker com lock pode finalizar |
| `ACCEPTED` | estrutura, proveniência e evidências mínimas verificadas | registrar review; não aprova decisões de negócio |
| `PARTIALLY_ACCEPTED` | revisão estrutural suficiente, mas há ressalvas ou avisos | registrar limitações; não liberar gate dependente sem política explícita |
| `NEEDS_MORE_EVIDENCE` | ausência, inconsistência ou erro impede aceite | registrar falhas; manter missão aberta |
| `BLOCKED` | conflito de autoridade, lock, risco ou dependência externa | preservar estado e escalar |
| `REJECTED` | OR não pode ser aceito no estado atual | não apagar; pedir novo OR/errata |

`ACCEPTED` nunca significa aprovação de tokenomics, oferta, preço, ROI, listing, liquidez, custódia, conformidade, segurança, investimento, runtime ou decisão do responsável. Essas matérias permanecem classificadas como pendentes, hipótese, proposta ou necessidade de revisão profissional conforme as fontes.

## 5. Validações mínimas por OR

Antes de qualquer decisão, o worker deve verificar a existência do arquivo do OR, `or_id`, `task_id`, `status`, `oracle_status`, data/hora e seções mínimas de objetivo, evidências, problemas, escopo/segurança e handoff. Deve verificar que os artefatos locais explicitamente referenciados existem e distinguir URLs externas de caminhos locais.

Falhas de CSV, duplicidade de ID, frontmatter inválido, arquivo ausente, referência local ausente, conflito de lock ou erro de escrita são bloqueantes. Linhas legadas com notas não escapadas não devem ser reinterpretadas silenciosamente; o worker pode preservar o conteúdo em memória e deve registrar a anomalia. Qualquer normalização do CSV deve ser uma alteração separada, revisável e testada.

## 6. Matriz de autoridade

| Ação | Worker pode executar? | Condição |
|---|---:|---|
| Ler ORs, índices, blueprints e artefatos locais | Sim | escopo da rodada |
| Criar review por OR | Sim | após validação e lock |
| Atualizar status/revisão no índice | Sim | atomicidade, schema e histórico preservados |
| Atualizar memória arqueológica | Condicional | apenas aprendizado reutilizável documentado e dentro da autoridade |
| Corrigir erro operacional local | Condicional | evidência suficiente, diff pequeno e validação |
| Alterar skill normativa, política ou permissão | Não por padrão | revisão Oracle e/ou aprovação humana exigida |
| Aprovar tokenomics, oferta, listing, preço, liquidez ou investimento | Não | decisão humana/profissional |
| Executar deploy, exchange, banco externo, outreach ou comunicação | Não | autorização específica separada |
| Criar FOR | Condicional | somente com critérios da seção 7 e sem alegar mais que a evidência suporta |
| Marcar missão `DONE` | Condicional | apenas após FOR válido, tarefas obrigatórias aceitas e gates formais atendidos |

## 7. Geração de FOR e fechamento

O dispatcher só pode gerar FOR quando a rodada tiver cobertura explícita da missão solicitada, os ORs obrigatórios estiverem presentes, cada OR tiver review correspondente, não houver `NEEDS_MORE_EVIDENCE`, `BLOCKED`, `REJECTED` ou `IN_REVIEW` impeditivo e o Blueprint permitir o fechamento. O FOR deve listar ORs, reviews, evidências, limitações, riscos, decisões humanas e critérios não atendidos.

Se qualquer condição falhar, o worker não gera FOR de encerramento. Pode gerar apenas um relatório de estado ou handoff que declare a missão aberta. O worker nunca deve mudar o nome do arquivo da missão para `DONE` apenas porque conseguiu processar arquivos.

## 8. Concorrência, idempotência e falhas

Toda rodada de escrita adquire lock exclusivo em `governance/oracle/.dispatcher.lock`, contendo PID e timestamp. Se o lock existir, a execução falha fechada; remoção de lock stale exige inspeção e comando explícito. Escritas devem usar arquivo temporário no mesmo diretório e rename atômico.

O worker deve ser idempotente. Um OR já revisado não recebe uma segunda review com o mesmo ID sem modo explícito de reprocessamento. Falha no meio da rodada deve deixar reviews e índice consistentes ou preservar o estado anterior; arquivos temporários devem ser removidos com segurança.

## 9. Interface operacional mínima

A interface inicial proposta é:

```text
node scripts/oracle-dispatcher.mjs \
  --repo-root <repo> \
  [--mission MISSION_0019] \
  [--max N] \
  [--dry-run] \
  [--generate-for]
```

`--dry-run` não escreve nenhum arquivo. `--mission` limita a fila. `--max` limita o lote. `--generate-for` só habilita a tentativa de FOR; não ignora critérios. A implementação deve imprimir por OR o ID, decisão, erros, avisos e resultado agregado.

## 10. Handoff e continuidade

Outro agente deve conseguir ler este contrato, assumir uma tarefa da MISSION_0019, reproduzir o dry-run, localizar o protótipo em `scripts/oracle-dispatcher.mjs`, decidir se ele atende ao contrato e publicar OR próprio. As tarefas 19.2–19.7 permanecem independentes e staged até atribuição formal.

## 11. Critério de aceite da tarefa 19.1

A tarefa 19.1 será considerada concluída quando este contrato estiver versionado, o estado da missão e da tarefa estiverem registrados, o OR próprio estiver indexado e o próximo agente tiver uma interface, matriz de autoridade, estados, critérios de FOR, lock, falhas e handoff suficientemente explícitos para implementar e testar sem depender deste chat.
