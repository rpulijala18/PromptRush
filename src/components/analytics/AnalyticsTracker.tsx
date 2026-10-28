"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  extractParamsFromUrl,
  getOrCreateSessionId,
  recordFirstTouchAttribution,
} from "@/lib/attribution/utm";
import { getOrAssignVariant } from "@/lib/experiments/ab-testing";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    try {
      const sessionId = getOrCreateSessionId();
      const params = extractParamsFromUrl(searchParams);
      const attribution = recordFirstTouchAttribution(params, pathname);
      const variant = getOrAssignVariant(sessionId);

      // Prevent duplicate logging on re-renders for same path
      const currentPathKey = `${pathname}?${searchParams.toString()}`;
      if (lastLoggedPath.current === currentPathKey) return;
      lastLoggedPath.current = currentPathKey;

      // Fire beacon / background analytics log
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousSessionId: sessionId,
          eventType: "page_view",
          acquisitionSource: attribution.utmSource || (attribution.ref ? "referral" : "direct"),
          referralCode: attribution.ref,
          experimentVariant: variant,
          metadata: {
            path: pathname,
            query: searchParams.toString(),
            referrer: typeof document !== "undefined" ? document.referrer : "",
          },
        }),
      }).catch((err) => console.warn("Failed to log page_view:", err));
    } catch (e) {
      console.warn("AnalyticsTracker init failed:", e);
    }
  }, [pathname, searchParams]);

  return null;
}

