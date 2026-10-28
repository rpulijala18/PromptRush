"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  Zap,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Send,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrCreateSessionId, getSavedAttribution } from "@/lib/attribution/utm";
import { getOrAssignVariant } from "@/lib/experiments/ab-testing";

const TOTAL_TIME_SECONDS = 60;
const SESSION_ATTEMPT_KEY = "promptrush_current_attempt";

interface StoredAttemptState {
  attemptId: string;
  deadlineTimestamp: number; // Unix ms
  part: "A" | "B";
  selectedPrompt: "A" | "B" | null;
  writtenPrompt: string;
  hasStarted: boolean;
}

function ChallengeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [attemptId, setAttemptId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SECONDS);
  const [currentPart, setCurrentPart] = useState<"A" | "B">("A");
  const [selectedPrompt, setSelectedPrompt] = useState<"A" | "B" | null>(null);
  const [writtenPrompt, setWrittenPrompt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deadlineRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // Initialize or restore attempt state from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_ATTEMPT_KEY);
      if (saved) {
        const parsed: StoredAttemptState = JSON.parse(saved);
        const now = Date.now();

        // If attempt deadline is still valid
        if (parsed.hasStarted && parsed.deadlineTimestamp > now) {
          setAttemptId(parsed.attemptId);
          setHasStarted(true);
          setCurrentPart(parsed.part || "A");
          setSelectedPrompt(parsed.selectedPrompt);
          setWrittenPrompt(parsed.writtenPrompt || "");
          deadlineRef.current = parsed.deadlineTimestamp;
          setTimeLeft(Math.max(0, Math.ceil((parsed.deadlineTimestamp - now) / 1000)));
          return;
        } else if (parsed.hasStarted && parsed.deadlineTimestamp <= now) {
          // Time already expired previously while away
          sessionStorage.removeItem(SESSION_ATTEMPT_KEY);
        }
      }
    } catch (err) {
      console.warn("Could not parse saved attempt:", err);
    }

    // Generate fresh attempt ID
    const newId = "att_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    setAttemptId(newId);
  }, []);

  // Submit attempt to server
  const submitAttempt = useCallback(
    async (isTimeout = false) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setErrorMsg(null);

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      try {
        const sessionId = getOrCreateSessionId();
        const attribution = getSavedAttribution();
        const variant = getOrAssignVariant(sessionId);

        // Time spent calculation
        const now = Date.now();
        const deadline = deadlineRef.current || now;
        const timeRemaining = Math.max(0, Math.ceil((deadline - now) / 1000));
        const timeSpent = Math.min(TOTAL_TIME_SECONDS, TOTAL_TIME_SECONDS - timeRemaining);

        // Track challenge completion event
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousSessionId: sessionId,
            eventType: isTimeout ? "challenge_timeout" : "challenge_submit",
            acquisitionSource: attribution.utmSource || (attribution.ref ? "referral" : "direct"),
            referralCode: attribution.ref,
            experimentVariant: variant,
            metadata: {
              attemptId,
              timeSpentSeconds: timeSpent,
              isTimeout,
            },
          }),
        }).catch(() => {});

        // Post attempt
        const res = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            anonymousSessionId: sessionId,
            multipleChoiceAnswer: selectedPrompt,
            writtenPrompt: writtenPrompt.trim(),
            timeSpentSeconds: timeSpent,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Submission failed");
        }

        // Clear session storage attempt
        sessionStorage.removeItem(SESSION_ATTEMPT_KEY);

        // Smooth redirect to results page
        router.push(`/results/${attemptId}`);
      } catch (err: any) {
        console.error("Submission error:", err);
        setErrorMsg(err.message || "Failed to submit challenge. Please try again.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [attemptId, selectedPrompt, writtenPrompt, router]
  );

  // Countdown timer effect
  useEffect(() => {
    if (!hasStarted || !deadlineRef.current) return;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((deadlineRef.current! - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        submitAttempt(true); // Auto submit on timeout
      }
    };

    tick();
    timerIntervalRef.current = setInterval(tick, 500);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [hasStarted, submitAttempt]);

  // Persist draft to sessionStorage whenever state changes
  useEffect(() => {
    if (!hasStarted || !deadlineRef.current) return;
    try {
      const state: StoredAttemptState = {
        attemptId,
        deadlineTimestamp: deadlineRef.current,
        part: currentPart,
        selectedPrompt,
        writtenPrompt,
        hasStarted: true,
      };
      sessionStorage.setItem(SESSION_ATTEMPT_KEY, JSON.stringify(state));
    } catch {}
  }, [hasStarted, attemptId, currentPart, selectedPrompt, writtenPrompt]);

  // Start challenge button click
  const handleStartChallenge = () => {
    const now = Date.now();
    const deadline = now + TOTAL_TIME_SECONDS * 1000;
    deadlineRef.current = deadline;
    setHasStarted(true);
    setTimeLeft(TOTAL_TIME_SECONDS);

    // Track challenge start
    const sessionId = getOrCreateSessionId();
    const attribution = getSavedAttribution();
    const variant = getOrAssignVariant(sessionId);

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousSessionId: sessionId,
        eventType: "challenge_start",
        acquisitionSource: attribution.utmSource || (attribution.ref ? "referral" : "direct"),
        referralCode: attribution.ref,
        experimentVariant: variant,
        metadata: { attemptId },
      }),
    }).catch(() => {});
  };

  // Restart challenge
  const handleRestart = () => {
    sessionStorage.removeItem(SESSION_ATTEMPT_KEY);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    setSelectedPrompt(null);
    setWrittenPrompt("");
    setCurrentPart("A");
    setHasStarted(false);
    setTimeLeft(TOTAL_TIME_SECONDS);
    const newId = "att_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    setAttemptId(newId);
  };

  // Timer urgency colors
  const timerColor =
    timeLeft <= 10
      ? "text-red-400 border-red-500/50 bg-red-950/40 animate-pulse"
      : timeLeft <= 20
      ? "text-amber-400 border-amber-500/50 bg-amber-950/40"
      : "text-[#22D3EE] border-cyan-500/30 bg-cyan-950/40";

  const progressPercentage = (timeLeft / TOTAL_TIME_SECONDS) * 100;

  // -------------------------------------------------------------
  // VIEW 1: Ready to start screen
  // -------------------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-xl w-full">
          <Card className="p-8 sm:p-10 border-violet-500/30 bg-[#111827]/90 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#22D3EE] p-0.5 mx-auto">
              <div className="w-full h-full bg-[#0B1020] rounded-[14px] flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#22D3EE]" />
              </div>
            </div>

            <div className="space-y-3">
              <Badge variant="cyan" className="py-1 px-3 text-xs tracking-wider">
                NXTWAVE AI PLACEMENT CHALLENGE
              </Badge>
              <h2 className="text-3xl font-black text-white">
                Ready to Beat the Clock?
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Campus placement drives in 2027 demand practical AI competence. In <strong>60 seconds</strong>, benchmark your prompting skills, unlock your placement prompt score, and claim your free seat for the live workshop:
              </p>
              <div className="p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/50 text-xs text-violet-300 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Outcome: Free Entry to &quot;Build Your First AI Project in 60 Minutes&quot;</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-violet-400 uppercase tracking-wide">
                  Step 1: Part A (20 Pts)
                </div>
                <div className="text-sm font-semibold text-white">Spot the Better Prompt</div>
                <p className="text-xs text-slate-400">Choose between vague vs high-leverage placement interview prompts.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-[#22D3EE] uppercase tracking-wide">
                  Step 2: Part B (80 Pts)
                </div>
                <div className="text-sm font-semibold text-white">Write / Boost a Prompt</div>
                <p className="text-xs text-slate-400">Write an interview prompt or tap our 1-click booster chips.</p>
              </div>
            </div>

            {/* 3-Step Growth Sequence */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-b border-[#1E293B] py-2.5 px-2">
              <span className="flex items-center gap-1 text-slate-300 font-medium">1. Prompt (60s)</span>
              <span>→</span>
              <span className="flex items-center gap-1 text-[#22D3EE] font-medium">2. AI Builder Score</span>
              <span>→</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">3. Build AI Project</span>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                size="xl"
                variant="primary"
                onClick={handleStartChallenge}
                className="w-full text-base font-bold shadow-violet-900/50"
              >
                <span>Start 60s Challenge</span>
                <Zap className="w-5 h-5 text-[#22D3EE] fill-[#22D3EE]" />
              </Button>
              <p className="text-[11px] text-slate-400">
                Timer starts immediately. Drafts are saved if you refresh. Submits automatically at 0:00.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Active Challenge (Part A & Part B)
  // -------------------------------------------------------------
  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Sticky Countdown Header */}
      <div className="sticky top-20 z-40 mb-6 bg-[#0B1020]/95 backdrop-blur-md p-4 rounded-2xl border border-[#1E293B] shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              CHALLENGE PROGRESS
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  currentPart === "A"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700"
                }`}
                onClick={() => setCurrentPart("A")}
              >
                Part A: MCQ
              </span>
              <span className="text-slate-600">→</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  currentPart === "B"
                    ? "bg-[#22D3EE] text-slate-950 font-extrabold"
                    : "bg-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700"
                }`}
                onClick={() => setCurrentPart("B")}
              >
                Part B: Write Prompt
              </span>
            </div>
          </div>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono ${timerColor}`}>
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span className="text-xl font-black">
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>

          <button
            onClick={handleRestart}
            title="Restart Challenge"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-500 ease-linear ${
            timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-amber-500" : "bg-gradient-to-r from-violet-500 to-[#22D3EE]"
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PART A: Choose the Better Prompt */}
      {currentPart === "A" && (
        <Card className="p-6 sm:p-8 border-violet-500/30 bg-[#111827]/95 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="violet">PART A — 20 POINTS</Badge>
              <span className="text-xs text-slate-400">Step 1 of 2</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Choose the Better Prompt
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Scenario:</strong> You&apos;re preparing for a technical placement interview next week. Which AI prompt will help you prepare better?
            </p>
          </div>

          {/* Cards for Selection */}
          <div className="space-y-4 pt-2">
            {/* Prompt A */}
            <div
              onClick={() => setSelectedPrompt("A")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedPrompt === "A"
                  ? "bg-violet-950/60 border-violet-500 ring-2 ring-violet-500/40 shadow-lg shadow-violet-950/60"
                  : "bg-slate-900/60 border-[#1E293B] hover:border-slate-600 hover:bg-slate-850"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    selectedPrompt === "A"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {selectedPrompt === "A" ? <Check className="w-4 h-4" /> : "A"}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Option A
                  </div>
                  <p className="text-base text-slate-100 font-medium">
                    &quot;Help me prepare for interviews.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt B */}
            <div
              onClick={() => setSelectedPrompt("B")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedPrompt === "B"
                  ? "bg-violet-950/60 border-[#22D3EE] ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/60"
                  : "bg-slate-900/60 border-[#1E293B] hover:border-slate-600 hover:bg-slate-850"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    selectedPrompt === "B"
                      ? "bg-[#22D3EE] text-slate-950"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {selectedPrompt === "B" ? <Check className="w-4 h-4" /> : "B"}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Option B
                  </div>
                  <p className="text-base text-slate-100 font-medium leading-relaxed">
                    &quot;Act as a technical interviewer for a final-year engineering student. Ask me five beginner-friendly technical questions, one at a time. After each answer, give feedback and suggest one improvement.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#1E293B]">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Correct answer is revealed on the results screen.
            </p>
            <Button
              size="lg"
              variant="primary"
              disabled={!selectedPrompt}
              onClick={() => setCurrentPart("B")}
              className="gap-2"
            >
              <span>Next: Improve the Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* PART B: Improve the Prompt */}
      {currentPart === "B" && (
        <Card className="p-6 sm:p-8 border-violet-500/30 bg-[#111827]/95 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="cyan">PART B — 80 POINTS</Badge>
              <span className="text-xs text-slate-400">Step 2 of 2</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#22D3EE]" />
              Now You&apos;re the AI Builder!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Task:</strong> Write an AI prompt that helps a final-year engineering student prepare for a technical placement interview.
            </p>
          </div>

          {/* Prompt Writing Textarea */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={writtenPrompt}
                onChange={(e) => setWrittenPrompt(e.target.value.slice(0, 1000))}
                rows={6}
                placeholder="Act as a technical interviewer. I'm a final-year engineering student preparing for campus placements in software development. Ask me 5 DSA questions one at a time..."
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-2xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm sm:text-base leading-relaxed transition-all resize-y"
              />
            </div>

            {/* Character Counter & Tip */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Tip: Include persona, target topics, pacing, and feedback format.</span>
              <span className={writtenPrompt.length >= 950 ? "text-amber-400 font-bold" : ""}>
                {writtenPrompt.length}/1,000 characters
              </span>
            </div>
          </div>

          {/* Quick Helper Chips */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">Quick prompt boosters (click to insert):</span>
            <div className="flex flex-wrap gap-2">
              {[
                "Act as a technical interviewer",
                "Graduating engineering student in 2027",
                "Ask 5 questions one at a time",
                "Provide feedback and score out of 10",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setWrittenPrompt((prev) =>
                      prev ? `${prev.trim()} ${chip}.` : `${chip}.`
                    );
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E293B]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCurrentPart("A")}
            >
              ← Back to Part A
            </Button>

            <Button
              size="xl"
              variant="cyan"
              isLoading={isSubmitting}
              onClick={() => submitAttempt(false)}
              className="w-full sm:w-auto font-bold gap-2 shadow-cyan-900/40"
            >
              <span>Submit Challenge Early</span>
              <Send className="w-4 h-4 text-slate-950" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
          Loading 60s Challenge...
        </div>
      }
    >
      <ChallengeContent />
    </Suspense>
  );
}
