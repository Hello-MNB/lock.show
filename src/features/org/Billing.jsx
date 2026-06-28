import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getSubscription, addSeats } from '../../lib/orgs.js'
import { PageShell, Wordmark, Spinner, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const planLabel = (plan, T) => ({ solo: T.org.planSolo, agency: T.org.planAgency, agency_plus: T.org.planAgencyPlus }[plan] || plan)
const statusLabel = (s, T) => ({ active: T.org.subActive, trialing: T.org.subTrialing, past_due: T.org.subPastDue, canceled: T.org.subCanceled }[s] || s)

// O6 — Billing & seats. Manual (no Stripe). owner-only writes.
export default function Billing() {
  const { T } = useLang()
  const { activeOrgId, isOwner, reload } = useOrg()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!activeOrgId) { setLoading(false); return }
    try { setSub(await getSubscription(activeOrgId)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [activeOrgId])

  async function more() { setBusy(true); try { await addSeats(activeOrgId, 1); await load(); await reload() } finally { setBusy(false) } }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6"><Wordmark /><Link to="/" className="text-sm text-muted">{T.common.back}</Link></div>
      <h1 className="text-xl font-bold text-soft mb-4">{T.org.billingTitle}</h1>

      <div className="card mb-2 space-y-2 text-sm">
        <Row label={T.org.planLabel} value={planLabel(sub?.plan, T)} />
        <Row label={T.org.seatsIncluded} value={sub?.seats_included ?? 1} />
        <Row label={T.org.seatsUsed} value={sub?.seats_used ?? 1} />
        <Row label={T.org.paymentStatus} value={statusLabel(sub?.status, T)} />
        {sub?.current_period_end && <Row label={T.org.periodEnd} value={new Date(sub.current_period_end).toLocaleDateString()} />}
      </div>
      <p className="text-xs text-muted mb-4">{T.org.manualNote}</p>

      {isOwner ? (
        <div className="flex flex-col gap-2">
          <button className="btn-ghost" onClick={more} disabled={busy}>{busy ? <Spinner /> : T.org.manageSeats}</button>
          <button className="btn-ghost opacity-60" disabled>{T.org.updatePayment}</button>
        </div>
      ) : (
        <p className="text-xs text-muted">{T.org.ownerOnly}</p>
      )}
    </PageShell>
  )
}

function Row({ label, value }) {
  return (<div className="flex justify-between"><span className="text-muted">{label}</span><span className="text-soft font-medium">{value}</span></div>)
}
