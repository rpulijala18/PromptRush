"use client";

import React, { useState, useEffect } from "react";
import { Link2, Copy, Check, Plus, Globe, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminNav } from "@/components/analytics/AdminNav";
import { CampaignLink } from "@/types";

export default function AdminCampaignsPage() {
  const [mode, setMode] = useState<"simulated" | "live">("simulated");
  const [campaigns, setCampaigns] = useState<CampaignLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating link
  const [channelName, setChannelName] = useState("");
  const [utmSource, setUtmSource] = useState("whatsapp");
  const [utmMedium, setUtmMedium] = useState("community");
  const [utmCampaign, setUtmCampaign] = useState("promptrush");
  const [utmContent, setUtmContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        const data = await res.json();
        if (data.campaigns) {
          setCampaigns(data.campaigns);
        }
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelName,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent: utmContent.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
        setChannelName("");
        setUtmContent("");
      }
    } catch (err) {
      console.error("Error creating campaign:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (id: string, pathUrl: string) => {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${pathUrl}`
        : `http://localhost:3000${pathUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      <AdminNav mode={mode} onToggleMode={setMode} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[#22D3EE]" />
            Campaign Tracking & Link Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate UTM-tagged distribution links for WhatsApp classes, campus ambassadors, and college clubs.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <Card className="p-6 bg-[#111827]/90 border-violet-500/30 space-y-5">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Plus className="w-4 h-4 text-[#22D3EE]" />
          <span>Generate New Trackable Distribution Link</span>
        </div>

        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Channel Name */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Channel / Group Description</label>
              <input
                type="text"
                required
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. WhatsApp Final Year CSE Batch"
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* utm_source */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">utm_source</label>
              <select
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="whatsapp">whatsapp</option>
                <option value="ambassador">ambassador</option>
                <option value="techclub">techclub</option>
                <option value="email">email</option>
                <option value="direct">direct</option>
              </select>
            </div>

            {/* utm_medium */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">utm_medium</label>
              <input
                type="text"
                required
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="community, campus, etc."
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* utm_content */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase">utm_content (optional)</label>
              <input
                type="text"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                placeholder="e.g. hero_banner"
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="md" variant="primary" isLoading={isSubmitting} className="text-xs font-bold gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Campaign URL</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Campaign Links List */}
      <Card className="p-6 bg-[#111827]/90 border-[#1E293B] space-y-4">
        <h3 className="text-base font-bold text-white">Active Distribution Links</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 uppercase border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-3">Channel Name</th>
                <th className="py-2.5 px-3">Source / Medium</th>
                <th className="py-2.5 px-3">Generated URL</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Loading distribution links...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No campaign links generated yet. Use the form above to create your first trackable distribution link.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-white">{camp.channelName}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-violet-300">{camp.utmSource}</span> /{" "}
                      <span className="font-mono text-cyan-300">{camp.utmMedium}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 max-w-xs truncate">
                      {camp.generatedUrl}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(camp.id, camp.generatedUrl)}
                        className="text-xs gap-1"
                      >
                        {copiedId === camp.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

