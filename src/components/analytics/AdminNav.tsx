"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Link2,
  FlaskConical,
  Calculator,
  Database,
  Sliders,
} from "lucide-react";

interface AdminNavProps {
  mode: "simulated" | "live";
  onToggleMode: (mode: "simulated" | "live") => void;
}

export function AdminNav({ mode, onToggleMode }: AdminNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/campaigns", label: "Campaign Links", icon: Link2 },
    { href: "/admin/experiments", label: "A/B Testing Lab", icon: FlaskConical },
    { href: "/admin/simulator", label: "500 Simulator", icon: Calculator },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mode Switcher Toggle (Simulated vs Live) */}
      <div className="flex items-center gap-2 bg-[#0B1020] p-1 rounded-xl border border-[#1E293B]">
        <button
          onClick={() => onToggleMode("simulated")}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            mode === "simulated"
              ? "bg-[#22D3EE] text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Demo Mode (7-Day 500 Target)
        </button>
        <button
          onClick={() => onToggleMode("live")}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            mode === "live"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Live Mode
        </button>
      </div>
    </div>
  );
}

