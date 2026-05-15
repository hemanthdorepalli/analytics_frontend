"use client";
import { useState, useRef } from "react";
import { useEvents, useIngestEvent, useIngestBatch } from "@/lib/queries";
import { useRole } from "@/hooks/useRole";
import { api, getErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Activity, Zap, RefreshCw, Lock, Upload, CheckCircle, XCircle } from "lucide-react";

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

  // CSV Upload state
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvEventType, setCsvEventType] = useState("page_view");
  const [csvStatus, setCsvStatus] = useState<"idle"|"uploading"|"success"|"error">("idle");
  const [csvMessage, setCsvMessage] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);

  const sendEvent = async (event_type: string, event_name: string, label: string) => {
    setSending(label);
    try {
      await ingest.mutateAsync({
        event_type, event_name,
        properties: { source: "events_page" },
        user_id: `user_${Math.floor(Math.random() * 100)}`
      });
    } finally { setSending(null); }
  };

  const sendBatch = async () => {
    setSending("batch");
    try {
      await batch.mutateAsync(EVENTS.map(({ event_type, event_name }) => ({
        event_type, event_name,
        properties: { batch: true },
        user_id: `user_${Math.floor(Math.random() * 50)}`
      })));
    } finally { setSending(null); }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvStatus("uploading");
    setCsvMessage("");
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("event_type", csvEventType);
      formData.append("timestamp_column", "timestamp");
      formData.append("event_name_column", "event_name");

      const { data } = await api.post("/ingestion/csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTaskId(data.task_id);
      setCsvStatus("success");
      setCsvMessage(`CSV uploaded! Task ID: ${data.task_id}. Processing in background.`);
      setCsvFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setCsvStatus("error");
      setCsvMessage(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity size={22} className="text-blue-600"/>Live Event Stream
          </h1>
          <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 5s</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canIngest ? (
            <>
              {EVENTS.map(({ event_type, event_name, label }) => (
                <Button key={label} size="sm" variant="secondary" loading={sending === label}
                  onClick={() => sendEvent(event_type, event_name, label)}>
                  <Zap size={13}/>{label}
                </Button>
              ))}
              <Button size="sm" loading={sending === "batch"} onClick={sendBatch}>
                <RefreshCw size={13}/>Batch
              </Button>
            </>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Lock size={12}/>View only ({role})
            </span>
          )}
        </div>
      </div>

      {/* CSV Upload Section */}
      {canIngest && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={17}/>CSV Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-3">
              Upload a CSV file with columns: <code className="bg-gray-100 px-1 rounded">timestamp</code>, <code className="bg-gray-100 px-1 rounded">event_name</code>, and any extra properties. Max 10MB.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={e => setCsvFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50"
              />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={csvEventType}
                onChange={e => setCsvEventType(e.target.value)}
              >
                <option value="page_view">Page View</option>
                <option value="click">Click</option>
                <option value="error">Error</option>
                <option value="purchase">Purchase</option>
                <option value="signup">Signup</option>
                <option value="custom">Custom</option>
              </select>
              <Button
                size="sm"
                onClick={handleCsvUpload}
                loading={csvStatus === "uploading"}
                disabled={!csvFile}
              >
                <Upload size={13}/>Upload CSV
              </Button>
            </div>

            {csvStatus === "success" && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                <CheckCircle size={16}/>{csvMessage}
              </div>
            )}
            {csvStatus === "error" && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                <XCircle size={16}/>{csvMessage}
              </div>
            )}

            {/* Sample CSV download */}
            <div className="mt-3">
              <button
                onClick={() => {
                  const csv = "timestamp,event_name,user_id,page,browser\n2026-01-15T10:00:00Z,homepage_visit,user_001,/home,Chrome\n2026-01-15T10:01:00Z,button_click,user_002,/pricing,Firefox\n2026-01-15T10:02:00Z,signup_completed,user_003,/register,Safari";
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "sample_events.csv"; a.click();
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Download sample CSV
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"/>Loading...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Activity size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">{canIngest ? "No events yet. Click a button above or upload a CSV." : "No events yet."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">Event Name</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">Type</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">Source</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase">User</th>
                    <th className="pb-3 font-medium text-gray-500 text-xs uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {events.map(ev => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-900">{ev.event_name}</td>
                      <td className="py-3 pr-4"><Badge label={ev.event_type} color="blue"/></td>
                      <td className="py-3 pr-4">
                        <Badge label={ev.source} color={ev.source==="api"?"blue":ev.source==="csv"?"green":"yellow"}/>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{ev.user_id || "—"}</td>
                      <td className="py-3 text-gray-400 text-xs">{new Date(ev.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}