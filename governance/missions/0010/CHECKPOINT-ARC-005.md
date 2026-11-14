# CHECKPOINT — ARC-005 — API tRPC protegida ARC/PGC

**Checkpoint:** ARC-005
**Blueprint:** `governance/missions/0010/BLUEPRINT.md` v0.1.0
**Data:** 2026-10-29
**Repositório:** `https://github.com/meshwave65/SofiaControlPanel`
**Branch:** `main`
**Commit de código:** `e635492`
**Checkpoint anterior:** `governance/missions/0010/CHECKPOINT-ARC-004.md`
**Estado:** ARC-005 concluída; ARC-006 liberada após atualização do quadro SCP e publicação do OR

## Objetivo da unidade

Adicionar a superfície tRPC protegida para registrar, consultar e listar avaliações ARC/PGC, aplicando ownership/admin, mantendo `shadow` como padrão e omitindo metadata de evidência nas respostas públicas.

## Procedures publicadas

- `arc.evaluateTask`: mutation protegida que recebe uma avaliação calculada pelo serviço ARC/PGC, valida tarefa acessível, modo/decisão/evidências e persiste assessment + evidências em transação.
- `arc.getAssessment`: query protegida que retorna a avaliação mais recente de uma tarefa acessível.
- `arc.listAssessments`: query protegida que lista avaliações de uma tarefa com limite entre 1 e 100.

Os helpers de `server/db.ts` usam ownership por `tasks.createdBy` para usuários comuns e acesso global apenas para admin. As respostas removem `metadata` JSONB das evidências para reduzir exposição de dados. As evidências persistem junto da avaliação na mesma transação; assessments não são atualizados nem apagados pela API.

## Limite explícito de integração

O pacote `SofiaARC-PGC` permanece separado do `SofiaControlPanel`; o avaliador Bayesiano e o coletor de ARC ainda não foram importados nesta etapa. Por isso, `arc.evaluateTask` é uma fronteira de persistência protegida para uma avaliação já calculada, não uma alegação de avaliação end-to-end em produção. A integração da coleta/avaliação no ciclo de tarefas pertence à ARC-006. Nenhuma tarefa é bloqueada.

## Validação

Executado com sucesso:

- `pnpm check` — TypeScript sem erros;
- `pnpm test -- --run server/db.test.ts server/auth.logout.test.ts` — 5 testes passaram;
- `git diff --check` — sem erros;
- commit `e635492` confirmado em `origin/main`.

Não houve execução contra banco real nesta etapa; a migration ARC-004 ainda precisa de aplicação autorizada antes de validar requests end-to-end. Os testes desta unidade validam o código existente e a compilação; não há harness de integração tRPC+PostgreSQL configurado no repositório.

## Limitações preservadas

- Não há UI, integração com `SofiaOrchestrator` ou modo enforced operacional.
- O endpoint não deve ser tratado como autenticação forte ou prova de presença.
- A API ainda aceita valores de avaliação calculados pelo chamador protegido; ARC-006 deverá conectar o coletor/motor e impedir que a camada de aplicação dependa de valores arbitrários.
- A API não expõe metadata de evidência, tokens, senhas ou conteúdo integral de mensagens.

## Próxima etapa exata

### ARC-006 — Integração em shadow mode

O próximo agente deve:

1. Confirmar `e635492` no `SofiaControlPanel@origin/main` e os commits `d9df1aa`/`35f6486` no `SofiaARC-PGC`.
2. Ler este checkpoint e o blueprint.
3. Integrar o coletor/avaliador ao ciclo de tarefa somente em `shadow`, carregando tarefa/agente/atividade, calculando avaliação e persistindo via API/serviço interno.
4. Não bloquear tarefas, não ativar `assisted`/`enforced` e não substituir autenticação.
5. Registrar activity log da avaliação e cobrir um fluxo real de teste.
6. Publicar código e checkpoint separados, atualizar o quadro e publicar OR com `oracle_status: PENDING`.
