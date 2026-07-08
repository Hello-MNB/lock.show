import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { acceptInvite, getInviteInfo } from '../../lib/orgs.js'
import { PageShell, Wordmark, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const roleLabel = (r, T) => ({ owner: T.org.roleOwner, admin: T.org.roleAdmin, member: T.org.roleMember }[r] || r)

// O4 — Accept invite. Shows who/what/where; if signed out, routes to auth with the
// email pre-filled; on accept, greets and lands in the org context.
export default function AcceptInvite() {
  const { T } = useLang()
  const { token } = useParams()
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const [info, setInfo] = useState(null)
  const [infoLoading, setInfoLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => { (async () => {
    try { setInfo(await getInviteInfo(token)) } catch { setInfo(null) } finally { setInfoLoading(false) }
  })() }, [token])

  async function accept() {
    setBusy(true); setError('')
    try { await acceptInvite(token); setDone(true); setTimeout(() => nav('/'), 1600) }
    catch (e) { setError(T.org.acceptInvalid) } finally { setBusy(false) }
  }

  if (loading || infoLoading) return <Loading />
  const orgName = info?.org_name || ''

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-6"><Wordmark className="justify-center mb-3" /><h1 className="font-display text-xl font-bold text-ink">{T.org.acceptTitle}</h1></div>
      <div className="card text-center">
        <ErrorNote>{error}</ErrorNote>
        {done ? (
          <p className="text-accent font-bold text-lg">{T.org.welcomeTeam(orgName)}</p>
        ) : !info ? (
          <p className="text-sm text-amber">{T.org.inviteExpired}</p>
        ) : (
          <>
            <p className="text-ink mb-4">{T.org.invitedByLine(info.inviter_name, orgName, roleLabel(info.org_role, T))}</p>
            {!user ? (
              <>
                <p className="text-sm text-muted mb-3">{T.org.acceptNeedAccount}</p>
                <Link to="/signup" state={{ from: `/invite/${token}`, email: info.invited_email }} className="btn-primary block mb-2">{T.signup.cta}</Link>
                <Link to="/login" state={{ from: `/invite/${token}` }} className="btn-ghost block">{T.login.cta}</Link>
              </>
            ) : (
              <button className="btn-primary w-full" onClick={accept} disabled={busy}>{busy ? <Spinner /> : T.org.join}</button>
            )}
          </>
        )}
      </div>
    </PageShell>
  )
}
