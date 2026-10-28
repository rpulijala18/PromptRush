import { PerformanceLevel, ScoreBreakdown, ScoreCategory } from "@/types";

interface EvaluationInput {
  multipleChoiceAnswer: 'A' | 'B' | null;
  writtenPrompt: string;
}

/**
 * Normalizes input text: lowercases, removes excessive punctuation and repeated whitespace.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks for keyword stuffing:
 * High ratio of repeated words, unnaturally high density of target keywords with low word count,
 * or minimal non-filler words.
 */
function isKeywordStuffed(rawText: string, words: string[]): boolean {
  if (words.length < 5) return false;
  const uniqueWords = new Set(words);
  const uniquenessRatio = uniqueWords.size / words.length;
  // If user repeats same 2-3 words over and over
  if (uniquenessRatio < 0.4 && words.length > 8) {
    return true;
  }
  return false;
}

/**
 * Evaluates Clear Objective (0, 10, 20 pts):
 * Does the prompt explain what AI should do? (e.g., act as interviewer, conduct mock interview, ask technical questions)
 */
function evaluateObjective(text: string, words: string[]): ScoreCategory {
  if (!text || words.length < 3) {
    return {
      name: "Clear Objective",
      score: 0,
      maxScore: 20,
      feedback: "No clear objective specified. Always instruct the AI on its specific persona or primary goal.",
    };
  }

  const roleKeywords = [
    "act as", "role", "interviewer", "technical interviewer", "hiring manager",
    "simulate", "conduct", "mock interview", "interview me", "ask me questions", "examiner"
  ];
  const goalKeywords = [
    "prepar", "evaluat", "practic", "test my", "assess", "placement", "interview preparation", "mock"
  ];

  const hasRole = roleKeywords.some((kw) => text.includes(kw));
  const hasGoal = goalKeywords.some((kw) => text.includes(kw));

  if (hasRole && hasGoal) {
    return {
      name: "Clear Objective",
      score: 20,
      maxScore: 20,
      feedback: "Excellent! You defined both a clear persona (interviewer) and the core objective (interview preparation).",
    };
  } else if (hasRole || hasGoal || words.length >= 10) {
    return {
      name: "Clear Objective",
      score: 10,
      maxScore: 20,
      feedback: "Good start, but define both the exact persona (e.g., 'Act as a Senior Technical Interviewer') and the end goal.",
    };
  }

  return {
    name: "Clear Objective",
    score: 0,
    maxScore: 20,
    feedback: "The AI is not given a distinct role or goal. Try: 'Act as a technical interviewer for a placement drive.'",
  };
}

/**
 * Evaluates Relevant Context (0, 10, 20 pts):
 * Does it provide background on the student's branch, year, experience, target company/role, or tech stack?
 */
function evaluateContext(text: string, words: string[]): ScoreCategory {
  if (!text || words.length < 3) {
    return {
      name: "Relevant Context",
      score: 0,
      maxScore: 20,
      feedback: "Missing student context. AI gives generic answers without background information.",
    };
  }

  const contextKeywords = [
    "final year", "engineering", "student", "2027", "fresher", "beginner",
    "computer science", "cse", "it", "ece", "placement", "campus placement",
    "junior", "entry level", "software engineer", "frontend", "backend", "full stack",
    "dsa", "data structures", "python", "javascript", "react", "java", "sql"
  ];

  const matches = contextKeywords.filter((kw) => text.includes(kw));

  if (matches.length >= 3) {
    return {
      name: "Relevant Context",
      score: 20,
      maxScore: 20,
      feedback: "Outstanding context provided! Specifying your background and target topics helps the AI calibrate its questions.",
    };
  } else if (matches.length >= 1 || (words.length >= 15 && text.includes("student"))) {
    return {
      name: "Relevant Context",
      score: 10,
      maxScore: 20,
      feedback: "Moderate context. Add your engineering branch, graduation year, or specific tech topics (e.g., DSA, SQL).",
    };
  }

  return {
    name: "Relevant Context",
    score: 0,
    maxScore: 20,
    feedback: "No specific background context found. Mention that you are a final-year engineering student preparing for campus drives.",
  };
}

/**
 * Evaluates Specific Instructions (0, 10, 20 pts):
 * Does it define constraints, difficulty, number of questions, or feedback loops?
 */
function evaluateInstructions(text: string, words: string[]): ScoreCategory {
  if (!text || words.length < 3) {
    return {
      name: "Specific Instructions",
      score: 0,
      maxScore: 20,
      feedback: "No constraints or execution instructions provided.",
    };
  }

  const instructionKeywords = [
    "one at a time", "one by one", "wait for my answer", "step by step",
    "questions", "5 questions", "3 questions", "five questions",
    "feedback", "give feedback", "rate", "score", "critique",
    "difficulty", "beginner", "intermediate", "easy", "hard", "hint",
    "follow up", "correct my mistake", "improve"
  ];

  const matches = instructionKeywords.filter((kw) => text.includes(kw));

  if (matches.length >= 3) {
    return {
      name: "Specific Instructions",
      score: 20,
      maxScore: 20,
      feedback: "Great constraints! Setting question count, difficulty, and asking for iterative feedback guides the AI's behavior.",
    };
  } else if (matches.length >= 1) {
    return {
      name: "Specific Instructions",
      score: 10,
      maxScore: 20,
      feedback: "Some instructions present. Add explicit instructions like 'ask questions one at a time' and 'wait for my response'.",
    };
  }

  return {
    name: "Specific Instructions",
    score: 0,
    maxScore: 20,
    feedback: "Lacks behavioral instructions. Tell the AI how many questions to ask and to evaluate your answer before proceeding.",
  };
}

/**
 * Evaluates Output Format (0, 10, 20 pts):
 * Does it specify output structure (e.g., table, bullet points, rating, feedback before next question)?
 */
function evaluateOutputFormat(text: string, words: string[]): ScoreCategory {
  if (!text || words.length < 3) {
    return {
      name: "Output Format",
      score: 0,
      maxScore: 20,
      feedback: "No output formatting requested.",
    };
  }

  const formatKeywords = [
    "format", "structure", "bullet", "bullets", "numbered", "table",
    "score out of", "rating", "explanation", "short answer", "concise",
    "sample answer", "improved version", "rubric", "after each", "sections"
  ];

  const matches = formatKeywords.filter((kw) => text.includes(kw));

  if (matches.length >= 2 || (matches.length >= 1 && text.includes("feedback"))) {
    return {
      name: "Output Format",
      score: 20,
      maxScore: 20,
      feedback: "Well formatted! Specifying the exact structure keeps the AI's response clean and easy to study.",
    };
  } else if (matches.length >= 1 || words.length >= 25) {
    return {
      name: "Output Format",
      score: 10,
      maxScore: 20,
      feedback: "Basic structure implied. Clearly demand a format like: 'Provide feedback, a score out of 10, and an optimal answer.'",
    };
  }

  return {
    name: "Output Format",
    score: 0,
    maxScore: 20,
    feedback: "No output format defined. Specify bullet points, a rating system, or structured sections for readability.",
  };
}

/**
 * Assigns performance level based on 0-100 total score.
 */
function getPerformanceLevel(score: number): PerformanceLevel {
  if (score >= 80) return "AI Builder";
  if (score >= 60) return "AI Problem Solver";
  if (score >= 40) return "Prompt Learner";
  return "AI Explorer";
}

/**
 * Main evaluation function.
 */
export function scoreChallengeAttempt(input: EvaluationInput): ScoreBreakdown {
  const { multipleChoiceAnswer, writtenPrompt } = input;

  // 1. Multiple Choice: Prompt B is correct (20 pts), otherwise 0
  const mcScore = multipleChoiceAnswer === 'B' ? 20 : 0;
  const multipleChoice: ScoreCategory = {
    name: "Multiple-Choice Accuracy",
    score: mcScore,
    maxScore: 20,
    feedback:
      multipleChoiceAnswer === 'B'
        ? "Correct! Prompt B was far superior because it specified role, question count, pacing, and feedback loops."
        : multipleChoiceAnswer === 'A'
        ? "Prompt A was too vague. Prompt B specified persona, question count, one-by-one pacing, and feedback."
        : "Unanswered multiple choice question.",
  };

  // 2. Evaluate Written Prompt
  const cleanText = normalizeText(writtenPrompt || "");
  const words = cleanText ? cleanText.split(' ').filter(Boolean) : [];

  const stuffed = isKeywordStuffed(cleanText, words);

  let clearObjective = evaluateObjective(cleanText, words);
  let relevantContext = evaluateContext(cleanText, words);
  let specificInstructions = evaluateInstructions(cleanText, words);
  let outputFormat = evaluateOutputFormat(cleanText, words);

  // If keyword stuffed, cap each category score at 10 max
  if (stuffed) {
    clearObjective.score = Math.min(clearObjective.score, 10);
    relevantContext.score = Math.min(relevantContext.score, 10);
    specificInstructions.score = Math.min(specificInstructions.score, 10);
    outputFormat.score = Math.min(outputFormat.score, 10);
    clearObjective.feedback += " (Penalty: Repetitive keywords detected)";
  }

  const totalScore =
    multipleChoice.score +
    clearObjective.score +
    relevantContext.score +
    specificInstructions.score +
    outputFormat.score;

  const level = getPerformanceLevel(totalScore);

  // Derive strengths and improvements
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (multipleChoice.score === 20) {
    strengths.push("Identified high-performance prompt architecture over vague requests");
  } else {
    improvements.push("Look for prompts with structured roles, constraints, and interactive loops");
  }

  if (clearObjective.score >= 10) {
    strengths.push("Defined a clear persona or primary goal for the AI assistant");
  } else {
    improvements.push("Always start with an explicit role: 'Act as a Senior Technical Interviewer'");
  }

  if (relevantContext.score >= 10) {
    strengths.push("Supplied relevant background details about student profile or tech domain");
  } else {
    improvements.push("State your engineering branch, experience level, and specific topics (e.g., DSA, DBMS)");
  }

  if (specificInstructions.score >= 10) {
    strengths.push("Included actionable constraints and execution rules (e.g., pacing or difficulty)");
  } else {
    improvements.push("Add constraints like 'Ask one question at a time and wait for my response'");
  }

  if (outputFormat.score >= 10) {
    strengths.push("Outlined structured output expectations for readability");
  } else {
    improvements.push("Request structured feedback: 'Provide a score out of 10, critique, and ideal solution'");
  }

  const exampleImprovedPrompt =
    `Act as a senior technical interviewer for a campus placement drive. I am a final-year engineering student (graduating in 2027) preparing for software engineering roles. ` +
    `Ask me 5 interview questions covering Data Structures, Algorithms, and System Basics, one question at a time. ` +
    `After each of my responses, provide: 1) A rating out of 10, 2) One specific technical improvement, 3) The optimal answer, before asking the next question.`;

  const tipsByLevel: Record<PerformanceLevel, string> = {
    "AI Explorer":
      "AI models respond best to clarity. Remember the C.R.O.P. framework: Context, Role, Objective, and Presentation format.",
    "Prompt Learner":
      "You've grasped the basics! Now focus on interactive pacing—instruct the AI to wait for your answers instead of dumping everything at once.",
    "AI Problem Solver":
      "Great prompting instincts! Next step: add explicit evaluation criteria so the AI grades your responses against placement rubrics.",
    "AI Builder":
      "Exceptional prompt craftsmanship! You're ready to build autonomous AI workflows and full AI-powered applications.",
  };

  return {
    multipleChoice,
    clearObjective,
    relevantContext,
    specificInstructions,
    outputFormat,
    totalScore,
    level,
    strengths,
    improvements,
    exampleImprovedPrompt,
    learningTip: tipsByLevel[level],
  };
}
