# Termo de Referência — MISSION_0033

**Versão:** 1.1.0  
**Estado:** VALIDATED — validação/autorização sistêmica  
**Origem:** solicitação original e decisões complementares explícitas do operador em 2026-11-25.  
**Missão:** MISSION_0033 — Espelhamento estrutural seguro do SCP no Sandbox.

## 1. Objetivo

Preparar e implantar um Sandbox independente e estruturalmente compatível com o núcleo SCP, com identidade central e autorização por ambiente, catálogo seguro de agentes, sessões experimentais descartáveis e expurgo automático de todos os recursos da sessão após encerramento ou expiração. Preparar também o fluxo do SCP para criação e execução autônoma de missões de sistema, sem confirmações intermediárias após os gates documentais e de segurança.

## 2. Ambientes canônicos

| Papel | Projeto | Ref | Conexão |
|---|---|---|---|
| Origem SCP | MeshWave65 | `ufylccbdjfzydbwhpmpp` | MeshWave65 |
| Destino Sandbox | sandbox | `detstgxofjnnggxluqtl` | Primary |

Repositório canônico: `meshwave65/SofiaControlPanel`, branch `main`.

O projeto `rqvjsjfypuojuaetxkig` não é o destino desta missão e está fora do escopo. A origem é somente leitura.

## 3. Identidade e autorização

1. A identidade humana deve ser canônica e central, sem duplicação de autoridade por projeto.
2. Metadados/classificação da identidade definem privilégios e abrangência de ambientes.
3. Identidade classificada exclusivamente como `sandbox` acessa somente o Sandbox e não pode autenticar/acessar o SCP operacional.
4. Identidade `normal_user` pode acessar o SCP conforme autorização e pode acessar o Sandbox voluntariamente quando autorizada.
5. `admin` recebe privilégios administrativos explícitos, limitados ao escopo concedido.
6. O identificador imutável da identidade central é a chave de vínculo; email não é chave de autorização.
7. Não presumir compartilhamento de `auth.users` entre projetos Supabase. Implementar federação OIDC ou mecanismo equivalente com validação criptográfica, issuer, audience, expiração e claims de escopo. Não compartilhar service-role keys nem segredos JWT entre projetos como atalho.
8. Até a federação estar comprovada, manter acesso deny-by-default e não habilitar acesso cross-project.

## 4. Estrutura e dados

1. Inventariar e reproduzir estruturalmente as 25 tabelas do schema `sofia`, incluindo tipos, defaults, constraints, PK/FK, índices, sequences, funções, triggers, views, RLS e grants aplicáveis.
2. Não copiar linhas operacionais de usuários, missões, tarefas, mensagens, documentos, versões, artefatos, logs ou dados de negócio.
3. Não copiar segredos, credenciais, tokens, senhas, chaves ou valores de configuração privada.
4. Não copiar indiscriminadamente schemas gerenciados nem as 66 tabelas heterogêneas do schema `public`; incluir somente dependências SCP comprovadas e registradas na matriz de escopo.
5. Preservar integridade referencial; não remover FKs para contornar diferenças de identidade.
6. Usar migrations versionadas, pequenas, reproduzíveis e com rollback documentado.

## 5. Agentes

1. Separar catálogo/definição de agente da instância executável.
2. Metadados não sensíveis do catálogo SCP podem ser sincronizados em uma única direção SCP→Sandbox.
3. O catálogo não pode expor `manusAccount`, `manusPassword`, `manusToken` ou outros segredos.
4. Instâncias criadas/executadas no Sandbox são locais, editáveis e efêmeras; pertencem a uma sessão.
5. Instâncias Sandbox nunca são sincronizadas de volta ao SCP.
6. Expurgo da sessão elimina todas as instâncias e dados associados, sem remover a definição compartilhada do catálogo.

## 6. Sessões e expurgo

1. Toda execução experimental ocorre em uma sessão identificada por UUID e vinculada à identidade central.
2. A sessão registra início, prazo máximo, encerramento, estado e resultado do expurgo.
3. TTL padrão: 24 horas. Política central pode reduzir esse prazo, nunca permitir que usuário da sessão amplie o limite global.
4. Encerramento explícito ou expiração automática deve disparar o mesmo procedimento server-side de expurgo.
5. Expurgar agentes instanciados, missões, tarefas, mensagens, documentos, versões, relatórios, logs, artefatos e arquivos pertencentes à sessão.
6. Preservar identidade central, permissões, catálogo de agentes, templates, políticas e configurações compartilhadas.
7. Expurgo deve ser isolado por sessão, idempotente, serializado contra concorrência e auditável por metadados mínimos.
8. Não marcar sessão como PURGED até confirmar remoção do banco e Storage. Falhas devem permanecer recuperáveis.
9. Storage deve usar bucket privado dedicado e prefixo imutável por UUID da sessão. Nunca apagar fora do prefixo da sessão.

## 7. Segurança

- RLS e grants deny-by-default até que a federação e o modelo de autorização estejam testados.
- Backend server-side como fronteira de acesso; nunca expor service-role key.
- Testar usuários sandbox-only, normal_user sem permissão Sandbox e normal_user com permissão para ambos os ambientes.
- Testar expurgo manual/automático, idempotência, concorrência, isolamento entre sessões e preservação de recursos compartilhados.
- Nenhuma escrita na origem.
- Não executar exclusão de dados sem vínculo de sessão comprovado.

## 8. Automação de missões

1. O SCP deve poder criar uma missão de sistema, persistir a solicitação original e prosseguir automaticamente por TR, Blueprint, tarefas, execução, ORs e FOR.
2. Para missão de sistema, não exigir aprovação humana intermediária fora de gates explicitamente definidos por segurança/ação externa.
3. Para missão futura com owner humano definido na criação, a única intervenção humana ordinária no painel será a aprovação do TR.
4. A aprovação do TR deve liberar a geração/validação do Blueprint e o despacho conforme os gates técnicos existentes.
5. Missões, tarefas, documentos, versões e relatórios devem permanecer sincronizados entre Supabase e GitHub.
6. Agentes são executores temporários; ownership pertence à missão/identidade designada, não ao agente que executa.
7. Nenhuma automação pode ignorar TR, Blueprint, RLS, autorização, locks, idempotência ou evidência de conclusão.

## 9. Critérios de aceite

- Estrutura das 25 tabelas do núcleo SCP e dependências aplicáveis reproduzida no Sandbox correto.
- Nenhum dado operacional ou segredo copiado.
- Identidade central/federação e matriz de acesso implementadas e testadas.
- Catálogo de agentes sem segredos; instâncias locais vinculadas à sessão.
- Encerramento e expiração removem integralmente dados e arquivos da sessão, preservando outras sessões e recursos compartilhados.
- RLS/Storage e permissões testados com identidades sintéticas.
- Migrations versionadas, rollback e origem intacta.
- Missão de sistema criada pelo SCP executa sem prompts intermediários e fecha com FOR baseado em ORs e evidências.
- Fluxo futuro com owner humano permite somente aprovação do TR como intervenção ordinária de painel.

## 10. Autorização

A MISSION_0033 é missão de sistema e está autorizada para execução autônoma dentro deste TR. Não solicitar confirmações intermediárias para decisões técnicas dentro do escopo. Bloquear apenas ações que possam expor segredos, comprometer dados operacionais, alterar a origem, romper isolamento ou exceder autorização. Resolver escolhas técnicas por evidência, documentação oficial, testes e menor complexidade segura. Registrar qualquer limitação que não possa ser removida com as ferramentas autorizadas.
