# Implementation Plan: Sub-project 4 - 11 Game Config Builders for Teachers

**Branch**: `subproject-4-game-config-builders`
**Spec**: `docs/superpowers/specs/2026-09-11-game-config-builders-design.md`
**Mode**: Subagent-Driven Development with TDD

---

## Tasks Breakdown

### Task 1: Schema Updates & Validation Tests for 19 Games
- **Files**:
  - `src/types/config.ts` (update)
  - `src/lib/game-config-schema.ts` (update)
  - `tests/lib/game-config-schema.test.ts` (update)
- **TDD Steps**:
  1. Update `tests/lib/game-config-schema.test.ts` to assert all 19 games are valid, have default settings, and validate cleanly.
  2. Update `src/types/config.ts` and `src/lib/game-config-schema.ts`.
  3. Verify tests pass (green).
  4. Run lint and commit.

### Task 2: Implement Config Forms for Reading, Typing, Roleplay, Wordle, Word Connect, and Odd One Out (Part A - 6 forms)
- **Files**:
  - `src/components/config/ReadingConfigForm.tsx` (create)
  - `src/components/config/TypingConfigForm.tsx` (create)
  - `src/components/config/RoleplayConfigForm.tsx` (create)
  - `src/components/config/WordleConfigForm.tsx` (create)
  - `src/components/config/WordConnectConfigForm.tsx` (create)
  - `src/components/config/OddOneOutConfigForm.tsx` (create)
  - `tests/components/config/ConfigFormsPartA.test.tsx` (create)
- **TDD Steps**:
  1. Write tests for each form checking field rendering and onChange handlers.
  2. Implement each form component.
  3. Verify tests pass and commit.

### Task 3: Implement Config Forms for Grammar Detective, Vocab Defense, Crossword, Falling Words, and Hangman (Part B - 5 forms)
- **Files**:
  - `src/components/config/GrammarDetectiveConfigForm.tsx` (create)
  - `src/components/config/VocabDefenseConfigForm.tsx` (create)
  - `src/components/config/CrosswordConfigForm.tsx` (create)
  - `src/components/config/FallingWordsConfigForm.tsx` (create)
  - `src/components/config/HangmanConfigForm.tsx` (create)
  - `tests/components/config/ConfigFormsPartB.test.tsx` (create)
- **TDD Steps**:
  1. Write tests for each form checking field rendering and onChange handlers.
  2. Implement each form component.
  3. Verify tests pass and commit.

### Task 4: Integrate All 11 Forms into ConfigCreateForm & ConfigEditForm
- **Files**:
  - `src/components/config/ConfigCreateForm.tsx` (update)
  - `src/components/config/ConfigEditForm.tsx` (update)
  - `tests/components/config/ConfigEditForm.test.tsx` (update)
- **TDD Steps**:
  1. Update `renderGameSpecificForm` in both create and edit forms to include all 11 new components.
  2. Update unit tests in `tests/components/config/ConfigEditForm.test.tsx`.
  3. Verify tests pass and commit.

### Task 5: Final Quality Gate & Verification
- **Checks**:
  1. `npx tsc --noEmit`
  2. `npm run lint`
  3. `npm run test:run`
  4. `npm run build:ci`
