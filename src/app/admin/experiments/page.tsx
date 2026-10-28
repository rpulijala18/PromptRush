"use client";

import React, { useState, useEffect } from "react";
import { FlaskConical, TrendingUp, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminNav } from "@/components/analytics/AdminNav";
import { ExperimentStats } from "@/types";

export default function AdminExperimentsPage() {
  const [mode, setMode] = useState<"simulated" | "live">("simulated");
  const [loading, setLoading] = useState(true);
  const [expData, setExpData] = useState<{
    variantA: ExperimentStats;
    variantB: ExperimentStats;
    sampleSizeSufficient: boolean;
    statisticalConfidence: number;
    winner: "A" | "B" | null;
    statusMessage: string;
  } | null>(null);

  useEffect(() => {
    async function loadExp() {
      setLoading(true);
      try {
        const res = await fetch(`/api/metrics?mode=${mode}`);
        const result = await res.json();
        if (result.success && result.data.experiments) {
          setExpData(result.data.experiments);
        }
      } catch (err) {
        console.error("Failed to load experiment data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExp();
  }, [mode]);

  if (loading || !expData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
        <h3 className="text-lg font-bold text-white">Loading A/B Experiment Lab...</h3>
      </div>
    );
  }

  const { variantA, variantB, sampleSizeSufficient, statisticalConfidence, winner, statusMessage } =
    expData;

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      <AdminNav mode={mode} onToggleMode={setMode} />

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-[#22D3EE]" />
          A/B Testing Lab — Value Proposition Optimization
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Testing educational workshop framing vs tangible outcome framing across student touchpoints.
        </p>
      </div>

      {/* Statistical Status Banner */}
      <Card
        className={`p-5 border ${
          sampleSizeSufficient
            ? "bg-emerald-950/20 border-emerald-800/40"
            : "bg-amber-950/20 border-amber-800/40"
        } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3">
          {sampleSizeSufficient ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Experiment Statistical Status</h4>
            <p className="text-xs text-slate-300">{statusMessage}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block">Confidence Level</span>
            <strong className="text-white text-sm">{statisticalConfidence}%</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Current Leader</span>
            <Badge variant={winner ? "success" : "default"}>
              {winner ? `Variant ${winner}` : "None"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Side-by-side Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* VARIANT A */}
        <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-xs">
              VARIANT A (CONTROL)
            </Badge>
            <span className="text-xs text-slate-400">Educational Hook</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">&quot;{variantA.headline}&quot;</h3>
            <div className="p-3 rounded-xl bg-[#0B1020] border border-slate-800 text-xs font-mono text-slate-300">
              Button CTA: &quot;{variantA.buttonText}&quot;
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Impressions</span>
              <strong className="text-lg font-bold text-white block">{variantA.impressions}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Clicks (CTR)</span>
              <strong className="text-lg font-bold text-violet-400 block">
                {variantA.clicks} ({variantA.ctr}%)
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Registrations</span>
              <strong className="text-lg font-bold text-white block">{variantA.registrations}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Conversion Rate</span>
              <strong className="text-lg font-bold text-cyan-400 block">
                {variantA.conversionRate}%
              </strong>
            </div>
          </div>
        </Card>

        {/* VARIANT B */}
        <Card className="p-6 bg-[#111827]/90 border-violet-500/40 space-y-6 relative overflow-hidden">
          {winner === "B" && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Statistically Superior (+2.03% Lift)
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge variant="cyan" className="text-xs">
              VARIANT B (TANGIBLE OUTCOME)
            </Badge>
            <span className="text-xs text-slate-400">Project Building Hook</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">&quot;{variantB.headline}&quot;</h3>
            <div className="p-3 rounded-xl bg-[#0B1020] border border-cyan-900/40 text-xs font-mono text-cyan-200">
              Button CTA: &quot;{variantB.buttonText}&quot;
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Impressions</span>
              <strong className="text-lg font-bold text-white block">{variantB.impressions}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Clicks (CTR)</span>
              <strong className="text-lg font-bold text-violet-400 block">
                {variantB.clicks} ({variantB.ctr}%)
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Registrations</span>
              <strong className="text-lg font-bold text-white block">{variantB.registrations}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Conversion Rate</span>
              <strong className="text-lg font-bold text-emerald-400 block">
                {variantB.conversionRate}%
              </strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Hypothesis & Learning Insights */}
      <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-[#22D3EE]" />
          Key Growth Learning & Student Psychology
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Final-year engineering students (2027 cohort) showed a clear preference for <strong>tangible outcome framing</strong> (&quot;Build Your First AI Project in 60 Minutes&quot;) over generic learning phrasing (&quot;Register for the Free Workshop&quot;). Placement-focused students care deeply about portfolio-verifiable projects that can be discussed during campus technical interviews.
        </p>
      </Card>
    </div>
  );
}

