-- Minimal prerequisite schema for exercising migration 0010 in disposable PostgreSQL.
-- This is a CI fixture only; it is not a production schema migration.

CREATE ROLE anon;
CREATE ROLE authenticated;

CREATE SCHEMA sofia;
CREATE SCHEMA vault;
CREATE SCHEMA net;

CREATE TABLE vault.decrypted_secrets (name text PRIMARY KEY, decrypted_secret text);

CREATE TABLE sofia."taskStatuses" (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(32) NOT NULL UNIQUE
);

CREATE TABLE sofia."users" (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);

CREATE TABLE sofia."agents" (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);

CREATE TABLE sofia.tasks (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "statusId" integer REFERENCES sofia."taskStatuses"(id),
  "agentId" integer REFERENCES sofia."agents"(id),
  "parentTaskId" integer REFERENCES sofia.tasks(id),
  "createdBy" integer NOT NULL REFERENCES sofia."users"(id),
  title varchar(255) NOT NULL DEFAULT 'Fixture task',
  "manusTaskId" varchar(128)
);

INSERT INTO sofia."taskStatuses" (name)
VALUES ('STAGED'), ('PROGRESS'), ('PAUSED');

CREATE TABLE sofia.messages (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "taskId" integer NOT NULL REFERENCES sofia.tasks(id),
  "senderId" integer NOT NULL REFERENCES sofia."users"(id),
  "parentMessageId" integer,
  "typeId" integer NOT NULL,
  content text NOT NULL
);
