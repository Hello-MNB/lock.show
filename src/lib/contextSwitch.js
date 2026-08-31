const onlineByDefault = () => typeof navigator === 'undefined' || navigator.onLine !== false
const noop = () => {}

function failure(reason, focusReturn) {
  try { focusReturn?.() } catch { /* focus recovery is best-effort */ }
  return { ok: false, reason }
}

function normalizeCommitFailure(error) {
  const signal = `${error?.code || ''} ${error?.message || ''}`.toLowerCase()
  if (signal.includes('context_switch_stale')) return 'stale'
  if (signal.includes('context_switch_not_available')) return 'not_available'
  if (signal.includes('context_switch_conflict')) return 'conflict'
  return null
}

function receiptIsExact(receipt, preflight, idempotencyKey) {
  return Boolean(
    receipt
    && receipt.receiptId
    && receipt.idempotencyKey === idempotencyKey
    && receipt.activeOrganizationId === preflight.targetOrganizationId
    && receipt.previousContextVersion === preflight.expectedContextVersion
    && receipt.contextVersion === preflight.expectedContextVersion + 1
    && receipt.committedAt
  )
}

export async function preflightContextSwitch({
  targetOrganizationId,
  targetArtistId = null,
  currentContext,
  isOnline = onlineByDefault,
  requestPreflight,
}) {
  if (!targetOrganizationId || targetOrganizationId === currentContext?.organizationId) {
    return { ok: false, reason: 'not_available' }
  }
  if (!isOnline()) return { ok: false, reason: 'offline' }

  try {
    const result = await requestPreflight({
      targetOrganizationId,
      targetArtistId,
      expectedContextVersion: currentContext?.contextVersion,
    })
    if (!result?.ok
        || result.targetOrganizationId !== targetOrganizationId
        || result.expectedContextVersion !== currentContext?.contextVersion) {
      return { ok: false, reason: 'not_available' }
    }
    return {
      ok: true,
      targetOrganizationId,
      targetOrganizationName: result.targetOrganizationName || '',
      targetFunctionalRole: result.targetFunctionalRole || null,
      targetArtistId,
      expectedContextVersion: result.expectedContextVersion,
    }
  } catch {
    return { ok: false, reason: 'not_available' }
  }
}

export function cancelContextSwitch({ focusReturn = noop } = {}) {
  return failure('cancelled', focusReturn)
}

function noncommitIsExact(outcome, preflight, idempotencyKey) {
  return Boolean(outcome?.outcome === 'not_committed' && outcome.outcomeId && outcome.resolvedAt
    && outcome.idempotencyKey === idempotencyKey
    && outcome.targetOrganizationId === preflight.targetOrganizationId
    && (outcome.targetArtistId ?? null) === (preflight.targetArtistId ?? null)
    && outcome.expectedContextVersion === preflight.expectedContextVersion
    && Number.isSafeInteger(outcome.contextVersion) && outcome.contextVersion >= 0)
}

// Recovery settles the original key under the server's commit lock. A durable
// noncommit fence is bookkeeping, not a new switch. Never navigate/clear drafts
// or promote historical outcomes to current context.
export async function recoverContextSwitch({
  preflight, idempotencyKey, terminal = false, resolveCommitOutcome,
  readCurrentContext, applyContext, markUnresolved = noop,
}) {
  try {
    // An ordinary context SELECT can see the prior committed row while the
    // original transaction is still in flight. Require either a commit receipt
    // or a serialized durable noncommit fence; missing history is not proof.
    const outcome = terminal ? null : await resolveCommitOutcome(idempotencyKey, preflight)
    if (!terminal && !receiptIsExact(outcome, preflight, idempotencyKey)
        && !noncommitIsExact(outcome, preflight, idempotencyKey)) {
      throw new Error('commit_outcome_pending')
    }
    const context = await readCurrentContext()
    if (!context?.organizationId || !Number.isSafeInteger(context.contextVersion) || context.contextVersion < 0
        || (outcome && context.contextVersion < outcome.contextVersion)) {
      throw new Error('context_not_available')
    }
    await applyContext(context)
    return { ok: true, context }
  } catch {
    markUnresolved()
    return { ok: false, reason: 'uncertain' }
  }
}

export async function commitContextSwitch({
  preflight,
  idempotencyKey,
  isOnline = onlineByDefault,
  requestCommit,
  resolveReceipt,
  readCurrentContext,
  markUnresolved = noop,
  markResolved = noop,
  applyReceipt = noop,
  persistLocal = noop,
  announce = noop,
  logCommitted = noop,
  navigate = noop,
  focusReturn = noop,
  receiptAlreadyApplied = () => false,
  isCurrent = () => true,
}) {
  // Successful authoritative recovery retires the old continuation. Check at
  // every async boundary before effects, including failure/re-lock and focus.
  const superseded = () => ({ ok: false, reason: 'superseded' })
  const fail = (reason) => isCurrent() ? failure(reason, focusReturn) : superseded()
  if (!isCurrent()) return superseded()
  if (!preflight?.ok || !preflight.targetOrganizationId || !Number.isInteger(preflight.expectedContextVersion)) {
    return fail('not_available')
  }
  if (!idempotencyKey) return fail('invalid_request')
  if (!isOnline()) return fail('offline')

  let receipt
  let recovered = false
  const suspend = (terminal = false) => {
    if (isCurrent()) markUnresolved({ preflight, idempotencyKey, terminal })
  }
  try {
    receipt = await requestCommit({
      targetOrganizationId: preflight.targetOrganizationId,
      targetArtistId: preflight.targetArtistId || null,
      expectedContextVersion: preflight.expectedContextVersion,
      idempotencyKey,
    })
  } catch (error) {
    if (!isCurrent()) return superseded()
    const knownFailure = normalizeCommitFailure(error)
    if (knownFailure) {
      if (knownFailure === 'stale' || knownFailure === 'conflict') suspend(true)
      return fail(knownFailure)
    }
    // The server may already have committed. Freeze normal actions immediately,
    // even while the first receipt recovery read is still pending.
    suspend()
    if (!resolveReceipt) return fail('uncertain')
    try {
      receipt = await resolveReceipt(idempotencyKey)
      recovered = Boolean(receipt)
    } catch {
      return fail('uncertain')
    }
    if (!receipt) return fail('uncertain')
  }

  if (!isCurrent()) return superseded()
  if (!receiptIsExact(receipt, preflight, idempotencyKey)) {
    suspend()
    return fail('invalid_receipt')
  }
  try {
    const current = await readCurrentContext()
    if (!isCurrent()) return superseded()
    if (current?.organizationId !== receipt.activeOrganizationId || current?.contextVersion !== receipt.contextVersion) {
      suspend(true)
      return fail('stale')
    }
  } catch {
    suspend(true)
    return fail('uncertain')
  }
  if (receiptAlreadyApplied(receipt.receiptId)) {
    markResolved()
    return { ok: true, receipt, replayed: true, ...(recovered ? { recovered: true } : {}) }
  }

  try {
    await applyReceipt(receipt)
  } catch {
    if (!isCurrent()) return superseded()
    suspend(true)
    return { ok: false, reason: 'committed_refresh_required', receipt }
  }
  if (!isCurrent()) return superseded()
  markResolved()
  try { await persistLocal(receipt.activeOrganizationId) } catch { /* server receipt remains authority */ }
  if (!isCurrent()) return superseded()
  try { await announce(receipt) } catch { /* live-region failure cannot undo commit */ }
  if (!isCurrent()) return superseded()
  try { await logCommitted(receipt) } catch { /* analytics never controls authority */ }
  if (!isCurrent()) return superseded()
  try { await navigate(receipt) } catch { /* current screen can still render the committed context */ }
  if (!isCurrent()) return superseded()

  return { ok: true, receipt, ...(recovered ? { recovered: true } : {}) }
}
