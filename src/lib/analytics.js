// LOCK analytics — first-party product events.
//
// Two sinks, both best-effort (analytics must NEVER break a user action):
//   1. localStorage ring buffer — dev inspection, offline-safe, unchanged.
//   2. public.analytics_event (migrations 024 + 028) — the measurable funnel and
//      the GATE (a booking manager reacts to a real Passport AND one pays). RLS
//      `ae_any_insert` lets anon + authenticated insert, so we write directly
//      from the client — works on app.lock.show AND the static lock.show/app
//      embed (no server dependency). Only names in CANON (the DB CHECK vocabulary,
//      028) are persisted; a name not in CANON would violate the CHECK, so it
//      stays localStorage-only.
//
// FIREWALL: `properties` carries ids/roles/context only — NEVER a score,
// percentage, rank, or count-about-an-artist. Counts of PRODUCT events are fine;
// scores about people are not.
import { supabase } from './supabase.js'
import { DEMO } from './demo.js'

const KEY = 'gigproof_events'
const MAX_EVENTS = 100

// The canonical event vocabulary — MUST match analytics_event's event_name CHECK
// (024 + 028 + 040). Anything here persists to the DB; anything else is dev-only.
const CANON = new Set([
  // 024 originals
  'passport_view', 'professional_reaction_submitted', 'availability_request_created',
  'producer_confirmation_sent', 'producer_confirmation_received', 'claim_published',
  'passport_published', 'entitlement_activated', 'gig_evidence_refresh_completed',
  'passport_unpublished', // requires migration 034 (CHECK widened); before it, insert fails harmlessly → localStorage only
  'share_link_created', 'share_link_opened', 'consent_granted', 'consent_withdrawn',
  'account_deleted',
  // 028 M1 funnel additions
  'signup_started', 'signup_completed', 'login', 'oauth_login',
  'onboarding_started', 'onboarding_completed', 'radar_opened', 'evidence_added',
  'claim_confirmed', 'act_created', 'act_switched', 'workspace_switched',
  'payment_reference_created', 'availability_request_responded',
  // 040 buyer-funnel additions (spec §14.1.6, ratify R00 — pending):
  // requires migration 040 (CHECK widened, AUTHORED NOT APPLIED); before it
  // is applied, inserts fail the DB CHECK harmlessly → localStorage only,
  // same degrade path as passport_unpublished before 034.
  'proof_unit_expanded', 'method_label_peeked', 'persona_toggled',
  'availability_request_started',
])

export function logEvent(name, props = {}) {
  // Sink 1 — localStorage ring buffer (dev / offline).
  if (typeof localStorage !== 'undefined') {
    try {
      const events = JSON.parse(localStorage.getItem(KEY) || '[]')
      events.unshift({ name, props, ts: new Date().toISOString() })
      if (events.length > MAX_EVENTS) events.length = MAX_EVENTS
      localStorage.setItem(KEY, JSON.stringify(events))
      if (import.meta.env?.DEV) console.debug(`[analytics] ${name}`, props)
    } catch { /* storage full/blocked — ignore */ }
  }
  // Sink 2 — persist canonical events to the DB (measurable funnel + Gate).
  persist(name, props)
}

async function persist(name, props) {
  if (DEMO || !supabase || !CANON.has(name)) return
  try {
    const { data } = await supabase.auth.getSession()
    // T-57: seed actors mark their own rows AT WRITE TIME. The 037 backfill was
    // one-time — without this, ongoing seed activity counts as real (the T-56
    // witness walk proved it; rows had to be patched by hand). @gigproof.test
    // is the seed domain (docs/team/TEST-LOGINS.md). Column exists live (037).
    const email = data?.session?.user?.email || ''
    await supabase.from('analytics_event').insert({
      event_name: name,
      actor_user_id: data?.session?.user?.id ?? null,
      actor_role: props?.role ?? null,
      properties: props && Object.keys(props).length ? props : null,
      ...(email.endsWith('@gigproof.test') ? { is_demo: true } : {}),
    })
  } catch { /* best-effort — a measurement write must never surface to the user */ }
}

// ── First-touch attribution — the site→app first-party bridge (audit T-55) ──
// Captured ONCE per browser at first app open: utm_* params + referrer +
// landing path (+ the ?s=1 share marker, G7). Attached to signup_completed so
// a signup is attributable to the site page / campaign / share link that
// produced it. First-party localStorage only — no cookie, no third-party call.
const ATTRIB_KEY = 'gigproof_attrib'
export function captureFirstTouch() {
  try {
    if (typeof localStorage === 'undefined' || localStorage.getItem(ATTRIB_KEY)) return
    const p = new URLSearchParams(window.location.search)
    const attrib = {}
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = p.get(k)
      if (v) attrib[k] = v.slice(0, 100)
    }
    if (document.referrer) attrib.referrer = document.referrer.slice(0, 200)
    attrib.landing = window.location.pathname.slice(0, 200)
    if (p.get('s') === '1') attrib.shared = true
    attrib.at = new Date().toISOString()
    localStorage.setItem(ATTRIB_KEY, JSON.stringify(attrib))
  } catch { /* storage blocked — attribution is best-effort */ }
}
export function getFirstTouch() {
  try { return JSON.parse(localStorage.getItem(ATTRIB_KEY) || 'null') || {} } catch { return {} }
}

// ── Return-visit marker (retention signal, audit T-55) ──────────────────────
// A first-party per-browser boolean: was this surface seen before? Marks the
// surface as seen and returns the PREVIOUS state. Carries no identity and is
// never surfaced as a per-person number — the operator read model counts
// product events only.
export function isReturnVisit(surface) {
  try {
    const k = `gigproof_seen_${surface}`
    const seen = !!localStorage.getItem(k)
    localStorage.setItem(k, '1')
    return seen
  } catch { return false }
}

// Event names. Values in CANON persist to analytics_event; the rest are dev-only.
export const EVENTS = {
  // ── funnel top ──
  SIGNUP_STARTED: 'signup_started',
  SIGNUP: 'signup_completed',
  LOGIN: 'login',
  OAUTH_LOGIN: 'oauth_login',
  CONSENT_ACCEPTED: 'consent_granted',
  CONSENT_WITHDRAWN: 'consent_withdrawn',
  // ── artist build ──
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETE: 'onboarding_completed',
  RADAR_OPENED: 'radar_opened',
  EVIDENCE_UPLOADED: 'evidence_added',
  EVIDENCE_PROCESSED: 'gig_evidence_refresh_completed',
  CLAIM_CONFIRMED: 'claim_confirmed',
  CLAIM_PUBLISHED: 'claim_published',
  PASSPORT_PUBLISHED: 'passport_published',
  PASSPORT_UNPUBLISHED: 'passport_unpublished', // republish cadence/staleness (CFRO v2.4 recurring signal)
  ACT_CREATED: 'act_created',
  ACT_SWITCHED: 'act_switched',
  WORKSPACE_SWITCHED: 'workspace_switched',
  // G7 — share ladder: created when the artist copies their share link;
  // opened once per visit on a public Passport reached via a ?s=1 link.
  SHARE_LINK_CREATED: 'share_link_created',
  SHARE_LINK_OPENED: 'share_link_opened',
  // ── the GATE (react + pay) ──
  PASSPORT_VIEWED: 'passport_view',
  REQUEST_SENT: 'availability_request_created',
  REQUEST_STARTED: 'availability_request_started', // §14.1.6 (R00, pending 040)
  REQUEST_RESPONDED: 'availability_request_responded',
  PROFESSIONAL_REACTION: 'professional_reaction_submitted',
  // ── buyer-funnel mid-Passport engagement (§14.1.6, R00 — pending 040) ──
  PROOF_UNIT_EXPANDED: 'proof_unit_expanded',
  METHOD_LABEL_PEEKED: 'method_label_peeked',
  PERSONA_TOGGLED: 'persona_toggled',
  PAYMENT_REF_CREATED: 'payment_reference_created',
  ENTITLEMENT_ACTIVATED: 'entitlement_activated',
  PRODUCER_CONFIRMATION_SENT: 'producer_confirmation_sent',
  PRODUCER_CONFIRMATION_RECEIVED: 'producer_confirmation_received',
  ACCOUNT_DELETED: 'account_deleted',
  // ── dev-only (NOT persisted — absent from CANON) ──
  ONBOARDING_STEP: 'onboarding_step',
  CLAIM_VISIBILITY_CHANGED: 'claim_visibility_changed',
  REQUEST_WHATSAPP_CLICK: 'request_whatsapp_click',
  SETTINGS_OPENED: 'settings_opened',
  DELETE_ACCOUNT_REQUESTED: 'delete_account_requested',
  LANGUAGE_CHANGED: 'language_changed',
}
