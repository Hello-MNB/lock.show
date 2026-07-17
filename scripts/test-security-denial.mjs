// ============================================================
// G11 EXECUTABLE SECURITY-DENIAL SUITE — scripts/test-security-denial.mjs
// Boots the REAL server/index.js (express app) on an ephemeral port against a
// LOCAL mock Supabase (node:http) — no real network, no real keys, no secrets.
// Asserts DENIAL behavior (the DOD of G11): what the API refuses, to whom, and
// that refusals never leak internals. One PUBLIC write route must still work.
//
// Covered denial cases (see summary print at the end):
//  1. no Authorization on protected routes            → 401
//  2. garbage / invalid JWT                           → 401
//  3. user A on user B's artist/claim (ownership)     → 403 (+404 unknown)
//  4. /api/notify with a type outside the closed enum → 403
//  5. disallowed CORS origin                          → no ACAO header
//  6. anonymous POST /api/availability-request        → 2xx + server-authored bell
//  7. error bodies leak no stack / internals          → shape-checked, regex-swept
//  8. rate limiter burst > RATE_LIMIT_PER_MIN         → 429
//
// Run: node scripts/test-security-denial.mjs   (wired into `npm run verify`
// as `test:security`). Exit 0 = all denials proven; exit 1 = any failure.
// ============================================================
import { createServer } from 'node:http'

// ── Fixtures (UUID-shaped: /api/availability-request enforces UUID_RE) ──────
const USER_A = '11111111-1111-4111-8111-111111111111'
const USER_B = '22222222-2222-4222-8222-222222222222'
const ARTIST_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' // owned by USER_A, published
const ARTIST_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' // owned by USER_B, published
const ARTIST_GONE = '99999999-9999-4999-8999-999999999999' // does not exist
const CLAIM_B = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' // belongs to ARTIST_B
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
// Valid-FORMAT JWTs (header.payload.signature) — the mock auth endpoint is the
// verifier, exactly like Supabase Auth is for the real server.
const JWT_A = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_A, role: 'authenticated' })}.sigA`
const JWT_B = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_B, role: 'authenticated' })}.sigB`
const JWT_GARBAGE = 'not-a-real.jwt.token'

const ARTISTS = {
  [ARTIST_A]: { id: ARTIST_A, created_by: USER_A, published: true, stage_name: 'Artist A' },
  [ARTIST_B]: { id: ARTIST_B, created_by: USER_B, published: true, stage_name: 'Artist B' },
}

// ── Mock Supabase (auth + PostgREST), request log for assertions ────────────
const mockLog = [] // { method, path, body }
function sendJson(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' })
  res.end(JSON.stringify(obj))
}
function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => { raw += c })
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : null) } catch { resolve(null) } })
  })
}
const mock = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://mock')
  const body = ['POST', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : null
  mockLog.push({ method: req.method, path: u.pathname, body })
  const wantsObject = String(req.headers.accept || '').includes('vnd.pgrst.object')
  const idFilter = (u.searchParams.get('id') || '').replace(/^eq\./, '')

  // Supabase Auth: GET /auth/v1/user — the ONLY JWT verifier, like GoTrue.
  if (u.pathname === '/auth/v1/user') {
    const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')
    const users = { [JWT_A]: USER_A, [JWT_B]: USER_B }
    const id = m && users[m[1]]
    if (!id) return sendJson(res, 401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' })
    return sendJson(res, 200, { id, aud: 'authenticated', role: 'authenticated', email: `${id.slice(0, 8)}@test.local` })
  }

  // PostgREST tables the server touches in these flows.
  if (u.pathname === '/rest/v1/artists') {
    const row = ARTISTS[idFilter]
    return sendJson(res, 200, row ? [row] : [])
  }
  if (u.pathname === '/rest/v1/claims') {
    const row = idFilter === CLAIM_B ? { id: CLAIM_B, artist_id: ARTIST_B } : null
    return sendJson(res, 200, row ? [row] : [])
  }
  if (u.pathname === '/rest/v1/profiles') {
    // Neither test user is an operator — isOperator() must come back false.
    return sendJson(res, 200, idFilter ? [{ id: idFilter, role: 'artist' }] : [])
  }
  if (u.pathname === '/rest/v1/evidence_artifacts') {
    // Deliberate DB failure → the server MUST answer a sanitized 500 (case 7).
    return sendJson(res, 500, { message: 'MOCK-DB-BOOM', details: 'stack-like detail must not reach the client', hint: null, code: 'XX000' })
  }
  if (u.pathname === '/rest/v1/availability_requests' && req.method === 'POST') {
    const row = { id: 'req-0001', created_date: new Date().toISOString(), ...body }
    return sendJson(res, 201, wantsObject ? row : [row])
  }
  if (u.pathname === '/rest/v1/notifications' && req.method === 'POST') {
    return sendJson(res, 201, [])
  }
  if (u.pathname === '/rest/v1/analytics_event') {
    // HEAD count for the budget ledger + inserts — empty either way.
    return sendJson(res, 200, [])
  }
  return sendJson(res, 200, [])
})
await new Promise((r) => mock.listen(0, '127.0.0.1', r))
const mockPort = mock.address().port

// ── Boot the REAL server with stub env (set BEFORE import; dotenv never
// overrides pre-set keys, so a developer's .env.local cannot leak in). ───────
process.env.VERCEL = '1' // suppress the module's own app.listen
process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${mockPort}`
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-not-real'
process.env.ANTHROPIC_API_KEY = '' // realValue('') → null → stub processor, no AI calls
process.env.ALLOWED_ORIGINS = 'http://localhost:5173,https://app.lock.show'
process.env.RATE_LIMIT_PER_MIN = '30'
const { default: app } = await import(new URL('../server/index.js', import.meta.url))
const api = app.listen(0, '127.0.0.1')
await new Promise((r) => api.once('listening', r))
const apiPort = api.address().port

// ── Harness ──────────────────────────────────────────────────────────────────
let failures = 0
const covered = []
function check(name, cond, detail = '') {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}
const allResponses = [] // swept for leaks at the end (case 7)
async function call(path, { method = 'GET', token, body, origin, ip } = {}) {
  const headers = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (token) headers.authorization = `Bearer ${token}`
  if (origin) headers.origin = origin
  headers['x-forwarded-for'] = ip || '198.51.100.1' // default shared bucket (stays < 30 req)
  const res = await fetch(`http://127.0.0.1:${apiPort}${path}`, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* non-JSON stays null */ }
  allResponses.push({ path, status: res.status, text })
  return { status: res.status, headers: res.headers, text, json }
}

const watchdog = setTimeout(() => { console.error('FAIL  suite watchdog (60s) — hung'); process.exit(1) }, 60_000)

try {
  // ── 1. No Authorization header on protected routes → 401 ──────────────────
  console.log('[1] missing Authorization → 401')
  for (const [method, path] of [
    ['POST', '/api/process-evidence'],
    ['POST', `/api/publish/${ARTIST_A}`],
    ['POST', '/api/notify'],
    ['POST', '/api/request-confirmation'],
  ]) {
    const r = await call(path, { method, body: {}, ip: '198.51.100.11' })
    check(`${method} ${path} → 401`, r.status === 401 && r.json?.error === 'auth_required', `got ${r.status} ${r.text}`)
  }
  covered.push('1: no-auth → 401 (4 protected routes)')

  // ── 2. Garbage JWT → 401 ───────────────────────────────────────────────────
  console.log('[2] invalid/garbage JWT → 401')
  const g1 = await call('/api/process-evidence', { method: 'POST', token: JWT_GARBAGE, body: { artistId: ARTIST_A }, ip: '198.51.100.12' })
  check('garbage JWT → 401', g1.status === 401 && g1.json?.error === 'auth_required', `got ${g1.status} ${g1.text}`)
  covered.push('2: invalid JWT → 401')

  // ── 3. Per-object ownership: user A vs user B's objects → 403/404 ─────────
  console.log('[3] cross-user ownership → 403 / unknown → 404')
  const o1 = await call('/api/process-evidence', { method: 'POST', token: JWT_A, body: { artistId: ARTIST_B }, ip: '198.51.100.13' })
  check("A processes B's evidence → 403", o1.status === 403 && o1.json?.error === 'forbidden', `got ${o1.status} ${o1.text}`)
  const o2 = await call('/api/request-confirmation', { method: 'POST', token: JWT_A, body: { claimId: CLAIM_B }, ip: '198.51.100.13' })
  check("A mints confirm token for B's claim → 403", o2.status === 403 && o2.json?.error === 'forbidden', `got ${o2.status} ${o2.text}`)
  const o3 = await call(`/api/publish/${ARTIST_B}`, { method: 'POST', token: JWT_A, ip: '198.51.100.13' })
  check("A publishes B's passport → 403", o3.status === 403 && o3.json?.error === 'forbidden', `got ${o3.status} ${o3.text}`)
  const o4 = await call('/api/process-evidence', { method: 'POST', token: JWT_A, body: { artistId: ARTIST_GONE }, ip: '198.51.100.13' })
  check('unknown artist → 404', o4.status === 404, `got ${o4.status} ${o4.text}`)
  covered.push('3: per-object ownership → 403 (process-evidence, request-confirmation, publish) + 404 unknown')

  // ── 4. /api/notify closed enum + cross-user notify ─────────────────────────
  console.log('[4] notify enum + authorization → 403')
  const n1 = await call('/api/notify', { method: 'POST', token: JWT_A, body: { artistId: ARTIST_A, type: 'evil_type', body: 'x' }, ip: '198.51.100.14' })
  check('notify with type outside enum → 403', n1.status === 403 && n1.json?.error === 'forbidden', `got ${n1.status} ${n1.text}`)
  const n2 = await call('/api/notify', { method: 'POST', token: JWT_A, body: { artistId: ARTIST_B, type: 'system', body: 'spam into B bell' }, ip: '198.51.100.14' })
  check("non-owner non-operator notify into B's bell → 403", n2.status === 403 && n2.json?.error === 'forbidden', `got ${n2.status} ${n2.text}`)
  covered.push('4: notify closed enum → 403 + cross-user notify → 403')

  // ── 5. CORS allowlist ──────────────────────────────────────────────────────
  console.log('[5] CORS allowlist')
  const c1 = await call('/api/health', { origin: 'https://evil.example.com', ip: '198.51.100.15' })
  check('evil origin → no ACAO header', c1.headers.get('access-control-allow-origin') === null, `ACAO=${c1.headers.get('access-control-allow-origin')}`)
  const c2 = await call('/api/health', { origin: 'http://localhost:5173', ip: '198.51.100.15' })
  check('allowlisted origin → ACAO echoed', c2.headers.get('access-control-allow-origin') === 'http://localhost:5173', `ACAO=${c2.headers.get('access-control-allow-origin')}`)
  const c3 = await call('/api/process-evidence', { method: 'OPTIONS', origin: 'https://evil.example.com', ip: '198.51.100.15' })
  check('evil preflight → no ACAO header', c3.headers.get('access-control-allow-origin') === null, `ACAO=${c3.headers.get('access-control-allow-origin')}`)
  covered.push('5: disallowed origin gets no ACAO (GET + preflight); allowlisted origin does')

  // ── 6. Anonymous PUBLIC write: /api/availability-request ──────────────────
  console.log('[6] anonymous availability-request → 2xx + server-authored bell')
  const callerText = 'CALLER-CONTROLLED message text'
  const a1 = await call('/api/availability-request', {
    method: 'POST',
    body: { artistId: ARTIST_A, requester_name: 'Anon Booker', requester_org: 'TestFest', message: callerText },
    ip: '198.51.100.16',
  })
  check('anonymous request → 2xx ok', a1.status >= 200 && a1.status < 300 && a1.json?.ok === true, `got ${a1.status} ${a1.text}`)
  check('request row created for the artist', a1.json?.request?.artist_id === ARTIST_A, a1.text)
  const bell = mockLog.find((e) => e.method === 'POST' && e.path === '/rest/v1/notifications')
  check('server wrote the owner notification itself', Boolean(bell), 'no /rest/v1/notifications insert observed')
  check('notification targets the artist OWNER (user A)', bell?.body?.user_id === USER_A, JSON.stringify(bell?.body))
  check('notification type from the closed enum', bell?.body?.type === 'request_received', JSON.stringify(bell?.body))
  check('notification body is server-authored, not caller text', typeof bell?.body?.body === 'string' && bell.body.body.includes('Anon Booker') && !bell.body.body.includes(callerText), JSON.stringify(bell?.body))
  covered.push('6: anonymous POST /api/availability-request → 2xx, server-authored notification')

  // ── 7. Sanitized errors — no stack / internals in ANY response ────────────
  console.log('[7] error sanitization')
  const e1 = await call('/api/process-evidence', { method: 'POST', token: JWT_A, body: { artistId: ARTIST_A }, ip: '198.51.100.17' })
  check('DB blow-up → 500 {error:"server_error"} only', e1.status === 500 && e1.json?.error === 'server_error' && Object.keys(e1.json).length === 1, `got ${e1.status} ${e1.text}`)
  check('500 body hides the mock DB detail', !e1.text.includes('MOCK-DB-BOOM') && !e1.text.includes('stack-like'), e1.text)
  const LEAK = /\bat\s+\S+ \(.*:\d+:\d+\)|node_modules|server[\\/]index\.js|ReferenceError|SyntaxError|TypeError/
  const leaky = allResponses.filter((r) => LEAK.test(r.text))
  check('no response so far leaks stack/internal paths', leaky.length === 0, leaky.map((l) => `${l.path}→${l.text.slice(0, 80)}`).join(' | '))
  covered.push('7: 500 sanitized to {error:"server_error"}; leak-regex sweep over every captured response')

  // ── 8. Rate limiter: burst beyond RATE_LIMIT_PER_MIN from one IP → 429 ────
  console.log('[8] rate limiter burst → 429')
  const RATE_IP = '203.0.113.99' // dedicated bucket — untouched by cases 1-7
  let okCount = 0
  let firstLimited = null
  for (let i = 1; i <= 31; i++) {
    const r = await call('/api/health', { ip: RATE_IP })
    if (r.status === 200) okCount++
    else if (r.status === 429 && firstLimited === null) firstLimited = { i, json: r.json }
  }
  check('first 30 requests pass', okCount === 30, `okCount=${okCount}`)
  check('31st request → 429 rate_limited', firstLimited?.i === 31 && firstLimited?.json?.error === 'rate_limited', JSON.stringify(firstLimited))
  covered.push('8: 31-request burst from one IP → 30×200 then 429')
} finally {
  clearTimeout(watchdog)
  api.close()
  mock.close()
}

console.log('\n── security-denial suite summary ──')
for (const c of covered) console.log('  covered', c)
if (failures) {
  console.error(`\n${failures} security-denial check(s) FAILED`)
  process.exit(1)
}
console.log('\nAll security-denial checks passed.')
process.exit(0)
