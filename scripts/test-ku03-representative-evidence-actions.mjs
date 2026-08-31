import assert from 'node:assert/strict'
import test from 'node:test'
import * as api from '../src/lib/passportApi.js'
import * as policy from '../server/passportPublishPolicy.js'
const request = { artistId: '73000000-0000-4000-8000-000000000001', actId: '73000000-0000-4000-8000-000000000001',
  objectId: '74000000-0000-4000-8000-000000000001', key: '75000000-0000-4000-8000-000000000001',
  workspaceId: '72000000-0000-4000-8000-000000000001', contextVersion: 0, expectedVersion: 0, expectedObjectVersion: 0,
  action: 'upload', payload: { value: 'https://example.test/source', evidence_type: 'link', source_type: 'public-profile' } }
const receipt = { id: '76000000-0000-4000-8000-000000000001', ...request, version: 1, objectVersion: 1, committedAt: '2026-08-31T00:00:00Z' }
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

if (process.argv.includes('--browser')) test('recipient loader retires protected UI and stale completions across auth and purpose changes in HE/EN', async () => {
  const { createServer, transformWithEsbuild } = await import('vite')
  const { default: react } = await import('@vitejs/plugin-react')
  const { chromium } = await import('playwright')
  const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1')
  const fixtureAuth = `import React from 'react'; export const Context=React.createContext(null); export const useAuth=()=>React.useContext(Context);`
  const entry = `import React,{useState} from 'react'; import {createRoot} from 'react-dom/client'; import {flushSync} from 'react-dom';
    import {MemoryRouter,Routes,Route,useNavigate,useLocation} from 'react-router-dom';
    import {Context} from 'ku03-auth-fixture'; import {LangProvider} from '/src/context/LangContext.jsx';
    import Passport from '/src/features/passport/Passport.jsx'; import '/src/index.css';
    function Harness(){const [auth,setAuth]=useState({user:{id:'recipient'},session:{access_token:'recipient-token'},loading:false}); const nav=useNavigate();window.recipientLocation=useLocation().search;
      window.recipientAuth=value=>flushSync(()=>setAuth(value)); window.recipientPurpose=value=>flushSync(()=>nav('/passport/${request.artistId}'+(value===null?'':'?purpose='+encodeURIComponent(value))));
      return <Context.Provider value={auth}><Routes><Route path='/passport/:id' element={<Passport/>}/></Routes></Context.Provider>}
    createRoot(document.getElementById('root')).render(<LangProvider><MemoryRouter initialEntries={['/passport/${request.artistId}?purpose=Booking']}><Harness/></MemoryRouter></LangProvider>);`
  const vite = await createServer({root,configFile:false,mode:'test',plugins:[{
    name:'ku03-recipient-fixture',enforce:'pre',
    resolveId(id, importer){if(id==='ku03-auth-fixture'||(id.endsWith('/auth/AuthProvider.jsx')&&importer?.endsWith('/Passport.jsx')))return '\0ku03-auth-fixture';if(id==='/ku03-entry.jsx')return '\0ku03-entry.jsx'},
    async load(id){if(id==='\0ku03-auth-fixture')return fixtureAuth;if(id==='\0ku03-entry.jsx')return (await transformWithEsbuild(entry,'ku03-entry.jsx',{loader:'jsx',jsx:'automatic'})).code},
    configureServer(server){server.middlewares.use('/__ku03_recipient',async(_req,res)=>{res.setHeader('content-type','text/html');res.end(await server.transformIndexHtml('/__ku03_recipient','<div id="root"></div><script type="module" src="/ku03-entry.jsx"></script>'))})},
  },react()],server:{host:'127.0.0.1',port:0}})
  await vite.listen();const browser=await chromium.launch();let cells=0
  try {
    for(const lang of ['en','he']) for(const width of [390,768,1440]) {
      const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();page.setDefaultTimeout(8000)
      const errors=[];page.on('pageerror',error=>errors.push(error.message))
      await page.addInitScript(lang=>localStorage.setItem('gigproof_lang',lang),lang)
      let delay=false,held,requests=0
      const snapshot={artist:{id:request.artistId,stage_name:'Protected recipient fixture',published:true},items:[],claims:[]}
      await page.route('**/api/passport/**',async route=>{
        requests++;const url=new URL(route.request().url()),token=route.request().headers().authorization
        if(delay){held=route;return}
        const permitted=token==='Bearer recipient-token'&&url.searchParams.get('purpose')==='Booking'
        await route.fulfill({status:permitted?200:404,json:permitted?snapshot:{error:'Artist not published.'}})
      })
      await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/__ku03_recipient`)
      await page.getByText('Protected recipient fixture',{exact:true}).first().waitFor().catch(async error=>{
        console.log(JSON.stringify({requests,errors,body:(await page.locator('body').innerText()).slice(0,600)}));throw error
      })
      assert.equal(await page.evaluate(()=>document.documentElement.dir),lang==='he'?'rtl':'ltr')
      assert.equal(await page.evaluate(()=>{window.recipientAuth({user:null,session:null,loading:false});return document.body.textContent.includes('Protected recipient fixture')}),false,'auth change must clear protected content in the same render')
      await page.waitForFunction(()=>!document.body.textContent.includes('Protected recipient fixture'))
      await page.evaluate(()=>window.recipientAuth({user:{id:'recipient'},session:{access_token:'recipient-token'},loading:false}))
      await page.getByText('Protected recipient fixture',{exact:true}).first().waitFor()
      await page.evaluate(()=>window.recipientPurpose('Wrong'))
      // MemoryRouter schedules navigation as a transition: bind the assertion
      // to the new React location, not the old render before navigation commits.
      await page.waitForFunction(()=>window.recipientLocation==='?purpose=Wrong')
      assert.equal(await page.getByText('Protected recipient fixture',{exact:true}).count(),0,'new purpose must never render the old protected snapshot')
      await page.evaluate(()=>window.recipientPurpose('Booking'))
      await page.getByText('Protected recipient fixture',{exact:true}).first().waitFor()
      delay=true
      await page.evaluate(()=>window.recipientAuth({user:{id:'recipient'},session:{access_token:'refreshed-token'},loading:false}))
      await page.waitForFunction(()=>!document.body.textContent.includes('Protected recipient fixture'))
      while(!held) await new Promise(resolve=>setTimeout(resolve,10))
      delay=false
      await page.evaluate(()=>window.recipientAuth({user:{id:'other'},session:{access_token:'other-token'},loading:false}))
      await held.fulfill({json:snapshot}).catch(()=>{})
      await page.waitForLoadState('networkidle')
      assert.equal(await page.getByText('Protected recipient fixture',{exact:true}).count(),0,'retired response must not restore prior recipient data')
      await page.evaluate(()=>window.recipientAuth({user:{id:'recipient'},session:{access_token:'recipient-token'},loading:false}))
      await page.getByText('Protected recipient fixture',{exact:true}).first().waitFor()
      await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY')
      await page.evaluate(()=>document.documentElement.style.fontSize='200%')
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
      assert.deepEqual(errors,[]);assert.ok(requests>=6)
      console.log(`KU03_RECIPIENT_BROWSER ${lang}/${width} auth/purpose/stale/keyboard/root-font-reflow OK; real React/caller, mocked Auth and HTTP`);cells++
      await context.close()
    }
    assert.equal(cells,6)
  } finally {await browser.close();await vite.close()}
})

test('recipient read forwards the explicit purpose and exact session without deriving a persona default', async () => {
  const result = await api.readPassportSnapshot(request.artistId, async (url, options) => {
    const exact = url === `/api/passport/${request.artistId}?purpose=Booking%20%26%20review`
      && options.headers?.Authorization === 'Bearer recipient-session'
    return json(exact ? { artist: { id: request.artistId }, items: [], claims: [] } : {}, exact ? 200 : 404)
  }, { purpose: 'Booking & review', accessToken: 'recipient-session' })
  assert.equal(result.artist?.id, request.artistId)
})

test('missing explicit purpose stays absent even with a selected persona', async () => {
  let route
  const result = await api.readPassportSnapshot(request.artistId, async (url) => {
    route = url; return json({}, 404)
  }, { view: 'booking', accessToken: 'recipient-session' })
  assert.equal(route, `/api/passport/${request.artistId}`)
  assert.deepEqual(result, { artist: null, items: [], claims: [] })
})

test('recipient read forwards cancellation instead of completing a retired request', async () => {
  const controller = new AbortController(); controller.abort()
  await assert.rejects(() => api.readPassportSnapshot(request.artistId, async (_url, options) => {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return json({ artist: { id: request.artistId }, items: [], claims: [] })
  }, { signal: controller.signal, purpose: 'Booking', accessToken: 'old-session' }), /network_error/)
})

test('dashboard handoff preserves the selected Act and explicit publication intent without inventing an action envelope', () => {
  const selection = api.publicationSelection?.({ artistId: request.artistId, actId: '77000000-0000-4000-8000-000000000002', action: 'withdraw', contextKey: 'actor:workspace:7' }, 'actor:workspace:7')
  assert.deepEqual(selection, { artistId: request.artistId, actId: '77000000-0000-4000-8000-000000000002', action: 'withdraw', contextKey: 'actor:workspace:7' })
  assert.equal(selection.objectId, undefined)
  assert.equal(selection.audience, undefined)
})

test('dashboard handoff rejects stale context, missing Act and implicit or unsupported publication choices', () => {
  for (const input of [
    { artistId: request.artistId, actId: request.actId, action: 'publish', contextKey: 'old' },
    { artistId: request.artistId, action: 'publish', contextKey: 'current' },
    { artistId: request.artistId, actId: request.actId, action: 'auto', contextKey: 'current' },
  ]) assert.equal(api.publicationSelection?.(input, 'current'), null)
})

test('publication signal waits for exact current history readback and is emitted once', () => {
  const actionRequest = { ...request, action: 'replace' }
  const actionReceipt = { ...receipt, action: 'replace', passportVersionId: 'snapshot-1' }
  const outcome = { status: 'committed', request: actionRequest, receipt: actionReceipt }
  const current = { artistId: request.artistId, actId: request.actId, version: 1,
    authority: { workspaceId: request.workspaceId, contextVersion: 0 },
    objects: [{ id: request.objectId, version: 1, state: 'confirmed' }], history: [{ receipt: actionReceipt }] }
  const signals = [], seen = new Set()
  const emit = (...args) => signals.push(args)
  api.emitGovernedPublication?.(outcome, { ...current, version: 2 }, seen, emit)
  api.emitGovernedPublication?.(outcome, { ...current, history: [] }, seen, emit)
  assert.deepEqual(signals, [])
  api.emitGovernedPublication?.(outcome, current, seen, emit)
  api.emitGovernedPublication?.(outcome, current, seen, emit)
  assert.deepEqual(signals, [['published', { artist_id: request.artistId }]])
})
test('one authenticated action preserves the exact envelope and returns only its receipt', async () => {
  let calls = 0
  const result = await api.performEvidenceAction(request, { Authorization: 'Bearer fixture' }, async (url, options) => {
    calls++; assert.equal(url, '/api/evidence-actions/commit'); assert.equal(options.headers.Authorization, 'Bearer fixture')
    assert.deepEqual(JSON.parse(options.body), request); return json({ status: 'committed', receipt })
  })
  assert.equal(calls, 1); assert.equal(result.status, 'committed'); assert.equal(result.receipt.id, receipt.id)
})
test('response loss resolves the same key without another commit', async () => {
  const paths = []
  const result = await api.performEvidenceAction(request, {}, async (url) => {
    paths.push(url); if (paths.length === 1) throw new TypeError('connection lost')
    return json({ status: 'committed', receipt })
  })
  assert.deepEqual(paths, ['/api/evidence-actions/commit', '/api/evidence-actions/resolve'])
  assert.equal(result.status, 'committed')
})
test('failed commit and failed resolution retain an unresolved request', async () => {
  const result = await api.performEvidenceAction(request, {}, async () => { throw new TypeError('offline') })
  assert.equal(result.status, 'uncertain'); assert.deepEqual(result.request, request)
})
test('missing receipt is not terminal proof', async () => {
  const result = await api.recoverEvidenceAction(request, {}, async () => json({ status: 'committed', receipt: null }))
  assert.equal(result.status, 'uncertain')
})
test('only authoritative fenced noncommit permits safe return', async () => {
  assert.equal((await api.recoverEvidenceAction(request, {}, async () => json({ status: 'not_committed' }))).status, 'not_committed')
})
for (const [key, value] of Object.entries({ key: 'wrong', objectId: 'wrong', workspaceId: 'wrong', contextVersion: 99, artistId: 'wrong', actId: 'wrong', action: 'publish' })) {
  test(`mismatched ${key} receipt never applies`, async () => {
    const result = await api.recoverEvidenceAction(request, {}, async () => json({ status: 'committed', receipt: { ...receipt, [key]: value } }))
    assert.equal(result.status, 'uncertain')
  })
}
test('uniform authorization denial remains denied and never silently retried', async () => {
  let calls = 0
  const result = await api.performEvidenceAction(request, {}, async () => { calls++; return json({ error: 'evidence_action_unavailable' }, 404) })
  assert.equal(result.status, 'denied'); assert.equal(calls, 1)
})
test('server delegates one whole envelope to one atomic RPC', async () => {
  const calls = []
  const result = await policy.executeEvidenceAction({ rpc: async (...args) => { calls.push(args); return { data: receipt, error: null } } }, request)
  assert.deepEqual(calls, [['commit_evidence_action', { p_request: request }]])
  assert.deepEqual(result, { status: 'committed', receipt })
})
test('server never substitutes direct writes after an atomic transaction failure', async () => {
  let calls = 0
  await assert.rejects(() => policy.executeEvidenceAction({ rpc: async () => { calls++; return { data: null, error: { message: 'private detail' } } } }, request), /evidence_action_unavailable/)
  assert.equal(calls, 1)
})
test('server rejects missing version without a database call', async () => {
  let calls = 0
  await assert.rejects(() => policy.executeEvidenceAction({ rpc: async () => { calls++ } }, { ...request, contextVersion: undefined }), /evidence_action_unavailable/)
  assert.equal(calls, 0)
})
test('server resolution uses only the fenced outcome RPC', async () => {
  const calls = []
  const result = await policy.executeEvidenceAction({ rpc: async (...args) => { calls.push(args); return { data: { status: 'not_committed' } } } }, request, 'resolve')
  assert.equal(result.status, 'not_committed'); assert.equal(calls[0][0], 'resolve_evidence_action')
})

const confirmationRequest = { ...request, action: 'confirm', expectedVersion: 2, expectedObjectVersion: 2 }
const confirmation = { status: 'committed', request: confirmationRequest,
  receipt: { ...receipt, action: 'confirm', version: 3, objectVersion: 3 } }
const confirmedReadback = { artistId: request.artistId, actId: request.actId, version: 3,
  authority: { workspaceId: request.workspaceId, contextVersion: 0 },
  objects: [{ id: request.objectId, state: 'confirmed', version: 3, claim: { id: 'claim-exact', approved: true } }] }
test('governed confirmation emits only claim identity after exact committed readback', () => {
  const events = []
  api.emitGovernedConfirmation?.(confirmation, confirmedReadback, new Set(), props => events.push(props))
  assert.deepEqual(events, [{ claim_id: 'claim-exact' }])
})
test('same receipt recovery emits once, without repeating the user action', () => {
  const events = []; const seen = new Set()
  api.emitGovernedConfirmation?.(confirmation, confirmedReadback, seen, props => events.push(props))
  api.emitGovernedConfirmation?.(confirmation, confirmedReadback, seen, props => events.push(props))
  assert.equal(events.length, 1)
})
test('uncertain, proposal, mismatched and stale readbacks never emit confirmation', () => {
  const events = []; const emit = props => events.push(props)
  for (const status of ['uncertain','denied','not_committed']) api.emitGovernedConfirmation?.({ ...confirmation, status }, confirmedReadback, new Set(), emit)
  api.emitGovernedConfirmation?.({ ...confirmation, request: { ...confirmationRequest, action: 'propose' } }, confirmedReadback, new Set(), emit)
  for (const readback of [null, { ...confirmedReadback, version: 4 }, { ...confirmedReadback, actId: 'wrong' },
    { ...confirmedReadback, authority: { ...confirmedReadback.authority, contextVersion: 1 } },
    { ...confirmedReadback, objects: [{ ...confirmedReadback.objects[0], state: 'proposed' }] }]) {
    api.emitGovernedConfirmation?.(confirmation, readback, new Set(), emit)
  }
  assert.deepEqual(events, [])
})
