-- Increment F: add the structured, versioned action-plan document type.
-- Uses the existing immutable mission-document tables; no new data table or RLS surface.
-- Apply only through the separately approved database migration procedure.

INSERT INTO "sofia"."missionDocumentTypes"
  ("typeKey", "label", "description", "category", "audience", "sortOrder", "isDefault", "renderer")
VALUES
  ('ACTION_PLAN', 'Plano de ação', 'Plano estruturado proposto pela SOFIA, vinculado ao Blueprint e sujeito à aprovação humana explícita.', 'planning', 'operator', 25, false, 'json')
ON CONFLICT ("typeKey") DO UPDATE
SET "label" = EXCLUDED."label",
    "description" = EXCLUDED."description",
    "category" = EXCLUDED."category",
    "audience" = EXCLUDED."audience",
    "sortOrder" = EXCLUDED."sortOrder",
    "renderer" = EXCLUDED."renderer",
    "isActive" = true,
    "updatedAt" = now();
