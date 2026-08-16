// ============================================================
// P0-PRIVACY B1 · LINK INTEGRITY GATE — scripts/test-link-integrity.mjs
//
// THE DEFECT THIS GATE MAKES UNREPEATABLE
//   `pv_public_read` (supabase/migrations/001_initial_schema.sql:209-210) lets
//   ANY anonymous reader SELECT every row of public.passport_versions for any
//   published artist — including superseded historical snapshots — with no
//   link, no recipient, no expiry and no revocation. Migration 041 binds a
//   recipient to exactly ONE immutable version through a token, and this file
//   is what stops that binding from quietly rotting.
//
// ⚠ WHAT IS ASSERTED HERE **STATICALLY** (no database, no network, no keys —
//   this container has no DB credentials, and the migration is deliberately
//   NOT APPLIED):
//     · the TEXT of supabase/migrations/041_*.sql / .down.sql — which columns,
//       constraints, indexes, policies and functions it declares, and that the
//       BREAKING half stays fenced inside a comment so a top-to-bottom apply
//       cannot drop pv_public_read by accident
//     · that the SQL resolver and the JS contract agree on the six typed
//       outcomes AND on their precedence order
//     · the TEXT of server/index.js — that the flag exists, defaults OFF, gates
//       all three routes, and that the route imports the shared rule instead of
//       re-deriving it
//     · the RUNTIME behaviour of the pure functions in src/lib/shareLink.js
//       against fixtures (this half really executes)
//
// ⚠ WHAT STILL NEEDS **LIVE-DB VERIFICATION** AFTER THE OWNER APPLIES 041
//   (nothing below can be proven from files — run these in the SQL editor):
//     L1 as anon (anon key, RLS on): `select count(*) from passport_versions;`
//        must return 0 after PART B. Before PART B it returns every snapshot —
//        that is the bug, and only a live query can witness it.
//     L2 `select public.resolve_share_link(<sha256 of a live token>)` → ok;
//        the same call with a revoked / expired / unknown hash → that reason
//        and NO act data in the payload.
//     L3 the partial unique index idx_pv_one_published actually rejects a
//        second published row for one (act_id, audience).
//     L4 idx_sle_idempotent actually collapses a replayed open receipt (the JS
//        reducer proves the RULE; only Postgres proves the CONSTRAINT).
//     L5 the immutability trigger really refuses an UPDATE of a snapshot.
//     L6 grants: anon can EXECUTE resolve_share_link and cannot SELECT
//        share_link_event.
//
// Run: npm run test:link-integrity   (wired into `npm run verify`)
// Exit 0 = every assertion holds; exit 1 = any failure.
// ============================================================
import { readFileSync } from 'node:fs'
import {
  OUTCOME, OUTCOMES, AUDIENCES, LIVE_STATUSES, READABLE_VERSION_STATES,
  TOKEN_BYTES, TOKEN_PATTERN, isWellFormedToken, isOk, isDead,
  resolveShareLink, fromRpcResult, mintIdempotencyKey, openIdempotencyKey,
  applyOpenReceipt, OPEN_BUCKET_MS, OUTCOME_HTTP_STATUS,
} from '../src/lib/shareLink.js'

let failed = false
const fail = (m) => { console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => console.log(`  · ${m}`)
const assert = (cond, good, bad) => (cond ? ok(good) : fail(bad || good))

const UP = 'supabase/migrations/041_link_service_and_version_store.sql'
const DOWN = 'supabase/migrations/041_link_service_and_version_store.down.sql'
const SERVER = 'server/index.js'
const CONTRACT = 'src/lib/shareLink.js'

const read = (p) => { try { return readFileSync(p, 'utf8') } catch { fail(`${p} missing`); return '' } }
const up = read(UP)
const down = read(DOWN)
const server = read(SERVER)
const contract = read(CONTRACT)

// Executable SQL = the file with every comment line removed. The breaking half
// lives inside comments on purpose, so "what this file DOES when you run it" is
// exactly this projection and nothing else.
const executable = up.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n')

console.log('\nSTATIC — migration 041 (text assertions; the migration is NOT applied)')

// ── S1 · the header the owner has to read ───────────────────────────────────
assert(/PRECONDITIONS/.test(up), 'S1  041 carries a PRECONDITIONS header block')
assert(/THE ONE BREAKING ELEMENT/.test(up),
  'S1  041 names its ONE breaking element plainly')
assert(/WHAT BREAKS IF APPLIED OUT OF ORDER/.test(up),
  'S1  041 states what breaks if applied out of order')
assert(/AUTHORED, NOT APPLIED|DRAFTED NOT APPLIED|NOT APPLIED/.test(up),
  'S1  041 is marked not-applied (the owner applies)')

// ── S2 · THE FENCE. Running 041 top-to-bottom must not touch pv_public_read ──
{
  const live = executable.split('\n').filter((l) => /pv_public_read/.test(l))
  assert(live.length === 0,
    'S2  the breaking half is FENCED — an unattended apply of 041 cannot drop pv_public_read',
    `S2  ⚠ 041 would EXECUTE ${live.length} statement(s) touching pv_public_read: ${live.join(' | ')}`)
  assert(/PART B/.test(up) && /COPY FROM HERE/.test(up),
    'S2  PART B is present as a copy-out block with explicit boundaries')
  assert(/begin;[\s\S]*commit;/i.test(up.split('COPY FROM HERE')[1] || ''),
    'S2  PART B runs as ONE transaction, so a failed CREATE rolls the DROP back')
}

// ── S3 · additive-first: no destructive DDL in the executable half ───────────
{
  const banned = [/drop\s+table/i, /drop\s+column/i, /alter\s+column\s+\w+\s+type/i]
  const hits = banned.filter((re) => re.test(executable))
  assert(hits.length === 0, 'S3  PART A is additive — no DROP TABLE / DROP COLUMN / type change',
    `S3  PART A contains destructive DDL: ${hits.map(String).join(', ')}`)
}

// ── S4 · share_link gains the recipient binding ─────────────────────────────
for (const col of ['token_hash', 'audience', 'purpose', 'revoked_at', 'created_by', 'expiry_kind']) {
  assert(new RegExp(`add column if not exists ${col}\\b`).test(executable),
    `S4  share_link/passport_versions gains ${col}`)
}
assert(/create unique index if not exists idx_share_link_token_hash[\s\S]{0,120}token_hash/.test(executable),
  'S4  token_hash is UNIQUE and indexed (one hash = one link, and the resolver seeks on it)')
assert(/TOKEN_BYTES|randomBytes\(32\)|32\b[\s\S]{0,80}256 bits|256 bits/.test(up),
  'S4  the token GENERATION EXPECTATION (32 CSPRNG bytes / 256 bits) is documented in the migration')
assert(/NULL means ENDLESS|nullable-means-endless|expiry IS NULL\s+⇔|endless/i.test(up),
  'S4  expiry NULL-means-endless is stated explicitly, not left implicit')
assert(/share_link_expiry_kind_check/.test(executable),
  'S4  expiry and expiry_kind can never disagree (CHECK, not convention)')

// ── S5 · passport_versions becomes immutable + identifiable ─────────────────
for (const col of ['version_no', 'state', 'supersedes_id', 'published_at', 'superseded_at']) {
  assert(new RegExp(`add column if not exists ${col}\\b`).test(executable),
    `S5  passport_versions gains ${col}`)
}
assert(/draft'\s*,\s*'preview'\s*,\s*'review'\s*,\s*'published'\s*,\s*'superseded/.test(executable),
  'S5  the five version states are CHECK-constrained (draft·preview·review·published·superseded)')
assert(/create unique index if not exists idx_pv_one_published[\s\S]{0,200}where state = 'published'/.test(executable),
  'S5  at most ONE published version per (act_id, audience) — a partial unique index, not a convention')
assert(/pv_guard_immutable[\s\S]{0,900}snapshot is immutable/.test(executable),
  'S5  a bound version is structurally immutable (snapshot/act/version_no cannot be rewritten)')

// ── S6 · append-only receipts with idempotency ──────────────────────────────
assert(/create table if not exists public\.share_link_event/.test(executable),
  'S6  share_link_event exists (append-only receipts: mint · open · revoke · expire)')
assert(/create unique index if not exists idx_sle_idempotent[\s\S]{0,160}idempotency_key/.test(executable),
  'S6  a replayed receipt collides on a UNIQUE index — idempotency is enforced by the DB')
{
  const evBlock = executable.slice(executable.indexOf('share_link_event'))
  assert(!/create policy \w+ on public\.share_link_event\s+for (update|delete)/i.test(evBlock),
    'S6  no UPDATE and no DELETE policy on share_link_event — append-only by RLS construction')
}
assert(/revoke select on public\.share_link_event from anon/.test(executable),
  'S6  anon cannot read receipts')

// ── S7 · the firewall: no counts return to the artist ───────────────────────
{
  const view = executable.slice(executable.indexOf('create or replace view public.share_link_delivery_v'),
    executable.indexOf('comment on view public.share_link_delivery_v'))
  assert(view.length > 0, 'S7  share_link_delivery_v exists (the artist-facing link projection)')
  assert(!/open_count|opened_at/.test(view),
    'S7  the artist-facing projection exposes delivery + expiry ONLY — no open_count, no opened_at',
    'S7  ⚠ the artist-facing projection leaks an open count/timestamp')
  assert(/sle_operator_read/.test(executable) && !/sle_org_read/.test(executable),
    'S7  receipts are operator-read only — an artist cannot read open events')
}

// ── S8 · the SQL resolver and the JS contract are the SAME rule ─────────────
{
  const fn = executable.slice(executable.indexOf('function public.resolve_share_link'),
    executable.indexOf('function public.record_share_link_open'))
  const sqlOutcomes = [...fn.matchAll(/'outcome'\s*,\s*'([a-z_]+)'/g)].map((m) => m[1])
  const uniqueSql = [...new Set(sqlOutcomes)]
  const unknown = uniqueSql.filter((o) => !OUTCOMES.includes(o))
  assert(unknown.length === 0,
    'S8  the SQL resolver returns only outcomes the JS contract declares',
    `S8  SQL returns outcomes the contract does not know: ${unknown.join(', ')}`)
  const missing = OUTCOMES.filter((o) => !uniqueSql.includes(o))
  assert(missing.length === 0,
    'S8  every one of the six typed outcomes is reachable in SQL',
    `S8  SQL never returns: ${missing.join(', ')}`)
  // Precedence: first appearance order in SQL must match the documented order
  // in the JS rule. A silent reordering is exactly how "revoked" starts
  // rendering as "expired" (or worse, an expired link starts resolving).
  const jsOrder = ['not_found', 'wrong_recipient', 'revoked', 'expired', 'superseded_not_permitted', 'ok']
  const sqlOrder = uniqueSql.filter((o) => jsOrder.includes(o))
  const jsSeq = jsOrder.filter((o) => sqlOrder.includes(o))
  assert(JSON.stringify(sqlOrder) === JSON.stringify(jsSeq),
    'S8  SQL precedence order matches the JS rule (wrong_recipient → revoked → expired → …)',
    `S8  precedence drift — SQL: [${sqlOrder}] vs contract: [${jsSeq}]`)
  assert(/security definer/.test(fn) && /set search_path = public, pg_temp/.test(fn),
    'S8  resolve_share_link is SECURITY DEFINER with a pinned search_path')
  // A dead outcome must return the reason and nothing else.
  const deadReturns = [...fn.matchAll(/return jsonb_build_object\(([^;]*?)\);/g)]
    .map((m) => m[1]).filter((b) => !/'ok'/.test(b))
  assert(deadReturns.every((b) => (b.match(/'/g) || []).length === 4),
    'S8  a dead link returns its REASON AND NOTHING ELSE (no act, no version, no snapshot)',
    'S8  ⚠ a dead-link branch returns payload beyond the outcome')
}

// ── S9 · the six recipient policies are the same six everywhere ─────────────
{
  const m = executable.match(/audience is null or audience in \(([^)]+)\)/)
  const sqlAud = m ? [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]) : []
  assert(sqlAud.length === 6, `S9  SQL constrains audience to six policies (found ${sqlAud.length})`)
  assert(JSON.stringify([...sqlAud].sort()) === JSON.stringify([...AUDIENCES].sort()),
    'S9  the six recipient policies in SQL === AUDIENCES in the contract module',
    `S9  policy drift — SQL: [${sqlAud}] vs contract: [${AUDIENCES}]`)
}

// ── S10 · PART B actually narrows anon to one live link ─────────────────────
{
  const partB = up.slice(up.indexOf('COPY FROM HERE'), up.indexOf('COPY TO HERE'))
  assert(/create policy pv_share_link_read/.test(partB), 'S10 PART B creates the narrowed anon policy')
  assert(/share_link/.test(partB) && /revoked_at is null/.test(partB) && /expiry is null or sl\.expiry > now\(\)/.test(partB),
    'S10 the anon policy requires a LIVE link — not revoked, not expired')
  assert(!/artist_is_published/.test(partB),
    'S10 the narrowed anon policy no longer keys on "artist is published"',
    'S10 ⚠ PART B still grants anon reads by publish flag — the enumeration hole survives')
  assert(/create policy pv_org_history_read[\s\S]{0,200}can_access_artist/.test(partB),
    'S10 owners/org retain the FULL governed history (including superseded versions)')
}

// ── S11 · the down file restores 001 verbatim, first ────────────────────────
{
  assert(/create policy pv_public_read on public\.passport_versions\s*\n\s*for select using \(public\.artist_is_published\(artist_id\)\);/.test(down),
    'S11 the down file restores pv_public_read verbatim from 001:209-210')
  const d1 = down.indexOf('pv_public_read')
  const d2 = down.indexOf('drop table if exists public.share_link_event')
  assert(d1 > -1 && d2 > d1, 'S11 the policy restore runs BEFORE the additive teardown')
  assert(/DATA LOSS WARNING/.test(down),
    'S11 the down file warns that dropping token_hash kills every minted link irrecoverably')
}

console.log('\nSTATIC — server contract (text assertions)')

// ── S12 · flag exists, defaults OFF, gates every route ──────────────────────
assert(/const SHARE_LINK_SERVICE_ENABLED = process\.env\.SHARE_LINK_SERVICE_ENABLED === '1'/.test(server),
  'S12 SHARE_LINK_SERVICE_ENABLED is opt-in ("=== \'1\'"), so the default is OFF')
assert(!/SHARE_LINK_SERVICE_ENABLED[^\n]*\|\|\s*(true|1)\b/.test(server),
  'S12 nothing defaults the flag ON')
{
  // Each registration + the first 600 chars of its body: the flag gate is the
  // first statement in every one of them, or it is not a gate.
  const decls = [...server.matchAll(/app\.(get|post)\('(\/api\/share-link[^']*)'/g)]
  assert(decls.length === 3, `S12 three share-link routes are registered (found ${decls.length})`)
  const ungated = decls.filter((d) => !/shareLinkEnabled\(res\)/.test(server.slice(d.index, d.index + 600)))
  assert(ungated.length === 0,
    'S12 every share-link route is gated by the flag — nothing changes behaviour until the owner enables it',
    `S12 ungated route(s): ${ungated.map((d) => d[2]).join(', ')}`)
}
assert(/from '\.\.\/src\/lib\/shareLink\.js'/.test(server),
  'S12 the server imports the shared rule')
assert(!/outcome:\s*'(expired|revoked|wrong_recipient|superseded_not_permitted)'/.test(
  server.replace(/from '\.\.\/src\/lib\/shareLink\.js'/, '')),
  'S12 the server never hand-rolls an outcome — resolveShareLink() decides',
  'S12 ⚠ the server re-derives an outcome instead of importing the rule')
assert(/randomBytes\(TOKEN_BYTES\)/.test(server) && /createHash\('sha256'\)/.test(server),
  'S12 the raw token is CSPRNG-minted and only its sha256 is stored')
assert(!/token_hash:\s*token\b/.test(server) && !/\.insert\([\s\S]{0,300}\btoken:\s/.test(server),
  'S12 the raw token is never written to the database')
assert(/tracking_disclosure_required/.test(server),
  'S12 a link cannot be minted without tracking disclosure (PUB4, 024:23)')
assert(!/open_count/.test(server),
  'S12 the server never returns an open count')

console.log('\nRUNTIME — the pure contract (src/lib/shareLink.js, really executed)')

// ── Fixtures. No DB, no network: rows shaped exactly like the SQL tables. ────
const NOW = Date.parse('2026-08-16T12:00:00Z')
const HOUR = 3600_000
const V = {
  published:  { id: 'v-pub',  act_id: 'act-A', state: 'published',  version_no: 3, audience: 'booker' },
  superseded: { id: 'v-sup',  act_id: 'act-A', state: 'superseded', version_no: 2, audience: 'booker' },
  draft:      { id: 'v-draft', act_id: 'act-A', state: 'draft',     version_no: 4, audience: 'booker' },
  otherAct:   { id: 'v-other', act_id: 'act-B', state: 'published', version_no: 1, audience: 'producer' },
}
const L = {
  live:        { id: 'l-live',  passport_version_id: 'v-pub', act_id: 'act-A', audience: 'booker',   status: 'live',   expiry: null },
  legacyActive:{ id: 'l-leg',   passport_version_id: 'v-pub', act_id: 'act-A', audience: 'booker',   status: 'active', expiry: new Date(NOW + 24 * HOUR).toISOString() },
  expired:     { id: 'l-exp',   passport_version_id: 'v-pub', act_id: 'act-A', audience: 'booker',   status: 'live',   expiry: new Date(NOW - HOUR).toISOString() },
  revoked:     { id: 'l-rev',   passport_version_id: 'v-pub', act_id: 'act-A', audience: 'booker',   status: 'revoked', expiry: null, revoked_at: new Date(NOW - HOUR).toISOString() },
  replaced:    { id: 'l-rep',   passport_version_id: 'v-pub', act_id: 'act-A', audience: 'booker',   status: 'replaced', expiry: null },
  boundSup:    { id: 'l-sup',   passport_version_id: 'v-sup', act_id: 'act-A', audience: 'booker',   status: 'live',   expiry: null },
  staleSup:    { id: 'l-sups',  passport_version_id: 'v-sup', act_id: 'act-A', audience: 'booker',   status: 'live',   expiry: new Date(NOW - HOUR).toISOString() },
  draftBound:  { id: 'l-draft', passport_version_id: 'v-draft', act_id: 'act-A', audience: 'booker', status: 'live',   expiry: null },
  wrongRcpt:   { id: 'l-wrong', passport_version_id: 'v-other', act_id: 'act-B', audience: 'producer', status: 'live', expiry: null, wrong_recipient_at: new Date(NOW - HOUR).toISOString() },
}
const versionsById = Object.fromEntries(Object.values(V).map((v) => [v.id, v]))
const resolve = (link) => resolveShareLink(link, link ? versionsById[link.passport_version_id] : null, { now: NOW })

// R1 · anonymous ENUMERATION fails — no link in hand, no version reachable.
{
  const enumerated = Object.values(V).map((v) => resolveShareLink(null, v, { now: NOW }))
  assert(enumerated.every((r) => r.outcome === OUTCOME.NOT_FOUND),
    'R1  enumeration without a link resolves NOTHING — every version answers not_found',
    'R1  ⚠ a version resolved without a link')
  assert(enumerated.every((r) => Object.keys(r).length === 1),
    'R1  the enumeration answer carries no payload at all (just the reason)')
}

// R2 · a wrong / unknown token fails, and looks identical to a malformed one.
{
  assert(resolve(undefined).outcome === OUTCOME.NOT_FOUND, 'R2  an unknown token → not_found')
  assert(!isWellFormedToken('nope') && !isWellFormedToken('') && !isWellFormedToken(null),
    'R2  a malformed token is rejected on shape before any lookup')
  assert(isWellFormedToken('A'.repeat(43)) && TOKEN_BYTES === 32,
    'R2  a well-formed token is 43+ base64url chars from 32 CSPRNG bytes')
}

// R3 · a valid token resolves EXACTLY ONE version.
{
  const r = resolve(L.live)
  assert(isOk(r), 'R3  a live token resolves ok')
  assert(r.passportVersionId === V.published.id,
    'R3  it resolves exactly the ONE version the link binds')
  assert(r.audience === 'booker' && AUDIENCES.includes(r.audience),
    'R3  it carries exactly one recipient policy')
  // "Exactly one" means the binding is authoritative: handing the resolver a
  // different version row than the link binds must NOT resolve.
  const mismatched = resolveShareLink(L.live, V.otherAct, { now: NOW })
  assert(mismatched.outcome === OUTCOME.NOT_FOUND,
    'R3  a version that is not the bound one cannot ride in on a valid token')
  assert(resolve(L.legacyActive).outcome === OUTCOME.OK,
    'R3  the legacy 024 status "active" is still honoured as live (no row rewrite needed)')
  assert(LIVE_STATUSES.length === 2, 'R3  exactly two statuses carry authority: active (legacy) + live')
}

// R4 · expired fails. Endless (null) is a deliberate answer, not an expiry.
{
  assert(resolve(L.expired).outcome === OUTCOME.EXPIRED, 'R4  an expired token → expired')
  assert(resolve(L.live).outcome === OUTCOME.OK,
    'R4  expiry = null means ENDLESS — it is not treated as "missing" and never expires')
  const boundary = { ...L.live, expiry: new Date(NOW).toISOString() }
  assert(resolveShareLink(boundary, V.published, { now: NOW }).outcome === OUTCOME.EXPIRED,
    'R4  expiry is inclusive at the boundary — a link is dead ON its expiry instant, fail-closed')
}

// R5 · revoked fails, and stays failed.
{
  assert(resolve(L.revoked).outcome === OUTCOME.REVOKED, 'R5  a revoked token → revoked')
  assert(resolve(L.replaced).outcome === OUTCOME.REVOKED,
    'R5  replaced/unpublished/withdrawn collapse into revoked at the recipient surface')
  const revokedButUnexpired = { ...L.live, revoked_at: new Date(NOW - HOUR).toISOString() }
  assert(resolveShareLink(revokedButUnexpired, V.published, { now: NOW }).outcome === OUTCOME.REVOKED,
    'R5  revocation beats a still-valid expiry — authority withdrawn is authority withdrawn')
}

// R6 · a SUPERSEDED version is reachable ONLY while explicitly bound AND live.
{
  assert(resolve(L.boundSup).outcome === OUTCOME.OK,
    'R6  a superseded version IS reachable through the live link that explicitly binds it')
  assert(resolve(L.staleSup).outcome === OUTCOME.EXPIRED,
    'R6  the same superseded version becomes unreachable the moment that link dies')
  assert(resolveShareLink(null, V.superseded, { now: NOW }).outcome === OUTCOME.NOT_FOUND,
    'R6  a superseded version is unreachable with no link at all — the 001 enumeration hole is closed')
  assert(resolve(L.draftBound).outcome === OUTCOME.SUPERSEDED_NOT_PERMITTED,
    'R6  a version nobody published (draft/preview/review) never resolves, even bound to a live link')
  assert(READABLE_VERSION_STATES.length === 2,
    'R6  only published and superseded are readable states')
}

// R7 · wrong recipient is its own terminal state.
{
  const r = resolve(L.wrongRcpt)
  assert(r.outcome === OUTCOME.WRONG_RECIPIENT, 'R7  a self-declared wrong recipient → wrong_recipient')
  assert(Object.keys(r).length === 1, 'R7  and it leaks nothing about the act it used to open')
}

// R8 · replayed OPEN receipts are idempotent.
{
  const k1 = openIdempotencyKey('l-live', 'sess-1', NOW)
  const k2 = openIdempotencyKey('l-live', 'sess-1', NOW + 60_000)      // same hour bucket
  const k3 = openIdempotencyKey('l-live', 'sess-1', NOW + OPEN_BUCKET_MS + 1)
  const k4 = openIdempotencyKey('l-live', 'sess-2', NOW)
  assert(k1 === k2, 'R8  the same session re-opening inside one bucket produces ONE key')
  assert(k1 !== k3 && k1 !== k4, 'R8  a later bucket and a different session are distinct events')
  let st = new Set()
  const a = applyOpenReceipt(st, k1); const b = applyOpenReceipt(a.state, k2)
  const c = applyOpenReceipt(b.state, k1)
  assert(a.written === true, 'R8  the first open writes a receipt')
  assert(b.written === false && c.written === false,
    'R8  every replay is a no-op — the same receipt, never a second one')
  assert(a.state.size === 1, 'R8  one event, one receipt after three attempts')
  assert(!Object.prototype.hasOwnProperty.call(a, 'count'),
    'R8  the reducer holds keys only — no counter exists to leak back to the artist')
}

// R9 · MINT is idempotent on what the link IS, not on when it was requested.
{
  const req = { passportVersionId: 'v-pub', audience: 'booker', recipientLabel: 'Yossi', purpose: 'NYE', expiry: null }
  assert(mintIdempotencyKey(req) === mintIdempotencyKey({ ...req, recipientLabel: ' yossi ' }),
    'R9  a retried mint of the same request yields the same key (no second bearer credential)')
  assert(mintIdempotencyKey(req) !== mintIdempotencyKey({ ...req, audience: 'producer' }),
    'R9  a different audience is a different link')
  assert(mintIdempotencyKey(req) !== mintIdempotencyKey({ ...req, expiry: '2026-12-31T00:00:00Z' }),
    'R9  a different expiry is a different link')
  assert(mintIdempotencyKey(req).includes('endless'),
    'R9  "no end date" is encoded as an explicit answer in the key, never as an empty value')
}

// R10 · every typed outcome is REACHABLE and DISTINCT.
{
  const produced = new Set([
    resolve(undefined).outcome, resolve(L.live).outcome, resolve(L.expired).outcome,
    resolve(L.revoked).outcome, resolve(L.draftBound).outcome, resolve(L.wrongRcpt).outcome,
  ])
  const missing = OUTCOMES.filter((o) => !produced.has(o))
  assert(missing.length === 0,
    `R10 all ${OUTCOMES.length} typed outcomes are reachable from fixtures`,
    `R10 unreachable outcome(s): ${missing.join(', ')}`)
  assert(produced.size === OUTCOMES.length,
    'R10 the six outcomes are mutually distinct — no two fixtures collapse into one reason')
  assert(new Set(OUTCOMES).size === OUTCOMES.length, 'R10 the outcome vocabulary has no duplicates')
  assert(OUTCOMES.every((o) => Number.isInteger(OUTCOME_HTTP_STATUS[o])),
    'R10 every outcome has exactly one HTTP mapping, so no route invents its own')
  assert(OUTCOMES.filter((o) => o !== OUTCOME.OK).every((o) => OUTCOME_HTTP_STATUS[o] >= 400),
    'R10 no dead outcome is served as a success')
}

// R11 · the RPC shape normalises into the same result type, failing closed.
{
  const okRow = fromRpcResult({ outcome: 'ok', share_link_id: 'l-live', passport_version_id: 'v-pub', version_no: 3, audience: 'booker' })
  assert(isOk(okRow) && okRow.passportVersionId === 'v-pub', 'R11 an ok RPC row normalises to the ok result')
  assert(fromRpcResult({ outcome: 'banana' }).outcome === OUTCOME.NOT_FOUND,
    'R11 an unknown outcome fails CLOSED to not_found')
  assert(Object.keys(fromRpcResult({ outcome: 'revoked', passport_version_id: 'v-pub' })).length === 1,
    'R11 a dead RPC row is stripped of any payload the DB may have sent')
  assert(isDead(fromRpcResult({ outcome: 'expired' })), 'R11 isDead()/isOk() partition the outcomes')
}

// R12 · the contract stays pure — no clock, no client, no side channel.
{
  assert(!/from '.*supabase/.test(contract) && !/fetch\(/.test(contract),
    'R12 the contract module imports no client and performs no I/O')
  assert(!/Date\.now\(\)\s*\)/.test(contract.replace(/opts\.now \?\? Date\.now\(\)/g, '').replace(/now = Date\.now\(\)/g, '')),
    'R12 time is injected, never read ambiently inside the rule')
  // Comments are stripped first: this module's own firewall NOTE names the
  // forbidden words on purpose, and a comment is not a computation.
  const code = contract.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ')
  assert(!/(score|percentile|rank|open_count|\bcount\b)/i.test(code),
    'R12 firewall — the contract computes no score, percentile, rank or count')
}

console.log(
  failed
    ? '\n✗ LINK INTEGRITY: FAILED\n'
    : `\n✓ LINK INTEGRITY: all assertions hold.
  Static: migration 041 text (fence, columns, constraints, policies, SQL↔JS parity) + server flag/route text.
  Runtime: the pure rule in src/lib/shareLink.js against fixtures.
  STILL UNPROVEN WITHOUT A DATABASE — see L1..L6 in this file's header. This gate
  cannot witness what anon can actually SELECT; only the applied DB can.\n`)
process.exit(failed ? 1 : 0)
