# Índice canônico de missões e tarefas

Este repositório contém duas séries diferentes de registros, além de artefatos históricos. Elas não devem ser somadas como se fossem a mesma tabela.

## 1. Onde cada coisa é salva

| Camada | Fonte de verdade | Local no GitHub | Quantidade atual | O que representa |
| --- | --- | --- | ---: | --- |
| Missões operacionais do painel | Supabase `sofia.tasks` | `missions/SCP-TASK-XXXXXX.md` | 54 registros, maior ID 62 | Tarefas/missões operacionais do SofiaControlPanel, incluindo relações pai-filho. O diretório contém 52 arquivos; há diferença de 2 espelhos a reconciliar. |
| Missões de governança | Supabase `sofia.governanceMissions` + documentação versionada | `governance/missions/<ID>/` | 33 IDs, 0001–0033 | Programas de trabalho, blueprints, gates, checkpoints e continuidade. |
| Snapshots legados de governança | Histórico Git | raiz, `MISSION_*.md` | 47 arquivos | Cópias/status históricos mantidos por compatibilidade e rastreabilidade; não são missões novas. |
| Artefatos de missão | Git | dentro de `governance/missions/<ID>/` | contagem histórica a reconciliar | Blueprints, progresso, tarefas, checkpoints, evidências e relatórios. Não são missões adicionais. |

## 2. Missões operacionais do Supabase

A série `SCP-TASK-*` é o espelho executável do painel. O Supabase é a fonte operacional; o GitHub registra contexto, proveniência e estado espelhado. A hierarquia documentada inclui:

- Raízes: `2`, `3`, `7`, `12`, `16`, `17`, `18`, `25`, `27`, `32`, `36`, `37`, `38`, `39`, `43`, `44`, `45` e `46`.
- Filhas de `3`: `4`, `5` e `6`; filha de `7`: `8`; filhas de `6`: `9`, `10` e `11`; filhas de `12`: `13`, `14` e `15`.
- Filhas de `18`: `19`, `20` e `21`; filhas de `17`: `22`, `23` e `24`; filha de `25`: `26`.
- Filhas de `27`: `29`, `30` e `31`; filhas de `37`: `40`, `41` e `42`; filhas de `46`: `47` e `48`.
- Filhas de `59`: `60`, `61` e `62` (análises estrutural, operacional e estratégica da MISSION_0033).

O Supabase mantém `githubPath`, `githubSha`, `githubSyncStatus` e `githubSyncedAt` para rastrear cada espelho. Consulte [`missions/README.md`](missions/README.md) para o contrato operacional.

## 3. Missões de governança

A numeração `MISSION_0001`–`MISSION_0033` é uma série documental distinta da numeração `SCP-TASK-*`. A localização canônica atual é:

| ID | Estado/documento canônico | Local principal |
| ---: | --- | --- |
| 0001 | DONE histórico | `MISSION_0001 - ... - DONE.md` na raiz |
| 0002 | PROGRESS | snapshots legados na raiz; canonicalPath no Supabase aponta para snapshot legado |
| 0003 | DONE histórico | arquivos `MISSION_0003 - ...` na raiz |
| 0004 | DONE histórico | arquivos `MISSION_0004 - ...` na raiz |
| 0005 | PROGRESS histórico | `MISSION_0005 - ... - PROGRESS.md` na raiz |
| 0006 | DONE histórico | arquivos `MISSION_0006 - ...` na raiz |
| 0007 | DONE histórico | arquivos `MISSION_0007 - ...` na raiz |
| 0008 | DONE histórico | arquivos `MISSION_0008 - ...` na raiz |
| 0009 | PROGRESS | `governance/missions/0009/BLUEPRINT.md` + snapshots legados |
| 0010 | PROGRESS | `governance/missions/0010/BLUEPRINT.md` + checkpoints |
| 0011 | PROGRESS | `governance/missions/0011/BLUEPRINT.md` + snapshot legado |
| 0012 | STAGED | `governance/missions/0012/BLUEPRINT.md` + checkpoint |
| 0013 | PROGRESS | `governance/missions/0013/BLUEPRINT.md` + artefatos |
| 0014 | STAGED/documentação de auditoria em progresso histórico | `governance/missions/0014/BLUEPRINT.md` + artefatos |
| 0015 | DONE histórico | arquivos `MISSION_0015 - ...` na raiz |
| 0016 | DONE histórico | arquivos `MISSION_0016 - ...` na raiz |
| 0017 | STAGED | `governance/missions/0017/BLUEPRINT.md` + snapshot legado |
| 0018 | PROGRESS | `governance/missions/0018/README.md` e `BLUEPRINT.md` |
| 0019 | PROGRESS | `governance/missions/0019/BLUEPRINT.md` + artefatos |
| 0020 | PROGRESS | `governance/missions/0020/BLUEPRINT.md` + snapshot legado |
| 0021 | PROGRESS | `governance/missions/0021/BLUEPRINT.md` + artefatos |
| 0022 | STAGED | `governance/missions/0022/README.md`, `BLUEPRINT.md`, `TASKS.md` |
| 0023 | PROGRESS | `governance/missions/0023/README.md`, `BLUEPRINT.md`, `TASKS.md` |
| 0024 | DONE — publicada em produção | `governance/missions/0024/README.md`, `BLUEPRINT.md`, `TASKS.md`, `PROGRESS.md` |
| 0025 | STAGED — aguardando aprovação humana do TR | `governance/missions/0025/README.md`, `TR-v0.1.0-DRAFT.md`, `TASKS.md`, `PROGRESS.md` |
| 0026 | PROGRESS — TR VALIDATED, Blueprint READY, tarefa operacional SCP-TASK-000027 em prioridade CRÍTICA | `governance/missions/0026/README.md`, `TR-v0.1.0-APPROVED.md`, `BLUEPRINT.md`, `TASKS.md`, `PROGRESS.md` |
| 0027 | PROGRESS — TR VALIDATED v0.1.0, Blueprint READY v1.0.0, tarefa operacional SCP-TASK-000032 STAGED | `governance/missions/0027/README.md`, `TR-v0.1.0-APPROVED.md`, `BLUEPRINT.md`, `TASKS.md`, `PROGRESS.md` |
| 0028 | PROGRESS — registro presente no Supabase; pasta GitHub a reconciliar | `governance/missions/0028/` |
| 0029 | STAGED — registro presente no Supabase; pasta GitHub a reconciliar | `governance/missions/0029/` |
| 0030 | STAGED — registro presente no Supabase; artefatos no Supabase; pasta GitHub a reconciliar | `governance/missions/0030/` |
| 0031 | STAGED — registro presente no Supabase; artefatos no Supabase; pasta GitHub a reconciliar | `governance/missions/0031/` |
| 0032 | STAGED — registro presente no Supabase; artefatos no Supabase; pasta GitHub a reconciliar | `governance/missions/0032/` |
| 0033 | PROGRESS — missão de sistema autônoma; TR VALIDATED, Blueprint READY, OR-0001 e checkpoint inicial | `governance/missions/0033/README.md`, `TR-v1.0.0-VALIDATED.md`, `BLUEPRINT-v1.0.0.md`, `TASKS.md`, `PROGRESS.md`, `OR-0001.md` |

Os registros 0028–0032 foram confirmados no Supabase em 2026-11-25, mas sua presença e integridade no GitHub ainda precisam ser conciliadas. Os arquivos da raiz continuam versionados por compatibilidade histórica; não devem ser apagados nem tratados como novas missões.

## 4. Regra para não voltar a gerar a confusão

- Criar/alterar tarefa operacional: usar `sofia.tasks`; o espelho correspondente fica em `missions/SCP-TASK-XXXXXX.md`.
- Criar/alterar missão de governança: criar/atualizar `governance/missions/<ID>/` e seus documentos; não criar outro arquivo solto na raiz, salvo manutenção histórica explícita.
- Arquivos `MISSION_* - TASKS` são quadros de tarefas da missão de governança, não missões adicionais.
- Relatórios, checkpoints e documentos dentro de `governance/missions/<ID>/` são artefatos, não novos IDs de missão.
- Não misturar `SCP-TASK-*` com `MISSION_####`: são namespaces diferentes, com fontes de verdade diferentes.
