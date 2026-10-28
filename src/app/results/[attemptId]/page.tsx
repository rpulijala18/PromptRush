"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Trophy,
  Sparkles,
  ArrowRight,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ShieldAlert,
  Target,
  FileText,
  Clock,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreBreakdown, PerformanceLevel } from "@/types";
import { buildWhatsAppShareUrl } from "@/lib/referrals/generator";
import { getSavedAttribution } from "@/lib/attribution/utm";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const attr = getSavedAttribution();
      if (attr?.ref) {
        setRefCode(attr.ref);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!attemptId) return;

    let isMounted = true;

    async function fetchResult() {
      // 1. Check browser storage for validated attempt result (ensures resilience across serverless lambdas)
      let cachedData: any = null;
      try {
        const stored =
          sessionStorage.getItem(`promptrush_result_${attemptId}`) ||
          localStorage.getItem(`promptrush_result_${attemptId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.score === "number" && parsed.scoreBreakdown) {
            cachedData = parsed;
            if (isMounted) {
              setScore(parsed.score);
              setBreakdown(parsed.scoreBreakdown);
              setError(null);
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.warn("Storage check fallback:", err);
      }

      // 2. Fetch from backend API
      try {
        const res = await fetch(`/api/attempts?id=${encodeURIComponent(attemptId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setScore(data.score);
            setBreakdown(data.scoreBreakdown);
            setError(null);
            setLoading(false);

            if (data.score >= 80) {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#7C3AED", "#22D3EE", "#22C55E"],
              });
            }
          }

          // Update cache
          try {
            sessionStorage.setItem(`promptrush_result_${attemptId}`, JSON.stringify(data));
          } catch {}
          return;
        }

        // If backend returned error, but we have a valid cached attempt for this ID, use it
        if (cachedData) {
          if (cachedData.score >= 80) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#7C3AED", "#22D3EE", "#22C55E"],
            });
          }
          return;
        }

        throw new Error("Unable to load challenge result.");
      } catch (err: any) {
        if (!cachedData && isMounted) {
          setError(err.message || "Failed to load results.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  // Score count-up animation
  useEffect(() => {
    if (loading || score === 0) return;
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const increment = Math.ceil(score / (duration / stepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [loading, score]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <h3 className="text-xl font-bold text-white">Calculating Your Educational Prompt Score...</h3>
        <p className="text-sm text-slate-400">Evaluating role, context, constraints, and structure.</p>
      </div>
    );
  }

  if (error || !breakdown) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-950/40 text-red-400 border border-red-800">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Result Not Found</h3>
        <p className="text-sm text-slate-400 max-w-md">
          {error || "We couldn't retrieve this challenge attempt."}
        </p>
        <Link href="/challenge">
          <Button variant="primary">Start New Challenge</Button>
        </Link>
      </div>
    );
  }

  // Level badge and styling
  const levelStyles: Record<PerformanceLevel, { badge: any; ringColor: string; title: string }> = {
    "AI Builder": {
      badge: "cyan",
      ringColor: "text-cyan-400 stroke-cyan-400",
      title: "Mastery Level",
    },
    "AI Problem Solver": {
      badge: "violet",
      ringColor: "text-violet-400 stroke-violet-400",
      title: "Advanced Practitioner",
    },
    "Prompt Learner": {
      badge: "warning",
      ringColor: "text-amber-400 stroke-amber-400",
      title: "Developing Skills",
    },
    "AI Explorer": {
      badge: "default",
      ringColor: "text-slate-400 stroke-slate-400",
      title: "Beginning the AI Journey",
    },
  };

  const levelConfig = levelStyles[breakdown.level];
  const shareWhatsAppUrl = buildWhatsAppShareUrl({ score, referralCode: refCode });

  // SVG circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
      {/* Top Banner & Gamified Score */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-[#111827] via-[#111827]/90 to-[#0B1020] border border-violet-500/30 shadow-2xl text-center space-y-6 overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-700/50 text-violet-300 text-xs font-semibold tracking-wider uppercase">
          <Trophy className="w-3.5 h-3.5 text-[#22D3EE]" />
          EDUCATIONAL PROMPT SCORE
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            You Just Took Your First Step as an AI Builder!
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            You improved your prompting skills in 60 seconds. Imagine what you could build in 60 minutes.
          </p>
        </div>

        {/* Circular Animated Score Indicator */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Foreground animated progress */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={levelConfig.ringColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>

            {/* Score inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight text-white">
                {animatedScore}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                OUT OF 100
              </span>
            </div>
          </div>

          {/* Performance Level */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <Badge variant={levelConfig.badge} className="px-4 py-1 text-sm font-extrabold tracking-wide">
              Level: {breakdown.level}
            </Badge>
            <span className="text-xs text-slate-400">{levelConfig.title}</span>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/register?score=${score}&level=${encodeURIComponent(breakdown.level)}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ""}`} className="w-full sm:w-auto">
            <Button size="xl" variant="primary" className="w-full shadow-violet-900/50 gap-2">
              <span>Build Your First AI Project — Free Workshop</span>
              <ArrowRight className="w-5 h-5 text-[#22D3EE]" />
            </Button>
          </Link>

          <a href={shareWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button size="xl" variant="cyan" className="w-full gap-2">
              <Share2 className="w-4 h-4 text-slate-950" />
              <span>Challenge a Friend (WhatsApp)</span>
            </Button>
          </a>

          <Link href="/challenge" className="w-full sm:w-auto">
            <Button size="xl" variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Try Again</span>
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 pt-2">
          This score is based on a structured educational rubric and is not a formal assessment of AI proficiency.
        </p>
      </div>

      {/* Category Breakdown (Phase 5 Rubric) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#22D3EE]" />
            Category Rubric Breakdown
          </h2>
          <span className="text-xs text-slate-400">Total: {score}/100</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            breakdown.multipleChoice,
            breakdown.clearObjective,
            breakdown.relevantContext,
            breakdown.specificInstructions,
            breakdown.outputFormat,
          ].map((cat, idx) => (
            <Card key={idx} className="p-5 bg-[#111827]/80 border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">{cat.name}</span>
                <span
                  className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                    cat.score >= 20
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : cat.score >= 10
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{cat.feedback}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6 bg-[#111827]/90 border-emerald-900/40 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Key Strengths Identified</span>
          </div>
          <ul className="space-y-2.5">
            {breakdown.strengths.length > 0 ? (
              breakdown.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">No strong prompt elements detected yet. Start with explicit role definitions!</li>
            )}
          </ul>
        </Card>

        {/* Improvement Opportunities */}
        <Card className="p-6 bg-[#111827]/90 border-amber-900/40 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>How to Level Up</span>
          </div>
          <ul className="space-y-2.5">
            {breakdown.improvements.length > 0 ? (
              breakdown.improvements.map((imp, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">All essential rubric categories fulfilled! Outstanding promptcraft!</li>
            )}
          </ul>
        </Card>
      </div>

      {/* Improved Example Prompt */}
      <Card className="p-6 sm:p-8 bg-[#111827] border-violet-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-[#22D3EE]" />
            <span>Benchmark AI Builder Prompt (For Placement Preparation)</span>
          </div>
          <Badge variant="violet">100/100 Benchmark</Badge>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1020] border border-violet-900/40 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed select-all">
          &quot;{breakdown.exampleImprovedPrompt}&quot;
        </div>
        <p className="text-xs text-slate-400">
          <strong>Tip:</strong> Copy this prompt into ChatGPT, Gemini, or Claude to run mock placement interviews before your campus drives!
        </p>
      </Card>

      {/* Personalized Learning Tip */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border border-violet-700/40 flex items-start gap-3">
        <Flame className="w-5 h-5 text-[#22D3EE] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Your Level Tip ({breakdown.level})</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{breakdown.learningTip}</p>
        </div>
      </div>

      {/* Bottom Sticky CTA Bar */}
      <div className="text-center pt-4">
        <Link href={`/register?score=${score}&level=${encodeURIComponent(breakdown.level)}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ""}`}>
          <Button size="xl" variant="primary" className="px-8 shadow-xl shadow-violet-900/60">
            Claim Your Spot: Free 60-Minute AI Project Workshop →
          </Button>
        </Link>
      </div>
    </div>
  );
}

