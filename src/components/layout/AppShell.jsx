import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { LanguageToggle } from '../ui.jsx'
import BuildStamp from '../BuildStamp.jsx'
import BottomNav from './BottomNav.jsx'
import SideNav from './SideNav.jsx'
import NotificationBell from './NotificationBell.jsx'
import ContextSwitcher from '../../features/org/ContextSwitcher.jsx'

// Layout route wrapper — renders persistent nav shell around all authenticated screens.
// Mobile: fixed bottom tab nav + a slim top bar. Desktop (md+): fixed 248px inline-start
// sidebar (logical CSS — start/border-e/ps — so a future RTL pass flips it for free).
// The top bar's only job is the workspace switcher, top-right, on EVERY breakpoint
// (canon ROUND 4: person → workspace → role; switching lives top-right, never
// bottom-left, never a re-registration).
// Public routes (Passport, confirm, login) are NOT wrapped — they use separate Route entries.
export default function AppShell() {
  const { user, loading } = useAuth()
  const { T } = useLang()

  // No shell while loading or for unauthenticated renders (route guards handle redirect).
  if (!user || loading) return <Outlet />

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar. Already `fixed` (a positioning context on its own —
          no extra `relative` needed), so the build stamp can overlay its
          bottom edge without fighting SideNav's own `h-full` flex column. */}
      <aside className="hidden md:flex fixed start-0 top-0 bottom-0 w-[248px] flex-col bg-bg2 border-e border-line z-30">
        <SideNav />
        {/* Build stamp (W-2#5) — quiet, bottom of the ONE persistent chrome
            column so it's on every authenticated screen without adding new
            chrome anywhere else. */}
        <BuildStamp className="absolute inset-x-0 bottom-0 px-5 pb-4" />
      </aside>

      {/* Top bar — the ONE shared header: language toggle, notification bell,
          workspace switcher, top-right, every breakpoint (canon: no scattered
          chrome — the wordmark lives ONCE, in the sidebar, never here). */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-3 border-b border-line bg-bg/95 px-4 backdrop-blur md:ps-[248px]">
        <LanguageToggle />
        <NotificationBell />
        <ContextSwitcher />
        <Link to="/settings" className="flex min-h-[44px] items-center text-sm text-muted transition-colors hover:text-ink">{T.dashboard.settings}</Link>
      </header>

      {/* Scrollable content — offset for sidebar on desktop, padded bottom for nav on mobile */}
      <main className="md:ps-[248px] pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30">
        <BottomNav />
      </div>
    </div>
  )
}
