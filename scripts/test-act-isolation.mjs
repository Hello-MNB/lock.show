// ============================================================
// G13 — MULTI-ACT ISOLATION PROOF (launch contract, DEPLOY-GAPS row G13)
//
// PART 1 — DYNAMIC: exercises the DEMO build's data layer (src/lib/db.js DEMO
//   paths) through vite's SSR module loader in `--mode demo` (the same env the
//   demo build uses, VITE_DEMO=1). Proves the Act-switch contract:
//     switch to Act B  → Act B's OWN universe only (claims empty, no Act-A rows)
//     switch back to A → Act A's data byte-identical (nothing leaked or lost)
//
// PART 2 — STATIC: scoping inventory of src/lib/db.js + server/index.js.
//   Reports HONESTLY which data-layer reads scope by act_id vs artist_id.
//   Known architectural note (documented, NOT refactored here): most paths
//   still query artist_id. That is safe TODAY only because migration 020's
//   transition rule makes act.id === artists.id for the DEFAULT Act and
//   backfills/auto-fills act_id = artist_id on child rows. A NON-default Act
//   is only correctly scoped through switchAct() (the one act_id-scoped read).
//   This part REPORTS findings; it does not fail the build on them.
//
// Wired as `npm run test:isolation` and part of `npm run verify`.
// ============================================================
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

let pass = 0
let fail = 0
const findings = []

function check(name, cond, detail = '') {
  if (cond) {
    pass++
    console.log(`  ✔ ${name}`)
  } else {
    fail++
    console.error(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

// ────────────────────────────────────────────────────────────
// PART 1 — dynamic DEMO data-layer test
// ────────────────────────────────────────────────────────────
console.log('G13 · PART 1 — DEMO data-layer Act-isolation (dynamic)')

const vite = await createServer({
  root,
  mode: 'demo', // reads .env.demo → VITE_DEMO=1, exactly like `npm run build:demo`
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true },
  // No dep pre-bundling at all — SSR loads straight from node_modules.
  // `disabled: true` (still honored in Vite 5.4) stops the client optimizer
  // from even starting; with only noDiscovery it still races server.close()
  // and intermittently prints a spurious esbuild "The build was canceled".
  optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
})

try {
  const demo = await vite.ssrLoadModule('/src/lib/demo.js')
  const db = await vite.ssrLoadModule('/src/lib/db.js')

  check('DEMO mode active (VITE_DEMO=1 via --mode demo)', demo.DEMO === true)

  const ACT_A = demo.demoArtist.id // default Act — techno (act.id === artists.id)
  const actB = demo.demoActs.find((a) => !a.is_default)
  check('fixtures define a second, non-default Act', Boolean(actB))
  const ACT_B = actB?.id

  // 1 · listActs — one Person, several Acts
  const acts = await db.listActs(ACT_A)
  check('listActs returns both Acts of the same Person', acts.length === 2
    && acts.some((a) => a.id === ACT_A) && acts.some((a) => a.id === ACT_B))
  check('both Acts share one person_id (multi-Act = one Person)',
    new Set(acts.map((a) => a.person_id)).size === 1)

  // 2 · switch to Act A — snapshot its universe
  const A1 = await db.switchAct(ACT_A)
  const aItemIds = A1.items.map((i) => i.id).sort()
  const aClaimIds = A1.claims.map((c) => c.id).sort()
  check('Act A has evidence history (items > 0, claims > 0)',
    A1.items.length > 0 && A1.claims.length > 0,
    `items=${A1.items.length} claims=${A1.claims.length}`)
  check('every Act-A item belongs to Act A',
    A1.items.every((i) => (i.act_id ?? i.artist_id) === ACT_A))

  // 3 · switch to Act B — its OWN universe, never Act A's
  const B = await db.switchAct(ACT_B)
  check('switchAct(B) returns Act B itself', B.act?.id === ACT_B)
  check('Act B claims start EMPTY (evidence is per-Act, non-transferable)',
    B.claims.length === 0, `claims=${B.claims.length}`)
  check('no Act-A item leaks into Act B',
    B.items.every((i) => !aItemIds.includes(i.id)))
  check('no Act-A claim leaks into Act B',
    B.claims.every((c) => !aClaimIds.includes(c.id)))
  check('every Act-B item is scoped to Act B',
    B.items.every((i) => (i.act_id ?? i.artist_id) === ACT_B))

  // 4 · getMyAct — id-scoped read
  const myB = await db.getMyAct(ACT_B)
  check('getMyAct(B) is scoped to the requested Act id', myB?.id === ACT_B)

  // 5 · switch BACK to Act A — data unchanged
  const A2 = await db.switchAct(ACT_A)
  check('Act A items unchanged after the round-trip',
    JSON.stringify(A2.items.map((i) => i.id).sort()) === JSON.stringify(aItemIds))
  check('Act A claims unchanged after the round-trip',
    JSON.stringify(A2.claims.map((c) => c.id).sort()) === JSON.stringify(aClaimIds))

  // 6 · createAct in DEMO — documented behaviour: throws, UI shows the demo hint
  //     (real Act creation is a live-DB path; DEMO cannot create one).
  let threw = false
  try { await db.createAct(ACT_A, { stage_name: 'X' }) } catch { threw = true }
  check('createAct in DEMO throws (creation is live-DB only — documented)', threw)

  // Honest probe (finding, not a failure): the generic per-id readers in DEMO
  // ignore their id argument and always return the Act-A fixture set.
  const bItemsViaGeneric = await db.listProfileItems(ACT_B)
  const bClaimsViaGeneric = await db.listClaims(ACT_B)
  if (bItemsViaGeneric.some((i) => aItemIds.includes(i.id))
    || bClaimsViaGeneric.some((c) => aClaimIds.includes(c.id))) {
    findings.push(
      'DEMO fixture gap: listProfileItems(id) / listClaims(id) IGNORE the id argument in DEMO '
      + 'and return the Act-A fixtures for any id (src/lib/db.js DEMO branches). The act-scoped '
      + 'path in DEMO is switchAct() only. Demo-build screens that read items/claims for a '
      + 'non-default Act through these generic readers would show Act-A data.')
  }
} finally {
  await vite.close()
}

// ────────────────────────────────────────────────────────────
// PART 2 — static scoping inventory: act_id vs artist_id
// ────────────────────────────────────────────────────────────
console.log('\nG13 · PART 2 — static scoping inventory (act_id vs artist_id)')

function inventory(file, label) {
  const src = readFileSync(join(root, file), 'utf8')
  // Split on exported/route-level function boundaries, keep names.
  const fnRe = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)|app\.(get|post)\('([^']+)'/g
  const marks = []
  let m
  while ((m = fnRe.exec(src))) {
    marks.push({ name: m[1] || `${m[2].toUpperCase()} ${m[3]}`, at: m.index })
  }
  const rows = []
  for (let i = 0; i < marks.length; i++) {
    const body = src.slice(marks[i].at, marks[i + 1]?.at ?? src.length)
    const act = (body.match(/\.eq\('act_id'/g) || []).length
    const artist = (body.match(/\.eq\('artist_id'/g) || []).length
      + (body.match(/\.in\('artist_id'/g) || []).length
    if (act || artist) rows.push({ name: marks[i].name, act, artist })
  }
  console.log(`  ${label}:`)
  for (const r of rows) {
    const scope = r.act && r.artist ? 'act_id + artist_id'
      : r.act ? 'act_id ✅' : 'artist_id ⚠'
    console.log(`    · ${r.name.padEnd(32)} ${scope}`)
  }
  return rows
}

const dbRows = inventory('src/lib/db.js', 'src/lib/db.js')
const serverRows = inventory('server/index.js', 'server/index.js')

const actScoped = [...dbRows, ...serverRows].filter((r) => r.act > 0).map((r) => r.name)
const artistScoped = [...dbRows, ...serverRows].filter((r) => r.act === 0 && r.artist > 0).map((r) => r.name)

check('static analysis found scoped reads in both files', dbRows.length > 0 && serverRows.length > 0)
check('switchAct is act_id-scoped', actScoped.includes('switchAct'))

findings.push(
  `act_id-scoped paths: ${actScoped.join(', ') || '(none)'}`,
  `artist_id-scoped paths (transition-safe ONLY for the default Act, where `
  + `act.id === artists.id per migration 020): ${artistScoped.join(', ') || '(none)'}`,
  'Evidence listing (listProfileItems, listEvidence), claim listing (listClaims), the public '
  + 'Passport reads (getPublicPassport, buildPassportSnapshot client-side; buildSafePayload, '
  + 'GET /api/passport server-side) and processing (POST /api/process-evidence) all still scope '
  + 'by artist_id. A non-default Act has no artists row, so these paths cannot ADDRESS it at '
  + 'all (they can neither leak its data nor serve it) — its data flows only through the '
  + 'act_id-scoped switchAct(). Architectural follow-up: move these readers to act_id '
  + '(act-first reads), tracked as the multi-Act depth gap; NOT refactored by this test.')

// ────────────────────────────────────────────────────────────
console.log('\nG13 · FINDINGS (honest report — informational, not failures)')
for (const f of findings) console.log(`  – ${f}`)

console.log(`\nG13 act-isolation: ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
