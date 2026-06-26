import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listProfileItems, upsertArtist, listClaims } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, EmptyState, SourceLabel, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Plain, non-shaming next-actions. FIREWALL: never a score/grade/%/rank.
function buildSuggestions(artist, items, claims) {
  const s = []
  const links = items.filter((i) => i.item_type === 'link')
  const exp = items.filter((i) => !['link'].includes(i.item_type))
  if (!artist.photo_url) s.push('הוסף תמונה מקצועית')
  if (links.length === 0) s.push('הוסף קישור לסט (סאונדקלאוד / יוטיוב)')
  if (exp.length < 3) s.push('הוסף עוד הופעה או שיתוף פעולה')
  if (!artist.lineup_frequency_band) s.push('הוסף את תדירות ההופעות שלך')
  if (artist.sells_tickets == null) s.push('סמן אם אתה מוכר כרטיסים בעצמך')
  if (claims.filter((c) => c.verification_status === 'verified').length === 0)
    s.push('העלה הוכחה (אקספורט כרטיסים / קישור) כדי לאמת פרט')
  return s
}

function DashHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <Wordmark />
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Link to="/settings" className="text-sm text-muted hover:text-soft">הגדרות</Link>
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

  async function load() {
    const a = await getMyArtist(user.id)
    setArtist(a)
    if (a) {
      setItems(await listProfileItems(a.id))
      setClaims(await listClaims(a.id))
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [user.id])

  async function togglePublish() {
    const updated = await upsertArtist({ ...artist, published: !artist.published })
    setArtist(updated)
  }

  if (loading) return <Loading />
  if (!artist || !artist.stage_name) {
    return (
      <PageShell>
        <DashHeader />
        <EmptyState title={T.dashboard.empty}
          action={<Link to="/onboarding" className="btn-primary">{T.common.continue}</Link>} />
      </PageShell>
    )
  }

  const suggestions = buildSuggestions(artist, items, claims)

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

      {/* publish toggle */}
      <div className="card mb-4 flex items-center justify-between">
        <span className="text-soft">{artist.published ? T.dashboard.publishOn : T.dashboard.publishOff}</span>
        <button onClick={togglePublish}
          className={`chip px-4 py-2 ${artist.published ? 'bg-ok/20 text-ok' : 'bg-surface text-muted'}`}>
          {artist.published ? 'פעיל' : 'כבוי'}
        </button>
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
          <p className="font-bold text-soft mb-3">ההוכחות שלך</p>
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

      <div className="flex flex-col gap-3">
        <Link to={`/evidence/${artist.id}`} className="btn-ghost">הוסף / עבד הוכחות</Link>
        <Link to="/artist/claims" className="btn-ghost">{T.dashboard.reviewClaims}</Link>
        <Link to="/onboarding" className="btn-ghost">ערוך פרופיל</Link>
        <Link to="/artist/readiness" className="btn-ghost">מצב מוכנות (פרטי)</Link>
        <Link to={`/passport/${artist.id}`} className="btn-primary">{T.dashboard.viewPublic}</Link>
      </div>
    </PageShell>
  )

}
