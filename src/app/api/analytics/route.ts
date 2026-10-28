import { NextRequest, NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/lib/storage/dataStore";
import { EventType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anonymousSessionId, eventType, acquisitionSource, referralCode, experimentVariant, metadata } = body;

    if (!anonymousSessionId || !eventType) {
      return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
    }

    await logAnalyticsEvent({
      anonymousSessionId,
      eventType: eventType as EventType,
      acquisitionSource,
      referralCode,
      experimentVariant,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error logging analytics event:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}

