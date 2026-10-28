"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Menu, X, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#1E293B] bg-[#0B1020]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#22D3EE] p-0.5 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#22D3EE] fill-[#22D3EE]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                Prompt<span className="text-[#22D3EE]">Rush</span>
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#7C3AED] animate-pulse rounded-full" />
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium tracking-wider -mt-1 hidden sm:block">
                60 SECONDS. ONE PROMPT.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/challenge"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              The Challenge
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              Free Workshop
            </Link>
            <Link
              href="/share"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Refer Friends
            </Link>
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#7C3AED]" />
              Growth Command
            </Link>
            <Link href="/challenge">
              <Button size="sm" variant="primary">
                Start Challenge
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/challenge">
              <Button size="sm" variant="primary" className="text-xs px-3 py-1.5">
                Play
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E293B] bg-[#111827] px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/challenge"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            The 60s Challenge
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Free AI Workshop (Build First Project)
          </Link>
          <Link
            href="/share"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Challenge a Friend & Referrals
          </Link>
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            <span>Growth Command Center</span>
            <span className="text-xs bg-violet-900/60 text-violet-300 px-2 py-0.5 rounded">Admin</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

