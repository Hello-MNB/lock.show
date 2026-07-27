// ============================================================
// SEO CONTRACT REGRESSION HARNESS — scripts/test-seo-contract.mjs (T-96 Phase 5,
// built FIRST, before any SEO change lands — it asserts the CURRENT state so
// later phases cannot silently regress it).
//
// Static assertions over website-next SOURCE plus the built static export
// (website-next/out). What it asserts:
//   S1  every app/**/page.tsx exports metadata with a top-level title,
//       description, and alternates.canonical
//   S2  titles / descriptions / canonicals are UNIQUE across pages
//   S3  ONE host: every canonical resolves to the metadataBase host declared in
//       app/layout.tsx (host-agnostic — the test survives a future host ruling
//       because it asserts CONSISTENCY, not the literal string lock.show)
//   S4  app/sitemap.ts: all URLs on the metadataBase host, no /app/* URLs, no
//       duplicates, and the path set covers exactly the app/**/page.tsx routes
//   S5  app/robots.ts: disallows /app, sitemap reference on the same host
//   S6  built HTML (out/**/*.html): every <link rel="canonical"> resolves to
//       the metadataBase host; every <script type="application/ld+json"> block
//       parses as JSON and every node carries a KNOWN @type
//   S7  every FAQPage question NAME is visible in the page's body text
//       (rich-results guideline: FAQ markup must match visible content)
//
// KNOWN-DEBT ALLOWLIST (assert-and-document, do NOT fail):
//   C5  the HOMEPAGE FAQPage questions are NOT visible in the homepage body —
//       scheduled for the Phase-3 content pass. Until then S7 WARNS on "/"
//       instead of failing. Flip the const below to true once Phase 3 lands.
const C5_HOMEPAGE_FAQ_VISIBILITY_ENFORCED = false // TODO(T-96 Phase 3): flip to true when the homepage shows its FAQ questions in body text
//
// Requires website-next/out (the JSON-LD source of truth is the BUILT page):
//     cd website-next && npx next build
// Run: npm run test:seo   (wired into `npm run verify`)
// ============================================================
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'website-next'
const APP = join(SITE, 'app')
const OUT = join(SITE, 'out')

let failed = false
const warns = []
function fail(msg) { console.error(`✗ seo-contract: ${msg}`); failed = true }
function warn(msg) { warns.push(msg); console.warn(`⚠ seo-contract (allowlisted): ${msg}`) }

// ── helpers ──────────────────────────────────────────────────────────────────

/** Enumerate app-router routes: every dir with a page.tsx. */
function enumeratePages(dir, prefix = '') {
  const pages = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      pages.push(...enumeratePages(join(dir, entry.name), `${prefix}/${entry.name}`))
    } else if (entry.name === 'page.tsx') {
      pages.push({ route: prefix === '' ? '/' : prefix, file: join(dir, 'page.tsx') })
    }
  }
  return pages
}

/** Extract the balanced `{...}` block following `export const metadata`. */
function extractMetadataBlock(src, file) {
  const start = src.indexOf('export const metadata')
  if (start === -1) return null
  const open = src.indexOf('{', start)
  if (open === -1) return null
  let depth = 0, inStr = null
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (inStr) {
      if (c === '\\') i++
      else if (c === inStr) inStr = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return src.slice(open, i + 1)
    }
  }
  fail(`${file}: unbalanced metadata object literal`)
  return null
}

/** Depth-1 keys of an object literal → raw value text (string-aware scan). */
function topLevelEntries(block) {
  const entries = {}
  let depth = 0, inStr = null, key = null, valStart = 0
  for (let i = 0; i < block.length; i++) {
    const c = block[i]
    if (inStr) {
      if (c === '\\') i++
      else if (c === inStr) inStr = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue }
    if (c === '{' || c === '[' || c === '(') {
      depth++
      continue
    }
    if (c === '}' || c === ']' || c === ')') {
      depth--
      if (depth === 0 && key) { entries[key] = block.slice(valStart, i).trim(); key = null }
      continue
    }
    if (depth === 1) {
      if (key === null) {
        const m = /^[\s,]*([A-Za-z_$][\w$]*)\s*:/.exec(block.slice(i))
        if (m) { key = m[1]; i += m[0].length - 1; valStart = i + 1 }
      } else if (c === ',') {
        entries[key] = block.slice(valStart, i).trim()
        key = null
      }
    }
  }
  return entries
}

/** First quoted string inside a raw value snippet. */
function firstString(raw) {
  const m = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/.exec(raw ?? '')
  return m ? m[2].replace(/\\(['"`])/g, '$1') : null
}

/** Very small HTML-entity decode + tag strip for visible-text comparison. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
}
const norm = (s) => s.replace(/[\u2066\u2069\u200e\u200f]/g, '').replace(/\s+/g, ' ').trim()

// ── S0. metadataBase host from app/layout.tsx ────────────────────────────────
const layoutSrc = readFileSync(join(APP, 'layout.tsx'), 'utf8')
const mbMatch = layoutSrc.match(/metadataBase:\s*new URL\(\s*([^)]+?)\s*\)/)
if (!mbMatch) { fail('metadataBase not found in app/layout.tsx'); process.exit(1) }
let baseUrl = firstString(mbMatch[1])
if (!baseUrl) {
  // identifier form: metadataBase: new URL(SITE_URL) → resolve the const
  const id = mbMatch[1].trim()
  const constMatch = layoutSrc.match(new RegExp(`const\\s+${id}\\s*=\\s*(['"\`])(https?://[^'"\`]+)\\1`))
  if (!constMatch) { fail(`metadataBase identifier ${id} not resolvable in app/layout.tsx`); process.exit(1) }
  baseUrl = constMatch[2]
}
const BASE_HOST = new URL(baseUrl).host
console.log(`  metadataBase host (app/layout.tsx): ${BASE_HOST}`)

// ── S1 + S2 + S3. per-page metadata ──────────────────────────────────────────
const pages = enumeratePages(APP)
const titles = new Map(), descriptions = new Map(), canonicals = new Map()
for (const { route, file } of pages) {
  const src = readFileSync(file, 'utf8')
  const block = extractMetadataBlock(src, file)
  if (!block) { fail(`${file}: no \`export const metadata\` found`); continue }
  const entries = topLevelEntries(block)

  const title = firstString(entries.title)
  const description = firstString(entries.description)
  const canonical = firstString(entries.alternates?.match(/canonical:\s*([\s\S]+)/)?.[1])

  if (!title) fail(`${file}: metadata has no top-level title`)
  if (!description) fail(`${file}: metadata has no top-level description`)
  if (!canonical) fail(`${file}: metadata has no alternates.canonical`)

  if (title) {
    if (titles.has(title)) fail(`duplicate title "${title}" — ${file} and ${titles.get(title)}`)
    titles.set(title, file)
  }
  if (description) {
    if (descriptions.has(description)) fail(`duplicate description — ${file} and ${descriptions.get(description)}`)
    descriptions.set(description, file)
  }
  if (canonical) {
    if (canonicals.has(canonical)) fail(`duplicate canonical "${canonical}" — ${file} and ${canonicals.get(canonical)}`)
    canonicals.set(canonical, file)
    // S3 — resolve against metadataBase, must land on the ONE host
    const resolved = new URL(canonical, baseUrl)
    if (resolved.host !== BASE_HOST) {
      fail(`${file}: canonical "${canonical}" resolves to ${resolved.host}, not metadataBase host ${BASE_HOST}`)
    }
    // canonical must match the page's own route (a wrong-page canonical is a
    // duplicate-content signal even when unique)
    const expected = route === '/' ? '/' : route
    if (resolved.pathname.replace(/\/+$/, '') !== (expected === '/' ? '' : expected)) {
      fail(`${file}: canonical path "${resolved.pathname}" does not match its route "${route}"`)
    }
  }
}
if (!failed) console.log(`✓ S1-S3: ${pages.length} pages — metadata + unique title/description/canonical, all canonicals on ${BASE_HOST}`)

// ── S4. sitemap.ts ───────────────────────────────────────────────────────────
const sitemapSrc = readFileSync(join(APP, 'sitemap.ts'), 'utf8')
const smBase = sitemapSrc.match(/const BASE = (['"`])(https?:\/\/[^'"`]+)\1/)?.[2]
if (!smBase) fail('sitemap.ts: BASE const not found')
else if (new URL(smBase).host !== BASE_HOST) {
  fail(`sitemap.ts BASE host ${new URL(smBase).host} != metadataBase host ${BASE_HOST}`)
}
const smPaths = [...sitemapSrc.matchAll(/\{\s*path:\s*'([^']*)'/g)].map((m) => m[1])
if (!smPaths.length) fail('sitemap.ts: no path entries parsed')
const seen = new Set()
for (const p of smPaths) {
  if (seen.has(p)) fail(`sitemap.ts: duplicate path "${p}"`)
  seen.add(p)
  if (p === '/app' || p.startsWith('/app/')) fail(`sitemap.ts: contains /app URL "${p}" (robots disallows /app)`)
  if (/^https?:\/\//.test(p)) fail(`sitemap.ts: absolute path "${p}" bypasses BASE`)
}
// bidirectional coverage: sitemap paths ('' = home) ↔ page routes
const smRoutes = new Set(smPaths.map((p) => (p === '' ? '/' : p)))
const fsRoutes = new Set(pages.map((p) => p.route))
for (const r of fsRoutes) if (!smRoutes.has(r)) fail(`sitemap.ts: route ${r} (page.tsx exists) missing from sitemap`)
for (const r of smRoutes) if (!fsRoutes.has(r)) fail(`sitemap.ts: lists ${r} but no app${r}/page.tsx exists`)
if (!failed) console.log(`✓ S4: sitemap — ${smPaths.length} URLs, one host, no /app/*, no duplicates, covers all ${fsRoutes.size} routes`)

// ── S5. robots.ts ────────────────────────────────────────────────────────────
const robotsSrc = readFileSync(join(APP, 'robots.ts'), 'utf8')
const disallowRaw = robotsSrc.match(/disallow:\s*(\[[^\]]*\]|'[^']*')/)?.[1] ?? ''
if (!/['"]\/app['"]/.test(disallowRaw)) fail(`robots.ts: disallow does not include '/app' (got: ${disallowRaw || 'nothing'})`)
const robotsSitemap = robotsSrc.match(/sitemap:\s*(['"`])(https?:\/\/[^'"`]+)\1/)?.[2]
if (!robotsSitemap) fail('robots.ts: no sitemap reference')
else {
  if (new URL(robotsSitemap).host !== BASE_HOST) fail(`robots.ts sitemap host ${new URL(robotsSitemap).host} != ${BASE_HOST}`)
  if (!robotsSitemap.endsWith('/sitemap.xml')) fail(`robots.ts sitemap "${robotsSitemap}" does not point at /sitemap.xml`)
}
if (!failed) console.log(`✓ S5: robots — /app disallowed, sitemap on ${BASE_HOST}`)

// ── S6 + S7. built HTML: canonical tags + JSON-LD blocks + FAQ visibility ────
// The built page is the source of truth for what crawlers actually receive.
if (!existsSync(join(OUT, 'index.html'))) {
  fail(`website-next/out missing — build the static export first: cd website-next && npx next build`)
} else {
  const KNOWN_TYPES = new Set([
    'WebSite', 'Organization', 'SoftwareApplication', 'FAQPage',
    'BreadcrumbList', 'WebPage', 'Question', 'Service', 'Event', 'Person',
  ])
  const htmlFiles = []
  ;(function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) { if (entry.name !== '_next') walk(p) }
      else if (entry.name.endsWith('.html')) htmlFiles.push(p)
    }
  })(OUT)

  let ldBlocks = 0, canonTags = 0, faqPages = 0
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8')
    const rel = '/' + f.slice(OUT.length + 1).replace(/\\/g, '/').replace(/(index)?\.html$/, '').replace(/\/$/, '')
    const route = rel === '' || rel === '/' ? '/' : rel

    // canonical link tags → one host
    for (const m of html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"|<link[^>]+href="([^"]+)"[^>]+rel="canonical"/g)) {
      canonTags++
      const href = m[1] ?? m[2]
      const host = new URL(href, baseUrl).host
      if (host !== BASE_HOST) fail(`${f}: <link rel="canonical" href="${href}"> resolves to ${host}, not ${BASE_HOST}`)
    }

    // ld+json blocks → parse, known @type on every node
    const body = visibleText(html)
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      ldBlocks++
      let data
      try { data = JSON.parse(m[1]) } catch (e) {
        fail(`${f}: ld+json block does not parse (${e.message})`)
        continue
      }
      const roots = Array.isArray(data) ? data : [data]
      const nodes = roots.flatMap((r) => (r['@graph'] ? r['@graph'] : [r]))
      for (const node of nodes) {
        if (!node['@type']) { fail(`${f}: ld+json node without @type`); continue }
        for (const t of [].concat(node['@type'])) {
          if (!KNOWN_TYPES.has(t)) fail(`${f}: unknown ld+json @type "${t}"`)
        }
        // S7 — FAQPage questions must be VISIBLE in body text
        if ([].concat(node['@type']).includes('FAQPage')) {
          faqPages++
          for (const q of node.mainEntity ?? []) {
            const name = norm(q.name ?? '')
            if (!name) { fail(`${f}: FAQPage Question without name`); continue }
            if (!norm(body).includes(name)) {
              const msg = `${f} (route ${route}): FAQPage question not visible in body text: "${name}"`
              if (route === '/' && !C5_HOMEPAGE_FAQ_VISIBILITY_ENFORCED) {
                warn(`C5 · ${msg} — known debt, Phase-3 content pass will surface the FAQ on the homepage; flip C5_HOMEPAGE_FAQ_VISIBILITY_ENFORCED when it lands`)
              } else {
                fail(`S7 · ${msg}`)
              }
            }
          }
        }
      }
    }
  }
  if (!ldBlocks) fail('out/: no application/ld+json blocks found in built HTML — structured data disappeared')
  if (!canonTags) fail('out/: no <link rel="canonical"> tags found in built HTML')
  if (!failed) console.log(`✓ S6-S7: built HTML — ${htmlFiles.length} pages, ${canonTags} canonical tags on ${BASE_HOST}, ${ldBlocks} ld+json blocks parse with known @type, ${faqPages} FAQPage blocks checked for visibility`)
}

// ── verdict ──────────────────────────────────────────────────────────────────
if (failed) {
  console.error('\n✗ SEO CONTRACT: violations above — the current-state contract is broken.')
  process.exit(1)
}
console.log(`\n✓ SEO CONTRACT: all assertions hold${warns.length ? ` (${warns.length} allowlisted warning${warns.length > 1 ? 's' : ''} — known debt, see C5)` : ''}.`)
