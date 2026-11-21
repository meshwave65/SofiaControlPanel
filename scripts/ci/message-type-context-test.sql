DO $$
DECLARE
  instruction_contexts varchar(16)[];
  instruction_selectable boolean;
  order_contexts varchar(16)[];
  create_task_contexts varchar(16)[];
  reply_contexts varchar(16)[];
  origin_default text;
BEGIN
  SELECT "contexts", "isUserSelectable"
    INTO instruction_contexts, instruction_selectable
    FROM sofia."messageTypes"
   WHERE "name" = 'Instruction';

  IF instruction_contexts IS DISTINCT FROM ARRAY['mission']::varchar(16)[]
     OR instruction_selectable IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Instruction must remain mission-only and hidden from user dropdowns';
  END IF;

  SELECT "contexts" INTO order_contexts
    FROM sofia."messageTypes" WHERE "name" = 'Order';
  IF order_contexts IS DISTINCT FROM ARRAY['mission']::varchar(16)[] THEN
    RAISE EXCEPTION 'Order must be available only in mission context';
  END IF;

  SELECT "contexts" INTO create_task_contexts
    FROM sofia."messageTypes" WHERE "name" = 'CreateTask';
  IF create_task_contexts IS DISTINCT FROM ARRAY['general']::varchar(16)[] THEN
    RAISE EXCEPTION 'CreateTask must be available only in general context';
  END IF;

  SELECT "contexts" INTO reply_contexts
    FROM sofia."messageTypes" WHERE "name" = 'Reply';
  IF reply_contexts IS DISTINCT FROM ARRAY['general', 'mission']::varchar(16)[] THEN
    RAISE EXCEPTION 'Reply must support both contexts; parent selection is enforced by the API';
  END IF;

  SELECT column_default INTO origin_default
    FROM information_schema.columns
   WHERE table_schema = 'sofia'
     AND table_name = 'messages'
     AND column_name = 'origin';
  IF origin_default IS NULL OR origin_default NOT LIKE '%internal%' THEN
    RAISE EXCEPTION 'messages.origin must default to internal; got %', origin_default;
  END IF;
END
$$;
