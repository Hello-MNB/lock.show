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
function check(label, cond, detail = '') {
  checks++
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
    "website-next/content website-next/messages website-next/styles",
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
  console.log(`  · freshness: out/ newer than all ${src.length} tracked website sources (newest: ${newestFile})`)
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

// ── C · NON-VACUITY ─────────────────────────────────────────────────────────
console.log('\n[C] non-vacuity')
check(`C1 ran ${checks} rendered assertions (a collapsed corpus would show few)`, checks >= 18, `only ${checks}`)

await browser.close()
server.close()

if (findings.length) {
  console.error(`\n✖ CLIENT-STORE CONTRACT — ${findings.length} failure(s):`)
  for (const f of findings) console.error(`  · ${f}`)
  process.exit(1)
}
console.log(`\n✓ CLIENT-STORE CONTRACT: ${checks} rendered assertions hold — consent banner and locale both read localStorage through useSyncExternalStore, persist across reload, and keep gtag.js and <html lang/dir> as effect-only external writes.`)
