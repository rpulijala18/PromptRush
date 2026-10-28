"use client";

import React, { useState } from "react";
import {
  Calculator,
  Target,
  Users,
  Award,
  Share2,
  Send,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/analytics/AdminNav";

export default function AdminSimulatorPage() {
  const [mode, setMode] = useState<"simulated" | "live">("simulated");

  // Slider State (Defaults from Phase 15 & Growth Plan)
  const [ambassadorCount, setAmbassadorCount] = useState<number>(10);
  const [ambassadorYield, setAmbassadorYield] = useState<number>(20);

  const [clubCount, setClubCount] = useState<number>(5);
  const [clubYield, setClubYield] = useState<number>(30);

  const [peerReferrals, setPeerReferrals] = useState<number>(100);
  const [directOutreach, setDirectOutreach] = useState<number>(50);

  const TARGET_GOAL = 500;
  const CAMPAIGN_DAYS = 7;

  // Calculations
  const ambassadorTotal = ambassadorCount * ambassadorYield;
  const clubTotal = clubCount * clubYield;
  const projectedTotal = ambassadorTotal + clubTotal + peerReferrals + directOutreach;

  const gap = Math.max(0, TARGET_GOAL - projectedTotal);
  const percentAchieved = Math.min(200, parseFloat(((projectedTotal / TARGET_GOAL) * 100).toFixed(1)));
  const dailyPace = parseFloat((projectedTotal / CAMPAIGN_DAYS).toFixed(1));

  const handleReset = () => {
    setAmbassadorCount(10);
    setAmbassadorYield(20);
    setClubCount(5);
    setClubYield(30);
    setPeerReferrals(100);
    setDirectOutreach(50);
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      <AdminNav mode={mode} onToggleMode={setMode} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#22D3EE]" />
            500 Registration Growth Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Interactive forecasting model testing acquisition channel sensitivity to hit 500 registrations in 7 days.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5 self-start text-xs">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults (500 Goal)</span>
        </Button>
      </div>

      {/* Projection Summary Card */}
      <Card className="p-6 bg-[#111827]/90 border-violet-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#22D3EE]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                FORECASTED CAMPAIGN PROJECTION
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Hypothetical projection model for strategic campaign planning. Channels assumed non-overlapping.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-3xl font-black text-white">{projectedTotal}</span>
              <span className="text-sm font-medium text-slate-400"> / {TARGET_GOAL} Target</span>
            </div>
            <Badge variant={projectedTotal >= TARGET_GOAL ? "success" : "warning"}>
              {percentAchieved}% of Target
            </Badge>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              projectedTotal >= TARGET_GOAL
                ? "bg-gradient-to-r from-emerald-500 to-[#22D3EE]"
                : "bg-gradient-to-r from-violet-600 to-amber-500"
            }`}
            style={{ width: `${Math.min(100, percentAchieved)}%` }}
          />
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400">Projected Total</span>
            <strong className="text-xl font-bold text-white block">{projectedTotal}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400">Remaining Gap</span>
            <strong className={`text-xl font-bold block ${gap === 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {gap === 0 ? "Target Met! (0)" : `${gap} Needed`}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400">Required Daily Pace</span>
            <strong className="text-xl font-bold text-[#22D3EE] block">{dailyPace}/day</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400">Budget Efficiency</span>
            <strong className="text-xl font-bold text-violet-300 block">
              ₹{(2000 / (projectedTotal || 1)).toFixed(2)} / reg
            </strong>
          </div>
        </div>
      </Card>

      {/* Interactive Channel Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel 1: Campus Ambassadors */}
        <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Campus Ambassadors</h3>
            </div>
            <span className="text-base font-extrabold text-[#22D3EE] font-mono">
              {ambassadorTotal} Regs
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Slider 1: Ambassador Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Active Ambassadors:</span>
                <span className="font-bold text-white">{ambassadorCount} reps</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={ambassadorCount}
                onChange={(e) => setAmbassadorCount(parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            {/* Slider 2: Yield per Ambassador */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Registrations per Ambassador:</span>
                <span className="font-bold text-white">{ambassadorYield} students</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={ambassadorYield}
                onChange={(e) => setAmbassadorYield(parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Micro-incentive: ₹100 certificate/voucher per 20 completions (Total ₹1,000 allocation).
            </p>
          </div>
        </Card>

        {/* Channel 2: Technical Clubs */}
        <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#22D3EE]" />
              <h3 className="text-sm font-bold text-white">Technical & Coding Clubs</h3>
            </div>
            <span className="text-base font-extrabold text-[#22D3EE] font-mono">
              {clubTotal} Regs
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Slider 1: Club Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Partner College Clubs:</span>
                <span className="font-bold text-white">{clubCount} clubs</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={clubCount}
                onChange={(e) => setClubCount(parseInt(e.target.value))}
                className="w-full accent-[#22D3EE]"
              />
            </div>

            {/* Slider 2: Yield per Club */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Registrations per Club:</span>
                <span className="font-bold text-white">{clubYield} students</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={clubYield}
                onChange={(e) => setClubYield(parseInt(e.target.value))}
                className="w-full accent-[#22D3EE]"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Clubs co-host the 60-minute workshop as an official semester technical activity.
            </p>
          </div>
        </Card>

        {/* Channel 3: Peer Referrals */}
        <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Peer Viral Referrals</h3>
            </div>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {peerReferrals} Regs
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Viral Registrations from WhatsApp Shares:</span>
                <span className="font-bold text-white">{peerReferrals} students</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={peerReferrals}
                onChange={(e) => setPeerReferrals(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Driven by the post-challenge &quot;Beat my score on PromptRush!&quot; WhatsApp share loop.
            </p>
          </div>
        </Card>

        {/* Channel 4: Direct Outreach / WhatsApp */}
        <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Direct WhatsApp Outreach</h3>
            </div>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {directOutreach} Regs
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Placement Class Rep & Group Distribution:</span>
                <span className="font-bold text-white">{directOutreach} students</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={directOutreach}
                onChange={(e) => setDirectOutreach(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Organic posts in final-year placement discussion groups and Telegram channels.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

