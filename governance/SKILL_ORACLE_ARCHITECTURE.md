# Arquitetura de Skills, Workers e Oracle — SofiaControlPanel

## Papel do SofiaControlPanel

O SofiaControlPanel é o repositório canônico e o futuro centralizador operacional do ecossistema. Ele mantém o catálogo de skills, as versões distribuíveis, os OperationalReports e as decisões do Oracle.

Um **worker** não é um agente persistente. É uma execução simples que recebe uma tarefa, carrega a skill selecionada, executa o protocolo, produz artefatos e registra um OperationalReport. O nome “Oracle Agent” designa um worker que carrega a skill `skill-governance-oracle`; não exige um processo residente nem uma entidade autônoma permanente.

## Roteamento de tarefas

O painel deve, progressivamente:

1. normalizar a tarefa e seus requisitos;
2. consultar `governance/registry/skills.csv`;
3. selecionar a skill ativa mais específica e sua versão;
4. criar uma nova skill via `skill-creator` quando não houver correspondência adequada;
5. registrar a seleção, o worker, os artefatos e o commit;
6. exigir um OperationalReport antes de concluir a tarefa;
7. disponibilizar ORs pendentes para um worker Oracle.

A primeira implementação pode ser documental e orientada por arquivos. A implementação posterior pode expor esses registros por banco, tRPC e UI, aproveitando as tabelas existentes de tarefas, agentes, mensagens, logs e relatórios.

## Oracle worker

O worker Oracle carrega `governance/skills/skill-governance-oracle/SKILL.md`, varre `governance/operational_reports/INDEX.csv`, abre ORs com `oracle_status` `PENDING` ou `IN_REVIEW`, escreve uma decisão em `governance/oracle/reviews/<OR-ID>.md` e atualiza o índice.

O Oracle nunca altera uma skill silenciosamente. Mudanças aceitas devem ser aplicadas em commit revisável, passar pela validação da skill, receber incremento semântico de versão e indicar como serão medidas em ORs futuros. Mudanças de alto risco exigem aprovação humana.

## Distribuição

A fonte canônica está neste repositório. Skills podem ser copiadas para `/home/ubuntu/skills/` em um ambiente Manus, exportadas como `.skill`, ou instaladas a partir deste repositório em outro ambiente/conta. O diretório local não deve ser tratado como compartilhamento global.

O repositório `network` mantém apenas a integração específica do domínio e aponta para esta fonte canônica. Não foi encontrado um repositório `Rendation` na conta `meshwave65`; quando ele existir, deverá referenciar a mesma origem e versão, evitando forks silenciosos.

## Estrutura canônica

```text
governance/
├── skills/<skill-name>/
├── registry/skills.csv
├── operational_reports/INDEX.csv
├── operational_reports/OR-*.md
└── oracle/reviews/OR-*.md
```
