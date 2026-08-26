# Implementation Tasks: Quiz Back Navigation

## Phase 1: Setup (Workspace)

**Purpose**: Project initialization and workspace isolation

- [ ] T001 Spawn a subagent to ask the user to confirm the creation of a new git worktree for `012-quiz-back-navigation` (default to yes) and execute the creation.
- [ ] T002 Execute Phase 1 Review & Bug Hunt subagent to verify worktree.
- [ ] T003 Commit Phase 1 changes (if any).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Spawn dedicated subagent for Phase 2 implementation.
- [ ] T005 [P] Update `src/components/game/QuizEngine.tsx` state definitions to include `answers: Record<number, number>` instead of a single `score` integer.
- [ ] T006 Execute Phase 2 Review & Bug Hunt subagent.
- [ ] T007 Commit Phase 2 changes.

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Navigate Back to Previous Question (Priority: P1)

**Goal**: Users can navigate to a previously answered question to review it.

**Independent Test**: Answer a question, click back, and verify the previous question is displayed.

### Tests for User Story 1 (TDD)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Write failing unit tests for "Back" button rendering and navigation in `tests/unit/components/game/QuizEngine.test.tsx`.

### Implementation for User Story 1

- [ ] T009 [US1] Spawn dedicated subagent for User Story 1 implementation.
- [ ] T010 [US1] Update `src/components/game/QuizEngine.tsx` to render a "Back" button (e.g. in the header) when `currentIndex > 0`.
- [ ] T011 [US1] Implement `handleBack` in `QuizEngine.tsx` to decrement `currentIndex` and clear `feedback.open`.
- [ ] T012 [US1] Update `QuizEngine.tsx` to pre-select `answers[currentIndex]` if it exists when rendering options.
- [ ] T013 [US1] Execute Phase 3 Review & Bug Hunt subagent.
- [ ] T014 [US1] Commit Phase 3 changes.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Update Answer and Score (Priority: P1)

**Goal**: When navigating back to a previously answered question, users can select a different answer, which updates their overall score.

**Independent Test**: Answer a question, go back, change the answer from wrong to right (or vice versa), and verify the final score reflects the latest choice.

### Tests for User Story 2 (TDD)

- [ ] T015 [P] [US2] Write failing unit tests for changing answers and dynamic score calculation in `tests/unit/components/game/QuizEngine.test.tsx`.
- [ ] T016 [P] [US2] Write failing E2E tests for changing answers in `tests/e2e/alphabet-quiz.spec.ts`.

### Implementation for User Story 2

- [ ] T017 [US2] Spawn dedicated subagent for User Story 2 implementation.
- [ ] T018 [US2] Update `handleSelectOption` in `src/components/game/QuizEngine.tsx` to save the selected answer into the `answers` record.
- [ ] T019 [US2] Update `handleContinue` or `onComplete` invocation in `src/components/game/QuizEngine.tsx` to compute the total score based on the `answers` record compared to `correctIndex`.
- [ ] T020 [US2] Ensure auto-advance correctly proceeds to the next sequential question when a past answer is changed.
- [ ] T021 [US2] Execute Phase 4 Review & Bug Hunt subagent.
- [ ] T022 [US2] Commit Phase 4 changes.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Final Feature-Level Review

**Purpose**: Holistic, feature-level review encompassing all previous phases.

- [ ] T023 Spawn a dedicated subagent to conduct a comprehensive bug hunt and integration review across the entire feature.
- [ ] T024 Fix any bugs found during the final review (repeat T023-T024 until zero bugs).
- [ ] T025 Final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on User Story 1
- **Polish (Final Phase)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational.
- **User Story 2 (P1)**: Depends on User Story 1 (needs the back button to exist to test changing answers).

### Parallel Opportunities

- Tests (T008, T015, T016) can be written in parallel by different subagents before their respective implementations begin.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) and Phase 4 (US2).
3. Final review in Phase N.
