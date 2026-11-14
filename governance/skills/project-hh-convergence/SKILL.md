---
name: project-hh-convergence
description: Avalie convergência entre contatos canônicos já mapeados e um projeto MeshWave nomeado, usando o blueprint vigente, evidência profissional atual e o protocolo de convergência mútua. Use para tarefas HH/Head Hunter por projeto; não use para OCINT genérico, envio de mensagens ou preparação de reunião.
---

# Project HH Convergence

Use esta skill para avaliar, de modo rastreável e específico por projeto, contatos já existentes na base canônica do `meshwave65/network`. O projeto e o blueprint vigente determinam o escopo; a ficha compartilhada permanece separada da avaliação HH. Siga também os protocolos versionados nos repositórios. Esta versão é `DRAFT`: não alegue validação de produção.

## Workflow

1. **Reconciliar a tarefa.** Leia `AGENTS.md`, o blueprint da missão SCP, a linha do quadro de tarefas, o registry de skills e as instruções do `network`. Confirme o projeto nomeado, critério de aceite, instância responsável, prioridade, branches, árvore de trabalho, commits e estado do `network`. Não assuma trabalho atribuído a outra instância.
2. **Resolver escopo e fontes autoritativas.** Leia `network/docs/protocols/AGENT_MASTER_PROMPT.md`, `AGENT_ROLES_AND_WORKFLOW.md`, `docs/protocols/agents/HH.md`, o protocolo operacional comum e o protocolo de convergência mútua vigente. Leia o README e o blueprint autoritativo do projeto. Se o blueprint estiver ausente, obsoleto ou ambíguo, registre bloqueio; não invente necessidades ou maturidade.
3. **Verificar precedência meeting-first.** Consulte o quadro da missão e os registros de reuniões do projeto antes de iniciar novo HH. Se houver reunião futura explicitamente confirmada para o mesmo contato/projeto, encaminhe a unidade a Meeting Prep antes de HH. Data em nome de pasta ou proposta não prova reunião.
4. **Selecionar um contato elegível.** Use o estado do controle e a fila da missão; avalie somente pessoas já mapeadas em `contacts/`. Não crie ficha canônica para candidato novo. Registre candidatos não mapeados separadamente para futura OCINT. Faça um único `master_id` por vez.
5. **Adquirir exclusividade antes de abrir dados do contato.** Consulte todos os refs remotos relevantes para o lock `contacts/<master_id> - <nome>/.processing.lock/owner.json`. Se livre, crie o lock atomicamente, com ID, agente/ambiente, timestamp UTC, commit-base, escopo e `IN_PROGRESS`; publique em `origin/main` e verifique o commit remoto. Se existir lock, a identidade divergir, o push falhar ou houver ownership concorrente, pare sem ler perfil, fontes ou histórico individual. Nunca sobrescreva lock alheio.
6. **Ler o mínimo necessário após o lock.** Consulte mapping canônico, `source_register.md`, avaliações anteriores do projeto, `convergence.csv`, relatório individual e artefatos pertinentes. Reutilize fontes válidas. Pesquise fontes públicas profissionais apenas se houver lacuna material; registre URL, data, afirmação sustentada e limitação. Não coletar dado sensível ou privado.
7. **Aplicar o teste de convergência.** Separe (a) frente concreta do projeto e estágio documentado; (b) atividade atual ou recente do próprio contato com evidência individualizada; (c) interseção verificável; (d) benefício plausível para cada lado; (e) incerteza que só o contato pode esclarecer. Não transfira capacidade da organização ao indivíduo. Cargo, setor, reputação, experiência histórica ou competência genérica, isoladamente, não provam convergência atual.
8. **Classificar com a escala do protocolo vigente.** Use `NOT/LOW/MID/HIG/ALL` por projeto e segmento conforme o esquema real. Sob o protocolo v0.3.0: `NOT` sem relação verificável; `LOW` adjacência ampla ou experiência histórica; `MID` sobreposição atual verificável, mas relevância/benefício ainda incerto; `HIG` sobreposição específica atual e hipótese concreta de benefício mútuo; `ALL` interseção direta com iniciativa/produto/pesquisa/piloto/decisão atual e próximo passo delimitado. `HIG/ALL` não significam interesse confirmado.
9. **Registrar a justificativa.** Separar fatos verificados, declarações, inferências, hipóteses, lacunas, riscos e confiança. Incluir os campos mínimos definidos pelo protocolo vigente, incluindo atividade/evidência atual do contato, frente do projeto, interseção, benefícios mútuos, incerteza a confirmar, base da classificação e elegibilidade de mensagem. Ausência de evidência atual é lacuna, não autorização para inferir.
10. **Persistir apenas os artefatos HH necessários.** Atualize o `convergence.csv` e o relatório individual no caminho existente do projeto, preservando o esquema e o histórico; não duplique biografia em `projects/`. Só crie/atualize `message_draft.md` quando `HIG/ALL` estiver sustentado e isso for solicitado ou permitido pelo protocolo do projeto. Uma minuta não é mensagem enviada. HH nunca envia mensagem.
11. **Validar e fechar.** Confira diffs, caminhos, links, CSVs e `git diff --check`; atualize o estado de processamento e `docs/reports/mission_state.md` conforme o protocolo vigente. Publique checkpoint em `origin/main`, confirme-o remotamente e só então remova o lock próprio em commit separado. Atualize o quadro SCP e o handoff. Toda unidade assumida exige OR próprio, com skills/versões/commits, fontes, resultados, problemas, incertezas, privacidade e próximo passo; mantenha `oracle_status: PENDING` até revisão autorizada.
12. **Continuar com segurança.** Após fechar, pausar ou bloquear, volte ao SCP, revalide filas, ownership, dependências, prazos e locks; continue só para a unidade não reivindicada elegível de maior prioridade. Um bloqueio não autoriza contornar decisão humana, lock, permissão ou escopo.

## Referências obrigatórias no uso

- `SofiaControlPanel/AGENTS.md`, `GOVERNANCE.md`, blueprint/tarefas da missão, `governance/registry/skills.csv` e template OR.
- `network/AGENTS.md`, `docs/protocols/AGENT_MASTER_PROMPT.md`, `AGENT_ROLES_AND_WORKFLOW.md`, `docs/protocols/02_OPERATIONAL_PROTOCOL.md`, `docs/protocols/agents/HH.md` e `docs/protocols/05_MUTUAL_CONVERGENCE_PROTOCOL.md` (ou a versão vigente que os substitua).
- `network/projects/<projeto>/README.md`, blueprint autoritativo, `convergence.csv` e artefatos individuais existentes.

Leia esses documentos da branch remota vigente para cada tarefa; esta skill não substitui a fonte canônica nem fixa versões de protocolo.

## Limites de validação

Esta skill foi criada a partir dos protocolos documentados e está `DRAFT`. Uma validação estrutural ou seu uso em um único contato não prova que o fluxo HH esteja validado para todos os projetos. Mantenha o estado no registry até revisão Oracle e evidência de uso adequada. Não use a skill para OCINT genérico, comunicação externa, promessa de interesse, aprovação de abordagem ou Meeting Prep.
