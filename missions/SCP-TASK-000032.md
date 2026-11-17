# SCP-TASK-000032 — Executar MISSION_0027

- **ID interno:** 33
- **Chave operacional:** SCP-TASK-000032
- **Missão de governança:** MISSION_0027
- **Estado:** STAGED
- **Prioridade:** ALTA
- **Agente:** não atribuído (despacho dinâmico)
- **Criador:** usuário
- **TR:** VALIDATED v0.1.0 — versão documental atual 2
- **Blueprint:** READY v1.0.0 — versão documental atual 2

## Objetivo

Executar a auditoria de UX dos sistemas MeshWave e desenvolver a capacidade de User Testing como skill independente de Claude Code, seguindo os WPs 27.1–27.7.

## Primeira sequência

1. WP27.1 — inventariar aplicações web e interfaces MeshWave, URLs, estado de deploy, criticidade e ambientes autorizados.
2. WP27.2 — auditar o projeto `ncklrs/claude-chrome-user-testing`, licença, personas, playbooks e acoplamento ao Claude Chrome.
3. WP27.3 — comparar Playwright, axe-core, Lighthouse CI e alternativas gratuitas.
4. WP27.4 — especificar skill modular e contrato do Browser Worker.
5. WP27.5 — executar piloto não destrutivo.
6. WP27.6 — auditar sistemas priorizados.
7. WP27.7 — consolidar ORs, evidências e recomendação.

## Restrições

- Sem Claude Code/Claude Chrome como dependência.
- Sem créditos Manus/TinyFish ou serviços pagos.
- Sem alterações de produção, deploy, pagamentos, transferências, transações, cadastros reais ou mensagens externas.
- Acesso autenticado somente com contas de teste autorizadas.
- Testes de formulário e fuzzing somente em ambiente isolado.
- Personas sintéticas não são evidência de comportamento humano real.
- Não implementar correções sem novo gate/autorização.

## Artefatos canônicos

- [MISSION_0027](../governance/missions/0027/README.md)
- [Solicitação original](../governance/missions/0027/ORIGINAL_REQUEST.md)
- [TR VALIDATED](../governance/missions/0027/TR-v0.1.0-APPROVED.md)
- [Blueprint READY](../governance/missions/0027/BLUEPRINT.md)
- [Avaliação inicial](../governance/missions/0027/INITIAL-ASSESSMENT.md)
- [Quadro de trabalho](../governance/missions/0027/TASKS.md)

## Catálogo documental SCP

Documentos vinculados à tarefa raiz 33 e disponíveis no visualizador de `/tasks/33`:
- Solicitação original — versão 1, PUBLISHED.
- TR — versão 2, VALIDATED.
- Blueprint — versão 2, READY, derivado da versão 2 do TR.

As versões históricas anteriores foram preservadas; as versões atuais corrigem o tipo de autoria para HUMAN, conforme o contrato do SCP.

Cada WP deve gerar Operational Report (OR) e persistir evidências no diretório da missão.
