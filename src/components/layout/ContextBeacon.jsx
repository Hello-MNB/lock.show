import { useAuth } from '../../features/auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useAdminAccess } from '../../context/AdminAccessContext.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { buildContextBeaconModel } from '../../lib/contextBeacon.js'

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

  return (
    <div className="min-w-0 basis-full md:basis-auto md:flex-1" aria-label={T.org.contextBeaconLabel}>
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <span className={`h-2 w-2 shrink-0 rounded-full ${adminMode ? 'bg-amber' : 'bg-accent'}`} aria-hidden="true" />
        <span className="truncate font-semibold text-ink">{model.personName}</span>
        <span className="text-faint" aria-hidden="true">/</span>
        <span className="truncate text-muted">{adminMode ? T.org.privateAdminWorkspace : (model.workspaceName || T.org.contextNoWorkspace)}</span>
        <span className="hidden text-faint lg:inline" aria-hidden="true">/</span>
        <span className="hidden text-muted lg:inline">{adminMode ? T.org.adminMode : (model.role || T.org.contextRolePending)}</span>
        <span className="hidden rounded-full bg-surface2 px-2 py-0.5 font-mono text-[10px] uppercase text-faint xl:inline">{model.environmentId}</span>
      </div>
      {adminMode && (
        <button type="button" onClick={exitAdmin} className="mt-0.5 text-[10px] font-medium text-amber hover:text-ink">
          {T.org.returnToUserWorkspace}
        </button>
      )}
    </div>
  )
}
