#!/usr/bin/env node
/**
 * NAVIGATION CONTRACT TEST — proves the skeleton's navigation end-to-end for
 * every entity, on every build, with no browser and no human tester.
 *
 * It exercises the pure navigation contract (src/lib/navigation.js) that App.jsx
 * and UserTypeSelect delegate to, across the two real journeys —
 *   1. NEW SIGNUP:  account created → /select → pick a type → first screen
 *   2. RETURNING:   logged in with a role → RoleHome → their home
 * — plus deep-link return, wrong-role bounce, and workspace-type routing.
 *
 * It also asserts every landing target is a registered <Route> in App.jsx, so a
 * contract path can never drift from the actual router.
 *
 * Run: npm run test:nav   (exits non-zero on any mismatch)
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ROLES } from '../src/lib/constants.js'
import {
  ROUTES,
  homePathFor,
  selectRoute,
  requireRoleRedirect,
  requireAgencyRedirect,
  requireProductionRedirect,
  postLoginPath,
} from '../src/lib/navigation.js'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const U = { id: 'u1' } // a logged-in user

let pass = 0
const failures = []
function check(label, got, want) {
  if (got === want) { pass++; return }
  failures.push(`${label}\n      expected: ${want}\n      got:      ${got}`)
}

// ── JOURNEY 1 — NEW SIGNUP (email or Google): after auth a brand-new user has
// NO role yet, so RoleHome/RequireRole send them to /select; they pick a type
// and land on that type's first screen. ──────────────────────────────────────
check('signup › role-less user → /select',
  homePathFor({ role: null, demo: false }), ROUTES.select)
check('signup › artist picks type → onboarding',
  selectRoute(ROLES.ARTIST), ROUTES.onboarding)
check('signup › booking-manager picks type → discover',
  selectRoute(ROLES.BOOKER), ROUTES.discover)
check('signup › agency picks type → agency',
  selectRoute(ROLES.AGENCY), ROUTES.agency)

// ── JOURNEY 2 — RETURNING CUSTOMER: logs in, RoleHome routes by effective role.
check('returning › artist → /artist/home',
  homePathFor({ role: ROLES.ARTIST }), ROUTES.artistHome)
check('returning › booking-manager → /discover',
  homePathFor({ role: ROLES.BOOKER }), ROUTES.discover)
check('returning › agency (roster) → /agency',
  homePathFor({ role: ROLES.AGENCY, isProducerWorkspace: false }), ROUTES.agency)
check('returning › agency (production workspace) → /production',
  homePathFor({ role: ROLES.AGENCY, isProducerWorkspace: true }), ROUTES.production)
check('returning › producer (confirmer) → /producer/received',
  homePathFor({ role: ROLES.PRODUCER }), ROUTES.producerReceived)
check('returning › operator → /admin',
  homePathFor({ role: ROLES.OPERATOR }), ROUTES.admin)

// ── DEMO fallback — a role-less DEMO visitor goes to the persona chooser (/login)
check('demo › role-less → /login (persona chooser)',
  homePathFor({ role: null, demo: true }), ROUTES.login)

// ── DEEP LINK / INVITE RETURN — post-login honors a stashed destination.
check('deep-link › returns to intended route',
  postLoginPath({ from: '/invite/abc' }), '/invite/abc')
check('plain login › no destination → RoleHome',
  postLoginPath({ from: undefined }), ROUTES.home)

// ── ROUTE GATES — each entity reaches ITS screens and is bounced (never looped)
//    off the others. redirect === null means ALLOW.
// Artist on an artist route:
check('gate › artist allowed on artist route',
  requireRoleRedirect({ need: ROLES.ARTIST, user: U, role: ROLES.ARTIST }), null)
// Booker trying an artist route → bounced to RoleHome (which re-homes them):
check('gate › booker on artist route → bounced to "/"',
  requireRoleRedirect({ need: ROLES.ARTIST, user: U, role: ROLES.BOOKER }), ROUTES.home)
// Logged-out on a protected route → login (caller adds state.from):
check('gate › logged-out → /login',
  requireRoleRedirect({ need: ROLES.ARTIST, user: null, role: null }), ROUTES.login)
// Logged-in but no role yet (mid-signup) → /select:
check('gate › role-less logged-in → /select',
  requireRoleRedirect({ need: ROLES.ARTIST, user: U, role: null }), ROUTES.select)
// Array of allowed roles:
check('gate › multi-role membership allows',
  requireRoleRedirect({ need: [ROLES.ARTIST, ROLES.AGENCY], user: U, role: ROLES.AGENCY }), null)

// Agency gate:
check('gate › agency role allowed on /agency',
  requireAgencyRedirect({ user: U, role: ROLES.AGENCY }), null)
check('gate › booker with agency PLAN allowed on /agency',
  requireAgencyRedirect({ user: U, role: ROLES.BOOKER, isAgency: true }), null)
check('gate › production workspace on /agency → /production',
  requireAgencyRedirect({ user: U, role: ROLES.AGENCY, isProducerWorkspace: true }), ROUTES.production)
check('gate › plain booker on /agency → bounced to "/"',
  requireAgencyRedirect({ user: U, role: ROLES.BOOKER }), ROUTES.home)

// Production gate:
check('gate › production workspace allowed on /production',
  requireProductionRedirect({ user: U, role: ROLES.AGENCY, isProducerWorkspace: true }), null)
check('gate › non-production agency on /production → /agency (not dead-end)',
  requireProductionRedirect({ user: U, role: ROLES.AGENCY, isProducerWorkspace: false }), ROUTES.agency)
check('gate › artist on /production → bounced to "/"',
  requireProductionRedirect({ user: U, role: ROLES.ARTIST }), ROUTES.home)

// ── ROUTER INTEGRITY — every landing target the contract can resolve to must be
//    a real <Route path> in App.jsx (params/RoleHome "/" excluded).
const appSrc = readFileSync(path.join(DIR, '..', 'src', 'App.jsx'), 'utf8')
const registered = new Set([...appSrc.matchAll(/path="([^"]+)"/g)].map((m) => m[1]))
const landingTargets = [
  ROUTES.login, ROUTES.select, ROUTES.onboarding, ROUTES.artistHome,
  ROUTES.discover, ROUTES.agency, ROUTES.production, ROUTES.producerReceived, ROUTES.admin,
]
for (const t of landingTargets) {
  check(`router › "${t}" is a registered <Route>`, registered.has(t), true)
}

// ── REPORT ───────────────────────────────────────────────────────────────────
const total = pass + failures.length
if (failures.length) {
  console.error(`\n✗ NAV CONTRACT: ${failures.length}/${total} FAILED\n`)
  for (const f of failures) console.error('  ✗ ' + f + '\n')
  process.exit(1)
}
console.log(`✓ NAV CONTRACT: all ${total} navigation journeys land correctly (signup + returning, every entity + gate).`)
