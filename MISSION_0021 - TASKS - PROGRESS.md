# MISSION_0021 — TASKS — PROGRESS

**Missão:** 0021 — MW-Ex Proprietária Funcional e Autônoma  
**Projeto:** SofiaControlPanel / MeshWave  
**Data de criação:** 2026-11-10  
**Blueprint:** governance/missions/0021/BLUEPRINT.md

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 21.1 | Reconciliar arquitetura e estado real da MW-Ex, carteira interna, contratos, dados e deploys | DONE | ChatGPT | Matriz requisito→tela/API/ledger/dado; distinguir placeholder, operação real, hipótese e dependência; nenhuma consulta ou escrita fora do escopo |
| 21.2 | Fechar o modelo funcional mínimo e os gates econômicos | DONE | ChatGPT | Fluxos de conversão/transferência, fonte MWN, liquidez/contraparte, cotação, arredondamento e tratamento Genesis documentados; decisões pendentes encaminhadas ao responsável |
| 21.3 | Especificar isolamento de acesso, carteiras, ledgers e ponte UMS↔MWN | DONE | ChatGPT | Acesso MeshWalker-only, autorização, razão independente, controles e contrato da ponte sem saldo compartilhado ou transferência implícita |
| 21.4 | Implementar razão MW-Ex e transações seguras | PROGRESS | ChatGPT | Saldo MWN e histórico por usuário; transferências e conversões explícitas, idempotentes, atômicas e sem gasto duplo |
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

## Checkpoint 21.1 — inventário read-only (2026-11-10)

- Inventário persistido em `governance/missions/0021/MWEX_STATE_INVENTORY_21_1.md` a partir de `meshwave65/newsite@3108a5a07059f6bb4263e62460dff92209579c26`.
- Estado comprovado: `/mw-ex` é rota autenticada com preview estático “Em breve”; não consulta preços, não recebe ordens e não executa compra/venda/conversão.
- A carteira integrada lê `mw_account_ledger` e calcula MWN como equivalência derivada de UMS; não foi identificado ledger MWN independente da MW-Ex.
- `ProtectedRoute` verifica sessão, mas a elegibilidade MeshWalker-only e seu enforcement server-side/RLS ainda precisam ser confirmados.
- `src/config.js` centraliza `1 MWN = 1.000 UMS` e uma referência BRL estática; isso não é cotação atual verificável.
- Não foram executados login, consulta autenticada, alteração de banco, migração Genesis, operação financeira, deploy ou mudança de produção.
- OR: `OR-20261110-0036`. Próxima tarefa recomendada: 21.2.

## Checkpoint 21.2 — início do modelo econômico (2026-11-10)

- Tarefa 21.2 assumida por ChatGPT após a conclusão da 21.1.
- Escopo limitado a especificação, gates e encaminhamento de decisões; nenhuma alteração de ledger, banco, UI, cotação ou produção.
- O modelo deve separar referência contábil, preço indicativo e preço executável; não presumir liquidez ou contraparte.

## Checkpoint 21.2 — modelo econômico mínimo (2026-11-10)

- Modelo persistido em `governance/missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md`.
- Fluxos documentados: manter MWN, UMS→MWN, transferência MWN→MWN e MWN→UMS.
- Definida a separação entre referência configurada, cotação indicativa e preço executável.
- Precisão, arredondamento, resíduos, idempotência, liquidez/contraparte e Genesis foram transformados em gates explícitos.
- Oito decisões pendentes foram encaminhadas ao responsável; nenhuma operação real foi autorizada ou executada.
- OR: `OR-20261110-0037`. Próxima tarefa segura: 21.3, especificação de isolamento e ponte.

## Checkpoint 21.3 — início da especificação de isolamento (2026-11-10)

- Tarefa 21.3 assumida por ChatGPT após a conclusão da 21.2.
- Escopo: contrato documental de autorização, carteiras, ledgers, ponte, estados, invariantes e reconciliação.
- Sem alteração de schema, RLS, RPC, saldo, produção, Genesis, deploy ou código do `newsite`.

## Checkpoint 21.3 — isolamento e ponte (2026-11-10)

- Contrato persistido em `governance/missions/0021/MWEX_ISOLATION_BRIDGE_CONTRACT_21_3.md`.
- Definidos domínios separados UMS/MWN, autorização MeshWalker-only em camadas, entidades mínimas, estados da ponte, idempotência, atomicidade, rollback e reconciliação.
- Proibido reutilizar `mw_account_ledger` UMS como ledger operacional MWN ou conceder bypass administrativo.
- Tarefa 21.3 `DONE`; próxima tarefa segura: 21.4, implementação da razão MW-Ex somente em fixture/sandbox autorizada.
- OR: `OR-20261110-0038`.

## Checkpoint 21.4 — implementação sandbox (2026-11-10)

- Protótipo funcional publicado no repositório `meshwave65/newsite`, branch `feat/mwex-sandbox-ledger-21-4`, commit `a673063`.
- Inclui ledger determinístico em memória, conversões UMS↔MWN, transferência MWN→MWN, idempotency keys, precisão controlada, UI funcional e testes Node reproduzíveis.
- A implementação é deliberadamente sandbox-only: não usa Supabase, não lê produção, não cria saldo real e não habilita o ecossistema.
- `npm run test:mwex` e `npm run build` passam. `npm run lint` ainda falha por três erros preexistentes fora dos arquivos MW-Ex (`MwcWallet.jsx` e `vite.config.js`) e duas advertências preexistentes.
- A tarefa 21.4 permanece `PROGRESS` até haver backend persistente, autorização server-side, RLS, concorrência transacional e validação 21.7; OR: `OR-20261110-0039`.
