// ============================================================
// ACT BOUNDARY — RUNTIME SUITE · scripts/test-act-boundary.mjs
//
// Owner ruling (16 Aug 2026): "PASSPORT publication is Act-scoped. Person is the
// authenticated actor; PassportVersion, evidence eligibility, audience/purpose
// policy, publication, replacement and withdrawal resolve against the active Act.
// Evidence/authority never transfers across Acts."
//
// WHY THIS FILE EXISTS. The publish and public-passport routes had NO runtime
// coverage: scripts/test-security-denial.mjs exercises denial paths and never
// calls them. A rename inside buildSafePayload therefore left three references to
// a removed parameter and every publish would have 500'd at runtime, while
// `node --check` and a 39-assertion verify chain both stayed green. Syntax checks
// cannot see a ReferenceError. This suite executes the code.
//
// Boots the REAL server/index.js against a local mock Supabase. No network, no
// keys, no secrets, no real data.
// ============================================================
import { createServer } from 'node:http'

const PERSON_A = '11111111-1111-4111-8111-111111111111'
const PERSON_B = '22222222-2222-4222-8222-222222222222'
// Default Act: act.id === artists.id (migration 020 backfill).
const ACT_DEFAULT = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
// Second Act held by the SAME person — no artists row, by construction.
const ACT_SECOND = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const ACT_UNKNOWN = '99999999-9999-4999-8999-999999999999'
// A SECOND Person with their own default Act — the victim in the mixed-id case.
const ACT_VICTIM = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const JWT_A = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: PERSON_A })}.sigA`
const JWT_B = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: PERSON_B })}.sigB`

const ARTISTS = {
  [ACT_DEFAULT]: { id: ACT_DEFAULT, created_by: PERSON_A, published: true, stage_name: 'Default Act', genre: 'psytrance' },
  [ACT_VICTIM]: { id: ACT_VICTIM, created_by: PERSON_B, published: false, stage_name: 'Victim Act', genre: 'house' },
}
const ACTS = {
  [ACT_DEFAULT]: { id: ACT_DEFAULT, person_id: PERSON_A, stage_name: 'Default Act', genre: 'psytrance', city: 'TLV', is_default: true },
  [ACT_SECOND]: { id: ACT_SECOND, person_id: PERSON_A, stage_name: 'Second Act', genre: 'techno', city: 'Haifa', is_default: false },
  [ACT_VICTIM]: { id: ACT_VICTIM, person_id: PERSON_B, stage_name: 'Victim Act', genre: 'house', city: 'TLV', is_default: true },
}
// Evidence deliberately split across the two Acts.
const ITEMS = [
  { id: 'i1', act_id: ACT_DEFAULT, artist_id: ACT_DEFAULT, item_type: 'gig', title: 'DEFAULT-ACT-ITEM', visibility: 'passport-ok' },
  { id: 'i2', act_id: ACT_SECOND, artist_id: ACT_DEFAULT, item_type: 'gig', title: 'SECOND-ACT-ITEM', visibility: 'passport-ok' },
]
const CLAIMS = [
  { id: 'c1', act_id: ACT_DEFAULT, artist_id: ACT_DEFAULT, claim_type: 'draw', value: 'DEFAULT-ACT-CLAIM', verification_status: 'verified', artist_approved: true, visibility: 'passport-ok', method_label: 'producer-confirmed' },
  { id: 'c2', act_id: ACT_SECOND, artist_id: ACT_DEFAULT, claim_type: 'draw', value: 'SECOND-ACT-CLAIM', verification_status: 'verified', artist_approved: true, visibility: 'passport-ok', method_label: 'producer-confirmed' },
]

const mockLog = []
const sendJson = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)) }
const readBody = (req) => new Promise((r) => { let raw = ''; req.on('data', (c) => { raw += c }); req.on('end', () => { try { r(raw ? JSON.parse(raw) : null) } catch { r(null) } }) })

// Minimal PostgREST filter reader: enough to honour eq / or(act_id...) on the
// two collections this suite serves.
function applyActFilter(rows, u) {
  const eqAct = (u.searchParams.get('act_id') || '').replace(/^eq\./, '')
  const eqArtist = (u.searchParams.get('artist_id') || '').replace(/^eq\./, '')
  const or = u.searchParams.get('or') || ''
  let out = rows
  if (eqArtist) out = out.filter((r) => r.artist_id === eqArtist)
  if (eqAct) out = out.filter((r) => r.act_id === eqAct)
  if (or) {
    const m = /act_id\.eq\.([0-9a-f-]+)/i.exec(or)
    const nullOk = /act_id\.is\.null/i.test(or)
    if (m) out = out.filter((r) => r.act_id === m[1] || (nullOk && r.act_id == null))
  }
  return out
}

const mock = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://mock')
  const body = ['POST', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : null
  mockLog.push({ method: req.method, path: u.pathname, body })
  const idFilter = (u.searchParams.get('id') || '').replace(/^eq\./, '')

  if (u.pathname === '/auth/v1/user') {
    const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')
    const users = { [JWT_A]: PERSON_A, [JWT_B]: PERSON_B }
    const id = m && users[m[1]]
    if (!id) return sendJson(res, 401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' })
    return sendJson(res, 200, { id, aud: 'authenticated', role: 'authenticated' })
  }
  if (u.pathname === '/rest/v1/artists') {
    // The URL is recorded: without it the suite cannot say WHOSE Passport was
    // published, which is precisely the property this file is named for.
    if (req.method === 'PATCH') { mockLog[mockLog.length - 1].url = req.url; return sendJson(res, 200, []) }
    const row = ARTISTS[idFilter]
    return sendJson(res, 200, row ? [row] : [])
  }
  if (u.pathname === '/rest/v1/act') {
    const row = ACTS[idFilter]
    return sendJson(res, 200, row ? [row] : [])
  }
  if (u.pathname === '/rest/v1/profile_items') return sendJson(res, 200, applyActFilter(ITEMS, u))
  if (u.pathname === '/rest/v1/claims') return sendJson(res, 200, applyActFilter(CLAIMS, u))
  if (u.pathname === '/rest/v1/passport_versions') {
    if (req.method === 'POST') return sendJson(res, 201, [])
    return sendJson(res, 200, []) // no stored snapshot → exercise the live builder
  }
  return sendJson(res, 200, [])
})
await new Promise((r) => mock.listen(0, '127.0.0.1', r))

process.env.VERCEL = '1'
process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${mock.address().port}`
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-not-real'
process.env.ANTHROPIC_API_KEY = ''
process.env.RATE_LIMIT_PER_MIN = '500'
const { default: app } = await import(new URL('../server/index.js', import.meta.url))
const api = app.listen(0, '127.0.0.1')
await new Promise((r) => api.once('listening', r))
const port = api.address().port

let failures = 0
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}
async function call(path, { method = 'GET', token, body } = {}) {
  const headers = { 'x-forwarded-for': '198.51.100.7' }
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (token) headers.authorization = `Bearer ${token}`
  const r = await fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* keep null */ }
  return { status: r.status, text, json }
}

console.log('\n[1] the publish path EXECUTES (the regression a syntax check cannot see)')
const pub = await call(`/api/publish/${ACT_DEFAULT}`, { method: 'POST', token: JWT_A })
check('owner publishes the default Act → 200', pub.status === 200, `got ${pub.status} ${pub.text.slice(0, 120)}`)
check('response names the Act it published', pub.json?.actId === ACT_DEFAULT, JSON.stringify(pub.json))

console.log('\n[2] act_id is stamped EXPLICITLY on the version row')
const insert = mockLog.filter((l) => l.path === '/rest/v1/passport_versions' && l.method === 'POST').pop()
check('passport_versions insert carries act_id', insert?.body?.act_id === ACT_DEFAULT, JSON.stringify(insert?.body)?.slice(0, 160))

console.log('\n[3] evidence never transfers across Acts')
const snap = insert?.body?.snapshot
const itemTitles = (snap?.items ?? []).map((i) => i.title)
const claimValues = (snap?.claims ?? []).map((c) => c.value)
// Both positives are asserted: without them an EMPTY result would satisfy every
// "absent" check below and the suite would pass while reading nothing at all.
check('default Act item present', itemTitles.includes('DEFAULT-ACT-ITEM'), JSON.stringify(itemTitles))
check('default Act claim present', claimValues.includes('DEFAULT-ACT-CLAIM'), JSON.stringify(claimValues))
check('SECOND Act item absent from the snapshot', !itemTitles.includes('SECOND-ACT-ITEM'), JSON.stringify(itemTitles))
check('SECOND Act claim absent from the snapshot', !claimValues.includes('SECOND-ACT-CLAIM'), JSON.stringify(claimValues))

console.log('\n[4] authority resolves against the ACT, not the caller-supplied URL')
const other = await call(`/api/publish/${ACT_DEFAULT}`, { method: 'POST', token: JWT_B })
check('a different Person publishing this Act → 403', other.status === 403, `got ${other.status}`)
const unknown = await call(`/api/publish/${ACT_UNKNOWN}`, { method: 'POST', token: JWT_A })
check('unknown Act → 404', unknown.status === 404, `got ${unknown.status}`)
const noAuth = await call(`/api/publish/${ACT_DEFAULT}`, { method: 'POST' })
check('no credential → 401', noAuth.status === 401, `got ${noAuth.status}`)

console.log('\n[5] non-default Act publication is REFUSED, and refused in the typed way')
const second = await call(`/api/publish/${ACT_DEFAULT}`, { method: 'POST', token: JWT_A, body: { actId: ACT_SECOND } })
check('owner publishing their SECOND Act → 409', second.status === 409, `got ${second.status} ${second.text.slice(0, 120)}`)
check('refusal is typed act_publish_unavailable', second.json?.error === 'act_publish_unavailable', second.text.slice(0, 120))
check('the refusal wrote NOTHING', !mockLog.some((l) => l.path === '/rest/v1/passport_versions' && l.method === 'POST' && l.body?.act_id === ACT_SECOND))

console.log('\n[5b] a body actId must NEVER stand in for authority over the path id')
// The regression this case exists for: authority was resolved over body.actId
// (which the attacker owns) while BOTH writes keyed on :artistId (which they do
// not). Independent QA reproduced it as a 200 that published another artist.
const before = mockLog.filter((l) => l.path === '/rest/v1/artists' && l.method === 'PATCH').length
const mixed = await call(`/api/publish/${ACT_VICTIM}`, { method: 'POST', token: JWT_A, body: { actId: ACT_DEFAULT } })
check('own actId + ANOTHER person\'s :artistId → refused', mixed.status === 403 || mixed.status === 409,
  `got ${mixed.status} ${mixed.text.slice(0, 120)}`)
const patches = mockLog.filter((l) => l.path === '/rest/v1/artists' && l.method === 'PATCH')
check('no artists row was published by the refused call', patches.length === before,
  `${patches.length - before} PATCH(es): ${patches.slice(before).map((p) => p.url).join(', ')}`)
check('the victim was never named in any publish write',
  !mockLog.some((l) => l.method === 'PATCH' && (l.url || '').includes(ACT_VICTIM)) &&
  !mockLog.some((l) => l.path === '/rest/v1/passport_versions' && l.method === 'POST' && l.body?.artist_id === ACT_VICTIM))

console.log('\n[5c] the successful publish named the RIGHT artists row')
check('PATCH targeted the caller\'s own artist', patches.some((p) => (p.url || '').includes(ACT_DEFAULT)),
  patches.map((p) => p.url).join(', '))

console.log('\n[6] the public passport route executes and stays Act-scoped')
const pp = await call(`/api/passport/${ACT_DEFAULT}`)
check('published artist → 200', pp.status === 200, `got ${pp.status} ${pp.text.slice(0, 120)}`)
check('served payload actually contains the default Act evidence (positive control)',
  pp.text.includes('DEFAULT-ACT-ITEM') && pp.text.includes('DEFAULT-ACT-CLAIM'), pp.text.slice(0, 200))
check('served payload carries no SECOND Act evidence',
  !pp.text.includes('SECOND-ACT-ITEM') && !pp.text.includes('SECOND-ACT-CLAIM'), pp.text.slice(0, 160))

console.log('\n[7] refusals leak nothing internal')
for (const r of [other, unknown, second]) {
  check(`refusal body is a typed code only (${r.status})`,
    /^\{"error":"[a-z_]+"\}$/.test(r.text.trim()), r.text.slice(0, 120))
}

api.close(); mock.close()
console.log('')
if (failures) { console.log(`✗ ACT BOUNDARY: ${failures} failure(s).`); process.exit(1) }
console.log('✓ ACT BOUNDARY: publish executes; act_id stamped; no cross-Act evidence transfer; authority resolves on the Act; non-default publication refused fail-closed and writes nothing.')
process.exit(0)
