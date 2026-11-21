-- Add context-aware options to the Messenger and preserve message origin separately
-- from the semantic message type. Safe to execute repeatedly during database bootstrap.

ALTER TABLE "sofia"."messageTypes"
  ADD COLUMN IF NOT EXISTS "uiLabel" varchar(80),
  ADD COLUMN IF NOT EXISTS "contexts" varchar(16)[] NOT NULL DEFAULT ARRAY['general', 'mission']::varchar(16)[],
  ADD COLUMN IF NOT EXISTS "isUserSelectable" boolean NOT NULL DEFAULT true;

ALTER TABLE "sofia"."messages"
  ADD COLUMN IF NOT EXISTS "origin" varchar(16) NOT NULL DEFAULT 'internal';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'messageTypes_contexts_allowed_check'
      AND conrelid = '"sofia"."messageTypes"'::regclass
  ) THEN
    ALTER TABLE "sofia"."messageTypes"
      ADD CONSTRAINT "messageTypes_contexts_allowed_check"
      CHECK ("contexts" <@ ARRAY['general', 'mission']::varchar(16)[]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'messages_origin_allowed_check'
      AND conrelid = '"sofia"."messages"'::regclass
  ) THEN
    ALTER TABLE "sofia"."messages"
      ADD CONSTRAINT "messages_origin_allowed_check"
      CHECK ("origin" IN ('internal', 'external'));
  END IF;
END $$;

-- Initialize existing records once. Later administrative adjustments are preserved.
UPDATE "sofia"."messageTypes"
SET
  "uiLabel" = CASE "name"
    WHEN 'Instruction' THEN 'Instrução'
    WHEN 'Report' THEN 'Relatório'
    WHEN 'Question' THEN 'Pergunta'
    WHEN 'Message' THEN 'Mensagem'
    WHEN 'Order' THEN 'Ordem'
    WHEN 'Reply' THEN 'Resposta'
    WHEN 'CreateTask' THEN 'Criar missão'
    ELSE "name"
  END,
  "contexts" = CASE "name"
    WHEN 'Instruction' THEN ARRAY['mission']::varchar(16)[]
    WHEN 'Report' THEN ARRAY['mission']::varchar(16)[]
    WHEN 'Question' THEN ARRAY['general', 'mission']::varchar(16)[]
    WHEN 'Message' THEN ARRAY['general', 'mission']::varchar(16)[]
    WHEN 'Order' THEN ARRAY['mission']::varchar(16)[]
    WHEN 'Reply' THEN ARRAY['general', 'mission']::varchar(16)[]
    WHEN 'CreateTask' THEN ARRAY['general']::varchar(16)[]
    ELSE "contexts"
  END,
  "isUserSelectable" = CASE WHEN "name" = 'Instruction' THEN false ELSE "isUserSelectable" END
WHERE "uiLabel" IS NULL;
