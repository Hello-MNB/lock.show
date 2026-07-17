// ============================================================
// COMPONENT-STYLES REGISTRY GENERATOR (T-47 / W4-3, spec §5.8) — the widget-kit
// style registry, GENERATED FROM CODE so it can never drift by hand:
//   source of truth 1: src/index.css        → @layer components (CSS primitives:
//                      each .class → its @apply recipe + raw declarations)
//   source of truth 2: src/components/ui.jsx → exported UI components (name →
//                      the comment line above it + the primitive classes it renders)
//   token vocabulary:  tailwind.config.js   → colors / boxShadow / fontFamily keys
// Emits docs/design-system/COMPONENT-STYLES.md — one row per primitive/component:
//   name · recipe/classes · token dependencies · states covered · usage-law line.
// Output is fully deterministic (sorted by name, content derived only from the
// three source files above).
// Modes:
//   node scripts/generate-component-styles.mjs          write the file
//   node scripts/generate-component-styles.mjs --check  regenerate to a temp
//     string, diff against the committed file, exit 1 on drift (verify hook).
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CSS = join(ROOT, 'src/index.css')
const UI = join(ROOT, 'src/components/ui.jsx')
const TW = join(ROOT, 'tailwind.config.js')
const OUT = join(ROOT, 'docs/design-system/COMPONENT-STYLES.md')

function die(msg) { console.error(`✗ component-styles: ${msg}`); process.exit(1) }
const collapse = (s) => s.replace(/\s+/g, ' ').trim()
const cell = (s) => collapse(String(s ?? '')).replace(/\|/g, '\\|') || '—'

// ── 0. token vocabulary from tailwind.config.js ──────────────────────────────
const twSrc = readFileSync(TW, 'utf8')
function blockOf(src, header) {
  const i = src.indexOf(header)
  if (i === -1) die(`'${header}' not found in tailwind.config.js`)
  const open = src.indexOf('{', i)
  let depth = 0
  for (let j = open; j < src.length; j++) {
    if (src[j] === '{') depth++
    else if (src[j] === '}' && --depth === 0) return src.slice(open + 1, j)
  }
  die(`unbalanced braces after '${header}'`)
}
function keysOf(block) {
  const keys = []
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*(?:'([^']+)'|([A-Za-z0-9_-]+))\s*:/)
    if (m) keys.push(m[1] ?? m[2])
  }
  return keys
}
const COLOR_KEYS = keysOf(blockOf(twSrc, 'colors:'))
const SHADOW_KEYS = keysOf(blockOf(twSrc, 'boxShadow:'))
const FONT_KEYS = keysOf(blockOf(twSrc, 'fontFamily:'))
if (!COLOR_KEYS.length) die('no color tokens parsed from tailwind.config.js')

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
// Which design tokens does a chunk of source depend on? (utility classes,
// theme() references, and hardcoded hexes — the last flagged for audits.)
function tokenDeps(text) {
  const found = new Set()
  for (const t of COLOR_KEYS) {
    if (new RegExp(`(?:bg|text|border|ring|from|via|to|fill|stroke|decoration|outline)-${esc(t)}(?![A-Za-z0-9-])`).test(text)) found.add(`color.${t}`)
    if (new RegExp(`theme\\('colors\\.${esc(t)}'\\)`).test(text)) found.add(`color.${t}`)
  }
  for (const t of SHADOW_KEYS) {
    if (new RegExp(`shadow-${esc(t)}(?![A-Za-z0-9-])`).test(text)) found.add(`shadow.${t}`)
  }
  for (const t of FONT_KEYS) {
    if (new RegExp(`font-${esc(t)}(?![A-Za-z0-9-])`).test(text)) found.add(`font.${t}`)
    if (new RegExp(`theme\\('fontFamily\\.${esc(t)}'\\)`).test(text)) found.add(`font.${t}`)
  }
  for (const m of text.matchAll(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g)) found.add(`hex ${m[0]}`)
  return [...found].sort()
}

// Which interaction states does a chunk of css/recipe cover?
function statesIn(text) {
  const s = new Set()
  if (/\bhover:|:hover\b/.test(text)) s.add('hover')
  if (/\bfocus\b|focus-visible|\bfocus:/.test(text)) s.add('focus')
  if (/\bactive:|:active\b/.test(text)) s.add('active')
  if (/\bdisabled\b/.test(text)) s.add('disabled')
  if (/placeholder/.test(text)) s.add('placeholder')
  if (/animation|animate-|@keyframes|shimmer/.test(text)) s.add('motion')
  return s
}

// ── 1. src/index.css → @layer components primitives ──────────────────────────
const cssSrc = readFileSync(CSS, 'utf8')
function layerBody(css, name) {
  const i = css.indexOf(`@layer ${name}`)
  if (i === -1) die(`@layer ${name} not found in src/index.css`)
  const open = css.indexOf('{', i)
  let depth = 0
  for (let j = open; j < css.length; j++) {
    if (css[j] === '{') depth++
    else if (css[j] === '}' && --depth === 0) return css.slice(open + 1, j)
  }
  die(`unbalanced braces in @layer ${name}`)
}
const componentsLayer = layerBody(cssSrc, 'components')
const utilitiesLayer = layerBody(cssSrc, 'utilities')

// Sequential rule parser: comments between rules attach to the NEXT rule.
function parseRules(layer) {
  const rules = [] // { selectors, body, comment }
  let i = 0
  let pending = []
  while (i < layer.length) {
    if (/\s/.test(layer[i])) { i++; continue }
    if (layer.startsWith('/*', i)) {
      const end = layer.indexOf('*/', i)
      pending.push(layer.slice(i + 2, end === -1 ? layer.length : end))
      i = (end === -1 ? layer.length : end + 2)
      continue
    }
    const open = layer.indexOf('{', i)
    if (open === -1) break
    const selectors = collapse(layer.slice(i, open))
    let depth = 0, j = open
    for (; j < layer.length; j++) {
      if (layer[j] === '{') depth++
      else if (layer[j] === '}' && --depth === 0) break
    }
    rules.push({ selectors, body: layer.slice(open + 1, j), comment: collapse(pending.join(' ')) })
    pending = []
    i = j + 1
  }
  return rules
}

// Group parsed rules per base class → { recipe, rawProps, states, comment, css }
function primitivesOf(rules) {
  const map = new Map()
  for (const rule of rules) {
    const bodyComments = [...rule.body.matchAll(/\/\*([\s\S]*?)\*\//g)].map((m) => collapse(m[1]))
    const bodyNoComments = rule.body.replace(/\/\*[\s\S]*?\*\//g, '')
    const decls = bodyNoComments.split(';').map(collapse).filter(Boolean)
    for (const sel of rule.selectors.split(',').map(collapse)) {
      const m = sel.match(/\.([A-Za-z0-9_-]+)/)
      if (!m) continue
      const name = m[1]
      if (!map.has(name)) map.set(name, { recipe: [], rawProps: [], states: new Set(), comment: '', css: [] })
      const p = map.get(name)
      p.css.push(sel, rule.body)
      if (!p.comment) p.comment = rule.comment || bodyComments[0] || ''
      const variant = sel.replace(/^[^:]*/, '') // pseudo part, e.g. :hover / ::before
      for (const d of decls) {
        // dedupe — compound selectors (e.g. `button.chip, a.chip`) hit the
        // same base class twice with identical declarations
        if (d.startsWith('@apply')) {
          const r = d.replace(/^@apply\s+/, '')
          if (!p.recipe.includes(r)) p.recipe.push(r)
        } else {
          const raw = variant ? `${variant} { ${d} }` : d
          if (!p.rawProps.includes(raw)) p.rawProps.push(raw)
        }
      }
      for (const st of statesIn(sel + ' ' + bodyNoComments)) p.states.add(st)
    }
  }
  return map
}
const primitives = primitivesOf(parseRules(componentsLayer))
const utilityClasses = [...primitivesOf(parseRules(utilitiesLayer)).keys()]
if (primitives.size === 0) die('no primitives parsed from @layer components')

// class inventory used to detect what a JSX component renders
const CLASS_INVENTORY = [...new Set([...primitives.keys(), ...utilityClasses, 'animate-fade-in', 'animate-shimmer'])].sort()

// ── 2. src/components/ui.jsx → exported components ───────────────────────────
const uiSrc = readFileSync(UI, 'utf8')
const uiLines = uiSrc.split('\n')
const exportIdx = [] // { name, line }
uiLines.forEach((l, n) => {
  const m = l.match(/^export (?:function (\w+)|const (\w+))/)
  if (m) exportIdx.push({ name: m[1] ?? m[2], line: n })
})
if (!exportIdx.length) die('no exports found in src/components/ui.jsx')

// top-level declaration starts (span boundaries)
const topLevel = []
uiLines.forEach((l, n) => { if (/^(export |function |const )/.test(l)) topLevel.push(n) })

function commentAbove(line) {
  const out = []
  for (let n = line - 1; n >= 0; n--) {
    const t = uiLines[n].trim()
    if (t.startsWith('//')) out.unshift(t.replace(/^\/\/\s?/, ''))
    else if (t.endsWith('*/')) { // walk a /* */ block
      for (let k = n; k >= 0; k--) {
        out.unshift(uiLines[k].trim().replace(/^\/\*+\s?|\*+\/$|^\*\s?/g, ''))
        if (uiLines[k].trim().startsWith('/*')) break
      }
      break
    } else break
  }
  return collapse(out.join(' '))
}

const components = exportIdx.map(({ name, line }) => {
  const next = topLevel.find((n) => n > line) ?? uiLines.length
  const span = uiLines.slice(line, next).join('\n')
    // strip comments BEFORE string extraction — apostrophes in prose comments
    // ("the artist's ONE next move") otherwise open phantom string literals
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  // only look INSIDE string literals — avoids prop names masquerading as classes
  const strings = [...span.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)]
    .map((m) => m[1] ?? m[2] ?? m[3]).join(' ')
  const classes = CLASS_INVENTORY.filter((c) => new RegExp(`(?<![\\w-])${esc(c)}(?![\\w-])`).test(strings))
  // states = own markup states ∪ states inherited from the primitives it renders
  const states = statesIn(span)
  for (const c of classes) for (const st of primitives.get(c)?.states ?? []) states.add(st)
  if (classes.some((c) => /^animate-/.test(c))) states.add('motion')
  return {
    name,
    classes,
    tokens: tokenDeps(strings),
    states: [...states].sort(),
    law: commentAbove(line),
  }
})

// ── 3. emit markdown (sorted, byte-deterministic) ─────────────────────────────
const primRows = [...primitives.entries()].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([name, p]) => ({
  name,
  recipe: p.recipe.map(collapse).join(' · '),
  raw: p.rawProps.join('; '),
  tokens: tokenDeps(p.css.join(' ') + ' ' + p.recipe.join(' ')),
  states: [...p.states].sort(),
  law: p.comment,
}))
const compRows = [...components].sort((a, b) => a.name.localeCompare(b.name, 'en'))

const lines = []
lines.push('# COMPONENT-STYLES — generated registry (T-47 / W4-3, spec §5.8)')
lines.push('')
lines.push('> **GENERATED FILE — DO NOT EDIT BY HAND.** Regenerate: `node scripts/generate-component-styles.mjs`')
lines.push('> Drift check (verify hook): `node scripts/generate-component-styles.mjs --check`')
lines.push('> Sources of truth: `src/index.css` (@layer components) · `src/components/ui.jsx` (exports) · `tailwind.config.js` (token names).')
lines.push('')
lines.push('States covered = interaction states found in the source (`hover / focus / active / disabled / placeholder / motion`).')
lines.push('Token dependencies = tailwind tokens referenced (`color.* / shadow.* / font.*`); `hex #…` flags a hardcoded value for audit.')
lines.push('')
lines.push('## 1. CSS primitives (`src/index.css` → `@layer components`)')
lines.push('')
lines.push('| Primitive | Recipe (@apply) | Raw props | Token dependencies | States covered | Usage law |')
lines.push('|---|---|---|---|---|---|')
for (const r of primRows) {
  lines.push(`| \`.${r.name}\` | ${cell(r.recipe)} | ${cell(r.raw)} | ${cell(r.tokens.join(' · '))} | ${cell(r.states.join(' · '))} | ${cell(r.law)} |`)
}
lines.push('')
lines.push('## 2. UI components (`src/components/ui.jsx` exports)')
lines.push('')
lines.push('| Component | Primitive/utility classes rendered | Token dependencies | States covered | Usage law (source comment) |')
lines.push('|---|---|---|---|---|')
for (const r of compRows) {
  lines.push(`| \`${r.name}\` | ${cell(r.classes.map((c) => `.${c}`).join(' · '))} | ${cell(r.tokens.join(' · '))} | ${cell(r.states.join(' · '))} | ${cell(r.law)} |`)
}
lines.push('')
lines.push(`**Registry count:** ${primRows.length} CSS primitives · ${compRows.length} exported components — ${primRows.length + compRows.length} rows total.`)
lines.push('')
const md = lines.join('\n')

// ── 4. write or --check ───────────────────────────────────────────────────────
if (process.argv.includes('--check')) {
  let committed = null
  try { committed = readFileSync(OUT, 'utf8') } catch { /* missing file = drift */ }
  if (committed !== md) {
    die('docs/design-system/COMPONENT-STYLES.md is stale — regenerate with: node scripts/generate-component-styles.mjs')
  }
  console.log(`✓ component-styles: docs/design-system/COMPONENT-STYLES.md in sync (${primRows.length} primitives + ${compRows.length} components)`)
} else {
  writeFileSync(OUT, md)
  console.log(`✓ component-styles: wrote docs/design-system/COMPONENT-STYLES.md (${primRows.length} primitives + ${compRows.length} components)`)
}
