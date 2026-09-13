# Phase 8: AI Speaking Partner & Interactive Speech Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive conversational AI Speaking Partner ("Sunny") featuring real-time speech recognition, token-level pronunciation feedback, contextual scaffolding suggestions, resilient Gemini dialogue with offline fallback, and gamification rewards.

**Architecture:**
1. Pure domain speech scoring engine (`src/lib/speaking-engine.ts`) with phonetic alignment, WPM calculation, and star allocation.
2. Curated CEFR-aligned scenarios (`src/data/speaking/scenarios.json`) with personas (Sunny, Emma, Alex, Oliver) and multi-level scaffolding hints.
3. Supabase table `student_speaking_sessions` for saving conversation transcripts, pronunciation scores, and mispronounced words.
4. Next.js Server Actions (`src/app/actions/speaking.ts`) utilizing Gemini API with offline pedagogical rule engine fallback.
5. Client-side Speaking Hub at `/speaking` and Real-Time Speaking Arena at `/speaking/[scenarioId]`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 5, Tailwind CSS 4, Lucide React, Web Speech API (STT & TTS), Supabase, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-ai-speaking-partner-interactive-speech-design.md`

## Global Constraints
- Framework: Next.js 16 App Router, React 19, Tailwind CSS 4.
- Strictly adhere to kid-friendly minimum 16px typography policy (use `text-xs`, `text-sm`, `text-base`, etc., avoiding arbitrary sub-16px classes).
- Always verify typography scan with `npx vitest run tests/components/min-font-size-scan.test.ts`.
- Server Actions must be `async` functions when exported from `'use server'`.
- Resilient fallback for Gemini API: if API key is not present or API call fails, seamlessly generate pedagogical responses from local rule engine.

---

### Task 1: TypeScript Types & Curated Scenario Dataset

**Files:**
- Create: `src/types/speaking.ts`
- Create: `src/data/speaking/scenarios.json`
- Test: `tests/unit/data/speaking-scenarios.test.ts`

- [ ] **Step 1: Write failing test for scenario data integrity**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `src/types/speaking.ts` and `src/data/speaking/scenarios.json`**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

```bash
git add src/types/speaking.ts src/data/speaking/scenarios.json tests/unit/data/speaking-scenarios.test.ts
git commit -m "feat(speaking): define TypeScript contracts and curated CEFR speaking scenarios"
```

---

### Task 2: Pure Speaking & Pronunciation Evaluation Engine

**Files:**
- Create: `src/lib/speaking-engine.ts`
- Test: `tests/unit/lib/speaking-engine.test.ts`

- [ ] **Step 1: Write failing tests for pronunciation alignment, WPM calculation, and star allocation**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `src/lib/speaking-engine.ts`**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

```bash
git add src/lib/speaking-engine.ts tests/unit/lib/speaking-engine.test.ts
git commit -m "feat(speaking): implement pure speech evaluation and fluency calculation engine"
```

---

### Task 3: Supabase Migration & Database Custom Types

**Files:**
- Create: `supabase/migrations/20260912230000_speaking_partner.sql`
- Modify: `scripts/append-database-types.mjs`
- Modify: `src/types/database.ts`
- Test: `tests/unit/migrations/speaking-sessions-schema.test.ts`

- [ ] **Step 1: Write failing test for migration SQL syntax and structure**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Create migration file, update type generator script, and update `src/types/database.ts`**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260912230000_speaking_partner.sql scripts/append-database-types.mjs src/types/database.ts tests/unit/migrations/speaking-sessions-schema.test.ts
git commit -m "feat(migration): add student_speaking_sessions table, indexes, and RLS"
```

---

### Task 4: Server Actions for Speaking Dialogue & Gemini Integration

**Files:**
- Create: `src/app/actions/speaking.ts`
- Test: `tests/unit/actions/speaking.test.ts`

- [ ] **Step 1: Write failing tests for `sendSpeakingTurnAction`, `completeSpeakingSessionAction`, and `getStudentSpeakingStatsAction`**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `src/app/actions/speaking.ts` with Gemini API and offline pedagogical fallback**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

```bash
git add src/app/actions/speaking.ts tests/unit/actions/speaking.test.ts
git commit -m "feat(actions): implement speaking dialogue turn, completion, and stats actions"
```

---

### Task 5: Speaking Hub UI (`/speaking`) & Persona Selection

**Files:**
- Create: `src/components/speaking/ScenarioCard.tsx`
- Create: `src/components/speaking/PersonaSelector.tsx`
- Create: `src/app/speaking/page.tsx`
- Modify: `src/app/page.tsx` (add \"🎙️ Luyện nói AI\" CTA button)
- Test: `tests/unit/components/SpeakingHub.test.tsx`

- [ ] **Step 1: Write failing test for Speaking Hub page and components**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Speaking Hub page, ScenarioCard, PersonaSelector, and homepage link**
- [ ] **Step 4: Run test to verify pass & verify font size scan**
- [ ] **Step 5: Commit**

```bash
git add src/components/speaking/ src/app/speaking/page.tsx src/app/page.tsx tests/unit/components/SpeakingHub.test.tsx
git commit -m "feat(ui): implement speaking hub, scenario catalog, and persona selector"
```

---

### Task 6: Interactive Speaking Arena Client (`/speaking/[scenarioId]`)

**Files:**
- Create: `src/components/speaking/SpeakingBubble.tsx`
- Create: `src/components/speaking/ScaffoldingHints.tsx`
- Create: `src/components/speaking/MicPulseButton.tsx`
- Create: `src/components/speaking/SpeakingArena.tsx`
- Create: `src/app/speaking/[scenarioId]/page.tsx`
- Test: `tests/unit/components/SpeakingArena.test.tsx`

- [ ] **Step 1: Write failing test for Speaking Arena interactive turn-taking and mic states**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Speaking Arena, audio visualizer, hints drawer, and turn submission**
- [ ] **Step 4: Run test to verify pass & verify font size scan**
- [ ] **Step 5: Commit**

```bash
git add src/components/speaking/ src/app/speaking/[scenarioId]/page.tsx tests/unit/components/SpeakingArena.test.tsx
git commit -m "feat(ui): implement interactive speaking arena, speech recognition, and scaffolding"
```

---

### Task 7: Session Completion Scorecard & Mistake Notebook Integration

**Files:**
- Create: `src/components/speaking/SpeakingPodiumModal.tsx`
- Modify: `src/components/speaking/SpeakingArena.tsx` (integrate completion modal)
- Test: `tests/unit/components/SpeakingPodiumModal.test.tsx`

- [ ] **Step 1: Write failing test for `SpeakingPodiumModal` (scorecard, stars, add-to-mistakes)**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement SpeakingPodiumModal and tie with gamification / Mistake Notebook**
- [ ] **Step 4: Run test to verify pass & verify font size scan**
- [ ] **Step 5: Commit**

```bash
git add src/components/speaking/SpeakingPodiumModal.tsx src/components/speaking/SpeakingArena.tsx tests/unit/components/SpeakingPodiumModal.test.tsx
git commit -m "feat(ui): implement speaking session completion modal and mistake notebook integration"
```

---

### Task 8: End-to-End Playwright Verification for AI Speaking Partner

**Files:**
- Create: `tests/e2e/ai-speaking-partner.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests for navigation, scenario selection, dialogue turn, and scorecard**
- [ ] **Step 2: Run Playwright test: `npx playwright test tests/e2e/ai-speaking-partner.spec.ts --project=chromium`**
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/ai-speaking-partner.spec.ts
git commit -m "test(e2e): add Playwright verification for AI speaking partner user journey"
```
