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

## Execution evidence

- Implementação publicada no commit `06be92e0c741873c25135909bba935ddd3845539`.
- `pnpm check`: aprovado.
- `pnpm build`: aprovado.
- `pnpm test`: 20 testes aprovados e 1 falha preexistente no teste de fatoração do orquestrador; a falha não percorre o fluxo de mensagens desta missão.
- Migration aplicada no Supabase: `add_assistant_flag_to_messages`.
