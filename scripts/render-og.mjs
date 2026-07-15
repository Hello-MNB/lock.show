// Renders the Codex SVG export templates (website-next/public/og/*.svg) to PNG
// at their platform sizes, using the locally-installed Chromium (no network).
// OG/social platforms don't render SVG previews — the PNGs are the real assets;
// the SVGs stay in the repo as the governed source (Codex owns their content).
//
// Usage: node scripts/render-og.mjs
import { chromium } from 'playwright'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'

const DIR = resolve('website-next/public/og')
// Size per template family (from DS v1.6.5 export-template-bank):
// og-*      → 1200×630 (Open Graph)   · social-*-square → 1080×1080
// story-*   → 1080×1920 (story/reel)
function sizeFor(name) {
  if (name.includes('-story-') || name.startsWith('lockshow-story')) return { width: 1080, height: 1920 }
  if (name.includes('square')) return { width: 1080, height: 1080 }
  return { width: 1200, height: 630 }
}

const svgs = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.svg')) : []
if (!svgs.length) { console.error('no SVGs in', DIR); process.exit(1) }

const browser = await chromium.launch()
try {
  for (const f of svgs) {
    const { width, height } = sizeFor(f)
    const page = await browser.newPage({ viewport: { width, height } })
    const svg = readFileSync(resolve(DIR, f), 'utf8')
    await page.setContent(
      `<!doctype html><html><head><style>*{margin:0;padding:0}svg{display:block;width:${width}px;height:${height}px}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'networkidle' },
    )
    const out = resolve(DIR, basename(f, '.svg') + '.png')
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } })
    console.log(`✓ ${f} → ${basename(out)} (${width}×${height})`)
    await page.close()
  }
} finally {
  await browser.close()
}
