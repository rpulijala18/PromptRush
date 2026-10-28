import { NextRequest, NextResponse } from "next/server";
import { campaignLinkSchema } from "@/lib/validation/schemas";
import { createCampaignLink, getCampaignLinks } from "@/lib/storage/dataStore";

export async function GET() {
  try {
    const campaigns = await getCampaignLinks();
    return NextResponse.json({ success: true, campaigns });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch campaigns", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = campaignLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createCampaignLink(parsed.data);
    return NextResponse.json({ success: true, campaign: created });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create campaign", message: err.message }, { status: 500 });
  }
}

