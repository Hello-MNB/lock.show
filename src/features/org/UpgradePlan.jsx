import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getSubscription, requestUpgrade } from '../../lib/orgs.js'
import { PageShell, Wordmark, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const planLabel = (plan, T) => ({ solo: T.org.planSolo, agency: T.org.planAgency, agency_plus: T.org.planAgencyPlus }[plan] || plan)

// O5 — Upgrade to booking agency (manual pilot → pending → founder confirms).
export default function UpgradePlan() {
  const { T } = useLang()
  const { activeOrgId, isOwner, plan } = useOrg()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [requested, setRequested] = useState(false)

  useEffect(() => { (async () => {
    if (!activeOrgId) { setLoading(false); return }
    try { setSub(await getSubscription(activeOrgId)) } finally { setLoading(false) }
  })() }, [activeOrgId])

  async function upgrade() {
    setBusy(true); setError('')
    try { await requestUpgrade(activeOrgId); setRequested(true) } catch (e) { setError(e.message || T.common.error) } finally { setBusy(false) }
  }

  if (loading) return <Loading />
  const pending = requested || sub?.status === 'trialing'

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6"><Wordmark /><Link to="/" className="text-sm text-muted">{T.common.back}</Link></div>
      <h1 className="text-xl font-bold text-soft mb-4">{T.org.upgradeTitle}</h1>
      <ErrorNote>{error}</ErrorNote>

      <div className="card mb-4">
        <p className="text-sm text-muted">{T.org.currentPlan}</p>
        <p className="text-lg font-bold text-soft">{planLabel(plan, T)}</p>
      </div>

      <div className="card mb-4">
        <p className="font-bold text-soft mb-3">{T.org.unlocksTitle}</p>
        <ul className="space-y-2 text-sm text-soft">
          <li className="flex gap-2"><span className="text-accent">›</span>{T.org.unlockSeats}</li>
          <li className="flex gap-2"><span className="text-accent">›</span>{T.org.unlockRoster}</li>
          <li className="flex gap-2"><span className="text-accent">›</span>{T.org.unlockRadar}</li>
        </ul>
      </div>

      {!isOwner ? (
        <p className="text-xs text-muted">{T.org.ownerOnly}</p>
      ) : pending ? (
        <div className="card border border-warn/30 bg-warn/10"><p className="text-warn font-bold"><span aria-hidden="true">⏳ </span>{T.org.upgradePendingPay}</p></div>
      ) : plan === 'solo' ? (
        <button className="btn-primary w-full" onClick={upgrade} disabled={busy}>{busy ? <Spinner /> : T.org.upgradeCta}</button>
      ) : (
        <Link to="/org/billing" className="btn-ghost w-full block text-center">{T.org.addSeats}</Link>
      )}
    </PageShell>
  )
}
