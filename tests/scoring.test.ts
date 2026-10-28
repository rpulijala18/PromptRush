import { describe, it, expect } from "vitest";
import { scoreChallengeAttempt } from "../src/lib/scoring/rubric";

describe("Intelligent Prompt Scoring Engine", () => {
  it("evaluates empty answers gracefully", () => {
    const result = scoreChallengeAttempt({
      multipleChoiceAnswer: null,
      writtenPrompt: "",
    });

    expect(result.totalScore).toBe(0);
    expect(result.level).toBe("AI Explorer");
    expect(result.multipleChoice.score).toBe(0);
    expect(result.clearObjective.score).toBe(0);
    expect(result.relevantContext.score).toBe(0);
    expect(result.specificInstructions.score).toBe(0);
    expect(result.outputFormat.score).toBe(0);
    expect(result.strengths.length).toBe(0);
    expect(result.improvements.length).toBeGreaterThan(0);
  });

  it("evaluates correct MCQ with weak written answer", () => {
    const result = scoreChallengeAttempt({
      multipleChoiceAnswer: "B",
      writtenPrompt: "help me interview",
    });

    expect(result.multipleChoice.score).toBe(20);
    expect(result.totalScore).toBeGreaterThanOrEqual(20);
    expect(result.multipleChoice.feedback).toContain("Correct!");
  });

  it("evaluates incorrect MCQ with 0 points", () => {
    const result = scoreChallengeAttempt({
      multipleChoiceAnswer: "A",
      writtenPrompt: "",
    });

    expect(result.multipleChoice.score).toBe(0);
    expect(result.totalScore).toBe(0);
  });

  it("awards high score to a strong comprehensive prompt", () => {
    const strongPrompt = `Act as a senior technical interviewer for a final year engineering student graduating in 2027 in computer science preparing for campus placements. 
Ask me 5 technical interview questions on data structures, algorithms, and SQL, one question at a time. 
Wait for my answer before giving feedback. Format your feedback with a rating out of 10, one improvement, and an optimal answer.`;

    const result = scoreChallengeAttempt({
      multipleChoiceAnswer: "B",
      writtenPrompt: strongPrompt,
    });

    expect(result.multipleChoice.score).toBe(20);
    expect(result.clearObjective.score).toBe(20);
    expect(result.relevantContext.score).toBe(20);
    expect(result.specificInstructions.score).toBe(20);
    expect(result.outputFormat.score).toBe(20);
    expect(result.totalScore).toBe(100);
    expect(result.level).toBe("AI Builder");
    expect(result.strengths.length).toBeGreaterThanOrEqual(4);
  });

  it("awards partial points for moderate prompt", () => {
    const moderatePrompt = `Act as an interviewer. Ask me some placement questions for engineering student. Give feedback.`;

    const result = scoreChallengeAttempt({
      multipleChoiceAnswer: "B",
      writtenPrompt: moderatePrompt,
    });

    expect(result.multipleChoice.score).toBe(20);
    expect(result.clearObjective.score).toBeGreaterThanOrEqual(10);
    expect(result.relevantContext.score).toBeGreaterThanOrEqual(10);
    expect(result.totalScore).toBeGreaterThanOrEqual(40);
    expect(result.totalScore).toBeLessThan(100);
  });

  it("penalizes keyword-stuffed prompts", () => {
    const stuffedPrompt = `interviewer interview interview interviewer interviewer interview student student student student`;

    const result = scoreChallengeAttempt({
      multipleChoiceAnswer: "B",
      writtenPrompt: stuffedPrompt,
    });

    // Should not reach full score due to repetition penalty
    expect(result.clearObjective.score).toBeLessThanOrEqual(10);
    expect(result.totalScore).toBeLessThan(70);
  });
});

