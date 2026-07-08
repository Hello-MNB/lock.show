import { Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider.jsx'
import BottomNav from './BottomNav.jsx'
import SideNav from './SideNav.jsx'

// Layout route wrapper — renders persistent nav shell around all authenticated screens.
// Mobile: fixed bottom tab nav. Desktop (md+): fixed 248px inline-start sidebar
// (logical CSS — start/border-e/ps — so a future RTL pass flips it for free).
// Public routes (Passport, confirm, login) are NOT wrapped — they use separate Route entries.
export default function AppShell() {
  const { user, loading } = useAuth()

  // No shell while loading or for unauthenticated renders (route guards handle redirect).
  if (!user || loading) return <Outlet />

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed start-0 top-0 bottom-0 w-[248px] flex-col bg-bg2 border-e border-line z-30">
        <SideNav />
      </aside>

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
