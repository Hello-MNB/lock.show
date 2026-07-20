// W4-1 (T-44, spec §1.6 · §14.4) — Gate tile counts for the operator console.
//
// FIREWALL NOTE (§14.3 / §2): these are counts of PRODUCT EVENTS across the
// whole funnel — operator-facing ops numbers, explicitly allowed. They are
// never about a single person, never a per-artist number, never returned to
// an artist or a buyer surface.
//
// §14.4.1 honesty rule: each event renders in its OWN tile — intent
// (payment_reference_created) is never merged into the paid figure; only
// entitlement_activated (operator-verified) means "paid", and passport_view
// is context, explicitly NOT a reaction (P0-5).
import { supabase } from '../../lib/supabase.js'
import { DEMO } from '../../lib/demo.js'

// Order = funnel order; keys match the analytics CANON vocabulary (024 + 028).
export const GATE_EVENTS = [
  'passport_view',
  'professional_reaction_submitted',
  'availability_request_created',
  'payment_reference_created',
  'entitlement_activated',
]

// DEMO fixture baseline (§14.3.1 — a demo build writes no analytics_event rows;
// rule 11: fixtures only). On top of the fixtures we add THIS browser's demo
// session events from the analytics localStorage ring buffer, so the demo loop
// "artist marks paid → operator activates" visibly moves the tiles.
const DEMO_BASE = {
  passport_view: 14,
  professional_reaction_submitted: 1,
  availability_request_created: 2,
  payment_reference_created: 1,
  entitlement_activated: 1,
}

const RING_KEY = 'gigproof_events' // analytics.js sink 1 (ring buffer)

function demoCounts() {
  const counts = { ...DEMO_BASE }
  try {
    const ring = JSON.parse(localStorage.getItem(RING_KEY) || '[]')
    for (const e of ring) {
      if (e && Object.prototype.hasOwnProperty.call(counts, e.name)) counts[e.name] += 1
    }
  } catch { /* ring unreadable — fixtures alone */ }
  return counts
}

// → { passport_view: n, ... } — one head-count query per Gate event.
// Throws on any query error so the console can show a real, retryable error
// state instead of a silently-wrong zero (ADMIN-PANEL-SPEC: never estimate).
// is_demo=false (migration 037, applied 17 Jul): seed/@gigproof.test/operator
// activity is excluded — a Gate tile may only ever count outside demand
// (§14.3.2; 037's own header mandates this filter before counts are trusted).
// Retention read (audit T-55, §8.12 / §21.1 Retention family). Two counts:
//   returningAccounts — distinct real accounts with canon `login` events on
//     MORE THAN ONE calendar day (manual logins AND restored sessions, which
//     now fire login{via:'session-restore'}).
//   repeatPassportOpens — passport_view rows carrying the first-party
//     return_visit marker (same browser came back; no viewer identity).
// FIREWALL: counts of PRODUCT EVENTS on the operator surface only — never a
// per-person number on any artist/buyer surface (§2.5, §21.0).
export async function fetchRetention() {
  if (DEMO) return { returningAccounts: 2, repeatPassportOpens: 4 }
  const { data, error } = await supabase
    .from('analytics_event')
    .select('actor_user_id, created_at')
    .eq('event_name', 'login')
    .eq('is_demo', false)
    .not('actor_user_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2000)
  if (error) throw error
  const daysByActor = new Map()
  for (const r of data || []) {
    const day = String(r.created_at).slice(0, 10)
    const s = daysByActor.get(r.actor_user_id) || new Set()
    s.add(day)
    daysByActor.set(r.actor_user_id, s)
  }
  let returningAccounts = 0
  for (const s of daysByActor.values()) if (s.size > 1) returningAccounts += 1
  const { count, error: e2 } = await supabase
    .from('analytics_event')
    .select('id', { count: 'exact', head: true })
    .eq('event_name', 'passport_view')
    .eq('is_demo', false)
    .eq('properties->>return_visit', 'true')
  if (e2) throw e2
  return { returningAccounts, repeatPassportOpens: count ?? 0 }
}

export async function fetchGateCounts() {
  if (DEMO) return demoCounts()
  const pairs = await Promise.all(GATE_EVENTS.map(async (name) => {
    const { count, error } = await supabase
      .from('analytics_event')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', name)
      .eq('is_demo', false)
    if (error) throw error
    return [name, count ?? 0]
  }))
  return Object.fromEntries(pairs)
}

// B5-a (T-81, §8.12) — PILOT FUNNEL: the artist's OWN product-milestone
// events, build → distribution → the first buyer action. Counts of PRODUCT
// EVENTS only (never a per-artist figure); rendered as a proportional fill
// bar in AdminDashboard, which is explicitly allowed (§2.1) because the fill
// is relative to the funnel's OWN max, not a score/percentile about a person.
// `availability_request_created` is the same canon event as the Gate
// "requests" tile above — kept as its own funnel stage per §14.4.1 (each
// event stays its own number; no merging).
export const FUNNEL_EVENTS = [
  'signup_completed',
  'onboarding_completed',
  'radar_opened',
  'evidence_added',
  'claim_confirmed',
  'passport_published',
  'share_link_created',
  'availability_request_created',
]

// DEMO fixture baseline — same posture as DEMO_BASE above (no analytics_event
// rows in a demo build; fixtures only, §14.3.1 rule 11). Monotonically
// non-increasing, matching a funnel shape. The shared event
// (availability_request_created) intentionally equals DEMO_BASE's value so
// the Gate tile and the funnel's last stage never disagree in DEMO.
const FUNNEL_DEMO_BASE = {
  signup_completed: 9,
  onboarding_completed: 7,
  radar_opened: 6,
  evidence_added: 5,
  claim_confirmed: 4,
  passport_published: 3,
  share_link_created: 2,
  availability_request_created: DEMO_BASE.availability_request_created,
}

function demoFunnelCounts() {
  const counts = { ...FUNNEL_DEMO_BASE }
  try {
    const ring = JSON.parse(localStorage.getItem(RING_KEY) || '[]')
    for (const e of ring) {
      if (e && Object.prototype.hasOwnProperty.call(counts, e.name)) counts[e.name] += 1
    }
  } catch { /* ring unreadable — fixtures alone */ }
  return counts
}

// → { signup_completed: n, ... } — one head-count query per funnel event.
// Same contract as fetchGateCounts: throws on error (real, retryable error
// state instead of a silently-wrong zero); is_demo=false excludes seed/test
// activity (§14.3.2).
export async function fetchFunnelCounts() {
  if (DEMO) return demoFunnelCounts()
  const pairs = await Promise.all(FUNNEL_EVENTS.map(async (name) => {
    const { count, error } = await supabase
      .from('analytics_event')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', name)
      .eq('is_demo', false)
    if (error) throw error
    return [name, count ?? 0]
  }))
  return Object.fromEntries(pairs)
}

// B5-L (T-92, §8.12) — AI-COST LEDGER, owner ruling (a) "honest hybrid" (20 Jul):
// the spend figure needs a server-side cost read path (server/**, out of this
// territory) and is NOT computed here — it renders as a manually-tracked line
// on the AdminDashboard, never a number. What CAN be shown honestly from OUR
// OWN DB is the automated-extraction run volume: a head-count of
// public.processing_job rows (migration 022 — one row per AI extraction run)
// created in the last 30 days, plus its status breakdown (queued / running /
// completed / failed — the table's own check-constraint values).
//
// FIREWALL NOTE: unlike analytics_event (migration 037), processing_job carries
// NO is_demo column and no direct seed/test-account marker reachable from the
// client (it would need a 3-table join through evidence_artifacts → artists →
// auth.users email domain, which the anon/operator client cannot do). This
// count is therefore NOT demo/seed-excluded — the tile must say so plainly
// rather than imply the same guarantee as the Gate/Retention/Funnel tiles.
export const AI_RUN_STATUSES = ['queued', 'running', 'completed', 'failed']

const AI_RUNS_DEMO = { total: 6, byStatus: { queued: 1, running: 1, completed: 3, failed: 1 } }

// → { total: n, byStatus: { queued: n, running: n, completed: n, failed: n } }
// Same contract as fetchGateCounts/fetchFunnelCounts: throws on error (real,
// retryable error state instead of a silently-wrong zero).
export async function fetchAiRuns30d() {
  if (DEMO) return AI_RUNS_DEMO
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from('processing_job')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if (error) throw error
  const pairs = await Promise.all(AI_RUN_STATUSES.map(async (status) => {
    const { count: n, error: e2 } = await supabase
      .from('processing_job')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('status', status)
    if (e2) throw e2
    return [status, n ?? 0]
  }))
  return { total: count ?? 0, byStatus: Object.fromEntries(pairs) }
}
