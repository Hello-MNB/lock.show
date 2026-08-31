import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'
import {
  getMyMemberships,
  getActiveContext,
  preflightActiveContextSwitch,
  commitActiveContextSwitch,
  getContextSwitchReceipt,
  getContextSwitchOutcome,
} from '../lib/orgs.js'
import { preflightContextSwitch, commitContextSwitch, recoverContextSwitch } from '../lib/contextSwitch.js'
import { useLang } from './LangContext.jsx'
import { ROLES } from '../lib/constants.js'
import { logEvent, EVENTS } from '../lib/analytics.js'

// Active-organization context. The org is the tenant; this exposes which org the
// person is acting in, their org_role, and the plan (drives agency-feature unlock).
//
// ROUND 4 canon (person → workspace → role): `role` here is the EFFECTIVE
// nav/routing role, derived from the ACTIVE workspace's role_assignment
// (functional_role), NOT the static global profile role from useAuth(). Every
// nav/route consumer (App.jsx RequireRole/RoleHome, SideNav, BottomNav,
// ContextSwitcher) should read `role` from HERE, not from useAuth() — that is
// what makes switching workspaces actually recompute the screen-set instead of
// only moving a highlighted pill in the switcher sheet.
const OrgCtx = createContext(null)
export const useOrg = () => useContext(OrgCtx) || {}

const ACTIVE_ORG_KEY = 'gigproof_active_org_id'

// Base (profile) roles whose EFFECTIVE role is recomputed from the active
// workspace's functional_role. Per the entity model (spec §3), role derives from
// the OrgContext, not the static profile field. OPERATOR is deliberately excluded
// — it is a platform role, not a workspace membership, and must stay operator.
// booker/producer are INCLUDED (D2 fix): a base-role booker or producer who
// creates or switches INTO an agency/production workspace was previously
// dead-ended — the pill moved but the screen-set didn't, because their effective
// role was never recomputed. The derivation below only changes behavior when the
// active membership's functional_role DIFFERS from the base role (i.e. an actual
// switch); a membership-less account has no active.functional_role and falls back
// to authRole, so those personas are unaffected.
const ORG_DERIVED_ROLES = [ROLES.ARTIST, ROLES.AGENCY, ROLES.BOOKER, ROLES.PRODUCER]

export function OrgProvider({ children }) {
  const { T } = useLang()
  const { user, role: authRole } = useAuth()
  const nav = useNavigate()
  const [memberships, setMemberships] = useState([])
  const [activeOrgId, setActiveOrgIdState] = useState(null)
  const [contextVersion, setContextVersion] = useState(0)
  const [contextError, setContextError] = useState('')
  const [loading, setLoading] = useState(true)
  const appliedReceiptIds = useRef(new Set())
  const [contextUnresolved, setContextUnresolved] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const unresolvedRef = useRef(false)
  const unresolvedRequestRef = useRef(null)
  const recoveringRef = useRef(false)
  const contentRef = useRef(null)
  const recoveryButtonRef = useRef(null)
  const previousFocusRef = useRef(null)
  const loadGeneration = useRef(0)
  const commitGeneration = useRef(0)

  const markUnresolved = useCallback((request) => {
    if (request) unresolvedRequestRef.current = request
    if (!unresolvedRef.current) previousFocusRef.current = document.activeElement
    unresolvedRef.current = true
    loadGeneration.current += 1
    // Freeze synchronously, before React's next render. Keep the subtree mounted
    // so dirty fields/drafts survive failed readbacks; stale labels are hidden.
    if (contentRef.current) {
      contentRef.current.inert = true
      contentRef.current.hidden = true
    }
    setContextUnresolved(true)
  }, [])

  const markResolved = useCallback(() => {
    unresolvedRef.current = false
    unresolvedRequestRef.current = null
    if (contentRef.current) { contentRef.current.inert = false; contentRef.current.hidden = false }
    setContextUnresolved(false)
  }, [])

  useEffect(() => {
    if (contextUnresolved) recoveryButtonRef.current?.focus()
  }, [contextUnresolved])

  const load = useCallback(async () => {
    if (unresolvedRef.current) return { ok: false, reason: 'uncertain' }
    const generation = ++loadGeneration.current
    if (!user) {
      setMemberships([]); setActiveOrgIdState(null); setContextVersion(0); setContextError(''); setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [m, serverContext] = await Promise.all([getMyMemberships(), getActiveContext()])
      if (generation !== loadGeneration.current) return
      setMemberships(m)
      const serverActive = serverContext?.organizationId || null
      const serverActiveIsEligible = serverActive && m.some((item) => item.organization?.id === serverActive)
      setActiveOrgIdState(serverActiveIsEligible ? serverActive : null)
      setContextVersion(Number(serverContext?.contextVersion || 0))
      setContextError(serverActive && !serverActiveIsEligible ? 'not_available' : '')
      try {
        if (serverActiveIsEligible) localStorage.setItem(ACTIVE_ORG_KEY, serverActive)
        else localStorage.removeItem(ACTIVE_ORG_KEY)
      } catch { /* local cache is never authority */ }
    } catch {
      if (generation !== loadGeneration.current) return
      setMemberships([])
      setActiveOrgIdState(null)
      setContextError('load_failed')
    } finally {
      if (generation === loadGeneration.current) setLoading(false)
    }
  }, [user, authRole])

  useEffect(() => { load() }, [load])

  const recoverOrgContext = useCallback(async () => {
    if (recoveringRef.current) return { ok: false, reason: 'uncertain' }
    recoveringRef.current = true
    setRecovering(true)
    try {
      return await recoverContextSwitch({
        ...unresolvedRequestRef.current,
        resolveCommitOutcome: getContextSwitchOutcome,
        readCurrentContext: async () => {
          const [currentMemberships, current] = await Promise.all([getMyMemberships(), getActiveContext()])
          if (!currentMemberships.some((item) => item.organization?.id === current?.organizationId)) {
            throw new Error('context_not_available')
          }
          return { ...current, memberships: currentMemberships }
        },
        applyContext: (current) => {
          setMemberships(current.memberships)
          setActiveOrgIdState(current.organizationId)
          setContextVersion(current.contextVersion)
          setContextError('')
          setLoading(false)
          try { localStorage.setItem(ACTIVE_ORG_KEY, current.organizationId) } catch { /* cache only */ }
          // Only successful authoritative re-entry retires older pending commit
          // continuations. Failed/pending recovery leaves their generation live.
          commitGeneration.current += 1
          markResolved()
          requestAnimationFrame(() => {
            const previous = previousFocusRef.current
            if (previous?.isConnected && !previous.disabled) previous.focus()
            else contentRef.current?.querySelector('button:not([disabled]), a[href]')?.focus()
          })
        },
        markUnresolved,
      })
    } finally {
      recoveringRef.current = false
      setRecovering(false)
    }
  }, [markUnresolved, markResolved])

  const preflightOrgSwitch = useCallback(async (orgId, { artistId = null } = {}) => (
    unresolvedRef.current ? { ok: false, reason: 'uncertain' } : preflightContextSwitch({
      targetOrganizationId: orgId,
      targetArtistId: artistId,
      currentContext: { organizationId: activeOrgId, contextVersion },
      requestPreflight: preflightActiveContextSwitch,
    })
  ), [activeOrgId, contextVersion])

  const commitOrgSwitch = useCallback(async (preflight, {
    idempotencyKey,
    announce,
    focusReturn,
  } = {}) => {
    if (unresolvedRef.current) return { ok: false, reason: 'uncertain' }
    const generation = commitGeneration.current
    return commitContextSwitch({
      preflight,
      idempotencyKey,
      isCurrent: () => generation === commitGeneration.current,
      requestCommit: commitActiveContextSwitch,
      resolveReceipt: getContextSwitchReceipt,
      readCurrentContext: getActiveContext,
      markUnresolved,
      markResolved,
      applyReceipt: (receipt) => {
        loadGeneration.current += 1
        setActiveOrgIdState(receipt.activeOrganizationId)
        setContextVersion(receipt.contextVersion)
        setContextError('')
        appliedReceiptIds.current.add(receipt.receiptId)
      },
      persistLocal: (orgId) => localStorage.setItem(ACTIVE_ORG_KEY, orgId),
      announce,
      logCommitted: (receipt) => logEvent(EVENTS.WORKSPACE_SWITCHED, {
        org_id: receipt.activeOrganizationId,
        receipt_id: receipt.receiptId,
        context_version: receipt.contextVersion,
      }),
      navigate: () => nav('/'),
      focusReturn,
      receiptAlreadyApplied: (receiptId) => appliedReceiptIds.current.has(receiptId),
    })
  }, [nav, markUnresolved, markResolved])

  // Compatibility path for the post-create flow. Normal user switching uses
  // the visible preflight/confirm UI below; this still preserves the same
  // server-authoritative preflight → receipt boundary.
  const switchOrg = useCallback(async (orgId, options = {}) => {
    const preflight = await preflightOrgSwitch(orgId, options)
    if (!preflight.ok) return preflight
    const idempotencyKey = globalThis.crypto?.randomUUID?.()
    if (!idempotencyKey) return { ok: false, reason: 'idempotency_unavailable' }
    return commitOrgSwitch(preflight, { idempotencyKey })
  }, [preflightOrgSwitch, commitOrgSwitch])

  const active = memberships.find((m) => m.organization?.id === activeOrgId) || null
  const plan = active?.organization?.plan || 'solo'
  // workspace_type (migration 027) — a SEPARATE axis from functional_role/plan:
  // a production company (e.g. INSOMNIA TLV) has functional_role='agency' (same
  // nav-role family as a booking/management agency) but workspace_type='producer'
  // — it runs its own events/lineups, so it gets the production nav set instead
  // of the generic roster screen. Orgs created before 027 (or in DEMO without an
  // explicit value) default to 'artist', matching the migration's own backfill.
  const workspaceType = active?.organization?.workspace_type || 'artist'
  const isProducerWorkspace = workspaceType === 'producer'

  // Effective role — recomputed from the ACTIVE workspace every time
  // activeOrgId changes, not read once from a static profile field.
  const role = (authRole && ORG_DERIVED_ROLES.includes(authRole) && active?.functional_role)
    ? active.functional_role
    : authRole

  const value = {
    loading,
    memberships,
    activeOrgId: active?.organization?.id || null,
    contextVersion,
    contextError,
    contextUnresolved,
    activeOrg: active?.organization || null,
    orgRole: active?.org_role || null,
    role,
    plan,
    workspaceType,
    isProducerWorkspace,
    isAgency: ['agency', 'agency_plus'].includes(plan),
    isOwner: active?.org_role === 'owner',
    isAdmin: ['owner', 'admin'].includes(active?.org_role),
    switchOrg,
    preflightOrgSwitch,
    commitOrgSwitch,
    reload: load,
  }
  return (
    <OrgCtx.Provider value={value}>
      <div ref={contentRef} hidden={contextUnresolved} inert={contextUnresolved ? '' : undefined}>
        {children}
      </div>
      {contextUnresolved && (
        <section role="alertdialog" aria-modal="true" aria-labelledby="context-recovery-title"
          aria-describedby="context-recovery-description" className="fixed inset-0 z-[100] overflow-y-auto bg-bg p-4">
          <div className="card mx-auto mt-8 w-full min-w-0 max-w-md space-y-4">
            <h1 id="context-recovery-title" className="break-words text-lg font-semibold text-ink">{T.org.switchUnresolvedTitle}</h1>
            <p id="context-recovery-description" role="status" className="break-words text-sm text-muted">{T.org.switchErrorUncertain}</p>
            <button ref={recoveryButtonRef} type="button" className="btn-primary w-full whitespace-normal break-words"
              aria-disabled={recovering} onClick={recoverOrgContext}
              onKeyDown={(event) => { if (event.key === 'Tab') event.preventDefault() }}>
              {recovering ? T.org.switchRecovering : T.org.switchRecover}
            </button>
          </div>
        </section>
      )}
    </OrgCtx.Provider>
  )
}
