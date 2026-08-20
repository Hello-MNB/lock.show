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

const ROLE_KEYS = {
  artist: 'contextRoleArtist',
  agency: 'contextRoleRepresentation',
  booker: 'contextRoleBuyer',
  producer: 'contextRoleConfirmer',
  operator: 'contextRoleOperator',
  admin: 'contextRoleAdmin',
}

const WORKSPACE_TYPE_KEYS = {
  artist: 'contextWorkspaceArtist',
  management: 'contextWorkspaceRepresentation',
  agency: 'contextWorkspaceRepresentation',
  producer: 'contextWorkspaceProduction',
  admin: 'contextWorkspaceAdmin',
}

export function contextRoleKey(role) {
  return ROLE_KEYS[role] || 'contextRolePending'
}

export function contextWorkspaceTypeKey(workspaceType) {
  return WORKSPACE_TYPE_KEYS[workspaceType] || 'contextWorkspaceGeneric'
}
