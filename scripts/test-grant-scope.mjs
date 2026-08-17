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

const permits = (org, act, action, audience = null, at = null) =>
  db.scalar(`select public.grant_permits('${org}'::uuid, '${act}'::uuid, '${action}',
     ${audience ? `'${audience}'` : 'null'}, ${at ? `'${at}'::timestamptz` : 'now()'})`) === 't'

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
setGrant(`actions = '{request,prepare}'`)
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

console.log('\n[12] ROLLBACK — the down migration actually reverses this on a real database')
// Rollback claimed in prose is not rollback. The down file is EXECUTED here, on a
// database that has 043 applied, and the reversal is then observed column by column.
const down = readFileSync('supabase/migrations/043_artist_access_act_scope.down.sql', 'utf8')
const downRes = db.try(down)
check('043 down runs without error', downRes.ok, downRes.out.split('\n').slice(0, 2).join(' | ').slice(0, 160))
if (downRes.ok) {
  const cols = db.scalar(`select count(*) from information_schema.columns
    where table_name = 'artist_access'
      and column_name in ('act_id','actions','audience','purpose','valid_from','version_binding','passport_version_id','granted_by','revoked_at','revoked_by')`)
  check('all 10 added columns are gone', cols === '0', `still present: ${cols}`)
  const fns = db.scalar(`select count(*) from pg_proc where proname in ('grant_permits','apply_act_scoped_publish','revert_act_scoped_publish')`)
  check('all 3 added functions are gone', fns === '0', `still present: ${fns}`)
  const idx = db.scalar(`select count(*) from pg_indexes where indexname in ('idx_artist_access_org_act','idx_artist_access_act')`)
  check('both added indexes are gone', idx === '0', `still present: ${idx}`)
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
