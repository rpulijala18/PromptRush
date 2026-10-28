"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Share2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buildWhatsAppShareUrl } from "@/lib/referrals/generator";

function SuccessContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "RUSH8K2";
  const name = searchParams.get("name") || "Student";
  const scoreParam = searchParams.get("score");
  const isDuplicate = searchParams.get("duplicate") === "1";

  const [copied, setCopied] = useState(false);

  const parsedScore = scoreParam ? parseInt(scoreParam) : null;
  const shareWhatsAppUrl = buildWhatsAppShareUrl({
    score: parsedScore,
    referralCode: refCode,
  });

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/challenge?ref=${refCode}`
      : `http://localhost:3000/challenge?ref=${refCode}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-8">
      <Card className="p-8 sm:p-10 bg-[#111827]/95 border-emerald-500/30 text-center space-y-6 shadow-2xl">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="py-1 px-3 text-xs">
            {isDuplicate ? "RECORD FOUND" : "DEMO REGISTRATION RECORDED"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            You&apos;re In, {name.split(" ")[0]}!
          </h1>
          <p className="text-base text-slate-300">
            {isDuplicate
              ? "Your details were already registered in this demo prototype."
              : "Your demo interest has been successfully recorded."}
          </p>
        </div>

        {/* Workshop Topic Card */}
        <div className="p-4 rounded-2xl bg-[#0B1020] border border-[#1E293B] text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#22D3EE] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            WORKSHOP TOPIC
          </div>
          <div className="text-base font-bold text-white">
            Build Your First AI Project in 60 Minutes
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Targeting final-year engineering students (2027 batch) preparing for technical placement drives.
          </p>
          {scoreParam && (
            <div className="pt-1 text-xs text-violet-400 font-semibold">
              ⚡ Associated PromptScore: {scoreParam}/100
            </div>
          )}
        </div>

        {/* Viral Referral Invite Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-violet-950/60 to-slate-900 border border-violet-700/40 text-left space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
              YOUR PERSONAL REFERRAL LINK
            </span>
            <Badge variant="violet">{refCode}</Badge>
          </div>

          <p className="text-xs text-slate-300">
            Challenge your college friends to beat your 60-second score. Every student who takes the challenge through your link helps unlock community learning badges:
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all focus:outline-none"
            />
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>

          <div className="pt-2">
            <a href={shareWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button size="lg" variant="cyan" className="w-full gap-2 font-bold shadow-cyan-900/40">
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>Share Challenge on WhatsApp →</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Simulation Note:</strong> PromptRush is an independent hiring challenge prototype. It does not schedule an official workshop date, issue certified credentials, or guarantee seats without official NxtWave announcements.
          </span>
        </div>

        {/* Return Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/share">
            <Button variant="outline" size="md">
              View Referral Hub
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
          Loading Registration Success...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
