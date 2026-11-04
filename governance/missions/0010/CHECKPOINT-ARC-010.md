# CHECKPOINT — ARC-010 — Integração do relatório ARC no painel

**Data:** 2026-11-03
**Estado:** `DONE`
**Repositório:** `https://github.com/meshwave65/SofiaControlPanel`
**Commits:** `aceb3b3`, `92544d7`

## Objetivo

Fazer o painel de detalhe do SofiaControlPanel materializar automaticamente o primeiro relatório ARC/PGC de uma tarefa, usando o avaliador Bayesiano e as evidências já existentes, sem criar novos detectores nem bloquear a execução.

## Implementação

Foi adicionada a procedure protegida `arc.ensureAssessment`. Ela valida ownership/admin e chama um helper idempotente no banco: se a tarefa já possui assessment, reutiliza o relatório mais recente; caso contrário, executa `evaluateTaskInShadow`, persiste `arcAssessments` e `arcEvidence` e devolve o resultado.

A página `TaskDetail` agora observa a ausência de assessment e dispara automaticamente `ensureAssessment` uma única vez por tarefa. O cartão foi renomeado para `Relatório ARC/PGC` e mostra o estado `Gerando relatório ARC automaticamente...`. O botão `Reavaliar` continua disponível para uma nova avaliação explícita.

## Fluxo final

1. Usuário abre uma tarefa autorizada.
2. O painel consulta `arc.getAssessment`.
3. Se não existir relatório, o painel chama `arc.ensureAssessment`.
4. O backend calcula os cinco sinais ARC atuais: heartbeat, status do agente, correspondência de atribuição, histórico de conclusão e atividade.
5. O assessment e suas evidências são persistidos no Supabase.
6. O painel atualiza e exibe posterior, decisão, modo shadow, explicação e evidências.

## Segurança e limites

A procedure é protegida por ownership/admin. O modo continua `shadow`; `ALLOW`, `REVIEW` e `DENY` são informativos e não bloqueiam tarefas. A integração não adiciona localização, fingerprint, horário atípico ou novos parâmetros comportamentais.

## Validações

`git diff --check`, `pnpm check`, `pnpm test -- --run` e `pnpm build` passaram antes da publicação. A suíte registrou 3 arquivos de teste e 9 testes aprovados. O build produziu a aplicação cliente e o bundle server.

## Continuidade

ARC-010 está concluída. O próximo trabalho pode usar os relatórios persistidos como base para histórico/gráfico, mas não deve reabrir o MVP nem ativar `assisted`/`enforced` sem nova tarefa formal.
