export interface AttributionParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  ref?: string;
  landingPage?: string;
  firstSeenAt?: string;
}

const ATTRIBUTION_STORAGE_KEY = 'promptrush_attribution';
const SESSION_ID_STORAGE_KEY = 'promptrush_session_id';

/**
 * Extracts UTM and referral parameters from the current URL search params.
 */
export function extractParamsFromUrl(searchParams: URLSearchParams): AttributionParams {
  const params: AttributionParams = {};

  const source = searchParams.get('utm_source');
  const medium = searchParams.get('utm_medium');
  const campaign = searchParams.get('utm_campaign');
  const content = searchParams.get('utm_content');
  const ref = searchParams.get('ref');

  if (source) params.utmSource = source;
  if (medium) params.utmMedium = medium;
  if (campaign) params.utmCampaign = campaign;
  if (content) params.utmContent = content;
  if (ref) params.ref = ref;

  return params;
}

/**
 * Stores first-touch attribution parameters in localStorage.
 * If attribution already exists, first-touch is preserved within the 7-day window.
 */
export function recordFirstTouchAttribution(params: AttributionParams, pathname = '/'): AttributionParams {
  if (typeof window === 'undefined') return params;

  try {
    const existingRaw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw) as AttributionParams;
      // If we already have first-touch source or ref, retain it!
      if (existing.utmSource || existing.ref) {
        return existing;
      }
    }

    const hasNewParams = Object.keys(params).length > 0;
    const finalAttribution: AttributionParams = {
      ...params,
      landingPage: pathname,
      firstSeenAt: new Date().toISOString(),
      utmSource: params.utmSource || (params.ref ? 'referral' : 'direct'),
    };

    if (hasNewParams || !existingRaw) {
      localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(finalAttribution));
    }
    return finalAttribution;
  } catch (err) {
    console.warn('Error recording attribution:', err);
    return params;
  }
}

/**
 * Retrieves the currently saved attribution parameters.
 */
export function getSavedAttribution(): AttributionParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Gets or creates a persistent anonymous session ID.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let id = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (!id) {
      id = 'ses_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(SESSION_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'ses_fallback_' + Math.random().toString(36).substring(2, 10);
  }
}

