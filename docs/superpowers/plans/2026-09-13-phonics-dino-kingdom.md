# Phonics Dino Kingdom & Prehistoric Fossils Archeology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 31 "Phonics Dino Kingdom & Prehistoric Fossils Archeology" (`/dino`), featuring Dr. Rex 🦖 and Chippy 🤖, 4 geological eras, 12 prehistoric dinosaur fossils, interactive fossil dig chamber, dinosaur museum, paleontologist ranks, and strict kid-friendly typography ($\ge 16$px).

**Architecture:** Next.js App Router with client-side interactive fossil excavation, pure phonics dino engine, server action persistence, speech synthesis (`useSpeech`), and accessible prehistoric UI components.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-phonics-dino-kingdom-design.md`

## Global Constraints
- Framework: Next.js 16.3.5 with React 19 and TypeScript 5. Zero `any`.
- Typography: Strict minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) across all new UI components. Zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Voice speech synthesis: `speak(text: string, customLang?: string)` with string parameters only.
- LocalStorage hydration: Safe client-side hydration wrapped in `setTimeout(..., 0)` to satisfy ESLint.
- No unstable animations on interactive buttons (avoid `animate-bounce` on clickable elements).

---

### Task 1: TypeScript Contracts
**Files:**
- Create: `src/types/phonics-dino.ts`
- Test: `tests/unit/types/phonics-dino-types.test.ts`

**Interfaces:**
- Produces: `GeologicalEraId`, `DinoDietType`, `PaleontologistRank`, `DinoChallenge`, `DinosaurFossil`, `GeologicalEraDefinition`, `DinoProgress`.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement TypeScript contracts**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit contracts**

---

### Task 2: Curated Fossils Dataset & Pure Engine
**Files:**
- Create: `src/data/dino/dinosaurs.ts`
- Create: `src/lib/phonics-dino-engine.ts`
- Test: `tests/unit/lib/phonics-dino-engine.test.ts`

**Interfaces:**
- Consumes: types from `src/types/phonics-dino.ts`.
- Produces: `getAllEras()`, `getEraById()`, `getAllFossils()`, `getFossilById()`, `getFossilsByEra()`, `calculatePaleontologistRank()`, `getDefaultDinoProgress()`, `completeDinoFossil()`.

- [ ] **Step 1: Write unit tests for pure engine**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement fossils dataset and engine functions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit engine and data**

---

### Task 3: Server Actions
**Files:**
- Create: `src/app/actions/phonics-dino.ts`
- Test: `tests/unit/actions/phonics-dino.test.ts`

**Interfaces:**
- Consumes: `DinoProgress`, `getDefaultDinoProgress()` from engine and types.
- Produces: `getDinoProgressAction()`, `saveDinoProgressAction()`.

- [ ] **Step 1: Write unit tests for server actions**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement server actions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit server actions**

---

### Task 4: UI Components
**Files:**
- Create: `src/components/dino/DinoHeaderBar.tsx`
- Create: `src/components/dino/DinoSiteSelector.tsx`
- Create: `src/components/dino/FossilDigModal.tsx`
- Create: `src/components/dino/DinoMuseumModal.tsx`
- Create: `src/components/dino/PhonicsDinoExperience.tsx`
- Test: `tests/components/dino/PhonicsDinoExperience.test.tsx`

**Interfaces:**
- Consumes: engine functions, types, server actions, `useSpeech`.
- Produces: `PhonicsDinoExperience` top-level orchestrator.

- [ ] **Step 1: Write component tests**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement prehistoric UI components enforcing font size $\ge 16$px**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit UI components**

---

### Task 5: Route Page, Navigation & Homepage Integration
**Files:**
- Create: `src/app/dino/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/app/dino/page.test.tsx`
- Test: `tests/app/page.test.tsx`

**Interfaces:**
- Produces: `/dino` route and topbar link `dino-topbar-link`.

- [ ] **Step 1: Write route page test and update homepage test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `/dino/page.tsx` and update `src/app/page.tsx`**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit route and homepage integration**

---

### Task 6: Playwright E2E Integration Test & Quality Gate
**Files:**
- Create: `tests/e2e/phonics-dino-park.spec.ts`

- [ ] **Step 1: Implement Playwright E2E test with strict typography check**
- [ ] **Step 2: Run full unit tests: `npm run test:run`**
- [ ] **Step 3: Run full production build: `npm run build`**
- [ ] **Step 4: Commit E2E and merge to main**
