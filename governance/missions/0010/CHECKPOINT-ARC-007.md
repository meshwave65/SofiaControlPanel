# CHECKPOINT — ARC-007 — UI mínima de avaliação na tarefa

**Checkpoint:** ARC-007
**Blueprint:** `governance/missions/0010/BLUEPRINT.md` v0.1.0
**Data:** 2026-10-30
**Repositório:** `https://github.com/meshwave65/SofiaControlPanel`
**Branch:** `main`
**Commit de código/UI:** `d759954`
**Checkpoint anterior:** `3ba580c` — ARC-006
**Estado:** ARC-007 concluída; ARC-008 liberada após atualização do quadro e publicação do OR

## Objetivo da unidade

Adicionar à tela de detalhe de tarefa uma UI mínima para consultar, executar e visualizar a avaliação ARC/PGC em `shadow mode`, sem alterar a política de não bloqueio e sem expor metadata sensível das evidências.

## Artefato publicado

- `client/src/pages/TaskDetail.tsx`

A página agora:

- consulta `trpc.arc.getAssessment` para a tarefa atual;
- exibe estado vazio quando ainda não existe avaliação;
- permite executar `trpc.arc.evaluateTask({ taskId })` por meio de “Avaliar tarefa”;
- permite reavaliar uma tarefa já avaliada;
- mostra posterior e prior em percentual;
- mostra decisão `ALLOW`, `REVIEW` ou `DENY` com cor semântica;
- mostra o modo `SHADOW`;
- apresenta a explicação heurística retornada pelo servidor;
- lista sinal, valor, confiabilidade e origem das evidências;
- não renderiza `metadata` de evidências;
- mantém aviso textual de que a avaliação não é autenticação forte.

## Validação

Executado com sucesso após a implementação:

- `git diff --check` — aprovado;
- `pnpm check` — TypeScript sem erros;
- `pnpm test -- --run server/db.test.ts server/auth.logout.test.ts` — 5 testes passaram;
- `pnpm build` — build Vite e bundle do servidor concluídos;
- commit `d759954` confirmado em `origin/main`.

O build emitiu apenas avisos não bloqueantes sobre tamanho de chunk e versão do `baseline-browser-mapping`. A validação não foi executada contra PostgreSQL real nem em navegador autenticado; portanto, a renderização com dados reais e a mutation end-to-end permanecem pendentes de validação de ambiente.

## Limites preservados

- A avaliação continua em `shadow mode`.
- A UI não bloqueia tarefas, muda status, autoriza ações externas ou promove `ALLOW` a autenticação.
- Nenhuma credencial, token, senha, metadata JSONB ou mensagem integral é exibida.
- A UI depende da migration ARC-004 e de uma política ARC habilitada para a avaliação real funcionar em ambiente com banco.

## Próxima etapa exata

### ARC-008 — Validação, fechamento do MVP e handoff final

O próximo agente deve:

1. Confirmar `d759954` em `origin/main` e ler este checkpoint.
2. Ler `MISSION_0010 - TASKS - PROGRESS.md` e o blueprint vigente.
3. Executar a matriz final de validação do MVP, incluindo check, testes, build e revisão dos limites.
4. Verificar separadamente o que foi validado estaticamente e o que ainda depende de PostgreSQL/autenticação reais.
5. Não ativar `assisted` ou `enforced` sem nova autorização e etapa explícita.
6. Publicar o checkpoint final e o Operational Report com `oracle_status: PENDING`.

A frase de retomada permanece: **“Assuma ARC/PGC a partir do painel do SCP.”**