# Restabelecimento da confiabilidade operacional e integridade do SCP

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é o espelho versionado de proveniência e contexto.

## Metadata

| Campo | Valor |
|---|---|
| missionKey | SCP-TASK-000051 |
| taskId | 51 |
| governanceMission | MISSION_0028 |
| source | SofiaControlPanel interface |
| creator | user:1425 |
| creatorType | user |
| status | PAUSED (gênese documental concluída; aguardando despacho) |
| priority | Crítica |
| parentTaskId | — |
| githubPath | missions/SCP-TASK-000051.md |

## Description

Transformar a auditoria operacional do SCP de 20/11/2026 em correções verificáveis: diagnosticar/corrigir falha `invalid api key` no runtime; revalidar e corrigir RLS/exposição de dados pessoais na MW-Ex; conciliar banco e documentação; diagnosticar SCP-TASK-000024 e 000029 em FAIL; revisar PRs/rollouts MISSION_0020 e 0023; revisar fila STAGED/PAUSED; executar testes integrados e publicar FOR. TR v1 VALIDATED e Blueprint READY. Execução autônoma autorizada dentro dos limites de segurança, privacidade, integridade financeira e gates humanos preservados.

## Synchronization contract

- Supabase task ID: `51`
- GitHub path: `missions/SCP-TASK-000051.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.