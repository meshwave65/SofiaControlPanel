# Blueprint da Missão 0009 — Orquestração de contatos e reuniões MWC / SOFIA-SWE

**Versão:** 0.1.0
**Estado:** operacional, com pontos de verificação pendentes
**Missão:** `MISSION_0009`
**Orquestrador:** SofiaControlPanel (SCP)
**Repositório de dados e artefatos de projeto:** [`meshwave65/network`](https://github.com/meshwave65/network), branch `main`
**Data da linha de base:** 2026-10-28

## Correção de nomenclatura e escopo — 2026-10-28

O responsável confirmou que a criptomoeda antes referida como MWC foi rebatizada para **MWN (MeshWave Network Crypto Coin)**. A partir desta data, a missão específica da moeda é `MISSION_0011`; avaliações, mensagens e materiais históricos MWC não devem ser reutilizados para MWN sem revalidação. MISSION_0009 permanece ativa somente para a trilha SOFIA/SWE. Não alterar os registros históricos do `network` por substituição global de siglas.

## 1. Objetivo e fronteiras

Esta missão transfere para o SCP a coordenação de tarefas de relacionamento profissional para MWC e SOFIA/SWE. O SCP mantém a missão, a fila de tarefas e os Operational Reports. O repositório `network` continua sendo a fonte de verdade para identidade e mapeamento canônico de contatos, avaliações HH, índices de convergência, registros de reuniões, mensagens e materiais específicos dos projetos.

A missão não cria uma base paralela de pessoas. Cada contato conserva seu `master_id` e sua ficha única em `network/contacts/`. As avaliações devem permanecer independentes por projeto em `network/projects/mwc/` e `network/projects/sofia/`. Não copiar biografias para o SCP.

## 2. Regra de roteamento: verificar reuniões primeiro

Antes de atribuir qualquer novo contato, consultar no `network` os registros de reunião do projeto relevante e verificar também o estado da tarefa no SCP. A existência de uma pasta ou de uma data no nome do arquivo não prova, por si só, que uma reunião foi confirmada.

1. **Há reunião futura confirmada:** priorizar o papel **Meeting Prep** para aquele projeto e contato. Confirmar data, participantes e evidência explícita do agendamento nos registros existentes; usar o mapeamento canônico, a avaliação HH, as mensagens e o histórico real para preparar os materiais no diretório da reunião no `network`. Não iniciar em paralelo outro trabalho para o mesmo `master_id`.
2. **Há apenas data pendente, proposta ou evento passado:** não tratar como reunião futura confirmada. Verificar se há follow-up autorizado pendente; caso contrário, prosseguir à fila de contatos.
3. **Não há reunião futura confirmada:** iniciar ou continuar o fluxo abaixo para um único contato por vez.

A primeira verificação desta missão confirmou, nos registros de agenda já persistidos, a reunião SOFIA/SWE de `NW-LI-0023 — Renato Barros` em 06/11/2026, 16:00–16:45, `America/Sao_Paulo`, por videoconferência. Sob lock remoto (`a28e74c`), o briefing existente foi revisado e considerado suficiente; o inventário foi atualizado no checkpoint `1890bb9`. O lock foi removido em commit separado (`aac1d90`). Não houve acesso novo ao canal, mensagem, reagendamento ou cópia de credenciais. A demonstração de produto permanece condicional a teste end-to-end e latência, ambos pendentes.

## 3. Pipeline quando não há reunião confirmada

Para cada `master_id`, seguir as etapas em ordem e atualizar o estado no SCP e no repositório de execução apropriado:

1. **OCINT — identidade e registro profissional:** verificar se já existe ficha canônica. Reutilizar ficha e fontes suficientes. Acionar OCINT somente quando a identidade estiver pendente, a ficha ausente ou houver lacuna profissional material; pesquisar de forma genérica, sem filtrar a ficha para um projeto. Não duplicar registros.
2. **HH — convergência por projeto:** avaliar a pessoa contra o blueprint vigente, separadamente para MWC e SOFIA/SWE, usando as avaliações e evidências existentes antes de nova pesquisa. Atualizar somente os artefatos de cada projeto no `network`.
3. **Secretary — comunicação e coordenação:** só tratar de contatos com avaliação fundamentada e minuta pertinente. Enviar mensagem, convite ou follow-up apenas após autorização humana explícita e por canal realmente disponível. Registrar o evento observado; não inventar resposta, compromisso ou reunião. Uma resposta positiva não equivale a reunião confirmada.
4. **Meeting Prep:** após confirmação explícita de data e participantes, retornar à regra de prioridade e preparar a reunião antes de retomar novos contatos.

Convergência e mensagem são gates distintos. Um registro `MID+` não autoriza abordagem. Minuta só pode ser considerada quando HIG/ALL estiver sustentado pelo protocolo de convergência mútua; envio permanece proibido sem autorização.

## 4. Escopo dos projetos

### MWC / UMS

Usar como referências no `network`: `projects/mwc/README.md`, `projects/mwc/blueprints/HH_VALIDACAO_EXTERNA_MWC_UMS.md`, `projects/mwc/blueprints/PROTOTIPO_ARMAZENAMENTO_VOLUNTARIO_V0.md`, o blueprint normativo provisório `docs/blueprints/MESHWAVE_BLUEPRINT_NORMATIVE_v0.1.md` e `docs/protocols/05_MUTUAL_CONVERGENCE_PROTOCOL.md`.

O blueprint normativo v0.1 está marcado `DRAFT_FOR_VALIDATION`. Ele delimita um caso mínimo computacional contabilizado por UMS e lista gates ainda pendentes. O protótipo de armazenamento voluntário V0 descreve outra frente delimitada. Não fundir automaticamente essas frentes: em cada avaliação, declarar qual hipótese concreta está sendo examinada (problema de usuário, validação técnica, oferta de recursos, economia/governança ou possibilidade de piloto). Se o escopo específico não puder ser determinado sem suposição, registrar a incerteza ou bloqueio.

Separar simulação, protótipo relatado, teste automatizado e operação real. Não afirmar que PoUW, consenso distribuído, integração real, preço, liquidez, conversibilidade, rendimento ou piloto existem sem evidência correspondente. O protocolo externo em `mwc-ums-sim/docs/PROTOCOLO_VALIDACAO_EXTERNA.md` descreve validação de problema, requisitos e eventual piloto; seus níveis de evidência externa não substituem a escala HH.

### SOFIA/SWE

Usar o diretório de convergência `projects/sofia/` no `network`. Distinguir SOFIA (camada cognitiva/orquestração) de SWE (produto independente de captura de interações digitais, preservação do conhecimento gerado e recuperação). O escopo documentado de SWE 1.x inclui autenticação, extração, tarefas, arquivos, busca e configuração automática; curadoria, vetorização semântica, raciocínio autônomo e orquestração são módulos futuros, não capacidades do SWE 1.x.

A documentação de produto está no repositório [`meshwave65/AppAndroidSWE-Start`](https://github.com/meshwave65/AppAndroidSWE-Start), em `docs/product/PRODUCT_SCOPE.md`, `docs/architecture/ARCHITECTURE.md` e `docs/product/ROADMAP.md`. Linha de base consultada: commit `2d264328d9c6cb23429cfa792e8d454c516eda82`, produto SWE 1.0. Antes de cada novo ciclo, conferir a versão vigente e registrar o SHA. A documentação de escopo ou arquitetura não prova funcionamento end-to-end, implantação, desempenho, segurança ou demanda comercial.

## 5. Evidência e critérios de convergência

Aplicar `docs/protocols/05_MUTUAL_CONVERGENCE_PROTOCOL.md` v0.3.0 do `network`. Uma classificação MID/HIG/ALL exige, no mínimo, frente MeshWave concreta e estágio real; atividade atual do próprio contato sustentada por fonte pública; interseção verificável; benefícios plausíveis para o contato e para a MeshWave; incerteza a confirmar. Cargo, setor, formação, reputação ou capacidade da organização, sem atuação pessoal atual, não bastam.

Classificar por `projeto × segmento` (`FIN`, `PLA`, `DES`, `TEC`, `DIV`, `CLI`, `PAR`, `VAL`, `COM`, `MEN`). Usar NOT/LOW/MID/HIG/ALL e atualizar o índice do projeto somente conforme seu esquema vigente. Relatórios antigos e minutas pré-v0.3 são históricos e não se reutilizam automaticamente. Registrar fato, inferência e hipótese separadamente; reutilizar fontes existentes se adequadas e pesquisar apenas lacunas materiais.

O protocolo de convergência mútua exige atividade profissional pública atual. Não coletar dados sensíveis, privados ou não necessários. Não enviar mensagens nem convites como parte da avaliação HH.

## 6. Unidade de trabalho, locks e persistência

A unidade de execução é **um contato (`master_id`) por vez por agente**, podendo conter uma avaliação MWC e outra SOFIA/SWE para esse mesmo contato, em relatórios separados e no mesmo checkpoint lógico quando ambos forem solicitados. Nunca trabalhar em dois IDs simultaneamente na mesma execução.

Antes de abrir ficha, fontes, histórico individual ou realizar pesquisa externa:

1. sincronizar `network` com `origin/main`, verificar árvore limpa, índices, relatórios e todas as branches remotas relevantes;
2. ignorar contatos com lock existente ou processamento concorrente; `NW-LI-0091` continua excluído até nova instrução explícita;
3. adquirir atomicamente `contacts/<master_id> - <nome>/.processing.lock/owner.json`, contendo ID, agente/ambiente, horário UTC, commit-base, estado `IN_PROGRESS` e escopo;
4. commitar e enviar o lock a `origin/main`, confirmando sua presença remota antes de pesquisa;
5. consultar ficha canônica, registro de fontes e avaliações anteriores; pesquisar externamente apenas lacunas relevantes;
6. persistir, por contato, os relatórios e índices MWC/SOFIA-SWE afetados e `docs/reports/mission_state.md`, validar CSV, caminhos, links e `git diff --check`, e confirmar o commit remoto;
7. liberar o lock em commit separado somente após o checkpoint de avaliação estar confirmado em `origin/main`.

Se o push do lock falhar, não pesquisar nem editar dados do contato. Nunca sobrescrever ou remover lock de outro agente. Não alegar exclusão mútua além do mecanismo de lock efetivamente confirmado no Git.

Cada contato deve produzir checkpoint próprio no `network`. A missão e a atribuição da unidade são rastreadas no arquivo de tarefas do SCP; o lock remoto do `network` é a fonte de verdade para exclusividade do contato. No fechamento de cada unidade, registrar ID, resultado, commits e próximo candidato no handoff SCP.

## 7. Tarefas, skills e Operational Reports no SCP

A missão é acompanhada por `MISSION_0009 - TASKS - PROGRESS.md`. Agentes devem atualizar status e responsável antes de assumir uma etapa, após confirmar que não há conflito e que o lock pertinente está livre. Para cada unidade de contato assumida, criar um Operational Report usando `governance/skills/skill-governance-oracle/templates/OperationalReport.template.md`, adicionar uma linha única a `governance/operational_reports/INDEX.csv`, manter `oracle_status: PENDING` e publicar o OR em commit rastreável no SCP. Não copiar tokens, dados pessoais desnecessários ou conteúdo confidencial para o OR.

A skill `network-contact-orchestration` v0.1.0 foi criada e registrada como `DRAFT`; passou a validação estrutural e foi exercitada somente para o ramo Meeting Prep desta missão. Não alegar que o pipeline OCINT→HH→Secretary foi testado nem promovê-la a `ACTIVE` antes de execução e revisão Oracle suficientes. `linkedin-ocint-mapper` cobre OCINT, não substitui HH ou Meeting Prep. Para cada papel, seguir também os protocolos específicos vigentes do `network`; usar `skill-governance-oracle` para elaborar e indexar ORs. Não escolher skill incompatível só por semelhança de título.

## 8. Fotografia inicial da missão

No snapshot de retomada do `network` `main` em `aac1d9077a89e29c205d2daed83e6270fdc80f6f`, o índice canônico tinha 133 contatos; `projects/mwc/convergence.csv` continha 73 linhas e `projects/sofia/convergence.csv`, 82. As avaliações importadas são preliminares até revisão. A sequência mais recente de reavaliações MWC e SOFIA/SWE segundo o protocolo v0.3.0 chegou a `NW-LI-0086`.

O candidato seguinte observado é `NW-LI-0087 — Bruno Diogo`, com avaliações datadas de 23/10/2026 ainda sem revisão v0.3.0 e estado canônico `REVIEW_REQUIRED`. O preflight não encontrou lock de 0087; reconfirmar índices e locks antes de selecioná-lo. `NW-LI-0153` continua com lock ativo neste snapshot e não deve ser tocado por outro agente. A verificação e revisão dos materiais da reunião de 0023 foram concluídas; a tarefa ativa seguinte é retomar a fila de convergência.

Esta fotografia é apenas um ponto de retomada. Sempre sincronizar e verificar o estado remoto novamente; ela não substitui a consulta em tempo real.

## 9. Critérios de aceite e encerramento

A missão será concluída quando:

- a verificação de reuniões futuras tiver sido feita para os projetos-alvo e reuniões confirmadas tiverem materiais preparados ou impedimentos documentados;
- cada contato relevante tiver sido encaminhado pelo papel correto, com evidências e avaliações rastreáveis, sem duplicar perfis;
- Secretary tiver enviado apenas comunicações autorizadas e registrado apenas eventos confirmados;
- os relatórios HH, índices e missão do `network` estiverem consistentes e publicados por unidade;
- o arquivo de tarefas do SCP, os ORs e seu índice estiverem atualizados, com commits remotos confirmados;
- riscos, pendências, reuniões não confirmadas e lacunas de evidência estiverem documentados.
