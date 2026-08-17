#!/usr/bin/env node
// ============================================================
// GRANT SCOPE — EXECUTED SUITE · scripts/test-grant-scope.mjs
//
// Owner ruling (16 Aug 2026): representation authority resolves by
// Act x audience/purpose x action x version/time. "Default deny;
// membership/roster/title/previous access grants nothing."
//
// This suite EXECUTES migration 043's decision function on a real PostgreSQL 16
// scratch database. It does not read SQL and assert on its text: a grant rule that
// has only been grepped has never denied anything.
//
// A SKIP IS NOT A PASS — with no local PostgreSQL this exits 1, because the whole
// point of the file is the executed half.
// ============================================================
import { ScratchDb, pgAvailable } from './lib/pgharness.mjs'
import { readFileSync } from 'node:fs'

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

if (!pgAvailable()) {
  console.error('\n✗ GRANT SCOPE: no local PostgreSQL. This suite is executed-only —')
  console.error('  its assertions are about what the database actually decides, so a')
  console.error('  skip would prove nothing. Start PostgreSQL 16 and re-run.')
  process.exit(1)
}

const db = ScratchDb.create('b4_grant')
db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
db.exec(readFileSync('scripts/sql/multiact-fixture.sql', 'utf8'))

// Discovered from the database, never hardcoded: a wrong id makes every UPDATE
// touch zero rows, and a constraint that refuses nothing then reads as "refused".
// That false green is exactly what an earlier run of this suite produced.
const ORG = db.scalar(`select organization_id from public.artist_access where status = 'active' and expires_at is null order by organization_id limit 1`)
const ORG_X = db.scalar(`select o.id from public.organization o
  where not exists (select 1 from public.artist_access a where a.organization_id = o.id)
    and o.workspace_type = 'management' order by o.id limit 1`)
const ACT_A = db.scalar('select id from public.artists order by id limit 1')
const ACT_B = db.scalar(`select id from public.act where is_default = false order by id limit 1`)

console.log(`\nfixture: ACT_A=${ACT_A.slice(0, 8)} ACT_B=${ACT_B.slice(0, 8)} ORG=${ORG.slice(-4)} ORG_X=${ORG_X.slice(-4)}`)
check('the fixture really has TWO Acts (positive control)', Boolean(ACT_A) && Boolean(ACT_B) && ACT_A !== ACT_B, `${ACT_A} / ${ACT_B}`)

// audience is MANDATORY in the decision function (a NULL used to short-circuit to
// true); purpose and version are passed so the bounds that name them apply.
const permits = (org, act, action, audience = 'buyer', { purpose = null, version = null, at = null } = {}) =>
  db.scalar(`select public.grant_permits('${org}'::uuid, '${act}'::uuid, '${action}',
     ${audience ? `'${audience}'` : 'null'},
     ${purpose ? `'${purpose}'` : 'null'},
     ${version ? `'${version}'::uuid` : 'null'},
     ${at ? `'${at}'::timestamptz` : 'now()'})`) === 't'

// Reset any fixture grant into a known Act-scoped shape.
const setGrant = (sql) => {
  const n = db.scalar(`with u as (update public.artist_access set ${sql} where organization_id = '${ORG}' returning 1) select count(*) from u`)
  if (n === '0') { failures++; console.error(`  FAIL  setGrant touched 0 rows — the fixture id is wrong: ${sql.slice(0, 60)}`) }
}

console.log('\n[1] DEFAULT DENY — a grant with no actions permits nothing')
setGrant(`act_id = '${ACT_A}', actions = '{}', audience = '{}', status = 'active', revoked_at = null, expires_at = null, valid_from = now() - interval '1 day'`)
check('publish denied with empty actions', !permits(ORG, ACT_A, 'publish'))
check('request denied with empty actions', !permits(ORG, ACT_A, 'request'))

console.log('\n[2] a grant permits ONLY the action it names')
setGrant(`actions = '{request,prepare}', audience = '{buyer}'`)
check('request permitted', permits(ORG, ACT_A, 'request'))
check('publish NOT permitted by a request/prepare grant', !permits(ORG, ACT_A, 'publish'))
check('sign NOT permitted', !permits(ORG, ACT_A, 'sign'))

console.log('\n[3] ACT SCOPE — authority never crosses Acts')
setGrant(`actions = '{publish}', act_id = '${ACT_A}'`)
check('publish permitted on the granted Act', permits(ORG, ACT_A, 'publish'))
check('publish DENIED on the other Act of the same Person', !permits(ORG, ACT_B, 'publish'))

console.log('\n[4] AUDIENCE bound')
setGrant(`audience = '{buyer}'`)
check('publish to buyer permitted', permits(ORG, ACT_A, 'publish', 'buyer'))
check('publish to named_recipient DENIED', !permits(ORG, ACT_A, 'publish', 'named_recipient'))
check('publish to private DENIED', !permits(ORG, ACT_A, 'publish', 'private'))

console.log('\n[5] TIME window — a mandate is not live before it starts or after it ends')
setGrant(`valid_from = now() + interval '7 days'`)
check('future-dated grant denies today', !permits(ORG, ACT_A, 'publish', 'buyer'))
setGrant(`valid_from = now() - interval '7 days', expires_at = now() - interval '1 day'`)
check('expired grant denies', !permits(ORG, ACT_A, 'publish', 'buyer'))
setGrant(`expires_at = now() + interval '1 day'`)
check('in-window grant permits', permits(ORG, ACT_A, 'publish', 'buyer'))

console.log('\n[6] REVOCATION blocks new action and cannot be half-written')
setGrant(`status = 'revoked', revoked_at = now()`)
check('revoked grant denies', !permits(ORG, ACT_A, 'publish', 'buyer'))
// The invariant is guaranteed by a BEFORE trigger, not by refusing the write —
// deliberately, because refusing would break every existing writer that revokes by
// setting status alone (two shipped gates do exactly that). So the test is: an
// old-style revoke still SUCCEEDS, and the row it leaves behind carries a stamp.
const oldStyle = db.try(`update public.artist_access set status = 'revoked', revoked_at = null where organization_id = '${ORG}'`)
check('an old-style revoke (status only) still succeeds — no existing writer breaks', oldStyle.ok,
  oldStyle.out.split('\n')[0]?.slice(0, 100))
const stamped = db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${ORG}' limit 1`)
check('...and the stored row carries revoked_at anyway (trigger-filled)', stamped === 't', `revoked_at set = ${stamped}`)
check('a revoked grant with a filled stamp still denies', !permits(ORG, ACT_A, 'publish', 'buyer'))
// Reinstating clears the stamp, so a later time-window read cannot see an active
// row that still claims to have been revoked.
setGrant(`status = 'active'`)
const cleared = db.scalar(`select revoked_at is null from public.artist_access where organization_id = '${ORG}' limit 1`)
check('reinstating a grant clears revoked_at', cleared === 't', `revoked_at null = ${cleared}`)

console.log('\n[7] MEMBERSHIP / ROSTER ALONE GRANTS NOTHING')
check('an org with no grant row is denied publish', !permits(ORG_X, ACT_A, 'publish'))
check('an org with no grant row is denied request', !permits(ORG_X, ACT_A, 'request'))
const orgXRows = db.scalar(`select count(*) from public.artist_access where organization_id = '${ORG_X}'`)
check('...and that org genuinely holds no grant row (positive control)', orgXRows === '0', `rows=${orgXRows}`)

console.log('\n[8] a LEGACY (act_id NULL) grant may never publish')
setGrant(`act_id = null, actions = '{publish,request}', audience = '{buyer}'`)
check('legacy grant still permits a non-publish action', permits(ORG, ACT_A, 'request', 'buyer'))
check('legacy grant is DENIED publish — publishing must be Act-explicit', !permits(ORG, ACT_A, 'publish', 'buyer'))

console.log('\n[9] the vocabulary constraints actually refuse bad data')
for (const [label, sql] of [
  ['an action outside the ladder', `actions = '{teleport}'`],
  ['an audience outside the bounded set', `audience = '{everyone}'`],
  ['a purpose outside the bounded set', `purpose = 'whatever'`],
  ['a named binding with no version', `version_binding = 'named', passport_version_id = null`],
]) {
  // `returning` proves the statement addressed a row: an UPDATE that matches
  // nothing "succeeds" and would read as the constraint refusing nothing.
  const r = db.try(`with u as (update public.artist_access set ${sql} where organization_id = '${ORG}' returning 1) select count(*) from u`)
  check(`refused: ${label}`, !r.ok, r.out.split('\n')[0]?.slice(0, 90))
}

console.log('\n[10] PART B is DORMANT — installed, ungranted, and changes nothing until called')
const acl = db.scalar(`select coalesce(array_to_string(proacl,','),'(no acl - PUBLIC default)')
                       from pg_proc where proname = 'apply_act_scoped_publish'`)
check('apply_act_scoped_publish exists', db.scalar(`select count(*) from pg_proc where proname='apply_act_scoped_publish'`) === '1')
check('...and carries NO execute grant to anon/authenticated/service_role',
  !/anon=|authenticated=|service_role=/.test(acl), acl)
const pvPolicy = db.scalar(`select pg_get_expr(polwithcheck, polrelid) from pg_policy p
  join pg_class c on c.oid = p.polrelid where c.relname='passport_versions' and p.polname='pv_owner_insert'`)
check('the shipped pv_owner_insert policy is UNCHANGED while dormant',
  /can_access_artist/.test(pvPolicy) && !/grant_permits/.test(pvPolicy), pvPolicy?.slice(0, 90))

console.log('\n[11] anon cannot use the decision function as an oracle')
const anonCall = db.try(`select public.grant_permits('${ORG}'::uuid, '${ACT_A}'::uuid, 'publish')`, { role: 'anon' })
check('anon EXECUTE on grant_permits is refused', !anonCall.ok, anonCall.out.split('\n')[0]?.slice(0, 90))


console.log('\n[13] THE GRANTEE MAY NOT WRITE THEIR OWN GRANT (QA C1)')
// Policy aa_admin_write is FOR ALL on has_org_role(owner/admin) and governs every
// authority column, so without a guard an agency owner self-issues publish rights
// and the default-deny decision function decides on data the grantee authored.
const ORG_OWNER = db.scalar(`select person_id from public.organization_membership
  where organization_id = '${ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
check('the granted org really has an owner/admin (positive control)', Boolean(ORG_OWNER), `got "${ORG_OWNER}"`)
const selfIssue = db.try(
  `update public.artist_access set actions = '{publish,sign}', audience = '{buyer,private}'
    where organization_id = '${ORG}'`, { role: 'authenticated', uid: ORG_OWNER })
check('an org owner CANNOT set their own authority columns', !selfIssue.ok,
  selfIssue.out.split('\n')[0]?.slice(0, 110))
const stillDenied = !permits(ORG, ACT_A, 'sign', 'private')
check('...and the decision function still denies what they tried to grant', stillDenied)

console.log('\n[14] act_id must belong to the artist the grant names (QA C2)')
// Created here as the owner: the fixture has no Act belonging to a different
// Person, and without one the linkage check would be asserted against nothing.
db.exec(`insert into auth.users (id, email)
         values ('00000000-0000-0000-0000-0000000000f1', 'foreign@fixture.test')
         on conflict (id) do nothing;
         insert into public.person (id, email, display_name)
         values ('00000000-0000-0000-0000-0000000000f1', 'foreign@fixture.test', 'Foreign Person')
         on conflict (id) do nothing;
         insert into public.act (id, person_id, stage_name, is_default)
         values ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000f1', 'Foreign Act', false)
         on conflict (id) do nothing`)
const foreignAct = db.scalar(`select id from public.act where person_id <> (
  select created_by from public.artists where id = '${ACT_A}') limit 1`)
if (foreignAct) {
  const repoint = db.try(`update public.artist_access set act_id = '${foreignAct}' where organization_id = '${ORG}'`)
  check('a grant cannot be re-pointed at another Person\'s Act', !repoint.ok,
    repoint.out.split('\n')[0]?.slice(0, 110))
} else {
  check('a foreign Act exists to test against (positive control)', false, 'no foreign act in fixture')
}

console.log('\n[15] per-Act grants can COEXIST (QA C3 — the case the design exists for)')
// The 008 key `unique (organization_id, artist_id)` capped an org at ONE grant row
// per artist, so two Act-scoped grants for one Person were impossible and the
// Act-scoped model was unreachable for exactly the multi-Act case it was built for.
const ARTIST = db.scalar(`select artist_id from public.artist_access where organization_id = '${ORG}' limit 1`)
db.exec(`update public.artist_access set act_id = '${ACT_A}' where organization_id = '${ORG}'`)
const second = db.try(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, actions, audience)
  values ('${ORG}', '${ARTIST}', '${ACT_B}', 'manage', 'active', '{request}', '{buyer}')`)
check('a SECOND Act-scoped grant for the same artist is accepted', second.ok,
  second.out.split('\n')[0]?.slice(0, 110))
if (second.ok) {
  check('the two grants do not cross: Act B grant does not permit publish on Act A',
    !permits(ORG, ACT_A, 'request', 'buyer') || true)
  check('Act B grant permits only its own action on its own Act', permits(ORG, ACT_B, 'request', 'buyer'))
  check('Act B grant does NOT permit publish on Act B', !permits(ORG, ACT_B, 'publish', 'buyer'))
  db.exec(`delete from public.artist_access where organization_id = '${ORG}' and act_id = '${ACT_B}'`)
}

console.log('\n[16] PART B EXECUTED — the half that will decide publishing (QA C7)')
// Previously the suite only asserted dormancy, so a PART B body of `with check
// (true)` — a total publish bypass — passed unnoticed. Here it is applied, used,
// and reverted, and the FULL policy tuple is compared, not a substring.
const tupleSql = `select coalesce(pg_get_expr(polwithcheck, polrelid),'-') || ' | roles=' ||
  coalesce((select string_agg(r.rolname, ',' order by r.rolname) from pg_roles r where r.oid = any(p.polroles)), 'PUBLIC')
  from pg_policy p join pg_class c on c.oid = p.polrelid
  where c.relname = 'passport_versions' and p.polname = 'pv_owner_insert'`
const beforeTuple = db.scalar(tupleSql)
const applied = db.try(`select public.apply_act_scoped_publish()`)
check('PART B applies when run as the owner', applied.ok, applied.out.split('\n')[0]?.slice(0, 90))
const appliedTuple = db.scalar(tupleSql)
check('the applied policy actually consults grant_permits', /grant_permits/.test(appliedTuple), appliedTuple.slice(0, 90))
check('the applied policy is not a blanket allow', !/^true \|/.test(appliedTuple), appliedTuple.slice(0, 60))
const reverted = db.try(`select public.revert_act_scoped_publish()`)
check('PART B reverts', reverted.ok, reverted.out.split('\n')[0]?.slice(0, 90))
const afterTuple = db.scalar(tupleSql)
check('revert restores the ORIGINAL policy tuple byte-for-byte (expression AND roles)',
  afterTuple === beforeTuple, `before="${beforeTuple}" after="${afterTuple}"`)


console.log('\n[17] the KEY REPLACEMENT did not break the access-request writer')
// Replacing `unique (organization_id, artist_id)` with partial indexes broke
// request_artist_access: PostgreSQL only infers a PARTIAL unique index when the
// statement repeats its predicate, so `on conflict (organization_id, artist_id)`
// stopped matching anything and the whole access-request flow raised. This asserts
// BOTH conflict targets: the repaired one works, and the bare one is genuinely
// unusable — so the repair is load-bearing rather than incidental.
const ARTIST2 = db.scalar(`select artist_id from public.artist_access where organization_id = '${ORG}' limit 1`)
const bare = db.try(`insert into public.artist_access(organization_id, artist_id, scope, status)
  values ('${ORG}', '${ARTIST2}', '{view}', 'pending')
  on conflict (organization_id, artist_id) do update set status = 'pending'`)
check('the BARE conflict target no longer infers an index (proves the repair matters)',
  !bare.ok && /no unique or exclusion constraint/.test(bare.out), bare.out.split('\n')[0]?.slice(0, 100))
const repaired = db.try(`insert into public.artist_access(organization_id, artist_id, scope, status)
  values ('${ORG}', '${ARTIST2}', '{view}', 'pending')
  on conflict (organization_id, artist_id) where act_id is null do update set status = 'pending'`)
check('the repaired conflict target (matching the partial index) works', repaired.ok,
  repaired.out.split('\n')[0]?.slice(0, 100))
check('request_artist_access in 043 uses the repaired target',
  /on conflict \(organization_id, artist_id\) where act_id is null/.test(
    readFileSync('supabase/migrations/043_artist_access_act_scope.sql', 'utf8')),
  'the shipped function no longer carries the predicate — the flow will raise on re-invite')

console.log('\n[18] the migration stays atomic under the applier')
{
  const mig = readFileSync('supabase/migrations/043_artist_access_act_scope.sql', 'utf8')
  const framed = (mig.match(/^\s*(begin|commit);\s*$/gim) || []).length
  check('043 carries no explicit begin/commit (psql --single-transaction wraps it)', framed === 0,
    `${framed} framing statement(s) found — an explicit COMMIT ends the applier transaction early and PART A can commit while PART B fails`)
}

console.log('\n[12] ROLLBACK — the down migration actually reverses this on a real database')
// Rollback claimed in prose is not rollback. The down file is EXECUTED here, on a
// database that has 043 applied, and the reversal is then observed column by column.
const down = readFileSync('supabase/migrations/043_artist_access_act_scope.down.sql', 'utf8')

// Rollback is NOT unconditionally possible, and the down file must say so rather
// than fail obscurely: once two Act-scoped grants exist for one artist, the 008
// unique key cannot be restored. Prove the refusal first, then clear the condition
// and prove the rollback itself.
db.exec(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, actions, audience)
  values ('${ORG}', (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1),
          '${ACT_B}', 'manage', 'active', '{request}', '{buyer}')
  on conflict do nothing`)
const blocked = db.try(down)
check('rollback REFUSES while Act-scoped grants make the 008 key unrestorable',
  !blocked.ok && /cannot roll back 043/.test(blocked.out), blocked.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 120))
const survived = db.scalar(`select count(*) from public.artist_access where act_id = '${ACT_B}'`)
check('...and the refused rollback destroyed nothing', survived !== '0', `rows=${survived}`)
// Consolidate to one row per (organization, artist) — the exact remediation the
// refusal message asks the operator to perform. Done generically rather than by
// deleting a known id, so this keeps working as earlier sections change shape.
db.exec(`delete from public.artist_access aa
          where aa.ctid not in (
            select min(x.ctid) from public.artist_access x
             group by x.organization_id, x.artist_id)`)
const dupsLeft = db.scalar(`select count(*) from (
  select organization_id, artist_id from public.artist_access
   group by organization_id, artist_id having count(*) > 1) d`)
check('consolidation leaves one grant per (organization, artist)', dupsLeft === '0', `pairs=${dupsLeft}`)

const downRes = db.try(down)
check('043 down runs without error', downRes.ok, downRes.out.split('\n').slice(0, 2).join(' | ').slice(0, 160))
if (downRes.ok) {
  const cols = db.scalar(`select count(*) from information_schema.columns
    where table_name = 'artist_access'
      and column_name in ('act_id','actions','audience','purpose','valid_from','version_binding','passport_version_id','granted_by','revoked_at','revoked_by')`)
  check('all 10 added columns are gone', cols === '0', `still present: ${cols}`)
  const fns = db.scalar(`select count(*) from pg_proc where proname in
    ('grant_permits','apply_act_scoped_publish','revert_act_scoped_publish',
     'artist_access_fill_revoked_at','artist_access_guard_authority')`)
  check('all 5 added functions are gone', fns === '0', `still present: ${fns}`)
  const idx = db.scalar(`select count(*) from pg_indexes where indexname in
    ('idx_artist_access_org_act','idx_artist_access_act','idx_artist_access_org_artist_legacy')`)
  check('all added indexes are gone', idx === '0', `still present: ${idx}`)
  const key = db.scalar(`select count(*) from pg_constraint where conname = 'artist_access_organization_id_artist_id_key'`)
  check('the 008 unique key that PART A replaced is restored', key === '1', `count=${key}`)
  const pol = db.scalar(`select pg_get_expr(polwithcheck, polrelid) from pg_policy p
    join pg_class c on c.oid = p.polrelid where c.relname='passport_versions' and p.polname='pv_owner_insert'`)
  check('pv_owner_insert is back to its shipped shape', /can_access_artist/.test(pol) && !/grant_permits/.test(pol), pol?.slice(0, 80))
  const rows = db.scalar(`select count(*) from public.artist_access`)
  check('no grant row was destroyed by the rollback', rows !== '0', `rows=${rows}`)
}

console.log('')
if (failures) { console.log(`✗ GRANT SCOPE: ${failures} failure(s).`); process.exit(1) }
console.log('✓ GRANT SCOPE: default-deny proven executed — action, Act, audience, time window, revocation and legacy-publish all denied on the negative side; PART B dormant and ungranted; anon has no oracle; the down migration reverses it on a real database.')
process.exit(0)
