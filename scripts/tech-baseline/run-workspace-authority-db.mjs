import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const root = resolve(import.meta.dirname, '..', '..')
const migrationsDirectory = resolve(root, 'supabase', 'migrations')
const rollbackDirectory = resolve(root, 'supabase', 'rollback')
const migrations = readdirSync(migrationsDirectory).filter((name) => name.endsWith('_workspace_authority.sql'))

if (migrations.length !== 1) {
  throw new Error(`APP_SHELL_MIGRATION_MISSING:expected=1:observed=${migrations.length}`)
}

const container = process.env.POSTGRES_CONTAINER_ID
if (!container) {
  throw new Error('POSTGRES_CONTAINER_ID_REQUIRED')
}

const postgresVersion = execFileSync('docker', ['exec', container, 'postgres', '--version'], { encoding: 'utf8' }).trim()
if (!postgresVersion.includes('17.6')) {
  throw new Error(`POSTGRES_VERSION_DRIFT:${postgresVersion}`)
}

const psqlArgs = ['exec', '-i', container, 'psql', '--no-psqlrc', '-v', 'ON_ERROR_STOP=1', '-U', 'lock_show_test', '-d', 'lock_show_test']

function runSql(sql, label) {
  try {
    execFileSync('docker', psqlArgs, {
      input: sql,
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit'],
      maxBuffer: 24 * 1024 * 1024,
    })
  } catch (error) {
    throw new Error(`${label}:${error.status ?? error.message}`, { cause: error })
  }
}

runSql(`
  drop schema if exists public cascade;
  drop schema if exists auth cascade;
  drop schema if exists storage cascade;
  create schema public;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
    if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
  end $$;
  create schema auth;
  grant usage on schema public, auth to anon, authenticated;
  create table auth.users (
    id uuid primary key, email text, email_confirmed_at timestamptz,
    deleted_at timestamptz, banned_until timestamptz,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );
  create or replace function auth.uid() returns uuid language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean not null default false);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`, 'Supabase-compatible bootstrap')

const forwardMigrations = readdirSync(migrationsDirectory)
  .filter((name) => name.endsWith('.sql') && !name.endsWith('.down.sql'))
  .filter((name) => name !== '018_professional_reaction.sql')
  .sort()

for (const name of forwardMigrations) {
  if (name === '20260824173241_explicit_hello_admin_grant.sql') {
    runSql(`
      insert into auth.users(id,email,email_confirmed_at)
      values('bd6af802-607c-4faf-93d4-e0a32f10804e','hello@lock.show',now());
    `, 'Admin identity fixture')
  }
  runSql(readFileSync(resolve(migrationsDirectory, name), 'utf8'), `migration:${name}`)
}

runSql(readFileSync(resolve(root, 'supabase', 'tests', 'tech-baseline', 'workspace-authority.sql'), 'utf8'),
  'workspace authority SQL contract')

runSql(`
  delete from public.workspace_authority_receipt;
  delete from public.role_assignment where person_id::text like '10000000-0000-4000-8000-%';
  delete from public.active_role_context where person_id::text like '10000000-0000-4000-8000-%';
  delete from public.organization_membership where organization_id::text like '20000000-0000-4000-8000-%';
  delete from public.subscription where organization_id::text like '20000000-0000-4000-8000-%';
  delete from public.organization where id::text like '20000000-0000-4000-8000-%';
  delete from public.person where id::text like '10000000-0000-4000-8000-%';
  delete from auth.users where id::text like '10000000-0000-4000-8000-%';
`, 'workspace authority rollback fixture reconciliation')

runSql(readFileSync(resolve(rollbackDirectory, '20260825005702_workspace_authority.sql'), 'utf8'),
  'workspace authority rollback')
runSql(`
  do $$ begin
    if to_regclass('public.workspace_authority_receipt') is not null then
      raise exception 'workspace_authority_receipt_survived_rollback';
    end if;
    if to_regprocedure('public.resolve_primary_workspace(text)') is not null
       or to_regprocedure('public.commit_workspace_context(uuid,bigint,uuid,text)') is not null
       or to_regprocedure('public.decline_workspace_invitation(text)') is not null then
      raise exception 'workspace_authority_function_survived_rollback';
    end if;
    if exists (select 1 from information_schema.columns
      where table_schema='public' and table_name='organization_membership' and column_name='authority_version') then
      raise exception 'workspace_authority_column_survived_rollback';
    end if;
    if to_regprocedure('public.accept_invite(text)') is null then
      raise exception 'legacy_accept_invite_not_restored';
    end if;
  end $$;
  select 'APP_SHELL_WORKSPACE_AUTHORITY_ROLLBACK_OK' as result;
`, 'workspace authority rollback readback')

console.log('APP_SHELL_WORKSPACE_AUTHORITY_DB_OK')
