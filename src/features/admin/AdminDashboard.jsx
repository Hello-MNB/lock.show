import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import {
  adminListArtists, adminListRequests, adminListClaims, adminSetPublished,
  adminListPendingEntitlements, adminActivateEntitlement,
  adminListConsents, adminExportArtist, adminDeleteArtist, adminListAudit,
} from '../../lib/db.js'
import { listUpgradeRequests, approveUpgrade } from '../../lib/orgs.js'
import { createNotification } from '../../lib/notifications.js'
import {
  PageShell, Wordmark, Loading, EmptyState, ErrorState, SourceLabel,
  LanguageToggle, BottomSheet,
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
  if (!paged.hasMore) return null
  return (
    <button onClick={paged.more}
      className="btn-ghost w-full text-sm">
      Show more <span className="font-mono text-xs text-faint">({paged.slice.length}/{total})</span>
    </button>
  )
}

export default function AdminDashboard() {
  const { T } = useLang()
  const { signOut } = useAuth()
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
      setPayments((prev) => prev.filter((p) => p.id !== id))
      // P1-1 — fire-and-forget: a notification hiccup must never undo the activation.
      if (payment?.artist_id) {
        createNotification({
          artistId: payment.artist_id,
          type: 'payment_activated',
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
      link.href = url; link.download = `gigproof-${a.stage_name || a.id}.json`; link.click()
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

  const anchors = [
    ['payments', 'Payments'], ['upgrades', 'Upgrades'], ['artists', 'Artists'],
    ['requests', 'Requests'], ['claims', 'Claims'], ['consents', 'Consents'], ['audit', 'Audit'],
  ]

  return (
    <PageShell max="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button onClick={signOut} className="text-sm text-muted transition hover:text-ink">{T.settings.logout}</button>
        </div>
      </div>

      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Operator console</p>
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
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:border-line2 hover:text-ink">
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
                  <div key={p.id} className="card flex items-center justify-between gap-3 py-3">
                    <span className="truncate text-sm text-ink">{p.artists?.stage_name || '—'}</span>
                    <button onClick={() => activate(p.id)}
                      className="btn-primary min-h-[40px] shrink-0 px-4 py-1.5 text-xs">
                      {T.admin.markActive}
                    </button>
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
                    <span className="truncate text-sm text-ink">{u.organization?.name || u.organization_id}</span>
                    <button onClick={() => approve(u.organization_id)}
                      className="btn-primary min-h-[40px] shrink-0 px-4 py-1.5 text-xs">
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
                        <p className="truncate font-medium text-ink">{a.stage_name || '—'}</p>
                        <p className="truncate text-xs text-muted">{[a.genre, a.city].filter(Boolean).join(' · ') || '—'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link to={`/passport/${a.id}`} className="text-xs text-accent hover:underline">{T.admin.viewPassport}</Link>
                        <button
                          onClick={() => togglePublished(a)}
                          disabled={toggling === a.id}
                          className={`chip px-3 py-1.5 text-xs font-bold transition ${toggling === a.id ? 'opacity-60' : ''} ${
                            a.published ? 'bg-accent/15 text-accent hover:bg-accent/25' : 'bg-surface2 text-muted hover:bg-raise'
                          }`}>
                          {a.published ? T.admin.publishToggleOn : T.admin.publishToggleOff}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 border-t border-line pt-2">
                      <button onClick={() => exportArtist(a)} className="text-xs text-muted transition hover:text-ink">{T.admin.exportData}</button>
                      <button onClick={() => { setDeleteTarget(a); setDeleteReason('') }} className="text-xs text-amber hover:underline">{T.admin.deleteData}</button>
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
                      <p className="truncate text-sm font-medium text-ink">{r.requester_name}{r.requester_org ? ` · ${r.requester_org}` : ''}</p>
                      <p className="truncate text-xs text-muted">{T.admin.forArtist} {r.artists?.stage_name || '—'}</p>
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
                    <span className="truncate text-sm text-ink">{c.value || c.claim_type || '—'}</span>
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
                      <p className="truncate text-sm text-ink">{c.scope} <span className="text-muted">· {c.version}</span></p>
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
            <label className="label" htmlFor="delete-reason">Reason (required — recorded in the audit log)</label>
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
