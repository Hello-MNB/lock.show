// ============================================================
// LOCK SHOW — local AI / API server (port 8787).
// Keeps provider credentials server-side. Uses the AiClaimProcessor
// interface from /src/lib/ai — deterministic unless explicitly configured.
// On deploy this maps 1:1 to Vercel serverless / Supabase Edge fns.
// ============================================================
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { randomUUID, createHash } from 'node:crypto'
import { createClaimProcessorFromConfig, resolveAiProviderConfig } from '../src/lib/ai/index.js'
import { VISIBILITY, PUBLISHABLE_STATUSES } from '../src/lib/constants.js'
import { sanitizePassportPayload } from '../src/lib/passportPublicPayload.js'
import { T as en } from '../src/lib/i18n/en.js'
import { isMissingAdminAuthorityStoreError, resolveAdminCapability } from '../src/lib/adminAccess.js'
import { executeEvidenceAction } from './passportPublishPolicy.js'
import { normalizeRosterInvitation, rosterInvitationHash } from './rosterInvitePolicy.js'
import { deliverRosterInvitation } from './rosterInviteDelivery.js'

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

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

const SUPA_URL = realValue(process.env.VITE_SUPABASE_URL)
const SERVICE_KEY = realValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
const AI_ENV = {
  ...process.env,
  ANTHROPIC_API_KEY: realValue(process.env.ANTHROPIC_API_KEY),
  AI_GATEWAY_API_KEY: realValue(process.env.AI_GATEWAY_API_KEY),
  VERCEL_OIDC_TOKEN: realValue(process.env.VERCEL_OIDC_TOKEN),
}
const AI_CONFIG = resolveAiProviderConfig(AI_ENV)

const admin = SUPA_URL && SERVICE_KEY ? createClient(SUPA_URL, SERVICE_KEY) : null

// ──────────────────────────────────────────────────────────
// ABUSE CONTROLS (G14) — env-tunable, safe defaults. All in-memory (per
// serverless instance / local process): a restart resets counters, which is
// an accepted pilot-stage bound, not a persistence guarantee.
// ──────────────────────────────────────────────────────────
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN) || 30 // per IP, sliding 60s
const MAX_ITEMS_PER_JOB = Number(process.env.MAX_ITEMS_PER_JOB) || 15 // per process-evidence call
const MAX_ITEMS_PER_USER_DAY = Number(process.env.MAX_ITEMS_PER_USER_DAY) || 15 // AI items/user/day
const CONFIRM_TOKEN_TTL_DAYS = Number(process.env.CONFIRM_TOKEN_TTL_DAYS) || 14 // G15 expiry
const MAX_FIELD_CHARS = 2000 // longest accepted string field in any JSON body
// G14 monthly spend ledger — HONESTLY AN ESTIMATE, not token accounting:
// it counts this month's gig_evidence_refresh_completed rows in analytics_event
// (one per completed client processing run — an approximation of items) at
// COST_PER_ITEM_USD each. Real per-token cost accounting = P1. Persistent
// (DB-backed), unlike the in-memory daily caps above.
const COST_PER_ITEM_USD = Number(process.env.COST_PER_ITEM_USD) || 0.02
const MONTHLY_BUDGET_USD = Number(process.env.MONTHLY_BUDGET_USD) || 50 // hard cap (CFRO)
const BUDGET_ALERT_AT_USD = Number(process.env.ALERT_AT) || 25 // warn threshold

// Vercel Functions provide their short-lived OIDC credential on each request
// as x-vercel-oidc-token. Local builds may still expose VERCEL_OIDC_TOKEN as an
// environment variable. In either form the token is accepted only when
// AI_PROVIDER=vercel-gateway and a valid provider/model identifier is present.
function aiConfigForRequest(req) {
  const requestOidcToken = realValue(req?.headers?.['x-vercel-oidc-token'])
  if (!requestOidcToken) return AI_CONFIG
  return resolveAiProviderConfig({ ...AI_ENV, VERCEL_OIDC_TOKEN: requestOidcToken })
}

const app = express()

// CORS allowlist (G11-1). Origins come from ALLOWED_ORIGINS (comma-separated env);
// default = production + local dev. Requests without an Origin header (curl,
// server-to-server, same-origin) pass through — CORS only gates browsers.
const ALLOWED_ORIGINS = (realValue(process.env.ALLOWED_ORIGINS)
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : ['https://app.lock.show', 'https://lock.show', 'https://www.lock.show', 'http://localhost:5173'])
app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    return cb(null, false) // not allowlisted → no CORS headers; the browser blocks it
  },
}))
// Rate limiting (G14-1) — tiny in-memory sliding window, per IP, no new deps.
// Applied to ALL routes (public + authed). 429 {error:'rate_limited'} beyond
// RATE_LIMIT_PER_MIN requests in the trailing 60s.
const rateBuckets = new Map() // ip → timestamps (ms) inside the trailing window
function clientIp(req) {
  // Vercel / any proxy puts the caller first in x-forwarded-for; fall back to socket.
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return fwd || req.socket?.remoteAddress || 'unknown'
}
app.use((req, res, next) => {
  const now = Date.now()
  const ip = clientIp(req)
  let hits = rateBuckets.get(ip)
  if (!hits) { hits = []; rateBuckets.set(ip, hits) }
  while (hits.length && now - hits[0] > 60_000) hits.shift() // slide the window
  if (hits.length >= RATE_LIMIT_PER_MIN) return res.status(429).json({ error: 'rate_limited' })
  hits.push(now)
  // Memory bound: on pathological IP churn, sweep idle buckets.
  if (rateBuckets.size > 10_000) {
    for (const [k, v] of rateBuckets) {
      if (!v.length || now - v[v.length - 1] > 60_000) rateBuckets.delete(k)
    }
  }
  next()
})

// Schema guards (G14-2): JSON bodies capped at 100kb (every route here takes a
// tiny JSON payload — evidence FILES go client→Supabase Storage, never through
// this server), and no string field may exceed MAX_FIELD_CHARS.
app.use(express.json({ limit: '100kb' }))
function hasOverlongString(v, depth = 0) {
  if (depth > 4 || v == null) return false
  if (typeof v === 'string') return v.length > MAX_FIELD_CHARS
  if (Array.isArray(v)) return v.some((x) => hasOverlongString(x, depth + 1))
  if (typeof v === 'object') return Object.values(v).some((x) => hasOverlongString(x, depth + 1))
  return false
}
app.use((req, res, next) => {
  if (req.body && hasOverlongString(req.body)) {
    return res.status(400).json({ error: 'field_too_long', max_chars: MAX_FIELD_CHARS })
  }
  next()
})

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
    req.authUser = data.user
    next()
  } catch (e) {
    console.error('[auth]', e)
    res.status(401).json({ error: 'auth_required' })
  }
}

// The user JWT, not the service identity, crosses this RPC boundary. The DB
// selects current Workspace and rechecks membership, role, grant and versions.
function evidenceUserClient(req) {
  return createClient(SUPA_URL, SERVICE_KEY, {
    global: { headers: { Authorization: req.headers.authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
async function handleEvidenceAction(req, res, mode) {
  try {
    const result = await executeEvidenceAction(evidenceUserClient(req), req.body, mode)
    res.set('Cache-Control', 'no-store').json(result)
  } catch {
    res.status(403).json({ error: 'forbidden' })
  }
}
app.post('/api/evidence-actions/commit', requireAuth, (req, res) => handleEvidenceAction(req, res, 'commit'))
app.post('/api/evidence-actions/resolve', requireAuth, (req, res) => handleEvidenceAction(req, res, 'resolve'))
// Scanner output is an untrusted, editable preparation. The separate action
// RPC records it as candidate-only; extraction never grants verification.
app.post('/api/evidence-actions/scan', requireAuth, async (req, res) => {
  try {
    const { artistId, actId, objectId, workspaceId, contextVersion, expectedObjectVersion } = req.body || {}
    if (![artistId, actId, objectId, workspaceId].every(isUuid)) throw new Error('denied')
    const { data, error } = await evidenceUserClient(req).rpc('get_evidence_workbench', { p_artist: artistId, p_act: actId })
    const object = data?.objects?.find(item => item.id === objectId)
    if (error || !object || object.state !== 'candidate' || data.authority.workspaceId !== workspaceId
      || Number(data.authority.contextVersion) !== contextVersion || Number(object.version) !== expectedObjectVersion
      || (!data.authority.owner && !data.authority.scope.includes('upload'))) throw new Error('denied')
    if ((dailyItemCount.get(dayKey(req.userId)) || 0) >= MAX_ITEMS_PER_USER_DAY) throw new Error('denied')
    if (await monthlySpendEstimateUsd() >= MONTHLY_BUDGET_USD) throw new Error('denied')
    const config = aiConfigForRequest(req)
    const { label, method, aiFailed } = await createClaimProcessorFromConfig(config).labelWithMethod(object)
    bumpDailyCount(req.userId, 1)
    res.set('Cache-Control', 'no-store').json({ statement: label.value || object.value,
      ai: aiFailed ? 'degraded' : method === 'mock' ? 'mock' : 'live', candidateOnly: true })
  } catch { res.status(403).json({ error: 'forbidden' }) }
})
app.get('/api/evidence-actions/workbench/:artistId/:actId', requireAuth, async (req, res) => {
  try {
    if (!isUuid(req.params.artistId) || (req.params.actId !== 'current' && !isUuid(req.params.actId))) throw new Error('denied')
    const { data, error } = await evidenceUserClient(req).rpc('get_evidence_workbench', {
      p_artist: req.params.artistId, p_act: req.params.actId === 'current' ? null : req.params.actId,
    })
    if (error || !data) throw new Error('denied')
    res.set('Cache-Control', 'no-store').json(data)
  } catch { res.status(403).json({ error: 'forbidden' }) }
})

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
app.get('/api/health', (req, res) => {
  const requestAiConfig = aiConfigForRequest(req)
  // 'configured' = a plausibly-shaped provider configuration is present; it
  // does NOT claim any call succeeded or any credits are available.
  // (truthful-provenance rule: liveness is only reported per processed item).
  const ai = requestAiConfig.state === 'missing' ? 'mock' : requestAiConfig.state
  res.json({
    ok: true,
    supabase: Boolean(admin),
    ai,
    provider: requestAiConfig.provider,
    model: requestAiConfig.model,
  })
})

// ROSTER INVITATIONS — for an Artist who does not yet have a LOCK account.
// A representation workspace receives a single-use link; no Artist data or
// artist_access grant exists until the invited email signs in, owns an Artist,
// and explicitly accepts. The raw token is returned/sent once and only its
// SHA-256 hash is stored.
async function requireOrgAdmin(req, res, organizationId) {
  const { data, error } = await admin
    .from('organization_membership')
    .select('org_role, status')
    .eq('organization_id', organizationId)
    .eq('person_id', req.userId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) throw error
  if (!data || !['owner', 'admin'].includes(data.org_role)) {
    res.status(403).json({ error: 'forbidden' })
    return false
  }
  return true
}

app.post('/api/roster-invitations', requireAuth, async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'supabase_admin_unavailable' })
    let input
    try { input = normalizeRosterInvitation(req.body) } catch (error) {
      return res.status(400).json({ error: error.code || 'invalid_roster_invitation' })
    }
    if (!(await requireOrgAdmin(req, res, input.organizationId))) return

    const { data: organization, error: orgError } = await admin
      .from('organization').select('id, name').eq('id', input.organizationId).maybeSingle()
    if (orgError) throw orgError
    if (!organization) return res.status(404).json({ error: 'organization_not_found' })

    const { error: cancelError } = await admin.from('roster_invitation')
      .update({ status: 'cancelled' })
      .eq('organization_id', input.organizationId)
      .eq('invited_email', input.email)
      .eq('status', 'pending')
    if (cancelError) throw cancelError

    const token = `${randomUUID()}${randomUUID()}`.replaceAll('-', '')
    const { data: invitation, error } = await admin.from('roster_invitation').insert({
      organization_id: input.organizationId,
      invited_by: req.userId,
      invited_email: input.email,
      artist_name: input.artistName,
      scope: input.scope,
      territory: input.territory,
      token_hash: rosterInvitationHash(token),
      status: 'pending',
    }).select('id, status, expires_at').single()
    if (error) throw error

    const appOrigin = (realValue(process.env.APP_ORIGIN) || 'https://app.lock.show').replace(/\/$/, '')
    const inviteUrl = `${appOrigin}/roster-invite/${encodeURIComponent(token)}`
    const delivery = await sendRosterInviteEmail({
      to: input.email,
      artistName: input.artistName,
      organizationName: organization.name,
      inviteUrl,
    })
    return res.status(201).json({
      invitation: { id: invitation.id, status: invitation.status, expiresAt: invitation.expires_at },
      inviteUrl,
      delivery: delivery.sent ? 'sent' : 'link_only',
    })
  } catch (error) {
    console.error('[roster-invitation:create]', error)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/roster-invitations/:token', async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'supabase_admin_unavailable' })
    const token = String(req.params.token || '')
    if (!token || token.length > 256) return res.status(404).json({ error: 'roster_invitation_not_found' })
    const { data: invitation, error } = await admin.from('roster_invitation')
      .select('id, invited_email, artist_name, scope, territory, status, expires_at, organization:organization_id(name)')
      .eq('token_hash', rosterInvitationHash(token)).maybeSingle()
    if (error) throw error
    if (!invitation) return res.status(404).json({ error: 'roster_invitation_not_found' })
    if (invitation.status !== 'pending') return res.status(410).json({ error: 'roster_invitation_unavailable' })
    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      await admin.from('roster_invitation').update({ status: 'expired' }).eq('id', invitation.id)
      return res.status(410).json({ error: 'roster_invitation_expired' })
    }
    return res.json({
      organizationName: invitation.organization?.name || 'LOCK SHOW',
      artistName: invitation.artist_name,
      invitedEmail: invitation.invited_email,
      scope: invitation.scope,
      territory: invitation.territory,
      status: invitation.status,
      expiresAt: invitation.expires_at,
    })
  } catch (error) {
    console.error('[roster-invitation:read]', error)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/roster-invitations/:token/accept', requireAuth, async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'supabase_admin_unavailable' })
    const token = String(req.params.token || '')
    const { data: invitation, error: inviteError } = await admin.from('roster_invitation')
      .select('id, invited_email, status, expires_at')
      .eq('token_hash', rosterInvitationHash(token)).maybeSingle()
    if (inviteError) throw inviteError
    if (!invitation) return res.status(404).json({ error: 'roster_invitation_not_found' })
    if (invitation.status !== 'pending') return res.status(409).json({ error: 'roster_invitation_not_pending' })
    if (new Date(invitation.expires_at).getTime() <= Date.now()) return res.status(410).json({ error: 'roster_invitation_expired' })
    if (String(req.authUser?.email || '').toLowerCase() !== invitation.invited_email) {
      return res.status(403).json({ error: 'roster_invitation_email_mismatch' })
    }

    const requestedArtistId = String(req.body?.artistId || '').trim()
    let artist
    if (requestedArtistId) {
      const result = await admin.from('artists').select('id, stage_name').eq('id', requestedArtistId).eq('created_by', req.userId).maybeSingle()
      if (result.error) throw result.error
      artist = result.data
      if (!artist) return res.status(403).json({ error: 'roster_invitation_artist_forbidden' })
    } else {
      const result = await admin.from('artists').select('id, stage_name').eq('created_by', req.userId).order('created_at')
      if (result.error) throw result.error
      if (!result.data?.length) return res.status(409).json({ error: 'artist_profile_required' })
      if (result.data.length > 1) return res.status(409).json({ error: 'artist_selection_required', artists: result.data })
      artist = result.data[0]
    }

    const { data: accessId, error } = await admin.rpc('accept_roster_invitation', {
      p_invitation: invitation.id,
      p_user: req.userId,
      p_artist: artist.id,
    })
    if (error) throw error
    return res.json({
      ok: true,
      receipt: {
        id: randomUUID(), action: 'roster_invitation_accepted', status: 'active',
        artistId: artist.id, accessId, at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[roster-invitation:accept]', error)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/roster-invitations/:token/decline', requireAuth, async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'supabase_admin_unavailable' })
    const token = String(req.params.token || '')
    const { data: invitation, error } = await admin.from('roster_invitation')
      .select('id, invited_email, status, expires_at')
      .eq('token_hash', rosterInvitationHash(token)).maybeSingle()
    if (error) throw error
    if (!invitation) return res.status(404).json({ error: 'roster_invitation_not_found' })
    if (invitation.status !== 'pending') return res.status(409).json({ error: 'roster_invitation_not_pending' })
    if (new Date(invitation.expires_at).getTime() <= Date.now()) return res.status(410).json({ error: 'roster_invitation_expired' })
    if (String(req.authUser?.email || '').toLowerCase() !== invitation.invited_email) {
      return res.status(403).json({ error: 'roster_invitation_email_mismatch' })
    }
    const { error: updateError } = await admin.from('roster_invitation')
      .update({ status: 'declined' }).eq('id', invitation.id).eq('status', 'pending')
    if (updateError) throw updateError
    return res.json({
      ok: true,
      receipt: { id: randomUUID(), action: 'roster_invitation_declined', status: 'declined', at: new Date().toISOString() },
    })
  } catch (error) {
    console.error('[roster-invitation:decline]', error)
    return res.status(500).json({ error: 'server_error' })
  }
})

// GET /api/admin/capability?environment=production
// Fresh, server-side preflight for the private Admin control plane. The browser
// receives no membership list and cannot infer authority from email, route,
// profile role, local storage or stale JWT metadata.
app.get('/api/admin/capability', requireAuth, async (req, res) => {
  try {
    const requestedEnvironment = String(req.query.environment || 'production')
    if (!['production', 'preview', 'staging', 'development'].includes(requestedEnvironment)) {
      return res.status(400).json({ allowed: false, reason: 'invalid_environment' })
    }
    const { data, error } = await admin
      .from('environment_admin_membership')
      .select('environment_id, status, capabilities, expires_at')
      .eq('person_id', req.userId)
    if (error) {
      if (isMissingAdminAuthorityStoreError(error)) {
        return res.status(503).json({ allowed: false, reason: 'authority_store_unavailable' })
      }
      throw error
    }
    const result = resolveAdminCapability({
      memberships: data || [],
      requestedEnvironment,
      now: new Date(),
    })
    if (!result.allowed) return res.status(403).json(result)
    return res.json(result)
  } catch (e) {
    console.error('[admin-capability]', e)
    return res.status(503).json({ allowed: false, reason: 'preflight_failed' })
  }
})

// AI-spend caps (G14-3) — per-user daily counter, in-memory. Key = userId + UTC
// day; stale (non-today) keys are swept on write so the map never grows past
// one day's active users.
const dailyItemCount = new Map() // `${userId}:${YYYY-MM-DD}` → AI items processed today
const dayKey = (userId) => `${userId}:${new Date().toISOString().slice(0, 10)}`
function bumpDailyCount(userId, n) {
  const key = dayKey(userId)
  dailyItemCount.set(key, (dailyItemCount.get(key) || 0) + n)
  const today = key.slice(-10)
  for (const k of dailyItemCount.keys()) if (!k.endsWith(today)) dailyItemCount.delete(k)
}

// G14 spend ledger (see constants above): estimated month-to-date AI spend from
// the persistent analytics_event table via the service client. Throws only on a
// query error — the caller decides whether to fail open or closed.
async function monthlySpendEstimateUsd() {
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const { count, error } = await admin
    .from('analytics_event')
    .select('id', { count: 'exact', head: true })
    .eq('event_name', 'gig_evidence_refresh_completed')
    .gte('created_at', monthStart.toISOString())
  if (error) throw error
  return (count || 0) * COST_PER_ITEM_USD
}

// Dedup basis (G14-4): evidence_artifacts has no stored hash column, but its
// content IS derivable — value + public_url + file_url are the exact inputs the
// AI labels. sha256 over them identifies "same evidence content" for an artist.
// Rows with none of the three (nothing to label from) get no hash → never deduped.
function evidenceHash(ev) {
  const basis = [ev.value, ev.public_url, ev.file_url].filter(Boolean).join('\n')
  return basis ? createHash('sha256').update(basis).digest('hex') : null
}

// ──────────────────────────────────────────────────────────
// POST /api/process-evidence { artistId }
// Reads submitted evidence, labels each via AiClaimProcessor, writes Claims.
// G14 caps: MAX_ITEMS_PER_JOB per call · MAX_ITEMS_PER_USER_DAY per user ·
// content-hash dedup against this artist's already-processed evidence.
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

    const requestAiConfig = aiConfigForRequest(req)
    const requestProcessor = createClaimProcessorFromConfig(requestAiConfig)

    // 'error' items (a previous terminal AI failure — see below) are retryable here.
    const { data: evidence, error: evErr } = await admin
      .from('evidence_artifacts')
      .select('*')
      .eq('artist_id', artistId)
      .in('status', ['submitted', 'error'])
    if (evErr) throw evErr
    // Managed candidates only use the versioned KU03 Scanner/preparation path.
    // The historical batch must not bypass its action history or Act boundary.
    if ((evidence || []).some(ev => ev.ku03_state && ev.ku03_state !== 'legacy')) {
      return res.status(403).json({ error: 'forbidden' })
    }

    // Dedup (G14-4): skip pending items whose content hash was already processed
    // for THIS artist (cross-batch: compare against processed rows in the DB;
    // in-batch: the same Set catches duplicates inside this request).
    const { data: doneRows, error: doneErr } = await admin
      .from('evidence_artifacts')
      .select('value, public_url, file_url')
      .eq('artist_id', artistId)
      .eq('status', 'processed')
    if (doneErr) throw doneErr
    const seen = new Set((doneRows ?? []).map(evidenceHash).filter(Boolean))
    const candidates = []
    const duplicates = []
    for (const ev of evidence ?? []) {
      const h = evidenceHash(ev)
      if (h && seen.has(h)) { duplicates.push(ev); continue }
      if (h) seen.add(h)
      candidates.push(ev)
    }

    // Per-request cap (G14-3a): reject the batch outright rather than silently
    // truncating — the caller sees exactly why nothing was processed.
    if (candidates.length > MAX_ITEMS_PER_JOB) {
      return res.status(400).json({ error: 'too_many_items', max: MAX_ITEMS_PER_JOB, pending: candidates.length })
    }
    // Per-user daily cap (G14-3b).
    const usedToday = dailyItemCount.get(dayKey(req.userId)) || 0
    if (usedToday + candidates.length > MAX_ITEMS_PER_USER_DAY) {
      return res.status(429).json({ error: 'daily_limit_reached', max: MAX_ITEMS_PER_USER_DAY, used: usedToday })
    }

    // Monthly budget (G14 spend ledger — an ESTIMATE, see monthlySpendEstimateUsd):
    // >= MONTHLY_BUDGET_USD → hard 429; >= BUDGET_ALERT_AT_USD → warn + flag the
    // response. A ledger-query failure fails OPEN with a warning (an analytics
    // hiccup must not brick the artist's core loop) — the in-memory daily caps
    // above still bound the damage.
    let budgetAlert = false
    try {
      const spentUsd = await monthlySpendEstimateUsd()
      if (spentUsd >= MONTHLY_BUDGET_USD) {
        console.warn(`[budget] monthly AI budget reached: ~$${spentUsd.toFixed(2)} >= $${MONTHLY_BUDGET_USD} — rejecting`)
        return res.status(429).json({ error: 'monthly_budget_reached' })
      }
      if (spentUsd >= BUDGET_ALERT_AT_USD) {
        budgetAlert = true
        console.warn(`[budget] monthly AI spend estimate ~$${spentUsd.toFixed(2)} passed the $${BUDGET_ALERT_AT_USD} alert threshold (hard cap $${MONTHLY_BUDGET_USD})`)
      }
    } catch (e) {
      console.warn('[budget] spend estimate unavailable (failing open):', e?.message || e)
    }

    // Duplicates never reach the AI: mark them processed WITHOUT a new claim —
    // the identical content already produced this artist's claim earlier.
    for (const dup of duplicates) {
      await admin.from('evidence_artifacts').update({ status: 'processed' }).eq('id', dup.id)
    }

    const claims = []
    for (const ev of candidates) {
      // TRUTHFUL PROVENANCE (G12): labelWithMethod reports the ACTUAL execution
      // path — a named provider method only when the API call succeeded,
      // 'deterministic_fallback'
      // when the stub ran after a terminal API failure, 'mock' when no key is set.
      const { label: labelled, method, aiFailed } = await requestProcessor.labelWithMethod(ev)

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
        model_version: ['anthropic', 'vercel_gateway'].includes(method) ? requestAiConfig.model : 'mock-v1',
        reason_code: labelled.reason || null,
      }
      const { data: inserted } = await admin.from('claims').insert(claim).select().single()
      claims.push(inserted)
      // Terminal AI failure → schema status 'error' (visible + retryable),
      // not a silent 'processed' that masquerades the stub label as done.
      await admin.from('evidence_artifacts')
        .update({ status: aiFailed ? 'error' : 'processed' }).eq('id', ev.id)
    }

    // Count this batch against the caller's daily AI budget (G14-3b).
    if (claims.length) bumpDailyCount(req.userId, claims.length)

    // Response reports the REAL per-item methods (each claim row carries its
    // extraction_method) plus a truthful summary — never key-presence.
    const methods = claims.reduce((acc, c) => {
      const m = c?.extraction_method || 'unknown'
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {})
    const ai = requestAiConfig.state === 'missing' ? 'mock' : (methods.deterministic_fallback ? 'degraded' : 'live')
    res.json({ processed: claims.length, deduped: duplicates.length, ai, methods, claims, budget_alert: budgetAlert })
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
    .select('id, claim_type, value, source_type, verification_status, method_label, expires_at')
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
  return sanitizePassportPayload({ artist: { ...artist, published: true }, items: items ?? [], claims: safeClaims })
}

// ──────────────────────────────────────────────────────────
// POST /api/publish/:artistId
// Artist action: write an IMMUTABLE buyer-safe snapshot + mark published.
// The public Passport reads the snapshot, so later visibility edits don't
// silently change what a buyer already saw until the artist re-publishes.
// ──────────────────────────────────────────────────────────
app.post('/api/publish/:artistId', requireAuth, async (req, res) => {
  if (req.body?.artistId !== req.params.artistId || !['publish', 'replace'].includes(req.body?.action)) {
    return res.status(403).json({ error: 'forbidden' })
  }
  return handleEvidenceAction(req, res, 'commit')
})

// ──────────────────────────────────────────────────────────
// GET /api/passport/:artistId
// Reads the immutable snapshot (not live claims). Current publish state
// still gates visibility, so un-publish hides the page immediately.
// ──────────────────────────────────────────────────────────
app.get('/api/passport/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params
    if (!isUuid(artistId)) return res.status(404).json({ error: 'Artist not published.' })
    if (!admin) {
      return res.status(503).json({ error: 'Supabase admin client not configured.' })
    }

    // Live publish flag gates visibility even though we serve a snapshot.
    const { data: pub, error: pErr } = await admin
      .from('artists').select('id, published').eq('id', artistId).maybeSingle()
    if (pErr) throw pErr
    if (!pub || !pub.published) return res.status(404).json({ error: 'Artist not published.' })

    // Prefer the immutable snapshot written at publish time.
    const { data: snap, error: sErr } = await admin
      .from('passport_versions')
      .select('snapshot,ku03_audience,ku03_purpose,ku03_expires_at,ku03_object_id')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (sErr) throw sErr
    if (snap?.ku03_object_id) {
      const token = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')?.[1]
      const identity = token ? await admin.auth.getUser(token) : null
      if (!identity?.data?.user || identity.data.user.id !== snap.ku03_audience
        || req.query.purpose !== snap.ku03_purpose || Date.parse(snap.ku03_expires_at) <= Date.now()) {
        return res.status(404).json({ error: 'Artist not published.' })
      }
      const { data: source, error: sourceError } = await admin.from('evidence_artifacts')
        .select('ku03_state,ku03_rights,ku03_visibility,ku03_conflict').eq('id', snap.ku03_object_id).maybeSingle()
      if (sourceError || !source || source.ku03_state !== 'confirmed' || !source.ku03_rights
        || !source.ku03_visibility || source.ku03_conflict) return res.status(404).json({ error: 'Artist not published.' })
    }
    if (snap?.snapshot) return res.set('Cache-Control', 'private, no-store').json(sanitizePassportPayload(snap.snapshot))

    // A published flag without a version is an inconsistent legacy state. Never
    // rebuild from live RADAR: that would bypass the owner's exact preview.
    return res.status(409).json({ error: 'passport_snapshot_missing' })
  } catch (e) {
    console.error('[passport]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// POST /api/unpublish/:artistId
// Owner-controlled revocation. The immutable history remains private/auditable,
// while the live publish gate closes immediately for every new recipient read.
app.post('/api/unpublish/:artistId', requireAuth, async (req, res) => {
  if (req.body?.artistId !== req.params.artistId || req.body?.action !== 'withdraw') {
    return res.status(403).json({ error: 'forbidden' })
  }
  return handleEvidenceAction(req, res, 'commit')
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
    // Idempotency (G14): one identical signal (artist+type) per session key per
    // 24h. Session key = optional client sessionId (the app's gp_session id),
    // else the caller's IP — hashed, so neither is stored raw. The dedup record
    // lives in analytics_event (persistent, unlike the in-memory rate buckets):
    // event_name 'professional_reaction_submitted' is in CANON + the 034 CHECK,
    // and this route is the signal's server-side reaction writer. A dedup-lookup
    // error fails open — a measurement hiccup must never block the signal.
    const sessionKey = createHash('sha256')
      .update(String(req.body?.sessionId || '').slice(0, 100) || clientIp(req))
      .digest('hex').slice(0, 32)
    const since = new Date(Date.now() - 86_400_000).toISOString()
    const { data: dup } = await admin
      .from('analytics_event')
      .select('id')
      .eq('event_name', 'professional_reaction_submitted')
      .eq('properties->>artist_id', artistId)
      .eq('properties->>signal', signal)
      .eq('properties->>session_key', sessionKey)
      .gte('created_at', since)
      .limit(1)
      .maybeSingle()
    if (dup) return res.json({ ok: true, deduped: true })
    const { error } = await admin.from('passport_signals').insert({ artist_id: artistId, signal })
    if (error) throw error
    // Persist the dedup key (best-effort — the signal itself is already recorded).
    try {
      await admin.from('analytics_event').insert({
        event_name: 'professional_reaction_submitted',
        properties: { artist_id: artistId, signal, session_key: sessionKey, via: 'passport_signal_api' },
      })
    } catch (e) { console.warn('[passport-signal] dedup record failed:', e?.message || e) }
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

// POST /api/notify { artistId, type, body, link } — notification writer.
// G11 (hardened): a logged-in user alone was NOT enough — any authenticated
// account could write arbitrary text into any artist owner's bell via the
// service role. Now the caller must either (a) OWN the target artist (writing
// to themselves), or (b) hold profiles.role='operator' (the admin console's
// payment-activated notice). Anonymous-booker request notifications go through
// POST /api/availability-request instead (server-authored body, not caller text).
// type is a CLOSED enum — anything else is rejected 403.
const NOTIFY_TYPES = ['request_received', 'confirmation_received', 'system']
async function isOperator(userId) {
  try {
    const { data } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle()
    return data?.role === 'operator'
  } catch { return false }
}
app.post('/api/notify', requireAuth, async (req, res) => {
  try {
    if (!admin) return res.status(400).json({ error: 'Supabase not configured.' })
    const { artistId, type, body, link } = req.body || {}
    if (!artistId || !type || !body) return res.status(400).json({ error: 'artistId + type + body required' })
    if (!NOTIFY_TYPES.includes(type)) return res.status(403).json({ error: 'forbidden' })
    const { data: artist, error } = await admin
      .from('artists').select('id, created_by').eq('id', artistId).maybeSingle()
    if (error) throw error
    if (!artist) return res.status(404).json({ error: 'Artist not found.' })
    const ownsTarget = artist.created_by === req.userId
    if (!ownsTarget && !(await isOperator(req.userId))) {
      return res.status(403).json({ error: 'forbidden' })
    }
    await notifyArtistOwner(artistId, { type, body, link })
    res.json({ ok: true })
  } catch (e) {
    console.error('[notify]', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ──────────────────────────────────────────────────────────
// Gate email (§14.6.5, key `email.request`) — the off-app "someone asked
// about your date" email to the artist. RULE 11: built DARK. It sends ONLY
// when BOTH process.env.EMAIL_ENABLED === '1' AND a real RESEND_API_KEY are
// present; otherwise it logs '[email] dark (flag off)' and returns without
// touching the network. The flag is OFF everywhere until the owner flips it.
// Template law (§14.6.5): {name} and {link} are the ONLY interpolations —
// requesterOrg is accepted in the signature (future per-recipient routing)
// but is NEVER inserted into subject or body (no free buyer text in email),
// and the body says THAT a buyer asked, never how many (firewall).
// EN body hardcoded verbatim from §14.6.5 (no email.* keys exist in
// en.js/he.js yet); HE body + stored-language selection land when Resend is
// wired (§14.6.3). Env vars read at CALL time so the flag governs each send.
// NOTE: brief W3-5 fixes FROM 'LOCK <hello@lock.show>'; spec §14.6.5 authors
// `LOCK <notifications@lock.show>` — EMAIL_FROM env resolves that conflict
// at wiring time without a code change.
// ──────────────────────────────────────────────────────────
function gateEmailEnabled() {
  return process.env.EMAIL_ENABLED === '1' && !!realValue(process.env.RESEND_API_KEY)
}
async function sendRosterInviteEmail({ to, artistName, organizationName, inviteUrl } = {}) {
  return deliverRosterInvitation({
    enabled: gateEmailEnabled(),
    apiKey: realValue(process.env.RESEND_API_KEY),
    from: realValue(process.env.EMAIL_FROM) || 'LOCK SHOW <hello@lock.show>',
    to,
    artistName,
    organizationName,
    inviteUrl,
  })
}
export async function sendGateEmail({ to, artistName, requesterOrg } = {}) {
  void requesterOrg // accepted, deliberately unused — see template law above
  if (!gateEmailEnabled()) {
    console.log('[email] dark (flag off)')
    return { sent: false, dark: true }
  }
  if (!to) {
    console.warn('[email] gate email skipped: no recipient')
    return { sent: false, dark: false }
  }
  const name = typeof artistName === 'string' && artistName.trim() ? artistName.trim() : 'there'
  const link = 'https://app.lock.show/artist/requests'
  const payload = {
    from: realValue(process.env.EMAIL_FROM) || 'LOCK <hello@lock.show>',
    to: [to],
    // §14.6.5 `email.request` subject (EN)
    subject: 'Someone asked about your date',
    // §14.6.5 `email.request` body (EN), verbatim; CTA "See the request" → /artist/requests
    text:
      `Hi ${name} — a booking manager just asked about your availability through your LOCK Passport. ` +
      `It's a question, not a booking or a hold. Open your Requests to see it and reply.\n\n` +
      `See the request: ${link}`,
  }
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${realValue(process.env.RESEND_API_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    console.warn('[email] resend rejected:', resp.status)
    return { sent: false, dark: false, status: resp.status }
  }
  return { sent: true, dark: false }
}

// ──────────────────────────────────────────────────────────
// POST /api/availability-request — PUBLIC (no JWT: bookers have no login).
// G11 fix for the anonymous-buyer notification: the client's direct
// availability_requests insert satisfied RLS, but its /api/notify call could
// never legitimately pass an auth/ownership gate — so artist bells went silent
// for anonymous buyers. This route creates the request AND the notification
// server-side with the service role; the notification BODY is server-authored
// (never caller-controlled free text into someone's bell). Rate-limited by the
// global per-IP limiter; schema-validated to a closed field list.
// ──────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
app.post('/api/availability-request', async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'Supabase not configured.' })
    const b = req.body || {}
    const artistId = b.artistId || b.artist_id
    const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)
    const requesterName = str(b.requester_name)
    if (!artistId || !UUID_RE.test(String(artistId)) || !requesterName) {
      return res.status(400).json({ error: 'artistId + requester_name required' })
    }
    // Closed schema — only these fields can reach the insert.
    const row = {
      artist_id: artistId,
      requester_name: requesterName,
      requester_org: str(b.requester_org),
      event_date: /^\d{4}-\d{2}-\d{2}$/.test(String(b.event_date || '')) ? b.event_date : null,
      location: str(b.location),
      capacity_band: str(b.capacity_band),
      budget_band: str(b.budget_band),
      message: str(b.message),
    }
    // Same gate as passport-signal: only a PUBLISHED artist receives requests.
    const { data: pub, error: pErr } = await admin
      .from('artists').select('id, published').eq('id', artistId).maybeSingle()
    if (pErr) throw pErr
    if (!pub || !pub.published) return res.status(404).json({ error: 'Artist not published.' })
    const { data: created, error } = await admin
      .from('availability_requests').insert(row).select().single()
    if (error) throw error
    // Artist's bell — server-authored body (EN template; server has no
    // user-language preference to read), best-effort, never blocks the request.
    await notifyArtistOwner(artistId, {
      type: 'request_received',
      body: en.notifications.newRequest(requesterName),
      link: '/artist/requests',
    })
    // §14.6.5 Gate email to the artist — fire-and-forget: never awaited on the
    // request path, never blocks or fails the response. DARK unless
    // EMAIL_ENABLED=1 + RESEND_API_KEY (rule 11). Recipient = artist owner's
    // auth email, resolved only when the flag is actually on.
    ;(async () => {
      if (!gateEmailEnabled()) { console.log('[email] dark (flag off)'); return }
      const { data: owner } = await admin
        .from('artists').select('created_by, stage_name').eq('id', artistId).maybeSingle()
      if (!owner?.created_by) return
      const { data: u } = await admin.auth.admin.getUserById(owner.created_by)
      const to = u?.user?.email
      if (!to) return
      await sendGateEmail({ to, artistName: owner.stage_name, requesterOrg: row.requester_org })
    })().catch((e) => console.warn('[email] gate send failed:', e?.message || e))
    res.json({ ok: true, request: created })
  } catch (e) {
    console.error('[availability-request]', e)
    res.status(500).json({ error: 'server_error' })
  }
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

// Token expiry (G15-1): producer_confirmations.created_at + CONFIRM_TOKEN_TTL_DAYS.
// 410 keeps the client's existing dead-link ceremony (ProducerConfirm maps
// status 410 / "expir" to its 'expired' state). NOTE (G15-3, audited): no route
// in this file ever logs the raw token — catch blocks log error objects only,
// and the minted token appears solely in the JSON response to its owner.
function confirmTokenExpired(createdAt) {
  // G15: a legacy row without created_at can't be aged — treat it as EXPIRED,
  // never immortal (fail-closed: an undatable token must not live forever).
  if (!createdAt) return true
  return Date.now() - new Date(createdAt).getTime() > CONFIRM_TOKEN_TTL_DAYS * 86_400_000
}

// GET /api/confirm/:token — producer opens the link; sees the claim + artist (safe fields only).
app.get('/api/confirm/:token', async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ error: 'Supabase admin client not configured.' })
    const { token } = req.params
    const { data: pc, error } = await admin
      .from('producer_confirmations')
      .select('id, response, revoked, responded_at, claim_id, artist_id, created_at')
      .eq('token', token).maybeSingle()
    if (error) throw error
    if (!pc) return res.status(404).json({ error: 'Invalid or expired link.' })
    if (confirmTokenExpired(pc.created_at)) return res.status(410).json({ error: 'link_expired' })
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
      .from('producer_confirmations')
      .select('id, claim_id, artist_id, response, revoked, responded_at, created_at')
      .eq('token', token).maybeSingle()
    if (error) throw error
    if (!pc) return res.status(404).json({ error: 'Invalid or expired link.' })
    if (confirmTokenExpired(pc.created_at)) return res.status(410).json({ error: 'link_expired' })

    // Single-use rule (G15-2). Verified pre-change behaviour: this route
    // OVERWROTE a recorded response on every POST. Now, once a response is on
    // record (and not revoked), a repeated response POST is idempotent — it
    // returns the recorded state and writes nothing. Two lifecycle moves stay
    // deliberately allowed because they are product features, not replays:
    // · revoke of a live yes/partial (the ceremony's own Revoke button)
    // · a fresh response AFTER a revoke (re-confirmation path)
    if (!revoke && pc.responded_at && !pc.revoked) {
      return res.json({ ok: true, response: pc.response, already_recorded: true })
    }
    if (revoke && pc.revoked) {
      return res.json({ ok: true, revoked: true, already_recorded: true })
    }

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
    const ai = AI_CONFIG.state === 'missing' ? 'mock' : AI_CONFIG.state
    console.log(`[lock show api] http://localhost:${PORT}  (ai: ${ai}, provider: ${AI_CONFIG.provider}, supabase: ${admin ? 'on' : 'off'})`)
  })
}

export default app
