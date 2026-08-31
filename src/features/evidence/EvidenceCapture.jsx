import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { PageShell } from '../../components/ui.jsx'
import { getEvidenceWorkbench, commitEvidenceAction, resolveEvidenceAction, scanEvidenceCandidate } from '../../lib/db.js'
import { countRetryableEvidence } from '../../lib/evidenceState.js'
import { emitGovernedConfirmation, emitGovernedPublication } from '../../lib/passportApi.js'
import { clearPassportDirty } from '../../lib/passportState.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { uploadFile } from '../../lib/storage.js'
import { evidenceFileError, EVIDENCE, methodLabelFor } from '../../lib/constants.js'
import { entryOriginSelection } from '../../lib/artistEntry.js'
import { Upload, Link2, ScanSearch } from 'lucide-react'

const PATHS = [
  { key: 'upload', Icon: Upload, intents: ['drew-crowd', 'sold-via-link', 'produced-event'] },
  { key: 'connect', Icon: Link2, intents: ['rebooked', 'consistent-frequency', 'producer-confirm'] },
  { key: 'declare', Icon: ScanSearch, intents: ['community'] },
]

// ART-02 / REP-05 / SCR-REP-ACTION. No extraction, truth or publication is
// inferred from file storage, a proposal, a local role or a successful HTTP call.
export function EvidenceActionWorkbench({ artistId, actId: requestedActId = null, requestedAction = null, onReturn = null, originObject = null, originReceipt = null, originVersion = null }) {
  const { T } = useLang()
  const S = T.evidenceActions
  const { user } = useAuth()
  const { activeOrgId, contextVersion, contextUnresolved } = useOrg()
  const [data, setData] = useState(null)
  const [selectedActId, setSelectedActId] = useState(null)
  const actId = selectedActId || requestedActId
  const [selectedId, select] = useState('')
  const [draft, setDraft] = useState({ title: '', value: '', statement: '', reason: '', provenance: '', audience: '', purpose: '', expiresAt: '', rights: false, visibility: false, conflict: true, sourceConsent: false })
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [scannerMessage, setScannerMessage] = useState('')
  const [intent, setIntent] = useState(null)
  const generation = useRef(0)
  const emittedReceipts = useRef(new Set())
  const busyRef = useRef(false)
  const currentScope = useRef('')
  const focusRef = useRef(null)
  const scope = [user?.id, artistId, actId, activeOrgId, contextVersion, contextUnresolved, originObject, originReceipt, originVersion].join('|')
  currentScope.current = scope
  const matches = (value) => value?.artistId === artistId && !!value.actId && (!actId || value.actId === actId)
    && value.authority?.actorId === user?.id && value.authority?.workspaceId === activeOrgId && Number(value.authority.contextVersion) === Number(contextVersion)
  const valid = matches(data) && !contextUnresolved
  const object = valid ? data.objects.find(item => item.id === selectedId) : null
  const evidence = valid ? data.objects : []
  const retryable = countRetryableEvidence(evidence)
  const owner = valid && data.authority.owner === true
  const allowed = (scopeName) => owner || (valid && data.authority.scope.includes(scopeName))
  const update = (key, value) => setDraft(before => ({ ...before, [key]: value }))

  async function reload(operation = generation.current) {
    const captured = currentScope.current
    const value = await getEvidenceWorkbench(artistId, actId)
    if (operation !== generation.current || captured !== currentScope.current || !matches(value)) throw new Error('context changed')
    if ((originObject || originReceipt || originVersion) && (!selectedActId || selectedActId === requestedActId)) {
      const origin = entryOriginSelection(value, user.id, originObject, originReceipt, originVersion)
      select(origin.id)
      setReceipt(origin.originReceipt)
    }
    setData(value)
    return value
  }
  useEffect(() => {
    const current = ++generation.current
    setData(null); select(''); setReceipt(null)
    setStatus('loading')
    reload().then(() => { if (generation.current === current) setStatus('ready') })
      .catch(() => { if (generation.current === current) setStatus('denied') })
    return () => { generation.current++ }
  }, [scope])
  useEffect(() => { focusRef.current?.focus() }, [])

  async function settle(outcome, operation, capturedScope) {
    if (operation !== generation.current || capturedScope !== currentScope.current) return
    if (outcome.status === 'committed' || outcome.status === 'not_committed') {
      try {
        const fresh = await reload()
        if (operation !== generation.current || capturedScope !== currentScope.current) return
        if (outcome.status === 'committed' && Number(fresh.version) < Number(outcome.receipt.version)) throw new Error('readback stale')
        // Retire every older continuation only AFTER authoritative recovery.
        generation.current++
        emitGovernedConfirmation(outcome, fresh, emittedReceipts.current,
          props => logEvent(EVENTS.CLAIM_CONFIRMED, props))
        emitGovernedPublication(outcome, fresh, emittedReceipts.current, (kind, props) => {
          if (kind === 'published') {
            clearPassportDirty(props.artist_id)
            logEvent(EVENTS.PASSPORT_PUBLISHED, props)
          } else logEvent(EVENTS.PASSPORT_UNPUBLISHED, props)
        })
        setReceipt(outcome.receipt || null)
        setPending(null); setStatus(outcome.status); setBusy(false); busyRef.current = false
        focusRef.current?.focus()
        return
      } catch { /* keep draft and unresolved request; never guess success */ }
    }
    if (operation !== generation.current || capturedScope !== currentScope.current) return
    setPending(outcome.status === 'denied' ? null : outcome.request)
    setStatus(outcome.status === 'denied' ? 'denied' : 'uncertain')
    setBusy(false); busyRef.current = false
  }
  async function act(action, override = null) {
    if (!valid || busyRef.current || pending || (action !== 'upload' && !object)) return
    const payload = override || (action === 'upload' ? { evidence_type: intent === 'community' ? 'band' : 'link',
      source_type: intent === 'community' ? 'self-band' : ['rebooked','producer-confirm'].includes(intent) ? 'producer-vouch' : 'public-profile',
      claim_intent: intent, ...(intent === 'community' ? { communityCount: Number(draft.value) } : {}),
      value: draft.value, public_url: draft.value, title: draft.title, sourceConsent: draft.sourceConsent,
      reason: draft.reason, provenance: draft.provenance } : action === 'propose' ?
      { statement: draft.statement, reason: draft.reason, provenance: draft.provenance } : action === 'change' ?
      { title: draft.title, reason: draft.reason, provenance: draft.provenance } : action === 'confirm' ?
      { rights: draft.rights, visibility: draft.visibility, conflict: draft.conflict, reason: draft.reason, provenance: draft.provenance } :
      { audience: draft.audience, purpose: draft.purpose, expiresAt: draft.expiresAt,
        reason: draft.reason, provenance: draft.provenance })
    const request = { artistId, actId: data.actId, objectId: action === 'upload' ? crypto.randomUUID() : object.id,
      workspaceId: data.authority.workspaceId, contextVersion: Number(data.authority.contextVersion),
      expectedVersion: Number(data.version), expectedObjectVersion: action === 'upload' ? 0 : Number(object.version),
      action, payload, key: crypto.randomUUID() }
    const operation = ++generation.current
    const capturedScope = scope
    setPending(request); busyRef.current = true; setBusy(true); setStatus('loading')
    const outcome = await commitEvidenceAction(request).catch(() => ({ status: 'uncertain', request }))
    await settle(outcome, operation, capturedScope)
  }
  async function recover() {
    if (!pending) return
    const operation = generation.current
    const capturedScope = scope
    const outcome = await resolveEvidenceAction(pending).catch(() => ({ status: 'uncertain', request: pending }))
    await settle(outcome, operation, capturedScope)
  }
  async function fileSelected(event) {
    const file = event.target.files?.[0]
    if (!file || busyRef.current || !draft.sourceConsent) return
    if (evidenceFileError(file)) { setStatus('fileError'); return }
    const captured = currentScope.current
    busyRef.current = true; setBusy(true)
    try {
      const uploaded = await uploadFile('evidence', user.id, file)
      if (captured !== currentScope.current) return
      busyRef.current = false
      await act('upload', { evidence_type: 'file', source_type: ['drew-crowd','sold-via-link'].includes(intent) ? 'ticket-export' : intent === 'produced-event' ? 'screenshot' : 'self-reported', value: file.name,
        claim_intent: intent,
        file_url: uploaded.url, title: draft.title || file.name, sourceConsent: true,
        reason: draft.reason, provenance: draft.provenance })
    } catch { if (captured === currentScope.current) setStatus('denied') }
    finally { if (!pending) { busyRef.current = false; setBusy(false) } }
  }
  async function processEvidence(artistId) {
    if (!object || pending || busyRef.current || object.state !== 'candidate') return
    const captured = currentScope.current
    busyRef.current = true; setBusy(true); setScannerMessage('')
    try {
      const result = await scanEvidenceCandidate({ artistId, actId: data.actId, objectId: object.id,
        workspaceId: data.authority.workspaceId, contextVersion: Number(data.authority.contextVersion), expectedObjectVersion: Number(object.version) })
      if (captured !== currentScope.current) return
      update('statement', result.statement)
      setScannerMessage(result.ai === 'degraded' ? T.evidence.scannerDegraded : S.prepared)
      busyRef.current = false
      await act('prepare', { statement: result.statement, processingFailed: result.ai === 'degraded',
        reason: draft.reason, provenance: draft.provenance })
    } catch { if (captured === currentScope.current) setScannerMessage(T.evidence.scannerDegraded) }
    finally { busyRef.current = false; setBusy(false) }
  }
  const textField = (key, type = 'text') => <label className="block min-w-0 text-sm" key={key}>
    <span className="mb-1 block">{key === 'title' ? S.titleLabel : key === 'value' && intent === 'community' ? T.evidence.communityLabel : S[key]}</span>
    <input className="field w-full min-w-0" type={type} value={draft[key]}
      onChange={event => update(key, event.target.value)} />
  </label>
  return <section className="card space-y-4" aria-label={S.title} data-ku03-workbench>
    <h2 className="font-display text-xl font-bold" tabIndex={-1} ref={focusRef}>{S.title}</h2>
    <p className="text-sm text-muted">{S.boundary}</p>
    {requestedAction && <p>{S.selectionRequired} — {S[requestedAction]}</p>}
    <p role="status" aria-live="polite" aria-atomic="true">{S.status[status] || S.status.ready}</p>
    {scannerMessage && <p role="status">{scannerMessage}</p>}
    {receipt && <p className="break-all text-sm">{S.receipt}: {receipt.id}</p>}
    {valid && owner && !busy && !pending && data.publication?.purpose && data.publication.actId === data.actId &&
      <Link className="tap-target inline-flex text-sm underline" to={`/passport/${encodeURIComponent(artistId)}?purpose=${encodeURIComponent(data.publication.purpose)}`}>{T.dashboard.viewPublic}</Link>}
    {pending && <button type="button" className="btn-ghost" onClick={recover}>{S.recover}</button>}
    {!valid && !pending && <button type="button" className="btn-ghost" onClick={() => reload().then(() => setStatus('ready')).catch(() => setStatus('denied'))}>{S.retry}</button>}
    <fieldset disabled={!valid || busy || !!pending} className="min-w-0 space-y-4">
      <legend className="text-sm">{valid ? data.stageName : S.contextRequired}</legend>
      <div className="space-y-2">{PATHS.map(path => <section key={path.key} className="premium-panel p-3">
        <h3 className="flex gap-2 font-semibold"><path.Icon size={20} aria-hidden="true" />{T.evidence.paths[path.key].title}</h3>
        <p className="text-sm">{T.evidence.paths[path.key].desc}</p>
        <div className="flex flex-wrap gap-2">{path.intents.map(key => <button key={key} type="button" aria-pressed={intent === key}
          className="btn-ghost" onClick={() => setIntent(key)}>{T.evidence.intents[key]}</button>)}</div>
      </section>)}</div>
      {intent && <p>{T.evidence.intentAsk[intent]}</p>}
      {intent === 'community' && <p>{T.evidence.communityPII}</p>}
      {valid && <label className="block text-sm">{S.act}
        <select className="field w-full min-w-0" value={data.actId} onChange={e => { setSelectedActId(e.target.value); select('') }}>
          {(data.acts || []).map(item => <option key={item.id} value={item.id}>{item.stageName}</option>)}
        </select>
      </label>}
      {textField('title')}{textField('value', intent === 'community' ? 'number' : ['rebooked','producer-confirm'].includes(intent) ? 'text' : 'url')}{textField('reason')}{textField('provenance')}
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.sourceConsent} onChange={e => update('sourceConsent', e.target.checked)} />{S.sourceConsent}</label>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" disabled={!allowed('upload') || !draft.sourceConsent || !draft.value} onClick={() => act('upload')}>{S.upload}</button>
        {intent !== 'community' && <label className="btn-ghost cursor-pointer">{S.file}<input type="file" accept={EVIDENCE.ACCEPT} className="block max-w-full text-sm" disabled={!allowed('upload') || !draft.sourceConsent} onChange={fileSelected} /></label>}
      </div>
      {valid && <LegacyEvidenceReview data={data} T={T} canPrepare={allowed('upload') && draft.sourceConsent && !!draft.reason && !!draft.provenance}
        onPrepare={(kind, row) => act('upload', { legacyKind: kind, legacyId: row.id, legacyFingerprint: row.fingerprint,
          sourceConsent: draft.sourceConsent, reason: draft.reason, provenance: draft.provenance })} />}
      {valid && data.objects.length === 0 && <p>{S.empty}</p>}
      {valid && retryable > 0 && <p>{T.evidence.retryable}: {retryable}</p>}
      {evidence.filter(e => e.status === 'error').map(e => <p key={e.id}>{e.title}: {e.status === 'error' ? T.evidence.retryable : ''}</p>)}
      {valid && data.objects.map(item => <button type="button" key={item.id}
        className="block w-full break-words rounded-lg border border-line p-3 text-start"
        aria-pressed={selectedId === item.id} onClick={() => select(item.id)}>
        {item.title || S.untitled} — {S.states[item.state] || S.states.candidate}
        {item.claim && <span className="block">{item.claim.statement} · {T.methodLabel[methodLabelFor({ verification_status: item.claim.verification })]}</span>}
      </button>)}
      {object && <div className="space-y-3 border-t border-line pt-3">
        <p>{S.selected}: {object.title || S.untitled}</p>
        {object.preparedStatement && <p>{S.prepared}: {object.preparedStatement}</p>}
        <button className="btn-ghost" type="button" disabled={!allowed('upload') || object.state !== 'candidate'} onClick={() => processEvidence(artistId)}>{T.evidence.scannerCta}</button>
        {textField('statement')}
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" type="button" disabled={!allowed('edit') || object.state === 'withdrawn'} onClick={() => act('change')}>{S.change}</button>
          <button className="btn-ghost" type="button" disabled={!allowed('publish') || !draft.statement || !['candidate', 'proposed'].includes(object.state)} onClick={() => act('propose')}>{S.propose}</button>
        </div>
        {['rights', 'visibility', 'conflict'].map(key => <label key={key} className="flex gap-2 text-sm">
          <input type="checkbox" checked={draft[key]} onChange={e => update(key, e.target.checked)} />{S[key]}
        </label>)}
        <button className="btn-ghost" type="button" disabled={!owner || object.state !== 'proposed'} onClick={() => act('confirm')}>{S.confirm}</button>
        <p className="text-sm">{S.eligibility}</p>
        {textField('audience')}{textField('purpose')}{textField('expiresAt', 'datetime-local')}
        <p className="break-words text-sm">{S.preview}: {object.claim?.statement || S.empty}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" type="button" disabled={!owner || object.state !== 'confirmed'
            || !object.rights || !object.visibility || object.conflict || !['supporting', 'verified'].includes(object.claim?.verification)
            || !draft.audience || !draft.purpose || !draft.expiresAt} onClick={() => act('publish')}>{S.publish}</button>
          <button className="btn-ghost" type="button" disabled={!owner || object.state !== 'confirmed'
            || !object.rights || !object.visibility || object.conflict || !['supporting', 'verified'].includes(object.claim?.verification)
            || !draft.audience || !draft.purpose || !draft.expiresAt} onClick={() => act('replace')}>{S.replace}</button>
          <button className="btn-ghost" type="button" disabled={object.state === 'withdrawn' || (!owner && object.state !== 'proposed')} onClick={() => act('withdraw')}>{S.withdraw}</button>
        </div>
      </div>}
    </fieldset>
    {valid && data.history?.length > 0 && <details className="min-w-0"><summary className="tap-target cursor-pointer">{S.history}</summary>
      {data.history.map(item => <article key={item.receipt.id} className="border-t border-line py-2 text-sm break-words">
        <p>{S[item.action] || item.action} · {item.receipt.committedAt}</p>
        <p>{S.reason}: {item.reason} · {S.provenance}: {item.provenance}</p>
        <p>{S.receipt}: {item.receipt.id}</p>
        <p>{S.before}: {item.before?.statement || item.before?.title || item.before?.original?.value || '—'}</p>
        <p>{S.after}: {item.after?.statement || item.after?.title || '—'}</p>
      </article>)}
    </details>}
    {onReturn ? <button type="button" className="btn-ghost" disabled={busy || !!pending} onClick={onReturn}>{S.back}</button>
      : pending || busy ? <span aria-disabled="true">{S.back}</span>
        : <Link className="tap-target inline-flex items-center text-sm underline" to="/artist/home">{S.back}</Link>}
  </section>
}
export default function EvidenceCapture() {
  const { artistId } = useParams()
  const [query] = useSearchParams()
  return <PageShell><EvidenceActionWorkbench artistId={artistId} actId={query.get('act')} originObject={query.get('object')} originReceipt={query.get('receipt')} originVersion={query.get('objectVersion')} /></PageShell>
}

// Read-only source continuity. Preparing a new candidate is explicit, version
// checked and receipted; it does not migrate or confirm the original row.
export function LegacyEvidenceReview({ data, T, canPrepare, onPrepare }) {
  const S = T.evidenceActions
  const claims = data.legacyClaims || []
  const items = data.legacyItems || []
  if (!claims.length && !items.length) return null
  const destination = row => row.visibility === 'passport-ok' ? T.claims.passportOk : T.claims.mirrorOnly
  const sourceLink = row => /^https?:\/\//i.test(row.public_url || '')
    ? <a className="underline break-all" href={row.public_url} target="_blank" rel="noopener noreferrer">{row.public_url}</a> : null
  const prepare = (kind, row) => <button type="button" className="btn-ghost" disabled={!canPrepare}
    onClick={() => onPrepare(kind, row)}>{S.prepare}</button>
  return <section className="space-y-3" aria-label={S.legacy} data-ku03-legacy>
    <h3 className="font-bold">{S.legacy}</h3><p className="text-sm">{S.legacyBoundary}</p>
    {[[T.claims.needsReview, claims.filter(c => !c.artist_approved)],
      [T.claims.passportOk, claims.filter(c => c.artist_approved && c.visibility === 'passport-ok')],
      [T.claims.mirrorOnly, claims.filter(c => c.artist_approved && c.visibility !== 'passport-ok')]].map(([label, rows]) => rows.length > 0 &&
      <section key={label}><h4 className="font-semibold">{label} ({rows.length})</h4>
        {rows.map(row => <article className="my-2 space-y-1 rounded-lg border border-line p-3 break-words" key={row.id} data-legacy-id={row.id}>
          <p className="font-semibold">{row.public_wording || row.value}</p>
          {row.public_wording && row.public_wording !== row.value && <p>{row.value}</p>}
          <p>{T.methodLabel[methodLabelFor(row)]} · {row.source_type} · {row.reason_code}</p>
          <p>{destination(row)} · {row.artist_approved ? T.claims.approvedChip : T.claims.needsReview}</p>
          {row.status === 'disputed' && <p>{T.claims.flaggedChip}</p>}
          {row.limitation_text && <p>{T.claims.limitationLabel}: {row.limitation_text}</p>}
          <p>{row.reviewed_at || row.updated_at || row.created_at}</p>{sourceLink(row)}
          {prepare('claim', row)}
        </article>)}
      </section>)}
    {items.length > 0 && <section><h4 className="font-semibold">{T.claims.itemsTitle} ({items.length})</h4>
      {items.map(row => <article className="my-2 space-y-1 rounded-lg border border-line p-3 break-words" key={row.id} data-legacy-id={row.id}>
        <p className="font-semibold">{row.title}</p><p>{row.detail}</p><p>{row.item_date}</p>
        <p>{T.methodLabel[row.source_status === 'public-verified' ? 'source-linked' : 'artist-declared']} · {destination(row)}</p>
        {sourceLink(row)}{prepare('item', row)}
      </article>)}
    </section>}
  </section>
}
