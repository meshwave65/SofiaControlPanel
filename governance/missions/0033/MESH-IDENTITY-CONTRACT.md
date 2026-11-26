# Contrato de identidade MeshWave — SCP e Sandbox

## Fonte canônica

Projeto Supabase MeshWave65 `ufylccbdjfzydbwhpmpp`. O token de autenticação emitido por esse projeto é validado no servidor de cada ambiente usando `auth.getUser(accessToken)`. O UUID retornado é a identidade canônica (`sub`/user id).

Cada banco de aplicação pode manter uma projeção local mínima em `sofia.users`, com `openId = central_auth_user_uuid`, para preservar FKs e relações locais. Essa projeção não é uma conta independente, não emite credenciais e não é autoridade para decidir acesso a ambientes.

## Claims administrativas

Armazenar em `app_metadata`, gerenciado apenas por fluxo administrativo confiável:

```json
{
  "meshwave_user_type": "normal_user",
  "meshwave_environments": ["scp", "sandbox"],
  "meshwave_permissions": ["missions:create", "agents:manage"]
}
```

Valores de `meshwave_user_type`:
- `sandbox`: usuário restrito ao Sandbox; não acessa SCP.
- `normal_user`: usuário normal; ambientes explicitamente listados.
- `admin`: administrador; ambientes e permissões explicitamente listados.

## Regras de autorização

| Tipo | SCP | Sandbox |
|---|---|---|
| sandbox | NEGADO | PERMITIDO |
| normal_user + scp | PERMITIDO | NEGADO, salvo se sandbox também estiver listado |
| normal_user + scp,sandbox | PERMITIDO | PERMITIDO |
| admin + scp | PERMITIDO com permissões SCP | NEGADO, salvo se sandbox também estiver listado |
| admin + scp,sandbox | PERMITIDO com permissões SCP | PERMITIDO com permissões Sandbox |
| sem classificação | legado SCP somente durante migração | NEGADO |

- Nunca usar email, nome ou provider como chave de autorização.
- Nunca confiar em `user_metadata` para classificação.
- Nunca confiar no objeto `getSession()` do navegador como prova de identidade; o servidor valida o token com o Auth central.
- Em Sandbox, rejeitar autenticação pelo cookie legado Manus.
- No Sandbox, o papel local `admin` só pode ser derivado de claim central `meshwave_user_type=admin`.
- O acesso direto ao banco via client/anon/authenticated permanece negado; as APIs do backend aplicam a autorização.

## Configuração de cada deployment

| Variável | SCP | Sandbox |
|---|---|---|
| `VITE_SUPABASE_URL` | Auth central | Auth central |
| `VITE_SUPABASE_ANON_KEY` | Auth central publishable/anon | Auth central publishable/anon |
| `SUPABASE_AUTH_URL` | Auth central | Auth central |
| `SUPABASE_AUTH_ANON_KEY` | Auth central publishable/anon | Auth central publishable/anon |
| `DATABASE_URL` | Banco SCP | Banco Sandbox |
| `SUPABASE_STORAGE_URL` | Storage SCP | Storage Sandbox |
| `SUPABASE_STORAGE_SECRET_KEY` | Secret key SCP | Secret key Sandbox |
| `SCP_ENVIRONMENT` | `scp` | `sandbox` |

Chaves secret/service-role são exclusivamente server-side. A chave pública do Auth central não concede acesso ao banco Sandbox porque as tabelas não concedem privilégios aos papéis client-side.

## Estado da configuração central auditada

83 usuários Auth; nenhum tem claims MeshWave de classificação/ambiente. A aplicação Sandbox deve negar todos os usuários até que o fluxo administrativo central atribua os claims corretos. Não inferir qual usuário deve ser admin ou sandbox.
