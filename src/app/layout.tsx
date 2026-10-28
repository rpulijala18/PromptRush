import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

export const metadata: Metadata = {
  title: "PromptRush — 60 Seconds. One Prompt. Beat the Clock.",
  description:
    "Take a 60-second AI prompting challenge, discover your score, and learn how to build your first AI project in 60 minutes. Built for engineering students graduating in 2027.",
  openGraph: {
    title: "PromptRush — Think Fast. Prompt Smarter.",
    description: "60 Seconds. One Prompt. Beat the Clock. Can you score AI Builder?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B1020] text-[#F9FAFB] min-h-screen flex flex-col selection:bg-violet-600 selection:text-white">
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

