#!/usr/bin/env node
/**
 * AUTH · SESSION · RECOVERY CONTRACT — T-118
 *
 * The controller's priority list puts auth/session/recovery FIRST and this
 * repo had ZERO coverage of it. This is the first gate for that band.
 *
 * WHAT THIS CAN AND CANNOT PROVE. GoTrue is not runnable here — `auth.uid()` is
 * a GUC in the SQL harness and there is no auth server — so these are STATIC
 * assertions over source, and they say so. They pin the SHAPE of the
 * password-change surface: how many ways exist to change a password, what
 * gates them, and what does not. A property that is pinned cannot drift
 * silently; it is not the same as a property that is proven at runtime.
 *
 * Whether GoTrue revokes other sessions on a password change is EVIDENCE OPEN
 * and is NOT asserted here — it needs a running auth server.
 */

import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

let failed = false
let checks = 0
const fail = (m) => { checks++; console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => { checks++; console.log(`  · ${m}`) }
const check = (cond, good, bad) => (cond ? ok(good) : fail(bad || `FAILED (no failure message supplied) — did NOT hold: ${good}`))

const files = execSync("git ls-files -- 'src'", { encoding: 'utf8' })
  .split('\n').filter((f) => /\.(js|jsx)$/.test(f))
const read = (f) => readFileSync(f, 'utf8')
// Comments are stripped before matching. A commented-out `auth.updateUser(` is
// not a password-change surface, and an early version of this gate counted one
// — which produced a battery of FALSE catches until the contamination was
// noticed. Strip line and block comments, then match.
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
const hits = (re) => files.flatMap((f) => [...strip(read(f)).matchAll(re)].map(() => f))

console.log('\nAUTH · SESSION · RECOVERY — static contract (GoTrue not runnable here)')

// ── vacuity guards ──────────────────────────────────────────────────────────
check(files.length >= 50,
  `A0 non-vacuity: ${files.length} source files enumerated from git`,
  `A0 ⚠ only ${files.length} files — every assertion below would be near-empty`)
const authFiles = files.filter((f) => f.startsWith('src/features/auth/'))
check(authFiles.length >= 8,
  `A0 non-vacuity: ${authFiles.length} files in src/features/auth`,
  `A0 ⚠ only ${authFiles.length} auth files found`)

// ── A1 · exactly ONE way to change a password ───────────────────────────────
const updateUsers = hits(/auth\.updateUser\(/g)
check(updateUsers.length === 1 && updateUsers[0] === 'src/features/auth/ResetPassword.jsx',
  `A1 exactly ONE auth.updateUser() call site exists — ${updateUsers[0]} — so the password-change surface is singular and known`,
  `A1 ⚠ the password-change surface changed: ${JSON.stringify(updateUsers)}. A second one must be reviewed on its own terms.`)

// ── A2 · that surface is a PUBLIC route ─────────────────────────────────────
const app = read('src/App.jsx')
const resetRoute = (app.match(/<Route path="\/reset-password"[^>]*\/>/) ?? [''])[0]
check(resetRoute.length > 0,
  `A2 non-vacuity: the /reset-password route is declared — ${resetRoute}`,
  'A2 ⚠ no /reset-password route found in src/App.jsx')
check(!/RequireRole|RequireAuth|RequireSession/.test(resetRoute),
  'A2 /reset-password is a PUBLIC route (deliberately — a recovery link must open without a prior session)',
  `A2 ⚠ /reset-password is now guarded: ${resetRoute} — a recovery link would no longer open`)

// ── A3 · readiness is granted on ANY session, not only recovery ─────────────
const reset = read('src/features/auth/ResetPassword.jsx')
check(/getSession\(\)[\s\S]{0,200}?setReady\(true\)/.test(reset),
  'A3 an EXISTING session alone makes the password form ready (ResetPassword.jsx getSession → setReady)',
  'A3 ⚠ the getSession→setReady path is gone — re-derive this contract; the PKCE race it fixes may have returned')
check(/PASSWORD_RECOVERY/.test(reset) && /SIGNED_IN/.test(reset),
  'A3 and so does a SIGNED_IN event, not only PASSWORD_RECOVERY — pinned so a narrowing is a deliberate, visible change',
  'A3 ⚠ the readiness predicate changed — re-derive it')

// ── A4 · nothing re-authenticates before the change ─────────────────────────
const reauthInReset = /signInWithPassword|currentPassword|reauth/i.test(strip(reset))
check(!reauthInReset,
  'A4 NO current-password re-authentication guards the change — CONSEQUENCE, stated plainly: anyone holding a live session can set a new password without presenting the old one, and ResetPassword.jsx tells them "you\'ll stay signed in". Pinned, not endorsed — OWNER-PENDING AUTH-REAUTH',
  'A4 a re-authentication step now exists in ResetPassword.jsx — good, and this gate is stale: update it and close AUTH-REAUTH')
const signIns = hits(/auth\.signInWithPassword\(/g)
check(signIns.length === 1 && signIns[0] === 'src/features/auth/AuthProvider.jsx',
  `A4 the only signInWithPassword() is the LOGIN path (${signIns[0]}) — it is not a guard in front of the password change`,
  `A4 ⚠ signInWithPassword call sites changed: ${JSON.stringify(signIns)}`)

// ── A5 · no second password-change surface hiding in settings ───────────────
const settings = read('src/features/auth/Settings.jsx')
check(!/updateUser/.test(strip(settings)),
  'A5 Settings.jsx contains NO password-change flow — /reset-password really is the only door',
  'A5 ⚠ Settings.jsx now changes passwords too — A1 above is no longer the whole surface')

// ── A6 · the PKCE exchange happens once, explicitly, before routing ─────────
const provider = read('src/features/auth/AuthProvider.jsx')
const exchanges = hits(/exchangeCodeForSession\(/g)
check(exchanges.length === 1 && exchanges[0] === 'src/features/auth/AuthProvider.jsx',
  `A6 exactly ONE exchangeCodeForSession() call site (${exchanges[0]}) — the recovery/OAuth code is consumed in one place`,
  `A6 ⚠ code-exchange call sites changed: ${JSON.stringify(exchanges)} — two consumers race for a single-use code`)
check(/history\.replaceState/.test(strip(provider)),
  'A6 the code is stripped from the address bar after exchange (no ?code left in history)',
  'A6 ⚠ the ?code is no longer stripped — a single-use recovery code would linger in browser history')

console.log(`
  EVIDENCE OPEN, not asserted: whether GoTrue revokes OTHER sessions on a
  password change, whether the recovery code is single-use in practice, and
  token lifetimes. All three need a running auth server; this container has
  none. They are named here so their absence is visible rather than implied.`)

console.log(failed
  ? `\n✗ AUTH · SESSION · RECOVERY: FAILED (${checks} checks)\n`
  : `\n✓ AUTH · SESSION · RECOVERY: ${checks} static checks hold — one password-change surface, public by design, ready on any session, with no re-authentication in front of it.\n`)
process.exit(failed ? 1 : 0)
