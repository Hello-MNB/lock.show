#!/usr/bin/env node
/**
 * HERO CONTRACT TEST — T-97 hero system, re-runnable (`npm run test:hero`).
 *
 * STATIC (always runs, no browser needed):
 *   S1  every public hero page declares an APPROVED variant on the shared
 *       <Hero> component (variant map below; legal routes resolve through
 *       components/legal-document.tsx)
 *   S2  no page-specific magic-number hero min-height outside the token file
 *       (styles/hero.css) — any `minHeight` using svh / min(...) in page or
 *       component source fails unless allowlisted below with a reason
 *
 * RENDERED (chromium via playwright; REQUIRED — with no browser this gate
 * exits NON-ZERO rather than reporting the static half as the whole, because
 * a skip is NOT a pass):  at 1440×900 and 390×844 on every public route:
 *   R1  no horizontal overflow (document.scrollWidth == innerWidth)
 *   R2  fold contract: hero H1 fully inside the first viewport; the hero's
 *       primary CTA (when the variant carries one) inside the first viewport
 *   R3  DESKTOP (1440×900): every hero band equals the ONE shared height
 *       token --hero-height-desktop (owner ruling 27 Jul 2026 — same hero
 *       height on all desktop pages; 620px per v52 canon), ±0px.
 *       MOBILE (390×844): height within ±15% of its variant reference
 *       (table below, from the T-97 post-fix measurements)
 *   R4  consent-banner overlap: with the banner visible, elementFromPoint
 *       across the hero CTA's on-screen rect never lands on the banner
 *       (checked at 390×844 and 320×568)
 *   R5  mobile crawl @390: every internal href in the rendered DOM resolves
 *       (200, or /app/* app-rescue territory)
 *
 * Requires website-next/out (static export):  cd website-next && npm run build
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(DIR, '..', 'website-next')
const OUT = path.join(SITE, 'out')
const PORT = 4177

// ── S1: approved variants per public hero page ──────────────────────────────
// legal-document.tsx serves terms/privacy/accessibility (compact legal flavor)
const VARIANT_MAP = {
  '/': { file: 'app/page.tsx', variant: 'feature' },
  '/artists': { file: 'app/artists/page.tsx', variant: 'feature' },
  '/bookers': { file: 'app/bookers/page.tsx', variant: 'feature' },
  '/producers': { file: 'app/producers/page.tsx', variant: 'feature' },
  '/pricing': { file: 'app/pricing/page.tsx', variant: 'primary' },
  '/radar': { file: 'app/radar/page.tsx', variant: 'standard' },
  '/how-it-works': { file: 'app/how-it-works/page.tsx', variant: 'standard' },
  '/methodology': { file: 'app/methodology/page.tsx', variant: 'standard' },
  '/faq': { file: 'app/faq/page.tsx', variant: 'compact' },
  '/contact': { file: 'app/contact/page.tsx', variant: 'compact' },
  '/terms': { file: 'components/legal-document.tsx', variant: 'compact', legal: true },
  '/privacy': { file: 'components/legal-document.tsx', variant: 'compact', legal: true },
  '/accessibility': { file: 'components/legal-document.tsx', variant: 'compact', legal: true },
}
// Public routes with NO hero band (documented exemptions):
const NO_HERO_ROUTES = ['/passport/demo']

// ── R3 DESKTOP: ONE shared hero height on desktop (owner ruling 27 Jul 2026,
// "ביקשתי HERO בעמודים דסקטופ באותו גובה") — read live from the token file so
// the test can never drift from styles/hero.css. ±0px tolerance at 1440×900.
const HERO_CSS = readFileSync(path.join(SITE, 'styles', 'hero.css'), 'utf8')
const desktopTokenMatch = HERO_CSS.match(/--hero-height-desktop:\s*(\d+(?:\.\d+)?)px/)
if (!desktopTokenMatch) {
  console.error('✗ HERO CONTRACT: --hero-height-desktop token missing from styles/hero.css')
  process.exit(1)
}
const DESKTOP_HERO_H = Number(desktopTokenMatch[1])

// ── R3 MOBILE: variant reference heights (px) @390×844 — derived from the
// hero token math + T-97 post-fix measurements. ±15% tolerance. (Variants
// differentiate BELOW 1024px only; on desktop the shared token wins.)
//   feature  min(92svh,880): 776.5 @844
//   primary  min(78svh,748): 658.3 @844
//   standard min(56svh,560): 472.6 @844
//   compact  auto floored at 292: ≈325 @390
const REFERENCE = {
  feature: { '390x844': 776.5 },
  primary: { '390x844': 658.3 },
  standard: { '390x844': 472.6 },
  compact: { '390x844': 325 },
}
const TOLERANCE = 0.15

// ── S2 allowlist: minHeight values in source that are NOT hero bands ────────
const MINHEIGHT_ALLOWLIST = [
  { file: 'app/not-found.tsx', value: '60vh', reason: '404 filler band — not a hero page' },
  { file: 'app/passport/demo/page.tsx', value: '100vh', reason: 'full-viewport dark stage behind the passport card — structural wrapper' },
  { file: 'app/radar/page.tsx', value: 'min(46svh, 440px)', reason: 'mid-page atmosphere band, not the hero (hero uses the standard variant)' },
  { file: 'app/pricing/page.tsx', value: '280px', reason: 'FAQ card equal-height rule inside the pricing body' },
]

const findings = []

// ═══ STATIC CHECKS ══════════════════════════════════════════════════════════
const APPROVED = new Set(['feature', 'primary', 'standard', 'compact'])
for (const [route, spec] of Object.entries(VARIANT_MAP)) {
  const src = readFileSync(path.join(SITE, spec.file), 'utf8')
  const m = src.match(/<Hero\s[^>]*?variant="([a-z]+)"/s)
  if (!m) {
    findings.push(`S1 · ${route}: ${spec.file} does not render <Hero variant="…">`)
    continue
  }
  if (!APPROVED.has(m[1])) findings.push(`S1 · ${route}: variant "${m[1]}" is not an approved variant`)
  if (m[1] !== spec.variant) findings.push(`S1 · ${route}: declares variant "${m[1]}", expected "${spec.variant}"`)
  if (spec.legal && !/<Hero\s[^>]*?\blegal\b/s.test(src)) {
    findings.push(`S1 · ${route}: legal page must use the compact legal sub-flavor (<Hero … legal>)`)
  }
}

// S2 — magic hero min-heights live ONLY in styles/hero.css
function walk(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else if (e.name.endsWith('.tsx')) out.push(p)
  }
  return out
}
const SOURCE_FILES = [...walk(path.join(SITE, 'app')), ...walk(path.join(SITE, 'components'))]
for (const file of SOURCE_FILES) {
  const rel = path.relative(SITE, file).replaceAll('\\', '/')
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(/minHeight:\s*'([^']+)'/g)) {
    const value = m[1]
    if (value.startsWith('var(--hero-')) continue // token reference — fine
    const heroLike = value.includes('svh') || /min\(/.test(value) || /\d{3,}px/.test(value)
    if (!heroLike) continue // small utility min-heights (e.g. 44px tap targets)
    const allowed = MINHEIGHT_ALLOWLIST.some((a) => a.file === rel && a.value === value)
    if (!allowed) {
      findings.push(`S2 · ${rel}: page-specific min-height "${value}" — hero sizes belong in styles/hero.css tokens`)
    }
  }
}

// ═══ RENDERED CHECKS ════════════════════════════════════════════════════════
// static server (resolution-bug-safe pattern per test-site-nav.mjs)
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
  const nf = path.join(OUT, '404.html')
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
  res.end(existsSync(nf) ? readFileSync(nf) : 'Not found')
})

const ALL_ROUTES = [...Object.keys(VARIANT_MAP), ...NO_HERO_ROUTES]
const CONSENT_KEY = 'gigproof_consent'

async function renderedChecks() {
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch (err) {
    // FAIL CLOSED (VERIFY-CLOSED): the rendered half is the half that measures
    // real geometry. Reporting the static half as the whole gate is a false
    // green. Chromium is already required by test-client-store.mjs in the same
    // chain, so this costs no portability.
    console.error(`✗ HERO CONTRACT: playwright unavailable (${String(err).split('\n')[0]}) — the rendered checks measure nothing without it, and a skip is NOT a pass.`)
    process.exit(1)
  }
  let browser
  try {
    browser = await chromium.launch()
  } catch (err) {
    console.error(`✗ HERO CONTRACT: chromium failed to launch (${String(err).split('\n')[0]}) — the rendered checks measure nothing without it, and a skip is NOT a pass.`)
    process.exit(1)
  }

  if (!existsSync(path.join(OUT, 'index.html'))) {
    findings.push('R0 · website-next/out missing — build the static export first (cd website-next && npm run build)')
    await browser.close()
    return true
  }
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r))
  const base = `http://127.0.0.1:${PORT}`

  const measure = async (page) => page.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom } }
    const hero = document.querySelector('.hero')
    let h1 = null, cta = null
    if (hero) {
      const h1el = hero.querySelector('h1')
      if (h1el) h1 = r(h1el)
      if (h1el) {
        const ctaEl = [...hero.querySelectorAll('a,button')].find((a) => {
          const b = a.getBoundingClientRect()
          return b.width > 0 && b.height > 0 && a.innerText.trim() &&
            (a.compareDocumentPosition(h1el) & Node.DOCUMENT_POSITION_PRECEDING)
        })
        if (ctaEl) cta = r(ctaEl)
      }
    }
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      hero: hero ? r(hero) : null,
      h1, cta,
      innerH: window.innerHeight,
    }
  })

  // R1–R3 (consent pre-dismissed so the banner never shifts measurements)
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const vpKey = `${w}x${h}`
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    await ctx.addInitScript(`localStorage.setItem('${CONSENT_KEY}', JSON.stringify({ value: 'denied', at: Date.now() }))`)
    const page = await ctx.newPage()
    for (const route of ALL_ROUTES) {
      await page.goto(base + route, { waitUntil: 'load' })
      const m = await measure(page)
      if (m.overflow > 0) findings.push(`R1 · ${route} @${vpKey}: horizontal overflow ${m.overflow}px`)
      if (NO_HERO_ROUTES.includes(route)) continue
      if (!m.hero) { findings.push(`R2 · ${route} @${vpKey}: no rendered .hero band`); continue }
      if (!m.h1) findings.push(`R2 · ${route} @${vpKey}: hero has no <h1>`)
      else if (m.h1.bottom > m.innerH) findings.push(`R2 · ${route} @${vpKey}: hero H1 breaks the first viewport (bottom ${m.h1.bottom.toFixed(0)} > ${m.innerH})`)
      const variant = VARIANT_MAP[route].variant
      if ((variant === 'feature' || variant === 'primary') && m.cta && m.cta.bottom > m.innerH) {
        findings.push(`R2 · ${route} @${vpKey}: hero primary CTA below the fold (bottom ${m.cta.bottom.toFixed(0)} > ${m.innerH})`)
      }
      if (vpKey === '1440x900') {
        // DESKTOP: every hero equals the shared token exactly (±0px)
        const dev = Math.abs(m.hero.h - DESKTOP_HERO_H)
        if (dev > 0) {
          findings.push(`R3 · ${route} @${vpKey}: hero height ${m.hero.h.toFixed(1)} ≠ --hero-height-desktop ${DESKTOP_HERO_H} (±0px — one desktop hero height, owner ruling)`)
        }
      } else {
        // MOBILE: variant reference ±15%
        const ref = REFERENCE[variant][vpKey]
        const dev = Math.abs(m.hero.h - ref) / ref
        if (dev > TOLERANCE) {
          findings.push(`R3 · ${route} @${vpKey}: hero height ${m.hero.h.toFixed(1)} deviates ${(dev * 100).toFixed(1)}% from ${variant} reference ${ref} (±15%)`)
        }
      }
    }
    await ctx.close()
  }

  // R4 — consent-banner overlap (banner VISIBLE; elementFromPoint over CTA)
  for (const [w, h] of [[390, 844], [320, 568]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    for (const route of Object.keys(VARIANT_MAP)) {
      await page.goto(base + route, { waitUntil: 'load' })
      const hit = await page.evaluate(() => {
        const hero = document.querySelector('.hero')
        const banner = document.querySelector('.consent-banner')
        if (!hero || !banner) return null
        const h1 = hero.querySelector('h1')
        if (!h1) return null
        const cta = [...hero.querySelectorAll('a,button')].find((a) => {
          const b = a.getBoundingClientRect()
          return b.width > 0 && b.height > 0 && a.innerText.trim() &&
            (a.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_PRECEDING)
        })
        if (!cta) return null
        const b = cta.getBoundingClientRect()
        const pts = [
          [b.x + b.width / 2, b.y + b.height / 2],
          [b.x + 3, b.y + 3], [b.right - 3, b.y + 3],
          [b.x + 3, b.bottom - 3], [b.right - 3, b.bottom - 3],
        ]
        for (const [x, y] of pts) {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue
          const el = document.elementFromPoint(x, y)
          if (el && banner.contains(el)) return { x, y, covered: true }
        }
        return { covered: false }
      })
      if (hit && hit.covered) {
        findings.push(`R4 · ${route} @${w}x${h}: consent banner covers the hero CTA (elementFromPoint ${hit.x.toFixed(0)},${hit.y.toFixed(0)})`)
      }
    }
    await ctx.close()
  }

  // R5 — mobile crawl @390: internal links resolvable
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await ctx.addInitScript(`localStorage.setItem('${CONSENT_KEY}', JSON.stringify({ value: 'denied', at: Date.now() }))`)
    const page = await ctx.newPage()
    const checked = new Map()
    for (const route of ALL_ROUTES) {
      await page.goto(base + route, { waitUntil: 'load' })
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))
      for (const raw of hrefs) {
        if (!raw || !raw.startsWith('/')) continue
        const href = raw.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/'
        if (href === '/app' || href.startsWith('/app/')) continue // embedded SPA territory
        if (checked.has(href)) continue
        const res = await fetch(base + href)
        checked.set(href, res.status)
        if (res.status !== 200) findings.push(`R5 · dead link "${raw}" on ${route} @390 → ${res.status}`)
      }
    }
    console.log(`R5 mobile crawl: ${checked.size} internal links checked @390`)
    await ctx.close()
  }

  await browser.close()
  server.close()
  return true
}

// `renderedChecks` no longer has a false return: both unavailability paths
// exit non-zero (VERIFY-CLOSED), so reaching here means they really ran.
await renderedChecks().catch((err) => {
  server.close()
  findings.push(`R? · rendered checks crashed: ${err}`)
})

if (findings.length) {
  console.error(`\n✗ HERO CONTRACT: ${findings.length} violation(s)\n`)
  for (const f of findings) console.error(`  ✗ ${f}`)
  process.exit(1)
}
console.log(`\n✓ HERO CONTRACT: ${Object.keys(VARIANT_MAP).length} hero pages on approved variants, ` +
  `no magic hero min-heights outside styles/hero.css` +
  `, ONE desktop hero height ${DESKTOP_HERO_H}px on all heroes @1440×900 (±0px), rendered fold/height/overlap/crawl contracts hold @1440×900 + 390×844 (+320×568 consent)`)
