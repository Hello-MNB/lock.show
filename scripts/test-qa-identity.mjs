import assert from 'node:assert/strict'
import test from 'node:test'

let isQaIdentityEmail
try {
  ;({ isQaIdentityEmail } = await import('../src/lib/qaIdentity.js'))
} catch {
  // RED until the production classifier exists.
}

test('recognizes only the canonical LOCK SHOW QA identity and legacy fixtures', () => {
  assert.equal(isQaIdentityEmail?.('qa@lock.show'), true)
  assert.equal(isQaIdentityEmail?.(' QA@LOCK.SHOW '), true)
  assert.equal(isQaIdentityEmail?.('agency@gigproof.test'), true)

  assert.equal(isQaIdentityEmail?.('hello@lock.show'), false)
  assert.equal(isQaIdentityEmail?.('qa.artist@lock.show'), false)
  assert.equal(isQaIdentityEmail?.('qa@lock.show.evil'), false)
  assert.equal(isQaIdentityEmail?.(''), false)
  assert.equal(isQaIdentityEmail?.(null), false)
})
