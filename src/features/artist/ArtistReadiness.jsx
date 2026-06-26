import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listProfileItems, listClaims } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, StatusChip, EmptyState } from '../../components/ui.jsx'

// Internal readiness. Computes a bounded status per axis. FIREWALL:
// a 0–100 may exist internally but is NEVER displayed — only חזק/מתפתח/חסר/לא ניתן.
function axisStatus(score) {
  if (score == null) return 'notAssessable'
  if (score >= 70) return 'strong'
  if (score >= 35) return 'developing'
  return 'missing'
}

export default function ArtistReadiness() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    (async () => {
      const a = await getMyArtist(user.id)
      if (!a) { setLoading(false); return }
      const items = await listProfileItems(a.id)
      const claims = await listClaims(a.id)
      const exp = items.filter((i) => !['link'].includes(i.item_type))
      const links = items.filter((i) => i.item_type === 'link')
      const verified = claims.filter((c) => c.verification_status === 'verified').length

      const axes = [
        {
          key: 'draw', label: 'הוכחת משיכה',
          score: (a.lineup_frequency_band ? 35 : 0) + (a.sells_tickets ? 35 : 0) + (verified ? 30 : 0),
          next: !a.lineup_frequency_band ? 'הוסף תדירות הופעות' : (verified ? 'הוכחה מאומתת קיימת' : 'העלה הוכחה לאימות'),
        },
        {
          key: 'track', label: 'ניסיון מקצועי',
          score: Math.min(100, exp.length * 25),
          next: exp.length < 3 ? 'הוסף עוד הופעה / שיתוף פעולה' : 'בסיס טוב',
        },
        {
          key: 'reach', label: 'נוכחות וקישורים',
          score: Math.min(100, links.length * 34),
          next: links.length === 0 ? 'הוסף קישור לסט' : 'נוכחות קיימת',
        },
        {
          key: 'ready', label: 'מוכנות להזמנה',
          score: (a.set_length ? 40 : 0) + (a.regions ? 30 : 0) + (a.invoice_ready ? 30 : 0),
          next: !a.invoice_ready ? 'הפעל חשבונית (עוסק מורשה)' : 'מוכן',
        },
      ]
      // single most-impactful next action = lowest-scoring axis
      const weakest = [...axes].sort((x, y) => x.score - y.score)[0]
      setData({ a, axes, nextAction: weakest?.next })
      setLoading(false)
    })()
  }, [user.id])

  if (loading) return <Loading />
  if (!data) return (
    <PageShell><Wordmark className="mb-6" />
      <EmptyState title="הוסף הוכחות כדי להעריך"
        action={<Link to="/onboarding" className="btn-primary">בנה פרופיל</Link>} /></PageShell>
  )

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted">חזרה</Link>
      </div>
      <h1 className="text-xl font-bold text-soft mb-1">מצב מוכנות</h1>
      <p className="text-sm text-muted mb-4">תצוגה פרטית — לא נראית למזמינים.</p>

      <div className="space-y-3 mb-6">
        {data.axes.map((ax) => (
          <div key={ax.key} className="card flex items-center justify-between">
            <div>
              <p className="font-bold text-soft">{ax.label}</p>
              <p className="text-xs text-muted">{ax.next}</p>
            </div>
            <StatusChip status={axisStatus(ax.score)} />
          </div>
        ))}
      </div>

      <div className="card bg-accent/10 border-accent/30">
        <p className="text-sm text-muted mb-1">הצעד הבא שלך</p>
        <p className="font-bold text-soft">{data.nextAction}</p>
      </div>
    </PageShell>
  )
}
