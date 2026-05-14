"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import { useProfile } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart3, CheckCircle, XCircle } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { data: user, isLoading: profileLoading } = useProfile();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Save token so login/register pages can auto-accept after auth
  useEffect(() => {
    if (token) localStorage.setItem("pending_invite", token);
  }, [token]);

  const acceptInvite = async () => {
    setStatus("loading");
    try {
      await api.post(`/organizations/members/invite/${token}/accept/`);
      localStorage.removeItem("pending_invite");
      setStatus("success");
      setMessage("You have joined the organization!");
      setTimeout(() => router.replace("/dashboard"), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err));
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={28}/>
            <span className="text-2xl font-bold text-gray-900">Analytics Platform</span>
          </div>
        </div>

        <Card>
          <CardContent>
            <h1 className="text-xl font-semibold text-center mt-4 mb-2">You have been invited!</h1>

            {status === "success" && (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3"/>
                <p className="text-green-700 font-medium">{message}</p>
                <p className="text-gray-500 text-sm mt-1">Redirecting to dashboard...</p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-6">
                <XCircle size={48} className="text-red-500 mx-auto mb-3"/>
                <p className="text-red-700 font-medium">{message}</p>
                <Button className="mt-4" onClick={() => router.replace("/login")}>Go to Login</Button>
              </div>
            )}

            {(status === "idle" || status === "loading") && (
              <>
                {!user ? (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-gray-600">Create an account or sign in to accept this invite.</p>
                    <p className="text-xs text-gray-400">Use the same email address the invite was sent to.</p>
                    <Button className="w-full" size="lg" onClick={() => router.push("/register")}>
                      Create account &amp; Accept
                    </Button>
                    <Button className="w-full" variant="secondary" size="lg" onClick={() => router.push("/login")}>
                      Sign in &amp; Accept
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-1">Signed in as</p>
                    <p className="font-semibold text-gray-900 mb-6">{user.email}</p>
                    <Button
                      className="w-full"
                      size="lg"
                      loading={status === "loading"}
                      onClick={acceptInvite}
                    >
                      Accept Invite &amp; Join
                    </Button>
                    <button
                      onClick={() => router.replace("/dashboard")}
                      className="mt-3 text-sm text-gray-400 hover:text-gray-600 block w-full text-center"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
