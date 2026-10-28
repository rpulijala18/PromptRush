import { NextRequest, NextResponse } from "next/server";
import { challengeSubmissionSchema } from "@/lib/validation/schemas";
import { scoreChallengeAttempt } from "@/lib/scoring/rubric";
import { saveAttempt, getAttempt } from "@/lib/storage/dataStore";
import { ChallengeAttempt } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = challengeSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { attemptId, anonymousSessionId, multipleChoiceAnswer, writtenPrompt, timeSpentSeconds } = parsed.data;

    // Evaluate attempt using transparent deterministic scoring rubric
    const scoreBreakdown = scoreChallengeAttempt({
      multipleChoiceAnswer,
      writtenPrompt,
    });

    const now = new Date().toISOString();
    const attempt: ChallengeAttempt = {
      id: attemptId,
      anonymousSessionId,
      multipleChoiceAnswer,
      writtenPrompt,
      score: scoreBreakdown.totalScore,
      scoreBreakdown,
      completed: true,
      startedAt: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      completedAt: now,
      timeSpentSeconds,
    };

    const saved = await saveAttempt(attempt);

    return NextResponse.json({
      success: true,
      attemptId: saved.id,
      score: saved.score,
      level: saved.scoreBreakdown.level,
      scoreBreakdown: saved.scoreBreakdown,
    });
  } catch (err: any) {
    console.error("Error evaluating attempt:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing attempt ID" }, { status: 400 });
    }

    const attempt = await getAttempt(id);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Publicly return score, breakdown, level without exposing private raw prompt to 3rd parties
    return NextResponse.json({
      id: attempt.id,
      score: attempt.score,
      scoreBreakdown: attempt.scoreBreakdown,
      completed: attempt.completed,
      timeSpentSeconds: attempt.timeSpentSeconds,
    });
  } catch (err: any) {
    console.error("Error fetching attempt:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}
