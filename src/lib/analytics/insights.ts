import { GrowthMetrics, ChannelPerformance } from "@/types";

export interface GrowthInsight {
  id: string;
  category: "acquisition" | "retention" | "conversion" | "referral";
  title: string;
  observation: string;
  recommendation: string;
  impact: "High" | "Medium" | "Strategic";
  metricTrigger: string;
}

/**
 * Deterministic, rule-based growth insights engine.
 * Transparent heuristics evaluated directly from real funnel metrics.
 */
export function generateGrowthInsights(
  metrics: GrowthMetrics,
  channels: ChannelPerformance[]
): GrowthInsight[] {
  const insights: GrowthInsight[] = [];

  const {
    uniqueVisitors,
    challengeStarts,
    challengeCompletions,
    demoRegistrations,
    referralRegistrations,
  } = metrics;

  // 1. Visit to Start Rate
  const startRate = uniqueVisitors > 0 ? (challengeStarts / uniqueVisitors) * 100 : 0;
  if (uniqueVisitors > 10 && startRate < 50) {
    insights.push({
      id: "insight_start_rate",
      category: "acquisition",
      title: "Hero Activation Drop-off",
      observation: `Only ${startRate.toFixed(1)}% of landing visitors initiate the 60-second challenge.`,
      recommendation:
        "Test a stronger challenge headline, add social proof badges ('1,000+ students took it'), or position a high-contrast 'Start Challenge' CTA above the fold on 360px mobile viewports.",
      impact: "High",
      metricTrigger: `Start Rate: ${startRate.toFixed(1)}% (< 50% benchmark)`,
    });
  } else if (uniqueVisitors > 0) {
    insights.push({
      id: "insight_start_healthy",
      category: "acquisition",
      title: "Strong Challenge Hook",
      observation: `${startRate.toFixed(1)}% of landing visitors jump straight into the challenge.`,
      recommendation:
        "The 60-second gamified framing is resonating. Keep the entry barrier friction-free without pre-registration gates.",
      impact: "Medium",
      metricTrigger: `Start Rate: ${startRate.toFixed(1)}% (Healthy)`,
    });
  }

  // 2. Challenge Completion Rate
  const completionRate = challengeStarts > 0 ? (challengeCompletions / challengeStarts) * 100 : 0;
  if (challengeStarts > 10 && completionRate < 65) {
    insights.push({
      id: "insight_completion_rate",
      category: "retention",
      title: "Timer or Prompt Friction",
      observation: `Challenge completion rate is ${completionRate.toFixed(1)}% (${(100 - completionRate).toFixed(1)}% drop-off mid-challenge).`,
      recommendation:
        "Simplify challenge instructions, provide prompt starter chips ('Act as a...', 'Ask me 3 questions...'), and optimize keyboard ergonomics on mobile browsers.",
      impact: "High",
      metricTrigger: `Completion Rate: ${completionRate.toFixed(1)}% (< 65% benchmark)`,
    });
  } else if (challengeStarts > 0) {
    insights.push({
      id: "insight_completion_healthy",
      category: "retention",
      title: "High Challenge Engagement",
      observation: `${completionRate.toFixed(1)}% of students who start complete the 60 seconds.`,
      recommendation:
        "The two-part challenge (MCQ choice + prompt improvement) has the right balance of speed and mental engagement.",
      impact: "Medium",
      metricTrigger: `Completion Rate: ${completionRate.toFixed(1)}% (Healthy)`,
    });
  }

  // 3. Completion to Registration Conversion Rate
  const registrationRate = challengeCompletions > 0 ? (demoRegistrations / challengeCompletions) * 100 : 0;
  if (challengeCompletions > 10 && registrationRate < 30) {
    insights.push({
      id: "insight_reg_conversion",
      category: "conversion",
      title: "Results-to-Workshop Bridge Friction",
      observation: `Only ${registrationRate.toFixed(1)}% of scored students proceed to register for the free workshop.`,
      recommendation:
        "Improve the workshop value proposition on the score screen. Emphasize 'Build Your First AI Project in 60 Minutes' and connect their score improvement areas directly to workshop outcomes.",
      impact: "High",
      metricTrigger: `Registration Rate: ${registrationRate.toFixed(1)}% (< 30% benchmark)`,
    });
  } else if (challengeCompletions > 0) {
    insights.push({
      id: "insight_reg_healthy",
      category: "conversion",
      title: "Compelling Workshop Transition",
      observation: `${registrationRate.toFixed(1)}% of students registering after seeing their score.`,
      recommendation:
        "The educational scoring rubric creates authentic curiosity to learn real AI project construction in the 60-minute workshop.",
      impact: "Strategic",
      metricTrigger: `Registration Rate: ${registrationRate.toFixed(1)}% (Strong)`,
    });
  }

  // 4. Referral Viral Loop Performance
  const referralRatio = demoRegistrations > 0 ? (referralRegistrations / demoRegistrations) * 100 : 0;
  if (demoRegistrations > 10 && referralRatio < 15) {
    insights.push({
      id: "insight_viral_coefficient",
      category: "referral",
      title: "Unrealized Viral Coefficient",
      observation: `Referral registrations account for ${referralRatio.toFixed(1)}% of total registrations.`,
      recommendation:
        "Add college campus leaderboards and emphasize friendly competition: 'Beat my score of 80/100 on PromptRush!' directly in the 1-click WhatsApp share button.",
      impact: "High",
      metricTrigger: `Referral Ratio: ${referralRatio.toFixed(1)}% (< 15% target)`,
    });
  } else if (demoRegistrations > 0) {
    insights.push({
      id: "insight_viral_healthy",
      category: "referral",
      title: "Strong Peer-to-Peer Loop",
      observation: `Peer referrals account for ${referralRatio.toFixed(1)}% of registrations.`,
      recommendation:
        "Students are actively challenging their college batchmates on WhatsApp groups. Double down on WhatsApp-optimized share cards.",
      impact: "Strategic",
      metricTrigger: `Referral Ratio: ${referralRatio.toFixed(1)}% (Vibrant)`,
    });
  }

  // 5. Channel Comparative Performance
  const waChannel = channels.find((c) => c.channel.toLowerCase().includes("whatsapp") || c.channel.toLowerCase().includes("direct"));
  const emailChannel = channels.find((c) => c.channel.toLowerCase().includes("email"));

  if (waChannel && emailChannel && waChannel.conversionRate > emailChannel.conversionRate * 1.3) {
    insights.push({
      id: "insight_wa_vs_email",
      category: "acquisition",
      title: "Channel Opportunity: WhatsApp Dominance",
      observation: `WhatsApp / Direct channels (${waChannel.conversionRate.toFixed(1)}%) significantly outperform Email (${emailChannel.conversionRate.toFixed(1)}%).`,
      recommendation:
        "Reallocate outreach effort toward WhatsApp college class groups and technical community threads while keeping sample sizes statistically monitored.",
      impact: "Medium",
      metricTrigger: `WhatsApp CR (${waChannel.conversionRate.toFixed(1)}%) vs Email CR (${emailChannel.conversionRate.toFixed(1)}%)`,
    });
  }

  return insights;
}

