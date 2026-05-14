"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Member } from "@/lib/types";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = searchParams.get("access");
        const refreshToken = searchParams.get("refresh");
        if (accessToken) localStorage.setItem("access_token", accessToken);
        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

        const [orgRes, membersRes, profileRes] = await Promise.all([
          api.get("/organizations/"),
          api.get<Member[]>("/organizations/members/"),
          api.get("/auth/profile/"),
        ]);

        const org = orgRes.data;
        const myEmail = profileRes.data.email;
        const me = membersRes.data.find((m: Member) => m.user_email === myEmail);
        if (org?.id && me?.role) setSession(org.id, me.role);
        else if (org?.id) setSession(org.id, "owner");
        router.replace("/dashboard");
      } catch {
        router.replace("/login");
      }
    };
    init();
  }, [router, searchParams]);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthCallbackContent />
    </Suspense>
  );
}