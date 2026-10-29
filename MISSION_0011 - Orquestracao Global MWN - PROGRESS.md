# MISSION_0011 — Orquestração Global MWN — PROGRESS

## Identificação

- **Missão:** `MISSION_0011`
- **Projeto:** MWN — MeshWave Network Crypto Coin
- **Objetivo:** orquestrar, por projeto, Meeting Prep, Secretary, HH e OCINT/OSINT em ciclo contínuo, mantendo `network` como fonte canônica dos contatos e artefatos.
- **Blueprint:** `governance/missions/0011/BLUEPRINT.md`
- **Repositório canônico de execução:** `https://github.com/meshwave65/network`, branch `main`
- **Sistema de coordenação:** `https://github.com/meshwave65/SofiaControlPanel`, branch `main`
- **Estado:** `PROGRESS`
- **Gatilho curto:** “Prossiga com MISSION_0011 para MWN a partir do último checkpoint remoto.”

## Estado e handoff

A missão foi criada em atendimento à instrução do responsável de 2026-10-28. Seu nome atual é MWN; MWC é o rótulo legado para esta criptomoeda. Isso não implica que as especificações e avaliações antigas de MWC sejam válidas para MWN.

O baseline consultado do `network/main` foi `4f493698796a8d28dd11208238d607a10476a5c9`. Nele, o material do projeto ainda está em caminhos `projects/mwc/`, o blueprint normativo está `DRAFT_FOR_VALIDATION` e não há diretório `projects/mwn/`. `network_master.csv` contém 1.139 registros e `contacts/INDEX.csv` 133 linhas nesse snapshot; reconferir tudo remotamente antes de selecionar contatos.

**Próxima tarefa:** 11.2 — reconciliar a definição de MWN e a fonte da verdade do projeto no `network`, preservando os arquivos legados e evitando migração destrutiva. Até existir blueprint MWN utilizável, não revalidar candidatos para Secretary nem fazer afirmações sobre emissão, preço, liquidez ou operação. Em cada retomada, meeting-first continua obrigatório; qualquer reunião confirmada prevalece e encaminha o contato a Meeting Prep, sujeito às evidências e limites do blueprint.

## Regras rápidas de retomada

1. Ler `SofiaControlPanel/AGENTS.md`, o blueprint desta missão, este handoff, o arquivo de tarefas e a skill indicada pelo catálogo.
2. Sincronizar SCP e `network` com `origin/main`; verificar mudanças, branches, reunião futura, índices, fila, ORs e todos os locks.
3. Não usar MISSION_0009 para prospecção da criptomoeda: sua trilha MWC foi substituída por MWN nesta missão. A parte SOFIA/SWE permanece fora de MISSION_0011.
4. Seguir um contato por vez: Meeting Prep se reunião confirmada; Secretary apenas com autorização explícita; HH para contatos já mapeados sem avaliação MWN; OCINT/OSINT genérico somente após todos os mapeados terem avaliação MWN atual.
5. Atualizar os artefatos canônicos no `network`, liberar lock próprio em commit separado, indexar um OR por unidade no SCP e atualizar este handoff e o quadro de tarefas.

Nenhuma avaliação HH, mensagem, envio, convite ou reunião foi realizada pela tarefa de criação desta missão.
