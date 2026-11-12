# MISSION_0023 — Quadro de tarefas

**Estado da missão:** PROGRESS  
**Missão relacionada:** MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma  
**Regra:** cada tarefa assumida deve produzir seu próprio Operational Report; gates de produção permanecem separados.

| ID | Tarefa | Estado | Instância | Dependência | Critério/saída |
|---|---|---|---|---|---|
| 23.1 | Auditar a ocorrência e consolidar os invariantes UMS/MWN | DONE | ChatGPT | MISSION_0021 / evidência de produção | Transação 462 MWN reconciliada; invariantes, limites e critérios persistidos; sem escrita em produção. OR-20261112-0066. |
| 23.2 | Separar UI de conversão/reconversão e transferência | PROGRESS | ChatGPT | 23.1 | Campos independentes; saldos UMS e MWN visíveis no bloco de conversão; transferência mostra apenas MWN e valida inteiro/saldo. |
| 23.3 | Impor indivisibilidade MWN no backend e armazenamento | PROGRESS | ChatGPT | 23.1 | Transferência, reconversão e crédito administrativo rejeitam frações; constraints impedem atomic units fracionárias no ledger/transações. |
| 23.4 | Completar extratos e rastreabilidade MWN | PROGRESS | ChatGPT | 23.1 | Origem/destino, IDs das carteiras, titular, direção, estado, reversão e transaction ID visíveis nos extratos pertinentes. |
| 23.5 | Validar build, testes, preview e smoke test autenticado | STAGED | — | 23.2, 23.3, 23.4 | Build/testes aprovados; testes de fração/limite/saldo; revisão visual e smoke test com conta autorizada em ambiente seguro. |
| 23.6 | Rollout controlado em produção | STAGED — GATE HUMANO | — | 23.5; PR #23; autorização explícita | PR #23 mergeada; migration aplicada no Supabase canônico; PR #24 mergeada e deploy verificado; nenhum passo sem autorização. |

## Regras de execução

- MISSION_0023 é uma extensão corretiva vinculada à MISSION_0021, mas possui escopo, ORs e critérios próprios.
- Não alterar o status geral da MISSION_0021 nem encerrar a tarefa 21.7 por efeito desta missão.
- UMS e MWN são ativos distintos, em carteiras/ledgers distintos.
- Conversões são explícitas e separadas de transferências.
- Transferências entre usuários são exclusivamente em MWN, em unidades inteiras e limitadas ao saldo da MW-Ex.
- A regra de unidade inteira deve ser garantida pela UI, RPCs e constraints do banco.
- Não fazer transações reais para teste.
- Não aplicar migration, mergear PR ou publicar deploy de produção sem autorização explícita.
- PR #24 depende da PR #23; migration precede o frontend que consome o contrato ampliado.
