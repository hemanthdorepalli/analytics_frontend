"use client";
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
interface P extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export const Input = forwardRef<HTMLInputElement, P>(({ label, error, className, ...p }, ref) => (
  <div className="space-y-1 w-full">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input ref={ref} className={cn("w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", error && "border-red-500", className)} {...p} />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = "Input";
