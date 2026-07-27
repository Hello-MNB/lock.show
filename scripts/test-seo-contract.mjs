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
//       app/layout.tsx via lib/site.ts (consistency is host-agnostic, PLUS one
//       explicit D2 assertion: the canonical host IS www.lock.show)
//   S4  app/sitemap.ts: all URLs on the metadataBase host, no /app/* URLs, no
//       duplicates, and the path set covers exactly the INDEX route class
//   S5  app/robots.ts: does NOT disallow /app (deliberate inversion — /app is
//       de-indexed via X-Robots-Tag + meta noindex, which require the crawl
//       to stay OPEN to be readable), sitemap reference on the same host
//   S6  built HTML (out/**/*.html): every <link rel="canonical"> resolves to
//       the metadataBase host; every <script type="application/ld+json"> block
//       parses as JSON and every node carries a KNOWN @type
//   S7  every FAQPage question NAME is visible in the page's body text
//       (rich-results guideline: FAQ markup must match visible content)
//   S8  ROUTE-CLASS ROBOTS POLICY (T-96 Phase 1.7) — the table below is the
//       policy of record: marketing routes index; legal (D6) + demo (D5)
//       routes carry robots noindex metadata AND are absent from the sitemap
//       (source + built HTML both checked); /app/* has the X-Robots-Tag
//       header configured in website-next/vercel.json AND a meta noindex in
//       every committed public/app/**/index.html shell; the 404 page is
//       noindex in built out/404.html.
//
// C5 (homepage FAQPage with no visible Q&A) is RESOLVED: the invisible
// homepage FAQPage JSON-LD was deleted (T-96 step ③, owner-ruled — manual-
// action risk). The flag stays true so S7 now FAILS if anyone re-adds FAQ
// markup to the homepage without visible questions.
const C5_HOMEPAGE_FAQ_VISIBILITY_ENFORCED = true
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

// ── ROUTE-CLASS POLICY TABLE (T-96 Phase 1.7) — the robots policy of record.
// Every app/**/page.tsx route MUST appear in exactly one class; an
// unclassified new page fails the gate until someone makes the indexation
// decision explicitly.
const ROUTE_POLICY = {
  // Marketing surface: indexable, present in the sitemap.
  index: [
    '/', '/artists', '/bookers', '/producers', '/how-it-works',
    '/methodology', '/pricing', '/radar', '/faq', '/contact',
  ],
  // D6 legal (facts pending owner review) + D5 demo (fictional sample):
  // robots noindex metadata AND absent from the sitemap.
  noindex: ['/privacy', '/terms', '/accessibility', '/passport/demo'],
}
const NOINDEX_ROUTES = new Set(ROUTE_POLICY.noindex)
const INDEX_ROUTES = new Set(ROUTE_POLICY.index)

// D2 (owner ruling, docs/SEO-CHANGELOG.md Entry 2): canonical host = WWW.
// The consistency checks below stay host-agnostic (they compare against
// metadataBase), but the ruling itself is pinned here once.
const EXPECTED_HOST = 'www.lock.show'

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
/** Resolve `const <id> = 'https://…'` in a source string (layout or lib/site.ts). */
function resolveUrlConst(src, id) {
  return src.match(new RegExp(`const\\s+${id}\\s*=\\s*(['"\`])(https?://[^'"\`]+)\\1`))?.[2] ?? null
}
const siteLibSrc = readFileSync(join(SITE, 'lib', 'site.ts'), 'utf8')
let baseUrl = firstString(mbMatch[1])
if (!baseUrl) {
  // identifier form: metadataBase: new URL(SITE_URL) → resolve the const from
  // the layout itself, else from lib/site.ts (the single-source module).
  const id = mbMatch[1].trim()
  baseUrl = resolveUrlConst(layoutSrc, id) ?? resolveUrlConst(siteLibSrc, id)
  if (!baseUrl) { fail(`metadataBase identifier ${id} not resolvable in app/layout.tsx or lib/site.ts`); process.exit(1) }
}
const BASE_HOST = new URL(baseUrl).host
console.log(`  metadataBase host (app/layout.tsx → lib/site.ts): ${BASE_HOST}`)
// D2 pin: consistency checks are host-agnostic, but the ruled host is asserted once.
if (BASE_HOST !== EXPECTED_HOST) {
  fail(`D2 · metadataBase host is ${BASE_HOST}, but the owner-ruled canonical host is ${EXPECTED_HOST}`)
}

// ── S1 + S2 + S3. per-page metadata ──────────────────────────────────────────
const pages = enumeratePages(APP)
const titles = new Map(), descriptions = new Map(), canonicals = new Map()

// S8a — every route must be classified in the policy table (both directions).
for (const { route } of pages) {
  if (!INDEX_ROUTES.has(route) && !NOINDEX_ROUTES.has(route)) {
    fail(`S8 · route ${route} is not classified in ROUTE_POLICY — decide indexation explicitly before shipping the page`)
  }
  if (INDEX_ROUTES.has(route) && NOINDEX_ROUTES.has(route)) {
    fail(`S8 · route ${route} appears in BOTH route classes`)
  }
}
for (const r of [...INDEX_ROUTES, ...NOINDEX_ROUTES]) {
  if (!pages.some((p) => p.route === r)) fail(`S8 · ROUTE_POLICY lists ${r} but no app${r === '/' ? '' : r}/page.tsx exists`)
}

for (const { route, file } of pages) {
  const src = readFileSync(file, 'utf8')
  const block = extractMetadataBlock(src, file)
  if (!block) { fail(`${file}: no \`export const metadata\` found`); continue }
  const entries = topLevelEntries(block)

  // S8b — per-class robots metadata in SOURCE
  const robotsRaw = entries.robots ?? ''
  const hasNoindexMeta = /index:\s*false/.test(robotsRaw)
  if (NOINDEX_ROUTES.has(route) && !hasNoindexMeta) {
    fail(`S8 · ${file}: route ${route} is in the noindex class but metadata.robots does not set index: false`)
  }
  if (INDEX_ROUTES.has(route) && hasNoindexMeta) {
    fail(`S8 · ${file}: route ${route} is a marketing (index) route but metadata.robots sets index: false`)
  }

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
// BASE may be a literal or (post-D2) an identifier re-exported from lib/site.ts
const smBaseRaw = sitemapSrc.match(/const BASE = ([^\n]+)/)?.[1]?.trim()
const smBase = firstString(smBaseRaw ?? '') ?? (smBaseRaw ? resolveUrlConst(siteLibSrc, smBaseRaw) : null)
if (!smBase) fail('sitemap.ts: BASE const not found / not resolvable via lib/site.ts')
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
// bidirectional coverage: sitemap paths ('' = home) ↔ the INDEX route class.
// noindex routes (D5 demo + D6 legal) must NOT appear — a sitemap entry is an
// indexation request and would contradict their robots noindex.
const smRoutes = new Set(smPaths.map((p) => (p === '' ? '/' : p)))
for (const r of INDEX_ROUTES) if (!smRoutes.has(r)) fail(`sitemap.ts: index-class route ${r} missing from sitemap`)
for (const r of smRoutes) {
  if (NOINDEX_ROUTES.has(r)) fail(`S8 · sitemap.ts: lists ${r}, which is a NOINDEX-class route (D5/D6 — must stay out of the sitemap)`)
  else if (!INDEX_ROUTES.has(r)) fail(`sitemap.ts: lists ${r} but it is not an index-class route with a page.tsx`)
}
if (!failed) console.log(`✓ S4: sitemap — ${smPaths.length} URLs, one host, no /app/*, no duplicates, covers exactly the ${INDEX_ROUTES.size} index-class routes (noindex class excluded)`)

// ── S5. robots.ts ────────────────────────────────────────────────────────────
const robotsSrc = readFileSync(join(APP, 'robots.ts'), 'utf8')
// INVERTED contract (T-96 step ③, C12 fix): /app must NOT be disallowed.
// The noindex directives (X-Robots-Tag header + meta in the /app shells,
// asserted in S8 below) only work if crawlers can actually FETCH /app/* —
// a robots Disallow would hide the noindex and leave URL-only indexing open.
const disallowRaw = robotsSrc.match(/disallow:\s*(\[[^\]]*\]|'[^']*')/)?.[1] ?? ''
if (/['"]\/app/.test(disallowRaw)) {
  fail(`robots.ts: disallow includes /app again (got: ${disallowRaw}) — this would make the /app noindex directives unreadable; keep the crawl open`)
}
// robots.ts sitemap/host references may be literals or lib/site.ts identifiers
const robotsSitemapRaw = robotsSrc.match(/sitemap:\s*([^\n,]+)/)?.[1]?.trim()
const robotsSitemap = (() => {
  if (!robotsSitemapRaw) return null
  const lit = robotsSitemapRaw.match(/^(['"`])(https?:\/\/[^'"`]+)\1$/)?.[2]
  if (lit) return lit
  // template form: `${SITE_URL}/sitemap.xml`
  const tpl = robotsSitemapRaw.match(/^`\$\{(\w+)\}([^`]*)`$/)
  if (tpl) { const base = resolveUrlConst(robotsSrc, tpl[1]) ?? resolveUrlConst(siteLibSrc, tpl[1]); return base ? base + tpl[2] : null }
  return null
})()
if (!robotsSitemap) fail('robots.ts: no resolvable sitemap reference')
else {
  if (new URL(robotsSitemap).host !== BASE_HOST) fail(`robots.ts sitemap host ${new URL(robotsSitemap).host} != ${BASE_HOST}`)
  if (!robotsSitemap.endsWith('/sitemap.xml')) fail(`robots.ts sitemap "${robotsSitemap}" does not point at /sitemap.xml`)
}
if (!failed) console.log(`✓ S5: robots — crawl open for /app (noindex handled by header+meta), sitemap on ${BASE_HOST}`)

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

  let ldBlocks = 0, canonTags = 0, faqPages = 0, builtNoindex = 0
  const NOINDEX_META_RE = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex[^"]*"|<meta[^>]+content="[^"]*noindex[^"]*"[^>]+name="robots"/
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8')
    const rel = '/' + f.slice(OUT.length + 1).replace(/\\/g, '/').replace(/(index)?\.html$/, '').replace(/\/$/, '')
    const route = rel === '' || rel === '/' ? '/' : rel

    // S8c — route-class robots meta in the BUILT page (what crawlers receive)
    if (NOINDEX_ROUTES.has(route)) {
      if (NOINDEX_META_RE.test(html)) builtNoindex++
      else fail(`S8 · ${f}: noindex-class route ${route} built WITHOUT a robots noindex meta tag`)
    } else if (INDEX_ROUTES.has(route) && NOINDEX_META_RE.test(html)) {
      fail(`S8 · ${f}: marketing route ${route} built WITH a robots noindex meta tag`)
    }

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

  // S8d — 404 page must be noindex in the built export
  const notFoundPath = join(OUT, '404.html')
  if (!existsSync(notFoundPath)) fail('S8 · out/404.html missing from the static export')
  else if (!NOINDEX_META_RE.test(readFileSync(notFoundPath, 'utf8'))) {
    fail('S8 · out/404.html has no robots noindex meta tag (app/not-found.tsx metadata regressed)')
  }
  if (!failed) console.log(`✓ S6-S7: built HTML — ${htmlFiles.length} pages, ${canonTags} canonical tags on ${BASE_HOST}, ${ldBlocks} ld+json blocks parse with known @type, ${faqPages} FAQPage blocks checked for visibility, ${builtNoindex}/${NOINDEX_ROUTES.size} noindex-class routes carry noindex, 404 noindex`)
}

// ── S8e. /app/* private surface: X-Robots-Tag header config + meta in shells ─
{
  const NOINDEX_META_RE = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex[^"]*"|<meta[^>]+content="[^"]*noindex[^"]*"[^>]+name="robots"/
  // vercel.json must carry the server-visible directive for EVERY /app path
  let vercel
  try { vercel = JSON.parse(readFileSync(join(SITE, 'vercel.json'), 'utf8')) } catch (e) {
    vercel = null; fail(`S8 · website-next/vercel.json unreadable (${e.message})`)
  }
  if (vercel) {
    const appHeaderRule = (vercel.headers ?? []).find((h) =>
      typeof h.source === 'string' && /^\/app(\/|$|\/:|\/\()/ .test(h.source) &&
      (h.headers ?? []).some((kv) => kv.key?.toLowerCase() === 'x-robots-tag' && /noindex/.test(kv.value ?? '')))
    if (!appHeaderRule) fail('S8 · website-next/vercel.json: no headers rule setting X-Robots-Tag: noindex on /app/*')
    if (!(vercel.rewrites ?? []).some((r) => r.source === '/app/:path*')) {
      fail('S8 · website-next/vercel.json: the /app/:path* rewrite disappeared (must stay intact)')
    }
    if (!vercel.ignoreCommand) fail('S8 · website-next/vercel.json: ignoreCommand disappeared (must stay intact)')
  }
  // every committed /app shell must carry the meta noindex fallback
  const appDir = join(SITE, 'public', 'app')
  const shells = []
  ;(function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name === 'index.html') shells.push(p)
    }
  })(appDir)
  if (!shells.length) fail('S8 · website-next/public/app: no index.html shells found')
  let shellsOk = 0
  for (const s of shells) {
    if (NOINDEX_META_RE.test(readFileSync(s, 'utf8'))) shellsOk++
    else fail(`S8 · ${s}: /app shell without <meta name="robots" content="noindex, nofollow"> — re-inject after any embed rebuild`)
  }
  if (!failed) console.log(`✓ S8: route-class robots policy — ${INDEX_ROUTES.size} index + ${NOINDEX_ROUTES.size} noindex routes enforced, /app X-Robots-Tag configured, ${shellsOk}/${shells.length} app shells carry meta noindex`)
}

// ── verdict ──────────────────────────────────────────────────────────────────
if (failed) {
  console.error('\n✗ SEO CONTRACT: violations above — the current-state contract is broken.')
  process.exit(1)
}
console.log(`\n✓ SEO CONTRACT: all assertions hold${warns.length ? ` (${warns.length} allowlisted warning${warns.length > 1 ? 's' : ''} — known debt, see C5)` : ''}.`)
