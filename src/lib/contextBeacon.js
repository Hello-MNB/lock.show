export function buildContextBeaconModel({
  personName,
  role,
  environmentId,
  workspaceName,
  workspaceType,
} = {}) {
  return {
    personName: personName || null,
    role: role || null,
    environmentId: environmentId || 'production',
    workspaceName: workspaceName || null,
    workspaceType: workspaceType || null,
  }
}
