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
    <section className="min-w-0 basis-full md:basis-auto md:flex-1" aria-label={T.org.contextBeaconLabel}>
      <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-1 text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-faint">{T.org.contextPersonLabel}</span>
          <span className="block truncate font-semibold text-ink">{model.personName}</span>
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-faint">{T.org.contextWorkspaceLabel}</span>
          <span className="block truncate text-ink">{adminMode ? T.org.privateAdminWorkspace : (model.workspaceName || T.org.contextNoWorkspace)}</span>
          <span className="block truncate text-[10px] text-muted">{workspaceTypeLabel}</span>
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-faint">{T.org.contextRoleLabel}</span>
          <span className="block truncate text-ink">{roleLabel}</span>
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-faint">{T.org.contextEnvironmentLabel}</span>
          <span className="flex items-center gap-1.5 truncate text-ink">
            <span className={`h-2 w-2 shrink-0 rounded-full ${adminMode ? 'bg-amber' : 'bg-accent'}`} aria-hidden="true" />
            {environmentLabel}
          </span>
        </div>
      </div>
      {adminMode && (
        <button type="button" onClick={exitAdmin} className="mt-0.5 text-[10px] font-medium text-amber hover:text-ink">
          {T.org.returnToUserWorkspace}
        </button>
      )}
    </section>
  )
}
