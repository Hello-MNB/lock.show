import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listClaims, updateClaimVisibility } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, EmptyState, SourceLabel } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

export default function ClaimReview() {
  const { T } = useLang()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [claims, setClaims] = useState([])
  const [toggling, setToggling] = useState(null)

  async function load() {
    const a = await getMyArtist(user.id)
    setArtist(a)
    if (a) setClaims(await listClaims(a.id))
    setLoading(false)
  }
  useEffect(() => { load() }, [user.id])

  async function toggle(claim) {
    if (toggling) return
    setToggling(claim.id)
    try {
      const next = claim.visibility === 'passport-ok' ? 'mirror-only' : 'passport-ok'
      await updateClaimVisibility(claim.id, next)
      logEvent(EVENTS.CLAIM_VISIBILITY_CHANGED, { claim_id: claim.id, from: claim.visibility, to: next })
      setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, visibility: next } : c))
    } finally { setToggling(null) }
  }

  if (loading) return <Loading />
  if (!artist) return (
    <PageShell>
      <Wordmark className="mb-6" />
      <EmptyState title={T.dashboard.empty} action={<Link to="/onboarding" className="btn-primary">{T.common.continue}</Link>} />
    </PageShell>
  )

  const passportOk = claims.filter((c) => c.visibility === 'passport-ok')
  const mirrorOnly = claims.filter((c) => c.visibility !== 'passport-ok')

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <Link to="/artist/home" className="text-sm text-muted">{T.common.back}</Link>
      </div>

      <h1 className="text-xl font-bold text-soft mb-1">{T.claims.title}</h1>
      <p className="text-sm text-muted mb-4">{T.claims.subtitle}</p>

      {claims.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-muted">{T.claims.noClaimsYet}</p>
          <Link to={`/evidence/${artist.id}`} className="btn-primary mt-4 inline-block">{T.evidence.title}</Link>
        </div>
      )}

      {/* Passport-ok claims */}
      {passportOk.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ok mb-2">{T.claims.passportOk} ({passportOk.length})</p>
          <div className="space-y-2">
            {passportOk.map((c) => <ClaimRow key={c.id} claim={c} onToggle={toggle} toggling={toggling} T={T} />)}
          </div>
        </div>
      )}

      {/* Mirror-only claims */}
      {mirrorOnly.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">{T.claims.mirrorOnly} ({mirrorOnly.length})</p>
          <div className="space-y-2">
            {mirrorOnly.map((c) => <ClaimRow key={c.id} claim={c} onToggle={toggle} toggling={toggling} T={T} />)}
          </div>
        </div>
      )}

      {claims.length > 0 && (
        <Link to={`/passport/${artist.id}`} className="btn-primary w-full mt-4 block text-center">
          {T.dashboard.viewPublic}
        </Link>
      )}
    </PageShell>
  )
}

function ClaimRow({ claim, onToggle, toggling, T }) {
  const isPassportOk = claim.visibility === 'passport-ok'
  const busy = toggling === claim.id

  return (
    <div className={`card flex items-center justify-between gap-3 transition ${busy ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-soft text-sm font-medium truncate">{claim.value || claim.claim_type}</p>
        <div className="flex items-center gap-2 mt-1">
          <SourceLabel status={claim.verification_status} />
          {claim.reason_code && <span className="text-xs text-muted truncate">{claim.reason_code}</span>}
        </div>
      </div>
      <button
        onClick={() => onToggle(claim)}
        disabled={busy}
        className={`chip shrink-0 px-3 py-1.5 text-xs font-bold transition ${
          isPassportOk
            ? 'bg-ok/20 text-ok hover:bg-ok/30'
            : 'bg-surface text-muted hover:bg-line'
        }`}
      >
        {isPassportOk ? T.claims.passportOk : T.claims.mirrorOnly}
      </button>
    </div>
  )
}
