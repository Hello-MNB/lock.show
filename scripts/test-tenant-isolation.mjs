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
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { pgAvailable, ScratchDb } from './lib/pgharness.mjs'

import { execSync as _execSync } from 'node:child_process'
const execSyncList = (cmd) => _execSync(cmd, { encoding: 'utf8' }).split('\n').filter(Boolean)

let failed = false
let checks = 0
const fail = (m) => { checks++; console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => { checks++; console.log(`  · ${m}`) }
const check = (cond, good, bad) => (cond ? ok(good) : fail(bad || `FAILED (no failure message supplied) — the assertion below did NOT hold: ${good}`))

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

  // DISCOVERED, not enumerated. The hand-written list silently excluded
  // candidate-act-public-scope.sql the moment it was added: independent QA
  // copied that file into supabase/migrations and the guard passed at exit 0
  // while still printing that the candidates are "applied nowhere else".
  // RECURSIVE, and matched on CONTENT rather than filename. Independent QA
  // defeated the previous version twice: a real promotion renames the file to
  // `NNN_*.sql` (the only shape pgharness applies), so a same-filename check
  // detects only the copy that has no effect and misses the one that does — and
  // it then PRINTED that the candidates were unpromoted while one was live.
  // Discovery was also shape-bound: `scripts/sql/proposals/candidate-hidden.sql`
  // and `scripts/sql/proposal-act-public-scope.sql` were never read at all.
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`])
  const candidates = walk('scripts/sql').filter((f) => /\/(candidate|proposal)[-_].*\.sql$/.test(f))
  check(candidates.length >= 3,
    `non-vacuity: ${candidates.length} candidate file(s) discovered under scripts/sql (recursively)`,
    `only ${candidates.length} candidate(s) found — the guard below would be near-empty`)
  for (const f of candidates) {
    check(/NOT A MIGRATION, NOT APPLIED/.test(readFileSync(f, 'utf8')),
      `${f} declares itself NOT APPLIED`,
      `${f} no longer declares that it is a proposal`)
  }

  // A candidate is "promoted" when its own POLICY STATEMENTS appear in
  // supabase/migrations under ANY filename — that is the thing with an effect.
  const squash = (x) => x.replace(/--[^\n]*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
  const migrationBlob = squash(walk('supabase/migrations').filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(f, 'utf8')).join('\n'))
  const stmtsOf = (src) => squash(src).split(';')
    .map((x) => x.trim()).filter((x) => x.startsWith('create policy'))
  let sigChecked = 0
  const promoted = []
  for (const f of candidates) {
    for (const stmt of stmtsOf(readFileSync(f, 'utf8'))) {
      sigChecked++
      if (migrationBlob.includes(stmt)) promoted.push(`${f} → ${stmt.slice(0, 60)}…`)
    }
  }
  check(sigChecked >= 3,
    `non-vacuity: ${sigChecked} candidate policy statement(s) searched against supabase/migrations`,
    `only ${sigChecked} statement(s) extracted — the promotion check would be near-empty`)
  check(promoted.length === 0,
    `all ${candidates.length} candidates live under scripts/sql — none of their ${sigChecked} policy statements appears in supabase/migrations, under any filename`,
    `⚠ PROMOTED: ${promoted.join(' | ')} — promotion is the owner's act, not a side effect`)
}

// ============================================================
// EXECUTED
// ============================================================
if (!pgAvailable()) {
  console.log('\n⚠⚠ EXECUTION SKIPPED — no local PostgreSQL on this machine. ⚠⚠')
  console.log('  Sections A (multi-Act), B (dead mandates), C (residual a+b) and')
  console.log('  D (residual c) did NOT RUN. Nothing about tenant, mandate or Act')
  console.log('  isolation was proven by this run. A SKIP IS NOT A PASS — start a')
  console.error('  local PostgreSQL 16 and re-run before trusting any green above.')
  // This gate PRINTED the rule and then exited 0 on the next line, which is the
  // most exact way a skip becomes a pass (QA-INDEP-05, H1).
  process.exit(1)
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

    // MODEL RE-DERIVED, NOT RELAXED — QA-INDEP-06, H1 follow-on. This assertion
    // used to read "NOT ONE policy references act_id", and 041 made that false by
    // adding `pv_act_in_artist_lineage(act_id, artist_id)` to pv_owner_insert. The
    // gate was right to refuse: a claim about act_id's role in authorization must
    // be re-derived when act_id enters a policy, not widened until it fits.
    //
    // The distinction the model actually rests on is READ versus WRITE. A `USING`
    // clause keyed on act_id would make the Act an authorization boundary — it
    // would decide who SEES a row, and every "the Act is a display filter" claim
    // downstream would be wrong. A `WITH CHECK` keyed on act_id decides only what
    // may be WRITTEN, and grants nothing: it is an integrity constraint expressed
    // as a policy. So the ratchet is now exact — one named exception, WITH CHECK
    // only — and any new act_id reference, or that one migrating into USING,
    // fails here and names itself.
    const ACT_ID_WRITE_CHECK = ['passport_versions.pv_owner_insert']
    const actUsing = db.rows(`
      select tablename, policyname from pg_policies
       where schemaname='public' and tablename in (${ACT_TABLES.map((t) => `'${t}'`).join(',')})
         and coalesce(qual,'') like '%act_id%'`)
    check(actUsing.length === 0,
      'A3 NOT ONE RLS policy on any of the eleven act-threaded tables decides READ access by act_id — the Act is a display filter, never an authorization boundary (executed)',
      `A3 act_id appears in the USING clause of ${actUsing.map((r) => r.join('.')).join(', ')} — the Act would now decide who SEES a row; re-derive this gate's model`)
    const actCheck = db.rows(`
      select tablename, policyname from pg_policies
       where schemaname='public' and tablename in (${ACT_TABLES.map((t) => `'${t}'`).join(',')})
         and coalesce(with_check,'') like '%act_id%'`).map((r) => r.join('.')).sort()
    check(JSON.stringify(actCheck) === JSON.stringify(ACT_ID_WRITE_CHECK),
      `A3 exactly one policy constrains WRITES by act_id — ${ACT_ID_WRITE_CHECK[0]}, which stops a stranger inserting a version into another artist's lineage — and it grants nothing (executed)`,
      `A3 the act_id write-check set is ${JSON.stringify(actCheck)}, expected ${JSON.stringify(ACT_ID_WRITE_CHECK)} — an act_id constraint was added or removed; re-derive this gate's model`)
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

  // A6.fix · the candidate, EXECUTED. Same convention as the C-section: apply a
  // proposal to the throwaway database and measure it, rather than argue it.
  {
    console.log('\n  ── candidate applied: scripts/sql/candidate-act-public-scope.sql ──')
    // The fixture's ONLY anon-visible claim is the LEAKING ACT_B one, so "the
    // public Passport still has claims" would be unsatisfiable and the
    // non-vacuity control would be theatre. Seed a genuine DEFAULT-Act
    // passport-ok claim so the control has something real to protect, and
    // remove it again at the end of the block so no later assertion inherits it.
    const DEFAULT_CLAIM = '00000000-0000-0000-0000-00000000ca01'
    db.exec(`insert into public.claims (id, artist_id, act_id, claim_type, value, verification_status, visibility, artist_approved, verified_by, verified_at)
             values ('${DEFAULT_CLAIM}', '${ARTIST}', '${ARTIST}', 'headline', 'DEFAULT ACT PUBLIC HEADLINE', 'verified', 'passport-ok', true, 'system', now())
             on conflict (id) do nothing`)
    // LEGACY ROW. The candidate's NULL-tolerance is a load-bearing claim — "a NULL
    // act_id row is a legacy default-Act row, never another Act's" — and it was
    // asserted in prose and untested: removing `or act_id is null` from all three
    // policies passed at exit 0. A pre-020 row is reproduced here. Note the
    // UPDATE: trg_actfill_claims (020:167) fills act_id on INSERT, so the NULL
    // has to be written afterwards, exactly as the backfill left nothing behind.
    // profile_items has ONE seeded row in the whole fixture — the ACT_B one — so
    // "anon no longer sees ACT_B items" passed on an EMPTY SET, and dropping
    // items_public_read entirely survived at exit 0. Seed a default-Act item so
    // the assertion protects something.
    const DEFAULT_ITEM = '00000000-0000-0000-0000-00000000ca03'
    db.exec(`insert into public.profile_items (id, artist_id, act_id, item_type, title, visibility)
             values ('${DEFAULT_ITEM}', '${ARTIST}', '${ARTIST}', 'link', 'DEFAULT ACT PUBLIC ITEM', 'passport-ok')
             on conflict (id) do nothing`)
    const LEGACY_CLAIM = '00000000-0000-0000-0000-00000000ca02'
    db.exec(`insert into public.claims (id, artist_id, claim_type, value, verification_status, visibility, artist_approved, verified_by, verified_at)
             values ('${LEGACY_CLAIM}', '${ARTIST}', 'headline', 'LEGACY NULL-ACT HEADLINE', 'verified', 'passport-ok', true, 'system', now())
             on conflict (id) do nothing`)
    db.exec(`update public.claims set act_id = null where id = '${LEGACY_CLAIM}'`)
    check(db.scalar(`select act_id from public.claims where id = '${LEGACY_CLAIM}'`) === null ||
          db.scalar(`select act_id is null from public.claims where id = '${LEGACY_CLAIM}'`) === 't',
      'A6.fix non-vacuity: the legacy fixture row really does carry act_id IS NULL (trg_actfill fills on INSERT, so it is nulled afterwards) (executed)',
      'A6.fix ⚠ the legacy row is not NULL — the NULL-tolerance control would be theatre')

    const anonPvBefore = nOrDenied(`select count(*) from public.passport_versions where act_id = '${ACT_B}'`, { role: 'anon' })
    const anonDefaultPvBefore = nOrDenied(`select count(*) from public.passport_versions where artist_id = '${ARTIST}' and (act_id = '${ARTIST}' or act_id is null)`, { role: 'service_role' })
    // QUAL DIFF — the assertion that would have caught the defect this block
    // shipped with. The candidate DROPS AND RECREATES the three most sensitive
    // anon-read policies, and the first version of this block only ever checked
    // the ACT dimension: independent QA replaced artist_is_published() with
    // `true`, and separately dropped `visibility` and `verification_status`,
    // and all three passed at exit 0 — which is exactly how a silent revert of
    // migration 031's `artist_approved` gate shipped green. Compare the
    // EFFECTIVE predicate before and after: the only permitted difference is
    // the act-scope conjunct.
    // WHOLE-SURFACE SNAPSHOT, not three predicates. The first version of this
    // block read `qual` for three NAMED policies and nothing else, and a second
    // independent review defeated it three separate ways, each an executed leak
    // shipping at `81 checks, all hold`:
    //   · `for select` → `for all` — pg_policies.cmd was never read, and the shim
    //     grants anon table-level insert/update/delete, so anon could DELETE
    //     published claims outright.
    //   · a candidate that ADDS `claims_backdoor` — permissive policies OR
    //     together, so a policy outside the closed list widens the read without
    //     touching the three inspected. Proven to expose an unpublished,
    //     unapproved, internal claim to anon.
    //   · `create or replace function public.artist_is_published … select true`
    //     — the predicate TEXT is unchanged, so a textual comparison sees
    //     nothing while the meaning inverts.
    // So: snapshot every policy on the three tables INCLUDING cmd, permissive,
    // roles and with_check, plus the definition of every public function, and
    // allow exactly one difference — the act conjunct in the three quals.
    const POLICY_SQL = `select tablename, policyname, cmd, permissive, roles::text,
                               coalesce(qual,''), coalesce(with_check,'')
                          from pg_policies
                         where schemaname='public'
                           and tablename in ('profile_items','claims','passport_versions')
                         order by tablename, policyname`
    const FN_SQL = `select p.proname, md5(pg_get_functiondef(p.oid))
                      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                     where n.nspname='public' and p.prokind='f'
                     order by p.proname, p.oid`
    const policiesBefore = db.rows(POLICY_SQL)
    const fnsBefore = db.rows(FN_SQL)

    db.exec(readFileSync('scripts/sql/candidate-act-public-scope.sql', 'utf8'))

    const policiesAfter = db.rows(POLICY_SQL)
    const fnsAfter = db.rows(FN_SQL)

    // Split a printed predicate into its top-level AND conjuncts. Set-based, so
    // reordering, re-parenthesisation and a leading (rather than trailing) act
    // conjunct are all tolerated — the earlier string-strip rejected every one
    // of those CORRECT forms, and a gate that fires on correct edits gets
    // loosened sooner or later.
    const conjuncts = (q) => {
      let t = String(q ?? '').trim()
      while (t.startsWith('(') && t.endsWith(')')) {
        let d = 0, wraps = true
        for (let k = 0; k < t.length; k++) {
          if (t[k] === '(') d++
          else if (t[k] === ')') { d--; if (d === 0 && k < t.length - 1) { wraps = false; break } }
        }
        if (!wraps) break
        t = t.slice(1, -1).trim()
      }
      const out = []; let d = 0, buf = ''
      for (let k = 0; k < t.length; k++) {
        const c = t[k]
        if (c === '(') d++
        if (c === ')') d--
        if (d === 0 && t.slice(k, k + 5) === ' AND ') { out.push(buf); buf = ''; k += 4; continue }
        buf += c
      }
      if (buf.trim()) out.push(buf)
      return out.map((x) => x.replace(/\s+/g, '').replace(/^\(+|\)+$/g, '')).filter(Boolean).sort()
    }
    const ACT = conjuncts('((act_id = artist_id) OR (act_id IS NULL))')[0]
    const TARGETS = new Set(['items_public_read', 'claims_public_read', 'pv_public_read'])

    check(policiesBefore.length >= 3 && fnsBefore.length >= 5,
      `A6.fix snapshot non-vacuity: ${policiesBefore.length} policies and ${fnsBefore.length} functions captured before the candidate (executed)`,
      `A6.fix ⚠ snapshot is near-empty (${policiesBefore.length} policies, ${fnsBefore.length} functions) — the comparison below would prove nothing`)

    check(policiesAfter.length === policiesBefore.length,
      `A6.fix the candidate ADDS and REMOVES no policy on the three public-read tables (${policiesBefore.length} before and after) (executed)`,
      `A6.fix ⚠ policy COUNT changed ${policiesBefore.length} → ${policiesAfter.length}. Permissive policies OR together, so an added one widens the read.\n        after: ${policiesAfter.map((r) => r[1]).join(', ')}`)

    check(JSON.stringify(fnsAfter) === JSON.stringify(fnsBefore),
      `A6.fix the candidate redefines NO function — all ${fnsBefore.length} public function bodies are byte-identical, so no predicate's MEANING changed behind unchanged text (executed)`,
      `A6.fix ⚠ a function was redefined: ${fnsBefore.filter((b, k) => JSON.stringify(b) !== JSON.stringify(fnsAfter[k])).map((b) => b[0]).join(', ') || '(list length changed)'}`)

    const byName = (rows) => new Map(rows.map((r) => [`${r[0]}.${r[1]}`, r]))
    const mBefore = byName(policiesBefore), mAfter = byName(policiesAfter)
    for (const [key, before] of mBefore) {
      const after = mAfter.get(key)
      if (!after) { check(false, '', `A6.fix ⚠ policy ${key} was DROPPED and not recreated`); continue }
      // cmd / permissive / roles / with_check must be untouched for EVERY policy.
      check(String(after[2]) === String(before[2]) && String(after[3]) === String(before[3]) &&
            String(after[4]) === String(before[4]) && String(after[6]) === String(before[6]),
        `A6.fix ${key}: command, permissive flag, roles and WITH CHECK are unchanged (executed)`,
        `A6.fix ⚠ ${key} CHANGED BEYOND ITS PREDICATE — cmd ${before[2]}→${after[2]}, permissive ${before[3]}→${after[3]}, roles ${before[4]}→${after[4]}, with_check ${JSON.stringify(before[6])}→${JSON.stringify(after[6])}. A \`for all\` recreation is an anon WRITE grant.`)

      const cb = conjuncts(before[5]), ca = conjuncts(after[5])
      const added = ca.filter((x) => !cb.includes(x))
      const removed = cb.filter((x) => !ca.includes(x))
      if (TARGETS.has(before[1])) {
        check(removed.length === 0 && added.length === 1 && added[0] === ACT,
          `A6.fix ${key}: predicate differs by EXACTLY the act conjunct — nothing added, dropped or altered (executed)`,
          `A6.fix ⚠ ${key} predicate changed beyond the act scope. added=${JSON.stringify(added)} removed=${JSON.stringify(removed)}`)
      } else {
        check(added.length === 0 && removed.length === 0,
          `A6.fix ${key}: untargeted policy, predicate untouched (executed)`,
          `A6.fix ⚠ ${key} is not a target of this candidate but its predicate changed. added=${JSON.stringify(added)} removed=${JSON.stringify(removed)}`)
      }
    }

    const anonPvAfter = nOrDenied(`select count(*) from public.passport_versions where act_id = '${ACT_B}'`, { role: 'anon' })
    check(anonPvBefore.n >= 1 && !anonPvAfter.denied && anonPvAfter.n === 0,
      `A6.fix ANON no longer reads the second Act's passport_versions (${anonPvBefore.n} → ${anonPvAfter.n}) (executed)`,
      `A6.fix ⚠ anon still reads ACT_B passport_versions (${anonPvBefore.n} → ${anonPvAfter.n})`)

    const anonClaimsAfter = db.rows(`select value from public.claims where artist_id = '${ARTIST}'`, { role: 'anon' }).map((r) => r[0])
    check(!anonClaimsAfter.some((v) => /ACT_B/.test(v)),
      `A6.fix ANON no longer reads the second Act's claim TEXT — anon now sees ${JSON.stringify(anonClaimsAfter)} (executed)`,
      `A6.fix ⚠ ACT_B claim text is still anon-readable: ${JSON.stringify(anonClaimsAfter)}`)

    // NON-VACUITY: the narrowing must not simply blank the public Passport.
    check(anonClaimsAfter.some((v) => /DEFAULT ACT PUBLIC HEADLINE/.test(v)),
      `A6.fix the DEFAULT Act's public Passport SURVIVES — anon still reads it (${JSON.stringify(anonClaimsAfter)}) (executed)`,
      `A6.fix ⚠ the narrowing emptied the public Passport — that is a break, not a fix (anon sees ${JSON.stringify(anonClaimsAfter)})`)
    const anonPvDefault = nOrDenied(`select count(*) from public.passport_versions where artist_id = '${ARTIST}'`, { role: 'anon' })
    check(!anonPvDefault.denied && anonPvDefault.n === anonDefaultPvBefore.n && anonPvDefault.n >= 1,
      `A6.fix the DEFAULT Act's snapshots are untouched — anon reads ${anonPvDefault.n}, exactly the ${anonDefaultPvBefore.n} default-Act rows that exist (executed)`,
      `A6.fix ⚠ default-Act snapshot count changed (${anonDefaultPvBefore.n} → ${anonPvDefault.n})`)

    // anon's readable COLUMN set must be unchanged — the candidate adds no grant.
    // Both tables, because db.js:565 names both. Independent QA showed a grant
    // added on profile_items.act_id survived when only claims was asserted.
    for (const tbl of ['claims', 'profile_items']) {
      const probe = db.try(`select id from public.${tbl} where act_id is not null`, { role: 'anon' })
      check(!probe.ok && /permission denied/i.test(probe.out),
        `A6.fix anon STILL cannot name ${tbl}.act_id — the fix is a policy predicate evaluated as the policy owner, not a new column grant (executed)`,
        `A6.fix ⚠ anon gained access to ${tbl}.act_id — the candidate widened the column surface`)
    }

    const anonItems = db.rows(`select title from public.profile_items where artist_id = '${ARTIST}'`, { role: 'anon' }).map((r) => r[0])
    check(!anonItems.some((t) => /ACT_B/.test(t)),
      `A6.fix ANON no longer reads the second Act's profile_items — anon sees ${JSON.stringify(anonItems)} (executed)`,
      `A6.fix ⚠ ACT_B items still anon-readable: ${JSON.stringify(anonItems)}`)
    check(anonItems.some((t) => /DEFAULT ACT PUBLIC ITEM/.test(t)),
      `A6.fix the DEFAULT Act's profile_items SURVIVE — anon still reads ${JSON.stringify(anonItems)} (so the item assertion above is not passing on an empty set) (executed)`,
      `A6.fix ⚠ the narrowing dropped the default Act's items — anon sees ${JSON.stringify(anonItems)}`)

    check(anonClaimsAfter.some((v) => /LEGACY NULL-ACT HEADLINE/.test(v)),
      `A6.fix NULL-TOLERANCE HOLDS — the pre-020 legacy row (act_id IS NULL) is still anon-readable, so the narrowing drops nothing that exists (executed)`,
      `A6.fix ⚠ the narrowing dropped the legacy NULL-act_id row — anon sees ${JSON.stringify(anonClaimsAfter)}`)

    // Restore: remove the seeded rows and prove they are gone, so nothing
    // downstream inherits state this block invented.
    db.exec(`delete from public.claims where id in ('${DEFAULT_CLAIM}', '${LEGACY_CLAIM}')`)
    db.exec(`delete from public.profile_items where id = '${DEFAULT_ITEM}'`)
    check(db.scalar(`select count(*) from public.claims where id in ('${DEFAULT_CLAIM}', '${LEGACY_CLAIM}')`) === '0' &&
          db.scalar(`select count(*) from public.profile_items where id = '${DEFAULT_ITEM}'`) === '0',
      'A6.fix all three seeded rows were removed — this block leaves no ROW residue (executed)',
      'A6.fix ⚠ a seeded row survived the block')
    // HONEST LIMIT: the three narrowed POLICIES are deliberately left in place
    // for the rest of the run — this block cannot restore the schema without
    // discarding what it just proved. Nothing downstream depends on them today
    // (A7 reads as service_role, B/C as authenticated, D through SECURITY
    // DEFINER), but that is a property of the current file, not a guarantee.
    // Independent QA raised it; recorded rather than silently relied upon.
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
      'C2 ⚠ REPRODUCED AND NOT PREVIOUSLY REPORTED — the WRITE half leaks too: req_org_update (008:268) let ORG_A CLOSE ORG_B\'s request. A read leak is a privacy failure; this is an integrity failure (executed)',
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

    // C6b · ISOLATE THE WRITE HALF FROM THE READ HALF.
    // C6 above passes even when req_org_update is left at can_access_artist:
    // its `where id = …` reads a column, so PostgreSQL applies the SELECT
    // policy too, the narrowed read hides the row, and the UPDATE matches zero
    // rows for the WRONG REASON. Mutation-proven — MC3 (narrow SELECT, leave
    // UPDATE leaky) SURVIVED C6 at exit 0. An UNQUALIFIED update references no
    // column, so only the UPDATE policy's USING can filter it: this is the
    // assertion that actually tests req_org_update.
    // NON-DESTRUCTIVE: the blind update also closes ORG_A's OWN rows, which are
    // still needed by C7's open-request count. Snapshot, probe, restore — the
    // first version of this check left C7 counting 0 and failed the gate.
    const statusBefore = db.rows(`select id, status from public.availability_requests order by id`)
    const blind = db.try(`update public.availability_requests set status='closed'`, asUser(U.REP_A))
    const bAfterBlind = db.scalar(`select status from public.availability_requests where id = '${REQ_B}'`)
    const aAfterBlind = db.scalar(`select status from public.availability_requests where id = '${REQ_A}'`)
    for (const [id, st] of statusBefore) {
      db.exec(`update public.availability_requests set status='${st}' where id = '${id}'`)
    }
    const restored = db.rows(`select id, status from public.availability_requests order by id`)
    check(JSON.stringify(restored) === JSON.stringify(statusBefore),
      `C6b probe restored every request status (${statusBefore.length} rows) — the blind update leaves no residue for C7/C8 (executed)`,
      `C6b ⚠ the probe corrupted state: ${JSON.stringify(restored)} vs ${JSON.stringify(statusBefore)}`)
    // POSITIVE CONTROL. Without these two, C6b certifies falsely: `db.try`
    // swallows every error, so ANY mutation that makes the probe abort leaves
    // ORG_B's row untouched and C6b green. Independent QA proved it — leaving
    // req_org_update's USING leaky and narrowing only WITH CHECK aborted the
    // statement, and C6b printed "req_org_update ITSELF refuses ORG_B's row"
    // while the leak was live. The probe must be shown to have RUN and to have
    // REACHED rows before its refusal means anything.
    check(blind.ok,
      'C6b positive control: the blind UPDATE actually executed (it is not passing because the statement aborted) (executed)',
      `C6b ⚠ the blind UPDATE did not run — C6b below would certify falsely. out=${blind.out}`)
    check(aAfterBlind === 'closed',
      `C6b positive control: the blind UPDATE DID reach rows — ORG_A's own request is now '${aAfterBlind}' (executed)`,
      `C6b ⚠ the blind UPDATE touched nothing (ORG_A's own row is '${aAfterBlind}') — a no-op cannot prove a refusal`)
    check(bAfterBlind !== 'closed',
      `C6b req_org_update ITSELF refuses ORG_B's row — proven with an UNQUALIFIED update, which reads no column and so cannot be filtered by the SELECT policy (ORG_B row still '${bAfterBlind}') (executed)`,
      `C6b ⚠ req_org_update is still can_access_artist — ORG_A blind-closed ORG_B's request (${bAfterBlind}). C6 alone cannot see this.`)

    // C6c · THE TAKEOVER VECTOR. Independent QA showed that an unqualified
    // update which ALSO reassigns organization_id lets ORG_A both steal and
    // close ORG_B's demand when the USING half is leaky — a strictly worse
    // outcome than C6's read leak, and one no assertion covered.
    const ownerBeforeTakeover = db.rows(`select id, organization_id::text, status from public.availability_requests order by id`)
    const takeover = db.try(
      `update public.availability_requests set status='closed', organization_id='${ORG_A}'`, asUser(U.REP_A))
    const bOrgAfter = db.rows(`select organization_id::text, status from public.availability_requests where id = '${REQ_B}'`)[0]
    // Positive control, matching C6b's. Without it C6c is correct only by
    // accident of ordering: db.try swallows errors, so an aborted probe would
    // leave ORG_B untouched and C6c green — the exact defect C6b had.
    check(takeover.ok,
      'C6c positive control: the takeover UPDATE actually executed (it is not passing because the statement aborted) (executed)',
      `C6c ⚠ the takeover probe did not run — C6c below would certify falsely. out=${takeover.out}`)
    check(bOrgAfter[0] === ORG_B && bOrgAfter[1] !== 'closed',
      `C6c ORG_A cannot STEAL ORG_B's request by reassigning organization_id — it is still ORG_B's and still '${bOrgAfter[1]}' (executed)`,
      `C6c ⚠ TAKEOVER — ORG_B's request is now owned by ${bOrgAfter[0]} with status '${bOrgAfter[1]}' (probe ok=${takeover.ok})`)
    for (const [id, org, st] of ownerBeforeTakeover) {
      db.exec(`update public.availability_requests set status='${st}', organization_id=${org ? `'${org}'` : 'null'} where id = '${id}'`)
    }
    check(JSON.stringify(db.rows(`select id, organization_id::text, status from public.availability_requests order by id`)) === JSON.stringify(ownerBeforeTakeover),
      `C6c probe restored every request's organization_id and status (${ownerBeforeTakeover.length} rows) (executed)`,
      'C6c ⚠ the takeover probe left residue')

    // C6d · THE OUTBOUND DIRECTION — a cross-tenant PLANT. C6/C6b/C6c all test
    // whether ORG_A can touch ORG_B's row; this tests whether ORG_A can push a
    // row it legitimately owns INTO ORG_B's inbox.
    //
    // HONEST LIMIT, STATED BECAUSE IT WOULD OTHERWISE BE MISREAD. This does NOT
    // isolate req_org_update's WITH CHECK, and an earlier version of this
    // comment claimed it did. Executed: reverting WITH CHECK to the leaky
    // `can_access_artist(artist_id)` leaves this assertion GREEN — the plant is
    // still refused, with `can_access_artist` returning true, `with_check`
    // confirmed leaky in pg_policies, and no RESTRICTIVE policy on the table
    // (all five are PERMISSIVE). Something else refuses it and neither I nor
    // independent QA could isolate what. So: the WITH CHECK half of
    // req_org_update remains UNTESTED, the behaviour below is real and worth
    // asserting, and the attribution is left open rather than guessed.
    // Recorded in OWNER-PENDING REQ-ORG — promotion should not assume WITH
    // CHECK is what is protecting this.
    const reqABefore = db.rows(`select organization_id::text, status from public.availability_requests where id = '${REQ_A}'`)[0]
    const plant = db.try(
      `update public.availability_requests set organization_id='${ORG_B}' where id = '${REQ_A}'`, asUser(U.REP_A))
    const reqAPlanted = db.rows(`select organization_id::text from public.availability_requests where id = '${REQ_A}'`)[0][0]
    check(reqAPlanted === ORG_A,
      `C6d the outbound plant is REFUSED — ORG_A cannot re-address its OWN request into ORG_B's inbox (still ${reqAPlanted}); mechanism not attributed, see the note above (executed)`,
      `C6d ⚠ ORG_A PLANTED demand in ORG_B's inbox: REQ_A.organization_id is now ${reqAPlanted} (probe ok=${plant.ok})`)
    // Positive control: the same shape of write MUST succeed for its own org,
    // otherwise C6d could pass because updates are broken rather than refused.
    const selfWrite = db.try(
      `update public.availability_requests set organization_id='${ORG_A}' where id = '${REQ_A}'`, asUser(U.REP_A))
    check(selfWrite.ok && db.rows(`select organization_id::text from public.availability_requests where id = '${REQ_A}'`)[0][0] === ORG_A,
      'C6d positive control: the same UPDATE targeting ITS OWN org succeeds — C6d is a refusal, not a broken write path (executed)',
      `C6d ⚠ ORG_A cannot write its own organization_id either — C6d above proves nothing. out=${selfWrite.out}`)
    db.exec(`update public.availability_requests set organization_id=${reqABefore[0] ? `'${reqABefore[0]}'` : 'null'}, status='${reqABefore[1]}' where id = '${REQ_A}'`)
    check(JSON.stringify(db.rows(`select organization_id::text, status from public.availability_requests where id = '${REQ_A}'`)[0]) === JSON.stringify(reqABefore),
      'C6d probe restored REQ_A (executed)',
      'C6d ⚠ the WITH CHECK probe left residue on REQ_A')

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
  // PRIVILEGE-SURFACE SNAPSHOT — the column-grant analogue of the policy
  // snapshot in A6.fix, and added for the same reason. D3 below names four
  // columns; a candidate that revoked from the wrong role, widened
  // service_role, or touched a DIFFERENT table entirely would pass every
  // assertion in this section. This candidate's whole mechanism IS a privilege
  // change, so the privilege surface is what has to be measured.
  // EVERY grantee, not three named ones, and is_grantable too. Independent QA
  // defeated the narrower version: `grant select on public.share_link to public`
  // and `grant … with grant option` both passed at exit 0 while the assertion
  // printed that nothing was granted ANYWHERE. PUBLIC is a grantee like any
  // other and it is the one that hands a privilege to every role at once.
  const GRANT_SQL = `select grantee, table_name, column_name, privilege_type, is_grantable
                       from information_schema.role_column_grants
                      where table_schema='public'
                      order by grantee, table_name, column_name, privilege_type`
  // A privilege snapshot CANNOT see a policy, RLS being switched off, or a
  // permissive backdoor. QA proved all three pass a privilege-only comparison:
  // `create policy qa_backdoor … using (true)` handed every claim row to every
  // logged-in user at "137 checks, all hold".
  const SECURITY_SQL = `select c.relname, c.relrowsecurity, c.relforcerowsecurity,
                               coalesce(p.polname,'-'), coalesce(p.polpermissive::text,'-'),
                               coalesce(pg_get_expr(p.polqual, p.polrelid),'-'),
                               coalesce(pg_get_expr(p.polwithcheck, p.polrelid),'-')
                          from pg_class c
                          join pg_namespace n on n.oid = c.relnamespace and n.nspname='public'
                          left join pg_policy p on p.polrelid = c.oid
                         where c.relkind='r'
                         order by c.relname, coalesce(p.polname,'-')`
  const grantsBefore = db.rows(GRANT_SQL)
  const secBefore = db.rows(SECURITY_SQL)
  db.exec(readFileSync('scripts/sql/candidate-share-link-columns.sql', 'utf8'))
  const grantsAfter = db.rows(GRANT_SQL)
  const secAfter = db.rows(SECURITY_SQL)
  {
    const key = (r) => r.join('|')
    const setB = new Set(grantsBefore.map(key)), setA = new Set(grantsAfter.map(key))
    const removed = grantsBefore.map(key).filter((k) => !setA.has(k))
    const added = grantsAfter.map(key).filter((k) => !setB.has(k))

    check(grantsBefore.length > 200,
      `D6 non-vacuity: ${grantsBefore.length} column privileges captured before the candidate (executed)`,
      `D6 ⚠ only ${grantsBefore.length} privileges captured — the comparison below would prove nothing`)
    check(added.length === 0,
      `D6 the candidate GRANTS nothing new to ANY grantee in the public schema — including PUBLIC, and including grant-option changes (executed)`,
      `D6 ⚠ the candidate ADDED privileges: ${added.slice(0, 6).join(', ')}`)
    check(JSON.stringify(secAfter) === JSON.stringify(secBefore) && secBefore.length > 20,
      `D6 the candidate adds/removes NO policy and changes no RLS flag — ${secBefore.length} policy/RLS rows byte-identical. A privilege snapshot alone cannot see a permissive backdoor or `+"`disable row level security`"+` (executed)`,
      `D6 ⚠ the SECURITY surface changed: ${secBefore.length} → ${secAfter.length} rows. A permissive policy ORs in and a disabled RLS removes the row gate entirely.`)
    check(removed.length > 0 && removed.every((k) => k.startsWith('authenticated|share_link|')),
      `D6 every one of the ${removed.length} privilege changes is a REVOKE on authenticated/share_link — anon, service_role and every other table are untouched (executed)`,
      `D6 ⚠ the candidate changed privileges outside authenticated/share_link: ${removed.filter((k) => !k.startsWith('authenticated|share_link|')).slice(0, 6).join(', ')}`)

    // The candidate's own load-bearing claim, verified rather than trusted:
    // "THE COLUMN LIST IS share_link_delivery_v's OWN PROJECTION, exactly — so
    // the sanctioned view becomes the practical maximum instead of a parallel
    // option." Nothing tested it.
    const viewCols = db.rows(
      `select column_name from information_schema.columns
        where table_schema='public' and table_name='share_link_delivery_v' order by column_name`).map((r) => r[0]).sort()
    const grantedCols = grantsAfter
      .filter((r) => r[0] === 'authenticated' && r[1] === 'share_link' && r[3] === 'SELECT')
      .map((r) => r[2]).sort()
    check(viewCols.length >= 8 && grantedCols.length >= 8,
      `D7 non-vacuity: share_link_delivery_v projects ${viewCols.length} columns and authenticated is granted ${grantedCols.length} on share_link (executed)`,
      `D7 ⚠ near-empty comparison (view ${viewCols.length}, granted ${grantedCols.length})`)
    const grantedNotInView = grantedCols.filter((c) => !viewCols.includes(c))
    check(grantedNotInView.length === 0,
      `D7 the granted column list is a SUBSET of share_link_delivery_v's projection — the sanctioned view is the practical maximum, exactly as the candidate claims (executed)`,
      `D7 ⚠ authenticated may select column(s) the sanctioned view does NOT project: ${grantedNotInView.join(', ')} — the candidate's "exactly the view's projection" claim is false`)
    const viewNotGranted = viewCols.filter((c) => !grantedCols.includes(c))
    check(viewNotGranted.length === 0,
      `D7 and it is not NARROWER than the view either — every projected column is still directly readable, so the view cannot outrun the grant (executed)`,
      `D7 ⚠ share_link_delivery_v projects column(s) authenticated can no longer select: ${viewNotGranted.join(', ')} — the view will fail for its intended caller`)

    // The firewall columns, named explicitly so a future widening is loud.
    for (const c of ['open_count', 'opened_at', 'token_hash', 'mint_request_key', 'wrong_recipient_at']) {
      check(!grantedCols.includes(c),
        `D7 firewall column ${c} is NOT in the granted list (executed)`,
        `D7 ⚠ ${c} was granted to authenticated — the firewall the candidate exists to build is open`)
    }
  }
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

  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nE · FIREWALL COLUMN — claims.internal_confidence reaches `authenticated` (EXECUTED)')
  // ──────────────────────────────────────────────────────────────────────────
  {
    // 001:89 declares internal_confidence "DB-only; never returned to any
    // client". 016 enforced that for ANON only, and says so deliberately at
    // 016:9. So the contract is one role short of what it claims.
    const ownerIC = db.try(`select internal_confidence from public.claims where artist_id='${ARTIST}'`, asUser(U.OWNER))
    check(ownerIC.ok,
      'E1 ⚠ REPRODUCED — the artist\'s own organization SELECTs claims.internal_confidence, a column 001:89 says is "never returned to any client". 016 revoked it from anon only (executed)',
      'E1 internal_confidence was already denied to authenticated — this gate is stale')
    const anonIC = db.try(`select internal_confidence from public.claims`, { role: 'anon' })
    check(!anonIC.ok && /permission denied/i.test(anonIC.out),
      'E1 anon is correctly denied — 016 works, for the one role it covered (executed)',
      'E1 ⚠ anon can read internal_confidence — 016 is broken, which is a bigger finding')

    // The column only matters if a shipped path returns it. These three do.
    // WHOLE-FILE and chain-aware, across all of src/lib — not per-line over one
    // file. The previous regex carried a useless `[\s\S]*` while being applied
    // line by line, so a multi-line chain (db.js's own house style at 190, 532,
    // 582, 665) was invisible: independent QA added a sixth select('*') call
    // site and the gate still reported five. src/lib/orgs.js reads claims too
    // and was never scanned.
    const libFiles = execSyncList("git ls-files -- 'src/lib'").filter((f) => f.endsWith('.js'))
    const countIn = (re) => libFiles.reduce((acc, f) => {
      const txt = readFileSync(f, 'utf8')
      return acc.concat([...txt.matchAll(re)].map(() => f))
    }, [])
    const STAR_RE = /from\(['"]claims['"]\)[\s\S]{0,200}?\.select\(\s*['"]\*['"]\s*\)/g
    const BARE_RE = /from\(['"]claims['"]\)\s*\.(insert|update)\([\s\S]{0,300}?\)\s*\.select\(\s*\)/g
    const starHits = countIn(STAR_RE)
    const bareHits = countIn(BARE_RE)
    const dbjs = readFileSync('src/lib/db.js', 'utf8').split('\n')
    // A BARE `.select()` after a write expands to every column exactly as
    // `select('*')` does. The first version of this assertion counted only the
    // reads and reported "three call sites"; claim CREATION and claim UPDATE
    // break too, which understated the cost of promoting the candidate.
    const starClaims = dbjs.map((l, i) => [i + 1, l])
      .filter(([, l]) => /from\('claims'\)[\s\S]*\.select\('\*'\)/.test(l))
    const bareSelect = dbjs.map((l, i) => [i + 1, l])
      .filter(([, l]) => /from\('claims'\)\.(insert|update)\([\s\S]*\)\.select\(\)/.test(l))
    // EXACT counts, not `>=`. A one-directional floor catches a REMOVED call
    // site and is blind to an ADDED one, which is how a sixth site slipped past.
    check(starHits.length === 3 && starClaims.length === 3,
      `E2 exactly 3 shipped client READ(s) are select('*') on claims (src/lib/db.js:${starClaims.map((x) => x[0]).join(', ')}; whole-file scan of ${libFiles.length} src/lib files agrees) — each returns every column the role may select (executed)`,
      `E2 the select('*') call-site COUNT changed: whole-file scan found ${starHits.length} in [${[...new Set(starHits)].join(', ')}], per-line found ${starClaims.length}. Re-derive the breakage count before trusting it.`)
    check(bareHits.length === 2 && bareSelect.length === 2,
      `E2 and exactly 2 WRITE path(s) return a bare .select() (src/lib/db.js:${bareSelect.map((x) => x[0]).join(', ')}) — claim creation and claim update expand to every column too, so promotion breaks 5 call sites, not 3 (executed)`,
      `E2 the bare-.select() COUNT changed: whole-file scan found ${bareHits.length} in [${[...new Set(bareHits)].join(', ')}], per-line found ${bareSelect.length}`)

    // THE WIRE FORMAT, measured rather than inferred. E2 above claims five call
    // sites break under a column grant. That claim rests on what the CLIENT
    // actually sends: if `.select('*')` and a bare `.select()` did not emit
    // `select=*`, the breakage count would be wrong. Asserted against the real
    // @supabase/postgrest-js query builder, offline, no server needed.
    //
    // FAILS CLOSED if the library is unavailable — a skip is not a pass, and
    // this is the only thing standing between "measured" and "assumed" here.
    {
      let PostgrestClient = null
      // Through @supabase/supabase-js — the DECLARED dependency the app
      // actually imports. The first draft imported @supabase/postgrest-js by
      // bare specifier; that package is not in package.json and resolved only
      // through npm hoisting, so the gate depended on a phantom.
      try {
        const { createClient } = await import('@supabase/supabase-js')
        PostgrestClient = { make: () => createClient('http://local.invalid', 'anon-key-not-a-secret') }
      } catch { /* handled below */ }
      check(!!PostgrestClient,
        'E2 wire-format check is RUNNABLE — @supabase/supabase-js (a declared dependency) resolved (executed)',
        'E2 ⚠ @supabase/supabase-js could not be imported, so the five-call-site breakage claim is UNMEASURED. Not skipping: this fails.')
      if (PostgrestClient) {
        const c = PostgrestClient.make()
        const q = (b) => decodeURIComponent(b.url.search || '')
        const star = q(c.from('claims').select('*').eq('artist_id', ARTIST))
        const bare = q(c.from('claims').insert({ artist_id: ARTIST }).select())
        const list = q(c.from('claims').select('id, value'))
        check(star.includes('select=*') && bare.includes('select=*'),
          `E2 both shapes emit a FULL projection on the wire — select('*') → "${star}" and a bare .select() after a write → "${bare}" — so all five call sites request every column and all five break under a column grant (executed)`,
          `E2 ⚠ the wire format is not select=* (star="${star}" bare="${bare}") — the five-call-site breakage claim does not hold`)
        check(list.includes('select=id,value') && !list.includes('*'),
          'E2 positive control: an EXPLICIT column list emits only those columns, so the fix (explicit lists) is the right remedy (executed)',
          `E2 ⚠ an explicit list did not narrow the wire format: "${list}"`)
      }
    }

    // THE RENDER QUESTION, answered rather than left open. T-115 recorded
    // "nothing renders it" as UNVERIFIED; this is the check that settles it.
    const INTERNAL_COLS = ['internal_confidence', 'extraction_provenance', 'extraction_method', 'model_version']
    const uiFiles = execSyncList("git ls-files -- 'src/features' 'src/components'").filter((f) => /\.(js|jsx)$/.test(f))
    check(uiFiles.length >= 10,
      `E2 non-vacuity: ${uiFiles.length} artist/agency UI files scanned for the internal columns`,
      `E2 ⚠ only ${uiFiles.length} UI files found — the render check below would be vacuous`)
    const renders = []
    for (const f of uiFiles) {
      const src = readFileSync(f, 'utf8')
      for (const c of INTERNAL_COLS) if (src.includes(c)) renders.push(`${f}:${c}`)
    }
    // THE GENERIC SERIALIZER. T-116 stated "there is no generic renderer over
    // claims" — FALSE. src/features/admin/AdminDashboard.jsx writes the whole
    // adminExportArtist() result (src/lib/db.js:788, a select('*')) to a
    // downloadable JSON file. The name-based scan below cannot see it because
    // the file never names a column. It is operator-gated, but the file exists
    // to be HANDED TO THE DATA SUBJECT under right-to-access/portability, which
    // makes CONF-COL larger rather than smaller.
    const serializers = uiFiles.filter((f) => {
      const t = readFileSync(f, 'utf8')
      return /adminExportArtist/.test(t) && /JSON\.stringify/.test(t)
    })
    check(serializers.length === 1 && serializers[0] === 'src/features/admin/AdminDashboard.jsx',
      `E2 exactly ONE generic serializer consumes a select('*') claims read — ${serializers.join(', ')} (the OP12 portability export). It is known and named; a NEW one would fail this assertion (executed)`,
      `E2 ⚠ the generic-serializer set changed: ${JSON.stringify(serializers)} — a serializer writes whole claims rows to a file the data subject receives, and a column-name scan cannot see it`)

    check(renders.length === 0,
      `E2 NO artist-facing UI file names any of the four internal columns — this is a column in a network response, NOT a score on a screen (executed over ${uiFiles.length} files)`,
      `E2 ⚠ an internal column is referenced in artist-facing UI: ${renders.join(', ')} — that would be a firewall breach, not a defence-in-depth gap`)
  }

  console.log('\n  ── candidate applied: scripts/sql/candidate-claims-internal-columns.sql ──')
  const icGrantsBefore = db.rows(GRANT_SQL)
  const icSecBefore = db.rows(SECURITY_SQL)
  db.exec(readFileSync('scripts/sql/candidate-claims-internal-columns.sql', 'utf8'))
  const icGrantsAfter = db.rows(GRANT_SQL)
  const icSecAfter = db.rows(SECURITY_SQL)
  {
    // Exactly two. The first draft revoked four; src/types.ts:76-77 declares
    // extraction_method and model_version as fields of the client-facing Claim
    // type, so revoking them contradicted a written client contract.
    const INTERNAL = ['internal_confidence', 'extraction_provenance']
    const CLIENT_VISIBLE = ['extraction_method', 'model_version']
    for (const col of INTERNAL) {
      const r = db.try(`select ${col} from public.claims where artist_id='${ARTIST}'`, asUser(U.OWNER))
      check(!r.ok && /permission denied/i.test(r.out),
        `E3 ${col} is now physically un-SELECTable by the artist's own organization (executed)`,
        `E3 ⚠ ${col} is still readable by authenticated`)
    }
    check(db.try(`select internal_confidence from public.claims`, asUser(U.REP_A)).ok === false,
      'E3 and by every representing organization too (executed)')
    for (const col of CLIENT_VISIBLE) {
      check(db.try(`select ${col} from public.claims where artist_id='${ARTIST}'`, asUser(U.OWNER)).ok,
        `E3 ${col} REMAINS readable — src/types.ts:76-77 declares it a field of the client-facing Claim type, and src/lib/db.js:344 has the client write it (executed)`,
        `E3 ⚠ the candidate revoked ${col}, contradicting the Claim type contract in src/types.ts`)
    }

    // CONSEQUENCE, measured rather than described: this is what breaks.
    const star = db.try(`select * from public.claims where artist_id='${ARTIST}'`, asUser(U.OWNER))
    check(!star.ok && /permission denied/i.test(star.out),
      'E4 `select *` on claims now FAILS for authenticated — all FIVE src/lib/db.js call sites (3 reads + 2 write-returns) break LOUDLY rather than leak quietly, and must be changed to explicit column lists in the same commit as any promotion (executed)',
      'E4 ⚠ select * still succeeds — the candidate did not narrow anything')
    check(db.try(`select id, claim_type, value, verification_status, visibility, artist_approved from public.claims where artist_id='${ARTIST}'`, asUser(U.OWNER)).ok,
      'E4 an EXPLICIT column list still works — the narrowing is a narrowing, not a blackout (executed)',
      'E4 ⚠ the candidate broke ordinary claim reads')
    check(db.try(`select internal_confidence from public.claims`, { role: 'service_role' }).ok,
      'E4 service_role — the server and the AI pipeline that WRITES the number — is untouched (executed)',
      'E4 ⚠ the candidate cut off service_role')
    check(db.try(`update public.claims set artist_approved = true where artist_id='${ARTIST}'`, asUser(U.OWNER)).ok,
      'E4 the artist can still APPROVE a claim — SELECT and UPDATE are separate privileges (executed)',
      'E4 ⚠ the candidate broke the approval gate')

    // E6 · THE CLOSED-LIST CONSEQUENCE, measured. The candidate replaces a
    // TABLE-level grant with COLUMN-level grants, so `authenticated` loses the
    // `r` bit in relacl and a column added AFTERWARDS is not covered by any
    // grant. An earlier draft of the candidate's header claimed the exact
    // opposite — that future columns would be granted automatically — and
    // independent QA measured it false. This is the assertion that would have
    // caught the claim.
    const relacl = String(db.scalar(`select relacl::text from pg_class where relname='claims'`) ?? '')
    check(/authenticated=[a-z]*w/.test(relacl) && !/authenticated=[a-z]*r[a-z]*w/.test(relacl),
      `E6 authenticated no longer holds TABLE-wide SELECT on claims — relacl is ${relacl} (executed)`,
      `E6 ⚠ authenticated still holds table-level SELECT: ${relacl} — then the revoke did not take effect`)
    db.exec(`alter table public.claims add column if not exists qa_future_col text`)
    const futureRead = db.try(`select qa_future_col from public.claims`, asUser(U.OWNER))
    check(!futureRead.ok && /permission denied/i.test(futureRead.out),
      'E6 a column added AFTER promotion is NOT readable by authenticated — promotion makes claims a CLOSED column list, so every future migration adding a claims column must extend the grant or the column is invisible to the app. This is an ongoing cost, not a self-maintaining design (executed)',
      'E6 ⚠ a newly added column IS readable — re-derive E6, the closed-list property does not hold')
    db.exec(`alter table public.claims drop column if exists qa_future_col`)
    check(db.scalar(`select count(*) from information_schema.columns where table_schema='public' and table_name='claims' and column_name='qa_future_col'`) === '0',
      'E6 probe column removed — the block leaves no schema residue (executed)',
      'E6 ⚠ qa_future_col survived the probe')

    // Privilege-surface snapshot, same shape as D6.
    const key = (r) => r.join('|')
    const setB = new Set(icGrantsBefore.map(key)), setA = new Set(icGrantsAfter.map(key))
    const added = icGrantsAfter.map(key).filter((k) => !setB.has(k))
    const removed = icGrantsBefore.map(key).filter((k) => !setA.has(k))
    check(icGrantsBefore.length > 200,
      `E5 non-vacuity: ${icGrantsBefore.length} column privileges captured before the candidate (executed)`,
      `E5 ⚠ only ${icGrantsBefore.length} captured`)
    check(added.length === 0,
      'E5 the candidate GRANTS nothing new anywhere (executed)',
      `E5 ⚠ the candidate ADDED privileges: ${added.slice(0, 6).join(', ')}`)
    check(JSON.stringify(icSecAfter) === JSON.stringify(icSecBefore) && icSecBefore.length > 20,
      `E5 the candidate adds/removes NO policy and changes no RLS flag — ${icSecBefore.length} policy/RLS rows byte-identical (executed)`,
      `E5 ⚠ the SECURITY surface changed: ${icSecBefore.length} → ${icSecAfter.length} rows`)
    // BEHAVIOURAL read-back. Section D has one (D4's stranger); section E copied
    // D's privilege snapshot and not its control, so nothing here actually READ
    // anything after the candidate. A backdoor policy would have passed.
    // NOT "a stranger reads zero claims" — a published artist's passport-ok
    // claim IS public, so zero would be the wrong contract and the first draft
    // of this control asserted it and failed correctly. What must hold is that
    // no PRIVATE claim reaches a no-grant organization.
    // ONE column deliberately: a multi-column row whose first field is empty
    // collapses in the harness's row parser, and the first draft of this check
    // read the wrong index and failed on a correct database.
    const strangerRows = db.rows(`select visibility from public.claims where artist_id='${ARTIST}'`, asUser(U.STRANGER))
    const strangerPrivate = strangerRows.filter((r) => r[0] !== 'passport-ok')
    check(strangerPrivate.length === 0,
      `E5 behavioural control — a no-grant organization reads ONLY passport-ok claims after the candidate (${strangerRows.length} row(s), 0 private) (executed)`,
      `E5 ⚠ a stranger reads ${strangerPrivate.length} PRIVATE claim(s): ${JSON.stringify(strangerPrivate)} — a permissive policy or disabled RLS looks exactly like this`)
    check(strangerRows.length >= 1,
      `E5 positive control: the stranger's read path WORKS (${strangerRows.length} public claim(s)), so the assertion above is not passing on a dead query (executed)`,
      'E5 ⚠ the stranger read nothing at all — the private-claim assertion above would be vacuous')
    const anonClaims = db.rows(`select value from public.claims`, { role: 'anon' }).map((r) => r[0])
    check(!anonClaims.some((v) => /SECRET|ACT_B/.test(String(v))),
      `E5 behavioural control — anon still reads no private claim text after the candidate (sees ${JSON.stringify(anonClaims)}) (executed)`,
      `E5 ⚠ anon reads private claim text after the candidate: ${JSON.stringify(anonClaims)}`)
    check(removed.length === INTERNAL.length && removed.every((k) => k.startsWith('authenticated|claims|')),
      `E5 exactly ${INTERNAL.length} privileges were revoked, all on authenticated/claims — anon, service_role and every other table untouched (executed)`,
      `E5 ⚠ unexpected privilege changes: ${removed.join(', ')}`)
    const stillGranted = icGrantsAfter.filter((r) => r[0] === 'authenticated' && r[1] === 'claims' && r[3] === 'SELECT').map((r) => r[2])
    const leaked = INTERNAL.filter((c) => stillGranted.includes(c))
    check(leaked.length === 0 && stillGranted.length >= 10,
      `E5 authenticated keeps ${stillGranted.length} claims columns and none of the ${INTERNAL.length} internal ones — the computed keep-list did not silently drop a needed column or retain a private one (executed)`,
      `E5 ⚠ internal column(s) still granted: ${leaked.join(', ')} (keep-list size ${stillGranted.length})`)
  }


  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nF · ROLE CONTEXT — can a user point their active org at a FOREIGN organization? (EXECUTED)')
  // ──────────────────────────────────────────────────────────────────────────
  {
    // `arc_self` (008:216) is `for all using (person_id = auth.uid()) with
    // check (person_id = auth.uid())`. It constrains WHOSE row you may write.
    // It says nothing about WHICH organization you may point at, and
    // set_artist_org() (014/015) READS that column to stamp ownership on every
    // new artist. 014's header asserts the RLS WITH CHECK catches the mismatch.
    // That is a claim about behaviour, so it is executed here rather than read.
    const arcOther = db.try(
      `insert into public.active_role_context(person_id, active_organization_id)
       values ('${U.REP_B}', '${ORG_A}')
       on conflict (person_id) do update set active_organization_id = excluded.active_organization_id`,
      asUser(U.REP_A))
    check(!arcOther.ok,
      'F1 arc_self refuses writing ANOTHER person\'s role context (executed)',
      `F1 ⚠ REP_A wrote REP_B's active_role_context — cross-person write is open (ok=${arcOther.ok})`)

    // Own row, FOREIGN organization. REP_A belongs to ORG_A only.
    const arcForeign = db.try(
      `insert into public.active_role_context(person_id, active_organization_id)
       values ('${U.REP_A}', '${ORG_B}')
       on conflict (person_id) do update set active_organization_id = excluded.active_organization_id`,
      asUser(U.REP_A))
    const arcNow = db.scalar(`select active_organization_id::text from public.active_role_context where person_id = '${U.REP_A}'`)
    check(arcForeign.ok && arcNow === ORG_B,
      `F2 ⚠ REPRODUCED — a user may point their OWN active_role_context at an organization they do NOT belong to: REP_A's active org is now ${arcNow} (ORG_B). arc_self validates the person, never the organization (executed)`,
      `F2 the foreign-org write was refused (ok=${arcForeign.ok}, now=${arcNow}) — arc_self is stricter than 008:216 reads, re-derive this`)

    // THE QUESTION THAT MATTERS: does anything downstream TRUST it?
    // set_artist_org() stamps owner_organization_id from that column.
    const insArtist = db.try(
      `insert into public.artists (id, stage_name, created_by)
       values ('00000000-0000-0000-0000-0000000000d9', 'QA ROLE CONTEXT PROBE', '${U.REP_A}')`,
      asUser(U.REP_A))
    // Existence by COUNT, not by a scalar compared to null: the harness returns
    // an empty scalar for "no rows", so `=== null` reported a refusal as a
    // failure. Measured the shape before trusting it.
    const stampedRows = db.scalar(`select count(*) from public.artists where id = '00000000-0000-0000-0000-0000000000d9'`)
    const stamped = db.scalar(`select coalesce(max(owner_organization_id::text),'(no row)') from public.artists where id = '00000000-0000-0000-0000-0000000000d9'`)
    check(!insArtist.ok && stampedRows === '0',
      `F3 the artists RLS WITH CHECK still REFUSES it — a foreign active org stamps owner_organization_id=ORG_B and \`owner_organization_id in current_org_ids()\` then fails, because current_org_ids() reads MEMBERSHIP and never the active context. 014's header claim holds, executed (insert ok=${insArtist.ok}, row=${stamped}) (executed)`,
      `F3 ⚠ ESCALATION — REP_A created an artist owned by ORG_B, an organization they do not belong to (owner=${stamped}). The active context was trusted as authority.`)

    // Positive control: the SAME insert with the user's OWN org must succeed,
    // or F3 would pass because artist creation is broken rather than refused.
    db.exec(`update public.active_role_context set active_organization_id = '${ORG_A}' where person_id = '${U.REP_A}'`)
    const insOwn = db.try(
      `insert into public.artists (id, stage_name, created_by)
       values ('00000000-0000-0000-0000-0000000000da', 'QA ROLE CONTEXT CONTROL', '${U.REP_A}')`,
      asUser(U.REP_A))
    const stampedOwn = db.scalar(`select owner_organization_id::text from public.artists where id = '00000000-0000-0000-0000-0000000000da'`)
    check(insOwn.ok && stampedOwn === ORG_A,
      `F3 positive control: the same insert with REP_A's OWN active org SUCCEEDS and stamps ${stampedOwn} — F3 above is a refusal, not a broken write path (executed)`,
      `F3 ⚠ the control insert failed (ok=${insOwn.ok}, owner=${stampedOwn}) — F3 proves nothing`)
    db.exec(`delete from public.artists where id in ('00000000-0000-0000-0000-0000000000d9','00000000-0000-0000-0000-0000000000da')`)
    check(db.scalar(`select count(*) from public.artists where id in ('00000000-0000-0000-0000-0000000000d9','00000000-0000-0000-0000-0000000000da')`) === '0',
      'F3 probe artists removed — this block leaves no residue (executed)',
      'F3 ⚠ a probe artist survived the block')
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
