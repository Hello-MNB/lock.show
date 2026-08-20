import test from 'node:test'
import assert from 'node:assert/strict'

async function optionalImport(path) {
  try {
    return await import(path)
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') return null
    throw error
  }
}

const contracts = await optionalImport('../src/lib/radarScanner/contracts.js')
const pipeline = await optionalImport('../src/lib/radarScanner/pipeline.js')
const storeModule = await optionalImport('../src/lib/radarScanner/memoryStore.js')
const passport = await optionalImport('../src/lib/radarScanner/passportFirewall.js')

const SOURCE = Object.freeze({
  sourceId: 'source-1',
  sourceType: 'artist-provided-link',
  content: 'Northern Pulse played the closing slot at Test Festival.',
  acquiredAt: '2026-08-20T00:00:00.000Z',
  ttlSeconds: 3600,
  consent: { status: 'accepted', actorId: 'user-a', recordedAt: '2026-08-20T00:00:00.000Z' },
  identity: { state: 'confirmed', actId: 'act-a' },
})

const CONTEXT = Object.freeze({
  actorId: 'user-a',
  environmentId: 'preview-a',
  workspaceId: 'workspace-a',
  organizationId: 'org-a',
  actId: 'act-a',
  returnTo: '/artist/radar',
})

function requireApi() {
  assert.ok(contracts, 'contracts module must exist')
  assert.ok(pipeline, 'pipeline module must exist')
  assert.ok(storeModule, 'memory store module must exist')
  assert.ok(passport, 'passport firewall module must exist')
}

function makeStore(options = {}) {
  requireApi()
  return storeModule.createMemoryRadarStore({
    grants: [{
      actorId: 'user-a',
      environmentId: 'preview-a',
      workspaceId: 'workspace-a',
      organizationId: 'org-a',
      actId: 'act-a',
      permissions: ['radar.scan', 'radar.review'],
    }],
    ...options,
  })
}

function deterministicResolved(source) {
  return {
    status: 'resolved',
    candidate: {
      semanticKind: 'attributed-claim',
      claimType: 'appearance-history',
      value: source.content,
      evidenceStatus: 'self-reported',
      limitation: 'Artist-provided test evidence; not independently verified.',
    },
  }
}

test('preflight denies cross-user, cross-Environment and cross-Act access', async () => {
  requireApi()
  const store = makeStore()
  const invalidContexts = [
    { ...CONTEXT, actorId: 'user-b' },
    { ...CONTEXT, environmentId: 'production' },
    { ...CONTEXT, actId: 'act-b' },
  ]

  for (const context of invalidContexts) {
    await assert.rejects(
      pipeline.runInternalScan({ store, context, sources: [SOURCE], deterministicParse: deterministicResolved }),
      (error) => error?.code === 'DENIED_CONTEXT',
    )
    await assert.rejects(
      store.listClaimCandidates(context),
      (error) => error?.code === 'DENIED_CONTEXT',
    )
  }
})

test('identity ambiguity blocks source attachment before snapshot creation', async () => {
  requireApi()
  const store = makeStore()
  await assert.rejects(
    pipeline.runInternalScan({
      store,
      context: CONTEXT,
      sources: [{ ...SOURCE, identity: { state: 'ambiguous', candidateActIds: ['act-a', 'act-b'] } }],
      deterministicParse: deterministicResolved,
    }),
    (error) => error?.code === 'IDENTITY_AMBIGUOUS',
  )
  assert.equal((await store.listSourceSnapshots(CONTEXT)).length, 0)
})

test('oversized manual artifact fails closed before persistence or parsing', async () => {
  requireApi()
  const store = makeStore()
  let parserCalls = 0
  await assert.rejects(
    pipeline.runInternalScan({
      store,
      context: CONTEXT,
      sources: [{ ...SOURCE, content: 'x'.repeat(1_000_001) }],
      deterministicParse: () => { parserCalls += 1; return deterministicResolved(SOURCE) },
    }),
    (error) => error?.code === 'SOURCE_CONTENT_TOO_LARGE',
  )
  assert.equal(parserCalls, 0)
  assert.equal((await store.listSourceSnapshots(CONTEXT)).length, 0)
})

test('duplicate content hash creates no second ClaimCandidate and makes zero model calls', async () => {
  requireApi()
  const store = makeStore()
  let modelCalls = 0
  const callModel = async () => { modelCalls += 1; throw new Error('model must not run') }

  const first = await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved, callModel })
  const second = await pipeline.runInternalScan({ store, context: CONTEXT, sources: [{ ...SOURCE, sourceId: 'source-2' }], deterministicParse: deterministicResolved, callModel })

  assert.equal(first.result, 'completed')
  assert.equal(second.result, 'unchanged')
  assert.equal((await store.listClaimCandidates(CONTEXT)).length, 1)
  assert.equal(modelCalls, 0)
})

test('unchanged duplicate still requires current source consent', async () => {
  requireApi()
  const store = makeStore()
  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })

  await assert.rejects(
    pipeline.runInternalScan({
      store,
      context: CONTEXT,
      sources: [{ ...SOURCE, sourceId: 'source-withdrawn', consent: { ...SOURCE.consent, status: 'withdrawn' } }],
      deterministicParse: deterministicResolved,
    }),
    (error) => error?.code === 'SOURCE_PERMISSION_REQUIRED',
  )
})

test('expired TTL creates refresh work while unchanged content still costs zero', async () => {
  requireApi()
  const store = makeStore()
  let modelCalls = 0
  const callModel = async () => { modelCalls += 1; throw new Error('model must not run') }

  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved, callModel, now: SOURCE.acquiredAt })
  const refreshAt = '2026-08-20T02:00:00.000Z'
  const due = await pipeline.listRefreshCandidates({ store, context: CONTEXT, now: refreshAt })
  assert.equal(due.length, 1)

  const refresh = await pipeline.runInternalScan({
    store,
    context: CONTEXT,
    sources: [{ ...SOURCE, sourceId: 'source-refresh', acquiredAt: refreshAt }],
    deterministicParse: deterministicResolved,
    callModel,
    now: refreshAt,
  })
  assert.equal(refresh.result, 'unchanged')
  assert.equal(refresh.receipt.cost.actualUsd, 0)
  assert.equal(refresh.receipt.model.callCount, 0)
  assert.equal(modelCalls, 0)
  assert.equal((await pipeline.listRefreshCandidates({ store, context: CONTEXT, now: refreshAt })).length, 0)
})

test('deterministic parsing runs first and AI escalates only for the named ambiguity fixture', async () => {
  requireApi()
  const store = makeStore()
  const order = []
  const deterministicParse = () => { order.push('deterministic'); return { status: 'ambiguous', reason: 'AMBIGUOUS_SOURCE_DATE' } }
  const callModel = async () => {
    order.push('model')
    return {
      output: {
        semanticKind: 'attributed-claim',
        claimType: 'appearance-history',
        value: 'Closing slot, date requires confirmation.',
        evidenceStatus: 'self-reported',
        limitation: 'Model-assisted extraction from consented test evidence.',
      },
      usage: { model: 'test-small-model', inputTokens: 22, outputTokens: 11, cacheReadTokens: 0, retries: 0, actualUsd: 0.00012 },
    }
  }

  const result = await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse, callModel })
  assert.deepEqual(order, ['deterministic', 'model'])
  assert.equal(result.receipt.model.reason, 'AMBIGUOUS_SOURCE_DATE')
  assert.equal(result.receipt.model.callCount, 1)
  assert.equal(result.receipt.cost.actualUsd, 0.00012)
})

test('multi-source receipt aggregates every model call and preserves per-call usage', async () => {
  requireApi()
  const store = makeStore()
  let callCount = 0
  const callModel = async () => {
    callCount += 1
    return {
      output: {
        semanticKind: 'attributed-claim',
        claimType: 'appearance-history',
        value: `Ambiguous appearance ${callCount}`,
        evidenceStatus: 'self-reported',
        limitation: 'Model-assisted extraction from consented test evidence.',
      },
      usage: {
        model: `test-model-${callCount}`,
        inputTokens: 10 * callCount,
        outputTokens: 5 * callCount,
        cacheReadTokens: callCount,
        retries: callCount - 1,
        actualUsd: 0.001 * callCount,
      },
    }
  }
  const secondSource = { ...SOURCE, sourceId: 'source-2', content: 'Second ambiguous appearance.' }
  const result = await pipeline.runInternalScan({
    store,
    context: CONTEXT,
    sources: [SOURCE, secondSource],
    deterministicParse: () => ({ status: 'ambiguous', reason: 'AMBIGUOUS_SOURCE_DATE' }),
    callModel,
  })

  assert.equal(result.receipt.model.callCount, 2)
  assert.equal(result.receipt.model.model, 'multiple')
  assert.equal(result.receipt.model.inputTokens, 30)
  assert.equal(result.receipt.model.outputTokens, 15)
  assert.equal(result.receipt.model.cacheReadTokens, 3)
  assert.equal(result.receipt.model.retries, 1)
  assert.deepEqual(result.receipt.model.calls.map((call) => call.model), ['test-model-1', 'test-model-2'])
  assert.equal(result.receipt.cost.actualUsd, 0.003)
})

test('cost ledger failure fails closed before any model spend', async () => {
  requireApi()
  const store = makeStore({ failCostLedger: true })
  let modelCalls = 0
  await assert.rejects(
    pipeline.runInternalScan({
      store,
      context: CONTEXT,
      sources: [SOURCE],
      deterministicParse: () => ({ status: 'ambiguous', reason: 'AMBIGUOUS_SOURCE_DATE' }),
      callModel: async () => { modelCalls += 1; return {} },
    }),
    (error) => error?.code === 'COST_LEDGER_UNAVAILABLE',
  )
  assert.equal(modelCalls, 0)
})

test('sanitization rejects score, rank, booking-probability, demand and success claims', () => {
  requireApi()
  const prohibited = [
    'Artist score: 91',
    'Top rank in the market',
    'Booking probability is high',
    'Strong demand confirmed',
    'Success is guaranteed',
  ]
  for (const value of prohibited) {
    assert.throws(
      () => contracts.sanitizeClaimCandidate({
        semanticKind: 'interpretation', claimType: 'market-signal', value,
        evidenceStatus: 'supporting', limitation: 'test',
      }),
      (error) => error?.code === 'PROHIBITED_INFERENCE',
    )
  }
})

test('confirm, correct, hide, dispute and defer preserve source lineage and immutable history', async () => {
  requireApi()
  const store = makeStore()
  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })
  const [candidate] = await store.listClaimCandidates(CONTEXT)
  const original = structuredClone(candidate)

  for (const action of [
    { type: 'confirm' },
    { type: 'correct', value: 'Corrected appearance history.' },
    { type: 'hide', reason: 'private-context' },
    { type: 'dispute', reason: 'wrong-event' },
    { type: 'defer', reason: 'awaiting-source' },
  ]) {
    await pipeline.applyClaimAction({ store, context: CONTEXT, candidateId: candidate.id, action })
  }

  const history = await store.getClaimHistory(CONTEXT, candidate.id)
  assert.equal(history.length, 6)
  assert.deepEqual(history[0], original)
  assert.equal(history.at(-1).sourceSnapshotId, original.sourceSnapshotId)
  assert.equal(history.at(-1).sourceHash, original.sourceHash)
  assert.equal(history.at(-1).state, 'deferred')
})

test('claim history cannot be read through a different authorized context', async () => {
  requireApi()
  const otherContext = { ...CONTEXT, actorId: 'user-b', workspaceId: 'workspace-b' }
  const store = storeModule.createMemoryRadarStore({
    grants: [
      { ...CONTEXT, permissions: ['radar.scan', 'radar.review'] },
      { ...otherContext, permissions: ['radar.scan', 'radar.review'] },
    ],
  })
  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })
  const [candidate] = await store.listClaimCandidates(CONTEXT)

  await assert.rejects(
    store.getClaimHistory(otherContext, candidate.id),
    (error) => error?.code === 'CLAIM_CANDIDATE_NOT_FOUND',
  )
})

test('human correction cannot bypass prohibited-inference sanitization', async () => {
  requireApi()
  const store = makeStore()
  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })
  const [candidate] = await store.listClaimCandidates(CONTEXT)

  await assert.rejects(
    pipeline.applyClaimAction({
      store,
      context: CONTEXT,
      candidateId: candidate.id,
      action: { type: 'correct', value: 'Booking probability is 92 percent.' },
    }),
    (error) => error?.code === 'PROHIBITED_INFERENCE',
  )
})

test('ScanRunReceipt records the governed context, source, method, model, cost and return', async () => {
  requireApi()
  const store = makeStore()
  const result = await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })
  const receipt = result.receipt

  assert.equal(receipt.actorId, CONTEXT.actorId)
  assert.equal(receipt.environmentId, CONTEXT.environmentId)
  assert.equal(receipt.workspaceId, CONTEXT.workspaceId)
  assert.equal(receipt.organizationId, CONTEXT.organizationId)
  assert.equal(receipt.actId, CONTEXT.actId)
  assert.equal(receipt.sources.length, 1)
  assert.match(receipt.sources[0].hash, /^[a-f0-9]{64}$/)
  assert.equal(receipt.method, 'deterministic-first')
  assert.deepEqual(receipt.model, { callCount: 0, model: null, reason: null, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, retries: 0, calls: [] })
  assert.equal(receipt.cost.actualUsd, 0)
  assert.equal(receipt.cost.estimatedUsd, null)
  assert.equal(receipt.result, 'completed')
  assert.equal(receipt.consequence, 'private-claim-candidates-only')
  assert.equal(receipt.returnTo, CONTEXT.returnTo)
})

test('RADAR scan and review actions never create or update PASSPORT state', async () => {
  requireApi()
  const store = makeStore()
  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })
  const [candidate] = await store.listClaimCandidates(CONTEXT)
  await pipeline.applyClaimAction({ store, context: CONTEXT, candidateId: candidate.id, action: { type: 'confirm' } })
  assert.deepEqual(await store.listPassportVersions(CONTEXT), [])
})

test('PASSPORT firewall fails closed unless eligibility, owner decision and recipient access all pass', () => {
  requireApi()
  const base = {
    eligibility: { passed: true, projectionId: 'projection-a', evidenceId: 'candidate-1', checkedAt: '2026-08-20T00:00:00.000Z' },
    ownerDecision: { passed: true, projectionId: 'projection-a', versionId: 'version-a', decision: 'approve', actorId: 'user-a', previewHash: 'preview-hash-a', decidedAt: '2026-08-20T00:01:00.000Z' },
    recipientAccess: { passed: true, projectionId: 'projection-a', versionId: 'version-a', approvedPreviewHash: 'preview-hash-a', recipientId: 'recipient-a', purpose: 'booking-review', expiresAt: '2026-08-21T00:00:00.000Z', checkedAt: '2026-08-20T00:02:00.000Z' },
  }

  for (const missing of ['eligibility', 'ownerDecision', 'recipientAccess']) {
    assert.throws(
      () => passport.authorizePassportProjection({ ...base, [missing]: null }),
      (error) => error?.code === `PASSPORT_${missing.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}_REQUIRED`,
    )
  }
  assert.equal(passport.authorizePassportProjection(base, { now: '2026-08-20T03:00:00.000Z' }).authorized, true)
  assert.throws(
    () => passport.authorizePassportProjection(base, { now: '2026-08-22T00:00:00.000Z' }),
    (error) => error?.code === 'PASSPORT_RECIPIENT_ACCESS_EXPIRED',
  )
})

test('PASSPORT firewall rejects gates without required projection, version, and preview bindings', () => {
  requireApi()
  const base = {
    eligibility: { passed: true, projectionId: 'projection-a', evidenceId: 'candidate-1', checkedAt: '2026-08-20T00:00:00.000Z' },
    ownerDecision: { passed: true, projectionId: 'projection-a', versionId: 'version-a', decision: 'approve', actorId: 'user-a', previewHash: 'preview-hash-a', decidedAt: '2026-08-20T00:01:00.000Z' },
    recipientAccess: { passed: true, projectionId: 'projection-a', versionId: 'version-a', approvedPreviewHash: 'preview-hash-a', recipientId: 'recipient-a', purpose: 'booking-review', expiresAt: '2026-08-21T00:00:00.000Z', checkedAt: '2026-08-20T00:02:00.000Z' },
  }
  const missingBindings = [
    ['eligibility', 'projectionId', 'PASSPORT_ELIGIBILITY_PROJECTION_REQUIRED'],
    ['ownerDecision', 'projectionId', 'PASSPORT_OWNER_PROJECTION_REQUIRED'],
    ['recipientAccess', 'projectionId', 'PASSPORT_RECIPIENT_PROJECTION_REQUIRED'],
    ['ownerDecision', 'versionId', 'PASSPORT_OWNER_VERSION_REQUIRED'],
    ['recipientAccess', 'versionId', 'PASSPORT_RECIPIENT_VERSION_REQUIRED'],
    ['ownerDecision', 'previewHash', 'PASSPORT_OWNER_PREVIEW_REQUIRED'],
    ['recipientAccess', 'approvedPreviewHash', 'PASSPORT_RECIPIENT_PREVIEW_REQUIRED'],
  ]

  for (const [gate, field, code] of missingBindings) {
    assert.throws(
      () => passport.authorizePassportProjection({ ...base, [gate]: { ...base[gate], [field]: '' } }),
      (error) => error?.code === code,
    )
  }
})

test('PASSPORT firewall rejects gates assembled from different projections, versions, or previews', () => {
  requireApi()
  const base = {
    eligibility: { passed: true, projectionId: 'projection-a', evidenceId: 'candidate-1', checkedAt: '2026-08-20T00:00:00.000Z' },
    ownerDecision: { passed: true, projectionId: 'projection-a', versionId: 'version-a', decision: 'approve', actorId: 'user-a', previewHash: 'preview-hash-a', decidedAt: '2026-08-20T00:01:00.000Z' },
    recipientAccess: { passed: true, projectionId: 'projection-a', versionId: 'version-a', approvedPreviewHash: 'preview-hash-a', recipientId: 'recipient-a', purpose: 'booking-review', expiresAt: '2026-08-21T00:00:00.000Z', checkedAt: '2026-08-20T00:02:00.000Z' },
  }
  const mixedArtifacts = [
    [{ ...base, ownerDecision: { ...base.ownerDecision, projectionId: 'projection-b' } }, 'PASSPORT_PROJECTION_MISMATCH'],
    [{ ...base, recipientAccess: { ...base.recipientAccess, projectionId: 'projection-c' } }, 'PASSPORT_PROJECTION_MISMATCH'],
    [{ ...base, recipientAccess: { ...base.recipientAccess, versionId: 'version-b' } }, 'PASSPORT_VERSION_MISMATCH'],
    [{ ...base, recipientAccess: { ...base.recipientAccess, approvedPreviewHash: 'preview-hash-b' } }, 'PASSPORT_PREVIEW_MISMATCH'],
  ]

  for (const [input, code] of mixedArtifacts) {
    assert.throws(
      () => passport.authorizePassportProjection(input, { now: '2026-08-20T03:00:00.000Z' }),
      (error) => error?.code === code,
    )
  }
})

test('PASSPORT firewall rejects whitespace aliases in security binding identifiers', () => {
  requireApi()
  const base = {
    eligibility: { passed: true, projectionId: 'projection-a', evidenceId: 'candidate-1', checkedAt: '2026-08-20T00:00:00.000Z' },
    ownerDecision: { passed: true, projectionId: 'projection-a', versionId: 'version-a', decision: 'approve', actorId: 'user-a', previewHash: 'preview-hash-a', decidedAt: '2026-08-20T00:01:00.000Z' },
    recipientAccess: { passed: true, projectionId: 'projection-a', versionId: 'version-a', approvedPreviewHash: 'preview-hash-a', recipientId: 'recipient-a', purpose: 'booking-review', expiresAt: '2026-08-21T00:00:00.000Z', checkedAt: '2026-08-20T00:02:00.000Z' },
  }
  const aliases = [
    ['eligibility', 'projectionId', 'PASSPORT_ELIGIBILITY_PROJECTION_INVALID'],
    ['ownerDecision', 'projectionId', 'PASSPORT_OWNER_PROJECTION_INVALID'],
    ['recipientAccess', 'projectionId', 'PASSPORT_RECIPIENT_PROJECTION_INVALID'],
    ['ownerDecision', 'versionId', 'PASSPORT_OWNER_VERSION_INVALID'],
    ['recipientAccess', 'versionId', 'PASSPORT_RECIPIENT_VERSION_INVALID'],
    ['ownerDecision', 'previewHash', 'PASSPORT_OWNER_PREVIEW_INVALID'],
    ['recipientAccess', 'approvedPreviewHash', 'PASSPORT_RECIPIENT_PREVIEW_INVALID'],
  ]

  for (const [gate, field, code] of aliases) {
    assert.throws(
      () => passport.authorizePassportProjection({ ...base, [gate]: { ...base[gate], [field]: ` ${base[gate][field]} ` } }),
      (error) => error?.code === code,
    )
  }
})

test('source invalidation emits bounded hooks without promising external cache deletion', () => {
  requireApi()
  const invalidation = passport.createPassportInvalidation({
    sourceSnapshotId: 'snapshot-a',
    reason: 'source-corrected',
    affectedVersionIds: ['version-a'],
    occurredAt: '2026-08-20T03:00:00.000Z',
  })
  assert.deepEqual(invalidation.hooks, ['block-new-access', 'invalidate-controlled-view', 'invalidate-controlled-cache', 'review-controlled-export'])
  assert.equal(invalidation.externalCopiesDeletionGuaranteed, false)
})

test('model error preserves prior lawful draft and emits no false success receipt', async () => {
  requireApi()
  const store = makeStore()
  await pipeline.runInternalScan({ store, context: CONTEXT, sources: [SOURCE], deterministicParse: deterministicResolved })
  const before = await store.exportState(CONTEXT)

  await assert.rejects(
    pipeline.runInternalScan({
      store,
      context: CONTEXT,
      sources: [{ ...SOURCE, sourceId: 'source-error', content: 'ambiguous fixture' }],
      deterministicParse: () => ({ status: 'ambiguous', reason: 'AMBIGUOUS_SOURCE_DATE' }),
      callModel: async () => { throw new Error('provider unavailable') },
    }),
    (error) => error?.code === 'MODEL_CALL_FAILED',
  )

  const after = await store.exportState(CONTEXT)
  assert.deepEqual(after.claimCandidates, before.claimCandidates)
  assert.equal(after.receipts.filter((receipt) => receipt.result === 'completed').length, before.receipts.filter((receipt) => receipt.result === 'completed').length)
  assert.equal(after.receipts.at(-1).result, 'failed')
  assert.equal(after.receipts.at(-1).returnTo, CONTEXT.returnTo)
})
