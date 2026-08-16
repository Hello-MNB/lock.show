// ============================================================
// TENANT · MANDATE · ACT ISOLATION GATE — scripts/test-tenant-isolation.mjs
//
// WHY THIS GATE EXISTS
//   The APPSEC wave (T-105) proved privileges, receipts, concurrency and
//   version invariants by EXECUTING them. It left three residuals named but
//   unproven, and it never touched the boundary CLAUDE.md states most plainly:
//
//     "MULTI-ACT: one artist (Person) may hold several Acts … Evidence is
//      per-Act and NON-transferable — a new Act starts empty."
//
//   That sentence is a security claim, not a product note. This gate executes
//   it against a real PostgreSQL 16 carrying migrations 001–042, and executes
//   the three residuals with a CANDIDATE repair for each, so the question
//   "can it be narrowed without breaking the shipped app?" stops being answered
//   from memory.
//
// WHAT IS PROVEN HERE, AND HOW
//   STATIC — the buyer-facing Passport reads are act-scoped in the code.
//   EXECUTED LOCALLY (real roles, real RLS, real column ACLs):
//     A · MULTI-ACT      the Act boundary, end to end
//     B · DEAD MANDATES  no-grant / expired / revoked organizations
//     C · RESIDUAL (a)+(b) availability_requests cross-organization read+write
//     D · RESIDUAL (c)   share_link.open_count bypassing the sanctioned view
//   Every C and D section runs TWICE: once against the shipped schema to
//   REPRODUCE the defect, once with scripts/sql/candidate-*.sql applied to
//   prove the repair closes it AND that the shipped read paths keep every row.
//
// STILL RUNTIME-UNVERIFIED ON SUPABASE (say it in every report):
//   · PostgREST — schema exposure, ?select= column filtering, role switching
//   · GoTrue — real JWT verification (auth.uid() is a GUC here)
//   · the production data; 041/042 are DRAFTED and deliberately NOT APPLIED
//   · the candidate files in scripts/sql/ are PROPOSALS. They are applied to a
//     throwaway database by this gate and nowhere else. Promoting one is the
//     owner's act and needs the ruling each file names.
//
// A SKIPPED RUN IS NOT A PASS. With no local PostgreSQL this gate prints a
// loud skip and everything below the STATIC section is UNPROVEN.
//
// Run: npm run test:tenant-isolation      (wired into `npm run verify`)
// ============================================================
import { readFileSync, existsSync } from 'node:fs'
import { pgAvailable, ScratchDb } from './lib/pgharness.mjs'

let failed = false
let checks = 0
const fail = (m) => { checks++; console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => { checks++; console.log(`  · ${m}`) }
const check = (cond, good, bad) => (cond ? ok(good) : fail(bad || good))

// Fixture identities — literals, so a failing assertion names something greppable.
const U = {
  OWNER: '00000000-0000-0000-0000-0000000000a1',
  REP_A: '00000000-0000-0000-0000-0000000000a2',
  REP_B: '00000000-0000-0000-0000-0000000000a3',
  STRANGER: '00000000-0000-0000-0000-0000000000a4',
  EXPIRED: '00000000-0000-0000-0000-0000000000a5',
  REVOKED: '00000000-0000-0000-0000-0000000000a6',
}
const ORG_A = '00000000-0000-0000-0000-0000000000b2'
const ORG_B = '00000000-0000-0000-0000-0000000000b3'
const ARTIST = '00000000-0000-0000-0000-0000000000c1'
const ACT_B = '00000000-0000-0000-0000-0000000000cb'
const REQ_A = '00000000-0000-0000-0000-0000000000f1'
const REQ_B = '00000000-0000-0000-0000-0000000000f2'
const REQ_OWN = '00000000-0000-0000-0000-0000000000f3'

// The eleven tables migration 020 threaded act_id through.
const ACT_TABLES = [
  'claims', 'evidence_artifacts', 'profile_items', 'gigs', 'passport_versions',
  'availability_requests', 'producer_confirmations', 'professional_reaction',
  'draw_signals', 'radar_signal', 'entitlements',
]

// ============================================================
// STATIC — the buyer-facing Passport reads must be Act-scoped
// ============================================================
// A second Act's evidence hangs off the FIRST Act's `artists` row (the schema
// forces it — see A3), so every buyer-facing read that scopes by artist_id
// alone merges two Acts into one Passport. Reproduced below in A7. These are
// the four reads that reach a buyer.
console.log('\nSTATIC — buyer-facing Passport reads are Act-scoped')
{
  const server = readFileSync('server/index.js', 'utf8')
  const dbjs = readFileSync('src/lib/db.js', 'utf8')
  /** Slice a named region out of a source file so an anchor cannot drift onto another query. */
  const region = (text, start, end) => {
    const i = text.indexOf(start)
    if (i < 0) return null
    const j = end ? text.indexOf(end, i) : -1
    return text.slice(i, j > i ? j : i + 1600)
  }
  const SITES = [
    ['server/index.js  buildSafePayload → profile_items',
      region(server, 'async function buildSafePayload', "from('claims')")],
    ['server/index.js  buildSafePayload → claims',
      region(server, '  const { data: claims, error: cErr } = await scopeToAct(', '  const now = Date.now()')],
    ['server/index.js  GET /api/passport/:artistId (newest snapshot)',
      region(server, "app.get('/api/passport/:artistId'", 'Fallback:')],
    ['src/lib/db.js    buildPassportSnapshot (the published snapshot)',
      region(dbjs, 'async function buildPassportSnapshot', 'export async function publishPassport')],
  ]
  // The two server reads now share one scoping helper, so `act_id` need not appear
  // literally in each region — but a region that names NEITHER is unscoped. The
  // helper itself is asserted separately below, so routing through it cannot
  // become a way to pass this check while scoping nothing.
  for (const [label, text] of SITES) {
    check(text !== null && /act_id|scopeToAct\(/.test(text),
      `${label} — Act-scoped`,
      text === null ? `${label} — anchor not found; this gate no longer reads the shipped code`
        : `⚠ ${label} scopes by artist_id ONLY — a second Act's evidence enters this Act's public Passport`)
  }
  // The shared helper must carry BOTH branches: NULL-tolerant for the default Act
  // (legacy rows predate the act_id backfill) and STRICT for a non-default Act,
  // where a NULL act_id row belongs to the DEFAULT Act and tolerating it would
  // import that Act's evidence — the transfer canon forbids.
  const helper = region(server, '  const scopeToAct = (q) =>', '  const { data: items')
  check(helper !== null && /isDefaultAct/.test(helper) && /act_id\.is\.null/.test(helper) && /q\.eq\('act_id', actId\)/.test(helper),
    'server/index.js  scopeToAct carries the default-tolerant AND non-default-strict branches',
    'scopeToAct is missing, or no longer distinguishes the default Act from a non-default one')

  // HONEST GAP, asserted so it cannot be quietly forgotten: the ANON half of
  // getPublicPassport() cannot be Act-scoped in the client, because 016/025
  // never granted anon claims.act_id / profile_items.act_id. Executed proof in A6.
  check(/016\/025 never granted anon/.test(dbjs),
    'src/lib/db.js records WHY the anon read cannot be Act-scoped client-side (it needs a migration — owner decision)',
    'src/lib/db.js no longer records the anon Act-scope gap; a reader would think the fix is complete')

  for (const f of ['scripts/sql/candidate-req-org-scope.sql', 'scripts/sql/candidate-share-link-columns.sql']) {
    check(existsSync(f) && /NOT A MIGRATION, NOT APPLIED/.test(readFileSync(f, 'utf8')),
      `${f} exists and declares itself NOT APPLIED`,
      `${f} is missing or no longer declares that it is a proposal`)
  }
  check(!existsSync('supabase/migrations/candidate-req-org-scope.sql') &&
        !existsSync('supabase/migrations/candidate-share-link-columns.sql'),
    'the candidates live in scripts/sql and have NOT been promoted into supabase/migrations',
    '⚠ a candidate was copied into supabase/migrations — promotion is the owner\'s act, not a side effect')
}

// ============================================================
// EXECUTED
// ============================================================
if (!pgAvailable()) {
  console.log('\n⚠⚠ EXECUTION SKIPPED — no local PostgreSQL on this machine. ⚠⚠')
  console.log('  Sections A (multi-Act), B (dead mandates), C (residual a+b) and')
  console.log('  D (residual c) did NOT RUN. Nothing about tenant, mandate or Act')
  console.log('  isolation was proven by this run. A SKIP IS NOT A PASS — start a')
  console.log('  local PostgreSQL 16 and re-run before trusting any green above.')
  process.exit(failed ? 1 : 0)
}

const db = ScratchDb.create('b4_tenant')
try {
  db.exec(readFileSync('scripts/sql/appsec-fixture.sql', 'utf8'))
  db.exec(readFileSync('scripts/sql/multiact-fixture.sql', 'utf8'))
  ok(`scratch database ${db.name} · migrations applied (expected historical failure: ${db.appliedFailures.map((f) => f.file).join(', ') || 'none'})`)

  const asUser = (uid) => ({ role: 'authenticated', uid })
  const n = (sql, opts) => Number(db.scalar(sql, opts))
  /** Count rows, but report a privilege denial as its own outcome rather than throwing. */
  const nOrDenied = (sql, opts) => {
    const r = db.try(sql, opts)
    if (!r.ok) return { denied: true, msg: (r.out.match(/ERROR:\s*(.*)/) || [, ''])[1] }
    const v = r.out.split('\n').map((s) => s.trim()).filter((s) => /^\d+$/.test(s)).pop()
    return { denied: false, n: Number(v) }
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nA · MULTI-ACT — one Person, two Acts (EXECUTED)')
  // ──────────────────────────────────────────────────────────────────────────

  // A1 · the SHIPPED createAct() path, run exactly as src/lib/db.js:146 runs it.
  {
    const r = db.try(
      `insert into public.act (person_id, stage_name, genre, is_default)
       values ('${U.OWNER}', 'Third Act', 'psytrance', false)`, asUser(U.OWNER))
    check(!r.ok && /row-level security/i.test(r.out),
      'A1 the shipped createAct() insert is REFUSED by RLS — policy act_org (020:187) gates on can_access_artist(act.id), which resolves through public.artists, and a non-default Act has no artists row. Multi-Act is fail-closed AND feature-dead (executed)',
      `A1 ⚠ the second-Act insert was ALLOWED — this gate's model of act_org is stale: ${r.out.split('\n')[0]}`)
  }

  // A2 · and the owner cannot read the Act even when one exists.
  check(n(`select count(*) from public.act where id = '${ACT_B}'`, asUser(U.OWNER)) === 0,
    'A2 the Person who HOLDS the second Act cannot SELECT it either — same predicate, same dead end (executed)',
    'A2 ⚠ the owner could read ACT_B; act_org is not what this gate believes')
  check(n(`select count(*) from public.act where id = '${ARTIST}'`, asUser(U.OWNER)) === 1,
    'A2 CONTROL — the DEFAULT Act (act.id = artists.id) IS readable, so A2 is not a blanket denial (executed)')

  // A3 · WHY act_id can never be an authorization boundary today.
  {
    const rows = db.rows(`
      select c.table_name,
             max(case when c.column_name='artist_id' then c.is_nullable end) as artist_nullable,
             max(case when c.column_name='act_id'    then c.is_nullable end) as act_nullable
        from information_schema.columns c
       where c.table_schema='public' and c.table_name in (${ACT_TABLES.map((t) => `'${t}'`).join(',')})
         and c.column_name in ('artist_id','act_id')
       group by 1 order by 1`)
    const forced = rows.filter((r) => r[1] === 'NO' && r[2] === 'YES')
    check(forced.length >= 8,
      `A3 on ${forced.length}/${rows.length} act-threaded tables artist_id is NOT NULL (→ public.artists) while act_id is NULLABLE — a second Act's rows are STRUCTURALLY FORCED onto the first Act's artists row (executed)`,
      `A3 the artist_id/act_id nullability shape changed — only ${forced.length} tables force artist_id`)

    const actPolicies = db.rows(`
      select tablename, policyname from pg_policies
       where schemaname='public' and tablename in (${ACT_TABLES.map((t) => `'${t}'`).join(',')})
         and (coalesce(qual,'') like '%act_id%' or coalesce(with_check,'') like '%act_id%')`)
    check(actPolicies.length === 0,
      'A3 NOT ONE RLS policy on any of the eleven act-threaded tables references act_id — the Act is a display filter, never an authorization boundary (executed)',
      `A3 some policies DO reference act_id (${actPolicies.map((r) => r.join('.')).join(', ')}) — re-derive this gate's model`)
  }

  // A4 · the consequence: a mandate on the ARTIST silently covers every Act.
  {
    const reach = {}
    for (const t of ['claims', 'profile_items', 'evidence_artifacts', 'passport_versions', 'share_link', 'availability_requests']) {
      reach[t] = nOrDenied(`select count(*) from public.${t} where act_id = '${ACT_B}'`, asUser(U.REP_A))
    }
    const visible = Object.entries(reach).filter(([, v]) => !v.denied && v.n > 0).map(([k]) => k)
    check(visible.length >= 5,
      `A4 ⚠ REPRODUCED — an organization holding a grant on the ARTIST reads the SECOND Act's private universe with no ACT_B mandate and no ACT_B consent: ${visible.join(', ')} (executed)`,
      `A4 only ${visible.join(', ') || 'nothing'} was reachable — the leak model needs re-deriving, not celebrating`)
    check(!reach.claims.denied && reach.claims.n === 1,
      'A4 including the Act-B claim VALUE itself, not merely its existence (executed)')
  }

  // A5 · "an Act switch cannot carry stale authorization" — the honest form.
  {
    // switchAct() (src/lib/db.js:172) separates the two universes with ONE
    // client predicate: .eq('act_id', actId). Ask the database the same question
    // with and without that predicate, as the SAME authenticated owner.
    const withFilterA = n(`select count(*) from public.claims where artist_id='${ARTIST}' and act_id='${ARTIST}'`, asUser(U.OWNER))
    const withFilterB = n(`select count(*) from public.claims where artist_id='${ARTIST}' and act_id='${ACT_B}'`, asUser(U.OWNER))
    const withoutFilter = n(`select count(*) from public.claims where artist_id='${ARTIST}'`, asUser(U.OWNER))
    check(withFilterA >= 1 && withFilterB >= 1 && withoutFilter === withFilterA + withFilterB,
      `A5 an Act switch carries no STALE authorization because it carries no authorization AT ALL: drop the client's .eq('act_id', …) and both universes merge in one result set (${withFilterA} + ${withFilterB} = ${withoutFilter}). The entire multi-Act boundary is one client predicate; the database has no opinion (executed)`,
      `A5 the arithmetic did not hold (${withFilterA} + ${withFilterB} ≠ ${withoutFilter}) — re-derive`)
    // and the same for the org that merely holds a mandate on the artist
    const repSeesBoth = n(`select count(*) from public.claims where artist_id='${ARTIST}'`, asUser(U.REP_A))
    check(repSeesBoth === withoutFilter,
      `A5 a representing organization sees exactly the same merged set (${repSeesBoth}) — so an Act the artist never told them about is one dropped predicate away (executed)`,
      `A5 the rep's view (${repSeesBoth}) differs from the owner's (${withoutFilter})`)
  }

  // A6 · a new Act inherits the OLD Act's publish decision.
  {
    const anonPv = nOrDenied(`select count(*) from public.passport_versions where act_id = '${ACT_B}'`, { role: 'anon' })
    check(!anonPv.denied && anonPv.n >= 1,
      'A6 ⚠ REPRODUCED — ANON reads the second Act\'s passport_versions: pv_public_read (001) gates on artist_is_published(artist_id), i.e. the FIRST Act\'s publish decision. A new Act is born public (executed)',
      'A6 anon could not read ACT_B passport_versions — good, and this gate is stale')
    const anonClaimValue = db.rows(`select value from public.claims where artist_id = '${ARTIST}'`, { role: 'anon' }).map((r) => r[0])
    check(anonClaimValue.some((v) => /ACT_B/.test(v)),
      `A6 ⚠ and the second Act's passport-ok CLAIM TEXT is anon-readable through claims_public_read for the same reason — anon sees: ${JSON.stringify(anonClaimValue)} (executed)`,
      'A6 the ACT_B claim was not anon-readable — re-derive claims_public_read')
    // and anon cannot be narrowed client-side, because it cannot even name act_id
    const anonActCol = db.try(`select id from public.claims where act_id is not null`, { role: 'anon' })
    check(!anonActCol.ok && /permission denied/i.test(anonActCol.out),
      'A6 anon CANNOT be Act-scoped in the client either — 016/025 never granted anon claims.act_id, so referencing it raises 42501. Closing A6 needs a MIGRATION (owner decision), not a query change (executed)',
      'A6 anon can reference claims.act_id — the client-side narrowing IS available after all')
  }

  // A7 · the buyer-facing merge, as the shipped server would serve it.
  {
    const newest = db.scalar(
      `select act_id::text from public.passport_versions where artist_id = '${ARTIST}'
        order by created_at desc, id desc limit 1`, { role: 'service_role' })
    check(newest === ACT_B,
      `A7 ⚠ REPRODUCED — the newest snapshot for this artist BELONGS TO ACT_B (${newest}); an artist_id-only read serves the second Act's Passport at the first Act's public URL (executed)`,
      `A7 the newest snapshot is ${newest}; the fixture ordering changed`)
    const merged = n(`select count(*) from public.claims
                       where artist_id = '${ARTIST}' and act_id = '${ACT_B}'
                         and visibility='passport-ok' and verification_status in ('verified','supporting') and artist_approved`,
      { role: 'service_role' })
    const scopedOut = n(`select count(*) from public.claims
                          where artist_id = '${ARTIST}' and (act_id = '${ARTIST}' or act_id is null)
                            and act_id = '${ACT_B}'`, { role: 'service_role' })
    check(merged >= 1 && scopedOut === 0,
      `A7 the STATIC fix above is the right shape: an artist_id-only payload carries ${merged} Act-B claim(s); adding "(act_id = artist_id OR act_id IS NULL)" carries ${scopedOut}, and is NULL-tolerant so no legacy row is dropped (executed)`,
      `A7 the act scope did not behave as modelled (merged=${merged}, scoped=${scopedOut})`)
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nB · DEAD MANDATES — no grant · expired · revoked (EXECUTED)')
  // ──────────────────────────────────────────────────────────────────────────
  {
    // Tables where the org gate is the ONLY gate (no public-read arm to muddy it).
    const PRIVATE = ['evidence_artifacts', 'share_link', 'availability_requests']
    for (const [label, uid] of [['a NO-GRANT organization', U.STRANGER], ['an EXPIRED mandate (T-103)', U.EXPIRED], ['a REVOKED mandate', U.REVOKED]]) {
      const seen = PRIVATE.map((t) => [t, nOrDenied(`select count(*) from public.${t} where artist_id = '${ARTIST}'`, asUser(uid))])
      const leaking = seen.filter(([, v]) => !v.denied && v.n > 0).map(([t]) => t)
      check(leaking.length === 0,
        `B ${label} reads ZERO rows of ${PRIVATE.join(' / ')} (executed)`,
        `B ⚠ ${label} still reads ${leaking.join(', ')}`)
    }
    // NEGATIVE CONTROL — without it the three checks above could pass because
    // the fixture is empty rather than because the boundary holds.
    const live = PRIVATE.map((t) => nOrDenied(`select count(*) from public.${t} where artist_id = '${ARTIST}'`, asUser(U.REP_A)))
    check(live.every((v) => !v.denied && v.n > 0),
      `B CONTROL — the LIVE mandate does read all three (${live.map((v) => v.n).join('/')}), so the three denials above are a boundary, not an empty fixture (executed)`,
      'B ⚠ the live mandate reads nothing either — every denial above is vacuous')
    // the artist's own private radar must not reach a representative
    check(n(`select count(*) from public.radar_signal where organization_id = '${ORG_B}'`, asUser(U.REP_A)) === 0,
      'B ORG_A cannot read ORG_B\'s radar rows — radar_org (010) is organization-scoped and holds (executed)')
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nC · RESIDUAL (a)+(b) — availability_requests across organizations (EXECUTED)')
  // ──────────────────────────────────────────────────────────────────────────
  // The shipped read paths, expressed as SQL exactly as the client issues them.
  const listRequestsForAgency = (uid) => db.rows(
    `select r.id from public.availability_requests r
       join public.artists a on a.id = r.artist_id
      where a.created_by = '${U.OWNER}' order by r.id`, asUser(uid)).map((r) => r[0])
  const rosterOpenCount = (uid) => n(
    `select count(*) from public.availability_requests
      where artist_id = any(array['${ARTIST}']::uuid[]) and status = 'new'`, asUser(uid))
  const seenWithDetail = (uid) => db.rows(
    `select id, coalesce(event_type,''), coalesce(location,'') from public.availability_requests
      where artist_id = '${ARTIST}' order by id`, asUser(uid))

  const ownerBefore = listRequestsForAgency(U.OWNER)
  {
    const a = seenWithDetail(U.REP_A)
    const sawOtherOrg = a.find((r) => r[0] === REQ_B)
    check(Boolean(sawOtherOrg) && sawOtherOrg[1] === 'festival-b' && sawOtherOrg[2] === 'Haifa',
      `C1 ⚠ REPRODUCED — ORG_A reads ORG_B's inbound request IN FULL: event_type="${sawOtherOrg?.[1]}" location="${sawOtherOrg?.[2]}". req_org_read (008:266) = can_access_artist(), and two agencies on one artist is the ordinary state (executed)`,
      'C1 ORG_A could not read ORG_B\'s request — the residual may already be fixed elsewhere')

    const w = db.try(`update public.availability_requests set status='closed' where id = '${REQ_B}'`, asUser(U.REP_A))
    const nowClosed = db.scalar(`select status from public.availability_requests where id = '${REQ_B}'`)
    check(w.ok && nowClosed === 'closed',
      'C2 ⚠ REPRODUCED AND NOT PREVIOUSLY REPORTED — the WRITE half leaks too: req_org_update (008:269) let ORG_A CLOSE ORG_B\'s request. A read leak is a privacy failure; this is an integrity failure (executed)',
      'C2 the cross-org UPDATE was refused — good, and this gate is stale')
    db.exec(`update public.availability_requests set status='new' where id = '${REQ_B}'`)

    check(rosterOpenCount(U.REP_A) > 1,
      `C3 ⚠ REPRODUCED — residual (b): the rosterNextAction.js:88 open-request count is ${rosterOpenCount(U.REP_A)} for ORG_A, i.e. it counts demand belonging to other organizations. The chip is text-only, but the rule it drives is fed by another tenant's data (executed)`,
      'C3 the roster count was already own-org only')
  }

  console.log('\n  ── candidate applied: scripts/sql/candidate-req-org-scope.sql ──')
  db.exec(readFileSync('scripts/sql/candidate-req-org-scope.sql', 'utf8'))
  {
    const a = seenWithDetail(U.REP_A).map((r) => r[0])
    const b = seenWithDetail(U.REP_B).map((r) => r[0])
    check(a.length === 1 && a[0] === REQ_A, `C4 ORG_A now sees ONLY its own request (${a.join(',')}) (executed)`,
      `C4 ⚠ ORG_A still sees ${a.join(',')}`)
    check(b.length === 1 && b[0] === REQ_B, `C4 ORG_B now sees ONLY its own request (${b.join(',')}) (executed)`,
      `C4 ⚠ ORG_B still sees ${b.join(',')}`)

    const owner = seenWithDetail(U.OWNER).map((r) => r[0])
    check(owner.includes(REQ_A) && owner.includes(REQ_B) && owner.includes(REQ_OWN),
      `C5 the ARTIST'S OWN organization still sees EVERY request for its artist — including the organization_id IS NULL rows the anonymous public-Passport path writes (${owner.length} rows) (executed)`,
      `C5 ⚠ the owning org lost rows: ${owner.join(',')}`)
    const ownerAfter = listRequestsForAgency(U.OWNER)
    check(JSON.stringify(ownerAfter) === JSON.stringify(ownerBefore),
      `C5 listRequestsForAgency() — the SHIPPED requests inbox — returns a BYTE-IDENTICAL row set before and after the narrowing (${ownerBefore.length} rows). The narrowing does not break the inbox (executed)`,
      `C5 ⚠ the shipped inbox changed: ${ownerBefore.length} → ${ownerAfter.length} rows`)

    const w = db.try(`update public.availability_requests set status='closed' where id = '${REQ_B}'`, asUser(U.REP_A))
    const still = db.scalar(`select status from public.availability_requests where id = '${REQ_B}'`)
    check(still === 'new',
      'C6 ORG_A can no longer close ORG_B\'s request — the UPDATE now matches zero rows (RLS filters rather than errors, which is the correct shape) (executed)',
      `C6 ⚠ ORG_A still closed it (${still}) — ok=${w.ok}`)

    check(rosterOpenCount(U.REP_A) === 1 && rosterOpenCount(U.REP_B) === 1,
      `C7 RESIDUAL (b) CLOSED BY THE SAME POLICY, WITH NO CLIENT CHANGE — rosterNextAction.js:88 now counts ${rosterOpenCount(U.REP_A)} for ORG_A and ${rosterOpenCount(U.REP_B)} for ORG_B: its own demand only. (b) was a symptom of (a), not an independent defect (executed)`,
      `C7 ⚠ the roster count is still cross-org (A=${rosterOpenCount(U.REP_A)} B=${rosterOpenCount(U.REP_B)})`)

    check(db.try(`insert into public.availability_requests (artist_id, requester_name) values ('${ARTIST}','walk-up buyer')`, { role: 'anon' }).ok,
      'C8 the anonymous public-Passport insert path is untouched — a buyer can still send a request (executed)',
      'C8 ⚠ the narrowing broke the anonymous request insert')
    check(db.try(`update public.availability_requests set status='replied' where id = '${REQ_OWN}'`, asUser(U.OWNER)).ok &&
          db.scalar(`select status from public.availability_requests where id = '${REQ_OWN}'`) === 'replied',
      'C8 the artist\'s own organization can still REPLY to its own-context request (executed)')
    check(db.try(`update public.availability_requests set status='replied' where id = '${REQ_A}'`, asUser(U.REP_A)).ok &&
          db.scalar(`select status from public.availability_requests where id = '${REQ_A}'`) === 'replied',
      'C8 a representing organization can still reply to demand addressed to ITS OWN mandate (executed)')
    check(nOrDenied(`select count(*) from public.availability_requests where artist_id='${ARTIST}'`, asUser(U.STRANGER)).n === 0,
      'C8 a no-grant organization still reads nothing (executed)')
  }

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nD · RESIDUAL (c) — share_link.open_count bypasses the sanctioned view (EXECUTED)')
  // ──────────────────────────────────────────────────────────────────────────
  {
    const ownerCount = nOrDenied(`select coalesce(max(open_count),0) from public.share_link where artist_id='${ARTIST}'`, asUser(U.OWNER))
    const repCount = nOrDenied(`select coalesce(max(open_count),0) from public.share_link where artist_id='${ARTIST}'`, asUser(U.REP_A))
    check(!ownerCount.denied && ownerCount.n > 0 && !repCount.denied && repCount.n > 0,
      `D1 ⚠ REPRODUCED — the artist's own organization reads share_link.open_count directly (${ownerCount.n}), and so does every grant-holding organization (${repCount.n}). 041 built share_link_delivery_v to keep counts away from the artist; a projection nobody is forced through is a suggestion (executed)`,
      'D1 open_count was already unreadable — this gate is stale')

    // The trap, recorded so nobody re-discovers it the expensive way.
    db.exec(`revoke select (open_count, opened_at) on public.share_link from anon, authenticated`)
    const afterNoop = nOrDenied(`select open_count from public.share_link where artist_id='${ARTIST}' limit 1`, asUser(U.OWNER))
    check(!afterNoop.denied,
      'D2 the OBVIOUS fix is a NO-OP and does not error: PostgreSQL cannot revoke a COLUMN privilege that is held at TABLE level, and Supabase grants SELECT on the whole table. A column-only revoke would have shipped as a silent non-fix (executed)',
      'D2 the column-only revoke worked — this database is not behaving like Supabase')
  }

  console.log('\n  ── candidate applied: scripts/sql/candidate-share-link-columns.sql ──')
  db.exec(readFileSync('scripts/sql/candidate-share-link-columns.sql', 'utf8'))
  {
    for (const [label, col] of [['open_count', 'open_count'], ['opened_at', 'opened_at'], ['token_hash (the link secret\'s digest)', 'token_hash'], ['select *', '*']]) {
      const r = db.try(`select ${col} from public.share_link where artist_id='${ARTIST}'`, asUser(U.OWNER))
      check(!r.ok && /permission denied/i.test(r.out),
        `D3 ${label} is now physically un-SELECTable by the artist's own organization (executed)`,
        `D3 ⚠ ${label} is still readable`)
    }
    check(db.try(`select open_count from public.share_link`, asUser(U.REP_A)).ok === false,
      'D3 and by every representing organization too (executed)')

    check(n(`select count(*) from public.share_link_delivery_v`, asUser(U.OWNER)) >= 1,
      'D4 the SANCTIONED projection share_link_delivery_v still resolves for the artist\'s organization — the door that stays open is the one 041 designed (executed)',
      'D4 ⚠ the candidate broke the sanctioned projection')
    check(n(`select count(*) from public.share_link_delivery_v`, asUser(U.STRANGER)) === 0,
      'D4 and it still returns NOTHING to a no-grant organization — security_invoker keeps share_link\'s RLS in force through the view (executed)',
      'D4 ⚠ a stranger reads links through the view')
    check(db.try(`select id, status, expiry, recipient_label from public.share_link`, asUser(U.OWNER)).ok,
      'D4 delivery columns are still readable directly — the revoke is a narrowing, not a blackout (executed)')

    check(db.try(`update public.share_link set status='revoked' where artist_id='${ARTIST}'`, asUser(U.OWNER)).ok,
      'D5 revoking a link still works — SELECT and UPDATE are separate privileges (executed)')
    check(db.try(`insert into public.share_link (passport_version_id, artist_id, tracking_disclosed)
                  values ('00000000-0000-0000-0000-00000000ffa1','${ARTIST}', true)`, asUser(U.OWNER)).ok,
      'D5 minting a link still works (executed)')
    check(db.try(`select open_count from public.share_link`, { role: 'service_role' }).ok,
      'D5 service_role — the server — is untouched; the server is where a count legitimately lives (executed)')
    const anonDoor = db.try(`select public.resolve_share_link(repeat('a',64))`, { role: 'anon' })
    check(anonDoor.ok && /not_found/.test(anonDoor.out),
      'D5 the anonymous recipient\'s door is still open: resolve_share_link() is SECURITY DEFINER and runs as the owner (executed)')
  }
} finally {
  db.drop()
}

console.log(failed
  ? `\n✗ TENANT · MANDATE · ACT ISOLATION: FAILED (${checks} checks)\n`
  : `\n✓ TENANT · MANDATE · ACT ISOLATION: ${checks} checks, all hold.
  EXECUTED LOCALLY — multi-Act: a second Act cannot be created OR read through RLS, act_id is referenced by
  ZERO policies on all eleven act-threaded tables, and a mandate on the ARTIST silently covers every Act ·
  dead mandates (none/expired/revoked) read nothing, with a live-mandate control proving that is a boundary ·
  residual (a) narrowed and proven: each organization sees only its own demand while the shipped inbox keeps a
  byte-identical row set · residual (b) closes with it, no client change · residual (c) closed by the 016/025
  column-firewall pattern, with the obvious column-only revoke shown to be a silent no-op.
  RUNTIME-UNVERIFIED: PostgREST exposure/column filtering, GoTrue JWTs, production data. 041/042 remain
  DRAFTED-NOT-APPLIED and the scripts/sql/candidate-*.sql files are PROPOSALS applied to a throwaway
  database by this gate and nowhere else.\n`)
process.exit(failed ? 1 : 0)
