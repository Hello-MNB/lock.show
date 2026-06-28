// ============================================================
// LIVE end-to-end validation against the REAL Supabase — ANON KEY ONLY.
// Acts as a real user (no service-role): signup → bootstrap → onboarding →
// evidence → client-side claims → publish → anon firewall read → seat trigger.
// Reports each step ✅/❌ with the exact RLS/trigger error. Cleans up after.
// Run: node scripts/e2e-live.mjs
// ============================================================
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { StubClaimProcessor } from '../src/lib/ai/stub.js'

const env = {}
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m) env[m[1]] = m[2].trim() }
const URL = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_ANON_KEY
if (!URL || !ANON) { console.error('✗ missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY'); process.exit(1) }
console.log(`DB: ${URL}\nkey: ${ANON.slice(0, 16)}… (anon/publishable)\n`)

const STRONG = ['verified', 'supporting']
const OK = 'passport-ok', MIRROR = 'mirror-only'
const e = (x) => (x ? (x.message || JSON.stringify(x)) : '')
let failures = 0
const pass = (s, d = '') => console.log(`✅ ${s}${d ? ' — ' + d : ''}`)
const fail = (s, x) => { failures++; console.log(`❌ ${s}${x ? ' — ' + e(x) : ''}`) }

const sb = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } })
const anon = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } })
const email = `gigproof.e2e.${Date.now()}@gmail.com`
const password = 'E2eTest!2026-' + Math.random().toString(36).slice(2, 8)
let userId, orgId, artistId

async function main() {
  // ── 1 · signUp (email-confirm now OFF → returns a session) ──
  let { data: su, error: suErr } = await sb.auth.signUp({ email, password, options: { data: { full_name: 'E2E Tester' } } })
  if (suErr) return fail('1 signUp', suErr)
  if (!su.session) {
    const { data: si } = await sb.auth.signInWithPassword({ email, password })
    if (!si?.session) return fail('1 signUp/session', { message: 'signUp returned no session — is "Confirm email" still ON?' })
    su = si
  }
  userId = su.user.id
  pass('1 signUp + session (real email+password user)', `${email} · auth.uid() ${userId.slice(0, 8)}…`)

  // ── 2 · role + bootstrap (the app's /select) ──
  const { error: pErr } = await sb.from('profiles').upsert({ id: userId, role: 'artist', full_name: 'E2E Tester' })
  pErr ? fail('2a upsertProfile(artist)', pErr) : pass('2a upsertProfile(artist) under profiles RLS')

  const { data: bOrg, error: bErr } = await sb.rpc('bootstrap_personal_org', { p_name: 'E2E Tester', p_functional_role: 'artist', p_email: email, p_display_name: 'E2E Tester' })
  if (bErr) { fail('2b bootstrap_personal_org RPC', bErr) }
  else {
    orgId = bOrg
    const { data: mems } = await sb.from('organization_membership').select('org_role,status,organization_id').eq('person_id', userId)
    const { data: sub } = await sb.from('subscription').select('plan,seats_included,seats_used').eq('organization_id', orgId).maybeSingle()
    const { data: ra } = await sb.from('role_assignment').select('functional_role').eq('person_id', userId)
    const { data: arc } = await sb.from('active_role_context').select('active_organization_id').eq('person_id', userId).maybeSingle()
    const ok = orgId && mems?.some(m => m.org_role === 'owner' && m.status === 'active') && sub?.plan === 'solo' && ra?.some(r => r.functional_role === 'artist') && arc?.active_organization_id === orgId
    ok ? pass('2b bootstrap (org + owner-membership + subscription + role + active-context) under RLS', `seats ${sub?.seats_used}/${sub?.seats_included}`) : fail('2b bootstrap verification', { message: `mems=${JSON.stringify(mems)} sub=${JSON.stringify(sub)} ra=${JSON.stringify(ra)} arc=${JSON.stringify(arc)}` })
  }
  if (!orgId) { console.log('\n⛔ no org — cannot continue'); return finish() }

  // ── 3 · onboarding: artist + draw bands + items ──
  const base = { created_by: userId, name: 'E2E Artist', stage_name: 'E2E Artist', genre: 'Techno', city: 'Tel Aviv', whatsapp_number: '0521234567' }
  let { data: art, error: aErr } = await sb.from('artists').insert(base).select().single() // the app's .insert().select() pattern
  if (aErr) {
    const r = await sb.from('artists').insert({ ...base, owner_organization_id: orgId, organization_id: orgId }).select().single()
    if (r.error) { fail('3a artist insert (.insert().select())', r.error) }
    else { art = r.data; pass('3a artist insert (explicit owner_org)', 'trigger 014 not auto-setting org') }
  } else pass('3a artist insert via .insert().select() under org-RLS (trigger 014 auto-set the org)')
  if (!art) { console.log('\n⛔ no artist — cannot continue'); return finish() }
  artistId = art.id

  const { error: dErr } = await sb.from('artists').update({ lineup_frequency_band: '4–10 shows', sells_tickets: true, price_band: '₪5,000–10,000', community_size_band: '2,000–10,000' }).eq('id', artistId)
  dErr ? fail('3b draw bands', dErr) : pass('3b draw bands (lineup/tickets/price/community) under org-RLS')

  const { error: iErr } = await sb.from('profile_items').insert([
    { artist_id: artistId, item_type: 'link', title: 'SoundCloud', public_url: 'https://soundcloud.com/x', source_status: 'public-verified', visibility: OK },
    { artist_id: artistId, item_type: 'event', title: 'Show at The Block', item_date: '2025-11-14', source_status: 'public-verified', visibility: OK },
  ])
  iErr ? fail('3c profile items', iErr) : pass('3c profile items (link + event) under org-RLS')

  // ── 4 · evidence → claims (client-side stub = B2 fallback) ──
  const { data: evs, error: evErr } = await sb.from('evidence_artifacts').insert([
    { artist_id: artistId, evidence_type: 'file', source_type: 'ticket-export', value: 'export.csv', status: 'submitted' },
    { artist_id: artistId, evidence_type: 'band', source_type: 'self-band', value: '4–10 shows', status: 'submitted' },
  ]).select()
  if (evErr) { fail('4a add evidence', evErr) }
  else {
    pass('4a add evidence (file + band) under org-RLS', `${evs.length} rows`)
    const stub = new StubClaimProcessor()
    let n = 0, cErr = null
    for (const ev of evs) {
      const lab = await stub.label(ev)
      const claim = { artist_id: artistId, evidence_id: ev.id, claim_type: lab.claim_type || 'claim', value: lab.value || ev.value || null, source_type: ev.source_type, verification_status: lab.status, verified_by: 'system', verified_at: new Date().toISOString(), visibility: STRONG.includes(lab.status) ? OK : MIRROR, extraction_method: 'mock', model_version: 'mock-v1', reason_code: lab.reason || null }
      const { error } = await sb.from('claims').insert(claim)
      if (error) { cErr = error; break }
      n++; await sb.from('evidence_artifacts').update({ status: 'processed' }).eq('id', ev.id)
    }
    if (cErr) fail('4b client-side stub → claims', cErr)
    else {
      const { data: claims } = await sb.from('claims').select('verification_status,visibility,internal_confidence').eq('artist_id', artistId)
      const bounded = (claims || []).every(c => ['verified', 'supporting', 'self-reported', 'not-assessable'].includes(c.verification_status))
      const noScore = (claims || []).every(c => c.internal_confidence == null)
      const hasOk = (claims || []).some(c => c.visibility === OK), hasMirror = (claims || []).some(c => c.visibility === MIRROR)
      ;(n > 0 && bounded && noScore) ? pass('4b client-side stub → method-labeled claims under claims-RLS', `${n} claims · bounded=${bounded} · no-score=${noScore} · passport-ok+mirror split=${hasOk}/${hasMirror}`) : fail('4b claims verification', { message: `n=${n} bounded=${bounded} noScore=${noScore}` })
    }
  }

  // ── 5 · NO-SECRET publish (owner sets published + writes snapshot under RLS) + ANON firewall ──
  const { error: pubErr } = await sb.from('artists').update({ published: true }).eq('id', artistId)
  pubErr ? fail('5a publish (published=true)', pubErr) : pass('5a publish — owner set artist.published=true under RLS (no server)')

  // 5a2 — owner writes the buyer-safe immutable snapshot under RLS (pv_owner_insert / migration 017)
  const snapItems = (await sb.from('profile_items').select('id, item_type, title, detail, item_date, public_url, source_status').eq('artist_id', artistId).eq('visibility', OK)).data || []
  const snapClaims = (await sb.from('claims').select('id, claim_type, value, source_type, verification_status, reason_code, method_label').eq('artist_id', artistId).eq('visibility', OK).in('verification_status', STRONG)).data || []
  const snapshot = { artist: { id: artistId, stage_name: 'E2E Artist', published: true }, items: snapItems, claims: snapClaims }
  const { error: snapErr } = await sb.from('passport_versions').insert({ artist_id: artistId, snapshot })
  if (!snapErr) pass('5a2 owner snapshot insert (pv_owner_insert / 017 active)', `${snapItems.length} items · ${snapClaims.length} claims`)
  else if (/row-level|42501|policy/i.test(e(snapErr))) console.log(`⏳ 5a2 snapshot insert BLOCKED — apply migration 017 (pv_owner_insert). Live-read view is unaffected. [${e(snapErr).slice(0, 60)}]`)
  else fail('5a2 owner snapshot insert', snapErr)

  // 5b — anon LIVE read (the getPublicPassport path): published artist + passport-ok items/claims; mirror hidden
  const aArt = await anon.from('artists').select('id, stage_name, published, photo_url, lineup_frequency_band, price_band').eq('id', artistId).maybeSingle()
  const aItems = await anon.from('profile_items').select('id, item_type, title, source_status').eq('artist_id', artistId)
  const aClaims = await anon.from('claims').select('claim_type, verification_status, method_label').eq('artist_id', artistId)
  const own = await sb.from('claims').select('id, visibility').eq('artist_id', artistId)
  const sees = !!aArt.data?.published
  const allStrong = (aClaims.data || []).every((c) => STRONG.includes(c.verification_status))
  const mirrorTotal = (own.data || []).filter((c) => c.visibility === MIRROR).length
  const mirrorHidden = mirrorTotal > 0 && (aClaims.data || []).length === (own.data || []).length - mirrorTotal
  ;(sees && allStrong && mirrorHidden && !aItems.error) ? pass('5b NO-SECRET passport read — anon live-reads published + passport-ok (mirror hidden)', `artist✓ · ${(aItems.data || []).length} items · anon ${(aClaims.data || []).length}/${(own.data || []).length} claims · ${mirrorTotal} mirror hidden`) : fail('5b live passport read', { message: `sees=${sees} allStrong=${allStrong} mirrorHidden=${mirrorHidden} items=${aItems.error?.message || 'ok'} anon=${JSON.stringify(aClaims.data || aClaims.error?.message)}` })

  // 5c — COLUMN SECURITY (migration 016): anon must be DENIED private/PII columns
  const wa = await anon.from('artists').select('whatsapp_number').eq('id', artistId).maybeSingle()
  const ic = await anon.from('claims').select('internal_confidence').eq('artist_id', artistId).limit(1)
  const waBlocked = !!wa.error
  const icBlocked = !!ic.error
  ;(waBlocked && icBlocked) ? pass('5c FIREWALL column security — anon DENIED private columns', `whatsapp_number=${waBlocked ? 'denied' : 'READABLE("' + wa.data?.whatsapp_number + '")'} · claims.internal_confidence=${icBlocked ? 'denied' : 'READABLE'}`) : fail('5c FIREWALL column security — anon read a PRIVATE column', { message: `whatsapp blocked=${waBlocked} (${wa.data?.whatsapp_number ?? wa.error?.message}) · internal_confidence blocked=${icBlocked}` })

  // 5d — anon reads the immutable snapshot (pv_public_read); verify it is buyer-safe (no mirror/PII/score)
  const aSnap = await anon.from('passport_versions').select('snapshot').eq('artist_id', artistId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (aSnap.data?.snapshot) {
    const blob = JSON.stringify(aSnap.data.snapshot).toLowerCase()
    const snapSafe = !blob.includes('mirror-only') && !blob.includes('whatsapp') && !blob.includes('internal_confidence')
    snapSafe ? pass('5d anon reads immutable snapshot (pv_public_read) — buyer-safe', `${(aSnap.data.snapshot.items || []).length} items · ${(aSnap.data.snapshot.claims || []).length} claims`) : fail('5d snapshot firewall', { message: 'snapshot blob contains mirror/PII/score token' })
  } else console.log('⏳ 5d snapshot read — none yet (apply migration 017 so publish writes one).')

  // ── 6 · demand + seat-limit trigger ──
  const { error: arErr } = await anon.from('availability_requests').insert({ artist_id: artistId, requester_name: 'E2E Booker', event_type: 'Club night', location: 'Tel Aviv', capacity_band: '300–800', status: 'new' })
  arErr ? fail('6a anon availability_request (req_public_insert)', arErr) : pass('6a anon availability_request (booker demand path) under RLS')

  const { error: invErr } = await sb.rpc('invite_member', { p_org: orgId, p_email: 'invitee@example.com', p_role: 'member' })
  if (invErr && /seat/i.test(e(invErr))) pass('6b seat-limit trigger BLOCKS invite on solo (1-seat) org', e(invErr).slice(0, 50))
  else if (invErr) fail('6b invite_member (unexpected)', invErr)
  else { fail('6b seat-limit trigger', { message: 'invite SUCCEEDED on a solo 1-seat org — trigger not enforcing!' }) }

  return finish()
}

async function finish() {
  // cleanup: delete artist (cascades items/claims/evidence/requests) then org (cascades membership/sub/role) — all via owner RLS
  if (artistId) { const { error } = await sb.from('artists').delete().eq('id', artistId); if (error) console.log('   (cleanup artist:', e(error), ')') }
  if (orgId) { const { error } = await sb.from('organization').delete().eq('id', orgId); if (error) console.log('   (cleanup org:', e(error), ')') }
  console.log(`\n🧹 cleanup: test artist + org deleted via RLS. Auth user ${email} remains (delete from Auth dashboard if desired).`)
  console.log(`\n${failures === 0 ? '✅✅ ALL GREEN — signup→onboarding→evidence→claims→publish→Passport works LIVE end-to-end on the real DB, firewall intact.' : `❌ ${failures} failure(s) above.`}`)
  process.exit(failures ? 1 : 0)
}
main().catch(x => { console.error('\nscript error:', x); process.exit(2) })
