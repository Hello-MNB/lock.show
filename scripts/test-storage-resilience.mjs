#!/usr/bin/env node
/**
 * STORAGE RESILIENCE — ONB-RESUME-STORAGE
 *
 * Web storage is not a null-returning cache. `sessionStorage.getItem(...)` and
 * its siblings THROW a SecurityError when the browser has site data disabled
 * (restricted webviews, some private modes, enterprise policy). An unguarded
 * touch inside a React render path therefore does not degrade — it takes the
 * screen out through the ErrorBoundary.
 *
 * That is exactly what the artist entry flow did: Onboarding.jsx read the saved
 * step from inside the `useState` initialiser, i.e. during first render, so a
 * browser that refuses storage could not onboard AT ALL. The convenience of
 * resuming must never be able to cost the flow itself.
 *
 * WHAT THIS GATE MEASURES. Every `localStorage` / `sessionStorage` member
 * access in the tracked `src/` tree (the APP; `website-next/` is covered
 * separately by test-client-store.mjs), classified GUARDED / OPEN by real AST
 * ancestry — not by regex, and not by named-file spot checks. The set of OPEN
 * sites is pinned to a BASELINE below, so:
 *   · a NEW unguarded access fails the build (the ratchet), and
 *   · fixing a baselined one ALSO fails until the baseline is tightened
 *     (a ratchet that can silently loosen is not a ratchet).
 *
 * KNOWN LIMITS, stated rather than implied: the scan is static and lexical. It
 * sees the bare token and the `window.` / `globalThis.` / `self.` spellings.
 * `globalThis.` used to be outside that list — until src/lib/safeStorage.js was
 * written in exactly that spelling and this scanner counted ZERO sites in the
 * module that now carries the fail-soft path. A documented limit is not the same
 * as an acceptable one once real code lands on the other side of it. An alias
 * (`const ls = localStorage`) or a computed host (`window['localStorage']`)
 * still would not be seen; neither appears in this tree today, and the gate's
 * green does not deny that they could.
 *
 * The baseline is DEBT, listed openly — not a claim that those sites are safe.
 * Each needs its own fallback-semantics decision (what does publicSessionId()
 * return when it cannot persist?), which is why they are not swept in here.
 *
 * FAIL CLOSED: a file that will not transform or parse is a FAILURE, never a
 * skip. A skip is not a pass.
 *
 * SELF-TESTS (the mechanism is proven before its verdict is trusted):
 *   S1  source-map self-test — every reported line must really carry the token
 *   S6  detector self-test  — `try` block guards; `catch`/`finally` do NOT
 *
 * Run: node scripts/test-storage-resilience.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'
import * as acorn from 'acorn'

// ── BASELINE: known-OPEN sites, per file, as a multiset of `object.property` ──
// Tracked as follow-up ONB-RESUME-STORAGE-DEBT. Line numbers are deliberately
// NOT part of the key — they churn on every unrelated edit; the file + call
// shape is what identifies the debt.
// Entries are `object.property@enclosingNamedScope`. The scope half is what
// stops debt relocating inside a listed file without the ratchet noticing.
const BASELINE = {
  'src/context/LangContext.jsx': ['localStorage.getItem@saved', 'localStorage.setItem@setLang'],
  'src/features/artist/ClaimReview.jsx': ['localStorage.getItem@ClaimRow', 'localStorage.removeItem@ClaimRow', 'localStorage.removeItem@setLink', 'localStorage.setItem@setLink'],
  'src/features/artist/RadarUniverse.jsx': ['localStorage.getItem@stored'],
  'src/features/auth/AuthProvider.jsx': ['localStorage.getItem@DemoAuthProvider', 'localStorage.removeItem@setDemoRole', 'localStorage.setItem@setDemoRole'],
  'src/features/auth/Signup.jsx': ['sessionStorage.setItem@Signup'],
  'src/features/auth/UserTypeSelect.jsx': ['sessionStorage.getItem@hint', 'sessionStorage.removeItem@UserTypeSelect'],
  'src/lib/db.js': ['localStorage.getItem@s', 'localStorage.setItem@publicSessionId'],
}
// Files whose storage touches must ALL be guarded (the increment's DOD).
const MUST_BE_CLEAN = ['src/features/artist/Onboarding.jsx']

const findings = []
let checks = 0
function check(label, cond, detail = '') {
  checks++
  if (cond) console.log(`  ✓ ${label}`)
  else findings.push(`${label}${detail ? ` — ${detail}` : ''}`)
}

// ── source-map VLQ decode (generated line/col → original line) ───────────────
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function decodeMappings(str) {
  const out = new Map()
  let srcLine = 0, genLine = 1, srcIdx = 0, srcCol = 0
  for (const group of str.split(';')) {
    let genCol = 0
    for (const seg of group ? group.split(',') : []) {
      if (!seg) continue
      const vals = []
      let shift = 0, value = 0
      for (const ch of seg) {
        const d = B64.indexOf(ch)
        if (d < 0) throw new Error(`bad VLQ char ${JSON.stringify(ch)}`)
        value += (d & 31) << shift
        if (d & 32) { shift += 5; continue }
        const neg = value & 1
        value >>= 1
        vals.push(neg ? -value : value)
        shift = 0; value = 0
      }
      genCol += vals[0]
      if (vals.length >= 4) {
        srcIdx += vals[1]; srcLine += vals[2]; srcCol += vals[3]
        if (!out.has(genLine)) out.set(genLine, [])
        out.get(genLine).push({ genCol, srcLine: srcLine + 1 })
      }
    }
    genLine++
  }
  return out
}
function mapLine(mappings, line, col) {
  const segs = mappings.get(line)
  if (!segs?.length) return null
  let best = null
  for (const s of segs) { if (s.genCol <= col) best = s; else break }
  return (best || segs[0]).srcLine
}

// ── the detector ────────────────────────────────────────────────────────────
// GUARDED means: a `TryStatement` ancestor reached through its `block` — the
// protected region — with NO function boundary in between.
//   · reaching a TryStatement through `handler` (catch) or `finalizer` is NOT
//     protection; a throw there still escapes;
//   · a function DEFINED inside a try but CALLED later (a callback, a timer, an
//     event handler) is not protected either — the try has already exited by
//     the time it runs. Crossing a function boundary therefore cancels the
//     guard. That closes the false-GUARD class; it is not a claim that no other
//     class exists — see KNOWN LIMITS above for what the scan cannot see.
const FN_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])
function collect(ast) {
  const found = []
  const walk = (node, stack) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) { for (const n of node) walk(n, stack); return }
    if (typeof node.type !== 'string') return
    if (node.type === 'MemberExpression') {
      const o = node.object
      // HOSTS: bare, `window.*`, `globalThis.*`, `self.*`.
      const HOSTS = new Set(['window', 'globalThis', 'self'])
      const name = o?.type === 'Identifier'
        ? o.name
        : (o?.type === 'MemberExpression' && o.object?.type === 'Identifier' && HOSTS.has(o.object.name) && o.property?.type === 'Identifier')
          ? o.property.name
          : null
      if (name === 'localStorage' || name === 'sessionStorage') {
        const prop = node.property?.type === 'Identifier' && !node.computed ? node.property.name : '[computed]'
        // ENCLOSING NAMED SCOPE (review finding F5). Keying only on
        // `file -> multiset of object.property` meant debt could MOVE inside a
        // baselined file — guard the listed site, add an unguarded one in
        // another function — and the multiset was unchanged, so neither NEW nor
        // STALE fired. The nearest NAMED scope is the discriminator: it changes
        // when the site moves to a different function, and it does NOT churn
        // when anonymous callbacks are reordered, because an anonymous function
        // inherits the nearest named ancestor rather than an index.
        let scope = 'module'
        for (let i = stack.length - 1; i >= 0; i--) {
          const { node: anc, key } = stack[i]
          if (anc.type === 'FunctionDeclaration' && anc.id?.name) { scope = anc.id.name; break }
          if (anc.type === 'VariableDeclarator' && key === 'init' && anc.id?.type === 'Identifier') { scope = anc.id.name; break }
          if ((anc.type === 'Property' || anc.type === 'MethodDefinition') && key === 'value' && anc.key?.name) { scope = anc.key.name; break }
        }
        let guarded = false
        for (let i = stack.length - 1; i >= 0; i--) {
          const { node: anc, key } = stack[i]
          if (FN_TYPES.has(anc.type)) break // try already exited by the time this runs
          // NOTE: `params` is included in that break on purpose — a default
          // like `f(x = localStorage.getItem('a'))` is evaluated when f is
          // CALLED, so an enclosing try around the declaration protects nothing.
          if (anc.type === 'TryStatement' && key === 'block') { guarded = true; break }
        }
        found.push({ object: name, expr: `${name}.${prop}`, scope, key: `${name}.${prop}@${scope}`, guarded, line: node.loc.start.line, column: node.loc.start.column })
      }
    }
    for (const k of Object.keys(node)) {
      if (k === 'loc' || k === 'start' || k === 'end' || k === 'range' || k === 'parent') continue
      const v = node[k]
      if (v && typeof v === 'object') walk(v, [...stack, { node, key: k }])
    }
  }
  walk(ast, [])
  return found
}

// ── S6 detector self-test (runs BEFORE any verdict is trusted) ──────────────
{
  const probe = `
    function a() { try { localStorage.getItem('x') } catch {} }        // GUARD
    function b() { try { noop() } catch { localStorage.getItem('x') } } // OPEN (catch)
    function c() { try { noop() } finally { sessionStorage.setItem('k','v') } } // OPEN (finally)
    function d() { window.localStorage.removeItem('x') }               // OPEN, window-qualified
    function e() { try { window.sessionStorage.clear() } catch {} }    // GUARD, window-qualified
    function h() { try { globalThis.sessionStorage.getItem('x') } catch {} } // GUARD, globalThis-qualified
    function i() { return self.localStorage.getItem('x') }             // OPEN, self-qualified
    function f() { try { on('x', () => localStorage.key(0)) } catch {} } // OPEN — callback runs after the try exits
    function g() { try { (() => localStorage.length)() } catch {} }    // OPEN too: conservative, an IIFE is not special-cased
  `
  const got = collect(acorn.parse(probe, { ecmaVersion: 'latest', sourceType: 'module', locations: true }))
    .map((s) => `${s.expr}:${s.guarded ? 'GUARD' : 'OPEN'}`)
  const want = [
    'localStorage.getItem:GUARD',
    'localStorage.getItem:OPEN',
    'sessionStorage.setItem:OPEN',
    'localStorage.removeItem:OPEN',
    'sessionStorage.clear:GUARD',
    'sessionStorage.getItem:GUARD',
    'localStorage.getItem:OPEN',
    'localStorage.key:OPEN',
    'localStorage.length:OPEN',
  ]
  check('S6 detector self-test (try guards; catch/finally do not; window.* seen)',
    JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}`)
  if (findings.length) { console.error(`\n✖ STORAGE RESILIENCE: detector is broken — ${findings[0]}`); process.exit(1) }
}

// ── scan the tracked app tree ───────────────────────────────────────────────
const files = execSync("git ls-files 'src/*' 'src/**/*'", { encoding: 'utf8' })
  .split('\n').filter((f) => /\.(js|jsx|ts|tsx|mts|cts)$/.test(f))
const LOADER = { '.js': 'jsx', '.jsx': 'jsx', '.ts': 'ts', '.tsx': 'tsx', '.mts': 'ts', '.cts': 'ts' }

const open = {}          // file -> [expr, …]
let total = 0, guardedCount = 0, mapFail = 0, hardFail = 0
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const srcLines = src.split('\n')
  let out
  try {
    out = await esbuild.transform(src, {
      loader: LOADER[f.slice(f.lastIndexOf('.'))],
      jsx: 'transform', jsxFactory: '__gateJsx', jsxFragment: '__gateFrag',
      sourcemap: 'external', sourcefile: f,
    })
  } catch (e) { findings.push(`TRANSFORM ${f} — ${e.message.split('\n')[0]}`); hardFail++; continue }
  let ast, mappings
  try {
    ast = acorn.parse(out.code, { ecmaVersion: 'latest', sourceType: 'module', locations: true })
    mappings = decodeMappings(JSON.parse(out.map).mappings)
  } catch (e) { findings.push(`PARSE ${f} — ${e.message.split('\n')[0]}`); hardFail++; continue }

  for (const s of collect(ast)) {
    total++
    if (s.guarded) guardedCount++
    const line = mapLine(mappings, s.line, s.column)
    // S1 — the reported location must really carry the token it claims.
    if (!line || !srcLines[line - 1]?.includes(s.object)) {
      mapFail++
      findings.push(`S1 source-map self-test — ${f}: ${s.expr} mapped to line ${line ?? 'null'}, which does not contain "${s.object}"`)
    }
    if (!s.guarded) (open[f] ||= []).push(s.key)
  }
}

check('S3 every tracked src file transformed and parsed (fail closed, never skipped)', hardFail === 0, `${hardFail} file(s) failed`)
check('S1 source-map self-test — every reported line carries its token', mapFail === 0, `${mapFail} bad mapping(s)`)
check('S2 non-vacuity — the walker found storage sites', total > 0, `total=${total}`)
check('S2 non-vacuity — both detector branches exercised on real files',
  guardedCount > 0 && (total - guardedCount) > 0, `guarded=${guardedCount} open=${total - guardedCount}`)
check('S2 non-vacuity — every baselined file was actually scanned',
  Object.keys(BASELINE).every((f) => files.includes(f)),
  `missing: ${Object.keys(BASELINE).filter((f) => !files.includes(f)).join(', ')}`)

// ── S4 the ratchet ──────────────────────────────────────────────────────────
const norm = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v].sort()]).sort(([a], [b]) => a.localeCompare(b)))
const got = norm(open), want = norm(BASELINE)
const gotKeys = Object.keys(got), wantKeys = Object.keys(want)
for (const f of gotKeys) {
  if (!want[f]) { findings.push(`S4 NEW unguarded web storage in ${f}: ${got[f].join(', ')} — wrap it (try/catch) or add it to BASELINE with a reason`); continue }
  if (JSON.stringify(got[f]) !== JSON.stringify(want[f])) {
    findings.push(`S4 ${f} unguarded set changed — baseline ${JSON.stringify(want[f])}, found ${JSON.stringify(got[f])}`)
  }
}
for (const f of wantKeys) {
  if (!got[f]) findings.push(`S4 STALE baseline — ${f} no longer has unguarded storage; remove it from BASELINE so the ratchet stays tight`)
}
check('S4 ratchet — unguarded set matches BASELINE exactly (no new debt, no stale entry)',
  !findings.some((x) => x.startsWith('S4 ')))

// ── S5 the increment's DOD ──────────────────────────────────────────────────
for (const f of MUST_BE_CLEAN) {
  const sitesHere = files.includes(f)
  check(`S5 ${f} is scanned`, sitesHere)
  check(`S5 ${f} has ZERO unguarded web-storage access`, !open[f], open[f] ? open[f].join(', ') : '')
}

// ── E · EXECUTED: the fail-soft path, run rather than inspected ─────────────
// Everything above is SHAPE. Independent review (QA-INDEP-01, F4) showed why
// that is not enough: a `catch` that RETHROWS satisfies every ancestry rule in
// this file, so the exact defect ONB-RESUME-STORAGE exists to prevent could be
// reintroduced with S5 green. The helpers now live in an importable module, so
// the path can be executed against a store that refuses.
//
// TWO REAL FAILURE MODES, both exercised: the PROPERTY ACCESS throwing (what a
// site-data-disabled browser actually does) and the METHOD throwing (quota,
// or a partially crippled store). A helper that resolved the store outside its
// try would pass the second and fail the first.
{
  const SAFE = await import(pathToFileURL(new URL('../src/lib/safeStorage.js', import.meta.url).pathname).href)
  const install = (impl) => { Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get: impl }) }
  const uninstall = () => { delete globalThis.sessionStorage }
  const ran = (fn) => { try { return { ok: true, value: fn() } } catch (e) { return { ok: false, error: String(e).split('\n')[0] } } }

  // E1 — property access throws
  install(() => { throw new Error('SecurityError: site data is disabled') })
  const g1 = ran(() => SAFE.safeSessionGet('k'))
  const s1 = ran(() => SAFE.safeSessionSet('k', 'v'))
  const r1 = ran(() => SAFE.safeSessionRemove('k'))
  check('E1 EXECUTED — the property access throwing does not propagate, and the documented fallbacks are returned',
    g1.ok && g1.value === null && s1.ok && s1.value === false && r1.ok && r1.value === false,
    `get=${JSON.stringify(g1)} set=${JSON.stringify(s1)} remove=${JSON.stringify(r1)}`)

  // E2 — the store resolves but every method throws
  install(() => ({
    getItem() { throw new Error('QuotaExceededError') },
    setItem() { throw new Error('QuotaExceededError') },
    removeItem() { throw new Error('QuotaExceededError') },
  }))
  const g2 = ran(() => SAFE.safeSessionGet('k'))
  const s2 = ran(() => SAFE.safeSessionSet('k', 'v'))
  const r2 = ran(() => SAFE.safeSessionRemove('k'))
  check('E2 EXECUTED — a throwing METHOD does not propagate either',
    g2.ok && g2.value === null && s2.ok && s2.value === false && r2.ok && r2.value === false,
    `get=${JSON.stringify(g2)} set=${JSON.stringify(s2)} remove=${JSON.stringify(r2)}`)

  // E3 — POSITIVE CONTROL. Without this, a helper hard-coded to return
  // null/false would pass E1 and E2 while storing nothing at all.
  const mem = new Map()
  install(() => ({
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)) },
    removeItem: (k) => { mem.delete(k) },
  }))
  const wrote = SAFE.safeSessionSet('gigproof_probe', '3')
  const readBack = SAFE.safeSessionGet('gigproof_probe')
  const removed = SAFE.safeSessionRemove('gigproof_probe')
  const afterRemove = SAFE.safeSessionGet('gigproof_probe')
  check('E3 positive control — with a WORKING store the helpers really read, write and remove',
    wrote === true && readBack === '3' && removed === true && afterRemove === null,
    `wrote=${wrote} readBack=${JSON.stringify(readBack)} removed=${removed} afterRemove=${JSON.stringify(afterRemove)}`)

  // E4 — the consumer's contract: Number(null) is 0, so a lost step resumes at 1.
  check('E4 a lost step pointer degrades to step 1, not to NaN or 0',
    (() => { const raw = Number(SAFE.safeSessionGet('nope')); return !(raw >= 1 && raw <= 3) })(),
    'Number(safeSessionGet(missing)) must fall outside 1..STEPS so readSavedStep returns 1')

  uninstall()
}

console.log(`\n  scanned ${files.length} tracked src files · ${total} storage sites · ${guardedCount} guarded · ${total - guardedCount} open (baselined)`)
if (findings.length) {
  console.error(`\n✖ STORAGE RESILIENCE — ${findings.length} finding(s) of ${checks} checks:`)
  for (const x of findings) console.error(`   · ${x}`)
  process.exit(1)
}
console.log(`✓ STORAGE RESILIENCE — ${checks} checks hold`)
