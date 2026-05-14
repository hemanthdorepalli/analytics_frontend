"use client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const C = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"];
interface D { labels: string[]; values: number[]; }
export function LineWidget({ data }: { data: D }) {
  const d = data.labels.map((l,i) => ({ time: new Date(l).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), count: data.values[i] }));
  return <ResponsiveContainer width="100%" height={220}><LineChart data={d}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="time" fontSize={11} stroke="#9ca3af"/><YAxis fontSize={11} stroke="#9ca3af"/><Tooltip/><Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>;
}
export function PieWidget({ data }: { data: D }) {
  const d = data.labels.map((l,i) => ({ name:l, value:data.values[i] }));
  return <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={d} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>{d.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>;
}
export function KPIWidget({ value, label, sub, color="blue" }: { value: number|string; label: string; sub?: string; color?: "blue"|"green"|"red"|"yellow" }) {
  const c = { blue:"text-blue-600", green:"text-green-600", red:"text-red-600", yellow:"text-yellow-600" };
  return <div className="bg-white rounded-xl border border-gray-200 p-6"><p className="text-sm text-gray-500 font-medium">{label}</p><p className={`text-3xl font-bold mt-1 ${c[color]}`}>{typeof value==="number"?value.toLocaleString():value}</p>{sub&&<p className="text-xs text-gray-400 mt-1">{sub}</p>}</div>;
}
