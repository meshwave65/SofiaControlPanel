# MISSION_0033 — Quadro de trabalho

**Estado geral:** PROGRESS  
**Prioridade:** ALTA  
**Modo:** missão de sistema, execução autônoma.

| WP | Tarefa | Estado | Saída |
|---|---|---|---|
| 33.1 | Inventário estrutural completo | PROGRESS | INVENTORY.md |
| 33.2 | Classificação de schemas e tabelas | STAGED | SCOPE-MATRIX.md |
| 33.3 | Pesquisa técnica e estratégia de migração | STAGED | MIGRATION-STRATEGY.md |
| 33.4 | Pacote de migrations e rollback | STAGED | migrations versionadas |
| 33.5 | Aplicação estrutural no Sandbox | STAGED | execução e validação |
| 33.6 | Catálogo de agentes sem segredos | STAGED | contrato e testes |
| 33.7 | RLS, ownership e privacidade | STAGED | políticas e evidências |
| 33.8 | Validação de compatibilidade | STAGED | relatório de conformidade |
| 33.9 | Fechamento e FOR | STAGED | FOR e checkpoint final |

## Despacho operacional criado pelo SCP

| Tarefa | Agente | Estado | Papel |
|---|---|---|---|
| [SCP-TASK-000059](../../missions/SCP-TASK-000059.md) | DINELSON | PROGRESS | Coordenação/inventário |
| [SCP-TASK-000060](../../missions/SCP-TASK-000060.md) | FILIPE | PROGRESS | Análise estrutural |
| [SCP-TASK-000061](../../missions/SCP-TASK-000061.md) | MATEUS | PROGRESS | Análise operacional |
| [SCP-TASK-000062](../../missions/SCP-TASK-000062.md) | DINECY | PROGRESS | Análise estratégica |

As três tarefas filhas foram geradas automaticamente pelo mecanismo de despacho após a ativação da tarefa raiz. Não criar tarefas duplicadas para esses três eixos; consolidar suas entregas na missão.

## Regras de execução

- O trabalho começa pelo inventário e pesquisa, nunca por cópia integral.
- A origem SCP é somente leitura.
- O destino é exclusivamente o projeto Sandbox.
- Não copiar registros de usuários, missões, mensagens, documentos, artefatos ou dados de negócio.
- Não copiar valores de credenciais/configurações.
- Registrar OR para cada unidade concluída.
- Se uma automação não estiver disponível, executar o procedimento manualmente e documentar a evidência.
- Um bloqueio técnico deve ser registrado com causa, impacto e alternativa; não deve ser convertido em pedido de aprovação humana quando a decisão estiver dentro do TR.
