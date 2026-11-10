# MISSION_0021 — TASKS — PROGRESS

**Missão:** 0021 — MW-Ex Proprietária Funcional e Autônoma  
**Projeto:** SofiaControlPanel / MeshWave  
**Data de criação:** 2026-11-10  
**Blueprint:** governance/missions/0021/BLUEPRINT.md

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 21.1 | Reconciliar arquitetura e estado real da MW-Ex, carteira interna, contratos, dados e deploys | PROGRESS | ChatGPT | Matriz requisito→tela/API/ledger/dado; distinguir placeholder, operação real, hipótese e dependência; nenhuma consulta ou escrita fora do escopo |
| 21.2 | Fechar o modelo funcional mínimo e os gates econômicos | STAGED | — | Fluxos de conversão/transferência, fonte MWN, liquidez/contraparte, cotação, arredondamento e tratamento Genesis documentados; decisões pendentes encaminhadas ao responsável |
| 21.3 | Especificar isolamento de acesso, carteiras, ledgers e ponte UMS↔MWN | STAGED | — | Acesso MeshWalker-only, autorização, razão independente, controles e contrato da ponte sem saldo compartilhado ou transferência implícita |
| 21.4 | Implementar razão MW-Ex e transações seguras | STAGED | — | Saldo MWN e histórico por usuário; transferências e conversões explícitas, idempotentes, atômicas e sem gasto duplo |
| 21.5 | Implementar cotações externas e indicadores somente leitura | STAGED | — | Itens aprovados com fonte, horário e frescor; falhas/staleness visíveis; sem cotação fabricada nem negociação externa |
| 21.6 | Construir a interface minimalista da MW-Ex | STAGED | — | Exibe saldo MWN, UMS potencial a 1:1.000, valor verificável de mercado e apenas ações aprovadas; mantém separação visual/contábil |
| 21.7 | Validar segurança, contabilidade, conversões e erros | STAGED | — | Testes cobrem autorização, isolamento, concorrência, idempotência, falha parcial, arredondamento, cotação ausente/desatualizada e ledger |
| 21.8 | Preparar readiness, transição UMS Genesis e handoff | STAGED | — | Cutover somente após auditoria/reconciliação; caminho normal sem compra de UMS definido; operação real permanece atrás de gates |

## Regras de execução

- A missão está PROGRESS porque a tarefa 21.1 foi assumida por ChatGPT conforme GOVERNANCE.md. As tarefas 21.2–21.8 permanecem STAGED.
- 21.1 e 21.2 precedem mudanças de banco, ledger ou UI que assumam política econômica. Não presumir cotação, liquidez ou contraparte já definidas.
- Usar ambientes e ativos sintéticos por padrão. Consulta/alteração de produção, migração Genesis, operação financeira real, liberação a usuários e deploy exigem ambiente e autorização próprios.
- Carteira interna UMS e MW-Ex devem manter saldos/razões separados. Interoperabilidade somente por transação explícita e auditável; sem leitura lateral, saldo compartilhado ou bypass do fundador.
- Toda tarefa assumida, parcial, bloqueada ou malsucedida exige Operational Report próprio, atualização do quadro e handoff.