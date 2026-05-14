import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)} {...p} />; }
export function CardHeader({ className, ...p }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("px-6 pt-5 pb-2", className)} {...p} />; }
export function CardTitle({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("text-base font-semibold text-gray-900", className)} {...p} />; }
export function CardContent({ className, ...p }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("px-6 pb-6 pt-2", className)} {...p} />; }
