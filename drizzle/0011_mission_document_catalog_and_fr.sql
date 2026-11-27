-- Sandbox mission artifact catalog: FR, checkpoint and handoff support.
-- Applied to the Sandbox Supabase project only.
INSERT INTO sandbox."missionDocumentTypes"
  ("typeKey", "label", "description", "category", "audience", "sortOrder", "isDefault", "renderer", "isActive")
VALUES
  ('ORIGINAL_REQUEST', 'Solicitação original', 'Registro-fonte imutável da solicitação que originou a missão.', 'origin', 'operator', 0, false, 'markdown', true),
  ('TR', 'TR — Termo de Referência', 'Entendimento e referência transacional da missão, evolutivo e sujeito à validação do operador.', 'context', 'operator', 10, true, 'markdown', true),
  ('BLUEPRINT', 'BP — Blueprint', 'Planejamento operacional da missão em etapas, preparado pelo agente executor após a delegação.', 'planning', 'executor', 20, false, 'markdown', true),
  ('FR', 'FR — Final Report', 'Relatório informativo do objetivo, desenvolvimento, conclusão e resultados da missão; evolui durante a execução.', 'report', 'operator', 25, false, 'markdown', true),
  ('OR', 'OR — Operational Report', 'Relatório operacional de cada etapa executada, com evidências, problemas e resultados.', 'execution', 'operator', 30, false, 'markdown', true),
  ('FOR', 'FOR — Final Operational Report', 'Consolidação progressiva dos ORs, problemas, soluções e aprendizados operacionais da missão.', 'closure', 'operator', 40, false, 'markdown', true),
  ('CHECKPOINT', 'Checkpoint', 'Estado persistido da execução, trabalho concluído, ponto atual e contexto necessário à continuidade.', 'execution', 'executor', 50, false, 'markdown', true),
  ('HANDOFF', 'Handoff', 'Passagem estruturada de contexto, estado, pendências e próxima ação entre agentes ou etapas.', 'execution', 'executor', 60, false, 'markdown', true)
ON CONFLICT ("typeKey") DO NOTHING;
