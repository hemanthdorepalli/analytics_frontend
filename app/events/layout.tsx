"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/queries";
import { Sidebar } from "@/components/layout/Sidebar";
export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useProfile();
  useEffect(() => { if (!isLoading && (isError || !data)) router.replace("/login"); }, [isLoading, isError, data, router]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (!data) return null;
  return <div className="flex h-screen overflow-hidden bg-gray-50"><Sidebar/><main className="flex-1 overflow-y-auto">{children}</main></div>;
}
