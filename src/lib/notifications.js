// ============================================================
// LOCK SHOW — in-app notifications (P1-1). Table exists since migration 002
// (public.notifications: id, user_id, type, body, link, read, created_at) but
// had ZERO writers and ZERO UI before this file. RLS (notif_self) restricts
// every row to `user_id = auth.uid()` — so a session can only ever list/mark-
// read ITS OWN notifications. Writing a notification FOR SOMEONE ELSE can never
// satisfy that RLS check from the anon/authenticated client, so
// createNotification() goes through the server's service-role POST /api/notify
// route. G11: that route now requires a JWT whose user OWNS the target artist
// OR profiles.role='operator', with a CLOSED type enum
// ('request_received'|'confirmation_received'|'system'). The anonymous-booker
// path does NOT use this writer anymore — POST /api/availability-request
// creates the request + the artist notification server-side in one call.
//
// FIREWALL: `body` is plain bounded text authored at write time via the
// T.notifications.* template functions (src/lib/i18n/*.js) — never a raw
// score/percentage/count.
// ============================================================
import { supabase } from './supabase.js'
import { authHeaders } from './db.js'
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
// LANE-A T-106 (optimistic UI with no rollback): the bell flips the row to read
// BEFORE this resolves, and these used to swallow the failure and return
// undefined — so a failed write left the dot gone until the next reload put it
// back, with no way for the caller to know. They still never throw (a
// mark-read must never block navigation), but they now REPORT the outcome so
// the caller can roll its optimistic state back.
//   → true  = the row really is marked read (or DEMO, where there is no write)
//   → false = the write failed; the caller should restore what it flipped
export async function markRead(id) {
  if (DEMO) return true
  if (!id) return false
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    return !error
  } catch { return false }
}

export async function markAllRead(userId) {
  if (DEMO) return true
  if (!userId) return false
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    return !error
  } catch { return false }
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
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
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
