"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@promptrush.internal");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid administrator credentials.");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("promptrush_admin_auth", "true");
      }

      const from = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("from") : null;
      router.push(from || "/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="violet" className="py-1 px-3 text-xs">
            ADMINISTRATOR ACCESS
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Growth Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to view campaign analytics, referral loops, experiments, and forecasting.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-[#111827]/95 border-violet-500/30 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#22D3EE]" />
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B1020] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span>
                <strong>Evaluation Credentials Pre-filled:</strong> Use <code className="text-violet-300">admin@promptrush.internal</code> / <code className="text-violet-300">admin123</code>.
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              className="w-full font-bold shadow-violet-900/50 gap-2"
            >
              <span>Authenticate into Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

