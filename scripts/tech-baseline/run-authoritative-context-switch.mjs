import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

const { Client } = pg
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const migrationDir = path.join(root, 'supabase', 'migrations')
const rollbackFile = path.join(root, 'supabase', 'rollback', '20260830220500_authoritative_context_switch.sql')
const testFile = path.join(root, 'supabase', 'tests', 'tech-baseline', 'authoritative-context-switch.sql')
// --ci uses the exact disposable database already provisioned by verify.yml.
// Both modes require an exact matching opt-in, localhost, version and encoding.
const expectedDatabaseName = process.argv.includes('--ci') ? 'lock_show_test' : 'lock_show_context_switch_test'

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

// Real multi-connection regressions: a response fixture cannot exercise locks.
async function verifyContextConsistency() {
  const actor = '51000000-0000-4000-8000-000000000001'
  const first = '52000000-0000-4000-8000-000000000001'
  const second = '52000000-0000-4000-8000-000000000002'
  const oldKey = '54000000-0000-4000-8000-000000000001'
  const reverseKey = '54000000-0000-4000-8000-000000000002'
  const concurrentKey = '54000000-0000-4000-8000-000000000003'
  await run(`
    insert into auth.users (id,email) values ('${actor}','consistency@example.test');
    insert into public.person (id,email) values ('${actor}','consistency@example.test');
    insert into public.organization (id,name,plan,workspace_type) values
      ('${first}','Consistency A','solo','artist'), ('${second}','Consistency B','solo','artist');
    insert into public.organization_membership (organization_id,person_id,org_role,status)
      values ('${first}','${actor}','owner','active'), ('${second}','${actor}','owner','active');
    insert into public.role_assignment (organization_id,person_id,functional_role)
      values ('${first}','${actor}','artist'), ('${second}','${actor}','artist');
    insert into public.active_role_context (person_id,active_organization_id,context_version)
      values ('${actor}','${first}',0);
  `, 'consistency fixtures')
  const connections = []
  const connect = async () => {
    const connection = new Client({ connectionString: process.env.DATABASE_URL })
    await connection.connect()
    connections.push(connection)
    await connection.query(`set statement_timeout = '10s'; set request.jwt.claim.sub = '${actor}'; set role authenticated`)
    return connection
  }
  const errors = []
  const check = async (name, fn) => {
    try { await fn(); console.log(`PASS ${name}`) }
    catch (error) { errors.push(error); console.error(`FAIL ${name}: ${error.message}`) }
  }
  const commit = (connection, target, version, key) => connection.query(
    'select * from public.commit_context_switch($1,null,$2,$3)', [target, version, key],
  )
  try {
    const caller = await connect()
    await commit(caller, second, 0, oldKey)
    await commit(caller, first, 1, reverseKey)
    await check('19 old-key replay after later commit is non-current; immutable history remains', async () => {
      await assert.rejects(commit(caller, second, 0, oldKey), /context_switch_stale/)
      assert.equal((await caller.query('select * from public.get_context_switch_receipt($1)', [oldKey])).rowCount, 0)
      const history = await client.query('select count(*)::int as n from public.context_switch_receipt where person_id=$1', [actor])
      assert.equal(history.rows[0].n, 2)
      const current = await caller.query('select active_organization_id,context_version from public.active_role_context')
      assert.equal(current.rows[0].active_organization_id, first)
      assert.equal(Number(current.rows[0].context_version), 2)
    })
    await check('20 concurrent identical commits return one receipt and one version increment', async () => {
      const left = await connect()
      const right = await connect()
      const pids = [left.processID, right.processID]
      await client.query('begin')
      await client.query('select * from public.active_role_context where person_id=$1 for update', [actor])
      const pending = Promise.allSettled([
        commit(left, second, 2, concurrentKey), commit(right, second, 2, concurrentKey),
      ])
      try {
        const deadline = Date.now() + 5000
        let waiting = 0
        do {
          // Use the disposable owner to observe both actual blocked sessions.
          await client.query('select pg_stat_clear_snapshot()')
          const ownerObserved = await client.query("select count(*)::int as n from pg_stat_activity where pid=any($1::int[]) and wait_event_type='Lock'", [pids])
          waiting = ownerObserved.rows[0].n
          if (waiting === 2) break
          await delay(20)
        } while (Date.now() < deadline)
        assert.equal(waiting, 2, 'both requests must overlap while blocked on the per-person lock')
      } finally {
        await client.query('commit')
      }
      const outcomes = await pending
      assert.deepEqual(outcomes.map((item) => item.status), ['fulfilled','fulfilled'],
        outcomes.map((item) => item.reason?.message || '').join(';'))
      assert.equal(outcomes[0].value.rows[0].receipt_id, outcomes[1].value.rows[0].receipt_id)
      const readback = await client.query(`select context_version,
        (select count(*)::int from public.context_switch_receipt where person_id=$1 and idempotency_key=$2) as receipts
        from public.active_role_context where person_id=$1`, [actor, concurrentKey])
      assert.equal(Number(readback.rows[0].context_version), 3)
      assert.equal(readback.rows[0].receipts, 1)
    })
  } finally {
    await client.query('rollback')
    await Promise.all(connections.map((connection) => connection.end()))
  }
  if (errors.length) throw new AggregateError(errors, `CONTEXT_CONSISTENCY=${2 - errors.length}/2`)
  console.log('CONTEXT_CONSISTENCY=2/2')
}

async function verifyNoncommitOutcomes() {
  const actor = '61000000-0000-4000-8000-000000000001'
  const other = '61000000-0000-4000-8000-000000000002'
  const first = '62000000-0000-4000-8000-000000000001'
  const second = '62000000-0000-4000-8000-000000000002'
  const key = (n) => `64000000-0000-4000-8000-${String(n).padStart(12, '0')}`
  await run(`
    insert into auth.users(id,email) values ('${actor}','outcome@example.test'),('${other}','other-outcome@example.test');
    insert into public.person(id,email) values ('${actor}','outcome@example.test'),('${other}','other-outcome@example.test');
    insert into public.organization(id,name,plan,workspace_type) values
      ('${first}','Outcome A','solo','artist'),('${second}','Outcome B','solo','artist');
    insert into public.organization_membership(organization_id,person_id,org_role,status) values
      ('${first}','${actor}','owner','active'),('${second}','${actor}','owner','active');
    insert into public.role_assignment(organization_id,person_id,functional_role) values
      ('${first}','${actor}','artist'),('${second}','${actor}','artist');
    insert into public.active_role_context(person_id,active_organization_id,context_version) values
      ('${actor}','${first}',0),('${other}','${first}',0);
  `, 'noncommit outcome fixtures')
  const connections = []
  const connect = async (person = actor) => {
    const connection = new Client({ connectionString: process.env.DATABASE_URL })
    await connection.connect()
    connections.push(connection)
    await connection.query(`set statement_timeout='10s'; set request.jwt.claim.sub='${person}'; set role authenticated`)
    return connection
  }
  const commit = (connection, target, version, requestKey) => connection.query(
    'select * from public.commit_context_switch($1,null,$2,$3)', [target, version, requestKey])
  const resolve = async (connection, target, version, requestKey) => (await connection.query(
    'select public.resolve_context_switch_outcome($1,null,$2,$3) as outcome', [target, version, requestKey])).rows[0].outcome
  const state = async () => (await client.query(`select active_organization_id,context_version,
    (select count(*)::int from public.context_switch_receipt where person_id=$1) as receipts
    from public.active_role_context where person_id=$1`, [actor])).rows[0]
  const waitForLock = async (connection) => {
    const deadline = Date.now() + 5000
    do {
      await client.query('select pg_stat_clear_snapshot()')
      const result = await client.query("select wait_event_type from pg_stat_activity where pid=$1", [connection.processID])
      if (result.rows[0]?.wait_event_type === 'Lock') return
      await delay(20)
    } while (Date.now() < deadline)
    assert.fail('concurrent request was not observed waiting on the actor lock')
  }
  let passed = 0
  const check = async (name, fn) => { await fn(); passed++; console.log(`PASS NONCOMMIT ${name}`) }
  try {
    const caller = await connect()
    await check('1 never-received request is durably fenced; retry and late commit preserve context/version', async () => {
      const before = await state()
      assert.equal((await caller.query('select * from public.get_context_switch_receipt($1)', [key(1)])).rowCount, 0)
      const outcome = await resolve(caller, second, 0, key(1))
      assert.equal(outcome.outcome, 'not_committed')
      assert.equal(outcome.expectedContextVersion, 0)
      assert.equal(outcome.contextVersion, 0)
      assert.ok(outcome.outcomeId && outcome.resolvedAt)
      assert.deepEqual(await resolve(caller, second, 0, key(1)), outcome)
      await assert.rejects(commit(caller, second, 0, key(1)), /context_switch_conflict/)
      await assert.rejects(resolve(caller, first, 0, key(1)), /context_switch_conflict/)
      assert.deepEqual(await state(), before)
    })
    await check('2 rolled-back original request resolves noncommit without retaining a false receipt', async () => {
      const before = await state()
      await caller.query('begin')
      await commit(caller, second, 0, key(2))
      await caller.query('rollback')
      assert.equal((await resolve(caller, second, 0, key(2))).outcome, 'not_committed')
      await assert.rejects(commit(caller, second, 0, key(2)), /context_switch_conflict/)
      assert.deepEqual(await state(), before)
    })
    await check('3 inflight commit wins lock; recovery waits and returns its exact committed receipt', async () => {
      const original = await connect()
      const recovery = await connect()
      await original.query('begin')
      const receipt = (await commit(original, second, 0, key(3))).rows[0]
      const pending = resolve(recovery, second, 0, key(3))
      try { await waitForLock(recovery) } finally { await original.query('commit') }
      const outcome = await pending
      assert.equal(outcome.outcome, 'committed')
      assert.equal(outcome.receipt.id, receipt.receipt_id)
      assert.equal(outcome.receipt.context_version, 1)
      assert.equal((await state()).receipts, 1)
      assert.equal(Number((await state()).context_version), 1)
    })
    await check('4 recovery wins lock; delayed original waits then is fenced without a context increment', async () => {
      const recovery = await connect()
      const original = await connect()
      const before = await state()
      await recovery.query('begin')
      const fence = await resolve(recovery, first, 1, key(4))
      const pending = commit(original, first, 1, key(4)).then(
        () => ({ committed: true }), (error) => ({ error: error.message }))
      try { await waitForLock(original) } finally { await recovery.query('commit') }
      assert.match((await pending).error, /context_switch_conflict/)
      assert.deepEqual(await resolve(caller, first, 1, key(4)), fence)
      assert.deepEqual(await state(), before)
    })
    await check('5 inflight original rollback releases the lock to a terminal noncommit fence', async () => {
      const original = await connect()
      const recovery = await connect()
      const before = await state()
      await original.query('begin')
      await commit(original, first, 1, key(5))
      const pending = resolve(recovery, first, 1, key(5))
      try { await waitForLock(recovery) } finally { await original.query('rollback') }
      assert.equal((await pending).outcome, 'not_committed')
      await assert.rejects(commit(caller, first, 1, key(5)), /context_switch_conflict/)
      assert.deepEqual(await state(), before)
    })
    await check('6 old REPEATABLE READ/SERIALIZABLE snapshots cannot overlook a newly committed fence', async () => {
      for (const [index, isolation] of ['repeatable read', 'serializable'].entries()) {
        const original = await connect()
        const before = await state()
        await original.query(`begin isolation level ${isolation}`)
        await original.query('select * from public.active_role_context')
        assert.equal((await resolve(caller, first, 1, key(6 + index))).outcome, 'not_committed')
        await assert.rejects(commit(original, first, 1, key(6 + index)), { code: '40001' })
        await original.query('rollback')
        await assert.rejects(commit(original, first, 1, key(6 + index)), /context_switch_conflict/)
        assert.deepEqual(await state(), before)
      }
    })
    await check('7 actor/key isolation, anonymous/direct-write denial and immutable receipt history', async () => {
      const stranger = await connect(other)
      const before = await state()
      const victim = await resolve(caller, second, 0, key(3))
      const independent = await resolve(stranger, second, 0, key(3))
      assert.equal(victim.outcome, 'committed')
      assert.equal(independent.outcome, 'not_committed')
      assert.equal(independent.receipt, undefined)
      assert.notEqual(independent.outcomeId, victim.receipt.id)
      assert.equal((await stranger.query('select * from public.context_switch_receipt where idempotency_key=$1', [key(3)])).rowCount, 0)
      await assert.rejects(stranger.query('select * from private.context_switch_noncommit'), /permission denied/)
      await assert.rejects(stranger.query('delete from private.context_switch_noncommit'), /permission denied/)
      await stranger.query("reset role; set role anon; set request.jwt.claim.sub=''")
      await assert.rejects(resolve(stranger, second, 0, key(3)), /permission denied/)
      assert.deepEqual(await state(), before)
      assert.deepEqual(await resolve(caller, second, 0, key(3)), victim)
    })
  } finally {
    await Promise.all(connections.map(async (connection) => {
      try { await connection.query('rollback') } finally { await connection.end() }
    }))
    console.log(`NONCOMMIT_OUTCOME=${passed}/7`)
  }
}

try {
  const identity = await run(
    `select current_database() as name, version() as version,
            current_setting('server_encoding') as encoding`,
    'database preflight',
  )
  const runtime = identity.rows[0]
  if (runtime?.name !== expectedDatabaseName
      || !runtime?.version?.includes('PostgreSQL 17.6')
      || runtime?.encoding !== 'UTF8') {
    throw new Error(`DISPOSABLE_POSTGRES_17_6_UTF8_REQUIRED: ${JSON.stringify(runtime)}`)
  }
  console.log(`PostgreSQL runtime: ${runtime.version}`)
  console.log(`PostgreSQL database/encoding: ${runtime.name}/${runtime.encoding}`)

  await run(`
    drop schema if exists private cascade;
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

  const result = await run(fs.readFileSync(testFile, 'utf8'), 'authoritative context-switch direct-call test')
  const statements = Array.isArray(result) ? result : [result]
  if (!statements.some((statement) => statement.rows?.[0]?.result === 'AUTHORITATIVE_CONTEXT_SWITCH_OK')) {
    throw new Error('AUTHORITATIVE_CONTEXT_SWITCH_READBACK_MISSING')
  }
  console.log('Authoritative context-switch PostgreSQL contract: 18/18 passed')

  await verifyContextConsistency()
  await verifyNoncommitOutcomes()

  const historyBefore = await run(`select
    (select jsonb_agg(to_jsonb(r) order by id) from public.context_switch_receipt r) as receipts,
    (select jsonb_agg(to_jsonb(f) order by id) from private.context_switch_noncommit f) as fences`, 'history before rollback')

  await run('begin', 'begin fail-closed rollback')
  try {
    await run(fs.readFileSync(rollbackFile, 'utf8'), 'fail-closed rollback')
    await run('commit', 'commit fail-closed rollback')
  } catch (error) {
    await client.query('rollback')
    throw error
  }

  const rollback = await run(`
    select
      to_regprocedure('public.commit_context_switch(uuid,uuid,bigint,uuid)') is null
        and to_regprocedure('public.preflight_context_switch(uuid,uuid,bigint)') is null
        and to_regprocedure('public.select_context_switch_targets()') is null
        and to_regprocedure('public.get_context_switch_receipt(uuid)') is null as rpc_surface_removed,
      to_regclass('public.context_switch_receipt') is not null as receipt_history_retained,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'active_role_context' and column_name = 'context_version'
      ) as concurrency_version_retained,
      not has_table_privilege('authenticated', 'public.active_role_context', 'INSERT,UPDATE,DELETE')
        and exists (
          select 1 from pg_policies
          where schemaname = 'public' and tablename = 'active_role_context'
            and policyname = 'arc_self_read' and cmd = 'SELECT'
        ) as direct_write_remains_denied;
  `, 'rollback readback')
  if (!Object.values(rollback.rows[0] || {}).every(Boolean)) {
    throw new Error(`CONTEXT_SWITCH_ROLLBACK_READBACK_FAILED: ${JSON.stringify(rollback.rows[0])}`)
  }
  console.log('Context-switch fail-closed rollback law: 4/4 passed')
  assert.equal((await run("select to_regprocedure('public.resolve_context_switch_outcome(uuid,uuid,bigint,uuid)') is null as removed", 'outcome rollback')).rows[0].removed, true)
  const historyAfter = await run(`select
    (select jsonb_agg(to_jsonb(r) order by id) from public.context_switch_receipt r) as receipts,
    (select jsonb_agg(to_jsonb(f) order by id) from private.context_switch_noncommit f) as fences`, 'history after rollback')
  assert.deepEqual(historyAfter.rows, historyBefore.rows, 'rollback must preserve every immutable receipt and noncommit fence')
  console.log('Noncommit rollback: RPC removed; all receipt/fence rows exactly preserved')
} finally {
  await client.end()
}
