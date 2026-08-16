import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { existsSync, statSync } from 'node:fs'

const OUT = '/home/user/V6.B4-Artist-Pre-Booking-Intelligence-Growth-System/website-next/out'
const AXE = readFileSync('/home/user/V6.B4-Artist-Pre-Booking-Intelligence-Growth-System/website-next/node_modules/axe-core/axe.min.js', 'utf8')
const PORT = 4712
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico':'image/x-icon' }
function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname.split('?')[0])
  const rel = clean.replace(/\/+$/, '') || '/'
  const fsPath = path.join(OUT, rel)
  if (existsSync(fsPath)) {
    const st = statSync(fsPath)
    if (st.isFile()) return fsPath
    if (st.isDirectory()) { const idx = path.join(fsPath, 'index.html'); if (existsSync(idx)) return idx }
  }
  if (existsSync(fsPath + '.html')) return fsPath + '.html'
  return null
}
const server = createServer((req, res) => {
  const f = resolveFile(req.url)
  if (f) { res.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); res.end(readFileSync(f)); return }
  res.writeHead(404); res.end('nf')
})
await new Promise(r => server.listen(PORT, '127.0.0.1', r))

const ROUTES = ['/', '/bookers', '/privacy', '/terms', '/accessibility']

const browser = await chromium.launch()
const page = await browser.newPage()
for (const route of ROUTES) {
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load' })
  await page.addScriptTag({ content: AXE })
  const results = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
    return r.violations.filter(v => v.id === 'color-contrast').map(v => ({
      nodes: v.nodes.slice(0, 6).map(n => ({ html: n.html.slice(0, 150), summary: n.failureSummary }))
    }))
  })
  console.log(`\n=== ${route} ===`)
  for (const v of results) for (const n of v.nodes) console.log(n.html, '\n   ', n.summary.replace(/\n/g,' '), '\n')
}
await browser.close()
server.close()
