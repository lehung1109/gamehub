# Implementation Plan: Phase 22 - Live Phonics Spelling Bee Championship

**Target Milestone**: Phase 22  
**Branch**: `feat/phase-22-phonics-spelling-bee-championship`  
**Specification**: `docs/superpowers/specs/2026-09-13-phonics-spelling-bee-championship-design.md`  

---

## Proposed Tasks

### Task 1: TypeScript Contracts & Data Models
- **Files**:
  - `src/types/spelling-bee.ts`
  - `tests/unit/types/spelling-bee-types.test.ts`
- **Details**:
  - Define `SpellingBeeTier`, `SpellingBeeWord`, `SpellingBeeDivision`, `SpellingBeeResult`.
  - Validate contracts with strict unit test coverage.
- **Verification**: `npm run test:run tests/unit/types/spelling-bee-types.test.ts`

### Task 2: Curated Championship Divisions & Pure Engine
- **Files**:
  - `src/data/spelling-bee/tournament-divisions.ts`
  - `src/lib/spelling-bee-engine.ts`
  - `tests/unit/lib/spelling-bee-engine.test.ts`
- **Details**:
  - Curate 3 official divisions: Bronze Bee (`bronze-bee`), Silver Bee (`silver-bee`), Golden Bee (`golden-bee`).
  - Pure functions: `getAllDivisions()`, `getDivisionById()`, `validateSpellingAttempt()`, `calculateSpellingBeeScore()`.
- **Verification**: `npm run test:run tests/unit/lib/spelling-bee-engine.test.ts`

### Task 3: Server Actions for Tournament Scoring & Awards
- **Files**:
  - `src/app/actions/spelling-bee.ts`
  - `tests/unit/actions/spelling-bee.test.ts`
- **Details**:
  - `getSpellingBeeDivisionAction(divisionId: string)`
  - `submitSpellingBeeScoreAction(result: SpellingBeeResult)`
  - Clamp accuracy, compute stars and awarded EXP.
- **Verification**: `npm run test:run tests/unit/actions/spelling-bee.test.ts`

### Task 4: Spelling Bee UI Components (Arena, Hub, TrophyModal)
- **Files**:
  - `src/components/spelling-bee/SpellingBeeTrophyModal.tsx`
  - `src/components/spelling-bee/SpellingBeeArena.tsx`
  - `src/components/spelling-bee/SpellingBeeHub.tsx`
  - `tests/components/spelling-bee/SpellingBeeArena.test.tsx`
- **Details**:
  - Big high-contrast touch alphabet keyboard.
  - Listen word (1.0x / 0.8x slow speed), sentence context, and phonetic hints.
  - Life system (3 bees 🐝) and real-time feedback.
  - Golden trophy modal with ribbon and certificate details.
  - Strict kid-friendly typography ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/spelling-bee/SpellingBeeArena.test.tsx`

### Task 5: Page Routes, Navigation & Instructions Integration
- **Files**:
  - `src/app/spelling-bee/page.tsx`
  - `src/app/spelling-bee/[divisionId]/page.tsx`
  - `src/app/page.tsx`
  - `src/data/game-instructions.ts`
  - `tests/app/spelling-bee/page.test.tsx`
- **Details**:
  - Championship hub and dynamic SSG route.
  - Homepage topbar link **🐝 Spelling Bee**.
  - Instruction guide in `GAME_INSTRUCTIONS`.
- **Verification**: `npm run test:run tests/app/spelling-bee/page.test.tsx`

### Task 6: Playwright E2E Integration & Strict Typography Audit
- **Files**:
  - `tests/e2e/phonics-spelling-bee-championship.spec.ts`
- **Details**:
  - E2E flow: Navigate to `/spelling-bee`, enter Bronze Bee, listen to audio prompt, spell word on keyboard, complete round, receive trophy modal, and audit typography ($\ge 16$px).
- **Verification**: `npx playwright test tests/e2e/phonics-spelling-bee-championship.spec.ts`

### Task 7: Quality Gate, Build & Merge into `main`
- **Commands**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - Merge into `main` and push to GitHub.
