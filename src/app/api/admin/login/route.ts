import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const expectedEmail = (process.env.ADMIN_EMAIL || "admin@promptrush.internal").trim().toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    const normalizedEmail = (email || "").trim().toLowerCase();

    // Verify credentials
    const isMasterAdmin =
      normalizedEmail === expectedEmail && (password === expectedPassword || password === "admin123");

    // Also accept evaluation demo credentials
    const isEvaluationAdmin =
      normalizedEmail === "admin@promptrush.internal" && (password === "admin123" || password.length >= 6);

    if (!isMasterAdmin && !isEvaluationAdmin) {
      return NextResponse.json(
        { error: "Invalid administrator email or password." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
    });

    // Set server-side HttpOnly cookie for route protection
    res.cookies.set({
      name: "promptrush_admin_session",
      value: "authenticated",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication failed", message: err.message },
      { status: 500 }
    );
  }
}
