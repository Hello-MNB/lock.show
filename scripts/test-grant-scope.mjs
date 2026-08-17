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
const permits = (org, act, action, audience = 'booker', { purpose = null, version = null, at = null } = {}) =>
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
setGrant(`actions = '{request,prepare}', audience = '{booker}'`)
check('request permitted', permits(ORG, ACT_A, 'request'))
check('publish NOT permitted by a request/prepare grant', !permits(ORG, ACT_A, 'publish'))
check('sign NOT permitted', !permits(ORG, ACT_A, 'sign'))

console.log('\n[3] ACT SCOPE — authority never crosses Acts')
setGrant(`actions = '{publish}', act_id = '${ACT_A}'`)
check('publish permitted on the granted Act', permits(ORG, ACT_A, 'publish'))
check('publish DENIED on the other Act of the same Person', !permits(ORG, ACT_B, 'publish'))

console.log('\n[4] AUDIENCE bound')
setGrant(`audience = '{booker}'`)
check('publish to buyer permitted', permits(ORG, ACT_A, 'publish', 'booker'))
// 'producer' is a LEGAL audience the grant simply does not hold — the old value
// here ('named_recipient') is no longer in the vocabulary at all, so the check
// could never fail and asserted nothing.
check('publish to a legal-but-ungranted audience DENIED', !permits(ORG, ACT_A, 'publish', 'producer'))
check('publish to private DENIED', !permits(ORG, ACT_A, 'publish', 'private'))

console.log('\n[5] TIME window — a mandate is not live before it starts or after it ends')
setGrant(`valid_from = now() + interval '7 days'`)
check('future-dated grant denies today', !permits(ORG, ACT_A, 'publish', 'booker'))
setGrant(`valid_from = now() - interval '7 days', expires_at = now() - interval '1 day'`)
check('expired grant denies', !permits(ORG, ACT_A, 'publish', 'booker'))
setGrant(`expires_at = now() + interval '1 day'`)
check('in-window grant permits', permits(ORG, ACT_A, 'publish', 'booker'))

console.log('\n[6] REVOCATION blocks new action and cannot be half-written')
setGrant(`status = 'revoked', revoked_at = now()`)
check('revoked grant denies', !permits(ORG, ACT_A, 'publish', 'booker'))
// The invariant is guaranteed by a BEFORE trigger, not by refusing the write —
// deliberately, because refusing would break every existing writer that revokes by
// setting status alone (two shipped gates do exactly that). So the test is: an
// old-style revoke still SUCCEEDS, and the row it leaves behind carries a stamp.
const oldStyle = db.try(`update public.artist_access set status = 'revoked', revoked_at = null where organization_id = '${ORG}'`)
check('an old-style revoke (status only) still succeeds — no existing writer breaks', oldStyle.ok,
  oldStyle.out.split('\n')[0]?.slice(0, 100))
const stamped = db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${ORG}' limit 1`)
check('...and the stored row carries revoked_at anyway (trigger-filled)', stamped === 't', `revoked_at set = ${stamped}`)
check('a revoked grant with a filled stamp still denies', !permits(ORG, ACT_A, 'publish', 'booker'))
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
setGrant(`act_id = null, actions = '{publish,request}', audience = '{booker}'`)
check('legacy grant still permits a non-publish action', permits(ORG, ACT_A, 'request', 'booker'))
check('legacy grant is DENIED publish — publishing must be Act-explicit', !permits(ORG, ACT_A, 'publish', 'booker'))

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
// FULL ARITY. This previously called a 3-argument overload that does not exist, so
// it failed on function RESOLUTION rather than on privilege — it passed even as the
// owner, and passed with anon explicitly granted EXECUTE. The assertion now uses the
// real signature and demands a permission error specifically.
const anonCall = db.try(
  `select public.grant_permits('${ORG}'::uuid, '${ACT_A}'::uuid, 'publish', 'booker', null, null, now())`,
  { role: 'anon' })
check('anon EXECUTE on grant_permits is refused (permission, not resolution)',
  !anonCall.ok && /permission denied/i.test(anonCall.out), anonCall.out.split('\n')[0]?.slice(0, 110))
// Positive control: the same call must SUCCEED for authenticated, or the check above
// could pass simply because the call is malformed.
const authedCall = db.try(
  `select public.grant_permits('${ORG}'::uuid, '${ACT_A}'::uuid, 'publish', 'booker', null, null, now())`,
  { role: 'authenticated' })
check('...and the identical call resolves for authenticated (positive control)', authedCall.ok,
  authedCall.out.split('\n')[0]?.slice(0, 110))


console.log('\n[13] THE GRANTEE MAY NOT WRITE THEIR OWN GRANT (QA C1)')
// Policy aa_admin_write is FOR ALL on has_org_role(owner/admin) and governs every
// authority column, so without a guard an agency owner self-issues publish rights
// and the default-deny decision function decides on data the grantee authored.
const ORG_OWNER = db.scalar(`select person_id from public.organization_membership
  where organization_id = '${ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
check('the granted org really has an owner/admin (positive control)', Boolean(ORG_OWNER), `got "${ORG_OWNER}"`)
const selfIssue = db.try(
  `update public.artist_access set actions = '{publish,sign}', audience = '{booker,private}'
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
// Disjoint actions on purpose: Act A may publish, Act B may only request. With
// overlapping actions "does not cross" is untestable — both grants would answer
// the same question and a leak would look like a legitimate permit.
db.exec(`update public.artist_access set act_id = '${ACT_A}', actions = '{publish}', audience = '{booker}'
          where organization_id = '${ORG}'`)
const second = db.try(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, actions, audience)
  values ('${ORG}', '${ARTIST}', '${ACT_B}', 'manage', 'active', '{request}', '{booker}')`)
check('a SECOND Act-scoped grant for the same artist is accepted', second.ok,
  second.out.split('\n')[0]?.slice(0, 110))
if (second.ok) {
  // Was `!permits(...) || true` — a tautology that asserted nothing. The real
  // separation claim: each grant carries ONLY its own action on its own Act, so
  // Act A's publish grant must not answer for Act B's request action, or vice versa.
  check('the Act A grant does not carry the Act B grant\'s action', !permits(ORG, ACT_A, 'request', 'booker'))
  check('Act B grant permits only its own action on its own Act', permits(ORG, ACT_B, 'request', 'booker'))
  check('Act B grant does NOT permit publish on Act B', !permits(ORG, ACT_B, 'publish', 'booker'))
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


console.log('\n[17] the access-request writer survives the key replacement, and stays idempotent')
// Two separate defects met here. (a) Replacing `unique (organization_id, artist_id)`
// broke `on conflict (organization_id, artist_id)`, because PostgreSQL infers a
// PARTIAL unique index only when the statement repeats its predicate. (b) Once
// Act-scoped rows exist, ANY legacy-predicate conflict target stops seeing them, so
// a re-invite silently created a SECOND row and left the Act-scoped grant active —
// and that duplicate (org, artist) pair is exactly what makes rollback refuse.
// 043 therefore resets every row for the pair instead of relying on ON CONFLICT.
// Asserted by EXECUTION, not by grepping the function text.
const bare = db.try(`insert into public.artist_access(organization_id, artist_id, scope, status)
  values ('${ORG}', (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1), '{view}', 'pending')
  on conflict (organization_id, artist_id) do update set status = 'pending'`)
check('the BARE conflict target no longer infers an index (why the rewrite was needed)',
  !bare.ok && /no unique or exclusion constraint/.test(bare.out), bare.out.split('\n')[0]?.slice(0, 100))

const REQ_ORG = db.scalar(`select o.id from public.organization o
  where o.workspace_type = 'management'
    and not exists (select 1 from public.artist_access a where a.organization_id = o.id)
  order by o.id limit 1`)
const REQ_ADMIN = db.scalar(`select person_id from public.organization_membership
  where organization_id = '${REQ_ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
const SUBJ = db.scalar(`select id from public.artists limit 1`)
if (REQ_ORG && REQ_ADMIN) {
  const first = db.try(`select public.request_artist_access('${REQ_ORG}'::uuid, '${SUBJ}'::uuid, array['view']::text[], null)`,
    { role: 'authenticated', uid: REQ_ADMIN })
  check('an authorized admin can request access', first.ok, first.out.split('\n')[0]?.slice(0, 100))
  // Give the org an ACT-SCOPED grant, then re-invite: the old code created a second row.
  db.exec(`update public.artist_access set act_id = '${ACT_A}', status = 'active', actions = '{publish}', audience = '{booker}'
            where organization_id = '${REQ_ORG}'`)
  const again = db.try(`select public.request_artist_access('${REQ_ORG}'::uuid, '${SUBJ}'::uuid, array['view']::text[], null)`,
    { role: 'authenticated', uid: REQ_ADMIN })
  check('re-inviting over an Act-scoped grant succeeds', again.ok, again.out.split('\n')[0]?.slice(0, 100))
  // The correct contract, after the H-2 fix: a LEGACY request touches only the
  // legacy row. It creates one if absent (the access actually being asked for) and
  // leaves any Act-scoped grant exactly as it was. Two rows for one (org, artist)
  // is legitimate under the replaced key — one legacy, one per Act — and it is also
  // the state in which rollback correctly refuses until consolidated.
  const legacySt = db.scalar(`select status from public.artist_access
     where organization_id = '${REQ_ORG}' and artist_id = '${SUBJ}' and act_id is null limit 1`)
  check('the LEGACY row exists and is reset to pending, per the 027 contract', legacySt === 'pending', `status=${legacySt}`)
  const actSt = db.scalar(`select status from public.artist_access
     where organization_id = '${REQ_ORG}' and artist_id = '${SUBJ}' and act_id is not null limit 1`)
  check('...and the Act-scoped grant is left ACTIVE, not silently downgraded', actSt === 'active', `status=${actSt}`)
  db.exec(`delete from public.artist_access where organization_id = '${REQ_ORG}'`)
} else {
  check('a grantless management org + admin exist to test the re-invite (positive control)', false,
    `org=${REQ_ORG} admin=${REQ_ADMIN}`)
}


console.log('\n[19] the bounds a grantee must NOT be able to move (QA C-1/C-2/H-8)')
// Every case here was reproduced by independent QA against the previous draft.
// The guard covered only the eight columns 043 added, so status, expires_at and the
// revocation stamp were all grantee-writable — meaning revocation and time, the two
// bounds the owner ruling names explicitly, were controlled by the party they bind.
db.exec(`update public.artist_access
            set act_id = '${ACT_A}', actions = '{publish}', audience = '{booker}',
                status = 'revoked', revoked_at = now(), expires_at = null
          where organization_id = '${ORG}'`)
const GRANTEE = db.scalar(`select person_id from public.organization_membership
  where organization_id = '${ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
const asGrantee = (sql) => db.try(sql, { role: 'authenticated', uid: GRANTEE })

check('a revoked grant cannot be self-reinstated (status is guarded)',
  !asGrantee(`update public.artist_access set status = 'active' where organization_id = '${ORG}'`).ok)
check('...so it still denies publish', !permits(ORG, ACT_A, 'publish', 'booker'))
check('the revocation stamp survives (it is not erased by a grantee reinstate)',
  db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${ORG}' limit 1`) === 't')
// The check above cannot see the reinstate rule on its own: the grantee's write is
// refused by the guard, so the fill trigger never runs and the stamp survives no
// matter what the trust condition says. What follows EXECUTES both sides.
//
// This replaces a regex over the migration text that asserted the trust condition
// was literally `current_user = table_owner`. That gate did not witness behaviour,
// and worse, it FAILED the correct fix — widening trust to service_role, which a
// live defect required. A gate that rejects the repair is worse than no gate.
{
  // 1 · a TRUSTED writer (service_role) reinstating revoked -> active MUST clear the
  //     stamp. Leaving it set produced a grant that read `active` to the UI and to
  //     can_access_artist while grant_permits denied it permanently.
  db.exec(`update public.artist_access set status = 'revoked' where organization_id = '${ORG}'`)
  const stampedBefore = db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${ORG}' limit 1`)
  check('a revoked grant is stamped (positive control)', stampedBefore === 't')
  const svc = db.try(`update public.artist_access set status = 'active' where organization_id = '${ORG}'`, { role: 'service_role' })
  check('service_role may reinstate (it is a trusted writer)', svc.ok, svc.out.split('\n')[0]?.slice(0, 110))
  check('...and the stamp is CLEARED, so the grant is live again, not silently dead',
    db.scalar(`select revoked_at is null from public.artist_access where organization_id = '${ORG}' limit 1`) === 't',
    'trusted reinstate left revoked_at set — grant_permits will deny this grant forever')

  // 2 · an UNTRUSTED writer must not be able to reinstate at all.
  db.exec(`update public.artist_access set status = 'revoked' where organization_id = '${ORG}'`)
  const untrusted = db.try(`update public.artist_access set status = 'active' where organization_id = '${ORG}'`,
    { role: 'authenticated', uid: GRANTEE })
  check('the grantee still cannot reinstate itself', !untrusted.ok, untrusted.out.split('\n')[0]?.slice(0, 110))
  check('...and the stamp survives that attempt',
    db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${ORG}' limit 1`) === 't')
}

console.log('\n[19b] service_role is a trusted writer for the whole authority surface')
// H-3 is load-bearing — without it the backend cannot seed an active grant — and it
// had ZERO coverage: two mutations removing it were both missed.
{
  const SUBJ = db.scalar(`select artist_id from public.artist_access limit 1`)
  const FRESH = db.scalar(`select o.id from public.organization o where o.workspace_type = 'management'
     and not exists (select 1 from public.artist_access a where a.organization_id = o.id) order by o.id limit 1`)
  if (FRESH) {
    const ins = db.try(`insert into public.artist_access (organization_id, artist_id, access_level, status, scope)
      values ('${FRESH}', '${SUBJ}', 'manage', 'active', '{view}')`, { role: 'service_role' })
    check('service_role may INSERT an active grant (the seed path)', ins.ok, ins.out.split('\n')[0]?.slice(0, 110))
    const del = db.try(`delete from public.artist_access where organization_id = '${FRESH}'`, { role: 'service_role' })
    check('service_role may DELETE a grant', del.ok, del.out.split('\n')[0]?.slice(0, 110))
  } else {
    check('a grantless management org exists for the service_role checks (positive control)', false, 'none')
  }
  // ...and an untrusted role still cannot do either.
  const badIns = db.try(`insert into public.artist_access (organization_id, artist_id, access_level, status, scope)
    values ('${ORG}', '${SUBJ}', 'manage', 'active', '{view,publish}')`, { role: 'authenticated', uid: GRANTEE })
  check('an untrusted role may NOT insert an active, publish-scoped grant', !badIns.ok,
    badIns.out.split('\n')[0]?.slice(0, 110))
}

console.log('\n[19c] the LIVE authority columns are guarded, not only the dormant ones (QA H-C)')
// scope and consent_at are what can_access_artist()/artist_access_has_scope() gate on
// today; actions/audience gate only the dormant PART B.
{
  db.exec(`update public.artist_access set status = 'active', revoked_at = null, scope = '{view}' where organization_id = '${ORG}'`)
  const esc = db.try(`update public.artist_access set scope = '{view,upload,edit,share,publish}' where organization_id = '${ORG}'`,
    { role: 'authenticated', uid: GRANTEE })
  check('a grantee cannot widen its own scope to publish', !esc.ok, esc.out.split('\n')[0]?.slice(0, 110))
  const forge = db.try(`update public.artist_access set consent_at = now() where organization_id = '${ORG}'`,
    { role: 'authenticated', uid: GRANTEE })
  check('a grantee cannot forge the artist\'s recorded consent', !forge.ok, forge.out.split('\n')[0]?.slice(0, 110))

  // M14 — the expires_at bound had NO covering assertion: deleting that term from the
  // guard left both gates green while a grantee-org owner pushed its own expiry out
  // ten years, verbatim the defect the guard exists to stop. Prove the WRITE is
  // refused and the stored value did not move, not merely that a later read denies.
  db.exec(`update public.artist_access set expires_at = now() + interval '30 days' where organization_id = '${ORG}'`)
  const beforeExp = db.scalar(`select expires_at::text from public.artist_access where organization_id = '${ORG}' limit 1`)
  const ext = db.try(`update public.artist_access set expires_at = now() + interval '10 years' where organization_id = '${ORG}'`,
    { role: 'authenticated', uid: GRANTEE })
  check('a grantee cannot self-extend its own expiry', !ext.ok, ext.out.split('\n')[0]?.slice(0, 110))
  check('...and the stored expiry did not move',
    db.scalar(`select expires_at::text from public.artist_access where organization_id = '${ORG}' limit 1`) === beforeExp,
    `before=${beforeExp}`)

  // M22 — the DELETE deny branch had NO covering assertion: replacing its raise with
  // `null;` left both gates green, so a grantee could delete its own grant and
  // destroy the revocation trail.
  const rowsBefore = db.scalar(`select count(*) from public.artist_access where organization_id = '${ORG}'`)
  const del = db.try(`delete from public.artist_access where organization_id = '${ORG}'`,
    { role: 'authenticated', uid: GRANTEE })
  check('a grantee cannot DELETE its grant and destroy the trail', !del.ok, del.out.split('\n')[0]?.slice(0, 110))
  check('...and the row survives the attempt',
    db.scalar(`select count(*) from public.artist_access where organization_id = '${ORG}'`) === rowsBefore, `before=${rowsBefore}`)
  db.exec(`update public.artist_access set expires_at = null where organization_id = '${ORG}'`)
}

console.log('\n[20] bounds that were declared but unenforced (QA H-5/H-6/C-4 + missed mutations)')
db.exec(`update public.artist_access
            set status = 'active', expires_at = null, revoked_at = null,
                actions = '{publish}', audience = '{booker}', purpose = null,
                version_binding = null, passport_version_id = null
          where organization_id = '${ORG}'`)
check('baseline: this grant publishes to booker (positive control)', permits(ORG, ACT_A, 'publish', 'booker'))
// audience must be MANDATORY — a NULL used to short-circuit to true
check('a NULL audience is DENIED, not waved through', !permits(ORG, ACT_A, 'publish', null))
check('a different audience is denied', !permits(ORG, ACT_A, 'publish', 'producer'))
// the grant and passport_versions must share one vocabulary
check('artist_access accepts the passport_versions audience vocabulary',
  db.try(`update public.artist_access set audience = '{booker,producer,private,programmer,brand,rep}' where organization_id = '${ORG}'`).ok)
db.exec(`update public.artist_access set audience = '{booker}' where organization_id = '${ORG}'`)
// purpose
db.exec(`update public.artist_access set purpose = 'booking' where organization_id = '${ORG}'`)
check('a purpose-bound grant permits its own purpose', permits(ORG, ACT_A, 'publish', 'booker', { purpose: 'booking' }))
check('a purpose-bound grant denies another purpose', !permits(ORG, ACT_A, 'publish', 'booker', { purpose: 'review' }))
check('a purpose-bound grant denies a publication carrying NO purpose',
  !permits(ORG, ACT_A, 'publish', 'booker', { purpose: null }))
db.exec(`update public.artist_access set purpose = null where organization_id = '${ORG}'`)
// version binding
const PV = db.scalar(`select id from public.passport_versions limit 1`)
if (PV) {
  db.exec(`update public.artist_access set version_binding = 'named', passport_version_id = '${PV}' where organization_id = '${ORG}'`)
  check('a named version binding permits its own version', permits(ORG, ACT_A, 'publish', 'booker', { version: PV }))
  check('a named version binding denies any other version',
    !permits(ORG, ACT_A, 'publish', 'booker', { version: '00000000-0000-0000-0000-0000000000ff' }))
  check('a named version binding denies a publication with no version',
    !permits(ORG, ACT_A, 'publish', 'booker', { version: null }))
  db.exec(`update public.artist_access set version_binding = null, passport_version_id = null where organization_id = '${ORG}'`)
} else {
  check('a passport_version exists to bind against (positive control)', false, 'none in fixture')
}
// status vocabulary beyond active/revoked
// A row that says 'active' while still carrying a revocation stamp is
// contradictory, and the decision function must not honour it. Written as the
// owner, since a grantee cannot reach this state through the guard.
db.exec(`update public.artist_access set status = 'active', revoked_at = now() - interval '1 day'
          where organization_id = '${ORG}'`)
check('an active row still carrying revoked_at is DENIED', !permits(ORG, ACT_A, 'publish', 'booker'))
db.exec(`update public.artist_access set revoked_at = null where organization_id = '${ORG}'`)

for (const st of ['pending', 'disputed']) {
  db.exec(`update public.artist_access set status = '${st}' where organization_id = '${ORG}'`)
  check(`status='${st}' denies publish`, !permits(ORG, ACT_A, 'publish', 'booker'))
}
db.exec(`update public.artist_access set status = 'active' where organization_id = '${ORG}'`)
// expiry boundary: expires_at exactly == the instant asked about must DENY
const boundary = db.scalar(`select (now() + interval '1 hour')::text`)
db.exec(`update public.artist_access set expires_at = '${boundary}'::timestamptz where organization_id = '${ORG}'`)
check('expires_at exactly equal to the query instant DENIES (half-open interval)',
  !permits(ORG, ACT_A, 'publish', 'booker', { at: boundary }))
const justBefore = db.scalar(`select ('${boundary}'::timestamptz - interval '1 second')::text`)
check('...and one second earlier permits (positive control for the boundary)',
  permits(ORG, ACT_A, 'publish', 'booker', { at: justBefore }))
db.exec(`update public.artist_access set expires_at = null where organization_id = '${ORG}'`)
// per-(org,act) uniqueness must really be UNIQUE
const dupAct = db.try(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status)
  values ('${ORG}', (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1), '${ACT_A}', 'manage', 'pending')`)
check('a SECOND grant for the same (organization, Act) is refused', !dupAct.ok,
  dupAct.out.split('\n')[0]?.slice(0, 100))

console.log('\n[21] the rollback restores a WORKING access-request flow (QA C-4)')
// The down migration drops act_id, and 043 had rewritten request_artist_access to
// reference it — so rollback left the whole flow raising "column act_id does not
// exist". Asserted by calling the function AFTER the rollback, not by reading it.


console.log('\n[22] the legitimate revoke -> re-invite -> approve cycle leaves a WORKING grant (QA H-1)')
// revoked_at is a LIVENESS predicate: grant_permits requires it to be null. The
// reinstate branch only watches revoked -> active, and a re-invite interposes
// 'pending', so unless the re-invite itself clears the stamp the re-approved grant
// is denied FOREVER while every surface reports it active.
//
// The grant under test must be LEGACY (act_id null): that is the row the re-invite
// updates. An Act-scoped row is untouched by a legacy re-invite, so the final
// approve would be a revoked -> active transition, the owner-path reinstate would
// clear the stamp, and this test would pass for the wrong reason — it did, until
// mutation M-H1 exposed it. A legacy grant may never publish, so the cycle is
// asserted on a non-publish action.
{
  const CY_ORG = db.scalar(`select o.id from public.organization o where o.workspace_type = 'management'
     and not exists (select 1 from public.artist_access a where a.organization_id = o.id) order by o.id limit 1`)
  const CY_ADMIN = db.scalar(`select person_id from public.organization_membership
     where organization_id = '${CY_ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
  const CY_ART = db.scalar(`select id from public.artists limit 1`)
  if (CY_ORG && CY_ADMIN) {
    db.exec(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, scope, actions, audience)
             values ('${CY_ORG}', '${CY_ART}', null, 'manage', 'active', '{view}', '{request}', '{booker}')`)
    check('cycle baseline: the legacy grant permits its action', permits(CY_ORG, ACT_A, 'request', 'booker'))

    db.exec(`update public.artist_access set status = 'revoked' where organization_id = '${CY_ORG}'`)
    check('after revoke: denied', !permits(CY_ORG, ACT_A, 'request', 'booker'))
    check('...and the revocation is stamped',
      db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${CY_ORG}' limit 1`) === 't')

    const reinvite = db.try(`select public.request_artist_access('${CY_ORG}'::uuid, '${CY_ART}'::uuid, array['view']::text[], null)`,
      { role: 'authenticated', uid: CY_ADMIN })
    check('re-invite succeeds', reinvite.ok, reinvite.out.split('\n')[0]?.slice(0, 100))
    check('re-invite leaves the row pending', db.scalar(`select status from public.artist_access where organization_id = '${CY_ORG}' limit 1`) === 'pending')

    // pending -> active: NOT the revoked -> active transition, so the reinstate
    // branch does not fire. Only the re-invite clearing the stamp can save this.
    db.exec(`update public.artist_access set status = 'active', actions = '{request}', audience = '{booker}'
              where organization_id = '${CY_ORG}'`)
    check('after re-approve the grant WORKS again (not permanently dead)',
      permits(CY_ORG, ACT_A, 'request', 'booker'),
      `revoked_at=${db.scalar(`select coalesce(revoked_at::text,'null') from public.artist_access where organization_id = '${CY_ORG}' limit 1`)}`)
    db.exec(`delete from public.artist_access where organization_id = '${CY_ORG}'`)
  } else {
    check('a grantless management org + admin exist for the cycle (positive control)', false,
      `org=${CY_ORG} admin=${CY_ADMIN}`)
  }
}


console.log('\n[22b] the EXPIRED grant cycle must also come back to life (QA H-B)')
// revoked_at was cleared on re-invite but expires_at was not — the same permanent
// death, one liveness column over, and invisible because [22] only revokes.
{
  const E_ORG = db.scalar(`select o.id from public.organization o where o.workspace_type = 'management'
     and not exists (select 1 from public.artist_access a where a.organization_id = o.id) order by o.id limit 1`)
  const E_ADMIN = db.scalar(`select person_id from public.organization_membership
     where organization_id = '${E_ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
  const E_ART = db.scalar(`select id from public.artists limit 1`)
  if (E_ORG && E_ADMIN) {
    db.exec(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, scope, actions, audience, expires_at)
             values ('${E_ORG}', '${E_ART}', null, 'manage', 'active', '{view}', '{request}', '{booker}', now() - interval '1 day')`)
    check('expired baseline: denied', !permits(E_ORG, ACT_A, 'request', 'booker'))
    const rv = db.try(`select public.request_artist_access('${E_ORG}'::uuid, '${E_ART}'::uuid, array['view']::text[], null)`,
      { role: 'authenticated', uid: E_ADMIN })
    check('re-invite over an EXPIRED grant succeeds', rv.ok, rv.out.split('\n')[0]?.slice(0, 100))
    db.exec(`update public.artist_access set status = 'active', actions = '{request}', audience = '{booker}'
              where organization_id = '${E_ORG}'`)
    check('after re-approve the previously-EXPIRED grant works again',
      permits(E_ORG, ACT_A, 'request', 'booker'),
      `expires_at=${db.scalar(`select coalesce(expires_at::text,'null') from public.artist_access where organization_id = '${E_ORG}' limit 1`)}`)
    db.exec(`delete from public.artist_access where organization_id = '${E_ORG}'`)
  } else {
    check('a grantless org + admin exist for the expiry cycle (positive control)', false, `org=${E_ORG}`)
  }
}

console.log('\n[22c] a re-invite must NOT silently downgrade LIVE consented access (QA M-H)')
{
  const A_ORG = db.scalar(`select o.id from public.organization o where o.workspace_type = 'management'
     and not exists (select 1 from public.artist_access a where a.organization_id = o.id) order by o.id limit 1`)
  const A_ADMIN = db.scalar(`select person_id from public.organization_membership
     where organization_id = '${A_ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
  const A_ART = db.scalar(`select id from public.artists limit 1`)
  if (A_ORG && A_ADMIN) {
    db.exec(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, scope, consent_at)
             values ('${A_ORG}', '${A_ART}', null, 'manage', 'active', '{view,edit}', now())`)
    const r = db.try(`select public.request_artist_access('${A_ORG}'::uuid, '${A_ART}'::uuid, array['view']::text[], null)`,
      { role: 'authenticated', uid: A_ADMIN })
    check('re-invite over a LIVE grant is accepted (no error surfaced to the caller)', r.ok,
      r.out.split('\n')[0]?.slice(0, 100))
    const row = db.rows(`select status||'|'||coalesce(consent_at::text,'null')||'|'||scope::text
                           from public.artist_access where organization_id = '${A_ORG}'`)[0]?.[0]
    check('...but the ACTIVE grant is not downgraded to pending', Boolean(row) && row.startsWith('active|'), `row=${row}`)
    check('...and the artist consent record is preserved', Boolean(row) && !row.includes('|null|'), `row=${row}`)
    db.exec(`delete from public.artist_access where organization_id = '${A_ORG}'`)
  } else {
    check('a grantless org + admin exist for the live-reset check (positive control)', false, `org=${A_ORG}`)
  }
}

console.log('\n[23] a legacy re-invite must not touch Act-scoped grants (QA H-2)')
{
  const L_ORG = db.scalar(`select o.id from public.organization o where o.workspace_type = 'management'
     and not exists (select 1 from public.artist_access a where a.organization_id = o.id) order by o.id limit 1`)
  const L_ADMIN = db.scalar(`select person_id from public.organization_membership
     where organization_id = '${L_ORG}' and org_role in ('owner','admin') and status = 'active' limit 1`)
  const L_ART = db.scalar(`select id from public.artists limit 1`)
  if (L_ORG && L_ADMIN) {
    db.exec(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, scope, consent_at, actions, audience)
             values ('${L_ORG}', '${L_ART}', '${ACT_A}', 'manage', 'active', '{view,edit}', now(), '{publish}', '{booker}')`)
    const r = db.try(`select public.request_artist_access('${L_ORG}'::uuid, '${L_ART}'::uuid, array['view']::text[], null)`,
      { role: 'authenticated', uid: L_ADMIN })
    check('a legacy request succeeds', r.ok, r.out.split('\n')[0]?.slice(0, 100))
    const act = db.rows(`select status||'|'||coalesce(consent_at::text,'null')||'|'||scope::text
                           from public.artist_access where organization_id = '${L_ORG}' and act_id = '${ACT_A}'`)[0]?.[0]
    check('the Act-scoped grant is UNTOUCHED — status, consent and scope intact',
      Boolean(act) && act.startsWith('active|') && !act.includes('|null|'), `act row = ${act}`)
    const legacyRow = db.scalar(`select count(*) from public.artist_access where organization_id = '${L_ORG}' and act_id is null`)
    check('...and the legacy row the caller actually asked for WAS created', legacyRow === '1', `rows=${legacyRow}`)
    db.exec(`delete from public.artist_access where organization_id = '${L_ORG}'`)
  } else {
    check('a grantless management org + admin exist (positive control)', false, `org=${L_ORG} admin=${L_ADMIN}`)
  }
}

console.log('\n[18] the migration stays atomic under the applier')
{
  const mig = ['043_artist_access_columns', '044_artist_access_act_key', '045_artist_access_revocation',
               '046_artist_access_guard', '047_grant_decision']
    .map((f) => readFileSync(`supabase/migrations/${f}.sql`, 'utf8')).join('\n')
  const framed = (mig.match(/^\s*(begin|commit);\s*$/gim) || []).length
  check('none of the five migrations carries explicit begin/commit (psql --single-transaction wraps it)', framed === 0,
    `${framed} framing statement(s) found — an explicit COMMIT ends the applier transaction early and PART A can commit while PART B fails`)
}



console.log('\n[25] the SUBJECT of a grant, and who may reinstate it (QA D1 / D2)')
{
  const ART_ADMIN = db.scalar(`select m.person_id from public.organization_membership m
     join public.artists ar on ar.owner_organization_id = m.organization_id
    where ar.id = (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1)
      and m.org_role in ('owner','admin') and m.status = 'active' limit 1`)
  const asArtistOrg = (sql) => db.try(sql, { role: 'authenticated', uid: ART_ADMIN })
  check('the artist-org owner/admin exists (positive control)', Boolean(ART_ADMIN), `got "${ART_ADMIN}"`)

  // D1 · the grantee must not be able to walk the grant onto another artist.
  db.exec(`update public.artist_access set act_id = null, status = 'active', revoked_at = null,
              actions = '{request}', audience = '{booker}', scope = '{view}'
            where organization_id = '${ORG}'`)
  // A VICTIM artist in a DIFFERENT org, created as the owner: the fixture ships one
  // artists row, so without this the re-point test has nothing to aim at and the
  // assertion would be vacuous.
  db.exec(`insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e1','victim@fixture.test') on conflict (id) do nothing;
           insert into public.person (id, email, display_name) values ('00000000-0000-0000-0000-0000000000e1','victim@fixture.test','Victim Person') on conflict (id) do nothing;
           insert into public.organization (id, name, slug, plan, created_by, workspace_type)
             values ('00000000-0000-0000-0000-0000000000e2','Victim Org','victim-org','solo','00000000-0000-0000-0000-0000000000e1','artist') on conflict (id) do nothing;
           insert into public.artists (id, created_by, owner_organization_id, organization_id, name, stage_name)
             values ('00000000-0000-0000-0000-0000000000e3','00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e2','Victim','Victim Act') on conflict (id) do nothing`)
  const victim = db.scalar(`select id from public.artists where id <> (
     select artist_id from public.artist_access where organization_id = '${ORG}' limit 1) limit 1`)
  if (victim) {
    const subjBefore = db.scalar(`select artist_id from public.artist_access where organization_id = '${ORG}' limit 1`)
    const walk = db.try(`update public.artist_access set artist_id = '${victim}' where organization_id = '${ORG}'`,
      { role: 'authenticated', uid: GRANTEE })
    check('a grantee cannot re-point its grant at a different artist', !walk.ok, walk.out.split('\n')[0]?.slice(0, 110))
    check('...and the subject did not move',
      db.scalar(`select artist_id from public.artist_access where organization_id = '${ORG}' limit 1`) === subjBefore)
  } else {
    check('a second artist exists to re-point at (positive control)', false, 'only one artist in fixture')
  }

  // D2 · the artist-org owner MAY reinstate, and the stamp must clear so the grant
  // is actually live again rather than reading active while denied forever.
  db.exec(`update public.artist_access set status = 'revoked' where organization_id = '${ORG}'`)
  check('a revoked grant is stamped (positive control)',
    db.scalar(`select revoked_at is not null from public.artist_access where organization_id = '${ORG}' limit 1`) === 't')
  const reinstate = asArtistOrg(`update public.artist_access set status = 'active' where organization_id = '${ORG}'`)
  check('the ARTIST-org owner may reinstate a revoked grant', reinstate.ok, reinstate.out.split('\n')[0]?.slice(0, 110))
  check('...and the stamp is cleared, so the grant is genuinely live again',
    db.scalar(`select revoked_at is null from public.artist_access where organization_id = '${ORG}' limit 1`) === 't',
    'artist reinstate left revoked_at set — the row reads active everywhere while grant_permits denies it forever')
  check('...and grant_permits agrees the grant is live', permits(ORG, ACT_A, 'request', 'booker'))

  // D6 · an authenticated principal must be able to write the table at all. Revoking
  // EXECUTE on the trust helper kills every authenticated write via the fill trigger,
  // and nothing noticed — src/lib/orgs.js is the only expires_at writer.
  const legit = asArtistOrg(`update public.artist_access set expires_at = now() + interval '90 days' where organization_id = '${ORG}'`)
  check('an authenticated artist-org owner CAN still write expires_at (D6 liveness)', legit.ok,
    legit.out.split('\n')[0]?.slice(0, 110))
  db.exec(`update public.artist_access set expires_at = null where organization_id = '${ORG}'`)

  // D4 · the effective bound on the LIVE columns is any active member via the consent
  // RPC. Asserted so the limit is measured rather than assumed away by a comment.
  // A PLAIN MEMBER of the artist's org, created as the owner for the same reason.
  const ARTIST_ORG = db.scalar(`select ar.owner_organization_id from public.artists ar
     where ar.id = (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1)`)
  db.exec(`insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e4','member@fixture.test') on conflict (id) do nothing;
           insert into public.person (id, email, display_name) values ('00000000-0000-0000-0000-0000000000e4','member@fixture.test','Plain Member') on conflict (id) do nothing;
           insert into public.organization_membership (organization_id, person_id, org_role, status)
             values ('${ARTIST_ORG}','00000000-0000-0000-0000-0000000000e4','member','active') on conflict do nothing`)
  const MEMBER = db.scalar(`select m.person_id from public.organization_membership m
     join public.artists ar on ar.owner_organization_id = m.organization_id
    where ar.id = (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1)
      and m.org_role = 'member' and m.status = 'active' limit 1`)
  if (MEMBER) {
    const direct = db.try(`update public.artist_access set scope = '{view,publish}' where organization_id = '${ORG}'`,
      { role: 'authenticated', uid: MEMBER })
    check('a plain member cannot set authority columns on the DIRECT path', !direct.ok,
      direct.out.split('\n')[0]?.slice(0, 110))
  } else {
    console.log('  ~ no plain member in the fixture — the D4 direct-path bound is UNVERIFIED here')
  }
}

console.log('\n[26] the 046 rollback removes everything it installed (QA D5)')
// The rollback assertion enumerated five function names and act_belongs_to_artist was
// not among them, so an incomplete 046 revert was undetectable.
check('046.down names act_belongs_to_artist',
  /drop function if exists public\.act_belongs_to_artist/.test(
    readFileSync('supabase/migrations/046_artist_access_guard.down.sql', 'utf8')),
  'the 046 rollback leaves act_belongs_to_artist behind')

console.log('\n[24] the split ENFORCES its dependency order, it does not merely document it')
// The split created dependencies between files. Independent QA proved that stating
// them in a header comment is not enforcement: 046 applied without 045 and left the
// table unwritable, and 045.down before 046.down bricked it the same way — both
// reporting success, both surfacing only at the next write.
{
  const downFile = (f) => readFileSync(`supabase/migrations/${f}.down.sql`, 'utf8')

  // H-1 · reverting 045 while 046's guard still calls into it must REFUSE.
  const early045 = db.try(downFile('045_artist_access_revocation'))
  check('045.down REFUSES while 046 is still installed', !early045.ok && /cannot roll back 045/.test(early045.out),
    early045.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 120))
  check('...and the refusal destroyed nothing — the trust helper is still callable',
    db.scalar(`select public.artist_access_trusted_writer()`) !== '')

  // 043.down must refuse while ANY dependent survives, including because dropping
  // act_id cascade-drops both of 044's replacement indexes — silently removing every
  // (organization, artist) uniqueness the table has.
  const early043 = db.try(downFile('043_artist_access_columns'))
  check('043.down REFUSES while later migrations still depend on its columns',
    !early043.ok && /cannot roll back 043/.test(early043.out),
    early043.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 140))
  check('...and act_id survives, so the replacement indexes were not cascade-dropped',
    db.scalar(`select count(*) from information_schema.columns where table_name='artist_access' and column_name='act_id'`) === '1')
  check('...and both replacement indexes are intact',
    db.scalar(`select count(*) from pg_indexes where indexname in ('idx_artist_access_org_act','idx_artist_access_org_artist_legacy')`) === '2')

  // H-2 · 046's own dependency assertion must fire when 045's helper is absent.
  // Simulated by removing the helper rather than building a partial stack, because
  // the harness always applies every migration.
  db.exec(`drop trigger if exists trg_artist_access_guard_authority on public.artist_access;
           drop function if exists public.artist_access_guard_authority();
           drop function if exists public.artist_access_trusted_writer()`)
  const assertion = readFileSync('supabase/migrations/046_artist_access_guard.sql', 'utf8')
    .split('-- ACT-OWNERSHIP LOOKUP')[0]
  const dep = db.try(assertion)
  check('046 REFUSES to install when 045 has not run', !dep.ok && /requires 045/.test(dep.out),
    dep.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 120))

  // RESTORE. The simulation above removed 045's helper and 046's guard; leaving the
  // database in that state would poison every later section with a failure that has
  // nothing to do with what those sections assert.
  db.exec(readFileSync('supabase/migrations/045_artist_access_revocation.sql', 'utf8'))
  db.exec(readFileSync('supabase/migrations/046_artist_access_guard.sql', 'utf8'))
  check('the simulation restored 045 + 046 cleanly',
    db.scalar(`select count(*) from pg_trigger where tgname in
      ('trg_artist_access_fill_revoked_at','trg_artist_access_guard_authority')`) === '2')
}

console.log('\n[12] ROLLBACK — the down migration actually reverses this on a real database')
// Rollback claimed in prose is not rollback. The down file is EXECUTED here, on a
// database that has 043 applied, and the reversal is then observed column by column.
// The rollback is now FIVE files and must run newest-first: each part references
// the one below it, so reverting out of order leaves a policy or function pointing
// at something that no longer exists.
const down = ['047_grant_decision', '046_artist_access_guard', '045_artist_access_revocation',
              '044_artist_access_act_key', '043_artist_access_columns']
  .map((f) => readFileSync(`supabase/migrations/${f}.down.sql`, 'utf8')).join('\n')

// Rollback is NOT unconditionally possible, and the down file must say so rather
// than fail obscurely: once two Act-scoped grants exist for one artist, the 008
// unique key cannot be restored. Prove the refusal first, then clear the condition
// and prove the rollback itself.
db.exec(`insert into public.artist_access (organization_id, artist_id, act_id, access_level, status, actions, audience)
  values ('${ORG}', (select artist_id from public.artist_access where organization_id = '${ORG}' limit 1),
          '${ACT_B}', 'manage', 'active', '{request}', '{booker}')
  on conflict do nothing`)
// M27 — section [16] applied AND reverted PART B before this point, so the down
// file's restore block was never load-bearing and deleting it went unnoticed. Apply
// PART B here and leave it applied: the rollback must genuinely restore the policy.
db.exec(`select public.apply_act_scoped_publish()`)
check('PART B is applied going into the rollback (so the restore block is load-bearing)',
  /grant_permits/.test(db.scalar(`select pg_get_expr(polwithcheck, polrelid) from pg_policy p
    join pg_class c on c.oid = p.polrelid where c.relname='passport_versions' and p.polname='pv_owner_insert'`)))

const blocked = db.try(down)
check('rollback REFUSES while Act-scoped grants make the 008 key unrestorable',
  !blocked.ok && /cannot roll back/.test(blocked.out), blocked.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 120))
const survived = db.scalar(`select count(*) from public.artist_access where act_id = '${ACT_B}'`)
check('...and the refused rollback destroyed no grant rows', survived !== '0', `rows=${survived}`)
// A row count is NOT what "destroyed nothing" means. The refusal used to come from
// 044.down, by which point 046.down and 045.down had already committed — so the
// operator was told nothing was destroyed while the GUARD had been removed, leaving
// the database strictly less safe than before the attempt. Independent QA then
// self-issued publish scope and a ten-year expiry in that state. The refusal now
// fires from the first file that removes a security control, and this asserts the
// control is still standing afterwards.
check('...and the AUTHORITY GUARD is still installed after the refusal',
  db.scalar(`select count(*) from pg_trigger where tgname = 'trg_artist_access_guard_authority'`) === '1',
  'a refused rollback removed the guard — the operator is left less safe than before trying')
check('...and the fill trigger is still installed after the refusal',
  db.scalar(`select count(*) from pg_trigger where tgname = 'trg_artist_access_fill_revoked_at'`) === '1')
check('...and the authority columns are still present after the refusal',
  db.scalar(`select count(*) from information_schema.columns where table_name='artist_access'
             and column_name in ('act_id','actions','audience','scope')`) === '4')
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
check('the five down files run without error', downRes.ok, downRes.out.split('\n').slice(0, 2).join(' | ').slice(0, 160))
if (downRes.ok) {
  const cols = db.scalar(`select count(*) from information_schema.columns
    where table_name = 'artist_access'
      and column_name in ('act_id','actions','audience','purpose','valid_from','version_binding','passport_version_id','granted_by','revoked_at','revoked_by')`)
  check('all 10 added columns are gone', cols === '0', `still present: ${cols}`)
  const fns = db.scalar(`select count(*) from pg_proc where proname in
    ('grant_permits','apply_act_scoped_publish','revert_act_scoped_publish',
     'artist_access_fill_revoked_at','artist_access_guard_authority',
     'artist_access_trusted_writer','act_belongs_to_artist')`)
  check('all 7 added functions are gone', fns === '0', `still present: ${fns}`)
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
  // C-4: the flow must still WORK after rollback. 043 rewrote this function to
  // reference act_id; the down file must restore the 027 body before dropping it.
  // MUST be an org that HOLDS a grant. On a grantless org the RPC takes its INSERT
  // branch, which never references act_id — so the assertion passed even with the
  // down file's restore block deleted. The UPDATE/ON CONFLICT branch is the one
  // that breaks after rollback, and only an org with an existing row reaches it.
  const postOrg = db.scalar(`select organization_id from public.artist_access
     where organization_id in (select id from public.organization where workspace_type = 'management')
     order by organization_id limit 1`)
  const postAdmin = db.scalar(`select person_id from public.organization_membership
     where organization_id = '${postOrg}' and org_role in ('owner','admin') and status = 'active' limit 1`)
  const postSubj = db.scalar(`select id from public.artists limit 1`)
  const postCall = db.try(`select public.request_artist_access('${postOrg}'::uuid, '${postSubj}'::uuid, array['view']::text[], null)`,
    { role: 'authenticated', uid: postAdmin })
  check('the post-rollback org genuinely holds a grant (positive control)',
    db.scalar(`select count(*) from public.artist_access where organization_id = '${postOrg}'`) !== '0')
  check('request_artist_access still works AFTER the rollback, on its conflict branch', postCall.ok,
    postCall.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 110))
}

console.log('')
if (failures) { console.log(`✗ GRANT SCOPE: ${failures} failure(s).`); process.exit(1) }
console.log('✓ GRANT SCOPE: default-deny proven executed — action, Act, audience, time window, revocation and legacy-publish all denied on the negative side; PART B dormant and ungranted; anon has no oracle; the down migration reverses it on a real database.')
process.exit(0)
