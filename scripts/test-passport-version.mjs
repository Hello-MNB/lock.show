#!/usr/bin/env node
// ============================================================
// PASSPORT VERSION STATE MACHINE — EXECUTED SUITE (migration 041)
//
// WHY THIS EXISTS. `test-link-integrity.mjs` is the gate that guards 041, and it
// says so itself at its line 12: "WHAT IS ASSERTED HERE **STATICALLY** (no
// database, no network, no keys — this container has no DB credentials, and the
// migration is deliberately NOT APPLIED)". That was true when it was written. It
// is not true now: scripts/lib/pgharness.mjs gives every gate a real PostgreSQL
// 16, and the waitlist, grant-scope and sql-privileges suites already execute
// against it.
//
// So 57 of that file's assertions are regexes over the migration's TEXT. They
// witness that somebody wrote a line. They cannot witness a CHECK refusing a
// value, a trigger demoting an incumbent, a unique index refusing a second
// publish, or a cross-Act read. This file witnesses those, and leaves the static
// gate in place — its job is drift-detection on the file, which is a different
// and still useful job.
//
// WHAT IS PROVEN HERE, BY EXECUTION
//   [1] the five states are enforced, not merely written
//   [2] publishing SUPERSEDES the incumbent, atomically, and stamps lineage
//   [3] one published version per (lineage × audience) bucket
//   [4] immutability: snapshot, artist_id, act_id, version_no, created_at
//   [5] a superseded version can never be revived
//   [6] MULTI-ACT: a second Act is a separate bucket — publishing for one Act
//       does not touch the other. CLAUDE.md: evidence is per-Act, NON-transferable
//   [7] retry / idempotency: republishing the same row is not a self-supersede
//   [8] private → public leakage: anon cannot read a draft, a superseded row, or
//       any row of another Act
//
// A SKIP IS NOT A PASS — with no local PostgreSQL this exits 1.
// ============================================================
import { ScratchDb, pgAvailable } from './lib/pgharness.mjs'

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

if (!pgAvailable()) {
  console.error('\n✖ PASSPORT VERSION: no local PostgreSQL. This suite is executed-only, so a skip is NOT a pass.')
  process.exit(1)
}

const db = ScratchDb.create('b4_pv')
let reachedEnd = false
process.on('exit', (code) => {
  db.drop()
  if (!reachedEnd) console.error(`\n✖ ABORTED (exit ${code}) — assertions after the abort point never ran.`)
})

// ── fixtures ────────────────────────────────────────────────────────────────
// Two Acts held by ONE person, which is the multi-Act case CLAUDE.md makes canon
// and the case a single-Act fixture can never exercise.
const P = '11111111-1111-1111-1111-111111111111'
const A1 = '22222222-2222-2222-2222-222222222222'
const A2 = '33333333-3333-3333-3333-333333333333'
db.exec(`
  insert into auth.users (id, email) values ('${P}', 'pv@fixture.test') on conflict do nothing;
  -- The Act spine's act_from_artist() trigger (020) inserts into public.act, whose
  -- person_id FKs public.person. Discovered by RUNNING this fixture, not by reading
  -- the schema: the first version inserted only auth.users and the trigger aborted.
  insert into public.person (id, email, display_name)
       values ('${P}', 'pv@fixture.test', 'PV Fixture') on conflict do nothing;
  insert into public.artists (id, created_by, stage_name, published)
       values ('${A1}', '${P}', 'Act One', true), ('${A2}', '${P}', 'Act Two', true)
    on conflict (id) do nothing;
`)
// The Act spine (020) may or may not carry rows for these; both paths are covered
// because every bucket key is coalesce(act_id, artist_id).
const acts = db.scalar(`select count(*) from public.act where id in ('${A1}','${A2}')`)
check('[0] fixture: two Acts exist for one person, so multi-Act is exercisable',
  db.scalar(`select count(*) from public.artists where created_by = '${P}'`) === '2', `act rows=${acts}`)

const pub = (artist, snapshot = '{"v":1}', audience = null, state = 'published') => db.try(
  `insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
   values ('${artist}', '${artist}', '${snapshot}'::jsonb, '${state}', ${audience ? `'${audience}'` : 'null'})
   returning id`)
const idOf = (r) => (r.out.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/) || [])[0]

console.log('\n[1] the five states are ENFORCED, not merely written')
const bad = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state)
                    values ('${A1}', '${A1}', '{}'::jsonb, 'archived')`)
check('a state outside the five is refused by the database', !bad.ok,
  bad.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 100))
// `audience` is ALSO CHECK-constrained, to the six policy keys — which my first
// version of this loop discovered by failing on `probe_draft`. Six real keys, six
// separate buckets, so the states do not supersede one another here.
const KEYS = ['booker', 'producer', 'private', 'programmer', 'brand', 'rep']
for (const [i, st] of ['draft', 'preview', 'review', 'published', 'superseded'].entries()) {
  const r = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                    values ('${A1}', '${A1}', '{}'::jsonb, '${st}', '${KEYS[i]}')`)
  check(`state ${st} is accepted`, r.ok, r.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
}
const badAud = db.try(`insert into public.passport_versions (artist_id, act_id, snapshot, audience)
                       values ('${A1}', '${A1}', '{}'::jsonb, 'not_a_policy_key')`)
check('an audience outside the six policy keys is refused', !badAud.ok,
  badAud.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 100))

console.log('\n[2] publishing SUPERSEDES the incumbent and stamps lineage')
const v1 = idOf(pub(A1, '{"v":1}', 'booker'))
const v2 = idOf(pub(A1, '{"v":2}', 'booker'))
check('the first publish is published', db.scalar(`select state from public.passport_versions where id='${v1}'`) === 'superseded')
check('...because the SECOND publish demoted it, in the same statement',
  db.scalar(`select state from public.passport_versions where id='${v2}'`) === 'published')
check('...and the new row points at what it replaced (supersedes_id)',
  db.scalar(`select supersedes_id from public.passport_versions where id='${v2}'`) === v1)
check('...and the demoted row carries superseded_at',
  db.scalar(`select superseded_at is not null from public.passport_versions where id='${v1}'`) === 't')
check('...while the LIVE row does not — it is not its own history',
  db.scalar(`select superseded_at is null from public.passport_versions where id='${v2}'`) === 't')
check('...and published_at was stamped without the caller supplying it',
  db.scalar(`select published_at is not null from public.passport_versions where id='${v2}'`) === 't')

console.log('\n[3] exactly ONE published version per (lineage × audience)')
check('the invariant holds after two publishes',
  db.scalar(`select count(*) from public.passport_versions
             where state='published' and coalesce(act_id,artist_id)='${A1}' and audience='booker'`) === '1')
// A DIFFERENT audience is a DIFFERENT bucket — recipient-specific is the point.
const vp = idOf(pub(A1, '{"v":1}', 'producer'))
check('a different audience is a separate bucket, not a supersede',
  db.scalar(`select state from public.passport_versions where id='${v2}'`) === 'published' &&
  db.scalar(`select state from public.passport_versions where id='${vp}'`) === 'published',
  `booker=${db.scalar(`select state from public.passport_versions where id='${v2}'`)} producer=${db.scalar(`select state from public.passport_versions where id='${vp}'`)}`)

console.log('\n[4] immutability — the columns 041 names, each proven by a refused UPDATE')
for (const [col, val] of [['snapshot', `'{"tampered":true}'::jsonb`], ['artist_id', `'${A2}'`],
  ['act_id', `'${A2}'`], ['version_no', '999'], ['created_at', `now()`]]) {
  const r = db.try(`update public.passport_versions set ${col} = ${val} where id='${v2}'`)
  check(`${col} cannot be changed after the fact`, !r.ok,
    r.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
}

console.log('\n[5] a superseded version can never be revived')
const revive = db.try(`update public.passport_versions set state='published' where id='${v1}'`)
check('reviving a superseded version is refused', !revive.ok,
  revive.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 110))

console.log('\n[6] MULTI-ACT — a second Act is a separate lineage, never touched')
const w1 = idOf(pub(A2, '{"act2":1}', 'booker'))
check('Act Two can publish while Act One already has a published booker version',
  db.scalar(`select state from public.passport_versions where id='${w1}'`) === 'published')
check("...and Act One's published version is untouched by it",
  db.scalar(`select state from public.passport_versions where id='${v2}'`) === 'published')
const w2 = idOf(pub(A2, '{"act2":2}', 'booker'))
check('publishing again for Act Two supersedes ONLY Act Two',
  db.scalar(`select state from public.passport_versions where id='${w1}'`) === 'superseded' &&
  db.scalar(`select state from public.passport_versions where id='${v2}'`) === 'published',
  `act2-v1=${db.scalar(`select state from public.passport_versions where id='${w1}'`)} act1=${db.scalar(`select state from public.passport_versions where id='${v2}'`)}`)
check('...and each Act holds exactly one published booker version',
  db.scalar(`select count(*) from public.passport_versions where state='published' and audience='booker'`) === '2')

console.log('\n[7] retry / idempotency — republishing the SAME row is not a self-supersede')
const before = db.scalar(`select state||'|'||coalesce(supersedes_id::text,'-') from public.passport_versions where id='${w2}'`)
const again = db.try(`update public.passport_versions set state='published' where id='${w2}'`)
check('re-publishing an already-published row succeeds', again.ok,
  again.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
check('...and does NOT demote itself', db.scalar(`select state from public.passport_versions where id='${w2}'`) === 'published')
check('...and does not rewrite its own lineage',
  db.scalar(`select state||'|'||coalesce(supersedes_id::text,'-') from public.passport_versions where id='${w2}'`) === before)

console.log("\n[8] private → public exposure: the posture, MEASURED, not assumed")
// THIS SECTION FOUND SOMETHING AND THEN FOUND ITSELF WRONG ABOUT IT. Executing it
// the first time showed anon reading a SUPERSEDED snapshot — the exact defect
// test-link-integrity's header says 041 exists to close. The cause is not a
// regression: 041 PART B, which replaces `pv_public_read` with link-bound,
// org-history and operator policies, is DELIBERATELY COMMENTED OUT (041:1046-1080)
// because it is a policy cutover on live data and therefore the owner's action.
//
// So the honest assertion is not "anon is refused" — that is false today, and a
// gate asserting it would have been demanding a state nobody has authorised. It is
// also not "anon may read", which would bless the exposure permanently. It is:
// MEASURE which world we are in and require the two to be consistent. Whichever it
// is, this gate names it, and it fails the day someone half-applies PART B.
const partB = db.scalar(`select count(*) from pg_policies
                         where tablename='passport_versions' and policyname='pv_share_link_read'`) !== '0'
const legacy = db.scalar(`select count(*) from pg_policies
                          where tablename='passport_versions' and policyname='pv_public_read'`) !== '0'
check('[8] the anon read policy is in exactly ONE of its two known states, not a half-applied mix',
  partB !== legacy, `pv_share_link_read=${partB} pv_public_read=${legacy} — a tree carrying both, or neither, is a partial cutover`)
// PART B IS THREE POLICIES, NOT ONE (QA-INDEP-05, L4). `partB !== legacy` rejects
// both-present and both-absent, but not a cutover that creates pv_share_link_read
// and drops pv_public_read while omitting pv_org_history_read / pv_operator_read —
// which passes as "applied" while owners and operators lose governed history.
if (partB) {
  const companions = db.scalar(`select coalesce(string_agg(policyname, ',' order by policyname), '')
                                from pg_policies where tablename='passport_versions'
                                  and policyname in ('pv_org_history_read','pv_operator_read')`)
  check('[8] ...and PART B was applied WHOLE — the org-history and operator reads came with it',
    companions.includes('pv_org_history_read') && companions.includes('pv_operator_read'),
    `found: ${companions || '(neither)'} — a partial cutover leaves owners without their own history`)
}

const anonSees = (id) => db.try(`select snapshot from public.passport_versions where id='${id}'`, { role: 'anon' })
const draft = idOf(pub(A1, '{"secret":"draft"}', 'private', 'draft'))
const dr = anonSees(draft)
const sr = anonSees(v1)
const readsDraft = dr.ok && /secret/.test(dr.out)
const readsSuperseded = sr.ok && /"v"/.test(sr.out)
check('[8] the exposure probes are meaningful — both rows exist and hold their data',
  db.scalar(`select count(*) from public.passport_versions where id in ('${draft}','${v1}')`) === '2')

if (partB) {
  check('[8] PART B applied: anon cannot read a DRAFT version', !readsDraft, dr.out.slice(0, 90))
  check('[8] PART B applied: anon cannot read a SUPERSEDED version', !readsSuperseded, sr.out.slice(0, 90))
} else {
  // 001's pv_public_read is still in force. Record precisely what it exposes, so
  // the cost of leaving PART B dormant is a measured number in every run's output
  // rather than a sentence in a migration comment nobody executes.
  const exposed = db.scalar(`select count(*) from public.passport_versions`, { role: 'anon' })
  check('[8] PART B DORMANT (owner-gated): the legacy 001 policy is what is in force, and it is doing exactly what 041 says it does',
    readsSuperseded, 'a superseded snapshot was NOT readable — if PART B was applied this branch is the wrong one, and the policy check above should have caught it')
  console.log(`        EXPOSURE, MEASURED: with 041 PART B dormant, anon reads ${exposed} passport_version row(s) in this scratch DB, superseded snapshots included.`)
  console.log('        This is the known, owner-gated state (041:1046). Tracked as PV-PARTB in docs/OWNER-PENDING.md — applying it is a live policy cutover, which only Maria may authorise.')
  check('[8] ...and a DRAFT is exposed too, which is the part most easily missed', readsDraft, dr.out.slice(0, 90))
}

console.log('')
reachedEnd = true
if (failures) { console.log(`✖ PASSPORT VERSION: ${failures} failure(s).`); process.exit(1) }
console.log(`✓ PASSPORT VERSION [PART B ${partB ? 'APPLIED' : 'DORMANT'}]: the 041 state machine proven by EXECUTION, not by regex over its own text — five states enforced, publish supersedes the incumbent atomically and stamps lineage, one published version per (lineage × audience), five columns immutable, a superseded version unrevivable, a second Act a genuinely separate bucket, and republishing idempotent. ${partB ? 'PART B APPLIED: anon refused draft and superseded snapshots.' : 'PART B DORMANT: anon CAN read draft and superseded snapshots of a published artist — measured above, and the reason this line does not say "refused".'} NOT proven here: PostgREST behaviour with real JWTs, and that 041 applies to the production data (it is drafted, NOT applied).`)
process.exit(0)
