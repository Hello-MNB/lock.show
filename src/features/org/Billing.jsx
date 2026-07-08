import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getSubscription, addSeats } from '../../lib/orgs.js'
import { PageShell, Spinner, Loading, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const planLabel = (plan, T) => ({ solo: T.org.planSolo, agency: T.org.planAgency, agency_plus: T.org.planAgencyPlus }[plan] || plan)
const statusLabel = (s, T) => ({ active: T.org.subActive, trialing: T.org.subTrialing, past_due: T.org.subPastDue, canceled: T.org.subCanceled }[s] || s)

// O6 — Billing & seats. Manual (no Stripe). owner-only writes.
// No dead buttons: payment updates are handled by the operator during the pilot.
export default function Billing() {
  const { T } = useLang()
  const toast = useToast()
  const { activeOrgId, isOwner, reload } = useOrg()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!activeOrgId) { setLoading(false); return }
    try { setSub(await getSubscription(activeOrgId)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [activeOrgId])

  async function more() {
    setBusy(true)
    try {
      await addSeats(activeOrgId, 1)
      await load(); await reload()
      toast.show('Seat added — billing is settled manually with the operator')
    } finally { setBusy(false) }
  }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-end mb-6"><Link to="/" className="text-sm text-muted hover:text-ink">{T.common.back}</Link></div>
      <h1 className="font-display text-xl font-bold text-ink mb-4">{T.org.billingTitle}</h1>

      <div className="card mb-2 space-y-2 text-sm">
        <Row label={T.org.planLabel} value={planLabel(sub?.plan, T)} />
        <Row label={T.org.seatsIncluded} value={sub?.seats_included ?? 1} mono />
        <Row label={T.org.seatsUsed} value={sub?.seats_used ?? 1} mono />
        <Row label={T.org.paymentStatus} value={statusLabel(sub?.status, T)} />
        {sub?.current_period_end && <Row label={T.org.periodEnd} value={new Date(sub.current_period_end).toLocaleDateString()} mono />}
      </div>
      <p className="text-xs text-muted mb-4">{T.org.manualNote}</p>

      {isOwner ? (
        <div className="flex flex-col gap-2">
          <button className="btn-ghost" onClick={more} disabled={busy}>{busy ? <Spinner /> : `${T.org.addSeats} (+1)`}</button>
          <p className="text-xs text-muted">Adds one seat right away — no card is charged; billing is settled manually with the operator during the pilot.</p>
          <p className="mt-2 border-t border-line pt-3 text-xs text-muted">
            Manual billing during pilot — the operator activates payments.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">{T.org.ownerOnly}</p>
      )}
    </PageShell>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium text-ink ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</span>
    </div>
  )
}
