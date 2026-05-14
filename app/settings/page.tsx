"use client";
import { useState } from "react";
import { useProfile, useOrganization, useApiKeys, useCreateApiKey, useRevokeApiKey, useMembers, useInviteMember } from "@/lib/queries";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Key, Users, User, Trash2, Copy, CheckCircle, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: user } = useProfile();
  const { data: org } = useOrganization();
  const { data: keys = [] } = useApiKeys();
  const { data: members = [] } = useMembers();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const invite = useInviteMember();
  const { canManageApiKeys, canManageTeam, isOwner, role } = useRole();

  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");
  const [inviteMsg, setInviteMsg] = useState("");

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    const r = await createKey.mutateAsync({ name: keyName });
    if (r.key) setNewKey(r.key);
    setKeyName("");
  };

  const copyKey = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await invite.mutateAsync({ email: inviteEmail, role: inviteRole });
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setTimeout(() => setInviteMsg(""), 4000);
    } catch {}
  };

  const RC: Record<string, "blue"|"green"|"yellow"|"gray"> = { owner:"blue", admin:"green", analyst:"yellow", viewer:"gray" };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><User size={17}/>Profile</CardTitle></CardHeader><CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Name</dt><dd className="font-medium mt-0.5">{user?.full_name}</dd></div>
          <div><dt className="text-gray-500">Email</dt><dd className="font-medium mt-0.5">{user?.email}</dd></div>
          <div><dt className="text-gray-500">Organization</dt><dd className="font-medium mt-0.5">{org?.name}</dd></div>
          <div><dt className="text-gray-500">Your Role</dt><dd className="mt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
              <Shield size={10}/>{role}
            </span>
          </dd></div>
        </dl>
      </CardContent></Card>

      {/* API Keys — admin+ only */}
      {canManageApiKeys && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Key size={17}/>API Keys</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Key name (e.g. Production)" value={keyName} onChange={e => setKeyName(e.target.value)}/>
            <Button onClick={handleCreateKey} loading={createKey.isPending}>Generate</Button>
          </div>
          {newKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">Save this key — won&apos;t be shown again!</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-amber-200 rounded px-3 py-2 text-xs font-mono break-all">{newKey}</code>
                <Button size="sm" variant="secondary" onClick={copyKey}>
                  {copied ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <button onClick={() => setNewKey(null)} className="text-xs text-amber-600 hover:underline mt-2">Dismiss</button>
            </div>
          )}
          {keys.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No API keys yet</p> : (
            <div className="divide-y divide-gray-100">
              {keys.map(k => (
                <div key={k.id} className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium">{k.name}</p><p className="text-xs text-gray-400">{k.key_prefix}••• · {new Date(k.created_at).toLocaleDateString()}</p></div>
                  <button onClick={() => revokeKey.mutate(k.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}

      {/* Team — admin+ only */}
      {canManageTeam && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users size={17}/>Team Members</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}/>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
              {/* Only owners can invite owners */}
              {isOwner && <option value="owner">Owner</option>}
            </select>
            <Button onClick={handleInvite} loading={invite.isPending}>Invite</Button>
          </div>
          {inviteMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16}/>{inviteMsg}
            </div>
          )}
          {members.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No members</p> : (
            <div className="divide-y divide-gray-100">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium">{m.user_name}</p><p className="text-xs text-gray-400">{m.user_email}</p></div>
                  <Badge label={m.role} color={RC[m.role]}/>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
