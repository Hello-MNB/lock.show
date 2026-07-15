import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './features/auth/AuthProvider.jsx'
import { useOrg } from './context/OrgContext.jsx'
import { Loading } from './components/ui.jsx'
import { ROLES, PAYMENTS_ENABLED } from './lib/constants.js'
import { DEMO } from './lib/demo.js'
import {
  ROUTES,
  homePathFor,
  requireRoleRedirect,
  requireAgencyRedirect,
  requireProductionRedirect,
} from './lib/navigation.js'

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
import PassportSelf from './features/artist/PassportSelf.jsx'
import ArtistRequests from './features/artist/ArtistRequests.jsx'
import OfferPayment from './features/artist/OfferPayment.jsx'
import EvidenceCapture from './features/evidence/EvidenceCapture.jsx'
import Passport from './features/passport/Passport.jsx'
import AvailabilityRequest from './features/passport/AvailabilityRequest.jsx'
import RequestConfirmation from './features/passport/RequestConfirmation.jsx'
import AgencyDashboard from './features/agency/AgencyDashboard.jsx'
import AgencyRequestsInbox from './features/agency/AgencyRequestsInbox.jsx'
import RadarFeed from './features/agency/RadarFeed.jsx'
import ProductionDashboard from './features/production/ProductionDashboard.jsx'
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
import ConsentBanner from './components/ConsentBanner.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

// Auth + role gate. A logged-in user on the wrong role's screen is bounced to
// "/" (RoleHome), which redirects them to their OWN home — no dead-ends, no loop.
// `role` comes from useOrg() (ROUND 4: the ACTIVE workspace's derived role), NOT
// the static useAuth() profile role — so a workspace switch actually re-gates.
function RequireRole({ role: need, children }) {
  const { user, loading: authLoading } = useAuth()
  const { role, loading: orgLoading } = useOrg()
  const loc = useLocation()
  if (authLoading || orgLoading) return <Loading />
  const redirect = requireRoleRedirect({ need, user, role, demo: DEMO })
  if (redirect === ROUTES.login) return <Navigate to={ROUTES.login} replace state={{ from: loc.pathname }} />
  if (redirect) return <Navigate to={redirect} replace />
  return children
}

// Agency-feature gate: an agency is a grown booker-org. Access is granted by org
// PLAN (isAgency) OR the (org-derived) agency role — so an upgraded booker
// reaches the agency screens on the SAME account, no migration, no role swap.
// A production-type workspace (organization.workspace_type='producer', 027) is
// its OWN screen-set (ProductionDashboard) — it never falls through to the
// generic roster/agency screen, even though its functional_role also
// normalizes to ROLES.AGENCY today.
function RequireAgency({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { role, isAgency, isProducerWorkspace, loading: orgLoading } = useOrg()
  const loc = useLocation()
  if (authLoading || orgLoading) return <Loading />
  const redirect = requireAgencyRedirect({ user, role, isAgency, isProducerWorkspace })
  if (redirect === ROUTES.login) return <Navigate to={ROUTES.login} replace state={{ from: loc.pathname }} />
  if (redirect) return <Navigate to={redirect} replace />
  return children
}

// Production-workspace gate — the counterpart of RequireAgency, gated on the
// ACTIVE org's workspace_type rather than on `role` (functional_role has no
// dedicated "producer org" value; workspace_type is the real signal, per
// migration 027 / ENTITY-ARCHITECTURE.md refactor step 5).
function RequireProduction({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { role, isAgency, isProducerWorkspace, loading: orgLoading } = useOrg()
  const loc = useLocation()
  if (authLoading || orgLoading) return <Loading />
  const redirect = requireProductionRedirect({ user, role, isAgency, isProducerWorkspace })
  if (redirect === ROUTES.login) return <Navigate to={ROUTES.login} replace state={{ from: loc.pathname }} />
  if (redirect) return <Navigate to={redirect} replace />
  return children
}

// Sends a logged-in user to the right home based on role. `role` is the
// EFFECTIVE (org-derived) role from useOrg() — this is what makes a workspace
// switch (OrgContext.switchOrg navigates here) land on the NEW workspace's home.
function RoleHome() {
  const { user, loading: authLoading } = useAuth()
  const { role, isProducerWorkspace, loading: orgLoading } = useOrg()
  if (authLoading || orgLoading) return <Loading />
  if (!user) return <Navigate to={ROUTES.login} replace />
  // Single source of truth for role→home routing (src/lib/navigation.js), so a
  // workspace switch lands on the NEW workspace's home and the contract test can
  // prove every entity's landing.
  return <Navigate to={homePathFor({ role, isProducerWorkspace, demo: DEMO })} replace />
}

export default function App() {
  const { isConfigured } = useAuth()
  if (!isConfigured) return <SetupNotice />

  return (
    <>
    <ConsentBanner />
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
        {/* IA correction: Readiness left the nav (its content lives inside the
            Radar's own readiness surface) — the route stays for deep links. */}
        <Route path="/artist/readiness" element={<RequireRole role={ROLES.ARTIST}><ArtistReadiness /></RequireRole>} />
        {/* Claim review is a panel/flow (reached from the radar next-action card
            and notifications), NOT a nav destination — the route stays for
            those deep links only; it is no longer in the artist tab bar. */}
        <Route path="/artist/claims" element={<RequireRole role={ROLES.ARTIST}><ClaimReview /></RequireRole>} />
        {/* Artist nav "Passport" tab — redirects to the artist's own real
            public passport surface (/passport/:id), the same reused pattern
            ArtistDashboard/ClaimReview already link out to. */}
        <Route path="/artist/passport" element={<RequireRole role={ROLES.ARTIST}><PassportSelf /></RequireRole>} />
        {/* Artist nav "Requests" tab — incoming availability requests. */}
        <Route path="/artist/requests" element={<RequireRole role={ROLES.ARTIST}><ArtistRequests /></RequireRole>} />
        {/* Free pilot: payment screen gated OFF (PAYMENTS_ENABLED). Route redirects home
            when payments are dormant — no payment surface reachable at launch. */}
        <Route path="/artist/offer" element={<RequireRole role={ROLES.ARTIST}>{PAYMENTS_ENABLED ? <OfferPayment /> : <Navigate to="/artist/home" replace />}</RequireRole>} />
        <Route path="/evidence/:artistId" element={<RequireRole role={ROLES.ARTIST}><EvidenceCapture /></RequireRole>} />

        {/* manager/agency workspace */}
        <Route path="/agency" element={<RequireAgency><AgencyDashboard /></RequireAgency>} />
        <Route path="/agency/requests" element={<RequireAgency><AgencyRequestsInbox /></RequireAgency>} />
        <Route path="/agency/radar" element={<RequireAgency><RadarFeed /></RequireAgency>} />

        {/* production-company workspace (organization.workspace_type='producer', 027) —
            same component for all three sections; it reads the path to pick the
            active tab (Team · Events · Requests), keeping real per-route nav
            highlighting without three separate screen components. */}
        <Route path="/production" element={<RequireProduction><ProductionDashboard /></RequireProduction>} />
        <Route path="/production/events" element={<RequireProduction><ProductionDashboard /></RequireProduction>} />
        <Route path="/production/requests" element={<RequireProduction><ProductionDashboard /></RequireProduction>} />

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
    </>
  )
}
