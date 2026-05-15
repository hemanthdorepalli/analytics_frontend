"use client";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const C = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
interface D { labels: string[]; values: number[]; }

function toValidDate(s: string): Date | null {
  if (!s) return null;
  // Pad partial ISO "YYYY-MM-DDTHH" (13 chars) to a valid datetime string
  const padded = /^\d{4}-\d{2}-\d{2}T\d{2}$/.test(s) ? s + ":00:00" : s;
  const d = new Date(padded);
  return isNaN(d.getTime()) ? null : d;
}

export function LineWidget({ data }: { data: D }) {
  const d = data.labels
    .map((l, i) => {
      const date = toValidDate(l);
      if (!date) return null;
      const count = Number(data.values[i]);
      if (isNaN(count)) return null;
      return { time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), count };
    })
    .filter((p): p is { time: string; count: number } => p !== null);

  if (d.length === 0) return (
    <div className="flex items-center justify-center h-56 text-gray-400">
      <p className="text-sm">No valid data points</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={d}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" fontSize={11} stroke="#9ca3af" />
        <YAxis fontSize={11} stroke="#9ca3af" allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieWidget({ data }: { data: D }) {
  const d = data.labels
    .map((l, i) => ({ name: l || "unknown", value: Number(data.values[i]) }))
    .filter((p) => !isNaN(p.value) && p.value > 0);

  if (d.length === 0) return (
    <div className="flex items-center justify-center h-56 text-gray-400">
      <p className="text-sm">No valid data points</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={d}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {d.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function KPIWidget({ value, label, sub, color = "blue" }: { value: number | string; label: string; sub?: string; color?: "blue" | "green" | "red" | "yellow" }) {
  const c = { blue: "text-blue-600", green: "text-green-600", red: "text-red-600", yellow: "text-yellow-600" };
  const display = typeof value === "number" ? (isNaN(value) ? "—" : value.toLocaleString()) : (value || "—");
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${c[color]}`}>{display}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
