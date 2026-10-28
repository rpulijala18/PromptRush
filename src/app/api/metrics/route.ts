import { NextRequest, NextResponse } from "next/server";
import { SIMULATED_DATASET } from "@/data/mockData";
import { getLiveMetrics } from "@/lib/storage/dataStore";
import { generateGrowthInsights } from "@/lib/analytics/insights";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "simulated";

    if (mode === "simulated") {
      const insights = generateGrowthInsights(
        SIMULATED_DATASET.metrics,
        SIMULATED_DATASET.channels
      );
      return NextResponse.json({
        success: true,
        mode: "simulated",
        isSimulated: true,
        data: {
          ...SIMULATED_DATASET,
          insights,
        },
      });
    }

    // Live mode
    const liveData = await getLiveMetrics();
    const insights = generateGrowthInsights(liveData.metrics, liveData.channels);

    return NextResponse.json({
      success: true,
      mode: "live",
      isSimulated: false,
      data: {
        isSimulated: false,
        label: "LIVE PRODUCTION METRICS",
        disclaimer: "Live data collected from real user attempts and registrations.",
        ...liveData,
        insights,
      },
    });
  } catch (err: any) {
    console.error("Error fetching metrics:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}
