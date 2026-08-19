#!/usr/bin/env node
// ============================================================
// OG ASSET FRESHNESS — EXECUTED SUITE
//
// WHY THIS EXISTS (QA-INDEP-03, H2). BRAND-OG found that the site-wide og:image
// was drawn from an SVG carrying a bare "LOCK" wordmark, fixed the SVG, re-rendered
// the PNG, and widened the brand gate to read `.svg`. The brand gate has no clause
// that opens a `.png` — its extension filter cannot — so the reviewer reverted ONLY
// the served artifact, leaving the corrected SVG in place, and the whole chain
// stayed green with the pre-fix image in the tree:
//
//     git show 966024a^:website-next/public/og/og-default.png  →  the bare-"LOCK" render
//     node scripts/test-brand-naming.mjs  →  ✓ zero bare LOCK … GATE_EXIT=0
//
// scripts/render-og.mjs:3 states the premise plainly: "OG/social platforms don't
// render SVG previews — the PNGs are the real assets". BRAND-OG gated the governed
// SOURCE and stopped at the boundary of that model, which is the same mistake its
// own mutation O1 was written to argue against: "the obvious weaker repair would
// also have shown a green gate".
//
// So this gate asserts the ARTIFACT. Every og/*.svg is re-rendered through the same
// pipeline render-og.mjs uses and compared by SHA-256 to the committed PNG. A PNG
// that no longer matches its source — reverted, hand-edited, or simply never
// re-rendered after an SVG change — fails here, whatever the SVG says.
//
// A SKIP IS NOT A PASS: with playwright unresolvable this exits non-zero.
// ============================================================
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, basename } from 'node:path'

const DIR = resolve('website-next/public/og')

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

let chromium
try { ({ chromium } = await import('playwright')) } catch {
  console.error('✗ OG ASSETS: Playwright unavailable — this gate re-renders real pixels, so a skip is NOT a pass. The served share card would go unchecked, which is exactly the hole this gate was opened to close.')
  process.exit(1)
}

// MIRRORS scripts/render-og.mjs `sizeFor`. Duplicated deliberately rather than
// imported, because render-og.mjs launches a browser at module scope. The
// duplication cannot drift silently: every render is also compared against the
// committed PNG's OWN pixel dimensions below, so a rule that disagreed with the
// renderer would produce a size mismatch and fail.
function sizeFor(name) {
  if (name.includes('-story-') || name.startsWith('lockshow-story')) return { width: 1080, height: 1920 }
  if (name.includes('square')) return { width: 1080, height: 1080 }
  return { width: 1200, height: 630 }
}

/** Width and height straight out of the PNG's IHDR chunk. */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

const svgs = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort() : []
// NON-VACUITY. An empty directory, a renamed folder or a changed extension would
// otherwise report a clean result forever.
check('the OG source directory contains SVGs to check', svgs.length >= 5, `${svgs.length} found`)

const sha = (b) => createHash('sha256').update(b).digest('hex')
const browser = await chromium.launch()
try {
  for (const f of svgs) {
    const { width, height } = sizeFor(f)
    const pngPath = resolve(DIR, basename(f, '.svg') + '.png')
    if (!existsSync(pngPath)) {
      check(`${f} has a committed PNG`, false, 'no rendered artifact — social platforms would get nothing')
      continue
    }
    const committed = readFileSync(pngPath)
    const page = await browser.newPage({ viewport: { width, height } })
    const svg = readFileSync(resolve(DIR, f), 'utf8')
    await page.setContent(
      `<!doctype html><html><head><style>*{margin:0;padding:0}svg{display:block;width:${width}px;height:${height}px}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'networkidle' },
    )
    const fresh = await page.screenshot({ clip: { x: 0, y: 0, width, height } })
    await page.close()

    const dim = pngSize(committed)
    check(`${basename(pngPath)} is the size the renderer would produce`,
      dim !== null && dim.width === width && dim.height === height,
      `committed ${dim ? `${dim.width}×${dim.height}` : 'unreadable'}, renderer ${width}×${height}`)
    check(`${basename(pngPath)} matches what its SVG renders`,
      fresh.equals(committed),
      `committed sha ${sha(committed).slice(0, 12)} · re-render sha ${sha(fresh).slice(0, 12)} — run \`node scripts/render-og.mjs\``)
  }
} finally {
  await browser.close()
}

console.log('')
if (failures) { console.log(`✗ OG ASSETS: ${failures} failure(s).`); process.exit(1) }
console.log(`✓ OG ASSETS: all ${svgs.length} share cards re-rendered and byte-identical to their committed PNGs — the artifact social platforms actually fetch is the one the governed source draws. NOT proven here: what any platform's own scaler or cache serves.`)
process.exit(0)
