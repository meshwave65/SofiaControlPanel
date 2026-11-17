DO $$
DECLARE
  nullable_flag text;
BEGIN
  SELECT is_nullable
    INTO nullable_flag
    FROM information_schema.columns
   WHERE table_schema = 'sofia'
     AND table_name = 'messages'
     AND column_name = 'taskId';

  IF nullable_flag IS DISTINCT FROM 'YES' THEN
    RAISE EXCEPTION 'sofia.messages.taskId must accept NULL; got %', nullable_flag;
  END IF;
END
$$;
