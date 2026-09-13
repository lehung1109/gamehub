# Implementation Plan: Phase 18 - Phonics Rhythm Chant & Karaoke Studio (Phòng Thu Vè Phonics & Karaoke Nhịp Điệu)

**Target Milestone**: Phase 18  
**Branch**: `feat/phase-18-phonics-rhythm-chant-studio`  
**Specification**: `docs/superpowers/specs/2026-09-13-phonics-rhythm-chant-karaoke-studio-design.md`  

---

## Proposed Tasks

### Task 1: TypeScript Contracts & Data Models
- **Files**:
  - `src/types/phonics-chant.ts`
  - `tests/unit/types/phonics-chant-types.test.ts`
- **Details**:
  - Define `ChantDifficulty`, `ChantWordTiming`, `ChantLine`, `PhonicsChant`, `ChantPerformanceScore`.
  - Validate schema structure, beat indexing, and scoring contracts.
- **Verification**: `npm run test:run tests/unit/types/phonics-chant-types.test.ts`

### Task 2: Curated Chants Catalog & Beat Synthesizer Library
- **Files**:
  - `src/data/chants/phonics-chants.ts`
  - `src/lib/rhythm-beat-synthesizer.ts`
  - `src/lib/phonics-chant-engine.ts`
  - `tests/unit/lib/phonics-chant-engine.test.ts`
  - `tests/unit/lib/rhythm-beat-synthesizer.test.ts`
- **Details**:
  - 3 curated chants (*The Cat on the Mat*, *Hop, Pop, Don't Stop!*, *Five Little Frogs on a Log*).
  - Web Audio procedural sound synthesis (woodblock, kick, claps) with mocked AudioContext test fallback.
  - Pure functions: `getAllChants()`, `getChantById()`, `calculateRhythmAccuracy()`, `calculateChantExp()`.
- **Verification**: `npm run test:run tests/unit/lib/phonics-chant-engine.test.ts tests/unit/lib/rhythm-beat-synthesizer.test.ts`

### Task 3: Server Actions for Chant Performance
- **Files**:
  - `src/app/actions/phonics-chant.ts`
  - `tests/unit/actions/phonics-chant.test.ts`
- **Details**:
  - `getChantDetailsAction(chantId: string)`
  - `submitChantPerformanceAction(result: ChantPerformanceScore)`
  - Validation: Ensure non-negative counts, clamp accuracy between 0 and 100%, and calculate XP correctly.
- **Verification**: `npm run test:run tests/unit/actions/phonics-chant.test.ts`

### Task 4: Interactive Karaoke Studio & Completed Modal Components
- **Files**:
  - `src/components/chant/ChantCompletedModal.tsx`
  - `src/components/chant/KaraokeChantStudio.tsx`
  - `tests/components/chant/KaraokeChantStudio.test.tsx`
- **Details**:
  - Visual metronome & bouncing ball word highlighter timed to BPM.
  - Rhythm tap button with timing tolerance (±150ms for Perfect, ±300ms for Great).
  - Speech synthesis line rehearsal + audio recording stub for student vocal sing-along.
  - Strict typography policy enforcement ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/chant/KaraokeChantStudio.test.tsx`

### Task 5: Chant Catalog Hub & Dynamic Page Routes
- **Files**:
  - `src/components/chant/ChantCatalog.tsx`
  - `src/app/chants/page.tsx`
  - `src/app/chants/[chantId]/page.tsx`
  - `tests/components/chant/ChantCatalog.test.tsx`
- **Details**:
  - Catalog listing with filters by difficulty, target sound, and BPM badge.
  - `generateStaticParams()` for all curated chant IDs (`cat-on-the-mat`, `hop-pop-dont-stop`, `five-little-frogs`).
  - Strict typography enforcement ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/chant/ChantCatalog.test.tsx`

### Task 6: Playwright E2E Integration & Strict Typography Audit
- **Files**:
  - `tests/e2e/phonics-rhythm-chant-studio.spec.ts`
- **Details**:
  - E2E flow: Navigate to `/chants`, open a chant studio, start rhythm session, tap beat, view karaoke highlight, and verify zero `text-xs`/`text-sm`.
- **Verification**: `npx playwright test tests/e2e/phonics-rhythm-chant-studio.spec.ts`

### Task 7: Whole-Branch Quality Gate, Pull Request & Merge
- **Commands**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - `git push -u origin feat/phase-18-phonics-rhythm-chant-studio`
  - `gh pr create` and `gh pr merge --squash --delete-branch`
  - `git checkout main; git pull origin main`
