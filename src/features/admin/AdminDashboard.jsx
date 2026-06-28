import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import {
  adminListArtists, adminListRequests, adminListClaims, adminSetPublished,
  adminListPendingEntitlements, adminActivateEntitlement,
  adminListConsents, adminExportArtist, adminDeleteArtist, adminListAudit,
} from '../../lib/db.js'
import { listUpgradeRequests, approveUpgrade } from '../../lib/orgs.js'
import { PageShell, Wordmark, Loading, EmptyState, ErrorState, SourceLabel, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Operator / Admin console — platform oversight.
// FIREWALL: shows bounded statuses, bands and provenance only. The record
// COUNTS here are platform ops metadata, never a per-artist score / head-count.
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
      await adminActivateEntitlement(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
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

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button onClick={signOut} className="text-sm text-muted hover:text-soft">{T.settings.logout}</button>
        </div>
      </div>

      <h1 className="text-xl font-bold text-soft mb-1">{T.admin.title}</h1>
      <p className="text-sm text-muted mb-5">{T.admin.subtitle}</p>

      {loading ? <Loading /> : error ? <ErrorState title={T.admin.loadError} onRetry={load} /> : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <Stat n={artists.length} label={T.admin.statArtists} />
            <Stat n={artists.filter((a) => a.published).length} label={T.admin.statPublished} />
            <Stat n={requests.length} label={T.admin.statRequests} />
            <Stat n={requests.filter((r) => r.status === 'new').length} label={T.admin.statNew} />
            <Stat n={claims.length} label={T.admin.statClaims} />
          </div>

          {/* OP4 — SEC-01 compliance posture (read-only status) */}
          <SectionTitle>{T.admin.sec01Title}</SectionTitle>
          <div className="card mb-6 space-y-1.5">
            {T.admin.sec01Items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-ok" aria-hidden="true">✓</span><span className="text-soft">{item}</span>
              </div>
            ))}
          </div>

          {/* pending payments (A8) */}
          <SectionTitle>{T.admin.paymentsTitle}</SectionTitle>
          {payments.length === 0 ? (
            <EmptyState title={T.admin.noPayments} />
          ) : (
            <div className="space-y-2 mb-6">
              {payments.map((p) => (
                <div key={p.id} className="card flex items-center justify-between gap-3">
                  <span className="text-soft text-sm truncate">{p.artists?.stage_name || '—'}</span>
                  <button onClick={() => activate(p.id)}
                    className="chip min-h-[40px] px-3 py-1.5 text-xs font-bold bg-ok/20 text-ok hover:bg-ok/30">
                    {T.admin.markActive}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* agency upgrade queue — founder confirms Solo→Agency on the SAME org */}
          <SectionTitle>{T.admin.upgradesTitle}</SectionTitle>
          {upgrades.length === 0 ? (
            <EmptyState title={T.admin.noUpgrades} />
          ) : (
            <div className="space-y-2 mb-6">
              {upgrades.map((u) => (
                <div key={u.organization_id} className="card flex items-center justify-between gap-3">
                  <span className="text-soft text-sm truncate">{u.organization?.name || u.organization_id}</span>
                  <button onClick={() => approve(u.organization_id)}
                    className="chip min-h-[40px] px-3 py-1.5 text-xs font-bold bg-accent/20 text-accent hover:bg-accent/30">
                    {T.admin.approveUpgrade}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* artists — with OP12 export / erasure */}
          <SectionTitle>{T.admin.artistsTitle}</SectionTitle>
          {actionError && <p className="text-xs text-warn mb-2" role="alert">{actionError}</p>}
          {artists.length === 0 ? (
            <EmptyState title={T.admin.noArtists} />
          ) : (
            <div className="space-y-2 mb-6">
              {artists.map((a) => (
                <div key={a.id} className="card">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-soft font-medium truncate">{a.stage_name || '—'}</p>
                      <p className="text-xs text-muted truncate">{[a.genre, a.city].filter(Boolean).join(' · ') || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/passport/${a.id}`} className="text-xs text-accent hover:underline">{T.admin.viewPassport}</Link>
                      <button
                        onClick={() => togglePublished(a)}
                        disabled={toggling === a.id}
                        className={`chip px-3 py-1.5 text-xs font-bold transition ${toggling === a.id ? 'opacity-60' : ''} ${
                          a.published ? 'bg-ok/20 text-ok hover:bg-ok/30' : 'bg-surface text-muted hover:bg-line'
                        }`}>
                        {a.published ? T.admin.publishToggleOn : T.admin.publishToggleOff}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-line">
                    <button onClick={() => exportArtist(a)} className="text-xs text-muted hover:text-soft">{T.admin.exportData}</button>
                    <button onClick={() => { setDeleteTarget(a); setDeleteReason('') }} className="text-xs text-warn hover:underline">{T.admin.deleteData}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* requests */}
          <SectionTitle>{T.admin.requestsTitle}</SectionTitle>
          {requests.length === 0 ? (
            <EmptyState title={T.admin.noRequests} />
          ) : (
            <div className="space-y-2 mb-6">
              {requests.map((r) => (
                <div key={r.id} className="card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-soft text-sm font-medium truncate">{r.requester_name}{r.requester_org ? ` · ${r.requester_org}` : ''}</p>
                    <p className="text-xs text-muted truncate">{T.admin.forArtist} {r.artists?.stage_name || '—'}</p>
                  </div>
                  <span className={`chip shrink-0 px-2.5 py-1 text-xs ${
                    r.status === 'new' ? 'bg-accent/15 text-accent' : r.status === 'replied' ? 'bg-ok/15 text-ok' : 'bg-gap/20 text-muted'
                  }`}>{statusLabel(r.status)}</span>
                </div>
              ))}
            </div>
          )}

          {/* recent claims */}
          <SectionTitle>{T.admin.claimsTitle}</SectionTitle>
          {claims.length === 0 ? (
            <EmptyState title={T.admin.noClaims} />
          ) : (
            <div className="space-y-2 mb-6">
              {claims.map((c) => (
                <div key={c.id} className="card flex items-center justify-between gap-3">
                  <span className="text-soft text-sm truncate">{c.value || c.claim_type || '—'}</span>
                  <SourceLabel status={c.verification_status} methodLabel={c.method_label} expiresAt={c.expires_at} />
                </div>
              ))}
            </div>
          )}

          {/* OP3 — consent records viewer */}
          <SectionTitle>{T.admin.consentsTitle}</SectionTitle>
          {consents.length === 0 ? (
            <EmptyState title={T.admin.noConsents} />
          ) : (
            <div className="space-y-2">
              {consents.map((c) => (
                <div key={c.id} className="card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-soft text-sm truncate">{c.scope} <span className="text-muted">· {c.version}</span></p>
                    <p className="text-xs text-muted">{new Date(c.timestamp).toLocaleDateString()}{c.marketing_opt_in ? ` · ${T.admin.consentMarketing}` : ''}</p>
                  </div>
                  <span className="chip shrink-0 px-2.5 py-1 text-xs bg-ok/15 text-ok">{c.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* audit log — recent admin / destructive actions */}
          <SectionTitle>{T.admin.auditTitle}</SectionTitle>
          {audit.length === 0 ? (
            <EmptyState title={T.admin.noAudit} />
          ) : (
            <div className="space-y-2">
              {audit.map((row) => (
                <div key={row.id} className="card">
                  <p className="text-soft text-sm">{row.action} <span className="text-muted">· {row.target_type}</span></p>
                  <p className="text-xs text-muted">{new Date(row.created_at).toLocaleString()}{row.reason ? ` · ${row.reason}` : ''}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* OP12 erasure confirm — reason required; written to the audit log */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm">
            <h2 className="font-bold text-warn mb-1">{T.admin.deleteConfirmTitle}</h2>
            <p className="text-sm text-soft mb-1">{deleteTarget.stage_name || deleteTarget.id}</p>
            <p className="text-xs text-muted mb-3">{T.admin.deleteAuditNote}</p>
            <input className="field mb-3" placeholder={T.admin.deleteReasonPlaceholder}
              value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={confirmDelete} disabled={busy || !deleteReason.trim()}>
                {busy ? '…' : T.admin.deleteConfirmCta}
              </button>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)} disabled={busy}>{T.common.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function Stat({ n, label }) {
  return (
    <div className="card text-center py-3">
      <p className="text-2xl font-extrabold text-soft">{n}</p>
      <p className="text-[11px] text-muted mt-0.5">{label}</p>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-bold uppercase tracking-wide text-muted mb-2">{children}</h2>
}
