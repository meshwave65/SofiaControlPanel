# Blueprint — MISSION_0033

**Versão:** 1.1.0  
**Estado:** READY — revisão arquitetural incorporada à missão de sistema  
**TR base:** TR-v1.0.0-VALIDATED.md  
**Revisão:** decisões complementares do operador em 2026-11-25, registradas em SCOPE-MATRIX.md e SANDBOX-SESSION-LIFECYCLE.md.

## Alvo confirmado

- Origem: Supabase MeshWave65 `ufylccbdjfzydbwhpmpp`, schema `sofia`, somente leitura.
- Destino: Supabase projeto `sandbox` `detstgxofjnnggxluqtl`, schema `sandbox`, conexão Primary, região `us-west-2`.
- Repositório: `meshwave65/SofiaControlPanel`, branch `main`.
- O projeto `rqvjsjfypuojuaetxkig` não é alvo desta missão.

## Arquitetura normativa

1. **Identidade:** identidade humana canônica e central; classificação e metadados definem privilégios, escopo e ambientes. Usuários sandbox-only não acessam SCP; usuários normais podem acessar SCP e Sandbox conforme autorização; admins recebem apenas privilégios administrativos explicitamente concedidos.
2. **Autenticação:** projetos Supabase distintos não compartilham automaticamente `auth.users`. O mecanismo de federação deve ser validado com documentação e prova de integração. Não copiar usuários nem habilitar acesso cross-project por email, service key exposta ou JWT não validado.
3. **Agentes:** separar catálogo/metadados de agentes de instâncias executáveis. Catálogo seguro pode ser espelhado SCP→Sandbox, sem credenciais. Instâncias criadas no Sandbox são efêmeras, vinculadas a sessão e nunca sincronizadas de volta.
4. **Sessões:** toda sessão possui UUID, identidade central, início, expiração, encerramento e estado. TTL padrão 24h, com política central que pode reduzir, nunca ampliar o máximo global.
5. **Expurgo:** encerramento explícito e expiração automática disparam o mesmo procedimento idempotente. Remover agentes instanciados, missões, tarefas, mensagens, documentos, versões, relatórios, logs e arquivos da sessão. Preservar identidade, permissões, catálogo, templates e configurações compartilhadas.
6. **Storage:** bucket privado dedicado, prefixo imutável por UUID de sessão; nenhuma exclusão fora do prefixo da sessão.
7. **Segurança:** deny-by-default, RLS e grants mínimos, backend server-side como fronteira de autorização até que a federação esteja validada. Nunca expor service-role key.
8. **Persistência da missão:** toda missão e seus artefatos devem ter estado correspondente no Supabase e GitHub; execução autônoma após os gates documentais.

## Work packages

| WP | Unidade | Resultado obrigatório |
|---|---|---|
| 33.1 | Inventário detalhado | DDL, dependências, constraints, índices, funções, triggers, views, RLS, grants e Storage |
| 33.2 | Escopo | SCOPE-MATRIX.md; 25 tabelas sofia classificadas; exclusão de schemas alheios |
| 33.3 | Pesquisa/arquitetura | MIGRATION-STRATEGY.md, incluindo autenticação central/federação e documentação oficial |
| 33.4 | Migrations | pacote versionado, ordem de dependências, rollback |
| 33.5 | Estrutura Sandbox | 25 tabelas e objetos aplicáveis no projeto correto; zero dados operacionais copiados |
| 33.6 | Agentes | catálogo seguro, separação template/instância, sincronização unidirecional e proteção contra sobrescrita |
| 33.7 | Identidade, sessões e privacidade | identidade central, escopos, RLS, sessões, TTL e expurgo de DB/Storage |
| 33.8 | Validação | testes de compatibilidade, isolamento, expurgo manual/automático e não-vazamento |
| 33.9 | Fechamento | ORs, checkpoint, FOR, sincronização Supabase/GitHub e prova do fluxo autônomo |

## Sequência de expurgo

- Sessão encerrada: marcar CLOSING e executar purge no servidor imediatamente.
- Sessão vencida: job periódico identifica `expires_at <= now()` e executa o mesmo purge.
- Concorrência: lock por sessão; operação idempotente.
- Banco: exclusão explícita por `session_id` e relações; não confiar apenas em cascata implícita.
- Storage: remover somente objetos do bucket dedicado e prefixo da sessão.
- Auditoria: preservar somente sessão, motivo, timestamps, resultado e contagens; não preservar payloads experimentais.
- Marcar PURGED somente depois de confirmar banco e Storage. Falha parcial mantém estado recuperável e reprocessável.

## Critérios de aceite

- 25 tabelas e dependências estruturais compatíveis, sem dados operacionais copiados.
- Origem inalterada.
- Identidade central e matriz de acesso testadas com identidades sintéticas.
- Catálogo sem segredos; instâncias de agente efêmeras.
- Expurgo manual e automático comprovados para todos os recursos de uma sessão, preservando outras sessões e recursos compartilhados.
- RLS/Storage deny-by-default e testes positivos/negativos.
- Missão de sistema criada pelo SCP executa sem prompts intermediários, persiste cada etapa em Supabase e GitHub e conclui com FOR.
- Próxima missão admite owner humano definido na criação; única intervenção humana no painel é aprovação do TR. Gates adicionais só quando explicitamente previstos no TR por segurança/ação externa.

## Salvaguardas

- Não alterar a origem.
- Não copiar usuários, sessões Auth, missões, tarefas, mensagens, documentos, arquivos ou credenciais da origem.
- Não remover FKs para contornar divergência de identidade.
- Não executar purge em registros sem vínculo comprovado à sessão.
- Não marcar etapa como concluída sem teste e evidência.
- Bloqueios de federação ou permissões não autorizam fallback inseguro; concluir etapas independentes e registrar o bloqueio real.
