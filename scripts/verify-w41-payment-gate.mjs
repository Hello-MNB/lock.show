// ============================================================
// W4-1 (T-44, §1.6 · §14.4) — end-to-end proof that the Gate's "pay" half is
// RECORDABLE in the pilot model, walked in the DEMO build (fixtures only,
// rule 11 — no live data, no email, no DB):
//
//   1. artist opens /artist/offer → sees the Bit number + GP- reference form
//   2. artist marks "I've paid" → pending state + payment_reference_created
//      (pay-INTENT) lands in the analytics ring buffer
//   3. operator opens /admin → the pending reference is listed AND the Gate
//      tiles show product-event counts (payment_reference_created moved)
//   4. operator clicks activate → queue empties (humane empty state),
//      entitlement_activated fires, the verified-pay tile INCREMENTS
//   5. artist returns → Passport active
//
// Standalone: starts its own Vite dev server (DEMO + payments flag) on its own
// port, drives Playwright's own chromium, blocks every non-localhost request.
// NOT wired into package.json — the orchestrator wires verify hooks at wave
// close. Run:  node scripts/verify-w41-payment-gate.mjs
// Screenshots → $W41_QA_DIR (default: <os tmp>/w41-qa).
// ============================================================
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const PORT = Number(process.env.W41_PORT || 4742)
const BASE = `http://127.0.0.1:${PORT}`
const QA = process.env.W41_QA_DIR || join(tmpdir(), 'w41-qa')
const CHROME = process.env.PW_CHROME || '/opt/pw-browsers/chromium-1228/chrome-linux64/chrome'
mkdirSync(QA, { recursive: true })

let failures = 0
const ok = (cond, msg) => {
  console.log(`  ${cond ? '✓' : '✗'} ${msg}`)
  if (!cond) failures++
}

// ── dev server (DEMO build behavior; payments flag ON) ───────────────────────
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  env: { ...process.env, VITE_DEMO: '1', VITE_PAYMENTS_ENABLED: '1' },
  stdio: 'ignore',
})
const killServer = () => { try { vite.kill('SIGTERM') } catch { /* already gone */ } }
process.on('exit', killServer)

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/'); if (r.ok) return } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`dev server never came up on ${BASE}`)
}

const ringCount = (page, name) => page.evaluate((n) => {
  try { return JSON.parse(localStorage.getItem('gigproof_events') || '[]').filter((e) => e.name === n).length }
  catch { return -1 }
}, name)

const tileValue = (page, key) =>
  page.locator(`[data-testid="gate-${key}-n"]`).textContent().then((t) => Number(t.trim()))

try {
  await waitForServer()
  const browser = await chromium.launch({ executablePath: CHROME })
  const ctx = await browser.newContext({ viewport: { width: 480, height: 960 } })
  // Rule: the demo must never touch the network — hard-block non-localhost.
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url())
    return (u.hostname === '127.0.0.1' || u.hostname === 'localhost') ? route.continue() : route.abort()
  })
  const page = await ctx.newPage()
  // Fresh demo state: artist persona, no prior entitlement, empty ring buffer,
  // cookie banner already answered (it would overlap the primary CTA).
  await page.addInitScript(() => {
    if (!localStorage.getItem('gigproof_demo_role')) {
      localStorage.setItem('gigproof_demo_role', 'artist')
      localStorage.removeItem('lock_demo_entitlement')
      localStorage.removeItem('gigproof_events')
      localStorage.setItem('gigproof_consent', JSON.stringify({ value: 'declined', at: Date.now() }))
    }
  })

  // ── 1 · artist sees the offer + reference form ─────────────────────────────
  console.log('[1] artist — offer form reachable in DEMO')
  await page.goto(`${BASE}/artist/offer`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#amountSent', { timeout: 15000 })
  ok(await page.locator('text=GP-DEMO').first().isVisible(), 'GP-DEMO payment reference shown')
  await page.screenshot({ path: join(QA, 'w41-01-artist-offer.png'), fullPage: true })

  // ── 2 · artist marks "I've paid" → pending + payment_reference_created ─────
  console.log('[2] artist — mark paid fires payment_reference_created')
  await page.fill('#amountSent', '199')
  await page.click('button.btn-primary')
  // the pending card, not the transient button spinner (both carry role=status)
  await page.waitForSelector('text=under review', { timeout: 15000 })
  ok((await ringCount(page, 'payment_reference_created')) === 1, 'payment_reference_created in ring buffer')
  const pendingBody = await page.textContent('body')
  ok(/GP-DEMO/.test(pendingBody) && /199/.test(pendingBody), 'pending state carries reference + amount')
  await page.screenshot({ path: join(QA, 'w41-02-artist-pending.png'), fullPage: true })

  // ── 3 · operator sees the reference + Gate tiles ───────────────────────────
  console.log('[3] operator — pending reference listed, Gate tiles render')
  await page.evaluate(() => localStorage.setItem('gigproof_demo_role', 'operator'))
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="gate-entitlement_activated-n"]', { timeout: 15000 })
  ok(await page.locator('#payments >> text=GP-DEMO').first().isVisible(), 'operator sees the GP-DEMO reference')
  const refsBefore = await tileValue(page, 'payment_reference_created')
  const paidBefore = await tileValue(page, 'entitlement_activated')
  // fixture base 1 + this session's artist mark = 2
  ok(refsBefore === 2, `pay-intent tile counts the new reference (got ${refsBefore})`)
  await page.screenshot({ path: join(QA, 'w41-03-admin-pending-reference.png'), fullPage: true })

  // ── 4 · activate → queue empties, verified-pay tile increments ─────────────
  console.log('[4] operator — activate increments the verified-pay tile')
  await page.click('#payments button.btn-primary')
  await page.waitForFunction((before) => {
    const el = document.querySelector('[data-testid="gate-entitlement_activated-n"]')
    return el && Number(el.textContent) === before + 1
  }, paidBefore, { timeout: 15000 })
  ok(true, `entitlement_activated tile incremented (${paidBefore} → ${paidBefore + 1})`)
  ok((await ringCount(page, 'entitlement_activated')) === 1, 'entitlement_activated in ring buffer')
  ok(await page.locator('#payments >> text=GP-DEMO').count() === 0, 'pending queue emptied (humane empty state)')
  await page.screenshot({ path: join(QA, 'w41-04-admin-activated-tile-incremented.png'), fullPage: true })

  // ── 5 · artist is active ───────────────────────────────────────────────────
  console.log('[5] artist — entitlement now active')
  await page.evaluate(() => localStorage.setItem('gigproof_demo_role', 'artist'))
  await page.goto(`${BASE}/artist/offer`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Your Passport is active', { timeout: 15000 })
  ok(true, 'artist sees the active Passport state')
  await page.screenshot({ path: join(QA, 'w41-05-artist-active.png'), fullPage: true })

  await browser.close()
} catch (e) {
  console.error('✗ W4-1 verify crashed:', e.message)
  failures++
} finally {
  killServer()
}

console.log('')
if (failures) { console.log(`✗ W4-1 payment-gate proof: ${failures} failure(s)`); process.exit(1) }
console.log('✓ W4-1 payment-gate proof: artist marks paid → operator activates → Gate tile increments (DEMO fixtures only)')
process.exit(0)
