import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

import { isMissingAdminAuthorityStoreError, resolveAdminCapability } from '../src/lib/adminAccess.js'
import { buildContextBeaconModel, contextRoleKey, contextWorkspaceTypeKey } from '../src/lib/contextBeacon.js'
import { countRetryableEvidence } from '../src/lib/evidenceState.js'
import { anthropicKeyState } from '../src/lib/ai/index.js'
import { AnthropicClaimProcessor } from '../src/lib/ai/anthropic.js'
import { T as en } from '../src/lib/i18n/en.js'
import { T as he } from '../src/lib/i18n/he.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

let adminContextModule
async function loadAdminContextModule() {
  if (adminContextModule) return adminContextModule
  const stubs = {
    react: `const h = () => globalThis.__ADMIN_REACT_HARNESS__; export const createContext = () => ({ Provider: (props) => { if (h()) h().contextValue = props.value; return props.children } }); export const useCallback = (value, deps) => h()?.useCallback(value, deps) ?? value; export const useContext = () => null; export const useEffect = (effect, deps) => h()?.useEffect(effect, deps); export const useMemo = (factory, deps) => h()?.useMemo(factory, deps) ?? factory(); export const useRef = (value) => h()?.useRef(value) ?? ({ current: value }); export const useState = (value) => h()?.useState(value) ?? [typeof value === 'function' ? value() : value, () => {}];`,
    'react/jsx-runtime': `const render = (type, props) => typeof type === 'function' ? type(props) : ({ type, props }); export const jsx = render; export const jsxs = render; export const Fragment = Symbol('Fragment');`,
    'react-router-dom': `const h = () => globalThis.__ADMIN_REACT_HARNESS__; export const useLocation = () => h()?.location ?? ({ pathname: '/', search: '' }); export const useNavigate = () => h()?.navigate ?? (() => {});`,
    '../features/auth/AuthProvider.jsx': `export const useAuth = () => globalThis.__ADMIN_REACT_HARNESS__?.auth ?? ({ loading: false, user: null, session: null });`,
  }
  const output = await build({
    entryPoints: [path.join(root, 'src/context/AdminAccessContext.jsx')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    plugins: [{
      name: 'admin-context-test-stubs',
      setup(esbuild) {
        esbuild.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-router-dom|\.\.\/features\/auth\/AuthProvider\.jsx)$/ }, ({ path: importPath }) => ({
          path: importPath,
          namespace: 'admin-context-test-stub',
        }))
        esbuild.onLoad({ filter: /.*/, namespace: 'admin-context-test-stub' }, ({ path: importPath }) => ({
          contents: stubs[importPath],
          loader: 'js',
        }))
      },
    }],
  })
  const source = Buffer.from(output.outputFiles[0].text).toString('base64')
  adminContextModule = await import(`data:text/javascript;base64,${source}`)
  return adminContextModule
}

function createAdminComponentHarness({ auth, pathname = '/admin', storageValues = new Map(), fetchImpl }) {
  const hooks = []
  const pendingEffects = []
  const navigation = []
  let hookIndex = 0
  let dirty = false
  const previousGlobals = {
    harness: globalThis.__ADMIN_REACT_HARNESS__,
    window: globalThis.window,
    document: globalThis.document,
    fetch: globalThis.fetch,
  }
  const sessionStorage = {
    getItem: (key) => storageValues.get(key) ?? null,
    setItem: (key, value) => storageValues.set(key, value),
    removeItem: (key) => storageValues.delete(key),
  }
  const windowListeners = new Map()
  const documentListeners = new Map()
  const windowRef = {
    sessionStorage,
    setInterval: () => 73,
    clearInterval: () => {},
    addEventListener: (name, callback) => windowListeners.set(name, callback),
    removeEventListener: (name, callback) => { if (windowListeners.get(name) === callback) windowListeners.delete(name) },
  }
  const documentRef = {
    visibilityState: 'visible',
    addEventListener: (name, callback) => documentListeners.set(name, callback),
    removeEventListener: (name, callback) => { if (documentListeners.get(name) === callback) documentListeners.delete(name) },
  }
  const harness = {
    auth,
    contextValue: null,
    location: { pathname, search: '' },
    navigate: (...args) => navigation.push(args),
    useState(initial) {
      const index = hookIndex++
      if (!hooks[index]) hooks[index] = { kind: 'state', value: typeof initial === 'function' ? initial() : initial }
      const setValue = (next) => {
        const value = typeof next === 'function' ? next(hooks[index].value) : next
        if (!Object.is(value, hooks[index].value)) {
          hooks[index].value = value
          dirty = true
        }
      }
      return [hooks[index].value, setValue]
    },
    useRef(initial) {
      const index = hookIndex++
      if (!hooks[index]) hooks[index] = { kind: 'ref', value: { current: initial } }
      return hooks[index].value
    },
    useCallback(value, deps) {
      return memoized(indexForHook(), value, deps)
    },
    useMemo(factory, deps) {
      const index = indexForHook()
      const previous = hooks[index]
      if (!previous || !sameDependencies(previous.deps, deps)) {
        hooks[index] = { kind: 'memo', deps, value: factory() }
      }
      return hooks[index].value
    },
    useEffect(effect, deps) {
      const index = indexForHook()
      const previous = hooks[index]
      if (!previous || !sameDependencies(previous.deps, deps)) {
        pendingEffects.push({ index, effect, cleanup: previous?.cleanup })
        hooks[index] = { kind: 'effect', deps, cleanup: previous?.cleanup }
      }
    },
    render(module, { flushEffects = true } = {}) {
      hookIndex = 0
      dirty = false
      module.AdminAccessProvider({ children: null })
      while (flushEffects && pendingEffects.length) {
        const pending = pendingEffects.shift()
        pending.cleanup?.()
        hooks[pending.index].cleanup = pending.effect()
      }
    },
    async settle(module, turns = 12) {
      for (let turn = 0; turn < turns; turn += 1) {
        harness.render(module)
        await Promise.resolve()
        await Promise.resolve()
        if (!dirty && pendingEffects.length === 0) return
      }
      throw new Error('component harness did not settle')
    },
    unmount() {
      for (const hook of hooks) hook?.cleanup?.()
      globalThis.__ADMIN_REACT_HARNESS__ = previousGlobals.harness
      globalThis.window = previousGlobals.window
      globalThis.document = previousGlobals.document
      globalThis.fetch = previousGlobals.fetch
    },
  }

  function indexForHook() {
    return hookIndex++
  }
  function memoized(index, value, deps) {
    const previous = hooks[index]
    if (!previous || !sameDependencies(previous.deps, deps)) hooks[index] = { kind: 'memo', deps, value }
    return hooks[index].value
  }

  globalThis.__ADMIN_REACT_HARNESS__ = harness
  globalThis.window = windowRef
  globalThis.document = documentRef
  globalThis.fetch = fetchImpl
  return { harness, navigation, storageValues, windowListeners, documentListeners }
}

function sameDependencies(previous, next) {
  return Array.isArray(previous)
    && Array.isArray(next)
    && previous.length === next.length
    && previous.every((value, index) => Object.is(value, next[index]))
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((accept, fail) => { resolve = accept; reject = fail })
  return { promise, resolve, reject }
}

const capabilityResponse = (ok, result) => ({ ok, json: async () => result })

test('hard reload waits for delayed auth restoration before preflight and keeps an allowed Admin on /admin', async () => {
  const module = await loadAdminContextModule()
  const storageValues = new Map([['lockshow:admin-return:user-a', '/agency']])
  const requests = []
  const runtime = createAdminComponentHarness({
    auth: { loading: true, user: null, session: null },
    storageValues,
    fetchImpl: async (...args) => {
      requests.push(args)
      return capabilityResponse(true, { allowed: true, environmentId: 'production' })
    },
  })
  try {
    await runtime.harness.settle(module)
    assert.equal(requests.length, 0)
    assert.deepEqual(runtime.navigation, [])

    runtime.harness.auth = { loading: false, user: { id: 'user-a' }, session: { access_token: 'token-a' } }
    await runtime.harness.settle(module)

    assert.equal(requests.length, 1)
    assert.equal(runtime.harness.contextValue.allowed, true)
    assert.equal(runtime.harness.contextValue.loading, false)
    assert.deepEqual(runtime.navigation, [])
  } finally {
    runtime.harness.unmount()
  }
})

test('settled auth denial after hard reload replaces /admin with the restored per-user return', async () => {
  const module = await loadAdminContextModule()
  const storageValues = new Map([['lockshow:admin-return:user-a', '/agency']])
  const runtime = createAdminComponentHarness({
    auth: { loading: true, user: null, session: null },
    storageValues,
    fetchImpl: async () => capabilityResponse(false, { allowed: false, reason: 'revoked' }),
  })
  try {
    await runtime.harness.settle(module)
    assert.deepEqual(runtime.navigation, [])
    runtime.harness.auth = { loading: false, user: { id: 'user-a' }, session: { access_token: 'token-a' } }
    await runtime.harness.settle(module)
    assert.deepEqual(runtime.navigation, [['/agency', { replace: true }]])
  } finally {
    runtime.harness.unmount()
  }
})

test('a stale success cannot overwrite the latest denial', async () => {
  const { createAdminPreflightGate, runAdminCapabilityPreflight } = await loadAdminContextModule()
  const first = deferred()
  const second = deferred()
  const pending = [first, second]
  const access = []
  const gate = createAdminPreflightGate('user-a:token-a:production')
  const input = {
    user: { id: 'user-a' }, accessToken: 'token-a', identity: 'user-a:token-a:production', requestGate: gate,
    fetchImpl: () => pending.shift().promise, setAccess: (value) => access.push(value), setLoading: () => {},
  }

  const older = runAdminCapabilityPreflight(input)
  const latest = runAdminCapabilityPreflight({ ...input, background: true })
  second.resolve(capabilityResponse(false, { reason: 'revoked' }))
  assert.deepEqual(await latest, { allowed: false, reason: 'revoked' })
  first.resolve(capabilityResponse(true, { allowed: true }))
  assert.deepEqual(await older, { allowed: false, reason: 'stale_preflight' })
  assert.deepEqual(access, [{ allowed: false, reason: 'revoked' }])
})

test('a stale failure cannot replace the latest success', async () => {
  const { createAdminPreflightGate, runAdminCapabilityPreflight } = await loadAdminContextModule()
  const first = deferred()
  const second = deferred()
  const pending = [first, second]
  const access = []
  const gate = createAdminPreflightGate('user-a:token-a:production')
  const input = {
    user: { id: 'user-a' }, accessToken: 'token-a', identity: 'user-a:token-a:production', requestGate: gate,
    fetchImpl: () => pending.shift().promise, setAccess: (value) => access.push(value), setLoading: () => {},
  }

  const older = runAdminCapabilityPreflight(input)
  const latest = runAdminCapabilityPreflight({ ...input, background: true })
  second.resolve(capabilityResponse(true, { allowed: true }))
  assert.deepEqual(await latest, { allowed: true })
  first.reject(new Error('older network failure'))
  assert.deepEqual(await older, { allowed: false, reason: 'stale_preflight' })
  assert.deepEqual(access, [{ allowed: true }])
})

test('auth identity change invalidates an in-flight capability result', async () => {
  const { createAdminPreflightGate, runAdminCapabilityPreflight } = await loadAdminContextModule()
  const response = deferred()
  const access = []
  const gate = createAdminPreflightGate('user-a:token-a:production')
  const pending = runAdminCapabilityPreflight({
    user: { id: 'user-a' }, accessToken: 'token-a', identity: 'user-a:token-a:production', requestGate: gate,
    fetchImpl: () => response.promise, setAccess: (value) => access.push(value), setLoading: () => {},
  })
  gate.setIdentity('user-a:token-b:production')
  response.resolve(capabilityResponse(true, { allowed: true }))

  assert.deepEqual(await pending, { allowed: false, reason: 'stale_preflight' })
  assert.deepEqual(access, [])
})

test('auth identity change synchronously hides authority before effects can clear prior state', async () => {
  const module = await loadAdminContextModule()
  const changedAuthStates = [
    { loading: false, user: { id: 'user-b' }, session: { access_token: 'token-a' } },
    { loading: false, user: { id: 'user-a' }, session: { access_token: 'token-b' } },
  ]
  for (const changedAuth of changedAuthStates) {
    const runtime = createAdminComponentHarness({
      auth: { loading: false, user: { id: 'user-a' }, session: { access_token: 'token-a' } },
      fetchImpl: async () => capabilityResponse(true, { allowed: true, environmentId: 'production' }),
    })
    try {
      await runtime.harness.settle(module)
      assert.equal(runtime.harness.contextValue.allowed, true)
      assert.equal(runtime.harness.contextValue.loading, false)

      runtime.harness.auth = changedAuth
      runtime.harness.render(module, { flushEffects: false })

      assert.equal(runtime.harness.contextValue.allowed, false)
      assert.equal(runtime.harness.contextValue.loading, true)
    } finally {
      runtime.harness.unmount()
    }
  }
})

test('unmount invalidates an in-flight capability result', async () => {
  const { createAdminPreflightGate, runAdminCapabilityPreflight } = await loadAdminContextModule()
  const response = deferred()
  const access = []
  const loading = []
  const gate = createAdminPreflightGate('user-a:token-a:production')
  const pending = runAdminCapabilityPreflight({
    user: { id: 'user-a' }, accessToken: 'token-a', identity: 'user-a:token-a:production', requestGate: gate,
    fetchImpl: () => response.promise, setAccess: (value) => access.push(value), setLoading: (value) => loading.push(value),
  })
  gate.dispose()
  response.resolve(capabilityResponse(true, { allowed: true }))

  assert.deepEqual(await pending, { allowed: false, reason: 'stale_preflight' })
  assert.deepEqual(access, [])
  assert.deepEqual(loading, [true])
})

test('Admin return paths are user-scoped, persisted for reload and reject Admin or protocol-relative targets', async () => {
  const {
    adminReturnStorageKey,
    isSafeAdminReturnPath,
    readAdminReturnPath,
    writeAdminReturnPath,
  } = await loadAdminContextModule()
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }

  assert.equal(adminReturnStorageKey('user-a'), 'lockshow:admin-return:user-a')
  assert.equal(isSafeAdminReturnPath('/agency?tab=team'), true)
  assert.equal(isSafeAdminReturnPath('//evil.example'), false)
  assert.equal(isSafeAdminReturnPath('/admin'), false)
  assert.equal(isSafeAdminReturnPath('/admin/audit'), false)

  writeAdminReturnPath('user-a', '/agency?tab=team', storage)
  assert.equal(readAdminReturnPath('user-a', storage), '/agency?tab=team')
  assert.equal(readAdminReturnPath('user-b', storage), null)
  writeAdminReturnPath('user-a', '//evil.example', storage)
  assert.equal(readAdminReturnPath('user-a', storage), '/agency?tab=team')
})

test('storage failure preserves the lawful in-memory return before falling back to root', async () => {
  const { readAdminReturnPath, resolveAdminReturnPath } = await loadAdminContextModule()
  const unavailableStorage = { getItem: () => { throw new Error('blocked') } }

  assert.equal(readAdminReturnPath('user-a', unavailableStorage), null)
  assert.equal(resolveAdminReturnPath(null, '/artist/home'), '/artist/home')
  assert.equal(resolveAdminReturnPath(null, '/admin'), '/')
  assert.equal(resolveAdminReturnPath(null, '//evil.example'), '/')
})

test('denied or revoked Admin state clears the return and navigates with replace', async () => {
  const { leaveAdminContext, writeAdminReturnPath } = await loadAdminContextModule()
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
  writeAdminReturnPath('user-a', '/agency', storage)
  const navigation = []
  const memoryRef = { current: '/artist/home' }

  const target = leaveAdminContext({
    userId: 'user-a',
    memoryRef,
    storage,
    navigate: (...args) => navigation.push(args),
    replace: true,
  })

  assert.equal(target, '/agency')
  assert.equal(memoryRef.current, '/')
  assert.equal(readMap(values, 'lockshow:admin-return:user-a'), null)
  assert.deepEqual(navigation, [['/agency', { replace: true }]])
})

test('background capability revalidation updates authority without blanking the Admin UI', async () => {
  const { runAdminCapabilityPreflight } = await loadAdminContextModule()
  const loading = []
  const access = []

  const result = await runAdminCapabilityPreflight({
    user: { id: 'user-a' },
    accessToken: 'token',
    background: true,
    fetchImpl: async () => ({ ok: false, json: async () => ({ reason: 'revoked' }) }),
    setAccess: (value) => access.push(value),
    setLoading: (value) => loading.push(value),
  })

  assert.deepEqual(result, { allowed: false, reason: 'revoked' })
  assert.deepEqual(access, [{ allowed: false, reason: 'revoked' }])
  assert.deepEqual(loading, [])
})

test('foreground capability preflight owns the loading lifecycle', async () => {
  const { runAdminCapabilityPreflight } = await loadAdminContextModule()
  const loading = []

  await runAdminCapabilityPreflight({
    user: { id: 'user-a' },
    accessToken: 'token',
    fetchImpl: async () => ({ ok: true, json: async () => ({ allowed: true }) }),
    setAccess: () => {},
    setLoading: (value) => loading.push(value),
  })

  assert.deepEqual(loading, [true, false])
})

test('Admin revalidation subscribes to timer, focus and visible-tab signals and fully cleans up', async () => {
  const { subscribeAdminRevalidation } = await loadAdminContextModule()
  const windowListeners = new Map()
  const documentListeners = new Map()
  let visibilityState = 'visible'
  let timerCallback
  let clearedTimer
  const calls = []
  const windowRef = {
    addEventListener: (name, fn) => windowListeners.set(name, fn),
    removeEventListener: (name, fn) => { if (windowListeners.get(name) === fn) windowListeners.delete(name) },
    setInterval: (fn, ms) => { timerCallback = fn; assert.equal(ms, 60_000); return 41 },
    clearInterval: (id) => { clearedTimer = id },
  }
  const documentRef = {
    addEventListener: (name, fn) => documentListeners.set(name, fn),
    removeEventListener: (name, fn) => { if (documentListeners.get(name) === fn) documentListeners.delete(name) },
    get visibilityState() { return visibilityState },
  }

  const cleanup = subscribeAdminRevalidation({
    windowRef,
    documentRef,
    revalidate: (options) => calls.push(options),
  })
  timerCallback()
  windowListeners.get('focus')()
  visibilityState = 'hidden'
  documentListeners.get('visibilitychange')()
  visibilityState = 'visible'
  documentListeners.get('visibilitychange')()

  assert.deepEqual(calls, [
    { background: true },
    { background: true },
    { background: true },
  ])
  cleanup()
  assert.equal(clearedTimer, 41)
  assert.equal(windowListeners.size, 0)
  assert.equal(documentListeners.size, 0)
})

function readMap(values, key) {
  return values.has(key) ? values.get(key) : null
}

test('an artist can also hold an active environment-bound admin capability', () => {
  const result = resolveAdminCapability({
    profileRole: 'artist',
    requestedEnvironment: 'production',
    now: new Date('2026-08-20T12:00:00Z'),
    memberships: [{
        environment_id: 'production',
        status: 'active',
        capabilities: ['admin.environment'],
        expires_at: '2026-08-21T00:00:00Z',
    }],
  })

  assert.equal(result.allowed, true)
  assert.equal(result.environmentId, 'production')
  assert.equal(result.capability, 'admin.environment')
  assert.equal(result.source, 'environment_admin_membership')
})

test('admin capability fails closed for missing, wrong-environment, revoked and expired grants', () => {
  const base = {
    profileRole: 'artist',
    requestedEnvironment: 'production',
    now: new Date('2026-08-20T12:00:00Z'),
  }

  assert.equal(resolveAdminCapability({ ...base, memberships: [] }).allowed, false)
  assert.equal(resolveAdminCapability({
    ...base, memberships: [{ environment_id: 'staging', status: 'active', capabilities: ['admin.environment'] }],
  }).reason, 'wrong_environment')
  assert.equal(resolveAdminCapability({
    ...base, memberships: [{ environment_id: 'production', status: 'revoked', capabilities: ['admin.environment'] }],
  }).reason, 'revoked')
  assert.equal(resolveAdminCapability({
    ...base, memberships: [{ environment_id: 'production', status: 'active', capabilities: ['admin.environment'], expires_at: '2026-08-20T11:59:59Z' }],
  }).reason, 'expired')
})

test('missing Supabase Admin authority store is recognized without weakening fail-closed access', () => {
  assert.equal(isMissingAdminAuthorityStoreError({ code: '42P01' }), true)
  assert.equal(isMissingAdminAuthorityStoreError({ code: 'PGRST205' }), true)
  assert.equal(isMissingAdminAuthorityStoreError({ code: '42501' }), false)
  assert.equal(isMissingAdminAuthorityStoreError(null), false)
})

test('legacy operator role is not silently treated as an environment capability', () => {
  const result = resolveAdminCapability({
    profileRole: 'operator',
    requestedEnvironment: 'production',
    now: new Date('2026-08-20T12:00:00Z'),
    memberships: [],
  })
  assert.equal(result.allowed, false)
  assert.equal(result.reason, 'missing_membership')
})

test('context beacon keeps person, role, environment and workspace distinct', () => {
  const model = buildContextBeaconModel({
    personName: 'Maria',
    role: 'artist',
    environmentId: 'production',
    workspaceName: 'ARTIST',
    workspaceType: 'artist',
  })

  assert.deepEqual(model, {
    personName: 'Maria',
    role: 'artist',
    environmentId: 'production',
    workspaceName: 'ARTIST',
    workspaceType: 'artist',
  })
})

test('context beacon maps technical role and workspace values to explicit localized labels', () => {
  assert.equal(contextRoleKey('artist'), 'contextRoleArtist')
  assert.equal(contextRoleKey('agency'), 'contextRoleRepresentation')
  assert.equal(contextRoleKey('booker'), 'contextRoleBuyer')
  assert.equal(contextRoleKey('producer'), 'contextRoleConfirmer')
  assert.equal(contextRoleKey('admin'), 'contextRoleAdmin')
  assert.equal(contextRoleKey('unknown'), 'contextRolePending')

  assert.equal(contextWorkspaceTypeKey('artist'), 'contextWorkspaceArtist')
  assert.equal(contextWorkspaceTypeKey('management'), 'contextWorkspaceRepresentation')
  assert.equal(contextWorkspaceTypeKey('producer'), 'contextWorkspaceProduction')
  assert.equal(contextWorkspaceTypeKey('admin'), 'contextWorkspaceAdmin')
  assert.equal(contextWorkspaceTypeKey('unknown'), 'contextWorkspaceGeneric')
})

test('context beacon keeps all four orientation labels visible at every breakpoint', () => {
  const beacon = read('src/components/layout/ContextBeacon.jsx')
  for (const key of ['contextPersonLabel', 'contextWorkspaceLabel', 'contextRoleLabel', 'contextEnvironmentLabel']) {
    assert.match(beacon, new RegExp(`T\\.org\\.${key}`))
  }
  assert.doesNotMatch(beacon, /hidden[^\n]*(?:contextRole|environmentId)|(?:contextRole|environmentId)[^\n]*hidden/)
})

test('new LOCK.SHOW sessions default to Hebrew while preserving an explicit English choice', () => {
  const lang = read('src/context/LangContext.jsx')
  assert.match(lang, /return saved === 'en' \? 'en' : 'he'/)
})

test('RADAR Scanner has native Hebrew copy for every claim-first action', () => {
  const intentKeys = [
    'drew-crowd', 'sold-via-link', 'rebooked', 'community',
    'produced-event', 'consistent-frequency', 'producer-confirm',
  ]

  for (const key of intentKeys) {
    assert.equal(typeof he.evidence.intents?.[key], 'string', `missing Hebrew intent: ${key}`)
    assert.equal(typeof he.evidence.intentAsk?.[key], 'string', `missing Hebrew evidence ask: ${key}`)
    assert.notEqual(he.evidence.intents[key], en.evidence.intents[key], `English fallback leaked into Hebrew: ${key}`)
  }
})

test('RADAR Scanner reports degraded processing truthfully and keeps failed evidence retryable', () => {
  const capture = read('src/features/evidence/EvidenceCapture.jsx')

  assert.equal(countRetryableEvidence([{ status: 'error' }]), 1)
  assert.equal(countRetryableEvidence([{ status: 'submitted' }, { status: 'error' }, { status: 'processed' }]), 2)
  assert.equal(countRetryableEvidence([{ status: 'processed' }]), 0)
  assert.match(capture, /result\.ai === 'degraded'/)
  assert.match(capture, /T\.evidence\.scannerDegraded/)
  assert.match(capture, /countRetryableEvidence\(evidence\)/)
  assert.match(capture, /e\.status === 'error' \? T\.evidence\.retryable/)
  assert.equal(typeof he.evidence.scannerDegraded, 'string')
  assert.equal(typeof en.evidence.scannerDegraded, 'string')
  assert.equal(typeof he.evidence.retryable, 'string')
  assert.equal(typeof en.evidence.retryable, 'string')
})

test('Anthropic configuration rejects a foreign credential without exposing it', () => {
  assert.equal(anthropicKeyState(), 'missing')
  assert.equal(anthropicKeyState(''), 'missing')
  assert.equal(anthropicKeyState('not-an-anthropic-key'), 'misconfigured')
  assert.equal(anthropicKeyState('sk-ant-api03-example'), 'configured')
})

test('a misconfigured Anthropic credential degrades locally without a network attempt', async () => {
  const processor = new AnthropicClaimProcessor('not-an-anthropic-key', 'test-model')
  const result = await processor.labelWithMethod({
    evidence_type: 'link',
    source_type: 'producer-vouch',
    value: 'Synthetic evidence',
  })
  assert.equal(result.method, 'deterministic_fallback')
  assert.equal(result.aiFailed, true)
})

test('PASSPORT database firewall keeps private RADAR rationale and snapshot JSON away from anon', () => {
  const migration = read('supabase/migrations/20260820091500_passport_public_payload_firewall.sql')
  const rollback = read('supabase/rollback/20260820091500_passport_public_payload_firewall.sql')

  assert.match(migration, /revoke select on public\.claims from anon/i)
  assert.doesNotMatch(migration.match(/grant select \([^;]+\)\s+on public\.claims to anon/is)?.[0] ?? '', /reason_code/i)
  assert.match(migration, /revoke select on public\.passport_versions from anon/i)
  assert.match(migration, /grant select \(id, artist_id, created_at\)\s+on public\.passport_versions to anon/i)
  assert.match(rollback, /reason_code/i)
  assert.match(rollback, /grant select \(id, artist_id, snapshot, created_at\)/i)
})

test('admin migration is fail-closed, environment-bound and rollback-backed', () => {
  const migration = read('supabase/migrations/20260820042812_environment_admin_membership.sql')
  const rollback = read('supabase/rollback/20260820042812_environment_admin_membership.sql')

  assert.match(migration, /create table if not exists public\.environment_admin_membership/i)
  assert.match(migration, /grant_source text not null/i)
  assert.match(migration, /force row level security/i)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from public, anon, authenticated/i)
  assert.match(migration, /membership\.environment_id = requested_environment/i)
  assert.match(migration, /membership\.status = 'active'/i)
  assert.match(migration, /membership\.expires_at is null or membership\.expires_at > now\(\)/i)
  assert.match(migration, /select public\.has_admin_capability\('production', 'admin\.environment'\)/i)
  assert.doesNotMatch(migration, /insert into public\.environment_admin_membership[\s\S]*from public\.profiles profile[\s\S]*profile\.role = 'operator'/i)
  assert.doesNotMatch(migration.match(/create or replace function public\.is_operator\(\)[\s\S]*?\$\$;/i)?.[0] ?? '', /profiles[\s\S]*role = 'operator'/i)
  assert.match(rollback, /drop table if exists public\.environment_admin_membership/i)
  assert.doesNotMatch(rollback, /profiles[\s\S]*role = 'operator'|drop function if exists public\.is_operator/i)
  assert.match(rollback, /create or replace function public\.is_operator\(\)[\s\S]*select false;/i)
  assert.match(rollback, /create or replace function public\.is_operator\(\)[\s\S]*drop function if exists public\.has_admin_capability/is)
})

test('explicit production Admin grant creates only a new provenance-bound authority row', () => {
  const migrationNames = fs.readdirSync(path.join(root, 'supabase/migrations'))
    .filter((name) => name.endsWith('_explicit_hello_admin_grant.sql'))
  assert.equal(migrationNames.length, 1, 'expected one CLI-created explicit production Admin grant migration')
  const [migrationName] = migrationNames
  const migrationPath = `supabase/migrations/${migrationName}`
  const rollbackPath = `supabase/rollback/${migrationName}`
  const grantSource = '20260824173241_explicit_hello_admin_grant'
  const approvedAuthUserId = 'bd6af802-607c-4faf-93d4-e0a32f10804e'

  assert.equal(fs.existsSync(path.join(root, migrationPath)), true, 'explicit production Admin grant migration must exist')
  assert.equal(fs.existsSync(path.join(root, rollbackPath)), true, 'explicit production Admin grant rollback must exist')

  const migration = read(migrationPath)
  const rollback = read(rollbackPath)
  const authorityMigration = read('supabase/migrations/20260820042812_environment_admin_membership.sql')

  assert.match(migration, /from auth\.users/i)
  assert.match(migration, new RegExp(`id = '${approvedAuthUserId}'::uuid`, 'i'))
  assert.match(migration, /lower\(email\) = 'hello@lock\.show'/i)
  assert.match(migration, /email_confirmed_at is not null/i)
  assert.match(migration, /deleted_at is null/i)
  assert.match(migration, /banned_until is null or banned_until <= now\(\)/i)
  assert.match(migration, /if v_identity_count <> 1 then/i)
  assert.match(migration, /if exists \(\s*select 1\s*from public\.environment_admin_membership\s*where person_id = v_person_id\s*and environment_id = 'production'/is)
  assert.match(migration, /raise exception 'explicit_admin_grant_membership_exists'/i)
  assert.match(migration, /insert into public\.environment_admin_membership/i)
  assert.match(migration, new RegExp(`v_person_id, 'production', 'active', array\\['admin\\.environment'\\]::text\\[\\], v_person_id, '${grantSource}'`, 'i'))
  assert.doesNotMatch(migration, /on conflict|environment_admin_membership\.capabilities.*\|\| excluded\.capabilities/is)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from public, anon, authenticated/i)
  assert.match(migration, /revoke all on table public\.environment_admin_membership from service_role;\s*grant select on table public\.environment_admin_membership to service_role/i)
  assert.match(migration, /grant select on table public\.environment_admin_membership to service_role/i)
  assert.doesNotMatch(migration, /profiles\.role|platform_owner|workspace ownership|user_metadata|app_metadata/i)

  assert.match(authorityMigration, /security definer/i)
  assert.match(authorityMigration, /set search_path = ''/i)
  assert.match(authorityMigration, /from public\.environment_admin_membership membership/i)
  assert.match(authorityMigration, /membership\.person_id = auth\.uid\(\)/i)
  assert.match(authorityMigration, /grant execute on function public\.has_admin_capability\(text, text\) to authenticated/i)

  assert.match(rollback, /v_provenance_count integer/i)
  assert.match(rollback, /if v_provenance_count <> 1 then/i)
  assert.match(rollback, /v_expected_membership_count integer/i)
  assert.match(rollback, /if v_expected_membership_count <> 1 then/i)
  assert.match(rollback, /delete from public\.environment_admin_membership/i)
  assert.match(rollback, /person_id = v_person_id/i)
  assert.match(rollback, /environment_id = 'production'/i)
  assert.match(rollback, new RegExp(`grant_source = '${grantSource}'`, 'i'))
  assert.match(rollback, /status = 'active'/i)
  assert.match(rollback, /capabilities = array\['admin\.environment'\]::text\[\]/i)
  assert.match(rollback, /expires_at is null/i)
  assert.doesNotMatch(rollback, /from auth\.users|hello@lock\.show/i)
  assert.doesNotMatch(rollback, /update public\.environment_admin_membership|array_remove|cardinality\(capabilities\)/i)
  assert.doesNotMatch(rollback, /drop table|drop function|profiles\.role|platform_owner/i)
})

test('application routes and navigation consume the capability gate without leaking Admin into customer navigation', () => {
  const app = read('src/App.jsx')
  const shell = read('src/components/layout/AppShell.jsx')
  const switcher = read('src/features/org/ContextSwitcher.jsx')
  const server = read('server/index.js')

  assert.match(app, /function RequireAdmin/)
  assert.match(app, /path="\/admin" element=\{<RequireAdmin>/)
  assert.doesNotMatch(app, /path="\/admin"[\s\S]{0,120}RequireRole role=\{ROLES\.OPERATOR\}/)
  assert.match(shell, /!adminMode[\s\S]{0,120}<BottomNav/)
  assert.match(switcher, /adminAllowed &&/)
  assert.match(server, /app\.get\('\/api\/admin\/capability', requireAuth/)
  assert.match(server, /\.from\('environment_admin_membership'\)/)
})
