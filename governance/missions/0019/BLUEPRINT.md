# Blueprint da Missão 0019 — Oracle Dispatcher e Worker de Governança

**Missão:** `MISSION_0019`  
**Estado:** STAGED  
**Orquestrador:** SofiaControlPanel (SCP)  
**Projeto:** Projeto Triangulo  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data e hora de criação:** 08/11/2026, 23:13 (-03:00)

## 1. Motivação

A MISSION_0018 produziu os artefatos estratégicos da MWN, mas permaneceu em `PROGRESS` porque o SCP não possuía um dispatcher/reviewer Oracle autorizado e executável para processar os Operational Reports, registrar decisões e elaborar o Final Operational Report (FOR). Esta missão cria essa capacidade de forma versionada, rastreável e continuável por diferentes agentes.

O Oracle Dispatcher deve ser um **worker executável por rodada**, não um processo residente obrigatório. Ele deve consumir a fila documental, carregar o protocolo Oracle, validar evidências, escrever revisões individuais, atualizar o índice sem destruir histórico e gerar FOR apenas quando os critérios forem demonstrados.

## 2. Objetivo

Implementar e validar um dispatcher Oracle funcional no repositório SCP, com operação segura em modo dry-run e modo de escrita, lock contra concorrência, revisão rastreável por OR, tratamento de falhas, integração com a fila `governance/operational_reports/INDEX.csv` e geração condicional de FOR.

## 3. Escopo

- Definir contrato de execução CLI e/ou worker do dispatcher.
- Ler a fila de ORs `PENDING`/`IN_REVIEW` de modo determinístico.
- Validar existência de OR, frontmatter, campos obrigatórios, referências locais e artefatos.
- Produzir `governance/oracle/reviews/<OR-ID>.md` com decisão, evidências, limitações e próximo passo.
- Atualizar o índice com atomicidade, idempotência e preservação de histórico.
- Implementar lock e comportamento seguro diante de execução concorrente ou falha parcial.
- Gerar FOR somente quando a cobertura e os critérios da missão permitirem; caso contrário, registrar pendências e manter a missão aberta.
- Integrar testes automatizados, documentação operacional e instruções de handoff.
- Avaliar integração futura com o SCP/tRPC/GitHub Actions somente com autenticação mínima e sem simulação de worker.

## 4. Fora de escopo e limites

- Não aprovar por inferência tokenomics, preço, oferta, listing, liquidez, custódia, investimento, conformidade jurídica, segurança de produção ou decisões do responsável.
- Não marcar OR como aceito sem evidência verificável e decisão rastreável.
- Não sobrescrever OR submetido; usar revisão, errata ou novo OR.
- Não executar outreach, deploy financeiro, alteração de banco, exchange ou comunicação externa.
- Não ativar automação persistente sem autenticação, lock, proteção contra recursão, logs e autorização explícita.
- Não transformar uma validação estrutural determinística em auditoria jurídica, financeira, de segurança ou de runtime.

## 5. Princípios de implementação

1. **Fail closed:** erro, ausência de evidência ou conflito de lock impede aceitação automática.
2. **Read-only first:** dry-run deve reproduzir decisões sem escrever.
3. **Idempotência:** reexecutar um OR já revisado não cria revisão duplicada nem altera histórico.
4. **Proveniência:** cada revisão aponta para OR, commit/estado, arquivos verificados e limitações.
5. **Separação de autoridade:** decisões humanas e mudanças normativas exigem escalada explícita.
6. **Continuidade:** tarefas e artefatos devem permitir retomada por outro agente a partir do repositório.
7. **Observabilidade:** saída CLI, logs e relatórios devem explicar sucesso, bloqueio e falha.

## 6. Entregáveis

- Dispatcher/worker versionado e documentado.
- Testes unitários e de integração local.
- Templates de review/FOR compatíveis com a governança.
- Guia de execução, lock, dry-run, recuperação e handoff.
- Revisões Oracle rastreáveis para ORs de teste.
- FOR de teste ou de missão somente quando os critérios forem atendidos.
- Operational Reports, checkpoints e índice atualizados.

## 7. Critérios de aceite

- Outro agente consegue descobrir a missão, assumir uma tarefa não reivindicada e executar o worker sem depender do histórico de chat.
- Dry-run não altera arquivos e produz decisões reproduzíveis.
- Execução normal usa lock e não permite dois writers simultâneos.
- OR inexistente, frontmatter inválido, referência ausente, CSV inconsistente ou falha de escrita resultam em bloqueio explícito e não em aceitação silenciosa.
- Cada OR processado possui review versionada com decisão, evidências, limitações e autoridade.
- O índice mantém schema, IDs únicos e histórico; OR submetido não é sobrescrito.
- FOR não é gerado quando faltam ORs/evidências/gates obrigatórios.
- `pnpm check`, `pnpm test` e os testes específicos do dispatcher passam.
- Nenhuma decisão humana ou ação externa é fabricada pelo worker.

## 8. Dependências e gates

- `governance/SKILL_ORACLE_ARCHITECTURE.md`.
- `governance/oracle/ORACULO_AGENT_BLUEPRINT.md`.
- `governance/skills/skill-governance-oracle/SKILL.md`.
- `governance/skills/operational-task-lifecycle/SKILL.md`.
- `governance/operational_reports/INDEX.csv`.
- Autorização específica para qualquer integração externa, persistente ou de produção.

## 9. Organização colaborativa

Os artefatos permanentes ficam sob `governance/missions/0019/`; o código operacional fica em `scripts/` ou módulo explicitamente escolhido pela tarefa. Cada tarefa deve ter atribuição registrada antes da execução, OR próprio, commit rastreável e handoff. Em caso de bloqueio, preservar o estado, registrar a causa e deixar a próxima tarefa elegível quando possível.
