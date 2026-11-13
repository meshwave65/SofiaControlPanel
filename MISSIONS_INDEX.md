# Índice canônico de missões e tarefas

Este repositório contém **duas séries diferentes de registros**, além de seus artefatos históricos. Elas não devem ser somadas como se fossem a mesma tabela.

## 1. Onde cada coisa é salva

| Camada | Fonte de verdade | Local no GitHub | Quantidade atual | O que representa |
| --- | --- | --- | ---: | --- |
| Missões operacionais do painel | Supabase `sofia.tasks` | `missions/SCP-TASK-XXXXXX.md` | 15 registros, IDs 2–16 | Tarefas/missões criadas ou materializadas pelo SofiaControlPanel, incluindo relações pai-filho. |
| Missões de governança | Documentação versionada | `governance/missions/<ID>/` quando existe | 23 IDs, 0001–0023 | Programas de trabalho, blueprints, gates, checkpoints e continuidade. |
| Snapshots legados de governança | Histórico Git | raiz, `MISSION_*.md` | 47 arquivos | Cópias/status históricos mantidos para preservar links e rastreabilidade. Não são 47 missões novas. |
| Artefatos de missão | Git | dentro de `governance/missions/<ID>/` | 92 arquivos | Blueprints, progresso, tarefas, checkpoints, evidências e relatórios. Não são missões adicionais. |

## 2. Missões operacionais do Supabase

A série `SCP-TASK-*` é o espelho executável do painel. O Supabase é a fonte operacional; o GitHub registra contexto, proveniência e estado espelhado. A hierarquia atual é:

- Raízes: `2`, `3`, `7`, `12` e `16`.
- Filhas de `3`: `4`, `5` e `6`.
- Filha de `7`: `8`.
- Filhas de `6`: `9`, `10` e `11`.
- Filhas de `12`: `13`, `14` e `15`.

Todos os 15 registros possuem `missionKey`, `githubPath`, `githubSha` e `githubSyncStatus='synced'` no Supabase. Consulte [`missions/README.md`](missions/README.md) para o contrato operacional.

## 3. Missões de governança

A numeração `MISSION_0001`–`MISSION_0023` é uma série documental distinta da numeração `SCP-TASK-*`. A localização canônica atual é:

| ID | Estado/documento canônico | Local principal |
| ---: | --- | --- |
| 0001 | DONE histórico | `MISSION_0001 - ... - DONE.md` na raiz |
| 0002 | snapshots DONE/PROGRESS; histórico com versões conflitantes | arquivos `MISSION_0002 - ...` na raiz |
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
| 0018 | PROGRESS documental; 18.1–18.9 preservam fechamento preliminar | `governance/missions/0018/README.md` e `BLUEPRINT.md` |
| 0019 | PROGRESS | `governance/missions/0019/BLUEPRINT.md` + artefatos |
| 0020 | PROGRESS | `governance/missions/0020/BLUEPRINT.md` + snapshot legado |
| 0021 | PROGRESS | `governance/missions/0021/BLUEPRINT.md` + artefatos |
| 0022 | STAGED | `governance/missions/0022/README.md`, `BLUEPRINT.md`, `TASKS.md` |
| 0023 | PROGRESS | `governance/missions/0023/README.md`, `BLUEPRINT.md`, `TASKS.md` |

Os arquivos da raiz continuam versionados por compatibilidade histórica. Eles não devem ser apagados nem tratados como novos registros. Quando houver `governance/missions/<ID>/README.md` ou `BLUEPRINT.md`, esses documentos governam a continuidade da missão; os arquivos da raiz são snapshots/legado de execução anterior.

## 4. Regra para não voltar a gerar a confusão

- Criar/alterar uma tarefa operacional: usar `sofia.tasks` pelo SofiaControlPanel; o espelho correspondente fica em `missions/SCP-TASK-XXXXXX.md`.
- Criar/alterar uma missão de governança: criar ou atualizar `governance/missions/<ID>/` e seu blueprint/README; não criar outro arquivo solto na raiz, salvo manutenção histórica explícita.
- Arquivos `MISSION_* - TASKS` são quadros de tarefas da missão de governança, não missões adicionais.
- Relatórios, checkpoints e documentos dentro de `governance/missions/<ID>/` são artefatos, não novos IDs de missão.
- Não misturar `SCP-TASK-*` com `MISSION_####`: são namespaces diferentes, com fontes de verdade diferentes.
