# Blueprint da Missão 0011 — Orquestração Global MWN

**Missão:** `MISSION_0011`
**Projeto-alvo:** **MWN — MeshWave Network Crypto Coin**
**Estado:** `PROGRESS`
**Orquestrador:** SofiaControlPanel (SCP)
**Repositório canônico de contatos e artefatos:** [`meshwave65/network`](https://github.com/meshwave65/network), branch `main`
**Linha de base consultada:** `network/main` `4f493698796a8d28dd11208238d607a10476a5c9`, 2026-10-28

## 1. Objetivo e gatilho de retomada

Esta é a missão global, específica do projeto MWN, para descobrir convergência entre o projeto e a base profissional do `network`, iniciar conversas somente com autorização, acompanhar contatos até reuniões confirmadas e preparar essas reuniões. Ela coordena os papéis OCINT/OSINT, HH, Secretary e Meeting Prep; esses papéis são etapas/skills reutilizáveis chamadas pela missão, não missões independentes por agente.

Para retomar, basta dizer: **“Prossiga com MISSION_0011 para MWN a partir do último checkpoint remoto.”** O agente deve ler este blueprint, `MISSION_0011 - Orquestracao Global MWN - PROGRESS.md` e `MISSION_0011 - TASKS - PROGRESS.md`, seguir `SofiaControlPanel/AGENTS.md`, sincronizar SCP e `network` e conferir locks, reuniões, fila e estado dos ORs. A cópia remota mais recente prevalece sobre a conversa e sobre snapshots locais.

## 2. Identidade do projeto e limites da evidência

Em 2026-10-28, o responsável pelo projeto corrigiu a nomenclatura: a criptomoeda MeshWave que era referida como **MWC** foi rebatizada para **MWN — MeshWave Network Crypto Coin**. Para o ativo-alvo desta missão, **MWC é nomenclatura legada, não o nome atual**. Esta é uma instrução do responsável; não é, por si só, prova de emissão, registro, negociação, exclusividade legal do nome ou de alteração de todas as especificações do ativo.

Há uma divergência documental material a resolver: na linha de base `network/main` `4f49369`, o repositório ainda usa `projects/mwc/` e os blueprints normativos identificam MWC; o blueprint normativo `docs/blueprints/MESHWAVE_BLUEPRINT_NORMATIVE_v0.1.md` está marcado `DRAFT_FOR_VALIDATION`, e não existe diretório canônico `projects/mwn/`. Alguns registros já mencionam MWN, mas isso não substitui uma definição de projeto aprovada. **Não presuma que a mudança de nome preservou escopo, utilidade, economia, emissão, governança ou estágio.** A primeira tarefa operacional é reconciliar a definição de MWN, a fonte da verdade e o mapeamento dos arquivos legados sem migração destrutiva. Até existir blueprint utilizável, HH não deve atribuir convergência MWN e Secretary não deve abordar alguém com alegações sobre o projeto. A verificação meeting-first continua obrigatória; se houver reunião confirmada, Meeting Prep avalia o que pode ser preparado e registra o bloqueio decorrente da lacuna documental, sem inventar conteúdo.

Não afirmar preço, liquidez, conversibilidade, retorno, lastro, negociação, emissão, segurança, desempenho ou adoção sem evidência específica e aprovada. Não formular solicitação de investimento nem aconselhamento financeiro. Distinguir sempre declaração do responsável, documento histórico, proposta, capacidade implementada/testada e informação desconhecida.

## 3. Fronteira com a missão anterior

`MISSION_0009` foi criada para uma fila combinada MWC/SOFIA-SWE. A parte relativa à criptomoeda anteriormente denominada MWC passa a ser tratada por esta missão MWN. Avaliações, classificações e minutas antigas de MWC são históricas e **não** tornam alguém elegível para abordagem MWN sem reavaliação segundo o blueprint MWN vigente. A trilha SOFIA/SWE de MISSION_0009 não é transferida por este documento.

## 4. Fontes de verdade e repositórios

- SCP: definição da missão, tarefas, responsáveis, checkpoints e Operational Reports.
- `network/contacts/`: perfil profissional canônico por `master_id`; não copiar biografias para o SCP.
- `network_master.csv`: fila/export de origem a reconciliar com o índice canônico, não presumir que cada linha representa uma pessoa única elegível.
- `network/projects/`: blueprint, avaliações HH, índice de convergência, mensagens, histórico e materiais de reuniões. O caminho canônico MWN e a relação não destrutiva com `projects/mwc/` serão decididos na tarefa 11.2; não criar pastas paralelas nem renomear arquivos por suposição.
- `network/docs/protocols/agents/`: procedimento específico de OCINT, HH, Secretary e Meeting Prep; `network/docs/protocols/02_OPERATIONAL_PROTOCOL.md` rege locks e persistência.

No snapshot `4f49369`, `network_master.csv` tinha 1.139 registros e `contacts/INDEX.csv` tinha 133 linhas. São contagens de arquivos, não contagem validada de contatos únicos ou de perfis concluídos. Recalcular cada vez, resolver duplicidades e usar os estados atuais do índice. Um contato pode estar mapeado, mas ainda ter `REVIEW_REQUIRED` ou não ter sido avaliado para MWN.

## 5. Roteamento global: ordem obrigatória

Em cada retomada, um agente pode fazer somente uma unidade/um `master_id` por vez. O ciclo abaixo é repetido a partir do estado remoto.

1. **Meeting-first.** Consultar os registros de reunião no `network` para MWN e verificar data, participantes e evidência explícita de confirmação. Pasta, convite proposto ou diretório `date-pending` não confirmam reunião. Se houver reunião futura confirmada, Meeting Prep tem prioridade para aquele contato; concluir ou registrar impedimento antes de iniciar outra unidade. Não copiar credenciais, links privados ou PINs.
2. **Secretary para candidato já elegível.** Se não houver reunião confirmada prioritária, verificar o histórico e se existe recomendação HH **atual para MWN**, revisada e autorizada para avanço. `MID+` isolado não autoriza mensagem. Secretary só pode enviar após aprovação humana explícita do texto/destinatário/canal e quando o canal estiver de fato autorizado e acessível; sem isso, pode preparar ou atualizar uma minuta e deixar o estado como pendente. Registrar apenas eventos observáveis. Não enviar automaticamente por haver uma missão ativa.
3. **HH para mapeados ainda não avaliados.** Se não houver ação Secretary autorizada, escolher o próximo contato canônico elegível que ainda não tenha avaliação atual de MWN. Ler o blueprint e os critérios MWN, o mapeamento/fonte e as avaliações anteriores pertinentes. Avaliar cada projeto separadamente e registrar evidências pessoais atuais, lacunas, riscos e confiança. Não transferir aderência de MWC, SOFIA/SWE ou do empregador.
4. **OCINT/OSINT quando todos os mapeados estiverem avaliados.** Somente quando todos os perfis canônicos elegíveis tiverem avaliação MWN atual, selecionar o próximo perfil de origem ainda não mapeado ou que precise de reconciliação material. OCINT mapeia profissionalmente de forma genérica e independente do projeto; não filtra biografias para favorecer MWN. Depois do checkpoint OCINT, retornar ao HH para avaliação MWN.
5. **Repetir e entregar checkpoint.** Após cada unidade, reconciliar estados, marcar o próximo passo, criar OR e sincronizar os remotos. Continuar a unidade somente quando não houver lock concorrente nem gate bloqueante.
6. **Continuidade autônoma entre missões.** Ao concluir, pausar ou bloquear uma unidade MWN, consultar novamente o SCP e selecionar a tarefa segura, não reivindicada e de maior urgência entre as missões disponíveis, conforme `GOVERNANCE.md` e `operational-task-lifecycle`. O gate MWN continua válido para tarefas dependentes de MWN, mas não deve interromper trabalho independente em outra missão. Cada unidade subsequente exige seu próprio preflight, skill e OR; não executar comunicação externa sem autorização.

Se houver bloqueio isolado de identidade/fonte, registrar o estado e avançar apenas para outra unidade elegível conforme os protocolos. Se a definição MWN como um todo continuar ambígua, pausar HH/Secretary para o projeto e pedir decisão; a existência de contatos na fila não supre esse bloqueio. Esse bloqueio pausa o trabalho dependente de MWN, não a busca de tarefas independentes no SCP. Se não restar unidade elegível, deixar a missão em `PAUSED` ou `STAGED` conforme GOVERNANCE.md e documentar a razão.

## 6. Regras por papel

- **OCINT/OSINT:** mapear e reconciliar uma ficha profissional reutilizável, não avaliar aderência a MWN. Usar a skill `linkedin-ocint-mapper` somente para este papel, com lock, fontes públicas profissionais e OR próprios.
- **HH:** comparar contato canônico ao blueprint MWN, quando utilizável, em avaliação específica por projeto e segmentos vigentes. Revisar candidatos históricos individualmente. HIG/ALL e evidências suficientes permitem recomendar revisão humana; não significam interesse, disponibilidade ou autorização de envio.
- **Secretary:** preservar identidade e histórico, preparar mensagem personalizada e registrar status de envio/resposta. Nunca enviar, convidar ou negociar sem autorização humana explícita. Nunca fabricar resposta, aceite, compromisso ou reunião.
- **Meeting Prep:** após confirmação, produzir no diretório de reunião existente os materiais necessários: briefing, escada argumentativa, pauta/perguntas, imagens/infográficos/planilhas ou demonstração quando úteis e sustentados. Diferenciar proposta, protótipo, teste e implementação. Não duplicar reuniões nem afirmar funcionalidade não demonstrada.

As avaliações HH e materiais do projeto permanecem em `network`. Uma minuta não é prova de envio; uma conversa aceita não é prova de reunião confirmada.

## 7. Locks, commits e Operational Reports

Antes de abrir conteúdo específico de contato, histórico individual ou pesquisa externa, conferir remotos e locks do `network`. Adquirir `contacts/<master_id> - <nome>/.processing.lock/owner.json` atomicamente, com ID, agente/ambiente, UTC, commit-base, escopo e `IN_PROGRESS`; publicar em `origin/main` e verificar antes de continuar. Não sobrescrever nem liberar lock de outro agente. Persistir e validar a unidade; confirmar o checkpoint remoto antes de liberar o próprio lock em commit separado.

Cada execução significativa gera um OR no SCP, segundo o template oficial, uma linha única em `governance/operational_reports/INDEX.csv`, `SUBMITTED` e `oracle_status: PENDING`. O OR inclui arquivos/commits, evidências, incertezas, desvios, proteção de dados e próximo passo. Não incluir dados pessoais desnecessários, segredos, mensagens privadas ou credenciais.

A skill `network-contact-orchestration` v0.1.0 permanece `DRAFT` e só foi validada estruturalmente e no ramo Meeting Prep; não promover nem alegar pipeline completo até execução e revisão Oracle. Aplique os protocolos de papel vigentes em `network/docs/protocols/agents/`. Não usar a skill OCINT para HH/Secretary/Meeting Prep.

## 8. Critérios de aceite e encerramento

A missão permanece contínua enquanto houver contatos canônicos ainda não avaliados para MWN ou perfis de origem ainda não mapeados, respeitados os gates e estados. Cada unidade deve ter evidência rastreável, artefatos do papel correto, lock liberado somente após checkpoint, tarefa/OR atualizados e próximo passo explícito. Para pausar/encerrar, registrar cobertura e lacunas; não declarar fila esgotada sem reconciliar export, índice, duplicidades, bloqueios e locks.
