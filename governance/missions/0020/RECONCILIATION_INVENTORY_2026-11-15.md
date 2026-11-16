# Inventário de reconciliação documental — missões atuais

**Data da auditoria:** 2026-11-15  
**Escopo:** missões de governança MISSION_0009–MISSION_0024 e registros operacionais SCP-TASK-000016–SCP-TASK-000026.  
**Natureza:** auditoria documental retrospectiva; consultas ao GitHub e Supabase em modo somente leitura.  
**Status:** inventário inicial; reconciliação dos documentos ainda não executada.

## 1. Regra de nomenclatura e hierarquia

Há dois namespaces independentes:

- `MISSION_####`: missão de governança, com artefatos canônicos em `governance/missions/<ID>/`.
- `SCP-TASK-######`: tarefa/missão operacional, executável em `sofia.tasks` e espelhada em `missions/`.

Não associar MISSION_0017 à SCP-TASK-000017, nem MISSION_0024 à SCP-TASK-000024, sem vínculo explícito documentado.

## 2. Tipos documentais oficiais encontrados

O catálogo `sofia.missionDocumentTypes` contém:

| Tipo | Finalidade |
|---|---|
| ORIGINAL_REQUEST | Preservar a solicitação/origem original |
| TR | Transactional Report — narrativa viva e versionada da missão |
| BLUEPRINT | Plano operacional derivado de uma versão exata do TR |
| OR | Registro operacional de execução, ocorrências e evidências |
| FOR | Final Operational Report — aprendizado operacional no encerramento |
| ACTION_PLAN | Plano de ação estruturado, sujeito a aprovação explícita |

**FR não consta do catálogo nem das especificações consultadas.** A nomenclatura oficial para relatório final é FOR. Não criar um tipo FR sem definição normativa e decisão explícita.

## 3. Regras normativas determinantes

1. Toda missão precisa de TR inicial antes da execução.
2. Missão de origem humana exige validação explícita do TR antes de iniciar execução.
3. Missão autônoma da SOFIA também exige TR, mas pode prosseguir sem validação humana preliminar dentro dos limites de autonomia.
4. O Blueprint deve apontar para a versão exata do TR que o fundamenta; não pode ampliar seu escopo.
5. Tarefas-filhas são unidades auxiliares, subordinadas ao Blueprint mestre da missão-pai; não recebem TR/Blueprint independentes por padrão.
6. OR registra execução e evidências; TR consolida a narrativa; FOR consolida aprendizados no encerramento.
7. Missões legadas devem receber reconstrução retrospectiva identificada como tal. Motivação não localizada deve ser declarada como não localizada. Reconstrução não pode ser apresentada como documento aprovado antes da execução.
8. Estados técnicos e estados documentais são distintos. Backfill documental não implica reexecutar, reabrir ou alterar status técnico.

Fontes normativas:
- `governance/architecture/MISSION_TR_SPECIFICATION.md`
- `governance/architecture/MISSION_BLUEPRINT_SPECIFICATION.md`
- `governance/architecture/MISSION_DOCUMENT_CATALOG_SPECIFICATION.md`
- `governance/architecture/MISSION_ACTION_PLAN_SPECIFICATION.md`
- `governance/architecture/ACTION_UNIT_EXECUTION_GOVERNANCE.md`
- `AGENTS.md`, `GOVERNANCE.md` e `MISSIONS_INDEX.md`

## 4. Inventário das missões de governança atuais

O status abaixo segue o índice canônico `MISSIONS_INDEX.md`. A presença de arquivos foi conferida na pasta canônica de cada missão.

| Missão | Estado no índice | Artefatos encontrados em `governance/missions/<ID>/` | Lacunas documentais observadas |
|---|---|---|---|
| 0009 | PROGRESS | BLUEPRINT | README, TASKS, PROGRESS e TR não encontrados na pasta canônica; há snapshots legados na raiz. |
| 0010 | PROGRESS | BLUEPRINT, checkpoints ARC e consolidação | TR e README canônico não encontrados; verificar se quadros legados cobrem TASKS/PROGRESS. |
| 0011 | PROGRESS | BLUEPRINT | TR, README, TASKS e PROGRESS canônicos não encontrados. |
| 0012 | STAGED | BLUEPRINT, checkpoint 12.1 | TR e README/TASKS/PROGRESS canônicos não encontrados. |
| 0013 | PROGRESS | BLUEPRINT, checkpoints e materiais de prospecção | TR e README/TASKS/PROGRESS canônicos não encontrados. |
| 0014 | STAGED / auditoria em progresso histórico | BLUEPRINT e artefatos de auditoria científica | TR e README/TASKS/PROGRESS canônicos não encontrados. |
| 0017 | STAGED | BLUEPRINT | TR, README, TASKS e PROGRESS canônicos não encontrados. |
| 0018 | PROGRESS documental | README, BLUEPRINT e derivados ROB | TR e FOR não encontrados; há evidências e ORs globais que precisam ser correlacionados. |
| 0019 | PROGRESS | BLUEPRINT, contrato Oracle e preservação CSV | TR, README, TASKS e PROGRESS canônicos não encontrados. |
| 0020 | PROGRESS | README, BLUEPRINT, TASKS, PROGRESS | TR e FOR não encontrados; possui ORs recentes e decisões persistidas. |
| 0021 | PROGRESS | BLUEPRINT, PROGRESS e especificações MW-Ex | TR, README e TASKS canônicos não encontrados; ORs precisam ser correlacionados. |
| 0022 | STAGED | README, BLUEPRINT, TASKS, PROGRESS | TR inicial não encontrado. |
| 0023 | PROGRESS | README, BLUEPRINT, TASKS, PROGRESS | TR inicial não encontrado. |
| 0024 | DONE / publicada em produção | README, BLUEPRINT, TASKS, PROGRESS | TR e FOR não encontrados; encerramento documentado por OR, mas sem instâncias no catálogo documental. |

As missões 0001–0008 e 0015–0016 constam como históricas/concluídas na raiz do repositório e não foram incluídas no escopo primário desta auditoria de missões atuais. Sua eventual migração histórica deve ser decidida após a primeira rodada.

## 5. Inventário dos registros operacionais no Supabase

Consulta read-only à tabela `sofia.tasks` encontrou os registros 2–26. Consulta read-only às tabelas `sofia.missionDocuments` e `sofia.missionDocumentVersions` encontrou **zero instâncias e zero versões documentais para cada registro de ID 2 a 26**.

Para o recorte mais recente:

| SCP Task ID | Estado técnico observado | Pai | Situação documental |
|---:|---|---:|---|
| 16 | DONE | — | Sem instância documental |
| 17 | PAUSED | — | Sem instância documental; espelho GitHub não configurado |
| 18 | PROGRESS | — | Sem instância documental |
| 19 | DONE | 18 | Sem instância documental |
| 20 | DONE | 18 | Sem instância documental; githubPath ausente |
| 21 | DONE | 18 | Sem instância documental; githubPath ausente |
| 22 | DONE | 17 | Sem instância documental |
| 23 | DONE | 17 | Sem instância documental |
| 24 | FAIL | 17 | Sem instância documental; githubPath ausente |
| 25 | STAGED | — | Sem instância documental |
| 26 | DONE | 25 | Sem instância documental |

A auditoria também confirmou que os tipos documentais já estão cadastrados no catálogo do banco, incluindo TR, BLUEPRINT, OR, FOR e ACTION_PLAN. O catálogo existente não comprova a produção ou vinculação dos documentos às missões.

## 6. Diagnósticos e ressalvas

- A existência de BLUEPRINTs em Git não significa conformidade com o contrato novo: os documentos não registram vínculo verificável a uma versão de TR.
- Os ORs em `governance/operational_reports/` são registros reais e devem ser preservados. A correlação entre cada OR, missão, tarefa, commit e evidência ainda precisa ser auditada antes de gerar documentos consolidados.
- O caso SCP-TASK-000017 / SCP-TASK-000024 já possui OR-20261115-0051 e pai em PAUSED. Esse caso é distinto de MISSION_0017.
- MISSION_0024 está encerrada e publicada; a reconciliação documental deve preservar o resultado e o estado DONE, salvo evidência material em contrário.
- Não há base para declarar que todas as missões precisam ser reexecutadas. A necessidade constatada é de backfill documental, rastreabilidade e reconciliação de estados onde houver inconsistência.

## 7. Plano recomendado de reconciliação

### Fase A — Preservação e preparação
1. Congelar alterações de estado não necessárias durante o backfill.
2. Preservar snapshots legados, ORs, commits, IDs Manus, consumo de créditos e evidências.
3. Correlacionar ORs e artefatos por missão/tarefa antes de produzir sínteses.

### Fase B — Reconstrução por missão
1. Registrar ORIGINAL_REQUEST quando houver fonte original; se ausente, marcar a ausência.
2. Produzir TR retrospectivo com classificação explícita de fatos, declarações, decisões, interpretações, hipóteses e lacunas.
3. Submeter TRs de origem humana à validação do responsável, identificando claramente a natureza retrospectiva.
4. Produzir ou reconciliar Blueprint vinculado à versão exata do TR. Para missão concluída, identificar o plano como reconstrução retrospectiva/as-built, sem liberar execução.
5. Correlacionar ORs existentes e identificar lacunas de evidência.
6. Produzir FOR somente quando o encerramento e a cobertura de evidências permitirem consolidar aprendizados.

### Fase C — Reconciliação técnica
1. Persistir instâncias e versões documentais no catálogo do Supabase e seus espelhos versionados no GitHub, conforme o contrato e a implementação efetivamente disponível.
2. Validar ownership, imutabilidade, versionamento e sincronização.
3. Preservar estados técnicos válidos; reabrir apenas quando evidência demonstrar pendência ou encerramento inconsistente.
4. Bloquear novas execuções de missões humanas sem TR validado e Blueprint vigente, conforme a especificação.

### Fase D — Piloto e expansão
Executar primeiro o piloto de reconciliação em SCP-TASK-000017/000024, por já haver OR de diagnóstico e estado PAUSED. Após validar o método e a estrutura documental, aplicar às demais missões atuais, em lotes pequenos.

## 8. Fora do escopo desta auditoria

- Nenhum status técnico foi alterado nesta auditoria.
- Nenhuma missão foi reexecutada.
- Nenhum dispatch, chamada Manus/LLM ou consumo de créditos foi iniciado.
- Nenhum deploy, migration ou alteração de schema foi realizado.
- Nenhuma versão de TR, Blueprint, FOR ou ACTION_PLAN foi criada nesta etapa.
- Não foi criada uma definição nova para FR.

## 9. Próxima decisão

Confirmar se o artefato referido como “FR” pelo responsável é o FOR oficial (*Final Operational Report*) ou se há uma definição normativa distinta ainda não localizada. Após essa confirmação, aprovar o formato do backfill e iniciar pelo piloto SCP-TASK-000017/000024.
