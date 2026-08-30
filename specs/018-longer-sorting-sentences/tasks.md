# Implementation Tasks: Expand Sentence Sorting Data

## Phase 1: Setup & Worktree Creation

**Purpose**: Isolate the workspace before implementation begins per Constitution Principle VI.

- [x] T001 Ask the user to confirm the creation of a new git worktree for workspace isolation, defaulting to creating a new one. (e.g., `git worktree add ../gamehub-018-longer-sorting-sentences 018-longer-sorting-sentences`)
- [x] T002 Spawn a dedicated subagent to execute the Phase 1 Iterative Review & Bug Hunt (verify eslint, spec compliance, zero bugs).
- [x] T003 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

*(No foundational architectural changes needed for this data-only feature, but we adhere to the phase structure)*

- [x] T004 Spawn a dedicated subagent to execute Phase 2 tasks (if any) and conduct an Iterative Review & Bug Hunt.
- [x] T005 Commit Phase 2 changes.

---

## Phase 3: User Story 1 - Sorting complex English sentences (Priority: P1)

**Goal**: Provide 50 advanced 10-12 word sentences for sorting.

**Independent Test**: Can be fully tested by verifying the content of `src/data/sentences.json` via unit tests and UI rendering.

### Tests for User Story 1 (TDD REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] Spawn a dedicated subagent to execute Phase 3 implementation and TDD.
- [x] T007 [US1] Create or update unit tests in `tests/data/sentences.test.ts` (or `src/data/sentences.test.ts` if co-located) to assert the length and schema of the sentences. Verify the test fails initially (`npm run test:run`).
  ```typescript
  import { expect, test, describe } from 'vitest';
  import sentences from '../../src/data/sentences.json'; // adjust path

  describe('Sentences Data Validation', () => {
    test('should contain exactly 50 sentences', () => {
      expect(sentences.length).toBe(50);
    });

    test('each sentence should have between 10 and 12 words', () => {
      sentences.forEach(s => {
        expect(s.words.length).toBeGreaterThanOrEqual(10);
        expect(s.words.length).toBeLessThanOrEqual(12);
        expect(s.full).toBeTruthy();
        expect(s.vietnamese).toBeTruthy();
        expect(s.emoji).toBeTruthy();
        expect(s.category).toBeTruthy();
      });
    });
  });
  ```

### Implementation for User Story 1

- [x] T008 [US1] Implement the 50 complex sentences in `src/data/sentences.json` ensuring they strictly match the schema (`id`, `words`, `full`, `vietnamese`, `emoji`, `category`) and the 10-12 word constraint.
  *Pseudocode/Example format:*
  ```json
  [
    {
      "id": "the-small-brown-dog-runs",
      "words": ["The", "small", "brown", "dog", "runs", "very", "quickly", "across", "the", "large", "green", "park"],
      "full": "The small brown dog runs very quickly across the large green park",
      "vietnamese": "Chú chó nhỏ màu nâu chạy rất nhanh qua công viên xanh rộng lớn",
      "emoji": "🐶",
      "category": "animals"
    },
    ... (49 more)
  ]
  ```
- [x] T009 [US1] Run the unit tests (`npm run test:run`) to verify they now pass (Green step of TDD). Refactor data if necessary until green.
- [x] T010 [US1] Run the application locally (`npm run dev`) and visually validate that sentences render correctly without layout breakage per `quickstart.md`.
- [x] T011 [US1] Spawn a dedicated subagent to conduct an Iterative Review & Bug Hunt (code review, spec compliance, `npm run lint`, zero bugs). If bugs found, fix and re-spawn review subagent until zero bugs remain.
- [x] T012 [US1] Commit Phase 3 changes with a descriptive conventional commit message.

---

## Phase 4: Final Feature-Level Review

**Purpose**: Holistic review across the entire implemented feature to ensure Constitution compliance and zero bugs.

- [ ] T013 Spawn a dedicated subagent to conduct a comprehensive feature-level bug hunt, run all checks (`npm run lint`, `npx tsc --noEmit`, `npm run test:run`, `npm run test:e2e`), and verify integration.
- [ ] T014 If bugs are found during T013, fix them and repeat the review cycle (spawn another review subagent) until zero bugs remain.
- [ ] T015 Make a final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

- **Phase 1 & 2**: Setup and Worktree creation must happen first.
- **Phase 3 (User Story 1)**: Depends on Phase 1 & 2. TDD steps (T007) MUST precede implementation (T008).
- **Phase 4 (Final Review)**: Depends on the completion of all User Stories.

## Parallel Example: User Story 1

Since this feature primarily involves data entry into a single file and a single test file, there are limited parallel opportunities. However, multiple agents *could* brainstorm sentence sets in parallel if needed, though this plan assumes sequential data generation within T008.

## Implementation Strategy

### MVP First (User Story 1 Only)

This feature is comprised entirely of User Story 1. The MVP is the full delivery of the 50 sentences with automated validation protecting the data integrity.
