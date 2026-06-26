import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './features/auth/AuthProvider.jsx'
import { Loading } from './components/ui.jsx'

import SetupNotice from './features/setup/SetupNotice.jsx'
import Login from './features/auth/Login.jsx'
import Signup from './features/auth/Signup.jsx'
import UserTypeSelect from './features/auth/UserTypeSelect.jsx'
import ConsentLegal from './features/auth/ConsentLegal.jsx'
import Settings from './features/auth/Settings.jsx'
import Onboarding from './features/artist/Onboarding.jsx'
import ArtistDashboard from './features/artist/ArtistDashboard.jsx'
import ArtistReadiness from './features/artist/ArtistReadiness.jsx'
import ClaimReview from './features/artist/ClaimReview.jsx'
import EvidenceCapture from './features/evidence/EvidenceCapture.jsx'
import Passport from './features/passport/Passport.jsx'
import AvailabilityRequest from './features/passport/AvailabilityRequest.jsx'
import RequestConfirmation from './features/passport/RequestConfirmation.jsx'
import AgencyDashboard from './features/agency/AgencyDashboard.jsx'
import AgencyRequestsInbox from './features/agency/AgencyRequestsInbox.jsx'
import BookerHome from './features/booker/BookerHome.jsx'
import ForgotPassword from './features/auth/ForgotPassword.jsx'
import ResetPassword from './features/auth/ResetPassword.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

// Sends a logged-in user to the right home based on role.
function RoleHome() {
  const { user, role, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!role) return <Navigate to="/select" replace />
  if (role === 'agency') return <Navigate to="/agency" replace />
  if (role === 'booker') return <Navigate to="/discover" replace />
  return <Navigate to="/artist/home" replace />
}

export default function App() {
  const { isConfigured } = useAuth()
  if (!isConfigured) return <SetupNotice />

  return (
    <Routes>
      <Route path="/" element={<RoleHome />} />

      {/* public auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/select" element={<UserTypeSelect />} />

      {/* universal settings (any role) */}
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

      {/* artist flow */}
      <Route path="/consent" element={<RequireAuth><ConsentLegal /></RequireAuth>} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="/artist/home" element={<RequireAuth><ArtistDashboard /></RequireAuth>} />
      <Route path="/artist/readiness" element={<RequireAuth><ArtistReadiness /></RequireAuth>} />
      <Route path="/artist/claims" element={<RequireAuth><ClaimReview /></RequireAuth>} />
      <Route path="/evidence/:artistId" element={<RequireAuth><EvidenceCapture /></RequireAuth>} />

      {/* agency flow */}
      <Route path="/agency" element={<RequireAuth><AgencyDashboard /></RequireAuth>} />
      <Route path="/agency/requests" element={<RequireAuth><AgencyRequestsInbox /></RequireAuth>} />

      {/* public — the wedge */}
      <Route path="/passport/:id" element={<Passport />} />
      <Route path="/passport/:id/request" element={<AvailabilityRequest />} />
      <Route path="/passport/:id/sent" element={<RequestConfirmation />} />
      {/* booker discovery deferred post-validation; bookers open a passport via link */}
      <Route path="/discover" element={<RequireAuth><BookerHome /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
