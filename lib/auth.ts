import type { Role } from "./types";

// Initialize immediately from localStorage on module load
let _orgId: string | null = typeof window !== "undefined" ? localStorage.getItem("org_id") : null;
let _role: Role | null = typeof window !== "undefined" ? localStorage.getItem("role") as Role : null;

export function setSession(orgId: string, role: Role) {
  _orgId = orgId;
  _role = role;
  if (typeof window !== "undefined") {
    localStorage.setItem("org_id", orgId);
    localStorage.setItem("role", role);
    // Dispatch a storage event so same-tab listeners (useOrgId hook) react immediately.
    window.dispatchEvent(new StorageEvent("storage", { key: "org_id", newValue: orgId }));
  }
}

export function getOrgId(): string | null {
  if (!_orgId && typeof window !== "undefined") {
    _orgId = localStorage.getItem("org_id");
  }
  return _orgId;
}

export function getRole(): Role | null {
  if (!_role && typeof window !== "undefined") {
    _role = localStorage.getItem("role") as Role;
  }
  return _role;
}

export function clearSession() {
  _orgId = null;
  _role = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("org_id");
    localStorage.removeItem("role");
  }
}

export function canIngest(): boolean {
  const r = getRole();
  return r === "owner" || r === "admin" || r === "analyst";
}
export function canManageTeam(): boolean {
  const r = getRole();
  return r === "owner" || r === "admin";
}
export function canCreateDashboard(): boolean { return canIngest(); }
export function canCreateAlert(): boolean { return canIngest(); }
export function canManageApiKeys(): boolean { return canManageTeam(); }

// After login/register, auto-accept any pending invite stored in localStorage
export async function acceptPendingInvite(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("pending_invite");
  if (!token) return;
  try {
    const { api } = await import("./api");
    await api.post(`/organizations/members/invite/${token}/accept/`);
  } catch {
    // ignore — token may be expired or already used
  } finally {
    localStorage.removeItem("pending_invite");
  }
}
