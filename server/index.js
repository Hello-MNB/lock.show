// ============================================================
// GIGPROOF — local AI / API server (port 8787).
// Keeps the Anthropic key server-side. Uses the AiClaimProcessor
// interface from /src/lib/ai — stub without a key, live with one.
// On deploy this maps 1:1 to Vercel serverless / Supabase Edge fns.
// ============================================================
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { createClaimProcessor } from '../src/lib/ai/index.js'
import { VISIBILITY, PUBLISHABLE_STATUSES } from '../src/lib/constants.js'
import { T as en } from '../src/lib/i18n/en.js'

dotenv.config({ path: '.env.local' })

const PORT = process.env.API_PORT || 8787

// Treat unfilled placeholders (PASTE_…, your-…, YOUR-PROJECT, sk-ant-…) as "not set".
// Without this, a placeholder service key looks configured and then fails later
// with a cryptic auth error — /api/health would lie. realValue keeps it honest.
function realValue(v) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  if (/^(PASTE_|your-|YOUR-|sk-ant-\.\.\.)/i.test(s) || s.includes('YOUR-PROJECT')) return null
  return s
}

const SUPA_URL = realValue(process.env.VITE_SUPABASE_URL)
const SERVICE_KEY = realValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
const ANTHROPIC_KEY = realValue(process.env.ANTHROPIC_API_KEY)
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'

const admin = SUPA_URL && SERVICE_KEY ? createClient(SUPA_URL, SERVICE_KEY) : null

// Single processor instance: StubClaimProcessor (no key) or AnthropicClaimProcessor (key set).
// Callers never reference the concrete class — only the AiClaimProcessor interface.
const processor = createClaimProcessor(ANTHROPIC_KEY, MODEL)

const app = express()

// CORS allowlist (G11-1). Origins come from ALLOWED_ORIGINS (comma-separated env);
// default = production + local dev. Requests without an Origin header (curl,
// server-to-server, same-origin) pass through — CORS only gates browsers.
const ALLOWED_ORIGINS = (realValue(process.env.ALLOWED_ORIGINS)
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : ['https://app.lock.show', 'https://lock.show', 'http://localhost:5173'])
app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    return cb(null, false) // not allowlisted → no CORS headers; the browser blocks it
  },
}))
app.use(express.json({ limit: '2mb' }))

// ──────────────────────────────────────────────────────────
// AUTH (G11-2). Every route that mutates or reads private data requires a
// Supabase user JWT: Authorization: Bearer <access_token>, verified against
// Supabase Auth via the service client. Attaches req.userId.
// Public-by-design routes (health, public passport GET, passport-signal,
// tokened producer /confirm links) skip this.
// ──────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  try {
    const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')
    if (!m || !admin) return res.status(401).json({ error: 'auth_required' })
    const { data, error } = await admin.auth.getUser(m[1])
    if (error || !data?.user?.id) return res.status(401).json({ error: 'auth_required' })
    req.userId = data.user.id
    next()
  } catch (e) {
    console.error('[auth]', e)
    res.status(401).json({ error: 'auth_required' })
  }
}

// Ownership gate (G11-3): artists.created_by must equal the authenticated user.
// Writes the failure response itself; caller just returns false.
async function requireArtistOwner(req, res, artistId) {
  if (!artistId) {
    res.status(400).json({ error: 'artistId required' })
    return false
  }
  const { data: artist, error } = await admin
    .from('artists').select('id, created_by').eq('id', artistId).maybeSingle()
  if (error) throw error
  if (!artist) {
    res.status(404).json({ error: 'Artist not found.' })
    return false
  }
  if (artist.created_by !== req.userId) {
    res.status(403).json({ error: 'forbidden' })
    return false
  }
  return true
}

// ──────────────────────────────────────────────────────────
// GET /api/health
// ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  // 'configured' = a key is present; it does NOT claim any call succeeded
  // (truthful-provenance rule: liveness is only reported per processed item).
  res.json({ ok: true, supabase: Boolean(admin), ai: ANTHROPIC_KEY ? 'configured' : 'mock', model: MODEL })
})

// ──────────────────────────────────────────────────────────
// POST /api/process-evidence { artistId }
// Reads submitted evidence, labels each via AiClaimProcessor, writes Claims.
// ──────────────────────────────────────────────────────────
app.post('/api/process-evidence', requireAuth, async (req, res) => {
  try {
    if (!admin) {
      return res.status(400).json({
        error: 'Supabase not configured. Add VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env.local.',
      })
    }
    const { artistId } = req.body || {}
    if (!artistId) return res.status(400).json({ error: 'artistId required' })
    if (!(await requireArtistOwner(req, res, artistId))) return

    // 'error' items (a previous terminal AI failure — see below) are retryable here.
    const { data: evidence, error: evErr } = await admin
      .from('evidence_artifacts')
      .select('*')
      .eq('artist_id', artistId)
      .in('status', ['submitted', 'error'])
    if (evErr) throw evErr

    const claims = []
    for (const ev of evidence ?? []) {
      // TRUTHFUL PROVENANCE (G12): labelWithMethod reports the ACTUAL execution
      // path — 'anthropic' only when the API call succeeded, 'deterministic_fallback'
      // when the stub ran after a terminal API failure, 'mock' when no key is set.
      const { label: labelled, method, aiFailed } = await processor.labelWithMethod(ev)

      // Retry of a previously failed item: replace its fallback-labelled claim
      // (never touches 'anthropic'/'mock' claims) so a retry doesn't duplicate.
      if (ev.status === 'error') {
        await admin.from('claims').delete()
          .eq('evidence_id', ev.id).eq('extraction_method', 'deterministic_fallback')
      }

      const claim = {
        artist_id: artistId,
        evidence_id: ev.id,
        claim_type: labelled.claim_type || 'claim',
        value: labelled.value || ev.value || null,
        source_type: ev.source_type,
        verification_status: labelled.status,
        verified_by: 'system',
        verified_at: new Date().toISOString(),
        visibility: PUBLISHABLE_STATUSES.includes(labelled.status) ? VISIBILITY.PASSPORT_OK : VISIBILITY.MIRROR_ONLY,
        extraction_method: method,
        model_version: method === 'anthropic' ? MODEL : 'mock-v1',
        reason_code: labelled.reason || null,
      }
      const { data: inserted } = await admin.from('claims').insert(claim).select().single()
      claims.push(inserted)
      // Terminal AI failure → schema status 'error' (visible + retryable),
      // not a silent 'processed' that masquerades the stub label as done.
      await admin.from('evidence_artifacts')
        .update({ status: aiFailed ? 'error' : 'processed' }).eq('id', ev.id)
    }

    // Response reports the REAL per-item methods (each claim row carries its
    // extraction_method) plus a truthful summary — never key-presence.
    const methods = claims.reduce((acc, c) => {
      const m = c?.extraction_method || 'unknown'
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {})
    const ai = !ANTHROPIC_KEY ? 'mock' : (methods.deterministic_fallback ? 'degraded' : 'live')
    res.json({ processed: claims.length, ai, methods, claims })
  } catch (e) {
    console.error('[process-evidence]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ──────────────────────────────────────────────────────────
// buildSafePayload(artistId) — the PHYSICAL FIREWALL.
// Reads an artist's buyer-safe data from LIVE tables using explicit
// column lists. A score / percentile / exact head-count / gaps /
// internal_confidence column could NOT appear here even if it existed.
// Used both to write a publish snapshot and as a live fallback.
// ──────────────────────────────────────────────────────────
async function buildSafePayload(artistId) {
  const { data: artist, error: aErr } = await admin
    .from('artists')
    .select(
      'id, stage_name, name, genre, city, photo_url, one_line, regions, set_length, ' +
      'invoice_ready, music_links, lineup_frequency_band, sells_tickets, price_band, community_size_band'
    )
    .eq('id', artistId)
    .maybeSingle()
  if (aErr) throw aErr
  if (!artist) return null

  const { data: items, error: iErr } = await admin
    .from('profile_items')
    .select('id, item_type, title, detail, item_date, public_url, source_status')
    .eq('artist_id', artistId)
    .eq('visibility', VISIBILITY.PASSPORT_OK)
    .order('created_at', { ascending: false })
  if (iErr) throw iErr

  // Claims: passport-ok + verified/supporting + ARTIST-APPROVED only (031 gate —
  // this admin client bypasses RLS, so the approval gate must be explicit here or
  // unreviewed claims leak into the public payload). No internal_confidence/model_version/extraction_method.
  const { data: claims, error: cErr } = await admin
    .from('claims')
    .select('id, claim_type, value, source_type, verification_status, reason_code, method_label, expires_at')
    .eq('artist_id', artistId)
    .eq('visibility', VISIBILITY.PASSPORT_OK)
    .in('verification_status', PUBLISHABLE_STATUSES)
    .eq('artist_approved', true)
    .order('created_at', { ascending: false })
  if (cErr) throw cErr

  // Stale is computed here (snapshot/serve time); the raw expires_at NEVER leaves
  // the server (firewall — no timestamps on the public payload, only the label).
  const now = Date.now()
  const safeClaims = (claims ?? []).map((c) => {
    const stale = c.method_label !== 'producer-confirmed' && c.expires_at && new Date(c.expires_at).getTime() < now
    const { expires_at, ...rest } = c
    return { ...rest, method_label: stale ? 'stale' : c.method_label }
  })

  // published:true so the public page renders; the GET re-checks live publish state.
  return { artist: { ...artist, published: true }, items: items ?? [], claims: safeClaims }
}

// ──────────────────────────────────────────────────────────
// POST /api/publish/:artistId
// Artist action: write an IMMUTABLE buyer-safe snapshot + mark published.
// The public Passport reads the snapshot, so later visibility edits don't
// silently change what a buyer already saw until the artist re-publishes.
// ──────────────────────────────────────────────────────────
app.post('/api/publish/:artistId', requireAuth, async (req, res) => {
  try {
    if (!admin) {
      return res.status(400).json({
        error: 'Supabase not configured. Add a real SUPABASE_SERVICE_ROLE_KEY to .env.local.',
      })
    }
    const { artistId } = req.params
    if (!(await requireArtistOwner(req, res, artistId))) return
    const payload = await buildSafePayload(artistId)
    if (!payload) return res.status(404).json({ error: 'Artist not found.' })

    const { error: upErr } = await admin.from('artists').update({ published: true }).eq('id', artistId)
    if (upErr) throw upErr

    const { error: snapErr } = await admin
      .from('passport_versions')
      .insert({ artist_id: artistId, snapshot: payload })
    if (snapErr) throw snapErr

    res.json({ ok: true, published: true })
  } catch (e) {
    console.error('[publish]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ──────────────────────────────────────────────────────────
// GET /api/passport/:artistId
// Reads the immutable snapshot (not live claims). Current publish state
// still gates visibility, so un-publish hides the page immediately.
// ──────────────────────────────────────────────────────────
app.get('/api/passport/:artistId', async (req, res) => {
  try {
    if (!admin) {
      return res.status(503).json({ error: 'Supabase admin client not configured.' })
    }
    const { artistId } = req.params

    // Live publish flag gates visibility even though we serve a snapshot.
    const { data: pub, error: pErr } = await admin
      .from('artists').select('id, published').eq('id', artistId).maybeSingle()
    if (pErr) throw pErr
    if (!pub || !pub.published) return res.status(404).json({ error: 'Artist not published.' })

    // Prefer the immutable snapshot written at publish time.
    const { data: snap, error: sErr } = await admin
      .from('passport_versions')
      .select('snapshot')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (sErr) throw sErr
    if (snap?.snapshot) return res.json(snap.snapshot)

    // Fallback: artist marked published but no snapshot yet (e.g. legacy) → build live.
    const payload = await buildSafePayload(artistId)
    if (!payload) return res.status(404).json({ error: 'Artist not published.' })
    res.json(payload)
  } catch (e) {
    console.error('[passport]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ──────────────────────────────────────────────────────────
// POST /api/passport-signal { artistId, signal } — B2 action-ladder rungs 2–6.
// One-tap validation signal from a booker on a public Passport. No login.
// ──────────────────────────────────────────────────────────
app.post('/api/passport-signal', async (req, res) => {
  try {
    if (!admin) return res.status(400).json({ error: 'Supabase not configured.' })
    const { artistId, signal } = req.body || {}
    const ALLOWED = ['price_details', 'future_fit', 'needs_proof', 'not_this_event', 'forwarded']
    if (!artistId || !ALLOWED.includes(signal)) {
      return res.status(400).json({ error: 'artistId + valid signal required' })
    }
    const { data: pub, error: pErr } = await admin
      .from('artists').select('id, published').eq('id', artistId).maybeSingle()
    if (pErr) throw pErr
    if (!pub || !pub.published) return res.status(404).json({ error: 'Artist not published.' })
    const { error } = await admin.from('passport_signals').insert({ artist_id: artistId, signal })
    if (error) throw error
    res.json({ ok: true })
  } catch (e) {
    console.error('[passport-signal]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ──────────────────────────────────────────────────────────
// Notifications (P1-1) — writers. public.notifications RLS (notif_self,
// migration 002) is `user_id = auth.uid()`, so a cross-user write (operator →
// artist owner, anon booker → artist owner, producer → artist owner) can NEVER
// satisfy that check from the anon/authenticated client. Every such writer is
// therefore mediated here with the service role — same pattern as
// producer_confirmations. Best-effort: never throws to the caller.
// ──────────────────────────────────────────────────────────
async function notifyArtistOwner(artistId, { type, body, link }) {
  try {
    if (!admin || !artistId) return
    const { data: artist } = await admin.from('artists').select('created_by').eq('id', artistId).maybeSingle()
    if (!artist?.created_by) return
    await admin.from('notifications').insert({ user_id: artist.created_by, type, body, link: link || null })
  } catch (e) {
    console.warn('[notify]', e?.message || e)
  }
}

// POST /api/notify { artistId, type, body, link } — generic fire-and-forget
// notification writer used by the admin console (payment activated) and the
// availability-request form (request received). Always 200s (once authenticated)
// so the caller's primary action is never blocked by a notification hiccup.
// G11: requires a logged-in user — an anonymous caller could otherwise write
// arbitrary notifications into any artist owner's bell via the service role.
// Ownership is deliberately NOT required: this writer is cross-user by design
// (operator/booker → artist owner).
app.post('/api/notify', requireAuth, async (req, res) => {
  const { artistId, type, body, link } = req.body || {}
  if (admin && artistId && type && body) await notifyArtistOwner(artistId, { type, body, link })
  res.json({ ok: true })
})

// ──────────────────────────────────────────────────────────
// PRODUCER (מפיק) claim confirmation (P1) — service-role mediated, no login.
// A positive reply upgrades the claim's method_label to 'producer-confirmed'
// (the strongest label); revoke clears it.
// ──────────────────────────────────────────────────────────

// POST /api/request-confirmation { claimId, producerContact }
// Artist generates a tokened magic link to send a producer (manual, like wa.me).
app.post('/api/request-confirmation', requireAuth, async (req, res) => {
  try {
    if (!admin) return res.status(400).json({ error: 'Supabase not configured.' })
    const { claimId, producerContact } = req.body || {}
    if (!claimId) return res.status(400).json({ error: 'claimId required' })
    const { data: claim, error: cErr } = await admin
      .from('claims').select('id, artist_id').eq('id', claimId).maybeSingle()
    if (cErr) throw cErr
    if (!claim) return res.status(404).json({ error: 'Claim not found.' })
    // G11: claim → artist → owner; only the artist's owner may mint a token.
    if (!(await requireArtistOwner(req, res, claim.artist_id))) return
    const token = randomUUID()
    const { error: iErr } = await admin.from('producer_confirmations').insert({
      token, claim_id: claim.id, artist_id: claim.artist_id, producer_contact: producerContact || null,
    })
    if (iErr) throw iErr
    res.json({ token, path: `/confirm/${token}` })
  } catch (e) {
    console.error('[request-confirmation]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// GET /api/confirm/:token — producer opens the link; sees the claim + artist (safe fields only).
app.get('/api/confirm/:token', async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'Supabase admin client not configured.' })
    const { token } = req.params
    const { data: pc, error } = await admin
      .from('producer_confirmations')
      .select('id, response, revoked, responded_at, claim_id, artist_id')
      .eq('token', token).maybeSingle()
    if (error) throw error
    if (!pc) return res.status(404).json({ error: 'Invalid or expired link.' })
    const { data: claim } = await admin.from('claims').select('value, claim_type').eq('id', pc.claim_id).maybeSingle()
    const { data: artist } = await admin.from('artists').select('stage_name').eq('id', pc.artist_id).maybeSingle()
    res.json({
      claimText: claim?.value || claim?.claim_type || '',
      artistName: artist?.stage_name || '',
      response: pc.response, revoked: pc.revoked, responded: Boolean(pc.responded_at),
    })
  } catch (e) {
    console.error('[confirm-get]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// POST /api/confirm/:token { response } | { revoke:true } — producer replies or revokes.
app.post('/api/confirm/:token', async (req, res) => {
  try {
    if (!admin) return res.status(400).json({ error: 'Supabase not configured.' })
    const { token } = req.params
    const { response, revoke } = req.body || {}
    const { data: pc, error } = await admin
      .from('producer_confirmations').select('id, claim_id, artist_id').eq('token', token).maybeSingle()
    if (error) throw error
    if (!pc) return res.status(404).json({ error: 'Invalid or expired link.' })

    if (revoke) {
      await admin.from('producer_confirmations').update({ revoked: true }).eq('id', pc.id)
      await admin.from('claims').update({ method_label: null }).eq('id', pc.claim_id)
      return res.json({ ok: true, revoked: true })
    }

    if (!['yes', 'partial', 'no', 'wrong_person'].includes(response)) {
      return res.status(400).json({ error: 'invalid response' })
    }
    await admin.from('producer_confirmations').update({
      response, revoked: false, responded_at: new Date().toISOString(),
    }).eq('id', pc.id)
    // Only an unqualified "yes" earns the strongest label. A "partial" reply
    // means the wording needs correction — it must NOT read as fully confirmed
    // until the fix is reviewed (canon: correction-pending, not confirmed).
    const method = response === 'yes' ? 'producer-confirmed' : null
    await admin.from('claims').update({ method_label: method }).eq('id', pc.claim_id)
    // Fire-and-forget: the artist's bell must ring when a producer replies
    // (flow-gap K — this event previously notified no one), and an unqualified
    // "yes" is the canonical claim_confirmed funnel event. Neither may ever
    // block the ceremony itself.
    if (pc.artist_id) {
      try {
        await notifyArtistOwner(pc.artist_id, {
          type: 'claim_confirmed',
          body: en.notifications.claimConfirmed,
          link: '/artist/home',
        })
        if (response === 'yes') {
          await admin.from('analytics_event').insert({
            event_name: 'claim_confirmed',
            properties: { artist_id: pc.artist_id, claim_id: pc.claim_id },
          })
        }
      } catch (e) { console.error('[confirm-notify]', e) }
    }

    // P1-1 — notify the artist owner a producer confirmation arrived (best-effort,
    // never blocks the response). Server has no user-language preference to read,
    // so the body is authored in English (T.notifications.confirmationArrived).
    const { data: claimRow } = await admin.from('claims').select('value, claim_type').eq('id', pc.claim_id).maybeSingle()
    const claimText = claimRow?.value || claimRow?.claim_type || 'your claim'
    notifyArtistOwner(pc.artist_id, {
      type: 'confirmation_arrived',
      body: en.notifications.confirmationArrived(claimText),
      link: '/artist/claims',
    })

    res.json({ ok: true, response })
  } catch (e) {
    console.error('[confirm-post]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// Local dev listens on a port; on Vercel the app is imported by api/index.js
// as a serverless function (VERCEL=1 is set automatically there), so skip listen.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[gigproof api] http://localhost:${PORT}  (ai: ${ANTHROPIC_KEY ? 'configured' : 'mock'}, supabase: ${admin ? 'on' : 'off'})`)
  })
}

export default app
