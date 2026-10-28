import { describe, it, expect } from "vitest";
import { scoreChallengeAttempt } from "../src/lib/scoring/rubric";
import { saveAttempt, getAttempt, saveRegistration } from "../src/lib/storage/dataStore";
import { generateReferralCode, buildWhatsAppShareUrl } from "../src/lib/referrals/generator";
import { recordFirstTouchAttribution } from "../src/lib/attribution/utm";

describe("Challenge to Registration Journey & Attribution", () => {
  it("completes full flow from challenge attempt to registration with referral", async () => {
    // 1. Student takes challenge and submits Part A + Part B
    const mcqAnswer = "B";
    const writtenPrompt = `Act as an engineering technical interviewer for a final year student graduating in 2027.
Ask me 5 technical questions on binary search trees and system design one at a time.
Provide structured feedback with a rating out of 10 after each answer.`;

    const scoreResult = scoreChallengeAttempt({
      multipleChoiceAnswer: mcqAnswer,
      writtenPrompt,
    });

    expect(scoreResult.totalScore).toBeGreaterThanOrEqual(80);
    expect(scoreResult.level).toBe("AI Builder");

    // 2. Attempt is saved
    const attemptId = "att_journey_" + Date.now();
    const savedAttempt = await saveAttempt({
      id: attemptId,
      anonymousSessionId: "ses_journey_user",
      multipleChoiceAnswer: mcqAnswer,
      writtenPrompt,
      score: scoreResult.totalScore,
      scoreBreakdown: scoreResult,
      completed: true,
      startedAt: new Date(Date.now() - 50000).toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 50,
    });

    expect(savedAttempt.score).toBe(scoreResult.totalScore);

    // 3. Results page retrieves attempt
    const loadedAttempt = await getAttempt(attemptId);
    expect(loadedAttempt).not.toBeNull();
    expect(loadedAttempt?.score).toBe(scoreResult.totalScore);

    // 4. Student clicks to register for the free workshop
    const regResult = await saveRegistration({
      fullName: "Kavya Patel",
      email: `kavya.${Date.now()}@college.edu`,
      college: "BMS College of Engineering",
      branch: "Computer Science & Engineering (CSE)",
      graduationYear: 2027,
      consent: true,
      acquisitionSource: "direct",
    });

    expect(regResult.isDuplicate).toBe(false);
    expect(regResult.registration.referralCode.startsWith("RUSH")).toBe(true);

    // 5. Student shares their referral link on WhatsApp
    const shareUrl = buildWhatsAppShareUrl({
      score: scoreResult.totalScore,
      referralCode: regResult.registration.referralCode,
      baseUrl: "https://prompt-rush-lys8.vercel.app",
    });

    expect(shareUrl).toContain(regResult.registration.referralCode);
    expect(shareUrl).toContain(encodeURIComponent(`${scoreResult.totalScore}/100`));

    // 6. Friend uses the referral link to register
    const friendRegResult = await saveRegistration({
      fullName: "Rohan Nair",
      email: `rohan.${Date.now()}@college.edu`,
      college: "BMS College of Engineering",
      branch: "Information Technology (IT)",
      graduationYear: 2027,
      consent: true,
      referredBy: regResult.registration.referralCode,
      acquisitionSource: "referral",
    });

    expect(friendRegResult.isDuplicate).toBe(false);
    expect(friendRegResult.registration.referredBy).toBe(regResult.registration.referralCode);
  });
});

