import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { BottomSheet } from '../../components/ui.jsx'
import { ROLES } from '../../lib/constants.js'

const orgRoleLabel = (r, T) => ({ owner: T.org.roleOwner, admin: T.org.roleAdmin, member: T.org.roleMember }[r] || r)

function workspaceTypeLabel(role, isAgency, T) {
  const n = T.nav
  if (role === ROLES.ARTIST) return n.workspaceArtist
  if (role === ROLES.AGENCY || isAgency) return n.workspaceManager
  if (role === ROLES.PRODUCER) return n.workspaceProducer
  if (role === ROLES.BOOKER) return n.workspaceBooker
  if (role === ROLES.OPERATOR) return n.workspaceOperator
  return T.org.entitySolo
}

// O3 — Context / workspace switcher. Shows active workspace type + org name.
// Multi-org users can switch via bottom sheet. Always visible — "Add workspace" is always shown.
// Note: "Add workspace" links to /onboarding; artist-only guard removed in Session B.
export default function ContextSwitcher() {
  const { T } = useLang()
  const { memberships, activeOrgId, switchOrg } = useOrg()
  const { role } = useAuth()
  const [open, setOpen] = useState(false)

  const hasMultiple = memberships && memberships.length > 1
  const active = memberships?.find((m) => m.organization?.id === activeOrgId) || memberships?.[0]
  const isAgency = ['agency', 'agency_plus'].includes(active?.organization?.plan)
  const typeLabel = workspaceTypeLabel(role, isAgency, T)

  return (
    <div className="w-full">
      <button
        onClick={() => hasMultiple && setOpen(true)}
        disabled={!hasMultiple}
        className={`w-full text-start bg-surface rounded-lg px-3 py-2 border border-line transition ${
          hasMultiple ? 'hover:border-accent cursor-pointer' : 'cursor-default'
        }`}
      >
        <p className="text-[10px] font-medium text-muted uppercase tracking-wide">{typeLabel}</p>
        {active?.organization?.name && (
          <p className="text-sm font-medium text-ink truncate mt-0.5">
            {active.organization.name}
            {hasMultiple && <span className="text-muted ml-1">▾</span>}
          </p>
        )}
      </button>

      <Link
        to="/onboarding"
        className="mt-1.5 block w-full text-xs text-muted hover:text-accent text-center py-1.5 rounded transition"
      >
        {T.nav.addWorkspace}
      </Link>

      {hasMultiple && (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={T.org.switchOrg}>
          <div className="space-y-2">
            {memberships.map((m) => {
              const isActive = m.organization?.id === activeOrgId
              return (
                <button
                  key={m.organization?.id}
                  onClick={() => { switchOrg(m.organization?.id); setOpen(false) }}
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
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
