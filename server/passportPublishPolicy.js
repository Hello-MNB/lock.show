const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function executeEvidenceAction(userClient, request, mode = 'commit') {
  const denied = () => new Error('evidence_action_unavailable')
  if (!request || !['artistId', 'actId', 'objectId', 'key', 'workspaceId'].every(k => uuid.test(request[k] || ''))
    || !['contextVersion', 'expectedVersion', 'expectedObjectVersion'].every(k => Number.isSafeInteger(request[k]) && request[k] >= 0)
    || !['upload', 'prepare', 'change', 'correct', 'propose', 'confirm', 'publish', 'replace', 'withdraw'].includes(request.action)
    || !request.payload || typeof request.payload !== 'object' || Array.isArray(request.payload)
    || !['commit', 'resolve'].includes(mode)) throw denied()
  const { data, error } = await userClient.rpc(mode === 'commit' ? 'commit_evidence_action' : 'resolve_evidence_action', { p_request: request })
  if (error || !data) throw denied()
  return mode === 'commit' ? { status: 'committed', receipt: data } : data
}
