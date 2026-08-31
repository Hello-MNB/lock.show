import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import pg from 'pg'
import { createServer } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import { createArtistEntryClient, firstLinkRequest, entryOriginObjects, entryOriginSelection } from '../../src/lib/artistEntry.js'
import { performEvidenceAction } from '../../src/lib/passportApi.js'
import vm from 'node:vm'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expected = process.argv.includes('--ci') ? 'lock_show_test' : 'lock_show_artist_entry_test'
if (process.argv.includes('--disposable')) {
  assert.ok(process.env.ENTRY_POSTGRES_MODULE, 'explicit preinstalled disposable PostgreSQL module required')
  const { default: EmbeddedPostgres } = await import(pathToFileURL(process.env.ENTRY_POSTGRES_MODULE).href)
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'r15-artist-entry-'))
  const dataDir = path.join(parent, 'data')
  const port = 55461
  const postgres = new EmbeddedPostgres({ databaseDir: dataDir, port, user: 'postgres', password: 'entry-local-only',
    persistent: false, initdbFlags: ['--encoding=UTF8', '--locale=C'], postgresFlags: ['-h', '127.0.0.1'], onLog() {}, onError: console.error })
  let started = false
  let resultCode = 1
  try {
    await postgres.initialise(); await postgres.start(); started = true
    await postgres.createDatabase(expected)
    console.log(JSON.stringify({ created: dataDir, database: expected, at: new Date().toISOString() }))
    resultCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [fileURLToPath(import.meta.url), ...process.argv.slice(2).filter(a => a !== '--disposable')], {
        cwd: root, windowsHide: true, stdio: 'inherit', env: { ...process.env,
          DATABASE_URL: `postgresql://postgres:entry-local-only@127.0.0.1:${port}/${expected}`,
          LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB: expected } })
      child.on('error', reject); child.on('exit', code => resolve(code ?? 1))
    })
  } finally {
    if (started) await postgres.stop()
    console.log(JSON.stringify({ stopped: started, dataExists: fs.existsSync(dataDir), at: new Date().toISOString() }))
    if (fs.readdirSync(parent).length === 0) fs.rmdirSync(parent)
  }
  // embedded-postgres registers a beforeExit hook that exits with zero. After
  // awaited cleanup, explicitly preserve the test child's failure status.
  console.log(JSON.stringify({ testChildExitCode: resultCode }))
  process.exit(resultCode)
} else {
  assert.equal(process.env.LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB, expected, 'exact disposable database opt-in required')
  const url = new URL(process.env.DATABASE_URL)
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'localhost required')
  assert.equal(decodeURIComponent(url.pathname.slice(1)), expected)
  assert.equal(url.search, '', 'connection overrides forbidden')
  const client = new pg.Client({ connectionString: url.toString() })
  await client.connect()
  try {
    const { rows: [identity] } = await client.query("select current_database() db,current_setting('server_version') version,current_setting('server_encoding') encoding")
    assert.equal(identity.db, expected); assert.match(identity.version, /^17\.6(?:\s|$)/); assert.equal(identity.encoding, 'UTF8')
    console.log(JSON.stringify({ runtime: process.version, execPath: process.execPath, ...identity }))
    await client.query(`drop schema if exists public cascade; drop schema if exists auth cascade;
      drop schema if exists storage cascade; drop schema if exists private cascade; create schema public;
      do $$ begin
        if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
        if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
        if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
      end $$;
      create schema auth; grant usage on schema public,auth to anon,authenticated;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,
        banned_until timestamptz,raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create schema storage; create table storage.buckets(id text primary key,name text not null,public boolean not null default false);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;`)
    for (const name of fs.readdirSync(path.join(root, 'supabase/migrations')).filter(n => n.endsWith('.sql') && !n.endsWith('.down.sql') && n !== '018_professional_reaction.sql').sort()) {
      if (process.argv.includes('--completion-red') && name === '20260831082000_artist_entry_completion_idempotency.sql') continue
      if (name === '20260824173241_explicit_hello_admin_grant.sql') await client.query("insert into auth.users(id,email,email_confirmed_at) values ('bd6af802-607c-4faf-93d4-e0a32f10804e','hello@lock.show',now())")
      await client.query('begin')
      try { await client.query(fs.readFileSync(path.join(root, 'supabase/migrations', name), 'utf8')); await client.query('commit') }
      catch (error) { await client.query('rollback'); throw new Error(`${name}: ${error.message}`, { cause: error }) }
    }
    if (process.argv.includes('--baseline-red')) {
      const actor = '81000000-0000-4000-8000-000000000001'
      // Only Auth identity is fixture-created. Application initialization must
      // create its own Person/membership/role/context; no privileged eligibility.
      await client.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())', [actor, 'entry@example.test'])
      assert.equal((await client.query('select count(*)::int n from public.person where id=$1', [actor])).rows[0].n, 0)
      await client.query("select set_config('request.jwt.claim.sub',$1,false)", [actor])
      await client.query('set role authenticated')
      const result = (await client.query("select public.bootstrap_personal_org('Entry Artist','artist','entry@example.test',null) result")).rows[0].result
      assert.equal(typeof result, 'object', 'baseline bootstrap returns an Organization UUID, not authoritative setup/context receipt')
    } else {
      await client.query(fs.readFileSync(path.join(root, 'supabase/tests/tech-baseline/artist-entry.sql'), 'utf8'))
      const actor = '81000000-0000-4000-8000-000000000001'
      const fresh = '81000000-0000-4000-8000-000000000002'
      let passed = 2, failed = 0
      const as = async (id = actor) => {
        await client.query('reset role'); await client.query("select set_config('request.jwt.claim.sub',$1,false)", [id])
        await client.query('set role authenticated')
      }
      const call = async (request, name = 'commit_artist_entry') => (await client.query(`select public.${name}($1::jsonb) result`, [request])).rows[0].result
      const read = async () => (await client.query('select public.read_artist_entry() result')).rows[0].result
      const make = state => ({ action: 'basics', key: crypto.randomUUID(), workspaceId: state.workspaceId,
        contextVersion: state.contextVersion, expectedVersion: state.version, artistId: state.artistId, actId: state.actId,
        payload: { stage_name: 'Updated Entry', city: 'Tel Aviv', privacyConsent: true, noticeVersion: state.serviceNotice?.version } })
      const deny = async (body, expectedMessage = 'artist_entry_unavailable') => {
        await client.query('savepoint denial'); let error
        try { await body() } catch (caught) { error = caught }
        await client.query('rollback to savepoint denial'); await client.query('release savepoint denial')
        assert.equal(error?.code, '42501'); assert.equal(error?.message, expectedMessage)
      }
      const test = async (name, body) => {
        await client.query('begin')
        try { await as(); await body(); passed++; console.log('OK '+name) }
        catch (error) { failed++; console.error('RED '+name+': '+error.message) }
        finally { await client.query('rollback'); await client.query('reset role') }
      }
      const finishRequest = (s, telemetry=true) => ({workspaceId:s.workspaceId,artistId:s.artistId,actId:s.actId,contextVersion:s.contextVersion,telemetry})
      const complete = (s, telemetry=true) => call(finishRequest(s,telemetry),'complete_artist_entry')
      await test('29 canonical completion is explicit-Finish-time, once after later basics/context edits',async()=>{
        const s=await read();let first
        try{first=await complete(s)}catch(error){assert.fail('server completion is unavailable: '+error.code)}
        assert.equal(first.status,'recorded');assert.equal(first.actorId,actor)
        await client.query('reset role')
        const history=(await client.query("select id,committed_at from private.artist_entry_history where actor_id=$1 and request->>'action'='basics' order by committed_at,id limit 1",[actor])).rows[0]
        assert.equal(first.eventId,history.id)
        const event=(await client.query('select * from public.analytics_event where id=$1',[first.eventId])).rows[0]
        assert.ok(event.created_at>history.committed_at,'Finish timestamp is not copied from historical basics')
        assert.equal(event.properties,null);assert.equal(event.is_demo,false)
        await as();assert.deepEqual(await complete(s),first)
        const edited=(await call(make(s))).current
        await client.query('reset role');await client.query('update public.active_role_context set context_version=context_version+1 where person_id=$1',[actor]);await as()
        const again=await complete(await read());assert.equal(again.eventId,first.eventId);assert.equal(again.recordedAt,first.recordedAt)
        assert.equal(again.current.version,edited.version)
      })
      await test('29 optional telemetry refusal leaves lawful Finish ready and writes no event',async()=>{
        const s=await read(),r=await complete(s,false)
        assert.equal(r.status,'not_recorded');assert.deepEqual(r.current,s);assert.equal(r.eventId,undefined)
        await client.query('reset role');assert.equal((await client.query('select count(*)::int n from public.analytics_event where actor_user_id=$1',[actor])).rows[0].n,0)
      })
      await test('29 completion rejects caller identity, stale subject/context and anonymous actor',async()=>{
        const s=await read()
        for(const delta of [{workspaceId:crypto.randomUUID()},{artistId:crypto.randomUUID()},{actId:crypto.randomUUID()},{contextVersion:s.contextVersion+1},{actorId:actor},{eventId:crypto.randomUUID()}])
          await deny(()=>call({...finishRequest(s),...delta},'complete_artist_entry'))
        await as('');await deny(()=>complete(s))
      })
      await test('10 separately missing membership denies entry read and completion',async()=>{
        const s=await read();await client.query('reset role');await client.query('delete from public.organization_membership where person_id=$1 and organization_id=$2',[actor,s.workspaceId]);await as()
        await deny(read);await deny(()=>complete(s))
      })
      await test('29 collision denies without rewriting the other immutable event',async()=>{
        const s=await read();await client.query('reset role')
        const id=(await client.query("select id from private.artist_entry_history where actor_id=$1 and request->>'action'='basics' order by committed_at,id limit 1",[actor])).rows[0].id
        await client.query("insert into public.analytics_event(id,event_name,actor_user_id) values($1,'login',$2)",[id,actor]);await as()
        await deny(()=>complete(s));await client.query('reset role')
        assert.equal((await client.query('select event_name from public.analytics_event where id=$1',[id])).rows[0].event_name,'login')
      })
      await test('29 synthetic marker derives from authenticated account without source payload',async()=>{
        const s=await read();await client.query('reset role');await client.query("update auth.users set email='entry@gigproof.test' where id=$1",[actor]);await as()
        const r=await complete(s);await client.query('reset role')
        const event=(await client.query('select is_demo,properties from public.analytics_event where id=$1',[r.eventId])).rows[0]
        assert.equal(event.is_demo,true);assert.equal(event.properties,null)
      })
      await test('29 rolled-back Finish has no event; explicit retry records the same stable identity',async()=>{
        const s=await read();await client.query('savepoint unobserved')
        const lost=await complete(s);await client.query('rollback to savepoint unobserved')
        await client.query('reset role');assert.equal((await client.query('select count(*)::int n from public.analytics_event where id=$1',[lost.eventId])).rows[0].n,0)
        await as();const retry=await complete(s);assert.equal(retry.eventId,lost.eventId)
        assert.ok(new Date(retry.recordedAt)>=new Date(lost.recordedAt));assert.deepEqual(retry.current,s)
      })
      await test('29 bootstrap alone cannot finish; ready legacy data without basics history gets no fabricated event',async()=>{
        const legacy=crypto.randomUUID();await client.query('reset role')
        await client.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())',[legacy,'legacy-entry@example.test']);await as(legacy)
        const init=await call({action:'initialize',key:crypto.randomUUID()});await deny(()=>complete(init.current))
        // Explicitly legacy fixture data, not a new-identity eligibility proof.
        await client.query('reset role');await client.query("insert into public.artists(created_by,owner_organization_id,organization_id,stage_name,name) values($1,$2,$2,'Legacy','Legacy')",[legacy,init.current.workspaceId]);await as(legacy)
        let s=await read();await call({...make(s),action:'consent',payload:{decision:'accepted',noticeVersion:s.serviceNotice.version}})
        s=await read();assert.equal(s.consentAccepted,true);assert.ok(s.artistId)
        const r=await complete(s);assert.equal(r.status,'not_recorded');assert.equal(r.eventId,undefined)
        await client.query('reset role');assert.equal((await client.query('select count(*)::int n from public.analytics_event where actor_user_id=$1',[legacy])).rows[0].n,0)
      })
      await test('03 returning Artist read has exact identity and distinct Act', async () => {
        const s = await read(), act = crypto.randomUUID()
        await client.query('reset role')
        await client.query('update public.act set is_default=false where id=$1', [s.actId])
        await client.query('insert into public.act(id,person_id,organization_id,stage_name,is_default) values($1,$2,$3,$4,true)', [act, actor, s.workspaceId, 'Second Act'])
        await as(); const now = await read(); assert.equal(now.actId, act); assert.notEqual(now.artistId, act)
        const radar=(await client.query('select public.read_artist_radar_context($1,$2) result',[now.artistId,act])).rows[0].result
        assert.equal(radar.act.id,act);assert.equal(radar.authority.workspaceId,now.workspaceId)
        assert.equal(radar.objects.length,0,'another Act does not inherit candidates')
        await deny(() => call({ ...make(now), actId: s.actId }))
        assert.equal((await call(make(now))).status, 'committed')
      })
      await test('04 duplicate key returns one immutable receipt', async () => {
        const request = make(await read()), a = await call(request), b = await call(request)
        assert.deepEqual(b, a)
        await deny(() => call({ ...request, payload: { ...request.payload, city: 'Changed' } }))
      })
      await test('06 committed response loss recovers exact current state', async () => {
        const request = make(await read()), committed = await call(request)
        assert.deepEqual(await call(request, 'resolve_artist_entry'), committed)
      })
      await test('07 terminal noncommit preserves context and prevents later same-key write', async () => {
        const before = await read(), request = make(before), result = await call(request, 'resolve_artist_entry')
        assert.equal(result.status, 'not_committed'); assert.deepEqual(await read(), before)
        await deny(() => call(request))
      })
      await test('09 wrong workspace denied without disclosure', async () => { const request=make(await read()); await deny(() => call({ ...request, workspaceId: crypto.randomUUID() })) })
      await test('10 revoked membership cannot read or commit', async () => {
        const request = make(await read()); await client.query('reset role')
        await client.query("update public.organization_membership set status='suspended' where person_id=$1", [actor]); await as()
        await deny(read); await deny(() => call(request))
      })
      await test('11 latest wrong role cannot read or commit', async () => {
        const s = await read(), request = make(s); await client.query('reset role')
        await client.query("insert into public.role_assignment(person_id,organization_id,functional_role,created_at) values($1,$2,'viewer',clock_timestamp()+interval '1 second')", [actor,s.workspaceId]); await as()
        await deny(read); await deny(() => call(request))
      })
      await test('12 wrong Artist and wrong Act denied', async () => {
        const request = make(await read())
        for (const field of ['artistId','actId']) await deny(() => call({ ...request, [field]: crypto.randomUUID() }))
      })
      await test('14 withdrawn consent requires a new explicit decision', async () => {
        const request = make(await read()); await client.query('reset role')
        await client.query("insert into public.consent_records(subject_id,scope,version,status,timestamp) values($1,'privacy-processing','v3-inline-gates','withdrawn',clock_timestamp()+interval '1 second')", [actor]); await as()
        await deny(() => call({ ...request, payload: { ...request.payload, privacyConsent: false } }))
      })
      await test('15 stale context and object version denied', async () => {
        const request = make(await read())
        for (const field of ['contextVersion','expectedVersion']) await deny(() => call({ ...request, [field]: 99 }))
      })
      await test('16 extra authority/metadata fields denied', async () => {
        const request = make(await read())
        await deny(() => call({ ...request, actorId: fresh }))
        await deny(() => call({ ...request, payload: { ...request.payload, published: true } }))
      })
      await test('16 direct entry history and context mutation denied', async () => {
        for (const sql of ['select * from private.artist_entry_history', 'select * from private.artist_entry_noncommit',
          `update public.active_role_context set context_version=99 where person_id='${actor}'`]) {
          await client.query('savepoint direct'); let error
          try { await client.query(sql) } catch (caught) { error = caught }
          await client.query('rollback to savepoint direct'); assert.equal(error?.code, '42501')
        }
      })
      await test('22 historical receipt remains history, current state is authoritative', async () => {
        const request = make(await read()), first = await call(request)
        await call(make(await read())); const replay = await call(request)
        assert.deepEqual(replay.receipt, first.receipt); assert.equal(replay.current.version, first.current.version + 1)
      })
      await test('13 failure during consent rolls back identity basics and history', async () => {
        const before = await read(), request = make(before)
        await client.query('reset role')
        await client.query("delete from public.consent_records where subject_id='"+actor+"'; create function pg_temp.fail_entry_consent() returns trigger language plpgsql as $$ begin raise exception 'fixture failure'; end $$; create trigger entry_fixture_failure before insert on public.consent_records for each row execute function pg_temp.fail_entry_consent()")
        await as(); await deny(() => call(request)); const after = await read()
        assert.deepEqual(after.artist, before.artist); assert.equal(after.version, before.version)
      })
      await test('02 no authenticated actor cannot initialize', async () => { await as(''); await deny(() => call({ action: 'initialize', key: crypto.randomUUID() })) })
      await test('14 no issued service notice means no new consent or basics collection',async()=>{
        const s=await read()
        assert.equal(s.serviceNotice?.version,'SYNTHETIC-ENTRY-NOTICE-1','test policy must be explicitly synthetic')
        await client.query('reset role');await client.query('update private.artist_entry_notice set active=false');await as()
        await deny(()=>call({...make(s),payload:{...make(s).payload,noticeVersion:'SYNTHETIC-ENTRY-NOTICE-1'}}))
      })
      await test('14 refusal/defer are durable scoped decisions, not account loss or optional-source approval',async()=>{
        for(const decision of ['declined','deferred']){
          const before=await read(),request={...make(before),action:'consent',payload:{noticeVersion:before.serviceNotice.version,decision}}
          const result=await call(request)
          assert.equal(result.receipt.consentDecision.decision,decision)
          assert.equal(result.receipt.consentDecision.version,'SYNTHETIC-ENTRY-NOTICE-1')
          assert.equal(result.receipt.consentDecision.scope,'privacy-processing')
          assert.ok(result.receipt.consentDecision.effectiveAt);assert.ok(result.receipt.consentDecision.receiptId)
          assert.equal(result.current.consentAccepted,false);assert.equal(result.current.workspaceId,before.workspaceId)
          assert.deepEqual(result.current.artist,before.artist)
          assert.deepEqual((await call(request)).receipt,result.receipt)
          await deny(()=>call({...make(result.current),payload:{...make(result.current).payload,privacyConsent:false}}))
          await client.query('reset role')
          assert.equal((await client.query("select count(*)::int n from public.consent_records where subject_id=$1 and scope in ('marketing','public-publication','thirdparty-evidence')",[actor])).rows[0].n,0)
          await as()
        }
      })
      await test('16 direct legacy consent insert cannot forge a governed service decision',async()=>{
        const s=await read()
        await call({...make(s),action:'consent',payload:{noticeVersion:s.serviceNotice.version,decision:'declined'}})
        await client.query('savepoint legacy_consent');let denied
        try{await client.query("insert into public.consent_records(subject_id,scope,version,status) values($1,'privacy-processing',$2,'accepted')",[actor,s.serviceNotice.version])}catch(error){denied=error}
        await client.query('rollback to savepoint legacy_consent');assert.equal(denied?.code,'42501','fixture table grants deny this direct call')
        // Separate fixture-only legacy provenance probe, NOT attacker proof.
        await client.query('reset role')
        await client.query("insert into public.consent_records(subject_id,scope,version,status,timestamp) values($1,'privacy-processing',$2,'accepted',clock_timestamp()+interval '1 second')",[actor,s.serviceNotice.version]);await as()
        assert.equal((await read()).consentAccepted,false,'raw table insertion must not replace a governed decision receipt')
      })
      // Distinct real sessions contend on the same authenticated actor lock.
      // The waiting query is observed in pg_stat_activity before release;
      // elapsed time alone is never an outcome proof.
      const concurrent = async (name, body) => {
        const first=new pg.Client({connectionString:url.toString()}),second=new pg.Client({connectionString:url.toString()})
        try {
          await first.connect();await second.connect()
          for(const c of [first,second]){await c.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);await c.query('set role authenticated')}
          await body(first,second);passed++;console.log('OK '+name)
        }catch(error){failed++;console.error('RED '+name+': '+error.message)}
        finally{await first.query('rollback').catch(()=>{});await second.query('rollback').catch(()=>{});await first.end();await second.end()}
      }
      const rpc=(c,r,name='commit_artist_entry')=>c.query(`select public.${name}($1::jsonb) result`,[r]).then(x=>x.rows[0].result)
      const waitForLock=async pid=>{
        for(let n=0;n<100;n++){
          const row=(await client.query('select wait_event_type from pg_stat_activity where pid=$1',[pid])).rows[0]
          if(row?.wait_event_type==='Lock')return
          await new Promise(resolve=>setTimeout(resolve,20))
        }
        assert.fail('second real request was not observed waiting for the actor lock')
      }
      await concurrent('04 concurrent fresh initialization establishes one Setup, even with different request keys',async(a,b)=>{
        const newcomer=crypto.randomUUID();await client.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())',[newcomer,'concurrent-entry@example.test'])
        for(const c of [a,b])await c.query("select set_config('request.jwt.claim.sub',$1,false)",[newcomer])
        await a.query('begin');const first=await rpc(a,{action:'initialize',key:crypto.randomUUID()})
        const pending=rpc(b,{action:'initialize',key:crypto.randomUUID()});await waitForLock(b.processID);await a.query('commit')
        const second=await pending;assert.equal(first.current.workspaceId,second.current.workspaceId)
        assert.equal((await client.query('select count(*)::int n from public.organization_membership where person_id=$1',[newcomer])).rows[0].n,1)
        assert.equal(first.current.artistId,null);assert.equal(second.current.version,0)
      })
      await concurrent('29 concurrent explicit Finish records once and lost acknowledgement reads the same event',async(a,b)=>{
        const s=(await a.query('select public.read_artist_entry() result')).rows[0].result,r=finishRequest(s)
        await a.query('begin');const first=await rpc(a,r,'complete_artist_entry')
        const pending=rpc(b,r,'complete_artist_entry');await waitForLock(b.processID);await a.query('commit')
        assert.deepEqual(await pending,first);assert.deepEqual(await rpc(b,r,'complete_artist_entry'),first)
        assert.equal((await client.query('select count(*)::int n from public.analytics_event where id=$1',[first.eventId])).rows[0].n,1)
      })
      await concurrent('21 concurrent identical commits share one immutable receipt/version',async(a,b)=>{
        const before=(await a.query('select public.read_artist_entry() result')).rows[0].result,r=make(before)
        await a.query('begin');const first=await rpc(a,r)
        const pending=rpc(b,r);await waitForLock(b.processID);await a.query('commit')
        assert.deepEqual(await pending,first)
        assert.equal(first.current.version,before.version+1)
        assert.equal((await client.query('select count(*)::int n from private.artist_entry_history where actor_id=$1 and request_key=$2',[actor,r.key])).rows[0].n,1)
      })
      await concurrent('22 committed-inflight request resolves after atomic commit',async(a,b)=>{
        const r=make((await a.query('select public.read_artist_entry() result')).rows[0].result)
        await a.query('begin');const first=await rpc(a,r)
        const pending=rpc(b,r,'resolve_artist_entry');await waitForLock(b.processID);await a.query('commit')
        assert.deepEqual(await pending,first)
      })
      await concurrent('22 terminal noncommit fence defeats delayed original commit',async(a,b)=>{
        const before=(await a.query('select public.read_artist_entry() result')).rows[0].result,r=make(before)
        await a.query('begin');const proof=await rpc(a,r,'resolve_artist_entry')
        const pending=rpc(b,r).then(()=>({unexpected:true}),error=>({code:error.code,message:error.message}))
        await waitForLock(b.processID);await a.query('commit')
        assert.deepEqual(await pending,{code:'42501',message:'artist_entry_unavailable'})
        assert.equal(proof.status,'not_committed')
        assert.deepEqual((await a.query('select public.read_artist_entry() result')).rows[0].result,before)
        assert.equal((await client.query('select count(*)::int n from private.artist_entry_history where actor_id=$1 and request_key=$2',[actor,r.key])).rows[0].n,0)
      })
      // Real local HTTP -> locked SDK RPC -> PostgreSQL; Auth is a disclosed
      // synthetic transport, not a hosted identity or provider eligibility claim.
      await client.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())', [fresh,'fresh-entry@example.test'])
      const token = 'local-entry-identity'
      const bridge = createServer(async (req,res) => {
        res.setHeader('content-type','application/json')
        if (req.headers.authorization !== `Bearer ${token}`) { res.statusCode=401; res.end('{}'); return }
        if (req.url.startsWith('/auth/v1/user')) { res.end(JSON.stringify({ id:fresh,role:'authenticated',aud:'authenticated' })); return }
        const rpc = req.url.split('?')[0].split('/').at(-1)
        if (!['complete_artist_entry','read_artist_entry','commit_artist_entry','resolve_artist_entry','commit_evidence_action','resolve_evidence_action','get_evidence_workbench','get_my_artist_for_active_workspace','read_artist_radar_context'].includes(rpc)) { res.statusCode=404;res.end('{}');return }
        let raw='';for await(const chunk of req)raw+=chunk
        const connection = new pg.Client({connectionString:url.toString()});await connection.connect()
        try {
          await connection.query("select set_config('request.jwt.claim.sub',$1,false)",[fresh]);await connection.query('set role authenticated')
          const body=raw?JSON.parse(raw):{}
          const noArgs=['read_artist_entry','get_my_artist_for_active_workspace'].includes(rpc)
          const result=['get_evidence_workbench','read_artist_radar_context'].includes(rpc)
            ?await connection.query(`select public.${rpc}($1,$2) result`,[body.p_artist,body.p_act])
            :rpc==='get_my_artist_for_active_workspace'
              ?await connection.query('select coalesce(jsonb_agg(a),\'[]\') result from public.get_my_artist_for_active_workspace() a')
              :await connection.query(`select public.${rpc}(${noArgs?'':'$1::jsonb'}) result`,noArgs?[]:[body.p_request])
          res.end(JSON.stringify(result.rows[0].result))
        } catch(error){res.statusCode=403;res.end(JSON.stringify({code:error.code,message:error.message}))}
        finally{await connection.end()}
      })
      await new Promise(resolve=>bridge.listen(0,'127.0.0.1',resolve))
      let server
      try {
        const providerUrl=`http://127.0.0.1:${bridge.address().port}`
        const sdk=createClient(providerUrl,'entry-local-anon',{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
        const entry=createArtistEntryClient({actorId:fresh,rpc:(...args)=>sdk.rpc(...args)})
        assert.equal((await client.query('select count(*)::int n from public.person where id=$1',[fresh])).rows[0].n,0)
        assert.equal((await entry.commit({action:'initialize',key:crypto.randomUUID()})).status,'committed')
        let state=await entry.read();assert.equal(state.artistId,null)
        assert.equal((await entry.commit({...make(state),payload:{...make(state).payload,stage_name:'HTTP New Artist',city:null}})).status,'committed')
        state=await entry.read();assert.ok(state.artistId)
        const completion=await entry.complete(state);assert.equal(completion.status,'recorded');assert.notEqual(completion.actorId,actor)
        assert.deepEqual(await entry.complete(state),completion)
        const freshEvent=(await client.query('select actor_user_id from public.analytics_event where id=$1',[completion.eventId])).rows[0]
        assert.equal(freshEvent.actor_user_id,fresh);passed++;console.log('OK 29 real caller/SDK/HTTP/PG completion/retry for distinct new Person')
        process.env.VERCEL='1';process.env.VITE_SUPABASE_URL=providerUrl;process.env.SUPABASE_SERVICE_ROLE_KEY='entry-local-service'
        const {default:app}=await import('../../server/index.js')
        server=await new Promise(resolve=>{const listener=app.listen(0,'127.0.0.1',()=>resolve(listener))})
        await as(fresh)
        const workbench=(await client.query('select public.get_evidence_workbench($1,$2) result',[state.artistId,state.actId])).rows[0].result
        const request=firstLinkRequest(workbench,'https://example.test/artist',true)
        const outcome=await performEvidenceAction(request,{Authorization:`Bearer ${token}`},(route,options)=>fetch(`http://127.0.0.1:${server.address().port}${route}`,options))
        assert.equal(outcome.status,'committed')
        await client.query('reset role')
        assert.equal((await client.query('select ku03_state from public.evidence_artifacts where id=$1',[request.objectId])).rows[0].ku03_state,'candidate')
        assert.equal((await client.query('select count(*)::int n from public.passport_versions where artist_id=$1',[state.artistId])).rows[0].n,0)
        passed++;console.log('OK 17 actual caller/SDK/HTTP/RPC + Express/evidence/PG, fresh identity, candidate only')
        // Migration020's compatibility trigger legitimately uses the same UUID
        // for two separate rows. Entity distinction is not numeric inequality.
        const artistRow=(await client.query('select id,created_by,owner_organization_id from public.artists where id=$1',[state.artistId])).rows[0]
        const actRow=(await client.query('select id,person_id,organization_id,is_default from public.act where id=$1',[state.actId])).rows[0]
        assert.equal(artistRow.created_by,fresh);assert.equal(artistRow.owner_organization_id,state.workspaceId)
        assert.equal(actRow.person_id,fresh);assert.equal(actRow.organization_id,state.workspaceId);assert.equal(actRow.is_default,true)
        assert.equal(state.artistId,artistRow.id);assert.equal(state.actId,actRow.id)
        const artistRead=await sdk.rpc('get_my_artist_for_active_workspace')
        assert.equal(artistRead.error,null);assert.equal(artistRead.data[0].id,state.artistId)
        const source=fs.readFileSync(path.join(root,'src/lib/db.js'),'utf8')
        const begin=source.indexOf('export async function getArtistRadarContext('),end=source.indexOf('\nexport async function commitEvidenceAction',begin)
        assert.ok(begin>=0&&end>begin)
        const sandbox={DEMO:false,supabase:sdk}
        vm.createContext(sandbox)
        const landing=vm.runInContext(`(function(){${source.slice(begin,end).replace('export ','')};return getArtistRadarContext})()`,sandbox)
        const scope={actorId:fresh,workspaceId:state.workspaceId,contextVersion:state.contextVersion}
        const projection=await landing(state.artistId,scope)
        assert.equal(projection.act.id,state.actId);assert.equal(projection.objects[0].id,request.objectId)
        assert.equal(projection.objects[0].state,'candidate');assert.equal(projection.items.length,0);assert.equal(projection.claims.length,0)
        assert.ok(projection.history.some(row=>row.receipt.id===outcome.receipt.id))
        const origin=entryOriginSelection(projection,fresh,request.objectId,outcome.receipt.id,1)
        assert.equal(origin.originReceipt.id,outcome.receipt.id);assert.equal(origin.state,'candidate')
        for(const changed of [{objectId:crypto.randomUUID()},{receiptId:crypto.randomUUID()},{version:2}])
          assert.throws(()=>entryOriginSelection(projection,fresh,changed.objectId||request.objectId,changed.receiptId||outcome.receipt.id,changed.version||1))
        assert.equal(entryOriginObjects(projection,actor).length,0)
        passed++;console.log('OK 24 real governed history maps exact origin receipt/object/version and rejects unrelated selection')
        sandbox.getArtistRadarContext=landing
        const caller=name=>{
          const first=source.indexOf(`export async function ${name}(`),next=source.indexOf('\nexport async function ',first+1)
          assert.ok(first>=0&&next>first)
          return vm.runInContext(`(function(){${source.slice(first,next).replace('export ','')}\n;return ${name}})()`,sandbox)
        }
        const list=caller('listActs'),switchTo=caller('switchAct'),secondAct=crypto.randomUUID()
        // Fixture-only second subject, never provisioned authority for the new identity.
        await client.query('reset role')
        await client.query('insert into public.act(id,person_id,organization_id,stage_name,is_default) values($1,$2,$3,$4,false)',[secondAct,fresh,state.workspaceId,'Second scoped Act'])
        const listed=await list(state.artistId,state.actId)
        assert.deepEqual(listed.map(row=>row.id).sort(),[state.actId,secondAct].sort())
        const second=await switchTo(secondAct,state.artistId,scope)
        assert.equal(second.act.id,secondAct);assert.notEqual(second.act.id,state.artistId)
        assert.equal(second.objects.length,0);assert.equal(second.items.length,0);assert.equal(second.claims.length,0)
        const returned=await switchTo(state.actId,state.artistId,scope)
        assert.deepEqual(returned.objects,projection.objects);assert.deepEqual(returned.history,projection.history)
        assert.deepEqual(returned.items,projection.items);assert.deepEqual(returned.claims,projection.claims)
        passed++;console.log('OK ENT001 actual listActs/switchAct SDK/HTTP/PG distinct second Act, safe return and immutable pending/history')
        await client.query('begin');await as(fresh)
        await deny(()=>client.query('select * from public.act where id=$1',[state.actId]),'permission denied for table act')
        await client.query('rollback');await client.query('reset role')
        passed++;console.log('OK ENT001 real new identity/Core RPC/actual landing caller/Express/PG faithful separate Artist/Act rows + candidate/history')
        const wrongAct=crypto.randomUUID()
        await assert.rejects(landing(state.artistId,scope,wrongAct))
        await assert.rejects(list(state.artistId,wrongAct))
        await assert.rejects(switchTo(wrongAct,state.artistId,scope))
        await assert.rejects(landing(state.artistId,{...scope,actorId:actor},state.actId))
        await assert.rejects(landing(state.artistId,{...scope,contextVersion:scope.contextVersion+1},state.actId))
        await client.query('begin');await as(actor)
        await deny(()=>client.query('select public.read_artist_radar_context($1,$2)',[state.artistId,state.actId]),'evidence_action_unavailable')
        await client.query('rollback');await client.query('reset role')
        const directWrong=await sdk.rpc('get_evidence_workbench',{p_artist:state.artistId,p_act:wrongAct})
        assert.equal(directWrong.error.code,'42501')
        await client.query('update public.active_role_context set context_version=context_version+1 where person_id=$1',[fresh])
        await assert.rejects(switchTo(state.actId,state.artistId,scope))
        await client.query('update public.active_role_context set context_version=$2 where person_id=$1',[fresh,scope.contextVersion])
        const otherWorkspace=(await client.query('select active_organization_id id from public.active_role_context where person_id=$1',[actor])).rows[0].id
        await client.query('update public.active_role_context set active_organization_id=$2 where person_id=$1',[fresh,otherWorkspace])
        const wrongWorkspace=await sdk.rpc('read_artist_radar_context',{p_artist:state.artistId,p_act:state.actId})
        assert.equal(wrongWorkspace.error?.code,'42501');assert.equal(wrongWorkspace.data,null)
        await client.query('update public.active_role_context set active_organization_id=$2 where person_id=$1',[fresh,state.workspaceId])
        await client.query('reset role');await client.query("update public.organization_membership set status='suspended' where person_id=$1",[fresh])
        await assert.rejects(landing(state.artistId,scope,state.actId))
        await assert.rejects(list(state.artistId,state.actId))
        await assert.rejects(switchTo(state.actId,state.artistId,scope))
        passed++;console.log('OK ENT001 wrong Act/direct RPC, wrong response actor and suspended membership deny without candidate disclosure')
      } catch(error){failed++;console.error('RED HTTP entry: '+error.message)}
      finally{if(server)await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>bridge.close(resolve));await client.query('reset role')}
      await test('rollback disables new commits and preserves receipt/history/identity', async () => {
        const state=await read(), request=make(state);await client.query('reset role')
        const before=(await client.query('select (select count(*) from private.artist_entry_history)::int h,(select count(*) from public.person)::int p,(select count(*) from public.consent_records)::int c')).rows[0]
        await client.query(fs.readFileSync(path.join(root,'supabase/rollback/20260831044500_artist_entry.sql'),'utf8'));await as()
        await client.query('savepoint rollback_denial');let error
        try{await call(request)}catch(caught){error=caught}
        await client.query('rollback to savepoint rollback_denial');assert.equal(error?.code,'42501')
        await deny(()=>client.query('select public.read_artist_radar_context($1,$2)',[state.artistId,state.actId]),'permission denied for function read_artist_radar_context')
        assert.deepEqual(await read(),state);await client.query('reset role')
        assert.deepEqual((await client.query('select (select count(*) from private.artist_entry_history)::int h,(select count(*) from public.person)::int p,(select count(*) from public.consent_records)::int c')).rows[0],before)
      })
      await test('29 operational completion rollback preserves all history/events and denies new path',async()=>{
        const s=await read();await client.query('reset role')
        const before=(await client.query('select (select count(*) from private.artist_entry_history)::int h,(select count(*) from public.analytics_event)::int e')).rows[0]
        await client.query(fs.readFileSync(path.join(root,'supabase/rollback/20260831082000_artist_entry_completion_idempotency.sql'),'utf8'));await as()
        await deny(()=>complete(s),'permission denied for function complete_artist_entry')
        await client.query('reset role');assert.deepEqual((await client.query('select (select count(*) from private.artist_entry_history)::int h,(select count(*) from public.analytics_event)::int e')).rows[0],before)
      })
      console.log(`ARTIST_ENTRY_POSTGRES=${passed}/${passed+failed}`)
      assert.equal(failed,0,'entry database gates failed')
    }
  } finally { await client.end() }
}
