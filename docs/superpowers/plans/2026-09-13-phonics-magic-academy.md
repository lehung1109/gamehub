# Phonics Magic Academy & Wizard Spellcraft Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 30 "Phonics Magic Academy & Wizard Spellcraft Studio" (`/magic`), featuring Archmage Merlin 🧙‍♂️ and Owl Familiar Oliver 🦉, 4 elemental towers, 12 phonics spells, interactive wand incantations, ancient grimoire, wizard ranks, and strict kid-friendly typography ($\ge 16$px).

**Architecture:** Next.js App Router with client-side interactive spellcasting, pure phonics spell engine, server action persistence, speech synthesis (`useSpeech`), and accessible magical UI components.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-phonics-magic-academy-design.md`

## Global Constraints
- Framework: Next.js 16.3.5 with React 19 and TypeScript 5. Zero `any`.
- Typography: Strict minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) across all new UI components. Zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Voice speech synthesis: `speak(text: string, customLang?: string)` with string parameters only.
- LocalStorage hydration: Safe client-side hydration wrapped in `setTimeout(..., 0)` to satisfy ESLint.
- No unstable animations on interactive buttons (avoid `animate-bounce` on clickable elements).

---

### Task 1: TypeScript Contracts
**Files:**
- Create: `src/types/phonics-magic.ts`
- Test: `tests/unit/types/phonics-magic-types.test.ts`

**Interfaces:**
- Produces: `ElementalTowerId`, `WizardRank`, `MagicChallenge`, `MagicSpell`, `ElementalTowerDefinition`, `MagicProgress`.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement TypeScript contracts**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit contracts**

---

### Task 2: Curated Spells Dataset & Pure Engine
**Files:**
- Create: `src/data/magic/spells.ts`
- Create: `src/lib/phonics-magic-engine.ts`
- Test: `tests/unit/lib/phonics-magic-engine.test.ts`

**Interfaces:**
- Consumes: types from `src/types/phonics-magic.ts`.
- Produces: `getAllTowers()`, `getTowerById()`, `getAllSpells()`, `getSpellById()`, `getSpellsByTower()`, `calculateWizardRank()`, `getDefaultMagicProgress()`, `completeMagicSpell()`.

- [ ] **Step 1: Write unit tests for pure engine**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement spells dataset and engine functions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit engine and data**

---

### Task 3: Server Actions
**Files:**
- Create: `src/app/actions/phonics-magic.ts`
- Test: `tests/unit/actions/phonics-magic.test.ts`

**Interfaces:**
- Consumes: `MagicProgress`, `getDefaultMagicProgress()` from engine and types.
- Produces: `getMagicProgressAction()`, `saveMagicProgressAction()`.

- [ ] **Step 1: Write unit tests for server actions**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement server actions**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit server actions**

---

### Task 4: UI Components
**Files:**
- Create: `src/components/magic/MagicHeaderBar.tsx`
- Create: `src/components/magic/MagicTowerSelector.tsx`
- Create: `src/components/magic/WandIncantationModal.tsx`
- Create: `src/components/magic/AncientGrimoireModal.tsx`
- Create: `src/components/magic/PhonicsMagicExperience.tsx`
- Test: `tests/components/magic/PhonicsMagicExperience.test.tsx`

**Interfaces:**
- Consumes: engine functions, types, server actions, `useSpeech`.
- Produces: `PhonicsMagicExperience` top-level orchestrator.

- [ ] **Step 1: Write component tests**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement magical UI components enforcing font size $\ge 16$px**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit UI components**

---

### Task 5: Route Page, Navigation & Homepage Integration
**Files:**
- Create: `src/app/magic/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/app/magic/page.test.tsx`
- Test: `tests/app/page.test.tsx`

- [ ] **Step 1: Write route page test and update homepage test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `/magic` page and homepage card/link**
- [ ] **Step 4: Run tests to verify pass**
- [ ] **Step 5: Commit route and homepage integration**

---

### Task 6: Playwright E2E Integration
**Files:**
- Create: `tests/e2e/phonics-magic-academy.spec.ts`

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
