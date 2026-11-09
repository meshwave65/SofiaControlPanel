# MISSION_0019 — TASKS — PROGRESS

**Missão:** 0019 — Oracle Dispatcher e Worker de Governança  
**Projeto:** Projeto Triangulo  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data e hora:** 08/11/2026, 23:13 (-03:00)  
**Blueprint:** `governance/missions/0019/BLUEPRINT.md`

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 19.1 | Especificar contrato, autoridade e modelo de execução do Oracle Dispatcher | DONE | ChatGPT | Contrato CLI/worker, estados, decisões, permissões, lock, idempotência, falhas e handoff documentados |
| 19.2 | Implementar worker determinístico de fila e revisão estrutural de ORs | DONE | Manus (sandbox) | Worker funcional em dry-run/escrita por fixtures; valida OR, frontmatter, artefatos e referências; bloqueia índice legado real sem normalização |
| 19.3 | Implementar atualização atômica do índice, locks e recuperação | STAGED | — | CSV preservado, IDs únicos, concorrência protegida, reexecução segura e falhas recuperáveis |
| 19.4 | Implementar geração condicional de FOR e integração de missão | STAGED | — | FOR só é produzido quando a cobertura/aceite permite; missões incompletas permanecem abertas com pendências explícitas |
| 19.5 | Testar o dispatcher com fixtures, ORs válidos/inválidos e cenários de falha | STAGED | — | Testes automatizados reproduzíveis cobrem sucesso, bloqueio, CSV legado, lock, idempotência e ausência de evidência |
| 19.6 | Documentar operação, segurança, handoff e integração futura | STAGED | — | Guia para outro agente executar/retomar; limites e integração SCP/GitHub Actions claramente separados |
| 19.7 | Revisão cruzada, validação end-to-end e continuidade | STAGED | — | Outro agente reproduz a execução; divergências resolvidas; ORs, índice e backlog atualizados |

## Regras de execução

- Esta missão deve ser assumida antes de qualquer implementação adicional do dispatcher.
- Cada agente assume uma tarefa por vez, registra a instância e atualiza o status antes de editar os artefatos.
- Não editar em paralelo o mesmo arquivo sem lock ou coordenação explícita.
- Toda tarefa, inclusive parcial ou bloqueada, produz Operational Report, evidências e handoff.
- O worker não pode aprovar decisões humanas por inferência nem executar ações externas.
- A conclusão da missão exige validação end-to-end e revisão cruzada; implementação parcial deve permanecer `PROGRESS` ou `BLOCKED` conforme a causa.

## Checkpoint 19.1 — contrato e auditoria de injeções (2026-11-08)

- Contrato 19.1 versionado em `governance/missions/0019/ORACLE_DISPATCHER_CONTRACT_19_1.md`; missão permanece `PROGRESS` e tarefas 19.2–19.7 permanecem `STAGED`.
- Auditoria read-only dos documentos canônicos, ORs de setup, blueprint Oracle e protótipo não encontrou prompt injection confirmado, exfiltração, bypass de aprovação ou execução externa embutida.
- Conteúdo de ORs, artefatos e logs permanece classificado como entrada não confiável; nenhuma instrução encontrada nesses conteúdos foi executada.
- O protótipo `scripts/oracle-dispatcher.mjs` foi reconciliado como trabalho preliminar não aceito. A tarefa 19.2 deve corrigir/testar, no mínimo, idempotência, ordenação determinística, tratamento explícito de CSV legado e gates de cobertura antes de FOR.
- Operational Reports: OR-20261108-0031 (contrato) e OR-20261108-0032 (auditoria/conciliação).

## Assunção 19.2 — Manus (sandbox), 2026-11-08 23:34 (-03:00)

- Tarefa 19.2 atribuída à instância Manus (sandbox) antes de alterações no código; branch `main`, HEAD inicial `c263e3a60487381adbff44e97fb7ead6b8763b94`, sincronizado com `origin/main`, árvore limpa e sem lock de dispatcher.
- A definição verificável da tarefa e o contrato 19.1 foram consultados. O arquivo `scripts/oracle-dispatcher.mjs` mencionado no checkpoint 19.1 não existe no HEAD remoto atual; a implementação será criada conforme o escopo 19.2, sem presumir conteúdo anterior.
- Skills consultadas: `operational-task-lifecycle` 0.2.0 (DRAFT, procedimento obrigatório do repositório) e `skill-governance-oracle` 1.1.0 (ACTIVE), no commit de referência `c263e3a`; blueprint `governance/missions/0019/BLUEPRINT.md`.

## Checkpoint 19.2 — worker de revisão estrutural (2026-11-08)

- Tarefa 19.2 concluída com `scripts/oracle-dispatcher.mjs` v0.1.0 e fixture tests em `scripts/tests/oracle-dispatcher.test.mjs`; dry-run é o padrão, escrita exige `--write` e lock, e não há geração de FOR (tarefa 19.4).
- Validações: `node --check`; 10/10 testes específicos; `pnpm check`; `pnpm test` (3 arquivos, 9 testes); `git diff --check` — todos passaram.
- Dry-run no repo real bloqueou sem escrita em `INDEX.csv`, linha 14: 12 colunas em vez de 11; foram identificadas 9 linhas históricas fora do schema. Não houve normalização automática, review Oracle real, nem atualização do status de OR real.
- OR-20261108-0033 submetido como `PENDING`; ver revisão independente. 19.3–19.7 continuam `STAGED`; 19.3 é o próximo passo para definir preservação/normalização auditável do CSV legado e recuperação de escrita.
