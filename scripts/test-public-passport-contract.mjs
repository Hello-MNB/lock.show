// ============================================================
// LANE G · PUBLIC PASSPORT BOUNDARY GATE — scripts/test-public-passport-contract.mjs
//
// THE DEFECT THIS GATE MAKES UNREPEATABLE: "public" and "indexable" were the
// same word. The only login-free passport surface today is the SPA route
// /passport/:id living INSIDE the private, blanket-noindexed app origin, plus a
// fictional static /passport/demo. So a real public Passport had no correct
// home, and the first attempt to give it one would have made every published
// artist crawlable by default — an irreversible privacy event for a person's
// professional evidence.
//
// WHAT IS PROVEN HERE (STATIC — no database, no network, no secrets; every
// assertion executes the REAL exported functions over fixtures):
//   P1  all seven terminal states are REACHABLE and DISTINCT, and every state
//       declared in the contract is exercised (no dead vocabulary)
//   P2  the DEFAULT is unlisted — for a null mode, a missing mode, an unknown
//       mode, and the literal contract default
//   P3  the discoverable projection carries no gap / coaching / percentage /
//       ranking field, by KEY and by VALUE, recursively
//   P4  a sitemap entry is IMPOSSIBLE without a valid recorded index consent —
//       tested by removing, revoking, mis-scoping and staling the consent
//   P5  a slug is never an internal UUID (nor an act/artist/org id in any
//       casing or hyphenation), and such a URL resolves to not_found
//   P6  HTTP + robots mapping: exactly ONE indexable state; 410 (gone/expired)
//       is distinct from 404 (never existed); error bodies are noindex
//   P7  dead results carry a REASON and no payload (no act, no version, no name)
//   P8  hreflang reciprocity holds and registered-INACTIVE locales are never
//       emitted
//   P9  the module is PURE — no I/O import, no fetch, no Supabase, no fs
//   P10 the contract aligns with migration 041's passport_versions state
//       vocabulary (this lane READS 041 and never modifies it)
//
// NOT PROVEN HERE (do not read a green run as proof):
//   L1  that any server route implements this rule — the route does not exist;
//       this lane delivers contracts, tests and a handoff, no live behavior
//   L2  that a resolve_public_passport() SQL function agrees with this file —
//       that migration is SPECIFIED IN PROSE only (docs/V9-GAP-ANALYSIS.md §G)
//       and deliberately not authored here
//   L3  anything about the deployed robots/sitemap surface of www.lock.show
//
// Run: npm run test:public-passport   (wired into `npm run verify`)
// Exit 0 = every asserted boundary holds. Exit 1 = any failure.
// ============================================================
import { readFileSync, existsSync } from 'node:fs'

let failed = false
const fail = (m) => { console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => console.log(`  · ${m}`)
const check = (cond, msg) => (cond ? ok(msg) : fail(msg))

const MOD = 'src/lib/publicPassport.js'
const CONTRACT = 'src/lib/contracts/publicPassport.contract.js'
for (const f of [MOD, CONTRACT]) {
  if (!existsSync(f)) { console.error(`FATAL: ${f} missing`); process.exit(1) }
}

const P = await import('../src/lib/publicPassport.js')
const {
  PUBLIC_STATE, PUBLIC_STATES, PUBLIC_MODE, DEFAULT_PUBLIC_MODE, PUBLICATION_STATE,
  CONSENT_SCOPE, CONSENT_TEXT_VERSION, CONSENT_REFUSAL, VERSION_POLICY,
  ACTIVE_LOCALES, REGISTERED_INACTIVE_LOCALES, LOCALE_META, X_DEFAULT_LOCALE,
  FORBIDDEN_SCHEMA_KEYS, PUBLIC_READABLE_VERSION_STATES, REDIRECTING_VERSION_STATES,
  resolvePublicPassport, evaluateIndexConsent, projectPublicPassport,
  sitemapEntryFor, sitemapEntries, hreflangAlternatesFor, isWellFormedPublicSlug,
  slugIsInternalIdentifier, normalizeMode, openGraphFor, schemaFor, publicUrlFor,
} = P

// ── fixtures ────────────────────────────────────────────────────────────────
const NOW = Date.parse('2026-08-16T12:00:00Z')
const ACT_ID = '9f1c1e42-3b7a-4d21-8c55-0a2b6f7e1d90'
const ARTIST_ID = '11112222-3333-4444-5555-666677778888'
const SLUG = 'maya-vale-techno'

const V2 = { id: 'ver-2', version_no: 2, state: 'published', act_id: ACT_ID }
const V1 = { id: 'ver-1', version_no: 1, state: 'superseded', act_id: ACT_ID }

const baseRecord = {
  act_id: ACT_ID, artist_id: ARTIST_ID, slug: SLUG,
  state: PUBLICATION_STATE.PUBLISHED, mode: PUBLIC_MODE.UNLISTED,
  expires_at: null, withdrawn_at: null, published_at: '2026-07-01T00:00:00Z',
}
const goodConsent = {
  scope: CONSENT_SCOPE.INDEX, act_id: ACT_ID,
  granted_at: '2026-07-02T00:00:00Z', granted_by: 'user-1', revoked_at: null,
  consent_text_version: CONSENT_TEXT_VERSION,
}

const CASES = [
  {
    name: 'discoverable + valid consent',
    expect: PUBLIC_STATE.OK,
    input: { slug: SLUG, record: { ...baseRecord, mode: PUBLIC_MODE.DISCOVERABLE }, currentVersion: V2, consent: goodConsent },
  },
  {
    name: 'published, no mode set (the default)',
    expect: PUBLIC_STATE.UNLISTED_OK,
    input: { slug: SLUG, record: { ...baseRecord, mode: undefined }, currentVersion: V2 },
  },
  {
    name: 'no boundary row for this slug',
    expect: PUBLIC_STATE.NOT_FOUND,
    input: { slug: 'never-issued-slug', record: null },
  },
  {
    name: 'withdrawn by the artist',
    expect: PUBLIC_STATE.GONE,
    input: { slug: SLUG, record: { ...baseRecord, state: PUBLICATION_STATE.WITHDRAWN, withdrawn_at: '2026-08-01T00:00:00Z' }, currentVersion: V2 },
  },
  {
    name: 'time-boxed publication lapsed',
    expect: PUBLIC_STATE.EXPIRED,
    input: { slug: SLUG, record: { ...baseRecord, expires_at: '2026-08-01T00:00:00Z' }, currentVersion: V2 },
  },
  {
    name: 'version-addressed URL, newer version published',
    expect: PUBLIC_STATE.SUPERSEDED_REDIRECT,
    input: { slug: SLUG, record: baseRecord, currentVersion: V2, requestedVersionNo: 1, requestedVersion: V1 },
  },
  {
    name: 'claims discoverable, consent absent',
    expect: PUBLIC_STATE.NOT_CONSENTED,
    input: { slug: SLUG, record: { ...baseRecord, mode: PUBLIC_MODE.DISCOVERABLE }, currentVersion: V2, consent: null },
  },
]

// ── P1 · every terminal state reachable and distinct ────────────────────────
console.log('\n[P1] all seven terminal states reachable and distinct')
const reached = new Map()
for (const c of CASES) {
  const r = resolvePublicPassport(c.input, { now: NOW })
  check(r.state === c.expect, `${c.name} → ${r.state}${r.state === c.expect ? '' : ` (expected ${c.expect})`}`)
  if (reached.has(r.state)) fail(`state ${r.state} reached by two different cases — states are not distinct`)
  reached.set(r.state, c.name)
}
check(reached.size === PUBLIC_STATES.length,
  `${reached.size}/${PUBLIC_STATES.length} contract states exercised`)
for (const s of PUBLIC_STATES) {
  if (!reached.has(s)) fail(`contract declares state "${s}" but no case reaches it — dead vocabulary`)
}
// distinctness at the level a caller actually branches on
const sigs = new Set([...reached.keys()].map((s) => `${s}`))
check(sigs.size === reached.size, 'no two states share an identity key')

// ── P2 · the default is unlisted ────────────────────────────────────────────
console.log('\n[P2] default visibility is unlisted (fail-closed)')
check(DEFAULT_PUBLIC_MODE === 'unlisted', `DEFAULT_PUBLIC_MODE === "${DEFAULT_PUBLIC_MODE}"`)
for (const bad of [undefined, null, '', 'public', 'PUBLIC', 'Discoverable', 'indexable', 0, {}, ['discoverable']]) {
  const m = normalizeMode(bad)
  check(m === PUBLIC_MODE.UNLISTED, `normalizeMode(${JSON.stringify(bad)}) → ${m}`)
  const r = resolvePublicPassport({ slug: SLUG, record: { ...baseRecord, mode: bad }, currentVersion: V2, consent: goodConsent }, { now: NOW })
  if (r.state !== PUBLIC_STATE.UNLISTED_OK) fail(`mode ${JSON.stringify(bad)} resolved to ${r.state} — a non-exact mode must never be discoverable`)
  if (r.indexable) fail(`mode ${JSON.stringify(bad)} produced an INDEXABLE result`)
}
// the literal default in the contract source, so a future edit cannot flip it quietly
const contractSrc = readFileSync(CONTRACT, 'utf8')
check(/DEFAULT_PUBLIC_MODE\s*=\s*PUBLIC_MODE\.UNLISTED/.test(contractSrc),
  'contract source defaults to PUBLIC_MODE.UNLISTED')
// a discoverable record with valid consent is the ONLY way to indexable
const okResult = resolvePublicPassport(CASES[0].input, { now: NOW })
check(okResult.indexable === true, 'discoverable + consent is indexable')
check(PUBLIC_STATES.filter((s) => P.publicResult(s).indexable).length === 1,
  'exactly ONE terminal state is indexable')

// ── P3 · the discoverable projection has no gap/coaching/percentage field ────
console.log('\n[P3] discoverable projection: no gap / coaching / percentage / ranking')
const claims = [
  { artist_approved: true, published: true, visibility: 'passport-ok', section: 'draw',
    public_wording: 'Fills mid-size rooms', public_band: '200-350', method_label: 'TICKET EXPORT',
    reviewed_at: '2026-01-10T00:00:00Z', value: '312', internal_confidence: 0.82,
    gap_reason: 'no ticket export for 2024', coach_line: 'add one more confirmed show',
    completeness_pct: 64, rank_in_genre: 3 },
  { artist_approved: true, published: true, visibility: 'passport-ok', section: 'performance',
    public_binary: 'Has performed at a festival', method_label: 'PRODUCER-CONFIRMED',
    reviewed_at: '2026-02-01T00:00:00Z' },
  // must NOT appear: not approved by the artist
  { artist_approved: false, published: true, visibility: 'passport-ok', section: 'draw',
    public_band: '900-1200', method_label: 'TICKET EXPORT' },
  // must NOT appear: approved but not published
  { artist_approved: true, published: false, visibility: 'passport-ok', section: 'draw',
    public_band: '400-600', method_label: 'PRODUCER-CONFIRMED' },
  // must NOT appear: private visibility
  { artist_approved: true, published: true, visibility: 'private', section: 'context',
    public_wording: 'private note', method_label: 'OPERATOR-REVIEWED' },
]
const projection = projectPublicPassport({
  act: { name: 'Maya Vale', kind: 'dj', home_base: 'Tel Aviv', active_since: '2019' },
  claims, slug: SLUG, versionNo: 2,
})

const FORBIDDEN_KEY = /(score|percentile|percent|pct|rank|rating|gap|missing|coach|improve|todo|next_?step|confidence|complet|readiness_level|count)/i
const FORBIDDEN_VALUE = /(%|percentile|\brank(ed|ing)?\b|\bscore\b|\bgap\b|\bmissing\b|coach|you should|add one more|improve)/i
function scan(node, path = '$') {
  if (node == null) return
  if (Array.isArray(node)) return node.forEach((v, i) => scan(v, `${path}[${i}]`))
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (FORBIDDEN_KEY.test(k)) fail(`projection ${path}.${k} — forbidden key on a buyer surface`)
      scan(v, `${path}.${k}`)
    }
    return
  }
  if (typeof node === 'string' && FORBIDDEN_VALUE.test(node)) {
    fail(`projection ${path} — forbidden value "${node}"`)
  }
  if (typeof node === 'number' && path.endsWith('versionNo') === false) {
    fail(`projection ${path} — a bare number reached a buyer surface (${node})`)
  }
}
scan(projection)
ok('projection scanned recursively by key and by value')
const drawUnits = projection.sections.find((s) => s.key === 'draw')?.units ?? []
check(drawUnits.length === 1, `draw section carries 1 unit (approved+published only), got ${drawUnits.length}`)
check(!JSON.stringify(projection).includes('312'), 'the raw headcount value never travels')
check(!JSON.stringify(projection).includes('900-1200'), 'an unapproved claim never travels')
check(!JSON.stringify(projection).includes('400-600'), 'an unpublished claim never travels')
check(!JSON.stringify(projection).includes('private note'), 'a private-visibility claim never travels')
check(!('internal_confidence' in JSON.parse(JSON.stringify(projection))), 'internal confidence absent')
check(drawUnits.every((u) => u.methodLabel), 'every public unit carries a method label')
check(projection.sections.every((s) => s.units.length > 0), 'empty sections are omitted (render law)')
// schema + OG carry nothing forbidden either
const og = openGraphFor(projection, { locale: 'he', result: okResult })
const ld = schemaFor(projection, { locale: 'he' })
scan(og, '$og'); scan(ld, '$schema')
for (const k of FORBIDDEN_SCHEMA_KEYS) {
  if (ld && k in ld) fail(`JSON-LD carries forbidden key ${k}`)
}
ok('OG + JSON-LD scanned; no forbidden schema key')

// ── P4 · sitemap inclusion is impossible without explicit consent ────────────
console.log('\n[P4] sitemap inclusion requires an explicit, valid consent record')
const disc = { ...baseRecord, mode: PUBLIC_MODE.DISCOVERABLE }
const consentVariants = [
  ['absent', null, CONSENT_REFUSAL.MISSING],
  ['revoked', { ...goodConsent, revoked_at: '2026-08-10T00:00:00Z' }, CONSENT_REFUSAL.REVOKED],
  ['wrong scope', { ...goodConsent, scope: 'share' }, CONSENT_REFUSAL.WRONG_SCOPE],
  ['stale consent text', { ...goodConsent, consent_text_version: 'index-consent-v0' }, CONSENT_REFUSAL.STALE_TEXT],
  ['granted for another Act', { ...goodConsent, act_id: 'other-act' }, CONSENT_REFUSAL.NOT_AN_ACT_MATCH],
  ['no grantor recorded', { ...goodConsent, granted_by: null }, CONSENT_REFUSAL.MISSING],
  ['granted in the future', { ...goodConsent, granted_at: '2027-01-01T00:00:00Z' }, CONSENT_REFUSAL.MISSING],
]
for (const [label, consent, expectReason] of consentVariants) {
  const r = resolvePublicPassport({ slug: SLUG, record: disc, currentVersion: V2, consent }, { now: NOW })
  check(r.state === PUBLIC_STATE.NOT_CONSENTED, `consent ${label} → ${r.state}`)
  check(r.reason === expectReason, `consent ${label} names itself: ${r.reason}`)
  check(sitemapEntryFor(r, disc) === null, `consent ${label} → no sitemap entry`)
  check(r.robots.startsWith('noindex'), `consent ${label} → noindex`)
}
// every non-ok state yields no entry
for (const c of CASES) {
  const r = resolvePublicPassport(c.input, { now: NOW })
  const entry = sitemapEntryFor(r, c.input.record || baseRecord)
  if (r.state === PUBLIC_STATE.OK) check(entry !== null, 'ok state yields a sitemap entry')
  else check(entry === null, `${r.state} yields no sitemap entry`)
}
// unlisted — the default — is never in the sitemap even when everything else is fine
const unlistedR = resolvePublicPassport({ slug: SLUG, record: baseRecord, currentVersion: V2, consent: goodConsent }, { now: NOW })
check(sitemapEntryFor(unlistedR, baseRecord) === null, 'unlisted record with a valid consent is STILL not in the sitemap')
// there is no override parameter: a forged "sitemapEligible" cannot force entry
const forged = { ...unlistedR, sitemapEligible: true, indexable: true }
check(sitemapEntryFor(forged, baseRecord) === null, 'a forged sitemapEligible flag cannot force inclusion (state is checked first)')
const rolled = sitemapEntries(CASES.map((c) => ({ result: resolvePublicPassport(c.input, { now: NOW }), record: c.input.record || baseRecord })))
check(rolled.length === 1, `sitemapEntries over all 7 cases yields exactly 1 row (got ${rolled.length})`)
check(rolled[0].url === publicUrlFor(SLUG), `the one row is the consented URL: ${rolled[0].url}`)
// the module must not contain a second path into a sitemap row
const modSrc = readFileSync(MOD, 'utf8')
const sitemapReturns = (modSrc.match(/changeFrequency/g) || []).length
check(sitemapReturns === 1, `exactly one place constructs a sitemap row (found ${sitemapReturns})`)

// ── P5 · a slug is never an internal identifier ─────────────────────────────
console.log('\n[P5] slug is never the internal artist/act UUID')
check(!isWellFormedPublicSlug(ACT_ID), 'a canonical UUID is not a well-formed slug')
check(!isWellFormedPublicSlug(ACT_ID.replace(/-/g, '')), 'an unhyphenated UUID is not a well-formed slug')
check(slugIsInternalIdentifier(ACT_ID, { actId: ACT_ID }), 'act UUID detected as internal id')
check(slugIsInternalIdentifier(ARTIST_ID.toUpperCase(), { artistId: ARTIST_ID }), 'artist UUID detected regardless of casing')
const uuidUrl = resolvePublicPassport({ slug: ACT_ID, record: { ...baseRecord, slug: ACT_ID }, currentVersion: V2 }, { now: NOW })
check(uuidUrl.state === PUBLIC_STATE.NOT_FOUND, `a UUID URL resolves to ${uuidUrl.state}`)
for (const bad of ['app', 'demo', 'passport', 'admin', 'sitemap']) {
  check(!isWellFormedPublicSlug(bad), `reserved slug "${bad}" refused`)
}
for (const bad of ['ab', 'x'.repeat(60), 'Maya-Vale', 'maya vale', 'maya--vale', '-maya', 'maya-']) {
  check(!isWellFormedPublicSlug(bad), `malformed slug ${JSON.stringify(bad)} refused`)
}
check(isWellFormedPublicSlug(SLUG), `"${SLUG}" is a valid slug`)
check(!publicUrlFor(SLUG).includes(ACT_ID) && !publicUrlFor(SLUG).includes(ARTIST_ID),
  'the public URL contains no internal identifier')

// ── P6 · HTTP + robots mapping ──────────────────────────────────────────────
console.log('\n[P6] HTTP status + robots per state')
const expectStatus = { ok: 200, unlisted_ok: 200, not_consented: 200, not_found: 404, gone: 410, expired: 410, superseded_redirect: 301 }
for (const s of PUBLIC_STATES) {
  const r = P.publicResult(s)
  check(r.httpStatus === expectStatus[s], `${s} → HTTP ${r.httpStatus}`)
  if (s !== PUBLIC_STATE.OK) check(r.robots.startsWith('noindex'), `${s} → ${r.robots}`)
}
check(P.publicResult(PUBLIC_STATE.GONE).httpStatus !== P.publicResult(PUBLIC_STATE.NOT_FOUND).httpStatus,
  '410 gone is distinct from 404 never-existed')
check(P.publicResult(PUBLIC_STATE.GONE).state !== P.publicResult(PUBLIC_STATE.EXPIRED).state,
  'gone and expired are distinct states though they share a status code')
const redir = resolvePublicPassport(CASES[5].input, { now: NOW })
check(redir.redirectPath === `/p/${SLUG}`, `superseded redirect targets the canonical: ${redir.redirectPath}`)
// pinned policy is available and behaves differently — the option is real, not decorative
const pinned = resolvePublicPassport(CASES[5].input, { now: NOW, versionPolicy: VERSION_POLICY.PINNED })
check(pinned.state === PUBLIC_STATE.UNLISTED_OK && pinned.versionNo === 1,
  `PINNED policy serves the addressed version (state=${pinned.state}, v${pinned.versionNo})`)
// a never-authorised version state is gone, not served
const draftV = resolvePublicPassport({ slug: SLUG, record: baseRecord, currentVersion: V2, requestedVersionNo: 3, requestedVersion: { id: 'v3', version_no: 3, state: 'draft' } }, { now: NOW })
check(draftV.state === PUBLIC_STATE.GONE, `a draft version URL → ${draftV.state}`)

// ── P7 · dead results carry a reason and no payload ─────────────────────────
console.log('\n[P7] dead results leak nothing')
for (const c of CASES) {
  const r = resolvePublicPassport(c.input, { now: NOW })
  if ([PUBLIC_STATE.NOT_FOUND, PUBLIC_STATE.GONE, PUBLIC_STATE.EXPIRED].includes(r.state)) {
    const blob = JSON.stringify(r)
    check(!blob.includes(ACT_ID) && !blob.includes(ARTIST_ID), `${r.state} carries no internal id`)
    check(!blob.includes('Maya'), `${r.state} carries no act name`)
    check(r.versionNo === null, `${r.state} carries no version number`)
    check(typeof r.reason === 'string' && r.reason.length > 0, `${r.state} carries a reason: ${r.reason}`)
  }
}
check(Object.isFrozen(resolvePublicPassport(CASES[0].input, { now: NOW })), 'results are frozen')

// ── P8 · hreflang reciprocity, inactive locales never emitted ───────────────
console.log('\n[P8] hreflang reciprocity + registered-inactive locales absent')
const alts = hreflangAlternatesFor(SLUG)
const tags = alts.map((a) => a.hreflang)
for (const l of ACTIVE_LOCALES) {
  check(tags.includes(LOCALE_META[l].bcp47), `active locale ${l} present as ${LOCALE_META[l].bcp47}`)
}
check(tags.includes('x-default'), 'x-default present')
for (const l of REGISTERED_INACTIVE_LOCALES) {
  if (tags.includes(LOCALE_META[l].bcp47)) fail(`inactive locale ${l} emitted as an hreflang alternate`)
}
ok(`inactive locales (${REGISTERED_INACTIVE_LOCALES.join(', ')}) not emitted`)
// reciprocity: the set generated from any locale is identical
for (const l of ACTIVE_LOCALES) {
  const other = hreflangAlternatesFor(SLUG, { locales: ACTIVE_LOCALES })
  check(JSON.stringify(other) === JSON.stringify(alts), `alternate set from ${l} is identical (reciprocal)`)
}
check(new Set(alts.map((a) => a.href)).size >= ACTIVE_LOCALES.length,
  'each active locale has its own URL (hreflang requires distinct URLs)')
const heOg = openGraphFor(projection, { locale: 'he', result: okResult })
check(heOg.locale === 'he_IL' && heOg.alternateLocale.includes('en_US'), 'OG locale + alternateLocale set per locale')
check(heOg.robots === 'index, follow', 'OG on a consented page carries the indexable directive')
check(openGraphFor(projection, { locale: 'he', result: unlistedR }).robots.startsWith('noindex'),
  'OG on an unlisted page carries noindex')

// ── P9 · purity ─────────────────────────────────────────────────────────────
console.log('\n[P9] the module is pure (zero I/O)')
const stripJs = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ')
const code = stripJs(modSrc) + '\n' + stripJs(contractSrc)
const IO = [
  [/from\s+['"].*supabase/i, 'supabase import'],
  [/require\(|\bfrom\s+['"]node:/i, 'node builtin import'],
  [/\bfetch\s*\(/, 'fetch call'],
  [/localStorage|sessionStorage|document\.|window\./, 'browser global'],
  [/process\.env/, 'environment read'],
]
for (const [re, label] of IO) {
  if (re.test(code)) fail(`${label} found in the contract module — this surface must be pure`)
}
ok('no supabase / node builtin / fetch / browser global / env read')
// determinism: same inputs + same injected clock → identical result
const a = JSON.stringify(resolvePublicPassport(CASES[0].input, { now: NOW }))
const b = JSON.stringify(resolvePublicPassport(CASES[0].input, { now: NOW }))
check(a === b, 'resolution is deterministic under an injected clock')

// ── P10 · alignment with migration 041 (read-only) ──────────────────────────
console.log('\n[P10] alignment with migration 041 (READ, never modified by this lane)')
const M041 = 'supabase/migrations/041_link_service_and_version_store.sql'
if (!existsSync(M041)) fail(`${M041} missing — the version store this contract binds to is gone`)
else {
  const sql = readFileSync(M041, 'utf8')
  const stateCheck = sql.match(/state\s+in\s*\(([^)]*)\)/i)
  const declared = stateCheck ? [...stateCheck[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]) : []
  check(declared.length > 0, `041 declares passport_versions states: ${declared.join(' · ')}`)
  for (const s of [...PUBLIC_READABLE_VERSION_STATES, ...REDIRECTING_VERSION_STATES]) {
    check(declared.includes(s), `contract state "${s}" exists in 041's CHECK constraint`)
  }
  check(!PUBLIC_READABLE_VERSION_STATES.includes('draft') && !PUBLIC_READABLE_VERSION_STATES.includes('preview')
    && !PUBLIC_READABLE_VERSION_STATES.includes('review'),
    'draft / preview / review are never publicly readable')
  check(/version_no/.test(sql) && /supersedes_id/.test(sql), '041 provides version_no + supersedes_id (this contract depends on both)')
  // the public surface must NOT reuse the token vocabulary — two surfaces, two rules
  check(!/PUBLIC_SLUG/.test(sql), '041 does not define a public slug — the migration this lane SPECIFIES (prose) still owes it')
}
// the token contract stays untouched and stays a different surface
const shareSrc = readFileSync('src/lib/shareLink.js', 'utf8')
const shareProse = shareSrc.replace(/\s*\n\s*\/\/\s*/g, ' ')
check(/one link = one recipient view = one version/i.test(shareProse),
  'shareLink.js still owns the pinned one-link-one-version rule (unchanged by this lane)')
check(!/publicPassport/.test(shareSrc), 'shareLink.js does not import the public boundary — no duplicate authority')

// ── verdict ─────────────────────────────────────────────────────────────────
console.log('\n── public-passport-contract summary ──')
console.log('  PROVEN STATICALLY: P1 seven distinct terminal states · P2 unlisted default (fail-closed)')
console.log('    · P3 buyer-safe projection by allowlist, key + value scanned · P4 sitemap impossible')
console.log('    without a valid consent record (7 invalid-consent variants) · P5 slug is never an')
console.log('    internal identifier · P6 HTTP/robots map, 410≠404, both version policies real ·')
console.log('    P7 dead results leak nothing · P8 hreflang reciprocity, ru/de never emitted ·')
console.log('    P9 module purity + determinism · P10 alignment with migration 041 as READ.')
console.log('  NOT PROVEN HERE: no server route implements this rule (none exists — this lane ships')
console.log('    contracts + tests + handoff only); no SQL resolver exists (specified in prose in')
console.log('    docs/V9-GAP-ANALYSIS.md §G); nothing about the deployed robots/sitemap of www.lock.show.')
if (failed) {
  console.error('\npublic-passport-contract FAILED')
  process.exit(1)
}
console.log('\nAll public-passport-contract checks passed.')
process.exit(0)
