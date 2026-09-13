# Phonics Time Machine & Historical Civilizations Adventure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 32 "Phonics Time Machine & Historical Civilizations Adventure" (`/timetravel`), featuring Professor Chronos 🕰️ and Chrono-Kitten Pip 🐱, 4 historical civilizations, 12 historical relics, interactive chrono-capsule puzzle chamber, time museum, time traveler ranks, and strict kid-friendly typography ($\ge 16$px).

**Architecture:** Next.js App Router with client-side interactive chronological exploration, pure phonics time engine, server action persistence, speech synthesis (`useSpeech`), and accessible prehistoric/historical UI components.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-phonics-time-machine-design.md`

## Global Constraints
- Framework: Next.js 16.3.5 with React 19 and TypeScript 5. Zero `any`.
- Typography: Strict minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) across all new UI components. Zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Voice speech synthesis: `speak(text: string, customLang?: string)` with string parameters only.
- LocalStorage hydration: Safe client-side hydration wrapped in `setTimeout(..., 0)` to satisfy ESLint.
- No unstable animations on interactive buttons (avoid `animate-bounce` on clickable elements).

---

### Task 1: TypeScript Contracts
**Files:**
- Create: `src/types/phonics-time.ts`
- Test: `tests/unit/types/phonics-time-types.test.ts`

**Interfaces:**
- Produces: `TimeTravelEraId`, `TimeTravelerRank`, `TimeChallenge`, `TimeRelic`, `TimeTravelEraDefinition`, `TimeProgress`.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement TypeScript contracts**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit contracts**

---

### Task 2: Curated Relics Dataset & Pure Engine
**Files:**
- Create: `src/data/time/relics.ts`
- Create: `src/lib/phonics-time-engine.ts`
- Test: `tests/unit/lib/phonics-time-engine.test.ts`

**Interfaces:**
- Consumes: types from `src/types/phonics-time.ts`.
- Produces: `getAllEras()`, `getEraById()`, `getAllRelics()`, `getRelicById()`, `getRelicsByEra()`, `calculateTimeTravelerRank()`, `getDefaultTimeProgress()`, `completeTimeRelic()`.

- [ ] **Step 1: Write unit tests for pure engine**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement relics dataset and engine functions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit engine and data**

---

### Task 3: Server Actions
**Files:**
- Create: `src/app/actions/phonics-time.ts`
- Test: `tests/unit/actions/phonics-time.test.ts`

**Interfaces:**
- Consumes: `TimeProgress`, `getDefaultTimeProgress()` from engine and types.
- Produces: `getTimeProgressAction()`, `saveTimeProgressAction()`.

- [ ] **Step 1: Write unit tests for server actions**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement server actions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit server actions**

---

### Task 4: UI Components
**Files:**
- Create: `src/components/time/TimeHeaderBar.tsx`
- Create: `src/components/time/ChronoEraSelector.tsx`
- Create: `src/components/time/ChronoCapsuleModal.tsx`
- Create: `src/components/time/TimeMuseumModal.tsx`
- Create: `src/components/time/PhonicsTimeExperience.tsx`
- Test: `tests/components/time/PhonicsTimeExperience.test.tsx`

**Interfaces:**
- Consumes: engine functions, types, server actions, `useSpeech`.
- Produces: `PhonicsTimeExperience` top-level orchestrator.

- [ ] **Step 1: Write component tests**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement historical UI components enforcing font size $\ge 16$px**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit UI components**

---

### Task 5: Route Page, Navigation & Homepage Integration
**Files:**
- Create: `src/app/timetravel/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/app/timetravel/page.test.tsx`
- Test: `tests/app/page.test.tsx`

**Interfaces:**
- Produces: `/timetravel` route and topbar link `timetravel-topbar-link`.

- [ ] **Step 1: Write route page test and update homepage test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `/timetravel/page.tsx` and update `src/app/page.tsx`**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit route and homepage integration**

---

### Task 6: Playwright E2E Integration Test & Quality Gate
**Files:**
- Create: `tests/e2e/phonics-time-machine.spec.ts`

- [ ] **Step 1: Implement Playwright E2E test with strict typography check**
- [ ] **Step 2: Run full unit tests: `npm run test:run`**
- [ ] **Step 3: Run full production build: `npm run build`**
- [ ] **Step 4: Commit E2E and merge to main**
