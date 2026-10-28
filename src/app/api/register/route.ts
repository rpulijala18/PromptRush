import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation/schemas";
import { saveRegistration } from "@/lib/storage/dataStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { registration, isDuplicate } = await saveRegistration(parsed.data);

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        message: "You are already registered! Here is your personal challenge referral link.",
        referralCode: registration.referralCode,
        fullName: registration.fullName,
      });
    }

    return NextResponse.json({
      success: true,
      isDuplicate: false,
      message: "Demo registration successful!",
      registrationId: registration.id,
      referralCode: registration.referralCode,
      fullName: registration.fullName,
    });
  } catch (err: any) {
    console.error("Error processing registration:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}

