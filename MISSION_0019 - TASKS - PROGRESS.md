# MISSION_0019 — TASKS — PROGRESS

**Missão:** 0019 — Oracle Dispatcher e Worker de Governança  
**Projeto:** Projeto Triangulo  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data e hora:** 08/11/2026, 23:13 (-03:00)  
**Blueprint:** `governance/missions/0019/BLUEPRINT.md`

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 19.1 | Especificar contrato, autoridade e modelo de execução do Oracle Dispatcher | PROGRESS | ChatGPT | Contrato CLI/worker, estados, decisões, permissões, lock, idempotência, falhas e handoff documentados |
| 19.2 | Implementar worker determinístico de fila e revisão estrutural de ORs | STAGED | — | Worker funcional em dry-run/escrita; valida OR, frontmatter, artefatos, referências e produz review rastreável |
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
