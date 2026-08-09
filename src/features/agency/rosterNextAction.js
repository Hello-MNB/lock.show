// ── G4 · A5 — ONE commercial next-best-action PER ARTIST (roster rows) ──────
// Mirrors the artist-side ladder in ArtistDashboard.jsx (pickNextAction):
// a waiting buyer beats everything; unpublished proof beats stale proof; stale
// proof beats another share. Every destination is BOUND to the specific artist
// (artist id in the route/params) — never a bare /agency/radar.
//
// FIREWALL: the chip renders action TEXT only — the counts/ages consumed here
// are inputs to a rule, never rendered as a number, %, score or rank.
//
// Scope law (REPRESENTATION-CANON / migration 027): for a CONSENTED grant the
// ladder may only surface actions the grant's scope allows — publish needs
// 'publish', refreshing evidence needs 'upload', sharing needs 'share'.
// 'view' is the floor every grant carries, so "view passport" (and replying to
// a request that landed in THIS org's own inbox) is always available.
// An owned roster row passes scope=null → full control, nothing gated.

import { supabase } from '../../lib/supabase.js'
import { DEMO, demoRadarRecords } from '../../lib/demo.js'

// Evidence counts as fresh for 90 days — same TIME state as the artist ladder
// (ArtistDashboard.jsx FRESHNESS_DAYS); freshness is a time state, never quality.
export const FRESHNESS_DAYS = 90

// T-102 · AUTHORITY EXPLAINER. Before this, a rung the mandate did not cover
// was SILENTLY swapped for a quieter label — "Publish Passport" simply became
// "View Passport" and the rep was left to guess why. Silent degradation is a
// lie of omission about who holds authority. The ladder now remembers the FIRST
// capability the grant's scope blocked and returns it as `gatedBy`, so the row
// can say in plain words who CAN do it ("Only {artist} can publish this — ask
// them to."). `gatedBy` carries the scope value for the CALLER to look up a
// human sentence — it is never rendered raw; no scope enum word reaches a user.
export function pickRosterAction({ artistId, published, items, openRequests, scope }) {
  let gatedBy = null
  const can = (s) => {
    if (!Array.isArray(scope) || scope.includes(s)) return true
    if (!gatedBy) gatedBy = s // first block wins — one sentence per row, never a list
    return false
  }
  const out = (a) => (gatedBy ? { ...a, gatedBy } : a)
  const passport = `/passport/${artistId}`
  // 1 · A waiting buyer beats everything — deep-link the inbox TO this artist.
  //     Replying is the `view` floor every grant carries, so nothing is gated here.
  if (openRequests > 0) return { key: 'nextReplyRequest', to: `/agency/requests?artist=${artistId}`, urgent: true }
  // 2 · No published Passport → nothing to sell yet. With 'publish' scope the
  //     grant allows guiding it live; without it the row falls to the draft view
  //     AND says who can publish, instead of quietly changing its own label.
  if (published === false) return out({ key: can('publish') ? 'nextPublishPassport' : 'nextViewPassport', to: passport })
  // 3 · Evidence rungs run only when the item state was actually readable
  //     (null = unknown — RLS or a failed side-query; never guess from silence).
  if (Array.isArray(items)) {
    const newest = items.reduce((t, i) => Math.max(t, Date.parse(i.created_at || i.item_date) || 0), 0)
    if (newest && Date.now() - newest > FRESHNESS_DAYS * 864e5 && can('upload'))
      return out({ key: 'nextRefreshProof', to: passport })
    // 4 · No link/video evidence at all → the commercial move is to get one
    //     (a nudge to the artist, not a passport mutation — view floor).
    if (!items.some((i) => i.item_type === 'link')) return out({ key: 'nextRequestVideo', to: passport })
  }
  // 5 · Published, fresh, linkable → put it in front of the market.
  if (published && can('share')) return out({ key: 'nextSharePassport', to: passport })
  return out({ key: 'nextViewPassport', to: passport })
}

// ── Consented-roster state fetch (bounded fields only) ──────────────────────
// list_roster_grants (RPC 032) returns the grant rows without publish/evidence
// state, and orgs.js is owned elsewhere — so the extra read-model lives HERE,
// inside the agency feature. Three bounded selects, each tolerated
// independently: RLS hiding a table degrades that field to unknown (null),
// which the ladder answers with the always-allowed view/share floor.
//   artists.published        — readable via the 015 artists_org active-grant arm
//   profile_items            — item_type + created_at only (count/age, no content);
//                              public-read covers passport-ok items of published
//                              artists, exactly the rungs that consume them
//   availability_requests    — status='new' rows only (open-request presence)
export async function fetchGrantArtistState(artistIds) {
  const state = Object.fromEntries((artistIds || []).map((id) => [id, { published: null, items: null, openRequests: 0 }]))
  if (DEMO) {
    for (const r of demoRadarRecords) {
      if (!state[r.artist.id]) continue
      state[r.artist.id].published = !!r.artist.published
      state[r.artist.id].openRequests = (r.demand || []).filter((d) => d.status === 'new').length
    }
    return state
  }
  if (!artistIds?.length || !supabase) return state
  const [artists, items, reqs] = await Promise.all([
    supabase.from('artists').select('id, published').in('id', artistIds),
    supabase.from('profile_items').select('artist_id, item_type, created_at').in('artist_id', artistIds),
    supabase.from('availability_requests').select('id, artist_id, status').in('artist_id', artistIds).eq('status', 'new'),
  ])
  for (const a of artists.data || []) { if (state[a.id]) state[a.id].published = !!a.published }
  if (!items.error && items.data) {
    for (const id of artistIds) state[id].items = []
    for (const i of items.data) state[i.artist_id]?.items?.push(i)
  }
  for (const r of reqs.data || []) { if (state[r.artist_id]) state[r.artist_id].openRequests += 1 }
  return state
}
