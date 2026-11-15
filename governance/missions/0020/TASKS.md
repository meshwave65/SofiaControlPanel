# MISSION_0020 — Quadro de tarefas

**Estado da missão:** PROGRESS  
**Regra:** cada unidade material produz seu próprio Operational Report. O estado deve refletir evidência, não intenção.

| ID | Unidade | Estado | Referência | Saída / critério |
|---|---|---|---|---|
| 20.1 | Inventário funcional e diagnóstico inicial | DONE / histórico | ORs históricos da missão | Inventário e fronteiras iniciais de falha documentados; revalidar quando necessário. |
| 20.2 | Integração e execução externa | DONE / histórico parcial | MISSION_0016 e ORs históricos | Integração Manus existente; validação real ponta a ponta depende de autorização e ambiente de teste. |
| 20.3 | Unidade atribuída a Mateus | PRESERVADA — NÃO ALTERAR | Registro operacional próprio | Fora do escopo desta sequência; não modificar nem assumir. |
| 20.4 | Auditoria e restauração funcional do SCP | PROGRESS | OR-20261115-0043, OR-20261115-0044, PR #15 | Evoluir o SCP como gestor soberano de missões; Messenger, ciclo de vida, coordenação pai/filhas, TR e autonomia em incrementos pequenos e verificáveis. |

## Regras de execução de 20.4

- Manter visão global e planejamento arquitetural coerente.
- Implementar apenas uma etapa funcional por vez; não entregar vários incrementos em lote.
- Mostrar resultado real na UI/comportamento para avaliação do responsável.
- Corrigir pontualmente antes de avançar.
- Cada decisão aprovada deve ser persistida em OR e refletida no progresso.
- Não registrar hipóteses como decisões aprovadas.
- Não fazer merge, deploy, restart, dispatch externo, chamadas reais Manus/LLM ou consumir créditos sem autorização específica.
- Não ampliar AC-023 ou integrações ARC/PGC estacionadas.
- Não alterar 20.3/Mateus.

## Próximo incremento

Inspecionar o estado atual do Messenger em TaskDetail e expor um único fluxo funcional de conversa central com a SOFIA, reutilizando o roteamento já existente na PR #15. Delimitar a alteração depois de inspecionar o código real; não antecipar o restante da arquitetura.
