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
