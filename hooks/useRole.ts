import { getRole, canIngest, canManageTeam, canCreateDashboard, canCreateAlert, canManageApiKeys } from "@/lib/auth";
export function useRole() {
  const role = getRole();
  return {
    role,
    isOwner: role === "owner",
    isAdmin: role === "admin" || role === "owner",
    isAnalyst: canIngest(),
    isViewer: true, // all roles can view
    canIngest: canIngest(),
    canManageTeam: canManageTeam(),
    canCreateDashboard: canCreateDashboard(),
    canCreateAlert: canCreateAlert(),
    canManageApiKeys: canManageApiKeys(),
  };
}
