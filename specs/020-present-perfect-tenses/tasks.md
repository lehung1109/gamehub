# Implementation Tasks: Complete Present Perfect and Present Perfect Continuous Tenses

**Feature**: Complete Present Perfect and Present Perfect Continuous Tenses
**Branch**: `020-present-perfect-tenses`

## Phase 1: Setup

**Purpose**: Worktree initialization

- [X] T001 Create a new git worktree for workspace isolation (or confirm with user to proceed in current directory)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T002 Update `src/data/tenses/index.json` to change the `status` of `present-perfect` and `present-perfect-continuous` to `"active"`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Practice Present Perfect Tense (Priority: P1)

**Goal**: Users can practice the Present Perfect tense through interactive workplace-themed challenges.

**Independent Test**: Run tests to verify the JSON data has 20 challenges per category. Then manually navigate to the Present Perfect node in the app to ensure data loads and the lesson is playable.

### Tests for User Story 1 (TDD)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T003 [US1] Create unit test in `tests/data/present-perfect.test.ts` to assert metadata, quickRules, and exactly 20 items per challenge category (80 total)

### Implementation for User Story 1

- [X] T004 [US1] Create base JSON file at `src/data/tenses/present-perfect.json` including `metadata` and `quickRules` focusing on IT/Workplace context, leaving `challenges` object with empty arrays
- [X] T005 [US1] Append 20 IT/Workplace themed `conjugation` challenges to `src/data/tenses/present-perfect.json`
- [X] T006 [US1] Append 20 IT/Workplace themed `errorHunting` challenges to `src/data/tenses/present-perfect.json`
- [X] T007 [US1] Append 20 IT/Workplace themed `sentenceBuilding` challenges to `src/data/tenses/present-perfect.json`
- [X] T008 [US1] Append 20 IT/Workplace themed `devOpsChallenge` challenges to `src/data/tenses/present-perfect.json`
- [X] T009 [US1] Run `npm run test:run` to verify tests for present perfect pass (TDD Green)
- [X] T010 [US1] Spawn a subagent to conduct code review and bug hunt (verify JSON schema and content quality)
- [X] T011 [US1] Commit Phase 3 changes (Phase-End Commit)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Practice Present Perfect Continuous Tense (Priority: P1)

**Goal**: Users can practice the Present Perfect Continuous tense with equivalent depth of content.

**Independent Test**: Run tests to verify the JSON data has 20 challenges per category. Manually play the Present Perfect Continuous lesson to ensure correctness.

### Tests for User Story 2 (TDD)

- [X] T012 [US2] Create unit test in `tests/data/present-perfect-continuous.test.ts` to assert metadata, quickRules, and exactly 20 items per challenge category (80 total)

### Implementation for User Story 2

- [X] T013 [US2] Create base JSON file at `src/data/tenses/present-perfect-continuous.json` including `metadata` and `quickRules` focusing on IT/Workplace context, leaving `challenges` object with empty arrays
- [X] T014 [US2] Append 20 IT/Workplace themed `conjugation` challenges to `src/data/tenses/present-perfect-continuous.json`
- [X] T015 [US2] Append 20 IT/Workplace themed `errorHunting` challenges to `src/data/tenses/present-perfect-continuous.json`
- [X] T016 [US2] Append 20 IT/Workplace themed `sentenceBuilding` challenges to `src/data/tenses/present-perfect-continuous.json`
- [X] T017 [US2] Append 20 IT/Workplace themed `devOpsChallenge` challenges to `src/data/tenses/present-perfect-continuous.json`
- [X] T018 [US2] Run `npm run test:run` to verify tests for present perfect continuous pass (TDD Green)
- [X] T019 [US2] Spawn a subagent to conduct code review and bug hunt (verify JSON schema and content quality)
- [X] T020 [US2] Commit Phase 4 changes (Phase-End Commit)

**Checkpoint**: Both user stories should now be independently functional

---

## Phase 5: Polish & Final Review

**Purpose**: Holistic feature-level review and final verification

- [X] T021 Spawn a subagent to conduct a comprehensive bug hunt and integration review across the entire implemented feature, ensuring data works flawlessly in the UI
- [X] T022 Final comprehensive commit to finalize the feature implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3 & 4)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase (Phase 2).
- **User Story 2 (P1)**: Can start after Foundational phase (Phase 2). Independent of User Story 1.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD).
- Data files should be populated incrementally.
- A subagent review MUST be executed at the end of the phase.
- A phase-end commit MUST be made upon review completion.

### Parallel Opportunities

- User Story 1 and User Story 2 can be worked on in parallel by different agents or developers since they target different isolated JSON data files.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently in the UI
5. Proceed to User Story 2

### Incremental Delivery

1. Complete Setup + Foundational -> UI unlocks the tenses
2. Add User Story 1 -> Test independently -> Practice Present Perfect is available
3. Add User Story 2 -> Test independently -> Practice Present Perfect Continuous is available
4. Final Review -> Code merged and deployed
