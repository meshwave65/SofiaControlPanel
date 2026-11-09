# MISSION_0020 — TASKS — PROGRESS

**Missão:** 0020 — Diagnóstico e Restauração Integral das Funcionalidades do SCP  
**Projeto:** SofiaControlPanel  
**Data de criação:** 2026-11-09 04:58 (-03:00)  
**Blueprint:** `governance/missions/0020/BLUEPRINT.md`

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 20.1 | Inventariar funcionalidades, contratos e evidências do runtime; localizar a primeira fronteira de falha | DONE | Manus (sandbox) | Matriz baseline de módulos/ações e hipótese testável; logs/config apenas pertinentes e sanitizados; nenhuma causa conjecturada como fato |
| 20.2 | Reproduzir falha de missão em ambiente local/de teste e fechar causa-raiz do ciclo de execução | PROGRESS | Manus (sandbox) | Reprodução mínima do caminho UI/tRPC, claim/despacho, chamada externa mockada/controlada, polling, persistência e estados; causa ou gate ambiental demonstrado |
| 20.3 | Corrigir causas-raiz confirmadas no fluxo de execução e adicionar regressões | STAGED | — | Correções pequenas, atribuídas e testadas antes/depois; idempotência/concorrência/erros cobertos sem chamada real não autorizada |
| 20.4 | Auditar as funcionalidades do produto constantes do inventário e resolver falhas prioritárias independentes | STAGED | — | Matriz atualizada com PASS/FAIL/BLOCKED/NOT_APPLICABLE por critério e evidência; sem duplicar MISSION_0019 |
| 20.5 | Executar validação integrada e, somente se autorizado, smoke test externo de baixo impacto | STAGED | — | `pnpm check`, `pnpm test`, `pnpm build`, integração repetível; gate externo comprovado ou explicitamente bloqueado |
| 20.6 | Documentar operação/observabilidade, revisar cruzadamente e preparar handoff final | STAGED | — | Checklist sem segredos, procedimento reproduzível, limites e dependências registrados; todos os ORs e índices reconciliados |

## Regras de execução

- A missão permanece `STAGED` até uma instância assumir formalmente. Antes de qualquer edição, reconciliar branch, `origin/main`, árvore, tarefas/locks e dependências, e atualizar missão/quadro conforme `GOVERNANCE.md`.
- Uma instância assume uma tarefa por vez; não editar em paralelo os mesmos arquivos sem coordenação e lock.
- Tarefas 20.1–20.2 precedem correção. Se a análise identificar trabalhos independentes, decompor e atribuir antes de editar. Reordenar só com justificativa registrada.
- Usar testes e ambientes descartáveis por padrão. Chamada real Manus, consumo de crédito, alteração de dados ou deploy exigem autorização específica e ambiente aprovado.
- Não assumir nem duplicar tarefas da MISSION_0019; dependências/interseções devem ser documentadas e coordenadas.
- Cada tarefa concluída, parcial, bloqueada ou malsucedida requer Operational Report próprio, atualização do quadro e handoff conforme `AGENTS.md`.
