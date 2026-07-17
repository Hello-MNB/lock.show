// ============================================================
// DEMO MODE — lets the app run with NO backend (no Supabase, no token, no OAuth).
// Enabled at build time: `vite build --mode demo` (reads .env.demo → VITE_DEMO=1).
// Every db.js function and the public Passport short-circuit to these fixtures.
// FIREWALL: fixtures contain only bands + bounded labels — no score/head-count.
//
// FLAGSHIP DEMO ARTIST — SHAI PERLMAN ("PERLMAN"), underground techno, Tel Aviv.
// Built from real public-footprint research (Drive "ARTIST EXAMPLES", Jul 2026):
// resident headline DJ + owner/lead producer of the INSOMNIA TLV event brand
// (Gagarin TLV). His profile has NO documented attendance/fee/follower numbers —
// so price_band and community_size_band are honestly null (the app's missing /
// "needs you" states show instead). The only counts kept are the ones the
// firewall allows: event counts, 8 SoundCloud uploads, set durations.
//
// LANGUAGE PURITY: fixture DATA is bilingual. Displayed Hebrew fields are getters
// that return EN or HE based on the active language (set by LangContext via
// setDemoLang). A fresh load in EN shows pure-English data; in HE, pure Hebrew —
// no language mixing in the visible DOM. Brand names (PERLMAN, INSOMNIA TLV,
// Gagarin, SoundCloud) stay Latin in both languages, as they do in the wild.
// ============================================================
export const DEMO = import.meta.env.VITE_DEMO === '1'

let _lang = 'en'
export function setDemoLang(l) { _lang = l === 'he' ? 'he' : 'en' }
const L = (en, he) => (_lang === 'he' ? he : en)

const DEMO_ARTIST_ID = 'demo-artist'

export const demoArtist = {
  id: DEMO_ARTIST_ID, created_by: 'demo-user',
  get name() { return L('Shai Perlman', 'שי פרלמן') },
  stage_name: 'PERLMAN',
  get genre() { return L('Underground Techno', 'טכנו אנדרגראונד') },
  get city() { return L('Tel Aviv', 'תל אביב') },
  get one_line() { return L('Underground techno built for long-form journeys — extended and five-hour sets, midnight to sunrise', 'טכנו אנדרגראונד של מסעות ארוכים — סטים מורחבים של עד חמש שעות, מחצות עד הזריחה') },
  photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  get regions() { return L('Tel Aviv · Center', 'תל אביב · מרכז') },
  get set_length() { return L('Extended — up to 5 hours', 'מורחב — עד 5 שעות') },
  // Legal/invoicing structure not documented (real gap) — null, never a fake "yes".
  invoice_ready: null, rider_url: null,
  music_links: ['https://soundcloud.com/shai-perlman'],
  // Frequency IS publicly documented (numbered event listings) — event counts are
  // firewall-safe. Fee + community numbers are NOT documented anywhere → null.
  get lineup_frequency_band() { return L('10+ shows/year', '10+ הופעות בשנה') },
  sells_tickets: true, // producer-confirmable: Selector + GO-OUT organizer pages
  price_band: null, community_size_band: null,
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

// ── Org-first model (Step 2) fixtures — MULTI-HAT: one person, two workspaces.
// demo-org   = Shai's personal solo workspace (the PERLMAN artist identity).
// demo-org-2 = INSOMNIA TLV, his event-production brand (closest existing enum is
// plan 'agency' — the schema has no dedicated "production brand" org type). ──
export const demoOrg = { id: 'demo-org', get name() { return L('Shai Perlman', 'שי פרלמן') }, slug: 'shai-perlman', plan: 'solo', workspace_type: 'artist', created_by: 'demo-user', created_at: '2026-01-01T00:00:00Z' }
export const demoSubscription = { id: 'demo-sub', organization_id: 'demo-org', plan: 'solo', seats_included: 3, seats_used: 1, status: 'active', current_period_end: null }
// `functional_role` mirrors role_assignment.functional_role (migration 008) —
// the ACTIVE membership's functional_role is what OrgContext now derives the
// effective nav/routing role from (canon ROUND 4: switching workspace recomputes
// role), not a single global profile role. Two real hats on one demo person:
// Shai's own artist workspace, and his INSOMNIA TLV production/booking brand.
// `organization.workspace_type` (migration 027) is the SEPARATE axis that picks
// the production nav set (Team·Events·Requests) over the generic agency roster
// screen — INSOMNIA TLV is a production company (it runs its own events and
// books lineups), not a booking/management agency, even though its
// functional_role still normalizes to the AGENCY nav role today. A THIRD demo
// workspace (Golan Artist Management) is a genuine representation/booking
// agency (workspace_type='management') so the roster/access-grant screen
// (AgencyDashboard) has its own real demo coverage, separate from — and not
// shadowed by — INSOMNIA's production dashboard.
export const demoMemberships = [
  { id: 'dm-self', org_role: 'owner', status: 'active', functional_role: 'artist', organization: { id: 'demo-org', get name() { return L('Shai Perlman', 'שי פרלמן') }, slug: 'shai-perlman', plan: 'solo', workspace_type: 'artist' } },
  { id: 'dm-2', org_role: 'owner', status: 'active', functional_role: 'agency', organization: { id: 'demo-org-2', name: 'INSOMNIA TLV', slug: 'insomnia-tlv', plan: 'agency', workspace_type: 'producer' } },
  { id: 'dm-3', org_role: 'owner', status: 'active', functional_role: 'agency', get organization() { return { id: 'demo-org-3', get name() { return L('Golan Artist Management', 'ניהול אמנים גולן') }, slug: 'golan-management', plan: 'agency', workspace_type: 'management' } } },
]
export const demoMembers = [
  { id: 'dm-self', org_role: 'owner', status: 'active', invited_email: null, person: { id: 'demo-user', email: 'demo@lock.test', get display_name() { return L('Shai Perlman', 'שי פרלמן') } } },
]

// ── G3 (A2/N12) — demo counterpart of orgs.createWorkspace: pushes a NEW,
// EMPTY membership into the mutable demoMemberships list (same in-memory
// pattern as demoRequestArtistAccess) so the switcher shows it until reload.
// Mirrors the real RPC's boundary exactly: nothing is copied — no evidence,
// billing or ArtistAccess rows reference the new org id, so every screen in
// the new workspace renders its honest empty state.
let _dwSeq = 4
export function demoCreateWorkspace(name, type) {
  const id = `demo-org-${_dwSeq++}`
  const workspace_type = type === 'production' ? 'producer' : type === 'agency' ? 'management' : 'artist'
  const functional_role = type === 'artist' ? 'artist' : 'agency'
  demoMemberships.push({
    id: `dm-${id}`, org_role: 'owner', status: 'active', functional_role,
    organization: {
      id, name: (name || '').trim() || L('New workspace', 'סביבת עבודה חדשה'),
      slug: null, plan: type === 'artist' ? 'solo' : 'agency', workspace_type,
    },
  })
  return { ok: true, id }
}

// ── RADAR (Step 3) roster inputs — varied so the engine emits several rule types. ──
export const demoRadarRecords = [
  {
    artist: { id: 'demo-artist', stage_name: 'PERLMAN', published: true },
    claims: [
      { claim_type: 'residency', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, expires_at: null },
      { claim_type: 'sells-tickets', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, expires_at: null },
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
  { organization_id: 'demo-org-2', plan: 'solo', seats_included: 1, status: 'trialing', organization: { name: 'INSOMNIA TLV' } },
]

// ── Profile items — PERLMAN's public track record. Numbered INSOMNIA TLV nights
// carry their real listed dates (Selector / GO-OUT / Gagarin archive). ──
export const demoItems = [
  { id: 'di1', artist_id: DEMO_ARTIST_ID, item_type: 'link', title: 'SoundCloud', public_url: 'https://soundcloud.com/shai-perlman', source_status: 'public-verified', visibility: 'passport-ok', item_date: null },
  { id: 'di2', artist_id: DEMO_ARTIST_ID, item_type: 'link', title: 'Instagram', public_url: 'https://instagram.com/shaiperlman', source_status: 'public-verified', visibility: 'passport-ok', item_date: null },
  { id: 'di3', artist_id: DEMO_ARTIST_ID, item_type: 'residency', get title() { return L('Resident headline DJ — INSOMNIA TLV @ Gagarin, Tel Aviv', 'DJ הבית — INSOMNIA TLV @ Gagarin, תל אביב') }, item_date: '2024-08-01', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  // Self-produced numbered series (each date from the public listing):
  { id: 'di4', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV 4 — Gagarin, extended set', 'INSOMNIA TLV 4 — Gagarin, סט מורחב') }, item_date: '2024-09-26', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di5', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #12 — Gagarin, extended set', 'INSOMNIA TLV #12 — Gagarin, סט מורחב') }, item_date: '2025-08-08', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di6', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #14 — Gagarin, extended set', 'INSOMNIA TLV #14 — Gagarin, סט מורחב') }, item_date: '2025-10-10', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di7', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #16 — Gagarin, extended set', 'INSOMNIA TLV #16 — Gagarin, סט מורחב') }, item_date: '2026-01-09', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di8', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #17 — Gagarin, extended set', 'INSOMNIA TLV #17 — Gagarin, סט מורחב') }, item_date: '2026-02-06', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di9', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #18 — Gagarin, extended set', 'INSOMNIA TLV #18 — Gagarin, סט מורחב') }, item_date: '2026-04-17', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di10', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #19 "Girl Power" — Gagarin', 'INSOMNIA TLV #19 "Girl Power" — Gagarin') }, item_date: '2026-05-15', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di11', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #20 "See You in the Dark" — Gagarin', 'INSOMNIA TLV #20 "See You in the Dark" — Gagarin') }, item_date: '2026-06-05', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di12', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('INSOMNIA TLV #21 "Black Jack" — Gagarin (upcoming)', 'INSOMNIA TLV #21 "Black Jack" — Gagarin (בקרוב)') }, item_date: '2026-07-10', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di13', artist_id: DEMO_ARTIST_ID, item_type: 'self_produced_event', get title() { return L('"Underground By Perlman" all-nighter — own sub-brand', 'אול-נייטר "Underground By Perlman" — תת-מותג עצמאי') }, item_date: '2026-01-22', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  // Guest gigs outside his own brand (third-party listings):
  { id: 'di14', artist_id: DEMO_ARTIST_ID, item_type: 'event', get title() { return L('Guest set — Art Club "Weekend" (02:00–04:00)', 'סט אורח — Art Club "Weekend"‏ (02:00–04:00)') }, item_date: '2023-12-21', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di15', artist_id: DEMO_ARTIST_ID, item_type: 'lineup', get title() { return L('Cappella "Kabbalat Shabbat" — w/ Yehuda White', 'Cappella "קבלת שבת" — עם יהודה וייט') }, item_date: '2025-01-17', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
  { id: 'di16', artist_id: DEMO_ARTIST_ID, item_type: 'event', get title() { return L('Guest set — Art Club "After Atzmaut" (06:00–08:00)', 'סט אורח — Art Club "אפטר עצמאות" (06:00–08:00)') }, item_date: '2026-04-22', source_status: 'public-verified', visibility: 'passport-ok', public_url: null },
]

// ── Claims — the 8 evidence candidates, each with its honest method mapping.
// public URL              → source_type 'public-profile' + verification_status 'supporting' (→ SOURCE-LINKED)
// self-reported, no source → source_type 'self-reported' + 'self-reported', mirror-only (→ ARTIST-DECLARED)
// producer-confirmable    → still 'supporting' until a counterparty actually confirms
//                           (no 'producer-confirmed' label is faked; the pending
//                           confirm lives in demoConfirm below).
// NO 'verified' / ticket-export claim exists yet — the ticket export is pending. ──
export const demoClaims = [
  { id: 'dc1', artist_id: DEMO_ARTIST_ID, claim_type: 'residency', get value() { return L('Resident headline DJ at INSOMNIA TLV (Gagarin, Tel Aviv)', 'DJ הבית של INSOMNIA TLV (Gagarin, תל אביב)') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'numbered event listings #4–#21', expires_at: null },
  { id: 'dc2', artist_id: DEMO_ARTIST_ID, claim_type: 'self-produced-events', get value() { return L('Produced 10+ recurring techno nights since Aug 2024', 'הפיק 10+ ערבי טכנו קבועים מאז אוגוסט 2024') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'numbered series at one venue — producer-confirmable', expires_at: null },
  { id: 'dc3', artist_id: DEMO_ARTIST_ID, claim_type: 'set-format', get value() { return L('Performs extended and 5-hour sets', 'מופיע בסטים מורחבים של עד 5 שעות') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'official event pages — "PERLMAN EXTENDED SET"', expires_at: null },
  { id: 'dc4', artist_id: DEMO_ARTIST_ID, claim_type: 'recorded-sets', get value() { return L('8 live sets on SoundCloud (2023–2025)', '8 סטים חיים ב-SoundCloud (2023–2025)') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'time-stamped public uploads', expires_at: null },
  { id: 'dc5', artist_id: DEMO_ARTIST_ID, claim_type: 'guest-gigs', get value() { return L('Guest DJ outside own brand — Art Club, Cappella', 'DJ אורח מחוץ למותג — Art Club, Cappella') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: '3 third-party listings', expires_at: null },
  { id: 'dc6', artist_id: DEMO_ARTIST_ID, claim_type: 'professional-role', get value() { return L('Owner & lead producer of INSOMNIA TLV', 'בעלים ומפיק ראשי של INSOMNIA TLV') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'IG bios + GO-OUT organizer listing', expires_at: null },
  { id: 'dc7', artist_id: DEMO_ARTIST_ID, claim_type: 'sells-tickets', get value() { return L('Sells tickets via Selector & GO-OUT', 'מוכר כרטיסים דרך Selector ו-GO-OUT') }, source_type: 'public-profile', verification_status: 'supporting', visibility: 'passport-ok', method_label: null, reason_code: 'public checkout pages — ticket export pending', expires_at: null },
  // Honest gap on display: community claimed, zero numbers documented → artist view only.
  { id: 'dc8', artist_id: DEMO_ARTIST_ID, claim_type: 'community', get value() { return L('Owned community around INSOMNIA TLV — no audience numbers documented', 'קהילה סביב INSOMNIA TLV — ללא נתוני קהל מתועדים') }, source_type: 'self-reported', verification_status: 'self-reported', visibility: 'mirror-only', method_label: null, reason_code: null, expires_at: null },
]

// ── Acts (multi-Act spine, migration 020) — DEMO fixtures ────────────────────
// Canon: one Person may hold several Acts (e.g. a psytrance Act + a techno
// Act), each with its OWN Passport and its OWN evidence, per-Act
// non-transferable. PERLMAN's default (techno) Act reuses artists.id
// (migration 020's transition rule: act.id === artists.id for the default
// Act) — the psytrance Act below is a genuinely SEPARATE act row, same person,
// with its own (much newer, much lighter) evidence universe. Switching never
// carries the techno Act's INSOMNIA TLV history into it.
const DEMO_ACT_PSY_ID = 'demo-act-psy'

export const demoActs = [
  {
    id: DEMO_ARTIST_ID, person_id: 'demo-user', is_default: true,
    stage_name: 'PERLMAN',
    get genre() { return L('Underground Techno', 'טכנו אנדרגראונד') },
    get city() { return L('Tel Aviv', 'תל אביב') },
    get positioning() { return L('Underground techno · resident @ INSOMNIA TLV', 'טכנו אנדרגראונד · תושב קבע ב-INSOMNIA TLV') },
    photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  },
  {
    id: DEMO_ACT_PSY_ID, person_id: 'demo-user', is_default: false,
    get stage_name() { return L('PERLMAN PSY', 'פרלמן פסיי') },
    get genre() { return L('Psytrance', 'פסיטראנס') },
    get city() { return L('Tel Aviv', 'תל אביב') },
    get positioning() { return L('A newer side-project — forest-floor sets, just getting started', 'פרויקט צדדי חדש — סטים ביער, רק בהתחלה') },
    photo_url: 'https://images.unsplash.com/photo-1518972734183-1e4f5b6b0b1b?w=800&q=80',
  },
]

// The psytrance Act's OWN evidence universe — deliberately sparse (a brand-new
// Act) and NEVER the techno Act's items/claims. One organic public link exists
// (so the radar isn't the pre-evidence blossom screen); nothing else is
// confirmed yet — every other node stays an honest "needs you" invitation.
export const demoItemsPsy = [
  { id: 'dip1', artist_id: DEMO_ACT_PSY_ID, act_id: DEMO_ACT_PSY_ID, item_type: 'link', title: 'SoundCloud', public_url: 'https://soundcloud.com/perlman-psy', source_status: 'public-verified', visibility: 'passport-ok', item_date: null },
]
export const demoClaimsPsy = []

// listActs(artistId) fixture — every Act the same demo Person holds.
// switchAct(actId) fixture — the picked Act's own record + its own evidence
// (never another Act's), matching the real switchAct() contract in db.js.
export function demoSwitchAct(actId) {
  const a = demoActs.find((x) => x.id === actId) || demoActs[0]
  return a.id === DEMO_ARTIST_ID
    ? { act: a, items: demoItems, claims: demoClaims }
    : { act: a, items: demoItemsPsy, claims: demoClaimsPsy }
}

// ── Evidence uploads — only what really exists: public links. No ticket export
// yet (evidence candidate #8 stays pending until a Selector/GO-OUT export lands). ──
export const demoEvidence = [
  { id: 'de1', artist_id: DEMO_ARTIST_ID, evidence_type: 'link', source_type: 'public-profile', value: 'soundcloud.com/shai-perlman — 8 live sets', status: 'processed', uploaded_at: '2026-03-01T00:00:00Z' },
  { id: 'de2', artist_id: DEMO_ARTIST_ID, evidence_type: 'link', source_type: 'public-profile', value: 'selector.org.il — INSOMNIA TLV listings', status: 'submitted', uploaded_at: '2026-03-02T00:00:00Z' },
]

export const demoRequests = [
  { id: 'dr1', artist_id: DEMO_ARTIST_ID, get requester_name() { return L('Maya Golan', 'מאיה גולן') }, get requester_org() { return L('The Block TLV', 'דה בלוק תל אביב') }, event_date: '2026-08-21', get event_type() { return L('Club night', 'מסיבת מועדון') }, get location() { return L('Tel Aviv', 'תל אביב') }, capacity_band: '300–800', budget_band: '₪8,000–20,000', get message() { return L('Saw the INSOMNIA nights at Gagarin — looking for an extended closing set for our main room, midnight to close', 'ראינו את ערבי INSOMNIA ב-Gagarin — מחפשים סט סגירה מורחב למיין רום, מחצות עד סגירה') }, status: 'new', created_date: '2026-06-20T00:00:00Z', artists: { stage_name: 'PERLMAN' } },
  { id: 'dr2', artist_id: 'demo-artist-2', get requester_name() { return L('Yoav Ben-David', 'יואב בן-דוד') }, get requester_org() { return L('InDNegev Festival', 'פסטיבל אינדנגב') }, event_date: '2026-09-05', get event_type() { return L('Festival', 'פסטיבל') }, get location() { return L('Mitzpe Ramon', 'מצפה רמון') }, capacity_band: '800+', budget_band: '₪20,000+', get message() { return L('Sunset set', 'סט שקיעה') }, status: 'new', created_date: '2026-06-22T00:00:00Z', artists: { get stage_name() { return L('Idan Raz', 'עידן רז') } } },
]

export const demoEntitlement = { id: 'dent1', status: 'pending', kind: 'founding_passport', amount_note: 'GP-DEMO · ₪199 · Bit', created_at: '2026-06-25T00:00:00Z', subject_id: 'demo-user', subject_email: 'demo@lock.test', artists: { stage_name: 'PERLMAN' } }

// The shape the public Passport (/api/passport) returns — getters so the language
// is resolved at access time (not frozen at module load).
export const demoPassportPayload = {
  get artist() { return { ...demoArtist, published: true } },
  get items() { return demoItems.filter((i) => i.visibility === 'passport-ok') },
  get claims() { return demoClaims.filter((c) => c.visibility === 'passport-ok' && ['verified', 'supporting'].includes(c.verification_status)) },
}

// Producer confirm (P1) fixture — the counterparty (Gagarin TLV) sees PERLMAN's
// producer-confirmable claim, still unanswered (response: null).
export const demoConfirm = { get claimText() { return L('Produced 10+ recurring INSOMNIA TLV techno nights at Gagarin since Aug 2024', 'הפיק 10+ ערבי טכנו קבועים של INSOMNIA TLV ב-Gagarin מאז אוגוסט 2024') }, artistName: 'PERLMAN', response: null, revoked: false, responded: false }

// O4 invite-info fixture (used by orgs.getInviteInfo in demo) — Shai inviting a
// team member into his INSOMNIA TLV production workspace.
export const demoInviteInfo = { org_name: 'INSOMNIA TLV', get inviter_name() { return L('Shai Perlman', 'שי פרלמן') }, org_role: 'member', invited_email: null }

// P1-1 in-app notifications (migration 002 table) — three realistic PERLMAN
// events, one per writer: a new booking request, a producer confirmation, and
// a passport publish. Bodies are pre-authored bilingual TEXT (matching the real
// schema: `body text not null`, no structured params) — never a score/count.
export const demoNotifications = [
  { id: 'dn1', type: 'new_request', get body() { return L('New availability request from Maya Golan · The Block TLV', 'בקשת זמינות חדשה ממאיה גולן · דה בלוק תל אביב') }, link: '/agency/requests', read: false, created_at: '2026-07-08T08:15:00Z' },
  { id: 'dn2', type: 'confirmation_arrived', get body() { return L('Gagarin TLV confirmed: "Produced 10+ recurring INSOMNIA TLV techno nights"', 'Gagarin TLV אישרו: "הפיק 10+ ערבי טכנו קבועים של INSOMNIA TLV"') }, link: '/artist/claims', read: false, created_at: '2026-07-07T19:40:00Z' },
  { id: 'dn3', type: 'passport_published', get body() { return L('Your profile was published successfully!', 'הפספורט שלך פורסם בהצלחה!') }, link: '/artist/home', read: true, created_at: '2026-07-05T11:00:00Z' },
]

// ── artist_access consent handshake (migration 027 target) — DEMO fixture.
// Seeded with ONE realistic three-hat case (ENTITY-SPEC-ORG §6.1): Shai's own
// representation workspace (Golan Artist Management / demo-org-3, a genuine
// management-type org — NOT INSOMNIA, which is production-type) has requested
// access to Shai's own artist (PERLMAN / demo-artist) — "same grant, same
// scopes, same revocability" as any other roster member, no special-case
// "it's me" path. A second, already-active grant with a fuller scope set
// (upload+share) and a territory/expiry shows the roster-row chip display
// end-to-end, not just the pending state. Mutable (like demoEntitlement) so
// the demo Add-artist/Representation screens can drive the full
// pending→active→revoked lifecycle end-to-end with no backend.
let _daaSeq = 3
export const demoAccessRequests = [
  {
    id: 'daa1', artist_id: DEMO_ARTIST_ID, get artist_stage_name() { return 'PERLMAN' },
    organization_id: 'demo-org-3', get organization_name() { return L('Golan Artist Management', 'ניהול אמנים גולן') },
    scope: ['view'], territory: null, status: 'pending', consent_at: null,
    expires_at: null, created_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 'daa2', artist_id: 'demo-artist-2', get artist_stage_name() { return L('Idan Raz', 'עידן רז') },
    organization_id: 'demo-org-3', get organization_name() { return L('Golan Artist Management', 'ניהול אמנים גולן') },
    scope: ['view', 'upload', 'share'], get territory() { return L('North · Center', 'צפון · מרכז') }, status: 'active',
    consent_at: '2026-06-15T00:00:00Z', expires_at: '2027-06-15T00:00:00Z', created_at: '2026-06-10T00:00:00Z',
  },
]
function demoOrgNameFor(orgId) {
  const m = demoMemberships.find((mm) => mm.organization?.id === orgId)
  return m?.organization?.name || orgId
}
export function demoRequestArtistAccess(orgId, artistId, scope, territory) {
  const artist = artistId === demoArtist2.id ? demoArtist2 : demoArtist
  const row = {
    id: `daa${_daaSeq++}`, artist_id: artistId, artist_stage_name: artist.stage_name,
    organization_id: orgId, organization_name: demoOrgNameFor(orgId),
    scope: scope?.length ? scope : ['view'], territory: territory || null,
    status: 'pending', consent_at: null, expires_at: null, created_at: new Date().toISOString(),
  }
  demoAccessRequests.push(row)
  return { ok: true, id: row.id }
}
export function demoRespondToAccessRequest(id, approve, scope) {
  const row = demoAccessRequests.find((r) => r.id === id)
  if (!row) return { ok: false }
  if (approve) {
    row.status = 'active'
    row.consent_at = new Date().toISOString()
    if (scope?.length) row.scope = scope
  } else {
    row.status = 'revoked'
    row.consent_at = null
  }
  return { ok: true }
}
export function demoRevokeArtistAccess(id) {
  const row = demoAccessRequests.find((r) => r.id === id)
  if (row) row.status = 'revoked'
  return { ok: true }
}

// ── PRODUCTION WORKSPACE (organization.workspace_type='producer', migration 027)
// fixtures — INSOMNIA TLV's own `gigs` (008 + 023 gig-depth) rows. Two real
// events from PERLMAN's own numbered series (matches demoItems di11/di12):
// #20 already ran (closeout done — the Gig Evidence Refresh loop), #21 is
// upcoming with a second lineup slot (Idan Raz, guest support) so the
// grouped-into-events view has a real multi-slot lineup to show. ──
export const demoOrgGigs = [
  {
    id: 'gig1', artist_id: DEMO_ARTIST_ID, get title() { return L('INSOMNIA TLV #20 "See You in the Dark"', 'INSOMNIA TLV #20 "See You in the Dark"') },
    event_date: '2026-06-05', venue: 'Gagarin', get city() { return L('Tel Aviv', 'תל אביב') },
    status: 'settled', role_at_event: 'headliner', audience_band: '300-600', closeout_status: 'completed',
    artist: { stage_name: 'PERLMAN' },
  },
  {
    id: 'gig2', artist_id: DEMO_ARTIST_ID, get title() { return L('INSOMNIA TLV #21 "Black Jack"', 'INSOMNIA TLV #21 "Black Jack"') },
    event_date: '2026-07-10', venue: 'Gagarin', get city() { return L('Tel Aviv', 'תל אביב') },
    status: 'confirmed', role_at_event: 'headliner', audience_band: 'unknown', closeout_status: 'pending',
    artist: { stage_name: 'PERLMAN' },
  },
  {
    id: 'gig3', artist_id: 'demo-artist-2', get title() { return L('INSOMNIA TLV #21 "Black Jack"', 'INSOMNIA TLV #21 "Black Jack"') },
    event_date: '2026-07-10', venue: 'Gagarin', get city() { return L('Tel Aviv', 'תל אביב') },
    status: 'hold', role_at_event: 'support', audience_band: 'unknown', closeout_status: 'pending',
    get artist() { return { get stage_name() { return L('Idan Raz', 'עידן רז') } } },
  },
]

// Confirm-requests surface fixture — an artist outside INSOMNIA TLV's own
// roster (Idan Raz) asking INSOMNIA TLV, as the venue/producer counterparty,
// to confirm a guest-support claim at one of its real events. Still
// unanswered (response: null) — the real query (listOrgConfirmRequests)
// returns `null` (not this array) once DEMO is off, since no RLS path exists
// yet for the confirming org to list these; this fixture exists ONLY to make
// the demo build show a populated, honest-looking surface.
export const demoOrgConfirmRequests = [
  {
    id: 'pc1', claim_id: 'dc-idan-1', artist_id: 'demo-artist-2',
    get artist_stage_name() { return L('Idan Raz', 'עידן רז') },
    get claim_text() { return L('Guest support slot — INSOMNIA TLV #21 "Black Jack" @ Gagarin', 'סט אורח — INSOMNIA TLV #21 "Black Jack" @ Gagarin') },
    response: null, revoked: false, responded_at: null, created_at: '2026-07-08T09:00:00Z',
  },
]

export { DEMO_ARTIST_ID }
