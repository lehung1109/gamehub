# Implementation Tasks: Present Continuous Tense

## Phase 1: Setup & Worktree Creation

**Purpose**: Isolate the workspace before implementation begins per Constitution Principle VI.

- [ ] T001 Ask the user to confirm the creation of a new git worktree for workspace isolation, defaulting to creating a new one. (e.g., `git worktree add ../gamehub-019-present-continuous-tense 019-present-continuous-tense`)
- [ ] T002 Spawn a dedicated subagent to execute the Phase 1 Iterative Review & Bug Hunt (verify spec compliance, zero bugs).
- [ ] T003 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

*(No foundational architectural changes needed for this data-only feature, but we adhere to the phase structure)*

- [ ] T004 Spawn a dedicated subagent to execute Phase 2 tasks (if any) and conduct an Iterative Review & Bug Hunt.
- [ ] T005 Commit Phase 2 changes.

---

## Phase 3: User Story 1 - Tense Discovery (Priority: P1)

**Goal**: Make Present Continuous visible and active in the tenses list.

**Independent Test**: Load the tenses list page (`npm run dev`) and verify that "Present Continuous" is listed as "active" instead of "coming_soon" and is clickable.

### Tests for User Story 1 (TDD REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [US1] Spawn a dedicated subagent to execute Phase 3 implementation and TDD.
- [x] T007 [US1] Create unit tests in `tests/data/tenses.test.ts` to assert that the `present-continuous` object in `src/data/tenses/index.json` has `status: "active"`. Verify the test fails initially (`npm run test:run`).

### Implementation for User Story 1

- [x] T008 [US1] Update `src/data/tenses/index.json` to change the `status` of the `present-continuous` tense object from `"coming_soon"` to `"active"`.
- [x] T009 [US1] Run the unit tests (`npm run test:run`) to verify they now pass (Green step of TDD). Refactor if necessary until green.
- [x] T010 [US1] Run the application locally (`npm run dev`) and visually validate that the tense is active in the list.
- [x] T011 [US1] Spawn a dedicated subagent to conduct an Iterative Review & Bug Hunt (code review, spec compliance, `npm run lint`, zero bugs). If bugs found, fix and re-spawn review subagent until zero bugs remain.
- [x] T012 [US1] Commit Phase 3 changes with a descriptive conventional commit message.

---

## Phase 4: User Story 2 - Learn Rules and Complete Challenges (Priority: P2)

**Goal**: Provide 10 interactive challenges and grammatical rules for the Present Continuous tense.

**Independent Test**: Navigate to the Present Continuous page and verify the rules and challenges are rendered and playable.

### Tests for User Story 2 (TDD REQUIRED)

- [x] T013 [US2] Spawn a dedicated subagent to execute Phase 4 implementation and TDD.
- [x] T014 [US2] Create unit tests in `tests/data/present-continuous.test.ts` to assert the schema of `src/data/tenses/present-continuous.json`. Ensure it checks for `metadata`, `quickRules`, and at least 10 items in the `challenges` array. Verify the test fails initially (since file doesn't exist yet).

### Implementation for User Story 2

- [x] T015 [US2] Create `src/data/tenses/present-continuous.json` containing the `metadata`, `quickRules`, and exactly 10 `challenges` formatted perfectly matching the `present-simple.json` schema.
- [x] T016 [US2] Run the unit tests (`npm run test:run`) to verify they now pass (Green step of TDD). Refactor if necessary until green.
- [x] T017 [US2] Run the application locally and visually validate the page layout and challenges.
- [x] T018 [US2] Spawn a dedicated subagent to conduct an Iterative Review & Bug Hunt (verify eslint, spec compliance, zero bugs). 
- [x] T019 [US2] Commit Phase 4 changes.

---

## Phase 5: Final Feature-Level Review

**Purpose**: Holistic review across the entire implemented feature to ensure Constitution compliance and zero bugs.

- [x] T020 Spawn a dedicated subagent to conduct a comprehensive feature-level bug hunt, run all checks (`npm run lint`, `npx tsc --noEmit`, `npm run test:run`, `npm run test:e2e`), and verify integration.
- [x] T021 If bugs are found during T020, fix them and repeat the review cycle (spawn another review subagent) until zero bugs remain.
- [x] T022 Make a final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion. Must proceed sequentially (US1 then US2).
- **Final Review (Phase 5)**: Depends on all user stories being complete.

### Parallel Opportunities

- Tests creation (T014) and implementation (T015) within Phase 4 can potentially be done in parallel if TDD constraints were relaxed, but TDD dictates sequential Red-Green-Refactor execution.
- Multiple agents *could* brainstorm sentence sets in parallel, but writing the JSON file itself is sequential.

## Implementation Strategy

### MVP First (User Story 1 Only)

The absolute minimum is enabling the entry in the list (US1), but since US2 provides the actual content, the MVP should be considered US1 + US2 combined. However, US1 can be tested independently first.
