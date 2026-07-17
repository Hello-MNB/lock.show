import { ROLES } from './constants.js'

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION CONTRACT — the single source of truth for "where does this person
// land?" Every routing decision in App.jsx (RoleHome + the RequireRole/
// RequireAgency/RequireProduction gates) and UserTypeSelect delegates to a pure
// function here. Keeping the logic pure (no React, no hooks) means it can be
// verified exhaustively and deterministically by scripts/nav-contract.test.mjs
// — the skeleton's navigation is proven on every build, for both a NEW signup
// and a RETURNING customer, across every entity, without a browser.
//
// If you change a landing target, change it HERE — the components read these,
// and the contract test asserts every resolved target is a registered <Route>.
// ─────────────────────────────────────────────────────────────────────────────

// Canonical route paths. Keep in lockstep with the <Route path> list in App.jsx
// (the contract test enforces this).
export const ROUTES = {
  home: '/',                              // RoleHome — re-routes by effective role
  login: '/login',
  signup: '/signup',
  select: '/select',                      // "Who are you?" — new user picks a type
  onboarding: '/onboarding',              // artist first-run
  artistHome: '/artist/home',
  discover: '/discover',                  // booking manager (booker) home
  agency: '/agency',                      // roster / talent agency home
  production: '/production',              // production-company workspace home
  producerReceived: '/producer/received', // claim-confirmer landing
  admin: '/admin',                        // operator
}

// RoleHome contract — where a logged-in person with an EFFECTIVE (org-derived)
// role lands. Mirrors <RoleHome> in App.jsx exactly. `demo` only changes the
// role-less fallback: the demo persona chooser lives at /login, whereas a real
// role-less user (just-signed-up, no type yet) is sent to /select.
export function homePathFor({ role, isProducerWorkspace = false, demo = false } = {}) {
  if (!role) return demo ? ROUTES.login : ROUTES.select
  switch (role) {
    case ROLES.OPERATOR: return ROUTES.admin
    // A production-type workspace (migration 027) has functional_role='agency'
    // but its own screen-set — workspace_type is the real routing signal.
    case ROLES.AGENCY:   return isProducerWorkspace ? ROUTES.production : ROUTES.agency
    case ROLES.BOOKER:   return ROUTES.discover
    case ROLES.PRODUCER: return ROUTES.producerReceived
    case ROLES.ARTIST:   return ROUTES.artistHome
    default:             return ROUTES.artistHome
  }
}

// UserTypeSelect contract — the first screen a NEW user sees right after they
// pick "what would you like to do first?" at /select. (producer/operator are
// never self-selected, so they have no entry here.)
export function selectRoute(role) {
  switch (role) {
    case ROLES.ARTIST: return ROUTES.onboarding
    case ROLES.AGENCY: return ROUTES.agency
    case ROLES.BOOKER: return ROUTES.discover
    default:           return ROUTES.home
  }
}

// RequireRole contract → returns the redirect path, or null to ALLOW the render.
// Mirrors <RequireRole> in App.jsx. When the result is ROUTES.login the caller
// must attach `state.from` so the user returns to their intended route.
export function requireRoleRedirect({ need, user, role, demo = false } = {}) {
  if (!user) return ROUTES.login
  if (!role) return demo ? ROUTES.login : ROUTES.select
  const ok = Array.isArray(need) ? need.includes(role) : role === need
  return ok ? null : ROUTES.home
}

// RequireAgency contract → redirect path or null to allow. An agency is a grown
// booker-org (access by AGENCY role OR agency PLAN). A production-type workspace
// is its own screen-set and is bounced to /production instead of the roster.
export function requireAgencyRedirect({ user, role, isAgency = false, isProducerWorkspace = false } = {}) {
  if (!user) return ROUTES.login
  if (isProducerWorkspace) return ROUTES.production
  if (role === ROLES.AGENCY || isAgency) return null
  return ROUTES.home
}

// RequireProduction contract → redirect path or null to allow. Gated on the
// active org's workspace_type (functional_role has no dedicated producer-org
// value). A non-production agency falls through to the roster screen, not "/".
export function requireProductionRedirect({ user, role, isAgency = false, isProducerWorkspace = false } = {}) {
  if (!user) return ROUTES.login
  if (isProducerWorkspace) return null
  if (role === ROLES.AGENCY || isAgency) return ROUTES.agency
  return ROUTES.home
}

// Post-login contract — honor a stashed intended destination (deep link or
// /invite/:token), otherwise send to RoleHome.
export function postLoginPath({ from } = {}) {
  return from || ROUTES.home
}
