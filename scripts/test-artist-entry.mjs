import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash, randomUUID } from 'node:crypto'
import { entryOriginObjects, entryOriginSelection } from '../src/lib/artistEntry.js'
import * as entryOriginContract from '../src/lib/artistEntry.js'

// Execute the production reload/settle functions, not a simulated UI decision.
function originWorkbenchHarness(workbench, request, uploadReceipt) {
  const source=fs.readFileSync(new URL('../src/features/evidence/EvidenceCapture.jsx',import.meta.url),'utf8')
  const extract=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)))
  const state={pending:request,status:'loading',data:null,receipt:null,selected:null,focus:0,effects:0}
  const sandbox={...entryOriginContract,generation:{current:1},currentScope:{current:'same'},
    getEvidenceWorkbench:async()=>workbench,artistId:request.artistId,actId:request.actId,
    matches:w=>w.artistId===request.artistId&&w.actId===request.actId&&w.authority?.actorId===uploadReceipt.actorId
      &&w.authority.workspaceId===request.workspaceId&&w.authority.contextVersion===request.contextVersion,
    originObject:uploadReceipt.objectId,originReceipt:uploadReceipt.id,originVersion:String(uploadReceipt.objectVersion),
    selectedActId:null,requestedActId:request.actId,user:{id:uploadReceipt.actorId},contextUnresolved:false,
    select:v=>{state.selected=v},setReceipt:v=>{state.receipt=v},setData:v=>{state.data=v},setPending:v=>{state.pending=v},
    setStatus:v=>{state.status=v},setBusy(){},busyRef:{current:true},focusRef:{current:{focus(){state.focus++}}},
    emitGovernedConfirmation(){state.effects++},emitGovernedPublication(){state.effects++},emittedReceipts:{current:new Set()}}
  vm.createContext(sandbox)
  const functions=vm.runInContext(`(function(){${extract('  async function reload(','\n  useEffect(')}\n${extract('  async function settle(','\n  async function act(')};return {reload,settle}})()`,sandbox)
  return {...functions,state,sandbox}
}

function withdrawnOrigin() {
  const upload={id:'upload-a',key:'upload-key',action:'upload',actorId:'person-a',workspaceId:'org-a',artistId:'artist-a',actId:'act-b',contextVersion:2,objectId:'object-a',version:1,objectVersion:1,committedAt:'2026-08-31T00:00:00Z'}
  const request={action:'withdraw',key:'withdraw-key',workspaceId:'org-a',artistId:'artist-a',actId:'act-b',contextVersion:2,objectId:'object-a',expectedVersion:1,expectedObjectVersion:1,payload:{reason:'Synthetic withdrawal'}}
  const receipt={...upload,...request,id:'withdraw-a',version:2,objectVersion:2,committedAt:'2026-08-31T01:00:00Z'}
  const workbench={artistId:request.artistId,actId:request.actId,version:2,authority:{actorId:upload.actorId,workspaceId:request.workspaceId,contextVersion:2,owner:true},objects:[{id:request.objectId,version:2,state:'withdrawn'}],history:[{action:'upload',receipt:upload},{action:'withdraw',receipt}]}
  return {upload,request,receipt,workbench,outcome:{status:'committed',request,receipt}}
}

test('ORIGIN-WITHDRAW committed terminal readback clears pending and retires older continuation',async()=>{
  const {upload,request,receipt,workbench,outcome}=withdrawnOrigin()
  const harness=originWorkbenchHarness(workbench,request,upload)
  await harness.settle(outcome,1,'same')
  assert.equal(harness.state.status,'committed','matching withdrawal receipt must not remain uncertain')
  assert.equal(harness.state.pending,null);assert.equal(harness.state.receipt.id,receipt.id)
  assert.equal(harness.state.data.objects[0].state,'withdrawn')
  const settled=structuredClone(harness.state)
  await harness.settle(outcome,1,'same')
  assert.deepEqual(harness.state,settled,'retired continuation cannot re-lock or repeat effects')
})

test('ORIGIN-WITHDRAW initial withdrawn, invalid or unrelated links still deny before exposing data',async()=>{
  for(const kind of ['withdrawn','unrelated','missing-history']) {
    const {upload,request,workbench}=withdrawnOrigin()
    if(kind==='unrelated')upload.id='unrelated'
    if(kind==='missing-history')workbench.history=[]
    const h=originWorkbenchHarness(workbench,request,upload)
    await assert.rejects(h.reload(),/evidence_action_unavailable/)
    assert.equal(h.state.data,null);assert.equal(h.state.receipt,null)
  }
})

test('ORIGIN-WITHDRAW lost response recovers the same immutable receipt without another commit',async()=>{
  const {performEvidenceAction}=await import('../src/lib/passportApi.js')
  const {upload,request,workbench,outcome}=withdrawnOrigin(),calls=[]
  const recovered=await performEvidenceAction(request,{},async(url)=>{
    calls.push(url)
    if(url.endsWith('/commit'))throw new Error('committed response lost')
    return new Response(JSON.stringify(outcome),{status:200,headers:{'content-type':'application/json'}})
  })
  const h=originWorkbenchHarness(workbench,request,upload)
  await h.settle(recovered,1,'same')
  assert.deepEqual(calls,['/api/evidence-actions/commit','/api/evidence-actions/resolve'])
  assert.equal(h.state.pending,null);assert.equal(h.state.receipt.id,outcome.receipt.id)
})

test('ORIGIN-WITHDRAW mismatched receipt, current context, object and history fail closed',async()=>{
  const mutations=[
    x=>{x.outcome.receipt={...x.receipt,actorId:'other'}},
    x=>{x.outcome.receipt={...x.receipt,key:'other'}},
    x=>{x.outcome.receipt={...x.receipt,objectId:'other'}},
    x=>{x.workbench.authority.workspaceId='other'},
    x=>{x.workbench.authority.actorId='other'},
    x=>{x.workbench.authority.contextVersion++},
    x=>{x.workbench.actId='other'},
    x=>{x.workbench.version=1},
    x=>{x.workbench.objects[0].version=1},
    x=>{x.workbench.objects[0].state='candidate'},
    x=>{x.workbench.history=x.workbench.history.filter(r=>r.action!=='withdraw')},
    x=>{x.workbench.history.push(x.workbench.history[1])},
    x=>{x.workbench.history[1]={...x.workbench.history[1],receipt:{...x.receipt,committedAt:'other'}}},
    x=>{x.upload.id='unrelated-upload'},
  ]
  for(const mutate of mutations) {
    const x=withdrawnOrigin();x.upload={...x.upload};mutate(x)
    const h=originWorkbenchHarness(x.workbench,x.request,x.upload)
    await h.settle(x.outcome,1,'same')
    assert.equal(h.state.status,'uncertain');assert.equal(h.state.pending.key,x.request.key)
    assert.equal(h.state.data,null);assert.equal(h.state.receipt,null);assert.equal(h.state.effects,0)
  }
})

test('ORIGIN-WITHDRAW revoked or stale read continuation cannot expose terminal data or re-lock recovery',async()=>{
  const x=withdrawnOrigin(),h=originWorkbenchHarness(x.workbench,x.request,x.upload)
  h.sandbox.getEvidenceWorkbench=async()=>{throw new Error('revoked')}
  await h.settle(x.outcome,1,'same');assert.equal(h.state.status,'uncertain');assert.equal(h.state.data,null)
  let release
  h.sandbox.getEvidenceWorkbench=()=>new Promise(resolve=>{release=resolve})
  const old=h.settle(x.outcome,1,'same')
  h.sandbox.getEvidenceWorkbench=async()=>x.workbench
  await h.settle(x.outcome,1,'same')
  const recovered=structuredClone(h.state)
  release(x.workbench);await old
  assert.deepEqual(h.state,recovered)
  h.sandbox.currentScope.current='different-context'
  await h.settle(x.outcome,1,'same');assert.deepEqual(h.state,recovered)
})

test('ORIGIN-WITHDRAW unknown remains pending; server noncommit unlocks the unchanged candidate without action',async()=>{
  const x=withdrawnOrigin()
  x.workbench.objects[0]={id:x.request.objectId,version:1,state:'candidate'}
  x.workbench.version=1;x.workbench.history=x.workbench.history.slice(0,1)
  const h=originWorkbenchHarness(x.workbench,x.request,x.upload)
  await h.settle({status:'uncertain',request:x.request},1,'same')
  assert.equal(h.state.pending.key,x.request.key);assert.equal(h.state.status,'uncertain')
  await h.settle({status:'not_committed',request:x.request},1,'same')
  assert.equal(h.state.pending,null);assert.equal(h.state.status,'not_committed')
  assert.equal(h.state.data.objects[0].state,'candidate');assert.equal(h.state.receipt,null)
})

test('ORIGIN-WITHDRAW current newer object and unrelated projection/history are never replaced by receipt state',async()=>{
  const x=withdrawnOrigin()
  x.workbench.version=4;x.workbench.objects[0]={...x.workbench.objects[0],version:3,state:'confirmed'}
  x.workbench.objects.push({id:'other-private-object',version:1,state:'candidate',value:'unchanged'})
  const before=structuredClone(x.workbench),h=originWorkbenchHarness(x.workbench,x.request,x.upload)
  await h.settle(x.outcome,1,'same')
  assert.equal(h.state.pending,null);assert.deepEqual(h.state.data,before);assert.deepEqual(x.workbench,before)
  assert.equal(h.state.receipt.objectVersion,2);assert.equal(h.state.data.objects[0].version,3)
})

// Exact bounded Language v5.7 / ENTRY01–05 values, accepted by LS10 7/7.
const entryCopy = {
  en: { jobArtistDescription: 'Explore your activity as an artist and choose what to focus on.',
    jobAgencyDescription: 'Coordinate work with the artists you represent or manage.',
    jobBookerDescription: 'Review the information available about an artist before a booking decision.',
    jobSelectionHelp: 'Choose based on what you want to do now.', jobEyebrow: 'Getting started' },
  he: { jobArtistDescription: 'להכיר את הפעילות שלכם כאמנים ולבחור במה להתמקד.',
    jobAgencyDescription: 'לתאם את העבודה עם האמנים שאתם מייצגים או מנהלים.',
    jobBookerDescription: 'לבחון את המידע הזמין על אמן לפני החלטה על הזמנה.',
    jobSelectionHelp: 'בחרו לפי מה שתרצו לעשות עכשיו.', jobEyebrow: 'מתחילים כאן' },
}
test('RT001 Back/remount reads the governed candidate instead of offering an empty duplicate intake',async()=>{
  const source=fs.readFileSync(new URL('../src/features/artist/Onboarding.jsx',import.meta.url),'utf8')
  const begin=source.indexOf('  async function loadEntry()'),end=source.indexOf('\n  useEffect(',begin)
  const state={actorId:'person-a',status:'ready',workspaceId:'org-a',contextVersion:2,artistId:'artist-a',actId:'act-b',version:1,consentAccepted:true,artist:{stage_name:'Entry'}}
  const object={id:'same-candidate',state:'candidate',version:1,value:'https://example.test/original'}
  const receipt={id:'upload-receipt',action:'upload',actorId:'person-a',workspaceId:'org-a',artistId:'artist-a',actId:'act-b',contextVersion:2,objectId:object.id,objectVersion:1,committedAt:'2026-08-31T00:00:00Z'}
  let step,saved=[],requested=[]
  const sandbox={generation:{current:0},busyRef:{current:false},finished:{current:false},liveKey:{current:'context'},contextKey:'context',
    client:{read:async()=>state},entryOriginObjects,accepts:s=>s.actorId==='person-a',user:{id:'person-a'},drafts:{current:new Map()},
    getEvidenceWorkbench:async(a,b)=>{requested.push([a,b]);return {artistId:a,actId:b,authority:{actorId:'person-a',workspaceId:'org-a',contextVersion:2,owner:true},objects:[object],history:[{action:'upload',receipt}]}},
    setSaving(){},setLoading(){},setError(){},setCurrent(){},setLoadedKey(){},setPending(){},setF(){},setLink(){},setSourceConsent(){},setConsentChecked(){},
    setStep:v=>{step=v},setSavedCandidates:v=>{saved=v},T:{onboarding:{entryRetry:'retry'}}}
  vm.createContext(sandbox)
  await vm.runInContext(`(function(){${source.slice(begin,end)}\n;return loadEntry})()`,sandbox)()
  assert.equal(step,3,'a server-held candidate must remain reachable on Back without resubmission')
  assert.equal(saved[0]?.id,'same-candidate');assert.equal(saved[0]?.value,'https://example.test/original')
  assert.equal(saved[0]?.originReceipt?.id,'upload-receipt','Back must retain the matched immutable receipt, not only the source')
  assert.deepEqual(requested,[['artist-a','act-b']])
})
test('EVT029 same explicit Finish after remount does not create a second completion',async()=>{
  const source=fs.readFileSync(new URL('../src/features/artist/Onboarding.jsx',import.meta.url),'utf8')
  const begin=source.indexOf('  async function finish()'),end=source.indexOf('\n  async function recoverPending',begin)
  const state={actorId:'person-a',status:'ready',workspaceId:'org-a',contextVersion:2,version:1,artistId:'artist-a',actId:'act-b',consentAccepted:true,artist:{stage_name:'Entry'}}
  let emitted=0,navigated=0
  const seen=new Set()
  const completion={status:'recorded',eventId:'basics-history-a',actorId:'person-a',workspaceId:'org-a',artistId:'artist-a',recordedAt:'2026-08-31T01:00:00Z',current:state}
  for(let mount=0;mount<2;mount++) {
    const sandbox={busyRef:{current:false},pending:null,finished:{current:false},generation:{current:0},liveKey:{current:'scope'},contextKey:'scope',
      user:{id:'person-a'},client:{read:async()=>state,complete:async()=>completion},accepts:()=>true,
      setSaving(){},setError(){},logEvent(){emitted++},EVENTS:{ONBOARDING_COMPLETE:'onboarding_completed'},
      mirrorEntryCompletion:async(r)=>{if(!seen.has(r.eventId)){seen.add(r.eventId);emitted++}},entryAnalyticsAllowed:()=>true,
      readPendingReturn:()=>null,nav(){navigated++},T:{onboarding:{entryRetry:'retry'}}}
    vm.createContext(sandbox)
    await vm.runInContext(`(function(){${source.slice(begin,end)}\n;return finish})()`,sandbox)()
  }
  assert.equal(navigated,2,'lawful return remains usable')
  assert.equal(emitted,1,'a remount is not a new committed entry completion')
})
test('RT001 origin match preserves current confirmed state and rejects unrelated or future history',()=>{
  const r={id:'receipt-a',action:'upload',actorId:'person-a',workspaceId:'org-a',artistId:'artist-a',actId:'act-a',contextVersion:1,objectId:'object-a',objectVersion:1,committedAt:'2026-08-31T00:00:00Z'}
  const w={artistId:'artist-a',actId:'act-a',authority:{actorId:'person-a',workspaceId:'org-a',contextVersion:3},objects:[{id:'object-a',version:3,state:'confirmed'}],history:[{action:'upload',receipt:r}]}
  const result=entryOriginSelection(w,'person-a','object-a','receipt-a',1)
  assert.equal(result.state,'confirmed');assert.equal(result.version,3);assert.equal(result.originReceipt.objectVersion,1)
  for(const [key,value] of Object.entries({id:'unrelated',actorId:'person-b',workspaceId:'org-b',artistId:'artist-b',actId:'act-b',objectId:'object-b',objectVersion:4,contextVersion:4,committedAt:null})){
    const changed={...w,history:[{action:'upload',receipt:{...r,[key]:value}}]}
    assert.throws(()=>entryOriginSelection(changed,'person-a','object-a','receipt-a',1),key)
  }
  assert.throws(()=>entryOriginSelection({...w,history:[]},'person-a','object-a','receipt-a',1))
  assert.throws(()=>entryOriginSelection({...w,objects:[{...w.objects[0],state:'withdrawn'}]},'person-a','object-a','receipt-a',1))
})
test('EVT029 real local mirror survives remount/ring eviction, never re-inserts remotely, and respects refusal',async()=>{
  const source=fs.readFileSync(new URL('../src/lib/analytics.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replaceAll('export ','').replaceAll('import.meta.env?.DEV','false')
  const storage=new Map();let remote=0
  const sandbox={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},supabase:{from(){remote++;throw new Error('duplicate sink')}},DEMO:false,console}
  const r={status:'recorded',eventId:'canonical-a',actorId:'person-a',recordedAt:'2026-08-31T05:00:00Z'}
  for(let mount=0;mount<3;mount++){
    vm.createContext(sandbox)
    const mirror=vm.runInContext(`(function(){${source};return mirrorEntryCompletion})()`,sandbox)
    await mirror(r)
    assert.equal(JSON.parse(storage.get('gigproof_events')).filter(e=>e.name==='onboarding_completed').length,1)
  }
  storage.set('gigproof_events','[]')
  const mirror=vm.runInContext(`(function(){${source};return mirrorEntryCompletion})()`,sandbox)
  await mirror(r);assert.equal(JSON.parse(storage.get('gigproof_events')).length,0,'ack survives ring eviction')
  await mirror({...r,eventId:'canonical-b',actorId:'person-b'});assert.equal(JSON.parse(storage.get('gigproof_events')).length,1)
  storage.set('gigproof_consent',JSON.stringify({value:'denied',at:Date.now()}))
  await mirror({...r,eventId:'canonical-c'});assert.equal(JSON.parse(storage.get('gigproof_events')).length,1)
  await mirror({status:'uncertain'});assert.equal(remote,0)
})
test('EVT029 lost acknowledgement retries identical scope; unknown and retired responses never claim delivery',async()=>{
  const {createArtistEntryClient}=await import('../src/lib/artistEntry.js')
  const current={actorId:'person-a',status:'ready',workspaceId:'org-a',artistId:'artist-a',actId:'act-a',contextVersion:3,version:8}
  const calls=[]
  const ack={status:'recorded',eventId:'history-a',actorId:'person-a',recordedAt:'2026-08-31T05:00:00Z',current}
  const client=createArtistEntryClient({actorId:'person-a',rpc:async(name,args)=>{
    calls.push({name,args});if(calls.length===1)throw new Error('response lost');return {data:ack}
  }})
  assert.deepEqual(await client.complete(current),ack);assert.equal(calls.length,2);assert.deepEqual(calls[0],calls[1])
  assert.equal(calls[0].args.p_request.actorId,undefined);assert.equal(calls[0].args.p_request.eventId,undefined)
  const unknown=createArtistEntryClient({actorId:'person-a',rpc:async()=>{throw new Error('503')}})
  assert.equal((await unknown.complete(current)).status,'uncertain')
  let resolve
  const retired=createArtistEntryClient({actorId:'person-a',rpc:()=>new Promise(r=>{resolve=r})})
  const pending=retired.complete(current);retired.retire();resolve({data:ack});assert.equal((await pending).status,'retired')
  const wrong=createArtistEntryClient({actorId:'person-a',rpc:async()=>({data:{...ack,current:{...current,actorId:'other'}}})})
  assert.equal((await wrong.complete(current)).status,'uncertain')
})
test('EVT029 telemetry refusal/unavailability never blocks lawful Product Finish or fabricates an event',async()=>{
  const source=fs.readFileSync(new URL('../src/features/artist/Onboarding.jsx',import.meta.url),'utf8')
  const begin=source.indexOf('  async function finish()'),end=source.indexOf('\n  async function recoverPending',begin)
  for(const status of ['not_recorded','uncertain']){
    let navigation=0,delivered=0,requested
    const state={actorId:'person-a',status:'ready',workspaceId:'org-a',contextVersion:1,artist:{stage_name:'Artist'},consentAccepted:true}
    const sandbox={busyRef:{current:false},pending:null,finished:{current:false},generation:{current:0},liveKey:{current:'scope'},contextKey:'scope',
      client:{read:async()=>state,complete:async(s,allowed)=>{requested=allowed;return {status,...(status==='not_recorded'?{current:state}:{})}}},accepts:()=>true,
      setSaving(){},setError(){},mirrorEntryCompletion:r=>{if(r.status==='recorded')delivered++},entryAnalyticsAllowed:()=>false,
      readPendingReturn:()=>null,nav(){navigation++},T:{onboarding:{entryRetry:'retry'}}}
    vm.createContext(sandbox);await vm.runInContext(`(function(){${source.slice(begin,end)};return finish})()`,sandbox)()
    assert.equal(requested,false);assert.equal(navigation,1,status);assert.equal(delivered,0,status)
  }
})
test('RT001 restored results fail closed for context/authority drift, revoke and obsolete reads',async()=>{
  const source=fs.readFileSync(new URL('../src/features/artist/Onboarding.jsx',import.meta.url),'utf8')
  const begin=source.indexOf('  async function loadEntry()'),end=source.indexOf('\n  useEffect(',begin)
  for(const variant of ['artist','act','actor','workspace','version','owner','revoked','obsolete','withdrawn','no-link','pending']) {
    const state={actorId:'person-a',status:'ready',workspaceId:'org-a',contextVersion:2,artistId:'artist-a',actId:'act-b',version:1,consentAccepted:true,artist:{stage_name:'Entry'}}
    const readback={artistId:'artist-a',actId:'act-b',authority:{actorId:'person-a',workspaceId:'org-a',contextVersion:2,owner:true},objects:[{id:'candidate-a',version:1,state:'candidate',value:'https://example.test/source'}]}
    let step,loaded='old',saved=['old'],error='',reads=0,pending
    if(variant==='artist')readback.artistId='artist-wrong'
    if(variant==='act')readback.actId='act-wrong'
    if(variant==='actor')readback.authority.actorId='person-wrong'
    if(variant==='workspace')readback.authority.workspaceId='org-wrong'
    if(variant==='version')readback.authority.contextVersion=3
    if(variant==='owner')readback.authority.owner=false
    if(variant==='withdrawn')readback.objects[0].state='withdrawn'
    if(variant==='no-link')readback.objects=[]
    const unresolved={kind:'evidence',request:{key:'same-key'}}
    const sandbox={generation:{current:0},busyRef:{current:false},finished:{current:false},liveKey:{current:'context'},contextKey:'context',
      client:{read:async()=>state},entryOriginObjects,accepts:()=>true,user:{id:'person-a'},drafts:{current:new Map(variant==='pending'?[['context',{pending:unresolved,step:2,link:'https://example.test/draft'}]]:[])},
      getEvidenceWorkbench:async()=>{reads++;if(variant==='revoked')throw new Error('denied');if(variant==='obsolete')sandbox.generation.current++;return readback},
      setSaving(){},setLoading(){},setError:v=>{error=v},setCurrent(){},setLoadedKey:v=>{loaded=v},setPending:v=>{pending=v},setF(){},setLink(){},setSourceConsent(){},setConsentChecked(){},
      setStep:v=>{step=v},setSavedCandidates:v=>{saved=v},T:{onboarding:{entryRetry:'retry'}}}
    vm.createContext(sandbox)
    await vm.runInContext(`(function(){${source.slice(begin,end)}\n;return loadEntry})()`,sandbox)()
    assert.equal(saved.length,0,variant+' cannot expose obsolete/private or withdrawn data')
    if(['withdrawn','no-link','pending'].includes(variant))assert.equal(step,2,variant+' remains safe intake/recovery, never saved proof')
    else {assert.equal(loaded,null,variant);assert.equal(step,undefined,variant);if(variant!=='obsolete')assert.equal(error,'retry',variant)}
    if(variant==='pending'){assert.equal(reads,0);assert.equal(pending,unresolved)}
  }
})
test('ENT001 returning to the server-proven default Act preserves its original Artist fields',async()=>{
  const source=fs.readFileSync(new URL('../src/features/artist/RadarUniverse.jsx',import.meta.url),'utf8')
  const start=source.indexOf('async function pickAct('),end=source.indexOf('\n  // D6',start)
  assert.ok(start>=0&&end>start)
  const artist={id:'artist-a',stage_name:'Original',lineup_frequency_band:'monthly',invoice_ready:true,rider_url:'https://example.test/rider'}
  let applied
  const requested=[]
  const sandbox={defaultActId:'act-a',activeActId:'act-b',actOverride:{},actBusy:false,actRead:{current:0},readScope:'scope',scopeRef:{current:'scope'},artist,authorityScope:{actorId:'person-a'},acts:[],
    getArtistRadarContext:async(id,scope,actId)=>{requested.push([id,scope.actorId,actId]);return {act:{id:actId,stage_name:actId==='act-a'?'Original':'Second'},items:[],claims:[],objects:[]}},
    setActBusy(){},setActSheet(){},setActOverride(value){applied=value},setActiveActId(){},onPublicationActSelected(){},localStorage:{setItem(){}},logEvent(){},EVENTS:{ACT_SWITCHED:'act_switched'},setSelected(){},flash(){},S:{actSwitch:{switchedToast:value=>value}},setScopeError(){}}
  vm.createContext(sandbox)
  const pick=vm.runInContext(`(function(){${source.slice(start,end)}\n;return pickAct})()`,sandbox)
  await pick('act-a')
  assert.deepEqual(applied.artist,artist)
  assert.equal(applied.act.id,'act-a')
  sandbox.activeActId='act-a'
  await pick('act-b')
  assert.equal(applied.act.id,'act-b');assert.equal(applied.artist.invoice_ready,null);assert.equal(applied.artist.rider_url,null)
  assert.deepEqual(requested,[['artist-a','person-a','act-a'],['artist-a','person-a','act-b']])
})

test('ENT004 exact five approved roleSelect mappings retain labels and remove old promises',async()=>{
  const source=fs.readFileSync(new URL('../src/features/auth/UserTypeSelect.jsx',import.meta.url),'utf8')
  for(const lang of ['en','he']) {
    const {T}=await import(`../src/lib/i18n/${lang}.js`)
    for(const [key,value] of Object.entries(entryCopy[lang])) {
      assert.equal(T.roleSelect[key],value,`${lang}.${key}`)
      assert.ok(source.includes(`T.roleSelect.${key}`),`actual caller must consume ${key}`)
    }
  }
  for(const old of ['Build a Passport of provable evidence','Keep your whole roster’s proof','Evaluate an unfamiliar artist on method-labeled evidence','You can change this later in Settings.','One quick question'])assert.ok(!source.includes(old),`retired copy: ${old}`)
})

// Repeatable non-DEMO inspection fixture. Snapshot code before serving so an
// Experience inspector never reads the Owner's concurrently changing source.
// Auth/REST below are synthetic transports; real PostgreSQL/Express proof is
// in run-artist-entry.mjs. Nothing here is a provider or security verdict.
async function startEntryFixture() {
  const { createServer } = await import('vite')
  const { default: react } = await import('@vitejs/plugin-react')
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const requestedPort=Number(process.env.ENTRY_FIXTURE_PORT || 55463)
  assert.ok(Number.isInteger(requestedPort)&&requestedPort>=1024&&requestedPort<=65535)
  const snapshot = fs.mkdtempSync(path.join(os.tmpdir(), 'r15-entry-inspection-'))
  for (const name of ['src','public','package.json','package-lock.json','index.html','tailwind.config.js','postcss.config.js']) {
    if (fs.existsSync(path.join(root,name))) fs.cpSync(path.join(root,name),path.join(snapshot,name),{recursive:true})
  }
  fs.symlinkSync(path.join(root,'node_modules'),path.join(snapshot,'node_modules'),'junction')
  const { default: tailwind } = await import('tailwindcss')
  const { default: autoprefixer } = await import('autoprefixer')
  const { default: tailwindConfig } = await import(pathToFileURL(path.join(snapshot,'tailwind.config.js')).href)
  // Resolve style scanning against the frozen snapshot, not the writer's cwd.
  const frozenTailwind = { ...tailwindConfig, content: tailwindConfig.content.map(pattern => path.resolve(snapshot,pattern).replaceAll('\\','/')) }
  const hashes=[]
  function hashTree(dir) { for(const item of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,item.name)
    if(item.isDirectory())hashTree(file)
    else hashes.push([path.relative(snapshot,file).replaceAll('\\','/'),createHash('sha256').update(fs.readFileSync(file)).digest('hex')])
  } }
  hashTree(path.join(snapshot,'src'));hashes.sort((a,b)=>a[0].localeCompare(b[0]))
  const fingerprint=createHash('sha256').update(JSON.stringify(hashes)).digest('hex')
  const actor='81000000-0000-4000-8000-000000000099',workspace='83000000-0000-4000-8000-000000000099'
  const artist='84000000-0000-4000-8000-000000000099',act='85000000-0000-4000-8000-000000000099'
  let initialized=false,basics=false,consentAccepted=false,version=0,scenario='success',objects=[],evidenceVersion=0,evidenceHistory=[]
  const notice={version:'SYNTHETIC-ENTRY-NOTICE-1',purpose:'Synthetic service-profile test purpose',
    noticeUrl:'https://example.test/synthetic-notice',termsUrl:'https://example.test/synthetic-terms',effectiveAt:'2026-08-01T00:00:00Z'}
  const receipts=new Map(),fences=new Set(),completionEvents=new Map()
  const user={id:actor,email:'entry-fixture@example.test',aud:'authenticated',role:'authenticated',
    email_confirmed_at:'2026-08-31T00:00:00Z',identities:[{id:actor,provider:'email'}],app_metadata:{provider:'email'},user_metadata:{}}
  const token=[{alg:'HS256',typ:'JWT'},{sub:actor,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600},'fixture-signature']
    .map((value,index)=>index<2?Buffer.from(JSON.stringify(value)).toString('base64url'):Buffer.from(value).toString('base64url')).join('.')
  const session=()=>({access_token:token,refresh_token:'local-fixture-refresh',token_type:'bearer',expires_in:3600,user})
  let artistFields={stage_name:'',city:''}
  const state=()=>({actorId:actor,status:initialized?'ready':'uninitialized',workspaceId:initialized?workspace:null,
    contextVersion:0,version,artistId:basics?artist:null,actId:basics?act:null,artist:basics?{id:artist,...artistFields}:null,
    serviceNotice:scenario==='notice-missing'?null:notice,consentAccepted})
  const workbench=()=>({artistId:artist,actId:act,stageName:artistFields.stage_name,acts:[{id:act,stageName:artistFields.stage_name}],version:evidenceVersion,authority:{actorId:actor,workspaceId:workspace,contextVersion:0,owner:true,role:'artist'},objects,
    history:evidenceHistory,legacyClaims:[],legacyItems:[]})
  const reply=(res,status,body)=>{res.statusCode=status;res.setHeader('content-type','application/json');res.end(JSON.stringify(body))}
  let port
  const vite=await createServer({root:snapshot,configFile:false,envFile:false,css:{postcss:{plugins:[tailwind(frozenTailwind),autoprefixer()]}},plugins:[{
    name:'entry-local-provider-transport',
    configureServer(server){server.middlewares.use(async(req,res,next)=>{
      const uri=new URL(req.url,'http://127.0.0.1')
      if(!uri.pathname.startsWith('/__entry-')&&!uri.pathname.startsWith('/api/'))return next()
      let raw='';for await(const chunk of req)raw+=chunk
      let body={};try{body=raw?JSON.parse(raw):{}}catch{return reply(res,400,{error:'invalid fixture input'})}
      if(uri.pathname==='/__entry-fixture/reset'&&req.method==='POST') {
        initialized=false;basics=false;consentAccepted=false;version=0;objects=[];evidenceVersion=0;evidenceHistory=[];receipts.clear();fences.clear();completionEvents.clear();artistFields={stage_name:'',city:''}
        scenario=body.scenario||'success';return reply(res,200,{scenario,synthetic:true})
      }
      if(uri.pathname==='/__entry-fixture/scenario'&&req.method==='POST'){scenario=body.scenario;return reply(res,200,{scenario})}
      if(uri.pathname==='/__entry-fixture/state')return reply(res,200,{scenario,current:state(),objects,history:workbench().history,completionEvents:[...completionEvents.values()],fingerprint,synthetic:true})
      if(uri.pathname.endsWith('/auth/v1/signup'))return reply(res,200,scenario==='confirmation-pending'?{user,session:null}:session())
      if(uri.pathname.endsWith('/auth/v1/token'))return reply(res,scenario==='confirmation-pending'?400:200,
        scenario==='confirmation-pending'?{code:'email_not_confirmed',message:'Email not confirmed'}:session())
      if(uri.pathname.endsWith('/auth/v1/user'))return reply(res,200,user)
      if(uri.pathname.endsWith('/auth/v1/recover'))return reply(res,200,{})
      if(uri.pathname.endsWith('/auth/v1/logout'))return reply(res,200,{})
      if(uri.pathname.includes('/auth/v1/'))return reply(res,400,{message:'Recovery policy is HOLD in this fixture'})
      if(uri.pathname.startsWith('/api/events'))return reply(res,200,{ok:true})
      if(req.headers.authorization!==`Bearer ${token}`)return reply(res,401,{message:'fixture authentication required'})
      const rpc=uri.pathname.split('/').at(-1)
      if(rpc==='complete_artist_entry') {
        const r=body.p_request,s=state()
        if(scenario==='revoked'||!basics||!consentAccepted||['workspaceId','artistId','actId','contextVersion'].some(k=>r[k]!==s[k]))return reply(res,403,{code:'42501'})
        if(scenario==='completion-unavailable')return reply(res,503,{message:'unavailable'})
        const first=[...receipts.values()].find(r=>r.action==='basics')
        if(!r.telemetry||!first)return reply(res,200,{status:'not_recorded',actorId:actor,current:s})
        if(!completionEvents.has(first.id))completionEvents.set(first.id,{id:first.id,event_name:'onboarding_completed',actor_user_id:actor,created_at:new Date().toISOString()})
        const event=completionEvents.get(first.id)
        if(scenario==='completion-response-lost'){scenario='success';res.destroy();return}
        return reply(res,200,{status:'recorded',eventId:event.id,actorId:actor,recordedAt:event.created_at,current:s})
      }
      if(rpc==='profiles')return reply(res,200,initialized?{id:actor,role:'artist',full_name:null}:null)
      if(rpc==='active_role_context')return reply(res,200,initialized?{active_organization_id:workspace,context_version:0}:null)
      if(rpc==='select_context_switch_targets')return reply(res,200,initialized?[{membership_id:actor,organization_id:workspace,
        organization_name:'Artist',workspace_type:'artist',org_role:'owner',functional_role:'artist',plan:'solo',active_organization_id:workspace,context_version:0}]:[])
      if(rpc==='read_artist_entry')return reply(res,scenario==='revoked'?403:200,scenario==='revoked'?{code:'42501',message:'artist_entry_unavailable'}:state())
      if(rpc==='get_my_artist_for_active_workspace')return reply(res,scenario==='revoked'?403:200,scenario==='revoked'?{code:'42501'}:basics?[{id:artist,...artistFields,created_by:actor,owner_organization_id:workspace,published:false}]:[])
      if(rpc==='read_artist_radar_context') {
        if(scenario==='revoked'||!basics||body.p_artist!==artist||(body.p_act&&body.p_act!==act))return reply(res,403,{code:'42501',message:'evidence_action_unavailable'})
        const row={id:act,person_id:actor,organization_id:workspace,stage_name:artistFields.stage_name,is_default:true}
        return reply(res,200,{...workbench(),act:row,acts:[row],items:[],claims:[]})
      }
      if(rpc==='act') {
        const row={id:act,person_id:actor,organization_id:workspace,stage_name:artistFields.stage_name,is_default:true}
        const id=uri.searchParams.get('id')
        return reply(res,200,!basics||id===`eq.${artist}`?null:id?.startsWith('in.')?[row]:row)
      }
      if(['commit_artist_entry','resolve_artist_entry'].includes(rpc)) {
        const request=body.p_request,key=request.key
        if(scenario==='bootstrap-denied'||scenario==='revoked')return reply(res,403,{code:'42501',message:'artist_entry_unavailable'})
        if(scenario==='uncertain')return reply(res,503,{message:'fixture unavailable'})
        if(rpc==='resolve_artist_entry') {
          if(receipts.has(key))return reply(res,200,{status:'committed',receipt:receipts.get(key),current:state()})
          fences.add(key);return reply(res,200,{status:'not_committed',actorId:actor,key,current:state()})
        }
        if(fences.has(key))return reply(res,403,{code:'42501',message:'artist_entry_unavailable'})
        if(scenario==='never-commit'){res.destroy();return}
        if(!receipts.has(key)) {
          const before=state()
          if(request.action==='initialize')initialized=true
          else if(request.action==='consent'){consentAccepted=request.payload.decision==='accepted';version++}
          else {basics=true;consentAccepted=true;version++;artistFields={stage_name:request.payload.stage_name,city:request.payload.city}}
          receipts.set(key,{id:randomUUID(),actorId:actor,key,action:request.action,workspaceId:workspace,contextVersion:0,
            version,artistId:basics?artist:null,actId:basics?act:null,before,after:state(),committedAt:new Date().toISOString()})
        }
        if(scenario==='commit-response-lost'){res.destroy();return}
        return reply(res,200,{status:'committed',receipt:receipts.get(key),current:state()})
      }
      if(uri.pathname.startsWith('/api/evidence-actions/workbench/')) {
        const parts=uri.pathname.split('/'),requestedArtist=parts.at(-2),requestedAct=parts.at(-1)
        if(scenario==='revoked'||requestedArtist!==artist||![act,'current'].includes(requestedAct))return reply(res,403,{error:'forbidden'})
        return reply(res,200,workbench())
      }
      if(uri.pathname==='/api/evidence-actions/commit'||uri.pathname==='/api/evidence-actions/resolve') {
        if(scenario==='link-denied'||scenario==='revoked'||!basics||body.artistId!==artist||body.actId!==act
          ||body.workspaceId!==workspace||body.contextVersion!==0)return reply(res,403,{error:'evidence_action_unavailable'})
        if(scenario==='withdraw-uncertain'&&uri.pathname.endsWith('/resolve'))return reply(res,503,{error:'unavailable'})
        if(!receipts.has(body.key)) {
          if(uri.pathname.endsWith('/resolve'))return reply(res,200,{status:'not_committed'})
          const old=objects.find(o=>o.id===body.objectId),before=old?structuredClone(old):{}
          if(body.expectedVersion!==evidenceVersion||body.expectedObjectVersion!==(old?.version||0)
            ||!['upload','withdraw'].includes(body.action)||(body.action==='withdraw'&&(!old||old.state==='withdrawn')))
            return reply(res,403,{error:'evidence_action_unavailable'})
          const after=body.action==='upload'?{id:body.objectId,version:1,state:'candidate',title:body.payload.title,value:body.payload.value}
            :{...old,version:old.version+1,state:'withdrawn'}
          objects=old?objects.map(o=>o.id===old.id?after:o):[...objects,after]
          evidenceVersion++
          const receipt={...body,id:randomUUID(),actorId:actor,version:evidenceVersion,objectVersion:after.version,committedAt:new Date().toISOString()}
          receipts.set(body.key,receipt)
          evidenceHistory.push({action:body.action,receipt,before,after:structuredClone(after),reason:body.payload.reason||null,provenance:body.payload.provenance||null})
        }
        if(['link-response-lost','withdraw-response-lost','withdraw-uncertain'].includes(scenario)&&uri.pathname.endsWith('/commit')){res.destroy();return}
        return reply(res,200,{status:'committed',receipt:receipts.get(body.key)})
      }
      return reply(res,200,[])
    })},
  },react()],define:{'import.meta.env.VITE_DEMO':JSON.stringify('0'),'import.meta.env.VITE_OAUTH_ENABLED':JSON.stringify('0'),
    'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(`http://127.0.0.1:${requestedPort}/__entry-provider`),
    'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify('entry-fixture-only-no-provider')},
    server:{host:'127.0.0.1',port:requestedPort,strictPort:true,fs:{allow:[snapshot,path.join(root,'node_modules')]}}})
  await vite.listen();port=vite.httpServer.address().port
  const receipt={snapshot,fingerprint,files:hashes.length,url:`http://127.0.0.1:${port}/signup`,syntheticProvider:true,demo:false,
    reset:'POST /__entry-fixture/reset with JSON {scenario:success|confirmation-pending|bootstrap-denied|commit-response-lost|never-commit|uncertain|link-denied|link-response-lost|revoked}; use a fresh browser context for a new account',
    shutdown:'Ctrl+C in this harness process; snapshot is retained for inspection',recoveryCases:'25-28 HOLD; baseline components only'}
  fs.writeFileSync(path.join(snapshot,'inspection-receipt.json'),JSON.stringify(receipt,null,2))
  console.log('ENTRY_FIXTURE_READY '+JSON.stringify(receipt))
  const stop=async()=>{await vite.close();console.log('ENTRY_FIXTURE_STOPPED '+snapshot);process.exit(0)}
  process.once('SIGINT',stop);process.once('SIGTERM',stop)
  return vite
}

if(process.argv.includes('--serve'))await startEntryFixture()
if(process.argv.includes('--self-contained-browser')) {
  const fixture=await startEntryFixture()
  process.env.ENTRY_FIXTURE_URL=`http://127.0.0.1:${fixture.httpServer.address().port}`
  after(async()=>{await fixture.close();console.log('ENTRY_TEMPORARY_FIXTURE_STOPPED')})
}

if(process.argv.includes('--browser'))test('30 non-DEMO actual entry journey HE/EN at 390/768/1440', async () => {
  const {chromium}=await import('playwright')
  const dictionaries={en:(await import('../src/lib/i18n/en.js')).T,he:(await import('../src/lib/i18n/he.js')).T}
  const origin=process.env.ENTRY_FIXTURE_URL || 'http://127.0.0.1:55463'
  assert.equal(new URL(origin).hostname,'127.0.0.1','loopback fixture only')
  const browser=await chromium.launch()
  let cells=0
  try {
    for(const lang of ['he','en'])for(const width of [390,768,1440]) {
      await fetch(origin+'/__entry-fixture/reset',{method:'POST',body:JSON.stringify({scenario:'success'})})
      const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage()
      page.setDefaultTimeout(10000)
      // A new frozen Vite root compiles on first navigation; action assertions
      // retain their 10s limit and are not made dependent on cold compilation.
      page.setDefaultNavigationTimeout(30000)
      const errors=[];page.on('pageerror',error=>errors.push(error.message))
      page.on('console',message=>{if(message.type()==='error')console.error('ENTRY_BROWSER_CONSOLE '+message.text())})
      await page.addInitScript(lang=>{if(!localStorage.getItem('gigproof_lang'))localStorage.setItem('gigproof_lang',lang)},lang)
      const t=dictionaries[lang]
      try {
        await page.goto(origin+'/signup')
        await page.getByLabel(t.signup.firstName,{exact:true}).fill('Entry')
        await page.getByLabel(t.signup.lastName,{exact:true}).fill('Fixture')
        await page.getByLabel(t.signup.email,{exact:true}).fill('entry-fixture@example.test')
        await page.getByLabel(t.signup.password,{exact:false}).fill('synthetic-password-123')
        await page.getByRole('button',{name:t.signup.cta,exact:true}).click()
        await page.waitForURL('**/select')
        for(const role of ['Artist','Agency','Booker'])await page.getByRole('button',{name:`${t.roleSelect['job'+role]} ${entryCopy[lang]['job'+role+'Description']}`,exact:true}).waitFor()
        await page.getByText(entryCopy[lang].jobEyebrow,{exact:true}).waitFor()
        await page.getByText(entryCopy[lang].jobSelectionHelp,{exact:true}).waitFor()
        const otherLang=lang==='he'?'en':'he',other=dictionaries[otherLang]
        await page.getByRole('button',{name:t.common.switchLanguage,exact:true}).click()
        await page.getByText(entryCopy[otherLang].jobEyebrow,{exact:true}).waitFor()
        await page.reload()
        assert.equal(await page.evaluate(()=>localStorage.getItem('gigproof_lang')),otherLang)
        await page.getByText(entryCopy[otherLang].jobSelectionHelp,{exact:true}).waitFor()
        await page.getByRole('button',{name:other.common.switchLanguage,exact:true}).click()
        await page.getByText(entryCopy[lang].jobEyebrow,{exact:true}).waitFor()
        await page.getByRole('button').filter({hasText:t.roleSelect.jobArtist}).click()
        await page.waitForURL('**/onboarding')
        await page.getByLabel(t.onboarding.stageName,{exact:true}).fill(lang==='he'?'אמן בדיקה':'Entry Artist')
        await page.locator('form input[type=checkbox]').check()
        await page.getByRole('button',{name:t.common.continue,exact:true}).click()
        await page.getByRole('heading',{name:t.onboarding.entryLinkTitle,exact:true}).waitFor()
        await page.locator('input[inputmode=url]').fill('https://example.test/artist')
        await page.getByLabel(t.onboarding.entrySourceConsent,{exact:true}).check()
        const submit=page.getByRole('button',{name:t.onboarding.entryStartScan,exact:true})
        await submit.focus();await page.keyboard.press('Enter')
        await page.locator('[data-entry-restored=true]').waitFor()
        assert.equal(await page.evaluate(()=>document.documentElement.dir),lang==='he'?'rtl':'ltr')
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal document overflow')
        const proof=await(await fetch(origin+'/__entry-fixture/state')).json()
        assert.equal(proof.objects.length,1);assert.equal(proof.objects[0].state,'candidate')
        assert.notEqual(proof.current.artistId,proof.current.actId,'distinct Act witness')
        await page.getByRole('button',{name:t.onboarding.revealCta,exact:true}).click()
        await page.waitForURL('**/artist/home')
        const eventCount=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('gigproof_events')||'[]').filter(e=>e.name==='onboarding_completed').length)
        assert.equal(await eventCount(),1)
        const pendingSource=page.locator('[data-entry-pending=true]')
        await pendingSource.getByText('https://example.test/artist',{exact:true}).waitFor()
        const question=page.locator('#artist-first-value-question')
        const hierarchy=await question.evaluate(node=>({width:node.getBoundingClientRect().width,
          lines:node.getBoundingClientRect().height/parseFloat(getComputedStyle(node).lineHeight),
          cardWidth:node.closest('section').getBoundingClientRect().width}))
        if(process.env.ENTRY_SCREENSHOT_DIR) {
          fs.mkdirSync(process.env.ENTRY_SCREENSHOT_DIR,{recursive:true})
          const card=page.locator('section[aria-labelledby="artist-first-value-question"]')
          await card.scrollIntoViewIfNeeded()
          await page.screenshot({path:path.join(process.env.ENTRY_SCREENSHOT_DIR,`entry-${lang}-${width}.png`),fullPage:true})
          await card.screenshot({path:path.join(process.env.ENTRY_SCREENSHOT_DIR,`card-${lang}-${width}.png`)})
        }
        assert.ok(hierarchy.width>=Math.min(240,hierarchy.cardWidth-40),`RT002 question column squeezed: ${JSON.stringify({lang,width,...hierarchy})}`)
        assert.ok(hierarchy.lines<=4.1,`RT002 pathological word-per-line question: ${JSON.stringify({lang,width,...hierarchy})}`)
        assert.equal(await page.getByText(t.dashboard.empty,{exact:true}).count(),0)
        await pendingSource.getByRole('button',{name:t.evidenceActions.title,exact:true}).click()
        await page.waitForURL(`**/evidence/${proof.current.artistId}?act=${proof.current.actId}`)
        await page.getByRole('button').filter({hasText:'https://example.test/artist'}).waitFor()
        await page.goBack();await pendingSource.getByText('https://example.test/artist',{exact:true}).waitFor()
        await page.reload();await pendingSource.getByText('https://example.test/artist',{exact:true}).waitFor()
        await page.goBack();await page.waitForURL('**/onboarding')
        const restored=page.locator('[data-entry-restored=true]')
        const sameObject=restored.locator(`[data-evidence-object="${proof.objects[0].id}"]`)
        await sameObject.getByText('https://example.test/artist',{exact:true}).waitFor()
        await sameObject.getByText(t.evidenceActions.states.candidate,{exact:true}).waitFor()
        const upload=proof.history.find(row=>row.receipt.objectId===proof.objects[0].id).receipt
        await sameObject.locator(`[data-entry-receipt="${upload.id}"]`).waitFor()
        await restored.getByText(t.evidenceActions.boundary,{exact:true}).waitFor()
        if(process.env.ENTRY_SCREENSHOT_DIR) {
          await restored.scrollIntoViewIfNeeded()
          await page.screenshot({path:path.join(process.env.ENTRY_SCREENSHOT_DIR,`back-${lang}-${width}.png`),fullPage:true})
        }
        assert.equal(await page.getByRole('button',{name:t.onboarding.entryStartScan,exact:true}).count(),0,'Back cannot silently offer duplicate submission')
        await page.reload();await sameObject.waitFor()
        await page.goForward();await pendingSource.getByText('https://example.test/artist',{exact:true}).waitFor()
        await page.goBack();await sameObject.waitFor()
        await page.getByRole('button',{name:t.onboarding.revealCta,exact:true}).click();await page.waitForURL('**/artist/home')
        assert.equal(await eventCount(),1,'same entry Back/Finish is not another completion')
        await page.goBack();await sameObject.waitFor();await page.reload();await sameObject.waitFor()
        await page.getByRole('button',{name:t.onboarding.revealCta,exact:true}).click();await page.waitForURL('**/artist/home')
        assert.equal(await eventCount(),1,'same entry reload/Finish is not another completion')
        assert.equal((await(await fetch(origin+'/__entry-fixture/state')).json()).completionEvents.length,1)
        await page.goBack();await sameObject.waitFor()
        await restored.getByRole('button',{name:t.evidenceActions.title,exact:true}).focus();await page.keyboard.press('Enter')
        await page.waitForURL(url=>url.pathname===`/evidence/${proof.current.artistId}`&&url.searchParams.get('object')===proof.objects[0].id)
        await page.getByText(`${t.evidenceActions.receipt}: ${upload.id}`,{exact:true}).first().waitFor()
        assert.deepEqual((await(await fetch(origin+'/__entry-fixture/state')).json()).objects,proof.objects,'Back/reload/forward/review creates no duplicate and changes no candidate')
        const originUrl=page.url()
        const withdrawalScenario=width===390?'success':width===768?'withdraw-response-lost':'withdraw-uncertain'
        await fetch(origin+'/__entry-fixture/scenario',{method:'POST',body:JSON.stringify({scenario:withdrawalScenario})})
        await page.getByRole('button',{name:t.evidenceActions.withdraw,exact:true}).focus();await page.keyboard.press('Enter')
        if(withdrawalScenario==='withdraw-uncertain') {
          await page.getByText(t.evidenceActions.status.uncertain,{exact:true}).waitFor()
          assert.equal(await page.getByRole('link',{name:t.evidenceActions.back,exact:true}).count(),0)
          await fetch(origin+'/__entry-fixture/scenario',{method:'POST',body:JSON.stringify({scenario:'success'})})
          await page.getByRole('button',{name:t.evidenceActions.recover,exact:true}).click()
        }
        await page.getByText(t.evidenceActions.status.committed,{exact:true}).waitFor()
        const terminal=await(await fetch(origin+'/__entry-fixture/state')).json()
        const withdrawal=terminal.history.find(row=>row.action==='withdraw').receipt
        assert.equal(terminal.objects.length,1);assert.equal(terminal.objects[0].state,'withdrawn')
        assert.equal(terminal.objects[0].id,proof.objects[0].id);assert.equal(terminal.objects[0].version,2)
        assert.deepEqual(terminal.history[0],proof.history[0],'upload history is immutable after withdrawal')
        await page.getByText(`${t.evidenceActions.receipt}: ${withdrawal.id}`,{exact:true}).first().waitFor()
        assert.equal(await page.getByRole('button',{name:t.evidenceActions.withdraw,exact:true}).isDisabled(),true)
        await page.getByRole('link',{name:t.evidenceActions.back,exact:true}).click();await page.waitForURL('**/artist/home')
        assert.equal(await page.locator('[data-entry-pending=true]').count(),0)
        await page.goto(originUrl);await page.getByText(t.evidenceActions.status.denied,{exact:true}).waitFor()
        assert.equal(await page.getByRole('button').filter({hasText:'https://example.test/artist'}).count(),0,'initial withdrawn-origin URL still fails closed')
        assert.deepEqual((await(await fetch(origin+'/__entry-fixture/state')).json()).history,terminal.history,'return and invalid URL do not create another action')
        console.log(`ORIGIN_WITHDRAW_BROWSER ${lang} ${width}: ${withdrawalScenario}, matched terminal receipt/safe return/initial denial`)
        assert.deepEqual(errors,[])
        cells++;console.log(`ENTRY_BROWSER_CELL ${lang} ${width}: signup/selection/basics/consent/candidate/keyboard/direction/fit`)
      } catch(error) { console.error(JSON.stringify({lang,width,url:page.url(),body:(await page.locator('body').innerText()).slice(0,1800),errors}));throw error }
      finally {await context.close()}
    }
  }finally{await browser.close()}
  assert.equal(cells,6);console.log('ENTRY_BROWSER=6/6; synthetic Auth/REST, actual non-DEMO components; not PostgreSQL/AT/zoom proof')
})

if(process.argv.includes('--browser-negative'))test('30 actual entry denial, draft, consent, noncommit and response-loss recovery',async()=>{
  const {chromium}=await import('playwright'),browser=await chromium.launch()
  const origin=process.env.ENTRY_FIXTURE_URL || 'http://127.0.0.1:55463'
  assert.equal(new URL(origin).hostname,'127.0.0.1')
  const dictionaries={en:(await import('../src/lib/i18n/en.js')).T,he:(await import('../src/lib/i18n/he.js')).T}
  const scenarios=['confirmation-pending','bootstrap-denied','notice-missing','deferred','no-link','uncertain','commit-response-lost','link-denied','link-response-lost']
  let cells=0
  try{for(const lang of ['he','en'])for(const scenario of scenarios){
    await fetch(origin+'/__entry-fixture/reset',{method:'POST',body:JSON.stringify({scenario:['confirmation-pending','bootstrap-denied','notice-missing'].includes(scenario)?scenario:'success'})})
    const context=await browser.newContext({viewport:{width:390,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),t=dictionaries[lang]
    page.setDefaultTimeout(10000)
    const mode=scenario=>fetch(origin+'/__entry-fixture/scenario',{method:'POST',body:JSON.stringify({scenario})})
    try{
      await page.addInitScript(lang=>localStorage.setItem('gigproof_lang',lang),lang)
      await page.goto(origin+'/signup')
      await page.getByLabel(t.signup.firstName,{exact:true}).fill('Entry');await page.getByLabel(t.signup.lastName,{exact:true}).fill('Fixture')
      await page.getByLabel(t.signup.email,{exact:true}).fill('entry-fixture@example.test');await page.getByLabel(t.signup.password,{exact:true}).fill('synthetic-password-123')
      await page.getByRole('button',{name:t.signup.cta,exact:true}).click()
      if(scenario==='confirmation-pending'){
        await page.getByRole('heading',{name:t.signup.confirmTitle}).waitFor();assert.ok(page.url().endsWith('/signup'))
      }else{
        await page.waitForURL('**/select');await page.getByRole('button').filter({hasText:t.roleSelect.jobArtist}).click()
        if(scenario==='bootstrap-denied'){
          await page.getByText(t.onboarding.entryRetry,{exact:true}).waitFor();assert.ok(page.url().endsWith('/select'))
        }else{
          await page.waitForURL('**/onboarding');const name=page.getByLabel(t.onboarding.stageName,{exact:true});await name.fill('Draft preserved')
          if(scenario==='notice-missing'){
            await page.getByText(t.onboarding.entryNoticeUnavailable,{exact:true}).waitFor()
            assert.equal(await page.getByRole('button',{name:t.common.continue,exact:true}).isDisabled(),true)
          }else if(scenario==='deferred'){
            await page.getByRole('button',{name:t.consent.decline,exact:true}).click()
            await page.getByText(t.onboarding.entryDecisionSaved,{exact:true}).waitFor();assert.equal(await name.inputValue(),'Draft preserved')
            const proof=await(await fetch(origin+'/__entry-fixture/state')).json();assert.equal(proof.current.artistId,null);assert.equal(proof.current.consentAccepted,false)
          }else{
            await page.locator('form input[type=checkbox]').check()
            if(['uncertain','commit-response-lost'].includes(scenario))await mode(scenario)
            await page.getByRole('button',{name:t.common.continue,exact:true}).click()
            if(scenario==='uncertain'){
              const recover=page.getByRole('button',{name:t.onboarding.entryRecover,exact:true});await recover.waitFor()
              assert.equal(await name.inputValue(),'Draft preserved');assert.equal(await name.isDisabled(),true)
              await mode('success');await recover.focus();await page.keyboard.press('Enter')
              await page.getByText(t.onboarding.entryRetry,{exact:true}).waitFor();assert.equal(await name.isDisabled(),false)
              assert.equal(await name.inputValue(),'Draft preserved')
              assert.equal((await(await fetch(origin+'/__entry-fixture/state')).json()).current.artistId,null)
              await page.getByRole('button',{name:t.common.continue,exact:true}).click()
            }
            await page.getByRole('heading',{name:t.onboarding.entryLinkTitle,exact:true}).waitFor()
            assert.equal(await page.getByRole('heading',{name:t.onboarding.entryLinkTitle,exact:true}).evaluate(node=>document.activeElement===node),true,'new step receives keyboard focus')
            await mode('success')
            if(scenario==='no-link'){
              await page.getByRole('button',{name:t.onboarding.entryWithoutLink,exact:true}).click();await page.waitForURL('**/artist/home')
              assert.equal((await(await fetch(origin+'/__entry-fixture/state')).json()).objects.length,0)
            }else{
              const link=page.locator('input[inputmode=url]');await link.fill('https://example.test/private-draft');await page.getByLabel(t.onboarding.entrySourceConsent,{exact:true}).check()
              if(scenario.startsWith('link-'))await mode(scenario)
              await page.getByRole('button',{name:t.onboarding.entryStartScan,exact:true}).click()
              if(scenario==='link-denied'){
                await page.getByText(t.onboarding.entryRetry,{exact:true}).waitFor();assert.equal(await link.inputValue(),'https://example.test/private-draft')
                assert.equal((await(await fetch(origin+'/__entry-fixture/state')).json()).objects.length,0)
                await mode('success');await page.getByRole('button',{name:t.onboarding.entryStartScan,exact:true}).click()
              }
              await page.locator('[data-entry-restored=true]').waitFor()
              assert.equal((await(await fetch(origin+'/__entry-fixture/state')).json()).objects.length,1)
            }
          }
          // Root-font reflow is not a browser-zoom or assistive-technology claim.
          await page.evaluate(()=>{document.documentElement.style.fontSize='200%'})
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'200% root-font reflow')
        }
      }
      cells++;console.log(`ENTRY_NEGATIVE_BROWSER ${lang} ${scenario} OK`)
    }catch(error){console.error(JSON.stringify({lang,scenario,url:page.url(),body:(await page.locator('body').innerText()).slice(0,1600)}));throw error}
    finally{await context.close()}
  }}finally{await browser.close()}
  assert.equal(cells,18);console.log('ENTRY_NEGATIVE_BROWSER=18/18; actual components, synthetic transports, root-font not true zoom')
})

const initial = { actorId: 'person-a', status: 'ready', workspaceId: 'org-a', contextVersion: 0,
  version: 0, artistId: null, actId: null, artist: null, consentAccepted: false }
const request = { action: 'initialize', key: 'key-1' }
const committed = { status: 'committed', receipt: { id: 'receipt-1', actorId: 'person-a', key: 'key-1',
  action: 'initialize', workspaceId: 'org-a', contextVersion: 0, version: 0, committedAt: '2026-08-31T00:00:00Z', after: initial }, current: initial }
const load = () => import('../src/lib/artistEntry.js')

if(process.argv.includes('--reflow'))test('ENT reflow preserves privacy actions and effective context at 200% root font',async()=>{
  const {chromium}=await import('playwright'),browser=await chromium.launch()
  const origin=process.env.ENTRY_FIXTURE_URL||'http://127.0.0.1:55466'
  assert.equal(new URL(origin).hostname,'127.0.0.1')
  let cells=0
  try {for(const lang of ['en','he'])for(const width of [390,768,1440]){
    const t=(await import(`../src/lib/i18n/${lang}.js`)).T
    await fetch(origin+'/__entry-fixture/reset',{method:'POST',body:JSON.stringify({scenario:'success'})})
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage()
    page.setDefaultTimeout(10000)
    await page.addInitScript(lang=>localStorage.setItem('gigproof_lang',lang),lang)
    const fits=async(locator,label)=>{
      const rows=await locator.evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {text:node.textContent?.slice(0,100),left:r.left,right:r.right,client:node.clientWidth,scroll:node.scrollWidth}}))
      assert.ok(rows.length,label+' must exist')
      assert.ok(rows.every(r=>r.left>=-1&&r.right<=width+1&&r.scroll<=r.client+1),label+' clipped: '+JSON.stringify(rows))
    }
    try {
      await page.goto(origin+'/signup')
      await page.getByLabel(t.signup.firstName,{exact:true}).fill('Entry');await page.getByLabel(t.signup.lastName,{exact:true}).fill('Fixture')
      await page.getByLabel(t.signup.email,{exact:true}).fill('entry-fixture@example.test');await page.getByLabel(t.signup.password,{exact:true}).fill('synthetic-password-123')
      await page.getByRole('button',{name:t.signup.cta,exact:true}).click();await page.waitForURL('**/select')
      await page.getByRole('button').filter({hasText:t.roleSelect.jobArtist}).click();await page.waitForURL('**/onboarding')
      await page.getByLabel(t.onboarding.stageName,{exact:true}).fill('Entry Artist');await page.locator('form input[type=checkbox]').check()
      await page.getByRole('button',{name:t.common.continue,exact:true}).click()
      await page.getByRole('heading',{name:t.onboarding.entryLinkTitle,exact:true}).waitFor()
      let release;const held=new Promise(resolve=>{release=resolve})
      await page.route('**/rpc/get_my_artist_for_active_workspace',async route=>{await held;await route.continue()})
      await page.getByRole('button',{name:t.onboarding.entryWithoutLink,exact:true}).click();await page.waitForURL('**/artist/home')
      await page.evaluate(()=>document.documentElement.style.fontSize='200%')
      const banner=page.getByRole('dialog',{name:t.cookieConsent.ariaLabel,exact:true})
      await fits(banner.locator('p'),'complete privacy text');await fits(banner.getByRole('button'),'consent actions')
      await fits(page.getByRole('region',{name:t.org.contextBeaconLabel}).locator('p > *'),'effective context while loading')
      await fits(page.locator('header').getByRole('button',{name:t.common.switchLanguage,exact:true}),'language control')
      release()
      await page.locator('[data-screen-id=SCR-RADAR-HOME]').waitFor()
      assert.equal(await page.locator('[data-entry-pending=true]').count(),0,'no-link does not invent pending source')
      await fits(page.locator('[data-screen-id=SCR-RADAR-HOME]'),'no-link summary')
      await banner.getByRole('button',{name:t.cookieConsent.decline,exact:true}).focus();await page.keyboard.press('Enter')
      assert.equal(await banner.count(),0,'keyboard decline remains usable')
      await page.goto(origin+'/onboarding');await page.getByRole('heading',{name:t.onboarding.entryLinkTitle,exact:true}).waitFor()
      await page.locator('input[inputmode=url]').fill('https://example.test/private-pending')
      await page.getByLabel(t.onboarding.entrySourceConsent,{exact:true}).check()
      await page.getByRole('button',{name:t.onboarding.entryStartScan,exact:true}).click()
    await page.locator('[data-entry-restored=true]').waitFor()
      await page.getByRole('button',{name:t.onboarding.revealCta,exact:true}).click()
      const pending=page.locator('[data-entry-pending=true]');await pending.waitFor()
      await page.evaluate(()=>document.documentElement.style.fontSize='200%')
      await fits(pending,'pending source panel');await fits(pending.getByRole('button'),'pending review action')
      await pending.getByRole('button').focus();await page.keyboard.press('Enter');await page.waitForURL('**/evidence/**')
      cells++;console.log(`ENTRY_REFLOW ${lang}/${width} loading+no-link+pending; privacy/role/context/keyboard OK`)
    }finally{await context.close()}
  }}finally{await browser.close()}
  assert.equal(cells,6);console.log('ENTRY_REFLOW=6/6 cells; 18/18 state witnesses; root-font reflow NOT browser zoom/AT')
})

test('ENT001 actual Dashboard resolves distinct Act from governed workbench, never Artist id',async()=>{
  const source=fs.readFileSync(new URL('../src/features/artist/ArtistDashboard.jsx',import.meta.url),'utf8')
  const begin=source.indexOf('  async function load()'),end=source.indexOf('\n  // Watchdog',begin)
  const requested=[],effects=[]
  const artist={id:'artist-a',created_by:'person-a',owner_organization_id:'org-a',stage_name:'Artist'}
  const governed={artistId:'artist-a',actId:'act-distinct',objects:[{id:'object-a',state:'candidate',version:1}],
    authority:{actorId:'person-a',workspaceId:'org-a',contextVersion:0},act:{id:'act-distinct'},items:[],claims:[]}
  const noop=()=>{}
  const sandbox={loadRevision:{current:0},access:{allowed:true},user:{id:'person-a'},activeOrgId:'org-a',contextVersion:0,
    contextUnresolved:false,currentContextKey:'person-a:org-a:0',publicationContextKey:'person-a:org-a:0',publicationContext:{current:'person-a:org-a:0'},demo:false,
    getMyArtistForWorkspace:async()=>artist,getMyAct:async id=>{requested.push(id);return id==='act-distinct'?{id}:null},
    getEvidenceWorkbench:async()=>governed,getArtistRadarContext:async()=>{requested.push('act-distinct');return governed},
    listProfileItems:async()=>[],listClaims:async()=>[],getEntitlement:async()=>null,listRequestsForArtist:async()=>[],
    hasShareEvent:()=>false,isPassportDirty:()=>false,radarLogged:{current:true},setLoadError:noop,setLoadedContextKey:noop,
    setArtist:noop,setAct:a=>effects.push(a),setItems:noop,setClaims:noop,setLoading:noop,setPublicationAct:noop,
    setEnt:noop,setReqCount:noop,setOpenReqs:noop,setShared:noop,setDirty:noop,setGovernedEvidence:noop}
  vm.createContext(sandbox)
  await vm.runInContext(`(function(){${source.slice(begin,end)};return load})()`,sandbox)()
  assert.deepEqual(requested,['act-distinct'],'actual existing caller must not resolve Act using artist.id')
  assert.equal(effects.at(-1)?.id,'act-distinct')
})

test('ENT001 governed Radar read rejects actor/workspace/Act/version drift and keeps candidates separate',async()=>{
  const source=fs.readFileSync(new URL('../src/lib/db.js',import.meta.url),'utf8')
  const begin=source.indexOf('export async function getArtistRadarContext('),end=source.indexOf('\nexport async function commitEvidenceAction',begin)
  assert.ok(begin>=0&&end>begin)
  const scope={actorId:'person-a',workspaceId:'org-a',contextVersion:1}
  const exact={artistId:'artist-a',actId:'act-distinct',version:2,authority:{...scope,owner:true},objects:[{id:'pending',state:'candidate'}],act:{id:'act-distinct'},items:[],claims:[]}
  for(const variant of ['ok','person','workspace','context','act','projection','revoked','representative']) {
    const sandbox={DEMO:false,supabase:{rpc:async()=>{
      if(variant==='revoked')return {error:{code:'42501'}}
      if(variant==='person')return {data:{...exact,authority:{...exact.authority,actorId:'other'}}}
      if(variant==='workspace')return {data:{...exact,authority:{...exact.authority,workspaceId:'other'}}}
      if(variant==='context')return {data:{...exact,authority:{...exact.authority,contextVersion:2}}}
      if(variant==='act')return {data:{...exact,actId:'other'}}
      if(variant==='projection')return {data:{...exact,act:{id:'other'}}}
      if(variant==='representative')return {data:{...exact,authority:{...exact.authority,owner:false}}}
      return {data:exact}
    }}}
    vm.createContext(sandbox)
    const fn=vm.runInContext(`(function(){${source.slice(begin,end).replace('export ','')};return getArtistRadarContext})()`,sandbox)
    if(variant==='ok') {const value=await fn('artist-a',scope,'act-distinct');assert.equal(value.objects[0].state,'candidate');assert.equal(value.items.length,0);assert.equal(value.claims.length,0)}
    else await assert.rejects(fn('artist-a',scope,'act-distinct'),undefined,variant)
  }
})

for(const [field,value] of [['actorId','other-person'],['key','other-key'],['action','basics'],['id',null],['committedAt',null]]) {
  test(`22 mismatched receipt ${field} stays unresolved`,async()=>{
    const {createArtistEntryClient}=await load()
    const client=createArtistEntryClient({actorId:'person-a',rpc:async()=>({data:{...committed,receipt:{...committed.receipt,[field]:value}}})})
    assert.equal((await client.commit(request)).status,'uncertain')
  })
}
test('22 a historical receipt returns authoritative current state, never old success',async()=>{
  const {createArtistEntryClient}=await load(),current={...initial,workspaceId:'org-b',contextVersion:2}
  const client=createArtistEntryClient({actorId:'person-a',rpc:async()=>({data:{...committed,current}})})
  const result=await client.recover(request)
  assert.equal(result.status,'reconciled');assert.deepEqual(result.current,current);assert.equal(result.receipt,undefined)
})
test('09 wrong-person current state is never accepted even with a matching receipt',async()=>{
  const {createArtistEntryClient}=await load()
  const client=createArtistEntryClient({actorId:'person-a',rpc:async()=>({data:{...committed,current:{...initial,actorId:'person-b'}}})})
  assert.equal((await client.commit(request)).status,'uncertain')
  await assert.rejects(client.read())
})
test('10 explicit denial never retries or creates a replacement request',async()=>{
  const {createArtistEntryClient}=await load(),calls=[]
  const client=createArtistEntryClient({actorId:'person-a',rpc:async name=>{calls.push(name);return {error:{code:'42501'}}}})
  assert.equal((await client.commit(request)).status,'denied');assert.deepEqual(calls,['commit_artist_entry'])
})
test('23 failed recovery does not retire an original still-pending outcome',async()=>{
  const {createArtistEntryClient}=await load();let finish
  const client=createArtistEntryClient({actorId:'person-a',rpc:async name=>name==='commit_artist_entry'
    ?new Promise(resolve=>{finish=resolve}):Promise.reject(new Error('offline'))})
  const pending=client.commit(request);assert.equal((await client.recover(request)).status,'uncertain')
  finish({data:committed});assert.equal((await pending).status,'committed')
})
test('23 actor teardown retires in-flight read and commit without recovery effects',async()=>{
  const {createArtistEntryClient}=await load();let finishRead,finishCommit;const calls=[]
  const client=createArtistEntryClient({actorId:'person-a',rpc:async name=>{calls.push(name);return new Promise(resolve=>{
    if(name==='read_artist_entry')finishRead=resolve;else finishCommit=resolve
  })}})
  const read=client.read(),commit=client.commit(request);client.retire()
  finishRead({data:initial});finishCommit({data:committed})
  await assert.rejects(read);assert.equal((await commit).status,'retired');assert.equal(calls.length,2)
})
test('18 unsafe URL and absent source permission never produce an intake request',async()=>{
  const {firstLinkRequest}=await load(),data={artistId:'artist',actId:'distinct',version:1,authority:{workspaceId:'org',contextVersion:0}}
  for(const url of ['javascript:alert(1)','file:///test','https://user:password@example.test','not-a-url'])assert.throws(()=>firstLinkRequest(data,url,true))
  assert.throws(()=>firstLinkRequest(data,'https://example.test',false))
})

test('23 obsolete recovery failure cannot warn or unlock a different entry context', async () => {
  const source=fs.readFileSync(new URL('../src/features/artist/Onboarding.jsx',import.meta.url),'utf8')
  const start=source.indexOf('  async function recoverPending('),end=source.indexOf('\n  if (contextUnresolved',start)
  let reject;const effects=[]
  const sandbox={busyRef:{current:false},pending:{kind:'basics',request},generation:{current:1},
    liveKey:{current:'old'},contextKey:'old',setSaving:value=>effects.push(['saving',value]),
    setError:value=>effects.push(['error',value]),T:{onboarding:{entryUncertain:'uncertain'}},
    client:{recover:()=>new Promise((_,r)=>{reject=r})},acceptOutcome:()=>effects.push(['apply'])}
  vm.createContext(sandbox)
  const run=vm.runInContext(`(function(){${source.slice(start,end)};return recoverPending})()`,sandbox)()
  sandbox.generation.current=2;sandbox.liveKey.current='new';effects.length=0
  reject(new Error('late failure'));await run
  assert.deepEqual(effects,[],'a retired continuation has zero UI effects')
})

test('17 failed evidence capture never advances to a successful reveal', async () => {
  const source = fs.readFileSync(new URL('../src/features/artist/Onboarding.jsx', import.meta.url), 'utf8')
  const start = source.indexOf('  async function startRadar(')
  const end = source.indexOf('\n  // Reveal', start)
  assert.ok(start >= 0 && end > start)
  const steps = []
  const sandbox = { link: 'https://example.test/first', artist: { id: 'artist-a' }, setSaving() {}, setError() {},
    addProfileItem: async () => {}, addEvidence: async () => { throw new Error('permission denied') },
    processEvidence: async () => {}, SOURCE_STATUS: { PUBLIC_VERIFIED: 'public-verified' },
    setStep: value => steps.push(value), finish: () => steps.push('finished'),
    T: { common: { error: 'Error' }, onboarding: { entryUncertain: 'Uncertain', entryLinkError: 'Failed' } },
    busyRef: { current: false }, pending: null, accepts: () => true, current: initial, user: { id: 'person-a' },
    previousFocus: { current: null }, document: { activeElement: null }, generation: { current: 0 },
    liveKey: { current: 'context' }, contextKey: 'context', sourceConsent: true, setPending() {},
    getEvidenceWorkbench: async () => ({ artistId: 'artist-a', actId: 'act-b', version: 0,
      authority: { actorId: 'person-a', workspaceId: 'org-a', contextVersion: 0 } }),
    firstLinkRequest: () => ({ action: 'upload' }), commitEvidenceAction: async () => { throw new Error('permission denied') },
    acceptOutcome: () => steps.push(3) }
  vm.createContext(sandbox)
  await vm.runInContext(`(function(){${source.slice(start, end)}; return startRadar})()`, sandbox)()
  assert.deepEqual(steps, [], 'failed governed capture cannot become a successful reveal')
})

test('06 response loss resolves the exact committed setup', async () => {
  const { createArtistEntryClient } = await load()
  const client = createArtistEntryClient({ actorId: 'person-a', rpc: async name => {
    if (name === 'commit_artist_entry') throw new Error('connection lost')
    return { data: committed }
  } })
  assert.deepEqual(await client.commit(request), { ...committed, request })
})

test('07 a missing response alone never proves noncommit', async () => {
  const { createArtistEntryClient } = await load()
  const client = createArtistEntryClient({ actorId: 'person-a', rpc: async () => { throw new Error('offline') } })
  assert.equal((await client.commit(request)).status, 'uncertain')
})

test('08 terminal noncommit requires matching actor/key plus authoritative current state', async () => {
  const { createArtistEntryClient } = await load()
  let proof = { status: 'not_committed', actorId: 'person-a', key: 'key-1', current: initial }
  const client = createArtistEntryClient({ actorId: 'person-a', rpc: async () => ({ data: proof }) })
  assert.equal((await client.recover(request)).status, 'not_committed')
  proof = { ...proof, actorId: 'person-b' }
  assert.equal((await client.recover(request)).status, 'uncertain')
})

test('23 successful manual recovery retires an older continuation', async () => {
  const { createArtistEntryClient } = await load()
  let finish
  const client = createArtistEntryClient({ actorId: 'person-a', rpc: async name => name === 'commit_artist_entry'
    ? new Promise(resolve => { finish = resolve }) : { data: committed } })
  const pending = client.commit(request)
  assert.equal((await client.recover(request)).status, 'committed')
  finish({ data: committed })
  assert.equal((await pending).status, 'retired')
})

test('17 pasted link creates only an explicit source-consented candidate request', async () => {
  const { firstLinkRequest } = await load()
  const data = { artistId: 'artist-a', actId: 'act-b', version: 3,
    authority: { actorId: 'person-a', workspaceId: 'org-a', contextVersion: 2 } }
  const r = firstLinkRequest(data, 'https://example.test/first', true)
  assert.equal(r.action, 'upload'); assert.equal(r.actId, 'act-b'); assert.equal(r.artistId, 'artist-a')
  assert.equal(r.payload.sourceConsent, true); assert.equal(r.payload.source_status, undefined)
  assert.throws(() => firstLinkRequest(data, 'https://example.test/first', false))
  assert.throws(() => firstLinkRequest(data, 'not a link', true))
})

// Execute the current caller's actual function body with only its external
// persistence/navigation boundaries substituted. Browser and PostgreSQL gates
// are separate: this witness does not claim either.
test('05 failed Artist bootstrap keeps the caller on selection', async () => {
  const source = fs.readFileSync(new URL('../src/features/auth/UserTypeSelect.jsx', import.meta.url), 'utf8')
  const start = source.indexOf('  async function choose(')
  const end = source.indexOf('\n  // Cross-funnel seam:', start)
  assert.ok(start >= 0 && end > start, 'production caller must be loaded')
  const navigations = []
  const sandbox = { busy: false, user: { id: 'new-artist', email: 'artist@example.test', user_metadata: {} },
    setBusy() {}, setError() {}, upsertProfile: async () => {},
    bootstrapOrg: async () => { throw new Error('connection lost') },
    reloadProfile: async () => {}, nav: destination => navigations.push(destination),
    console: { error() {} }, busyRef: { current: false }, actorRef: { current: 'new-artist' },
    entryRef: { current: null }, ROLES: { ARTIST: 'artist' }, pending: null, setPending() {},
    crypto, T: { onboarding: { entryRetry: 'Retry', entryUncertain: 'Uncertain' } },
    createArtistEntryClient: () => ({ commit: async () => ({ status: 'uncertain' }) }) }
  vm.createContext(sandbox)
  const choose = vm.runInContext(`(function(){${source.slice(start, end)}; return choose})()`, sandbox)
  await choose('artist', '/onboarding')
  assert.deepEqual(navigations, [], 'failed bootstrap must not navigate into an unestablished Artist workspace')
})
