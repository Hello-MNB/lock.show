import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getArtist, addEvidence, listEvidence, listClaims } from '../../lib/db.js'
import { uploadFile } from '../../lib/storage.js'
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

  // band-entry form
  const [band, setBand] = useState('')
  const [bandUrl, setBandUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  async function load() {
    const a = await getArtist(artistId); setArtist(a)
    setEvidence(await listEvidence(artistId))
    setClaims(await listClaims(artistId))
    setLoading(false)
  }
  useEffect(() => { load() }, [artistId])

  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return
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
      const res = await fetch('/api/process-evidence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || T.common.error)
      await load()
    } catch (err) { setError(err.message) } finally { setProcessing(false) }
  }

  if (loading) return <Loading />

  const pending = evidence.filter((e) => e.status === 'submitted').length

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted">חזרה</Link>
      </div>
      <h1 className="text-xl font-bold text-soft mb-1">{T.evidence.title}</h1>
      <p className="text-sm text-muted mb-4">{T.evidence.subtitle}</p>
      <ErrorNote>{error}</ErrorNote>

      {/* Path A — upload file */}
      <div className="card mb-3">
        <p className="font-bold text-soft mb-2">{T.evidence.uploadFile}</p>
        <input type="file" onChange={onFile} className="text-sm text-muted" />
        {uploading && <Spinner className="mr-2" />}
      </div>

      {/* Path C — band + public ref */}
      <div className="card mb-3">
        <p className="font-bold text-soft mb-2">{T.evidence.bandEntry}</p>
        <Field label={T.onboarding.freqBand}>
          <div className="flex flex-wrap gap-2">
            {BANDS.frequency.map((o) => (
              <button key={o} onClick={() => setBand(o)}
                className={`chip px-3 py-2 ${band === o ? 'bg-accent text-ink' : 'bg-surface text-soft'}`}>{o}</button>
            ))}
          </div>
        </Field>
        <Field label={T.evidence.publicUrl}>
          <input className="field" dir="ltr" value={bandUrl} onChange={(e) => setBandUrl(e.target.value)} placeholder="https://…" />
        </Field>
        <button className="btn-ghost w-full" onClick={addBand}>הוסף</button>
      </div>

      {/* Path B — connect (deferred) */}
      <div className="card mb-4 opacity-60">
        <p className="font-bold text-soft">{T.evidence.connect}</p>
        <p className="text-xs text-muted">חיבור OAuth יתווסף בהמשך — בינתיים העלאה / טווח.</p>
      </div>

      {/* submitted evidence */}
      {evidence.length > 0 && (
        <div className="card mb-4">
          <p className="font-bold text-soft mb-2">ראיות שנאספו</p>
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-soft">{e.value || e.evidence_type} · {e.source_type}</span>
                <span className={`chip ${e.status === 'processed' ? 'bg-ok/15 text-ok' : 'bg-surface text-muted'}`}>
                  {e.status === 'processed' ? 'עובד' : 'ממתין'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* resulting claims */}
      {claims.length > 0 && (
        <div className="card mb-4">
          <p className="font-bold text-soft mb-2">תוצאות התיוג</p>
          <ul className="space-y-2">
            {claims.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-soft">{c.value || c.claim_type}</span>
                <SourceLabel status={c.verification_status} />
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
