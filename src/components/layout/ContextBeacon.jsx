import { useAuth } from '../../features/auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useAdminAccess } from '../../context/AdminAccessContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { buildContextBeaconModel, contextRoleKey, contextWorkspaceTypeKey } from '../../lib/contextBeacon.js'

export default function ContextBeacon() {
  const { profile } = useAuth()
  const { role, activeOrg, workspaceType } = useOrg()
  const { adminMode, environmentId, exitAdmin } = useAdminAccess()
  const { T } = useLang()
  const model = buildContextBeaconModel({
    personName: profile?.full_name || profile?.email || T.org.contextPersonFallback,
    role: adminMode ? 'admin' : role,
    environmentId,
    workspaceName: adminMode ? T.org.privateAdminWorkspace : activeOrg?.name,
    workspaceType: adminMode ? 'admin' : workspaceType,
  })
  const roleLabel = T.org[contextRoleKey(model.role)] || T.org.contextRolePending
  const workspaceTypeLabel = T.org[contextWorkspaceTypeKey(model.workspaceType)] || T.org.contextWorkspaceGeneric
  const environmentLabel = model.environmentId === 'production'
    ? T.org.contextEnvironmentProduction
    : model.environmentId

  return (
    <section className="order-3 min-w-0 basis-full md:order-1 md:basis-auto md:flex-1" aria-label={T.org.contextBeaconLabel}>
      <div className="min-w-0 text-xs">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="shrink-0 font-semibold text-muted">{T.org.contextWorkspaceLabel}</span>
          <strong className="min-w-0 max-w-full break-words text-sm text-ink">{adminMode ? T.org.privateAdminWorkspace : (model.workspaceName || T.org.contextNoWorkspace)}</strong>
          <span className="shrink-0 text-faint">·</span>
          <span className="shrink-0 font-semibold text-muted">{T.org.contextRoleLabel}</span>
          <span className="shrink-0 text-ink">{roleLabel}</span>
        </p>
        <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
          <span className="shrink-0 text-faint">{T.org.contextPersonLabel}</span>
          <span className="min-w-0 max-w-full break-words">{model.personName}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0 text-faint">{T.org.contextEnvironmentLabel}</span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${adminMode ? 'bg-amber' : 'bg-accent'}`} aria-hidden="true" />
            {environmentLabel}
          </span>
          <span aria-hidden>·</span>
          <span className="min-w-0 max-w-full break-words">{workspaceTypeLabel}</span>
        </p>
      </div>
      {adminMode && (
        <button type="button" onClick={exitAdmin} className="mt-0.5 text-[10px] font-medium text-amber hover:text-ink">
          {T.org.returnToUserWorkspace}
        </button>
      )}
    </section>
  )
}
