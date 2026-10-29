# MISSION_0011 — TASKS — PROGRESS

**Missão:** Orquestração Global MWN — MeshWave Network Crypto Coin
**Blueprint:** `governance/missions/0011/BLUEPRINT.md`
**Repositório canônico:** `meshwave65/network`, branch `main`
**Atualizado em:** 2026-10-29

| ID | Tarefa | Status | Instância | Repositório/artefato | Próxima ação |
|---|---|---|---|---|---|
| 11.1 | Criar missão global MWN, blueprint, ciclo de papéis, handoff e OR inicial | DONE | Manus AI | SCP: `governance/missions/0011/`, arquivos `MISSION_0011*`, OR-20261028-0005; `network/AGENTS.md` commit `4f49369` | Concluída; não repetir setup |
| 11.2 | Reconciliar nome MWN, definição do projeto, fonte da verdade e relação não destrutiva com documentos/caminhos legados MWC | PAUSED | Manus AI | `network/main` `a5528b1` (crosswalk `a9e8dbe`); `docs/blueprints/MWN_MWC_RECONCILIATION_2026-10-29.md`; OR-20261029-0002 | Aguardar decisão do responsável sobre (1) se MWN designa só a moeda, (2) como tratar relação UMS–moeda, (3) status do parâmetro `1.000 UMS = 1 MWN = R$ 1,00` no simulador e (4) finalidade/estágio e alegações autorizadas. Não iniciar HH/Secretary antes de blueprint aprovado |
| 11.3 | Executar o ciclo contínuo MWN: Meeting Prep → Secretary autorizado → HH de mapeados pendentes → OCINT/OSINT genérico quando todos os mapeados estiverem avaliados | STAGED | — | `network/contacts/`, `network/projects/`, logs e reuniões | Depois do gate 11.2, reconciliar fila/locks e processar uma unidade/um contato por vez; publicar OR próprio por unidade |
| 11.4 | Auditar cobertura, artefatos, estados de comunicação/reunião, locks, ORs e handoff de pausa/encerramento | STAGED | — | SCP + `network` | Executar ao pausar/encerrar; não declarar fila esgotada sem reconciliação dos registros |
| 11.5 | Atualizar o protocolo de validação externa UMS/MWN para exigir evidência explícita de convergência e utilidade mútuas antes de recomendar uma conversa | DONE | Manus AI | `meshwave65/mwc-ums-sim` commit `3547405`; OR-20261029-0001 | Gate bilateral publicado no protocolo e no blueprint HH; E0–E5 separados da elegibilidade; nenhuma abordagem realizada |

## Regra de retomada e prioridade

Em toda retomada, sincronizar os dois repositórios e ler primeiro as instruções do SCP, o blueprint MISSION_0011 e o estado remoto dos locks. Verificar reuniões futuras confirmadas no `network` antes de selecionar qualquer novo contato. Uma reunião confirmada direciona o respectivo contato a Meeting Prep; não usar data proposta ou pasta `date-pending` como confirmação.

Se não houver reunião prioritária, Secretary só recebe um candidato com avaliação MWN atual elegível e autorização humana explícita para qualquer envio. Sem ação de Secretary autorizada, HH avalia o próximo contato canônico mapeado que ainda não tenha avaliação MWN. Só quando todos os mapeados elegíveis tiverem avaliação atual, OCINT mapeia genericamente o próximo perfil ainda não canônico, e o fluxo retorna a HH.

Uma pessoa por vez por agente. Não abrir arquivos específicos do contato nem pesquisar antes de confirmar ausência de lock e publicar lock próprio em `network/main`. O lock de outro agente nunca pode ser sobrescrito ou removido. Publicar checkpoint do contato, liberar lock em commit posterior e criar OR no SCP com `oracle_status: PENDING`.
