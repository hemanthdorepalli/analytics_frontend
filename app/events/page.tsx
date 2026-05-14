"use client";
import { useState } from "react";
import { useEvents, useIngestEvent, useIngestBatch } from "@/lib/queries";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Activity, Zap, RefreshCw, Lock } from "lucide-react";

const EVENTS = [
  { event_type:"page_view", event_name:"homepage_visit", label:"Page View" },
  { event_type:"click", event_name:"button_click", label:"Click" },
  { event_type:"error", event_name:"js_error", label:"Error" },
];

export default function EventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const ingest = useIngestEvent();
  const batch = useIngestBatch();
  const { canIngest, role } = useRole();
  const [sending, setSending] = useState<string | null>(null);

  const sendEvent = async (event_type: string, event_name: string, label: string) => {
    setSending(label);
    try { await ingest.mutateAsync({ event_type, event_name, properties: { source: "events_page" }, user_id: `user_${Math.floor(Math.random() * 100)}` }); }
    finally { setSending(null); }
  };

  const sendBatch = async () => {
    setSending("batch");
    try { await batch.mutateAsync(EVENTS.map(({ event_type, event_name }) => ({ event_type, event_name, properties: { batch: true }, user_id: `user_${Math.floor(Math.random() * 50)}` }))); }
    finally { setSending(null); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Activity size={22} className="text-blue-600"/>Live Event Stream</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 5s</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canIngest ? (
            <>
              {EVENTS.map(({ event_type, event_name, label }) => (
                <Button key={label} size="sm" variant="secondary" loading={sending === label} onClick={() => sendEvent(event_type, event_name, label)}>
                  <Zap size={13}/>{label}
                </Button>
              ))}
              <Button size="sm" loading={sending === "batch"} onClick={sendBatch}><RefreshCw size={13}/>Batch</Button>
            </>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Lock size={12}/>View only ({role})
            </span>
          )}
        </div>
      </div>

      <Card><CardHeader><CardTitle>Events ({events.length})</CardTitle></CardHeader><CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"/>Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><Activity size={40} className="mx-auto mb-3 opacity-30"/><p className="text-sm">{canIngest ? "No events yet. Click a button above." : "No events yet."}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left">
                <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">Event Name</th>
                <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">Type</th>
                <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">Source</th>
                <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">User</th>
                <th className="pb-3 font-medium text-gray-500 text-xs uppercase">Time</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{ev.event_name}</td>
                    <td className="py-3 pr-4"><Badge label={ev.event_type} color="blue"/></td>
                    <td className="py-3 pr-4"><Badge label={ev.source} color={ev.source === "api" ? "blue" : ev.source === "csv" ? "green" : "yellow"}/></td>
                    <td className="py-3 pr-4 text-gray-500">{ev.user_id || "—"}</td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(ev.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
