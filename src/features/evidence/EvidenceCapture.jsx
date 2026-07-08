import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getArtist, addEvidence, listEvidence, listClaims, hasConsent, recordConsentScope, processEvidence, updateAct } from '../../lib/db.js'
import { uploadFile } from '../../lib/storage.js'
import { EVIDENCE, evidenceFileError } from '../../lib/constants.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading, SourceLabel } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// ── Claim-first evidence capture (canon A7) ──────────────────────────────────
// The artist starts from WHAT THEY WANT TO PROVE; the system requests the
// matching evidence. Three capture paths, presented as cards:
//   UPLOAD a document · CONNECT a source · DECLARE a band.
// Each intent maps to its evidence ask + source_type (canon claim→source table).
const PATHS = [
  {
    key: 'upload',
    icon: '⇪',
    title: 'Upload proof',
    desc: 'Ticket exports, settlements, posters — the strongest evidence.',
    intents: ['drew-crowd', 'sold-via-link', 'produced-event'],
  },
  {
    key: 'connect',
    icon: '↗',
    title: 'Connect a source',
    desc: 'Public links and producer references that can be checked.',
    intents: ['rebooked', 'consistent-frequency', 'producer-confirm'],
  },
  {
    key: 'declare',
    icon: '✎',
    title: 'Declare a band',
    desc: 'Your own numbers — shown only as a bounded band, never a raw count.',
    intents: ['community'],
  },
]

export default function EvidenceCapture() {
  const { T, BANDS } = useLang()
  const { artistId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [claims, setClaims] = useState([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [processing, setProcessing] = useState(false)

  // claim-first: which claim the artist wants to prove (null = path cards)
  const [intent, setIntent] = useState(null)

  // Third-party evidence consent gate (collected inline here, not upfront).
  const [evConsent, setEvConsent] = useState(false)
  const [consentBusy, setConsentBusy] = useState(false)

  // per-intent form state
  const [band, setBand] = useState('')
  const [bandUrl, setBandUrl] = useState('')
  const [textVal, setTextVal] = useState('')
  const [numVal, setNumVal] = useState('')
  const [uploading, setUploading] = useState(false)

  async function load() {
    try {
      const a = await getArtist(artistId); setArtist(a)
      setEvConsent(await hasConsent(user.id, 'evidence-storage'))
      setEvidence(await listEvidence(artistId))
      setClaims(await listClaims(artistId))
    } catch (err) {
      setError(err.message || T.common.error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [artistId])

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 2200) }
  function resetForms() { setBand(''); setBandUrl(''); setTextVal(''); setNumVal('') }

  async function acceptEvidenceConsent() {
    setConsentBusy(true); setError('')
    try {
      await recordConsentScope(user.id, 'evidence-storage')
      setEvConsent(true)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally {
      setConsentBusy(false)
    }
  }

  // every artifact carries the claim intent + source-authority confirmation
  async function submitEvidence(item) {
    await addEvidence({ artist_id: artistId, claim_intent: intent, source_owner_consent: true, ...item })
    resetForms(); await load(); flash(T.evidence.addedOk)
  }

  async function onFile(e, sourceType) {
    const file = e.target.files?.[0]; if (!file) return
    const bad = evidenceFileError(file)
    if (bad) { setError(bad === 'size' ? T.evidence.errFileSize : T.evidence.errFileType); e.target.value = ''; return }
    setUploading(true); setError('')
    try {
      const { url } = await uploadFile('evidence', user.id, file)
      await submitEvidence({ evidence_type: 'file', source_type: sourceType, file_url: url, value: file.name })
    } catch (err) { setError(err.message) } finally { setUploading(false) }
  }

  async function addBand() {
    if (!band) return
    setError('')
    try {
      await submitEvidence({
        evidence_type: 'band',
        source_type: bandUrl ? 'public-profile' : 'self-band',
        value: band, public_url: bandUrl || null,
      })
    } catch (err) { setError(err.message) }
  }

  async function addLink(sourceType) {
    if (!textVal) return
    setError('')
    try {
      const isUrl = /^https?:\/\//i.test(textVal.trim())
      await submitEvidence({
        evidence_type: 'link', source_type: sourceType,
        value: textVal, public_url: isUrl ? textVal.trim() : null,
      })
    } catch (err) { setError(err.message) }
  }

  // community: a NUMBER only — Amendment 13 forbids member lists/screenshots.
  async function addCommunityCount() {
    const n = parseInt(numVal, 10)
    if (!Number.isFinite(n) || n <= 0) return
    setError('')
    try {
      await updateAct(artistId, { community_count_declared: n }) // working-only; public sees a band, never this integer
      await submitEvidence({ evidence_type: 'band', source_type: 'self-band', value: String(n) })
    } catch (err) { setError(err.message) }
  }

  async function process() {
    setProcessing(true); setError('')
    try {
      await processEvidence(artistId) // server (real AI) if present, else client-side canon stub
      await load()
    } catch (err) { setError(err.message || T.common.error) } finally { setProcessing(false) }
  }

  if (loading) return <Loading />

  // Gate: no evidence add/processing without third-party evidence consent.
  if (!evConsent) {
    return (
      <PageShell>
        <div className="mb-6 flex items-center justify-between">
          <Wordmark /><Link to="/artist/home" className="text-sm text-muted transition-colors hover:text-ink">{T.common.back}</Link>
        </div>
        <h1 className="font-display mb-1 text-2xl font-bold tracking-[-0.01em] text-ink">{T.evidence.title}</h1>
        <ErrorNote>{error}</ErrorNote>
        <div className="card">
          <p className="mb-1 font-bold text-ink">{T.consent.evidenceTitle}</p>
          <p className="mb-4 text-sm text-muted">{T.consent.evidence}</p>
          <button className="btn-primary w-full" onClick={acceptEvidenceConsent} disabled={consentBusy}>
            {consentBusy ? <Spinner /> : T.consent.evidenceGateCta}
          </button>
        </div>
      </PageShell>
    )
  }

  const pending = evidence.filter((e) => e.status === 'submitted').length

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted transition-colors hover:text-ink">{T.common.back}</Link>
      </div>
      <h1 className="font-display mb-1 text-2xl font-bold tracking-[-0.01em] text-ink">{T.evidence.title}</h1>
      <p className="mb-4 text-sm text-muted">{T.evidence.subtitle}</p>
      <ErrorNote>{error}</ErrorNote>
      {toast && (
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink" role="status">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />{toast}
        </p>
      )}

      {/* ── Step 1: three capture paths, as cards ── */}
      {!intent && (
        <div className="mb-4 space-y-3">
          {PATHS.map((p) => (
            <div key={p.key} className="card">
              <div className="mb-2 flex items-center gap-3">
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line2 font-mono text-sm text-muted">{p.icon}</span>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-ink">{p.title}</p>
                  <p className="text-xs text-muted">{p.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.intents.map((k) => (
                  <button key={k} type="button" onClick={() => { setIntent(k); setError('') }}
                    className="min-h-[44px] rounded-xl border border-white/[0.12] bg-surface2 px-3 py-2 text-sm font-semibold text-ink/90 transition-colors hover:border-line2">
                    {T.evidence.intents[k]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Step 2: the matching evidence request ── */}
      {intent && (
        <div className="card mb-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-display text-base font-bold text-ink">{T.evidence.intents[intent]}</p>
            <button type="button" className="min-h-[40px] text-xs text-muted transition-colors hover:text-ink" onClick={() => { setIntent(null); resetForms() }}>
              {T.evidence.changeIntent}
            </button>
          </div>
          <p className="mb-4 text-xs text-muted">{T.evidence.intentAsk[intent]}</p>

          {/* drew-crowd: strongest = export/settlement file; also band + public link */}
          {intent === 'drew-crowd' && (
            <>
              <p className="mb-1 text-sm font-semibold text-ink">{T.evidence.uploadFile}</p>
              <input type="file" accept={EVIDENCE.ACCEPT} onChange={(e) => onFile(e, 'ticket-export')} className="mb-1 text-sm text-muted" />
              <p className="mb-4 text-xs text-muted">{T.evidence.fileHint}</p>
              {uploading && <Spinner />}
              <p className="mb-1 text-sm font-semibold text-ink">{T.evidence.bandEntry}</p>
              <Field label={T.onboarding.freqBand}>
                <div className="flex flex-wrap gap-2">
                  {BANDS.frequency.map((o) => (
                    <button key={o} onClick={() => setBand(o)}
                      className={`chip min-h-[44px] border px-4 py-2 font-mono transition-colors ${band === o ? 'border-accent/70 bg-surface2 font-bold text-ink' : 'border-white/15 bg-surface2 text-ink/85 hover:border-line2'}`}>{o}</button>
                  ))}
                </div>
              </Field>
              <Field label={T.evidence.publicUrl}>
                <input className="field" dir="ltr" value={bandUrl} onChange={(e) => setBandUrl(e.target.value)} placeholder="https://…" />
              </Field>
              <button className="btn-ghost w-full" onClick={addBand}>{T.common.add}</button>
            </>
          )}

          {/* sold-via-link: UTM/coupon export upload */}
          {intent === 'sold-via-link' && (
            <>
              <input type="file" accept={EVIDENCE.ACCEPT} onChange={(e) => onFile(e, 'ticket-export')} className="mb-1 text-sm text-muted" />
              <p className="text-xs text-muted">{T.evidence.fileHint}</p>
              {uploading && <Spinner />}
            </>
          )}

          {/* rebooked: venue/producer reference */}
          {intent === 'rebooked' && (
            <>
              <Field label={T.evidence.referenceLabel}>
                <input className="field" value={textVal} onChange={(e) => setTextVal(e.target.value)} placeholder={T.evidence.referencePlaceholder} />
              </Field>
              <button className="btn-ghost w-full" onClick={() => addLink('producer-vouch')}>{T.common.add}</button>
            </>
          )}

          {/* community: NUMBER ONLY (Amendment 13 — no member lists, ever) */}
          {intent === 'community' && (
            <>
              <Field label={T.evidence.communityLabel}>
                <input className="field" type="number" min="1" inputMode="numeric" value={numVal} onChange={(e) => setNumVal(e.target.value)} placeholder="1200" />
              </Field>
              <p className="mb-3 text-xs text-[#F0B478]">{T.evidence.communityPII}</p>
              <button className="btn-ghost w-full" onClick={addCommunityCount}>{T.common.add}</button>
            </>
          )}

          {/* produced-event: public link or poster file */}
          {intent === 'produced-event' && (
            <>
              <Field label={T.evidence.publicUrl}>
                <input className="field" dir="ltr" value={textVal} onChange={(e) => setTextVal(e.target.value)} placeholder="https://…" />
              </Field>
              <button className="btn-ghost mb-4 w-full" onClick={() => addLink('public-profile')}>{T.common.add}</button>
              <p className="mb-1 text-sm font-semibold text-ink">{T.evidence.uploadFile}</p>
              <input type="file" accept={EVIDENCE.ACCEPT} onChange={(e) => onFile(e, 'screenshot')} className="text-sm text-muted" />
              {uploading && <Spinner />}
            </>
          )}

          {/* consistent-frequency: public lineup link */}
          {intent === 'consistent-frequency' && (
            <>
              <Field label={T.evidence.publicUrl}>
                <input className="field" dir="ltr" value={textVal} onChange={(e) => setTextVal(e.target.value)} placeholder="https://…" />
              </Field>
              <button className="btn-ghost w-full" onClick={() => addLink('public-profile')}>{T.common.add}</button>
            </>
          )}

          {/* producer-confirm: contact → one-claim confirmation link (P1 flow) */}
          {intent === 'producer-confirm' && (
            <>
              <Field label={T.evidence.producerContactLabel}>
                <input className="field" value={textVal} onChange={(e) => setTextVal(e.target.value)} placeholder={T.evidence.producerContactPlaceholder} />
              </Field>
              <button className="btn-ghost w-full" onClick={() => addLink('producer-vouch')}>{T.common.add}</button>
            </>
          )}

          <p className="mt-3 text-[11px] text-muted">{T.evidence.authorityNote}</p>
        </div>
      )}

      {/* submitted evidence */}
      {evidence.length > 0 && (
        <div className="card mb-4">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{T.evidence.collected}</p>
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-surface2 px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-ink/90">{e.value || e.evidence_type} <span className="font-mono text-[10px] text-faint">· {e.source_type}</span></span>
                <span className={`chip shrink-0 ${e.status === 'processed' ? 'bg-[rgba(190,226,78,0.10)] text-[#CBEE72]' : 'bg-white/[0.05] text-muted'}`}>
                  {e.status === 'processed' ? T.evidence.processed : T.evidence.pending}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* processing — skeleton shimmer, never a bare spinner */}
      {processing && (
        <div className="card mb-4" role="status" aria-live="polite">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            AI is labeling your evidence
          </p>
          <p className="mb-3 text-xs text-muted">Nothing publishes without you — every claim waits for your confirmation.</p>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-white/[0.06] bg-surface2 px-3 py-3">
                <div className="mb-2 h-3 w-2/3 rounded bg-white/[0.08]" />
                <div className="h-2.5 w-1/3 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* resulting claims */}
      {!processing && claims.length > 0 && (
        <div className="card mb-4">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{T.evidence.results}</p>
          <ul className="space-y-2">
            {claims.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-surface2 px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-ink/90">{c.value || c.claim_type}</span>
                <SourceLabel status={c.verification_status} methodLabel={c.method_label} expiresAt={c.expires_at} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn-primary w-full" onClick={process} disabled={processing || pending === 0}>
        {processing ? <><Spinner /> {T.evidence.processing}</> : `${T.evidence.process}${pending ? ` (${pending})` : ''}`}
      </button>
    </PageShell>
  )
}
