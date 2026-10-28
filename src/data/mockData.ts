import {
  ChannelPerformance,
  DailyRegistrationTrend,
  ExperimentStats,
  GrowthMetrics,
} from "@/types";

export interface SimulatedDataset {
  isSimulated: true;
  label: string;
  disclaimer: string;
  metrics: GrowthMetrics;
  funnel: {
    stage: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
  }[];
  dailyTrends: DailyRegistrationTrend[];
  channels: ChannelPerformance[];
  experiments: {
    variantA: ExperimentStats;
    variantB: ExperimentStats;
    sampleSizeSufficient: boolean;
    statisticalConfidence: number;
    winner: 'A' | 'B' | null;
    statusMessage: string;
  };
  simulatorDefaults: {
    ambassadorCount: number;
    ambassadorYield: number;
    clubCount: number;
    clubYield: number;
    peerReferrals: number;
    directOutreach: number;
  };
}

export const SIMULATED_DATASET: SimulatedDataset = {
  isSimulated: true,
  label: "SIMULATED 7-DAY CAMPAIGN",
  disclaimer:
    "SIMULATED DATA — NOT ACTUAL REGISTRATIONS. For candidate hiring challenge demonstration only.",
  metrics: {
    uniqueVisitors: 3240,
    challengeStarts: 1870,
    challengeCompletions: 1395,
    demoRegistrations: 500,
    registrationConversionRate: 15.43, // 500 / 3240
    challengeCompletionRate: 74.6, // 1395 / 1870
    referralRegistrations: 100,
    targetRegistrations: 500,
    remainingTarget: 0,
    goalCompletionPercentage: 100,
    dailyRegistrationPace: 71.4, // 500 / 7
  },
  funnel: [
    { stage: "Unique Visitors", count: 3240, conversionRate: 100, dropoffRate: 0 },
    { stage: "Challenge Starts", count: 1870, conversionRate: 57.7, dropoffRate: 42.3 },
    { stage: "Challenge Completed", count: 1395, conversionRate: 43.1, dropoffRate: 14.6 },
    { stage: "Demo Registered", count: 500, conversionRate: 15.4, dropoffRate: 27.7 },
  ],
  dailyTrends: [
    { date: "Day 1", dayLabel: "Launch & Pilot", registrations: 25, cumulative: 25, target: 71 },
    { date: "Day 2", dayLabel: "Ambassador Onboarding", registrations: 45, cumulative: 70, target: 142 },
    { date: "Day 3", dayLabel: "WhatsApp Push", registrations: 60, cumulative: 130, target: 213 },
    { date: "Day 4", dayLabel: "Club Partnerships", registrations: 75, cumulative: 205, target: 284 },
    { date: "Day 5", dayLabel: "Mid-Campaign Push", registrations: 85, cumulative: 290, target: 355 },
    { date: "Day 6", dayLabel: "Viral Referral Spike", registrations: 100, cumulative: 390, target: 426 },
    { date: "Day 7", dayLabel: "Final Sprint", registrations: 110, cumulative: 500, target: 500 },
  ],
  channels: [
    {
      channel: "Campus Ambassadors",
      visitors: 1180,
      challengeStarts: 720,
      registrations: 200,
      conversionRate: 16.9,
    },
    {
      channel: "Technical Clubs",
      visitors: 890,
      challengeStarts: 540,
      registrations: 150,
      conversionRate: 16.8,
    },
    {
      channel: "Peer Referrals",
      visitors: 620,
      challengeStarts: 390,
      registrations: 100,
      conversionRate: 16.1,
    },
    {
      channel: "Direct Outreach / WhatsApp",
      visitors: 410,
      challengeStarts: 180,
      registrations: 40,
      conversionRate: 9.8,
    },
    {
      channel: "Email Outreach",
      visitors: 140,
      challengeStarts: 40,
      registrations: 10,
      conversionRate: 7.1,
    },
  ],
  experiments: {
    variantA: {
      variant: "A",
      headline: "Register for the Free AI Workshop",
      buttonText: "Register for Free AI Workshop",
      impressions: 1610,
      clicks: 435,
      registrations: 232,
      ctr: 27.02,
      conversionRate: 14.41,
    },
    variantB: {
      variant: "B",
      headline: "Build Your First AI Project in 60 Minutes",
      buttonText: "Build Your First AI Project",
      impressions: 1630,
      clicks: 512,
      registrations: 268,
      ctr: 31.41,
      conversionRate: 16.44,
    },
    sampleSizeSufficient: true,
    statisticalConfidence: 94.2,
    winner: "B",
    statusMessage: "Variant B outperformed Variant A with +2.03% conversion lift.",
  },
  simulatorDefaults: {
    ambassadorCount: 10,
    ambassadorYield: 20, // 10 * 20 = 200
    clubCount: 5,
    clubYield: 30, // 5 * 30 = 150
    peerReferrals: 100, // 100
    directOutreach: 50, // 50
    // Total = 200 + 150 + 100 + 50 = 500
  },
};

