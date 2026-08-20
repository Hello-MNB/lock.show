import { NavLink } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { Wordmark } from '../ui.jsx'
import { getNavTabs, NavIcon } from './navItems.jsx'
import { useAdminAccess } from '../../context/AdminAccessContext.jsx'

export default function SideNav() {
  // role: the ACTIVE workspace's effective role (ROUND 4) — NOT the static
  // useAuth() profile role — so switching workspace recomputes the tab set.
  const { role, isAgency, isProducerWorkspace } = useOrg()
  const { T } = useLang()
  const { adminMode } = useAdminAccess()
  const tabs = getNavTabs(role, isAgency, T, isProducerWorkspace, adminMode)

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <div className="mb-8 px-2">
        <Wordmark showTagline />
      </div>

      <nav className="flex-1 space-y-0.5" aria-label="main navigation">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `tap-target data-cue relative flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors ${
                isActive ? 'bg-surface text-ink' : 'text-muted hover:bg-surface/70 hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon name={tab.key} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
