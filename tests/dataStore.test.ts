import { describe, it, expect, beforeEach } from "vitest";
import {
  saveAttempt,
  getAttempt,
  saveRegistration,
  createCampaignLink,
  getCampaignLinks,
  getLiveMetrics,
} from "../src/lib/storage/dataStore";
import { ChallengeAttempt } from "../src/types";

describe("DataStore & Growth Engine Resilience", () => {
  it("persists and retrieves challenge attempt by ID", async () => {
    const testAttempt: ChallengeAttempt = {
      id: "att_test_" + Date.now(),
      anonymousSessionId: "ses_unit_test",
      multipleChoiceAnswer: "B",
      writtenPrompt: "Act as an interviewer...",
      score: 85,
      scoreBreakdown: {
        totalScore: 85,
        level: "AI Builder",
        multipleChoice: { score: 20, maxScore: 20, name: "MCQ Accuracy", feedback: "Correct" },
        clearObjective: { score: 20, maxScore: 20, name: "Clear Objective", feedback: "Strong" },
        relevantContext: { score: 15, maxScore: 20, name: "Relevant Context", feedback: "Good" },
        specificInstructions: { score: 15, maxScore: 20, name: "Specific Instructions", feedback: "Good" },
        outputFormat: { score: 15, maxScore: 20, name: "Output Format", feedback: "Good" },
        strengths: ["Clear role", "Structured questions"],
        improvements: ["Specify feedback criteria"],
        exampleImprovedPrompt: "Benchmark prompt",
        learningTip: "Focus on edge cases",
      },
      completed: true,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 45,
    };

    const saved = await saveAttempt(testAttempt);
    expect(saved.id).toBe(testAttempt.id);

    const retrieved = await getAttempt(testAttempt.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(testAttempt.id);
    expect(retrieved?.score).toBe(85);
  });

  it("returns null for non-existent attempt ID without fabricating data", async () => {
    const randomId = "att_non_existent_" + Math.random().toString(36);
    const result = await getAttempt(randomId);
    expect(result).toBeNull();
  });

  it("saves registration and enforces deduplication by normalized email", async () => {
    const email = `test.student.${Date.now()}@example.com`;
    const regInput = {
      fullName: "Priya Sharma",
      email: `  ${email.toUpperCase()}  `,
      college: "NIT Warangal",
      branch: "Computer Science & Engineering (CSE)",
      graduationYear: 2027,
      consent: true,
      referredBy: null,
      acquisitionSource: "direct",
      experimentVariant: "A" as const,
    };

    // First save
    const firstRes = await saveRegistration(regInput);
    expect(firstRes.isDuplicate).toBe(false);
    expect(firstRes.registration.normalizedEmail).toBe(email.toLowerCase());
    expect(firstRes.registration.referralCode.startsWith("RUSH")).toBe(true);

    // Duplicate save with same email
    const duplicateRes = await saveRegistration({
      ...regInput,
      fullName: "Priya S.",
    });
    expect(duplicateRes.isDuplicate).toBe(true);
    expect(duplicateRes.registration.referralCode).toBe(firstRes.registration.referralCode);
  });

  it("attributes referrals and prevents duplicate referral inflation", async () => {
    const referrerEmail = `referrer.${Date.now()}@college.edu`;
    const referrer = await saveRegistration({
      fullName: "Referrer Student",
      email: referrerEmail,
      college: "IIT Madras",
      branch: "CSE",
      graduationYear: 2027,
      consent: true,
    });

    const referredEmail = `referred.${Date.now()}@college.edu`;
    const referred = await saveRegistration({
      fullName: "Referred Friend",
      email: referredEmail,
      college: "IIT Madras",
      branch: "IT",
      graduationYear: 2027,
      consent: true,
      referredBy: referrer.registration.referralCode,
    });

    expect(referred.isDuplicate).toBe(false);
    expect(referred.registration.referredBy).toBe(referrer.registration.referralCode);

    // Re-registering the same referred friend does NOT count as a new registration
    const reReg = await saveRegistration({
      fullName: "Referred Friend",
      email: referredEmail,
      college: "IIT Madras",
      branch: "IT",
      graduationYear: 2027,
      consent: true,
      referredBy: referrer.registration.referralCode,
    });
    expect(reReg.isDuplicate).toBe(true);
  });

  it("creates and retrieves campaign links with properly encoded UTM params", async () => {
    const campaignData = {
      channelName: "Placement Drive 2027 WhatsApp",
      utmSource: "whatsapp placement",
      utmMedium: "group chat",
      utmCampaign: "hiring blitz",
      utmContent: "announcement 1",
    };

    const link = await createCampaignLink(campaignData);
    expect(link.channelName).toBe("Placement Drive 2027 WhatsApp");
    expect(link.generatedUrl).toContain("utm_source=whatsapp%20placement");
    expect(link.generatedUrl).toContain("utm_medium=group%20chat");
    expect(link.generatedUrl).toContain("utm_campaign=hiring%20blitz");
    expect(link.generatedUrl).toContain("utm_content=announcement%201");

    const links = await getCampaignLinks();
    expect(links.some((l) => l.id === link.id)).toBe(true);
  });

  it("aggregates live growth metrics accurately", async () => {
    const { metrics, funnel, channels } = await getLiveMetrics();
    expect(typeof metrics.uniqueVisitors).toBe("number");
    expect(typeof metrics.demoRegistrations).toBe("number");
    expect(metrics.targetRegistrations).toBe(500);
    expect(metrics.remainingTarget).toBeGreaterThanOrEqual(0);
    expect(funnel.length).toBe(4);
    expect(channels.length).toBeGreaterThan(0);
  });
});
