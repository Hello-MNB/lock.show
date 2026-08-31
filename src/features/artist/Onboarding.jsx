import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getEvidenceWorkbench, commitEvidenceAction, resolveEvidenceAction } from '../../lib/db.js'
import { mirrorEntryCompletion, entryAnalyticsAllowed } from '../../lib/analytics.js'
import { createArtistEntryClient, firstLinkRequest, entryOriginObjects } from '../../lib/artistEntry.js'
import { useOrg } from '../../context/OrgContext.jsx'
import { PageShell, Field, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { PlatformLogo, detectPlatform } from '../../components/PlatformLogo.jsx'
import { useLang } from '../../context/LangContext.jsx'
import ConsentLegal from '../auth/ConsentLegal.jsx'
import { readPendingReturn } from '../../lib/pendingReturn.js'

// Existing entry layout, now governed: basics -> optional link -> receipt.
// A captured candidate is not verified, scanned, confirmed or published.
const STEPS = 3

function ProgressSegments({ step }) {
  const { T } = useLang()
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i + 1 < step ? 'bg-line2' : i + 1 === step ? 'bg-accent' : 'bg-line'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {T.onboarding.stepOf(step, STEPS)} · <span className="text-ink/80">{T.onboarding.entryStepLabels[step - 1]}</span>
      </p>
    </div>
  )
}

export default function Onboarding() {
  const { T } = useLang()
  const { user } = useAuth()
  const { activeOrgId, contextVersion, contextUnresolved } = useOrg()
  const nav = useNavigate()
  const client = useMemo(() => createArtistEntryClient({ actorId: user.id }), [user.id])
  const contextKey = [user.id, activeOrgId || '', contextVersion || 0].join(':')
  const liveKey = useRef(contextKey)
  liveKey.current = contextKey
  const generation = useRef(0)
  const busyRef = useRef(false)
  const focusRef = useRef(null)
  const stepFocus = useRef(null)
  const previousFocus = useRef(null)
  const finished = useRef(false)
  const drafts = useRef(new Map())
  const [loading, setLoading] = useState(true)
  const [loadedKey, setLoadedKey] = useState(null)
  const [step, setStep] = useState(1)
  const [current, setCurrent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [f, setF] = useState({ stage_name: '', city: '' })
  const [link, setLink] = useState('')
  const [sourceConsent, setSourceConsent] = useState(false)
  const [savedCandidates, setSavedCandidates] = useState([])
  const consentAlready = current?.consentAccepted === true

  useEffect(() => {
    if (loadedKey === contextKey) drafts.current.set(contextKey, { f, link, sourceConsent, consentChecked, step, pending })
  }, [loadedKey, contextKey, f, link, sourceConsent, consentChecked, step, pending])

  function accepts(state) {
    return state?.actorId === user.id && state.status === 'ready'
      && (!activeOrgId || state.workspaceId === activeOrgId)
      && (!activeOrgId || state.contextVersion === Number(contextVersion || 0))
  }

  async function loadEntry() {
    const run = ++generation.current
    busyRef.current = false; finished.current = false; setSaving(false)
    setLoading(true); setError(''); setLoadedKey(null); setSavedCandidates([])
    try {
      const state = await client.read()
      if (run !== generation.current || liveKey.current !== contextKey) return
      if (!accepts(state)) throw new Error('entry_context_unavailable')
      const draft = drafts.current.get(contextKey)
      let candidates = []
      if (state.artistId && state.actId && state.consentAccepted && !draft?.pending) {
        const readback = await getEvidenceWorkbench(state.artistId, state.actId)
        if (run !== generation.current || liveKey.current !== contextKey) return
        if (readback.artistId !== state.artistId || readback.actId !== state.actId
          || readback.authority?.actorId !== user.id || readback.authority.workspaceId !== state.workspaceId
          || Number(readback.authority.contextVersion) !== state.contextVersion || readback.authority.owner !== true
          || !Array.isArray(readback.objects)) throw new Error('entry_readback_unavailable')
        candidates = entryOriginObjects(readback, user.id)
        if (readback.objects.some(object => object.state !== 'withdrawn') && !candidates.length) throw new Error('entry_readback_unavailable')
      }
      setCurrent(state); setLoadedKey(contextKey); setSavedCandidates(candidates)
      setPending(draft?.pending || null)
      setF(draft?.f || { stage_name: state.artist?.stage_name || '', city: state.artist?.city || '' })
      setLink(draft?.link || ''); setSourceConsent(draft?.sourceConsent || false); setConsentChecked(draft?.consentChecked || false)
      // A saved UI step is not an authoritative candidate receipt.
      setStep(candidates.length ? 3 : state.artist?.stage_name && state.consentAccepted ? Math.min(draft?.step || 2, 2) : 1)
    } catch {
      if (run === generation.current) setError(T.onboarding.entryRetry)
    } finally { if (run === generation.current) setLoading(false) }
  }

  useEffect(() => {
    loadEntry()
    return () => { generation.current += 1; client.retire() }
    // Translation changes must not reset a draft; server context changes do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, contextKey])
  useEffect(() => { if (pending) focusRef.current?.focus() }, [pending])
  useEffect(() => { if (!pending && !loading) stepFocus.current?.focus() }, [step, pending, loading])

  async function acceptOutcome(result, kind, request, run) {
    if (run !== generation.current || liveKey.current !== contextKey || result.status === 'retired') return
    if (result.status === 'uncertain') {
      setPending({ kind, request }); setError(T.onboarding.entryUncertain); return
    }
    if (!['committed', 'not_committed', 'reconciled'].includes(result.status)) {
      setError(T.onboarding.entryRetry); return
    }
    const state = kind !== 'evidence' ? result.current : await client.read()
    if (run !== generation.current || liveKey.current !== contextKey) return
    if (!accepts(state)) { setPending({ kind, request }); setError(T.onboarding.entryUncertain); return }
    if (kind === 'evidence' && result.status === 'committed') {
      const readback = await getEvidenceWorkbench(state.artistId, state.actId)
      const object = readback.objects.find(o => o.id === request.objectId)
      if (readback.authority.actorId !== user.id || readback.authority.workspaceId !== state.workspaceId
        || Number(readback.authority.contextVersion) !== state.contextVersion || object?.state !== 'candidate'
        || Number(object.version) !== Number(result.receipt.objectVersion)) throw new Error('entry_readback_unavailable')
      const origins = entryOriginObjects(readback, user.id)
      if (!origins.some(item => item.id === request.objectId && item.originReceipt.id === result.receipt.id)) throw new Error('entry_readback_unavailable')
      if (run !== generation.current || liveKey.current !== contextKey) return
      setSavedCandidates(origins)
    }
    if (run !== generation.current || liveKey.current !== contextKey) return
    setCurrent(state); setPending(null)
    if (result.status === 'committed') {
      if (kind === 'consent') { setConsentChecked(false); setStep(1); setError(T.onboarding.entryDecisionSaved) }
      else { setStep(kind === 'basics' ? 2 : 3); setError('') }
    }
    else setError(T.onboarding.entryRetry)
    previousFocus.current?.focus()
  }

  async function continueEntry(e) {
    e?.preventDefault?.()
    if (busyRef.current || pending || !f.stage_name.trim() || !accepts(current)) return
    busyRef.current = true; setSaving(true); setError('')
    previousFocus.current = document.activeElement
    const run = ++generation.current
    const request = { action: 'basics', key: crypto.randomUUID(), workspaceId: current.workspaceId,
      contextVersion: current.contextVersion, expectedVersion: current.version,
      artistId: current.artistId, actId: current.actId,
      payload: { stage_name: f.stage_name.trim(), city: f.city.trim() || null, privacyConsent: consentChecked, noticeVersion: current.serviceNotice?.version } }
    try { await acceptOutcome(await client.commit(request), 'basics', request, run) }
    catch { if (run === generation.current) { setPending({ kind: 'basics', request }); setError(T.onboarding.entryUncertain) } }
    finally { if (run === generation.current) { busyRef.current = false; setSaving(false) } }
  }

  async function recordServiceDecision(decision) {
    if (busyRef.current || pending || !accepts(current) || !current.serviceNotice) return
    busyRef.current = true; setSaving(true); setError('')
    const run = ++generation.current
    const request = { action: 'consent', key: crypto.randomUUID(), workspaceId: current.workspaceId,
      contextVersion: current.contextVersion, expectedVersion: current.version, artistId: current.artistId, actId: current.actId,
      payload: { decision, noticeVersion: current.serviceNotice.version } }
    try { await acceptOutcome(await client.commit(request), 'consent', request, run) }
    catch { if (run === generation.current) { setPending({ kind: 'consent', request }); setError(T.onboarding.entryUncertain) } }
    finally { if (run === generation.current) { busyRef.current = false; setSaving(false) } }
  }

  async function startRadar(e) {
    e?.preventDefault?.()
    if (busyRef.current || pending || !accepts(current)) return
    if (!link.trim()) { await finish(); return }
    busyRef.current = true; setSaving(true); setError('')
    previousFocus.current = document.activeElement
    const run = ++generation.current
    let request
    try {
      const workbench = await getEvidenceWorkbench(current.artistId, current.actId)
      if (run !== generation.current || liveKey.current !== contextKey) return
      if (workbench.authority.actorId !== user.id || workbench.authority.workspaceId !== current.workspaceId
        || Number(workbench.authority.contextVersion) !== current.contextVersion) throw new Error('entry_context_unavailable')
      request = firstLinkRequest(workbench, link, sourceConsent)
      await acceptOutcome(await commitEvidenceAction(request), 'evidence', request, run)
    } catch {
      if (run === generation.current) {
        if (request) setPending({ kind: 'evidence', request })
        setError(request ? T.onboarding.entryUncertain : T.onboarding.entryLinkError)
      }
    } finally { if (run === generation.current) { busyRef.current = false; setSaving(false) } }
  }

  // Reveal and no-link both require current server basics, never a local step.
  async function finish() {
    if (busyRef.current || pending || finished.current) return
    busyRef.current = true; setSaving(true); setError('')
    const run = ++generation.current
    try {
      const state = await client.read()
      if (run !== generation.current || liveKey.current !== contextKey) return
      if (!accepts(state) || !state.artist?.stage_name || !state.consentAccepted) throw new Error('entry_unavailable')
      const completion = await client.complete(state, entryAnalyticsAllowed())
      if (run !== generation.current || liveKey.current !== contextKey || completion.status === 'retired') return
      // Measurement failure/refusal cannot become a new Product Finish gate.
      // Recheck authority after an unknown response; never fabricate an event.
      const finalState = completion.current || await client.read()
      if (run !== generation.current || liveKey.current !== contextKey) return
      if (!accepts(finalState) || !finalState.artist?.stage_name || !finalState.consentAccepted) throw new Error('entry_unavailable')
      await mirrorEntryCompletion(completion)
      if (run !== generation.current || liveKey.current !== contextKey) return
      finished.current = true
      const pendingReturn = readPendingReturn({ consume: true })
      nav(pendingReturn || '/artist/home', { state: { fromEntry: true } })
    } catch { if (run === generation.current) setError(T.onboarding.entryRetry) }
    finally { if (run === generation.current) { busyRef.current = false; setSaving(false) } }
  }

  async function recoverPending() {
    if (busyRef.current || !pending) return
    busyRef.current = true; setSaving(true)
    let run = generation.current
    const { request, kind } = pending
    try {
      const result = kind !== 'evidence' ? await client.recover(request) : await resolveEvidenceAction(request)
      if (run !== generation.current || liveKey.current !== contextKey) return
      if (['committed', 'not_committed', 'reconciled'].includes(result.status)) {
        run = ++generation.current
        await acceptOutcome(result, kind, request, run)
      } else await acceptOutcome(result, kind, request, run)
    } catch { if (run === generation.current && liveKey.current === contextKey) setError(T.onboarding.entryUncertain) }
    finally { if (run === generation.current && liveKey.current === contextKey) { busyRef.current = false; setSaving(false) } }
  }

  if (contextUnresolved || loading) return <Loading />
  if (loadedKey !== contextKey || !accepts(current)) return <PageShell max="max-w-lg">
    <ErrorNote>{error || T.onboarding.entryRetry}</ErrorNote>
    <button className="btn-primary" onClick={loadEntry}>{T.common.tryAgain}</button>
  </PageShell>

  const linkGiven = Boolean(link.trim())
  const linkPlatform = detectPlatform(link.trim())
  return (
    <PageShell max="max-w-lg">
      <ProgressSegments step={step} />
      <ErrorNote>{error}</ErrorNote>
      <p role="status" aria-live="polite" className="mb-3 text-sm text-muted">{saving ? T.common.saving : pending ? T.onboarding.entryUncertain : ''}</p>
      {pending && <button ref={focusRef} type="button" className="btn-primary mb-4" disabled={saving} onClick={recoverPending}>{T.onboarding.entryRecover}</button>}
      <fieldset disabled={saving || Boolean(pending)} className="min-w-0">

      {step === 1 && (
        <form onSubmit={continueEntry}>
          <div className="card">
            <h2 ref={stepFocus} tabIndex={-1} className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.entryTitle}</h2>
            <p className="mb-4 text-xs text-muted">{T.onboarding.entryHint}</p>
            <Field label={T.onboarding.stageName}>
              <input aria-label={T.onboarding.stageName} className="field" value={f.stage_name} autoFocus maxLength={200} required
                onChange={(e) => setF({ ...f, stage_name: e.target.value })} />
            </Field>
            <Field label={`${T.onboarding.city} (${T.onboarding.entryOptional})`}>
              <input aria-label={T.onboarding.city} className="field" value={f.city} maxLength={200}
                onChange={(e) => setF({ ...f, city: e.target.value })} />
            </Field>
          </div>
          {!consentAlready && (
            <div className="mt-3">
              <ConsentLegal checked={consentChecked} onChange={setConsentChecked} notice={current.serviceNotice} onDecision={recordServiceDecision} />
            </div>
          )}
          <div className="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
            <button type="submit" className="btn-primary w-full"
              disabled={saving || !current.serviceNotice || !f.stage_name.trim() || (!consentAlready && !consentChecked)}>
              {saving ? <Spinner /> : T.common.continue}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={startRadar}>
          <div className="card">
            <h2 ref={stepFocus} tabIndex={-1} className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.entryLinkTitle}</h2>
            <p className="mb-4 text-xs text-muted">{T.onboarding.entryLinkHint}</p>
            <Field label={`${T.onboarding.linkPlaceholder} (${T.onboarding.entryOptional})`}>
              <input aria-label={T.onboarding.linkPlaceholder} className="field" dir="ltr" value={link} inputMode="url"
                onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
            </Field>
            {/* instant recognition, same beat as the Radar's setup chip — names
                the platform + shows its logo while typing, never silent */}
            {linkPlatform && (
              <p className="mb-3 -mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                <PlatformLogo name={linkPlatform} size={15} className="text-gold" />
                {T.evidence.platformRecognized(linkPlatform.charAt(0).toUpperCase() + linkPlatform.slice(1))}
              </p>
            )}
            {link.trim() && <label className="mb-3 flex items-start gap-2 text-sm text-ink"><input type="checkbox" checked={sourceConsent} onChange={e => setSourceConsent(e.target.checked)} />{T.onboarding.entrySourceConsent}</label>}
            {/* the deferral promise — everything else is the Radar's job */}
            <p className="text-[11px] leading-relaxed text-faint">{T.onboarding.entryDeferNote}</p>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
            <button type="button" className="btn-ghost" disabled={saving} onClick={() => setStep(1)}>
              {T.common.back}
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving || (Boolean(link.trim()) && !sourceConsent)}>
              {saving ? <Spinner /> : linkGiven ? T.onboarding.entryStartScan : T.onboarding.entryStart}
            </button>
          </div>
          <button type="button" className="btn-ghost mt-3" disabled={saving || Boolean(pending)} onClick={() => finish()}>{T.onboarding.entryWithoutLink}</button>
        </form>
      )}

      {/* Step 3 shows only the saved candidate from an authoritative receipt. */}
      {step === 3 && (
        <div>
          {savedCandidates.length > 0 ? <section data-entry-restored="true" className="card">
            <h2 ref={stepFocus} tabIndex={-1} className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.evidenceActions.title}</h2>
            <p className="mb-4 text-xs text-muted">{T.evidenceActions.boundary}</p>
            {savedCandidates.map(object => <div key={object.id} data-evidence-object={object.id} className="mb-3 min-w-0 break-words rounded-xl border border-line bg-surface2 p-3">
              <p dir="auto" className="text-sm font-semibold text-ink">{object.title || object.value || T.evidenceActions.untitled}</p>
              {object.value && object.title && object.value !== object.title && <p dir="auto" className="text-xs text-muted">{object.value}</p>}
              <p className="mt-1 text-xs text-muted">{T.evidenceActions.states[object.state]}</p>
              <p data-entry-receipt={object.originReceipt.id} className="mt-1 break-all text-xs text-muted">{T.evidenceActions.upload} · {object.originReceipt.committedAt} · {T.evidenceActions.receipt}: {object.originReceipt.id} · v{object.originReceipt.objectVersion}</p>
              <button type="button" className="btn-ghost w-full" onClick={() => nav(`/evidence/${encodeURIComponent(current.artistId)}?act=${encodeURIComponent(current.actId)}&object=${encodeURIComponent(object.id)}&receipt=${encodeURIComponent(object.originReceipt.id)}&objectVersion=${object.originReceipt.objectVersion}`)}>{T.evidenceActions.title}</button>
            </div>)}
          </section> :
          <div className="card">
            <h2 ref={stepFocus} tabIndex={-1} className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.revealTitle}</h2>
            <p className="mb-4 text-xs text-muted">{T.onboarding.revealSub}</p>
            <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-surface2 px-3 py-2.5">
              {linkPlatform && <PlatformLogo name={linkPlatform} size={18} className="shrink-0 text-gold" />}
              <div className="min-w-0 flex-1">
                <p dir="ltr" className="truncate text-sm font-semibold text-ink">{link.trim()}</p>
                <p className="text-[11px] text-muted">{T.onboarding.revealRowSub}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">✦ {T.onboarding.revealFound}</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">{T.onboarding.revealScope}</p>
          </div>}
          <div className="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
            <button type="button" className="btn-primary w-full" onClick={finish}>
              {T.onboarding.revealCta}
            </button>
          </div>
        </div>
      )}
      </fieldset>
    </PageShell>
  )
}
