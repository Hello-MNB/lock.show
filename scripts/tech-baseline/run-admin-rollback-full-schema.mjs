import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const migrationDir = path.join(root, 'supabase', 'migrations')
const rollbackDir = path.join(root, 'supabase', 'rollback')
const approvedUserId = 'bd6af802-607c-4faf-93d4-e0a32f10804e'

const expectedDatabaseName = 'lock_show_test'
if (process.env.LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB !== expectedDatabaseName) {
  console.error(`DESTRUCTIVE_TEST_OPT_IN_REQUIRED: set LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB=${expectedDatabaseName}`)
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error('LOCAL_POSTGRES_REQUIRED: set DATABASE_URL')
  process.exit(1)
}

const databaseUrl = new URL(process.env.DATABASE_URL)
const databaseFromUrl = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''))
const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]'])
if (!localHosts.has(databaseUrl.hostname) || databaseFromUrl !== expectedDatabaseName) {
  console.error(`DISPOSABLE_LOCAL_DATABASE_REQUIRED: expected ${expectedDatabaseName} on localhost`)
  process.exit(1)
}

const command = process.env.PSQL_BIN || 'psql'
const baseArgs = [process.env.DATABASE_URL]

function runSql(sql, { singleTransaction = false, label = 'SQL' } = {}) {
  const args = [
    ...baseArgs,
    '--no-psqlrc', '--quiet', '--tuples-only', '--no-align',
    '--set', 'ON_ERROR_STOP=1',
  ]
  if (singleTransaction) args.push('--single-transaction')
  const result = spawnSync(command, args, {
    input: sql,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  })
  if (result.error) {
    throw new Error(`${label}: ${result.error.code ?? result.error.message}`)
  }
  if (result.status !== 0) {
    const detail = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
    throw new Error(`${label} failed\n${detail}`)
  }
  return (result.stdout ?? '').trim()
}

const databaseIdentity = runSql("select current_database() || '|' || host(inet_server_addr());", { label: 'database preflight' })
const [databaseName, serverAddress] = databaseIdentity.split('|')
if (databaseName !== expectedDatabaseName || !['127.0.0.1', '::1'].includes(serverAddress)) {
  throw new Error(`DISPOSABLE_LOCAL_DATABASE_REQUIRED: refusing destructive schema setup in ${databaseIdentity}`)
}

runSql(`
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
`, { label: 'Supabase-compatible test bootstrap' })

const migrations = fs.readdirSync(migrationDir)
  .filter((name) => name.endsWith('.sql'))
  .filter((name) => !name.endsWith('.down.sql'))
  // 018 is the historically failed migration explicitly repaired by 019.
  .filter((name) => name !== '018_professional_reaction.sql')
  .sort()

for (const name of migrations) {
  if (name === '20260824173241_explicit_hello_admin_grant.sql') {
    runSql(`
      insert into auth.users (id, email, email_confirmed_at)
      values ('${approvedUserId}', 'hello@lock.show', now());
    `, { label: 'approved Admin identity fixture' })
  }
  runSql(fs.readFileSync(path.join(migrationDir, name), 'utf8'), {
    singleTransaction: true,
    label: `forward migration ${name}`,
  })
}

function dependencySnapshot() {
  return runSql(`
    with direct_dependencies as (
      select 'DEPENDENCY'::text as kind,
             classid::regclass::text || '|' || objid::text || '|' || objsubid::text || '|' || deptype::text as identity
        from pg_depend
       where refobjid = 'public.is_operator()'::regprocedure
    ), policy_dependencies as (
      select 'POLICY'::text as kind,
             schemaname || '.' || tablename || '|' || policyname || '|' || cmd || '|' ||
             coalesce(array_to_string(roles, ','), '') || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '') as identity
        from pg_policies
       where coalesce(qual, '') like '%is_operator()%'
          or coalesce(with_check, '') like '%is_operator()%'
    ), routine_dependencies as (
      select 'ROUTINE'::text as kind,
             p.oid::regprocedure::text || '|' || md5(pg_get_functiondef(p.oid)) as identity
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.prokind in ('f', 'p')
         and p.oid <> 'public.is_operator()'::regprocedure
         and pg_get_functiondef(p.oid) like '%is_operator()%'
    )
    select kind || '|' || identity
      from (
        select * from direct_dependencies
        union all select * from policy_dependencies
        union all select * from routine_dependencies
      ) dependencies
     order by kind, identity;
  `, { label: 'complete is_operator dependency snapshot' })
}

const dependencySnapshotBefore = dependencySnapshot()

const positiveAdminResult = runSql(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${approvedUserId}', false);
  select public.is_operator();
  reset role;
`, { label: 'authenticated positive Admin fixture' }).split(/\r?\n/).at(-1)
if (positiveAdminResult !== 't') throw new Error('positive_admin_fixture_denied')

const ordinaryAdminResult = runSql(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000099', false);
  select public.is_operator();
  reset role;
`, { label: 'authenticated ordinary-user fixture' }).split(/\r?\n/).at(-1)
if (ordinaryAdminResult !== 'f') throw new Error('ordinary_user_received_admin')

runSql(`
  reset request.jwt.claim.sub;
  do $$ begin
    if public.is_operator() then
      raise exception 'unauthorized_session_received_admin';
    end if;
  end $$;
`, { label: 'Admin positive and negative fixtures' })

runSql(fs.readFileSync(path.join(rollbackDir, '20260824173241_explicit_hello_admin_grant.sql'), 'utf8'), {
  singleTransaction: true,
  label: 'explicit Admin grant rollback',
})

runSql(`
  grant select on public.audit_log to authenticated;
  insert into public.audit_log (action) values ('rollback-regression-fixture');
`, { label: 'representative RLS fixture' })

const grantRollbackResult = runSql(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${approvedUserId}', false);
  select public.is_operator();
  reset role;
`, { label: 'authenticated explicit grant rollback readback' }).split(/\r?\n/).at(-1)
if (grantRollbackResult !== 'f') throw new Error('explicit_grant_rollback_left_admin_authority')

runSql(fs.readFileSync(path.join(rollbackDir, '20260820042812_environment_admin_membership.sql'), 'utf8'), {
  singleTransaction: true,
  label: 'base Admin authority rollback',
})

const dependencySnapshotAfter = dependencySnapshot()
if (dependencySnapshotAfter !== dependencySnapshotBefore) {
  throw new Error(`DEPENDENCY_GRAPH_CHANGED\nBEFORE:\n${dependencySnapshotBefore}\nAFTER:\n${dependencySnapshotAfter}`)
}

const authenticatedReadback = runSql(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${approvedUserId}', false);
  select public.is_operator();
  select count(*) from public.audit_log;
  do $$ begin
    begin
      perform public.approve_agency_upgrade(null);
      raise exception 'dependent_rpc_did_not_fail_closed';
    exception when others then
      if sqlerrm <> 'not authorized' then raise; end if;
    end;
  end $$;
  reset role;
`, { label: 'authenticated function, RLS and dependent RPC readback' }).split(/\r?\n/)
if (authenticatedReadback.at(-2) !== 'f' || authenticatedReadback.at(-1) !== '0') {
  throw new Error(`AUTHENTICATED_FAIL_CLOSED_READBACK_FAILED: ${authenticatedReadback.join('|')}`)
}

const readback = runSql(`
  do $$
  begin
    if to_regclass('public.environment_admin_membership') is not null then
      raise exception 'authority_table_survived_base_rollback';
    end if;
    if to_regprocedure('public.has_admin_capability(text,text)') is not null then
      raise exception 'capability_function_survived_base_rollback';
    end if;
    if to_regprocedure('public.is_operator()') is null then
      raise exception 'legacy_dependency_function_was_dropped';
    end if;
    if public.is_operator() then
      raise exception 'base_rollback_did_not_fail_closed';
    end if;
    if not has_function_privilege('authenticated', 'public.is_operator()', 'execute')
       or has_function_privilege('anon', 'public.is_operator()', 'execute') then
      raise exception 'legacy_function_acl_is_not_fail_closed';
    end if;
    if exists (
      select 1 from pg_proc p, lateral aclexplode(p.proacl) acl
       where p.oid = 'public.is_operator()'::regprocedure
         and acl.grantee = 0 and acl.privilege_type = 'EXECUTE'
    ) then
      raise exception 'public_can_execute_legacy_function';
    end if;
    if not exists (
      select 1
        from pg_proc p
       where p.oid = 'public.is_operator()'::regprocedure
         and p.prosecdef
         and p.provolatile = 's'
         and p.proconfig = array['search_path=""']
         and lower(pg_get_functiondef(p.oid)) like '%select false;%'
    ) then
      raise exception 'legacy_function_definition_readback_failed';
    end if;
  end $$;
  select 'ADMIN_ROLLBACK_FULL_SCHEMA_OK';
`, { label: 'base rollback schema, RLS and function readback' })

console.log(readback)
