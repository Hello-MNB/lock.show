import { useEffect, useRef, useState } from 'react'
import { useOrg } from '../../context/OrgContext.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { BottomSheet, Spinner } from '../../components/ui.jsx'
import { createWorkspace } from '../../lib/orgs.js'
import { ROLES } from '../../lib/constants.js'
import { useAdminAccess } from '../../context/AdminAccessContext.jsx'
import { cancelContextSwitch } from '../../lib/contextSwitch.js'

const orgRoleLabel = (r, T) => ({ owner: T.org.roleOwner, admin: T.org.roleAdmin, member: T.org.roleMember }[r] || r)

function workspaceTypeLabel(role, isAgency, T, isProducerWorkspace) {
  const n = T.nav
  if (role === ROLES.ARTIST) return n.workspaceArtist
  if ((role === ROLES.AGENCY || isAgency) && isProducerWorkspace) return n.workspaceProduction
  if (role === ROLES.AGENCY || isAgency) return n.workspaceManager
  if (role === ROLES.PRODUCER) return n.workspaceProducer
  if (role === ROLES.BOOKER) return n.workspaceBooker
  if (role === ROLES.OPERATOR) return n.workspaceOperator
  return T.org.entitySolo
}

// The three workspace types a person can self-create (A2/N12). UI vocabulary —
// orgs.createWorkspace maps these onto the migration-027 DB values
// (artist / management / producer).
const NEW_WORKSPACE_TYPES = ['artist', 'agency', 'production']

// O3 — Workspace / account switcher. Canon ROUND 4: person → workspace →
// role; switching lives TOP-RIGHT (never bottom-left, never a re-registration).
// Rendered once from AppShell's top bar, on every breakpoint — always visible
// (not just when multi-org), since it is also the "add a workspace" surface.
//
// G3 (A2/N12): "+ New workspace" opens a small IN-PLACE form (name + type)
// that calls the real creation path (orgs.createWorkspace → create_workspace
// RPC, migration 035). BOUNDARY (DEPLOY-GAPS G3 testable condition): creating
// or switching NEVER transfers evidence, billing or ArtistAccess between
// workspaces — the new workspace starts empty; switching derives client state
// only from the authoritative server receipt (see OrgContext.switchOrg).
export default function ContextSwitcher() {
  const { T } = useLang()
  // role: the ACTIVE workspace's effective role (ROUND 4), so the label under
  // the avatar follows whichever workspace is selected right now, not a single
  // static profile role.
  const {
    memberships, activeOrgId, switchOrg, preflightOrgSwitch, commitOrgSwitch,
    contextError, contextUnresolved, role, isProducerWorkspace, reload,
  } = useOrg()
  const { profile } = useAuth()
  const { allowed: adminAllowed, adminMode, enterAdmin, exitAdmin } = useAdminAccess()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [wsName, setWsName] = useState('')
  const [wsType, setWsType] = useState('artist')
  const [wsBusy, setWsBusy] = useState(false)
  const [wsError, setWsError] = useState('')
  const [pendingSwitch, setPendingSwitch] = useState(null)
  const [switchBusy, setSwitchBusy] = useState(false)
  const [switchError, setSwitchError] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const lastTriggerRef = useRef(null)
  const openTriggerRef = useRef(null)
  const sheetContentRef = useRef(null)
  const switchGenerationRef = useRef(0)

  useEffect(() => {
    // Both entering uncertainty and authoritative re-entry retire messages from
    // the old request. Keep the draft, but never show "paused" after recovery.
    switchGenerationRef.current += 1
    setSwitchError('')
    if (!contextUnresolved) setSwitchBusy(false)
    if (contextUnresolved) {
      setPendingSwitch(null)
      setOpen(false)
      setLiveMessage('')
    }
  }, [contextUnresolved])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      sheetContentRef.current?.querySelector('button:not([disabled]), input:not([disabled])')?.focus()
    })
  }, [open, pendingSwitch])

  const active = memberships?.find((m) => m.organization?.id === activeOrgId)
  const isAgency = ['agency', 'agency_plus'].includes(active?.organization?.plan)
  const typeLabel = adminMode ? T.org.privateAdminWorkspace : workspaceTypeLabel(role, isAgency, T, isProducerWorkspace)
  const initial = (profile?.full_name || 'G').trim().charAt(0).toUpperCase() || 'G'

  const typeWord = (t) => ({
    artist: T.org.newWorkspaceTypeArtist,
    agency: T.org.newWorkspaceTypeAgency,
    production: T.org.newWorkspaceTypeProduction,
  }[t])

  function closeSheet() {
    if (switchBusy) return
    setOpen(false)
    setCreating(false)
    setWsError('')
    setPendingSwitch(null)
    setSwitchError('')
    requestAnimationFrame(() => openTriggerRef.current?.focus())
  }

  function restoreTriggerFocus() {
    requestAnimationFrame(() => {
      const target = lastTriggerRef.current?.isConnected ? lastTriggerRef.current : openTriggerRef.current
      target?.focus()
    })
  }

  function containKeyboardFocus(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (pendingSwitch) cancelPendingSwitch()
      else closeSheet()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = Array.from(sheetContentRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ) || []).filter((element) => element.getClientRects().length)
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus()
    }
  }

  function switchErrorText(reason) {
    if (reason === 'offline') return T.org.switchErrorOffline
    if (reason === 'stale') return T.org.switchErrorStale
    if (reason === 'uncertain') return T.org.switchErrorUncertain
    if (reason === 'committed_refresh_required') return T.org.switchErrorRefresh
    return T.org.switchErrorGeneric
  }

  async function beginSwitch(membership, trigger) {
    const targetId = membership.organization?.id
    if (!targetId || targetId === activeOrgId || switchBusy) return
    lastTriggerRef.current = trigger
    setSwitchBusy(true)
    setSwitchError('')
    setLiveMessage(T.org.switchPreparing)
    try {
      const preflight = await preflightOrgSwitch(targetId)
      if (!preflight.ok) {
        setSwitchError(switchErrorText(preflight.reason))
        setLiveMessage('')
        restoreTriggerFocus()
        return
      }
      const key = globalThis.crypto?.randomUUID?.()
      if (!key) {
        setSwitchError(T.org.switchErrorGeneric)
        restoreTriggerFocus()
        return
      }
      setPendingSwitch({ ...preflight, idempotencyKey: key, membership })
      setLiveMessage(T.org.switchPreflightTitle)
    } catch {
      setSwitchError(T.org.switchErrorGeneric)
      setLiveMessage('')
      restoreTriggerFocus()
    } finally {
      setSwitchBusy(false)
    }
  }

  function cancelPendingSwitch() {
    setPendingSwitch(null)
    setSwitchError('')
    setLiveMessage('')
    cancelContextSwitch({ focusReturn: restoreTriggerFocus })
  }

  async function confirmSwitch() {
    if (!pendingSwitch || switchBusy) return
    const generation = switchGenerationRef.current
    setSwitchBusy(true)
    setSwitchError('')
    setLiveMessage(T.org.switchCommitting)
    try {
      const result = await commitOrgSwitch(pendingSwitch, {
        idempotencyKey: pendingSwitch.idempotencyKey,
        announce: () => setLiveMessage(T.org.switchSuccess(pendingSwitch.targetOrganizationName)),
        focusReturn: restoreTriggerFocus,
      })
      if (generation !== switchGenerationRef.current) return
      if (!result.ok) {
        setSwitchError(switchErrorText(result.reason))
        setLiveMessage('')
        if (result.reason === 'stale') {
          setPendingSwitch(null)
          await reload()
        }
        return
      }
      setPendingSwitch(null)
      setCreating(false)
      setOpen(false)
    } catch {
      if (generation !== switchGenerationRef.current) return
      setSwitchError(T.org.switchErrorUncertain)
      setLiveMessage('')
      restoreTriggerFocus()
    } finally {
      if (generation === switchGenerationRef.current) setSwitchBusy(false)
    }
  }

  async function submitCreate(e) {
    e.preventDefault()
    if (!wsName.trim() || wsBusy) return
    setWsBusy(true); setWsError('')
    try {
      const res = await createWorkspace({ name: wsName.trim(), type: wsType })
      if (res?.ok === false) {
        // Honest soft-fail (same contract as the 027/032 wrappers): nothing was
        // created — say so instead of pretending, never a silent dead end.
        setWsError(res.reason === 'migration-035-required' ? T.org.newWorkspaceMigrationNote : T.org.newWorkspaceError)
        return
      }
      await reload() // membership list now includes the new (empty) workspace
      setWsName(''); setWsType('artist')
      const switched = await switchOrg(res.id)
      if (!switched?.ok) {
        setWsError(switchErrorText(switched?.reason))
        return
      }
      closeSheet()
    } catch {
      setWsError(T.org.newWorkspaceError)
    } finally {
      setWsBusy(false)
    }
  }

  return (
    <div className="relative">
      <button
        ref={openTriggerRef}
        onClick={() => setOpen(true)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="tap-target flex items-center gap-2 rounded-full border border-line bg-surface py-1 pe-3 ps-1 transition hover:border-accent/50"
      >
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-bold text-ink">
          {initial}
        </span>
        <span className="hidden text-start sm:block">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">{typeLabel}</span>
          {active?.organization?.name && (
            <span className="block max-w-[140px] truncate text-xs font-semibold text-ink">{active.organization.name}</span>
          )}
        </span>
        <span aria-hidden className="text-muted">▾</span>
      </button>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{liveMessage}</p>

      <BottomSheet open={open} onClose={closeSheet} title={T.org.switchOrg}>
        <div ref={sheetContentRef} className="max-h-[calc(100vh-8rem)] min-w-0 space-y-2 overflow-x-hidden overflow-y-auto" onKeyDown={containKeyboardFocus}>
          {profile?.full_name && <p className="mb-1 truncate text-sm font-semibold text-ink">{profile.full_name}</p>}
          {(switchError || contextError) && (
            <p role="alert" className="rounded-xl border border-amber/50 bg-amber/10 p-3 text-sm text-ink">
              {switchError || T.org.switchErrorGeneric}
            </p>
          )}
          {pendingSwitch ? (
            <section className="card max-h-[calc(100vh-9rem)] w-full min-w-0 max-w-full space-y-3 overflow-x-hidden overflow-y-auto text-start" aria-labelledby="context-switch-preflight-title">
              <div>
                <p id="context-switch-preflight-title" className="text-sm font-semibold text-ink">
                  {T.org.switchPreflightTitle}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {T.org.switchPreflightBody(pendingSwitch.targetOrganizationName)}
                </p>
              </div>
              <dl className="grid min-w-0 grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div className="min-w-0 rounded-xl bg-surface2 p-2.5">
                  <dt className="text-faint">{T.org.switchFrom}</dt>
                  <dd className="mt-0.5 break-words font-semibold text-ink">{active?.organization?.name}</dd>
                </div>
                <div className="min-w-0 rounded-xl bg-surface2 p-2.5">
                  <dt className="text-faint">{T.org.switchTo}</dt>
                  <dd className="mt-0.5 break-words font-semibold text-ink">{pendingSwitch.targetOrganizationName}</dd>
                </div>
              </dl>
              <p className="text-xs leading-relaxed text-muted">{T.org.switchPreserveNote}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary min-w-0 flex-1 whitespace-normal break-words" disabled={switchBusy} onClick={confirmSwitch}>
                  {switchBusy ? <><Spinner /> <span className="sr-only">{T.org.switchCommitting}</span></> : T.org.switchConfirm}
                </button>
                <button type="button" className="btn-ghost min-w-0 flex-1 whitespace-normal break-words" disabled={switchBusy} onClick={cancelPendingSwitch}>
                  {T.common.cancel}
                </button>
              </div>
            </section>
          ) : adminMode ? (
            <button type="button" onClick={() => { exitAdmin(); closeSheet() }} className="card w-full text-start">
              <p className="text-sm font-semibold text-ink">{T.org.returnToUserWorkspace}</p>
              <p className="text-xs text-muted">{T.org.adminEnvironmentProduction}</p>
            </button>
          ) : memberships.map((m) => {
            const isActive = m.organization?.id === activeOrgId
            return (
              <button
                key={m.organization?.id}
                type="button"
                aria-current={isActive ? 'true' : undefined}
                disabled={isActive || switchBusy}
                onClick={(event) => beginSwitch(m, event.currentTarget)}
                className={`card w-full text-start flex items-center justify-between ${isActive ? 'border-accent' : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium truncate">{m.organization?.name}</p>
                  <p className="text-xs text-muted">{orgRoleLabel(m.org_role, T)}</p>
                </div>
                {isActive && <span className="ms-2 shrink-0 text-xs font-semibold text-accent">✓ {T.org.switchActive}</span>}
              </button>
            )
          })}

          {!pendingSwitch && !adminMode && adminAllowed && (
            <button type="button" onClick={async () => { await enterAdmin(); closeSheet() }} className="card w-full text-start border-amber/40">
              <p className="text-sm font-semibold text-ink">{T.org.enterPrivateAdmin}</p>
              <p className="text-xs text-muted">{T.org.adminEnvironmentProduction}</p>
            </button>
          )}

          {/* ── G3 · A2/N12 — real workspace creation, in place ── */}
          {!pendingSwitch && !adminMode && (creating ? (
            <form onSubmit={submitCreate} className="card space-y-3 text-start">
              <p className="text-sm font-semibold text-ink">{T.org.newWorkspaceTitle}</p>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">{T.org.newWorkspaceNameLabel}</span>
                <input className="field" value={wsName} onChange={(e) => setWsName(e.target.value)} maxLength={80} />
              </label>
              <div>
                <span className="mb-1 block text-xs text-muted">{T.org.newWorkspaceTypeLabel}</span>
                <div className="flex gap-1.5" role="radiogroup" aria-label={T.org.newWorkspaceTypeLabel}>
                  {NEW_WORKSPACE_TYPES.map((t) => (
                    <button key={t} type="button" role="radio" aria-checked={wsType === t}
                      onClick={() => setWsType(t)}
                      className={`chip min-h-[36px] flex-1 border px-2 py-1 text-xs transition ${
                        wsType === t ? 'border-accent bg-accent/10 font-semibold text-ink' : 'border-line bg-surface2 text-muted'}`}>
                      {typeWord(t)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Boundary, stated to the user: nothing moves between workspaces. */}
              <p className="text-[11px] leading-relaxed text-faint">{T.org.newWorkspaceEmptyNote}</p>
              {wsError && <p className="text-xs text-amber">{wsError}</p>}
              <div className="flex gap-2">
                <button className="btn-primary flex-1" disabled={wsBusy || !wsName.trim()}>
                  {wsBusy ? <Spinner /> : T.org.newWorkspaceCreate}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setCreating(false); setWsError('') }}>
                  {T.common.cancel}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-1.5 block w-full py-1.5 text-center text-xs text-muted transition hover:text-accent"
            >
              {T.nav.addWorkspace}
            </button>
          ))}
          <p className="mt-1 text-center text-[10px] text-faint">{T.org.switchNote}</p>
        </div>
      </BottomSheet>
    </div>
  )
}
