# MISSION_0033 — Progresso

## 2026-11-25 — Abertura e inventário inicial
- Missão de sistema criada e autorizada para execução autônoma.
- Origem confirmada: MeshWave65 Supabase `ufylccbdjfzydbwhpmpp`, schema `sofia`.
- Destino correto confirmado: projeto Supabase `sandbox`, ref `detstgxofjnnggxluqtl`, conexão Primary, região us-west-2.
- Correção crítica: `rqvjsjfypuojuaetxkig` é outro projeto (“meshwave65's Project”) e não deve ser tratado como Sandbox. Consultas anteriores nele não representam o estado do destino desta missão.
- `list_tables` no destino correto, schemas sandbox e public, retornou zero tabelas. Nenhuma alteração de schema ou dado foi realizada.
- Inventário de origem: schema sofia com 25 tabelas, 1 view, RLS nas 25 tabelas, 22 policies, 11 funções e 12 eventos de trigger. DDL completo e dependências ainda em extração/revisão.
- Identificada `sofia.agent_catalog_public` como candidata de catálogo seguro; seu acesso precisa ser validado.
- Publicados SCOPE-MATRIX.md e SANDBOX-SESSION-LIFECYCLE.md.
- Publicado BLUEPRINT-v1.1.0.md com identidade central, matriz de ambientes, distinção catálogo/instância, TTL de 24h e expurgo.
- README corrigido com o projeto de destino real.
- OR-20261125-0002 publicado e indexado. Nenhuma migration, cópia ou exclusão executada.
- Pesquisa oficial Supabase identificou OAuth 2.1/OIDC server e custom OIDC providers como possível base de federação; configuração real ainda não feita.

## Requisitos arquiteturais incorporados
- Usuário sandbox-only não acessa SCP.
- Usuário normal acessa SCP e pode acessar Sandbox se autorizado.
- Identidade canônica central; não copiar auth.users nem confiar em email como chave de autorização.
- Agentes instanciados no Sandbox pertencem à sessão e são efêmeros; catálogo de metadados pode ser sincronizado SCP→Sandbox sem segredos.
- Encerramento manual ou expiração automática dispara expurgo de agentes, missões, tarefas, mensagens, documentos, versões, logs, relatórios e arquivos da sessão.
- TTL padrão: 24 horas, política central pode reduzir e não pode ampliar o máximo.
- Identidade, permissões, catálogo, templates e configurações compartilhadas ficam fora do expurgo.
- Objetivo de automação sistêmica: missões criadas pelo SCP executam sem confirmações intermediárias após os gates documentais; em missão futura com owner humano, a única intervenção de painel será aprovar o TR, exceto gates explícitos de segurança/ação externa.

## Estado atual
- WP33.1: PROGRESS.
- WP33.2: primeira matriz publicada; revisão final depende das tarefas filhas e DDL.
- WP33.3: PROGRESS; pesquisa OIDC e estratégia de migração em andamento.
- WP33.4–33.6: aguardam DDL completo e estratégia.
- WP33.7: arquitetura de sessão publicada; federação e expurgo ainda não implementados.
- WP33.8–33.9: pendentes.
- Nenhuma migration aplicada. Nenhum dado operacional copiado. Origem inalterada.
