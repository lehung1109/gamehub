# Implementation Plan: Phase 21 - Voice-Controlled Phonics Arcade & Speak-to-Play Games

**Target Milestone**: Phase 21  
**Branch**: `feat/phase-21-voice-controlled-phonics-arcade`  
**Specification**: `docs/superpowers/specs/2026-09-13-voice-controlled-phonics-arcade-design.md`  

---

## Proposed Tasks

### Task 1: TypeScript Contracts & Data Models
- **Files**:
  - `src/types/voice-arcade.ts`
  - `tests/unit/types/voice-arcade-types.test.ts`
- **Details**:
  - Define `ArcadeGameMode`, `ArcadeDifficulty`, `ArcadeWordTarget`, `ArcadeStage`, `ArcadeGameResult`.
  - Validate contracts for stages, target words, and game results.
- **Verification**: `npm run test:run tests/unit/types/voice-arcade-types.test.ts`

### Task 2: Curated Arcade Stages & Pure Game Engine
- **Files**:
  - `src/data/arcade/voice-stages.ts`
  - `src/lib/voice-arcade-engine.ts`
  - `tests/unit/lib/voice-arcade-engine.test.ts`
- **Details**:
  - Curated stages: *Voice Jump Runner* (`runner-cvc`), *Meteor Blaster* (`blaster-blends`), *Pitch Rocket Glider* (`glider-vowels`).
  - Pure functions: `getAllArcadeStages()`, `getStageById()`, `evaluateSpokenWord()`, `calculateArcadeScore()`.
- **Verification**: `npm run test:run tests/unit/lib/voice-arcade-engine.test.ts`

### Task 3: Server Actions for Voice Arcade Scoring
- **Files**:
  - `src/app/actions/voice-arcade.ts`
  - `tests/unit/actions/voice-arcade.test.ts`
- **Details**:
  - `getArcadeStageAction(stageId: string)`
  - `submitArcadeScoreAction(result: ArcadeGameResult)`
  - Clamp accuracy, calculate star rating (1–3 stars), and compute EXP rewards.
- **Verification**: `npm run test:run tests/unit/actions/voice-arcade.test.ts`

### Task 4: Voice Arcade Components (Game Arena, Hub, GameOverModal)
- **Files**:
  - `src/components/arcade/ArcadeGameOverModal.tsx`
  - `src/components/arcade/VoiceArcadeGame.tsx`
  - `src/components/arcade/VoiceArcadeHub.tsx`
  - `tests/components/arcade/VoiceArcadeGame.test.tsx`
- **Details**:
  - Live game arena with animated obstacle / target word movement.
  - Integration with `useSpeechRecognition` and Web Audio sound synthesizer.
  - Instant voice leap / laser blast feedback.
  - Game over dialog with score summary and retry button.
  - Strict kid-friendly typography ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/arcade/VoiceArcadeGame.test.tsx`

### Task 5: Voice Arcade Page Routes & Homepage Integration
- **Files**:
  - `src/app/games/voice-arcade/page.tsx`
  - `src/app/games/voice-arcade/[stageId]/page.tsx`
  - `src/app/page.tsx`
  - `tests/app/page.test.tsx`
- **Details**:
  - Hub route `/games/voice-arcade` and dynamic SSG route `/games/voice-arcade/[stageId]`.
  - Homepage top bar quick link **🎙️ Voice Arcade**.
- **Verification**: `npm run test:run tests/app/page.test.tsx`

### Task 6: Playwright E2E Integration & Strict Typography Audit
- **Files**:
  - `tests/e2e/voice-controlled-phonics-arcade.spec.ts`
- **Details**:
  - E2E flow: Navigate to `/games/voice-arcade`, launch Voice Jump Runner, trigger jump via voice/simulated recognition, score points, and verify strict typography ($\ge 16$px).
- **Verification**: `npx playwright test tests/e2e/voice-controlled-phonics-arcade.spec.ts`

### Task 7: Whole-Branch Quality Gate, Pull Request & Merge
- **Commands**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - Merge into `main` and push to GitHub.
