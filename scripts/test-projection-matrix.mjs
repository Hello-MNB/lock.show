// ============================================================
// P0-PRIVACY B2 · PROJECTION MATRIX GATE — scripts/test-projection-matrix.mjs
//
// THE DEFECT THIS GATE MAKES UNREPEATABLE: RADAR is artist-private
// intelligence, and the product shipped it to representation orgs by default.
//   · DB   — migration 010 materializes radar_signal once per org holding an
//            active artist_access grant (all four inserts join artist_access),
//            with RLS `radar_org` = organization_id in current_org_ids(). Every
//            grant-holder can read the artist's status='missing' gap signals.
//   · APP  — /agency/radar (src/features/agency/RadarFeed.jsx) does NOT read
//            radar_signal at all; it re-derives the SAME private rule set
//            client-side (src/lib/radar.js, R1–R8 including the gap rules).
// So the leak has two halves and closing one does not close the other. This
// file gates BOTH halves against one matrix.
//
// THE RULING IT ENCODES (owner, 9 Aug 2026 — docs/OWNER-PENDING.md R-11,
// recorded c9710ba): the ARTIST-PRIVATE surface may show everything —
// percentages, coverage, benchmarks, gaps. The firewall stays absolute on every
// OTHER entity's surface: bands + binaries + method labels only, and never
// private gap or coaching content.
//
// ── STATIC vs NEEDS-LIVE-DB (read this before trusting a green run) ─────────
// STATIC (fully proven here, no database, no network, no secrets):
//   S1  migration 042 up/down exist, are paired, and are reversible
//   S2  the SQL content law forbids gap/coaching content on rep_summary rows
//   S3  the split RLS policies are written against the EXISTING helpers
//       (current_org_ids / artist_access_has_scope) and gate on org + live
//       mandate + non-expired + in-scope + enabled purpose + allowed rule
//   S4  the artist-private policy is keyed on OWNERSHIP and never on a grant
//   S5  the purpose registry ships with nothing enabled
//   S6  the client mirror (src/lib/radar.js) and the SQL allowlist AGREE, both
//       directions — neither side can drift alone
//   S7  object × persona matrix, executed against the REAL client functions
//       over fixtures (no DB): what may appear per persona
//   S8  negative cases at the level they are expressible statically
//   S9  the flag exists, defaults OFF, and is actually wired into the screen
//
// EXECUTED LOCALLY (APPSEC F2 — a real PostgreSQL 16, two real organizations,
// real RLS, real SECURITY DEFINER semantics; see the X-block at the bottom):
//   X1  042 applies to the real migration chain, and the split can be applied
//       AND reverted (was L1 — now closed for the local replica; the REAL data
//       is still unverified)
//   X2  ORG A's representative cannot read ORG B's demand row, its event_type,
//       its location or its id — through radar_signal, before or after the
//       split (was L2)
//   X3  the definer functions really do produce the rows this file claims, and
//       really do NOT produce a rep_summary row carrying a demand pointer
//       (was L3)
//   X4  a NEGATIVE CONTROL proves the fixture can exhibit the leak: the
//       unscoped join 010 shipped really does hand ORG A the other org's
//       request, so X2 is a repair and not an accident of the data
//
// NEEDS-LIVE-DB (still NOT proven here — do not read a green run as proof):
//   L1  that migration 042 applies cleanly to the REAL data (never applied)
//   L2b that PostgREST + real JWTs behave as the shim's roles do
//   L4  that no OTHER shipped read path (PostgREST, an RPC, a view) reaches
//       radar_signal — grep proves absence in this repo, not in the deployment
//
// Run: npm run test:projection-matrix   (wired into `npm run verify`)
// Exit 0 = every asserted boundary holds. Exit 1 = any failure.
// ============================================================
import { readFileSync, existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { pgAvailable, ScratchDb } from './lib/pgharness.mjs'

let failed = false
const fail = (m) => { console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => console.log(`  · ${m}`)
const check = (cond, msg) => (cond ? ok(msg) : fail(msg))

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const UP_PATH = 'supabase/migrations/042_radar_audience_split.sql'
const DOWN_PATH = 'supabase/migrations/042_radar_audience_split.down.sql'
const UP = read(UP_PATH)
const DOWN = read(DOWN_PATH)
const RADAR_JS = read('src/lib/radar.js')
const ORGS_JS = read('src/lib/orgs.js')
const CONSTANTS_JS = read('src/lib/constants.js')
const FEED_JSX = read('src/features/agency/RadarFeed.jsx')
const M010 = read('supabase/migrations/010_radar.sql')
const M027 = read('supabase/migrations/027_workspace_types_and_access_scopes.sql')

// SQL with comments stripped — a promise in a comment is not a policy.
const sqlOnly = (s) => s.split(/\r?\n/).filter((l) => !/^\s*--/.test(l)).join('\n')
const UP_SQL = sqlOnly(UP)
const DOWN_SQL = sqlOnly(DOWN)

// ── S1 · the migration pair exists and is reversible ────────────────────────
console.log('\n[S1] migration 042 pair — exists, paired, reversible')
check(UP.length > 0, `${UP_PATH} exists`)
check(DOWN.length > 0, `${DOWN_PATH} exists`)
check(/PRECONDITIONS/.test(UP) && /APPLY ORDER/i.test(UP), 'up migration carries an explicit PRECONDITIONS header with apply order')
check(/BREAKING/.test(UP) && /ADDITIVE/i.test(UP), 'up migration labels which half is BREAKING vs additive')
check(!/drop\s+table\b/i.test(UP_SQL) && !/drop\s+column\b/i.test(UP_SQL),
  'up migration drops no table and no column (destructive changes live only in the .down)')
check(/create or replace function public\.apply_radar_audience_split\(\)/.test(UP_SQL),
  'the BREAKING half is fenced behind apply_radar_audience_split() — applying the file does not tighten anything')
check(!/^\s*select public\.apply_radar_audience_split\(\)/mi.test(UP_SQL),
  'apply_radar_audience_split() is installed but NOT called by the migration itself')
check(/create or replace function public\.revert_radar_audience_split\(\)/.test(UP_SQL),
  'revert_radar_audience_split() exists — the tightening is reversible without a down-migration')
check(/create policy radar_org on public\.radar_signal/.test(DOWN_SQL),
  'down migration restores 010\'s radar_org policy verbatim')
check(/drop column if exists audience/.test(DOWN_SQL) && /drop table if exists public\.radar_projection_purpose/.test(DOWN_SQL),
  'down migration removes the audience model it added')

// ── S2 · SQL content law: no gap / coaching content off the artist ──────────
console.log('\n[S2] SQL content law — rep_summary rows carry no gap or coaching content')
const repCheck = (UP_SQL.match(/radar_signal_rep_content_check[\s\S]*?\);/) || [''])[0]
check(/audience in \('artist_private','rep_summary'\)/.test(UP_SQL), 'audience column bounded to exactly two values')
check(/add column if not exists purpose text/.test(UP_SQL), 'purpose column added')
check(/add column if not exists projection_id uuid/.test(UP_SQL), 'projection_id column added')
check(/references public\.artist_access\(id\) on delete cascade/.test(UP_SQL),
  'projection_id cascades from artist_access — a projection cannot outlive its mandate')
check(repCheck.length > 0, 'radar_signal_rep_content_check constraint exists')
check(/rule_id\s+in \('R2','R5'\)/.test(repCheck), 'rep content law allows rule_ids R2/R5 only')
check(/action_type in \('respond','promote'\)/.test(repCheck), 'rep content law allows actions respond/promote only')
check(/status\s+= 'strong'/.test(repCheck), "rep content law allows status 'strong' only — 'missing'/'notAssessable' ARE the gap")
check(/method_label is not null/.test(repCheck), 'method label is mandatory on every off-artist row')
for (const forbidden of ['missing', 'notAssessable', 'request-evidence', 'refresh-evidence', 'review']) {
  check(!new RegExp(`'${forbidden}'`).test(repCheck), `rep content law never admits '${forbidden}'`)
}
check(/allowed_rule_ids text\[\] not null check \(allowed_rule_ids <@ array\['R2','R5'\]::text\[\]\)/.test(UP_SQL),
  'the purpose registry itself cannot name a gap/coaching rule (defense in depth)')
check(/add column if not exists audience text not null default 'artist_private'/.test(UP_SQL),
  "the default audience is artist_private — a row is private unless something explicitly projects it")
check(/index[\s\S]*idx_radar_audience/.test(UP_SQL) && /idx_radar_projection/.test(UP_SQL),
  'audience + projection indexes added')

// ── S3 · split RLS, written against the EXISTING helpers ────────────────────
console.log('\n[S3] split RLS — rep read requires a live, in-scope, non-expired, purpose-named mandate')
const repPolicy = (UP_SQL.match(/create policy radar_rep_summary_read[\s\S]*?\);\s*\n/) || [''])[0]
check(repPolicy.length > 0, 'radar_rep_summary_read policy exists')
check(/current_org_ids\(\)/.test(repPolicy), 'reuses public.current_org_ids() (008) rather than inventing a helper')
check(/artist_access_has_scope\(/.test(repPolicy), 'reuses public.artist_access_has_scope() (027) rather than inventing a helper')
check(/aa\.status = 'active'/.test(repPolicy), 'NEGATIVE CASE — a revoked/pending mandate reads nothing')
check(/aa\.expires_at is null or aa\.expires_at > now\(\)/.test(repPolicy), 'NEGATIVE CASE — a stale/expired mandate reads nothing')
check(/p\.required_scope = any\(aa\.scope\)/.test(repPolicy), 'NEGATIVE CASE — a mandate missing the required scope reads nothing')
check(/aa\.organization_id = radar_signal\.organization_id/.test(repPolicy), 'NEGATIVE CASE — wrong org: the mandate row must belong to the reading org')
check(/aa\.artist_id = radar_signal\.artist_id/.test(repPolicy), 'NEGATIVE CASE — a mandate on artist A cannot unlock artist B')
check(/p\.enabled = true/.test(repPolicy), 'NEGATIVE CASE — a purpose the artist has not authorized reads nothing')
check(/radar_signal\.rule_id = any\(p\.allowed_rule_ids\)/.test(repPolicy), 'a purpose authorizes only the rules it names — mandate scope ≠ blanket access')
check(/drop policy if exists radar_org on public\.radar_signal/.test(UP_SQL),
  "the leaking 010 policy `radar_org` (FOR ALL over current_org_ids) is removed by the tightening")
// The helpers must actually be the ones 027 defines — signature check, not vibes.
check(/create or replace function public\.artist_access_has_scope\(a uuid, needed text\)/.test(M027),
  'artist_access_has_scope(a uuid, needed text) really has that signature in 027')
check(/create or replace function public\.can_access_artist\(a uuid\)/.test(M027),
  'can_access_artist(a uuid) really has that signature in 027')

// ── S4 · cross-context: private rows answer to OWNERSHIP, never to a grant ──
console.log('\n[S4] cross-context read — artist_private is keyed on ownership, not on artist_access')
const privPolicy = (UP_SQL.match(/create policy radar_artist_private_read[\s\S]*?\);\s*\n/) || [''])[0]
check(privPolicy.length > 0, 'radar_artist_private_read policy exists')
check(/owner_organization_id in \(select public\.current_org_ids\(\)\)/.test(privPolicy),
  'private read requires artists.owner_organization_id — the artist\'s own context')
check(!/artist_access/.test(privPolicy),
  'NEGATIVE CASE — the private policy never mentions artist_access: no grant can reach the private branch')
check(/audience = 'artist_private'/.test(privPolicy), 'the private policy is audience-scoped (it cannot leak a projection either)')
// 010's own text is the baseline this replaces — assert the defect is real, so
// this gate fails loudly if someone "fixes" 010 in place and forgets 042.
check(/create policy radar_org on public\.radar_signal for all/.test(sqlOnly(M010)),
  'baseline confirmed: 010 still ships the FOR-ALL org policy this migration replaces')

// ── S5 · nothing is authorized until the owner names it ─────────────────────
console.log('\n[S5] purpose registry — ships with NOTHING enabled')
const seed = (UP_SQL.match(/insert into public\.radar_projection_purpose[\s\S]*?on conflict \(purpose\) do nothing;/) || [''])[0]
check(seed.length > 0, 'a candidate purpose row is seeded')
check(/\bfalse\b/.test(seed) && !/\btrue\b/.test(seed),
  'the seeded purpose is enabled=false — no rep-visible projection content is authorized by this migration')
check(/enabled\s+boolean not null default false/.test(UP_SQL), 'new purposes default to disabled')

// ── S6 · client mirror must agree with the SQL, both directions ─────────────
console.log('\n[S6] client mirror ↔ SQL allowlist agreement')
const radar = await import(pathToFileURL(resolve('src/lib/radar.js')).href)
const sqlRules = (repCheck.match(/rule_id\s+in \(([^)]*)\)/) || [, ''])[1].split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean)
const sqlActions = (repCheck.match(/action_type in \(([^)]*)\)/) || [, ''])[1].split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean)
const jsRules = radar.REP_SUMMARY_RULE_IDS || []
const jsActions = radar.REP_SUMMARY_ACTIONS || []
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))
check(sameSet(sqlRules, jsRules), `rule allowlist agrees — SQL [${sqlRules}] vs JS [${jsRules}]`)
check(sameSet(sqlActions, jsActions), `action allowlist agrees — SQL [${sqlActions}] vs JS [${jsActions}]`)
check(sameSet(radar.REP_SUMMARY_STATUSES || [], ['strong']), 'status allowlist agrees — strong only')
check(typeof radar.projectRadarForRep === 'function', 'projectRadarForRep() is exported')

// ── S7 · OBJECT × PERSONA MATRIX (executed against the real functions) ──────
console.log('\n[S7] object × persona matrix — what may appear, per persona')
// Fixture roster engineered so computeRadarSignals fires ALL EIGHT rules.
const now = Date.UTC(2026, 7, 16)
const day = 86400000
const iso = (t) => new Date(t).toISOString()
// `demandDetail: true` = "the reading context OWNS this demand" (APPSEC F2).
// The artist-private persona does; a representation org does not, and the S7b
// block below re-runs the same fixtures without it to prove what changes.
const FIXTURES = [
  { // fires R1 (stale ∩ demand), R3 (demand w/o ready passport), R7 (aging draw)
    artist: { id: 'a1', stage_name: 'Fixture One', published: false },
    claims: [{ claim_type: 'lineup', verification_status: 'self-reported', visibility: 'private', method_label: 'artist-declared', expires_at: iso(now - 30 * day) }],
    draw: [{ signal_type: 'band', computed_at: iso(now - 200 * day) }],
    demand: [{ id: 'd1', event_type: 'club', location: 'TLV', status: 'new' }], demandDetail: true,
  },
  { // fires R2 (ready ∩ demand) + R5 (producer-confirmed strength)
    artist: { id: 'a2', stage_name: 'Fixture Two', published: true },
    claims: [
      { claim_type: 'headline', verification_status: 'verified', visibility: 'passport-ok', method_label: 'producer-confirmed', expires_at: null },
    ],
    draw: [],
    demand: [{ id: 'd2', event_type: 'festival', location: 'Haifa', status: 'new' }], demandDetail: true,
  },
  { // fires R4 (evidence ready, unpublished) — a coaching signal
    artist: { id: 'a3', stage_name: 'Fixture Three', published: false },
    claims: [{ claim_type: 'support', verification_status: 'verified', visibility: 'passport-ok', method_label: 'evidence-supported', expires_at: null }],
    draw: [], demand: [],
  },
  { // fires R6 (demand, no strong proof) — a gap statement about a person
    artist: { id: 'a4', stage_name: 'Fixture Four', published: true },
    claims: [{ claim_type: 'lineup', verification_status: 'self-reported', visibility: 'private', method_label: 'artist-declared', expires_at: null }],
    draw: [], demand: [{ id: 'd4', event_type: 'private', location: 'Eilat', status: 'new' }], demandDetail: true,
  },
  { // fires R8 (no evidence at all) — the bluntest gap in the system
    artist: { id: 'a5', stage_name: 'Fixture Five', published: false },
    claims: [], draw: [], demand: [],
  },
]
const priv = radar.computeRadarSignals(FIXTURES, now)
const rep = radar.projectRadarForRep(priv)
const rulesOf = (set) => [...new Set(set.map((s) => s.ruleId))].sort()

// PERSONA: ARTIST-PRIVATE — the 9 Aug ruling. Everything is permitted here.
console.log('  — persona: ARTIST-PRIVATE (own surface) — may show everything (ruling 9 Aug 2026)')
check(rulesOf(priv).length === 8, `all 8 rules reachable on the private surface: ${rulesOf(priv)}`)
check(priv.some((s) => s.status === 'missing'), 'gap signals (status=missing) ARE permitted on the artist-private surface')
check(priv.some((s) => s.status === 'notAssessable'), 'notAssessable ("we cannot judge this yet") is permitted on the artist-private surface')
check(priv.some((s) => typeof s.ageDays === 'number'), 'staleness in days (coaching detail) is permitted on the artist-private surface')
check(priv.some((s) => ['refresh-evidence', 'request-evidence', 'review', 'publish'].includes(s.actionType)),
  'coaching actions are permitted on the artist-private surface')

// PERSONA: REPRESENTATION — bands + binaries + method labels, never a gap.
console.log('  — persona: REPRESENTATION (mandate holder) — bands + binaries + method labels only')
check(rep.length > 0 && rep.length < priv.length, `projection is a strict subtraction: ${rep.length} of ${priv.length} signals survive`)
check(rep.every((s) => jsRules.includes(s.ruleId)), `only allowlisted rules survive: ${rulesOf(rep)}`)
check(rep.every((s) => jsActions.includes(s.actionType)), 'only allowlisted actions survive')
check(rep.every((s) => s.status === 'strong'), 'no non-strong status survives — the gap never crosses')
check(!rep.some((s) => s.status === 'missing' || s.status === 'notAssessable'), 'NEGATIVE — no gap status on the rep surface')
check(!rep.some((s) => ['R1', 'R3', 'R4', 'R6', 'R7', 'R8'].includes(s.ruleId)), 'NEGATIVE — no coaching/gap rule on the rep surface')
check(rep.every((s) => s.ageDays === null), 'NEGATIVE — staleness-in-days is stripped from the rep surface')
check(rep.every((s) => Boolean(s.methodLabel || s.vstatus)), 'every surviving signal carries a method label')
// Firewall: nothing numeric about a person may ride along.
const numericLeak = rep.flatMap((s) => Object.entries(s)
  .filter(([k, v]) => typeof v === 'number' && !['signalDate'].includes(k))
  .map(([k]) => `${s.ruleId}.${k}`))
check(numericLeak.length === 0, `no numeric field about a person on the rep surface${numericLeak.length ? `: ${numericLeak}` : ''}`)
check(!rep.some((s) => Object.keys(s).some((k) => /score|rank|percent|percentile|grade|rating|nextBest/i.test(k))),
  'no score / rank / percentile / rating / next-best-action field is introduced')
// Subtraction-only: the projection may never invent a key or a signal.
const privKeys = new Set(priv.flatMap((s) => Object.keys(s)))
check(rep.every((s) => Object.keys(s).every((k) => privKeys.has(k))), 'the projection adds no new field — it can only subtract')
check(rep.every((r) => priv.some((p) => p.ruleId === r.ruleId && p.artistId === r.artistId)), 'the projection invents no signal that the private set did not already hold')
// Idempotence — projecting a projection changes nothing.
check(JSON.stringify(radar.projectRadarForRep(rep)) === JSON.stringify(rep), 'projection is idempotent')
// PERSONA: any OTHER entity (buyer / producer) — the same ceiling, by construction.
check(radar.projectRadarForRep([]).length === 0 && radar.projectRadarForRep(null).length === 0,
  'the projection is total — an empty/absent private set yields an empty projection, never a fabricated one')

// ── S8 · negative cases in the client read path ─────────────────────────────
// ── S7b · APPSEC F2 · cross-organization demand detail ─────────────────────
console.log('\n[S7b] cross-organization demand — event_type / location / request id')
{
  // The SAME fixtures, read by a context that does NOT own the demand. Nothing
  // about the artist changes; only who is reading does.
  const foreign = FIXTURES.map(({ demandDetail, ...rest }) => rest)   // no declaration = no detail
  const privOwn = radar.computeRadarSignals(FIXTURES, now)
  const privForeign = radar.computeRadarSignals(foreign, now)
  const detailOf = (set) => set.filter((x) => x.demand)
    .flatMap((x) => radar.DEMAND_DETAIL_FIELDS.map((f) => x.demand[f]).filter((v) => v != null))

  check(radar.DEMAND_DETAIL_FIELDS.length === 3 &&
        ['event_type', 'location', 'id'].every((f) => radar.DEMAND_DETAIL_FIELDS.includes(f)),
    'the three cross-organization demand fields are named in one place: event_type · location · id')
  check(detailOf(privOwn).length > 0,
    `the OWNING context still sees demand detail (${detailOf(privOwn).length} field values) — this repair removes nothing from the artist`)
  check(detailOf(privForeign).length === 0,
    'NEGATIVE CASE — a context that does not own the demand sees NO event_type, NO location and NO request id')
  check(privForeign.filter((x) => x.demand).every((x) => x.demand.present === true),
    'and it still learns that demand EXISTS — a binary, which is what R1/R2/R3/R6 are about')
  check(privForeign.length === privOwn.length,
    'no signal disappears: the redaction removes FIELDS, never a rule (a shorter feed would be a different lie)')
  check(detailOf(radar.projectRadarForRep(privOwn)).length === 0,
    'NEGATIVE CASE — even a signal computed WITH detail loses it on the rep projection (belt and braces)')
  check(radar.redactDemand(null) === null && radar.redactDemand({ id: 'x', event_type: 'club', location: 'TLV' }).id === null,
    'redactDemand() is total and nulls every field it is given')
}

console.log('\n[S8] negative cases — client read path')
const inputsFn = (ORGS_JS.match(/export async function getRadarInputs[\s\S]*?\n}/) || [''])[0]
check(/\.eq\('organization_id', orgId\)/.test(inputsFn), 'NEGATIVE CASE — wrong org: the grant query is pinned to the active org id')
check(/\.eq\('status', 'active'\)/.test(inputsFn), 'NEGATIVE CASE — a revoked/pending grant feeds nothing')
check(/expires_at\.is\.null,expires_at\.gt\./.test(inputsFn), 'NEGATIVE CASE — an expired mandate feeds nothing (mirrors the SQL expiry clause)')
check(/audience = 'artist_private'/.test(inputsFn) || /audience = 'rep_summary'/.test(inputsFn) || /audience/.test(inputsFn),
  'getRadarInputs takes an explicit audience — a caller must say who is reading')
check(/repOnly/.test(inputsFn) && /draw_signals/.test(inputsFn),
  'rep audience narrows the fetch itself (no draw_signals — R7 staleness is coaching)')
check(/passport-ok/.test(inputsFn), 'rep audience fetches passport-approved claims only')
// APPSEC F2 · the demand read itself
check(/ownsDemandContext/.test(inputsFn),
  'NEGATIVE CASE — the demand read asks WHO OWNS THIS DEMAND before it asks for a single field')
check(/demandQ\.eq\('organization_id', orgId\)/.test(inputsFn),
  'NEGATIVE CASE — wrong org: a non-owning org fetches ONLY requests belonging to itself')
check(/organization_id\.eq\.\$\{orgId\},organization_id\.is\.null/.test(inputsFn),
  'the owning org gets its own requests plus the unattributed ones (organization_id IS NULL = the artist\'s own context)')
check(/ownsDemandContext \? 'id, event_type, location, status' : 'status'/.test(inputsFn),
  'NEGATIVE CASE — event_type / location / id are not even FETCHED for a non-owning org')
check(/demandDetail: ownsDemandContext/.test(inputsFn),
  'the record declares its demand authority to computeRadarSignals() — absent means redacted')
check(/NOT enforcement|not enforcement/i.test(ORGS_JS), 'the client narrowing is documented as honesty, not as a boundary')
// Runtime negative: the mandate-expiry rule the read path leans on.
const mandate = await import(pathToFileURL(resolve('src/lib/mandateExpiry.js')).href)
check(mandate.isMandateLive({ status: 'active', expires_at: iso(now + 30 * day) }, new Date(now)) === true, 'live mandate → authority holds')
check(mandate.isMandateLive({ status: 'active', expires_at: iso(now - day) }, new Date(now)) === false, 'NEGATIVE CASE — stale mandate → no authority')
check(mandate.isMandateLive({ status: 'revoked', expires_at: null }, new Date(now)) === false, 'NEGATIVE CASE — revoked mandate → no authority')
check(mandate.isMandateLive({ status: 'pending', expires_at: null }, new Date(now)) === false, 'NEGATIVE CASE — unconsented (pending) mandate → no authority')

// ── S9 · the flag exists, defaults OFF, and is actually wired ───────────────
console.log('\n[S9] RADAR_AUDIENCE_SPLIT_ENABLED — present, default OFF, wired')
check(/export const RADAR_AUDIENCE_SPLIT_ENABLED = import\.meta\.env\?\.VITE_RADAR_AUDIENCE_SPLIT === '1'/.test(CONSTANTS_JS),
  "flag is opt-in ( === '1' ) — absent env means OFF, so behavior is unchanged until the owner enables it")
check(/RADAR_AUDIENCE_SPLIT_ENABLED/.test(FEED_JSX), 'RadarFeed.jsx reads the flag')
check(/projectRadarForRep/.test(FEED_JSX), 'RadarFeed.jsx applies the projection when the flag is on')
check(/getRadarInputs\(activeOrgId, \{ audience:/.test(FEED_JSX), 'RadarFeed.jsx declares its audience to the read path')
check(/computeRadarSignals\(inputs\)/.test(FEED_JSX) && /RADAR_AUDIENCE_SPLIT_ENABLED \? projectRadarForRep/.test(FEED_JSX),
  'flag OFF keeps the exact pre-existing behavior (no silent change on deploy)')
check(/RadarFeed/.test(read('src/App.jsx')) && /agency\/radar/.test(read('src/App.jsx')),
  'the /agency/radar screen still exists and is still routed — the fix hides content, it does not delete a screen')

// ── KNOWN REMAINING (informational — printed, not failed) ───────────────────
// ════════════════════════════════════════════════════════════════════════════
// APPSEC F2 · TWO-ORGANIZATION ISOLATION — EXECUTED against real PostgreSQL
// ════════════════════════════════════════════════════════════════════════════
// The fixture (scripts/sql/appsec-fixture.sql) is the shape that makes the
// question real: ORG_A and ORG_B BOTH hold a live artist_access grant on the
// SAME artist, and there are three open requests — one belonging to A, one to
// B, one unattributed (organization_id IS NULL = the artist's own context).
if (!pgAvailable()) {
  console.log('\n⚠ EXECUTION SKIPPED — no local PostgreSQL. X1..X8 below are UNPROVEN in this run.')
} else {
  console.log('\n[X] EXECUTED LOCALLY — two organizations, real RLS, real definer functions')
  const db = ScratchDb.create('b4_matrix')
  try {
    db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
    const ORG_OWN = '00000000-0000-0000-0000-0000000000b1'
    const ORG_A = '00000000-0000-0000-0000-0000000000b2'
    const ORG_B = '00000000-0000-0000-0000-0000000000b3'
    const U_A = '00000000-0000-0000-0000-0000000000a2'
    const U_B = '00000000-0000-0000-0000-0000000000a3'
    const ART = '00000000-0000-0000-0000-0000000000c1'
    const REQ_A = '00000000-0000-0000-0000-0000000000f1'
    const REQ_B = '00000000-0000-0000-0000-0000000000f2'
    const REQ_OWN = '00000000-0000-0000-0000-0000000000f3'
    const asA = { role: 'authenticated', uid: U_A }
    const asB = { role: 'authenticated', uid: U_B }

    // X1 · the fixture really is a two-organization fixture
    {
      const rows = db.rows(`select id, coalesce(organization_id::text,'(null)'), event_type
                              from public.availability_requests order by id`)
      check(rows.length === 3 && rows.some((r) => r[1] === ORG_A) && rows.some((r) => r[1] === ORG_B)
            && rows.some((r) => r[1] === '(null)'),
        `X1  fixture: three open requests — one for ORG_A, one for ORG_B, one unattributed (executed)`)
    }

    // X4 · NEGATIVE CONTROL — the unscoped join migration 010 ships really does
    // hand ORG_A the other organization's request. Without this, a green X2
    // could just mean the fixture never had anything to leak.
    {
      const leaked = db.rows(`
        select r.id, r.event_type, r.location
          from public.artist_access aa
          join public.artists a on a.id = aa.artist_id
          join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
         where aa.organization_id = '${ORG_A}' and aa.status = 'active'`)
      check(leaked.some((r) => r[0] === REQ_B),
        `X4  CONTROL — 010's unscoped demand join returns ORG_B's request (${leaked.length} rows incl. ${REQ_B}) to ORG_A. The leak is real and the fixture exhibits it. (executed)`)
      check(leaked.some((r) => r[1] === 'festival-b' && r[2] === 'Haifa'),
        'X4  CONTROL — and it carries the other organization\'s event_type and location (executed)')
    }

    // X2 · the repaired materialisation (042 §5, additive half — already run by
    // the 010 feed triggers when the fixture inserted its rows)
    {
      const rows = db.rows(`select organization_id, rule_id, coalesce(demand_request_id::text,'(null)'), audience
                              from public.radar_signal order by organization_id, rule_id`)
      const aRows = rows.filter((r) => r[0] === ORG_A)
      const bRows = rows.filter((r) => r[0] === ORG_B)
      check(aRows.length > 0 && bRows.length > 0, `X2  both organizations materialised rows (${rows.length} total, executed)`)
      check(aRows.every((r) => r[2] !== REQ_B && r[2] !== REQ_OWN),
        'X2  ORG_A\'s rows never cite ORG_B\'s request, nor the artist\'s unattributed one (executed)')
      check(bRows.every((r) => r[2] !== REQ_A && r[2] !== REQ_OWN),
        'X2  ORG_B\'s rows never cite ORG_A\'s request either — symmetric (executed)')
      check(aRows.some((r) => r[2] === REQ_A),
        'X2  ORG_A does still see ITS OWN inbound demand — the repair scopes, it does not blind (executed)')
    }

    // X3 · what a representative can actually READ, with RLS on, as themselves
    {
      const visibleToA = db.rows(`select rs.id, coalesce(rs.demand_request_id::text,'(null)')
                                    from public.radar_signal rs`, asA)
      check(visibleToA.every((r) => r[1] !== REQ_B),
        'X3  with RLS on, no row ORG_A can READ points at ORG_B\'s request (executed)')
      const fields = db.rows(`select r.event_type, r.location, r.id::text
                                from public.radar_signal rs
                                join public.availability_requests r on r.id = rs.demand_request_id`, asA)
      check(fields.every((f) => f[0] !== 'festival-b' && f[1] !== 'Haifa' && f[2] !== REQ_B),
        'X3  and dereferencing every pointer it CAN read never yields ORG_B\'s event_type, location or id (executed)')
      const fieldsB = db.rows(`select r.event_type, r.location, r.id::text
                                 from public.radar_signal rs
                                 join public.availability_requests r on r.id = rs.demand_request_id`, asB)
      check(fieldsB.every((f) => f[0] !== 'club-a' && f[1] !== 'Tel Aviv' && f[2] !== REQ_A),
        'X3  the same holds in the other direction for ORG_B (executed)')
    }

    // X5 · the CHECK is structural: a rep_summary row may not carry a demand
    // pointer at all, whoever writes it, even the table owner.
    {
      const r = db.try(`insert into public.radar_signal
        (organization_id, artist_id, rule_id, status, action_type, method_label,
         audience, purpose, projection_id, demand_request_id)
        values ('${ORG_A}','${ART}','R2','strong','respond','evidence-supported',
                'rep_summary','availability-response','00000000-0000-0000-0000-0000000000d2','${REQ_A}')`)
      check(!r.ok && /radar_signal_rep_demand_check/.test(r.out),
        'X5  a rep_summary row carrying ANY demand pointer is refused by the table CHECK (executed)')
    }

    // X6 · THE TIGHTENING, executed. Private rows leave the representative's
    // reach entirely; the projection is empty until a purpose is authorized.
    {
      db.exec('select public.apply_radar_audience_split();')
      db.exec(`select public.recompute_radar_private_for_artist('${ART}');
               select public.generate_radar_rep_projection('${ART}');`)
      const privToA = db.rows("select id from public.radar_signal where audience = 'artist_private'", asA)
      check(privToA.length === 0,
        'X6  after the split, a grant-holding organization can read ZERO artist_private rows (executed)')
      const privToOwner = Number(db.scalar(`select count(*)::int from public.radar_signal
                                             where audience = 'artist_private' and organization_id = '${ORG_OWN}'`))
      check(privToOwner > 0,
        `X6  the artist's OWN organization has them instead (${privToOwner} rows) — the interpretation is not destroyed, it is re-homed (executed)`)
      const repRows = Number(db.scalar("select count(*)::int from public.radar_signal where audience = 'rep_summary'"))
      check(repRows === 0,
        'X6  and the rep projection is EMPTY, because no purpose is enabled — the honest default (executed)')
    }

    // X7 · authorize the purpose and the projection appears — still with no
    // demand pointer, and still scoped to each organization's own demand.
    {
      db.exec(`update public.radar_projection_purpose set enabled = true where purpose = 'availability-response';
               select public.generate_radar_rep_projection('${ART}');`)
      const rep = db.rows(`select organization_id, rule_id, coalesce(demand_request_id::text,'(null)')
                             from public.radar_signal where audience = 'rep_summary' order by 1`)
      check(rep.length > 0, `X7  with the purpose enabled, ${rep.length} rep_summary row(s) are generated (executed)`)
      check(rep.every((r) => r[2] === '(null)'),
        'X7  and NOT ONE of them carries a demand pointer — the projection is a binary, not a request (executed)')
      const aSees = db.rows("select organization_id from public.radar_signal where audience = 'rep_summary'", asA)
      check(aSees.every((r) => r[0] === ORG_A),
        'X7  ORG_A reads only its own projection rows, never ORG_B\'s (executed)')
      const bSees = db.rows("select organization_id from public.radar_signal where audience = 'rep_summary'", asB)
      check(bSees.every((r) => r[0] === ORG_B), 'X7  and ORG_B only its own (executed)')
      // A revoked mandate must stop projecting immediately.
      db.exec(`update public.artist_access set status = 'revoked' where organization_id = '${ORG_A}';
               select public.generate_radar_rep_projection('${ART}');`)
      const afterRevoke = db.rows("select organization_id from public.radar_signal where audience = 'rep_summary'", asA)
      check(afterRevoke.length === 0,
        'X7  NEGATIVE CASE — a revoked mandate reads nothing back through the projection (executed)')
      db.exec(`update public.artist_access set status = 'active' where organization_id = '${ORG_A}';`)
    }

    // X8 · reversible, and the revert really does restore 010's read model
    {
      db.exec('select public.revert_radar_audience_split();')
      const policies = db.rows("select policyname from pg_policies where tablename = 'radar_signal' order by 1")
        .map((r) => r[0])
      check(policies.includes('radar_org'),
        'X8  revert_radar_audience_split() restores 010\'s radar_org policy (executed)')
      check(!policies.includes('radar_rep_summary_read') && !policies.includes('radar_artist_private_read'),
        'X8  and removes the split policies — the tightening is genuinely reversible (executed)')
      check(Number(db.scalar("select count(*)::int from public.radar_signal where audience = 'rep_summary'")) === 0,
        'X8  the revert takes the projections with it (executed)')
    }
  } finally {
    db.drop()
  }
}

console.log('\n[i] known remaining rep-side private-derived surfaces (NOT closed by this lane)')
const AGENCY_ORBIT = read('src/features/agency/AgencyRadarUniverse.jsx')
if (/deriveRosterHealth/.test(AGENCY_ORBIT)) {
  console.log('  ! src/features/agency/AgencyRadarUniverse.jsx renders deriveRosterHealth() state on the rep')
  console.log("    cockpit, whose vocabulary includes 'missing' plus a ✦ count of claims still waiting for")
  console.log('    the ARTIST\'s own approval. That is workflow/gap information about the artist derived')
  console.log('    from private state. It is NOT changed here: it consumes src/lib/rosterHealth.js, which')
  console.log('    T-100 locked as the one-truth roster rule (scripts/test-one-truth.mjs), so re-audiencing')
  console.log('    it is a separate owner-scoped decision, not a same-lane edit. Reported, not fixed.')
}
// NOTE: `audience` is also a PLANET KEY in radarUniverse.js, so a grep for the
// word proves nothing there — this row is asserted by consumer, not by keyword.
{
  const universeConsumers = /deriveWorlds/.test(AGENCY_ORBIT) && !/buildUniverse/.test(AGENCY_ORBIT)
  console.log('  ! src/lib/radarUniverse.js (buildUniverse/deriveWorlds) has no audience concept of its own.')
  console.log(`    Rep-side consumption today: deriveWorlds() only (genre coverage, no gap text) — ${universeConsumers ? 'CONFIRMED' : 'CHANGED, re-audit'}.`)
  console.log('    If any rep surface ever calls buildUniverse() (which carries node states incl. MISSING),')
  console.log('    this gate must grow a row for it.')
  if (!universeConsumers) fail('rep orbit now consumes buildUniverse() — private node states may be crossing; re-audit this lane')
}

console.log('\n── projection-matrix summary ──')
console.log('  STATIC, proven here: S1 migration pair + reversibility · S2 SQL content law · S3 split RLS')
console.log('    against existing 027/008 helpers · S4 ownership-keyed private policy · S5 nothing enabled')
console.log('    by default · S6 SQL↔JS allowlist agreement · S7 object × persona matrix over fixtures ·')
console.log('    S8 negative cases in the client read path + mandate rule · S9 flag default OFF + wiring')
console.log('  EXECUTED LOCALLY (PostgreSQL 16, two organizations, real RLS, real definer functions):')
console.log('    X1 fixture shape · X4 a NEGATIVE CONTROL proving 010\'s unscoped join really does hand ORG_A')
console.log('    ORG_B\'s request + its event_type + its location · X2/X3 the repaired materialisation and what')
console.log('    each representative can actually READ · X5 the demand-pointer CHECK · X6 the tightening ·')
console.log('    X7 an authorized purpose projects a binary with no demand pointer, a revoked mandate projects')
console.log('    nothing · X8 the revert restores 010\'s read model.')
console.log('  STILL RUNTIME-UNVERIFIED ON SUPABASE: that 042 applies to the REAL data (drafted, NOT applied);')
console.log('    PostgREST behaviour with real JWTs; that no other deployed reader reaches radar_signal.')
if (failed) {
  console.error('\nprojection-matrix FAILED')
  process.exit(1)
}
console.log('\nAll projection-matrix checks passed.')
process.exit(0)
