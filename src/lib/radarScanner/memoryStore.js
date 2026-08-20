import { createRadarError } from './contracts.js'

const clone = (value) => structuredClone(value)

function sameContext(grant, context) {
  return grant.actorId === context.actorId
    && grant.environmentId === context.environmentId
    && grant.workspaceId === context.workspaceId
    && grant.organizationId === context.organizationId
    && grant.actId === context.actId
}

export function createMemoryRadarStore({ grants = [], failCostLedger = false } = {}) {
  const state = {
    snapshots: [],
    claimCandidates: [],
    claimHistory: new Map(),
    receipts: [],
    passportVersions: [],
  }

  function authorize(context, permission) {
    const grant = grants.find((item) => sameContext(item, context) && item.permissions?.includes(permission))
    if (!grant) throw createRadarError('DENIED_CONTEXT')
    return clone(grant)
  }

  return Object.freeze({
    async authorize(context, permission) {
      return authorize(context, permission)
    },

    async findSourceSnapshotByHash(context, hash) {
      authorize(context, 'radar.scan')
      const found = state.snapshots.find((item) => item.hash === hash && sameContext(item, context))
      return found ? clone(found) : null
    },

    async saveSourceSnapshot(context, snapshot) {
      authorize(context, 'radar.scan')
      state.snapshots.push(clone(snapshot))
      return clone(snapshot)
    },

    async touchSourceSnapshot(context, snapshotId, checkedAt, expiresAt) {
      authorize(context, 'radar.scan')
      const index = state.snapshots.findIndex((item) => item.id === snapshotId && sameContext(item, context))
      if (index < 0) throw createRadarError('SOURCE_SNAPSHOT_NOT_FOUND')
      state.snapshots[index] = { ...state.snapshots[index], checkedAt, expiresAt }
      return clone(state.snapshots[index])
    },

    async listSourceSnapshots(context) {
      authorize(context, 'radar.scan')
      return clone(state.snapshots.filter((item) => sameContext(item, context)))
    },

    async listRefreshCandidates(context, now) {
      authorize(context, 'radar.scan')
      const at = new Date(now).getTime()
      return clone(state.snapshots.filter((item) => sameContext(item, context) && new Date(item.expiresAt).getTime() <= at))
    },

    async saveClaimCandidate(context, candidate) {
      authorize(context, 'radar.scan')
      state.claimCandidates.push(clone(candidate))
      state.claimHistory.set(candidate.id, [clone(candidate)])
      return clone(candidate)
    },

    async listClaimCandidates(context) {
      authorize(context, 'radar.review')
      return clone(state.claimCandidates.filter((item) => sameContext(item, context)))
    },

    async applyClaimAction(context, candidateId, nextVersion) {
      authorize(context, 'radar.review')
      const index = state.claimCandidates.findIndex((item) => item.id === candidateId && sameContext(item, context))
      if (index < 0) throw createRadarError('CLAIM_CANDIDATE_NOT_FOUND')
      state.claimCandidates[index] = clone(nextVersion)
      const history = state.claimHistory.get(candidateId) || []
      history.push(clone(nextVersion))
      state.claimHistory.set(candidateId, history)
      return clone(nextVersion)
    },

    async getClaimHistory(context, candidateId) {
      authorize(context, 'radar.review')
      const history = state.claimHistory.get(candidateId) || []
      if (history.length === 0 || !sameContext(history[0], context)) {
        throw createRadarError('CLAIM_CANDIDATE_NOT_FOUND')
      }
      return clone(history)
    },

    async ensureCostLedgerAvailable(context) {
      authorize(context, 'radar.scan')
      if (failCostLedger) throw createRadarError('COST_LEDGER_UNAVAILABLE')
      return { available: true }
    },

    async saveReceipt(context, receipt) {
      authorize(context, 'radar.scan')
      state.receipts.push(clone(receipt))
      return clone(receipt)
    },

    async listPassportVersions(context) {
      authorize(context, 'radar.review')
      return clone(state.passportVersions.filter((item) => sameContext(item, context)))
    },

    async exportState(context) {
      authorize(context, 'radar.review')
      return {
        snapshots: clone(state.snapshots.filter((item) => sameContext(item, context))),
        claimCandidates: clone(state.claimCandidates.filter((item) => sameContext(item, context))),
        receipts: clone(state.receipts.filter((item) => sameContext(item, context))),
        passportVersions: clone(state.passportVersions.filter((item) => sameContext(item, context))),
      }
    },
  })
}
