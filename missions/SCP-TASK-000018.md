# Restaurar interação real entre operador e Sofia no painel de mensagens

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo preserva a proveniência e o contexto da missão.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000018 |
| taskId | 18 |
| source | SofiaControlPanel interface |
| creator | info@meshwave.com.br |
| creatorType | user |
| status | PROGRESS |
| statusId | 2 |
| priority | Crítica |
| priorityId | 4 |
| parentTaskId |  |
| githubPath | missions/SCP-TASK-000018.md |
| mirroredAt | 2026-11-13T02:49:45Z |

## Objective

Corrigir a comunicação do terminal de mensagens do SCP para que uma mensagem enviada pelo operador seja persistida, encaminhada ao serviço de IA, respondida pela Sofia e exibida na mesma interface web.

## Acceptance criteria

- [ ] `messages.create` valida o acesso à missão e persiste a mensagem do operador.
- [ ] O procedimento chama o serviço LLM com o contexto da missão e das mensagens recentes.
- [ ] A resposta da Sofia é persistida como mensagem vinculada à mensagem do operador.
- [ ] A interface exibe claramente operador, Sofia, estado de processamento e falha de processamento.
- [ ] O schema do Supabase e o schema Drizzle possuem a marcação `isAssistant`.
- [ ] Testes, typecheck e build passam antes do fechamento.
- [ ] O espelho GitHub e o registro Supabase permanecem vinculados por `missionKey` e `githubPath`.

## Synchronization contract

- Supabase project: `ufylccbdjfzydbwhpmpp`
- Supabase task ID: `18`
- GitHub path: `missions/SCP-TASK-000018.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
