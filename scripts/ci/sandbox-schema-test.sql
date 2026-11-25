DO $$
DECLARE
  table_count integer;
  rls_count integer;
  policy_count integer;
  row_count bigint;
BEGIN
  SELECT count(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'sandbox' AND table_type = 'BASE TABLE';

  SELECT count(*) INTO rls_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'sandbox' AND c.relkind = 'r' AND c.relrowsecurity;

  SELECT count(*) INTO policy_count
  FROM pg_policies WHERE schemaname = 'sandbox';

  SELECT coalesce(sum(n_live_tup), 0) INTO row_count
  FROM pg_stat_user_tables WHERE schemaname = 'sandbox';

  IF table_count <> 25 THEN
    RAISE EXCEPTION 'Expected 25 sandbox tables, found %', table_count;
  END IF;
  IF rls_count <> 25 THEN
    RAISE EXCEPTION 'Expected RLS on all 25 tables, found %', rls_count;
  END IF;
  IF policy_count <> 0 THEN
    RAISE EXCEPTION 'Expected no client policies (deny-by-default), found %', policy_count;
  END IF;
  IF row_count <> 0 THEN
    RAISE EXCEPTION 'Expected zero copied application rows, estimated %', row_count;
  END IF;
END;
$$;
