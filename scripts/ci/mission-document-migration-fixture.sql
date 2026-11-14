-- Minimal prerequisite schema for exercising migration 0010 in disposable PostgreSQL.
-- This is a CI fixture only; it is not a production schema migration.

CREATE ROLE anon;
CREATE ROLE authenticated;

CREATE SCHEMA sofia;

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
  "parentTaskId" integer REFERENCES sofia.tasks(id),
  "manusTaskId" varchar(128)
);

INSERT INTO sofia."taskStatuses" (name)
VALUES ('STAGED'), ('PROGRESS'), ('PAUSED');
