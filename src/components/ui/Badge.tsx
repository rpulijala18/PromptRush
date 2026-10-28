import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "violet" | "cyan" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-200 border-slate-700",
    violet: "bg-violet-950/80 text-violet-300 border-violet-700/50",
    cyan: "bg-cyan-950/80 text-cyan-300 border-cyan-700/50",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
    warning: "bg-amber-950/80 text-amber-300 border-amber-700/50",
    danger: "bg-red-950/80 text-red-300 border-red-700/50",
    outline: "bg-transparent text-slate-300 border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

