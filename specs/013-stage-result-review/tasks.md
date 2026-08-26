# Implementation Tasks: stage-result-review

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No general setup required beyond checking out the branch)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 [P] Update `src/types/tenses.ts` to define `AttemptItem` interface and add `attemptHistory?: AttemptItem[]` to `StageProgress`.
- [ ] T002 Update `src/lib/tenses/storage.ts` to support saving and retrieving `attemptHistory` along with stage scores in `saveStageProgress`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Stage Result Summary (Priority: P1) ⭐ MVP

**Goal**: Show a summary of performance immediately after finishing a stage instead of abruptly dropping back to the menu.

**Independent Test**: Complete a stage (e.g. Conjugation) and verify that the Stage Result Summary is displayed with correct score/total and evaluation.

### Implementation for User Story 1

- [ ] T003 [US1] Create `StageResultUI.tsx` in `src/components/tenses/stages/ui/` that displays the score, accuracy, evaluation message, and buttons ("Làm lại", "Về danh sách", "Xem chi tiết").
- [ ] T004 [US1] Update `src/components/tenses/TenseLessonContainer.tsx` to handle a new state for displaying `StageResultUI` when a stage is finished but the overall lesson is not yet completed.
- [ ] T005 [P] [US1] Update `ConjugationStage.tsx` to pass the final attempt data back to `TenseLessonContainer` when the stage completes, triggering the summary view.
- [ ] T006 [P] [US1] Update `ErrorHunterStage.tsx` to pass the final attempt data back to `TenseLessonContainer` when the stage completes.
- [ ] T007 [P] [US1] Update `SentenceBuilderStage.tsx` to pass the final attempt data back to `TenseLessonContainer` when the stage completes.
- [ ] T008 [P] [US1] Update `DevOpsChallengeStage.tsx` to pass the final attempt data back to `TenseLessonContainer` when the stage completes.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Review Detailed Question History (Priority: P2)

**Goal**: Allow users to review specific answers for the questions they just completed to understand mistakes.

**Independent Test**: From the Stage Result Summary, click "Xem chi tiết" and verify that a list of questions, chosen answers, correct answers, and explanations is correctly rendered.

### Implementation for User Story 2

- [ ] T009 [US2] Create `HistoryReviewUI.tsx` in `src/components/tenses/stages/ui/` to render a list of `AttemptItem` objects showing correct/incorrect indicators, chosen vs correct answers, and grammatical explanations.
- [ ] T010 [US2] Update `ConjugationQuestionUI.tsx`, `ErrorHunterQuestionUI.tsx`, and `SentenceBuilderQuestionUI.tsx` to capture user's submitted answers into `AttemptItem` objects and accumulate them in the stage component's state.
- [ ] T011 [US2] Wire `HistoryReviewUI` into `StageResultUI` (e.g., as a conditionally rendered view or a Dialog/Drawer) triggered by the "Xem chi tiết" button.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Expanded Random Question Bank (Priority: P3)

**Goal**: Encounter different questions when replaying a stage. Expand banks to 20, random 10.

**Independent Test**: Start a stage, verify 10 questions are presented. Replay, verify a different random set of 10 is chosen.

### Implementation for User Story 3

- [ ] T012 [P] [US3] Update `src/data/tenses/present-simple.json`: Add new items so `conjugation` reaches 20 items.
- [ ] T013 [P] [US3] Update `src/data/tenses/present-simple.json`: Add new items so `errorHunting` reaches 20 items.
- [ ] T014 [P] [US3] Update `src/data/tenses/present-simple.json`: Add new items so `sentenceBuilding` reaches 20 items.
- [ ] T015 [P] [US3] Update `src/data/tenses/present-simple.json`: Add new items so `devOpsChallenge` reaches 20 items.
- [ ] T016 [US3] Update `src/hooks/useSessionQuestions.ts` to ensure it properly randomizes exactly `count` items (currently 10) on every new session initialization and handles storage reset logic for replays.
- [ ] T017 [US3] Update `ConjugationStage.tsx`, `ErrorHunterStage.tsx`, `SentenceBuilderStage.tsx`, and `DevOpsChallengeStage.tsx` to call `useSessionQuestions` with `count: 10`.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: User Story 4 - Persisted History Across Sessions (Priority: P4)

**Goal**: Save detailed answer history so users can review mistakes across browser sessions.

**Independent Test**: Complete a stage, reload browser, go to Completion Dashboard, verify detailed review data is accessible.

### Implementation for User Story 4

- [ ] T018 [US4] Update `CompletionDashboard.tsx` in `src/components/tenses/` to read `attemptHistory` from `StageProgress`.
- [ ] T019 [US4] Add a "Xem chi tiết" (View Details) button for each completed stage in the `CompletionDashboard`.
- [ ] T020 [US4] Wire the "Xem chi tiết" button in `CompletionDashboard` to open `HistoryReviewUI.tsx` with the persisted `attemptHistory` for that stage.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T021 [P] Run `npm run lint` and `npx tsc --noEmit` to ensure no regressions in typing or styling.
- [ ] T022 Update E2E Playwright tests (if applicable) for the new Stage Result Summary navigation flow.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: MUST complete first (T001-T002).
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2).
- **User Story 2 (P2)**: Depends on US1 (needs the StageResultUI to host the Review UI).
- **User Story 3 (P3)**: Can be executed in parallel with US1/US2. Modifies JSON and session hooks.
- **User Story 4 (P4)**: Depends on US2 (needs the HistoryReviewUI component).

### Parallel Opportunities

- Foundational tasks T001 and T002 can be implemented sequentially or simultaneously by one agent.
- JSON data updates (T012-T015) in US3 can be done fully in parallel with any other UI task.
- Stage component updates (T005-T008) in US1 can run in parallel.
