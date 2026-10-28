# PromptRush ⚡
> **"60 Seconds. One Prompt. Beat the Clock."**  
> *Secondary Tagline: "Think Fast. Prompt Smarter."*

A gamified AI prompting challenge and viral student acquisition web application built for the **NxtWave Growth Intern – AI, Experiments & Community** hiring challenge.

---

## 🎯 Campaign Mission & Challenge Context

- **Objective:** Drive **500 unique student registrations** within **7 days**
- **Workshop:** *"Build Your First AI Project in 60 Minutes"* (Free Online Workshop)
- **Target Audience:** Final-year engineering students graduating in **2027** preparing for technical placement drives
- **Promotional Budget:** **₹2,000 total**
- **Core Growth Loop:**
  ```
  DISCOVER ➔ PLAY (60s Challenge) ➔ LEARN (PromptScore) ➔ REGISTER (Free Workshop) ➔ SHARE (WhatsApp Loop) ➔ MEASURE ➔ IMPROVE
  ```

---

## 🚀 Key Features by Route

| Route | Feature | Description |
| :--- | :--- | :--- |
| `/` | **Welcome & Hero** | 60-second challenge hook, countdown preview widget, 3-step value guide, A/B tested workshop promotion. |
| `/challenge` | **Interactive 60s Challenge** | Deadline-persistent timer, Part A (MCQ technical prompt choice), Part B (Prompt improvement with live character count & prompt boosters), auto-submit on timeout, draft saving in session storage. |
| `/results/[attemptId]` | **Gamified Results** | Animated circular gauge score (0–100), performance level badge (*AI Explorer*, *Prompt Learner*, *AI Problem Solver*, *AI Builder*), 4-category rubric breakdown, strengths, improvements, benchmark placement prompt, confetti celebration. |
| `/register` | **Workshop Registration** | Conversion-optimized 4-field form (Name, Email, College, Branch, Year defaulted to 2027), Zod validation on client & server, duplicate email prevention, academic prototype simulation disclosure. |
| `/success` | **Registration Success** | Confirmation screen with workshop topic, challenge score, personalized referral code (e.g. `RUSH8K2`), and 1-click WhatsApp share button. |
| `/share` | **Referral & Viral Hub** | 1-click WhatsApp share with prefilled score challenge text, clipboard copy fallback, native Web Share API support, and first-touch attribution. |
| `/admin/login` | **Admin Authentication** | Administrator login gate for campaign organizers. |
| `/admin/dashboard` | **Growth Command Center** | 8 KPI cards, 500-target progress bar with daily pace, conversion funnel drop-offs, channel breakdown, Recharts line & bar charts, Live/Demo mode toggle, and rule-based Growth Insights Engine. |
| `/admin/campaigns` | **UTM Link Generator** | Creates trackable campaign distribution links for WhatsApp classes, campus ambassadors, and technical clubs. |
| `/admin/experiments` | **A/B Testing Lab** | Evaluates Variant A (*"Register for Free Workshop"*) vs Variant B (*"Build Your First AI Project"*), tracking impressions, CTR, conversion rates, and sample size significance. |
| `/admin/simulator` | **500 Growth Simulator** | Interactive sensitivity forecasting tool testing channel yields (Ambassadors, Clubs, Referrals, Direct Outreach) to achieve 500 registrations. |
| `/privacy` | **Privacy & Disclosure** | Data minimization transparency, no phone scraping, unchecked consent policy, and academic prototype disclosure. |

---

## 🛠️ Technology Stack

- **Frontend Framework:** Next.js 14 App Router (React 18, TypeScript)
- **Styling & UI:** Tailwind CSS, Lucide React icons, Canvas Confetti
- **Analytics & Data Visualization:** Recharts (responsive line charts, bar charts, conversion funnels)
- **Database & Storage:** Supabase PostgreSQL with Row Level Security (RLS) + resilient local persistent fallback store
- **Validation:** Zod schemas on both client and server
- **Testing:** Vitest test suite with 15 passing automated unit tests

---

## 🧠 Deterministic Educational Scoring Rubric (Phase 5)

Prompt submissions are evaluated in real time (5ms latency) without requiring external paid LLM APIs:
- **Multiple-Choice Accuracy (20 pts):** Identifies structured role & constraint design over vague requests.
- **Clear Objective (20 pts):** Defines explicit persona (*"Act as a technical interviewer"*).
- **Relevant Context (20 pts):** Specifies engineering branch, year (2027), and technical subjects (DSA, SQL).
- **Specific Instructions (20 pts):** Pacing rules (*"one question at a time"*) and feedback loops.
- **Output Format (20 pts):** Formatting constraints (*"rating out of 10 and optimal solution"*).
- **Keyword Stuffing Penalties:** Repetitive token spam is automatically penalized.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- pnpm or npm

### 2. Installation
```bash
# Clone or navigate to the repository
cd PromptRush

# Install dependencies
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: If Supabase credentials are not provided, PromptRush automatically operates on its resilient local database fallback, enabling full testing out of the box).*

### 4. Running the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Automated Tests
```bash
pnpm test
```
Runs 15 automated Vitest unit tests covering scoring heuristics, edge cases, timer handling, Zod validation, and referral generation.

### 6. Production Build
```bash
pnpm build
pnpm start
```

---

## 🗄️ Supabase Database Setup

When connecting to Supabase:
1. Create a project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Execute the migration script located at `supabase/migrations/001_initial_schema.sql`.
4. Copy your project URL, anon key, and service role key into `.env.local`.

---

## 📊 Campaign Documentation Deliverables

- **Growth Plan (2-Page / 5-Slide Strategy):** [`docs/growth-plan.md`](docs/growth-plan.md)
- **AI Collaboration & Decision Notes:** [`docs/ai-learning-notes.md`](docs/ai-learning-notes.md)
- **3-Minute Video Script:** [`docs/demo-script.md`](docs/demo-script.md)
- **Final Verification Checklist:** [`docs/final-checklist.md`](docs/final-checklist.md)

---

## 🔒 Security & Privacy Notice

PromptRush is an academic hiring challenge prototype. It collects minimal student contact details (no phone numbers), enforces Row Level Security, sanitizes all inputs, and does not claim official commercial ownership by NxtWave.

