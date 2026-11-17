---
document_type: TF
mission_id: MISSION_0020
status: ACTIVE
tr: TR.md
blueprint: BLUEPRINT.md
---

# MISSION_0020 — Task Framework (TF)

O TF transforma o TR em unidades executáveis e preserva ownership, dependências, locks, evidências e critérios de aceite. O quadro canônico é `MISSION_0020 - TASKS - PROGRESS.md`.

## Unidades atuais

- 20.1 — inventário funcional e fronteira de falha: concluída;
- 20.2 — reprodução controlada: concluída;
- 20.3 — correções e regressões: em execução no quadro remoto;
- 20.4 — auditoria funcional, Messenger e lacunas prioritárias: em execução no quadro remoto;
- 20.5 — validação integrada e eventual smoke test autorizado: staged;
- 20.6 — operação, observabilidade, revisão e handoff: staged.

Nenhuma unidade deve ser assumida sem reconciliação de branch, lock e ownership. Cada unidade exige seu próprio OR; o FR-DRAFT consolida os ORs sem substituí-los.
