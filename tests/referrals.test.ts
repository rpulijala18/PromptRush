import { describe, it, expect } from "vitest";
import { generateReferralCode, buildWhatsAppShareUrl } from "../src/lib/referrals/generator";

describe("Referrals and Viral System", () => {
  it("generates an unpredictable referral code with RUSH prefix", () => {
    const code1 = generateReferralCode();
    const code2 = generateReferralCode();

    expect(code1.startsWith("RUSH")).toBe(true);
    expect(code2.startsWith("RUSH")).toBe(true);
    expect(code1.length).toBe(8); // RUSH + 4 chars
    expect(code1).not.toBe(code2);
  });

  it("builds correct prefilled WhatsApp share URL with score and referral link", () => {
    const url = buildWhatsAppShareUrl({
      score: 85,
      referralCode: "RUSH8K2",
      baseUrl: "https://promptrush.vercel.app",
    });

    expect(url.startsWith("https://api.whatsapp.com/send?text=")).toBe(true);

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("85/100");
    expect(decoded).toContain("Think you can beat me?");
    expect(decoded).toContain("https://promptrush.vercel.app/challenge?ref=RUSH8K2");
  });

  it("builds general WhatsApp share URL when no score or ref is provided", () => {
    const url = buildWhatsAppShareUrl({
      baseUrl: "https://promptrush.vercel.app",
    });

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("https://promptrush.vercel.app/challenge");
  });
});

