import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './features/auth/AuthProvider.jsx'
import { useOrg } from './context/OrgContext.jsx'
import { Loading } from './components/ui.jsx'
import { ROLES } from './lib/constants.js'
import { DEMO } from './lib/demo.js'

import AppShell from './components/layout/AppShell.jsx'
import SetupNotice from './features/setup/SetupNotice.jsx'
import Login from './features/auth/Login.jsx'
import Signup from './features/auth/Signup.jsx'
import UserTypeSelect from './features/auth/UserTypeSelect.jsx'
import Settings from './features/auth/Settings.jsx'
import Onboarding from './features/artist/Onboarding.jsx'
import ArtistDashboard from './features/artist/ArtistDashboard.jsx'
import ArtistReadiness from './features/artist/ArtistReadiness.jsx'
import ClaimReview from './features/artist/ClaimReview.jsx'
import OfferPayment from './features/artist/OfferPayment.jsx'
import EvidenceCapture from './features/evidence/EvidenceCapture.jsx'
import Passport from './features/passport/Passport.jsx'
import AvailabilityRequest from './features/passport/AvailabilityRequest.jsx'
import RequestConfirmation from './features/passport/RequestConfirmation.jsx'
import AgencyDashboard from './features/agency/AgencyDashboard.jsx'
import AgencyRequestsInbox from './features/agency/AgencyRequestsInbox.jsx'
import RadarFeed from './features/agency/RadarFeed.jsx'
import BookerHome from './features/booker/BookerHome.jsx'
import ProducerHome from './features/producer/ProducerHome.jsx'
import ProducerReceivedPassports from './features/producer/ProducerReceivedPassports.jsx'
import ProducerConfirm from './features/producer/ProducerConfirm.jsx'
import AdminDashboard from './features/admin/AdminDashboard.jsx'
import ForgotPassword from './features/auth/ForgotPassword.jsx'
import ResetPassword from './features/auth/ResetPassword.jsx'
import OrgSettings from './features/org/OrgSettings.jsx'
import Members from './features/org/Members.jsx'
import UpgradePlan from './features/org/UpgradePlan.jsx'
import Billing from './features/org/Billing.jsx'
import AcceptInvite from './features/org/AcceptInvite.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

// Auth + role gate. A logged-in user on the wrong role's screen is bounced to
// "/" (RoleHome), which redirects them to their OWN home — no dead-ends, no loop.
function RequireRole({ role: need, children }) {
  const { user, role, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (!role) return <Navigate to={DEMO ? '/login' : '/select'} replace />
  const ok = Array.isArray(need) ? need.includes(role) : role === need
  if (!ok) return <Navigate to="/" replace />
  return children
}

// Agency-feature gate: an agency is a grown booker-org. Access is granted by org
// PLAN (isAgency) OR the legacy agency role — so an upgraded booker reaches the
// agency screens on the SAME account, no migration, no role swap.
function RequireAgency({ children }) {
  const { user, role, loading } = useAuth()
  const { isAgency } = useOrg()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (role === ROLES.AGENCY || isAgency) return children
  return <Navigate to="/" replace />
}

// Sends a logged-in user to the right home based on role.
function RoleHome() {
  const { user, role, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!role) return <Navigate to={DEMO ? '/login' : '/select'} replace />
  if (role === ROLES.OPERATOR) return <Navigate to="/admin" replace />
  if (role === ROLES.AGENCY) return <Navigate to="/agency" replace />
  if (role === ROLES.BOOKER) return <Navigate to="/discover" replace />
  if (role === ROLES.PRODUCER) return <Navigate to="/producer/received" replace />
  return <Navigate to="/artist/home" replace />
}

export default function App() {
  const { isConfigured } = useAuth()
  if (!isConfigured) return <SetupNotice />

  return (
    <Routes>
      {/* ── Public — no AppShell ──────────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/select" element={<UserTypeSelect />} />
      {/* Passport — public, no nav */}
      <Route path="/passport/:id" element={<Passport />} />
      <Route path="/passport/:id/request" element={<AvailabilityRequest />} />
      <Route path="/passport/:id/sent" element={<RequestConfirmation />} />
      {/* Producer magic-link — no login, no nav */}
      <Route path="/confirm/:token" element={<ProducerConfirm />} />
      {/* Org invite — standalone landing, may be unauthenticated */}
      <Route path="/invite/:token" element={<AcceptInvite />} />

      {/* ── Authenticated — wrapped in AppShell (persistent nav) ──────── */}
      <Route element={<AppShell />}>
        <Route path="/" element={<RoleHome />} />

        {/* universal (any authed role) */}
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/org/settings" element={<RequireAuth><OrgSettings /></RequireAuth>} />
        <Route path="/org/members" element={<RequireAuth><Members /></RequireAuth>} />
        <Route path="/org/upgrade" element={<RequireAuth><UpgradePlan /></RequireAuth>} />
        <Route path="/org/billing" element={<RequireAuth><Billing /></RequireAuth>} />

        {/* artist workspace */}
        {/* /consent kept for deep links — the wall moved inline (Onboarding step 1);
            consent now fires contextually, not as a gate before first value. */}
        <Route path="/consent" element={<RequireRole role={ROLES.ARTIST}><Navigate to="/onboarding" replace /></RequireRole>} />
        <Route path="/onboarding" element={<RequireRole role={ROLES.ARTIST}><Onboarding /></RequireRole>} />
        <Route path="/artist/home" element={<RequireRole role={ROLES.ARTIST}><ArtistDashboard /></RequireRole>} />
        <Route path="/artist/readiness" element={<RequireRole role={ROLES.ARTIST}><ArtistReadiness /></RequireRole>} />
        <Route path="/artist/claims" element={<RequireRole role={ROLES.ARTIST}><ClaimReview /></RequireRole>} />
        <Route path="/artist/offer" element={<RequireRole role={ROLES.ARTIST}><OfferPayment /></RequireRole>} />
        <Route path="/evidence/:artistId" element={<RequireRole role={ROLES.ARTIST}><EvidenceCapture /></RequireRole>} />

        {/* manager/agency workspace */}
        <Route path="/agency" element={<RequireAgency><AgencyDashboard /></RequireAgency>} />
        <Route path="/agency/requests" element={<RequireAgency><AgencyRequestsInbox /></RequireAgency>} />
        <Route path="/agency/radar" element={<RequireAgency><RadarFeed /></RequireAgency>} />

        {/* operator */}
        <Route path="/admin" element={<RequireRole role={ROLES.OPERATOR}><AdminDashboard /></RequireRole>} />

        {/* booker */}
        <Route path="/discover" element={<RequireRole role={ROLES.BOOKER}><BookerHome /></RequireRole>} />

        {/* producer workspace */}
        <Route path="/producer" element={<RequireRole role={ROLES.PRODUCER}><ProducerHome /></RequireRole>} />
        <Route path="/producer/received" element={<RequireRole role={ROLES.PRODUCER}><ProducerReceivedPassports /></RequireRole>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
