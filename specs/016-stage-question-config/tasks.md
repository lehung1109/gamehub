# Tasks: 016-stage-question-config

**Input**: Design documents from `specs/016-stage-question-config/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, strictly adhering to Constitution Principle VI (Task Generation Standards).

## Phase 1: Setup (Workspace Initialization)

**Purpose**: Project initialization and workspace isolation as required by Constitution Principle VI.1.

- [x] T001 Ask user to confirm creation of a new git worktree for workspace isolation. (If confirmed, create it, else skip).
- [x] T002 Spawn a subagent to execute Phase 1 setup tasks.
- [x] T003 Ensure all previous artifacts and branches are up to date in the working tree.
- [x] T004 Spawn a review subagent to verify Phase 1 completeness.
- [x] T005 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Specifically, the updated `useSessionQuestions` hook logic for history tracking.

- [x] T006 Spawn a subagent to execute Phase 2 tasks.
- [x] T007 **TDD**: Write failing unit tests for `useSessionQuestions` in `tests/unit/useSessionQuestions.test.ts` to test history tracking (via `sessionStorage`), deduplication logic, and page reload persistence.
- [x] T008 **TDD**: Implement `useSessionQuestions` logic in `src/hooks/useSessionQuestions.ts` to pass the tests from T007, adhering to the strategy in `research.md`.
- [x] T009 Spawn a review subagent to review and fix any bugs in Phase 2.
- [x] T010 Repeat review subagent loop if bugs were found in T009.
- [x] T011 Commit Phase 2 changes.

**Checkpoint**: Foundation ready - core logic for US2 and US3 is in place.

---

## Phase 3: User Story 1, 2, 3 - Tùy Chọn Số Lượng Câu Hỏi & Giao Diện (Priority: P1 & P2)

**Goal**: Implement the UI chip selectors on Stage Cards, pass the selected count to the stages, and integrate with the new `useSessionQuestions` hook.

- [x] T012 [US1] Spawn a subagent to execute Phase 3 tasks.
- [x] T013 [US1] **TDD**: Write failing tests in `tests/unit/tenses/TenseLessonContainer.test.tsx` for chip selector UI rendering, dynamic option calculation, and interaction.
- [x] T014 [US1] **TDD**: Update `src/components/tenses/TenseLessonContainer.tsx` to manage state for selected question counts per stage and render chip selectors (5, 10, 15, Tất cả) dynamically based on stage item counts.
- [x] T015 [US1] [P] **TDD**: Update `src/components/tenses/stages/ConjugationStage.tsx` to accept a `questionCount` prop and pass it to `useSessionQuestions`.
- [x] T016 [US1] [P] **TDD**: Update `src/components/tenses/stages/ErrorHunterStage.tsx` to accept a `questionCount` prop and pass it to `useSessionQuestions`.
- [x] T017 [US1] [P] **TDD**: Update `src/components/tenses/stages/SentenceBuilderStage.tsx` to accept a `questionCount` prop and pass it to `useSessionQuestions`.
- [x] T018 [US1] [P] **TDD**: Update `src/components/tenses/stages/DevOpsChallengeStage.tsx` to accept a `questionCount` prop and pass it to `useSessionQuestions` (if applicable).
- [x] T019 [US1] Spawn a review subagent to review and fix any bugs in Phase 3.
- [x] T020 [US1] Repeat review subagent loop if bugs were found in T019.
- [x] T021 [US1] Commit Phase 3 changes.

**Checkpoint**: Feature is fully functional and independently testable.

---

## Phase 4: Final Feature-Level Review Phase

**Purpose**: Holistic, feature-level review encompassing all previous phases (Constitution VI.6).

- [x] T022 Spawn a subagent to conduct a comprehensive bug hunt and integration review across the entire implemented feature.
- [x] T023 Run lint check: `npm run lint` and fix any issues.
- [x] T024 Run type check: `npx tsc --noEmit` and fix any issues.
- [x] T025 Run unit tests: `npm run test:run` and fix any failures.
- [x] T026 Run E2E tests: `npm run test:e2e` (or verify manually via `quickstart.md`) and fix any issues.
- [x] T027 Spawn another review subagent if any fixes were made during T023-T026.
- [x] T028 Make a final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

- Phase 1 (Setup) must be executed first.
- Phase 2 (Foundational) blocks Phase 3 because the stages need the updated hook signature.
- Phase 3 implements the UI and wires it all together.
- Phase 4 ensures everything meets the Constitution quality gates.
