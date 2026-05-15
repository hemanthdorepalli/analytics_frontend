"use client";
import { useState, useEffect } from "react";
import { useEvents, useOrganization, useDashboards, useCreateDashboard, useIngestEvent } from "@/lib/queries";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KPIWidget, LineWidget, PieWidget } from "@/components/charts/Charts";
import { ThreeBarChart } from "@/components/charts/ThreeBarChart";
import { Plus, Zap, LayoutDashboard, Eye, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { data: org } = useOrganization();
  const { data: events = [], dataUpdatedAt, isRefetching, refetch } = useEvents();
  const { data: dashboards = [] } = useDashboards();
  const create = useCreateDashboard();
  const ingest = useIngestEvent();
  const { canIngest, canCreateDashboard, role } = useRole();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [secondsSince, setSecondsSince] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSince(Math.floor((Date.now() - dataUpdatedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  // Sanitize and aggregate — skip events with missing/invalid timestamp or event_type
  const byType: Record<string, number> = {};
  const byHour: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.timestamp || !e.event_type) return;
    byType[e.event_type] = (byType[e.event_type] || 0) + 1;
    const h = e.timestamp.slice(0, 13);
    if (h.length === 13) byHour[h] = (byHour[h] || 0) + 1;
  });

  const pieData = { labels: Object.keys(byType), values: Object.values(byType) };
  const lineData = {
    labels: Object.keys(byHour).sort(),
    values: Object.keys(byHour).sort().map((k) => byHour[k]),
  };
  const users = new Set(events.map((e) => e.user_id).filter(Boolean)).size;

  const sendTest = () =>
    ingest.mutate({ event_type: "page_view", event_name: "dashboard_visited", properties: { page: "/dashboard" }, user_id: "demo_user" });
  const handleCreate = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({ name, description: desc });
    setName(""); setDesc(""); setShowForm(false);
  };

  const lastUpdatedText =
    secondsSince < 5 ? "just now" :
    secondsSince < 60 ? `${secondsSince}s ago` :
    `${Math.floor(secondsSince / 60)}m ago`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org ? org.name : "Dashboard"}</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize flex items-center gap-1">
            <Eye size={13} /> You are viewing as <strong>{role}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live auto-update indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRefetching ? "bg-yellow-400" : "bg-green-400"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isRefetching ? "bg-yellow-500" : "bg-green-500"}`} />
            </span>
            <span>{isRefetching ? "Refreshing…" : `Live · ${lastUpdatedText}`}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isRefetching}>
            <RefreshCw size={13} />
          </Button>
          {canIngest && (
            <Button variant="secondary" size="sm" onClick={sendTest} loading={ingest.isPending}>
              <Zap size={15} />Send test event
            </Button>
          )}
          {canCreateDashboard && (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={15} />New Dashboard
            </Button>
          )}
        </div>
      </div>

      {showForm && canCreateDashboard && (
        <Card className="mb-6">
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-gray-900 mt-2">New Dashboard</h3>
            <Input label="Name" placeholder="e.g. Web Analytics" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} loading={create.isPending}>Create</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPIWidget label="Total Events" value={events.length} sub="Last 100 ingested" color="blue" />
        <KPIWidget label="Unique Users" value={users} sub="From event stream" color="green" />
        <KPIWidget label="Dashboards" value={dashboards.length} sub="Created" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Events Over Time</CardTitle></CardHeader>
          <CardContent>
            {lineData.labels.length > 0
              ? <LineWidget data={lineData} />
              : (
                <div className="flex flex-col items-center justify-center h-56 text-gray-400">
                  <Zap size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">{canIngest ? "Click Send test event above" : "No data yet"}</p>
                </div>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Event Types</CardTitle></CardHeader>
          <CardContent>
            {pieData.labels.length > 0
              ? <PieWidget data={pieData} />
              : <div className="flex items-center justify-center h-56 text-gray-400"><p className="text-sm">No data yet</p></div>}
          </CardContent>
        </Card>
      </div>

      {/* 3D Event Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            3D Event Distribution
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">WebGL</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.labels.length > 0
            ? <ThreeBarChart labels={pieData.labels} values={pieData.values} />
            : <div className="flex items-center justify-center h-56 text-gray-400"><p className="text-sm">No data yet</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutDashboard size={18} />Your Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboards.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <LayoutDashboard size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{canCreateDashboard ? "No dashboards yet. Create one." : "No dashboards yet."}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dashboards.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.description || "No description"} · {d.widget_count} widgets</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
