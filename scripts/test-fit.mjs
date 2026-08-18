// L1 FIT INSPECTOR (HOW-TO-BUILD-A-TASK Part 2/Part 4 — owner governance 18 Jul).
// Verify checks SEMANTICS; this checks SPACE. Renders the DEMO build (fixtures,
// no network) headlessly at every viewport in VIEWPORTS below and asserts:
//   1. no truncated text (clipped scrollWidth/Height on leaf text nodes)
//   2. no overlap between positioned control-layer elements (rails/docks)
//   3. no horizontal scroll
//   4. tap targets >= 44px on mobile (elements with the .tap-target hit-area
//      expansion are compliant by construction and excluded; a violation FAILS
//      — promoted from WARN after the T-68 sweep reached zero)
//   5. never MORE THAN one visible primary CTA (zero passes — several rep and
//      production screens are legitimately list-first; the check is `> 1`, and
//      the old wording "exactly ONE" claimed more than the code enforces)
// Runs on `dist` AFTER build:demo (verify order guarantees the demo build is
// the one on disk).
//
// FAIL CLOSED (VERIFY-CLOSED). This gate is rendered-only: with no browser it
// measures NOTHING, so it must not report exit 0. It used to print a loud SKIP
// and pass, which meant `npm run test:fit` alone could look green having
// checked no pixel at all. Chromium is not optional for this chain in any
// case — test-client-store.mjs, also in `npm run verify`, already hard-fails
// without it — so failing closed here costs no portability the chain had.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'dist')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' }

if (!existsSync(join(DIST, 'index.html'))) {
  console.log('✗ FIT: dist/index.html missing — run after build:demo.')
  process.exit(1)
}

let chromium
try { ({ chromium } = await import('playwright')) } catch {
  console.error('✗ FIT: Playwright unavailable — this gate is rendered-only, so a skip is NOT a pass. Install it, or run L1 BY HAND (HOW-TO-BUILD-A-TASK Part 2) and record that separately; this run measured no pixel.')
  process.exit(1)
}

// SPA static server with index.html fallback.
const server = createServer(async (req, res) => {
  try {
    const path = req.url.split('?')[0]
    const file = join(DIST, path === '/' ? 'index.html' : path)
    const target = existsSync(file) && extname(file) ? file : join(DIST, 'index.html')
    const body = await readFile(target)
    res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' })
    res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise((r) => server.listen(0, r))
const port = server.address().port

const ASSERT = () => {
  const out = { truncated: [], overlaps: [], hscroll: false, smallTaps: [], primaryCtas: 0 }
  for (const el of document.querySelectorAll('span,p,button,a,h1,h2,h3')) {
    if (!el.offsetParent || el.children.length > 0) continue
    const cs = getComputedStyle(el)
    const clamps = cs.textOverflow === 'ellipsis' || cs.overflow === 'hidden' || (el.className.includes && String(el.className).includes('line-clamp'))
    if (clamps && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 2)) {
      out.truncated.push(el.textContent.trim().slice(0, 40))
    }
  }
  const layer = Array.from(document.querySelectorAll('.relative.z-10, [class*="md:absolute"]')).filter((e) => e.offsetParent)
  for (let i = 0; i < layer.length; i++) {
    for (let j = i + 1; j < layer.length; j++) {
      if (layer[i].contains(layer[j]) || layer[j].contains(layer[i])) continue
      const a = layer[i].getBoundingClientRect(); const b = layer[j].getBoundingClientRect()
      if (a.width && b.width && a.left < b.right - 4 && b.left < a.right - 4 && a.top < b.bottom - 4 && b.top < a.bottom - 4) {
        out.overlaps.push(`${layer[i].textContent.trim().slice(0, 25)} × ${layer[j].textContent.trim().slice(0, 25)}`)
      }
    }
  }
  out.hscroll = document.documentElement.scrollWidth > window.innerWidth + 1
  // 44px is a TOUCH-target law (§10.5) — asserted on the mobile pass only.
  // <select> cannot host the .tap-target pseudo-expansion; it must carry a real
  // min-height on mobile (and does — md:min-h-0 relaxes it desktop-side only).
  if (window.innerWidth < 700) {
    for (const el of document.querySelectorAll('button,a,select')) {
      if (!el.offsetParent || el.closest('[aria-hidden]')) continue
      if (el.className.includes && String(el.className).includes('tap-target')) continue // expanded hit area (T-31)
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0 && (r.height < 43 || r.width < 43)) out.smallTaps.push(el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label') || '?')
    }
  }
  out.primaryCtas = Array.from(document.querySelectorAll('.btn-primary')).filter((e) => e.offsetParent).length
  return out
}

// T-104 · the rep + production route set joins the recurring sweep. Both entity
// gates (RequireAgency / RequireProduction, App.jsx) resolve from the DEMO
// persona, so each route is reached by stamping `gigproof_demo_role` and doing
// a real navigation. `agency` lands on the management workspace (demo-org-3),
// `producer` on the production workspace (demo-org-2, workspace_type='producer').
const REP_ROUTES = [
  ['agency', '/agency'],
  ['agency', '/agency/requests'],
  ['agency', '/agency/radar'],
  ['producer', '/production'],
  ['producer', '/production/events'],
  ['producer', '/production/requests'],
]

// ── the declared breakpoint set (FIT-BREAKPOINTS) ───────────────────────────
// One source of truth: the loop AND the closing message both read this, so the
// summary can never name a width that was not rendered. It used to say "360px
// and 1360px" as a string literal — running the same file over 390/430 printed
// that sentence unchanged, which is how the drift was found.
//
// 360 is the narrow floor; 390 (iPhone 12–15) and 430 (Pro Max / large Android)
// are the two most common real handsets and were previously unmeasured — the
// whole span between the floor and the desktop case was assumed, not rendered.
const VIEWPORTS = [
  [360, 780, 'MOBILE-360'],
  [390, 844, 'MOBILE-390'],
  [430, 932, 'MOBILE-430'],
  [1360, 850, 'DESKTOP-1360'],
]
// SELF-PIN: the set may grow, never silently shrink. Dropping a breakpoint is a
// real reduction in what this gate proves, so it must be a deliberate edit here
// and not a quiet deletion in the loop.
const REQUIRED_WIDTHS = [360, 390, 430]
const declared = VIEWPORTS.map(([w]) => w)
const missing = REQUIRED_WIDTHS.filter((w) => !declared.includes(w))
if (missing.length || !declared.some((w) => w >= 1280)) {
  console.error(`✗ FIT: the declared breakpoint set is narrower than the contract — missing ${missing.join(', ') || '(none)'}${declared.some((w) => w >= 1280) ? '' : ' and no desktop width >= 1280'}. Declared: ${declared.join(', ')}.`)
  process.exit(1)
}

let failures = 0
const browser = await chromium.launch()
for (const [w, h, label] of VIEWPORTS) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
  // Screen 1: login (demo persona chooser)
  await page.goto(`http://127.0.0.1:${port}/login`, { waitUntil: 'networkidle' })
  const login = await page.evaluate(ASSERT)
  // Screen 2: the Radar home — deterministic demo auth (the DemoAuthProvider
  // reads gigproof_demo_role from localStorage), then the direct route.
  await page.evaluate(() => localStorage.setItem('gigproof_demo_role', 'artist'))
  await page.goto(`http://127.0.0.1:${port}/artist/home`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.skeleton', { state: 'detached', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000)
  if (!page.url().includes('/artist/home')) { console.log(`  ✗ [${label}] radar route unreachable (landed ${page.url()})`); failures++ }
  const radar = await page.evaluate(ASSERT)
  // Screen 3 (D7): the OPEN planet panel (Inspector) — coaching line + why
  // rows + fill widgets are part of the flagship surface; fit-assert it open.
  await page.locator('button[aria-label*="—"], button[aria-label*="·"]').first().click().catch(() => {})
  await page.waitForTimeout(1200)
  const panel = await page.evaluate(ASSERT)
  // Screen 4 (D5): the onboarding entry — same demo auth, direct route.
  await page.goto(`http://127.0.0.1:${port}/onboarding`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const onboarding = await page.evaluate(ASSERT)
  // Screen 5 (B2, §8.9): the Source-Confirmer ceremony — an accountless magic
  // link (/confirm/:token), no login/role needed; DEMO renders the fixture
  // ceremony from any token with zero network, so a direct route is enough.
  await page.goto(`http://127.0.0.1:${port}/confirm/demo-token`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const confirm = await page.evaluate(ASSERT)
  // Screens 6–11 (T-104): the rep + production route set. The persona is
  // re-stamped per route and `gigproof_active_org_id` cleared, so a previous
  // screen's workspace choice can never leak into the next assertion.
  const repScreens = []
  for (const [persona, route] of REP_ROUTES) {
    await page.goto(`http://127.0.0.1:${port}/login`, { waitUntil: 'networkidle' })
    await page.evaluate((p) => { localStorage.setItem('gigproof_demo_role', p); localStorage.removeItem('gigproof_active_org_id') }, persona)
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('.skeleton', { state: 'detached', timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1200)
    // A bounced route is a FAILURE, not a silent pass on an empty screen.
    if (new URL(page.url()).pathname !== route) { console.log(`  ✗ [${label}] ${route} unreachable (landed ${page.url()})`); failures++ }
    repScreens.push([route, await page.evaluate(ASSERT)])
  }
  for (const [screen, r] of [['login', login], ['radar', radar], ['radar-panel', panel], ['onboarding', onboarding], ['confirm', confirm], ...repScreens]) {
    const bad = r.truncated.length || r.overlaps.length || r.hscroll || r.primaryCtas > 1 || r.smallTaps.length
    if (bad) failures++
    console.log(`${bad ? '  ✗' : '  ·'} [${label} ${screen}] truncated: ${r.truncated.length}${r.truncated.length ? ' ' + JSON.stringify(r.truncated.slice(0, 3)) : ''} · overlaps: ${r.overlaps.length}${r.overlaps.length ? ' ' + JSON.stringify(r.overlaps.slice(0, 3)) : ''} · h-scroll: ${r.hscroll ? 'YES' : 'none'} · primary CTAs: ${r.primaryCtas}${r.smallTaps.length ? ` · ✗ taps<44: ${r.smallTaps.length} ${JSON.stringify(r.smallTaps.slice(0, 8))}` : ''}`)
  }
  await page.context().close()
}
await browser.close()
server.close()

if (failures) {
  console.log(`✗ FIT: ${failures} screen render(s) with fit defects — the pixels collide even though semantics pass. Fix before witness handoff (HOW-TO-BUILD-A-TASK).`)
  process.exit(1)
}
console.log(`✓ FIT: all screens fit at ${declared.map((w) => `${w}px`).join(', ')} — no truncation, no overlap, no h-scroll, never more than one primary CTA.`)
process.exit(0)
