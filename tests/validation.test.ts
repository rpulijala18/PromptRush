import { describe, it, expect } from "vitest";
import { registrationSchema, challengeSubmissionSchema } from "../src/lib/validation/schemas";

describe("Validation Schemas", () => {
  it("validates valid student registration", () => {
    const validData = {
      fullName: "Aditya Verma",
      email: "aditya.verma@college.edu",
      college: "IIT Bombay",
      branch: "Computer Science & Engineering (CSE)",
      graduationYear: 2027,
      consent: true,
      referredBy: "RUSH8K2",
    };

    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("aditya.verma@college.edu");
      expect(result.data.graduationYear).toBe(2027);
    }
  });

  it("normalizes and lowercases email address", () => {
    const rawData = {
      fullName: "Pooja Reddy",
      email: "  POOJA.REDDY@GMAIL.COM  ",
      college: "Osmania University",
      branch: "Information Technology (IT)",
      graduationYear: "2027",
    };

    const result = registrationSchema.safeParse(rawData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("pooja.reddy@gmail.com");
    }
  });

  it("rejects invalid email addresses", () => {
    const invalidEmailData = {
      fullName: "Test User",
      email: "not-an-email",
      college: "Test College",
      branch: "CSE",
    };

    const result = registrationSchema.safeParse(invalidEmailData);
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range graduation years", () => {
    const oldGradData = {
      fullName: "Test User",
      email: "test@example.com",
      college: "College",
      branch: "CSE",
      graduationYear: 2019,
    };

    const result = registrationSchema.safeParse(oldGradData);
    expect(result.success).toBe(false);
  });

  it("validates challenge submission schema", () => {
    const validAttempt = {
      attemptId: "att_12345",
      anonymousSessionId: "ses_abc987",
      multipleChoiceAnswer: "B",
      writtenPrompt: "Act as an interviewer...",
      timeSpentSeconds: 58,
    };

    const result = challengeSubmissionSchema.safeParse(validAttempt);
    expect(result.success).toBe(true);
  });

  it("rejects written prompts exceeding 1000 characters", () => {
    const longPrompt = "a".repeat(1005);
    const invalidAttempt = {
      attemptId: "att_12345",
      anonymousSessionId: "ses_abc987",
      multipleChoiceAnswer: "B",
      writtenPrompt: longPrompt,
      timeSpentSeconds: 60,
    };

    const result = challengeSubmissionSchema.safeParse(invalidAttempt);
    expect(result.success).toBe(false);
  });
});

