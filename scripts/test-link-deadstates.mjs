#!/usr/bin/env node
// ============================================================
// SHARE-LINK DEAD STATES — EXECUTED SUITE (migration 041)
//
// WHY THIS EXISTS. The controller's required negative controls include a STALE
// DEEP LINK and RETRY/IDEMPOTENCY. `test-link-integrity` covers the six dead
// states twice — once as a regex over `resolve_share_link`'s SQL text (S8), and
// once against a JavaScript re-implementation of the precedence rule with its own
// fixtures (R5). Both are useful, and neither is the mechanism: a model of a rule
// agrees with itself no matter what the database does. The two can drift in
// exactly the way that matters — the SQL reordered so `revoked` stops shadowing
// `expired`, or a status added to the CHECK vocabulary and not to the function —
// and both checks keep passing.
//
// So this file asks the FUNCTION. Every outcome comes from
// `select public.resolve_share_link(...)` against a real PostgreSQL with 041
// applied, and the precedence order is established by constructing rows that are
// in TWO dead states at once and asserting which one wins.
//
// A SKIP IS NOT A PASS — with no local PostgreSQL this exits 1.
// ============================================================
import { ScratchDb, pgAvailable } from './lib/pgharness.mjs'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

if (!pgAvailable()) {
  console.error('\n✖ LINK DEAD STATES: no local PostgreSQL. Every assertion here is about what the')
  console.error('  FUNCTION returns, so a skip would prove nothing at all. It is NOT a pass.')
  process.exit(1)
}

const db = ScratchDb.create('b4_deadstates')
let reachedEnd = false
process.on('exit', (code) => {
  db.drop()
  if (!reachedEnd) console.error(`\n✖ ABORTED (exit ${code}) — assertions after the abort point never ran.`)
})

db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
const PV = '00000000-0000-0000-0000-00000000ffa1'   // published version in the fixture
const ART = '00000000-0000-0000-0000-0000000000c1'
const hash = (s) => createHash('sha256').update(s).digest('hex')

/** Insert a share_link directly, so a row can be put in states mint_share_link
 *  would refuse to create — which is the point: these rows exist in the wild
 *  because time passes and artists revoke, not because anyone minted them. */
function link(label, { status = 'live', expiry = 'null', revoked_at = 'null', wrong_at = 'null', pv = PV } = {}) {
  const h = hash(label)
  // `tracking_disclosed` must be true: 041 adds share_link_tracking_disclosed_check
  // so no link can exist without the recipient having been told they are counted.
  // Learned by RUNNING this fixture — the first version omitted the column and
  // every insert was refused, which is the constraint doing its job.
  db.exec(`insert into public.share_link
    (passport_version_id, artist_id, act_id, recipient_label, token_hash, audience, status, expiry, expiry_kind, revoked_at, wrong_recipient_at, tracking_disclosed)
    values ('${pv}', '${ART}', '${ART}', '${label}', '${h}', 'booker', '${status}', ${expiry}, '${expiry === 'null' ? 'endless' : 'date'}', ${revoked_at}, ${wrong_at}, true)`)
  return h
}
const outcome = (h) => (db.scalar(`select public.resolve_share_link('${h}')`).match(/"outcome"\s*:\s*"([a-z_]+)"/) || [])[1]

console.log('\n[1] the happy path resolves, so every refusal below is meaningful')
const live = link('live-1')
check('a LIVE link resolves ok', outcome(live) === 'ok', outcome(live))
check('...and it returns the bound version, not just a verdict',
  /"passport_version_id"\s*:\s*"00000000-0000-0000-0000-00000000ffa1"/.test(db.scalar(`select public.resolve_share_link('${live}')`)))

// TWO INVARIANTS THAT GUARD EVERY ROW ABOVE, asserted rather than merely
// satisfied. Both were learned by RUNNING the fixture: the first version omitted
// `tracking_disclosed` and then set an expiry without `expiry_kind`, and the
// database refused both — which is the schema being stricter than I assumed.
const undisclosed = db.try(`insert into public.share_link
  (passport_version_id, artist_id, act_id, recipient_label, token_hash, audience, status, tracking_disclosed)
  values ('${PV}','${ART}','${ART}','sneak','${hash('undisclosed')}','booker','live', false)`)
check('a link cannot be created without disclosing tracking to the recipient', !undisclosed.ok,
  undisclosed.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 100))
// "NULL means ENDLESS — a deliberate choice, not a missing value" (041:587). A row
// carrying a real expiry while still claiming to be endless is a contradiction,
// and it is refused rather than silently treated as one or the other.
const mismatched = db.try(`insert into public.share_link
  (passport_version_id, artist_id, act_id, recipient_label, token_hash, audience, status, expiry, expiry_kind, tracking_disclosed)
  values ('${PV}','${ART}','${ART}','mismatch','${hash('mismatch')}','booker','live', now() + interval '1 day', 'endless', true)`)
check('an expiry that contradicts its expiry_kind is refused — NULL means endless, deliberately', !mismatched.ok,
  mismatched.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 100))

console.log('\n[2] each dead state, asked of the FUNCTION')
check('an unknown token is not_found', outcome(hash('never-minted')) === 'not_found')
check('a malformed (non-64-char) token is not_found', outcome('deadbeef') === 'not_found')
check('a REVOKED link is revoked', outcome(link('rev-1', { status: 'revoked' })) === 'revoked')
check('...and so is one revoked only by timestamp, with status still live',
  outcome(link('rev-2', { revoked_at: 'now()' })) === 'revoked')
check('an EXPIRED link is expired', outcome(link('exp-1', { expiry: `now() - interval '1 hour'` })) === 'expired')
check('...and so is one marked expired without a past expiry', outcome(link('exp-2', { status: 'expired' })) === 'expired')
check('a WRONG-RECIPIENT link is wrong_recipient', outcome(link('wr-1', { wrong_at: 'now()' })) === 'wrong_recipient')
check('a REPLACED link is revoked — a superseded link is dead, not merely stale',
  outcome(link('rep-1', { status: 'replaced' })) === 'revoked')
check('an UNPUBLISHED link is revoked', outcome(link('unp-1', { status: 'unpublished' })) === 'revoked')
check('a WITHDRAWN link is revoked', outcome(link('wd-1', { status: 'withdrawn' })) === 'revoked')

console.log('\n[3] a link pointing at a NON-servable version')
const draftPv = db.scalar(`insert into public.passport_versions (artist_id, act_id, snapshot, state)
                           values ('${ART}','${ART}','{"draft":true}'::jsonb,'draft') returning id`)
check('a link bound to a DRAFT version is refused as superseded_not_permitted',
  outcome(link('draft-1', { pv: draftPv })) === 'superseded_not_permitted')
// A SUPERSEDED version stays servable on purpose: the recipient was given THAT
// version, and 041 binds a recipient to exactly one immutable snapshot.
const supPv = db.scalar(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                         values ('${ART}','${ART}','{"old":true}'::jsonb,'superseded','producer') returning id`)
check('...while a SUPERSEDED version still resolves — the recipient keeps the snapshot they were given',
  outcome(link('sup-1', { pv: supPv })) === 'ok')
// resolve_share_link has a `pv not found → not_found` branch. Trying to REACH it
// showed it is unreachable: share_link_passport_version_id_fkey refuses a link
// pointing at a version that does not exist, and the FK is ON DELETE CASCADE, so
// deleting the version takes the link with it. The branch is defensive, not live.
// That is a better fact than the test I set out to write, so it is what is
// asserted — a dangling link cannot be created in the first place.
const dangling = db.try(`update public.share_link set passport_version_id = '00000000-0000-0000-0000-0000000000ff'
                         where token_hash = '${live}'`)
check('a link cannot be pointed at a version that does not exist (FK), so resolve\'s pv-not-found branch is defensive, not reachable',
  !dangling.ok, dangling.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 100))
// A THROWAWAY version of its own, so deleting it cannot pull a row out from under
// a later assertion — which is exactly what the first version did to the [4]
// precedence check that still needed `draftPv`.
const doomedPv = db.scalar(`insert into public.passport_versions (artist_id, act_id, snapshot, state, audience)
                            values ('${ART}','${ART}','{"doomed":true}'::jsonb,'published','brand') returning id`)
const cascadeLink = link('cascade-1', { pv: doomedPv })
db.exec(`delete from public.passport_versions where id = '${doomedPv}'`)
check('...and deleting the version removes its links with it, rather than orphaning them',
  db.scalar(`select count(*) from public.share_link where token_hash='${cascadeLink}'`) === '0')

console.log('\n[4] PRECEDENCE — rows in TWO dead states at once decide the order')
// This is what neither the regex nor the JS model can establish: which branch the
// FUNCTION reaches first when a row qualifies for several.
check('wrong_recipient beats revoked', outcome(link('p1', { status: 'revoked', wrong_at: 'now()' })) === 'wrong_recipient')
check('wrong_recipient beats expired', outcome(link('p2', { status: 'expired', wrong_at: 'now()' })) === 'wrong_recipient')
check('revoked beats expired', outcome(link('p3', { status: 'revoked', expiry: `now() - interval '1 hour'` })) === 'revoked')
check('revoked beats expired by timestamp too',
  outcome(link('p4', { revoked_at: 'now()', expiry: `now() - interval '1 hour'` })) === 'revoked')
check('a dead LINK beats a non-servable VERSION — the link is checked first',
  outcome(link('p5', { status: 'revoked', pv: draftPv })) === 'revoked')

console.log('\n[5] RETRY / IDEMPOTENCY on the open receipt')
const openKey = 'idem-key-0001'
const r1 = db.scalar(`select public.record_share_link_open('${live}', '${openKey}')`)
const r2 = db.scalar(`select public.record_share_link_open('${live}', '${openKey}')`)
check('the first open is recorded', r1 === 't', `first=${r1}`)
check('...and the SAME idempotency key does not record a second', r2 === 'f', `second=${r2}`)
check('...so exactly one open event exists for that key',
  db.scalar(`select count(*) from public.share_link_event where share_link_id =
             (select id from public.share_link where token_hash='${live}') and event='opened'`) === '1')
const r3 = db.scalar(`select public.record_share_link_open('${live}', 'idem-key-0002')`)
check('...while a DIFFERENT key does record another, so the check is not vacuous', r3 === 't', `third=${r3}`)
check('an open on a REVOKED link is refused',
  db.scalar(`select public.record_share_link_open('${hash('rev-1')}', 'idem-key-0003')`) === 'f')

console.log('\n[6] anon can ask, and learns nothing it should not')
const anonRes = db.try(`select public.resolve_share_link('${hash('rev-1')}')`, { role: 'anon' })
check('anon may EXECUTE resolve_share_link', anonRes.ok, anonRes.out.split('\n').find((l) => /ERROR/.test(l))?.slice(0, 90))
check('...and gets the dead-state reason, not the snapshot', /revoked/.test(anonRes.out) && !/snapshot/.test(anonRes.out),
  anonRes.out.slice(0, 100))
const anonTable = db.try(`select token_hash from public.share_link limit 1`, { role: 'anon' })
check('...and cannot read the share_link table itself, so tokens are not enumerable',
  !anonTable.ok || !/[0-9a-f]{64}/.test(anonTable.out), anonTable.out.slice(0, 90))

console.log('')
reachedEnd = true
if (failures) { console.log(`✖ LINK DEAD STATES: ${failures} failure(s).`); process.exit(1) }
console.log('✓ LINK DEAD STATES: every outcome of resolve_share_link proven by ASKING THE FUNCTION — not_found, revoked (four ways), expired (two ways), wrong_recipient, superseded_not_permitted and ok; precedence established by rows that are in two dead states at once; the open receipt idempotent under a repeated key and refused on a dead link; anon may ask and receives a reason without a snapshot and without an enumerable token. NOT proven here: the HTTP layer that maps these outcomes to status codes, and Supabase PostgREST with real JWTs.')
process.exit(0)
