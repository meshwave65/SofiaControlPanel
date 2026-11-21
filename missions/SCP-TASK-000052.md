# Identidade, autenticação e autorização segura do SCP

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é o espelho versionado de proveniência e contexto.

## Metadata

| Campo | Valor |
|---|---|
| missionKey | SCP-TASK-000052 |
| taskId | 52 |
| governanceMission | MISSION_0029 |
| source | SOFIA conversation — explicit human authorization |
| creator | user:152 |
| creatorType | user |
| status | STAGED |
| priority | Crítica |
| parentTaskId | — |
| githubPath | missions/SCP-TASK-000052.md |

## Description

Definir mecanismo transversal de identidade humana, autenticação forte, gestão de sessão e autorização delegada segura no SCP. Inclui auditoria do fluxo atual; pesquisa de WebAuthn/FIDO2/passkeys, TOTP, OIDC/OAuth 2.1 e avaliação de gov.br; modelo de fatores, sessão, recuperação, expiração e revogação; delegação temporária por cliente, escopo e finalidade; step-up para operações críticas; implementação incremental e testes de segurança.

Missão independente da MISSION_0020 / Unidade 20.4.5. Não inclui consentimento de testes, Messenger, adaptador conversacional ou logs integrais. A MISSION_0020 poderá consumir a interface de autenticação/delegação após aprovação e validação.

A abertura autoriza registro e planejamento, não alterações em runtime, schema, autenticação ativa, produção, merge ou deploy.

## Synchronization contract

- Supabase task ID: 52
- Governance mission: MISSION_0029
- GitHub path: missions/SCP-TASK-000052.md
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.