import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getSubscription, requestUpgrade } from '../../lib/orgs.js'
import { PageShell, Spinner, ErrorNote, Loading, BottomSheet } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// O5 — Plan comparison + upgrade request (manual pilot, no auto-billing).
// Firewall: no score / rank / guarantee in feature copy.
export default function UpgradePlan() {
  const { T } = useLang()
  const { activeOrgId, isOwner, plan } = useOrg()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [requested, setRequested] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { (async () => {
    if (!activeOrgId) { setLoading(false); return }
    try { setSub(await getSubscription(activeOrgId)) } finally { setLoading(false) }
  })() }, [activeOrgId])

  async function upgrade() {
    setBusy(true); setError('')
    try { await requestUpgrade(activeOrgId); setRequested(true); setShowModal(true) }
    catch (e) { setError(e.message || T.common.error) }
    finally { setBusy(false) }
  }

  if (loading) return <Loading />

  const pending = requested || sub?.status === 'trialing'

  const PLANS = [
    { key: 'solo',        label: T.org.planSolo,       desc: T.org.planSoloDesc,       features: [true,  true,  false, false, false, false] },
    { key: 'agency',      label: T.org.planAgency,     desc: T.org.planAgencyDesc,     features: [true,  true,  true,  true,  true,  false] },
    { key: 'agency_plus', label: T.org.planAgencyPlus, desc: T.org.planAgencyPlusDesc, features: [true,  true,  true,  true,  true,  true]  },
  ]
  const FEATURES = [
    T.org.featurePassport,
    T.org.featureEvidence,
    T.org.featureRoster,
    T.org.featureSeats,
    T.org.featureRadar,
    T.org.featurePriority,
  ]

  return (
    <PageShell>
      <div className="flex items-center justify-end mb-6">
        <Link to="/" className="text-sm text-muted hover:text-ink">{T.common.back}</Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink mb-1">{T.org.planCompareTitle}</h1>
      <p className="text-xs text-muted mb-1">{T.org.manualNote}</p>
      {/* why there is no price on this page — honest, not evasive */}
      <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-gold mb-5">Pricing on request · we'll contact you</p>
      <ErrorNote>{error}</ErrorNote>

      {/* Plan comparison grid */}
      <div className="card mb-4 overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-start pb-3 pe-3 w-2/5" />
              {PLANS.map((p) => (
                <th key={p.key} className="pb-3 px-2 text-center align-top">
                  <div className={`font-bold text-base ${plan === p.key ? 'text-accent' : 'text-ink'}`}>{p.label}</div>
                  <div className="text-xs text-muted font-normal mt-0.5">{p.desc}</div>
                  {plan === p.key && (
                    <div className="mt-1">
                      <span className="chip bg-accent/15 text-accent text-[10px]">{T.org.currentBadge}</span>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40">
            {FEATURES.map((feat, i) => (
              <tr key={i}>
                <td className="py-2.5 pe-3 text-ink text-xs">{feat}</td>
                {PLANS.map((p) => (
                  <td key={p.key} className="py-2.5 px-2 text-center">
                    {p.features[i]
                      ? <span className="text-accent font-bold text-base" aria-label="included">✓</span>
                      : <span className="text-muted text-lg" aria-label="not included">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isOwner ? (
        <p className="text-xs text-muted">{T.org.ownerOnly}</p>
      ) : pending ? (
        <div className="card border border-amber/40">
          <p className="text-amber font-bold">{T.org.upgradePendingPay}</p>
          <p className="mt-1 text-xs text-muted">Pricing on request · we'll contact you</p>
        </div>
      ) : plan === 'agency_plus' ? (
        <Link to="/org/billing" className="btn-ghost w-full block text-center">{T.org.addSeats}</Link>
      ) : (
        <button className="btn-primary w-full" onClick={upgrade} disabled={busy}>
          {busy ? <Spinner /> : T.org.upgradePlanCta}
        </button>
      )}

      <BottomSheet open={showModal} onClose={() => setShowModal(false)} title={T.org.notifyTitle}>
        <p className="text-sm text-ink mb-2">{T.org.notifyBody}</p>
        <p className="text-xs text-muted mb-4">Pricing on request — we'll contact you to agree terms before anything is charged.</p>
        <button className="btn-primary w-full" onClick={() => setShowModal(false)}>{T.org.notifyDismiss}</button>
      </BottomSheet>
    </PageShell>
  )
}
