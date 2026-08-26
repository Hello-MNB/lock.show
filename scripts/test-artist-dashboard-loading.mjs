import assert from 'node:assert/strict'
import test from 'node:test'

import { loadArtistDashboardData } from '../src/features/artist/loadArtistDashboardData.js'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

test('starts independent Radar reads in parallel and tolerates optional failures', async () => {
  const started = []
  const calls = Object.fromEntries(
    ['act', 'items', 'claims', 'entitlement', 'requests'].map((name) => [name, deferred()]),
  )
  const dependency = (name) => async (artistId) => {
    assert.equal(artistId, 'artist-1')
    started.push(name)
    return calls[name].promise
  }

  const resultPromise = loadArtistDashboardData('artist-1', {
    getAct: dependency('act'),
    listItems: dependency('items'),
    listClaims: dependency('claims'),
    getEntitlement: dependency('entitlement'),
    listRequests: dependency('requests'),
  })

  await Promise.resolve()
  assert.deepEqual(started.sort(), ['act', 'claims', 'entitlement', 'items', 'requests'])

  calls.act.reject(new Error('optional act unavailable'))
  calls.items.resolve([{ id: 'item-1' }])
  calls.claims.resolve([{ id: 'claim-1' }])
  calls.entitlement.resolve({ id: 'ent-1' })
  calls.requests.reject(new Error('optional requests unavailable'))

  assert.deepEqual(await resultPromise, {
    act: null,
    items: [{ id: 'item-1' }],
    claims: [{ id: 'claim-1' }],
    entitlement: { id: 'ent-1' },
    requests: null,
  })
})

test('fails the Radar load when required evidence reads fail', async () => {
  await assert.rejects(
    loadArtistDashboardData('artist-1', {
      getAct: async () => null,
      listItems: async () => [],
      listClaims: async () => { throw new Error('claims unavailable') },
      getEntitlement: async () => null,
      listRequests: async () => [],
    }),
    /claims unavailable/,
  )
})
