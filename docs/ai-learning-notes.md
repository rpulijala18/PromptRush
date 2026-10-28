# PromptRush — AI Collaboration & Learning Notes
## Candidate Assignment: NxtWave Growth Intern – AI, Experiments & Community

This document records the genuine AI-assisted architectural decisions, critical course corrections, and design tradeoffs made during the development of PromptRush.

---

### Reflection Framework: What I Asked → What AI Suggested → What I Changed → Why

#### Decision 1: Acquisition Asset Architecture
- **What I asked AI:**  
  *"How should we structure a growth campaign to get 500 final-year engineering students to register for a free 60-minute workshop with only ₹2,000 budget?"*
- **What AI suggested:**  
  AI initially recommended building a standard high-converting landing page with countdown timers, mentor bios, testimonials, and extensive curriculum bullet points, supplemented by paid Facebook/Instagram lead ads.
- **What I changed:**  
  I rejected the conventional landing page and replaced it with **PromptRush**: a 60-second interactive challenge where students solve a real technical placement prompt problem before seeing any registration form.
- **Why:**  
  Final-year engineering students (graduating in 2027) are numb to generic online workshop landing pages. With ₹2,000 total budget, traditional paid lead generation has a high CAC (₹40–₹80) that would exhaust the budget in under 30 registrations. By contrast, a 60-second interactive micro-challenge taps into competitive peer curiosity ("Beat my score!"), delivers instant diagnostic value, and drives a self-sustaining viral loop on college WhatsApp groups at near-zero CAC.

---

#### Decision 2: Challenge Scoring Engine (Paid LLM API vs Deterministic Rubric)
- **What I asked AI:**  
  *"How can we evaluate student prompt improvements in real time using OpenAI or Claude APIs?"*
- **What AI suggested:**  
  AI proposed an API route calling `gpt-4o-mini` or `gemini-1.5-flash` with a JSON system prompt to score the student's submission dynamically on latency, clarity, and tone.
- **What I changed:**  
  I deliberately rejected external LLM API calls and architected a **transparent, deterministic educational rubric engine** evaluating 4 core categories: Clear Objective, Relevant Context, Specific Instructions, and Output Format (20 points each + 20 points for Part A MCQ).
- **Why:**  
  1. **Cost & Reliability:** Paid APIs introduce unpredictable token bills, rate limit timeouts during viral surges, and latency spikes (2–4 seconds) that kill the momentum of a 60-second challenge.  
  2. **Educational Transparency:** Heuristic scoring provides instant (5ms) feedback and category-by-category clarity without hallucinating scores.  
  3. **Honesty in Marketing:** We explicitly label the score as an *"Educational Prompt Score based on a structured rubric, not a formal LLM assessment"*, avoiding misleading claims about AI capabilities.

---

#### Decision 3: Registration Form Friction & Consent
- **What I asked AI:**  
  *"What fields should be on the workshop registration form to maximize lead qualification for NxtWave?"*
- **What AI suggested:**  
  AI generated a comprehensive 8-field form asking for Full Name, Email, Phone Number, WhatsApp Number, College, City, Branch, and CGPA, along with an auto-checked checkbox for marketing updates.
- **What I changed:**  
  I cut the form down to only 4 core placement-qualifying fields: **Full Name, Email, College, and Branch** (with Graduation Year defaulted to 2027), removed phone/WhatsApp collection entirely, made the consent checkbox **unchecked by default**, and added an explicit **Simulation Disclosure**.
- **Why:**  
  Every additional form field slashes mobile completion rates by 12–18%. Collecting phone numbers without encryption or verified SMS OTPs creates privacy liability. Since this is an academic hiring challenge prototype, collecting sensitive student phone numbers is inappropriate. Decreasing friction maximizes conversion from challenge completion to workshop registration.

---

#### Decision 4: Viral Growth Mechanics (Ethical Referrals vs Forced Gating)
- **What I asked AI:**  
  *"How can we get maximum referrals from every student who completes the challenge?"*
- **What AI suggested:**  
  AI suggested locking the student's challenge score behind a requirement: *"Share with 3 WhatsApp groups or friends to unlock your score."*
- **What I changed:**  
  I completely rejected gating the results. Students receive their full score, category breakdown, strengths, and improved example prompt immediately with zero gates. Sharing on WhatsApp is framed as an organic challenge: *"⚡ I scored 85/100 on PromptRush! Think you can beat me in 60s?"*
- **Why:**  
  Forced viral gating creates immediate resentment, fake shares to saved messages, and high bounce rates. Transparent, genuine diagnostic value builds authentic enthusiasm. Students happily challenge batchmates to beat their score because it reflects technical placement readiness.

---

### Three Core Reflection Questions

#### 1. What changed between the first idea and final solution?
The original thought was a quiz landing page. The final solution became a **full-funnel growth product**: a deadline-persistent 60-second challenge, an educational rubric engine, a personalized workshop transition bridge, an attribution-tracked WhatsApp sharing loop, an A/B testing lab, an interactive 500-registration sensitivity simulator, and a Growth Command Center tracking funnel health.

#### 2. What would I improve with another 24 hours?
1. **Live College vs College Leaderboard:** Add real-time campus aggregates (e.g. "VIT Vellore vs JNTU Hyderabad: Which campus has the highest average PromptScore?").
2. **Interactive Prompt Sandbox Preview:** Allow students on the results screen to test their improved prompt directly inside an interactive mock interviewer terminal right on the page.
3. **Automated Post-Registration Calendar Reminder:** Add a one-click Google Calendar / Apple Calendar event addition button on `/success` so students never miss the live session.

#### 3. What did AI suggest that I deliberately rejected, and why?
- **Rejected:** Secretly auto-subscribing students to marketing lists. *(Ethical reason: User consent must be explicit and unchecked).*
- **Rejected:** Faking high live registration counts or artificial countdown deadlines ("Only 3 seats remaining!"). *(Ethical reason: False urgency degrades student trust).*
- **Rejected:** Forcing an external paid LLM call that would fail without an API key. *(Technical reason: Software must work reliably out of the box for evaluators).*

