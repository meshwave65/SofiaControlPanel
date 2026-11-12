# MISSION_0023 — Progresso

**Estado:** PROGRESS  
**Criada em:** 2026-11-12  
**Última atualização:** 2026-11-12

## Resumo

Missão criada como frente corretiva complementar à MISSION_0021. O objetivo é tornar impossível confundir UMS com MWN na interface, nos RPCs, no armazenamento e nos extratos.

## Evidência inicial

- A transação 60847897-ce1d-4cf3-8c30-bf75618d9dea foi consultada em produção, em modo somente leitura.
- Valor confirmado: 462 MWN; débito e crédito iguais a 462 MWN.
- A hipótese de crédito de 4,62 MWN foi corrigida: os registros contábeis mostram 462 MWN no destino.
- Todas as quatro transferências MWN_TRANSFER existentes tinham os dois lados contábeis consistentes.
- A auditoria encontrou zero lançamentos fracionários e zero quantidades fracionárias em transações no estado consultado.
- O contrato da RPC mwex_get_wallet na migration preparada retorna balance_ums e balance_mwn separadamente.

## Estado das tarefas

| Tarefa | Estado | Evidência/observação |
|---|---|---|
| 23.1 | DONE | Auditoria contábil e especificação dos invariantes concluídas; OR-20261112-0066. |
| 23.2 | PROGRESS | UI alterada na PR #24; campos independentes, saldos contextualizados e transferência inteira limitada ao saldo. |
| 23.3 | PROGRESS | Migration na PR #24 reforçada com validações inteiras e constraints de armazenamento; não aplicada em produção. |
| 23.4 | PROGRESS | Extrato MW-Ex e carteira integrada incluem trilha MWN; revisão visual ainda pendente. |
| 23.5 | STAGED | Aguardando build final, testes e validação visual/autenticada. |
| 23.6 | STAGED — GATE HUMANO | Nenhuma autorização de merge, migration ou deploy de produção foi concedida. |

## Artefatos de implementação

- Repositório: meshwave65/newsite.
- PR #24: https://github.com/meshwave65/newsite/pull/24.
- Branch: fix/mwex-auditable-statements.
- Commit de UI: 51fe9962b0c3d9bb8e097b952fc9a666367b0269.
- Commit do extrato da carteira integrada: efe486ae325cff5c868fd10202d212f4e2b41083.
- Commit da migration com enforcement de unidade inteira: d8be351e0967781358bbbad42e51e6e6f497bf87.
- PR #24 está baseada na PR #23; a sequência de rollout permanece documentada no Blueprint.

## Bloqueios e limites atuais

- A compilação Vercel do commit inicial da UI foi READY; o estado do deployment gerado pelo commit SQL mais recente precisa ser confirmado.
- O preview visual anterior foi bloqueado por Vercel SSO; não houve autenticação nem alteração de proteção.
- Migration ainda não aplicada; produção não recebeu mudanças.
- Nenhuma transferência real ou ajuste de saldo foi executado durante a correção.

## Próximo passo

Concluir as tarefas 23.2–23.4, confirmar build e testes, obter validação visual/autenticada em ambiente seguro e somente então apresentar o gate de rollout. A tarefa 23.6 continua bloqueada por autorização explícita.
