import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getMyArtistForWorkspace } from '../../lib/db.js'
import { PageShell, Loading } from '../../components/ui.jsx'
import { EvidenceActionWorkbench } from '../evidence/EvidenceCapture.jsx'

// Claim review is an authoritative action surface, not direct claim-table edits.
// Legacy content stays reachable in the workbench's read-only source review.
export default function ClaimReview() {
  const { user } = useAuth()
  const { activeOrgId, contextVersion, contextUnresolved } = useOrg()
  const { T } = useLang()
  const [query] = useSearchParams()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const generation = useRef(0)
  useEffect(() => {
    const operation = ++generation.current
    setLoading(true)
    getMyArtistForWorkspace(user?.id, activeOrgId).then(value => {
      if (operation === generation.current) setArtist(value)
    }).catch(() => { if (operation === generation.current) setArtist(null) })
      .finally(() => { if (operation === generation.current) setLoading(false) })
    return () => { generation.current++ }
  }, [user?.id, activeOrgId, contextVersion])
  if (loading) return <Loading />
  return <PageShell>{artist && !contextUnresolved && artist.owner_organization_id === activeOrgId
    ? <EvidenceActionWorkbench artistId={artist.id} actId={query.get('act') || localStorage.getItem('gigproof_active_act')} />
    : <p role="status">{T.evidenceActions.contextRequired}</p>}</PageShell>
}
