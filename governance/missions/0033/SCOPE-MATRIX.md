# SCOPE-MATRIX — MISSION_0033

**Origem canônica:** MeshWave65 / Supabase `ufylccbdjfzydbwhpmpp`, schema `sofia`.
**Destino canônico:** projeto Supabase `detstgxofjnnggxluqtl` (nome `sandbox`, organização Primary), schema `sandbox`.
**Repositório:** `meshwave65/SofiaControlPanel`, branch `main`.

> Correção de roteamento: o projeto `rqvjsjfypuojuaetxkig` pertence ao projeto chamado “meshwave65's Project” na conexão MWN e NÃO é o destino Sandbox desta missão. O projeto `detstgxofjnnggxluqtl` é o projeto chamado “sandbox” na conexão Primary. O projeto de destino correto foi confirmado por listagem de projetos e inventário de tabelas; seu schema `sandbox` ainda não possui tabelas. Nenhuma migration foi aplicada.

## Matriz de objetos

| Objeto | Decisão | Tratamento |
|---|---|---|
| 25 tabelas de `sofia` | INCLUIR | Espelhar estrutura, constraints, índices e dependências necessárias; não copiar registros operacionais. |
| `sofia.agent_catalog_public` | ADAPTAR | Recriar apenas projeção de metadados não sensíveis no Sandbox, depois de validar a política de leitura. |
| `sofia.agents` | ADAPTAR | Separar definição/catálogo de agente de instância executável. Instâncias locais são efêmeras e vinculadas à sessão; nunca retornam ao SCP. |
| `sofia.users` | ADAPTAR | Não copiar usuários. Mapear identidade canônica central para identificador local estável; privilégios e ambientes acessíveis vêm de metadados de identidade/autorização. |
| `auth.users` e `auth.sessions` do projeto de origem | EXCLUIR | Não copiar identidades, credenciais ou sessões do Auth do SCP. A federação/identidade central precisa ser resolvida como contrato de autenticação, sem assumir compartilhamento nativo entre projetos Supabase. |
| `public` (66 tabelas heterogêneas) | EXCLUIR / INVESTIGAR | Não espelhar por nome ou conveniência. Só dependência comprovada do núcleo SCP pode justificar inclusão específica. |
| `storage`, `vault`, `realtime`, `auth`, schemas gerenciados | EXCLUIR | Não copiar schemas internos gerenciados. Criar apenas bucket dedicado e regras necessárias ao Sandbox, sem replicar objetos ou segredos. |
| Dados operacionais de missões/tarefas/documentos/mensagens | EXCLUIR | Não copiar linhas do SCP. |
| Catálogo de parâmetros e tipos documentais | INCLUIR ESTRUTURA | Seed somente de catálogo público/estrutural quando necessário; sem missões ou dados operacionais. |

## Identidade e autorização

- A identidade humana é canônica e central; o projeto Sandbox não deve criar uma identidade humana independente como autoridade primária.
- Classificação/metadados determinam privilégio e abrangência: `sandbox` = somente Sandbox; `admin` = privilégios administrativos explícitos; `normal_user` = SCP conforme autorização e Sandbox opcional.
- Um usuário comum pode entrar voluntariamente no Sandbox para experimentar, sem contaminar dados operacionais.
- Um usuário classificado exclusivamente como Sandbox não pode autenticar nem acessar o SCP operacional.
- O vínculo de usuário deve usar identificador imutável da identidade central, nunca email como chave de autorização.
- Não presumir que projetos Supabase distintos compartilhem `auth.users`; validar o mecanismo de federação antes de habilitar acesso.
- A política de acesso deve ser deny-by-default e testada para ambos os ambientes.

## Sessões e recursos efêmeros

- Toda execução experimental ocorre dentro de uma sessão Sandbox identificada por UUID.
- A sessão tem `started_at`, `expires_at`, `closed_at`, `status` e usuário central proprietário.
- Encerramento explícito ou expiração por tempo máximo aciona expurgo automático e idempotente.
- Agentes instanciados, missões, tarefas, mensagens, documentos, versões, relatórios, logs e arquivos associados à sessão são eliminados.
- A identidade central, permissões, catálogo de agentes, templates e configurações compartilhadas ficam fora do expurgo.
- Agentes de catálogo sincronizados SCP→Sandbox são definições/metadados; instâncias criadas para executar no Sandbox são efêmeras e não sincronizam de volta.
- A limpeza de Storage só pode remover objetos de bucket/prefixo dedicados à sessão.
- Registrar metadados mínimos de auditoria do expurgo (sessão, motivo, timestamps, resultado e contagens), sem reter conteúdo experimental eliminado.
- O TTL padrão será 24 horas, configurável por política central; o limite máximo não poderá ser estendido pelo usuário da sessão.
- Uma tarefa agendada no banco verifica expirações; o encerramento manual deve disparar limpeza imediatamente.

## Destino e estado observado

- Projeto correto: `detstgxofjnnggxluqtl`, status `ACTIVE_HEALTHY`, região `us-west-2`.
- Conexão: `Primary` (`link_6adab3e136a8819196c358a2c03274f4`).
- Inventário: `list_tables` retornou zero tabelas para schemas `sandbox` e `public`.
- O projeto `rqvjsjfypuojuaetxkig` não será alterado por esta missão.
- A origem `ufylccbdjfzydbwhpmpp` permanece somente leitura.

## Critérios de aceite

1. As 25 tabelas e dependências estruturais SCP previstas existem no schema Sandbox, com diff documentado.
2. Nenhum registro operacional nem segredo foi copiado da origem.
3. Identidade central e autorização por ambiente estão implementadas e testadas; usuário sandbox-only não alcança SCP.
4. Usuário normal autorizado pode acessar SCP e, quando permitido, Sandbox.
5. Catálogo de agentes não expõe credenciais; instâncias locais são vinculadas a sessão.
6. Encerramento manual e expiração removem todos os recursos pertencentes à sessão, inclusive arquivos.
7. Limpeza é idempotente, isolada e não remove identidades nem recursos compartilhados.
8. RLS e Storage foram testados com identidades sintéticas e casos positivos/negativos.
9. A missão pode ser criada pelo SCP como sistema, executar autonomamente após o gate documental aplicável, persistir no Supabase e GitHub, e concluir com OR/FOR sem pedir confirmações intermediárias.
10. A missão seguinte poderá ter owner humano definido no momento da criação; a única intervenção humana no painel será a aprovação do TR. Aprovações adicionais só existirão se forem parte explícita de um gate de segurança/ação externa definido no TR.

## Bloqueios técnicos atuais

- O projeto Sandbox correto está vazio; o schema precisa ser criado a partir de DDL verificado.
- O modelo de autenticação central entre projetos Supabase ainda não está demonstrado. Não habilitar acesso nem replicar usuários até provar uma federação segura.
- A auditoria do DDL, grants, RLS, funções e dependências ainda precisa ser fechada. A saída parcial de catálogo não autoriza uma migration integral.
