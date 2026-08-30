# Tasks: Complete Past Tenses

## Phase 1: Setup (Workspace & Infrastructure)

**Purpose**: Project initialization and workspace isolation.

- [X] T001 Create a new git worktree for workspace isolation in `.worktrees/021-complete-past-tenses` and check out branch `021-complete-past-tenses` (ask the user for confirmation first).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure testing infrastructure exists before implementing new tense data.

- [X] T002 Implement schema validation test for tense data (if not already existing) in `tests/data/tenses.test.ts`. This ensures we meet the Test-First requirement for the new JSON files.
- [X] T003 Execute the Iterative Review & Bug Hunt Subagent Loop for Phase 2: spawn a review subagent to check `tests/data/tenses.test.ts` for bugs, spec compliance, and eslint rules. Fix any issues and repeat until zero bugs remain.
- [X] T004 Commit Phase 2 changes: `git commit -m "chore: setup tense schema validation test"`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Practice Past Simple Tense (Priority: P1)

**Goal**: Users learning English grammar should be able to practice the Past Simple tense through various interactive workplace-themed challenges.

**Independent Test**: Can be fully tested by navigating to the "Past Simple" node on the Tense Hub map and playing through the challenges.

### Tests & Implementation for User Story 1

- [X] T005 [P] [US1] Create `src/data/tenses/past-simple.json` with `metadata`, `quickRules`, and empty arrays for `challenges` to ensure test failure first (TDD).
- [X] T006 [US1] Run schema validation test (`npm run test:run`) and verify it fails on `src/data/tenses/past-simple.json`.
- [X] T007 [P] [US1] Populate `src/data/tenses/past-simple.json` with exactly 80 challenges (20 `conjugation`, 20 `errorHunting`, 20 `sentenceBuilding`, 20 `devOpsChallenge`) strictly following an IT/Workplace context to make the test pass.
- [X] T008 [US1] Update `src/data/tenses/index.json` to set `past-simple` status to `"active"`.
- [X] T009 [US1] Execute the Iterative Review & Bug Hunt Subagent Loop for Phase 3: spawn a review subagent to check `past-simple.json` and `index.json` for bugs, spec compliance, and eslint rules. Fix any issues and repeat until zero bugs remain.
- [X] T010 [US1] Commit Phase 3 changes: `git commit -m "feat: add past simple tense data and activate"`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Practice Past Continuous Tense (Priority: P1)

**Goal**: Users should be able to practice the Past Continuous tense through interactive challenges.

**Independent Test**: Can be fully tested by navigating to the "Past Continuous" node and playing through the lesson.

### Tests & Implementation for User Story 2

- [X] T011 [P] [US2] Create `src/data/tenses/past-continuous.json` with empty structure to ensure test failure first (TDD).
- [X] T012 [US2] Run schema validation test (`npm run test:run`) and verify it fails on `src/data/tenses/past-continuous.json`.
- [X] T013 [P] [US2] Populate `src/data/tenses/past-continuous.json` with exactly 80 challenges (20 of each category) strictly following an IT/Workplace context to make the test pass.
- [X] T014 [US2] Update `src/data/tenses/index.json` to set `past-continuous` status to `"active"`.
- [X] T015 [US2] Execute the Iterative Review & Bug Hunt Subagent Loop for Phase 4: spawn a review subagent to check `past-continuous.json` and `index.json`. Fix issues and repeat until zero bugs remain.
- [X] T016 [US2] Commit Phase 4 changes: `git commit -m "feat: add past continuous tense data and activate"`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Practice Past Perfect Tense (Priority: P2)

**Goal**: Users should be able to practice the Past Perfect tense through interactive challenges.

**Independent Test**: Can be fully tested by navigating to the "Past Perfect" node and playing through the lesson.

### Tests & Implementation for User Story 3

- [X] T017 [P] [US3] Create `src/data/tenses/past-perfect.json` with empty structure to ensure test failure first (TDD).
- [X] T018 [US3] Run schema validation test (`npm run test:run`) and verify it fails on `src/data/tenses/past-perfect.json`.
- [X] T019 [P] [US3] Populate `src/data/tenses/past-perfect.json` with exactly 80 challenges (20 of each category) strictly following an IT/Workplace context to make the test pass.
- [X] T020 [US3] Update `src/data/tenses/index.json` to set `past-perfect` status to `"active"`.
- [X] T021 [US3] Execute the Iterative Review & Bug Hunt Subagent Loop for Phase 5: spawn a review subagent to check `past-perfect.json` and `index.json`. Fix issues and repeat until zero bugs remain.
- [X] T022 [US3] Commit Phase 5 changes: `git commit -m "feat: add past perfect tense data and activate"`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work independently.

---

## Phase 6: User Story 4 - Practice Past Perfect Continuous Tense (Priority: P2)

**Goal**: Users should be able to practice the Past Perfect Continuous tense through interactive challenges.

**Independent Test**: Can be fully tested by navigating to the "Past Perfect Continuous" node and playing through the lesson.

### Tests & Implementation for User Story 4

- [X] T023 [P] [US4] Create `src/data/tenses/past-perfect-continuous.json` with empty structure to ensure test failure first (TDD).
- [X] T024 [US4] Run schema validation test (`npm run test:run`) and verify it fails on `src/data/tenses/past-perfect-continuous.json`.
- [X] T025 [P] [US4] Populate `src/data/tenses/past-perfect-continuous.json` with exactly 80 challenges (20 of each category) strictly following an IT/Workplace context to make the test pass.
- [X] T026 [US4] Update `src/data/tenses/index.json` to set `past-perfect-continuous` status to `"active"`.
- [X] T027 [US4] Execute the Iterative Review & Bug Hunt Subagent Loop for Phase 6: spawn a review subagent to check `past-perfect-continuous.json` and `index.json`. Fix issues and repeat until zero bugs remain.
- [X] T028 [US4] Commit Phase 6 changes: `git commit -m "feat: add past perfect continuous tense data and activate"`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Final Feature-Level Review Phase (Polish & Cross-Cutting Concerns)

**Purpose**: A holistic review and integration validation of the entire implemented feature across all user stories.

- [X] T029 Execute the final feature-level review phase: spawn a subagent to conduct a comprehensive bug hunt, spec compliance check, eslint verification, and integration review across all implemented past tenses. Fix any bugs found and repeat until zero bugs remain.
- [X] T030 Validate E2E functionality by manually running the dev server (`npm run dev`) and navigating to `http://localhost:3000` to ensure the Past Simple, Past Continuous, Past Perfect, and Past Perfect Continuous nodes are active and playable.
- [X] T031 Final comprehensive commit: `git commit -m "feat: complete implementation of past tenses feature"`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion. User stories can proceed in parallel or sequentially.
- **Final Feature-Level Review (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1, 2, 3, 4**: Each story is fully independent as they involve separate data files and separate manifest entries.

### Parallel Opportunities

- Creation and population of all four JSON files (`past-simple.json`, `past-continuous.json`, `past-perfect.json`, `past-perfect-continuous.json`) can be done entirely in parallel if staffed by multiple agents/developers.
- Updates to `index.json` can be batched or handled sequentially during integration.

## Parallel Example: User Story 1 & 2

```bash
# Launch creation of JSON files for US1 and US2 together:
Task: "Create src/data/tenses/past-simple.json with metadata..." (T005)
Task: "Create src/data/tenses/past-continuous.json with empty structure..." (T011)

# After test failures, launch population of both JSON files together:
Task: "Populate src/data/tenses/past-simple.json with exactly 80 challenges..." (T007)
Task: "Populate src/data/tenses/past-continuous.json with exactly 80 challenges..." (T013)
```

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

Since Past Simple and Past Continuous are P1:
1. Complete Phase 1 & 2.
2. Complete Phase 3 & 4.
3. Validate and demo the core past tenses.

### Incremental Delivery

Deliver Phase 3, 4, 5, and 6 sequentially, ensuring each new tense works independently before moving to the next.
