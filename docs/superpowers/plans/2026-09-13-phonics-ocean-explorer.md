# Phonics Ocean Explorer & Deep Sea Submarine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 29 "Phonics Ocean Explorer & Deep Sea Submarine" (`/ocean`), featuring Captain Coral 🐬 and AI Nautilus 🫧, 4 depth zones, 12 phonics missions, interactive sonar acoustic decoding, marine biology compendium, diver ranks, and strict kid-friendly typography ($\ge 16$px).

**Architecture:** Next.js App Router with client interactive experience, pure phonics engine, server action persistence, multi-sensory speech synthesis (`useSpeech`), and accessible oceanic UI components.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-phonics-ocean-explorer-design.md`

## Global Constraints
- Framework: Next.js 16.3.5 with React 19 and TypeScript 5. Zero `any`.
- Typography: Strict minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) across all new UI components. Zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Voice speech synthesis: `speak(text: string, customLang?: string)` with string parameters only.
- LocalStorage hydration: Safe client-side hydration wrapped in `setTimeout(..., 0)` to satisfy ESLint.
- No unstable animations on interactive buttons (avoid `animate-bounce` on clickable elements).

---

### Task 1: TypeScript Contracts
**Files:**
- Create: `src/types/phonics-ocean.ts`
- Test: `tests/unit/types/phonics-ocean-types.test.ts`

**Interfaces:**
- Produces: `OceanDepthZone`, `DiverRank`, `OceanChallenge`, `OceanMission`, `OceanZoneDefinition`, `OceanProgress`.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement TypeScript contracts**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit contracts**

---

### Task 2: Curated Deep Sea Missions & Pure Engine
**Files:**
- Create: `src/data/ocean/missions.ts`
- Create: `src/lib/phonics-ocean-engine.ts`
- Test: `tests/unit/lib/phonics-ocean-engine.test.ts`

**Interfaces:**
- Consumes: types from `src/types/phonics-ocean.ts`.
- Produces: `getAllZones()`, `getZoneById()`, `getAllMissions()`, `getMissionById()`, `getMissionsByZone()`, `calculateDiverRank()`, `getDefaultOceanProgress()`, `completeOceanMission()`.

- [ ] **Step 1: Write unit tests for pure engine**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement missions dataset and engine functions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit engine and data**

---

### Task 3: Server Actions
**Files:**
- Create: `src/app/actions/phonics-ocean.ts`
- Test: `tests/unit/actions/phonics-ocean.test.ts`

**Interfaces:**
- Consumes: `OceanProgress`, `getDefaultOceanProgress()` from engine and types.
- Produces: `getOceanProgressAction()`, `saveOceanProgressAction()`.

- [ ] **Step 1: Write unit tests for server actions**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement server actions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit server actions**

---

### Task 4: UI Components
**Files:**
- Create: `src/components/ocean/OceanHeaderBar.tsx`
- Create: `src/components/ocean/OceanZoneSelector.tsx`
- Create: `src/components/ocean/SubmarineSonarModal.tsx`
- Create: `src/components/ocean/OceanCompendiumModal.tsx`
- Create: `src/components/ocean/PhonicsOceanExperience.tsx`
- Test: `tests/components/ocean/PhonicsOceanExperience.test.tsx`

**Interfaces:**
- Consumes: engine functions, types, server actions, `useSpeech`.
- Produces: `PhonicsOceanExperience` top-level orchestrator.

- [ ] **Step 1: Write component tests**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement oceanic UI components enforcing font size $\ge 16$px**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit UI components**

---

### Task 5: Route Page, Navigation & Homepage Integration
**Files:**
- Create: `src/app/ocean/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/app/ocean/page.test.tsx`
- Test: `tests/app/page.test.tsx`

- [ ] **Step 1: Write route page test and update homepage test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `/ocean` page and homepage card**
- [ ] **Step 4: Run tests to verify pass**
- [ ] **Step 5: Commit route and homepage integration**

---

### Task 6: Playwright E2E Integration
**Files:**
- Create: `tests/e2e/phonics-ocean-explorer.spec.ts`

- [ ] **Step 1: Write E2E test verifying end-to-end user journey and typography $\ge 16$px**
- [ ] **Step 2: Run Playwright E2E test on Chromium and Mobile Chrome**
- [ ] **Step 3: Commit E2E test**

---

### Task 7: Quality Gate & Merge into `main`
- [ ] **Step 1: Run TypeScript check (`npx tsc --noEmit`)**
- [ ] **Step 2: Run ESLint (`npm run lint`)**
- [ ] **Step 3: Run Full Vitest Suite (`npm run test:run`)**
- [ ] **Step 4: Run Next.js Production Build (`npm run build`)**
- [ ] **Step 5: Merge branch into `main` and push to remote**
