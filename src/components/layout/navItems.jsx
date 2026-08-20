import { ROLES } from '../../lib/constants.js'
import { Radar, BadgeCheck, Inbox, Users, CalendarDays, Search, Download, ShieldCheck } from 'lucide-react'

// Shared nav tab definitions — consumed by BottomNav (mobile) and SideNav (desktop).
// Each tab: { key, label, to, end }
// `end` mirrors NavLink's `end` prop (exact-match active state).
export function getNavTabs(role, isAgency, T, isProducerWorkspace = false, adminMode = false) {
  const n = T.nav
  if (adminMode) return [
    { key: 'admin', label: n.admin, to: '/admin', end: true },
  ]
  // Account/settings is an upper utility, never a repeated primary destination.
  // Readiness left the nav (content lives inside the Radar's readiness surface);
  // claim review is a panel/flow reached FROM the radar, not a nav destination —
  // "Passport" now opens the artist's own real passport preview, not claim review.
  if (role === ROLES.ARTIST) return [
    { key: 'radar',    label: n.radar,    to: '/artist/home',     end: true },
    { key: 'passport', label: n.passport, to: '/artist/passport', end: true },
    { key: 'requests', label: n.requests, to: '/artist/requests', end: true },
  ]
  // Production-company workspace (organization.workspace_type='producer', 027) —
  // checked BEFORE the generic agency branch so a production org gets its own
  // nav set (Team · Events · Requests · Account) instead of the roster tabs.
  if ((role === ROLES.AGENCY || isAgency) && isProducerWorkspace) return [
    { key: 'team',      label: n.team,     to: '/production',          end: true },
    { key: 'events',    label: n.events,   to: '/production/events',   end: true },
    { key: 'requests',  label: n.requests, to: '/production/requests', end: true },
  ]
  if (role === ROLES.AGENCY || isAgency) return [
    { key: 'roster',   label: n.roster,   to: '/agency',          end: true },
    { key: 'radar',    label: n.radar,    to: '/agency/radar',    end: true },
    { key: 'requests', label: n.requests, to: '/agency/requests', end: true },
  ]
  if (role === ROLES.PRODUCER) return [
    { key: 'received', label: n.received, to: '/producer/received', end: false },
  ]
  // Booker (booking manager) — lands on /discover (open a Passport you were sent).
  // Without this branch a booker fell through to the fallback and could not navigate home.
  if (role === ROLES.BOOKER) return [
    { key: 'discover', label: n.discover, to: '/discover', end: true },
  ]
  if (role === ROLES.OPERATOR) return [
    { key: 'admin', label: n.admin, to: '/admin', end: true },
  ]
  return []
}

const NAV_ICONS = {
  radar: Radar,
  passport: BadgeCheck,
  discover: Search,
  roster: Users,
  requests: Inbox,
  received: Download,
  team: Users,
  events: CalendarDays,
  admin: ShieldCheck,
}

export function NavIcon({ name }) {
  const Icon = NAV_ICONS[name]
  return Icon ? <Icon size={21} strokeWidth={1.7} aria-hidden="true" /> : null
}
