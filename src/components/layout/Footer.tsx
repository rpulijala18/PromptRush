import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#0B1020] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#22D3EE] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B1020] rounded-[6px] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#22D3EE] fill-[#22D3EE]" />
                </div>
              </div>
              <span className="font-bold text-lg text-white">PromptRush</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              60 Seconds. One Prompt. Beat the Clock. Gamified AI prompting challenge built for the NxtWave Growth Intern hiring assignment.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-950/30 border border-amber-900/40 rounded-lg p-2.5 max-w-lg">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Academic Prototype Notice:</strong> PromptRush is an independent candidate-created campaign prototype for the NxtWave Growth Challenge. Registration records demo interest and is not an official commercial workshop ticket.
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product Journey</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/challenge" className="hover:text-white transition-colors">
                  Take the 60s Challenge
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Free Workshop Demo
                </Link>
              </li>
              <li>
                <Link href="/share" className="hover:text-white transition-colors">
                  Challenge a Batchmate
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy & Data Handling
                </Link>
              </li>
            </ul>
          </div>

          {/* Growth & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Growth Analytics</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Growth Command Center
                </Link>
              </li>
              <li>
                <Link href="/admin/campaigns" className="hover:text-white transition-colors">
                  UTM Link Generator
                </Link>
              </li>
              <li>
                <Link href="/admin/experiments" className="hover:text-white transition-colors">
                  A/B Testing Lab
                </Link>
              </li>
              <li>
                <Link href="/admin/simulator" className="hover:text-white transition-colors">
                  500 Registration Simulator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PromptRush. Built for NxtWave Growth Challenge (Target: 2027 Engineering Grads).</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400 underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-slate-400">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

