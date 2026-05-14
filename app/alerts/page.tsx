"use client";
import { useState } from "react";
import { useAlertRules, useCreateAlertRule, useMuteAlert, useAlertHistory } from "@/lib/queries";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Bell, Plus, VolumeX, History, Lock } from "lucide-react";

const SC: Record<string, "green"|"red"|"gray"|"yellow"> = { active:"green", triggered:"red", resolved:"gray", muted:"yellow" };

export default function AlertsPage() {
  const { data: rules = [] } = useAlertRules();
  const { data: history = [] } = useAlertHistory();
  const create = useCreateAlertRule();
  const mute = useMuteAlert();
  const { canCreateAlert, role } = useRole();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", event_name:"", metric:"count", condition:"gt", threshold:10, window_minutes:10, notification_channels:["in_app"] });
  const set = (k: string, v: any) => setForm(f => ({...f, [k]: v}));

  const handleCreate = async () => {
    if (!form.name || !form.event_name) return;
    await create.mutateAsync(form);
    setForm({ name:"", event_name:"", metric:"count", condition:"gt", threshold:10, window_minutes:10, notification_channels:["in_app"] });
    setShowForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bell size={22} className="text-blue-600"/>Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Evaluated by Celery Beat every minute</p>
        </div>
        {canCreateAlert ? (
          <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15}/>New Alert Rule</Button>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg"><Lock size={12}/>View only ({role})</span>
        )}
      </div>

      {showForm && canCreateAlert && (
        <Card className="mb-6"><CardContent className="space-y-4">
          <h3 className="font-semibold text-gray-900 mt-2">Create Alert Rule</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Rule Name" placeholder="High Error Rate" value={form.name} onChange={e => set("name", e.target.value)}/>
            <Input label="Event Name" placeholder="e.g. error" value={form.event_name} onChange={e => set("event_name", e.target.value)}/>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Condition</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.condition} onChange={e => set("condition", e.target.value)}>
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
                <option value="eq">Equals</option>
              </select>
            </div>
            <Input label="Threshold" type="number" value={form.threshold} onChange={e => set("threshold", Number(e.target.value))}/>
            <Input label="Window (mins)" type="number" value={form.window_minutes} onChange={e => set("window_minutes", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notification Channels</label>
            <div className="flex gap-4">
              {["in_app","email","webhook"].map(ch => (
                <label key={ch} className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input type="checkbox" checked={form.notification_channels.includes(ch)}
                    onChange={e => set("notification_channels", e.target.checked ? [...form.notification_channels, ch] : form.notification_channels.filter(c => c !== ch))}/>
                  {ch.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} loading={create.isPending}>Create Rule</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell size={17}/>Rules ({rules.length})</CardTitle></CardHeader><CardContent>
          {rules.length === 0 ? <div className="text-center py-10 text-gray-400"><Bell size={36} className="mx-auto mb-3 opacity-30"/><p className="text-sm">{canCreateAlert ? "No rules yet." : "No rules yet."}</p></div>
          : <div className="space-y-3">{rules.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.event_name} {r.condition === "gt" ? ">" : r.condition === "lt" ? "<" : "="} {r.threshold} · within {r.window_minutes}m</p>
                  <p className="text-xs text-gray-400 mt-0.5">Channels: {r.notification_channels.join(", ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={r.status} color={SC[r.status]}/>
                  {canCreateAlert && r.status !== "muted" && (
                    <button onClick={() => mute.mutate(r.id)} className="text-gray-300 hover:text-yellow-500 transition-colors" title="Mute"><VolumeX size={15}/></button>
                  )}
                </div>
              </div>
            </div>
          ))}</div>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><History size={17}/>History ({history.length})</CardTitle></CardHeader><CardContent>
          {history.length === 0 ? <div className="text-center py-10 text-gray-400"><History size={36} className="mx-auto mb-3 opacity-30"/><p className="text-sm">No alerts triggered yet</p></div>
          : <div className="space-y-2">{history.slice(0, 10).map(h => (
            <div key={h.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex justify-between"><p className="font-medium text-sm text-gray-900">{h.alert_name}</p><p className="text-xs text-gray-400">{new Date(h.triggered_at).toLocaleString()}</p></div>
              <p className="text-xs text-gray-500 mt-1">Value: <span className="text-red-600 font-medium">{h.triggered_value}</span> (threshold: {h.threshold})</p>
            </div>
          ))}</div>}
        </CardContent></Card>
      </div>
    </div>
  );
}
