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

const all = existsSync(DIR) ? readdirSync(DIR).sort() : []
const svgs = all.filter((f) => f.endsWith('.svg'))
// THE REVERSE DIRECTION TOO — QA-INDEP-04, M3. This gate iterates the SOURCES, so
// a PNG dropped into the served directory with no SVG beside it is governed by
// nothing: test:brand structurally cannot read a PNG, this gate never looks at one
// without a sibling source, and test:seo only checks that a referenced image
// exists. That is H2's own finding — source gated, artifact not — one step over.
const orphanPngs = all.filter((f) => f.endsWith('.png') && !all.includes(f.replace(/\.png$/, '.svg')))
check('every served PNG has a governed SVG source', orphanPngs.length === 0,
  `${orphanPngs.join(', ')} — a card nothing can re-render is a card nothing can check`)
// NON-VACUITY. An empty directory, a renamed folder or a changed extension would
// otherwise report a clean result forever.
check('the OG source directory contains SVGs to check', svgs.length >= 5, `${svgs.length} found`)

const sha = (b) => createHash('sha256').update(b).digest('hex')
const browser = await chromium.launch()

// ── L1 · THE BYTE COMPARISON PINS A FONT ENVIRONMENT, AND SAID SO NOWHERE ─────
// QA-INDEP-04: the SVGs declare Manrope, DM Mono, Georgia, Heebo and Space Mono,
// embed no @font-face and no font data, and this container has none of those
// families. So the committed PNGs are FALLBACK renders, and comparing bytes makes
// them canonical: on a machine that does have the brand faces, render-og.mjs
// produces different pixels and this gate fails. It fails LOUDLY, which is why it
// is not a hole — but a byte mismatch reads like "someone edited the card", and
// the true cause would be "your machine has the fonts and the baseline does not".
//
// So the environment is measured, named in the summary, and pinned. Asked of the
// BROWSER rather than fontconfig, because what matters is what the renderer can
// resolve, not what the OS has installed.
const DECLARED_FAMILIES = ['Manrope', 'DM Mono', 'Georgia', 'Heebo', 'Space Mono']
// The families available WHEN THE COMMITTED PNGS WERE RENDERED. Changing this is
// a deliberate act: it means the baseline images must be re-rendered and looked at.
const FONT_BASELINE = []
{
  // MEASURED BEHAVIOURALLY, not asked. `document.fonts.check('12px "Manrope"')`
  // returned TRUE for all five families on a container that fontconfig says has
  // none of them — it reports whether the string can be rendered, fallback
  // included, which is true of any family name at all. An oracle that answers yes
  // for a font nobody installed is worse than no oracle. So each family is
  // compared against a deliberately nonexistent one: identical advance width for
  // the same string means the renderer fell back, i.e. the family is NOT present.
  const page = await browser.newPage()
  const probeResult = await page.evaluate((fams) => {
    // THREE GENERICS, not one (QA-INDEP-05, L1). Probing against `monospace`
    // alone is blind exactly when the family being tested IS what the renderer
    // resolves `monospace` to: the widths match and a PRESENT font is reported
    // absent. Demonstrated on this container — DejaVu Sans Mono is installed and
    // the single-generic probe called it missing. That inverts the diagnosis this
    // check exists to give: the operator would be told the font environment
    // matches while the fonts are precisely what changed. A family counts as
    // present if it differs under ANY generic.
    const c = document.createElement('canvas').getContext('2d')
    const probe = 'MWQ@1il — mixed 0O'
    const widthIn = (f, g) => { c.font = `48px "${f}", ${g}`; return c.measureText(probe).width }
    const GENERICS = ['monospace', 'serif', 'sans-serif']
    const fallback = Object.fromEntries(GENERICS.map((g) => [g, widthIn('__b4_no_such_family__', g)]))
    // THE PROBE CAN BE DEGENERATE, AND SILENTLY — QA-INDEP-06, L1 residual.
    // Three generics only widen the probe if the renderer resolves them to three
    // different faces. A minimal container where `serif`, `sans-serif` and
    // `monospace` all land on the same fallback face gives three identical
    // widths, and the original single-generic blindness is back whole: a family
    // that IS that face measures equal under all three and is reported ABSENT.
    // Reported rather than assumed away, and acted on below.
    const distinct = new Set(GENERICS.map((g) => fallback[g])).size
    return { available: fams.filter((f) => GENERICS.some((g) => widthIn(f, g) !== fallback[g])), distinct }
  }, DECLARED_FAMILIES)
  await page.close()
  const { available, distinct } = probeResult
  // A DEGENERATE PROBE MAY NOT REPORT AN ABSENCE. If every generic resolves to
  // one face, "absent" is indistinguishable from "identical to the fallback", so
  // the only honest verdict is that this run cannot say. It stays silent when
  // nothing is reported absent, because then the degeneracy hid nothing.
  const missing = DECLARED_FAMILIES.filter((f) => !available.includes(f))
  check('the three generic fallbacks resolve to different faces, so an "absent" verdict means absent',
    distinct >= 2 || missing.length === 0,
    `all ${['monospace', 'serif', 'sans-serif'].length} generics measure identically on this machine, so ${JSON.stringify(missing)} cannot be distinguished from "identical to the one installed fallback face" — install a second font family, or re-render and review the cards visually rather than trusting this probe`)
  check('the font environment matches the one the committed PNGs were rendered in',
    JSON.stringify(available.sort()) === JSON.stringify([...FONT_BASELINE].sort()),
    `this machine resolves ${JSON.stringify(available)}, the baseline was rendered with ${JSON.stringify(FONT_BASELINE)} — a byte mismatch below would be caused by the FONTS, not by an edited card. Re-render with \`node scripts/render-og.mjs\` and review the cards visually before updating FONT_BASELINE`)
  console.log(`        fonts: ${DECLARED_FAMILIES.length} families declared by the SVGs, ${available.length} resolvable here${available.length === 0 ? ' — every card is a FALLBACK render' : ''}`)
}
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
console.log(`✓ OG ASSETS: all ${svgs.length} share cards re-rendered and byte-identical to their committed PNGs, and every served PNG has a governed SVG source — the artifact social platforms actually fetch is the one the governed source draws. NOT proven here: what any platform's own scaler or cache serves, and NOT that the cards look as designed — the SVGs declare ${DECLARED_FAMILIES.length} font families, embed none, and this environment resolves none of them, so these are FALLBACK renders pinned by FONT_BASELINE (see OG-FONTS in docs/OWNER-PENDING.md).`)
process.exit(0)
