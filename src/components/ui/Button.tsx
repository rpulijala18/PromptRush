"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "cyan" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1020] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2.5 font-semibold",
      xl: "px-8 py-4 text-lg rounded-2xl gap-3 font-bold",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:from-[#8B5CF6] hover:to-[#7C3AED] shadow-lg shadow-violet-900/30 border border-violet-500/30 focus:ring-violet-500",
      cyan:
        "bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-slate-950 hover:from-[#38BDF8] hover:to-[#22D3EE] shadow-lg shadow-cyan-900/30 font-semibold focus:ring-cyan-400",
      secondary:
        "bg-[#111827] text-white hover:bg-[#1F2937] border border-[#1E293B] shadow-sm focus:ring-slate-400",
      outline:
        "bg-transparent text-slate-200 border border-[#1E293B] hover:bg-slate-800/40 hover:text-white hover:border-slate-600 focus:ring-slate-400",
      ghost:
        "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white focus:ring-slate-400",
      danger:
        "bg-red-600/90 text-white hover:bg-red-500 shadow-md shadow-red-900/20 focus:ring-red-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

