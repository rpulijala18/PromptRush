"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Share2,
  Copy,
  Check,
  Zap,
  Users,
  MessageCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buildWhatsAppShareUrl } from "@/lib/referrals/generator";
import { getOrCreateSessionId, getSavedAttribution } from "@/lib/attribution/utm";

function ShareContent() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get("score");
  const refParam = searchParams.get("ref");

  const [copied, setCopied] = useState(false);
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setNativeShareAvailable(true);
    }
  }, []);

  const score = scoreParam ? parseInt(scoreParam) : null;
  const referralCode = refParam || null;

  const targetLink =
    typeof window !== "undefined"
      ? referralCode
        ? `${window.location.origin}/challenge?ref=${referralCode}`
        : `${window.location.origin}/challenge`
      : `http://localhost:3000/challenge`;

  const whatsAppUrl = buildWhatsAppShareUrl({
    score,
    referralCode,
  });

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(targetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Log copy event
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousSessionId: getOrCreateSessionId(),
          eventType: "share_copy_link",
          referralCode: referralCode || undefined,
        }),
      }).catch(() => {});
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "PromptRush — 60-Second AI Challenge",
          text: `⚡ I scored ${score ? `${score}/100` : "high"} on PromptRush! Think you can beat me? You have 60 seconds.`,
          url: targetLink,
        });

        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousSessionId: getOrCreateSessionId(),
            eventType: "share_native",
            referralCode: referralCode || undefined,
          }),
        }).catch(() => {});
      } catch (err) {
        console.warn("Native share canceled or failed:", err);
      }
    }
  };

  const handleWhatsAppClick = () => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousSessionId: getOrCreateSessionId(),
        eventType: "share_click_whatsapp",
        referralCode: referralCode || undefined,
      }),
    }).catch(() => {});
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="cyan" className="py-1 px-3 text-xs">
          VIRAL GROWTH & REFERRAL HUB
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Challenge Your Batchmates to Beat You
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Spread the challenge to your college WhatsApp groups and coding clubs. 60 seconds to find out who prompts smarter.
        </p>
      </div>

      {/* Share Card */}
      <Card className="p-6 sm:p-8 bg-[#111827]/95 border-violet-500/30 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Share2 className="w-5 h-5 text-[#22D3EE]" />
            <span>1-Click Challenge Sharing</span>
          </div>
          {referralCode ? (
            <Badge variant="violet">Code: {referralCode}</Badge>
          ) : (
            <span className="text-xs text-slate-400">General Invite Link</span>
          )}
        </div>

        {/* WhatsApp Message Preview */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            WhatsApp Message Preview
          </label>
          <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] text-xs sm:text-sm text-slate-200 font-mono leading-relaxed space-y-2">
            <p>⚡ I just completed PromptRush and scored {score ? `${score}/100` : "[SCORE]/100"}!</p>
            <p>Think you can beat me?</p>
            <p>You have 60 seconds to prove your AI skills.</p>
            <p className="text-[#22D3EE]">Try it here: {targetLink}</p>
          </div>
        </div>

        {/* Sharing Action Buttons */}
        <div className="space-y-3 pt-2">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="block w-full"
          >
            <Button size="xl" variant="cyan" className="w-full gap-2 font-bold shadow-cyan-900/40">
              <MessageCircle className="w-5 h-5 text-slate-950 fill-current" />
              <span>Share to WhatsApp Groups & Friends</span>
            </Button>
          </a>

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={targetLink}
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
            </div>
            <Button variant="outline" size="md" onClick={handleCopy} className="gap-1.5 shrink-0">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Link!" : "Copy Link"}</span>
            </Button>

            {nativeShareAvailable && (
              <Button variant="secondary" size="md" onClick={handleNativeShare} className="gap-1.5 shrink-0">
                <Share2 className="w-4 h-4 text-violet-400" />
                <span>Share</span>
              </Button>
            )}
          </div>
        </div>

        {/* Viral Growth Loop Mechanics Explanation */}
        <div className="pt-4 border-t border-[#1E293B] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-violet-400" />
            How the Growth Loop Works
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-slate-200 block">1. First-Touch Attribution</strong>
              <span>Students arriving through your link are uniquely tagged with your referral code.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-slate-200 block">2. Anti-Abuse Protection</strong>
              <span>Self-referrals and duplicate emails are automatically filtered in the database.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <strong className="text-slate-200 block">3. Workshop Bridge</strong>
              <span>Peers discover their prompt level and join you in the 60-minute build session.</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
          Loading Referral Hub...
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
