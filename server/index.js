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
import { createClaimProcessor } from '../src/lib/ai/index.js'

dotenv.config({ path: '.env.local' })

const PORT = process.env.API_PORT || 8787
const SUPA_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'

const admin = SUPA_URL && SERVICE_KEY ? createClient(SUPA_URL, SERVICE_KEY) : null

// Single processor instance: StubClaimProcessor (no key) or AnthropicClaimProcessor (key set).
// Callers never reference the concrete class — only the AiClaimProcessor interface.
const processor = createClaimProcessor(ANTHROPIC_KEY, MODEL)

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// ──────────────────────────────────────────────────────────
// GET /api/health
// ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabase: Boolean(admin), ai: ANTHROPIC_KEY ? 'live' : 'mock', model: MODEL })
})

// ──────────────────────────────────────────────────────────
// POST /api/process-evidence { artistId }
// Reads submitted evidence, labels each via AiClaimProcessor, writes Claims.
// ──────────────────────────────────────────────────────────
app.post('/api/process-evidence', async (req, res) => {
  try {
    if (!admin) {
      return res.status(400).json({
        error: 'Supabase not configured. Add VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env.local.',
      })
    }
    const { artistId } = req.body || {}
    if (!artistId) return res.status(400).json({ error: 'artistId required' })

    const { data: evidence, error: evErr } = await admin
      .from('evidence_artifacts')
      .select('*')
      .eq('artist_id', artistId)
      .eq('status', 'submitted')
    if (evErr) throw evErr

    const claims = []
    for (const ev of evidence ?? []) {
      const labelled = await processor.label(ev)
      const claim = {
        artist_id: artistId,
        evidence_id: ev.id,
        claim_type: labelled.claim_type || 'claim',
        value: labelled.value || ev.value || null,
        source_type: ev.source_type,
        verification_status: labelled.status,
        verified_by: 'system',
        verified_at: new Date().toISOString(),
        visibility: ['verified', 'supporting'].includes(labelled.status) ? 'passport-ok' : 'mirror-only',
        extraction_method: ANTHROPIC_KEY ? 'anthropic' : 'mock',
        model_version: ANTHROPIC_KEY ? MODEL : 'mock-v1',
        reason_code: labelled.reason || null,
      }
      const { data: inserted } = await admin.from('claims').insert(claim).select().single()
      claims.push(inserted)
      await admin.from('evidence_artifacts').update({ status: 'processed' }).eq('id', ev.id)
    }
    res.json({ processed: claims.length, ai: ANTHROPIC_KEY ? 'live' : 'mock', claims })
  } catch (e) {
    console.error('[process-evidence]', e)
    res.status(500).json({ error: String(e.message || e) })
  }
})

// ──────────────────────────────────────────────────────────
// GET /api/passport/:artistId
// Server-enforced FIREWALL: returns ONLY published, passport-ok, safe fields.
// Physically cannot return score, percentile, exact head-count, gaps,
// internal_confidence, or any mirror-only / private value.
// The Passport page reads from here — UI hiding alone is NOT enough.
// ──────────────────────────────────────────────────────────
app.get('/api/passport/:artistId', async (req, res) => {
  try {
    if (!admin) {
      return res.status(503).json({ error: 'Supabase admin client not configured.' })
    }
    const { artistId } = req.params

    // Explicit column list = the physical firewall.
    // Adding a score/exact-count column to the DB would NOT leak here.
    const { data: artist, error: aErr } = await admin
      .from('artists')
      .select(
        'id, stage_name, name, genre, city, photo_url, one_line, regions, set_length, ' +
        'invoice_ready, music_links, lineup_frequency_band, sells_tickets, price_band, community_size_band'
      )
      .eq('id', artistId)
      .eq('published', true)
      .maybeSingle()
    if (aErr) throw aErr
    if (!artist) return res.status(404).json({ error: 'Artist not published.' })

    const { data: items, error: iErr } = await admin
      .from('profile_items')
      .select('id, item_type, title, detail, item_date, public_url, source_status')
      .eq('artist_id', artistId)
      .eq('visibility', 'passport-ok')
      .order('created_at', { ascending: false })
    if (iErr) throw iErr

    // Claims: passport-ok + verified/supporting only. No internal_confidence/model_version/extraction_method.
    const { data: claims, error: cErr } = await admin
      .from('claims')
      .select('id, claim_type, value, source_type, verification_status, reason_code')
      .eq('artist_id', artistId)
      .eq('visibility', 'passport-ok')
      .in('verification_status', ['verified', 'supporting'])
      .order('created_at', { ascending: false })
    if (cErr) throw cErr

    res.json({ artist, items: items ?? [], claims: claims ?? [] })
  } catch (e) {
    console.error('[passport]', e)
    res.status(500).json({ error: String(e.message || e) })
  }
})

app.listen(PORT, () => {
  console.log(`[gigproof api] http://localhost:${PORT}  (ai: ${ANTHROPIC_KEY ? 'live' : 'mock'}, supabase: ${admin ? 'on' : 'off'})`)
})
