import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  college: z
    .string()
    .trim()
    .min(2, "College name must be at least 2 characters")
    .max(120, "College name cannot exceed 120 characters"),
  branch: z
    .string()
    .trim()
    .min(2, "Please select or enter your branch")
    .max(60, "Branch cannot exceed 60 characters"),
  graduationYear: z
    .coerce
    .number()
    .int()
    .min(2024, "Graduation year must be 2024 or later")
    .max(2030, "Graduation year must be 2030 or earlier")
    .default(2027),
  consent: z.boolean().default(false),
  referredBy: z.string().trim().optional().nullable(),
  acquisitionSource: z.string().trim().optional().nullable(),
  experimentVariant: z.enum(["A", "B"]).optional().nullable(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const challengeSubmissionSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  anonymousSessionId: z.string().min(1, "Session ID is required"),
  multipleChoiceAnswer: z.enum(["A", "B"]).nullable(),
  writtenPrompt: z
    .string()
    .max(1000, "Written prompt must be 1,000 characters or less")
    .default(""),
  timeSpentSeconds: z.number().min(0).max(120).default(60),
});

export type ChallengeSubmissionData = z.infer<typeof challengeSubmissionSchema>;

export const campaignLinkSchema = z.object({
  channelName: z.string().trim().min(2, "Channel name is required"),
  utmSource: z.string().trim().min(2, "utm_source is required"),
  utmMedium: z.string().trim().min(2, "utm_medium is required"),
  utmCampaign: z.string().trim().min(2, "utm_campaign is required"),
  utmContent: z.string().trim().optional(),
});

export type CampaignLinkFormData = z.infer<typeof campaignLinkSchema>;

