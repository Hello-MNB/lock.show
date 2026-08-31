import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { performEvidenceAction, recoverEvidenceAction, publishPassportSnapshot, unpublishPassportSnapshot, readPassportSnapshot } from '../../src/lib/passportApi.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expected = process.argv.includes('--ci') ? 'lock_show_test' : 'lock_show_representative_evidence_test'
assert.equal(process.env.LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB, expected, 'exact disposable database opt-in required')
const url = new URL(process.env.DATABASE_URL)
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'localhost required')
assert.equal(decodeURIComponent(url.pathname.slice(1)), expected)
assert.equal(url.search, '', 'connection overrides forbidden')
const client = new pg.Client({ connectionString: url.toString() })
await client.connect()
try {
  const { rows: [identity] } = await client.query("select current_database() as db, current_setting('server_version') as version, current_setting('server_encoding') as encoding")
  assert.equal(identity.db, expected)
  assert.match(identity.version, /^17\.6(?:\s|$)/)
  assert.equal(identity.encoding, 'UTF8')
  console.log(JSON.stringify({ runtime: process.version, execPath: process.execPath, ...identity }))
  await client.query(`
    drop schema if exists public cascade; drop schema if exists auth cascade;
    drop schema if exists storage cascade; drop schema if exists private cascade;
    create schema public;
    do $$ begin
      if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
      if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
      if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
    end $$;
    create schema auth;
    grant usage on schema public,auth to anon,authenticated;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,
      deleted_at timestamptz,banned_until timestamptz,raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create schema storage;
    create table storage.buckets(id text primary key,name text not null,public boolean not null default false);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
  `)
  const directory = path.join(root, 'supabase/migrations')
  for (const name of fs.readdirSync(directory).filter(n => n.endsWith('.sql') && !n.endsWith('.down.sql') && n !== '018_professional_reaction.sql').sort()) {
    if (name === '20260824173241_explicit_hello_admin_grant.sql') {
      await client.query("insert into auth.users(id,email,email_confirmed_at) values ('bd6af802-607c-4faf-93d4-e0a32f10804e','hello@lock.show',now()) on conflict do nothing")
    }
    await client.query('begin')
    try {
      await client.query(fs.readFileSync(path.join(directory, name), 'utf8'))
      await client.query('commit')
    } catch (error) { await client.query('rollback'); throw new Error(`${name}: ${error.message}`, { cause: error }) }
  }
  const suite = fs.readFileSync(path.join(root, 'supabase/tests/tech-baseline/representative-evidence-actions.sql'), 'utf8')
  const cut = suite.indexOf('grant select,insert')
  await client.query(suite.slice(0, cut))
  const failures = []
  const actor = '71000000-0000-4000-8000-000000000001'
  const representative = '71000000-0000-4000-8000-000000000002'
  const artistId = '73000000-0000-4000-8000-000000000001'
  const workspaceId = '72000000-0000-4000-8000-000000000001'
  const repWorkspace = '72000000-0000-4000-8000-000000000002'
  const objectId = '74000000-0000-4000-8000-000000000001'
  let keyNumber = 0
  const make = (action, extra = {}) => ({ artistId, actId: artistId, objectId, workspaceId,
    contextVersion: 0, expectedVersion: 0, expectedObjectVersion: 0,
    key: `75000000-0000-4000-8000-${String(++keyNumber).padStart(12, '0')}`, action,
    payload: { evidence_type: 'link', source_type: 'public-profile', value: 'https://example.test/proof', title: 'Fixture proof', reason: 'Fixture correction', provenance: 'Artist contribution', sourceConsent: true }, ...extra })
  async function as(person) {
    await client.query('reset role')
    await client.query("select set_config('request.jwt.claim.sub',$1,false)", [person])
    await client.query('set role authenticated')
  }
  const call = async (request, rpc = 'commit_evidence_action') => {
    const result = await client.query(`select public.${rpc}($1::jsonb) as result`, [request])
    return result.rows[0].result
  }
  const upload = async () => { await as(actor); return call(make('upload')) }
  const deny = async (request) => {
    await client.query('savepoint denial')
    let error
    try { await call(request) } catch (caught) { error = caught }
    await client.query('rollback to savepoint denial')
    assert.equal(error?.message, 'evidence_action_unavailable')
    assert.equal(error?.code, '42501')
  }
  const owner = async (sql) => { await client.query('reset role'); await client.query(sql) }
  async function test(name, body) {
    await client.query('begin')
    try { await body(); console.log(`OK ${name}`) }
    catch (error) { failures.push(name); console.error(`RED ${name}: ${error.message}`) }
    finally { await client.query('rollback'); await client.query('reset role') }
  }
  await test('01 Artist upload is candidate only', async () => {
    const receipt = await upload()
    assert.equal(receipt.action, 'upload')
    await client.query('reset role')
    const { rows: [row] } = await client.query('select ku03_state from public.evidence_artifacts where id=$1', [objectId])
    assert.equal(row.ku03_state, 'candidate')
    assert.equal((await client.query('select count(*)::int as n from public.passport_versions')).rows[0].n, 0)
  })
  await test('02 representative upload requires upload scope', async () => {
    await owner("update public.artist_access set scope=array['view','upload']")
    await as(representative)
    assert.equal((await call(make('upload', { workspaceId: repWorkspace }))).action, 'upload')
  })
  await test('03 metadata change records before after reason provenance', async () => {
    await upload()
    await call(make('change', { expectedVersion: 1, expectedObjectVersion: 1, payload: { title: 'Changed', reason: 'Correction', provenance: 'Original source' } }))
    await client.query('reset role')
    const { rows: [row] } = await client.query("select before_state,after_state,reason,provenance from private.evidence_action_history where action='change'")
    assert.equal(row.before_state.title, 'Fixture proof'); assert.equal(row.after_state.title, 'Changed')
    assert.equal(row.reason, 'Correction'); assert.equal(row.provenance, 'Original source')
  })
  await test('04 proposal is nonbinding and reversible', async () => {
    await upload()
    await call(make('propose', { expectedVersion: 1, expectedObjectVersion: 1, payload: { statement: 'A bounded statement', reason: 'Proposal', provenance: 'Fixture' } }))
    await call(make('withdraw', { expectedVersion: 2, expectedObjectVersion: 2 }))
    await client.query('reset role')
    assert.equal((await client.query('select count(*)::int as n from public.claims where artist_approved')).rows[0].n, 0)
    assert.equal((await client.query('select ku03_state from public.evidence_artifacts where id=$1', [objectId])).rows[0].ku03_state, 'withdrawn')
  })
  const proposed = async () => { await upload(); await call(make('propose', { expectedVersion: 1, expectedObjectVersion: 1, payload: { statement: 'Fixture performance', reason: 'Proposal', provenance: 'Fixture source' } })) }
  const confirmed = async () => { await proposed(); return call(make('confirm', { expectedVersion: 2, expectedObjectVersion: 2, payload: { rights: true, visibility: true, conflict: false, reason: 'Artist confirmation', provenance: 'Displayed fixture statement' } })) }
  const publication = () => make('publish', { expectedVersion: 3, expectedObjectVersion: 3, payload: { audience: representative, purpose: 'Fixture booking review', expiresAt: '2099-01-01T00:00:00Z', reason: 'Approved exact projection', provenance: 'Current confirmed claim' } })
  const eligible = async () => { await confirmed(); await owner("update public.claims set verification_status='supporting' where evidence_id='" + objectId + "'"); await as(actor) }
  await test('05 Artist confirmation never publishes', async () => { await confirmed(); await client.query('reset role'); assert.equal((await client.query('select published from public.artists where id=$1', [artistId])).rows[0].published, false) })
  await test('06 eligible publication is atomic and immutable', async () => {
    await eligible(); const receipt = await call(publication()); assert.ok(receipt.passportVersionId)
    await client.query('reset role')
    const row = (await client.query('select snapshot from public.passport_versions where id=$1', [receipt.passportVersionId])).rows[0]
    assert.equal(row.snapshot.claims[0].value, 'Fixture performance')
    assert.equal(row.snapshot.claims[0].internal_confidence, undefined)
    assert.equal((await client.query('select published from public.artists where id=$1', [artistId])).rows[0].published, true)
  })
  await test('07 wrong workspace is denied', async () => { await as(actor); await deny(make('upload', { workspaceId: repWorkspace })) })
  await test('08 missing membership is denied', async () => { await owner('delete from public.organization_membership'); await as(actor); await deny(make('upload')) })
  await test('09 wrong functional role is denied', async () => { await owner("update public.role_assignment set functional_role='viewer'"); await as(actor); await deny(make('upload')) })
  await test('10 view-only grant cannot act', async () => { await as(representative); await deny(make('upload', { workspaceId: repWorkspace })) })
  await test('11 revoked grant cannot act', async () => { await owner("update public.artist_access set scope=array['view','upload'],status='revoked'"); await as(representative); await deny(make('upload', { workspaceId: repWorkspace })) })
  await test('12 expired grant cannot act', async () => { await owner("update public.artist_access set scope=array['view','upload'],expires_at=now()-interval '1 second'"); await as(representative); await deny(make('upload', { workspaceId: repWorkspace })) })
  await test('13 ungranted metadata field cannot change', async () => { await upload(); await owner("update public.artist_access set scope=array['view','edit'],ku03_edit_fields=array['title']"); await as(representative); await deny(make('change', { workspaceId: repWorkspace, expectedVersion: 1, expectedObjectVersion: 1, payload: { value: 'Unpermitted', reason: 'x', provenance: 'x' } })) })
  await test('14 rights visibility conflict and eligibility block publication', async () => { await confirmed(); await deny(publication()); await owner("update public.claims set verification_status='supporting'; update public.evidence_artifacts set ku03_rights=false"); await as(actor); await deny(publication()); await owner('update public.evidence_artifacts set ku03_rights=true,ku03_visibility=false'); await as(actor); await deny(publication()); await owner('update public.evidence_artifacts set ku03_visibility=true,ku03_conflict=true'); await as(actor); await deny(publication()) })
  await test('15 stale object and context cannot commit', async () => { await upload(); await deny(make('propose', { expectedVersion: 1 })); await deny(make('propose', { expectedVersion: 1, expectedObjectVersion: 1, contextVersion: 99 })) })
  await test('16 same key is idempotent and mismatched retry denied', async () => { await as(actor); const request = make('upload'); const first = await call(request); assert.deepEqual(await call(request), first); await deny({ ...request, payload: { ...request.payload, title: 'Different' } }); await client.query('reset role'); assert.equal((await client.query('select ku03_version from public.act where id=$1', [artistId])).rows[0].ku03_version, '1') })
  await test('17 unknown outcome resolves receipt or fences noncommit', async () => { await as(actor); const request = make('upload'); const proof = await call(request, 'resolve_evidence_action'); assert.equal(proof.status, 'not_committed'); await deny(request); const second = make('upload'); const receipt = await call(second); assert.deepEqual((await call(second, 'resolve_evidence_action')).receipt, receipt) })
  await test('18 direct-call denial and immutable withdrawal history', async () => {
    await client.query(suite.slice(cut))
    await eligible(); await call(publication())
    await call(make('withdraw', { expectedVersion: 4, expectedObjectVersion: 3 }))
    await client.query('reset role')
    assert.equal((await client.query('select count(*)::int as n from public.passport_versions')).rows[0].n, 1)
    assert.equal((await client.query('select published from public.artists where id=$1', [artistId])).rows[0].published, false)
  })
  console.log(`KU03_POSTGRES=${18 - failures.length}/18`)
  await test('19 legacy claims and items remain visible without mutation', async () => {
    await owner(`insert into public.claims(id,artist_id,act_id,value,source_type,verification_status,visibility,reason_code,limitation_text)
      values('76000000-0000-4000-8000-000000000001','${artistId}','${artistId}','Original claim','self-reported','self-reported','working-only','Original source','Original limitation');
      insert into public.profile_items(id,artist_id,act_id,item_type,title,detail)
      values('76000000-0000-4000-8000-000000000002','${artistId}','${artistId}','event','Original item','Original detail')`)
    const before = (await client.query('select to_jsonb(c) as row from public.claims c')).rows
    await as(actor)
    const read = (await client.query('select public.get_evidence_workbench($1,$2) as data',[artistId,artistId])).rows[0].data
    assert.equal(read.legacyClaims[0].value,'Original claim')
    assert.equal(read.legacyClaims[0].reason_code,'Original source')
    assert.equal(read.legacyItems[0].detail,'Original detail')
    const source = read.legacyClaims[0]
    const preparation = make('upload', { payload: { legacyKind:'claim', legacyId:source.id,
      legacyFingerprint:source.fingerprint, sourceConsent:true, reason:'Review exact original', provenance:'Original source' } })
    await deny({ ...preparation, payload:{ ...preparation.payload,legacyFingerprint:'stale' } })
    await call(preparation)
    const afterRead = (await client.query('select public.get_evidence_workbench($1,$2) as data',[artistId,artistId])).rows[0].data
    assert.equal(afterRead.objects[0].state,'candidate')
    assert.equal(afterRead.objects[0].claim,null)
    assert.equal(afterRead.history[0].before.original.value,'Original claim')
    await client.query('reset role')
    assert.deepEqual((await client.query('select to_jsonb(c) as row from public.claims c')).rows,before)
  })
  await test('20 representative uses a distinct Act; cross-Organization Act denied', async () => {
    const second = '77000000-0000-4000-8000-000000000001'
    const wrong = '77000000-0000-4000-8000-000000000002'
    await owner(`insert into public.act(id,person_id,organization_id,stage_name,is_default) values
      ('${second}','${actor}','${workspaceId}','Second Act',false),
      ('${wrong}','${actor}','${repWorkspace}','Other Organization Act',false);
      update public.artist_access set scope=array['view','upload']`)
    await as(representative)
    const receipt = await call(make('upload',{actId:second,workspaceId:repWorkspace}))
    assert.equal(receipt.actId,second)
    await deny(make('upload',{actId:wrong,workspaceId:repWorkspace}))
    await owner(`update public.act set is_default=false where id='${artistId}'; update public.act set is_default=true where id='${second}'`)
    await as(actor)
    const defaultRead = (await client.query('select public.get_evidence_workbench($1,null) as data',[artistId])).rows[0].data
    assert.equal(defaultRead.actId,second)
    assert.ok(defaultRead.acts.every(item => item.id !== wrong))
  })
  console.log(`KU03_CONTINUITY_ACT=${2 - failures.filter(name => /^(19|20) /.test(name)).length}/2`)
  await test('21 Scanner preparation remains candidate-only and failure is retryable', async () => {
    await upload()
    await call(make('prepare',{expectedVersion:1,expectedObjectVersion:1,payload:{statement:'Unverified extracted draft',processingFailed:true}}))
    const read = (await client.query('select public.get_evidence_workbench($1,$2) as data',[artistId,artistId])).rows[0].data
    assert.equal(read.objects[0].status,'error'); assert.equal(read.objects[0].state,'candidate')
    assert.equal(read.objects[0].claim,null)
    await call(make('prepare',{expectedVersion:2,expectedObjectVersion:2,payload:{statement:'Retried draft',processingFailed:false}}))
    await client.query('reset role')
    assert.equal((await client.query('select count(*)::int as n from public.claims')).rows[0].n,0)
    assert.equal((await client.query('select count(*)::int as n from private.evidence_action_history')).rows[0].n,3)
  })
  await test('22 receiving Organization cannot grant itself active action scope', async () => {
    await owner(`grant update on public.artist_access to authenticated;
      update public.organization_membership set org_role='owner' where person_id='${representative}'`)
    const before = (await client.query('select to_jsonb(a) as row from public.artist_access a order by id')).rows
    await as(representative)
    await client.query('savepoint grant_denial')
    let error, result
    try { result = await client.query("update public.artist_access set scope=array['view','upload'],status='active'") } catch (caught) { error=caught }
    if (error) {
      await client.query('rollback to savepoint grant_denial')
      assert.equal(error.code,'42501')
    } else {
      // RLS may deny an UPDATE by selecting no rows rather than raising.
      assert.equal(result.rowCount,0)
    }
    await deny(make('upload',{workspaceId:repWorkspace}))
    await client.query('reset role')
    assert.deepEqual((await client.query('select to_jsonb(a) as row from public.artist_access a order by id')).rows,before)
  })
  await test('23 governed browser caller crosses real Express and PostgreSQL without a legacy empty-body bypass', async () => {
    await eligible()
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url')
    const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:actor,role:'authenticated'})}.local-fixture`
    const recipientToken = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:representative,role:'authenticated'})}.local-fixture`
    let rpcCalls = 0
    const bridge = createServer(async (req,res) => {
      res.setHeader('content-type','application/json')
      const uri = new URL(req.url,'http://localhost')
      if (req.method === 'GET' && uri.pathname.startsWith('/rest/v1/') && req.headers.authorization === 'Bearer local-fixture-key') {
        // Real SQL rows behind a local PostgREST transport adapter, not mocked
        // authorization decisions. Express performs the actual recipient gate.
        await client.query('reset role')
        const id = uri.searchParams.get('id')?.replace(/^eq\./,'')
        let result
        if(uri.pathname==='/rest/v1/artists') result=await client.query('select id,published from public.artists where id=$1',[id])
        if(uri.pathname==='/rest/v1/passport_versions') result=await client.query('select snapshot,ku03_audience,ku03_purpose,ku03_expires_at,ku03_object_id from public.passport_versions where artist_id=$1 order by created_at desc limit 1',[uri.searchParams.get('artist_id')?.replace(/^eq\./,'')])
        if(uri.pathname==='/rest/v1/evidence_artifacts') result=await client.query('select ku03_state,ku03_rights,ku03_visibility,ku03_conflict from public.evidence_artifacts where id=$1',[id])
        if(!result){res.statusCode=404;res.end('{}');return}
        res.end(JSON.stringify(result.rows));return
      }
      if (req.url.startsWith('/auth/v1/user') && req.headers.authorization === `Bearer ${recipientToken}`) {
        res.end(JSON.stringify({id:representative,role:'authenticated',aud:'authenticated'}));return
      }
      if (req.headers.authorization !== `Bearer ${token}`) { res.statusCode=401; res.end('{}'); return }
      if (req.url.startsWith('/auth/v1/user')) { res.end(JSON.stringify({id:actor,role:'authenticated',aud:'authenticated'})); return }
      const rpc = req.url.split('?')[0].split('/').at(-1)
      if (!['commit_evidence_action','resolve_evidence_action'].includes(rpc)) { res.statusCode=404; res.end('{}'); return }
      let body=''
      for await (const chunk of req) body+=chunk
      await as(actor)
      await client.query('savepoint http_rpc')
      try {
        rpcCalls++
        const data=await call(JSON.parse(body).p_request,rpc)
        await client.query('release savepoint http_rpc')
        res.end(JSON.stringify(data))
      } catch (error) {
        await client.query('rollback to savepoint http_rpc')
        res.statusCode=403; res.end(JSON.stringify({code:error.code,message:error.message}))
      }
    })
    await new Promise(resolve => bridge.listen(0,'127.0.0.1',resolve))
    process.env.VERCEL='1'
    process.env.VITE_SUPABASE_URL=`http://127.0.0.1:${bridge.address().port}`
    process.env.SUPABASE_SERVICE_ROLE_KEY='local-fixture-key'
    const {default:app}=await import('../../server/index.js')
    const server=await new Promise(resolve => { const listener=app.listen(0,'127.0.0.1',()=>resolve(listener)) })
    const headers={Authorization:`Bearer ${token}`}
    const realFetch=(route,options)=>fetch(`http://127.0.0.1:${server.address().port}${route}`,options)
    try {
      for (const legacy of [publishPassportSnapshot,unpublishPassportSnapshot]) {
        await assert.rejects(()=>legacy(artistId,headers,realFetch),error=>error.status===403)
      }
      assert.equal(rpcCalls,0,'missing user selections must never be invented by a compatibility wrapper')
      const firstRequest=publication()
      const published=await performEvidenceAction(firstRequest,headers,realFetch)
      assert.equal(published.status,'committed');assert.ok(published.receipt.passportVersionId)
      const recipientRead = options => readPassportSnapshot(artistId,realFetch,options)
      const read = await recipientRead({purpose:firstRequest.payload.purpose,accessToken:recipientToken})
      assert.equal(read.claims[0].value,'Fixture performance')
      for(const options of [{},{purpose:firstRequest.payload.purpose},{accessToken:recipientToken},
        {purpose:'Wrong purpose',accessToken:recipientToken},{purpose:firstRequest.payload.purpose,accessToken:token}]) {
        assert.deepEqual(await recipientRead(options),{artist:null,items:[],claims:[]})
      }
      const actualNow = Date.now
      try {
        // Only the HTTP reader clock moves; the immutable real PostgreSQL
        // snapshot and its stored expiry remain untouched.
        Date.now = () => Date.parse('2100-01-01T00:00:00Z')
        assert.deepEqual(await recipientRead({purpose:firstRequest.payload.purpose,accessToken:recipientToken}),{artist:null,items:[],claims:[]})
      } finally { Date.now = actualNow }
      for (const changed of [{workspaceId:repWorkspace},{contextVersion:99},{expectedVersion:0}]) {
        assert.equal((await performEvidenceAction({...publication(),expectedVersion:4,...changed},headers,realFetch)).status,'denied')
      }
      await owner("update public.role_assignment set functional_role='viewer'")
      assert.equal((await performEvidenceAction({...publication(),expectedVersion:4},headers,realFetch)).status,'denied')
      await owner("update public.role_assignment set functional_role='artist' where person_id='"+actor+"'")
      const replacement={...publication(),action:'replace',expectedVersion:4}
      const recovered=await performEvidenceAction(replacement,headers,async(route,options)=>{
        const response=await realFetch(route,options)
        if(route.endsWith('/commit')) { assert.equal(response.status,200);throw new TypeError('committed response lost') }
        return response
      })
      assert.equal(recovered.status,'committed');assert.notEqual(recovered.receipt.passportVersionId,published.receipt.passportVersionId)
      const neverReceived=make('withdraw',{expectedVersion:5,expectedObjectVersion:3})
      const unresolved=await performEvidenceAction(neverReceived,headers,async()=>{throw new TypeError('offline')})
      assert.equal(unresolved.status,'uncertain')
      assert.equal((await recoverEvidenceAction(neverReceived,headers,realFetch)).status,'not_committed')
      assert.equal((await performEvidenceAction(neverReceived,headers,realFetch)).status,'denied')
      const withdrawn=await performEvidenceAction(make('withdraw',{expectedVersion:5,expectedObjectVersion:3}),headers,realFetch)
      assert.equal(withdrawn.status,'committed')
      assert.deepEqual(await recipientRead({purpose:firstRequest.payload.purpose,accessToken:recipientToken}),{artist:null,items:[],claims:[]})
      await client.query('reset role')
      assert.equal((await client.query('select count(*)::int as n from public.passport_versions')).rows[0].n,2)
      assert.equal((await client.query('select published from public.artists where id=$1',[artistId])).rows[0].published,false)
      console.log('KU03_CALLER_EXPRESS_POSTGRES=publish/replace/withdraw + wrong-context/role/stale + lost-response/fenced-noncommit; real DB, local Auth/PostgREST adapter')
    } finally {
      await new Promise(resolve=>server.close(resolve))
      await new Promise(resolve=>bridge.close(resolve))
    }
  })
  await test('24 authenticated direct snapshot reads cannot bypass recipient purpose or expiry', async () => {
    await eligible(); const receipt = await call(publication())
    // Model ordinary PostgREST table privileges separately from RLS. A missing
    // fixture GRANT must not masquerade as a successful recipient boundary.
    await owner('grant select on public.passport_versions to authenticated')
    await as('71000000-0000-4000-8000-000000000099')
    const unrelated = await client.query('select snapshot from public.passport_versions where id=$1', [receipt.passportVersionId])
    assert.equal(unrelated.rows.length, 0, 'nonrecipient must not read a managed snapshot directly')
    await as(representative)
    assert.equal((await client.query('select snapshot from public.passport_versions')).rows.length, 0,
      'even the recipient must use the API purpose/current-version/expiry gate')
    await client.query('reset role')
    assert.equal((await client.query('select count(*)::int as n from public.passport_versions')).rows[0].n, 1)
  })
  await test('25 publish and replacement require distinct current publication states', async () => {
    await eligible()
    await deny({ ...publication(), action: 'replace' })
    const initial = await call(publication())
    await deny({ ...publication(), expectedVersion: 4 })
    const replaced = await call({ ...publication(), action: 'replace', expectedVersion: 4 })
    assert.notEqual(replaced.passportVersionId, initial.passportVersionId)
  })
  await test('26 owner handoff reads the exact persisted publication purpose, never a persona default', async () => {
    await eligible(); const published=await call(publication())
    const read=(await client.query('select public.get_evidence_workbench($1,$2) as data',[artistId,artistId])).rows[0].data
    assert.equal(read.publication?.versionId,published.passportVersionId)
    assert.equal(read.publication?.purpose,'Fixture booking review')
    await as(representative)
    const rep=(await client.query('select public.get_evidence_workbench($1,$2) as data',[artistId,artistId])).rows[0].data
    assert.equal(rep.publication,null,'a representative view grant does not reveal the owner recipient handoff')
  })
  await test('27 proposal-only representative cannot invalidate confirmed truth', async () => {
    await eligible(); await call(publication())
    await owner("update public.artist_access set scope=array['view','publish']")
    const protectedState = async () => (await client.query(`select
      (select jsonb_agg(to_jsonb(c) order by id) from public.claims c) as claims,
      (select jsonb_agg(to_jsonb(v) order by id) from public.passport_versions v) as snapshots,
      (select jsonb_agg(to_jsonb(h) order by id) from private.evidence_action_history h) as history,
      (select published from public.artists where id=$1) as published`, [artistId])).rows
    const before = await protectedState()
    await as(representative)
    await deny(make('propose', { workspaceId: repWorkspace, expectedVersion: 4, expectedObjectVersion: 3,
      payload: { statement: 'Unauthorized replacement' } }))
    await deny(make('withdraw', { workspaceId: repWorkspace, expectedVersion: 4, expectedObjectVersion: 3 }))
    await client.query('reset role')
    assert.deepEqual(await protectedState(), before)
  })
  await test('28 unrelated proposal and its withdrawal preserve current publication', async () => {
    await eligible(); const published = await call(publication())
    await owner("update public.artist_access set scope=array['view','upload','publish']")
    const original = (await client.query('select to_jsonb(v) as row from public.passport_versions v where id=$1', [published.passportVersionId])).rows
    const second = '74000000-0000-4000-8000-000000000002'
    await as(representative)
    await call(make('upload', { workspaceId: repWorkspace, objectId: second, expectedVersion: 4 }))
    await call(make('propose', { workspaceId: repWorkspace, objectId: second, expectedVersion: 5, expectedObjectVersion: 1,
      payload: { statement: 'Separate nonbinding proposal' } }))
    for (const withdraw of [false, true]) {
      if (withdraw) {
        await as(representative)
        await call(make('withdraw', { workspaceId: repWorkspace, objectId: second, expectedVersion: 6, expectedObjectVersion: 2 }))
      }
      await client.query('reset role')
      assert.equal((await client.query('select published from public.artists where id=$1', [artistId])).rows[0].published, true)
      assert.deepEqual((await client.query('select to_jsonb(v) as row from public.passport_versions v where id=$1', [published.passportVersionId])).rows, original)
      assert.equal((await client.query('select artist_approved from public.claims where evidence_id=$1', [objectId])).rows[0].artist_approved, true)
    }
  })
  console.log(`KU03_NONBINDING_PROPOSAL=${2 - failures.filter(name => /^(27|28) /.test(name)).length}/2`)
  console.log(`KU03_PUBLICATION_BOUNDARY=${2 - failures.filter(name => /^(24|25) /.test(name)).length}/2`)
  assert.equal(failures.length, 0, `failed cases: ${failures.join(', ')}`)
  await client.query('begin')
  try {
    await eligible()
    const first = await call(publication())
    await client.query('reset role')
    const readState = async () => (await client.query(`select
      (select jsonb_agg(to_jsonb(v) order by id) from public.passport_versions v) as snapshots,
      (select jsonb_agg(to_jsonb(h) order by id) from private.evidence_action_history h) as history,
      (select published from public.artists where id=$1) as published,
      (select ku03_version from public.act where id=$1) as version`, [artistId])).rows[0]
    const before = await readState()
    await client.query(`create function pg_temp.reject_action_receipt() returns trigger language plpgsql as
      $$ begin raise exception 'fixture receipt persistence failure'; end $$;
      create trigger fixture_receipt_failure before insert on private.evidence_action_history
      for each row execute function pg_temp.reject_action_receipt()`)
    await as(actor)
    const replacement = { ...publication(), action: 'replace', expectedVersion: 4 }
    await deny(replacement)
    await client.query('reset role')
    const after = await readState()
    for (const key of ['snapshots', 'history', 'published', 'version']) assert.deepEqual(after[key], before[key], key)
    console.log('KU03_ATOMIC_ROLLBACK=4/4')
    await client.query('drop trigger fixture_receipt_failure on private.evidence_action_history')
    await as(actor)
    const second = await call(replacement)
    assert.notEqual(second.passportVersionId, first.passportVersionId)
    await client.query('reset role')
    assert.deepEqual((await readState()).snapshots.find(row => row.id === first.passportVersionId), before.snapshots[0])
    console.log('KU03_IMMUTABLE_REPLACEMENT=1/1')
  } finally { await client.query('rollback'); await client.query('reset role') }

  // Two actual sessions, same actor/key, blocked behind the same actor lock.
  const peers = [new pg.Client({ connectionString: url.toString() }), new pg.Client({ connectionString: url.toString() })]
  try {
    for (const peer of peers) { await peer.connect(); await peer.query(`set request.jwt.claim.sub='${actor}'; set role authenticated; set statement_timeout='10s'`) }
    await client.query('begin')
    await client.query('select 1 from public.active_role_context where person_id=$1 for update', [actor])
    const request = make('upload')
    const concurrent = peers.map(peer => peer.query('select public.commit_evidence_action($1) as receipt', [request]))
    await client.query('commit')
    const results = await Promise.all(concurrent)
    assert.deepEqual(results[0].rows, results[1].rows)
    assert.equal((await client.query('select ku03_version from public.act where id=$1', [artistId])).rows[0].ku03_version, '1')
    console.log('KU03_CONCURRENT_IDEMPOTENCY=2/2')
    const notReceived = make('change', { expectedVersion: 1, expectedObjectVersion: 1 })
    const proof = await peers[0].query('select public.resolve_evidence_action($1) as outcome', [notReceived])
    assert.equal(proof.rows[0].outcome.status, 'not_committed')
    await assert.rejects(() => peers[1].query('select public.commit_evidence_action($1)', [notReceived]), /evidence_action_unavailable/)
    console.log('KU03_DELAYED_COMMIT_FENCE=2/2')
  } finally { await client.query('rollback'); await Promise.all(peers.map(peer => peer.end())) }
  const history = (await client.query('select jsonb_agg(to_jsonb(h) order by id) as rows from private.evidence_action_history h')).rows
  await client.query(fs.readFileSync(path.join(root, 'supabase/rollback/20260830221500_representative_evidence_actions.sql'), 'utf8'))
  const permissions = (await client.query(`select
    not has_function_privilege('authenticated','public.commit_evidence_action(jsonb)','execute') as commit_disabled,
    not has_function_privilege('authenticated','public.resolve_evidence_action(jsonb)','execute') as recovery_disabled,
    not has_function_privilege('authenticated','public.get_evidence_workbench(uuid,uuid)','execute') as read_disabled`)).rows[0]
  assert.ok(Object.values(permissions).every(Boolean))
  assert.deepEqual((await client.query('select jsonb_agg(to_jsonb(h) order by id) as rows from private.evidence_action_history h')).rows, history)
  console.log('KU03_OPERATIONAL_ROLLBACK=4/4')
  const result = []
  for (const statement of Array.isArray(result) ? result : [result]) {
    for (const row of statement.rows ?? []) console.log(JSON.stringify(row))
  }
} finally { await client.end() }
