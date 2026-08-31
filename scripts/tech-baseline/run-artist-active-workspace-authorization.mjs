import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Client } = pg
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const migrationDir = path.join(root, 'supabase', 'migrations')
const rollbackFile = path.join(root, 'supabase', 'rollback', '20260830202149_artist_active_workspace_authorization.sql')
const testFile = path.join(root, 'supabase', 'tests', 'tech-baseline', 'artist-active-workspace-authorization.sql')
const expectedDatabaseName = 'lock_show_artist_authz_test'

if (process.env.LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB !== expectedDatabaseName) {
  throw new Error(`DESTRUCTIVE_TEST_OPT_IN_REQUIRED: set LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB=${expectedDatabaseName}`)
}
if (!process.env.DATABASE_URL) throw new Error('LOCAL_POSTGRES_REQUIRED: set DATABASE_URL')

const databaseUrl = new URL(process.env.DATABASE_URL)
const databaseFromUrl = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''))
if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(databaseUrl.hostname)
    || databaseFromUrl !== expectedDatabaseName
    || databaseUrl.search !== '') {
  throw new Error(`DISPOSABLE_LOCAL_DATABASE_REQUIRED: expected ${expectedDatabaseName} on localhost without URL overrides`)
}

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

async function run(sql, label) {
  try {
    return await client.query(sql)
  } catch (error) {
    error.message = `${label}: ${error.message}`
    throw error
  }
}

try {
  const database = await run('select current_database() as name', 'database preflight')
  if (database.rows[0]?.name !== expectedDatabaseName) {
    throw new Error(`DISPOSABLE_LOCAL_DATABASE_REQUIRED: refusing schema reset in ${database.rows[0]?.name}`)
  }

  await run(`
    drop schema if exists public cascade;
    drop schema if exists auth cascade;
    drop schema if exists storage cascade;
    create schema public;
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
    end $$;
    create schema auth;
    grant usage on schema public, auth to anon, authenticated;
    create table auth.users (
      id uuid primary key,
      email text,
      email_confirmed_at timestamptz,
      deleted_at timestamptz,
      banned_until timestamptz,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create or replace function auth.uid()
    returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text not null, public boolean not null default false);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
  `, 'Supabase-compatible test bootstrap')

  const migrations = fs.readdirSync(migrationDir)
    .filter((name) => name.endsWith('.sql') && !name.endsWith('.down.sql'))
    .filter((name) => name !== '018_professional_reaction.sql')
    .sort()

  for (const name of migrations) {
    if (name === '20260824173241_explicit_hello_admin_grant.sql') {
      await run(`
        insert into auth.users (id, email, email_confirmed_at)
        values ('bd6af802-607c-4faf-93d4-e0a32f10804e', 'hello@lock.show', now())
        on conflict (id) do nothing;
      `, 'approved Admin identity fixture')
    }
    await run('begin', `begin ${name}`)
    try {
      await run(fs.readFileSync(path.join(migrationDir, name), 'utf8'), `forward migration ${name}`)
      await run('commit', `commit ${name}`)
    } catch (error) {
      await client.query('rollback')
      throw error
    }
  }

  const result = await run(fs.readFileSync(testFile, 'utf8'), 'artist active-workspace direct-call test')
  const statements = Array.isArray(result) ? result : [result]
  if (!statements.some((statement) => statement.rows?.[0]?.result === 'ARTIST_ACTIVE_WORKSPACE_AUTHZ_OK')) {
    throw new Error('ARTIST_ACTIVE_WORKSPACE_AUTHZ_READBACK_MISSING')
  }
  console.log('Artist active-workspace PostgreSQL authorization: 12/12 passed')

  await run('begin', 'begin authorization rollback')
  try {
    await run(fs.readFileSync(rollbackFile, 'utf8'), 'authorization rollback')
    await run('commit', 'commit authorization rollback')
  } catch (error) {
    await client.query('rollback')
    throw error
  }

  const rollback = await run(`
    select
      to_regprocedure('public.get_my_artist_for_active_workspace()') is null as rpc_removed,
      to_regprocedure('public.active_workspace_id()') is null as context_helper_removed,
      to_regprocedure('public.can_access_artist(uuid)') is not null as legacy_access_restored,
      exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'artists' and policyname = 'artists_org'
          and qual like '%current_org_ids()%'
      ) as legacy_policy_restored;
  `, 'authorization rollback readback')
  if (!Object.values(rollback.rows[0] || {}).every(Boolean)) {
    throw new Error(`ARTIST_AUTHZ_ROLLBACK_READBACK_FAILED: ${JSON.stringify(rollback.rows[0])}`)
  }
  console.log('Artist authorization rollback law: 4/4 passed')
} finally {
  await client.end()
}
