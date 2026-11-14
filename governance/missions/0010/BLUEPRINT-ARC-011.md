# Blueprint — ARC-011 — Telemetria operacional e ranking de confiança

**Missão:** `MISSION_0010`
**Repositório-alvo:** `SofiaControlPanel`
**Estado inicial:** `STAGED`
**Skill:** `operational-task-lifecycle@0.2.0`

## Objetivo

Adicionar ao ARC/PGC uma primeira camada funcional de telemetria e ranking de confiança usando somente dados já disponíveis no SofiaControlPanel. O resultado deve ser observável, persistido e explicado, mas permanecer exclusivamente em `shadow mode`.

## Escopo da unidade

A unidade deve criar:

1. eventos de acesso/interação ARC associados a usuário, agente e tarefa;
2. perfil operacional simples do agente como proxy inicial de equipamento;
3. snapshots históricos de confiança;
4. score de confiança entre 0 e 100;
5. sinais básicos de heartbeat, status, atribuição, histórico de sucesso e atividade;
6. endpoint protegido para consultar histórico;
7. exibição da confiança atual e dos snapshots no relatório ARC da tarefa.

## Fora de escopo

Não criar nesta unidade GPS, latitude/longitude, geohash, IP, fingerprint real de dispositivo, bloqueio, autenticação forte, `assisted`, `enforced`, modelo estatístico calibrado ou coleta silenciosa de dados além do fluxo autorizado do painel.

## Critérios de aceite

- O primeiro relatório ARC de uma tarefa gera também um evento e um snapshot persistidos.
- O score fica limitado a `0..100` e possui explicação/sinais rastreáveis.
- Reabrir a tarefa não cria uma nova avaliação automaticamente quando já existe assessment.
- O histórico pode ser consultado pela API protegida e aparece no painel.
- As tabelas usam o schema `sofia`, possuem chaves/índices essenciais e ficam protegidas server-side.
- `shadow` permanece o modo padrão e nenhuma tarefa é bloqueada.
- TypeScript, testes e build passam.

## Próxima unidade posterior

Somente após validar esta unidade poderá ser criada uma etapa separada para localização, configuração real do dispositivo, horários atípicos e gráfico mais rico.
