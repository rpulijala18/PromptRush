import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-400 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Button>
        </Link>
        <Badge variant="violet" className="py-1 px-3 text-xs mb-2">
          DATA PRIVACY & COMPLIANCE
        </Badge>
        <h1 className="text-3xl font-black text-white">Privacy Policy & Academic Disclosure</h1>
        <p className="text-sm text-slate-400 mt-1">
          Last updated: October 2026 • Candidate Assignment Prototype for NxtWave Growth Challenge
        </p>
      </div>

      <Card className="p-8 bg-[#111827]/90 border-[#1E293B] space-y-6 text-sm text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#22D3EE]" />
            1. Nature of Application & Simulation Notice
          </h2>
          <p>
            <strong>PromptRush</strong> is an independent candidate-built project created exclusively as part of the hiring challenge for the <em>NxtWave Growth Intern – AI, Experiments & Community</em> role.
          </p>
          <p className="text-amber-300/90 bg-amber-950/30 p-3 rounded-xl border border-amber-900/40 text-xs">
            <strong>Important Notice:</strong> This application is a campaign simulation and demonstration prototype. Submitting registration records your interest in the demonstration and does not reserve a live commercial seat or create a binding contract with NxtWave Disruptive Technologies Pvt. Ltd.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-400" />
            2. Minimal Data Collection Principle
          </h2>
          <p>
            We adhere strictly to data minimization standards. The only student information collected during registration includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong>Full Name:</strong> For personalized workshop communication and demo badges.</li>
            <li><strong>Email Address:</strong> Normalized and hashed to prevent duplicate entries.</li>
            <li><strong>College & Engineering Branch:</strong> To verify placement cohort targeting (2027 batch).</li>
            <li><strong>Graduation Year:</strong> Ensuring relevant technical difficulty.</li>
          </ul>
          <p>
            Phone numbers and social security / national ID numbers are deliberately <strong>never requested or stored</strong>.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-emerald-400" />
            3. Protection of Written Prompts & Personal Data
          </h2>
          <p>
            Challenge submissions, written prompts, and scoring breakdowns are protected. Student prompts are never sold, scraped, or shared publicly. Shared scorecards (e.g. via WhatsApp) convey only the educational numerical score and referral code—they never disclose personal names, emails, or student responses.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#22D3EE]" />
            4. Anti-Spam & WhatsApp Protocol
          </h2>
          <p>
            PromptRush will never send automated unsolicited WhatsApp messages or scrape contact lists. The WhatsApp sharing mechanism is entirely student-initiated using standard prefilled intent links (<code className="text-xs text-[#22D3EE]">api.whatsapp.com/send</code>), leaving the student in full control of where and with whom they share the challenge.
          </p>
        </section>
      </Card>
    </div>
  );
}

