-- Sandbox only: keep legacy ACTION_PLAN APIs compatible without using them as a dispatch gate.
INSERT INTO sandbox."missionDocumentTypes"
  ("typeKey", "label", "description", "category", "audience", "sortOrder", "isDefault", "renderer", "isActive")
VALUES
  ('ACTION_PLAN', 'Plano de ação legado (opcional)', 'Artefato legado opcional. Não autoriza, bloqueia nem condiciona a delegação; o BP é preparado pelo agente executor.', 'legacy', 'operator', 70, false, 'markdown', true)
ON CONFLICT ("typeKey") DO NOTHING;
