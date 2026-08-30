# Implementation Tasks: Parts of Speech Hub

## Phase 1: Workspace & Setup (Shared Infrastructure)

**Purpose**: Project initialization, workspace isolation, and basic structure

- [ ] T001 Ask the user to confirm creating a new git worktree for workspace isolation, defaulting to creating a new one. (Execute worktree creation upon confirmation).
- [ ] T002 [P] Create project structure per implementation plan (directories in `src/app/parts-of-speech`, `src/components/parts-of-speech`, `src/data/parts-of-speech`).
- [ ] T003 Execute dedicated subagent for Phase 1 review and bug hunt.
- [ ] T004 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure, types, and mock data that MUST be complete before ANY user story can be implemented

**🚨 CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create `src/types/parts-of-speech.ts` to define models: `PartsOfSpeechMetadata`, `WordFamilyItem`, `FillInBlankItem`, `ErrorHuntingItem`, and progress tracking types.
- [ ] T006 [P] Create local storage utility for progress tracking in `src/lib/parts-of-speech-storage.ts` (TDD: Write unit test in `tests/unit/lib/parts-of-speech-storage.test.ts` first).
- [ ] T007 [P] Create initial JSON data files `src/data/parts-of-speech/index.json` and `src/data/parts-of-speech/noun.json` with mock data for all 3 stages.
- [ ] T008 Execute dedicated subagent for Phase 2 review and bug hunt.
- [ ] T009 Commit Phase 2 changes with a descriptive conventional commit message.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Navigate Parts of Speech Hub (Priority: P1) ⭐ MVP

**Goal**: As a working adult/student, I want to see a Hub page listing all Parts of Speech lessons so that I can choose which word type to practice.

**Independent Test**: Can be fully tested by verifying the Hub page renders the lessons and allows navigation to a specific lesson, even if the lesson itself is empty.

### Tests for User Story 1 (TDD REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [US1] Write E2E test for Hub navigation in `tests/e2e/parts-of-speech-hub.spec.ts` (test `/parts-of-speech` and clicking a lesson card).

### Implementation for User Story 1

- [ ] T011 [US1] Implement Hub Page layout in `src/app/parts-of-speech/page.tsx` and `src/components/parts-of-speech/PartsOfSpeechHubMap.tsx` using `shadcn/ui` components.
- [ ] T012 [US1] Execute dedicated subagent for Phase 3 review and bug hunt (verify E2E tests pass).
- [ ] T013 [US1] Commit Phase 3 changes.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Practice Word Families (Priority: P1)

**Goal**: As a learner, I want to practice identifying word families using drag-and-drop mechanics.

**Independent Test**: Can be fully tested by implementing the "Word Family" stage in isolation and verifying drag-and-drop interactions work correctly.

### Tests for User Story 2 (TDD REQUIRED)

- [ ] T014 [US2] Write unit tests for `WordFamilyStage` component in `tests/unit/components/parts-of-speech/WordFamilyStage.test.tsx` (mocking dnd-kit interactions).

### Implementation for User Story 2

- [ ] T015 [US2] Implement `WordFamilyStage.tsx` in `src/components/parts-of-speech/stages/` using `@dnd-kit/core` and `@dnd-kit/sortable` (strict requirement).
- [ ] T016 [US2] Implement `PartsOfSpeechLessonContainer.tsx` in `src/components/parts-of-speech/` to host and route between stages.
- [ ] T017 [US2] Implement Lesson page `src/app/parts-of-speech/[slug]/page.tsx` integrating the container and mock data.
- [ ] T018 [US2] Execute dedicated subagent for Phase 4 review and bug hunt.
- [ ] T019 [US2] Commit Phase 4 changes.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Practice Fill-in Blanks in Context (Priority: P2)

**Goal**: As a learner, I want to practice choosing the correct word form to fill in the blanks in workplace sentences/emails.

**Independent Test**: Can be fully tested by implementing the "Fill-in Blank" stage independently and verifying the multiple-choice logic works.

### Tests for User Story 3 (TDD REQUIRED)

- [ ] T020 [US3] Write unit tests for `FillInBlankStage` component in `tests/unit/components/parts-of-speech/FillInBlankStage.test.tsx`.

### Implementation for User Story 3

- [ ] T021 [US3] Implement `FillInBlankStage.tsx` in `src/components/parts-of-speech/stages/` applying the context data and option selection logic.
- [ ] T022 [US3] Integrate `FillInBlankStage.tsx` into `PartsOfSpeechLessonContainer.tsx`.
- [ ] T023 [US3] Execute dedicated subagent for Phase 5 review and bug hunt.
- [ ] T024 [US3] Commit Phase 5 changes.

**Checkpoint**: All user stories up to US3 should now be independently functional.

---

## Phase 6: User Story 4 - Error Hunting (Priority: P2)

**Goal**: As a learner, I want to find and correct words that are used in the wrong form in a sentence.

**Independent Test**: Can be fully tested by implementing the "Error Hunting" stage and selecting the wrong token to reveal correction options.

### Tests for User Story 4 (TDD REQUIRED)

- [ ] T025 [US4] Write unit tests for `ErrorHuntingStage` component in `tests/unit/components/parts-of-speech/ErrorHuntingStage.test.tsx`.

### Implementation for User Story 4

- [ ] T026 [US4] Implement `ErrorHuntingStage.tsx` in `src/components/parts-of-speech/stages/` (clickable tokens and options).
- [ ] T027 [US4] Integrate `ErrorHuntingStage.tsx` into `PartsOfSpeechLessonContainer.tsx`.
- [ ] T028 [US4] Execute dedicated subagent for Phase 6 review and bug hunt.
- [ ] T029 [US4] Commit Phase 6 changes.

---

## Phase 7: Final Feature-Level Review

**Purpose**: Comprehensive, holistic review across the entire implemented feature before final delivery.

- [ ] T030 Spawn a dedicated subagent to conduct a comprehensive bug hunt and integration review across the entire implemented feature.
- [ ] T031 Iterate: If bugs are found, fix them and repeat the subagent review until zero bugs remain.
- [ ] T032 Validate the feature using `specs/017-parts-of-speech-hub/quickstart.md` scenarios manually or via test scripts.
- [ ] T033 Make a final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - must start first.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - Must be executed sequentially (US1 -> US2 -> US3 -> US4) because US2 implements the container `PartsOfSpeechLessonContainer.tsx` that US3 and US4 integrate into, though the stage components themselves could technically be developed in parallel.
- **Final Review (Phase 7)**: Depends on all user stories being complete.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD).
- Core implementation before integration.
- Subagent review must pass before moving to the next story.
- Phase must be committed before proceeding.

### Parallel Opportunities

- Types and JSON mock data creation in Phase 2 can run in parallel.
- Stage components (`WordFamilyStage`, `FillInBlankStage`, `ErrorHuntingStage`) could theoretically be developed in parallel by different agents before integration into the container, but standard sequential flow is recommended for single-agent execution.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
