// ============================================================
// GIGPROOF — in-app notifications (P1-1). Table exists since migration 002
// (public.notifications: id, user_id, type, body, link, read, created_at) but
// had ZERO writers and ZERO UI before this file. RLS (notif_self) restricts
// every row to `user_id = auth.uid()` — so a session can only ever list/mark-
// read ITS OWN notifications. Writing a notification FOR SOMEONE ELSE (operator
// activates a payment → notify the artist owner; an anon booker submits a
// request → notify the artist owner; a producer confirms a claim → notify the
// artist owner) can never satisfy that RLS check from the anon/authenticated
// client, so createNotification() always goes through the server's service-role
// POST /api/notify route (same pattern already used by producer_confirmations).
//
// FIREWALL: `body` is plain bounded text authored at write time via the
// T.notifications.* template functions (src/lib/i18n/*.js) — never a raw
// score/percentage/count.
// ============================================================
import { supabase } from './supabase.js'
import { DEMO, demoNotifications } from './demo.js'

// ── Read ─────────────────────────────────────────────────
export async function listNotifications(userId) {
  if (DEMO) return demoNotifications
  if (!userId) return []
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) return [] // best-effort — a notifications hiccup must never break the shell
  return data ?? []
}

// ── Mark read (self-scoped — always allowed under notif_self) ────────────
export async function markRead(id) {
  if (DEMO || !id) return
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (error) throw error
  } catch { /* best-effort — a failed mark-read must never block navigation */ }
}

export async function markAllRead(userId) {
  if (DEMO || !userId) return
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    if (error) throw error
  } catch { /* best-effort */ }
}

// ── Write (cross-user — server-mediated, fire-and-forget) ────────────────
// Callers only know the ARTIST, not the owner's auth user id — the server
// resolves artistId → artists.created_by with the service role. Never throws:
// the primary action (confirm / activate / submit) must complete regardless
// of whether the notification insert succeeds.
export async function createNotification({ artistId, type, body, link = null }) {
  if (DEMO || !artistId || !type || !body) return
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId, type, body, link }),
    })
  } catch { /* best-effort — no server on a static deploy is a silent no-op */ }
}

// ── Display helper — bounded relative time, bilingual via T ──────────────
export function relativeTime(iso, T) {
  const R = T.notifications
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return R.justNow
  if (min < 60) return R.minutesAgo(min)
  const hr = Math.floor(min / 60)
  if (hr < 24) return R.hoursAgo(hr)
  const day = Math.floor(hr / 24)
  return R.daysAgo(day)
}
