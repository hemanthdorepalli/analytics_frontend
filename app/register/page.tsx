"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/lib/queries";
import { setSession, acceptPendingInvite } from "@/lib/auth";
import { loginWithGoogle, getErrorMessage, api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";
import type { Member } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [form, setForm] = useState({ email:"", full_name:"", password:"", password_confirm:"", organization_name:"" });
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({...f, [k]: e.target.value}));

const initSession = async () => {
  const profileRes = await api.get("/auth/profile/");
  const myEmail = profileRes.data.email;
  const orgRes = await api.get("/organizations/");
  const org = orgRes.data;
  if (!org?.id) return;
  setSession(org.id, "owner");
  const membersRes = await api.get("/organizations/members/");
  const me = membersRes.data.find((m: any) => m.user_email === myEmail);
  if (me?.role) setSession(org.id, me.role);
  else setSession(org.id, "owner");
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.password_confirm) { setError("Passwords do not match"); return; }
    try {
      await register.mutateAsync(form);
      await initSession();
      await acceptPendingInvite();
      router.replace("/dashboard");
    } catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2"><BarChart3 className="text-blue-600" size={28}/><span className="text-2xl font-bold">Analytics Platform</span></div>
        </div>
        <Card><CardContent>
          <h1 className="text-xl font-semibold text-center mt-4 mb-6">Create account</h1>

          <button onClick={loginWithGoogle} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200"/></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" required value={form.full_name} onChange={set("full_name")}/>
            <Input label="Email" type="email" required value={form.email} onChange={set("email")}/>
            <Input label="Organization Name" required value={form.organization_name} onChange={set("organization_name")}/>
            <Input label="Password" type="password" required value={form.password} onChange={set("password")}/>
            <Input label="Confirm Password" type="password" required value={form.password_confirm} onChange={set("password_confirm")}/>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <Button type="submit" className="w-full" size="lg" loading={register.isPending}>Create account</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">Already have an account? <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link></p>
        </CardContent></Card>
      </div>
    </div>
  );
}
