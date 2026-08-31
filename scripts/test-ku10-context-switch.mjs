import assert from 'node:assert/strict'
import fs from 'node:fs'

let contract
let contractLoadError
try {
  contract = await import('../src/lib/contextSwitch.js')
} catch (error) {
  contractLoadError = error
}

const tests = []
const test = (name, run) => tests.push({ name, run })
const target = '22222222-2222-4222-8222-222222222222'
const prior = '11111111-1111-4111-8111-111111111111'
const idempotencyKey = '33333333-3333-4333-8333-333333333333'

function requireContract() {
  assert.ok(contract, `context switch contract unavailable: ${contractLoadError?.code || contractLoadError?.message}`)
  return contract
}

function eligiblePreflight(overrides = {}) {
  return {
    ok: true,
    targetOrganizationId: target,
    targetOrganizationName: 'Second workspace',
    targetFunctionalRole: 'artist',
    expectedContextVersion: 7,
    ...overrides,
  }
}

function committedReceipt(overrides = {}) {
  return {
    receiptId: '44444444-4444-4444-8444-444444444444',
    idempotencyKey,
    previousOrganizationId: prior,
    activeOrganizationId: target,
    previousContextVersion: 7,
    contextVersion: 8,
    committedAt: '2026-08-30T20:00:00.000Z',
    ...overrides,
  }
}

function effects() {
  const calls = []
  return {
    calls,
    applyReceipt: (receipt) => calls.push(['apply', receipt.activeOrganizationId]),
    persistLocal: (orgId) => calls.push(['persist', orgId]),
    announce: (receipt) => calls.push(['announce', receipt.receiptId]),
    logCommitted: (receipt) => calls.push(['log', receipt.receiptId]),
    navigate: () => calls.push(['navigate', '/']),
    focusReturn: () => calls.push(['focus']),
    receiptAlreadyApplied: () => false,
    readCurrentContext: async () => ({ organizationId: target, contextVersion: 8 }),
  }
}

test('01 SELECT/PREFLIGHT returns an eligible target without changing context', async () => {
  const { preflightContextSwitch } = requireContract()
  const fx = effects()
  const result = await preflightContextSwitch({
    targetOrganizationId: target,
    currentContext: { organizationId: prior, contextVersion: 7 },
    isOnline: () => true,
    requestPreflight: async () => eligiblePreflight(),
    ...fx,
  })
  assert.equal(result.ok, true)
  assert.equal(result.targetOrganizationId, target)
  assert.deepEqual(fx.calls, [])
})

test('02 COMMIT preserves the prior context and draft state until receipt readback', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  let release
  const pending = commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: () => new Promise((resolve) => { release = resolve }), ...fx,
  })
  await Promise.resolve()
  assert.deepEqual(fx.calls, [])
  release(committedReceipt())
  assert.equal((await pending).ok, true)
})

test('03 a verified receipt updates context, storage, live state, analytics, then navigation', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => committedReceipt(), ...fx,
  })
  assert.equal(result.ok, true)
  assert.deepEqual(fx.calls.map(([name]) => name), ['apply', 'persist', 'announce', 'log', 'navigate'])
})

test('04 cancel performs no server or client mutation and restores focus', async () => {
  const { cancelContextSwitch } = requireContract()
  const fx = effects()
  const result = cancelContextSwitch({ focusReturn: fx.focusReturn })
  assert.deepEqual(result, { ok: false, reason: 'cancelled' })
  assert.deepEqual(fx.calls, [['focus']])
})

test('05 offline preflight never calls the server and preserves prior context', async () => {
  const { preflightContextSwitch } = requireContract()
  const fx = effects()
  let called = false
  const result = await preflightContextSwitch({
    targetOrganizationId: target,
    currentContext: { organizationId: prior, contextVersion: 7 },
    isOnline: () => false,
    requestPreflight: async () => { called = true }, ...fx,
  })
  assert.equal(result.reason, 'offline')
  assert.equal(called, false)
  assert.deepEqual(fx.calls, [])
})

test('06 offline commit performs no mutation and returns focus safely', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  let called = false
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => false,
    requestCommit: async () => { called = true }, ...fx,
  })
  assert.equal(result.reason, 'offline')
  assert.equal(called, false)
  assert.deepEqual(fx.calls, [['focus']])
})

for (const [number, sourceReason] of [
  ['07', 'wrong_workspace'],
  ['08', 'missing_membership'],
  ['09', 'wrong_role'],
  ['10', 'roster_without_artist_access'],
  ['11', 'revoked_membership'],
  ['12', 'expired_artist_access'],
]) {
  test(`${number} ${sourceReason} is denied without disclosing record existence`, async () => {
    const { preflightContextSwitch } = requireContract()
    const result = await preflightContextSwitch({
      targetOrganizationId: target,
      currentContext: { organizationId: prior, contextVersion: 7 },
      isOnline: () => true,
      requestPreflight: async () => ({ ok: false, reason: sourceReason }),
    })
    assert.deepEqual(result, { ok: false, reason: 'not_available' })
    assert.equal(JSON.stringify(result).includes(sourceReason), false)
  })
}

test('13 stale context_version denies the concurrent commit and preserves prior state', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  const error = Object.assign(new Error('context_switch_stale'), { code: 'CONTEXT_SWITCH_STALE' })
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => { throw error }, resolveReceipt: async () => null, ...fx,
  })
  assert.deepEqual(result, { ok: false, reason: 'stale' })
  assert.deepEqual(fx.calls, [['focus']])
})

test('14 an explicit commit failure preserves prior context, draft and filters', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  const error = Object.assign(new Error('context_switch_not_available'), { code: 'CONTEXT_SWITCH_NOT_AVAILABLE' })
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => { throw error }, ...fx,
  })
  assert.deepEqual(result, { ok: false, reason: 'not_available' })
  assert.deepEqual(fx.calls, [['focus']])
})

test('15 commit uncertainty without a receipt does not guess success', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => { throw new TypeError('network interrupted') },
    resolveReceipt: async () => null, ...fx,
  })
  assert.deepEqual(result, { ok: false, reason: 'uncertain' })
  assert.deepEqual(fx.calls, [['focus']])
})

test('16 retry resolves the same idempotent receipt and applies it once', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  let resolvedKey
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => { throw new TypeError('response lost') },
    resolveReceipt: async (key) => { resolvedKey = key; return committedReceipt() }, ...fx,
  })
  assert.equal(result.ok, true)
  assert.equal(result.recovered, true)
  assert.equal(resolvedKey, idempotencyKey)
  assert.equal(fx.calls.filter(([name]) => name === 'apply').length, 1)
})

test('17 a mismatched or malformed receipt is non-disclosing and never applied', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => committedReceipt({ activeOrganizationId: prior }), ...fx,
  })
  assert.deepEqual(result, { ok: false, reason: 'invalid_receipt' })
  assert.deepEqual(fx.calls, [['focus']])
})

test('18 an already-applied idempotent receipt never repeats client side effects', async () => {
  const { commitContextSwitch } = requireContract()
  const fx = effects()
  fx.receiptAlreadyApplied = (receiptId) => receiptId === committedReceipt().receiptId
  const result = await commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => committedReceipt(), ...fx,
  })
  assert.equal(result.ok, true)
  assert.equal(result.replayed, true)
  assert.deepEqual(fx.calls, [])
})

test('19 a historical receipt cannot replace a newer authoritative context', async () => {
  const fx = effects()
  let unresolved = false
  const result = await requireContract().commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => committedReceipt(),
    ...fx,
    readCurrentContext: async () => ({ organizationId: prior, contextVersion: 9 }),
    markUnresolved: () => { unresolved = true },
  })
  assert.equal(result.ok, false)
  assert.equal(unresolved, true)
  assert.equal(fx.calls.some(([name]) => name === 'apply' || name === 'persist'), false)
})

test('20 unknown outcome locks actions through failed recovery, then re-enters only from server readback', async () => {
  const fx = effects()
  const draft = { text: 'keep this draft', filter: 'mine' }
  let unresolved = false
  let commits = 0
  let active = prior
  const markUnresolved = () => { unresolved = true }
  const result = await requireContract().commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, isOnline: () => true,
    requestCommit: async () => { commits++; throw new TypeError('committed but response lost') },
    resolveReceipt: async () => { throw new TypeError('receipt read offline') },
    markUnresolved, ...fx,
  })
  assert.equal(result.ok, false)
  assert.equal(unresolved, true, 'normal actions must be locked when outcome is unknown')
  const recover = requireContract().recoverContextSwitch
  const failed = await recover({
    preflight: eligiblePreflight(), idempotencyKey,
    resolveCommitOutcome: async () => committedReceipt(),
    readCurrentContext: async () => { throw new TypeError('offline') },
    applyContext: () => assert.fail('failed read cannot resume actions'), markUnresolved,
  })
  assert.equal(failed.ok, false)
  assert.equal(unresolved, true)
  const recovered = await recover({
    preflight: eligiblePreflight(), idempotencyKey,
    resolveCommitOutcome: async () => committedReceipt(),
    readCurrentContext: async () => ({ organizationId: target, contextVersion: 8 }),
    applyContext: (context) => { active = context.organizationId; unresolved = false }, markUnresolved,
  })
  assert.equal(recovered.ok, true)
  assert.equal(active, target)
  assert.equal(unresolved, false)
  assert.equal(commits, 1, 'recovery must not submit a new commit')
  assert.deepEqual(draft, { text: 'keep this draft', filter: 'mine' })
  assert.equal(fx.calls.some(([name]) => ['apply', 'persist', 'navigate'].includes(name)), false)
})

test('21 mandatory technical baseline resolves to the guarded real PostgreSQL suite', async () => {
  const { scripts } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const expand = (name, seen = new Set()) => {
    assert.equal(seen.has(name), false, 'script cycle')
    const next = new Set([...seen, name])
    return scripts[name].split('&&').flatMap((command) => {
      const child = command.trim().match(/^npm run ([\w:-]+)(.*)$/)
      return child ? expand(child[1], next) : [command.trim()]
    })
  }
  assert.ok(expand('tech-baseline:verify').some((command) =>
    command.startsWith('node scripts/tech-baseline/run-authoritative-context-switch.mjs')),
  'mandatory verification must execute the real database runner, not only mocked client tests')
})

test('22 a prior-context read cannot unlock while the original commit outcome is still pending', async () => {
  let applied = false
  const result = await requireContract().recoverContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey,
    resolveCommitOutcome: async () => null,
    readCurrentContext: async () => ({ organizationId: prior, contextVersion: 7 }),
    applyContext: () => { applied = true },
  })
  assert.equal(result.ok, false)
  assert.equal(applied, false)
})

test('23 a recovered already-applied retry unlocks without duplicating receipt effects', async () => {
  const fx = effects()
  let locked = false
  const result = await requireContract().commitContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey, ...fx,
    requestCommit: async () => { throw new TypeError('retry response lost') },
    resolveReceipt: async () => committedReceipt(),
    receiptAlreadyApplied: () => true,
    markUnresolved: () => { locked = true },
    markResolved: () => { locked = false },
  })
  assert.equal(result.ok, true)
  assert.equal(locked, false)
  assert.deepEqual(fx.calls, [])
})

function noncommitOutcome(overrides = {}) {
  return {
    outcome: 'not_committed', outcomeId: '55555555-5555-4555-8555-555555555555',
    idempotencyKey, targetOrganizationId: target, targetArtistId: null,
    expectedContextVersion: 7, contextVersion: 7,
    resolvedAt: '2026-08-30T21:00:00.000Z', ...overrides,
  }
}

for (const scenario of ['never received', 'rolled back']) {
  test(`24/25 ${scenario}: restored network plus exact noncommit fence safely restores the unchanged context`, async () => {
    let locked = true
    let active = prior
    let requests = 0
    const draft = { text: 'unsaved', filter: 'mine' }
    const pending = await requireContract().commitContextSwitch({
      preflight: eligiblePreflight(), idempotencyKey,
      requestCommit: async () => { requests++; throw new TypeError(scenario) },
      resolveReceipt: async () => null, markUnresolved: () => { locked = true },
    })
    assert.equal(pending.reason, 'uncertain')
    const result = await requireContract().recoverContextSwitch({
      preflight: eligiblePreflight(), idempotencyKey,
      resolveCommitOutcome: async (key, preflight) => {
        assert.equal(key, idempotencyKey)
        assert.deepEqual(preflight, eligiblePreflight())
        return noncommitOutcome()
      },
      readCurrentContext: async () => ({ organizationId: prior, contextVersion: 7 }),
      applyContext: (context) => { active = context.organizationId; locked = false },
      markUnresolved: () => { locked = true },
    })
    assert.equal(result.ok, true, 'an authoritative durable fence must end noncommit uncertainty')
    assert.equal(active, prior)
    assert.equal(locked, false)
    assert.equal(requests, 1, 'reconciliation never submits another switch')
    assert.deepEqual(draft, { text: 'unsaved', filter: 'mine' })
  })
}

test('26 incomplete or mismatched noncommit proofs stay fail-closed without reading/applying context', async () => {
  for (const override of [
    { outcomeId: null }, { resolvedAt: null }, { idempotencyKey: 'wrong' },
    { targetOrganizationId: prior }, { targetArtistId: 'wrong' },
    { expectedContextVersion: 8 }, { contextVersion: -1 },
  ]) {
    const result = await requireContract().recoverContextSwitch({
      preflight: eligiblePreflight(), idempotencyKey,
      resolveCommitOutcome: async () => noncommitOutcome(override),
      readCurrentContext: async () => assert.fail('invalid proof cannot authorize a context read'),
      applyContext: () => assert.fail('invalid proof cannot unlock'),
    })
    assert.equal(result.ok, false)
  }
})

test('27 a valid noncommit fence never applies a context older than its serialized observation', async () => {
  const result = await requireContract().recoverContextSwitch({
    preflight: eligiblePreflight(), idempotencyKey,
    resolveCommitOutcome: async () => noncommitOutcome({ contextVersion: 9 }),
    readCurrentContext: async () => ({ organizationId: prior, contextVersion: 7 }),
    applyContext: () => assert.fail('stale context cannot unlock'),
  })
  assert.equal(result.ok, false)
})

for (const [number, laterSwitch] of [[28, false], [29, true]]) {
  test(`${number} successful manual recovery retires the pending continuation${laterSwitch ? ' before a later legitimate switch' : ' in the same current context'}`, async () => {
    const preflight = { ok: true, targetOrganizationId: 'org-b', expectedContextVersion: 0 }
    const receipt = {
      receiptId: 'r-1', idempotencyKey: 'k-1', activeOrganizationId: 'org-b',
      previousOrganizationId: 'org-a', previousContextVersion: 0,
      contextVersion: 1, committedAt: '2026-08-31T00:00:00Z',
    }
    let current = { organizationId: 'org-b', contextVersion: 1 }
    let generation = 0
    const operationGeneration = generation
    let locked = false
    let releaseReceipt
    let receiptPending
    const waitingForReceipt = new Promise((resolve) => { receiptPending = resolve })
    const lateEffects = []
    const draft = { text: 'unsaved draft', filter: 'mine' }
    let recoveryFinished = false
    const markUnresolved = () => {
      locked = true
      if (recoveryFinished) lateEffects.push('relock')
    }
    const oldCommit = requireContract().commitContextSwitch({
      preflight, idempotencyKey: 'k-1', isCurrent: () => generation === operationGeneration,
      requestCommit: async () => { throw new TypeError('connection-lost') },
      resolveReceipt: () => { receiptPending(); return new Promise((resolve) => { releaseReceipt = resolve }) },
      readCurrentContext: async () => current,
      markUnresolved,
      markResolved: () => { lateEffects.push('unlock'); locked = false },
      applyReceipt: () => lateEffects.push('apply'),
      persistLocal: () => lateEffects.push('persist'),
      navigate: () => lateEffects.push('navigate'),
      announce: () => lateEffects.push('announce'),
      logCommitted: () => lateEffects.push('log'),
      focusReturn: () => lateEffects.push('focus'),
    })
    await waitingForReceipt
    assert.equal(locked, true)
    const applyContext = () => { generation++; locked = false }
    const recoveryArgs = {
      preflight, idempotencyKey: 'k-1', resolveCommitOutcome: async () => receipt,
      readCurrentContext: async () => current, applyContext, markUnresolved,
    }
    const failed = await requireContract().recoverContextSwitch({
      ...recoveryArgs, readCurrentContext: async () => { throw new TypeError('still offline') },
    })
    assert.equal(failed.ok, false)
    assert.equal(generation, 0, 'failed recovery must not retire the original operation')
    assert.equal(locked, true)
    let releaseRecovery
    const manualRecovery = requireContract().recoverContextSwitch({
      ...recoveryArgs,
      readCurrentContext: () => new Promise((resolve) => { releaseRecovery = resolve }),
    })
    await Promise.resolve()
    assert.equal(generation, 0, 'pending recovery must not retire the original operation')
    assert.equal(locked, true)
    releaseRecovery(current)
    assert.equal((await manualRecovery).ok, true)
    assert.equal(locked, false)
    recoveryFinished = true
    if (laterSwitch) current = { organizationId: 'org-c', contextVersion: 2 }
    releaseReceipt(receipt)
    const oldResult = await oldCommit
    assert.deepEqual(lateEffects, [], 'retired continuation cannot apply, navigate, announce/log, focus or re-lock')
    assert.deepEqual(oldResult, { ok: false, reason: 'superseded' })
    assert.equal(locked, false)
    assert.deepEqual(current, laterSwitch
      ? { organizationId: 'org-c', contextVersion: 2 }
      : { organizationId: 'org-b', contextVersion: 1 })
    assert.deepEqual(draft, { text: 'unsaved draft', filter: 'mine' })
  })
}

let passed = 0
const failures = []
for (const { name, run } of tests) {
  try {
    await run()
    passed += 1
    console.log(`PASS ${name}`)
  } catch (error) {
    failures.push({ name, error })
    console.error(`FAIL ${name}: ${error.message}`)
  }
}

console.log(`KU10_CONTEXT_SWITCH=${passed}/${tests.length}`)
if (failures.length) process.exitCode = 1
