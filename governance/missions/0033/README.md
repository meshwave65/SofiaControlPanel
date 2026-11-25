# MISSION_0033 — Espelhamento estrutural seguro do SCP no Sandbox

**Estado:** PROGRESS — missão de sistema em execução autônoma  
**TR:** [TR-v1.0.0-VALIDATED.md](./TR-v1.0.0-VALIDATED.md)  
**Blueprint:** [BLUEPRINT-v1.0.0.md](./BLUEPRINT-v1.0.0.md)  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)  
**Quadro de trabalho:** [TASKS.md](./TASKS.md)  
**Progresso:** [PROGRESS.md](./PROGRESS.md)  
**Checkpoint inicial:** [CHECKPOINT-0001.md](./CHECKPOINT-0001.md)  
**Tarefa operacional:** [SCP-TASK-000059](../../missions/SCP-TASK-000059.md)

## Objetivo

Estabelecer no projeto Supabase Sandbox uma réplica estrutural controlada e independente do SCP, preservando compatibilidade de schema e disponibilizando o catálogo de agentes de forma dinâmica, sem copiar dados operacionais privados nem revelar credenciais.

## Sistemas envolvidos

- **Origem SCP:** projeto Supabase `ufylccbdjfzydbwhpmpp`, conexão MeshWave65.
- **Destino Sandbox:** projeto Supabase `detstgxofjnnggxluqtl`, conexão Primary.
- **Repositório canônico:** `meshwave65/SofiaControlPanel`.

## Regra central

O Sandbox reproduz a estrutura necessária do SCP, não os dados operacionais do SCP. Catálogo e metadados autorizados de agentes podem ser sincronizados; segredos, dados pessoais, missões reais e conteúdo privado não podem ser copiados.

## Modo de execução

Missão de sistema autorizada para execução autônoma, sem gate de aprovação humana para produzir e validar seus próprios artefatos e executar etapas dentro do escopo. Qualquer risco de exposição de segredos, acesso indevido, perda de dados ou efeito fora do Sandbox exige bloqueio técnico e registro, não uma aprovação humana presumida.

## Estado inicial

Inventário preliminar realizado em 2026-11-25. A origem apresenta 138 tabelas em 10 schemas; o destino ainda não possui as tabelas de aplicação do SCP. O schema `sofia` da origem contém 25 tabelas, RLS habilitado em todas, 22 políticas e 12 eventos de trigger. O schema `public` contém estruturas heterogêneas e avisos de segurança; sua inclusão depende de classificação por finalidade e dependências.

Nenhuma alteração de schema ou cópia de dados foi realizada no checkpoint inicial.
