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

// .ts/.tsx included: the repo already tracks src/types.ts, src/tokens.ts and
// src/lib/ai/interface.ts, and an earlier version of this filter excluded them —
// independent QA planted a real ChangePassword.tsx with a live updateUser() and
// the gate reported "exactly ONE call site".
const files = execSync("git ls-files -- 'src'", { encoding: 'utf8' })
  .split('\n').filter((f) => /\.(js|jsx|ts|tsx|mts|cts)$/.test(f))
const read = (f) => readFileSync(f, 'utf8')
// Comments are stripped before matching. A commented-out `auth.updateUser(` is
// not a password-change surface, and an early version of this gate counted one
// — which produced a battery of FALSE catches until the contamination was
// noticed. Strip line and block comments, then match.
// COMMENTS AND TYPES ARE REMOVED BY A REAL TRANSFORM, not by hand. The previous
// implementation was hand-rolled and independent QA proved it DELETED LIVE CODE:
// it stripped block comments before line comments, so a `/*` written inside a
// `//` comment opened a phantom block that swallowed everything to the next
// `*/`. An entire second password-change surface and a new storage key hid
// behind two ordinary TODO comments while the gate stayed green. It had been
// introduced as the FIX for a contamination incident and created a worse bug
// than the one it closed.
//
// esbuild arrives with `vite ^5.4.8`, a DECLARED devDependency — not a phantom
// resolved through hoisting, which is the mistake this file already made once
// with @supabase/postgrest-js. `jsx: 'preserve'` keeps JSX intact so the route
// assertions still see <Route …>, while comments and TypeScript types go.
//
// FAILS CLOSED: if the transform is unavailable or any file fails to parse, the
// gate exits non-zero. A skip is not a pass, and silently falling back to raw
// text would restore the exact blind spot this replaces.
let esbuild = null
try { esbuild = (await import('esbuild')).default ?? (await import('esbuild')) } catch { /* handled */ }
if (!esbuild) {
  console.log('  ✗ B0 ⚠ esbuild (via vite) could not be imported — comments and types cannot be removed reliably, so every source assertion below would be UNSOUND. Not skipping: this fails.')
  process.exit(1)
}
const CODE = new Map()   // raw source -> transformed source, keyed by content
for (const f of files) {
  const raw = readFileSync(f, 'utf8')
  try {
    CODE.set(raw, (await esbuild.transform(raw, { loader: 'tsx', jsx: 'preserve' })).code)
  } catch (e) {
    console.log(`  ✗ B0 ⚠ ${f} failed to transform (${String(e).split('\n')[0]}) — refusing to scan it as raw text`)
    process.exit(1)
  }
}
// Callers pass file CONTENT. An unknown string means someone scanned something
// that was never transformed — fail rather than silently scanning raw text,
// which is the blind spot this whole block exists to remove.
const strip = (t) => {
  if (CODE.has(t)) return CODE.get(t)
  console.log('  ✗ B0 ⚠ strip() received text that was never transformed — refusing to scan raw source')
  process.exit(1)
}
const hits = (re) => files.flatMap((f) => [...strip(read(f)).matchAll(re)].map(() => f))

console.log('\nAUTH · SESSION · RECOVERY — static contract (GoTrue not runnable here)')
console.log('  · scope: TRACKED files only (git ls-files). An untracked working-tree file is invisible to every check below.')

// SELF-TEST of the transform, so it cannot silently become a no-op and quietly
// restore the blind spot it replaced. Uses the exact shape that defeated the
// hand-rolled stripper: a `/*` inside a `//` comment, with real code between.
{
  const trap = [
    '// TODO: strip a leading /* from the pasted snippet',
    'await supabase.auth.updateUser({ password })',
    "localStorage.setItem('gp_selftest_key', '1')",
    '// ...and the trailing */ too',
  ].join('\n')
  const t = (await esbuild.transform(trap, { loader: 'tsx', jsx: 'preserve' })).code
  check(/updateUser/.test(t) && /gp_selftest_key/.test(t),
    'T0 transform self-test: real code SURVIVES a `/*` written inside a `//` comment — the exact shape that made the previous hand-rolled stripper delete a live password-change surface',
    `T0 ⚠ the transform deleted real code — every source assertion below is unsound. Got: ${JSON.stringify(t)}`)
  check(!/TODO/.test(t),
    'T0 transform self-test: comments ARE removed, so a commented-out call site is not counted as live',
    `T0 ⚠ comments survive the transform — commented-out code would count as a real surface. Got: ${JSON.stringify(t)}`)
}

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
// Destructuring off supabase.auth defeats a dotted-call regex: independent QA
// used `const { updateUser } = supabase.auth` in a plain .jsx file and the gate
// reported one call site.
const destructured = hits(/\{[^}]*\bupdateUser\b[^}]*\}\s*=\s*supabase\.auth/g)
check(updateUsers.length === 1 && updateUsers[0] === 'src/features/auth/ResetPassword.jsx' && destructured.length === 0,
  `A1 exactly ONE client password-change surface — ${updateUsers[0]} — and no destructuring off supabase.auth. (scripts/seed.mjs uses admin.updateUserById under the SERVICE ROLE for dev seeding; that is out of the client surface by design.)`,
  `A1 ⚠ the password-change surface changed: calls=${JSON.stringify(updateUsers)} destructured=${JSON.stringify(destructured)}. A second one must be reviewed on its own terms.`)

// ── A2 · that surface is a PUBLIC route ─────────────────────────────────────
const app = read('src/App.jsx')
const resetRoute = (app.match(/<Route path="\/reset-password"[^>]*\/>/) ?? [''])[0]
check(resetRoute.length > 0,
  `A2 non-vacuity: the /reset-password route is declared — ${resetRoute}`,
  'A2 ⚠ no /reset-password route found in src/App.jsx')
// A parent LAYOUT route is the standard react-router v6 guard and never appears
// in the child's own tag — `[^>]*` stopped at the first `>`, so independent QA
// wrapped /reset-password in <Route element={<RequireAuth><Outlet/></RequireAuth>}>
// and A2 still called it public. If any such wrapper exists in App.jsx this now
// fails and asks for a human derivation rather than guessing the nesting.
const layoutGuards = [...app.matchAll(/<Route\s+element=\{<Require[A-Za-z]*/g)].length
check(!/RequireRole|RequireAuth|RequireSession/.test(resetRoute) && layoutGuards === 0,
  'A2 /reset-password is a PUBLIC route (deliberately — a recovery link must open without a prior session)',
  `A2 ⚠ /reset-password may be guarded — inline=${resetRoute}, parent layout guards in App.jsx=${layoutGuards}. A guarded recovery route breaks every recovery link; derive the nesting by hand.`)

// ── A3 · readiness is granted on ANY session, not only recovery ─────────────
const reset = read('src/features/auth/ResetPassword.jsx')
check(/getSession\(\)[\s\S]{0,200}?setReady\(true\)/.test(reset),
  'A3 an EXISTING session alone makes the password form ready (ResetPassword.jsx getSession → setReady)',
  'A3 ⚠ the getSession→setReady path is gone — re-derive this contract; the PKCE race it fixes may have returned')
check(/PASSWORD_RECOVERY/.test(reset) && /SIGNED_IN/.test(reset),
  'A3 and so does a SIGNED_IN event, not only PASSWORD_RECOVERY — pinned so a narrowing is a deliberate, visible change',
  'A3 ⚠ the readiness predicate changed — re-derive it')

// ── A4 · nothing re-authenticates before the change ─────────────────────────
// POSITIVE, over the WHOLE supabase.auth surface. The first version tested three
// tokens (signInWithPassword|currentPassword|reauth). Supabase has no
// "verify current password" primitive, so the realistic remedy for AUTH-REAUTH
// is an OTP/magic-link step — independent QA added exactly that and the gate went
// on asserting that NO re-authentication exists, which would have kept the
// AUTH-REAUTH row open after the defect was fixed.
const onSubmit = (strip(reset).match(/async function onSubmit[\s\S]*?\n  \}/) ?? [''])[0]
check(onSubmit.length > 100,
  `A4 non-vacuity: ResetPassword.onSubmit() located (${onSubmit.length} chars)`,
  'A4 ⚠ onSubmit() could not be located — the assertion below would be vacuous')
const authCallsInSubmit = [...new Set([...onSubmit.matchAll(/auth\.([A-Za-z0-9_]+)\s*\(/g)].map((m) => m[1]))]
const reauthInReset = !(authCallsInSubmit.length === 1 && authCallsInSubmit[0] === 'updateUser')
check(!reauthInReset,
  'A4 NO current-password re-authentication guards the change — CONSEQUENCE, stated plainly: anyone holding a live session can set a new password without presenting the old one, and ResetPassword.jsx tells them "you\'ll stay signed in". Pinned, not endorsed — OWNER-PENDING AUTH-REAUTH',
  `A4 a step other than updateUser now runs in onSubmit (${authCallsInSubmit.join(', ')}) — if that is re-authentication this is GOOD and the gate is stale: update it and close AUTH-REAUTH`)
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

// ── B · WHAT SURVIVES SIGN-OUT ──────────────────────────────────────────────
// signOut() (AuthProvider.jsx:156-158) awaits supabase.auth.signOut() and clears
// the profile state. It clears NO browser storage. Everything the app persists
// therefore outlives the session and greets whoever signs in next on that
// device. None of this is a breach — it is first-party, device-local state —
// but it is a decision nobody made, so it is measured and pinned here.
console.log('\n  B · what survives sign-out')
function signOutBodyForKeys() { return signOutBody }
const signOutBody = (provider.match(/const signOut = useCallback\([\s\S]*?\}, \[\]\)/) ?? [''])[0]
check(signOutBody.length > 20,
  'B0 non-vacuity: the signOut() implementation was located in AuthProvider.jsx',
  'B0 ⚠ signOut() could not be located — every assertion below would be vacuous')
// Indirection-aware. `clearDeviceState()` inside signOut() defeated a body-only
// regex — independent QA made sign-out actually clear gp_session AND
// gigproof_events through a helper and B1 still reported that it clears nothing.
const calledInSignOut = [...new Set([...signOutBody.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)].map((m) => m[1]))]
  .filter((id) => !['useCallback', 'async', 'if', 'await', 'signOut'].includes(id))
const helperTouchesStorage = calledInSignOut.some((id) => {
  const def = provider.match(new RegExp(`(?:function|const)\\s+${id}\\b[\\s\\S]{0,400}`))
  return def ? /localStorage|sessionStorage/.test(def[0]) : false
})
check(!/localStorage|sessionStorage/.test(signOutBody) && !helperTouchesStorage,
  `B1 signOut() clears the Supabase session and the profile and NONE of the APP's own storage keys — directly or through a helper (calls: ${calledInSignOut.join(', ') || 'none'}). NOTE: supabase-js clears its OWN auth-token key, so "no browser storage at all" would be false; this is about the app's keys.`,
  'B1 signOut() now touches browser storage — good, and this gate is stale: update it and close SIGNOUT-SCOPE')

// The exact surviving set, so a NEW persisted key becomes visible rather than
// silently joining the list.
// KEY EXPRESSIONS, not single-quoted literals. The first version matched only
// `'…'` and reported SEVEN keys; independent QA enumerated SEVENTEEN. The ten it
// missed are the repo's DOMINANT idiom — a named `const` or a template literal —
// and three of them are worse than the two the register named:
//   gigproof_pp_dirty_${artistId}      — an artist_id inside the KEY NAME
//   gp_confirm_${claim.id}             — value is the evidence URL the artist pasted
//   gigproof_onboarding_step_${userId} — a user id inside the KEY NAME
// So the scan now resolves same-file `const X = '…'` declarations and accepts
// double-quoted and template keys, and reports the KEY EXPRESSION when it cannot
// resolve one — visible rather than silently dropped.
const KEYS = [...new Set(files.flatMap((f) => {
  const txt = strip(read(f))
  const consts = new Map([...txt.matchAll(/const\s+([A-Za-z0-9_$]+)\s*=\s*['"`]([^'"`]+)['"`]/g)].map((m) => [m[1], m[2]]))
  return [...txt.matchAll(/(?:local|session)Storage\.(?:set|get|remove)Item\(\s*([^,)]+)/g)].map((m) => {
    const raw = m[1].trim()
    const lit = raw.match(/^['"`](.+?)['"`]$/)
    if (lit) return lit[1]
    if (consts.has(raw)) return consts.get(raw)
    const tpl = raw.match(/^`([^`]*)`$/)
    if (tpl) return tpl[1]
    return `${raw} (unresolved expression in ${f})`
  })
}))].sort()
// Resolved and unresolved are pinned SEPARATELY. Forcing one number would hide
// which half moved, and the unresolved half (helpers, cross-file constants) is
// exactly where a per-user key hides.
const RESOLVED = KEYS.filter((k) => !k.includes('(unresolved expression in'))
const UNRESOLVED = KEYS.filter((k) => k.includes('(unresolved expression in'))
check(RESOLVED.length === 14,
  `B2 ${RESOLVED.length} resolvable browser-storage keys, pinned: ${RESOLVED.join(' · ')}`,
  `B2 ⚠ the resolvable key set changed (${RESOLVED.length}, expected 14): ${RESOLVED.join(' · ')} — a new key that outlives sign-out must be reviewed on its own terms`)
check(UNRESOLVED.length === 5,
  `B2b ${UNRESOLVED.length} key expressions resolve through a helper or a cross-file constant and are NOT read literally — named so they are visible rather than dropped: ${UNRESOLVED.join(' · ')}. Three of these are per-user by construction (gigproof_pp_dirty_<artistId>, gigproof_onboarding_step_<userId>, and the pending-role key).`,
  `B2b ⚠ the unresolved key-expression set changed (${UNRESOLVED.length}, expected 5): ${UNRESOLVED.join(' · ')}`)

// The clause the old B2 MESSAGE asserted but never evaluated ("and none is
// cleared on sign-out") is now an actual check.
const CLEARS = files.flatMap((f) =>
  [...strip(read(f)).matchAll(/(?:local|session)Storage\.(?:removeItem|clear)\s*\(/g)].map(() => f))
check(!/removeItem|\.clear\(/.test(signOutBodyForKeys()),
  `B3a nothing in signOut() removes or clears a key — measured, not merely stated. (${CLEARS.length} removeItem/clear call site(s) exist elsewhere in the app.)`,
  'B3a ⚠ signOut() now clears storage — good, and this gate is stale: update it and close SIGNOUT-SCOPE')

// The two that carry user-identifying material.
check(/gp_session/.test(read('src/lib/db.js')) && /crypto\.randomUUID/.test(read('src/lib/db.js')),
  'B3 gp_session is a UUID minted ONCE into localStorage and never cleared — so two different signed-in people on one browser share one measurement identifier. The id itself carries no PII, as db.js:459 says; the LINKAGE between two people is the part that is not stated',
  'B3 ⚠ the gp_session mint path changed — re-derive this contract')
for (const k of ['gp_session', 'gigproof_events']) {
  const cleared = files.filter((f) => new RegExp(`(?:local|session)Storage\\.(?:removeItem)\\s*\\(\\s*['"\`]${k}`).test(strip(read(f))))
  check(cleared.length === 0,
    `B3b nothing anywhere removes ${k} — "never cleared" is now measured across all ${files.length} source files, not asserted in prose`,
    `B3b ⚠ ${k} IS cleared in ${cleared.join(', ')} — the register's "never cleared" claim is false`)
}
check(/props\?\.artist_id|props\.artist_id/.test(read('src/lib/db.js')),
  'B4 the gigproof_events ring buffer carries artist_id in event props (db.js hasShareEvent reads it) and is never cleared — the previous user\'s activity, including which artists they worked on, stays on the device',
  'B4 ⚠ the event-props shape changed — re-derive what survives sign-out')

// ── B5 · the stale-Act hazard is ALREADY closed; pin it so it stays closed ──
// LANE-A T-106: the stored Act id was once adopted UNVERIFIED, so a leftover
// value from another Person on the same browser made the editor address an Act
// the artist does not hold. Both consumers now validate ownership first. That
// is why the surviving `gigproof_active_act` above is harmless — and this is
// the assertion that keeps it that way.
// STRUCTURAL, not token-based. The first version matched one exact spelling
// (`.some((a) => a.id === stored)`), and independent QA broke it BOTH ways:
//   · FALSE POSITIVE — rewriting the identical check with `.find()` and a
//     different parameter name made the gate scream that T-106 was reachable.
//     A gate that fires on a correct refactor gets loosened.
//   · FALSE NEGATIVE — computing the membership check and then IGNORING it
//     (`const ok = rows.some(...); void ok; const initial = stored || a?.id`)
//     genuinely re-opened T-106 and the gate stayed green.
// So: find every site that ADOPTS `stored` as a value, and require each one to
// be GOVERNED by a condition that performs a membership test. Any membership
// spelling counts (.some/.find/.includes/.filter/.indexOf); a check whose result
// never governs the adoption does not.
const MEMBERSHIP = /\.(some|find|includes|filter|indexOf)\s*\(/
// A guard is often HOISTED into a variable — `const owns = rows.find(…)` — and
// the test then reads `(stored && owns)`. Resolving identifiers named IN THE
// TEST one level back accepts that refactor while still rejecting
// compute-then-ignore, where the computed identifier is never referenced by the
// thing that governs the adoption.
function guarded(expr, t) {
  if (MEMBERSHIP.test(expr)) return true
  for (const id of new Set([...expr.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g)].map((m) => m[1]))) {
    if (id === 'stored') continue
    const decl = t.match(new RegExp(`(?:const|let|var)\\s+${id}\\s*=([^\n]*(?:\n(?!\\s*(?:const|let|var|if|return)\\b)[^\n]*){0,3})`))
    if (decl && MEMBERSHIP.test(decl[1])) return true
  }
  return false
}
function unguardedAdoptions(t) {
  const bad = []
  // (1) ternary:  <test> ? stored : <fallback>
  for (const m of t.matchAll(/([^\n;]{0,240}?)\?\s*stored\s*:/g)) {
    if (!guarded(m[1], t)) bad.push(`ternary test lacks a membership check → ${m[1].trim().slice(-70)}`)
  }
  // (2) direct adoption:  pickAct(stored) / = stored / setActiveActId(stored)
  for (const m of t.matchAll(/(?:pickAct|setActiveActId|setAct)\(\s*stored\s*\)|=\s*stored\s*(?:\|\||;|$)/gm)) {
    // walk back to the nearest governing `if (` and take its condition
    const before = t.slice(0, m.index)
    const ifPos = before.lastIndexOf('if (')
    const cond = ifPos === -1 ? '' : before.slice(ifPos, before.indexOf('\n', ifPos) === -1 ? undefined : undefined)
    const condLine = ifPos === -1 ? '' : before.slice(ifPos).split('\n')[0]
    if (!guarded(condLine, t)) bad.push(`adoption not governed by a membership test → ${m[0].trim()} (nearest if: ${condLine.trim().slice(0, 70) || 'none'})`)
    void cond
  }
  return bad
}
for (const f of ['src/features/artist/RadarUniverse.jsx', 'src/features/artist/ActEditor.jsx']) {
  const t = strip(read(f))
  check(/gigproof_active_act/.test(t),
    `B5 non-vacuity: ${f} still reads the persisted Act key`,
    `B5 ⚠ ${f} no longer reads gigproof_active_act — re-derive this contract`)
  const bad = unguardedAdoptions(t)
  check(bad.length === 0,
    `B5 ${f} adopts the stored Act ONLY under a membership check on this artist's own Acts (LANE-A T-106 regression pin; any membership spelling accepted)`,
    `B5 ⚠ ${f}: ${bad.length} UNGUARDED adoption(s) of the stored Act — T-106 (stale cross-Person context) is reachable again. ${bad.join(' | ')}`)
}

console.log(`
  EVIDENCE OPEN, not asserted: whether GoTrue revokes OTHER sessions on a
  password change, whether the recovery code is single-use in practice, and
  token lifetimes. All three need a running auth server; this container has
  none. They are named here so their absence is visible rather than implied.`)

console.log(failed
  ? `\n✗ AUTH · SESSION · RECOVERY: FAILED (${checks} checks)\n`
  : `\n✓ AUTH · SESSION · RECOVERY: ${checks} static checks hold — one password-change surface, public by design, ready on any session, with no re-authentication in front of it; and sign-out clears the session but none of the app's 14 resolvable (+5 helper-resolved) storage keys, with the T-106 stale-Act adoption structurally pinned at both consumers.\n`)
process.exit(failed ? 1 : 0)
