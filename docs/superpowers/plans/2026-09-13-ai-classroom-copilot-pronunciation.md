# Phase 14 Implementation Plan: AI Classroom Co-Pilot & Automated Pronunciation Assessment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated phoneme-level pronunciation assessment engine for Vietnamese primary students (detecting dropped endings and subtle phonological substitutions) and a Teacher AI Classroom Co-Pilot that automatically generates polymorphic Live Arena games from natural language prompts and formulates 15-minute remediation lesson plans.

**Architecture:** Phoneme Assessment Engine (`src/lib/phoneme-evaluator.ts`) decomposes target words into IPA phonemes and evaluates student acoustic/transcription inputs against typical Vietnamese ESL phonetic shifts. Teacher AI Co-Pilot (`src/lib/ai-copilot-generator.ts` and `src/app/actions/ai-copilot.ts`) parses teacher prompts into validated Live Arena questions and lesson plans. UI components (`PhonemeVisualizer.tsx`, `AiClassroomCopilot.tsx`) present tactile, color-coded, and $\ge 16$px accessible interfaces.

**Tech Stack:** Next.js 16.3.5, React 19, TypeScript 5 (strict, zero `any`), Tailwind CSS v4, Web Speech API & Audio Synthesis, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-ai-classroom-copilot-pronunciation-design.md`

## Global Constraints

- Strict kid-friendly typography policy: minimum 16px font size (strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- TypeScript 5 strict mode, zero `any`.
- Next.js 16.3.5 + React 19 standards (no synchronous `setState` in `useEffect` bodies).
- Zero external vulnerable packages (100% clean audit).
- Deterministic fallback for AI generation guaranteeing high availability without external API outages.

---

### Task 1: TypeScript Contracts & Phoneme Types

**Files:**
- Create: `src/types/ai-copilot.ts`
- Test: `tests/unit/types/ai-copilot-types.test.ts`

**Interfaces:**
- Produces:
  - `PhonemeStatus = 'perfect' | 'near' | 'incorrect' | 'omitted'`
  - `PhonemeBreakdown`
  - `PhonemeAssessmentResult`
  - `CopilotLessonPlan`
  - `GenerateArenaPromptInput`
  - `GeneratedArenaPayload`

- [ ] **Step 1: Write failing unit tests for AI co-pilot and phoneme types**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement types in `src/types/ai-copilot.ts`**
- [ ] **Step 4: Verify unit tests pass and run typecheck**
- [ ] **Step 5: Commit changes**

---

### Task 2: Phoneme Segmentation & Assessment Engine

**Files:**
- Create: `src/lib/phoneme-evaluator.ts`
- Test: `tests/unit/lib/phoneme-evaluator.test.ts`

**Interfaces:**
- Produces:
  - `decomposeWordIntoPhonemes(word: string): Array<{ phoneme: string; ipa: string; type: 'vowel' | 'consonant' | 'cluster' }>`
  - `evaluatePhonemePronunciation(targetWord: string, spokenText: string): PhonemeAssessmentResult`

- [ ] **Step 1: Write failing unit tests for phoneme evaluator**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement phoneme decomposition and ESL pattern detection in `src/lib/phoneme-evaluator.ts`**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 3: AI Classroom Co-Pilot Logic & Generators

**Files:**
- Create: `src/lib/ai-copilot-generator.ts`
- Test: `tests/unit/lib/ai-copilot-generator.test.ts`

**Interfaces:**
- Produces:
  - `generateArenaQuestionsFromPrompt(input: GenerateArenaPromptInput): GeneratedArenaPayload`
  - `generateRemediationLessonPlan(topic: string, gradeLevel: string, targetPhonemes?: string[]): CopilotLessonPlan`

- [ ] **Step 1: Write failing unit tests for AI generators**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement generators in `src/lib/ai-copilot-generator.ts`**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 4: Server Actions for AI Co-Pilot & Pronunciation Assessment

**Files:**
- Create: `src/app/actions/ai-copilot.ts`
- Test: `tests/unit/actions/ai-copilot.test.ts`

**Interfaces:**
- Produces:
  - `generateArenaFromPromptAction(input: GenerateArenaPromptInput): Promise<ActionResponse<GeneratedArenaPayload>>`
  - `generateRemediationPlanAction(topic: string, gradeLevel: string): Promise<ActionResponse<CopilotLessonPlan>>`
  - `assessPhonemePronunciationAction(targetWord: string, spokenText: string): Promise<ActionResponse<PhonemeAssessmentResult>>`

- [ ] **Step 1: Write failing unit tests for server actions**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement server actions in `src/app/actions/ai-copilot.ts`**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 5: Student Phoneme Visualizer Component

**Files:**
- Create: `src/components/game/pronunciation/PhonemeVisualizer.tsx`
- Test: `tests/components/pronunciation/PhonemeVisualizer.test.tsx`

**Deliverables:**
- Visual representation of phonemes with color states (Green, Yellow, Red, Gray).
- Tap-to-hear pronunciation for individual phonemes using Web Speech API synthesis.
- Clear Vietnamese guidance tips for dropped final sounds or substituted fricatives.
- Strict $\ge 16$px typography.

- [ ] **Step 1: Write failing component tests for `PhonemeVisualizer`**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement `PhonemeVisualizer.tsx`**
- [ ] **Step 4: Verify component tests pass and verify typography**
- [ ] **Step 5: Commit changes**

---

### Task 6: Teacher AI Classroom Co-Pilot Interface

**Files:**
- Create: `src/components/admin/ai/AiClassroomCopilot.tsx`
- Create: `src/app/admin/ai-copilot/page.tsx`
- Test: `tests/components/admin/AiClassroomCopilot.test.tsx`

**Deliverables:**
- Tab 1: Instant Arena Generator with prompt box, grade selector, and question preview with 1-click launch.
- Tab 2: Remediation Lesson Planner with tongue-twister generator and step-by-step classroom script.
- Strict $\ge 16$px typography.

- [ ] **Step 1: Write failing component tests for `AiClassroomCopilot`**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement `AiClassroomCopilot.tsx` and admin route**
- [ ] **Step 4: Verify component tests pass and verify typography**
- [ ] **Step 5: Commit changes**

---

### Task 7: Playwright End-to-End Integration Suite

**Files:**
- Create: `tests/e2e/ai-classroom-copilot.spec.ts`

**Deliverables:**
- E2E testing of teacher prompt submission, AI question generation, and redirection to Live Arena creation.
- Typography audit asserting 0 instances of `text-xs` or `text-sm`.

- [ ] **Step 1: Write E2E test suite in `tests/e2e/ai-classroom-copilot.spec.ts`**
- [ ] **Step 2: Run Playwright test suite**
- [ ] **Step 3: Commit changes**

---

### Task 8: Quality Gate Verification, PR & Squash Merge

**Steps:**
- [ ] **Step 1: Run full TypeScript check (`npx tsc --noEmit`)**
- [ ] **Step 2: Run ESLint (`npm run lint`)**
- [ ] **Step 3: Run all Vitest unit and component tests (`npm run test:run`)**
- [ ] **Step 4: Run production build (`npm run build`)**
- [ ] **Step 5: Push branch, create PR, and squash-merge into `main`**
