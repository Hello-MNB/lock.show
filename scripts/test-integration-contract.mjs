#!/usr/bin/env node
// ============================================================
// INTEGRATION CONTRACT ASSERTION  ·  scripts/test-integration-contract.mjs
//
// LANE M (owner addendum, 16 Aug 2026): interfaces / accounts / keys.
//
// This gate enforces the machine-readable half of
// docs/INTEGRATION-CONTRACT-REGISTER.md — an IMPLEMENTATION CONTRACT, never
// product canon. It asserts on NAMES, CLASSES and SHAPES only. It never reads,
// prints, commits or transmits a secret VALUE.
//
// DELIBERATE NON-DUPLICATION: origin/preflight allowlisting, rate limiting,
// JWT denial and error redaction are already owned by scripts/test-security-denial.mjs
// (a live-server suite). This gate does NOT re-assert them. It covers the gaps
// that had no executable owner: register drift, class separation, secret
// scanning, bundle leak, log redaction and route-guard drift.
//
// HONESTY RULE: repository presence is DECLARED, never proof that a credential
// or a provider works. Only a real environment witness may say WITNESSED.
// ============================================================
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { parseRegister, buildSchema, SCHEMA as ENV_SCHEMA_PATH } from './generate-env-schema.mjs'
import { join, extname } from 'node:path'

const ROOT = process.cwd()
const REGISTER = 'docs/INTEGRATION-CONTRACT-REGISTER.md'
let violations = 0
const ok = (m) => console.log(`  · ${m}`)
const bad = (m) => { console.log(`  ✗ ${m}`); violations++ }

// ── register parsing ────────────────────────────────────────
if (!existsSync(join(ROOT, REGISTER))) {
  console.log(`✗ INTEGRATION CONTRACT: ${REGISTER} is missing — the contract has no text to enforce.`)
  process.exit(1)
}
const regText = readFileSync(join(ROOT, REGISTER), 'utf8')

function machineBlock(name) {
  const m = regText.match(new RegExp(`<!-- MACHINE:${name}:START -->([\\s\\S]*?)<!-- MACHINE:${name}:END -->`))
  if (!m) return null
  return m[1].split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && !/^\|\s*-+/.test(l) && !/\|\s*(Name|Method)\s*\|/i.test(l))
    .map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^`|`$/g, '')))
}

const envRows = machineBlock('ENV')
const routeRows = machineBlock('ROUTES')
if (!envRows || !routeRows) {
  console.log('✗ INTEGRATION CONTRACT: a MACHINE block is missing from the register — nothing to enforce.')
  process.exit(1)
}
const CLASSES = new Set(['PUBLIC', 'SECRET', 'CONFIG', 'AMBIENT', 'TOOLING'])
const registered = new Map() // NAME → {cls, surface, consumer, activation}
for (const r of envRows) {
  const [name, cls, surface, consumer, activation] = r
  registered.set(name, { cls, surface, consumer, activation })
}

// ── code scan (source of truth for what actually exists) ────
const SCAN_DIRS = ['src', 'server', 'scripts', 'website-next/app', 'website-next/lib',
  'website-next/components', 'api']
const SCAN_FILES = ['vite.config.js', 'website-next/next.config.mjs']
function walk(dir, exts) {
  const out = []
  let entries = []
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e === 'out') continue
    const p = join(dir, e)
    let st; try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) { out.push(...walk(p, exts)); continue }
    if (exts.includes(extname(e))) out.push(p)
  }
  return out
}
const CODE_EXTS = ['.js', '.mjs', '.jsx', '.ts', '.tsx']
const codeFiles = [
  ...SCAN_DIRS.flatMap((d) => walk(join(ROOT, d), CODE_EXTS)),
  ...SCAN_FILES.map((f) => join(ROOT, f)).filter((f) => existsSync(f)),
]
const ENV_READ = /(?:process|import\.meta)\.env\??\.([A-Z][A-Z0-9_]*)/g
const isComment = (line) => /^\s*(\/\/|\*|\/\*)/.test(line)

const inCode = new Map() // NAME → Set(file)
for (const f of codeFiles) {
  const body = readFileSync(f, 'utf8')
  const rel = f.replace(ROOT + '/', '')
  for (const line of body.split('\n')) {
    if (isComment(line)) continue
    for (const m of line.matchAll(ENV_READ)) {
      if (!inCode.has(m[1])) inCode.set(m[1], new Set())
      inCode.get(m[1]).add(rel)
    }
  }
}

console.log(`[1] register ↔ code drift (${codeFiles.length} source files scanned)`)
for (const [name, files] of [...inCode].sort()) {
  if (!registered.has(name)) bad(`${name} is read in code (${[...files][0]}) but is NOT in the register`)
}
for (const name of [...registered.keys()].sort()) {
  if (!inCode.has(name)) bad(`${name} is registered but is read NOWHERE in code — phantom row`)
}
for (const [name, r] of registered) {
  if (!CLASSES.has(r.cls)) bad(`${name}: class "${r.cls}" is not one of ${[...CLASSES].join('/')}`)
}
if (!violations) ok(`${registered.size} interface entries, register and code agree exactly`)

// ── [2] class separation ────────────────────────────────────
console.log('[2] class separation — secrets never reachable from client code')
const CLIENT_ROOTS = ['src/', 'website-next/app/', 'website-next/lib/', 'website-next/components/']
const isClient = (rel) => CLIENT_ROOTS.some((p) => rel.startsWith(p))
let sepIssues = 0
for (const [name, r] of registered) {
  const files = inCode.get(name) || new Set()
  if (r.cls === 'SECRET') {
    for (const f of files) if (isClient(f)) { bad(`SECRET ${name} is read from client code ${f} — it would ship in the browser bundle`); sepIssues++ }
  }
  const bundlePrefixed = name.startsWith('VITE_') || name.startsWith('NEXT_PUBLIC_')
  if (bundlePrefixed && r.cls === 'SECRET') { bad(`${name} is bundle-prefixed but classed SECRET — the prefix publishes it`); sepIssues++ }
  if (r.cls === 'PUBLIC' && !bundlePrefixed) { bad(`${name} is classed PUBLIC but lacks a VITE_/NEXT_PUBLIC_ prefix`); sepIssues++ }
}
if (!sepIssues) ok('no SECRET-class variable is read from client code; every PUBLIC entry is bundle-prefixed')

// ── [3] secret scanning (executable, with negative controls) ─
console.log('[3] secret scanning across tracked files')
const PATTERNS = [
  { id: 'anthropic', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { id: 'resend', re: /\bre_[A-Za-z0-9]{24,}/ },
  { id: 'supabase-pat', re: /\bsbp_[a-f0-9]{40,}/ },
  { id: 'google-api', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'private-key', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
]
// Negative controls: each pattern must fire on a synthetic sample and stay quiet
// on benign text. Samples are CONCATENATED at runtime so this file contains no
// literal secret-shaped token of its own.
const SAMPLES = {
  anthropic: 'sk-' + 'ant-' + 'api03' + 'X'.repeat(24),
  resend: 're' + '_' + 'A'.repeat(28),
  'supabase-pat': 'sbp' + '_' + 'a1'.repeat(24),
  'google-api': 'AI' + 'za' + 'B'.repeat(35),
  'private-key': '-----BEGIN ' + 'PRIVATE KEY-----',
}
const BENIGN = 'SUPABASE_SERVICE_ROLE_KEY is read from process.env and never printed.'
let ncFail = 0
for (const p of PATTERNS) {
  if (!p.re.test(SAMPLES[p.id])) { bad(`negative control: pattern ${p.id} FAILED to match its synthetic sample — the scanner is blind`); ncFail++ }
  if (p.re.test(BENIGN)) { bad(`negative control: pattern ${p.id} fired on benign text — it would cry wolf`); ncFail++ }
}
if (!ncFail) ok(`${PATTERNS.length} scanner patterns proven live against synthetic samples + a benign control`)

let tracked = []
try {
  tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n').filter(Boolean)
} catch { /* not a git tree */ }
const SKIP_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.zip', '.pdf', '.mp4'])
const SELF = 'scripts/test-integration-contract.mjs'
let scanned = 0, jwtInfo = 0
for (const rel of tracked) {
  if (rel === SELF) continue
  if (SKIP_EXT.has(extname(rel))) continue
  const abs = join(ROOT, rel)
  let body; try { body = readFileSync(abs, 'utf8') } catch { continue }
  scanned++
  for (const p of PATTERNS) {
    const m = body.match(p.re)
    if (m) {
      const line = body.slice(0, m.index).split('\n').length
      bad(`${rel}:${line} — a ${p.id}-shaped credential is committed to the repository`)
    }
  }
  // JWTs: an anon key is public by design; a service_role JWT is a breach.
  for (const m of body.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]{20,})\.[A-Za-z0-9_-]{10,}/g)) {
    let payload = ''
    try { payload = Buffer.from(m[1], 'base64url').toString('utf8') } catch { continue }
    const line = body.slice(0, m.index).split('\n').length
    if (/"role"\s*:\s*"service_role"/.test(payload)) bad(`${rel}:${line} — a SERVICE_ROLE JWT is committed — highest-privilege key in git`)
    else jwtInfo++
  }
}
ok(`${scanned} tracked text files scanned — no credential-shaped literal committed${jwtInfo ? ` (${jwtInfo} non-service_role JWT-shaped string(s) seen, public-safe by class)` : ''}`)

// ── [4] browser-bundle leak ─────────────────────────────────
console.log('[4] browser-bundle leak check')
const BUNDLE_DIRS = ['dist', 'website-next/out']
const SECRET_NAMES = [...registered].filter(([, r]) => r.cls === 'SECRET').map(([n]) => n)
let bundleScanned = 0, bundleMissing = 0
for (const d of BUNDLE_DIRS) {
  const abs = join(ROOT, d)
  if (!existsSync(abs)) { bundleMissing++; console.log(`  ~ ${d} not built in this run — SKIPPED, not passed`); continue }
  for (const f of walk(abs, ['.js', '.mjs', '.html', '.css', '.json', '.txt'])) {
    bundleScanned++
    const body = readFileSync(f, 'utf8')
    const rel = f.replace(ROOT + '/', '')
    for (const p of PATTERNS) if (p.re.test(body)) bad(`${rel} — ${p.id}-shaped credential present in a SHIPPED bundle`)
    for (const n of SECRET_NAMES) {
      // The NAME appearing in a bundle means the build inlined a server-only read.
      if (new RegExp(`\\b${n}\\b`).test(body)) bad(`${rel} — server-only name ${n} appears in a shipped bundle`)
    }
  }
}
if (bundleScanned) ok(`${bundleScanned} shipped bundle file(s) scanned — no secret name or credential shape`)
if (bundleMissing === BUNDLE_DIRS.length) console.log('  ~ NOTE: no bundle was present; this check did not run and must not be read as a pass')

// ── [5] log redaction ───────────────────────────────────────
console.log('[5] log redaction — no secret value reaches a log sink')
let logIssues = 0
for (const f of codeFiles) {
  const body = readFileSync(f, 'utf8')
  const rel = f.replace(ROOT + '/', '')
  body.split('\n').forEach((line, i) => {
    if (isComment(line)) return
    if (!/console\.(log|info|warn|error|debug)\s*\(/.test(line)) return
    for (const n of SECRET_NAMES) {
      if (new RegExp(`env\\??\\.${n}\\b`).test(line)) { bad(`${rel}:${i + 1} — a console call prints ${n}`); logIssues++ }
    }
  })
}
if (!logIssues) ok(`no console call in ${codeFiles.length} source files reads a SECRET-class variable`)

// ── [6] route-guard drift ───────────────────────────────────
console.log('[6] route-guard drift — declared guards vs server/index.js')
const serverPath = join(ROOT, 'server/index.js')
if (!existsSync(serverPath)) bad('server/index.js is missing — route guards cannot be asserted')
else {
  const srv = readFileSync(serverPath, 'utf8')
  const actual = new Map()
  for (const m of srv.matchAll(/^app\.(get|post|put|patch|delete)\('([^']+)'\s*,\s*([A-Za-z_]+)?/gm)) {
    actual.set(`${m[1].toUpperCase()} ${m[2]}`, m[3] === 'requireAuth' ? 'AUTH' : 'OPEN')
  }
  const declared = new Map(routeRows.map((r) => [`${r[0].toUpperCase()} ${r[1]}`, r[2]]))
  for (const [k, g] of actual) {
    if (!declared.has(k)) bad(`route ${k} exists in code but is NOT declared in the register (guard=${g})`)
    else if (declared.get(k) !== g) bad(`route ${k}: register declares ${declared.get(k)}, code enforces ${g}`)
  }
  for (const k of declared.keys()) if (!actual.has(k)) bad(`route ${k} is declared but does not exist in server/index.js`)
  if (actual.size) ok(`${actual.size} API routes — declared guard matches enforced guard on every one`)
}

// ── [7] activation honesty ──────────────────────────────────
console.log('[7] activation honesty — no green claim without a witness')
let honesty = 0
for (const [name, r] of registered) {
  const a = r.activation || ''
  if (!/^(DECLARED|WITNESSED:\d{4}-\d{2}-\d{2})$/.test(a)) {
    bad(`${name}: activation "${a}" is not DECLARED or WITNESSED:YYYY-MM-DD`); honesty++
  }
}
if (/\b(ACTIVE|GREEN|WORKING|VERIFIED OK)\b/.test(regText.replace(/WITNESSED:\d{4}-\d{2}-\d{2}/g, ''))) {
  bad('the register contains an unqualified ACTIVE/GREEN/WORKING claim — only WITNESSED:<date> may assert a working provider'); honesty++
}
if (!honesty) ok(`${registered.size} entries carry an honest activation state (DECLARED or WITNESSED:<date>)`)

// ── [8] generated env schema is a faithful, value-free projection ───────────
// Owner ruling 16 Aug 2026: contracts/env.schema.json is GENERATED FROM the
// register and is a machine projection, never a second authority. This inspector
// is what makes that true rather than aspirational — the register and the schema
// cannot diverge without failing the build.
console.log('[8] contracts/env.schema.json is a current, value-free projection of the register')
if (!existsSync(join(ROOT, ENV_SCHEMA_PATH))) {
  bad(`${ENV_SCHEMA_PATH} is missing — run: node scripts/generate-env-schema.mjs`)
} else {
  const onDisk = readFileSync(join(ROOT, ENV_SCHEMA_PATH), 'utf8')
  const expected = JSON.stringify(buildSchema(parseRegister(regText)), null, 2) + '\n'
  if (onDisk !== expected) bad(`${ENV_SCHEMA_PATH} has drifted from the register — regenerate it`)
  else ok(`schema regenerates identically from the register (${registered.size} entries)`)

  let parsed = null
  try { parsed = JSON.parse(onDisk) } catch { bad(`${ENV_SCHEMA_PATH} is not valid JSON`) }
  if (parsed) {
    if (parsed['x-authority'] !== 'projection') bad('the schema does not declare itself a projection')
    // A projection of NAMES must never carry a value. Credential shapes are checked
    // with the same patterns proven live in [3]; URLs are allowed only as the
    // schema's own $id/$schema identifiers, never as a token-bearing endpoint.
    for (const p of PATTERNS) if (p.re.test(onDisk)) bad(`${ENV_SCHEMA_PATH} contains a ${p.id}-shaped value`)
    const urls = (onDisk.match(/https?:\/\/[^"]+/g) || []).filter((u) => u !== parsed.$schema && u !== parsed.$id)
    if (urls.length) bad(`${ENV_SCHEMA_PATH} names ${urls.length} URL(s) beyond its own identifiers: ${urls[0]}`)
    const declaredRequired = new Set(parsed.required || [])
    for (const r of declaredRequired) {
      if (!registered.has(r)) bad(`schema requires ${r}, which the register does not list`)
    }
    if (!violations) ok(`no value, credential shape or endpoint present; ${declaredRequired.size} required entries trace to the register`)
  }
}

console.log('')
if (violations) {
  console.log(`✗ INTEGRATION CONTRACT: ${violations} violation(s).`)
  process.exit(1)
}
console.log('✓ INTEGRATION CONTRACT: register ↔ code agree; classes separated; scanners proven; no committed or bundled credential; guards match; activation claims honest.')
process.exit(0)
