"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Activity, Bell, Settings, LogOut, BarChart3, Shield } from "lucide-react";
import { useLogout, useProfile, useOrganization } from "@/lib/queries";
import { clearSession, getRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: user } = useProfile();
  const { data: org } = useOrganization();
  const role = getRole();

  const handleLogout = async () => {
    try { await logout.mutateAsync(); } catch {}
    clearSession();
    router.replace("/login");
  };

  const NAV = [
    { href:"/dashboard", label:"Dashboards", icon:LayoutDashboard, show: true },
    { href:"/events", label:"Events", icon:Activity, show: true },
    { href:"/alerts", label:"Alerts", icon:Bell, show: true },
    // Settings only for admin/owner
    { href:"/settings", label:"Settings", icon:Settings, show: role === "owner" || role === "admin" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2"><BarChart3 className="text-blue-600" size={22}/><span className="font-bold text-gray-900 text-lg">Analytics</span></div>
        {org && <p className="text-xs text-gray-500 mt-1 truncate">{org.name}</p>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.filter(n => n.show).map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")}>
              <Icon size={18}/>{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {role && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                <Shield size={10}/>{role}
              </span>
            )}
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <LogOut size={18}/>Sign out
        </button>
      </div>
    </aside>
  );
}
