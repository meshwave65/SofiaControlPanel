# Índice canônico de missões e tarefas

Este repositório contém duas séries diferentes de registros, além de artefatos históricos. Elas não devem ser somadas como se fossem a mesma tabela.

## 1. Onde cada coisa é salva

| Camada | Fonte de verdade | Local no GitHub | Quantidade atual | O que representa |
| --- | --- | --- | ---: | --- |
| Missões operacionais do painel | Supabase `sofia.tasks` | `missions/SCP-TASK-XXXXXX.md` | 29 registros, maior ID 31 | Tarefas/missões operacionais do SofiaControlPanel, incluindo relações pai-filho. |
| Missões de governança | Documentação versionada | `governance/missions/<ID>/` | 27 IDs, 0001–0027 | Programas de trabalho, blueprints, gates, checkpoints e continuidade. |
| Snapshots legados de governança | Histórico Git | raiz, `MISSION_*.md` | 47 arquivos | Cópias/status históricos mantidos por compatibilidade e rastreabilidade; não são missões novas. |
| Artefatos de missão | Git | dentro de `governance/missions/<ID>/` | 115 arquivos | Blueprints, progresso, tarefas, checkpoints, evidências e relatórios. Não são missões adicionais. |

## 2. Missões operacionais do Supabase

A série `SCP-TASK-*` é o espelho executável do painel. O Supabase é a fonte operacional; o GitHub registra contexto, proveniência e estado espelhado. A hierarquia documentada inclui:

- Raízes: `2`, `3`, `7`, `12`, `16`, `17`, `18`, `25` e `27`.
- Filhas de `3`: `4`, `5` e `6`.
- Filha de `7`: `8`.
- Filhas de `6`: `9`, `10` e `11`.
- Filhas de `12`: `13`, `14` e `15`.
- Filhas de `18`: `19`, `20` e `21`.
- Filhas de `17`: `22`, `23` e `24`.
- Filha de `25`: `26`.

Os dados atuais do banco registram 29 tarefas operacionais e maior ID 31. Alguns registros ainda possuem sincronização pendente ou caminho GitHub ausente; não declarar sincronização integral sem reconciliação. Consulte [`missions/README.md`](missions/README.md) para o contrato operacional.

## 3. Missões de governança

A numeração `MISSION_0001`–`MISSION_0027` é uma série documental distinta da numeração `SCP-TASK-*`. A localização canônica atual é:

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
| 0024 | DONE — publicada em produção | `governance/missions/0024/README.md`, `BLUEPRINT.md`, `TASKS.md`, `PROGRESS.md` |
| 0025 | STAGED — aguardando aprovação humana do TR | `governance/missions/0025/README.md`, `TR-v0.1.0-DRAFT.md`, `TASKS.md`, `PROGRESS.md` |
| 0026 | PROGRESS — TR VALIDATED, Blueprint READY, tarefa operacional SCP-TASK-000027 em prioridade CRÍTICA | `governance/missions/0026/README.md`, `TR-v0.1.0-APPROVED.md`, `BLUEPRINT.md`, `TASKS.md`, `PROGRESS.md` |
| 0027 | STAGED — TR DRAFT; aguardando validação humana | `governance/missions/0027/README.md`, `TR-v0.1.0-DRAFT.md`, `BLUEPRINT.md`, `TASKS.md`, `PROGRESS.md`, `INITIAL-ASSESSMENT.md` |

Os arquivos da raiz continuam versionados por compatibilidade histórica. Eles não devem ser apagados nem tratados como novas missões. Quando houver `governance/missions/<ID>/README.md` ou `BLUEPRINT.md`, esses documentos governam a continuidade da missão; os arquivos da raiz são snapshots/legado.

## 4. Regra para não voltar a gerar a confusão

- Criar/alterar tarefa operacional: usar `sofia.tasks` pelo SofiaControlPanel; o espelho correspondente fica em `missions/SCP-TASK-XXXXXX.md`.
- Criar/alterar missão de governança: criar/atualizar `governance/missions/<ID>/` e seus documentos; não criar outro arquivo solto na raiz, salvo manutenção histórica explícita.
- Arquivos `MISSION_* - TASKS` são quadros de tarefas da missão de governança, não missões adicionais.
- Relatórios, checkpoints e documentos dentro de `governance/missions/<ID>/` são artefatos, não novos IDs de missão.
- Não misturar `SCP-TASK-*` com `MISSION_####`: são namespaces diferentes, com fontes de verdade diferentes.
