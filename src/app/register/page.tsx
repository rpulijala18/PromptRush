"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Building,
  Mail,
  User,
  BookOpen,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { registrationSchema } from "@/lib/validation/schemas";
import { getOrCreateSessionId, getSavedAttribution } from "@/lib/attribution/utm";
import { getOrAssignVariant } from "@/lib/experiments/ab-testing";

const ENGINEERING_BRANCHES = [
  "Computer Science & Engineering (CSE)",
  "Information Technology (IT)",
  "Electronics & Communication (ECE)",
  "Electrical & Electronics (EEE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Artificial Intelligence & Data Science (AI/DS)",
  "Other Engineering Branch",
];

const GRADUATION_YEARS = [2024, 2025, 2026, 2027, 2028];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params carryover
  const scoreParam = searchParams.get("score");
  const levelParam = searchParams.get("level");
  const refParam = searchParams.get("ref");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("Computer Science & Engineering (CSE)");
  const [graduationYear, setGraduationYear] = useState(2027);
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Track registration page view & experiment variant
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const attribution = getSavedAttribution();
    const variant = getOrAssignVariant(sessionId);

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousSessionId: sessionId,
        eventType: "registration_attempt",
        acquisitionSource: attribution.utmSource || (attribution.ref ? "referral" : "direct"),
        referralCode: refParam || attribution.ref,
        experimentVariant: variant,
      }),
    }).catch(() => {});
  }, [refParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const sessionId = getOrCreateSessionId();
    const attribution = getSavedAttribution();
    const variant = getOrAssignVariant(sessionId);

    // Client-side Zod validation
    const result = registrationSchema.safeParse({
      fullName,
      email,
      college,
      branch,
      graduationYear,
      consent,
      referredBy: refParam || attribution.ref || null,
      acquisitionSource: attribution.utmSource || (attribution.ref ? "referral" : "direct"),
      experimentVariant: variant,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Log successful registration event
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousSessionId: sessionId,
          eventType: "registration_success",
          acquisitionSource: attribution.utmSource || (attribution.ref ? "referral" : "direct"),
          referralCode: refParam || attribution.ref,
          experimentVariant: variant,
          metadata: {
            isDuplicate: data.isDuplicate,
            referralCode: data.referralCode,
          },
        }),
      }).catch(() => {});

      // Redirect to success screen with referral code & parameters
      const successQuery = new URLSearchParams({
        ref: data.referralCode,
        name: data.fullName,
        duplicate: data.isDuplicate ? "1" : "0",
      });
      if (scoreParam) successQuery.set("score", scoreParam);

      router.push(`/success?${successQuery.toString()}`);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
          FREE ONLINE WORKSHOP
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Build Your First AI Project in 60 Minutes
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          From your first prompt to your first working AI application. Register for the upcoming live online session.
        </p>

        {scoreParam ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/80 border border-violet-700 text-violet-300 text-xs font-semibold shadow-md shadow-violet-950/40">
            <Sparkles className="w-4 h-4 text-[#22D3EE]" />
            <span>Challenge Completed • Score: {scoreParam}/100</span>
            {levelParam && <span>• Tier: {levelParam}</span>}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/70 via-purple-950/50 to-cyan-950/70 border border-violet-600/40 text-xs text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-violet-950/30">
            <div className="flex items-center gap-2 text-left">
              <Zap className="w-4 h-4 text-[#22D3EE] shrink-0 fill-[#22D3EE]" />
              <span>
                <strong>Want to benchmark your AI skills first?</strong> Take the 60-second PromptRush challenge to get your prompt score!
              </span>
            </div>
            <Link href="/challenge" className="shrink-0">
              <Button size="sm" variant="cyan" className="text-xs font-bold py-1 px-3">
                Take 60s Challenge →
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Registration Card */}
      <Card className="p-6 sm:p-8 bg-[#111827]/95 border-violet-500/30 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#22D3EE]" />
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#22D3EE]" />
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.sharma@college.edu"
              className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* College */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#22D3EE]" />
              College / Institute Name *
            </label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. JNTU Hyderabad, VIT, SRM, etc."
              className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {errors.college && <p className="text-xs text-red-400">{errors.college}</p>}
          </div>

          {/* Engineering Branch & Graduation Year (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#22D3EE]" />
                Branch *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {ENGINEERING_BRANCHES.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-white">
                    {b}
                  </option>
                ))}
              </select>
              {errors.branch && <p className="text-xs text-red-400">{errors.branch}</p>}
            </div>

            {/* Graduation Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#22D3EE]" />
                Graduation Year *
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value))}
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {GRADUATION_YEARS.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-white">
                    {yr} {yr === 2027 ? "(Target Cohort)" : ""}
                  </option>
                ))}
              </select>
              {errors.graduationYear && (
                <p className="text-xs text-red-400">{errors.graduationYear}</p>
              )}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-[#0B1020]"
            />
            <label htmlFor="consent" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
              (Optional) Send me workshop reminders, project starter code, and AI study resources via email.
            </label>
          </div>

          {/* Candidate Prototype Simulation Disclosure */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>Simulation Disclosure:</strong> This is a candidate-built campaign simulation. Registration here records your interest in the demo and does not reserve an official NxtWave workshop seat.
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="xl"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full text-base font-bold shadow-violet-900/50 gap-2"
          >
            <span>Complete Free Registration</span>
            <ArrowRight className="w-5 h-5 text-[#22D3EE]" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
          Loading Workshop Registration...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
