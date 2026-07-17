#!/usr/bin/env node
/**
 * SITE NAVIGATION CONFORMANCE TEST — SITE-NAVIGATION-SPEC laws 1-3, re-runnable.
 *
 * Serves website-next/out (static export) via an inline static server and
 * crawls the site from `/`, asserting:
 *   LAW 1  no page without navigation — every crawled page's HTML contains
 *          `<nav` AND the footer legal links (/terms /privacy /accessibility)
 *   LAW 2  no orphan pages — the reachable set covers the route list
 *          (enumerated from website-next/app/**\/page.tsx)
 *   LAW 3  no dead links — every internal href resolves 200
 *          (hrefs under /app/* count as app-rescue: embedded SPA territory)
 *
 * Builds NOTHING. Requires website-next/out to exist — if stale:
 *     cd website-next && npm run build
 *
 * Run:  node scripts/test-site-nav.mjs        (exit 1 + findings on violation)
 *
 * STATIC SERVER (fixed pattern — resolution-bug-safe, per LESSONS/S0):
 * the export uses trailingSlash:false, so a route like /artists exists as BOTH
 * out/artists.html and an out/artists/ DIRECTORY (child routes / .txt payloads).
 * A naive server maps /artists → the directory, finds no index.html, and 404s.
 * The fix: whenever a path resolves to a directory WITHOUT an index.html —
 * or to nothing at all — try `<path>.html` before giving up.
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(DIR, '..', 'website-next')
const OUT = path.join(SITE, 'out')
const APP_DIR = path.join(SITE, 'app')
const PORT = 4173

if (!existsSync(path.join(OUT, 'index.html'))) {
  console.error('✗ website-next/out is missing (no index.html).')
  console.error('  Build the static export first:  cd website-next && npm run build')
  process.exit(1)
}

// ── ROUTE LIST — every app/**/page.tsx dir is a route that must be reachable ──
function enumerateRoutes(dir, prefix = '') {
  const routes = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...enumerateRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`))
    } else if (entry.name === 'page.tsx') {
      routes.push(prefix === '' ? '/' : prefix)
    }
  }
  return routes
}
const ROUTES = enumerateRoutes(APP_DIR).sort()

// ── INLINE STATIC SERVER (no external deps) ──────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

/** Resolve a URL pathname to a file inside out/ — the resolution-bug-safe way. */
function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname.split('?')[0].split('#')[0])
  const rel = clean.replace(/\/+$/, '') || '/'
  const fsPath = path.join(OUT, rel)
  if (!fsPath.startsWith(OUT)) return null // traversal guard

  if (existsSync(fsPath)) {
    const st = statSync(fsPath)
    if (st.isFile()) return fsPath
    if (st.isDirectory()) {
      const index = path.join(fsPath, 'index.html')
      if (existsSync(index)) return index
      // Directory WITHOUT an index (e.g. out/artists/) — try <path>.html
      if (existsSync(`${fsPath}.html`)) return `${fsPath}.html`
      return null
    }
  }
  // Nothing at the exact path — try <path>.html (trailingSlash:false export)
  if (existsSync(`${fsPath}.html`)) return `${fsPath}.html`
  return null
}

const server = createServer((req, res) => {
  const file = resolveFile(req.url ?? '/')
  if (file) {
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
    return
  }
  const notFound = path.join(OUT, '404.html')
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
  res.end(existsSync(notFound) ? readFileSync(notFound) : 'Not found')
})

// ── CRAWL ────────────────────────────────────────────────────────────────────
const findings = []
const LEGAL_LINKS = ['/terms', '/privacy', '/accessibility']

function extractHrefs(html) {
  const hrefs = new Set()
  for (const m of html.matchAll(/href="([^"]+)"|href='([^']+)'/g)) {
    hrefs.add((m[1] ?? m[2]).replace(/&amp;/g, '&'))
  }
  return [...hrefs]
}

function normalize(href) {
  // internal path only, no query/hash, no trailing slash (except root)
  const p = href.split('#')[0].split('?')[0]
  if (p === '') return null
  return p.replace(/\/+$/, '') || '/'
}

async function main() {
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r))
  const base = `http://127.0.0.1:${PORT}`

  const toVisit = ['/']
  const visitedPages = new Set() // pages whose HTML we crawled
  const checkedLinks = new Map() // href → status/label
  let appRescues = 0

  while (toVisit.length) {
    const route = toVisit.shift()
    if (visitedPages.has(route)) continue
    visitedPages.add(route)

    const res = await fetch(base + route)
    if (res.status !== 200) {
      findings.push(`LAW 3 · page "${route}" returned ${res.status}`)
      continue
    }
    const html = await res.text()

    // LAW 1 — nav + footer legal links on every page
    if (!html.includes('<nav')) {
      findings.push(`LAW 1 · page "${route}" has no <nav`)
    }
    for (const legal of LEGAL_LINKS) {
      if (!html.includes(`href="${legal}"`)) {
        findings.push(`LAW 1 · page "${route}" footer is missing the legal link ${legal}`)
      }
    }

    // Collect internal hrefs
    for (const raw of extractHrefs(html)) {
      if (/^(https?:|mailto:|tel:|javascript:)/i.test(raw)) continue // external
      if (!raw.startsWith('/')) continue
      const href = normalize(raw)
      if (!href) continue

      if (href === '/app' || href.startsWith('/app/')) {
        // App-rescue territory (embedded SPA) — counts as resolved (law 3)
        if (!checkedLinks.has(href)) { checkedLinks.set(href, 'app-rescue'); appRescues++ }
        continue
      }

      // LAW 3 — every internal href must resolve 200
      if (!checkedLinks.has(href)) {
        const linkRes = await fetch(base + href)
        checkedLinks.set(href, linkRes.status)
        if (linkRes.status !== 200) {
          findings.push(`LAW 3 · dead link "${raw}" (found on "${route}") → ${linkRes.status}`)
        }
        // Recurse into internal HTML pages (skip static assets)
        const type = linkRes.headers.get('content-type') ?? ''
        if (linkRes.status === 200 && type.startsWith('text/html') && !href.startsWith('/_next')) {
          toVisit.push(href)
        }
      }
    }
  }

  // LAW 2 — reachable set covers the route list
  for (const route of ROUTES) {
    if (!visitedPages.has(route)) {
      findings.push(`LAW 2 · route "${route}" (app${route}/page.tsx) is NOT reachable from "/"`)
    }
  }

  server.close()

  // ── REPORT ─────────────────────────────────────────────────────────────────
  console.log(`Pages crawled (${visitedPages.size}):`)
  for (const p of [...visitedPages].sort()) console.log(`  ${p}`)
  console.log(`\nRoute list from app/**/page.tsx (${ROUTES.length}): ${ROUTES.join(' ')}`)
  console.log(`\nInternal links checked: ${checkedLinks.size} (${appRescues} app-rescue under /app/*)`)

  if (findings.length) {
    console.error(`\n✗ SITE NAV CONFORMANCE: ${findings.length} violation(s)\n`)
    for (const f of findings) console.error(`  ✗ ${f}`)
    process.exit(1)
  }
  console.log(
    `\n✓ SITE NAV CONFORMANCE: laws 1-3 hold — every crawled page has <nav> + footer legal links, ` +
    `all ${ROUTES.length} routes reachable from "/", all ${checkedLinks.size} internal links resolve.`,
  )
}

main().catch((err) => {
  server.close()
  console.error('✗ test-site-nav crashed:', err)
  process.exit(1)
})
