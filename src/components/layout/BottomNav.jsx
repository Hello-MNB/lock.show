import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getNavTabs, NavIcon } from './navItems.jsx'

export default function BottomNav() {
  const { role } = useAuth()
  const { isAgency } = useOrg()
  const { T } = useLang()
  const tabs = getNavTabs(role, isAgency, T)
  if (tabs.length === 0) return null

  return (
    <div className="bg-bg2 border-t border-line">
      <div className="h-16 flex items-stretch">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-h-[44px] ${
                isActive ? 'text-ink' : 'text-muted hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden="true" className="absolute top-0 h-0.5 w-6 rounded-full bg-accent" />}
                <NavIcon name={tab.key} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe-area spacer for iOS notch devices */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} aria-hidden />
    </div>
  )
}
