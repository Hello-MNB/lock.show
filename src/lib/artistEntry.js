// Entry orchestration is separate from Auth policy and from B's context switch.
// The transport supplies server authority; browser hints never do.
async function defaultRpc(name, args) {
  const { supabase } = await import('./supabase.js')
  if (!supabase) throw new Error('artist_entry_unavailable')
  return supabase.rpc(name, args)
}

function validCurrent(current, actorId) {
  return current?.actorId === actorId && ['ready', 'uninitialized'].includes(current.status)
    && Number.isSafeInteger(current.contextVersion) && Number.isSafeInteger(current.version)
    && (current.status !== 'ready' || typeof current.workspaceId === 'string')
}

function outcome(data, request, actorId) {
  if (!validCurrent(data?.current, actorId)) return { status: 'uncertain', request }
  if (data.status === 'not_committed' && data.actorId === actorId && data.key === request.key) return { ...data, request }
  const receipt = data.receipt
  if (data.status !== 'committed' || !receipt?.id || !receipt.committedAt || receipt.actorId !== actorId
    || receipt.key !== request.key || receipt.action !== request.action) return { status: 'uncertain', request }
  if (['workspaceId', 'contextVersion', 'version', 'artistId', 'actId'].some(key =>
    (receipt.after?.[key] ?? null) !== (data.current[key] ?? null))) return { status: 'reconciled', current: data.current, request }
  return { ...data, request }
}

export function createArtistEntryClient({ actorId, rpc = defaultRpc }) {
  let generation = 0
  async function call(name, request) {
    const result = await rpc(name, request ? { p_request: request } : undefined)
    if (result.error) throw result.error
    return result.data
  }
  return {
    retire() { generation += 1 },
    async complete(current, telemetry = true) {
      const start = generation
      const request = { workspaceId: current.workspaceId, artistId: current.artistId, actId: current.actId,
        contextVersion: current.contextVersion, telemetry }
      // Retrying the same explicit Finish cannot choose a new completion ID.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const result = await call('complete_artist_entry', request)
          if (start !== generation) return { status: 'retired' }
          if (!validCurrent(result?.current, actorId) || result.actorId !== actorId
            || ['workspaceId', 'artistId', 'actId', 'contextVersion'].some(k => result.current[k] !== current[k])
            || !['recorded', 'not_recorded'].includes(result.status)
            || (result.status === 'recorded' && (!result.eventId || !result.recordedAt))) throw new Error('artist_entry_unavailable')
          return result
        } catch { if (start !== generation) return { status: 'retired' } }
      }
      return { status: 'uncertain' }
    },
    async read() {
      const start = generation
      const current = await call('read_artist_entry')
      if (start !== generation) throw new Error('entry_retired')
      if (!validCurrent(current, actorId)) throw new Error('artist_entry_unavailable')
      return current
    },
    async commit(request) {
      const start = ++generation
      let result
      try { result = outcome(await call('commit_artist_entry', request), request, actorId) }
      catch (error) {
        if (start !== generation) return { status: 'retired', request }
        if (error.code === '42501' || [401, 403].includes(error.status)) result = { status: 'denied', request }
        else {
          try { result = outcome(await call('resolve_artist_entry', request), request, actorId) }
          catch { result = { status: 'uncertain', request } }
        }
      }
      return start === generation ? result : { status: 'retired', request }
    },
    async recover(request) {
      const start = generation
      let result
      try { result = outcome(await call('resolve_artist_entry', request), request, actorId) }
      catch { result = { status: 'uncertain', request } }
      if (start !== generation) return { status: 'retired', request }
      // Retire prior continuations only AFTER authoritative reconciliation.
      if (['committed', 'not_committed', 'reconciled'].includes(result.status)) generation += 1
      return result
    },
  }
}

// An upload receipt proves a historical action, never the object's current
// truth/publication state. The fresh governed projection supplies that state.
function originReceipts(workbench, actorId, object) {
  return workbench.history.filter(row => {
    const r = row.receipt
    return row.action === 'upload' && r?.action === 'upload' && r.id && r.committedAt
      && r.actorId === actorId && r.workspaceId === workbench.authority.workspaceId
      && r.artistId === workbench.artistId && r.actId === workbench.actId && r.objectId === object.id
      && Number.isSafeInteger(r.contextVersion) && r.contextVersion <= Number(workbench.authority.contextVersion)
      && Number.isSafeInteger(r.objectVersion) && r.objectVersion > 0 && r.objectVersion <= object.version
  })
}

export function entryOriginObjects(workbench, actorId) {
  const authority = workbench?.authority
  if (authority?.actorId !== actorId || !Array.isArray(workbench.objects) || !Array.isArray(workbench.history)) return []
  return workbench.objects.flatMap(object => {
    if (!object.id || !Number.isSafeInteger(object.version) || object.version < 1 || object.state === 'withdrawn') return []
    const matches = originReceipts(workbench, actorId, object)
    if (matches.length !== 1) return []
    return [{ ...object, originReceipt: matches[0].receipt }]
  })
}

export function entryOriginSelection(workbench, actorId, objectId, receiptId, objectVersion) {
  const object = entryOriginObjects(workbench, actorId).find(item => item.id === objectId)
  if (!object || object.originReceipt.id !== receiptId || object.originReceipt.objectVersion !== Number(objectVersion)) {
    throw new Error('evidence_action_unavailable')
  }
  return object
}

// This is an outcome readback, NOT admission through a withdrawn origin URL.
// The server still selects the actor's current authorized projection. History
// proves the exact completed action; it never replaces the current object.
export function entryOriginAfterWithdrawal(workbench, actorId, outcome, objectId, receiptId, objectVersion) {
  const r = outcome?.receipt, request = outcome?.request, authority = workbench?.authority
  const unavailable = () => { throw new Error('evidence_action_unavailable') }
  if (outcome?.status !== 'committed' || request?.action !== 'withdraw' || request.objectId !== objectId
    || !r?.id || !r.committedAt || r.actorId !== actorId || authority?.actorId !== actorId
    || request.workspaceId !== authority.workspaceId || request.contextVersion !== Number(authority.contextVersion)
    || request.artistId !== workbench.artistId || request.actId !== workbench.actId
    || !['key', 'action', 'objectId', 'artistId', 'actId', 'workspaceId', 'contextVersion'].every(k => r[k] === request[k])
    || !Number.isSafeInteger(request.expectedVersion) || !Number.isSafeInteger(request.expectedObjectVersion)
    || r.version !== request.expectedVersion + 1 || r.objectVersion !== request.expectedObjectVersion + 1
    || !Number.isSafeInteger(workbench.version) || workbench.version < r.version
    || !Array.isArray(workbench.objects) || !Array.isArray(workbench.history)) return unavailable()
  const object = workbench.objects.find(item => item.id === objectId)
  if (!object || !Number.isSafeInteger(object.version) || object.version < r.objectVersion
    || (object.version === r.objectVersion && object.state !== 'withdrawn')) return unavailable()
  const history = workbench.history.filter(row => row.receipt?.id === r.id)
  const fields = ['id', 'key', 'action', 'actorId', 'workspaceId', 'artistId', 'actId', 'objectId', 'contextVersion', 'version', 'objectVersion', 'committedAt']
  if (history.length !== 1 || history[0].action !== 'withdraw'
    || !fields.every(k => history[0].receipt[k] === r[k])) return unavailable()
  const origins = originReceipts(workbench, actorId, object)
  if (origins.length !== 1 || origins[0].receipt.id !== receiptId
    || origins[0].receipt.objectVersion !== Number(objectVersion)) return unavailable()
  return { ...object, originReceipt: origins[0].receipt }
}

export function firstLinkRequest(workbench, value, sourceConsent) {
  const url = new URL(value.trim())
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || sourceConsent !== true
    || !workbench?.artistId || !workbench.actId || !workbench.authority?.workspaceId
    || !Number.isSafeInteger(Number(workbench.authority.contextVersion))) throw new Error('artist_entry_unavailable')
  return { action: 'upload', key: crypto.randomUUID(), objectId: crypto.randomUUID(),
    artistId: workbench.artistId, actId: workbench.actId, workspaceId: workbench.authority.workspaceId,
    contextVersion: Number(workbench.authority.contextVersion), expectedVersion: Number(workbench.version), expectedObjectVersion: 0,
    // This records the Artist's reference, not acquired content or an assessed
    // public profile. Keep the existing attribution vocabulary and ceiling.
    payload: { evidence_type: 'link', source_type: 'self-reported', value: url.href, title: url.href,
      sourceConsent: true, provenance: 'Artist supplied link' } }
}
