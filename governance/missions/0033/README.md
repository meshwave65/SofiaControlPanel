# MISSION_0033 — Espelhamento estrutural seguro do SCP no Sandbox

**Estado:** PROGRESS — execução autônoma de missão de sistema  
**TR:** [TR-v1.1.0-VALIDATED.md](./TR-v1.1.0-VALIDATED.md) · [histórico v1.0.0](./TR-v1.0.0-VALIDATED.md)  
**Blueprint:** [BLUEPRINT-v1.0.0.md](./BLUEPRINT-v1.0.0.md) · revisão arquitetural [BLUEPRINT-v1.1.0.md](./BLUEPRINT-v1.1.0.md)  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)  
**Inventário:** [INVENTORY.md](./INVENTORY.md)  
**Matriz de escopo:** [SCOPE-MATRIX.md](./SCOPE-MATRIX.md)  
**Ciclo de vida das sessões:** [SANDBOX-SESSION-LIFECYCLE.md](./SANDBOX-SESSION-LIFECYCLE.md)  
**Quadro de trabalho:** [TASKS.md](./TASKS.md)  
**Progresso:** [PROGRESS.md](./PROGRESS.md)  
**Checkpoint inicial:** [CHECKPOINT-0001.md](./CHECKPOINT-0001.md)  
**Relatórios operacionais:** [OR-0001.md](./OR-0001.md) · [OR-0002.md](./OR-0002.md) · [OR-20261125-0001](../../operational_reports/OR-20261125-0001.md) · [OR-20261126-0001](../../operational_reports/OR-20261126-0001.md) · [OR-20261126-0002](../../operational_reports/OR-20261126-0002.md)  
**Tarefa operacional raiz:** [SCP-TASK-000059](../../../missions/SCP-TASK-000059.md)  
**Análises filhas:** [000060](../../../missions/SCP-TASK-000060.md) · [000061](../../../missions/SCP-TASK-000061.md) · [000062](../../../missions/SCP-TASK-000062.md)

## Objetivo

Estabelecer no projeto Supabase Sandbox uma réplica estrutural controlada e independente do SCP, com identidade/autorização central, agentes experimentais efêmeros e expurgo automático de toda sessão encerrada ou expirada.

## Sistemas envolvidos

- **Origem SCP:** MeshWave65, projeto Supabase `ufylccbdjfzydbwhpmpp`, conexão MeshWave65.
- **Destino Sandbox:** projeto Supabase `detstgxofjnnggxluqtl`, nome `sandbox`, região `us-west-2`, conexão Primary.
- **Repositório canônico:** `meshwave65/SofiaControlPanel`, branch `main`.

**Correção de roteamento:** `rqvjsjfypuojuaetxkig` é outro projeto (“meshwave65's Project”, conexão MWN) e não é o destino desta missão. Consultas anteriores feitas nele não representam o estado do Sandbox e não devem ser usadas como evidência desta missão. O projeto correto `detstgxofjnnggxluqtl` foi confirmado; o inventário retornou zero tabelas nos schemas `sandbox` e `public`.

## Regras centrais

- Reproduzir a estrutura SCP classificada para Sandbox, sem copiar registros operacionais.
- A identidade humana é central; metadados de identidade determinam privilégios e ambientes acessíveis.
- Usuários sandbox-only não acessam SCP. Usuários normais podem acessar SCP e, quando autorizados, Sandbox.
- Agentes originários do SCP podem fornecer catálogo/metadados unidirecionais; instâncias executáveis criadas no Sandbox pertencem à sessão e são efêmeras.
- Encerramento manual ou expiração por tempo máximo dispara expurgo integral dos dados e arquivos da sessão.
- O expurgo preserva identidade, permissões, catálogo, templates e configurações compartilhadas.
- A origem SCP permanece somente leitura.

## Execução autônoma

A missão está autorizada como missão de sistema. Não solicitar confirmação intermediária para decisões técnicas dentro do escopo. Bloquear apenas riscos técnicos reais, como exposição de segredos, alteração da origem, perda de dados não experimentais ou acesso indevido. Cada etapa deve deixar evidência no Supabase e no GitHub.
