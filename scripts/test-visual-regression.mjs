#!/usr/bin/env node
/**
 * VISUAL REGRESSION TEST — T-97 (`npm run test:visual`).
 *
 * Screenshots every public route of the static export at 1440×900 and 390×844
 * (full page, consent pre-dismissed via the localStorage key, animations
 * frozen) and pixel-diffs each against the committed baseline in
 * website-next/visual-baseline/. FAILS when more than 1% of pixels change
 * (pixelmatch threshold 0.12 per pixel).
 *
 * RE-SEED PROCEDURE (after an INTENTIONAL visual change):
 *   1. cd website-next && npm run build          (fresh static export)
 *   2. node scripts/test-visual-regression.mjs --update
 *   3. review the regenerated PNGs in website-next/visual-baseline/ visually
 *   4. commit them together with the change that caused them
 * A missing baseline for a route is seeded automatically on first run (the
 * run reports it and still passes — commit the new file).
 *
 * FAIL CLOSED: if the renderer or the diff libraries are unavailable this gate
 * exits NON-ZERO. It used to skip and exit 0, which reported "no visual
 * regression" from a run that compared no pixels.
 *
 * Diff artifacts for failures land in <os-tmp>/lock-visual-diff/ so the
 * changed pixels can be inspected.
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(DIR, '..', 'website-next')
const OUT = path.join(SITE, 'out')
const BASELINE = path.join(SITE, 'visual-baseline')
const DIFF_DIR = path.join(os.tmpdir(), 'lock-visual-diff')
const PORT = 4178
const UPDATE = process.argv.includes('--update')
const MAX_DIFF_RATIO = 0.01 // >1% changed pixels = material change = fail
const PIXEL_THRESHOLD = 0.12

const ROUTES = [
  ['/', 'home'], ['/artists', 'artists'], ['/bookers', 'bookers'], ['/producers', 'producers'],
  ['/pricing', 'pricing'], ['/radar', 'radar'], ['/how-it-works', 'how-it-works'],
  ['/methodology', 'methodology'], ['/faq', 'faq'], ['/contact', 'contact'],
  ['/privacy', 'privacy'], ['/terms', 'terms'], ['/accessibility', 'accessibility'],
  ['/passport/demo', 'passport-demo'],
]
const VIEWPORTS = [[1440, 900], [390, 844]]
const CONSENT_KEY = 'gigproof_consent'

if (!existsSync(path.join(OUT, 'index.html'))) {
  console.error('✗ website-next/out missing — build first: cd website-next && npm run build')
  process.exit(1)
}

// ── static server (resolution-bug-safe pattern per test-site-nav.mjs) ──────
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
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); res.end('Not found')
})

async function main() {
  let chromium, PNG, pixelmatch
  try {
    ;({ chromium } = await import('playwright'))
    ;({ PNG } = await import('pngjs'))
    pixelmatch = (await import('pixelmatch')).default
  } catch (err) {
    // FAIL CLOSED (VERIFY-CLOSED): pixel comparison with no renderer compares
    // nothing. Chromium is already required by test-client-store.mjs in the
    // same chain, so this costs no portability.
    console.error(`✗ VISUAL REGRESSION: dependency unavailable (${String(err).split('\n')[0]}) — nothing was compared, and a skip is NOT a pass.`)
    process.exit(1)
  }
  let browser
  try {
    browser = await chromium.launch()
  } catch (err) {
    console.error(`✗ VISUAL REGRESSION: chromium failed to launch (${String(err).split('\n')[0]}) — nothing was compared, and a skip is NOT a pass.`)
    process.exit(1)
  }

  await new Promise((r) => server.listen(PORT, '127.0.0.1', r))
  const base = `http://127.0.0.1:${PORT}`
  mkdirSync(BASELINE, { recursive: true })
  mkdirSync(DIFF_DIR, { recursive: true })

  const failures = []
  const seeded = []
  let compared = 0

  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    // Pre-dismiss consent + freeze animation BEFORE any page script runs —
    // baselines are captured before any focus/consent interaction.
    await ctx.addInitScript(`localStorage.setItem('${CONSENT_KEY}', JSON.stringify({ value: 'denied', at: Date.now() }))`)
    const page = await ctx.newPage()
    for (const [route, slug] of ROUTES) {
      await page.goto(base + route, { waitUntil: 'load' })
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(120)
      const shot = await page.screenshot({ fullPage: true, animations: 'disabled' })
      const name = `${slug}-${w}.png`
      const baselinePath = path.join(BASELINE, name)

      if (UPDATE || !existsSync(baselinePath)) {
        writeFileSync(baselinePath, shot)
        seeded.push(name)
        continue
      }

      const a = PNG.sync.read(readFileSync(baselinePath))
      const b = PNG.sync.read(shot)
      if (a.width !== b.width || a.height !== b.height) {
        failures.push(`${name}: size changed ${a.width}×${a.height} → ${b.width}×${b.height}`)
        writeFileSync(path.join(DIFF_DIR, `current-${name}`), shot)
        continue
      }
      const diff = new PNG({ width: a.width, height: a.height })
      const diffPixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: PIXEL_THRESHOLD })
      const ratio = diffPixels / (a.width * a.height)
      compared++
      if (ratio > MAX_DIFF_RATIO) {
        failures.push(`${name}: ${(ratio * 100).toFixed(2)}% pixels changed (${diffPixels}px) — limit 1%`)
        writeFileSync(path.join(DIFF_DIR, `diff-${name}`), PNG.sync.write(diff))
        writeFileSync(path.join(DIFF_DIR, `current-${name}`), shot)
      }
    }
    await ctx.close()
  }

  await browser.close()
  server.close()

  if (seeded.length) {
    console.log(`${UPDATE ? 'Re-seeded' : 'Seeded new'} baseline(s) → website-next/visual-baseline/ (commit them):`)
    for (const s of seeded) console.log(`  + ${s}`)
  }
  if (failures.length) {
    console.error(`\n✗ VISUAL REGRESSION: ${failures.length} route(s) changed materially (diffs in ${DIFF_DIR})\n`)
    for (const f of failures) console.error(`  ✗ ${f}`)
    console.error('\nIf the change is INTENTIONAL: re-run with --update, review, and commit the new baselines (see header).')
    process.exit(1)
  }
  console.log(`\n✓ VISUAL REGRESSION: ${compared} screenshot(s) match the committed baselines (≤1% pixel drift)` +
    (seeded.length ? ` · ${seeded.length} seeded` : ''))
}

main().catch((err) => {
  server.close()
  console.error('✗ test-visual-regression crashed:', err)
  process.exit(1)
})
