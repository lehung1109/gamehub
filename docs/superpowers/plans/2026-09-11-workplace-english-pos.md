# Implementation Plan: Sub-project 2 - Workplace English Parts of Speech & Supabase Sync

**Branch**: `subproject-2-workplace-english-pos`
**Spec**: `docs/superpowers/specs/2026-09-11-workplace-english-pos-design.md`
**Mode**: Subagent-Driven Development with TDD

---

## Tasks Breakdown

### Task 1: Curriculum Data Files & Schema Validation Test
- **Files**:
  - `src/data/parts-of-speech/verb.json` (create)
  - `src/data/parts-of-speech/adjective.json` (create)
  - `src/data/parts-of-speech/adverb.json` (create)
  - `src/data/parts-of-speech/mixed.json` (create)
  - `src/data/parts-of-speech/index.json` (update status of all 5 to active)
  - `tests/data/parts-of-speech.test.ts` (create)
- **TDD Steps**:
  1. Write `tests/data/parts-of-speech.test.ts` asserting all 5 modules exist, are active in `index.json`, and pass strict validation (valid quickRules, wordFamily with >= 2 items and valid options, fillInBlank with >= 2 items and valid contextType, errorHunting with >= 1 item and valid errorTokenIndex).
  2. Run vitest (red).
  3. Create the 4 JSON files and update `index.json` (green).
  4. Run tests and commit.

### Task 2: Static Route Generation & Dynamic Page Test Updates
- **Files**:
  - `tests/app/parts-of-speech/slug-page.test.tsx` (update)
- **TDD Steps**:
  1. Update `tests/app/parts-of-speech/slug-page.test.tsx` to verify `generateStaticParams()` returns 5 items (`noun`, `verb`, `adjective`, `adverb`, `mixed`).
  2. Verify all 5 slugs render their container.
  3. Verify non-existent slug returns 404.
  4. Run vitest and commit.

### Task 3: Supabase Sync Integration in `PartsOfSpeechLessonContainer`
- **Files**:
  - `src/components/parts-of-speech/PartsOfSpeechLessonContainer.tsx` (update)
  - `tests/unit/components/parts-of-speech/PartsOfSpeechLessonContainer.test.tsx` (create)
- **TDD Steps**:
  1. Write tests in `tests/unit/components/parts-of-speech/PartsOfSpeechLessonContainer.test.tsx` mocking `useGameTracking`.
  2. Update `PartsOfSpeechLessonContainer.tsx`:
     - Call `useGameTracking({ gameType: 'parts-of-speech', topic: metadata.id })`.
     - When `handleStageComplete` is called, persist to `localStorage` via `saveStageProgress` AND if tracking active, call `submitSession`.
  3. Run vitest and commit.

### Task 4: E2E Playwright Tests for Parts of Speech Hub & Modules
- **Files**:
  - `tests/e2e/parts-of-speech-hub.spec.ts` (update/expand)
- **TDD Steps**:
  1. Verify hub shows all 5 modules active without "Sắp ra mắt" locks on verb, adjective, adverb, mixed.
  2. Navigate into verb, adjective, adverb, and mixed modules.
  3. Test stage tabs and interactions.
  4. Commit changes.

### Task 5: Quality Gate Verification
- **Checks**:
  1. `npx tsc --noEmit`
  2. `npm run lint`
  3. `npm run test:run`
  4. `npm run build:ci`
