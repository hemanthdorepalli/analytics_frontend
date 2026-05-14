"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/queries";
export default function Home() {
  const router = useRouter();
  const { data, isLoading, isError } = useProfile();
  useEffect(() => {
    if (isLoading) return;
    if (isError || !data) router.replace("/login");
    else router.replace("/dashboard");
  }, [data, isLoading, isError, router]);
  return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
}
