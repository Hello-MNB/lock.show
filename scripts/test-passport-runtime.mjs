import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import {
  publishPassportSnapshot,
  readPassportSnapshot,
  unpublishPassportSnapshot,
} from '../src/lib/passportApi.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

test('public PASSPORT reads the immutable server snapshot', async () => {
  const calls = []
  const payload = { artist: { id: 'act-1', published: true }, items: [], claims: [] }
  const result = await readPassportSnapshot('act-1', async (...args) => {
    calls.push(args)
    return jsonResponse(200, payload)
  })

  assert.deepEqual(result, payload)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], '/api/passport/act-1')
  assert.equal(calls[0][1]?.method, 'GET')
})

test('publish and unpublish use authenticated server actions and return receipts', async () => {
  const calls = []
  const fetchImpl = async (...args) => {
    calls.push(args)
    const published = args[0].includes('/publish/')
    return jsonResponse(200, {
      ok: true,
      published,
      receipt: { id: published ? 'PUB-1' : 'UNPUB-1', action: published ? 'published' : 'unpublished' },
    })
  }
  const headers = { Authorization: 'Bearer signed-user-token' }

  const published = await publishPassportSnapshot('act/1', headers, fetchImpl)
  const unpublished = await unpublishPassportSnapshot('act/1', headers, fetchImpl)

  assert.equal(calls[0][0], '/api/publish/act%2F1')
  assert.equal(calls[1][0], '/api/unpublish/act%2F1')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(calls[0][1].headers.Authorization, headers.Authorization)
  assert.equal(published.receipt.action, 'published')
  assert.equal(unpublished.receipt.action, 'unpublished')
})

test('an unpublished PASSPORT is a safe empty result while action failures stay explicit', async () => {
  assert.deepEqual(
    await readPassportSnapshot('missing', async () => jsonResponse(404, { error: 'passport_not_published' })),
    { artist: null, items: [], claims: [] },
  )
  await assert.rejects(
    () => publishPassportSnapshot('act-1', {}, async () => jsonResponse(401, { error: 'auth_required' })),
    (error) => error.status === 401 && error.code === 'auth_required',
  )
})

test('runtime wiring never publishes from the browser or serves live-table fallback', () => {
  const db = read('src/lib/db.js')
  const server = read('server/index.js')
  const admin = read('src/features/admin/AdminDashboard.jsx')
  const artistDashboard = read('src/features/artist/ArtistDashboard.jsx')
  const claimReview = read('src/features/artist/ClaimReview.jsx')
  const siteRouting = JSON.parse(read('website-next/vercel.json'))
  const rootPackage = JSON.parse(read('package.json'))
  const sitePackage = JSON.parse(read('website-next/package.json'))
  const publishRoute = server.slice(server.indexOf("app.post('/api/publish/:artistId'"), server.indexOf("app.get('/api/passport/:artistId'"))
  const publicRoute = server.slice(server.indexOf("app.get('/api/passport/:artistId'"), server.indexOf("app.post('/api/passport-signal'"))

  assert.match(db, /return readPassportSnapshot\(id, fetch, \{ purpose, accessToken: session\?\.access_token, signal \}\)/)
  assert.match(db, /return publishPassportSnapshot\(artistId, await authHeaders\(\)\)/)
  assert.match(db, /await unpublishPassportSnapshot\(artist\.id, await authHeaders\(\)\)/)
  assert.doesNotMatch(db, /from\('artists'\)\.update\(\{ published: true \}\)/)
  assert.match(publishRoute, /handleEvidenceAction\(req, res, 'commit'\)/)
  assert.doesNotMatch(publishRoute, /\.from\('passport_versions'\)|\.from\('artists'\)\.update/)
  assert.match(server, /app\.post\('\/api\/unpublish\/:artistId', requireAuth/)
  assert.match(publicRoute, /passport_snapshot_missing/)
  assert.doesNotMatch(publicRoute, /buildSafePayload\(artistId\)/)
  assert.doesNotMatch(db, /adminSetPublished/)
  assert.doesNotMatch(admin, /togglePublished|adminSetPublished|onClick=\{\(\) => togglePublished/)
  assert.doesNotMatch(artistDashboard, /refreshPublic/)
  assert.doesNotMatch(claimReview, /republish|applyCta/)

  assert.deepEqual(siteRouting.redirects, [
    {
      source: '/app/',
      destination: 'https://app.lock.show/',
      permanent: false,
    },
    {
      source: '/app',
      destination: 'https://app.lock.show',
      permanent: false,
    },
    {
      source: '/app/:path*',
      destination: 'https://app.lock.show/:path*',
      permanent: false,
    },
  ])
  assert.equal(siteRouting.rewrites, undefined)
  assert.equal(rootPackage.scripts['build:embed'], undefined)
  assert.equal(sitePackage.scripts['build:with-embed'], 'next build')
  assert.equal(fs.existsSync(path.join(root, 'website-next/public/app')), false)
  assert.equal(fs.existsSync(path.join(root, 'scripts/embed-post.mjs')), false)
  assert.equal(fs.existsSync(path.join(root, 'website-next/proxy.ts')), false)
})

test('publication uses a real atomic transaction, immutable receipt and fail-closed rollback', () => {
  const ci = process.env.LOCK_SHOW_ALLOW_DESTRUCTIVE_TEST_DB === 'lock_show_test'
  const result = spawnSync(process.execPath, ['scripts/tech-baseline/run-representative-evidence-actions.mjs', ...(ci ? ['--ci'] : [])], {
    cwd: root, env: process.env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  })
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /KU03_POSTGRES=18\/18/)
  assert.match(result.stdout, /KU03_ATOMIC_ROLLBACK=4\/4/)
})

test('malformed public PASSPORT identifiers return the unpublished 404 before a database read', () => {
  const server = read('server/index.js')
  const publicRoute = server.slice(server.indexOf("app.get('/api/passport/:artistId'"), server.indexOf("app.post('/api/passport-signal'"))
  const invalidIdGuard = publicRoute.indexOf("if (!isUuid(artistId)) return res.status(404).json({ error: 'Artist not published.' })")
  const artistRead = publicRoute.indexOf(".from('artists')")

  assert.ok(invalidIdGuard >= 0, 'malformed IDs must have the same non-disclosing 404 as unpublished artists')
  assert.ok(artistRead > invalidIdGuard, 'malformed IDs must be rejected before any artists read')
})

test('canonical UUIDv7-shaped public PASSPORT identifiers reach the configured-client gate', async () => {
  process.env.VERCEL = '1'
  process.env.VITE_SUPABASE_URL = ''
  process.env.SUPABASE_SERVICE_ROLE_KEY = ''
  const { default: app } = await import(new URL('../server/index.js', import.meta.url))
  const listener = await new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server))
  })

  try {
    const port = listener.address().port
    const valid = await fetch(`http://127.0.0.1:${port}/api/passport/01890f1e-6c2e-7cc0-8000-000000000001`)
    const malformed = await fetch(`http://127.0.0.1:${port}/api/passport/audit-invalid`)

    assert.equal(valid.status, 503, 'canonical UUIDv7-shaped IDs must pass syntax validation')
    assert.deepEqual(await valid.json(), { error: 'Supabase admin client not configured.' })
    assert.equal(malformed.status, 404)
    assert.deepEqual(await malformed.json(), { error: 'Artist not published.' })
  } finally {
    await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()))
  }
})
