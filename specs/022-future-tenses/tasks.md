---
description: "Task list for Future Tenses implementation"
---

# Tasks: Future Tenses

**Input**: Design documents from `/specs/022-future-tenses/`

**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, strictly adhering to GameHub Constitution Principles V (Test-First) and VI (Task Generation Standards).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths are included in descriptions.

---

## Phase 1: Setup (Workspace & Infrastructure)

**Purpose**: Create an isolated worktree for this feature.
*Requirement: As per Constitution Principle VI.1, a new git worktree must be created before starting implementation.*

- [x] T001 Ask the user to confirm the creation of a new git worktree for this feature. Default to creating a new one.
- [x] T002 Create and switch to the new git worktree for the feature branch (if confirmed).
- [x] T003 Execute the iterative review & bug hunt subagent loop for Phase 1.
- [x] T004 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: User Story 1 - Kích hoạt luồng học các thì tương lai (Priority: P1)

**Goal**: Hiển thị 4 thì tương lai là "active" thay vì "coming_soon" trên giao diện trang chủ tenses.
*Requirement: As per Constitution Principle VI.2, this phase MUST be executed within a dedicated subagent session.*

**Independent Test**: Mở giao diện `/tenses` và xem thẻ bài học có bấm được không.

### Tests for User Story 1 (TDD)
*Requirement: As per Constitution Principle V & VI.3, write failing tests first.*
- [x] T005 [US1] Update E2E test in `tests/e2e/tenses-flow.spec.ts` to navigate to `/tenses` and assert that the 4 future tense cards are visible and not locked. Run `npm run test:e2e` to ensure it fails.

### Implementation for User Story 1
- [x] T006 [US1] Edit `src/data/tenses/index.json` to change the `status` of "future-simple", "future-continuous", "future-perfect", and "future-perfect-continuous" from `"coming_soon"` to `"active"`.
- [x] T007 [US1] Run E2E test `npm run test:e2e` to verify the UI changes now pass the test.
- [x] T008 [US1] Execute the iterative review & bug hunt subagent loop (including eslint verification) for Phase 2.
- [x] T009 [US1] Commit Phase 2 changes with a descriptive conventional commit message.

---

## Phase 3: User Story 2 - Học lý thuyết và làm bài tập thì Tương Lai (Priority: P2)

**Goal**: Cung cấp nội dung lý thuyết và bài tập hoàn chỉnh cho 4 thì tương lai.
*Requirement: As per Constitution Principle VI.2, this phase MUST be executed within a dedicated subagent session.*

**Independent Test**: Click vào từng thì tương lai và hoàn thành toàn bộ bài tập mà không bị lỗi thiếu data.

### Tests for User Story 2 (TDD)
- [x] T010 [US2] Update E2E test in `tests/e2e/tenses-flow.spec.ts` to click on "Future Simple", verify navigation to `/tenses/future-simple`, and check that the "Quy tắc cốt lõi" tab is visible. Run test to ensure it fails (since page will 404/error without JSON data).

### Implementation for User Story 2
- [x] T011 [P] [US2] Create data file for Future Simple in `src/data/tenses/future-simple.json` following the schema in `specs/022-future-tenses/data-model.md`. Include metadata, quick rules, and mock workplace challenges.
- [x] T012 [P] [US2] Create data file for Future Continuous in `src/data/tenses/future-continuous.json` following the schema.
- [x] T013 [P] [US2] Create data file for Future Perfect in `src/data/tenses/future-perfect.json` following the schema.
- [x] T014 [P] [US2] Create data file for Future Perfect Continuous in `src/data/tenses/future-perfect-continuous.json` following the schema.
- [x] T015 [US2] Run `npm run dev` to manually verify data loads correctly and/or run `npm run build` to ensure Next.js static generation succeeds.
- [x] T016 [US2] Run E2E test `npm run test:e2e` to verify the page loads and passes the test.
- [x] T017 [US2] Execute the iterative review & bug hunt subagent loop (including eslint verification) for Phase 3.
- [x] T018 [US2] Commit Phase 3 changes with a descriptive conventional commit message.

---

## Phase 4: Final Feature-Level Review Phase

**Purpose**: Holistic, feature-level review encompassing all previous phases as mandated by Constitution Principle VI.6.

- [ ] T019 Spawn a final review subagent to conduct a comprehensive bug hunt and integration review across the entire implemented feature (verifying all json files load properly).
- [ ] T020 Run full quality gates: `npm run lint`, `npx tsc --noEmit`, `npm run test:run`, `npm run test:e2e`, and `npm run build`. Fix any identified issues.
- [ ] T021 Execute a final review loop if fixes were made.
- [ ] T022 Finalize the feature with a comprehensive commit encompassing all validated changes.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Must complete first.
- **Phase 2 (US1)**: Must complete after Phase 1.
- **Phase 3 (US2)**: Must complete after Phase 2 (since UI needs to be active to test clicking).
- **Phase 4 (Final Review)**: Must complete after all user stories.

## Parallel Opportunities

- Creation of the 4 JSON data files (T011, T012, T013, T014) can be done in parallel as they don't depend on each other.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: US1 (Update index.json)
3. **STOP and VALIDATE**: Verify UI is updated on `/tenses`. (Note: clicking might lead to error until US2 is done, so full MVP requires both).

### Incremental Delivery

1. Setup workspace.
2. Enable UI cards (US1).
3. Provide data files (US2) so that clicking the cards works perfectly.
4. Final review.
