# MISSION_0033 — Quadro de trabalho

**Estado geral:** PROGRESS  
**Prioridade:** ALTA  
**Modo:** missão de sistema, execução autônoma.

| WP | Tarefa | Estado inicial | Saída |
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

## Regras de execução

- O trabalho começa pelo inventário e pesquisa, nunca por cópia integral.
- A origem SCP é somente leitura.
- O destino é exclusivamente o projeto Sandbox.
- Não copiar registros de usuários, missões, mensagens, documentos, artefatos ou dados de negócio.
- Não copiar valores de credenciais/configurações.
- Registrar OR para cada unidade concluída.
- Se uma automação não estiver disponível, executar o procedimento manualmente e documentar a evidência.
- Um bloqueio técnico deve ser registrado com causa, impacto e alternativa; não deve ser convertido em pedido de aprovação humana quando a decisão estiver dentro do TR.
