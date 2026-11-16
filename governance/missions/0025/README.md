# MISSION_0025 — Cadastro Público Protegido e Isolamento Multiusuário do SCP

**Estado:** STAGED — AGUARDANDO APROVAÇÃO DO TR  
**TR atual:** [TR-v0.1.0-DRAFT.md](./TR-v0.1.0-DRAFT.md)  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)

## Objetivo

Permitir cadastro público protegido no SofiaControlPanel, com isolamento efetivo dos dados e recursos de cada usuário e provisionamento automático de seu espaço de trabalho.

## Regra de início

A missão não pode iniciar implementação até a aprovação explícita do TR pelo responsável. Após a aprovação, o Blueprint será produzido a partir do TR aprovado. Até lá, não executar código, banco, Storage, RLS, autenticação ou deploy e não consumir créditos Manus.

## Diretriz de escopo

Entregar a melhoria funcional pelo caminho mais simples que resolva o problema. Reaproveitar a arquitetura existente. Não transformar a missão em uma reengenharia do SCP, auditoria geral, refatoração ou criação de infraestrutura desnecessária.

## Proposta técnica sob revisão

- Cadastro aberto, protegido contra automação e abuso.
- Isolamento por workspace/usuário aplicado no backend e no banco.
- Um bucket privado compartilhado, com prefixos segregados.
- Repositório central privado para documentos versionáveis, mediado pelo backend.
- Provisionamento idempotente de workspace.
- Administração global restrita ao papel administrativo.

Esses pontos estão descritos no TR como proposta e dependem da aprovação do responsável.

## Estado atual

- Missão registrada em 2026-11-16.
- TR v0.1.0 criado como draft.
- Aprovação humana pendente.
- Blueprint ainda não criado.
- Implementação não iniciada.
- Nenhuma alteração em produção ou consumo de créditos.
