import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getArtist, addEvidence, listEvidence, listClaims, hasConsent, recordConsentScope, processEvidence } from '../../lib/db.js'
import { uploadFile } from '../../lib/storage.js'
import { EVIDENCE, evidenceFileError } from '../../lib/constants.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading, SourceLabel } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

export default function EvidenceCapture() {
  const { T, BANDS } = useLang()
  const { artistId } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [claims, setClaims] = useState([])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  // Third-party evidence consent gate (collected inline here, not upfront).
  const [evConsent, setEvConsent] = useState(false)
  const [consentBusy, setConsentBusy] = useState(false)

  // band-entry form
  const [band, setBand] = useState('')
  const [bandUrl, setBandUrl] = useState('')
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

  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return
    const bad = evidenceFileError(file)
    if (bad) { setError(bad === 'size' ? T.evidence.errFileSize : T.evidence.errFileType); e.target.value = ''; return }
    setUploading(true); setError('')
    try {
      const { url } = await uploadFile('evidence', user.id, file)
      await addEvidence({ artist_id: artistId, evidence_type: 'file', source_type: 'ticket-export', file_url: url, value: file.name })
      await load()
    } catch (err) { setError(err.message) } finally { setUploading(false) }
  }

  async function addBand() {
    if (!band) return
    setError('')
    try {
      await addEvidence({
        artist_id: artistId, evidence_type: 'band',
        source_type: bandUrl ? 'public-profile' : 'self-band',
        value: band, public_url: bandUrl || null,
      })
      setBand(''); setBandUrl(''); await load()
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
        <div className="flex items-center justify-between mb-6">
          <Wordmark /><Link to="/artist/home" className="text-sm text-muted">{T.common.back}</Link>
        </div>
        <h1 className="text-xl font-bold text-soft mb-1">{T.evidence.title}</h1>
        <ErrorNote>{error}</ErrorNote>
        <div className="card">
          <p className="font-bold text-soft mb-1">{T.consent.evidenceTitle}</p>
          <p className="text-sm text-muted mb-4">{T.consent.evidence}</p>
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
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted">{T.common.back}</Link>
      </div>
      <h1 className="text-xl font-bold text-soft mb-1">{T.evidence.title}</h1>
      <p className="text-sm text-muted mb-4">{T.evidence.subtitle}</p>
      <ErrorNote>{error}</ErrorNote>

      {/* Path A — upload file */}
      <div className="card mb-3">
        <p className="font-bold text-soft mb-2">{T.evidence.uploadFile}</p>
        <input type="file" accept={EVIDENCE.ACCEPT} onChange={onFile} className="text-sm text-muted" />
        <p className="text-xs text-muted mt-1">{T.evidence.fileHint}</p>
        {uploading && <Spinner className="mr-2" />}
      </div>

      {/* Path C — band + public ref */}
      <div className="card mb-3">
        <p className="font-bold text-soft mb-2">{T.evidence.bandEntry}</p>
        <Field label={T.onboarding.freqBand}>
          <div className="flex flex-wrap gap-2">
            {BANDS.frequency.map((o) => (
              <button key={o} onClick={() => setBand(o)}
                className={`chip min-h-[44px] px-4 py-2 ${band === o ? 'bg-accent text-ink' : 'bg-surface text-soft'}`}>{o}</button>
            ))}
          </div>
        </Field>
        <Field label={T.evidence.publicUrl}>
          <input className="field" dir="ltr" value={bandUrl} onChange={(e) => setBandUrl(e.target.value)} placeholder="https://…" />
        </Field>
        <button className="btn-ghost w-full" onClick={addBand}>{T.common.add}</button>
      </div>

      {/* Path B — connect account (Phase 2: OAuth ticketing/social auto-import) */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-soft">{T.evidence.connect}</p>
          <span className="chip bg-surface text-muted text-xs">{T.common.comingSoon}</span>
        </div>
        <p className="text-xs text-muted mt-1">{T.evidence.connectNote}</p>
      </div>

      {/* submitted evidence */}
      {evidence.length > 0 && (
        <div className="card mb-4">
          <p className="font-bold text-soft mb-2">{T.evidence.collected}</p>
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-soft">{e.value || e.evidence_type} · {e.source_type}</span>
                <span className={`chip ${e.status === 'processed' ? 'bg-ok/15 text-ok' : 'bg-surface text-muted'}`}>
                  {e.status === 'processed' ? T.evidence.processed : T.evidence.pending}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* resulting claims */}
      {claims.length > 0 && (
        <div className="card mb-4">
          <p className="font-bold text-soft mb-2">{T.evidence.results}</p>
          <ul className="space-y-2">
            {claims.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-soft">{c.value || c.claim_type}</span>
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
