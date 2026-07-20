import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  adminListArtists, adminListRequests, adminListClaims, adminSetPublished,
  adminListPendingEntitlements, adminActivateEntitlement,
  adminListConsents, adminExportArtist, adminDeleteArtist, adminListAudit,
} from '../../lib/db.js'
import { listUpgradeRequests, approveUpgrade } from '../../lib/orgs.js'
import { fetchGateCounts, fetchRetention, fetchFunnelCounts, fetchAiRuns30d, FUNNEL_EVENTS, AI_RUN_STATUSES } from './gateCounts.js'
import { createNotification } from '../../lib/notifications.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import {
  PageShell, Loading, EmptyState, ErrorState, SourceLabel,
  BottomSheet,
} from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Operator / Admin console — platform oversight. Calm, dense, dark.
// FIREWALL: shows bounded statuses, bands and provenance only. The record
// COUNTS here are platform ops metadata, never a per-artist score / head-count.

const PAGE = 20

// Simple client-side pagination: show 20, then "Show more".
function usePaged(items) {
  const [n, setN] = useState(PAGE)
  return {
    slice: items.slice(0, n),
    hasMore: items.length > n,
    more: () => setN((x) => x + PAGE),
  }
}

function ShowMore({ paged, total }) {
  const { T } = useLang()
  if (!paged.hasMore) return null
  return (
    <button onClick={paged.more}
      className="btn-ghost w-full text-sm">
      {T.admin.showMore} <span className="font-mono text-xs text-faint">({paged.slice.length}/{total})</span>
    </button>
  )
}

export default function AdminDashboard() {
  const { T } = useLang()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artists, setArtists] = useState([])
  const [requests, setRequests] = useState([])
  const [claims, setClaims] = useState([])
  const [payments, setPayments] = useState([])
  const [consents, setConsents] = useState([])
  const [upgrades, setUpgrades] = useState([])
  const [audit, setAudit] = useState([])
  const [toggling, setToggling] = useState(null)
  const [actionError, setActionError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [busy, setBusy] = useState(false)
  // W4-1 — Gate tiles (§1.6 · §14.4): whole-funnel PRODUCT-EVENT counts.
  // Independent of the main load so a metrics hiccup never blanks the console —
  // the tiles get their own loading / error / retry states.
  const [gate, setGate] = useState({ loading: true, error: false, counts: null })

  const loadGate = useCallback(async () => {
    setGate((g) => ({ ...g, loading: true, error: false }))
    try {
      setGate({ loading: false, error: false, counts: await fetchGateCounts() })
    } catch {
      setGate({ loading: false, error: true, counts: null })
    }
  }, [])
  useEffect(() => { loadGate() }, [loadGate])

  // T-55 — retention tiles (§21.1 Retention family, owner priority 18 Jul):
  // returning accounts + repeat Passport opens. Same isolation contract as the
  // Gate tiles: own state, a metrics hiccup never blanks the console.
  const [ret, setRet] = useState({ loading: true, error: false, counts: null })
  const loadRet = useCallback(async () => {
    setRet((r) => ({ ...r, loading: true, error: false }))
    try {
      setRet({ loading: false, error: false, counts: await fetchRetention() })
    } catch {
      setRet({ loading: false, error: true, counts: null })
    }
  }, [])
  useEffect(() => { loadRet() }, [loadRet])

  // B5-a (T-81, §8.12) — PILOT FUNNEL: whole-funnel product-milestone counts
  // (signup → onboarded → radar → evidence → claim → published → shared →
  // requested). Same isolation contract as Gate/Retention: own state, a
  // metrics hiccup never blanks the console.
  const [funnel, setFunnel] = useState({ loading: true, error: false, counts: null })
  const loadFunnel = useCallback(async () => {
    setFunnel((f) => ({ ...f, loading: true, error: false }))
    try {
      setFunnel({ loading: false, error: false, counts: await fetchFunnelCounts() })
    } catch {
      setFunnel({ loading: false, error: true, counts: null })
    }
  }, [])
  useEffect(() => { loadFunnel() }, [loadFunnel])

  // B5-L (T-92, §8.12) — AI-COST LEDGER, owner ruling (a) "honest hybrid" (20
  // Jul): runs/30d is a REAL count from our own DB (processing_job, migration
  // 022). Spend is NOT computed here (no server-side cost read path exists —
  // server/** is out of this territory) and renders as a manually-tracked
  // line, never a number. Same isolation contract as Gate/Retention/Funnel:
  // own state, a metrics hiccup never blanks the console.
  const [aiCost, setAiCost] = useState({ loading: true, error: false, counts: null })
  const loadAiCost = useCallback(async () => {
    setAiCost((a) => ({ ...a, loading: true, error: false }))
    try {
      setAiCost({ loading: false, error: false, counts: await fetchAiRuns30d() })
    } catch {
      setAiCost({ loading: false, error: true, counts: null })
    }
  }, [])
  useEffect(() => { loadAiCost() }, [loadAiCost])

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const [a, r, c, p, cons, up, aud] = await Promise.all([
        adminListArtists(), adminListRequests(), adminListClaims(), adminListPendingEntitlements(),
        adminListConsents(), listUpgradeRequests(), adminListAudit(),
      ])
      setArtists(a); setRequests(r); setClaims(c); setPayments(p); setConsents(cons); setUpgrades(up); setAudit(aud)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { load() }, [load])

  const pagedArtists = usePaged(artists)
  const pagedRequests = usePaged(requests)
  const pagedClaims = usePaged(claims)
  const pagedConsents = usePaged(consents)
  const pagedAudit = usePaged(audit)

  async function togglePublished(artist) {
    if (toggling) return
    setActionError(''); setToggling(artist.id)
    try {
      const updated = await adminSetPublished(artist.id, !artist.published)
      setArtists((prev) => prev.map((x) => x.id === artist.id ? { ...x, published: updated.published } : x))
    } catch {
      setActionError(T.admin.actionError)
    } finally {
      setToggling(null)
    }
  }

  async function activate(id) {
    setActionError('')
    try {
      const payment = payments.find((p) => p.id === id)
      await adminActivateEntitlement(id)
      // GATE signal — someone PAID and the operator activated it (the second half
      // of the validation gate: one reacts AND one pays).
      logEvent(EVENTS.ENTITLEMENT_ACTIVATED, { artist_id: payment?.artist_id, entitlement_id: id })
      setPayments((prev) => prev.filter((p) => p.id !== id))
      loadGate() // the verified-pay tile reflects the activation immediately
      // P1-1 — fire-and-forget: a notification hiccup must never undo the activation.
      if (payment?.artist_id) {
        createNotification({
          artistId: payment.artist_id,
          type: 'system', // G11 — /api/notify accepts a closed type enum; operator notices ride 'system'
          body: T.notifications.paymentActivated,
          link: '/artist/home',
        })
      }
    } catch {
      setActionError(T.admin.actionError)
    }
  }

  // Founder confirms Solo→Agency on the SAME org (no migration): plan + seats flip.
  async function approve(orgId) {
    setActionError('')
    try {
      await approveUpgrade(orgId)
      setUpgrades((prev) => prev.filter((u) => u.organization_id !== orgId))
    } catch {
      setActionError(T.admin.actionError)
    }
  }

  // OP12 — export a subject's data (right to access / portability).
  async function exportArtist(a) {
    try {
      const data = await adminExportArtist(a.id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = `lock-${a.stage_name || a.id}.json`; link.click()
      URL.revokeObjectURL(url)
    } catch { setActionError(T.admin.actionError) }
  }

  // OP12 — erasure. Confirm + reason required; writes an audit row before delete.
  async function confirmDelete() {
    if (!deleteTarget || !deleteReason.trim()) return
    setBusy(true); setActionError('')
    try {
      await adminDeleteArtist(deleteTarget.id, deleteReason.trim())
      setArtists((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      setDeleteTarget(null); setDeleteReason('')
    } catch {
      setActionError(T.admin.actionError)
    } finally {
      setBusy(false)
    }
  }

  const statusLabel = (s) =>
    s === 'replied' ? T.agency.statusReplied : s === 'closed' ? T.agency.statusClosed : T.agency.statusNew

  const anchors = ['gate', 'funnel', 'payments', 'upgrades', 'artists', 'requests', 'claims', 'consents', 'audit']
    .map((id) => [id, T.admin.anchors[id]])

  // W4-1 Gate tiles — funnel order; each event stays its OWN number (§14.4.1:
  // a payment reference is INTENT and never merges into the verified-paid tile;
  // a passport view is context, NOT a reaction). Tags carry that meaning.
  const gateTiles = [
    { key: 'passport_view', label: T.admin.gateViews, tag: T.admin.gateTagContext },
    { key: 'professional_reaction_submitted', label: T.admin.gateReactions, tag: T.admin.gateTagReaction },
    { key: 'availability_request_created', label: T.admin.gateRequests, tag: T.admin.gateTagReaction },
    { key: 'payment_reference_created', label: T.admin.gateRefs, tag: T.admin.gateTagIntent },
    { key: 'entitlement_activated', label: T.admin.gateActivated, tag: T.admin.gateTagPaid },
  ]

  // B5-a — funnel stage labels, keyed off the canon FUNNEL_EVENTS order so the
  // rendered list can never drift from the source-of-truth event list.
  const funnelLabelByKey = {
    signup_completed: T.admin.funnelSignup,
    onboarding_completed: T.admin.funnelOnboarding,
    radar_opened: T.admin.funnelRadar,
    evidence_added: T.admin.funnelEvidence,
    claim_confirmed: T.admin.funnelClaim,
    passport_published: T.admin.funnelPublished,
    share_link_created: T.admin.funnelShared,
    availability_request_created: T.admin.funnelRequested,
  }
  const funnelStages = FUNNEL_EVENTS.map((key) => ({ key, label: funnelLabelByKey[key] }))
  // fill-bar denominator — the funnel's OWN max, never a per-person figure.
  const funnelMax = Math.max(1, ...FUNNEL_EVENTS.map((key) => funnel.counts?.[key] ?? 0))

  // B5-L (T-92, §8.12) — AI-cost ledger status-breakdown labels, keyed off the
  // canon AI_RUN_STATUSES order (the processing_job check-constraint values)
  // so the rendered line can never drift from the source-of-truth list.
  const aiStatusLabelByKey = {
    queued: T.admin.aiCostStatusQueued,
    running: T.admin.aiCostStatusRunning,
    completed: T.admin.aiCostStatusCompleted,
    failed: T.admin.aiCostStatusFailed,
  }

  return (
    <PageShell max="max-w-2xl">
      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{T.admin.eyebrow}</p>
      <h1 className="mb-1 text-2xl font-bold text-ink">{T.admin.title}</h1>
      <p className="mb-4 text-sm text-muted">{T.admin.subtitle}</p>

      {loading ? <Loading /> : error ? <ErrorState title={T.admin.loadError} onRetry={load} /> : (
        <>
          {/* sticky section nav — calm mono mini-tabs */}
          <nav aria-label="Sections"
            className="sticky top-0 z-20 -mx-4 mb-5 overflow-x-auto bg-bg/85 px-4 py-2 backdrop-blur border-b border-line">
            <div className="flex gap-1.5 whitespace-nowrap">
              {anchors.map(([id, label]) => (
                <a key={id} href={`#${id}`}
                  className="tap-target rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:border-line2 hover:text-ink">
                  {label}
                </a>
              ))}
            </div>
          </nav>

          {/* stat cards — auto-fit grid, no orphan card */}
          <div className="mb-6 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
            <Stat n={artists.length} label={T.admin.statArtists} />
            <Stat n={artists.filter((a) => a.published).length} label={T.admin.statPublished} />
            <Stat n={requests.length} label={T.admin.statRequests} />
            <Stat n={requests.filter((r) => r.status === 'new').length} label={T.admin.statNew} tone="amber" />
            <Stat n={claims.length} label={T.admin.statClaims} />
          </div>

          {/* W4-1 — GATE tiles (§1.6 · §14.4): PRODUCT-EVENT funnel counts.
              Operator-facing ops numbers (firewall-allowed, §14.3) — never a
              per-person score. Own loading/error states + retry. */}
          <Section id="gate" title={T.admin.gateTitle}>
            {gate.loading ? (
              <div className="card py-5" role="status" aria-live="polite">
                <div className="skeleton h-4 w-2/5" />
                <span className="sr-only">{T.common.loading}</span>
              </div>
            ) : gate.error ? (
              <div className="card py-4 text-center" role="alert">
                <p className="text-sm text-ink">{T.admin.gateError}</p>
                <button onClick={loadGate} className="btn-ghost mt-3 text-xs">{T.admin.gateRetry}</button>
              </div>
            ) : (
              <>
                <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                  {gateTiles.map((t) => (
                    <div key={t.key} data-testid={`gate-${t.key}`} className="card py-3 text-center">
                      <p className="text-2xl font-extrabold text-ink" data-testid={`gate-${t.key}-n`}>{gate.counts?.[t.key] ?? 0}</p>
                      <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{t.label}</p>
                      <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">{t.tag}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-faint">{T.admin.gateNote}</p>
              </>
            )}

            {/* T-55 — RETENTION tiles: the returning-customer signal (§21.1).
                Counts of product events, demo-excluded — never per-person. */}
            <p className="mb-2 mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{T.admin.retTitle}</p>
            {ret.loading ? (
              <div className="card py-4" role="status" aria-live="polite">
                <div className="skeleton h-4 w-1/3" />
                <span className="sr-only">{T.common.loading}</span>
              </div>
            ) : ret.error ? (
              <div className="card py-4 text-center" role="alert">
                <p className="text-sm text-ink">{T.admin.gateError}</p>
                <button onClick={loadRet} className="btn-ghost mt-3 text-xs">{T.admin.gateRetry}</button>
              </div>
            ) : (
              <>
                <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                  <div data-testid="ret-returning" className="card py-3 text-center">
                    <p className="text-2xl font-extrabold text-ink">{ret.counts?.returningAccounts ?? 0}</p>
                    <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{T.admin.retReturning}</p>
                    <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">{T.admin.retReturningTag}</p>
                  </div>
                  <div data-testid="ret-repeat" className="card py-3 text-center">
                    <p className="text-2xl font-extrabold text-ink">{ret.counts?.repeatPassportOpens ?? 0}</p>
                    <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{T.admin.retRepeat}</p>
                    <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">{T.admin.retRepeatTag}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-faint">{T.admin.retNote}</p>
              </>
            )}
          </Section>

          {/* B5-a (T-81, §8.12) — PILOT FUNNEL: whole-funnel product-milestone
              counts. Own loading/error/retry state, same isolation contract as
              the Gate tiles above. Fill-bar width = count / the funnel's OWN
              max — a product-event visual (§2.1 allowed), never a score or a
              per-person figure. */}
          <Section id="funnel" title={T.admin.funnelTitle}>
            {funnel.loading ? (
              <div className="card py-5" role="status" aria-live="polite">
                <div className="skeleton h-4 w-2/5" />
                <span className="sr-only">{T.common.loading}</span>
              </div>
            ) : funnel.error ? (
              <div className="card py-4 text-center" role="alert">
                <p className="text-sm text-ink">{T.admin.gateError}</p>
                <button onClick={loadFunnel} className="btn-ghost mt-3 text-xs">{T.admin.gateRetry}</button>
              </div>
            ) : (
              <>
                <div className="card space-y-3.5 py-4">
                  {funnelStages.map((s) => {
                    const n = funnel.counts?.[s.key] ?? 0
                    const pct = Math.round((n / funnelMax) * 100)
                    return (
                      <div key={s.key} data-testid={`funnel-${s.key}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-sm text-ink">{s.label}</span>
                          <span className="shrink-0 font-mono text-sm font-bold text-ink" data-testid={`funnel-${s.key}-n`}>{n}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface2" aria-hidden="true">
                          <div className="h-full rounded-full bg-accent/70" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">{s.key}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-faint">{T.admin.funnelNote}</p>
              </>
            )}

            {/* B5-c (T-81, §8.12) — publish freshness: the ONLY honest split
                derivable client-side from the artists list already loaded
                above (no item dates fetched, so published-with-stale-items is
                NOT derivable here — that needs a dedicated read model; not
                guessed). Reuses the main dashboard's own loading/error gate
                since it reads the same `artists` state, not a new query.
                FLAG (still out of territory / not yet built, see report):
                a risk tile — no risk field exists in any state fetched by
                this dashboard, so nothing honest to render. Not stubbed.
                The AI-cost ledger below WAS flagged out for the same reason
                (needs server/**) until owner ruling (a), 20 Jul: ship the
                run count we already have + an honestly-labeled manual spend
                line — see the B5-L block below. */}
            <p className="mb-2 mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{T.admin.freshTitle}</p>
            <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              <div data-testid="fresh-published" className="card py-3 text-center">
                <p className="text-2xl font-extrabold text-ink">{artists.filter((a) => a.published).length}</p>
                <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{T.admin.freshPublished}</p>
              </div>
              <div data-testid="fresh-unpublished" className="card py-3 text-center">
                <p className="text-2xl font-extrabold text-ink">{artists.filter((a) => !a.published).length}</p>
                <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{T.admin.freshUnpublished}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-faint">{T.admin.freshNote}</p>

            {/* B5-L (T-92, §8.12) — AI-COST LEDGER: owner ruling (a) "honest
                hybrid" (20 Jul). runs/30d is a REAL head-count from OUR OWN
                DB (processing_job, migration 022) — one row per automated AI
                extraction run. Spend is NOT computed here: no server-side
                cost read path exists yet (server/** is out of this
                territory), so it renders as an honestly-labeled MANUAL line
                — never a number, never a budget bar. The hard cap is the
                same story: not readable client-side, so it is folded into
                the same manual-line wording rather than shown as a figure.
                FIREWALL: processing_job has no is_demo column (unlike
                analytics_event) — the note below says plainly that this
                count is not demo/seed-excluded, matching §14.3's "no fake
                precision" rule rather than implying a guarantee this tile
                cannot make. Own loading/error/retry, same isolation
                contract as Gate/Retention/Funnel above. No .btn-primary
                here — the one-primary-CTA law stays with "Confirm & activate". */}
            <p className="mb-2 mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{T.admin.aiCostTitle}</p>
            {aiCost.loading ? (
              <div className="card py-4" role="status" aria-live="polite">
                <div className="skeleton h-4 w-1/3" />
                <span className="sr-only">{T.common.loading}</span>
              </div>
            ) : aiCost.error ? (
              <div className="card py-4 text-center" role="alert">
                <p className="text-sm text-ink">{T.admin.gateError}</p>
                <button onClick={loadAiCost} className="btn-ghost mt-3 text-xs">{T.admin.gateRetry}</button>
              </div>
            ) : (
              <>
                <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                  <div data-testid="aicost-runs" className="card py-3 text-center">
                    <p className="text-2xl font-extrabold text-ink" data-testid="aicost-runs-n">{aiCost.counts?.total ?? 0}</p>
                    <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{T.admin.aiCostRuns}</p>
                    <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">{T.admin.aiCostRunsTag}</p>
                  </div>
                </div>
                {aiCost.counts?.byStatus && (
                  <p className="mt-2 whitespace-normal break-words font-mono text-[10.5px] text-muted">
                    {AI_RUN_STATUSES.map((k) => `${aiStatusLabelByKey[k]} ${aiCost.counts.byStatus[k] ?? 0}`).join(' · ')}
                  </p>
                )}
                {/* manual spend line — a separate card, deliberately NOT styled
                    like a number tile, so it can never be mistaken for a
                    computed figure (§2 firewall: no fake precision). */}
                <div data-testid="aicost-spend" className="card mt-2 py-3">
                  <p className="whitespace-normal break-words text-sm font-medium text-ink">{T.admin.aiCostSpendLine}</p>
                  <p className="mt-1 whitespace-normal break-words font-mono text-[10px] uppercase tracking-[0.04em] text-faint">{T.admin.aiCostSpendTag}</p>
                </div>
                <p className="mt-2 whitespace-normal break-words text-xs text-faint">{T.admin.aiCostNote}</p>
              </>
            )}
          </Section>

          {/* OP4 — SEC-01 compliance posture (read-only status) */}
          <SectionTitle>{T.admin.sec01Title}</SectionTitle>
          <div className="card mb-7 space-y-1.5">
            {T.admin.sec01Items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-accent" aria-hidden="true">✓</span><span className="text-ink">{item}</span>
              </div>
            ))}
          </div>

          {/* pending payments (A8) */}
          <Section id="payments" title={T.admin.paymentsTitle} count={payments.length}>
            {payments.length === 0 ? (
              <EmptyState title={T.admin.noPayments} />
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="card py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-sm font-bold text-ink">{p.artists?.stage_name || '—'}</span>
                      <button onClick={() => activate(p.id)}
                        className="btn-primary min-h-[44px] shrink-0 px-4 py-1.5 text-xs">
                        {T.admin.markActive}
                      </button>
                    </div>
                    {/* reference + amount, so the owner can match this row against her Bit app —
                        never truncated: a cut-off reference is unmatchable, not just illegible */}
                    <p dir="ltr" className="mt-2 whitespace-normal break-words font-mono text-sm font-bold leading-snug text-ink">
                      {p.amount_note || T.admin.noAmountNote}
                    </p>
                    <p className="font-mono text-xs text-faint">
                      {p.subject_email || T.admin.noEmailOnFile} · {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* agency upgrade queue — founder confirms Solo→Agency on the SAME org */}
          <Section id="upgrades" title={T.admin.upgradesTitle} count={upgrades.length}>
            {upgrades.length === 0 ? (
              <EmptyState title={T.admin.noUpgrades} />
            ) : (
              <div className="space-y-2">
                {upgrades.map((u) => (
                  <div key={u.organization_id} className="card flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0 truncate text-sm text-ink">{u.organization?.name || u.organization_id}</span>
                    <button onClick={() => approve(u.organization_id)}
                      className="btn-primary min-h-[44px] shrink-0 px-4 py-1.5 text-xs">
                      {T.admin.approveUpgrade}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* artists — with OP12 export / erasure */}
          <Section id="artists" title={T.admin.artistsTitle} count={artists.length}>
            {actionError && <p className="mb-2 text-xs text-amber" role="alert">{actionError}</p>}
            {artists.length === 0 ? (
              <EmptyState title={T.admin.noArtists} />
            ) : (
              <div className="space-y-2">
                {pagedArtists.slice.map((a) => (
                  <div key={a.id} className="card py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 whitespace-normal break-words font-medium leading-snug text-ink">{a.stage_name || '—'}</p>
                        <p className="line-clamp-2 whitespace-normal break-words text-xs leading-snug text-muted">{[a.genre, a.city].filter(Boolean).join(' · ') || '—'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link to={`/passport/${a.id}`} className="tap-target text-xs text-accent hover:underline">{T.admin.viewPassport}</Link>
                        <button
                          onClick={() => togglePublished(a)}
                          disabled={toggling === a.id}
                          className={`chip tap-target px-3 py-1.5 text-xs font-bold transition ${toggling === a.id ? 'opacity-60' : ''} ${
                            a.published ? 'bg-accent/15 text-accent hover:bg-accent/25' : 'bg-surface2 text-muted hover:bg-raise'
                          }`}>
                          {a.published ? T.admin.publishToggleOn : T.admin.publishToggleOff}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 border-t border-line pt-2">
                      <button onClick={() => exportArtist(a)} className="tap-target text-xs text-muted transition hover:text-ink">{T.admin.exportData}</button>
                      <button onClick={() => { setDeleteTarget(a); setDeleteReason('') }} className="tap-target text-xs text-amber hover:underline">{T.admin.deleteData}</button>
                    </div>
                  </div>
                ))}
                <ShowMore paged={pagedArtists} total={artists.length} />
              </div>
            )}
          </Section>

          {/* requests */}
          <Section id="requests" title={T.admin.requestsTitle} count={requests.length}>
            {requests.length === 0 ? (
              <EmptyState title={T.admin.noRequests} />
            ) : (
              <div className="space-y-2">
                {pagedRequests.slice.map((r) => (
                  <div key={r.id} className="card flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 whitespace-normal break-words text-sm font-medium leading-snug text-ink">{r.requester_name}{r.requester_org ? ` · ${r.requester_org}` : ''}</p>
                      <p className="line-clamp-2 whitespace-normal break-words text-xs leading-snug text-muted">{T.admin.forArtist} {r.artists?.stage_name || '—'}</p>
                    </div>
                    <span className={`chip shrink-0 px-2.5 py-1 text-xs ${
                      r.status === 'new' ? 'bg-amber/15 text-amber' : r.status === 'replied' ? 'bg-accent/15 text-accent' : 'bg-surface2 text-muted'
                    }`}>{statusLabel(r.status)}</span>
                  </div>
                ))}
                <ShowMore paged={pagedRequests} total={requests.length} />
              </div>
            )}
          </Section>

          {/* recent claims */}
          <Section id="claims" title={T.admin.claimsTitle} count={claims.length}>
            {claims.length === 0 ? (
              <EmptyState title={T.admin.noClaims} />
            ) : (
              <div className="space-y-2">
                {pagedClaims.slice.map((c) => (
                  <div key={c.id} className="card flex items-center justify-between gap-3 py-3">
                    {/* full wrap, no clamp — an operator reads the whole claim; long
                        seeded values exceed 2 lines at 360px (Wave-B sweep) */}
                    <span className="min-w-0 whitespace-normal break-words text-sm leading-snug text-ink">{c.value || c.claim_type || '—'}</span>
                    <SourceLabel status={c.verification_status} methodLabel={c.method_label} expiresAt={c.expires_at} />
                  </div>
                ))}
                <ShowMore paged={pagedClaims} total={claims.length} />
              </div>
            )}
          </Section>

          {/* OP3 — consent records viewer */}
          <Section id="consents" title={T.admin.consentsTitle} count={consents.length}>
            {consents.length === 0 ? (
              <EmptyState title={T.admin.noConsents} />
            ) : (
              <div className="space-y-2">
                {pagedConsents.slice.map((c) => (
                  <div key={c.id} className="card flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 whitespace-normal break-words text-sm leading-snug text-ink">{c.scope} <span className="text-muted">· {c.version}</span></p>
                      <p className="font-mono text-xs text-faint">{new Date(c.timestamp).toLocaleDateString()}{c.marketing_opt_in ? ` · ${T.admin.consentMarketing}` : ''}</p>
                    </div>
                    <span className="chip shrink-0 bg-accent/15 px-2.5 py-1 text-xs text-accent">{c.status}</span>
                  </div>
                ))}
                <ShowMore paged={pagedConsents} total={consents.length} />
              </div>
            )}
          </Section>

          {/* audit log — recent admin / destructive actions */}
          <Section id="audit" title={T.admin.auditTitle} count={audit.length}>
            {audit.length === 0 ? (
              <EmptyState title={T.admin.noAudit} />
            ) : (
              <div className="space-y-2">
                {pagedAudit.slice.map((row) => (
                  <div key={row.id} className="card py-3">
                    <p className="text-sm text-ink">{row.action} <span className="text-muted">· {row.target_type}</span></p>
                    <p className="font-mono text-xs text-faint">{new Date(row.created_at).toLocaleString()}{row.reason ? ` · ${row.reason}` : ''}</p>
                  </div>
                ))}
                <ShowMore paged={pagedAudit} total={audit.length} />
              </div>
            )}
          </Section>
        </>
      )}

      {/* OP12 erasure confirm — reason required; written to the audit log */}
      <BottomSheet open={!!deleteTarget} onClose={() => !busy && setDeleteTarget(null)} title={T.admin.deleteConfirmTitle}>
        {deleteTarget && (
          <>
            <p className="mb-1 text-sm font-medium text-ink">{deleteTarget.stage_name || deleteTarget.id}</p>
            <p className="mb-3 text-xs text-muted">{T.admin.deleteAuditNote}</p>
            <label className="label" htmlFor="delete-reason">{T.admin.deleteReasonLabel}</label>
            <input id="delete-reason" className="field mb-3" placeholder={T.admin.deleteReasonPlaceholder}
              value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={confirmDelete} disabled={busy || !deleteReason.trim()}>
                {busy ? '…' : T.admin.deleteConfirmCta}
              </button>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)} disabled={busy}>{T.common.cancel}</button>
            </div>
          </>
        )}
      </BottomSheet>
    </PageShell>
  )
}

function Stat({ n, label, tone }) {
  return (
    <div className="card py-3 text-center">
      <p className={`text-2xl font-extrabold ${tone === 'amber' && n > 0 ? 'text-amber' : 'text-ink'}`}>{n}</p>
      <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{label}</p>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted">{children}</h2>
}

function Section({ id, title, count, children }) {
  return (
    <section id={id} className="mb-7 scroll-mt-16">
      <div className="mb-2 flex items-baseline justify-between">
        <SectionTitle>{title}</SectionTitle>
        {Number.isFinite(count) && <span className="font-mono text-[11px] text-faint">{count}</span>}
      </div>
      {children}
    </section>
  )
}
