-- Validates one interaction per row and prevents deletion of a parent block.
INSERT INTO sofia.users DEFAULT VALUES RETURNING id AS fixture_user_id \gset

INSERT INTO sofia."textContexts" ("ownerId", "contextType")
VALUES (:fixture_user_id, 'conversation')
RETURNING id AS fixture_context_id \gset

INSERT INTO sofia."textBlocks" ("contextId", "ownerId", "operatorContent", "assistantContent", "responseStatus")
VALUES (:fixture_context_id, :fixture_user_id, 'Pergunta de teste', 'Resposta de teste', 'replied')
RETURNING id AS fixture_parent_block_id \gset

INSERT INTO sofia."textBlocks" ("contextId", "ownerId", "parentBlockId", "operatorContent", "assistantContent", "responseStatus")
VALUES (:fixture_context_id, :fixture_user_id, :fixture_parent_block_id, 'Segunda pergunta', 'Segunda resposta', 'replied');

CREATE TEMP TABLE text_block_fixture_ids (parent_id integer NOT NULL);
INSERT INTO text_block_fixture_ids (parent_id) VALUES (:fixture_parent_block_id);

DO $block$
DECLARE
  v_parent_id integer;
BEGIN
  SELECT f.parent_id INTO v_parent_id FROM pg_temp.text_block_fixture_ids f;
  BEGIN
    DELETE FROM sofia."textBlocks" WHERE id = v_parent_id;
    RAISE EXCEPTION 'Parent text block deletion unexpectedly succeeded';
  EXCEPTION
    WHEN foreign_key_violation THEN
      NULL;
  END;
END $block$;
