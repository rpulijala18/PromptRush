/**
 * Generates an unpredictable, friendly referral code like RUSH8K2 or RUSH9X7
 */
export function generateReferralCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without easily confused chars (0, 1, I, O)
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RUSH${randomPart}`;
}

/**
 * Builds the WhatsApp share URL with prefilled text as required in Phase 9
 */
export function buildWhatsAppShareUrl(options: {
  score?: number | null;
  referralCode?: string | null;
  baseUrl?: string;
}): string {
  const { score, referralCode, baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000' } = options;

  const scoreText = typeof score === 'number' ? `${score}/100` : 'high';
  const targetUrl = referralCode
    ? `${baseUrl}/challenge?ref=${encodeURIComponent(referralCode)}`
    : `${baseUrl}/challenge`;

  const message = `⚡ I just completed PromptRush and scored ${scoreText}!

Think you can beat me?
You have 60 seconds to prove your AI skills.

Try it here: ${targetUrl}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

