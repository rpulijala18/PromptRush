"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Play,
  CheckCircle2,
  UserPlus,
  TrendingUp,
  Percent,
  Share2,
  Target,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/analytics/AdminNav";
import { GrowthInsight } from "@/lib/analytics/insights";
import { GrowthMetrics, ChannelPerformance, DailyRegistrationTrend } from "@/types";

export default function AdminDashboardPage() {
  const [mode, setMode] = useState<"simulated" | "live">("simulated");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    isSimulated: boolean;
    label: string;
    disclaimer: string;
    metrics: GrowthMetrics;
    funnel: any[];
    channels: ChannelPerformance[];
    dailyTrends: DailyRegistrationTrend[];
    insights: GrowthInsight[];
  } | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<string>("all");

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/metrics?mode=${mode}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [mode]);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
        <h3 className="text-lg font-bold text-white">Loading Growth Command Center...</h3>
      </div>
    );
  }

  const { metrics, funnel, channels, dailyTrends, insights, isSimulated, disclaimer } = data;

  const filteredChannels =
    selectedChannel === "all"
      ? channels
      : channels.filter((c) => c.channel.toLowerCase().includes(selectedChannel.toLowerCase()));

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Navigation Subheader */}
      <AdminNav mode={mode} onToggleMode={setMode} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              PromptRush Growth Command Center
            </h1>
            {isSimulated ? (
              <Badge variant="cyan">SIMULATED DATA</Badge>
            ) : (
              <Badge variant="violet">LIVE PRODUCTION</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            NxtWave Hiring Challenge: 500 Student Registrations in 7 Days (₹2,000 Budget • 2027 Engineering Cohort)
          </p>
        </div>

        {/* Demo Mode Notice Banner */}
        {isSimulated && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300 flex items-center gap-2 max-w-md">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>SIMULATED DATA — NOT ACTUAL REGISTRATIONS.</strong> Generated for hiring challenge demonstration.
            </span>
          </div>
        )}
      </div>

      {/* 500 REGISTRATION TARGET PROGRESS BAR */}
      <Card className="p-6 bg-[#111827]/90 border-violet-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#22D3EE]" />
              <span className="text-sm font-bold uppercase tracking-wider text-slate-200">
                CAMPAIGN TARGET: 500 REGISTRATIONS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Required daily pace: ~71 registrations/day to reach 500 within 7 days.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-black text-white">{metrics.demoRegistrations}</span>
              <span className="text-sm font-medium text-slate-400"> / {metrics.targetRegistrations}</span>
            </div>
            <Badge variant={metrics.goalCompletionPercentage >= 100 ? "success" : "violet"}>
              {metrics.goalCompletionPercentage}% Achieved
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-[#22D3EE] transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.goalCompletionPercentage)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">Registrations Achieved</span>
            <strong className="text-base font-bold text-white">{metrics.demoRegistrations}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Remaining Gap</span>
            <strong className="text-base font-bold text-white">{metrics.remainingTarget}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Current Daily Pace</span>
            <strong className="text-base font-bold text-[#22D3EE]">{metrics.dailyRegistrationPace}/day</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Referral Share</span>
            <strong className="text-base font-bold text-violet-300">{metrics.referralRegistrations} ({((metrics.referralRegistrations / (metrics.demoRegistrations || 1)) * 100).toFixed(0)}%)</strong>
          </div>
        </div>
      </Card>

      {/* 8 CORE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.uniqueVisitors}</div>
          <span className="text-[11px] text-slate-400">Top-of-funnel reach</span>
        </Card>

        {/* KPI 2 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Challenge Starts</span>
            <Play className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.challengeStarts}</div>
          <span className="text-[11px] text-emerald-400">
            {metrics.uniqueVisitors > 0
              ? `${((metrics.challengeStarts / metrics.uniqueVisitors) * 100).toFixed(1)}% start rate`
              : "0%"}
          </span>
        </Card>

        {/* KPI 3 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.challengeCompletions}</div>
          <span className="text-[11px] text-emerald-400">
            {metrics.challengeCompletionRate}% completion
          </span>
        </Card>

        {/* KPI 4 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
            <UserPlus className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.demoRegistrations}</div>
          <span className="text-[11px] text-cyan-400">Free workshop intent</span>
        </Card>

        {/* KPI 5 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reg. Conversion</span>
            <Percent className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.registrationConversionRate}%</div>
          <span className="text-[11px] text-slate-400">Visitors to registrations</span>
        </Card>

        {/* KPI 6 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.challengeCompletionRate}%</div>
          <span className="text-[11px] text-slate-400">60-second retention</span>
        </Card>

        {/* KPI 7 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Referral Regs</span>
            <Share2 className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.referralRegistrations}</div>
          <span className="text-[11px] text-violet-400">Peer-to-peer viral loop</span>
        </Card>

        {/* KPI 8 */}
        <Card className="p-4 bg-[#111827]/80 border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Progress to 500</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.goalCompletionPercentage}%</div>
          <span className="text-[11px] text-emerald-400">{metrics.remainingTarget} left</span>
        </Card>
      </div>

      {/* VISUALIZATIONS ROW: Daily Trend & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Registrations Line Chart */}
        <Card className="lg:col-span-7 p-6 bg-[#111827]/90 border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">7-Day Registration Pacing</h3>
            <span className="text-xs text-slate-400">Cumulative vs Daily Benchmark</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0B1020", borderColor: "#1E293B", borderRadius: "12px" }}
                  labelStyle={{ color: "#F9FAFB" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Registrations"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22D3EE" }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Pace Target (500 Goal)"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  name="Daily Registrations"
                  stroke="#22C55E"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="lg:col-span-5 p-6 bg-[#111827]/90 border-[#1E293B] space-y-4">
          <h3 className="text-base font-bold text-white">Conversion Funnel Drop-off</h3>
          <div className="space-y-3">
            {funnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{step.stage}</span>
                  <span className="text-slate-400">
                    <strong className="text-white">{step.count}</strong> ({step.conversionRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7C3AED]"
                    style={{ width: `${Math.max(5, step.conversionRate)}%` }}
                  />
                </div>
                {step.dropoffRate > 0 && (
                  <span className="text-[10px] text-red-400 block text-right">
                    -{step.dropoffRate}% drop-off
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ACQUISITION CHANNELS BREAKDOWN & BAR CHART */}
      <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Channel Acquisition Performance</h3>
            <p className="text-xs text-slate-400">
              Campus Ambassadors, Technical Clubs, WhatsApp, and Peer Referrals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="ambassador">Campus Ambassadors</option>
              <option value="club">Technical Clubs</option>
              <option value="referral">Peer Referrals</option>
              <option value="whatsapp">WhatsApp / Direct</option>
            </select>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredChannels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="channel" stroke="#94A3B8" fontSize={10} interval={0} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0B1020", borderColor: "#1E293B", borderRadius: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="visitors" name="Visitors" fill="#1E293B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="challengeStarts" name="Challenge Starts" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="registrations" name="Registrations" fill="#22D3EE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Channel Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 uppercase border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-3">Acquisition Channel</th>
                <th className="py-2.5 px-3">Visitors</th>
                <th className="py-2.5 px-3">Challenge Starts</th>
                <th className="py-2.5 px-3">Registrations</th>
                <th className="py-2.5 px-3 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {filteredChannels.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{c.channel}</td>
                  <td className="py-3 px-3">{c.visitors}</td>
                  <td className="py-3 px-3">{c.challengeStarts}</td>
                  <td className="py-3 px-3 font-bold text-[#22D3EE]">{c.registrations}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {c.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PHASE 13: RULE-BASED GROWTH INSIGHTS ENGINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#22D3EE]" />
            <h3 className="text-lg font-bold text-white">Growth Insights Engine</h3>
          </div>
          <Badge variant="cyan">Rule-Based Heuristic Evaluation</Badge>
        </div>
        <p className="text-xs text-slate-400">
          Transparent, rule-based growth recommendations dynamically calculated from your current funnel metrics (not AI hallucinated).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="p-5 bg-[#111827]/90 border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
                  {insight.category}
                </span>
                <Badge
                  variant={
                    insight.impact === "High"
                      ? "warning"
                      : insight.impact === "Strategic"
                      ? "violet"
                      : "default"
                  }
                >
                  {insight.impact} Impact
                </Badge>
              </div>

              <h4 className="text-sm font-bold text-white">{insight.title}</h4>

              <p className="text-xs text-slate-300 leading-relaxed">{insight.observation}</p>

              <div className="p-3 rounded-xl bg-[#0B1020] border border-[#1E293B] text-xs text-slate-300 leading-relaxed space-y-1">
                <strong className="text-violet-400 block font-semibold">Actionable Recommendation:</strong>
                <span>{insight.recommendation}</span>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Trigger: {insight.metricTrigger}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
