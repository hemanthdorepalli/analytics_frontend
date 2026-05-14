"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setSession, clearSession } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Member } from "@/lib/types";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        // Cookies already set by Django backend after Google auth.
        // Fetch profile and org first (these don't need X-Organization-ID).
        const [profileRes, orgRes] = await Promise.all([
          api.get("/auth/profile/"),
          api.get("/organizations/"),
        ]);
        const org = orgRes.data;
        const myEmail = profileRes.data.email;

        // Set session early so the header is present for the members request.
        if (org?.id) setSession(org.id, "owner");
        else throw new Error("No organization found");

        // Now fetch members — X-Organization-ID header is set via setSession above.
        const membersRes = await api.get<Member[]>("/organizations/members/");
        const me = membersRes.data.find((m: Member) => m.user_email === myEmail);
        if (me?.role) setSession(org.id, me.role);

        router.replace("/dashboard");
      } catch {
        clearSession();
        router.replace("/login");
      }
    };
    init();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
