import { NavLink } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getNavTabs, NavIcon } from './navItems.jsx'
import { useAdminAccess } from '../../context/AdminAccessContext.jsx'

export default function BottomNav() {
  // role: the ACTIVE workspace's effective role (ROUND 4) — NOT the static
  // useAuth() profile role — so switching workspace recomputes the tab set.
  const { role, isAgency, isProducerWorkspace } = useOrg()
  const { T } = useLang()
  const { adminMode } = useAdminAccess()
  const tabs = getNavTabs(role, isAgency, T, isProducerWorkspace, adminMode)
  if (tabs.length === 0) return null

  return (
    <div className="rounded-t-2xl border-t border-line bg-bg2/95 px-2 shadow-[0_-18px_50px_rgba(0,0,0,.42)] backdrop-blur-xl">
      <div className="flex h-[68px] items-stretch">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-ink' : 'text-muted hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden="true" className="absolute top-1 h-0.5 w-7 rounded-full bg-accent" />}
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
