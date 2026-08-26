# Tasks: Chặng 4: DevOps Challenge Stage

**Feature Branch**: `012-devops-challenge-stage`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Phase 1: Setup & Worktree

**Purpose**: Project initialization and isolated workspace creation.

- [x] T001 Ask the user to confirm the creation of a new git worktree for workspace isolation. If confirmed, create the worktree and switch the current agent context to it.
- [x] T002 Update data models in `src/types/tenses.ts` to include `DevOpsItem` union, `TenseChallenges.devOpsChallenge`, `StageType`, and `TenseUserProgressRecord.stageScores.devOpsChallenge`.
- [x] T003 Execute an iterative review subagent loop to verify Phase 1 changes and fix any bugs.
- [x] T004 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: Foundational - Storage & Progress (User Story 2)

**Goal**: Implement tracking for the optional `devOpsChallenge` stage in local storage without breaking existing user data.
**Independent Test**: Running unit tests verifies that aggregating scores works with or without `devOpsChallenge` data.

- [x] T005 [US2] TDD: Write failing unit tests in `src/lib/tenses/storage.test.ts` (or equivalent test file) covering the new `devOpsChallenge` optional field in `calculateAggregates`. Verify failure (`npm run test:run`).
- [x] T006 [US2] TDD: Implement the `storage.ts` changes to make the unit tests pass and refactor while maintaining green tests.
- [x] T007 Execute an iterative review subagent loop to verify Phase 2 changes and fix any bugs.
- [x] T008 Commit Phase 2 changes with a descriptive conventional commit message.

---

## Phase 3: Core UI Refactoring (User Story 3)

**Goal**: Extract reusable single-question UI components from existing stages to satisfy the DRY requirement (SC-003).
**Independent Test**: The original 3 stages must continue to function perfectly with no visual or interactive changes.

- [x] T009 [US3] TDD: Write failing unit tests for the extracted UI components (e.g., `tests/unit/ui-components.test.tsx`). Verify failure.
- [x] T010 [P] [US3] TDD: Extract and implement `ConjugationQuestionUI.tsx` in `src/components/tenses/stages/ui/`.
- [x] T011 [P] [US3] TDD: Extract and implement `ErrorHunterQuestionUI.tsx` in `src/components/tenses/stages/ui/`.
- [x] T012 [P] [US3] TDD: Extract and implement `SentenceBuilderQuestionUI.tsx` in `src/components/tenses/stages/ui/`.
- [x] T013 [US3] TDD: Refactor `ConjugationStage.tsx`, `ErrorHunterStage.tsx`, and `SentenceBuilderStage.tsx` to consume the new UI components and pass all tests.
- [x] T014 Execute an iterative review subagent loop to verify Phase 3 changes (including running `npm run test:e2e` to ensure no regressions) and fix any bugs.
- [x] T015 Commit Phase 3 changes with a descriptive conventional commit message.

---

## Phase 4: Mixed DevOps Challenge Stage (User Story 1)

**Goal**: Implement the new Stage 4 that dynamically renders the extracted UI components based on the `challengeType` discriminator.
**Independent Test**: Users can access Stage 4 and experience a seamless mix of the 3 question types in IT/DevOps contexts.

- [x] T016 [P] [US1] Add 9 mock IT/DevOps questions to the `devOpsChallenge` array in `src/data/tenses/present-simple.json`.
- [x] T017 [US1] TDD: Write failing E2E tests for the new DevOps Challenge flow in `tests/e2e/devops-challenge.spec.ts`. Verify failure (`npm run test:e2e`).
- [x] T018 [US1] TDD: Implement `DevOpsChallengeStage.tsx` in `src/components/tenses/stages/` to handle the state and dynamically render the correct UI component from Phase 3.
- [x] T019 [US1] TDD: Update `TenseLessonContainer.tsx` in `src/components/tenses/` to conditionally display Stage 4 only if `devOpsChallenge` data is present. Ensure all tests pass.
- [x] T020 Execute an iterative review subagent loop to verify Phase 4 changes and fix any bugs.
- [x] T021 Commit Phase 4 changes with a descriptive conventional commit message.

---

## Phase 5: Final Feature-Level Review

**Purpose**: Holistic validation across all implemented user stories.

- [x] T022 Spawn a subagent to conduct a comprehensive feature-level review and bug hunt across the entire `012-devops-challenge-stage` feature.
- [x] T023 Fix any integration bugs or regressions identified in the review.
- [x] T024 Re-run the review subagent loop iteratively until zero bugs remain and all quickstart validation steps pass.
- [x] T025 Make a final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (US2)**: Depends on Setup.
- **Phase 3 (US3)**: Depends on Setup. Can be executed in parallel with Phase 2.
- **Phase 4 (US1)**: Depends on Phase 3 (Refactoring) and Phase 2 (Storage).
- **Phase 5 (Review)**: Depends on all previous phases.

### Parallel Opportunities
- Extraction of the three UI components (T010, T011, T012) can be done in parallel.
- Data mocking (T016) can be done in parallel with TDD test creation (T017).

## Implementation Strategy
- **MVP First**: Complete Phase 1 and Phase 2 to ensure backward compatibility. Then complete Phase 3 to establish a clean architecture. Finally, complete Phase 4 to deliver the feature value. Always execute the iterative review subagents at the end of every phase to catch issues early.
