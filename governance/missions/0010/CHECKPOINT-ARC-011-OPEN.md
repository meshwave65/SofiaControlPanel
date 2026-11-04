# CHECKPOINT — ARC-011 — Abertura

**Data:** 2026-11-03
**Estado:** `PROGRESS`
**Agente:** Manus ARC-PGC Agent
**Blueprint:** `governance/missions/0010/BLUEPRINT-ARC-011.md`
**Base remota:** `bf1cc24`

## Ponto de partida

ARC-001–ARC-010 estão concluídas. O SCP já materializa o relatório ARC automaticamente no `TaskDetail`, usando cinco sinais operacionais e persistindo `arcAssessments`/`arcEvidence` em shadow mode.

## Unidade assumida

ARC-011 adicionará telemetria operacional mínima, perfil de agente como proxy inicial de equipamento, score de confiança `0..100`, snapshots históricos, API protegida e exibição no relatório da tarefa.

## Limites

Não haverá GPS, IP, fingerprint real, bloqueio, `assisted`, `enforced` ou coleta fora do fluxo existente. A primeira unidade usará apenas usuário, agente, tarefa, heartbeat, status, conexão, versão, histórico de sucesso e atividade.

## Próxima ação técnica

Adicionar schema/migration para `arcAccessEvents`, `arcDeviceProfiles` e `arcConfidenceSnapshots`; implementar scorer puro e integrar a criação do assessment para persistir evento/snapshot; depois adicionar endpoint protegido e UI mínima.

## Gate

A migration será versionada e validada localmente antes de qualquer aplicação no Supabase. Aplicação externa do DDL será tratada como gate separado, com validação e registro próprio.
