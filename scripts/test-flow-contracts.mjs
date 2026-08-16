#!/usr/bin/env node
// ============================================================
// FLOW CONTRACT GATE — scripts/test-flow-contracts.mjs   (LANE-A T-106)
//
// WHY THIS EXISTS, AND WHY IT IS NOT A DUPLICATE OF nav-contract.test.mjs
//   nav-contract.test.mjs proves the PURE contract in src/lib/navigation.js —
//   where each ROLE lands, and that those few landing targets are registered
//   <Route>s. It has no idea what the SCREENS actually link to. Every real
//   navigation in this app goes through `nav(…)` (useNavigate aliased to `nav`
//   in every file) or a `<Link to=…>` / `<NavLink to=…>` / `{ to: … }` tab
//   descriptor — none of which that test can see. So a screen could link to a
//   route that does not exist, or to one gated to a DIFFERENT role, and every
//   gate would stay green.
//
// WHAT IS ASSERTED HERE (all STATIC — no browser, no DB, no network):
//   F1  ROUTE TABLE — every <Route path> in src/App.jsx is parsed together with
//       the guard wrapping it (RequireRole=<role> · RequireAgency ·
//       RequireProduction · RequireAuth · public), so "who may stand here" is a
//       fact read off the router, never a guess.
//   F2  TARGET RESOLUTION — every literal route target anywhere in src/**
//       (nav('/…'), <Link to="/…">, <NavLink to>, `to: '/…'` tab objects,
//       <Navigate to>) resolves to a registered route, matching :params.
//   F3  ROLE REACHABILITY — a target linked from a screen must be reachable by
//       a role that can BE on that screen. A booker-only screen may not carry a
//       link into an artist-gated route: the guard would bounce them to "/" and
//       the control is dead. Declared cross-role exceptions must be listed in
//       CROSS_ROLE_ALLOW with the reason, so the exception is reviewed, not
//       accidental.
//   F4  REVERSE PATH — every authenticated screen that is NOT a nav destination
//       (not in getNavTabs for its own role) must declare its own way back:
//       a Link to a registered route, or a documented terminal/standalone entry.
//       This is the "no screen without an honest way back" law.
//   F5  NO ORPHANS — every registered route is reachable: a nav tab, a link
//       target, a navigation-contract landing, or an explicitly declared
//       deep-link-only route (DEEP_LINK_ONLY, each with its reason).
//   F6  ACT SCOPE — the multi-Act write path may not address the DEFAULT act's
//       id while a non-default Act is on screen (LANE-A T-106 defect class:
//       wrong-entity write after a context switch). Asserted structurally over
//       src/features/artist/RadarUniverse.jsx.
//
// Run: npm run test:flow   (wired into `npm run verify`)
// Exit 0 = every assertion holds; exit 1 = any failure.
// ============================================================
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ROLES } from '../src/lib/constants.js'
import { ROUTES, homePathFor, selectRoute } from '../src/lib/navigation.js'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(DIR, '..', 'src')
const rel = (p) => p.replace(/^.*[\\/]src[\\/]/, 'src/').replace(/\\/g, '/')

const failures = []
const notes = []
let pass = 0
function ok(label) { pass++; notes.push('  · ' + label) }
function check(label, cond, detail = '') {
  if (cond) { ok(label); return true }
  failures.push(`${label}${detail ? '\n      ' + detail : ''}`)
  return false
}

// ── source inventory ────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(jsx?|tsx?)$/.test(f)) out.push(p)
  }
  return out
}
const FILES = walk(SRC).map((p) => ({ p, rel: rel(p), src: readFileSync(p, 'utf8') }))
const APP = FILES.find((f) => f.rel === 'src/App.jsx')

// Strip comments so a route mentioned only in PROSE is never mistaken for code.
// Line-based on purpose: a naive global regex eats real code here, because this
// codebase is full of URL literals ("https://…") and regex literals (/\/\//) whose
// slashes a `//.*$` rule happily swallows. Only whole-line comments and whole
// block comments are removed; an end-of-line comment after real code is left
// alone (it can only ADD a false target, never hide a real one, and every
// route it could name is a registered route anyway).
function stripComments(src) {
  const out = []
  let inBlock = false
  for (const line of src.split(/\r?\n/)) {
    const t = line.trim()
    if (inBlock) { if (t.includes('*/')) inBlock = false; out.push(''); continue }
    if (t.startsWith('/*')) { if (!t.includes('*/')) inBlock = true; out.push(''); continue }
    if (t.startsWith('//') || t.startsWith('* ') || t === '*' || t.startsWith('{/*')) { out.push(''); continue }
    out.push(line)
  }
  return out.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// F1 · ROUTE TABLE + GUARDS
// Parsed straight out of the JSX so the table can never drift from the router.
// ─────────────────────────────────────────────────────────────────────────────
const appSrc = stripComments(APP.src)
const ROUTE_RE = /<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*\/>/g
const routes = new Map() // path → { guard, roles:Set|null, raw }
for (const m of appSrc.matchAll(ROUTE_RE)) {
  const [, p, element] = m
  let guard = 'public'
  let roles = null
  if (/<RequireRole\s+role=\{ROLES\.(\w+)\}/.test(element)) {
    guard = 'role'
    roles = new Set([ROLES[/<RequireRole\s+role=\{ROLES\.(\w+)\}/.exec(element)[1]]])
  } else if (/<RequireAgency>/.test(element)) {
    guard = 'agency'
    // An agency screen is reachable by an AGENCY-role workspace OR a booker org
    // on an agency PLAN (requireAgencyRedirect) — both normalise to AGENCY here.
    roles = new Set([ROLES.AGENCY])
  } else if (/<RequireProduction>/.test(element)) {
    guard = 'production'
    // requireProductionRedirect also admits the claim-confirmer (M-6 fold).
    roles = new Set([ROLES.AGENCY, ROLES.PRODUCER])
  } else if (/<RequireAuth>/.test(element)) {
    guard = 'auth'
  }
  routes.set(p, { guard, roles, element })
}
// Routes declared inside the AppShell layout <Route element={<AppShell/>}> that
// carry no guard of their own (RoleHome "/"), plus the layout catch-all.
check('F1 route table parsed from App.jsx', routes.size >= 25,
  `only ${routes.size} routes parsed — the <Route> shape in App.jsx changed`)
check('F1 every guard resolved to a known kind',
  [...routes.values()].every((r) => ['public', 'auth', 'role', 'agency', 'production'].includes(r.guard)))

const REGISTERED = [...routes.keys()]
function resolveRoute(target) {
  const clean = String(target).split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'
  for (const r of REGISTERED) {
    if (r === '*') continue
    const re = new RegExp('^' + r.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/') + '$')
    if (re.test(clean)) return r
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Which role(s) can BE on a given screen file? Derived from the route table by
// matching the screen's imported component name back to its <Route>.
// ─────────────────────────────────────────────────────────────────────────────
const IMPORT_RE = /^import\s+(\w+)\s+from\s+'(\.[^']+)'/gm
const componentOfRoute = new Map() // component name → route path
for (const [p, r] of routes) {
  const m = /<(\w+)\s*\/>/.exec(r.element.replace(/<(Require\w+|Navigate)[^>]*>/g, ''))
  if (m) componentOfRoute.set(m[1], p)
}
const fileOfComponent = new Map() // component name → src/... path
for (const m of APP.src.matchAll(IMPORT_RE)) {
  const [, name, spec] = m
  fileOfComponent.set(name, 'src/' + spec.replace(/^\.\//, '').replace(/\.jsx?$/, '') + '.jsx')
}
const routeOfFile = new Map() // src/... → route path
for (const [comp, route] of componentOfRoute) {
  const f = fileOfComponent.get(comp)
  if (f) routeOfFile.set(f, route)
}

// ─────────────────────────────────────────────────────────────────────────────
// F2 · every literal navigation target resolves to a registered route
// ─────────────────────────────────────────────────────────────────────────────
// nav('/x')  ·  to="/x"  ·  to={`/x/${id}`}  ·  to: '/x'  ·  <Navigate to="/x">
const TARGET_RES = [
  /\bnav\(\s*[`'"](\/[^`'"]*)[`'"]/g,
  /\bto=\{?[`'"](\/[^`'"]*)[`'"]/g,
  /\bto:\s*[`'"](\/[^`'"]*)[`'"]/g,
]
// A JSX expression target — `to={cond ? '/a' : '/b'}` (Settings' role-computed
// back link) — is invisible to the simple forms above, and a role-conditional
// destination is EXACTLY the shape F3 exists to police. Pull every path literal
// out of the expression body and treat each branch as a real target.
function expressionTargets(src) {
  const out = []
  for (const m of src.matchAll(/\bto=\{([^}]*)\}/g)) {
    const body = m[1]
    if (/^[`'"]/.test(body.trim())) continue // already covered above
    for (const lit of body.matchAll(/[`'"](\/[^`'"]*)[`'"]/g)) out.push(lit[1])
  }
  return out
}
// `${…}` interpolations stand in for a :param segment.
const normalize = (t) => t.replace(/\$\{[^}]*\}/g, ':p')

const targets = [] // { file, target, route }
for (const f of FILES) {
  if (/\/i18n\//.test(f.rel)) continue // i18n values are copy, not routes
  const src = stripComments(f.src)
  const raw = []
  for (const re of TARGET_RES) for (const m of src.matchAll(re)) raw.push(m[1])
  raw.push(...expressionTargets(src))
  for (const r of raw) {
    const t = normalize(r)
    if (t.startsWith('//')) continue // protocol-relative URL, not a route
    targets.push({ file: f.rel, target: r, norm: t })
  }
}
check('F2 navigation targets were actually found (the extractor still matches this codebase)',
  targets.length >= 40, `only ${targets.length} targets extracted`)

const unresolved = []
for (const t of targets) {
  t.route = resolveRoute(t.norm)
  if (!t.route) unresolved.push(`${t.file} → "${t.target}"`)
}
check('F2 every navigate/Link/NavLink/tab target resolves to a registered <Route>',
  unresolved.length === 0, unresolved.join('\n      '))

// ─────────────────────────────────────────────────────────────────────────────
// F3 · role reachability — a link may not point into a route gated to a role
//      that cannot be on the linking screen.
// ─────────────────────────────────────────────────────────────────────────────
// Declared, reviewed exceptions. Key: "<linking file> → <target route>".
const CROSS_ROLE_ALLOW = new Map([
  // Settings is universal (RequireAuth); the artist-only links inside it are
  // rendered under `role === ROLES.ARTIST` / `isArtist` conditions.
  ['src/features/auth/Settings.jsx → /artist/access', 'rendered only inside the ROLES.ARTIST branch'],
  ['src/features/auth/Settings.jsx → /artist/act/edit', 'rendered only inside the isArtist Section'],
  ['src/features/auth/Settings.jsx → /artist/home', 'role-computed back link (ternary on `role`)'],
  ['src/features/auth/Settings.jsx → /agency', 'role-computed back link (ternary on `role`)'],
  ['src/features/auth/Settings.jsx → /production', 'role-computed back link (ternary on `role`)'],
])

const roleViolations = []
for (const t of targets) {
  const from = routeOfFile.get(t.file)
  const to = routes.get(t.route)
  if (!from || !to || !to.roles) continue
  const fromRoute = routes.get(from)
  if (!fromRoute || !fromRoute.roles) continue // universal/public origin — F3 n/a
  const shared = [...fromRoute.roles].some((r) => to.roles.has(r))
  if (shared) continue
  const key = `${t.file} → ${t.route}`
  if (CROSS_ROLE_ALLOW.has(key)) continue
  roleViolations.push(`${key}   (screen roles: ${[...fromRoute.roles]} · target roles: ${[...to.roles]})`)
}
check('F3 no screen links into a route gated to a role that screen\'s own role cannot reach',
  roleViolations.length === 0, roleViolations.join('\n      '))

// Every declared exception must still correspond to a real link, or it is stale.
const staleAllow = [...CROSS_ROLE_ALLOW.keys()]
  .filter((k) => !targets.some((t) => `${t.file} → ${t.route}` === k))
check('F3 no stale entries in CROSS_ROLE_ALLOW (an exception outlives its link)',
  staleAllow.length === 0, staleAllow.join('\n      '))

// ─────────────────────────────────────────────────────────────────────────────
// F4 · reverse path — an authenticated screen that is not a nav tab for its own
//      role must carry its own link back to a registered route.
// ─────────────────────────────────────────────────────────────────────────────
// navItems.jsx cannot be imported here (node cannot load .jsx), and shelling out
// to a bundler for one lookup table would be heavier than the fact it yields —
// so the tab sets are read STRUCTURALLY out of getNavTabs: each `return [ … ]`
// arm, together with the ROLES.* named in the condition that guards it. That
// keeps ONE authority (navItems.jsx) and still gives a per-role tab set.
const navFile = FILES.find((f) => f.rel === 'src/components/layout/navItems.jsx')
const navBody = stripComments(navFile.src)
const navTabsByRole = new Map() // role value → Set(route)
const navTabTargets = new Set()
{
  const fnStart = navBody.indexOf('export function getNavTabs')
  const fnBody = navBody.slice(fnStart, navBody.indexOf('\n}', fnStart))
  const ARM = /(?:if\s*\(([^)]*(?:\([^)]*\))?[^)]*)\)\s*)?return\s*\[([\s\S]*?)\]/g
  for (const m of fnBody.matchAll(ARM)) {
    const cond = m[1] || ''
    const tos = [...m[2].matchAll(/to:\s*'([^']+)'/g)].map((x) => x[1])
    tos.forEach((t) => navTabTargets.add(t))
    const named = [...cond.matchAll(/ROLES\.(\w+)/g)].map((x) => ROLES[x[1]]).filter(Boolean)
    const roleKeys = named.length ? named : [null] // the trailing fallback arm
    for (const r of roleKeys) {
      if (!navTabsByRole.has(r)) navTabsByRole.set(r, new Set())
      tos.forEach((t) => navTabsByRole.get(r).add(t))
    }
  }
}
check('F4 nav tab set was read out of navItems.jsx', navTabTargets.size >= 8,
  `only ${navTabTargets.size} tab destinations parsed — getNavTabs' shape changed`)
check('F4 per-role tab sets cover every entity',
  [ROLES.ARTIST, ROLES.AGENCY, ROLES.BOOKER, ROLES.PRODUCER, ROLES.OPERATOR]
    .every((r) => (navTabsByRole.get(r) || new Set()).size > 0),
  'a role has no nav tabs at all — that role cannot navigate anywhere')

// Routes deliberately reached ONLY by a deep link / redirect, with the reason.
const DEEP_LINK_ONLY = new Map([
  ['/consent', 'legacy deep link — redirects to /onboarding (App.jsx)'],
  ['/producer', 'retired M-6 shell — plain redirect to /production/requests'],
  ['/producer/received', 'retired M-6 shell — plain redirect to /production/requests'],
  ['/artist/offer', 'payment screen, PAYMENTS_ENABLED-gated; redirects home while dormant'],
  ['/artist/claims', 'claim review is a radar panel; route kept for notification deep links'],
  ['/artist/readiness', 'content lives inside the radar readiness surface; route kept for deep links'],
  ['/reset-password', 'arrived at from an emailed recovery link only'],
  ['/invite/:token', 'arrived at from an emailed org invite only'],
  ['/confirm/:token', 'producer magic link — standalone ceremony, no app nav by design'],
  ['/passport/:id', 'public buyer entry point — arrives from a shared link'],
  ['/select', 'post-signup role pick — the funnel, not a destination'],
  ['/signup', 'public funnel entry'],
  ['/forgot-password', 'public auth side-path'],
  ['/login', 'public auth entry'],
  ['/', 'RoleHome — a redirector, never a screen'],
  ['*', 'warm 404'],
])

// Screens that carry NO back link of their own and lean on AppShell's persistent
// nav (SideNav/BottomNav) as their reverse path. Every authenticated route in
// this app renders inside that shell, so this is a real exit — but it must be a
// DECLARED choice per screen, not an oversight, because it is the one case where
// leaving mid-flow can cost typed work.
const SHELL_NAV_EXIT = new Map([
  ['/onboarding', 'first-run entry: the artist tab bar is the exit; step position is mirrored to sessionStorage so leaving and returning resumes rather than restarts (Onboarding.jsx readSavedStep)'],
])

const noReversePath = []
for (const [file, route] of routeOfFile) {
  const r = routes.get(route)
  if (!r || r.guard === 'public') continue
  // A tab for THIS screen's own role — the persistent nav IS its reverse path.
  // A tab that only exists for a DIFFERENT role does not count.
  const ownRoles = r.roles ? [...r.roles] : [...navTabsByRole.keys()]
  if (ownRoles.some((role) => (navTabsByRole.get(role) || new Set()).has(route))) continue
  const f = FILES.find((x) => x.rel === file)
  if (!f) continue
  const src = stripComments(f.src)
  const hasBackLink = [...src.matchAll(/\bto=\{?[`'"](\/[^`'"]*)[`'"]/g)]
    .some((m) => resolveRoute(normalize(m[1])))
  if (hasBackLink) continue
  if (DEEP_LINK_ONLY.has(route)) continue
  if (SHELL_NAV_EXIT.has(route)) continue
  noReversePath.push(`${file}  (route ${route})`)
}
check('F4 every authenticated non-tab screen declares its own reverse path',
  noReversePath.length === 0, noReversePath.join('\n      '))

// ─────────────────────────────────────────────────────────────────────────────
// F5 · no orphan routes
// ─────────────────────────────────────────────────────────────────────────────
const linked = new Set(targets.map((t) => t.route))
for (const r of Object.values(ROUTES)) linked.add(resolveRoute(r))
for (const role of [ROLES.ARTIST, ROLES.AGENCY, ROLES.BOOKER, ROLES.PRODUCER, ROLES.OPERATOR, null]) {
  linked.add(resolveRoute(homePathFor({ role })))
  linked.add(resolveRoute(homePathFor({ role, isProducerWorkspace: true })))
  linked.add(resolveRoute(selectRoute(role)))
}
for (const t of navTabTargets) linked.add(resolveRoute(t))

const orphans = REGISTERED.filter((r) => !linked.has(r) && !DEEP_LINK_ONLY.has(r))
check('F5 no registered route is orphaned (unlinked and undeclared)',
  orphans.length === 0, orphans.join('\n      '))

const staleShellExit = [...SHELL_NAV_EXIT.keys()].filter((r) => !routes.has(r))
check('F4 no stale entries in SHELL_NAV_EXIT', staleShellExit.length === 0, staleShellExit.join('\n      '))

const staleDeepLink = [...DEEP_LINK_ONLY.keys()].filter((r) => r !== '*' && !routes.has(r))
check('F5 no stale entries in DEEP_LINK_ONLY (a declared route that no longer exists)',
  staleDeepLink.length === 0, staleDeepLink.join('\n      '))

// ─────────────────────────────────────────────────────────────────────────────
// F6 · ACT SCOPE — the wrong-entity-write class this pass fixed.
// CANON (CLAUDE.md): evidence is per-Act and NON-transferable. RadarUniverse
// swaps the READ side on an Act switch; every WRITE must follow it.
// ─────────────────────────────────────────────────────────────────────────────
const radar = FILES.find((f) => f.rel === 'src/features/artist/RadarUniverse.jsx')
const radarSrc = stripComments(radar.src)
check('F6 RadarUniverse routes claim writes through the act-scoped adapter',
  !/\bonClaimsChange\(\s*\(prev\)/.test(radarSrc) && /actScopedClaimsChange\(/.test(radarSrc),
  'a raw onClaimsChange(prev => …) writes the DEFAULT act\'s claims while another Act is on screen')
check('F6 RadarUniverse never calls updateAct with the default artist id',
  !/updateAct\(\s*artist\.id\s*,/.test(radarSrc),
  'updateAct(artist.id, …) files the write under the DEFAULT act after an Act switch')
check('F6 RadarUniverse stamps evidence/profile inserts with the active act id',
  (radarSrc.match(/addProfileItem\(withActId\(/g) || []).length >= 2 &&
  /addEvidence\(withActId\(/.test(radarSrc),
  'migration 020\'s set_act_from_artist_id trigger defaults act_id := artist_id unless it is passed explicitly')
check('F6 the artists→act identity mapping has ONE authority (src/lib/actScope.js)',
  FILES.filter((f) => /ACT_IDENTITY_COLS\s*=/.test(stripComments(f.src))).length === 1,
  'ACT_IDENTITY_COLS is declared in more than one file — two authorities WILL drift')

// ─────────────────────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══ FLOW CONTRACT GATE ══')
console.log(`  routes registered: ${routes.size} · navigation targets checked: ${targets.length} · nav tab destinations: ${navTabTargets.size}`)
for (const n of notes) console.log(n)
if (failures.length) {
  console.error(`\n✗ FLOW CONTRACTS: ${failures.length}/${pass + failures.length} FAILED\n`)
  for (const f of failures) console.error('  ✗ ' + f + '\n')
  process.exit(1)
}
console.log(`\n✓ FLOW CONTRACTS: all ${pass} assertions hold — every target resolves, every screen is role-reachable and has a way back, no orphan routes, act-scoped writes intact.`)
