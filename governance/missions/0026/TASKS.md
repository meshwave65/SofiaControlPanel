# MISSION_0026 — Quadro de tarefas

**Estado geral:** PROGRESS — TR VALIDATED, Blueprint READY  
**Prioridade:** CRÍTICA — nível máximo  
**Tarefa operacional raiz:** SCP-TASK-000027  
**Gate:** análise autorizada; implementação/POC/deploy não autorizados.

| WP | Tarefa | Estado inicial | Dependência | Saída |
|---|---|---|---|---|
| 26.1 | Inventariar o estado atual de blockchain, MWN, UMS, MW-Ex, ledger, carteiras e PoUW | READY | TR + Blueprint | Matriz de maturidade com evidências atuais |
| 26.2 | Mapear stack Ethereum/EVM, padrões, ferramentas, clientes e infraestrutura | READY | TR + Blueprint | Catálogo de componentes reutilizáveis e limites |
| 26.3 | Avaliar PoUW separadamente de consenso e execução EVM | READY | TR + Blueprint | Análise de segurança, verificabilidade e incentivos |
| 26.4 | Mapear equivalências e lacunas MeshWave × Ethereum | BLOCKED | 26.1, 26.2, 26.3 | Matriz de equivalências e gaps |
| 26.5 | Comparar arquiteturas A–F | BLOCKED | 26.4 | Matriz ponderada e análise de sensibilidade |
| 26.6 | Definir arquitetura recomendada e matriz de reaproveitamento | BLOCKED | 26.5 | Arquitetura-alvo e mapa ADOTAR/INTEGRAR/ADAPTAR/MANTER/SUBSTITUIR/NÃO USAR |
| 26.7 | Avaliar impacto econômico, migração, segurança, operação e riscos | BLOCKED | 26.1, 26.5, 26.6 | Análise de impacto e controles |
| 26.8 | Consolidar roadmap, critérios go/no-go e recomendação executiva | BLOCKED | 26.7 | Relatório final submetido ao responsável |

## Regras de execução

- O TR v0.1.0 está aprovado; o Blueprint v1.0.0 está READY.
- Atribuição dinâmica pelo SCP; não fixar agente.
- WP26.1, WP26.2 e WP26.3 podem ocorrer em paralelo se houver agentes elegíveis e sem duplicidade.
- Cada unidade deve produzir Operational Report (OR) próprio, evidências, conclusão e atualização do índice.
- Preservar integralmente as regras econômicas UMS/MWN/MW-Ex.
- Não presumir estado atual com base em documentos antigos.
- Não alterar código, dados econômicos, contratos, carteiras, chaves, supply, schema ou configuração.
- Não fazer POC executável, transação, migração, deploy nem contratar serviços.
- A correção RLS autorizada limita-se a `sofia."governanceMissions"`.
- A conclusão da análise não autoriza automaticamente desenvolvimento; qualquer POC ou implementação exige decisão e missão/gate próprios, além da validação de interesse externo.
