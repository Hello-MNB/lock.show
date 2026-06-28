// ============================================================
// GIGPROOF — seed test users + realistic Hebrew data.
// Creates one login-capable user per persona (artist · agency ·
// booker · operator) via the Supabase Admin API, then seeds a
// published artist, an agency roster, claims, a passport snapshot,
// and sample availability requests.
//
// REQUIRES (both): the schema applied (supabase/apply_to_supabase.sql)
// and a REAL SUPABASE_SERVICE_ROLE_KEY in .env.local. The Admin API
// and RLS-bypassing writes are impossible with the anon key.
//
// Run:  npm run seed     (idempotent — safe to re-run)
// ============================================================
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

function realValue(v) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  if (/^(PASTE_|your-|YOUR-|sk-ant-\.\.\.)/i.test(s) || s.includes('YOUR-PROJECT')) return null
  return s
}

const SUPA_URL = realValue(process.env.VITE_SUPABASE_URL)
const SERVICE_KEY = realValue(process.env.SUPABASE_SERVICE_ROLE_KEY)

if (!SUPA_URL || !SERVICE_KEY) {
  console.error('\n✗ Cannot seed: missing real credentials.')
  console.error('  Set VITE_SUPABASE_URL and a real SUPABASE_SERVICE_ROLE_KEY in .env.local.')
  console.error('  (The placeholder PASTE_… service key does not work — seeding needs the Admin API.)\n')
  process.exit(1)
}

const admin = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// One shared password for every test user — easy QA.
const PASSWORD = 'Gigproof!2026'

const USERS = [
  { email: 'artist@gigproof.test',   role: 'artist',   full_name: 'נועה לוי' },
  { email: 'agency@gigproof.test',   role: 'agency',   full_name: 'אורן מזרחי' },
  { email: 'booker@gigproof.test',   role: 'booker',   full_name: 'תמר אברהם' },
  { email: 'producer@gigproof.test', role: 'producer', full_name: 'דנה כהן' },
  { email: 'operator@gigproof.test', role: 'operator', full_name: 'מאיה אופרטור' },
]

async function preflight() {
  const { error } = await admin.from('profiles').select('id').limit(1)
  if (error && (error.code === 'PGRST205' || /could not find the table/i.test(error.message || ''))) {
    console.error('\n✗ Schema not applied. Run supabase/apply_to_supabase.sql in the Supabase SQL Editor first.\n')
    process.exit(1)
  }
}

// Create the auth user, or reuse + reset its password if it already exists.
async function getOrCreateUser({ email, full_name }) {
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true, user_metadata: { full_name },
  })
  if (!error && data?.user) return data.user

  // Already registered → find it and make sure the password is known.
  for (let page = 1; page <= 20; page++) {
    const { data: list, error: lerr } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (lerr) throw lerr
    const found = list.users.find((u) => u.email === email)
    if (found) {
      await admin.auth.admin.updateUserById(found.id, { password: PASSWORD, email_confirm: true })
      return found
    }
    if (list.users.length < 200) break
  }
  throw error || new Error(`could not create or find user ${email}`)
}

// Org-first bootstrap (service-role, RLS bypassed) — mirrors bootstrap_personal_org
// for a seeded user. Idempotent: reuses an existing owned org. The agency persona
// gets a grown org (plan=agency + seats) so the roster/RADAR/seat flows are testable.
const FUNCTIONAL_ROLE = { artist: 'artist', booker: 'booker', producer: 'producer', agency: 'agency', operator: 'operator' }
async function bootstrapOrg({ userId, name, role, email }) {
  const plan = role === 'agency' ? 'agency' : 'solo'
  const seats = role === 'agency' ? 5 : 1
  await admin.from('person').upsert({ id: userId, email, display_name: name })
  const existing = (await admin.from('organization_membership')
    .select('organization_id').eq('person_id', userId).eq('org_role', 'owner').limit(1)).data?.[0]
  if (existing) return existing.organization_id
  const { data: org, error } = await admin.from('organization')
    .insert({ name, plan, created_by: userId }).select().single()
  if (error) throw error
  await admin.from('subscription').insert({ organization_id: org.id, plan, seats_included: seats, seats_used: 1, status: 'active' })
  await admin.from('organization_membership').insert({ organization_id: org.id, person_id: userId, org_role: 'owner', status: 'active', joined_at: new Date().toISOString() })
  await admin.from('role_assignment').insert({ organization_id: org.id, person_id: userId, functional_role: FUNCTIONAL_ROLE[role] || 'booker' })
  await admin.from('active_role_context').upsert({ person_id: userId, active_organization_id: org.id })
  return org.id
}

async function main() {
  await preflight()

  // 1. Users + profiles + personal org (org-first: a Person belongs via Membership)
  const id = {}
  const org = {}
  for (const u of USERS) {
    const user = await getOrCreateUser(u)
    id[u.role] = user.id
    const { error } = await admin.from('profiles').upsert({ id: user.id, role: u.role, full_name: u.full_name })
    if (error) throw error
    org[u.role] = await bootstrapOrg({ userId: user.id, name: u.full_name, role: u.role, email: u.email })
    console.log(`  ✓ ${u.role.padEnd(8)} ${u.email}  (org ${org[u.role].slice(0, 8)}…)`)
  }

  // 2. Wipe prior seeded artist data for these owners (cascade clears items/claims/requests/snapshots/access).
  await admin.from('artists').delete().in('created_by', [id.artist, id.agency])

  // 3. ARTIST persona — a full, published profile (the public Passport showcase).
  const { data: artist, error: aErr } = await admin.from('artists').insert({
    created_by: id.artist,
    owner_organization_id: org.artist, organization_id: org.artist,
    name: 'נועה לוי', stage_name: 'נועה לוי',
    genre: 'טכנו מלודי', city: 'תל אביב',
    one_line: 'טכנו מלודי שממלא רחבות — מתל אביב לברלין',
    photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    regions: 'מרכז · ירושלים · צפון', set_length: '90–120 דק׳',
    invoice_ready: true,
    music_links: ['https://soundcloud.com/example/noa-levi-live'],
    lineup_frequency_band: '4–10 הופעות', sells_tickets: true,
    price_band: '₪5,000–10,000', community_size_band: '2,000–10,000',
    whatsapp_number: '0521234567',
    published: true,
  }).select().single()
  if (aErr) throw aErr

  await admin.from('profile_items').insert([
    { artist_id: artist.id, item_type: 'link', title: 'SoundCloud', public_url: 'https://soundcloud.com/example/noa-levi-live', source_status: 'public-verified', visibility: 'passport-ok' },
    { artist_id: artist.id, item_type: 'event', title: 'הופעה ב-The Block', detail: 'חלק מליינאפ', item_date: '2025-11-14', source_status: 'public-verified', visibility: 'passport-ok' },
    { artist_id: artist.id, item_type: 'lineup', title: 'במה משותפת — פסטיבל מידברן', item_date: '2025-06-02', source_status: 'artist-provided', visibility: 'passport-ok' },
    { artist_id: artist.id, item_type: 'release', title: 'EP — "Mediterranea"', item_date: '2025-03-01', source_status: 'public-verified', visibility: 'passport-ok' },
  ])

  await admin.from('claims').insert([
    { artist_id: artist.id, claim_type: 'lineup-frequency', value: '4–10 הופעות בשנה', source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', verified_by: 'system', extraction_method: 'mock', model_version: 'mock-v1', reason_code: 'public lineup listings' },
    { artist_id: artist.id, claim_type: 'sells-tickets', value: 'מוכר כרטיסים בעצמו', source_type: 'ticket-export', verification_status: 'verified', visibility: 'passport-ok', verified_by: 'system', extraction_method: 'mock', model_version: 'mock-v1', reason_code: 'ticket export' },
    { artist_id: artist.id, claim_type: 'community-size', value: '2,000–10,000', source_type: 'self-band', verification_status: 'self-reported', visibility: 'mirror-only', verified_by: 'system', extraction_method: 'mock', model_version: 'mock-v1' },
  ])

  // Immutable public snapshot (so the Passport reads a snapshot, like a real publish).
  const items = (await admin.from('profile_items')
    .select('id, item_type, title, detail, item_date, public_url, source_status')
    .eq('artist_id', artist.id).eq('visibility', 'passport-ok')).data ?? []
  const claims = (await admin.from('claims')
    .select('id, claim_type, value, source_type, verification_status, reason_code')
    .eq('artist_id', artist.id).eq('visibility', 'passport-ok')
    .in('verification_status', ['verified', 'supporting'])).data ?? []
  const snapshot = {
    artist: {
      id: artist.id, stage_name: artist.stage_name, name: artist.name, genre: artist.genre,
      city: artist.city, photo_url: artist.photo_url, one_line: artist.one_line, regions: artist.regions,
      set_length: artist.set_length, invoice_ready: artist.invoice_ready, music_links: artist.music_links,
      lineup_frequency_band: artist.lineup_frequency_band, sells_tickets: artist.sells_tickets,
      price_band: artist.price_band, community_size_band: artist.community_size_band, published: true,
    },
    items, claims,
  }
  await admin.from('passport_versions').insert({ artist_id: artist.id, snapshot })

  // Producer confirmation request (P1) — testable via /confirm/seed-confirm-token.
  const { data: vClaim } = await admin.from('claims')
    .select('id').eq('artist_id', artist.id).eq('verification_status', 'verified').limit(1).maybeSingle()
  if (vClaim) {
    await admin.from('producer_confirmations').delete().eq('token', 'seed-confirm-token')
    await admin.from('producer_confirmations').insert({
      token: 'seed-confirm-token', claim_id: vClaim.id, artist_id: artist.id, producer_contact: 'producer@gigproof.test',
    })
  }

  // A8 — a pending Founding Passport entitlement (operator marks active in /admin).
  await admin.from('entitlements').delete().eq('artist_id', artist.id)
  await admin.from('entitlements').insert({
    artist_id: artist.id, subject_id: id.artist, kind: 'founding_passport', status: 'pending',
  })

  // 4. AGENCY roster — two artists the agency owns (one published, one draft),
  //    on the agency's organization_id + linked via artist_access (so roster + RADAR populate).
  const { data: rosterA } = await admin.from('artists').insert({
    created_by: id.agency, owner_organization_id: org.agency, organization_id: org.agency,
    name: 'עידן רז', stage_name: 'עידן רז',
    genre: 'האוס', city: 'חיפה', one_line: 'האוס חמים לקיץ הישראלי',
    regions: 'צפון · מרכז', set_length: '60–90 דק׳', invoice_ready: true,
    lineup_frequency_band: '1–3 הופעות', sells_tickets: false,
    price_band: 'עד ₪2,000', community_size_band: 'עד 500', published: true,
  }).select().single()
  const { data: rosterB } = await admin.from('artists').insert({
    created_by: id.agency, owner_organization_id: org.agency, organization_id: org.agency,
    name: 'מירב שלום', stage_name: 'מירב שלום',
    genre: 'דאון-טמפו', city: 'תל אביב', one_line: 'דאון-טמפו אורגני',
    regions: 'מרכז', set_length: '120 דק׳', invoice_ready: false,
    lineup_frequency_band: 'מתחיל', published: false,
  }).select().single()

  // Roster membership (artist_access) — what the agency RADAR + roster read.
  await admin.from('artist_access').upsert([
    { organization_id: org.agency, artist_id: rosterA.id, access_level: 'manage', status: 'active' },
    { organization_id: org.agency, artist_id: rosterB.id, access_level: 'manage', status: 'active' },
  ], { onConflict: 'organization_id,artist_id' })

  // 5. Availability requests (against published artists) → agency inbox + admin console data.
  await admin.from('availability_requests').insert([
    { artist_id: artist.id, requester_name: 'תמר אברהם', requester_org: 'מועדון הברבי', event_date: '2026-08-20', event_type: 'מסיבת מועדון', location: 'תל אביב', capacity_band: '300–800', budget_band: '₪8,000–20,000', message: 'מחפשים את הדבר הבא לליין של אוגוסט', status: 'new' },
    { artist_id: rosterA.id, requester_name: 'יואב בן-דוד', requester_org: 'פסטיבל אינדנגב', event_date: '2026-09-05', event_type: 'פסטיבל', location: 'מצפה רמון', capacity_band: '800+', budget_band: '₪20,000+', message: 'סט שקיעה', status: 'new' },
  ])

  console.log('\n✓ Seed complete. Login at /login — password for ALL test users:', PASSWORD)
  console.log('  artist@ · agency@ · booker@ · producer@ · operator@gigproof.test')
  console.log(`  Public passport: /passport/${artist.id}`)
  console.log('  Producer confirm link (P1): /confirm/seed-confirm-token\n')
}

main().catch((e) => {
  console.error('\n✗ Seed failed:', e.message || e)
  process.exit(1)
})
