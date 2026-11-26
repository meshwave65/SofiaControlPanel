-- Disposable PostgreSQL stubs for Supabase-managed extensions used by migration 002.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS net;
CREATE SCHEMA IF NOT EXISTS vault;
CREATE SCHEMA IF NOT EXISTS cron;
CREATE SCHEMA IF NOT EXISTS storage;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION extensions.gen_random_bytes(p_length integer)
RETURNS bytea LANGUAGE sql IMMUTABLE
AS $$ SELECT decode(repeat('ab', p_length), 'hex') $$;

CREATE TABLE IF NOT EXISTS vault.decrypted_secrets (
  name text PRIMARY KEY,
  decrypted_secret text NOT NULL
);

CREATE OR REPLACE FUNCTION vault.create_secret(
  new_secret text,
  new_name text DEFAULT NULL,
  new_description text DEFAULT '',
  new_key_id uuid DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO vault.decrypted_secrets(name,decrypted_secret)
  VALUES (new_name,new_secret)
  ON CONFLICT (name) DO UPDATE SET decrypted_secret=EXCLUDED.decrypted_secret;
  RETURN gen_random_uuid();
END;
$$;

CREATE OR REPLACE FUNCTION net.http_post(
  url text,
  body jsonb DEFAULT '{}'::jsonb,
  params jsonb DEFAULT '{}'::jsonb,
  headers jsonb DEFAULT '{"Content-Type":"application/json"}'::jsonb,
  timeout_milliseconds integer DEFAULT 5000
)
RETURNS bigint LANGUAGE sql
AS $$ SELECT 1::bigint $$;

CREATE TABLE IF NOT EXISTS cron.job (
  jobid bigserial PRIMARY KEY,
  jobname text UNIQUE,
  schedule text,
  command text
);

CREATE OR REPLACE FUNCTION cron.schedule(job_name text, schedule text, command text)
RETURNS bigint LANGUAGE plpgsql
AS $$
DECLARE v_id bigint;
BEGIN
  INSERT INTO cron.job(jobname,schedule,command)
  VALUES(job_name,schedule,command)
  ON CONFLICT(jobname) DO UPDATE SET schedule=EXCLUDED.schedule,command=EXCLUDED.command
  RETURNING jobid INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION cron.unschedule(p_jobid bigint)
RETURNS boolean LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM cron.job WHERE jobid=p_jobid;
  RETURN FOUND;
END;
$$;

CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false
);
