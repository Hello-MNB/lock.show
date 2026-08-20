import { randomUUID } from 'node:crypto'
import {
  createClaimCandidate,
  createRadarError,
  createSourceSnapshot,
  contentHash,
  sanitizeClaimCandidate,
} from './contracts.js'

const EMPTY_MODEL = Object.freeze({
  callCount: 0,
  model: null,
  reason: null,
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  retries: 0,
  calls: Object.freeze([]),
})

function modelUsage(usage = {}, reason) {
  return {
    model: usage.model || null,
    reason,
    inputTokens: Number(usage.inputTokens) || 0,
    outputTokens: Number(usage.outputTokens) || 0,
    cacheReadTokens: Number(usage.cacheReadTokens) || 0,
    retries: Number(usage.retries) || 0,
  }
}

function aggregateModelUsage(current, usage, reason) {
  const call = modelUsage(usage, reason)
  return {
    callCount: current.callCount + 1,
    model: current.callCount === 0 ? call.model : (current.model === call.model ? current.model : 'multiple'),
    reason: current.callCount === 0 ? call.reason : (current.reason === call.reason ? current.reason : 'multiple'),
    inputTokens: current.inputTokens + call.inputTokens,
    outputTokens: current.outputTokens + call.outputTokens,
    cacheReadTokens: current.cacheReadTokens + call.cacheReadTokens,
    retries: current.retries + call.retries,
    calls: [...current.calls, call],
  }
}

function receiptBase(context, now) {
  return {
    id: randomUUID(),
    actorId: context.actorId,
    environmentId: context.environmentId,
    workspaceId: context.workspaceId,
    organizationId: context.organizationId,
    actId: context.actId,
    method: 'deterministic-first',
    createdAt: new Date(now).toISOString(),
    returnTo: context.returnTo,
  }
}

export async function runInternalScan({
  store,
  context,
  sources,
  deterministicParse,
  callModel,
  now = new Date().toISOString(),
}) {
  await store.authorize(context, 'radar.scan')
  if (!Array.isArray(sources) || sources.length === 0) throw createRadarError('SOURCES_REQUIRED')
  if (sources.length > 5) throw createRadarError('SOURCE_LIMIT_EXCEEDED')
  if (typeof deterministicParse !== 'function') throw createRadarError('DETERMINISTIC_PARSER_REQUIRED')

  const sourceReceipts = []
  const createdCandidates = []
  let model = { ...EMPTY_MODEL, calls: [] }
  let actualUsd = 0
  let estimatedUsd = null
  let unchangedCount = 0

  for (const source of sources) {
    if (source?.identity?.state !== 'confirmed') throw createRadarError('IDENTITY_AMBIGUOUS')
    if (source.identity.actId !== context.actId) throw createRadarError('IDENTITY_ACT_MISMATCH')

    const snapshot = createSourceSnapshot({ source, context, now })
    const hash = snapshot.hash
    const existing = await store.findSourceSnapshotByHash(context, hash)
    if (existing) {
      const checkedAt = new Date(now).toISOString()
      const expiresAt = new Date(new Date(checkedAt).getTime() + snapshot.ttlSeconds * 1000).toISOString()
      await store.touchSourceSnapshot(context, existing.id, checkedAt, expiresAt)
      sourceReceipts.push({ sourceId: source.sourceId, snapshotId: existing.id, hash, change: 'unchanged' })
      unchangedCount += 1
      continue
    }

    await store.saveSourceSnapshot(context, snapshot)
    sourceReceipts.push({ sourceId: source.sourceId, snapshotId: snapshot.id, hash, change: 'new' })

    const parsed = await deterministicParse(source, snapshot)
    let candidateInput
    let method = 'deterministic'
    let modelVersion = null

    if (parsed?.status === 'resolved') {
      candidateInput = parsed.candidate
    } else if (parsed?.status === 'ambiguous') {
      await store.ensureCostLedgerAvailable(context)
      if (typeof callModel !== 'function') throw createRadarError('MODEL_ADAPTER_REQUIRED')
      let response
      try {
        response = await callModel({ source: structuredClone(source), snapshot: structuredClone(snapshot), reason: parsed.reason })
      } catch (cause) {
        const failedReceipt = {
          ...receiptBase(context, now),
          sources: sourceReceipts,
          model: { ...EMPTY_MODEL, reason: parsed.reason },
          cost: { actualUsd: 0, estimatedUsd: null },
          result: 'failed',
          error: 'MODEL_CALL_FAILED',
          consequence: 'prior-lawful-state-preserved',
        }
        await store.saveReceipt(context, failedReceipt)
        throw createRadarError('MODEL_CALL_FAILED', cause?.message || 'MODEL_CALL_FAILED')
      }
      candidateInput = response?.output
      const usage = response?.usage || {}
      model = aggregateModelUsage(model, usage, parsed.reason)
      method = 'model-escalation'
      modelVersion = model.model
      actualUsd += Number(usage.actualUsd) || 0
      if (usage.actualUsd == null && usage.estimatedUsd != null) {
        estimatedUsd = (estimatedUsd || 0) + Number(usage.estimatedUsd)
      }
    } else {
      throw createRadarError('DETERMINISTIC_RESULT_INVALID')
    }

    const candidate = createClaimCandidate({
      candidate: sanitizeClaimCandidate(candidateInput),
      snapshot,
      context,
      method,
      modelVersion,
      now,
    })
    await store.saveClaimCandidate(context, candidate)
    createdCandidates.push(candidate)
  }

  const result = createdCandidates.length === 0 && unchangedCount === sources.length ? 'unchanged' : 'completed'
  const receipt = {
    ...receiptBase(context, now),
    sources: sourceReceipts,
    model,
    cost: { actualUsd, estimatedUsd },
    result,
    consequence: 'private-claim-candidates-only',
  }
  await store.saveReceipt(context, receipt)

  return { result, receipt, candidates: createdCandidates }
}

export async function listRefreshCandidates({ store, context, now = new Date().toISOString() }) {
  await store.authorize(context, 'radar.scan')
  return store.listRefreshCandidates(context, now)
}

export async function applyClaimAction({ store, context, candidateId, action, now = new Date().toISOString() }) {
  await store.authorize(context, 'radar.review')
  const history = await store.getClaimHistory(context, candidateId)
  const current = history.at(-1)
  if (!current) throw createRadarError('CLAIM_CANDIDATE_NOT_FOUND')

  const states = {
    confirm: 'confirmed',
    correct: 'corrected',
    hide: 'hidden',
    dispute: 'disputed',
    defer: 'deferred',
  }
  const nextState = states[action?.type]
  if (!nextState) throw createRadarError('CLAIM_ACTION_INVALID')
  if (action.type === 'correct' && (typeof action.value !== 'string' || !action.value.trim())) {
    throw createRadarError('CLAIM_CORRECTION_VALUE_REQUIRED')
  }

  const correctedValue = action.type === 'correct' ? action.value.trim() : current.value
  if (action.type === 'correct') sanitizeClaimCandidate({ ...current, value: correctedValue })

  const next = Object.freeze({
    ...current,
    value: correctedValue,
    state: nextState,
    visibility: action.type === 'confirm' || action.type === 'correct' ? current.visibility : 'private-radar',
    actionReason: action.reason || null,
    actionActorId: context.actorId,
    updatedAt: new Date(now).toISOString(),
    version: current.version + 1,
  })
  return store.applyClaimAction(context, candidateId, next)
}
