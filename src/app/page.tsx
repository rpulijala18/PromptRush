"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  ShieldCheck,
  ChevronDown,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getOrAssignVariant, VARIANTS, ExperimentVariant } from "@/lib/experiments/ab-testing";
import { getOrCreateSessionId } from "@/lib/attribution/utm";

export default function HomePage() {
  const [variant, setVariant] = useState<ExperimentVariant>("A");
  const [mockTimer, setMockTimer] = useState(60);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const assigned = getOrAssignVariant(sessionId);
    setVariant(assigned);

    // Subtle countdown preview animation
    const interval = setInterval(() => {
      setMockTimer((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    // Track CTA impression
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousSessionId: sessionId,
        eventType: "cta_impression",
        experimentVariant: assigned,
        metadata: { location: "hero" },
      }),
    }).catch(() => {});

    return () => clearInterval(interval);
  }, []);

  const variantConfig = VARIANTS[variant];

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#7C3AED] rounded-full blur-[140px]" />
        <div className="absolute top-24 right-1/4 w-80 h-80 bg-[#22D3EE] rounded-full blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/80 border border-violet-700/50 text-violet-300 text-xs font-semibold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 text-[#22D3EE] fill-[#22D3EE]" />
              THE 60-SECOND AI CHALLENGE
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Think You’re <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-[#22D3EE]">
                  Good at AI?
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-200">
                Prove It in 60 Seconds.
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Take a quick AI prompting challenge, discover your score, and learn how to become a better AI builder. Designed for final-year engineering students preparing for technical placement drives.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Badge variant="violet" className="py-1 px-3 text-xs">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#22D3EE]" />
                60 Seconds
              </Badge>
              <Badge variant="cyan" className="py-1 px-3 text-xs">
                <Brain className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                Beginner Friendly
              </Badge>
              <Badge variant="default" className="py-1 px-3 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                No Coding Required
              </Badge>
            </div>

            {/* Hero CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/challenge" className="w-full sm:w-auto">
                <Button size="xl" variant="primary" className="w-full group shadow-violet-900/40">
                  <span>Start Challenge</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#22D3EE]" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full">
                  <span>How It Works</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 pt-2 text-xs text-slate-400">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Targeting 2027 Engineering Graduates across India</span>
            </div>
          </div>

          {/* Right Column: Interactive Countdown & Challenge Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#22D3EE] to-[#7C3AED] opacity-30 blur-xl animate-pulse" />

              <Card className="relative bg-[#111827]/95 border-violet-500/30 overflow-hidden shadow-2xl">
                {/* Header bar with simulated live timer */}
                <div className="p-4 bg-[#0B1020]/80 border-b border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Interactive Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-800/40 text-violet-300 font-mono text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <span>00:{mockTimer < 10 ? `0${mockTimer}` : mockTimer}</span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <div className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">
                      PART A: WHICH PROMPT WINS?
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      &quot;You&apos;re preparing for a technical placement interview next week. Which prompt gets better results?&quot;
                    </p>
                  </div>

                  {/* Prompt A vs Prompt B preview cards */}
                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-bold flex items-center justify-center shrink-0">
                        A
                      </span>
                      <span>&quot;Help me prepare for interviews.&quot;</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-600/50 text-xs text-slate-200 flex items-start gap-3 shadow-md shadow-violet-950/50">
                      <span className="w-5 h-5 rounded-md bg-violet-600 text-white font-bold flex items-center justify-center shrink-0">
                        B
                      </span>
                      <span>
                        &quot;Act as a technical interviewer for a 2027 engineer. Ask 5 beginner-friendly DSA questions one at a time with feedback...&quot;
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href="/challenge" className="block w-full">
                      <Button variant="cyan" size="md" className="w-full text-xs font-bold">
                        Beat the Clock Now →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#0B1020]/90 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-[#22D3EE] uppercase">
              THE 3-STEP GROWTH EXPERIENCE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              How PromptRush Works
            </h3>
            <p className="text-slate-400 text-base">
              A rapid 60-second micro-challenge designed to reveal your current AI prompting strengths and guide your journey to becoming an AI builder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="p-8 relative hover:border-violet-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-violet-950 border border-violet-800 flex items-center justify-center text-xl font-black text-violet-400 mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-white mb-2">THINK</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Solve a real AI prompting problem in 60 seconds. Choose between effective and vague prompts, then write your own improved prompt for technical placement prep.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 relative hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xl font-black text-[#22D3EE] mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-white mb-2">SCORE</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Discover your score out of 100 based on an educational rubric: Clear Objective, Relevant Context, Specific Instructions, and Output Format.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 relative hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xl font-black text-emerald-400 mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-white mb-2">BUILD</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock your personalized prompt improvement recommendations and explore the free workshop to construct your first production-ready AI application.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Workshop Promotion Section (A/B Tested CTA) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-b from-[#111827] to-[#0B1020] border border-violet-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              FREE ONLINE WORKSHOP
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white">
              {variantConfig.headline}
            </h3>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {variantConfig.subtext} Take what you learn in 60 seconds and turn it into a real, deployable portfolio project in 60 minutes.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" variant="primary" className="shadow-violet-900/40">
                  {variantConfig.buttonText}
                </Button>
              </Link>
              <Link href="/challenge">
                <Button size="xl" variant="outline">
                  Take Challenge First
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-400 pt-4">
              PromptRush is an independent candidate-created campaign prototype for the NxtWave Growth Challenge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

