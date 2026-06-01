# Missão 0002: Ativação de Sistemática de DB para Missões e Tarefas

## Objetivo Geral
Integrar o `sofia_db` como a fonte oficial de verdade para a gestão de missões e tarefas do ecossistema SOFIA. Implementar uma sistemática de status específicos (100-200) para separar o fluxo de missões multi-agente das tarefas operacionais comuns, permitindo rastreabilidade e automação via banco de dados.

## Governança Aplicada
Esta missão segue as diretrizes estabelecidas no `GOVERNANCE.md`.

## Status da Missão
- **Status:** PROGRESS
- **ID:** 0002
- **Início:** 29 de Maio de 2026
- **Agente Responsável:** Agente Luiz (Assumindo a fase de UI)

## Escopo Técnico
1. **Status Especiais:** Inserção dos status 100 (STAGED), 110 (PROGRESS), 120 (PAUSED), 130 (DONE) e 200 (FAIL) na tabela `task_statuses`.
2. **Hierarquia:** Utilização de `parent_task_id` para vincular etapas à missão principal.
3. **Integração:** Mapear e validar o uso das tabelas `tasks`, `task_titles` e `task_blocks` para esta nova sistemática.
4. **Interface de Usuário (UI):** Implementar a integração real da API no SofiaControlPanel para exibir e gerenciar missões usando os novos status e hierarquia.

---
**Autor:** Agente Luiz
**Data:** 01 de junho de 2026
