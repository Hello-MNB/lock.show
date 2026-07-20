import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { chromium } from 'playwright'

const ROOT = '/home/user/V6.B4-Artist-Pre-Booking-Intelligence-Growth-System'
const DIST = join(ROOT, 'dist')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' }

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

const browser = await chromium.launch()
for (const [label, w, h] of [['MOBILE-360', 360, 780], ['DESKTOP-1360', 1360, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  for (const view of [null, 'rep', 'production', 'private']) {
    const url = `http://127.0.0.1:${port}/passport/demo-artist${view ? `?view=${view}` : ''}`
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)

    const explorerRail = page.locator('[role="tablist"][aria-label="Evidence chapters"]')
    const railTabs = explorerRail.locator('[role="tab"]')
    const railCount = await railTabs.count()
    const labels = await railTabs.allInnerTexts()
    console.log(`[${label}] view=${view || 'booking'} chapters=${railCount} labels=${JSON.stringify(labels)}`)

    // walk every chapter via rail click, checking for h-scroll + visible content
    for (let i = 0; i < railCount; i++) {
      await railTabs.nth(i).click()
      await page.waitForTimeout(150)
      const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      const selectedIdx = await railTabs.evaluateAll((els) => els.findIndex((e) => e.getAttribute('aria-selected') === 'true'))
      if (hscroll) console.log(`  ✗ h-scroll after clicking chapter ${i}`)
      if (selectedIdx !== i) console.log(`  ✗ rail selected index mismatch: clicked ${i} got ${selectedIdx}`)
    }

    // expand a collapsed proof card, if any exist (only fires when >1 draw unit)
    const collapsedCards = page.locator('article[aria-expanded="false"] button')
    const ccCount = await collapsedCards.count()
    if (ccCount > 0) {
      await collapsedCards.first().click()
      await page.waitForTimeout(150)
      const nowExpanded = await page.locator('article[aria-expanded="true"]').count()
      console.log(`  proof-card expand: collapsed-candidates=${ccCount} now-expanded-articles=${nowExpanded}`)
    }

    // swipe test on the chapter frame (touch emulation) — only meaningful w/ touch context, skip detailed assert, just ensure no crash
    // aria-live region present
    const live = await page.locator('[aria-live="polite"]').count()
    if (live === 0) console.log('  ✗ missing aria-live region')
  }
  console.log(`[${label}] console/page errors: ${errors.length}`, errors.slice(0, 8))
  await page.close()
}
await browser.close()
server.close()
