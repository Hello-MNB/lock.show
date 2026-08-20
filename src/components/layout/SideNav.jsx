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
    <div className="flex flex-col h-full px-3 py-5">
      <div className="px-2 mb-7">
        <Wordmark />
      </div>

      <nav className="flex-1 space-y-0.5" aria-label="main navigation">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `tap-target relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-colors ${
                isActive ? 'text-ink' : 'text-muted hover:text-ink hover:bg-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden="true" className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent" />}
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
