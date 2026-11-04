# MISSION_0017 — Indicação, Onboarding Simplificado e Bonificação UMS — PROGRESS

## Identificação
- Objetivo: permitir que cada MeshWalker gere um link pessoal para onboarding minimalista, registrando indicador e aplicando bônus UMS configurável na primeira aquisição com depósito validado.
- Blueprint: governance/missions/0017/BLUEPRINT.md
- Produto: meshwave65/newsite (baseline main; desenvolvimento em branch isolada)
- Estado: PROGRESS
- Retomada: “Prossiga com MISSION_0017 a partir do último OR e checkpoint publicado.”

## Checkpoint inicial — 2026-11-04
A inspeção inicial confirmou a rota /simple no newsite, que corresponde a uma versão antiga: pede username, telefone e documento fiscal opcional, não registra indicação e navega para /. A documentação contábil atual é UMS-first: 1 MWN = 1.000 UMS, até 6 casas decimais; crédito só após validação administrativa do pagamento, com Genesis como origem.

Bloqueio técnico a resolver: create_ums_acquisition exige mwc_meshwalker_profiles, enquanto o onboarding pedido solicita somente nome, email e senha. Investigar requisito fiscal mínimo e posicionamento da coleta sem contornar validação nem coletar dados excessivos.

Nenhum código de produto, schema Supabase, saldo ou blockchain foi alterado. Documentos da missão estão em branch SCP dedicada; PR necessário para publicação em main.

Consulte MISSION_0017 - TASKS - PROGRESS.md para status e próximo passo.
