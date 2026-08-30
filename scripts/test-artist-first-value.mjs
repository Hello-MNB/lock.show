import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ARTIST_FIRST_VALUE_BINDING,
  buildArtistFirstValueModel,
  resolveArtistFirstValueAccess,
  selectArtistForWorkspace,
} from '../src/features/artist/artistFirstValue.js'
import { T as en } from '../src/lib/i18n/en.js'
import { T as he } from '../src/lib/i18n/he.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let passed = 0
async function test(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`ok ${passed} - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

const activeArtistMembership = {
  status: 'active',
  functional_role: 'artist',
  org_role: 'owner',
  organization: { id: 'org-artist', name: 'Maya Vale', workspace_type: 'artist' },
}

await test('binds the commissioned Product, Experience and flow IDs exactly', () => {
  assert.deepEqual(ARTIST_FIRST_VALUE_BINDING, {
    sliceId: 'SLICE-ART-01',
    productId: 'ART-01',
    screenId: 'SCR-RADAR-HOME',
    workflowId: 'WF-RAD-01',
    flowId: 'FLOW-ART-01',
    handoffProductIds: ['ART-02', 'ART-03'],
  })
})

await test('requires an authenticated person and an explicit active Artist workspace', () => {
  assert.deepEqual(resolveArtistFirstValueAccess({ user: null }), { allowed: false, reason: 'unauthenticated' })
  assert.deepEqual(resolveArtistFirstValueAccess({ user: { id: 'user-1' }, activeOrgId: null, memberships: [] }), { allowed: false, reason: 'workspace_missing' })
  assert.deepEqual(resolveArtistFirstValueAccess({
    user: { id: 'user-1' }, activeOrgId: 'org-agency', memberships: [{ ...activeArtistMembership, functional_role: 'agency', organization: { id: 'org-agency', workspace_type: 'management' } }],
  }), { allowed: false, reason: 'wrong_workspace' })
})

await test('fails closed for a revoked membership and never treats another membership as authority', () => {
  const result = resolveArtistFirstValueAccess({
    user: { id: 'user-1' },
    activeOrgId: 'org-artist',
    memberships: [{ ...activeArtistMembership, status: 'revoked' }],
  })
  assert.deepEqual(result, { allowed: false, reason: 'revoked' })
  assert.deepEqual(resolveArtistFirstValueAccess({
    user: { id: 'user-1' },
    activeOrgId: 'org-artist',
    memberships: [{ ...activeArtistMembership, status: undefined }],
  }), { allowed: false, reason: 'revoked' })
})

await test('admits only the active Artist workspace and preserves its role and organization context', () => {
  const result = resolveArtistFirstValueAccess({
    user: { id: 'user-1' }, activeOrgId: 'org-artist', memberships: [activeArtistMembership],
  })
  assert.deepEqual(result, {
    allowed: true,
    organizationId: 'org-artist',
    organizationName: 'Maya Vale',
    role: 'artist',
    workspaceType: 'artist',
  })
})

await test('selects no Artist for a wrong workspace, a legacy unbound record, or a revoked grant', () => {
  const own = { id: 'artist-1', created_by: 'user-1', owner_organization_id: 'org-artist' }
  assert.equal(selectArtistForWorkspace([own], { userId: 'user-1', organizationId: 'org-artist' }), own)
  assert.equal(selectArtistForWorkspace([own], { userId: 'user-1', organizationId: 'org-other' }), null)
  assert.equal(selectArtistForWorkspace([{ ...own, owner_organization_id: null }], { userId: 'user-1', organizationId: 'org-artist' }), null)
  assert.equal(selectArtistForWorkspace([own], { userId: 'user-2', organizationId: 'org-artist' }), null)
})

await test('models honest empty, thin, fresh and stale evidence without a score or publication claim', () => {
  const base = { artist: { id: 'artist-1', stage_name: 'MAYA' }, act: { artist_goal: 'Prepare a booking case' }, organizationName: 'Maya Vale' }
  assert.equal(buildArtistFirstValueModel({ ...base, items: [], claims: [], now: Date.parse('2026-08-30T00:00:00Z') }).evidenceState, 'empty')
  assert.equal(buildArtistFirstValueModel({ ...base, items: [{ created_at: '2026-08-29T00:00:00Z' }], claims: [], now: Date.parse('2026-08-30T00:00:00Z') }).evidenceState, 'thin')
  assert.equal(buildArtistFirstValueModel({ ...base, items: [{ created_at: '2026-08-29T00:00:00Z' }], claims: [{ artist_approved: true, verification_status: 'supporting' }], now: Date.parse('2026-08-30T00:00:00Z') }).freshness, 'fresh')
  const stale = buildArtistFirstValueModel({ ...base, items: [{ created_at: '2026-01-01T00:00:00Z' }], claims: [{ artist_approved: true, verification_status: 'supporting' }], now: Date.parse('2026-08-30T00:00:00Z') })
  assert.equal(stale.freshness, 'stale')
  assert.equal(JSON.stringify(stale).includes('%'), false)
  assert.equal(JSON.stringify(stale).toLowerCase().includes('published'), false)
})

await test('ships complete EN/LTR and HE/RTL first-value, denial and recovery copy', () => {
  for (const locale of [en, he]) {
    const copy = locale.radar.firstValue
    for (const key of ['privateLabel', 'question', 'evidenceEmpty', 'evidenceThin', 'evidenceFresh', 'evidenceStale', 'methodLimit', 'noAction', 'resume', 'wrongWorkspace', 'revoked', 'retry']) {
      assert.equal(typeof copy[key], 'string', `${key} missing`)
      assert.ok(copy[key].trim().length > 0, `${key} empty`)
    }
  }
  assert.match(he.radar.firstValue.question, /[\u0590-\u05FF]/)
  assert.doesNotMatch(en.radar.firstValue.question, /[\u0590-\u05FF]/)
})

await test('integrates the exact screen row with accessible status and recovery controls', () => {
  const source = fs.readFileSync(path.join(root, 'src/features/artist/ArtistDashboard.jsx'), 'utf8')
  assert.match(source, /useOrg\(\)/)
  assert.match(source, /getMyArtistForWorkspace\(user\.id, activeOrgId\)/)
  assert.match(source, /data-product-id="ART-01"/)
  assert.match(source, /data-screen-id="SCR-RADAR-HOME"/)
  assert.match(source, /data-workflow-id="WF-RAD-01"/)
  assert.match(source, /aria-live="polite"/)
  assert.match(source, /T\.radar\.firstValue\.noAction/)
  assert.match(source, /T\.radar\.firstValue\.resume/)
})

await test('invalidates stale Artist reads when the active workspace changes', () => {
  const source = fs.readFileSync(path.join(root, 'src/features/artist/ArtistDashboard.jsx'), 'utf8')
  assert.match(source, /loadRevision = useRef\(0\)/)
  assert.match(source, /requestRevision !== loadRevision\.current/)
  assert.match(source, /loadRevision\.current \+= 1/)
  assert.match(source, /loadedContextKey !== currentContextKey/)
})

console.log(`Artist first value: ${passed}/9 passed`)
