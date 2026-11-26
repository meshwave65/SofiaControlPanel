# MISSION_0034 — Teste de criação de missão por IA diretamente no GitHub

**Estado:** STAGED — TR inicial aguardando validação humana  
**Origem:** solicitação do operador humano em 2026-11-26  
**TR:** [TR-v0.1.0-DRAFT.md](./TR-v0.1.0-DRAFT.md) — AWAITING_HUMAN_VALIDATION  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)  
**Quadro:** [TASKS.md](./TASKS.md)  
**Progresso:** [PROGRESS.md](./PROGRESS.md)  
**Repositório:** `meshwave65/SofiaControlPanel`, branch `main`

## Objetivo

Comprovar que uma IA externa ao runtime do SCP consegue consultar as instruções canônicas do repositório, criar uma missão de governança coerente com essas instruções e registrar sua existência no GitHub e no Supabase, sem iniciar execução antes da validação humana do TR.

## Escopo do teste

- Ler e aplicar `AGENTS.md`, `GOVERNANCE.md`, as especificações de TR e Blueprint e o catálogo de skills.
- Criar a documentação inicial da missão em `governance/missions/0034/`.
- Registrar a missão em `sofia.governanceMissions`.
- Atualizar os índices canônicos e publicar um commit rastreável em `main`.
- Verificar a correspondência entre o registro do Supabase e os arquivos GitHub.

## Limites

- Esta missão é um teste documental/de integração, não uma autorização para alterar código do SCP.
- Nenhuma tarefa operacional será despachada.
- Nenhuma execução Manus, consumo de créditos, alteração de outras tabelas, migração, mudança de ambiente ou ação externa está autorizada.
- O TR é de origem humana e permanece aguardando validação explícita do operador.
- Não criar Blueprint READY nem liberar execução antes da validação do TR.
- A conclusão do teste comprova somente o fluxo de criação documental e persistência; não comprova que a criação de missões esteja automatizada dentro da interface do SCP.

## Critério de encerramento do teste

A missão poderá ser considerada criada quando:
1. Os documentos iniciais estiverem publicados no caminho canônico do GitHub.
2. O registro correspondente existir em `sofia.governanceMissions`.
3. Os IDs, título, status e caminho canônico coincidirem entre GitHub e Supabase.
4. O commit estiver confirmado em `main`.

A missão permanece STAGED até a validação humana do TR.