import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { Wordmark } from '../ui.jsx'
import ContextSwitcher from '../../features/org/ContextSwitcher.jsx'
import { getNavTabs, NavIcon } from './navItems.jsx'

export default function SideNav() {
  const { role } = useAuth()
  const { isAgency } = useOrg()
  const { T } = useLang()
  const tabs = getNavTabs(role, isAgency, T)

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
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium border transition-colors ${
                isActive
                  ? 'bg-accent/[0.07] border-accent/15 text-accent'
                  : 'border-transparent text-muted hover:text-ink hover:bg-surface'
              }`
            }
          >
            <NavIcon name={tab.key} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 pt-4 border-t border-line">
        <ContextSwitcher />
      </div>
    </div>
  )
}
