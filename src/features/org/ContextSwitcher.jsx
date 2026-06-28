import { useState } from 'react'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { BottomSheet } from '../../components/ui.jsx'

const roleLabel = (r, T) => ({ owner: T.org.roleOwner, admin: T.org.roleAdmin, member: T.org.roleMember }[r] || r)

// O3 — Context switcher. Plan-aware active label; mobile bottom-sheet list of the
// person's orgs (name + role + ✓). Hidden when the person belongs to one org.
// switchOrg() persists active_role_context, so it remembers across sessions.
export default function ContextSwitcher() {
  const { T } = useLang()
  const { memberships, activeOrgId, switchOrg } = useOrg()
  const [open, setOpen] = useState(false)
  if (!memberships || memberships.length <= 1) return null
  const active = memberships.find((m) => m.organization?.id === activeOrgId) || memberships[0]
  const isAgency = ['agency', 'agency_plus'].includes(active?.organization?.plan)

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="bg-surface text-soft text-xs rounded-lg px-3 py-1.5 border border-line min-h-[36px] max-w-[150px] truncate">
        {active?.organization?.name || (isAgency ? T.org.entityAgency : T.org.entitySolo)} ▾
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={T.org.switchOrg}>
        <div className="space-y-2">
          {memberships.map((m) => {
            const isActive = m.organization?.id === activeOrgId
            return (
              <button key={m.organization?.id} onClick={() => { switchOrg(m.organization?.id); setOpen(false) }}
                className={`card w-full text-start flex items-center justify-between ${isActive ? 'border-accent' : ''}`}>
                <div className="min-w-0">
                  <p className="text-soft text-sm font-medium truncate">{m.organization?.name}</p>
                  <p className="text-xs text-muted">{roleLabel(m.org_role, T)}</p>
                </div>
                {isActive && <span className="text-accent" aria-label="active">✓</span>}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </>
  )
}
