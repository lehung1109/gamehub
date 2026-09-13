# Implementation Plan: Phase 23 - Interactive Phonics Cinema & Animated Micro-Lessons

**Target Milestone**: Phase 23  
**Branch**: `feat/phase-23-interactive-phonics-cinema-micro-lessons`  
**Specification**: `docs/superpowers/specs/2026-09-13-interactive-phonics-cinema-design.md`  

---

## Proposed Tasks

### Task 1: TypeScript Contracts & Data Models
- **Files**:
  - `src/types/phonics-cinema.ts`
  - `tests/unit/types/phonics-cinema-types.test.ts`
- **Details**:
  - Define `CinemaCategory`, `CinemaInteractivePrompt`, `CinemaScene`, `CinemaEpisode`, `CinemaResult`.
  - Add comprehensive unit test validation.
- **Verification**: `npm run test:run tests/unit/types/phonics-cinema-types.test.ts`

### Task 2: Curated Animated Episodes & Pure Engine
- **Files**:
  - `src/data/cinema/episodes.ts`
  - `src/lib/phonics-cinema-engine.ts`
  - `tests/unit/lib/phonics-cinema-engine.test.ts`
- **Details**:
  - Curate 3 episodes: *The Hungry Dino* (`the-hungry-dino`), *The Magic Potion* (`the-magic-potion`), *The Flying Carpet* (`the-flying-carpet`).
  - Pure functions: `getAllEpisodes()`, `getEpisodeById()`, `calculateCinemaScore()`, `validatePromptAnswer()`.
- **Verification**: `npm run test:run tests/unit/lib/phonics-cinema-engine.test.ts`

### Task 3: Server Actions for Cinema Progression & Popcorn Rewards
- **Files**:
  - `src/app/actions/phonics-cinema.ts`
  - `tests/unit/actions/phonics-cinema.test.ts`
- **Details**:
  - `getCinemaEpisodeAction(episodeId: string)`
  - `submitCinemaScoreAction(result: CinemaResult)`
  - Compute stars, awarded EXP and popcorn bonuses.
- **Verification**: `npm run test:run tests/unit/actions/phonics-cinema.test.ts`

### Task 4: Cinema UI Components (Player, Hub, PopcornRewardModal)
- **Files**:
  - `src/components/cinema/CinemaPopcornModal.tsx`
  - `src/components/cinema/PhonicsCinemaPlayer.tsx`
  - `src/components/cinema/PhonicsCinemaHub.tsx`
  - `tests/components/cinema/PhonicsCinemaPlayer.test.tsx`
- **Details**:
  - Animated cartoon cinema screen with backdrop themes (jungle, wizard-lab, starry-sky).
  - Bilingual subtitle player with TTS audio narration.
  - Interactive pause challenge modal: choice buttons with phonics hints.
  - Golden popcorn celebration modal.
  - Strict kid-friendly typography ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/cinema/PhonicsCinemaPlayer.test.tsx`

### Task 5: Page Routes, Navigation & Homepage Integration
- **Files**:
  - `src/app/cinema/page.tsx`
  - `src/app/cinema/[episodeId]/page.tsx`
  - `src/app/page.tsx`
  - `tests/app/cinema/page.test.tsx`
- **Details**:
  - Cinema Hub route and dynamic SSG episode player route.
  - Homepage topbar link **🍿 Rạp Phim**.
- **Verification**: `npm run test:run tests/app/cinema/page.test.tsx`

### Task 6: Playwright E2E Integration & Strict Typography Audit
- **Files**:
  - `tests/e2e/interactive-phonics-cinema.spec.ts`
- **Details**:
  - E2E flow: Navigate to `/cinema`, start *The Hungry Dino*, play scene, pause at interactive challenge, solve phonics prompt, collect popcorn, complete movie, and audit typography ($\ge 16$px).
- **Verification**: `npx playwright test tests/e2e/interactive-phonics-cinema.spec.ts`

### Task 7: Quality Gate, Build & Merge into `main`
- **Commands**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - Merge into `main` and push to GitHub.
