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
