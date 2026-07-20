import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMembers, listOrgGigs, groupGigsIntoEvents, listProductionRequests } from '../../lib/orgs.js'
import { PageShell, Loading, ErrorState, BandPill } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'

// ============================================================
// PRODUCTION WORKSPACE (INSOMNIA-style) — organization.workspace_type='producer'
// (migration 027). A production company runs its own events and books lineup
// slots; this is a DIFFERENT concept from the individual `producer` (מפיק)
// role that confirms one claim via a no-login magic link (see
// src/features/producer/ProducerConfirm.jsx) — that flow is untouched here.
//
// One component, three real routes (/production, /production/events,
// /production/requests) — `useLocation` picks the active section so nav
// highlighting (SideNav/BottomNav) works per-route without three separate
// files duplicating the shell/loading/error boilerplate.
//
// META-FIELD LAW: every section reads REAL data (org members, `gigs` rows
// scoped by organization_id, migration 023's gig-depth columns). Where the
// schema/RLS genuinely has no path yet (the confirm-requests surface — see
// listOrgConfirmRequests in orgs.js), this renders an honest "not wired yet"
// state instead of inventing rows.
// ============================================================

const fmtDate = (d) => {
  if (!d) return null
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? null : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function sectionFromPath(pathname) {
  if (pathname.endsWith('/events')) return 'events'
  if (pathname.endsWith('/requests')) return 'requests'
  return 'team'
}

function SectionTabs({ active, T }) {
  const tabs = [
    { key: 'team', to: '/production', label: T.production.teamTitle },
    { key: 'events', to: '/production/events', label: T.production.eventsTitle },
    { key: 'requests', to: '/production/requests', label: T.production.requestsTitle },
  ]
  return (
    <div className="mb-4 flex gap-1 rounded-full border border-line bg-surface2 p-1">
      {tabs.map((t) => (
        <Link key={t.key} to={t.to}
          className={`flex min-h-[44px] flex-1 items-center justify-center rounded-full py-1.5 text-center text-xs font-semibold transition ${active === t.key ? 'bg-accent text-[#12160A]' : 'text-muted hover:text-ink'}`}>
          {t.label}
        </Link>
      ))}
    </div>
  )
}

function TeamSection({ orgId, T }) {
  const [members, setMembers] = useState(null)
  const [error, setError] = useState(false)
  async function load() {
    setError(false)
    try { setMembers(await getMembers(orgId)) } catch { setError(true) }
  }
  useEffect(() => { load() }, [orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorState title={T.admin.loadError} onRetry={load} />
  if (members === null) return <Loading />

  return (
    <div>
      {members.length === 0 ? (
        <div className="card text-center py-8">
          <p className="font-bold text-ink mb-1">{T.production.teamEmpty}</p>
          <Link to="/org/members" className="btn-primary mt-3 inline-block">{T.org.membersTitle}</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{m.person?.display_name || m.invited_email || T.agency.noName}</p>
                <p className="truncate text-xs text-muted">{m.person?.email || m.invited_email || '—'}</p>
              </div>
              <span className="shrink-0 chip border border-line bg-surface2 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-ink">
                {T.org[`role${m.org_role.charAt(0).toUpperCase()}${m.org_role.slice(1)}`] || m.org_role}
              </span>
            </div>
          ))}
        </div>
      )}
      {members.length > 0 && (
        <Link to="/org/members" className="btn-ghost mt-3 w-full block text-center">{T.production.manageTeam}</Link>
      )}
    </div>
  )
}

function slotStatusChip(g, T) {
  const label = T.production.gigStatus[g.status] || g.status
  return <span className="chip border border-line bg-surface2 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-ink">{label}</span>
}

function EventsSection({ orgId, T }) {
  const [gigs, setGigs] = useState(null)
  const [error, setError] = useState(false)
  async function load() {
    setError(false)
    try { setGigs(await listOrgGigs(orgId)) } catch { setError(true) }
  }
  useEffect(() => { load() }, [orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorState title={T.admin.loadError} onRetry={load} />
  if (gigs === null) return <Loading />

  const events = groupGigsIntoEvents(gigs)

  if (events.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="font-bold text-ink mb-1">{T.production.eventsEmptyTitle}</p>
        <p className="text-sm text-muted">{T.production.eventsEmptyBody}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => (
        <div key={ev.key} className="card">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{ev.title || T.production.untitledEvent}</p>
              <p className="text-xs text-muted">
                {[fmtDate(ev.event_date) || T.agency.noDate, ev.venue, ev.city].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div className="space-y-2 border-t border-line pt-2">
            {ev.slots.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{g.artist?.stage_name || T.agency.noName}</p>
                  <p className="text-xs text-muted">
                    {g.role_at_event ? (T.production.roleAtEvent[g.role_at_event] || g.role_at_event) : T.production.roleUnset}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {g.audience_band && g.audience_band !== 'unknown' && (
                    <BandPill>{T.production.audienceBand[g.audience_band] || g.audience_band}</BandPill>
                  )}
                  {slotStatusChip(g, T)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// A7 (rel-07.13, 032-backed): the inbox of availability requests THIS workspace
// sent, with reply status — real data via list_production_requests (SECURITY
// DEFINER, membership-gated). null = 032 not applied → honest gap state.
function RequestsSection({ T }) {
  const [requests, setRequests] = useState(undefined) // undefined = loading, null = 032 missing, [] = real empty
  async function load() {
    try { setRequests(await listProductionRequests()) } catch { setRequests(null) }
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (requests === undefined) return <Loading />

  if (requests === null) {
    return (
      <div className="card border border-line">
        <p className="mb-1 font-bold text-ink">{T.production.requestsGapTitle}</p>
        <p className="text-sm text-muted">{T.production.requestsGapBody}</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="font-bold text-ink mb-1">{T.production.requestsEmptyTitle}</p>
        <p className="text-sm text-muted">{T.production.requestsEmptyBody}</p>
      </div>
    )
  }

  const statusLabel = (s) =>
    s === 'replied' ? T.production.reqStatusReplied : s === 'closed' ? T.production.reqStatusClosed : T.production.reqStatusNew
  return (
    <div className="space-y-2">
      {requests.map((r) => (
        <div key={r.request_id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{r.artist_stage_name || '—'}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {[r.event_type, r.location, r.event_date].filter(Boolean).join(' · ')}
              </p>
              {r.message && <p className="mt-1 line-clamp-2 text-sm text-ink">“{r.message}”</p>}
            </div>
            <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] ${r.status === 'replied' ? 'text-accent' : r.status === 'closed' ? 'text-faint' : 'text-amber'}`}>
              {statusLabel(r.status)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductionDashboard() {
  const { T } = useLang()
  const { activeOrgId, activeOrg } = useOrg()
  const loc = useLocation()
  const section = sectionFromPath(loc.pathname)

  if (!activeOrgId) return <PageShell max="max-w-4xl"><Loading /></PageShell>

  return (
    <PageShell max="max-w-4xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">{T.production.title}</h1>
      </div>
      <p className="mb-4 text-sm text-muted">{activeOrg?.name ? T.production.subtitleFor(activeOrg.name) : T.production.subtitle}</p>

      <SectionTabs active={section} T={T} />

      {section === 'team' && <TeamSection orgId={activeOrgId} T={T} />}
      {section === 'events' && <EventsSection orgId={activeOrgId} T={T} />}
      {section === 'requests' && <RequestsSection T={T} />}
    </PageShell>
  )
}
