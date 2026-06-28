// ============================================================
// GIGPROOF — one-shot remote setup via the Supabase Management API.
// Uses a Personal Access Token (SUPABASE_ACCESS_TOKEN in .env.local) to:
//   1. apply supabase/apply_to_supabase.sql to the project, and
//   2. fetch the project's secret/service_role key and write it into
//      .env.local (replacing the PASTE_… placeholder).
// After this, `npm run seed` and the AI server work with no manual steps.
//
// The token has account-wide scope — it is read from .env.local (never a
// CLI arg), used only against api.supabase.com, and can be revoked after.
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

function realValue(v) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s || /^(PASTE_|your-|YOUR-)/i.test(s) || s.includes('YOUR-PROJECT')) return null
  return s
}

const TOKEN = realValue(process.env.SUPABASE_ACCESS_TOKEN)
const SUPA_URL = realValue(process.env.VITE_SUPABASE_URL)
if (!TOKEN || !/^sbp_/.test(TOKEN)) {
  console.error('\n✗ Missing SUPABASE_ACCESS_TOKEN (sbp_…) in .env.local. Add it and re-run.\n')
  process.exit(1)
}
if (!SUPA_URL) { console.error('\n✗ Missing VITE_SUPABASE_URL in .env.local.\n'); process.exit(1) }

const ref = SUPA_URL.replace(/^https?:\/\//, '').split('.')[0]

const API = 'https://api.supabase.com'
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

function mask(k) { return k ? k.slice(0, 8) + '…' + k.slice(-4) : '(none)' }

async function applySchema() {
  const sql = readFileSync('supabase/apply_to_supabase.sql', 'utf8')
  const res = await fetch(`${API}/v1/projects/${ref}/database/query`, {
    method: 'POST', headers, body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`apply schema failed (${res.status}): ${body.slice(0, 400)}`)
  }
  console.log('  ✓ schema applied')
}

async function fetchServiceKey() {
  const res = await fetch(`${API}/v1/projects/${ref}/api-keys?reveal=true`, { headers })
  if (!res.ok) throw new Error(`fetch api-keys failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
  const keys = await res.json()
  // Prefer the classic service_role JWT; else a secret key (new key system).
  const svc =
    keys.find((k) => k.name === 'service_role')?.api_key ||
    keys.find((k) => (k.type === 'secret') || /^sb_secret_/.test(k.api_key || ''))?.api_key
  if (!svc) throw new Error('no service_role / secret key found on project')
  return svc
}

function writeServiceKey(key) {
  let env = readFileSync('.env.local', 'utf8')
  if (/^SUPABASE_SERVICE_ROLE_KEY=.*$/m.test(env)) {
    env = env.replace(/^SUPABASE_SERVICE_ROLE_KEY=.*$/m, `SUPABASE_SERVICE_ROLE_KEY=${key}`)
  } else {
    env += `\nSUPABASE_SERVICE_ROLE_KEY=${key}\n`
  }
  writeFileSync('.env.local', env)
  console.log(`  ✓ service key written to .env.local (${mask(key)})`)
}

async function main() {
  console.log(`Setting up project ${ref} …`)
  await applySchema()
  const key = await fetchServiceKey()
  writeServiceKey(key)
  console.log('\n✓ Remote setup complete. Next: npm run seed\n')
}

main().catch((e) => { console.error('\n✗ setup failed:', e.message || e); process.exit(1) })
