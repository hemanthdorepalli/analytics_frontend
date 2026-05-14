"use client";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
interface P extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary"|"secondary"|"danger"|"ghost"; size?: "sm"|"md"|"lg"; loading?: boolean; }
export function Button({ variant="primary", size="md", loading=false, className, children, disabled, ...p }: P) {
  const v = { primary:"bg-blue-600 hover:bg-blue-700 text-white", secondary:"bg-gray-100 hover:bg-gray-200 text-gray-800", danger:"bg-red-600 hover:bg-red-700 text-white", ghost:"hover:bg-gray-100 text-gray-700" };
  const s = { sm:"px-3 py-1.5 text-sm", md:"px-4 py-2 text-sm", lg:"px-5 py-2.5 text-base" };
  return <button className={cn("inline-flex items-center gap-1.5 justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed", v[variant], s[size], className)} disabled={disabled||loading} {...p}>{loading?"Loading...":children}</button>;
}
