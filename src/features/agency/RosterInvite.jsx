import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react'
import AuthScene from '../auth/AuthScene.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { authHeaders, getMyArtist } from '../../lib/db.js'
import { acceptRosterInvitation, declineRosterInvitation, getRosterInvitation } from '../../lib/rosterInvites.js'
import { savePendingReturn } from '../../lib/pendingReturn.js'
import { ErrorNote, Loading, Spinner } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

export default function RosterInvite() {
  const { token } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { T } = useLang()
  const location = useLocation()
  const navigate = useNavigate()
  const returnPath = `${location.pathname}${location.search}`
  const [invitation, setInvitation] = useState(null)
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    let current = true
    ;(async () => {
      try {
        const next = await getRosterInvitation(token)
        if (!current) return
        setInvitation(next)
        if (user) setArtist(await getMyArtist(user.id))
      } catch (nextError) {
        if (current) setError(nextError.status === 410 ? T.agency.rosterInviteUnavailable : T.agency.rosterInviteLoadError)
      } finally {
        if (current) setLoading(false)
      }
    })()
    return () => { current = false }
  }, [token, user, T.agency.rosterInviteLoadError, T.agency.rosterInviteUnavailable])

  async function accept() {
    setBusy(true); setError('')
    try {
      const result = await acceptRosterInvitation(token, { artistId: artist?.id }, await authHeaders())
      setReceipt(result.receipt)
    } catch (nextError) {
      if (nextError.code === 'artist_profile_required') {
        savePendingReturn(returnPath)
        navigate('/onboarding')
        return
      }
      setError(nextError.code === 'roster_invitation_email_mismatch'
        ? T.agency.rosterInviteWrongAccount
        : T.agency.rosterInviteActionError)
    } finally { setBusy(false) }
  }

  async function decline() {
    setBusy(true); setError('')
    try {
      const result = await declineRosterInvitation(token, await authHeaders())
      setReceipt(result.receipt)
    } catch { setError(T.agency.rosterInviteActionError) } finally { setBusy(false) }
  }

  if (loading || authLoading) return <Loading />

  return (
    <AuthScene tagline={T.agency.rosterInviteEyebrow}>
      {receipt ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-ink">
            {receipt.status === 'active' ? T.agency.rosterInviteAcceptedTitle : T.agency.rosterInviteDeclinedTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {receipt.status === 'active' ? T.agency.rosterInviteAcceptedBody : T.agency.rosterInviteDeclinedBody}
          </p>
          <Link to="/" className="btn-primary mt-6 block">{T.agency.rosterInviteContinue}</Link>
        </div>
      ) : invitation ? (
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><UserPlus size={21} aria-hidden="true" /></span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">{T.agency.rosterInviteEyebrow}</p>
              <h1 className="text-2xl font-bold text-ink">{T.agency.rosterInviteTitle}</h1>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted">
            {T.agency.rosterInviteBody(invitation.organizationName, invitation.artistName)}
          </p>
          <div className="my-5 rounded-2xl bg-surface2 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-ink">{T.agency.rosterInviteAccessTitle}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(invitation.scope || ['view']).map((scope) => (
                    <span key={scope} className="chip border border-line bg-bg px-2 py-1 text-[11px] text-ink">
                      {T.access[`scope${scope.charAt(0).toUpperCase()}${scope.slice(1)}`] || scope}
                    </span>
                  ))}
                </div>
                {invitation.territory && <p className="mt-2 text-xs text-muted">{T.agency.inviteTerritoryLabel}: {invitation.territory}</p>}
              </div>
            </div>
          </div>
          <p className="mb-5 text-xs leading-relaxed text-muted">{T.agency.rosterInviteBoundary}</p>
          <ErrorNote>{error}</ErrorNote>

          {!user ? (
            <div className="space-y-2">
              <Link to="/signup?role=artist" state={{ from: returnPath, email: invitation.invitedEmail }}
                onClick={() => savePendingReturn(returnPath)} className="btn-primary block text-center">
                {T.agency.rosterInviteCreateAccount}
              </Link>
              <Link to="/login" state={{ from: returnPath, email: invitation.invitedEmail }}
                onClick={() => savePendingReturn(returnPath)} className="btn-ghost block text-center">
                {T.agency.rosterInviteSignIn}
              </Link>
            </div>
          ) : !artist ? (
            <button className="btn-primary w-full" onClick={() => { savePendingReturn(returnPath); navigate('/onboarding') }}>
              {T.agency.rosterInviteCreateArtist}
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="btn-primary flex-1" disabled={busy} onClick={accept}>{busy ? <Spinner /> : T.agency.rosterInviteAccept}</button>
              <button className="btn-ghost" disabled={busy} onClick={decline}>{T.agency.rosterInviteDecline}</button>
            </div>
          )}
        </div>
      ) : (
        <div><ErrorNote>{error || T.agency.rosterInviteLoadError}</ErrorNote><Link to="/" className="btn-ghost mt-4 block text-center">{T.common.back}</Link></div>
      )}
    </AuthScene>
  )
}

