import assert from 'node:assert/strict'
import { persistMyIdentity as saveMyIdentity } from '../src/lib/identityCore.js'
import { loadRepresentationWorkspace } from '../src/features/agency/representationWorkspace.js'

let passed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`PASS ${name}`)
    passed += 1
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

await test('saving a personal name updates canonical Person/Profile identity and mirrors Auth metadata', async () => {
  const calls = []
  const client = {
    rpc: async (name, args) => {
      calls.push(['rpc', name, args])
      return { data: 'Maria Garmel', error: null }
    },
    auth: {
      updateUser: async (payload) => {
        calls.push(['auth', payload])
        return { data: {}, error: null }
      },
    },
  }

  const result = await saveMyIdentity('  Maria Garmel  ', client)

  assert.deepEqual(calls, [
    ['rpc', 'update_my_identity', { p_display_name: 'Maria Garmel' }],
    ['auth', { data: { full_name: 'Maria Garmel', name: 'Maria Garmel' } }],
  ])
  assert.deepEqual(result, { displayName: 'Maria Garmel', authMetadataSynced: true })
})

await test('an empty personal name is rejected before any database write', async () => {
  let called = false
  const client = {
    rpc: async () => { called = true; return { data: null, error: null } },
    auth: { updateUser: async () => ({ error: null }) },
  }
  await assert.rejects(() => saveMyIdentity('   ', client), /display name is required/i)
  assert.equal(called, false)
})

await test('representation roster contains only consented ArtistAccess grants, never legacy created_by rows', async () => {
  const legacyOwnedArtist = { id: 'legacy-dj', stage_name: 'Legacy DJ' }
  const grant = {
    grant_id: 'grant-1', artist_id: 'artist-1', artist_stage_name: 'Consented Artist',
    artist_city: 'Berlin', scope: ['view', 'share'], status: 'active',
  }
  const result = await loadRepresentationWorkspace({
    listRosterGrants: async () => [grant],
    fetchGrantArtistState: async () => ({
      'artist-1': { published: true, items: [{ item_type: 'link', created_at: '2026-08-20T00:00:00Z' }], openRequests: 1 },
    }),
    listClaimsByArtists: async (ids) => ids.map((artist_id) => ({ id: 'claim-1', artist_id })),
    listRequestsForArtists: async (ids) => ids.map((artist_id) => ({ id: 'request-1', artist_id })),
    // A legacy ownership result is deliberately not an input to the representation model.
    legacyOwnedArtist,
  })

  assert.deepEqual(result.artists.map((artist) => artist.id), ['artist-1'])
  assert.equal(result.artists.some((artist) => artist.id === legacyOwnedArtist.id), false)
  assert.deepEqual(result.requests.map((request) => request.artist_id), ['artist-1'])
  assert.deepEqual(result.claims.map((claim) => claim.artist_id), ['artist-1'])
})

await test('representation workspace fails closed when the consented-roster RPC is unavailable', async () => {
  const result = await loadRepresentationWorkspace({
    listRosterGrants: async () => null,
    fetchGrantArtistState: async () => { throw new Error('must not run') },
    listClaimsByArtists: async () => { throw new Error('must not run') },
    listRequestsForArtists: async () => { throw new Error('must not run') },
  })
  assert.deepEqual(result, { available: false, artists: [], claims: [], requests: [], grants: [], state: {} })
})

console.log(`Identity/workspace boundary: ${passed}/4 passed`)
