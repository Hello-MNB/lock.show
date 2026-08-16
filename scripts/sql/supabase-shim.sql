-- ============================================================
-- SUPABASE SHIM — the minimum of a Supabase database that migrations
-- 001–042 actually reference, recreated on a stock PostgreSQL 16 so the
-- migration SQL can be EXECUTED locally instead of only asserted about.
--
-- FAITHFUL ON PURPOSE:
--   · the three PostgREST roles exist for real (anon / authenticated /
--     service_role), service_role carries BYPASSRLS exactly as Supabase's does
--   · ALTER DEFAULT PRIVILEGES reproduces Supabase's "every new table in
--     public is granted to the three roles" behaviour, so a REVOKE inside a
--     migration is a real revoke of a real grant and not a no-op
--   · auth.uid() reads request.jwt.claim.sub, so `set_config` in a test
--     session is the local stand-in for a JWT
--
-- NOT FAITHFUL (say it plainly — these stay RUNTIME-UNVERIFIED):
--   · PostgREST itself: schema exposure, the ?select= column filter, and the
--     role switching an actual request performs
--   · GoTrue: real JWT verification and claims beyond `sub`
--   · the real production data
-- ============================================================

create extension if not exists pgcrypto;

do $$ begin create role anon nologin noinherit; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin noinherit; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin noinherit bypassrls; exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
-- Supabase ALSO grants EXECUTE on every new function in public to the three
-- roles. Reproducing it is what makes `revoke ... from public` visibly
-- INSUFFICIENT here: PUBLIC loses nothing that anon/authenticated still hold
-- explicitly. A migration must revoke from the named roles too.
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

-- ── auth ────────────────────────────────────────────────────────────────────
create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user::text)
$$;

grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
grant select on auth.users to anon, authenticated, service_role;

-- ── storage (001 seeds buckets and writes object policies) ──────────────────
create schema if not exists storage;
grant usage on schema storage to anon, authenticated, service_role;

create table if not exists storage.buckets (
  id     text primary key,
  name   text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id       uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name      text,
  owner     uuid,
  created_at timestamptz not null default now()
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to anon, authenticated, service_role;
grant select on storage.buckets to anon, authenticated, service_role;
