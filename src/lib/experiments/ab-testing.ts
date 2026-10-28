export type ExperimentVariant = 'A' | 'B';

export interface VariantConfig {
  variant: ExperimentVariant;
  headline: string;
  buttonText: string;
  subtext: string;
}

export const VARIANTS: Record<ExperimentVariant, VariantConfig> = {
  A: {
    variant: 'A',
    headline: 'Register for the Free AI Workshop',
    buttonText: 'Register for Free AI Workshop',
    subtext: 'Build your first AI project in 60 minutes with expert guidance.',
  },
  B: {
    variant: 'B',
    headline: 'Build Your First AI Project in 60 Minutes',
    buttonText: 'Build Your First AI Project',
    subtext: 'From your first prompt to a portfolio-ready AI project. Free online workshop.',
  },
};

const EXPERIMENT_COOKIE_KEY = 'promptrush_exp_cta';

/**
 * Assigns a visitor consistently to Variant A or B based on session ID or random hash.
 * Persists in localStorage and returns the assigned variant.
 */
export function getOrAssignVariant(sessionId?: string): ExperimentVariant {
  if (typeof window === 'undefined') return 'A';

  try {
    const existing = localStorage.getItem(EXPERIMENT_COOKIE_KEY) as ExperimentVariant | null;
    if (existing === 'A' || existing === 'B') {
      return existing;
    }

    // Deterministic hash if sessionId is provided, or random 50/50 split
    let assigned: ExperimentVariant = 'A';
    if (sessionId) {
      let hash = 0;
      for (let i = 0; i < sessionId.length; i++) {
        hash = (hash << 5) - hash + sessionId.charCodeAt(i);
        hash |= 0;
      }
      assigned = Math.abs(hash) % 2 === 0 ? 'A' : 'B';
    } else {
      assigned = Math.random() < 0.5 ? 'A' : 'B';
    }

    localStorage.setItem(EXPERIMENT_COOKIE_KEY, assigned);
    return assigned;
  } catch {
    return 'A';
  }
}

