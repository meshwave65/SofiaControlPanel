# MISSION_0026 — Quadro de tarefas

**Estado geral:** PROGRESS — TR VALIDATED, Blueprint READY  
**Prioridade:** CRÍTICA — nível máximo  
**Tarefa operacional raiz:** SCP-TASK-000027  
**Gate:** análise autorizada; implementação/POC/deploy não autorizados.  
**Índice operacional:** [OPERATIONAL_INDEX.md](./OPERATIONAL_INDEX.md)

| WP | Tarefa | Estado atual | Dependência | Saída |
|---|---|---|---|---|
| 26.1 | Inventariar blockchain, MWN, UMS, MW-Ex, ledger, carteiras e PoUW | PARTIAL — baseline live e reconciliações estruturais concluídos; inventário global complementar pendente | TR + Blueprint | [OR-WP26.1](./operational_reports/OR-WP26.1-2026-11-16.md) |
| 26.2 | Mapear stack Ethereum/EVM, padrões, ferramentas, clientes e infraestrutura | DONE | TR + Blueprint | [OR-WP26.2](./operational_reports/OR-WP26.2-2026-11-16.md) |
| 26.3 | Avaliar PoUW separadamente de consenso e execução EVM | DONE | TR + Blueprint | [OR-WP26.3](./operational_reports/OR-WP26.3-2026-11-16.md) |
| 26.4 | Mapear equivalências e lacunas MeshWave × Ethereum | IN PROGRESS — matriz inicial publicada | 26.1 (baseline suficiente), 26.2, 26.3 | [OR-WP26.4](./operational_reports/OR-WP26.4-2026-11-16.md) |
| 26.5 | Comparar arquiteturas A–F | BLOCKED | 26.4 | Matriz ponderada e análise de sensibilidade |
| 26.6 | Definir arquitetura recomendada e matriz de reaproveitamento | BLOCKED | 26.5 | Arquitetura-alvo e mapa ADOTAR/INTEGRAR/ADAPTAR/MANTER/SUBSTITUIR/NÃO USAR |
| 26.7 | Avaliar impacto econômico, migração, segurança, operação e riscos | BLOCKED | 26.1, 26.5, 26.6 | Análise de impacto e controles |
| 26.8 | Consolidar roadmap, critérios go/no-go e recomendação executiva | BLOCKED | 26.7 | Relatório final submetido ao responsável |

## Execução atual

- WP26.1: 80 blocos/80 transações live no Supabase MeshWave65; 135 lançamentos no ledger de contas; 29 transações MW-Ex e 34 lançamentos. Reconciliação estrutural por hashes/IDs sem órfãos.
- MW-Ex possui funções de ordens, reservas, matching administrativo, fill e liquidação; matching MANUAL_REVIEW, confirmação fiduciária MANUAL_ADMIN, ordens a mercado desabilitadas e zero ordens/fills registrados.
- Replicação MeshWalker não é bloqueador nem escopo desta missão; poderá ser reavaliada apenas se houver necessidade concreta de armazenamento/recuperação de dados off-chain.
- WP26.2 e WP26.3 concluídos.
- WP26.4 iniciado e OR inicial publicado.
- Nenhum agente externo foi despachado e nenhum crédito pago foi consumido.
- SCP-TASK-000027 foi consultada anteriormente como PAUSED, sem agente e githubSyncStatus=pending, divergindo do estado STAGED em documentos. Não alterar status até confirmar que a mudança não dispara execução paga.
- O arquivo espelho missions/SCP-TASK-000027.md ainda não existe.

## Regras de execução

- TR v0.1.0 aprovado; Blueprint v1.0.0 READY.
- Atribuição dinâmica pelo SCP; não fixar agente.
- Cada unidade deve produzir OR próprio com evidências, conclusão e pendências.
- Preservar regras econômicas UMS/MWN/MW-Ex.
- Não presumir estado atual com base em documentos antigos; consultar banco e repositórios diretamente.
- Não alterar código, dados econômicos, contratos, carteiras, chaves, supply, schema ou configuração.
- Não fazer POC executável, transação, migração, deploy nem contratar serviços.
- Correção RLS autorizada limitada a sofia.governanceMissions.
- Qualquer desenvolvimento posterior exige decisão humana, validação de interesse externo e missão/gate próprios.
