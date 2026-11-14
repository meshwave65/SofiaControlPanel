# Análise Estrutural: Auditoria de integridade referencial — identidade, indicação e aquisições

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000013 |
| taskId | 13 |
| source | SofiaControlPanel interface |
| creator | system |
| creatorType | system |
| status | DONE |
| statusId | 4 |
| priority | Crítica |
| priorityId | 4 |
| parentTaskId | 12 |
| githubPath | missions/SCP-TASK-000013.md |
| mirroredAt | 2026-11-13T00:13:07.521843Z |

## Description

[ESTRUTURAL] Objetivo: auditar integralmente as chaves estrangeiras e relações de identidade do banco de produção MeshWave/Supabase para identificar falhas semelhantes às encontradas em public.profiles.referrer_id e public.mwc_acquisitions.referrer_id.

Escopo obrigatório: todas as tabelas e FKs dos schemas public e sofia, com atenção especial a relações envolvendo auth.users, public.profiles, perfis MeshWalker, indicadores/referrers, compradores, carteiras, aquisições, créditos, bônus, ledger e tabelas de relacionamento.

Verificações: (1) inventariar cada FK, tabela/coluna filha, tabela/coluna referenciada, regra ON DELETE e estado convalidated; (2) detectar FKs que usam public.profiles(id) quando a identidade funcional correta pode ser auth.users(id), comparando o modelo e o uso real; (3) localizar órfãos existentes e referências válidas em Auth sem perfil público; (4) identificar colunas UUID de usuário sem FK, FKs divergentes entre tabelas equivalentes e constraints NOT VALID; (5) rastrear triggers, funções e fluxos de signup/referral/acquisition que gravam essas referências; (6) distinguir defeito confirmado, risco potencial e legado histórico; (7) avaliar impacto sobre compras UMS, atribuição de indicação, bônus, wallets e ledger.

Entregáveis: relatório por tabela com evidências SQL, contagens de registros afetados, severidade, causa provável, recomendação e plano de correção/migração aditiva e segura. Incluir testes de regressão para cadastro com indicação e compra UMS com/sem indicador.

RESTRIÇÕES: auditoria inicialmente somente leitura. NÃO alterar constraints, dados, saldos, carteiras, aquisições, bônus, triggers ou funções durante a investigação. NÃO apagar, reatribuir ou normalizar registros órfãos. Qualquer correção deve ser apresentada separadamente com impacto e plano de rollback, aguardando autorização explícita antes da execução. Não presumir que toda referência a profiles deve apontar para auth.users: validar o domínio semântico de cada relação.

## Synchronization contract

- Supabase task ID: `13`
- GitHub path: `missions/SCP-TASK-000013.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
