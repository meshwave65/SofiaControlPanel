# ARCHAEOLOGICAL_CONTEXT — Memória evolutiva operacional da SOFIA

Escopo transversal: Skills, protocolos, blueprints, instruções de agentes e demais documentos de orientação das missões. Preserva incrementalmente contexto, constatações, decisões, motivações, evidências, alterações e resultados. Não substitui documentos normativos, OR ou FOR.

## Diretrizes aprovadas em 31/10/2026

1. O contexto arqueológico é central e transversal, não restrito às Skills.
2. O ORACULO_AGENT é o maestro da evolução operacional, trabalha com o agente responsável pela leitura dos OR, propõe atualizações dentro de sua autoridade e elabora o FOR de cada missão a partir dos OR das etapas.
3. Cada OR submetido aciona análise do Oráculo. A melhoria contínua não aguarda o FOR.
4. Autonomia operacional é a regra dentro das permissões e políticas vigentes. Diante de risco iminente, suspende imediatamente a tarefa/etapa causadora, preserva estado e evidências, avalia e corrige autonomamente quando autorizado e seguro; a suspensão limita-se à atividade afetada. Aguarda intervenção humana somente quando a decisão realmente exigir intervenção humana.
5. Alterações de arquitetura, objetivos fundamentais, políticas, permissões ou escopo fora da autoridade delegada exigem aprovação expressa.

## Registro evolutivo

### AC-001 — Escopo transversal
Decisão explícita do responsável: ampliar o documento arqueológico inicialmente pensado para Skills para todos os documentos de orientação das missões e toda a evolução da execução.

### AC-002 — Oráculo como maestro
Decisão explícita do responsável: o Oráculo coordena a evolução, trabalha com o agente responsável pela leitura dos OR e elabora o FOR ao final da missão.

### AC-003 — Análise a cada OR
Decisão explícita do responsável: decidir otimizações a cada OR, não apenas no FOR; corrigir imediatamente quando necessário.

### AC-004 — Autonomia adaptativa e suspensão localizada
Decisão explícita do responsável: suspender imediatamente a tarefa/etapa que produz risco iminente; na maioria dos casos, avaliar, ajustar e retomar autonomamente. Escalar ao humano somente quando a decisão realmente exigir intervenção humana.

## Piloto Meeting Preparation
A Skill meeting-preparation-dossier v0.1.1 permanece DRAFT e ainda não foi validada end-to-end. Piloto supervisionado: Gonçalo Salgueiro (NW-LI-0031), reunião 03/11/2026, 12:00–12:45, videoconferência, America/Sao_Paulo, escopo MWC/UMS. Não promover a Skill nem iniciar Renato Barros (NW-LI-0023, 06/11/2026) antes da avaliação e aprovação do piloto.

## Integridade
Registrar cada nova entrada com data, OR/FOR, missão/etapa, orientação anterior, fato/evidência, classificação (fato, declaração, decisão, hipótese, inferência ou pendência), decisão, autoridade, documentos/versões afetados, commit e validação. Não inventar dados nem reescrever histórico. A existência desta memória não significa que o Oráculo autônomo já esteja implementado.


### AC-005 — 2026-11-05 — OR_MEETING_PREP_2026-11-05_GONCALGO_PILOT

- **Missão/etapa:** operações contínuas MeshWave Network; reprocessamento supervisionado do dossiê MWC/UMS de Gonçalo / NW-LI-0031.
- **Orientação anterior:** Skill meeting-preparation-dossier v0.1.1 em DRAFT; piloto Gonçalo; não iniciar Renato antes da avaliação/aprovação do piloto.
- **Fato/evidência:** o pacote foi reaberto e validado contra v0.1.1. Os seis materiais obrigatórios existem; 21 links relativos válidos, zero quebrados; claims/maturidade, demo/fallback, limites e fontes estão explicitados. O relatório operacional `meshwave65/network: docs/reports/OPERATIONAL_REPORT_MEETING_PREP_2026-11-05_GONCALGO_PILOT.md` registra a QA. A data 03/11/2026 passou, mas ocorrência/resultado não foi verificado; minutos/follow-up permanecem em branco.
- **Classificação:** fato de execução + decisão operacional + pendências humanas.
- **Decisão:** quality gate do piloto **passou com revisão do responsável pendente**. A Skill permanece DRAFT e não é promovida. A instrução explícita do responsável em 05/11 inclui o encontro separado de Renato Barros / NW-LI-0023 em 06/11; isso autoriza continuar a reprocessar esse dossiê existente como piloto supervisionado, não aprovar/promover a Skill. Não criar pasta duplicada, não enviar mensagens, não alterar calendário.
- **Autoridade:** instrução explícita atual do responsável, dentro do escopo de Meeting Prep.
- **Documentos/versões:** Skill v0.1.1 (file SHA `c373642329208881ea5c2b7bc1d9c061f3530543`); contexto anterior AC-004 (file SHA `11cd52a7b6034ae32a78afc17895ac35e206b1b5`); OR commit `eb8563b52e05e13949a68b8ed7d4ae64c56308f1`; Gonçalo README commit `f7dae41698b1c3c424ed8774a320d6beb3b4b613`; meeting_prep commit `9636d341e73d2c377ae001eb602ca4f9c32ae882`.
- **Validação:** os arquivos foram relidos remotamente; qualidade/links aprovados; blueprints não alterados; lab de duas VMs continua congelado. A referência do usuário a Renato em 03/11 conflita com a correção explícita de 31/10 (“somente Gonçalo”); identidade não atribuída e exige esclarecimento humano.


### AC-006 — 2026-11-05 — OR_MEETING_PREP_2026-11-05_RENATO_1106

- **Missão/etapa:** reprocessamento supervisionado do dossiê SOFIA/SWE de Renato Barros / NW-LI-0023 para 06/11/2026, após a avaliação do piloto Gonçalo (AC-005).
- **Orientação anterior:** Skill v0.1.1 permanece DRAFT; o responsável explicitamente incluiu Renato 06/11 na instrução atual. A continuação é um piloto supervisionado, não promoção da Skill.
- **Fato/evidência:** identidade resolvida por placeholder existente, evento “VIDEOCONF RENATO BARROS”, registro Secretary de 23/10 e correção de 31/10. O pacote foi reprocessado; seis materiais obrigatórios criados; 22 links relativos válidos, zero quebrados. O relatório `meshwave65/network: docs/reports/OPERATIONAL_REPORT_MEETING_PREP_2026-11-05_RENATO_1106.md` registra QA. Reunião registrada para 06/11, 16:00–16:45 America/Sao_Paulo; não houve leitura nova de calendário.
- **Classificação:** fato de execução + decisão operacional + pendências humanas.
- **Decisão:** quality gate passou com revisão do responsável pendente. Skill continua DRAFT, sem promoção. Não enviar mensagem, não alterar calendário, não executar teste/demo/latência, não mudar blueprint. A mensagem de 17/10 não foi reenviada.
- **Autoridade:** instrução explícita atual do responsável, após a avaliação do piloto AC-005.
- **Documentos/versões:** Skill v0.1.1 (file SHA `c373642329208881ea5c2b7bc1d9c061f3530543`); contexto anterior AC-005 (file SHA `cded377e06f147a18af096deef637abc45d62310`); OR final commit `37d35b788765ed723ee1b16a51a443928cbe24ba`; Renato README `320431b31b0ebc7f85005f0568d817db8ec8ef38`; main dossier `4deb3fb3c1cf93d283bf2a8159defbd8500e2012`; materials README `073aec930a55c22d4068c7434857e366e8e1afb8`; link fix `e991f4d218796b8d96e7cd501e42c833961b5845`.
- **Validação:** arquivos relidos; 22/22 links válidos; blueprints não alterados; lab de duas VMs continua congelado. A referência do usuário a Renato em 03/11 ainda conflita com a correção explícita de 31/10; nenhuma identidade foi atribuída.


### AC-007 — 2026-11-05 — OR_MEETING_PREP_BLOCKER_2026-11-05_RENATO_0311

- **Missão/etapa:** resolver sem inferência a identidade do Renato reportado para 03/11/2026.
- **Orientação anterior:** AC-005/AC-006 distinguem o piloto Gonçalo 03/11 e o encontro Renato Barros / NW-LI-0023 em 06/11; o placeholder de 03/11 Renato permanece com nove candidatos.
- **Fato/evidência:** a correção de 31/10 diz que somente Gonçalo estava confirmado e que referências anteriores a Renato eram erro material; a atualização de 02/11 reativa um encontro com Renato como reportado pelo responsável, mas sem identidade canônica; a instrução atual de 05/11 volta a listar Renato e Gonçalo. A identidade não é resolvida por esses registros. O encontro de 06/11 é separado e explicitamente NW-LI-0023.
- **Classificação:** conflito de evidência / bloqueio humano.
- **Decisão:** manter `MEETING_REPORTED_BY_OWNER / BLOCKED_IDENTITY`; não escolher entre os nove registros, não atribuir NW-LI-0023, não duplicar/mover placeholder, não personalizar briefing, não enviar mensagem ou alterar calendário. Solicitar ao responsável qual ID canônico corresponde ao Renato de 03/11.
- **Autoridade:** instrução explícita atual do responsável, com protocolo de não inferência.
- **Documentos:** blocker report `meshwave65/network: docs/reports/MEETING_PREP_BLOCKER_2026-11-05_RENATO_0311.md`, commit `8c04332049239180508b00d2d8261be15bd62f09`; README existente, commit `524c17bd4f941871b95f42d2b22e5cf74ca86d4b`; briefing preliminar, commit `2b3f91d82661a0ff47abcdd1776d5f16882dfe61`; esclarecimento no OR Renato 06/11, commit `6d29ef3e00fd38ad46827238bb9bc6c6927d8177`.
- **Validação:** placeholder e report relidos; nenhuma blueprint ou network_master alterada; nenhum envio ou ação externa.
