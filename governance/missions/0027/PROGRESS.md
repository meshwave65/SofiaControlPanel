# Progresso — MISSION_0027

## 2026-11-17 — Registro, aprovação e abertura da execução

- Missão MISSION_0027 criada em `sofia.governanceMissions`, status PROGRESS.
- Solicitação original e avaliação técnica inicial registradas.
- Projeto original `ncklrs/claude-chrome-user-testing` inspecionado: licença MIT, 25 personas em seis categorias e 75 variantes; o acoplamento ao Claude está no adaptador `claude --chrome`.
- Alternativa técnica inicial: Playwright + axe-core, com Lighthouse CI como complemento.
- O SCP atual despacha tarefas por `manusExecutionService.ts`; não foi identificado adaptador Playwright nativo no orquestrador.
- O catálogo `public.skills` contém 8 competências genéricas; `public.personas` contém 6 papéis de agentes e `public.persona_skills` 9 associações. Não são personas de UX e não estão integrados ao runtime do SCP.
- As três tabelas públicas estão com RLS desabilitado e permitem SELECT a `anon` e `authenticated`; revisar antes de adicionar conteúdo privado. Nenhuma alteração de políticas foi feita.
- Render confirma `SofiaControlPanel-web` ativo no plano Free; a interface ainda não foi exercitada por navegador interativo.
- 2026-11-17: responsável autorizou a execução e aprovou expressamente o TR v0.1.0.
- TR aprovado publicado em `TR-v0.1.0-APPROVED.md`; versão VALIDATED original persistida no Supabase (version_id 6).
- Blueprint v1.0.0 READY publicado; versão original persistida derivada do TR (version_id 7).
- Tarefa operacional criada: `SCP-TASK-000032` (id interno 33), estado STAGED, prioridade ALTA, sem agente fixo.
- **Correção do catálogo documental (2026-11-17):** a interface TaskDetail já contém visualizador documental no deploy ativo. A primeira gravação manual usou `authorType='user'`, valor incompatível com o contrato do SCP (`HUMAN | SOFIA | AGENT`). Como versões são imutáveis, as versões antigas foram preservadas e foram criadas novas versões válidas:
  - Solicitação original: documento 8, versão 1, PUBLISHED, autoria HUMAN (version_id 10).
  - TR: documento 6, versão 2, VALIDATED, autoria HUMAN (version_id 8).
  - Blueprint: documento 7, versão 2, READY, autoria HUMAN, vinculado à versão 2 do TR (version_id 9).
- Consulta de verificação confirmou os três documentos no catálogo da tarefa raiz 33 e os estados/relacionamentos esperados.
- O serviço Render está configurado com autoDeploy desligado; não foi realizado deploy. O código do visualizador já existe no commit atualmente ativo.
- Nenhum crédito Manus/TinyFish foi consumido; nenhum serviço pago contratado; nenhuma alteração de produção ou deploy realizado.

## Execução autorizada — próximos passos

1. WP27.1 e WP27.2: inventário dos sistemas e auditoria do projeto original.
2. WP27.3: confirmar motor e custo operacional sem serviços pagos.
3. WP27.4: especificar skill modular e integração com SCP.
4. WP27.5: piloto não destrutivo e persistência de evidências.
5. WP27.6–27.7: auditoria expandida e relatório consolidado.
