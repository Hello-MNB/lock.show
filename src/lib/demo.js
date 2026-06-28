// ============================================================
// DEMO MODE — lets the app run with NO backend (no Supabase, no token, no OAuth).
// Enabled at build time: `vite build --mode demo` (reads .env.demo → VITE_DEMO=1).
// Every db.js function and the public Passport short-circuit to these fixtures.
// FIREWALL: fixtures contain only bands + bounded labels — no score/head-count.
//
// LANGUAGE PURITY: fixture DATA is bilingual. Displayed Hebrew fields are getters
// that return EN or HE based on the active language (set by LangContext via
// setDemoLang). A fresh load in EN shows pure-English data; in HE, pure Hebrew —
// no language mixing in the visible DOM.
// ============================================================
export const DEMO = import.meta.env.VITE_DEMO === '1'

let _lang = 'en'
export function setDemoLang(l) { _lang = l === 'he' ? 'he' : 'en' }
const L = (en, he) => (_lang === 'he' ? he : en)

const DEMO_ARTIST_ID = 'demo-artist'

export const demoArtist = {
  id: DEMO_ARTIST_ID, created_by: 'demo-user',
  get name() { return L('Noa Levi', 'נועה לוי') },
  get stage_name() { return L('Noa Levi', 'נועה לוי') },
  get genre() { return L('Melodic Techno', 'טכנו מלודי') },
  get city() { return L('Tel Aviv', 'תל אביב') },
  get one_line() { return L('Melodic techno that fills floors — Tel Aviv to Berlin', 'טכנו מלודי שממלא רחבות — מתל אביב לברלין') },
  photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  get regions() { return L('Center · Jerusalem · North', 'מרכז · ירושלים · צפון') },
  get set_length() { return L('90–120 min', '90–120 דק׳') },
  invoice_ready: true, rider_url: null, music_links: ['https://soundcloud.com/example/noa-levi-live'],
  get lineup_frequency_band() { return L('4–10 shows', '4–10 הופעות') },
  sells_tickets: true,
  price_band: '₪5,000–10,000', community_size_band: '2,000–10,000',
  whatsapp_number: '0521234567', published: true, created_at: '2026-01-01T00:00:00Z',
}

export const demoArtist2 = {
  id: 'demo-artist-2', created_by: 'demo-user',
  get name() { return L('Idan Raz', 'עידן רז') },
  get stage_name() { return L('Idan Raz', 'עידן רז') },
  get genre() { return L('House', 'האוס') },
  get city() { return L('Haifa', 'חיפה') },
  get one_line() { return L('Warm house for the Israeli summer', 'האוס חמים לקיץ הישראלי') },
  get regions() { return L('North · Center', 'צפון · מרכז') },
  get set_length() { return L('60–90 min', '60–90 דק׳') },
  invoice_ready: true, music_links: [],
  get lineup_frequency_band() { return L('1–3 shows', '1–3 הופעות') },
  sells_tickets: false,
  get price_band() { return L('Up to ₪2,000', 'עד ₪2,000') },
  get community_size_band() { return L('Up to 500', 'עד 500') },
  published: true, created_at: '2026-02-01T00:00:00Z',
}

// ── Org-first model (Step 2) fixtures — a solo account with seats free. ──
export const demoOrg = { id: 'demo-org', get name() { return L('Noa Levi', 'נועה לוי') }, slug: 'noa-levi', plan: 'solo', created_by: 'demo-user', created_at: '2026-01-01T00:00:00Z' }
export const demoSubscription = { id: 'demo-sub', organization_id: 'demo-org', plan: 'solo', seats_included: 3, seats_used: 1, status: 'active', current_period_end: null }
export const demoMemberships = [
  { id: 'dm-self', org_role: 'owner', status: 'active', organization: { id: 'demo-org', get name() { return L('Noa Levi', 'נועה לוי') }, slug: 'noa-levi', plan: 'solo' } },
  { id: 'dm-2', org_role: 'member', status: 'active', organization: { id: 'demo-org-2', get name() { return L('Oren Booking', 'אורן בוקינג') }, slug: 'oren', plan: 'agency' } },
]
export const demoMembers = [
  { id: 'dm-self', org_role: 'owner', status: 'active', invited_email: null, person: { id: 'demo-user', email: 'demo@gigproof.test', get display_name() { return L('Noa Levi', 'נועה לוי') } } },
]

// ── RADAR (Step 3) roster inputs — varied so the engine emits several rule types. ──
export const demoRadarRecords = [
  {
    artist: { id: 'demo-artist', get stage_name() { return L('Noa Levi', 'נועה לוי') }, published: true },
    claims: [
      { claim_type: 'sells-tickets', verification_status: 'verified', visibility: 'passport-ok', method_label: 'producer-confirmed', expires_at: null },
      { claim_type: 'lineup-frequency', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, expires_at: null },
    ],
    draw: [{ signal_type: 'lineup-frequency', computed_at: '2025-01-01T00:00:00Z' }],
    demand: [{ id: 'dr1', get event_type() { return L('Club night', 'מסיבת מועדון') }, get location() { return L('Tel Aviv', 'תל אביב') }, status: 'new' }],
  },
  {
    artist: { id: 'demo-artist-2', get stage_name() { return L('Idan Raz', 'עידן רז') }, published: false },
    claims: [
      { claim_type: 'sells-tickets', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, expires_at: '2025-01-01T00:00:00Z' },
    ],
    draw: [],
    demand: [{ id: 'dr2', get event_type() { return L('Festival', 'פסטיבל') }, get location() { return L('Mitzpe Ramon', 'מצפה רמון') }, status: 'new' }],
  },
  {
    artist: { id: 'demo-artist-3', get stage_name() { return L('Dana Cohen', 'דנה כהן') }, published: false },
    claims: [], draw: [], demand: [],
  },
]

// ── Operator (Step 4) fixtures — consent records + audit log. ──
export const demoConsents = [
  { id: 'cons1', subject_id: 'demo-user', scope: 'privacy-policy', version: 'v2', status: 'accepted', marketing_opt_in: false, timestamp: '2026-01-01T00:00:00Z' },
  { id: 'cons2', subject_id: 'demo-user', scope: 'data-processing', version: 'v2', status: 'accepted', marketing_opt_in: false, timestamp: '2026-01-01T00:00:00Z' },
  { id: 'cons3', subject_id: 'demo-user', scope: 'evidence-storage', version: 'v2', status: 'accepted', marketing_opt_in: true, timestamp: '2026-01-02T00:00:00Z' },
]
export const demoAudit = [
  { id: 'aud1', actor_id: 'demo-operator', action: 'activate_entitlement', target_type: 'entitlement', target_id: 'dent1', reason: null, created_at: '2026-06-25T10:00:00Z' },
]
export const demoUpgradeRequests = [
  { organization_id: 'demo-org-2', plan: 'solo', seats_included: 1, status: 'trialing', organization: { get name() { return L('Oren Booking', 'אורן בוקינג') } } },
]

export const demoItems = [
  { id: 'di1', artist_id: DEMO_ARTIST_ID, item_type: 'link', title: 'SoundCloud', public_url: 'https://soundcloud.com/example/noa-levi-live', source_status: 'public-verified', visibility: 'passport-ok', item_date: null },
  { id: 'di2', artist_id: DEMO_ARTIST_ID, item_type: 'event', get title() { return L('Show at The Block', 'הופעה ב-The Block') }, item_date: '2025-11-14', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di3', artist_id: DEMO_ARTIST_ID, item_type: 'lineup', get title() { return L('Shared stage — Midburn Festival', 'במה משותפת — פסטיבל מידברן') }, item_date: '2025-06-02', source_status: 'artist-provided', visibility: 'passport-ok', public_url: null },
  { id: 'di4', artist_id: DEMO_ARTIST_ID, item_type: 'release', title: 'EP — "Mediterranea"', item_date: '2025-03-01', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
]

export const demoClaims = [
  { id: 'dc1', artist_id: DEMO_ARTIST_ID, claim_type: 'sells-tickets', get value() { return L('Sells tickets independently', 'מוכר כרטיסים בעצמו') }, source_type: 'ticket-export', verification_status: 'verified', visibility: 'passport-ok', method_label: 'producer-confirmed', reason_code: 'ticket export', expires_at: null },
  { id: 'dc2', artist_id: DEMO_ARTIST_ID, claim_type: 'lineup-frequency', get value() { return L('4–10 shows/year', '4–10 הופעות בשנה') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'public lineup listings', expires_at: null },
  { id: 'dc3', artist_id: DEMO_ARTIST_ID, claim_type: 'community-size', value: '2,000–10,000', source_type: 'self-band', verification_status: 'self-reported', visibility: 'mirror-only', method_label: null, reason_code: null, expires_at: null },
]

export const demoEvidence = [
  { id: 'de1', artist_id: DEMO_ARTIST_ID, evidence_type: 'file', source_type: 'ticket-export', value: 'export.csv', status: 'processed', uploaded_at: '2026-03-01T00:00:00Z' },
  { id: 'de2', artist_id: DEMO_ARTIST_ID, evidence_type: 'band', source_type: 'self-band', get value() { return L('4–10 shows', '4–10 הופעות') }, status: 'submitted', uploaded_at: '2026-03-02T00:00:00Z' },
]

export const demoRequests = [
  { id: 'dr1', artist_id: DEMO_ARTIST_ID, get requester_name() { return L('Tamar Avraham', 'תמר אברהם') }, get requester_org() { return L('Barby Club', 'מועדון הברבי') }, event_date: '2026-08-20', get event_type() { return L('Club night', 'מסיבת מועדון') }, get location() { return L('Tel Aviv', 'תל אביב') }, capacity_band: '300–800', budget_band: '₪8,000–20,000', get message() { return L('Looking for the next thing for our August lineup', 'מחפשים את הדבר הבא לליין של אוגוסט') }, status: 'new', created_date: '2026-06-20T00:00:00Z', artists: { get stage_name() { return L('Noa Levi', 'נועה לוי') } } },
  { id: 'dr2', artist_id: 'demo-artist-2', get requester_name() { return L('Yoav Ben-David', 'יואב בן-דוד') }, get requester_org() { return L('InDNegev Festival', 'פסטיבל אינדנגב') }, event_date: '2026-09-05', get event_type() { return L('Festival', 'פסטיבל') }, get location() { return L('Mitzpe Ramon', 'מצפה רמון') }, capacity_band: '800+', budget_band: '₪20,000+', get message() { return L('Sunset set', 'סט שקיעה') }, status: 'new', created_date: '2026-06-22T00:00:00Z', artists: { get stage_name() { return L('Idan Raz', 'עידן רז') } } },
]

export const demoEntitlement = { id: 'dent1', status: 'pending', kind: 'founding_passport', created_at: '2026-06-25T00:00:00Z', artists: { get stage_name() { return L('Noa Levi', 'נועה לוי') } } }

// The shape the public Passport (/api/passport) returns — getters so the language
// is resolved at access time (not frozen at module load).
export const demoPassportPayload = {
  get artist() { return { ...demoArtist, published: true } },
  get items() { return demoItems.filter((i) => i.visibility === 'passport-ok') },
  get claims() { return demoClaims.filter((c) => c.visibility === 'passport-ok' && ['verified', 'supporting'].includes(c.verification_status)) },
}

// Producer confirm (P1) fixture.
export const demoConfirm = { get claimText() { return L('Sells tickets independently', 'מוכר כרטיסים בעצמו') }, get artistName() { return L('Noa Levi', 'נועה לוי') }, response: null, revoked: false, responded: false }

// O4 invite-info fixture (used by orgs.getInviteInfo in demo).
export const demoInviteInfo = { get org_name() { return L('Oren Booking', 'אורן בוקינג') }, get inviter_name() { return L('Oren Mizrahi', 'אורן מזרחי') }, org_role: 'member', invited_email: null }

export { DEMO_ARTIST_ID }
