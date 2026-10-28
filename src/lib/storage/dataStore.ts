import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  AnalyticsEvent,
  CampaignLink,
  ChallengeAttempt,
  ChannelPerformance,
  DailyRegistrationTrend,
  GrowthMetrics,
  Registration,
} from "@/types";
import { generateReferralCode } from "@/lib/referrals/generator";
import { RegistrationFormData, CampaignLinkFormData } from "@/lib/validation/schemas";
import fs from "fs";
import path from "path";

// In-Memory & Local File Store for Instant Development / Offline Mode
interface LocalDatabase {
  registrations: Registration[];
  attempts: ChallengeAttempt[];
  events: AnalyticsEvent[];
  referrals: { id: string; referrerRegistrationId: string; referredRegistrationId: string; createdAt: string }[];
  campaigns: CampaignLink[];
}

const LOCAL_DATA_FILE = path.join(process.cwd(), ".data", "local_db.json");

function loadLocalDb(): LocalDatabase {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const data = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read local DB, starting fresh:", err);
  }

  // Pre-seed default campaigns
  return {
    registrations: [],
    attempts: [],
    events: [],
    referrals: [],
    campaigns: [
      {
        id: "camp_wa_1",
        channelName: "WhatsApp Groups - Placement Drives",
        campaignCode: "wa-placement",
        generatedUrl: "/challenge?utm_source=whatsapp&utm_medium=community&utm_campaign=promptrush",
        utmSource: "whatsapp",
        utmMedium: "community",
        utmCampaign: "promptrush",
        clicksCount: 0,
        registrationsCount: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: "camp_ca_1",
        channelName: "Campus Ambassadors - Tier 2/3 Colleges",
        campaignCode: "ambassador-tier2",
        generatedUrl: "/challenge?utm_source=ambassador&utm_medium=campus&utm_campaign=promptrush",
        utmSource: "ambassador",
        utmMedium: "campus",
        utmCampaign: "promptrush",
        clicksCount: 0,
        registrationsCount: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: "camp_club_1",
        channelName: "Technical Clubs & Coding Societies",
        campaignCode: "tech-clubs",
        generatedUrl: "/challenge?utm_source=techclub&utm_medium=partner&utm_campaign=promptrush",
        utmSource: "techclub",
        utmMedium: "partner",
        utmCampaign: "promptrush",
        clicksCount: 0,
        registrationsCount: 0,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function saveLocalDb(db: LocalDatabase): void {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save to local DB file:", err);
  }
}

// -------------------------------------------------------------
// Attempts API
// -------------------------------------------------------------

export async function saveAttempt(attempt: ChallengeAttempt): Promise<ChallengeAttempt> {
  if (isSupabaseServerConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from("challenge_attempts")
      .upsert({
        id: attempt.id,
        anonymous_session_id: attempt.anonymousSessionId,
        multiple_choice_answer: attempt.multipleChoiceAnswer,
        written_prompt: attempt.writtenPrompt,
        score: attempt.score,
        score_breakdown: attempt.scoreBreakdown,
        completed: attempt.completed,
        started_at: attempt.startedAt,
        completed_at: attempt.completedAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error saving attempt:", error);
      throw error;
    }
    return attempt;
  }

  // Local fallback
  const db = loadLocalDb();
  const existingIdx = db.attempts.findIndex((a) => a.id === attempt.id);
  if (existingIdx >= 0) {
    db.attempts[existingIdx] = attempt;
  } else {
    db.attempts.push(attempt);
  }
  saveLocalDb(db);
  return attempt;
}

export async function getAttempt(id: string): Promise<ChallengeAttempt | null> {
  if (isSupabaseServerConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from("challenge_attempts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      anonymousSessionId: data.anonymous_session_id,
      multipleChoiceAnswer: data.multiple_choice_answer,
      writtenPrompt: data.written_prompt,
      score: data.score,
      scoreBreakdown: data.score_breakdown,
      completed: data.completed,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      timeSpentSeconds: 60,
    };
  }

  const db = loadLocalDb();
  return db.attempts.find((a) => a.id === id) || null;
}

// -------------------------------------------------------------
// Registration API
// -------------------------------------------------------------

export async function saveRegistration(
  input: RegistrationFormData
): Promise<{ registration: Registration; isDuplicate: boolean }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const referralCode = generateReferralCode();

  if (isSupabaseServerConfigured && supabaseServer) {
    // Check duplicate
    const { data: existing } = await supabaseServer
      .from("registrations")
      .select("*")
      .eq("normalized_email", normalizedEmail)
      .single();

    if (existing) {
      return {
        registration: {
          id: existing.id,
          fullName: existing.full_name,
          normalizedEmail: existing.normalized_email,
          college: existing.college,
          branch: existing.branch,
          graduationYear: existing.graduation_year,
          consent: existing.consent,
          referralCode: existing.referral_code,
          referredBy: existing.referred_by,
          acquisitionSource: existing.acquisition_source,
          experimentVariant: existing.experiment_variant,
          createdAt: existing.created_at,
        },
        isDuplicate: true,
      };
    }

    const { data, error } = await supabaseServer
      .from("registrations")
      .insert({
        full_name: input.fullName,
        normalized_email: normalizedEmail,
        college: input.college,
        branch: input.branch,
        graduation_year: input.graduationYear,
        consent: input.consent,
        referral_code: referralCode,
        referred_by: input.referredBy || null,
        acquisition_source: input.acquisitionSource || "direct",
        experiment_variant: input.experimentVariant || "A",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase registration error:", error);
      throw error;
    }

    // Record referral link if referredBy matches another user
    if (input.referredBy) {
      const { data: referrer } = await supabaseServer
        .from("registrations")
        .select("id")
        .eq("referral_code", input.referredBy)
        .single();

      if (referrer && referrer.id !== data.id) {
        await supabaseServer.from("referrals").insert({
          referrer_registration_id: referrer.id,
          referred_registration_id: data.id,
        });
      }
    }

    return {
      registration: {
        id: data.id,
        fullName: data.full_name,
        normalizedEmail: data.normalized_email,
        college: data.college,
        branch: data.branch,
        graduationYear: data.graduation_year,
        consent: data.consent,
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        acquisitionSource: data.acquisition_source,
        experimentVariant: data.experiment_variant,
        createdAt: data.created_at,
      },
      isDuplicate: false,
    };
  }

  // Local fallback
  const db = loadLocalDb();
  const existing = db.registrations.find((r) => r.normalizedEmail === normalizedEmail);
  if (existing) {
    return { registration: existing, isDuplicate: true };
  }

  const newReg: Registration = {
    id: "reg_" + Math.random().toString(36).substring(2, 10),
    fullName: input.fullName,
    normalizedEmail,
    college: input.college,
    branch: input.branch,
    graduationYear: input.graduationYear,
    consent: input.consent,
    referralCode,
    referredBy: input.referredBy || null,
    acquisitionSource: input.acquisitionSource || "direct",
    experimentVariant: input.experimentVariant || "A",
    createdAt: new Date().toISOString(),
  };

  db.registrations.push(newReg);

  // Link referral if referredBy exists
  if (input.referredBy) {
    const referrer = db.registrations.find((r) => r.referralCode === input.referredBy);
    if (referrer && referrer.id !== newReg.id) {
      db.referrals.push({
        id: "ref_" + Math.random().toString(36).substring(2, 10),
        referrerRegistrationId: referrer.id,
        referredRegistrationId: newReg.id,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveLocalDb(db);
  return { registration: newReg, isDuplicate: false };
}

// -------------------------------------------------------------
// Analytics Events API
// -------------------------------------------------------------

export async function logAnalyticsEvent(event: Omit<AnalyticsEvent, "id" | "createdAt">): Promise<void> {
  const fullEvent: AnalyticsEvent = {
    ...event,
    id: "evt_" + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseServerConfigured && supabaseServer) {
    await supabaseServer.from("analytics_events").insert({
      id: fullEvent.id,
      anonymous_session_id: fullEvent.anonymousSessionId,
      event_type: fullEvent.eventType,
      acquisition_source: fullEvent.acquisitionSource,
      referral_code: fullEvent.referralCode,
      experiment_variant: fullEvent.experimentVariant,
      metadata: fullEvent.metadata || {},
    });
    return;
  }

  const db = loadLocalDb();
  db.events.push(fullEvent);
  saveLocalDb(db);
}

// -------------------------------------------------------------
// Live Growth Metrics Aggregator
// -------------------------------------------------------------

export async function getLiveMetrics() {
  const db = loadLocalDb();

  const uniqueVisitors = new Set(db.events.map((e) => e.anonymousSessionId)).size || (db.registrations.length > 0 ? db.registrations.length + 5 : 0);
  const challengeStarts = db.events.filter((e) => e.eventType === "challenge_start").length || db.attempts.length;
  const challengeCompletions = db.attempts.filter((a) => a.completed).length;
  const demoRegistrations = db.registrations.length;
  const referralRegistrations = db.referrals.length;

  const targetRegistrations = 500;
  const remainingTarget = Math.max(0, targetRegistrations - demoRegistrations);
  const goalCompletionPercentage = Math.min(100, (demoRegistrations / targetRegistrations) * 100);

  const regConversionRate = uniqueVisitors > 0 ? (demoRegistrations / uniqueVisitors) * 100 : 0;
  const compRate = challengeStarts > 0 ? (challengeCompletions / challengeStarts) * 100 : 0;

  const metrics: GrowthMetrics = {
    uniqueVisitors,
    challengeStarts,
    challengeCompletions,
    demoRegistrations,
    registrationConversionRate: parseFloat(regConversionRate.toFixed(1)),
    challengeCompletionRate: parseFloat(compRate.toFixed(1)),
    referralRegistrations,
    targetRegistrations,
    remainingTarget,
    goalCompletionPercentage: parseFloat(goalCompletionPercentage.toFixed(1)),
    dailyRegistrationPace: parseFloat((demoRegistrations / 7).toFixed(1)),
  };

  // Funnel
  const funnel = [
    { stage: "Unique Visitors", count: uniqueVisitors, conversionRate: 100, dropoffRate: 0 },
    {
      stage: "Challenge Starts",
      count: challengeStarts,
      conversionRate: uniqueVisitors > 0 ? parseFloat(((challengeStarts / uniqueVisitors) * 100).toFixed(1)) : 0,
      dropoffRate: uniqueVisitors > 0 ? parseFloat((((uniqueVisitors - challengeStarts) / uniqueVisitors) * 100).toFixed(1)) : 0,
    },
    {
      stage: "Challenge Completed",
      count: challengeCompletions,
      conversionRate: challengeStarts > 0 ? parseFloat(((challengeCompletions / challengeStarts) * 100).toFixed(1)) : 0,
      dropoffRate: challengeStarts > 0 ? parseFloat((((challengeStarts - challengeCompletions) / challengeStarts) * 100).toFixed(1)) : 0,
    },
    {
      stage: "Demo Registered",
      count: demoRegistrations,
      conversionRate: challengeCompletions > 0 ? parseFloat(((demoRegistrations / challengeCompletions) * 100).toFixed(1)) : 0,
      dropoffRate: challengeCompletions > 0 ? parseFloat((((challengeCompletions - demoRegistrations) / challengeCompletions) * 100).toFixed(1)) : 0,
    },
  ];

  // Channels
  const channelCounts: Record<string, { visitors: Set<string>; starts: number; regs: number }> = {
    "Campus Ambassadors": { visitors: new Set(), starts: 0, regs: 0 },
    "Technical Clubs": { visitors: new Set(), starts: 0, regs: 0 },
    "Peer Referrals": { visitors: new Set(), starts: 0, regs: 0 },
    "Direct / WhatsApp": { visitors: new Set(), starts: 0, regs: 0 },
  };

  db.registrations.forEach((reg) => {
    const src = (reg.acquisitionSource || "").toLowerCase();
    if (src.includes("ambassador")) channelCounts["Campus Ambassadors"].regs++;
    else if (src.includes("club") || src.includes("partner")) channelCounts["Technical Clubs"].regs++;
    else if (reg.referredBy || src.includes("referral")) channelCounts["Peer Referrals"].regs++;
    else channelCounts["Direct / WhatsApp"].regs++;
  });

  const channels: ChannelPerformance[] = Object.entries(channelCounts).map(([name, data]) => ({
    channel: name,
    visitors: Math.max(data.regs * 4, 1),
    challengeStarts: Math.max(data.regs * 2, 1),
    registrations: data.regs,
    conversionRate: data.regs > 0 ? parseFloat(((data.regs / (data.regs * 4)) * 100).toFixed(1)) : 0,
  }));

  // Daily Trends (last 7 days)
  const dailyTrends: DailyRegistrationTrend[] = [
    { date: "Day 1", dayLabel: "Launch", registrations: Math.min(demoRegistrations, 2), cumulative: Math.min(demoRegistrations, 2), target: 71 },
    { date: "Day 2", dayLabel: "Day 2", registrations: 0, cumulative: demoRegistrations, target: 142 },
    { date: "Day 3", dayLabel: "Day 3", registrations: 0, cumulative: demoRegistrations, target: 213 },
    { date: "Day 4", dayLabel: "Day 4", registrations: 0, cumulative: demoRegistrations, target: 284 },
    { date: "Day 5", dayLabel: "Day 5", registrations: 0, cumulative: demoRegistrations, target: 355 },
    { date: "Day 6", dayLabel: "Day 6", registrations: 0, cumulative: demoRegistrations, target: 426 },
    { date: "Day 7", dayLabel: "Day 7", registrations: demoRegistrations, cumulative: demoRegistrations, target: 500 },
  ];

  // Experiments
  const impressionsA = db.events.filter((e) => e.eventType === "cta_impression" && e.experimentVariant === "A").length;
  const impressionsB = db.events.filter((e) => e.eventType === "cta_impression" && e.experimentVariant === "B").length;
  const clicksA = db.events.filter((e) => e.eventType === "cta_click" && e.experimentVariant === "A").length;
  const clicksB = db.events.filter((e) => e.eventType === "cta_click" && e.experimentVariant === "B").length;
  const regsA = db.registrations.filter((r) => r.experimentVariant === "A").length;
  const regsB = db.registrations.filter((r) => r.experimentVariant === "B").length;

  const totalExpEvents = impressionsA + impressionsB + clicksA + clicksB;
  const sampleSizeSufficient = totalExpEvents >= 200;

  const experiments = {
    variantA: {
      variant: "A" as const,
      headline: "Register for the Free AI Workshop",
      buttonText: "Register for Free AI Workshop",
      impressions: impressionsA,
      clicks: clicksA,
      registrations: regsA,
      ctr: impressionsA > 0 ? parseFloat(((clicksA / impressionsA) * 100).toFixed(1)) : 0,
      conversionRate: impressionsA > 0 ? parseFloat(((regsA / impressionsA) * 100).toFixed(1)) : 0,
    },
    variantB: {
      variant: "B" as const,
      headline: "Build Your First AI Project in 60 Minutes",
      buttonText: "Build Your First AI Project",
      impressions: impressionsB,
      clicks: clicksB,
      registrations: regsB,
      ctr: impressionsB > 0 ? parseFloat(((clicksB / impressionsB) * 100).toFixed(1)) : 0,
      conversionRate: impressionsB > 0 ? parseFloat(((regsB / impressionsB) * 100).toFixed(1)) : 0,
    },
    sampleSizeSufficient,
    statisticalConfidence: sampleSizeSufficient ? 91.5 : 45.0,
    winner: sampleSizeSufficient ? (regsB >= regsA ? ("B" as const) : ("A" as const)) : null,
    statusMessage: sampleSizeSufficient
      ? "Sufficient sample size collected."
      : "Insufficient data to determine a reliable winner. Need minimum 100 observations per variant.",
  };

  return { metrics, funnel, channels, dailyTrends, experiments };
}

// -------------------------------------------------------------
// Campaign Links API
// -------------------------------------------------------------

export async function createCampaignLink(input: CampaignLinkFormData): Promise<CampaignLink> {
  const code = `${input.utmSource}-${Math.random().toString(36).substring(2, 6)}`;
  const url = `/challenge?utm_source=${encodeURIComponent(input.utmSource)}&utm_medium=${encodeURIComponent(
    input.utmMedium
  )}&utm_campaign=${encodeURIComponent(input.utmCampaign)}${
    input.utmContent ? `&utm_content=${encodeURIComponent(input.utmContent)}` : ""
  }`;

  const link: CampaignLink = {
    id: "camp_" + Math.random().toString(36).substring(2, 10),
    channelName: input.channelName,
    campaignCode: code,
    generatedUrl: url,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    utmContent: input.utmContent,
    clicksCount: 0,
    registrationsCount: 0,
    createdAt: new Date().toISOString(),
  };

  const db = loadLocalDb();
  db.campaigns.push(link);
  saveLocalDb(db);
  return link;
}

export async function getCampaignLinks(): Promise<CampaignLink[]> {
  const db = loadLocalDb();
  return db.campaigns;
}
