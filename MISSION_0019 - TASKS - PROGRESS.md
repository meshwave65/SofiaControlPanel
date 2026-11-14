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
| 19.3 | Implementar atualização atômica do índice, locks e recuperação | DONE | Manus (sandbox) | Patch por spans preserva bytes; anomalias hashadas; lock/manifesto/recovery fail-closed exercitados em fixtures; OR-20261109-0001 pendente de Oracle |
| 19.4 | Implementar geração condicional de FOR e integração de missão | PROGRESS | Manus (sandbox) | FOR só é produzido quando cobertura/aceite permite; missões incompletas permanecem abertas com pendências explícitas |
| 19.5 | Testar o dispatcher com fixtures, ORs válidos/inválidos e cenários de falha | PROGRESS | Manus (sandbox:CiTUSQ7F4JHT7xPXz6EUQN) | Testes automatizados reproduzíveis cobrem sucesso, bloqueio, CSV legado, lock, idempotência e ausência de evidência |
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

## Assunção 19.3 — Manus (sandbox), 2026-11-08 23:43 (-03:00)

- Tarefa 19.3 atribuída antes da edição; branch `main`, HEAD base `6923056645369ba55b549d4eef1ca4bcf64e2e94`, sincronizado com `origin/main`, árvore limpa e sem lock ativo do dispatcher.
- OR-20261108-0033 e o contrato 19.1 foram consultados. O índice contém nove linhas legadas com vírgulas não escapadas na coluna de notas; não será feita migração nem correção textual automática como parte da leitura.
- Objetivo desta unidade: definir uma leitura schema-aware que reconheça apenas cauda de notas legadas quando as dez colunas anteriores forem válidas, preserve os bytes das linhas e altere somente campos de estado explicitamente visados; anomalias ambíguas devem continuar bloqueantes.

## Checkpoint 19.3 — preservação lossless e recuperação (2026-11-09)

- Tarefa 19.3 concluída em implementação e validação; a MISSION_0019 permanece `PROGRESS`. OR-20261109-0001 foi criado como `SUBMITTED` / `PENDING` para revisão independente.
- `scripts/oracle-dispatcher.mjs` agora identifica e hash as nove caudas legadas sem reconstruir o CSV; altera somente spans de `oracle_status` e `reviewed_at`. Linhas ambíguas e UTF-8 inválido falham fechadas.
- `scripts/oracle-dispatcher-transaction.mjs` implementa lock exclusivo, journal durável, staging/hash, publicação sem overwrite, índice por último e `--recover` explícito/idempotente. A política completa está em `governance/missions/0019/CSV_LEGACY_PRESERVATION_19_3.md`.
- Validações: 14/14 testes específicos; `pnpm check`; `pnpm test` (3 arquivos/9 testes); `node --check` nos dois módulos; Prettier e `git diff --check` — todos passaram.
- Dry-run real pré-publicação selecionou OR-20261108-0033 como `PARTIALLY_ACCEPTED`, listou nove anomalias e preservou o SHA-256 do índice (`6549c6ceef11c269b1a223dc8c47dcd260770fd80081631cdccf75214686d684`). A linha única do OR-20261109-0001 foi anexada preservando todos os bytes anteriores; dry-run posterior validou o próprio OR como `PARTIALLY_ACCEPTED`, sem erros estruturais, e manteve o SHA-256 `7ec6dca650511d40ebd56e33b5aa913f31aa85584a1e547e0454b2d839dafe02` idêntico antes/depois. Nenhum OR da fila foi escrito.
- 19.4–19.7 permanecem `STAGED`; nenhum FOR foi gerado. Próximo desbloqueio: revisão Oracle deste OR e execução autônoma da próxima tarefa somente após nova atribuição.

## Assunção 19.4 — Manus (sandbox), 2026-11-12

- Tarefa 19.4 atribuída a `Manus (sandbox)` antes de qualquer alteração funcional; branch `main`, base `6bb92df4638ec0e443fa2edcff8f7031a05f0107`, sincronizada com `origin/main`, árvore limpa e sem lock/journal do dispatcher.
- A atribuição concorrente de `MISSION_0020 / 20.3` a `Agente Mateus` foi preservada; nenhuma alteração foi feita nessa missão.
- Dependências 19.1–19.3 consultadas; a tarefa 19.4 estava `STAGED`, sem instância atribuída. Skill específica consultada: `skill-governance-oracle` 1.1.0, commit `35ca3757ae5a6a3e602bcabd754c05f7040c5592`; ciclo do repositório consultado: `operational-task-lifecycle` 0.2.0-DRAFT.
- Escopo: implementar apenas geração condicional e integração de estado; nenhum FOR será criado se cobertura, reviews/aceite ou evidências forem insuficientes. Nenhuma revisão real ou decisão humana será fabricada.

## Assunção 19.5 — Manus (sandbox:CiTUSQ7F4JHT7xPXz6EUQN), 2026-11-12

- Tarefa 19.5 atribuída antes da execução; branch `main`, base `f9a9d4fdf16a191dd197ff01f3ca863962f2d484`, sincronizada com `origin/main`, árvore limpa.
- A tarefa 19.4 permanece atribuída a `Manus (sandbox)` e não foi duplicada nem alterada.
- Dependências 19.1–19.4, o blueprint `governance/missions/0019/BLUEPRINT.md`, a skill `skill-governance-oracle` 1.1.0 (ACTIVE) e o ciclo `operational-task-lifecycle` 0.2.0 (DRAFT) foram consultados.
- Escopo assumido: executar testes reproduzíveis do dispatcher com fixtures válidos/inválidos, bloqueios, CSV legado, lock, idempotência e ausência de evidência; não modificar decisão humana, não executar ação externa e não duplicar trabalho da 19.4.
