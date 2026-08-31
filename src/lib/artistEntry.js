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

export function firstLinkRequest(workbench, value, sourceConsent) {
  const url = new URL(value.trim())
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || sourceConsent !== true
    || !workbench?.artistId || !workbench.actId || !workbench.authority?.workspaceId
    || !Number.isSafeInteger(Number(workbench.authority.contextVersion))) throw new Error('artist_entry_unavailable')
  return { action: 'upload', key: crypto.randomUUID(), objectId: crypto.randomUUID(),
    artistId: workbench.artistId, actId: workbench.actId, workspaceId: workbench.authority.workspaceId,
    contextVersion: Number(workbench.authority.contextVersion), expectedVersion: Number(workbench.version), expectedObjectVersion: 0,
    payload: { evidence_type: 'link', source_type: 'public-profile', value: url.href, title: url.href,
      sourceConsent: true, provenance: 'Artist supplied link' } }
}
