import { useState } from 'react'
import { useOrg } from '../../context/OrgContext.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { BottomSheet, Spinner } from '../../components/ui.jsx'
import { createWorkspace } from '../../lib/orgs.js'
import { ROLES } from '../../lib/constants.js'

const orgRoleLabel = (r, T) => ({ owner: T.org.roleOwner, admin: T.org.roleAdmin, member: T.org.roleMember }[r] || r)

function workspaceTypeLabel(role, isAgency, T, isProducerWorkspace) {
  const n = T.nav
  if (role === ROLES.ARTIST) return n.workspaceArtist
  if ((role === ROLES.AGENCY || isAgency) && isProducerWorkspace) return n.workspaceProduction
  if (role === ROLES.AGENCY || isAgency) return n.workspaceManager
  if (role === ROLES.PRODUCER) return n.workspaceProducer
  if (role === ROLES.BOOKER) return n.workspaceBooker
  if (role === ROLES.OPERATOR) return n.workspaceOperator
  return T.org.entitySolo
}

// The three workspace types a person can self-create (A2/N12). UI vocabulary —
// orgs.createWorkspace maps these onto the migration-027 DB values
// (artist / management / producer).
const NEW_WORKSPACE_TYPES = ['artist', 'agency', 'production']

// O3 — Workspace / account switcher. Canon ROUND 4: person → workspace →
// role; switching lives TOP-RIGHT (never bottom-left, never a re-registration).
// Rendered once from AppShell's top bar, on every breakpoint — always visible
// (not just when multi-org), since it is also the "add a workspace" surface.
//
// G3 (A2/N12): "+ New workspace" opens a small IN-PLACE form (name + type)
// that calls the real creation path (orgs.createWorkspace → create_workspace
// RPC, migration 035). BOUNDARY (DEPLOY-GAPS G3 testable condition): creating
// or switching NEVER transfers evidence, billing or ArtistAccess between
// workspaces — the new workspace starts empty; switching is client-side
// context derivation only (see OrgContext.switchOrg).
export default function ContextSwitcher() {
  const { T } = useLang()
  // role: the ACTIVE workspace's effective role (ROUND 4), so the label under
  // the avatar follows whichever workspace is selected right now, not a single
  // static profile role.
  const { memberships, activeOrgId, switchOrg, role, isProducerWorkspace, reload } = useOrg()
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [wsName, setWsName] = useState('')
  const [wsType, setWsType] = useState('artist')
  const [wsBusy, setWsBusy] = useState(false)
  const [wsError, setWsError] = useState('')

  const active = memberships?.find((m) => m.organization?.id === activeOrgId) || memberships?.[0]
  const isAgency = ['agency', 'agency_plus'].includes(active?.organization?.plan)
  const typeLabel = workspaceTypeLabel(role, isAgency, T, isProducerWorkspace)
  const initial = (profile?.full_name || 'G').trim().charAt(0).toUpperCase() || 'G'

  const typeWord = (t) => ({
    artist: T.org.newWorkspaceTypeArtist,
    agency: T.org.newWorkspaceTypeAgency,
    production: T.org.newWorkspaceTypeProduction,
  }[t])

  function closeSheet() {
    setOpen(false)
    setCreating(false)
    setWsError('')
  }

  async function submitCreate(e) {
    e.preventDefault()
    if (!wsName.trim() || wsBusy) return
    setWsBusy(true); setWsError('')
    try {
      const res = await createWorkspace({ name: wsName.trim(), type: wsType })
      if (res?.ok === false) {
        // Honest soft-fail (same contract as the 027/032 wrappers): nothing was
        // created — say so instead of pretending, never a silent dead end.
        setWsError(res.reason === 'migration-035-required' ? T.org.newWorkspaceMigrationNote : T.org.newWorkspaceError)
        return
      }
      await reload() // membership list now includes the new (empty) workspace
      setWsName(''); setWsType('artist')
      closeSheet()
      switchOrg(res.id) // logs WORKSPACE_SWITCHED + lands on the new workspace's home
    } catch {
      setWsError(T.org.newWorkspaceError)
    } finally {
      setWsBusy(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pe-3 ps-1 transition hover:border-accent/50"
      >
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-bold text-ink">
          {initial}
        </span>
        <span className="hidden text-start sm:block">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">{typeLabel}</span>
          {active?.organization?.name && (
            <span className="block max-w-[140px] truncate text-xs font-semibold text-ink">{active.organization.name}</span>
          )}
        </span>
        <span aria-hidden className="text-muted">▾</span>
      </button>

      <BottomSheet open={open} onClose={closeSheet} title={T.org.switchOrg}>
        <div className="space-y-2">
          {profile?.full_name && <p className="mb-1 truncate text-sm font-semibold text-ink">{profile.full_name}</p>}
          {memberships.map((m) => {
            const isActive = m.organization?.id === activeOrgId
            return (
              <button
                key={m.organization?.id}
                onClick={() => { switchOrg(m.organization?.id); closeSheet() }}
                className={`card w-full text-start flex items-center justify-between ${isActive ? 'border-accent' : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium truncate">{m.organization?.name}</p>
                  <p className="text-xs text-muted">{orgRoleLabel(m.org_role, T)}</p>
                </div>
                {isActive && <span className="text-accent" aria-label="active">✓</span>}
              </button>
            )
          })}

          {/* ── G3 · A2/N12 — real workspace creation, in place ── */}
          {creating ? (
            <form onSubmit={submitCreate} className="card space-y-3 text-start">
              <p className="text-sm font-semibold text-ink">{T.org.newWorkspaceTitle}</p>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">{T.org.newWorkspaceNameLabel}</span>
                <input className="field" value={wsName} onChange={(e) => setWsName(e.target.value)} maxLength={80} />
              </label>
              <div>
                <span className="mb-1 block text-xs text-muted">{T.org.newWorkspaceTypeLabel}</span>
                <div className="flex gap-1.5" role="radiogroup" aria-label={T.org.newWorkspaceTypeLabel}>
                  {NEW_WORKSPACE_TYPES.map((t) => (
                    <button key={t} type="button" role="radio" aria-checked={wsType === t}
                      onClick={() => setWsType(t)}
                      className={`chip min-h-[36px] flex-1 border px-2 py-1 text-xs transition ${
                        wsType === t ? 'border-accent bg-accent/10 font-semibold text-ink' : 'border-line bg-surface2 text-muted'}`}>
                      {typeWord(t)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Boundary, stated to the user: nothing moves between workspaces. */}
              <p className="text-[11px] leading-relaxed text-faint">{T.org.newWorkspaceEmptyNote}</p>
              {wsError && <p className="text-xs text-amber">{wsError}</p>}
              <div className="flex gap-2">
                <button className="btn-primary flex-1" disabled={wsBusy || !wsName.trim()}>
                  {wsBusy ? <Spinner /> : T.org.newWorkspaceCreate}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setCreating(false); setWsError('') }}>
                  {T.common.cancel}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-1.5 block w-full py-1.5 text-center text-xs text-muted transition hover:text-accent"
            >
              {T.nav.addWorkspace}
            </button>
          )}
          <p className="mt-1 text-center text-[10px] text-faint">{T.org.switchNote}</p>
        </div>
      </BottomSheet>
    </div>
  )
}
