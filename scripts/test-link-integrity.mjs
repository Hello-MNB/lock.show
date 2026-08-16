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
//     L3 ✅ NO LONGER OPEN. The partial unique index really does reject a second
//        published row, and publishing really does supersede the incumbent
//        atomically — both EXECUTED against a throwaway PostgreSQL 16 by
//        scripts/test-sql-migrations.mjs (V1..V11), together with the 041/042
//        rollback round trips and mid-file-failure injections (R1..R10). That
//        gate is what turns the assertions below from text into evidence.
//     L4 ✅ NO LONGER OPEN. idx_sle_idempotent really does collapse a replayed
//        open receipt — EXECUTED below (X11) against a throwaway PostgreSQL 16.
//     L5 the immutability trigger really refuses an UPDATE of a snapshot.
//     L6 ✅ NO LONGER OPEN. anon can EXECUTE resolve_share_link and cannot
//        SELECT share_link_event — EXECUTED below (X12) and, per function,
//        in scripts/test-sql-privileges.mjs.
//
// ⚠ APPSEC F3 / F4 — WHAT THE EXECUTED SECTION AT THE BOTTOM ADDS
//     F3 the SQL mint hardcoded tracking_disclosed=false, so the RPC path
//        bypassed the server route's PUB4 gate entirely. X1..X4 execute the
//        refusal in every direction, including a raw INSERT.
//     F4 mint idempotency was check-then-insert (a race, not a guarantee) and
//        the mint receipt's failure was swallowed. X5..X8 execute a real
//        8-connection race, a negative control proving the old pattern loses
//        it, and a forced receipt failure that must take the link down with it.
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
  MINT_REFUSAL, MINT_REFUSALS, MINT_REFUSAL_SQLSTATE, MINT_REFUSAL_HTTP_STATUS,
  validateMintRequest, isAffirmativeDisclosure,
} from '../src/lib/shareLink.js'
import { pgAvailable, ScratchDb } from './lib/pgharness.mjs'

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
  'S5  at most ONE published version per (act, audience) — a partial unique index, not a convention')
// F5a · the index must be keyed on the COALESCED lineage/audience. Keyed on the
// bare columns it was SILENTLY INERT: audience is NULL for every row the shipped
// writer produces and NULLs are DISTINCT in a Postgres unique index, so three
// publishes left three rows in state='published'. Proven, and proven fixed, by
// scripts/test-sql-migrations.mjs V1/V4/V9 against a real PostgreSQL 16.
assert(/idx_pv_one_published[\s\S]{0,200}coalesce\(act_id, artist_id\)[\s\S]{0,80}coalesce\(audience, '\(none\)'\)/.test(executable),
  'S5  the publication index is keyed on COALESCE(act_id,artist_id)+COALESCE(audience,…) — a NULL cannot slip past it')
assert(/idx_pv_act_version_no[\s\S]{0,200}coalesce\(act_id, artist_id\)/.test(executable),
  'S5  version_no uniqueness is keyed on the same lineage the defaults trigger numbers by')
assert(/exception when unique_violation then[\s\S]{0,400}DEFERRED DATA MIGRATION/.test(executable + up),
  'S5  the index create is GUARDED — legacy data cannot make 041 refuse to apply (no forced cutover)')

// F5b · atomic supersession. Publishing must demote the incumbent in the same
// statement, or "one published version" is a hope rather than an invariant.
assert(/create or replace function public\.pv_supersede_previous\(\)/.test(executable),
  'S5  a supersession function exists')
assert(/create trigger trg_pv_supersede before insert or update on public\.passport_versions/.test(executable),
  'S5  supersession fires BEFORE insert or update — an AFTER trigger could never demote the incumbent before the unique index is checked')
assert(/state\s*=\s*'superseded'[\s\S]{0,200}superseded_at\s*=\s*coalesce\(p\.superseded_at, now\(\)\)/.test(executable),
  'S5  the prior published version is set to superseded WITH a superseded_at receipt')
assert(/pv_supersede_previous[\s\S]{0,600}security definer/.test(executable),
  'S5  supersession is SECURITY DEFINER — passport_versions has no UPDATE policy, so an invoker-rights demotion would silently match zero rows')
assert(/DEFERRED DATA MIGRATION/.test(up) && /D-C1/.test(up) && /D-C2/.test(up) && /D-IDX/.test(up),
  'S5  the deferred data migration is documented with named, runnable detection queries (D-C1 · D-C2 · D-IDX)')
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
assert(/revoke select, insert, update, delete on public\.share_link_event from anon/.test(executable),
  'S6  anon cannot read receipts — and cannot write, edit or delete one either (APPSEC F1: the whole grant surface is spelled out, not just SELECT)')

// ── S7 · the firewall: no counts return to the artist ───────────────────────
{
  const view = executable.slice(executable.indexOf('create or replace view public.share_link_delivery_v'),
    executable.indexOf('comment on view public.share_link_delivery_v'))
  assert(view.length > 0, 'S7  share_link_delivery_v exists (the artist-facing link projection)')
  assert(/security_invoker = true/.test(view),
    'S7  the view is security_invoker — it cannot bypass share_link RLS with the owner\'s rights',
    'S7  ⚠ the view runs with owner rights and would expose every artist\'s links')
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

  // F6 · ROLLBACK BOUNDARY. A down file that is not transactional can leave the
  // schema half-reverted — proven by negative control: stripping BEGIN/COMMIT
  // and injecting a mid-file error committed the destructive half anyway.
  // scripts/test-sql-migrations.mjs R9 executes both halves of that proof.
  assert(/^\s*begin;\s*$/m.test(down) && /^\s*commit;\s*$/m.test(down),
    'S11 the down file is wrapped in explicit BEGIN/COMMIT — a partial failure cannot half-revert the schema')
  assert((down.match(/^\s*begin;\s*$/gm) || []).length === (down.match(/^\s*commit;\s*$/gm) || []).length,
    'S11 every BEGIN in the down file has its COMMIT')
  assert(/drop trigger\s+if exists trg_pv_supersede/.test(down)
      && /drop function if exists public\.pv_supersede_previous\(\)/.test(down),
    'S11 the down file removes the supersession trigger AND its function')
  // Both mint overloads: the 8-arg current one and the 7-arg draft. Dropping
  // only one would leave a live entry point behind.
  assert(/mint_share_link\(uuid, text, text, text, text, timestamptz, text\)/.test(down)
      && /mint_share_link\(uuid, text, text, text, text, timestamptz, text, boolean\)/.test(down),
    'S11 the down file drops BOTH mint_share_link signatures')
  // Everything 041 adds to share_link must come back off on the way down.
  for (const col of ['token_hash', 'mint_request_key', 'audience', 'purpose', 'revoked_at',
    'created_by', 'expiry_kind', 'replaced_by', 'wrong_recipient_at']) {
    assert(new RegExp(`drop column if exists ${col}\\b`).test(down),
      `S11 the down file drops share_link.${col}`)
  }
  assert(/alter table public\.share_link add constraint share_link_status_check\s*\n\s*check \(status in \('active','expired','revoked'\)\);/.test(down),
    'S11 the 024 status vocabulary is restored verbatim (active·expired·revoked)')
  assert(/to_regclass\('public\.share_link'\)/.test(down) && /to_regclass\('public\.passport_versions'\)/.test(down),
    'S11 the down file guards on preconditions — running it where 041 was never applied is a no-op, not an error')
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
assert(/validateMintRequest\(/.test(server) && /MINT_REFUSAL_HTTP_STATUS\[refusal\]/.test(server),
  'S12 a link cannot be minted without tracking disclosure (PUB4, 024:23) — and the route no longer hand-rolls the rule, it imports validateMintRequest()')
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


// ════════════════════════════════════════════════════════════════════════════
// APPSEC F3 · DISCLOSURE   +   F4 · ATOMIC IDEMPOTENCY / RECEIPT INTEGRITY
// ════════════════════════════════════════════════════════════════════════════
console.log('\nSTATIC — APPSEC F3/F4 (text of 041 + the server route)')
{
  const mintFn = executable.slice(executable.indexOf('function public.mint_share_link'),
    executable.indexOf('function public.revoke_share_link'))

  // ── S13 · disclosure is a PARAMETER, and refusing is the default ──────────
  assert(/p_tracking_disclosed\s+boolean/.test(mintFn),
    'S13 mint_share_link() takes p_tracking_disclosed — disclosure is an argument, not an assumption')
  assert(/p_tracking_disclosed is distinct from true/.test(mintFn),
    'S13 missing (null) is refused exactly like false — `is distinct from true`, not a truthiness test')
  assert(/tracking_disclosure_required/.test(mintFn),
    'S13 the refusal is typed and carries the same word the contract exports')
  assert(!/tracking_disclosed[^\n]*\bfalse\b/.test(executable),
    'S13 nothing in the executable SQL ever writes tracking_disclosed = false',
    'S13 ⚠ the SQL still writes an undisclosed link somewhere')
  assert(/tracking_disclosed\b/.test(mintFn) && /,\s*true,?\s*$/m.test(mintFn),
    'S13 the mint writes tracking_disclosed = true, after validating it')

  // ── S14 · and the TABLE refuses it too, so no path is the soft one ────────
  assert(/share_link_tracking_disclosed_check[\s\S]{0,200}check \(tracking_disclosed is true\)/.test(executable),
    'S14 share_link carries a CHECK: an undisclosed row cannot exist, whatever wrote it')
  assert(/check \(tracking_disclosed is true\) not valid/.test(executable),
    'S14 the CHECK is NOT VALID — new writes are refused, legacy rows are not re-validated (the apply cannot fail on data)')

  // ── S15 · idempotency is a UNIQUE KEY, not a lookup ───────────────────────
  assert(/add column if not exists mint_request_key text/.test(executable),
    'S15 share_link gains mint_request_key — the logical request identity')
  assert(/create unique index if not exists idx_share_link_mint_request_key[\s\S]{0,140}mint_request_key/.test(executable),
    'S15 mint_request_key is UNIQUE — the index IS the concurrency control')
  assert(/on conflict \(mint_request_key\) do update[\s\S]{0,200}returning id, token_hash/.test(mintFn),
    'S15 the mint is ONE statement: INSERT … ON CONFLICT … RETURNING, so a racer returns the winner\'s row')
  assert(!/select share_link_id into v_id from public\.share_link_event/.test(mintFn),
    'S15 the check-then-insert prelude is GONE',
    'S15 ⚠ mint_share_link still checks-then-inserts — that is the race, not a fix')

  // ── S16 · the receipt is part of the mint ─────────────────────────────────
  const receipt = mintFn.slice(mintFn.indexOf('insert into public.share_link_event'))
  assert(!/on conflict[\s\S]{0,60}do nothing/.test(receipt),
    'S16 the mint receipt is not written with `on conflict do nothing` — a swallowed receipt is an unauditable link',
    'S16 ⚠ the mint receipt failure is still swallowed')
  assert(/mint_receipt_failed/.test(mintFn) && /v_rows <> 1/.test(mintFn),
    'S16 a receipt that does not land RAISES, which rolls the link back with it')

  // ── S17 · the server route enforces the same three rules ─────────────────
  assert(/validateMintRequest\(/.test(server),
    'S17 the server route uses the shared precondition rule instead of its own ifs')
  assert(/mint_request_key: idempotencyKey/.test(server),
    'S17 the server writes the logical request key, so the DB refuses its races too')
  assert(/insErr\.code !== '23505'/.test(server),
    'S17 a unique violation on the server mint path is READ AS A REPLAY, not as a 500')
  assert(/receiptErr[\s\S]{0,400}\.delete\(\)\.eq\('id', row\.id\)/.test(server),
    'S17 a failed receipt COMPENSATES — the just-created link is removed and the mint fails',
    'S17 ⚠ the server still keeps a link whose receipt never landed')
  assert(/MINT_REFUSAL\.MINT_RECEIPT_FAILED/.test(server),
    'S17 the receipt failure is returned as a typed refusal, not a generic server_error')

  // ── S18 · SQL refusal vocabulary === the contract's vocabulary ────────────
  const raised = [...mintFn.matchAll(/raise exception '([a-z_]+)'/g)].map((m) => m[1])
  const unknown = raised.filter((r) => !MINT_REFUSALS.includes(r) && r !== 'forbidden' && !r.startsWith('unknown'))
  assert(unknown.length === 0,
    `S18 every typed refusal the SQL raises is in the contract vocabulary (${raised.join(', ')})`,
    `S18 SQL raises refusals the contract does not know: ${unknown.join(', ')}`)
  for (const [refusal, sqlstate] of Object.entries(MINT_REFUSAL_SQLSTATE)) {
    if (!raised.includes(refusal)) continue
    assert(new RegExp(`'${refusal}' using errcode = '${sqlstate}'`).test(mintFn),
      `S18 ${refusal} carries SQLSTATE ${sqlstate} in SQL, exactly as the contract declares`)
  }
}

console.log('\nRUNTIME — the mint precondition rule (pure, really executed)')
{
  const base = { passportVersionId: 'v-pub', audience: 'booker' }
  assert(validateMintRequest({ ...base, trackingDisclosed: true }) === null,
    'M1  an affirmatively disclosed request may be minted')
  for (const bad of [undefined, null, false, 'true', 1, {}, 'yes']) {
    assert(validateMintRequest({ ...base, trackingDisclosed: bad }) === MINT_REFUSAL.TRACKING_DISCLOSURE_REQUIRED,
      `M1  disclosure ${JSON.stringify(bad)} is REFUSED — only literal true passes`)
  }
  assert(isAffirmativeDisclosure(true) && !isAffirmativeDisclosure('true') && !isAffirmativeDisclosure(1),
    'M1  no truthiness coercion: "the artist was never told" can never become "disclosed"')
  assert(validateMintRequest({ audience: 'booker', trackingDisclosed: true }) === MINT_REFUSAL.PASSPORT_VERSION_REQUIRED,
    'M2  a mint with no version is refused first — there is nothing to bind')
  assert(validateMintRequest({ ...base, audience: 'nope', trackingDisclosed: true }) === MINT_REFUSAL.AUDIENCE_INVALID,
    'M2  an audience outside the six policies is refused')
  assert(validateMintRequest(null) === MINT_REFUSAL.PASSPORT_VERSION_REQUIRED,
    'M2  the rule is total — an absent request is a refusal, never a crash')
  assert(MINT_REFUSALS.every((r) => Number.isInteger(MINT_REFUSAL_HTTP_STATUS[r]) && MINT_REFUSAL_HTTP_STATUS[r] >= 400),
    'M3  every refusal has exactly one HTTP mapping and none of them is a success')
}

// ── EXECUTED LOCALLY ───────────────────────────────────────────────────────
if (!pgAvailable()) {
  console.log('\n⚠ EXECUTION SKIPPED — no local PostgreSQL. X1..X12 are UNPROVEN in this run.')
} else {
  console.log('\nEXECUTED LOCALLY — real PostgreSQL 16, migration 041 really applied')
  const db = ScratchDb.create('b4_link')
  try {
    db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
    const OWNER = '00000000-0000-0000-0000-0000000000a1'   // owns the artist
    const REP_B = '00000000-0000-0000-0000-0000000000a3'   // holds a grant only
    const PV = '00000000-0000-0000-0000-00000000ffa1'
    const ART = '00000000-0000-0000-0000-0000000000c1'
    const as = { role: 'authenticated', uid: OWNER }
    const mint = (hexChar, key, disclosed, label = 'Yossi') =>
      `select public.mint_share_link('${PV}', repeat('${hexChar}',64), 'booker', '${label}', 'NYE', null, '${key}', ${disclosed});`
    const linkCount = () => Number(db.scalar('select count(*)::int from public.share_link'))
    const eventCount = () => Number(db.scalar("select count(*)::int from public.share_link_event where event = 'minted'"))

    // X1..X3 · F3 · the RPC cannot mint an undisclosed link
    for (const [what, value] of [['false', 'false'], ['missing (null)', 'null']]) {
      const r = db.try(mint('a', 'k-disc', value), as)
      assert(!r.ok && /tracking_disclosure_required/.test(r.out),
        `X1  RPC mint with tracking_disclosed = ${what} → REFUSED with the typed error (executed)`,
        `X1  ⚠ RPC mint with ${what} disclosure was NOT refused: ${r.out.split('\n')[0]}`)
    }
    assert(linkCount() === 0, 'X2  a refused mint leaves NO row behind (executed)')
    {
      const id = db.scalar(mint('a', 'k-disc', 'true'), as)
      assert(/^[0-9a-f-]{36}$/.test(id), 'X3  the same mint WITH disclosure succeeds (executed)')
      assert(db.scalar("select tracking_disclosed::text from public.share_link where mint_request_key = 'k-disc'") === 'true',
        'X3  and the row it wrote is disclosed (executed)')
    }

    // X4 · F3 · even a raw INSERT cannot get around it (this runs as the table
    // owner — a role that bypasses RLS entirely; a CHECK it cannot bypass)
    {
      const r = db.try(`insert into public.share_link (passport_version_id, artist_id, token_hash, status, tracking_disclosed)
                        values ('${PV}', '${ART}', repeat('9',64), 'live', false)`)
      assert(!r.ok && /share_link_tracking_disclosed_check/.test(r.out),
        'X4  a RAW INSERT of an undisclosed link is refused by the table CHECK, even for the owner role (executed)',
        `X4  ⚠ an undisclosed link can still be written directly: ${r.out.split('\n')[0]}`)
    }

    // X5 · F4 · sequential replay returns the SAME link, mints no second token
    {
      const first = db.scalar(mint('b', 'k-replay', 'true'), as)
      const again = db.scalar(mint('c', 'k-replay', 'true'), as)   // a DIFFERENT token
      assert(first === again, 'X5  a retried mint of the same logical request returns the SAME link id (executed)')
      assert(Number(db.scalar("select count(*)::int from public.share_link where mint_request_key = 'k-replay'")) === 1,
        'X5  and exactly one row exists for that request (executed)')
      assert(db.scalar("select encode(digest(repeat('b',64),'sha256'),'hex') is not null::text") !== '',
        'X5  (sanity: pgcrypto is present)')
    }

    // X6 · F4 · THE RACE. Eight separate connections, same logical request,
    // eight different tokens, started together. Exactly one link may result.
    {
      const before = linkCount()
      const hexes = ['1', '2', '3', '4', '5', '6', '7', '8']
      const results = await db.parallel(hexes.map((h) => mint(h, 'k-race', 'true')), as)
      const ids = [...new Set(results.filter((r) => r.ok).map((r) => r.out))]
      const created = Number(db.scalar("select count(*)::int from public.share_link where mint_request_key = 'k-race'"))
      assert(results.every((r) => r.ok), `X6  all ${results.length} concurrent mints completed (executed)`,
        `X6  a concurrent mint errored: ${results.find((r) => !r.ok)?.out.split('\n')[0]}`)
      assert(created === 1,
        `X6  ${results.length} CONCURRENT mints of one logical request produced EXACTLY ONE link (executed)`,
        `X6  ⚠ ${created} links were minted for one request — the race is still open`)
      assert(ids.length === 1, `X6  and every connection was handed the same link id (executed): ${ids[0]}`)
      assert(Number(db.scalar("select count(*)::int from public.share_link_event where idempotency_key = 'k-race'")) === 1,
        'X6  exactly one mint receipt was written, not eight (executed)')
      assert(linkCount() === before + 1, 'X6  and nothing else was created along the way (executed)')
    }

    // X7 · NEGATIVE CONTROL. The pattern this replaced, reproduced verbatim in
    // a scratch function with the check→insert window widened by pg_sleep so
    // the race is deterministic rather than lucky. If this does NOT produce
    // duplicates, the fixture is not exercising concurrency and X6 proves less
    // than it claims.
    {
      db.exec(`
        create or replace function public.mint_legacy_probe(p_hex text, p_key text)
        returns uuid language plpgsql security definer set search_path = public, pg_temp as $probe$
        declare v_id uuid;
        begin
          select sl.id into v_id from public.share_link sl
           where sl.recipient_label = p_key limit 1;          -- the CHECK
          if v_id is not null then return v_id; end if;
          perform pg_sleep(0.25);                             -- the WINDOW
          insert into public.share_link (passport_version_id, artist_id, token_hash,
                                         status, tracking_disclosed, recipient_label)
          values ('${PV}', '${ART}', repeat(p_hex,64), 'live', true, p_key)
          returning id into v_id;                             -- the INSERT
          return v_id;
        end $probe$;`)
      const res = await db.parallel(['1', '2', '3', '4'].map((h) =>
        `select public.mint_legacy_probe('${h}', 'legacy-key');`))
      const dupes = Number(db.scalar("select count(*)::int from public.share_link where recipient_label = 'legacy-key'"))
      assert(res.every((r) => r.ok) && dupes > 1,
        `X7  CONTROL — the check-then-insert pattern this replaced yields ${dupes} links for ONE request (executed). The race was real.`,
        `X7  ⚠ the control produced ${dupes} link(s): this fixture is not exercising concurrency, so X6 proves less than it claims`)
      db.exec("delete from public.share_link where recipient_label = 'legacy-key'; drop function public.mint_legacy_probe(text, text);")
    }

    // X8 · F4 · a receipt that cannot be written must take the mint down with
    // it. The failure is injected with a trigger, because a receipt outage is
    // exactly the shape of "the write raised for a reason nobody predicted".
    {
      const before = linkCount()
      db.exec(`
        create or replace function public.sle_boom() returns trigger
        language plpgsql as $boom$
        begin
          if new.idempotency_key = 'k-boom' then
            raise exception 'injected receipt outage';
          end if;
          return new;
        end $boom$;
        create trigger trg_sle_boom before insert on public.share_link_event
          for each row execute function public.sle_boom();`)
      const r = db.try(mint('d', 'k-boom', 'true'), as)
      assert(!r.ok && /injected receipt outage/.test(r.out),
        'X8  a mint whose receipt fails RAISES instead of returning a link (executed)',
        `X8  ⚠ the mint survived a failed receipt: ${r.out.split('\n')[0]}`)
      assert(linkCount() === before,
        'X8  and the link row is rolled back with it — no unauditable link survives (executed)',
        'X8  ⚠ a link exists whose mint receipt was never written')
      db.exec('drop trigger trg_sle_boom on public.share_link_event; drop function public.sle_boom();')
    }

    // X9 · authority. A grant-holding org is not the minting authority here:
    // can_access_artist() is what mint_share_link asks, and a user with no
    // relationship at all must be refused.
    {
      const stranger = '00000000-0000-0000-0000-0000000000a9'
      db.exec(`insert into auth.users (id, email) values ('${stranger}','stranger@fixture.test') on conflict do nothing;
               insert into public.person (id, email) values ('${stranger}','stranger@fixture.test') on conflict do nothing;`)
      const r = db.try(mint('e', 'k-stranger', 'true'), { role: 'authenticated', uid: stranger })
      assert(!r.ok && /forbidden/.test(r.out),
        'X9  a user with no organization relationship cannot mint a link for this artist (executed)',
        `X9  ⚠ a stranger minted a link: ${r.out.split('\n')[0]}`)
    }

    // X11 · L4 CLOSED — the replayed OPEN receipt really does collapse on the
    // unique index, not merely in the JS reducer.
    {
      const hash = db.scalar("select token_hash from public.share_link where mint_request_key = 'k-disc'")
      const first = db.scalar(`select public.record_share_link_open('${hash}', 'open-key-1');`, { role: 'anon' })
      const replay = db.scalar(`select public.record_share_link_open('${hash}', 'open-key-1');`, { role: 'anon' })
      const receipts = Number(db.scalar(`select count(*)::int from public.share_link_event
                                          where event = 'opened' and idempotency_key = 'open-key-1'`))
      assert(first === 't' && replay === 'f' && receipts === 1,
        'X11 a replayed open writes ONE receipt — idx_sle_idempotent enforces it in Postgres (executed)',
        `X11 ⚠ replay handling is wrong: first=${first} replay=${replay} receipts=${receipts}`)
    }

    // X12 · L6 CLOSED — anon may open a link and may NOT read the receipts.
    {
      const r = db.try('select count(*) from public.share_link_event', { role: 'anon' })
      assert(!r.ok && /permission denied/i.test(r.out),
        'X12 anon cannot SELECT share_link_event — open receipts never reach a bearer (executed)',
        `X12 ⚠ anon can read receipts: ${r.out.split('\n')[0]}`)
    }
  } finally {
    db.drop()
  }
}

console.log(
  failed
    ? '\n✗ LINK INTEGRITY: FAILED\n'
    : `\n✓ LINK INTEGRITY: all assertions hold.
  Static: migration 041 text (fence, columns, constraints, policies, SQL↔JS parity) + server flag/route text.
  Runtime: the pure rule + the mint precondition rule in src/lib/shareLink.js against fixtures.
  EXECUTED LOCALLY (PostgreSQL 16, 041 really applied): F3 disclosure refused via RPC and via a raw
    INSERT · F4 sequential replay, an 8-connection race producing exactly ONE link, a negative control
    proving the old check-then-insert loses that race, a forced receipt outage rolling the mint back ·
    L4 replayed open receipts collapse on the index · L6 anon's grants.
  STILL RUNTIME-UNVERIFIED ON SUPABASE: L1/L2/L5 in this file's header, PostgREST behaviour, real JWTs,
    and whether 041 applies on top of the REAL data — it is drafted and deliberately NOT applied.\n`)
process.exit(failed ? 1 : 0)
