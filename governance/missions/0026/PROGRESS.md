# MISSION_0026 — Progresso

**Estado:** PROGRESS  
**Prioridade:** CRÍTICA — nível máximo  
**Criada em:** 2026-11-16  
**Última atualização:** 2026-11-16

## Aprovação e liberação

- O responsável aprovou expressamente o TR v0.1.0 nesta conversa.
- TR aprovado publicado em `TR-v0.1.0-APPROVED.md`.
- Blueprint v1.0.0 publicado em `BLUEPRINT.md`, estado READY, derivado do TR aprovado.
- Tarefa operacional raiz criada como `SCP-TASK-000027`, prioridade CRÍTICA, estado STAGED.
- Missão de governança atualizada para PROGRESS no Supabase.

## Segurança — correção RLS

Inspeção anterior constatou:
- `sofia."governanceMissions"` estava com RLS desabilitado.
- Não havia policies na tabela.
- Não havia grants para `anon` ou `authenticated`; o schema `sofia` também não concedia USAGE a esses papéis.
- O acesso observado estava limitado ao owner `postgres`.

Correção aplicada por migração `secure_governance_missions_rls`:
- RLS habilitado.
- Política RESTRICTIVE para `anon` e `authenticated`, com `USING(false)` e `WITH CHECK(false)`.
- Nenhum grant ou acesso de cliente foi concedido.
- Nenhuma outra tabela, policy, grant ou dado financeiro foi alterado.

A política restritiva funciona como defesa em profundidade: mesmo que uma policy permissiva seja adicionada futuramente para esses papéis, a restrição continuará negando acesso até ser revista deliberadamente. O acesso backend/admin permanece sujeito ao modelo de privilégios existente.

## Estado documental

- ORIGINAL_REQUEST: preservado.
- TR-v0.1.0-DRAFT: preservado como histórico supersedido.
- TR-v0.1.0-APPROVED: VALIDATED.
- BLUEPRINT v1.0.0: READY.
- TASKS: atualizado com oito work packages e dependências.
- PROGRESS: atualizado.
- RLS migration: aplicada.
- Registro de governança no Supabase: `MISSION_0026`, ID interno 25, status PROGRESS, canonicalPath `governance/missions/0026/`.
- Tarefa operacional: SCP-TASK-000027, prioridade CRÍTICA.

## Execução técnica

Nenhum work package foi concluído ainda. A liberação da missão não equivale à conclusão da análise.

Nenhum contrato, token, carteira, chave, transação, migração econômica, POC executável ou deploy foi iniciado. Nenhum serviço pago foi contratado.

## Próximo passo

Iniciar WP26.1, WP26.2 e WP26.3 conforme disponibilidade de agentes no SCP, sem atribuição fixa. Cada unidade deve produzir OR com evidências e atualizar o índice operacional.
