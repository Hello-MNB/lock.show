#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// LOCK DS-drift inspector (T-46 · spec §5.6 + §5.11 · ASSET-REGISTRY hermetic law)
//
// Standalone check — exits 1 on:
//   (a) TOKEN DRIFT   — value mismatch between tailwind.config.js theme
//                       (colors / fontSize / fontFamily / borderRadius /
//                       boxShadow / animation) and their src/tokens.ts mirrors.
//   (b) ROGUE HEX     — raw #xxx / #xxxxxx colors in src/**/*.jsx outside the
//                       principled allowlist below (§5.6: components NEVER
//                       hardcode a colour).
//   (c) ASSET LAW     — static <img src="..."> or inline <svg> in
//                       src/features/** that bypasses the ASSET-REGISTRY
//                       sources (docs/design-system/ASSET-REGISTRY.md: an
//                       asset that isn't in the table doesn't get committed).
//                       Dynamic <img src={...}> is entity content (artist
//                       photos — UX law 4) and is ALLOWED.
//
// Usage:
//   node scripts/test-ds-drift.mjs               # inspect the working tree
//   node scripts/test-ds-drift.mjs --selftest    # prove the checks catch drift
//   node scripts/test-ds-drift.mjs --tokens <p>  # (test hook) alternate tokens.ts
//
// Allowlist policy (L-6): a firewall/DS finding is never silently self-waived —
// every allowlist entry below carries the reason; pre-existing violations found
// at inspector-birth (17 Jul) are allowlisted WITH a TODO so the build stays
// green on day one, but NEW drift of any kind fails immediately.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const SELFTEST = args.includes('--selftest')
const tokensArgIdx = args.indexOf('--tokens')
const TOKENS_PATH = tokensArgIdx !== -1 ? resolve(args[tokensArgIdx + 1]) : join(ROOT, 'src/tokens.ts')
const TAILWIND_PATH = join(ROOT, 'tailwind.config.js')

const failures = []
const warnings = []
const fail = (m) => failures.push(m)
const warn = (m) => warnings.push(m)

// ── shared helpers ───────────────────────────────────────────────────────────

const kebabToCamel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())

/** Normalize a CSS-ish value so cosmetic differences don't count as drift. */
function norm(v) {
  let s = String(v).trim().toLowerCase()
  s = s.replace(/\s+/g, ' ')
  // 3-digit hex → 6-digit
  s = s.replace(/#([0-9a-f]{3})\b/g, (_, h) => '#' + [...h].map((c) => c + c).join(''))
  // tighten function-call spacing: rgba( 1 , 2 ) → rgba(1,2)
  s = s.replace(/\(\s*/g, '(').replace(/\s*\)/g, ')').replace(/\s*,\s*/g, ',')
  // leading zero: .08 → 0.08 (after commas/parens/space/start)
  s = s.replace(/(^|[\s(,])\.(\d)/g, '$10.$2')
  return s
}

function* walk(dir, ext) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p, ext)
    else if (p.endsWith(ext)) yield p
  }
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length

// ── (a) token drift: tailwind.config.js theme ⇄ src/tokens.ts ───────────────

/** Extract `export const NAME = {...} as const` maps from tokens.ts source. */
function parseTokensTs(source) {
  const maps = {}
  const re = /export const (\w+)\s*=\s*(\{[\s\S]*?\})\s*as const/g
  let m
  while ((m = re.exec(source))) {
    let body = m[2]
      .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
      .replace(/\/\/[^\n]*/g, '') // line comments (no // appears inside token values)
    try {
      maps[m[1]] = new Function(`return (${body})`)()
    } catch (e) {
      fail(`(a) tokens.ts: cannot parse export const ${m[1]}: ${e.message}`)
    }
  }
  return maps
}

// Pre-existing mismatches found at inspector-birth (17 Jul). Each entry keeps
// the build green ONLY for this exact tailwind↔tokens value pair; if either
// side changes to a third value, the mismatch fails again (new drift).
// TODO(T-46 follow-up, needs owner/§5.11 reconcile): tokens.ts is stale —
// §5.11 says input=8 · button=10 and the DS v1.2.0 lime is #C8F04D
// (rgb(200,240,77)); fix tokens.ts, then delete these three entries.
const KNOWN_DRIFT = new Map([
  ['borderRadius.input', { tailwind: '8px', tokens: '11px' }],
  ['borderRadius.button', { tailwind: '10px', tokens: '12px' }],
  ['boxShadow.glow', {
    tailwind: '0 10px 26px -10px rgba(200,240,77,0.5)',
    tokens: '0 10px 26px -10px rgba(190,226,78,0.5)',
  }],
])

function checkTokenDrift(twTheme, tokens, report) {
  let compared = 0
  const compare = (section, key, twVal, tokVal) => {
    compared++
    const a = norm(twVal)
    const b = norm(tokVal)
    if (a === b) return
    const known = KNOWN_DRIFT.get(`${section}.${key}`)
    if (known && norm(known.tailwind) === a && norm(known.tokens) === b) {
      warn(`(a) KNOWN drift (allowlisted, TODO): ${section}.${key} tailwind="${twVal}" tokens.ts="${tokVal}"`)
      return
    }
    report(`(a) TOKEN DRIFT ${section}.${key}: tailwind.config.js="${twVal}" vs src/tokens.ts="${tokVal}"`)
  }

  // colors — every tailwind color whose camelCase twin exists in tokens.colors
  const tokColors = tokens.colors ?? {}
  for (const [k, v] of Object.entries(twTheme.colors ?? {})) {
    const camel = kebabToCamel(k)
    if (camel in tokColors) compare('colors', k, v, tokColors[camel])
  }
  // status pairs — tailwind flat `found`/`found-bg` ⇄ tokens.status.found.{fg,bg}
  for (const [state, pair] of Object.entries(tokens.status ?? {})) {
    if (twTheme.colors?.[state] != null) compare('status', `${state}.fg`, twTheme.colors[state], pair.fg)
    if (twTheme.colors?.[`${state}-bg`] != null) compare('status', `${state}.bg`, twTheme.colors[`${state}-bg`], pair.bg)
  }
  // fontFamily — tailwind array ⇄ tokens string
  for (const [k, v] of Object.entries(twTheme.fontFamily ?? {})) {
    if (tokens.fontFamily?.[k] != null) compare('fontFamily', k, [].concat(v).join(', '), tokens.fontFamily[k])
  }
  // fontSize — tailwind [size,{lineHeight,fontWeight}] ⇄ tokens.type {size,lh,weight}
  for (const [role, def] of Object.entries(twTheme.fontSize ?? {})) {
    const mirror = tokens.type?.[role]
    if (!mirror) continue
    const [size, opts = {}] = Array.isArray(def) ? def : [def]
    compare('fontSize', `${role}.size`, size, mirror.size)
    if (opts.lineHeight != null && mirror.lh != null) compare('fontSize', `${role}.lineHeight`, opts.lineHeight, mirror.lh)
    if (opts.fontWeight != null && mirror.weight != null) compare('fontSize', `${role}.weight`, opts.fontWeight, mirror.weight)
  }
  // borderRadius — shared keys only (each side may declare extra aliases)
  for (const [k, v] of Object.entries(twTheme.borderRadius ?? {})) {
    if (tokens.borderRadius?.[k] != null) compare('borderRadius', k, v, tokens.borderRadius[k])
  }
  // boxShadow — kebab ⇄ camel (glow-gold ⇄ glowGold)
  for (const [k, v] of Object.entries(twTheme.boxShadow ?? {})) {
    const camel = kebabToCamel(k)
    if (tokens.shadow?.[camel] != null) compare('boxShadow', k, v, tokens.shadow[camel])
  }
  // animation — fade-in ⇄ fadeIn
  for (const [k, v] of Object.entries(twTheme.animation ?? {})) {
    const camel = kebabToCamel(k)
    if (tokens.animation?.[camel] != null) compare('animation', k, v, tokens.animation[camel])
  }
  return compared
}

// ── (b) rogue raw hex in src/**/*.jsx ────────────────────────────────────────

const HEX_RE = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g

// Whole-file allowlist — files whose JOB is to hold literal colors.
const HEX_FILE_ALLOWLIST = new Set([
  'src/components/ui.jsx', // DS primitives: Google/Facebook OAuth brand logos + platform glyph brand-color map (external brand hexes, not our palette)
  'src/components/PlatformLogo.jsx', // canon asset source (ASSET-REGISTRY row 3) — platform brand colors live here by design
])

// Value allowlist — hexes that duplicate an existing token as an arbitrary
// Tailwind value. Principled today, but REAL violations of §5.6 ("never
// hardcode a colour"); migrate call-sites to token classes, then delete rows.
const HEX_VALUE_ALLOWLIST = new Map([
  ['#12160a', 'tokens.ts onAccent — TODO(T-46 follow-up): add `on-accent` to tailwind.config colors and migrate text-[#12160A] → text-on-accent'],
  ['#cbee72', '= colors.good — TODO(T-46 follow-up): migrate text-[#CBEE72] → text-good'],
  ['#f0b478', '= colors.need — TODO(T-46 follow-up): migrate text-[#F0B478] → text-need'],
  ['#9aa29b', '= colors.na — TODO(T-46 follow-up): migrate text-[#9AA29B] → text-na'],
])

function checkRogueHex(relPath, content, report) {
  if (HEX_FILE_ALLOWLIST.has(relPath)) return
  for (const m of content.matchAll(HEX_RE)) {
    const hex = norm(m[0])
    if (HEX_VALUE_ALLOWLIST.has(hex)) continue
    report(`(b) ROGUE HEX ${relPath}:${lineOf(content, m.index)} — ${m[0]} is not a token; use a tailwind token class (§5.6: never hardcode a colour)`)
  }
}

// ── (c) asset law in src/features/** ─────────────────────────────────────────

// Matches <img ... src=X  (multi-line safe: [^>] spans newlines) and <svg.
const IMG_RE = /<img\b[^>]*?\bsrc\s*=\s*(\{|"|')/g
const SVG_RE = /<svg\b/g

// Pre-existing bypasses found at inspector-birth (17 Jul), each capped at the
// count found then — one MORE occurrence in the same file still fails.
// TODO(T-46 follow-up): move the four inline icon <svg>s into the GpIcon
// sprite (ui.jsx / gigproof-icons.svg) and register or replace the AuthScene
// hero image in docs/design-system/ASSET-REGISTRY.md, then delete these rows.
const ASSET_ALLOWLIST = new Map([
  ['src/features/auth/ForgotPassword.jsx|svg', 1], // back-arrow/mail icon — belongs in GpIcon sprite
  ['src/features/auth/Settings.jsx|svg', 1], // chevron accordion icon — belongs in GpIcon sprite
  ['src/features/auth/Signup.jsx|svg', 1], // password-visibility icon — belongs in GpIcon sprite
  ['src/features/passport/RequestConfirmation.jsx|svg', 1], // decorative check glyph — belongs in GpIcon sprite
  ['src/features/auth/AuthScene.jsx|img-static', 1], // /assets/gigproof-live-hero.webp — not an ASSET-REGISTRY row; register or replace
])

function checkAssetLaw(relPath, content, report) {
  const counts = { svg: 0, 'img-static': 0 }
  const hits = { svg: [], 'img-static': [] }
  for (const m of content.matchAll(IMG_RE)) {
    if (m[1] === '{') continue // dynamic src={...} = entity content (artist photo) — allowed
    counts['img-static']++
    hits['img-static'].push(lineOf(content, m.index))
  }
  for (const m of content.matchAll(SVG_RE)) {
    counts.svg++
    hits.svg.push(lineOf(content, m.index))
  }
  for (const kind of ['svg', 'img-static']) {
    const allowed = ASSET_ALLOWLIST.get(`${relPath}|${kind}`) ?? 0
    if (counts[kind] > allowed) {
      report(
        `(c) ASSET LAW ${relPath} (lines ${hits[kind].join(', ')}) — ${counts[kind]}× ${kind === 'svg' ? 'inline <svg>' : 'static <img src="...">'} ` +
        `(allowlisted: ${allowed}); components import from ASSET-REGISTRY sources only (docs/design-system/ASSET-REGISTRY.md)`
      )
    }
  }
}

// ── selftest — prove each check CATCHES synthetic drift ─────────────────────

async function selftest() {
  let ok = true
  const expect = (name, arr, want) => {
    const got = arr.length > 0
    if (got !== want) { ok = false; console.error(`SELFTEST FAIL: ${name} — expected ${want ? 'a finding' : 'no finding'}, got ${JSON.stringify(arr)}`) }
    else console.log(`selftest ok: ${name}`)
  }

  // (a) catches a color mismatch
  let f = []
  checkTokenDrift({ colors: { accent: '#C8F04D' } }, { colors: { accent: '#BEE24E' } }, (m) => f.push(m))
  expect('(a) flags color value drift', f, true)
  // (a) clean mirror passes (incl. normalization: array font vs string, 3- vs 6-digit hex)
  f = []
  checkTokenDrift(
    { colors: { ink: '#FFF' }, fontFamily: { sans: ['"Heebo"', 'sans-serif'] }, boxShadow: { 'glow-gold': '0 0 12px 0 rgba(242,192,99,.22)' } },
    { colors: { ink: '#ffffff' }, fontFamily: { sans: '"Heebo", sans-serif' }, shadow: { glowGold: '0 0 12px 0 rgba(242, 192, 99, 0.22)' } },
    (m) => f.push(m)
  )
  expect('(a) normalized equal values pass', f, false)
  // (a) KNOWN_DRIFT downgrades ONLY the recorded pair
  f = []
  checkTokenDrift({ borderRadius: { input: '8px' } }, { borderRadius: { input: '11px' } }, (m) => f.push(m))
  expect('(a) known drift pair is warn-only', f, false)
  f = []
  checkTokenDrift({ borderRadius: { input: '8px' } }, { borderRadius: { input: '13px' } }, (m) => f.push(m))
  expect('(a) NEW value on a known-drift key still fails', f, true)
  // (a) tokens.ts parser round-trips a real-shaped source
  const parsed = parseTokensTs(`// c\nexport const colors = {\n  bg: '#0B0C0B', // canvas\n} as const\nexport const status = { found: { fg: '#F2C063', bg: 'rgba(242,192,99,.08)' } } as const`)
  expect('(a) tokens.ts parser extracts maps', Object.keys(parsed.colors ?? {}).length === 1 && parsed.status?.found?.fg === '#F2C063' ? ['ok'] : [], true)

  // (b) catches a rogue hex; passes allowlisted value + allowlisted file
  f = []
  checkRogueHex('src/features/x/Fake.jsx', `<div className="text-[#FF0000]" />`, (m) => f.push(m))
  expect('(b) flags rogue hex', f, true)
  f = []
  checkRogueHex('src/features/x/Fake.jsx', `<div className="bg-accent text-[#12160A]" />`, (m) => f.push(m))
  expect('(b) value-allowlisted hex passes', f, false)
  f = []
  checkRogueHex('src/components/ui.jsx', `<path fill="#4285F4" />`, (m) => f.push(m))
  expect('(b) file-allowlisted brand hex passes', f, false)

  // (c) catches static img + inline svg; allows dynamic entity photos
  f = []
  checkAssetLaw('src/features/x/Fake.jsx', `<img src="/assets/rogue.png" alt="" />`, (m) => f.push(m))
  expect('(c) flags static <img src="...">', f, true)
  f = []
  checkAssetLaw('src/features/x/Fake.jsx', `<svg viewBox="0 0 24 24"><path d="M0 0" /></svg>`, (m) => f.push(m))
  expect('(c) flags inline <svg>', f, true)
  f = []
  checkAssetLaw('src/features/x/Fake.jsx', `<img\n  src={artist.photo_url}\n  alt="" />`, (m) => f.push(m))
  expect('(c) dynamic <img src={...}> (entity content) passes', f, false)
  f = []
  checkAssetLaw('src/features/auth/Settings.jsx', `<svg /><svg />`, (m) => f.push(m))
  expect('(c) exceeding an allowlisted count fails', f, true)

  console.log(ok ? '\nDS-DRIFT SELFTEST PASS' : '\nDS-DRIFT SELFTEST FAIL')
  process.exit(ok ? 0 : 1)
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (SELFTEST) return selftest()

  // (a)
  const twTheme = (await import(pathToFileURL(TAILWIND_PATH).href)).default?.theme?.extend
  if (!twTheme) fail('(a) tailwind.config.js: could not read theme.extend')
  const tokens = parseTokensTs(readFileSync(TOKENS_PATH, 'utf8'))
  const compared = twTheme ? checkTokenDrift(twTheme, tokens, fail) : 0
  // coverage guard: a silent parse failure must not look like a pass
  if (twTheme && compared < 40) fail(`(a) coverage guard: only ${compared} token pairs compared (expected ≥40) — parser drifted from tokens.ts/tailwind shape`)

  // (b) + (c)
  let jsxCount = 0
  for (const p of walk(join(ROOT, 'src'), '.jsx')) {
    jsxCount++
    const rel = relative(ROOT, p).replaceAll('\\', '/')
    const content = readFileSync(p, 'utf8')
    checkRogueHex(rel, content, fail)
    if (rel.startsWith('src/features/')) checkAssetLaw(rel, content, fail)
  }
  if (jsxCount === 0) fail('(b/c) coverage guard: no .jsx files found under src/')

  for (const w of warnings) console.log(`⚠ ${w}`)
  if (failures.length) {
    console.error(`\nDS-DRIFT: ${failures.length} failure(s)`)
    for (const f of failures) console.error(`✗ ${f}`)
    process.exit(1)
  }
  console.log(`\nDS-DRIFT PASS — ${compared} token pairs in sync (${warnings.length} known-drift TODOs), ${jsxCount} jsx files clean of rogue hex, asset law holds in src/features/**`)
}

main().catch((e) => { console.error('DS-DRIFT crashed:', e); process.exit(1) })
