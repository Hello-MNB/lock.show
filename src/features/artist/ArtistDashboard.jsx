import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listProfileItems, listClaims, publishPassport, unpublishArtist, hasConsent, recordConsentScope, getEntitlement } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, EmptyState, ErrorState, SourceLabel, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { isPassportDirty, clearPassportDirty } from '../../lib/passportState.js'

// Plain, non-shaming next-actions. FIREWALL: never a score/grade/%/rank.
function buildSuggestions(artist, items, claims, T) {
  const S = T.dashboard.suggestions
  const s = []
  const links = items.filter((i) => i.item_type === 'link')
  const exp = items.filter((i) => !['link'].includes(i.item_type))
  if (!artist.photo_url) s.push(S.addPhoto)
  if (links.length === 0) s.push(S.addLink)
  if (exp.length < 3) s.push(S.addExperience)
  if (!artist.lineup_frequency_band) s.push(S.addFrequency)
  if (artist.sells_tickets == null) s.push(S.markTickets)
  if (claims.filter((c) => c.verification_status === 'verified').length === 0)
    s.push(S.uploadProof)
  return s
}

function DashHeader() {
  const { T } = useLang()
  return (
    <div className="flex items-center justify-between mb-6">
      <Wordmark />
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Link to="/settings" className="text-sm text-muted hover:text-soft">{T.dashboard.settings}</Link>
      </div>
    </div>
  )
}

export default function ArtistDashboard() {
  const { T } = useLang()
  const { user } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [ent, setEnt] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [pubError, setPubError] = useState('')
  const [loadError, setLoadError] = useState(false)
  const [needPubConsent, setNeedPubConsent] = useState(false)
  const [dirty, setDirty] = useState(false)

  async function load() {
    setLoadError(false)
    try {
      const a = await getMyArtist(user.id)
      setArtist(a)
      if (a) {
        setItems(await listProfileItems(a.id))
        setClaims(await listClaims(a.id))
        setEnt(await getEntitlement(a.id))
        setDirty(isPassportDirty(a.id))
      }
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  async function togglePublish() {
    if (publishing) return
    setPubError('')
    if (artist.published) {
      setPublishing(true)
      try {
        const updated = await unpublishArtist(artist)
        setArtist(updated)
      } catch (e) {
        setPubError(T.dashboard.publishError)
      } finally {
        setPublishing(false)
      }
      return
    }
    // Publishing on: require public-publish consent first (once).
    setPublishing(true)
    const ok = await hasConsent(user.id, 'public-publish')
    setPublishing(false)
    if (!ok) { setNeedPubConsent(true); return }
    await doPublish()
  }

  async function doPublish() {
    setPublishing(true)
    try {
      await publishPassport(artist.id) // server writes the immutable snapshot
      setArtist({ ...artist, published: true })
      clearPassportDirty(artist.id); setDirty(false)
    } catch (e) {
      setPubError(T.dashboard.publishError)
    } finally {
      setPublishing(false)
    }
  }

  async function agreeAndPublish() {
    try { await recordConsentScope(user.id, 'public-publish') } catch { /* non-blocking */ }
    setNeedPubConsent(false)
    await doPublish()
  }

  // Re-snapshot so visibility/claim edits reach the public Passport.
  async function refreshPublic() {
    if (publishing) return
    setPubError('')
    setPublishing(true)
    try {
      await publishPassport(artist.id)
      clearPassportDirty(artist.id); setDirty(false)
    } catch (e) {
      setPubError(T.dashboard.publishError)
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <Loading />
  if (loadError) return <PageShell><DashHeader /><ErrorState title={T.common.error} onRetry={() => { setLoading(true); load() }} /></PageShell>
  if (!artist || !artist.stage_name) {
    return (
      <PageShell>
        <DashHeader />
        <EmptyState title={T.dashboard.empty}
          action={<Link to="/onboarding" className="btn-primary">{T.common.continue}</Link>} />
      </PageShell>
    )
  }

  const suggestions = buildSuggestions(artist, items, claims, T)

  return (
    <PageShell>
      <DashHeader />
      <h1 className="text-xl font-bold text-soft mb-4">{T.dashboard.title}</h1>

      <div className="card mb-4 flex items-center gap-4">
        {artist.photo_url
          ? <img src={artist.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          : <div className="h-16 w-16 rounded-full bg-surface" />}
        <div>
          <p className="text-lg font-bold text-soft">{artist.stage_name}</p>
          <p className="text-sm text-muted">{artist.genre} · {artist.city}</p>
        </div>
      </div>

      {/* A8 Founding Passport entitlement — persistent status banner (never a dead end) */}
      {ent?.status === 'active' ? (
        <div className="card mb-4 border-ok/30 bg-ok/10" role="status">
          <p className="font-bold text-ok"><span aria-hidden="true">🌐</span> {T.offer.activeTitle}</p>
        </div>
      ) : ent?.status === 'pending' ? (
        <div className="card mb-4 border-warn/30 bg-warn/10" role="status">
          <p className="font-bold text-warn"><span aria-hidden="true">⏳</span> {T.offer.pendingTitle}</p>
          <p className="text-xs text-muted mt-1">{T.offer.pendingBody}</p>
        </div>
      ) : (
        <Link to="/artist/offer" className="card mb-4 block border-accent/30 bg-accent/10 hover:border-accent transition">
          <p className="font-bold text-accent">{T.offer.getPassport}</p>
          <p className="text-xs text-muted mt-1">{T.offer.price}</p>
        </Link>
      )}

      {/* publish toggle */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <span className="text-soft">{artist.published ? T.dashboard.publishOn : T.dashboard.publishOff}</span>
          <button onClick={togglePublish} disabled={publishing}
            className={`chip min-h-[40px] px-4 py-2 transition ${publishing ? 'opacity-60' : ''} ${artist.published ? 'bg-ok/20 text-ok' : 'bg-surface text-muted'}`}>
            {publishing ? T.dashboard.publishing : artist.published ? T.dashboard.statusActive : T.dashboard.statusOff}
          </button>
        </div>
        {needPubConsent && (
          <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-start">
            <p className="font-bold text-soft mb-1">{T.consent.publishTitle}</p>
            <p className="text-xs text-muted mb-3">{T.consent.publishBody}</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={agreeAndPublish} disabled={publishing}>{T.consent.publishAgree}</button>
              <button className="btn-ghost" onClick={() => setNeedPubConsent(false)} disabled={publishing}>{T.common.cancel}</button>
            </div>
          </div>
        )}
        {artist.published && (
          <>
            {dirty
              ? <p className="mt-3 text-xs font-bold text-warn"><span aria-hidden="true">⚠ </span>{T.dashboard.unpublishedBadge}</p>
              : <p className="mt-3 text-xs text-muted">{T.dashboard.publishedHint}</p>}
            <button onClick={refreshPublic} disabled={publishing}
              className={`mt-2 w-full text-sm ${dirty ? 'btn-primary' : 'btn-ghost'}`}>
              {T.dashboard.refreshPublic}
            </button>
          </>
        )}
        {pubError && <p className="mt-2 text-xs text-warn">{pubError}</p>}
      </div>

      {/* next-actions (Mirror — plain text, no score) */}
      {suggestions.length > 0 && (
        <div className="card mb-4">
          <p className="font-bold text-soft mb-3">{T.dashboard.suggestionsTitle}</p>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-soft">
                <span className="text-accent">›</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* claims summary (private mirror) */}
      {claims.length > 0 && (
        <div className="card mb-4">
          <p className="font-bold text-soft mb-1">{T.dashboard.claimsTitle}</p>
          <p className="text-xs text-muted mb-3">{T.dashboard.claimsAccuracyHint}</p>
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

      <div className="flex flex-col gap-3">
        <Link to={`/evidence/${artist.id}`} className="btn-ghost">{T.dashboard.addEvidence}</Link>
        <Link to="/artist/claims" className="btn-ghost">{T.dashboard.reviewClaims}</Link>
        <Link to="/onboarding" className="btn-ghost">{T.dashboard.editProfile}</Link>
        <Link to="/artist/readiness" className="btn-ghost">{T.dashboard.readiness}</Link>
        <Link to={`/passport/${artist.id}`} className="btn-primary">{T.dashboard.viewPublic}</Link>
      </div>
    </PageShell>
  )

}
