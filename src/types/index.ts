export type PerformanceLevel =
  | 'AI Explorer'
  | 'Prompt Learner'
  | 'AI Problem Solver'
  | 'AI Builder';

export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ScoreBreakdown {
  multipleChoice: ScoreCategory;
  clearObjective: ScoreCategory;
  relevantContext: ScoreCategory;
  specificInstructions: ScoreCategory;
  outputFormat: ScoreCategory;
  totalScore: number;
  level: PerformanceLevel;
  strengths: string[];
  improvements: string[];
  exampleImprovedPrompt: string;
  learningTip: string;
}

export interface ChallengeAttempt {
  id: string;
  anonymousSessionId: string;
  multipleChoiceAnswer: 'A' | 'B' | null;
  writtenPrompt: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  timeSpentSeconds: number;
}

export interface Registration {
  id: string;
  fullName: string;
  normalizedEmail: string;
  college: string;
  branch: string;
  graduationYear: number;
  consent: boolean;
  referralCode: string;
  referredBy?: string | null;
  acquisitionSource?: string | null;
  experimentVariant?: 'A' | 'B' | null;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerRegistrationId: string;
  referredRegistrationId: string;
  createdAt: string;
}

export type EventType =
  | 'page_view'
  | 'challenge_start'
  | 'challenge_timeout'
  | 'challenge_submit'
  | 'cta_impression'
  | 'cta_click'
  | 'registration_attempt'
  | 'registration_success'
  | 'share_click_whatsapp'
  | 'share_copy_link'
  | 'share_native';

export interface AnalyticsEvent {
  id: string;
  anonymousSessionId: string;
  eventType: EventType;
  acquisitionSource?: string;
  referralCode?: string;
  experimentVariant?: 'A' | 'B';
  path?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CampaignLink {
  id: string;
  channelName: string;
  campaignCode: string;
  generatedUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  clicksCount: number;
  registrationsCount: number;
  createdAt: string;
}

export interface GrowthMetrics {
  uniqueVisitors: number;
  challengeStarts: number;
  challengeCompletions: number;
  demoRegistrations: number;
  registrationConversionRate: number; // percentage
  challengeCompletionRate: number; // percentage
  referralRegistrations: number;
  targetRegistrations: number;
  remainingTarget: number;
  goalCompletionPercentage: number;
  dailyRegistrationPace: number;
}

export interface ChannelPerformance {
  channel: string;
  visitors: number;
  challengeStarts: number;
  registrations: number;
  conversionRate: number;
}

export interface DailyRegistrationTrend {
  date: string;
  dayLabel: string;
  registrations: number;
  cumulative: number;
  target: number;
}

export interface ExperimentStats {
  variant: 'A' | 'B';
  headline: string;
  buttonText: string;
  impressions: number;
  clicks: number;
  registrations: number;
  ctr: number;
  conversionRate: number;
}

