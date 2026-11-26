# SANDBOX-SESSION-LIFECYCLE — MISSION_0033

## Regra funcional

Cada sessão Sandbox é um contêiner temporário de execução. Recursos criados durante a sessão pertencem a ela por chave UUID explícita. Encerrar a sessão ou atingir o prazo máximo produz o mesmo resultado: expurgo integral do conteúdo da sessão.

## Modelo mínimo

`sandbox.sessions`
- `id uuid primary key`
- `central_identity_id uuid not null`
- `status text not null` — ACTIVE, CLOSING, EXPIRED, PURGED
- `started_at timestamptz not null default now()`
- `expires_at timestamptz not null`
- `closed_at timestamptz null`
- `purged_at timestamptz null`
- `purge_reason text null`
- `purge_result jsonb null`
- `created_at/updated_at timestamptz`

O TTL inicial é 24 horas. A política pode reduzir o prazo por perfil/ambiente, mas a sessão não pode ampliá-lo acima do limite global. A expiração é calculada no servidor, nunca confiada ao relógio do cliente.

## Propriedade dos dados

Toda instância experimental e todo registro operacional criado no Sandbox recebe `session_id`. Isso inclui agentes instanciados, missões, tarefas, mensagens, documentos, versões, relatórios, logs e metadados de arquivos. Recursos compartilhados (identidade, catálogo, templates, políticas e configuração global) não recebem `session_id` e não são eliminados.

A associação deve ser obrigatória para recursos temporários. Não usar apenas cascata implícita de FK como garantia única: o procedimento de expurgo enumera explicitamente as dependências, verifica o escopo e retorna contagens.

## Gatilhos de expurgo

1. **Fechamento explícito:** transição ACTIVE → CLOSING chama o procedimento transacional de expurgo imediatamente.
2. **Tempo máximo:** job periódico marca sessões vencidas e chama o mesmo procedimento.
3. **Idempotência:** sessões PURGED retornam resultado anterior sem nova exclusão; concorrência é serializada por lock da linha da sessão.
4. **Falha parcial:** transação de banco reverte integralmente; Storage é processado por prefixo dedicado e reconciliado até não restarem objetos. Só marcar PURGED após confirmação de banco e Storage.
5. **Auditoria:** manter apenas registro mínimo do expurgo, sem conteúdo ou payloads da sessão.

## Storage

Usar bucket privado dedicado ao Sandbox e prefixo imutável `<session_uuid>/...`. A limpeza nunca consulta nem remove objetos fora desse bucket/prefixo. O bucket e a convenção devem existir antes de permitir uploads experimentais.

## Segurança

- O cliente não pode chamar o expurgo de outra sessão.
- Somente função server-side autorizada pode fechar/expirar e apagar.
- RLS deve exigir identidade central vinculada à sessão ativa.
- Não expor service-role key no cliente.
- Não apagar agentes de catálogo sincronizados; apagar somente instâncias efêmeras locais.
- Não apagar usuários, identidade central, permissões ou metadados de autorização.
- Não alterar o SCP operacional nem dados fora do projeto Sandbox.

## Testes obrigatórios

- Fechamento manual apaga recursos de uma sessão e preserva outra.
- Expiração automática apaga recursos vencidos e preserva sessões ativas.
- Duas execuções concorrentes de purge não duplicam efeitos nem corrompem estado.
- Falha de Storage não marca sessão como PURGED.
- Usuário sandbox-only é negado no SCP.
- Usuário normal sem permissão Sandbox é negado no Sandbox.
- Usuário normal autorizado acessa ambos os ambientes com escopos distintos.
- Agente efêmero não sobrevive ao expurgo e nunca é replicado para o SCP.


## Implementação aplicada em 2026-11-26
- O serviço Sandbox valida o token no Auth central e só abre sessão quando `app_metadata` autoriza o ambiente Sandbox.
- Todas as rotas tRPC protegidas exigem identidade autorizada e sessão ativa.
- O banco atribui automaticamente `sandboxSessionId` a 16 tabelas efêmeras por trigger, seguindo o usuário ou o registro-pai.
- O identificador da sessão é imutável nos registros e gravações sem sessão ativa são rejeitadas.
- Logout solicita `close_session`; o cron despacha o expurgo. TTL máximo permanece 24 horas.
- O catálogo `SCP_CATALOG` é persistente e somente leitura; instâncias `SANDBOX_SESSION` são vinculadas à sessão.
- Limites restantes: classificação explícita de pelo menos uma identidade, teste de login real e teste fixture Storage de upload/expurgo.
