#!/usr/bin/env node
/**
 * CLIENT-STORE CONTRACT — WEB-021A.1E
 *
 * Executable proof for the two components repaired in the RUNTIME defect packet:
 *   · website-next/components/consent-banner.tsx
 *   · website-next/lib/locale-context.tsx
 *
 * Both used to mirror localStorage into React state with a synchronous
 * setState inside a mount effect (react-hooks/set-state-in-effect). Both now
 * READ the store with useSyncExternalStore and keep only external-system
 * writes (gtag.js injection, <html lang>/<html dir>) inside effects.
 *
 * WHY THIS FILE EXISTS. `eslint` going green proves the RULE is satisfied; it
 * cannot see a behaviour regression, and the existing rendered gate cannot
 * either — test-hero-contract.mjs R4 does `if (!hero || !banner) return null`,
 * so a consent banner that never renders passes it VACUOUSLY. Every assertion
 * below is therefore driven through a real browser against the built export,
 * and each one is mutation-tested in the WEB-021A.1E evidence record.
 *
 * Chromium is REQUIRED here, not optional. A skip is not a pass: without a
 * browser this file exits NON-ZERO rather than reporting green, because its
 * entire purpose is the rendered behaviour.
 */

import { createServer } from 'node:http'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(DIR, '..', 'website-next', 'out')

const CONSENT_KEY = 'gigproof_consent'
const LOCALE_KEY = 'gp_locale'
const GA_SCRIPT = '#ga4-src'
const BANNER = '.consent-banner'
const TOGGLE = 'header button[aria-label*="Hebrew"], header button[aria-label*="English"]'

const findings = []
let checks = 0
// `checks` counts CONTRACT assertions only. The non-vacuity check at the end is
// a meta-assertion about this file and must not inflate the number it reports —
// independent QA caught it counting itself ("21 rendered" vs "22 hold").
function check(label, cond, detail = '', meta = false) {
  if (!meta) checks++
  if (cond) console.log(`  ✓ ${label}`)
  else findings.push(`${label}${detail ? ` — ${detail}` : ''}`)
}

// ── static server (resolution-bug-safe pattern per test-site-nav.mjs) ────────
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml' }
function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname.split('?')[0].split('#')[0])
  const rel = clean.replace(/\/+$/, '') || '/'
  const fsPath = path.join(OUT, rel)
  if (!fsPath.startsWith(OUT)) return null
  if (existsSync(fsPath)) {
    const st = statSync(fsPath)
    if (st.isFile()) return fsPath
    if (st.isDirectory()) {
      const index = path.join(fsPath, 'index.html')
      if (existsSync(index)) return index
      if (existsSync(`${fsPath}.html`)) return `${fsPath}.html`
      return null
    }
  }
  if (existsSync(`${fsPath}.html`)) return `${fsPath}.html`
  return null
}
const server = createServer((req, res) => {
  const file = resolveFile(req.url ?? '/')
  if (file) { res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' }); res.end(readFileSync(file)); return }
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
  res.end('Not found')
})

function fail(msg) { console.error(`\n✖ CLIENT-STORE CONTRACT: ${msg}`); process.exit(1) }

if (!existsSync(path.join(OUT, 'index.html'))) {
  fail('website-next/out/index.html missing — run `npx next build` in website-next first.')
}

// ── FRESHNESS. Found by mutation-testing THIS file: a mutation whose build
// FAILED left the previous out/ in place, and every assertion below sailed
// through green against code that no longer existed. A rendered gate that does
// not check the age of its own artifact certifies the last good build, not the
// working tree. An empty-corpus guard catches "nothing"; it cannot catch
// "stale".
{
  const built = statSync(path.join(OUT, 'index.html')).mtimeMs
  const src = execSync(
    "git ls-files -- website-next/app website-next/components website-next/lib " +
    "website-next/content website-next/messages website-next/styles " +
    // Config files change the OUTPUT without changing a component. Independent
    // QA found them missing from this corpus: editing next.config.ts and
    // skipping the rebuild left exactly the stale-artifact hole this check
    // exists to close.
    "website-next/next.config.ts website-next/package.json " +
    "website-next/package-lock.json website-next/postcss.config.mjs " +
    "website-next/tsconfig.json website-next/eslint.config.mjs " +
    // public/** is copied verbatim into out/, and proxy.ts + vercel.json
    // shape what is served. Independent QA showed the previous corpus said
    // "all 57 tracked website sources" while 203 public assets sat outside
    // it — an edit to public/ left a stale out/ certified green.
    "website-next/public website-next/proxy.ts website-next/vercel.json",
    { cwd: path.join(DIR, '..'), encoding: 'utf8' },
  ).split('\n').filter(Boolean)
  if (!src.length) fail('freshness: no tracked website sources enumerated — the freshness check itself is vacuous')
  let newest = 0, newestFile = ''
  for (const rel of src) {
    const abs = path.join(DIR, '..', rel)
    if (!existsSync(abs)) continue
    const m = statSync(abs).mtimeMs
    if (m > newest) { newest = m; newestFile = rel }
  }
  if (newest > built) {
    fail(`freshness: website-next/out is OLDER than ${newestFile} — rebuild (\`npx next build\` in website-next) before trusting these rendered assertions. A stale artifact turns this gate into a false green.`)
  }
  console.log(`  · freshness: out/ newer than all ${src.length} enumerated website sources (newest: ${newestFile})`)
}

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch (err) {
  fail(`playwright unavailable (${String(err).split('\n')[0]}) — this gate is rendered-only, a skip is NOT a pass.`)
}

const browser = await chromium.launch().catch((err) => {
  fail(`chromium failed to launch (${String(err).split('\n')[0]}) — this gate is rendered-only, a skip is NOT a pass.`)
})

await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

// `at` is written by the page itself; seeding uses a fresh timestamp so the
// 12-month expiry in readChoice() never silently invalidates the fixture.
const seedConsent = (v) =>
  `localStorage.setItem(${JSON.stringify(CONSENT_KEY)}, JSON.stringify({ value: ${JSON.stringify(v)}, at: Date.now() }))`

async function fresh(init) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  if (init) await ctx.addInitScript(init)
  const page = await ctx.newPage()
  return { ctx, page }
}

// ── P · PRECONDITION ────────────────────────────────────────────────────────
// Independent QA served a stub out/: the gate did exit non-zero, but via an
// uncaught Playwright TimeoutError deep in section A rather than a named
// failure. Exit codes were right, the diagnosis was noise. Fail here instead.
console.log('\n[P] precondition — the export is actually being served')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const res = await page.goto(`${base}/`, { waitUntil: 'load' }).catch(() => null)
  check('P1 GET / returns 200', !!res && res.status() === 200, `status ${res ? res.status() : 'no response'}`)
  check('P2 the served home page carries the site header (not a 404 body)',
    await page.locator('header').count() >= 1)
  await ctx.close()
  if (findings.length) {
    console.error(`\n✖ CLIENT-STORE CONTRACT — precondition failed, not running the contract:`)
    for (const f of findings) console.error(`  · ${f}`)
    await browser.close()
    server.close()
    process.exit(1)
  }
}

// ── S · SERVER SNAPSHOT / PRERENDERED HTML ──────────────────────────────────
// These read the STATIC EXPORT off disk. No browser is involved, deliberately:
// a browser CANNOT see this property. By the time any probe reads
// document.documentElement.lang the locale effect has already normalised it, so
// every rendered assertion below is blind to a wrong getServerSnapshot.
//
// Added after independent QA landed two mutations that the rendered suite waved
// straight through with exit 0: consent's getServerSnapshot returning `null`
// (which bakes the banner into the static export of every page — a pre-hydration
// flash for visitors who already decided, and indexable consent chrome), and
// locale's returning 'he' (which prerenders Hebrew nav and destroys the EN SEO
// baseline). getServerSnapshot is the whole reason the repair is safe for a
// static export; a gate that cannot see it break does not cover the claim.
console.log('\n[S] server snapshot — the prerendered static export')
{
  const pages = execSync(`find ${JSON.stringify(OUT)} -name '*.html' -type f -not -path '*/app/*'`,
    { encoding: 'utf8' }).split('\n').filter(Boolean)
  // Floor derived from the ROUTE LIST, not a hardcoded number. Independent QA
  // noted a fixed `>= 15` against 17 actual pages let two pages vanish silently.
  // NOT `git ls-files -- 'website-next/app/**/page.tsx'`: git's `**/` requires at
  // least one directory, so that form silently drops app/page.tsx — the root
  // route — and reported 14 where there are 15.
  const routes = execSync('git ls-files -- website-next/app',
    { cwd: path.join(DIR, '..'), encoding: 'utf8' })
    .split('\n').filter((f) => f.endsWith('/page.tsx'))
  // A COUNT is not coverage: a `pages.length >= routes.length` floor let a
  // deleted page survive (16 pages, 15 routes — still "enough"). Every route is
  // resolved BY NAME to its exported artifact instead, mirroring how the static
  // server resolves them (`<route>.html` or `<route>/index.html`).
  const missing = routes
    .map((f) => f.replace(/^website-next\/app\//, '').replace(/\/?page\.tsx$/, ''))
    .filter((r) => {
      if (!r) return !existsSync(path.join(OUT, 'index.html'))
      return !existsSync(path.join(OUT, `${r}.html`)) &&
             !existsSync(path.join(OUT, r, 'index.html'))
    })
  check(`S0 every one of the ${routes.length} app routes has an exported page (${pages.length} total)`,
    routes.length >= 15 && missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : `only ${routes.length} routes`)

  const withBanner = pages.filter((f) => /consent-banner|role="dialog"/.test(readFileSync(f, 'utf8')))
  check('S1 consent banner is ABSENT from every prerendered page (deny-by-default survives export)',
    withBanner.length === 0, `${withBanner.length} page(s), e.g. ${withBanner[0]}`)

  const badHtmlTag = pages.filter((f) => {
    const m = readFileSync(f, 'utf8').match(/<html[^>]*>/)
    return !m || !/lang="en"/.test(m[0]) || !/dir="ltr"/.test(m[0])
  })
  check('S2 every prerendered page is <html lang="en" dir="ltr"> (EN SEO baseline)',
    badHtmlTag.length === 0, `${badHtmlTag.length} page(s), e.g. ${badHtmlTag[0]}`)

  // Driven off the message catalogues so this cannot drift out of sync with the
  // copy. The locale toggle's own label is hardcoded in nav.tsx, not a nav.*
  // message, so no legitimately-Hebrew string is swept up here.
  const en = JSON.parse(readFileSync(path.join(DIR, '..', 'website-next', 'messages', 'en.json'), 'utf8'))
  const he = JSON.parse(readFileSync(path.join(DIR, '..', 'website-next', 'messages', 'he.json'), 'utf8'))
  const keys = Object.keys(en.nav ?? {}).filter((k) => (he.nav ?? {})[k])
  check(`S3 non-vacuity: ${keys.length} nav keys carry both locales`, keys.length >= 6, `only ${keys.length}`)

  // <script> blocks are stripped, then the WHOLE document of EVERY page is
  // scanned. The earlier version scoped to <header> on index.html alone, and
  // justified it with a claim that was simply wrong: "מזמיני הופעות" is NOT in
  // the English meta description. Both occurrences are inside <script> — the
  // JSON-LD block and the RSC payload — so stripping <script> removes the false
  // positive outright and the narrowing was never necessary. Independent QA
  // proved the cost: Hebrew injected outside <header> passed at exit 0, and
  // eight of the nine useLocale() consumers (/contact, /waitlist, footer, legal)
  // live outside <header> or outside index.html entirely.
  const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '')
  check('S3b non-vacuity: HE nav values actually contain Hebrew characters',
    keys.filter((k) => /[\u0590-\u05FF]/.test(he.nav[k])).length === keys.length,
    'some he.json nav values are not Hebrew — S4 would pass vacuously')

  const leakPages = []
  for (const f of pages) {
    const body = strip(readFileSync(f, 'utf8'))
    const leaked = keys.filter((k) => body.includes(he.nav[k]))
    if (leaked.length) leakPages.push(`${path.basename(f)}: ${leaked.map((k) => `nav.${k}`).join(', ')}`)
  }
  check(`S4 no Hebrew nav copy anywhere in the ${pages.length} prerendered pages (scripts stripped)`,
    leakPages.length === 0, leakPages.slice(0, 3).join(' | '))

  // Positive control, per page: if the nav were not prerendered at all, S4
  // would pass for the wrong reason.
  const home = strip(readFileSync(path.join(OUT, 'index.html'), 'utf8'))
  const enPresent = keys.filter((k) => home.includes(en.nav[k]))
  check('S5 positive control: the EN nav IS prerendered (so S4 is not passing on an empty page)',
    enPresent.length >= 6, `only ${enPresent.length} of ${keys.length} EN nav strings found`)
}

// ── A · CONSENT BANNER ──────────────────────────────────────────────────────
console.log('\n[A] consent banner — store read on the client, not mirrored via setState')
{
  // A1 is the assertion the hero gate cannot make: with NO stored choice the
  // banner must actually appear. If useSyncExternalStore were stuck on the
  // server snapshot ('unknown'), this is what would catch it.
  const { ctx, page } = await fresh()
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(300)
  check('A1 no stored choice → banner rendered', await page.locator(BANNER).count() === 1,
    `expected exactly 1 ${BANNER}, saw ${await page.locator(BANNER).count()}`)
  check('A1b no stored choice → gtag.js NOT loaded (deny-by-default holds)',
    await page.locator(GA_SCRIPT).count() === 0)
  await ctx.close()
}
{
  const { ctx, page } = await fresh(seedConsent('denied'))
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(300)
  check('A2 stored "denied" → banner hidden', await page.locator(BANNER).count() === 0)
  check('A2b stored "denied" → gtag.js NOT loaded', await page.locator(GA_SCRIPT).count() === 0)
  await ctx.close()
}
{
  const { ctx, page } = await fresh(seedConsent('granted'))
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  check('A3 stored "granted" → banner hidden', await page.locator(BANNER).count() === 0)
  // The effect body, i.e. the half of the repair that stayed in useEffect.
  check('A3b stored "granted" → gtag.js injected by the effect',
    await page.locator(GA_SCRIPT).count() === 1)
  await ctx.close()
}
{
  // A4/A5 exercise the write path: storeChoice() must persist AND notify
  // subscribers, since nothing sets React state any more.
  const { ctx, page } = await fresh()
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(300)
  await page.locator(`${BANNER} button`).last().click()
  await page.waitForTimeout(500)
  check('A4 accept → banner disappears without a reload', await page.locator(BANNER).count() === 0)
  check('A4b accept → gtag.js injected', await page.locator(GA_SCRIPT).count() === 1)
  const stored = await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)
  check('A4c accept → choice persisted as "granted"',
    !!stored && JSON.parse(stored).value === 'granted', `saw ${stored}`)
  await page.reload({ waitUntil: 'load' })
  await page.waitForTimeout(500)
  check('A5 reload after accept → banner stays hidden', await page.locator(BANNER).count() === 0)
  check('A5b reload after accept → gtag.js loaded again from the stored grant',
    await page.locator(GA_SCRIPT).count() === 1)
  await ctx.close()
}
{
  const { ctx, page } = await fresh()
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(300)
  await page.locator(`${BANNER} button`).first().click()
  await page.waitForTimeout(400)
  check('A6 decline → banner disappears', await page.locator(BANNER).count() === 0)
  check('A6b decline → gtag.js NOT loaded', await page.locator(GA_SCRIPT).count() === 0)
  const stored = await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)
  check('A6c decline → choice persisted as "denied"',
    !!stored && JSON.parse(stored).value === 'denied', `saw ${stored}`)
  await ctx.close()
}

// ── B · LOCALE ──────────────────────────────────────────────────────────────
console.log('\n[B] locale — persisted choice read on the client, <html> written from an effect')
{
  const { ctx, page } = await fresh(seedConsent('denied'))
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(300)
  const html = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))
  check('B1 no stored locale → <html lang=en dir=ltr> (EN static baseline)',
    html.lang === 'en' && html.dir === 'ltr', JSON.stringify(html))
  await ctx.close()
}
{
  const { ctx, page } = await fresh(seedConsent('denied'))
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(300)
  await page.locator(TOGGLE).first().click()
  await page.waitForTimeout(400)
  const html = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))
  check('B2 toggle → <html lang=he dir=rtl> without a reload',
    html.lang === 'he' && html.dir === 'rtl', JSON.stringify(html))
  check('B2b toggle → locale persisted',
    await page.evaluate((k) => localStorage.getItem(k), LOCALE_KEY) === 'he')

  // B3 is the highest-risk assertion of the repair. The old code applied
  // lang/dir inside the SAME mount effect that called setState; the new code
  // reads the store during render and applies lang/dir in a separate effect.
  // If that separation were wrong, the locale would survive the reload in
  // localStorage while <html> silently stayed EN/LTR.
  await page.reload({ waitUntil: 'load' })
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))
  check('B3 reload → stored "he" re-applied to <html> on hydration',
    after.lang === 'he' && after.dir === 'rtl', JSON.stringify(after))
  check('B3b reload → toggle now offers EN (locale reached React, not just <html>)',
    (await page.locator(TOGGLE).first().innerText()).trim() === 'EN',
    await page.locator(TOGGLE).first().innerText())

  await page.locator(TOGGLE).first().click()
  await page.waitForTimeout(400)
  const back = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))
  check('B4 toggle back → <html lang=en dir=ltr>',
    back.lang === 'en' && back.dir === 'ltr', JSON.stringify(back))
  check('B4b toggle back → locale persisted as "en"',
    await page.evaluate((k) => localStorage.getItem(k), LOCALE_KEY) === 'en')
  await ctx.close()
}

// ── D · DEGRADED STORAGE ────────────────────────────────────────────────────
// The module-level session overrides (`sessionChoice`, `sessionLocale`) are the
// reason a visitor whose localStorage THROWS — private mode, storage disabled,
// sandboxed iframe — can still dismiss the banner and switch locale. The
// register presents that as deliberate behaviour preservation, but independent
// QA showed the claim was uncovered: deleting either override left the gate at
// exit 0, because every context here had a working localStorage.
console.log('\n[D] degraded storage — localStorage throws (private mode)')
{
  const BREAK_STORAGE =
    "Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('storage disabled') } })"
  const { ctx, page } = await fresh(BREAK_STORAGE)
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  check('D0 non-vacuity: localStorage really does throw in this context',
    await page.evaluate(() => { try { void window.localStorage; return false } catch { return true } }))
  check('D1 storage throws → banner still renders (readChoice fails closed to null)',
    await page.locator(BANNER).count() === 1)
  check('D1b storage throws → gtag.js still NOT loaded', await page.locator(GA_SCRIPT).count() === 0)

  await page.locator(`${BANNER} button`).first().click()
  await page.waitForTimeout(400)
  check('D2 storage throws → decline still dismisses the banner (session override)',
    await page.locator(BANNER).count() === 0)
  check('D2b storage throws → decline still keeps gtag.js out',
    await page.locator(GA_SCRIPT).count() === 0)

  await page.locator(TOGGLE).first().click()
  await page.waitForTimeout(400)
  const html = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))
  check('D3 storage throws → locale toggle still reaches <html lang=he dir=rtl> (session override)',
    html.lang === 'he' && html.dir === 'rtl', JSON.stringify(html))
  await ctx.close()
}

// ── E · CONSENT EXPIRY ──────────────────────────────────────────────────────
// MAX_AGE_MS re-asks after 12 months. Untested before independent QA: deleting
// the expiry clause shipped green, so an indefinitely-valid stale grant would
// have passed. Behaviour is unchanged from 63c40d6 — this closes the coverage
// gap, not a regression.
console.log('\n[E] consent expiry — a grant older than MAX_AGE_MS is not a grant')
{
  const YEAR_PLUS = 366 * 24 * 60 * 60 * 1000
  const stale = `localStorage.setItem(${JSON.stringify(CONSENT_KEY)}, JSON.stringify({ value: 'granted', at: Date.now() - ${YEAR_PLUS} }))`
  const { ctx, page } = await fresh(stale)
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  check('E1 expired grant → banner re-asks', await page.locator(BANNER).count() === 1)
  check('E1b expired grant → gtag.js NOT loaded (an expired grant must not carry consent)',
    await page.locator(GA_SCRIPT).count() === 0)
  await ctx.close()
}
{
  // Positive control for E1: the SAME payload with a fresh timestamp must
  // behave as a live grant, so E1 cannot be passing because the fixture shape
  // is simply unreadable.
  const { ctx, page } = await fresh(seedConsent('granted'))
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  check('E2 positive control: the same payload with a fresh timestamp IS a live grant',
    await page.locator(BANNER).count() === 0 && await page.locator(GA_SCRIPT).count() === 1)
  await ctx.close()
}

// ── C · NON-VACUITY ─────────────────────────────────────────────────────────
console.log('\n[C] non-vacuity')
check(`C1 ran ${checks} contract assertions (a collapsed corpus would show few)`, checks >= 34, `only ${checks}`, true)

await browser.close()
server.close()

if (findings.length) {
  console.error(`\n✖ CLIENT-STORE CONTRACT — ${findings.length} failure(s):`)
  for (const f of findings) console.error(`  · ${f}`)
  process.exit(1)
}
console.log(`\n✓ CLIENT-STORE CONTRACT: ${checks} assertions hold — consent banner and locale both read localStorage through useSyncExternalStore, persist across reload, and keep gtag.js and <html lang/dir> as effect-only external writes.`)
