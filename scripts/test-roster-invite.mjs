import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  acceptRosterInvitation,
  createRosterInvitation,
  declineRosterInvitation,
  getRosterInvitation,
} from '../src/lib/rosterInvites.js'
import {
  normalizeRosterInvitation,
  rosterInvitationHash,
} from '../server/rosterInvitePolicy.js'
import { locationReturnPath, normalizePendingReturn } from '../src/lib/pendingReturn.js'
import { resolveRosterArtistSelection } from '../src/lib/rosterArtistSelection.js'
import { deliverRosterInvitation } from '../server/rosterInviteDelivery.js'
import { safeLandingLocation } from '../src/lib/attribution.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

test('roster invitation input is bounded and always includes read access', () => {
  assert.deepEqual(normalizeRosterInvitation({
    organizationId: 'org-1', artistName: '  Nova  ', email: ' NOVA@EXAMPLE.COM ',
    scope: ['share', 'publish', 'bogus'], territory: '  IL ',
  }), {
    organizationId: 'org-1', artistName: 'Nova', email: 'nova@example.com',
    scope: ['view', 'share', 'publish'], territory: 'IL',
  })
  assert.throws(() => normalizeRosterInvitation({ organizationId: 'org-1', artistName: '', email: 'bad' }), /invalid_roster_invitation/)
  assert.equal(rosterInvitationHash('raw-token'), '34d328009b123fbbb0dc93f18b3e6de1ecf7b1a5783c33dff7ffe1926f09e943')
})

test('invite return paths stay inside the application', () => {
  assert.equal(normalizePendingReturn('/roster-invite/token?x=1'), '/roster-invite/token?x=1')
  assert.equal(locationReturnPath({ pathname: '/agency', search: '?src=campaign' }), '/agency?src=campaign')
  assert.equal(locationReturnPath({ pathname: '//evil.example', search: '?src=x' }), null)
  assert.equal(normalizePendingReturn('https://evil.example/steal'), null)
  assert.equal(normalizePendingReturn('//evil.example/steal'), null)
  assert.equal(normalizePendingReturn('/login'), null)
})

test('first-touch attribution preserves bounded campaign context without storing invite tokens', () => {
  assert.equal(safeLandingLocation('/agency', '?src=roster-smoke&utm_campaign=launch'), '/agency?src=roster-smoke&utm_campaign=launch')
  assert.equal(safeLandingLocation('/roster-invite/raw-secret', '?src=email&unknown=drop'), '/roster-invite/:token?src=email')
})

test('multi-Artist roster consent requires an explicit eligible Artist choice', () => {
  const artists = [
    { id: 'artist-a', stage_name: 'Atlas' },
    { id: 'artist-b', stage_name: 'Nova' },
  ]
  assert.deepEqual(resolveRosterArtistSelection([], ''), { state: 'missing', artistId: null })
  assert.deepEqual(resolveRosterArtistSelection([artists[0]], ''), { state: 'ready', artistId: 'artist-a' })
  assert.deepEqual(resolveRosterArtistSelection(artists, ''), { state: 'selection_required', artistId: null })
  assert.deepEqual(resolveRosterArtistSelection(artists, 'artist-b'), { state: 'ready', artistId: 'artist-b' })
  assert.deepEqual(resolveRosterArtistSelection(artists, 'artist-x'), { state: 'invalid', artistId: null })
})

test('a thrown email delivery failure preserves the invitation link-only receipt without leaking details', async () => {
  const warnings = []
  const result = await deliverRosterInvitation({
    enabled: true,
    apiKey: 'configured-secret',
    from: 'LOCK SHOW <hello@lock.show>',
    to: 'nova@example.com',
    artistName: 'Nova',
    organizationName: 'North Management',
    inviteUrl: 'https://app.lock.show/roster-invite/raw-secret-token',
  }, {
    fetchImpl: async () => { throw new Error('DNS failed for nova@example.com raw-secret-token') },
    logger: { warn: (...args) => warnings.push(args.join(' ')) },
  })
  assert.deepEqual(result, { sent: false, reason: 'network_error' })
  assert.equal(warnings.length, 1)
  assert.equal(warnings[0], '[email] roster invite delivery failed')
})

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

test('a manager can create a bounded roster invitation and receives a shareable link', async () => {
  const calls = []
  const result = await createRosterInvitation({
    organizationId: 'org-1',
    artistName: 'Nova',
    email: 'nova@example.com',
    scope: ['view', 'share'],
    territory: 'IL',
  }, { Authorization: 'Bearer manager-token' }, async (...args) => {
    calls.push(args)
    return jsonResponse(201, {
      invitation: { id: 'inv-1', status: 'pending', expiresAt: '2026-09-01T00:00:00Z' },
      inviteUrl: 'https://app.lock.show/roster-invite/raw-token',
    })
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], '/api/roster-invitations')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(calls[0][1].headers.Authorization, 'Bearer manager-token')
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    organizationId: 'org-1',
    artistName: 'Nova',
    email: 'nova@example.com',
    scope: ['view', 'share'],
    territory: 'IL',
  })
  assert.equal(result.inviteUrl, 'https://app.lock.show/roster-invite/raw-token')
})

test('an invitee can inspect the bounded invitation before authentication', async () => {
  const result = await getRosterInvitation('token/with slash', async (url, options) => {
    assert.equal(url, '/api/roster-invitations/token%2Fwith%20slash')
    assert.equal(options.method, 'GET')
    return jsonResponse(200, {
      organizationName: 'North Management',
      artistName: 'Nova',
      invitedEmail: 'nova@example.com',
      scope: ['view'],
      status: 'pending',
    })
  })
  assert.equal(result.status, 'pending')
})

test('acceptance is authenticated and returns an active consent receipt', async () => {
  const calls = []
  const result = await acceptRosterInvitation('token', { artistId: 'artist-1' }, { Authorization: 'Bearer artist-token' }, async (...args) => {
    calls.push(args)
    return jsonResponse(200, {
      ok: true,
      receipt: { action: 'roster_invitation_accepted', artistId: 'artist-1', status: 'active' },
    })
  })
  assert.equal(calls[0][0], '/api/roster-invitations/token/accept')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(calls[0][1].headers.Authorization, 'Bearer artist-token')
  assert.equal(result.receipt.status, 'active')
})

test('declining an invitation is authenticated and grants no roster access', async () => {
  const result = await declineRosterInvitation('token', { Authorization: 'Bearer artist-token' }, async (url, options) => {
    assert.equal(url, '/api/roster-invitations/token/decline')
    assert.equal(options.method, 'POST')
    return jsonResponse(200, { ok: true, receipt: { action: 'roster_invitation_declined', status: 'declined' } })
  })
  assert.equal(result.receipt.status, 'declined')
})

test('runtime contract provides no-account invitation, explicit consent, and no direct active roster grant', () => {
  const app = read('src/App.jsx')
  const agency = read('src/features/agency/AgencyDashboard.jsx')
  const invite = read('src/features/agency/RosterInvite.jsx')
  const signup = read('src/features/auth/Signup.jsx')
  const login = read('src/features/auth/Login.jsx')
  const onboarding = read('src/features/artist/Onboarding.jsx')
  const server = read('server/index.js')
  const migrationNames = fs.readdirSync(path.join(root, 'supabase/migrations'))
    .filter((name) => name.endsWith('_roster_invitations.sql'))
  assert.equal(migrationNames.length, 1, 'expected one roster invitation migration')
  const migration = read(`supabase/migrations/${migrationNames[0]}`)

  assert.match(app, /path="\/roster-invite\/:token"/)
  assert.match(app, /locationReturnPath\(location\)/)
  assert.match(agency, /createRosterInvitation/)
  assert.match(agency, /inviteUrl/)
  assert.doesNotMatch(agency, /quickAddHint/)
  assert.match(invite, /acceptRosterInvitation/)
  assert.match(invite, /resolveRosterArtistSelection/)
  assert.match(invite, /listMyArtists/)
  assert.match(invite, /\/signup\?role=artist/)
  assert.match(signup, /savePendingReturn/)
  assert.match(signup, /nav\(pendingReturn \|\| ['"]\/select['"]\)/)
  assert.match(login, /readPendingReturn\(\{ consume: true \}\)/)
  assert.match(onboarding, /readPendingReturn\(\{ consume: true \}\)/)
  assert.match(server, /app\.post\('\/api\/roster-invitations', requireAuth/)
  assert.match(server, /app\.get\('\/api\/roster-invitations\/:token'/)
  assert.match(server, /app\.post\('\/api\/roster-invitations\/:token\/accept', requireAuth/)
  assert.match(server, /app\.post\('\/api\/roster-invitations\/:token\/decline', requireAuth/)
  assert.match(server, /status:\s*'pending'/)
  assert.match(server, /status:\s*'active'/)
  assert.match(migration, /enable row level security/i)
  assert.match(migration, /revoke all on table public\.roster_invitation from anon, authenticated/i)
  assert.match(migration, /token_hash text not null unique/i)
  assert.doesNotMatch(migration, /invite_token\s+text/i)
  assert.match(migration, /create or replace function public\.accept_roster_invitation/i)
  assert.match(migration, /grant execute on function public\.accept_roster_invitation\(uuid, uuid, uuid\) to service_role/i)
  assert.match(migration, /drop policy if exists aa_admin_write on public\.artist_access/i)
  assert.match(migration, /drop policy if exists aa_artist_owner_respond on public\.artist_access/i)
  assert.doesNotMatch(migration, /create policy\s+aa_admin_write[\s\S]*for all/i)
})
