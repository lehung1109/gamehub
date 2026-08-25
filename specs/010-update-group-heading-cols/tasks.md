# Tasks: Update Group Heading Columns

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create a new git worktree for workspace isolation (ask user to confirm creation, default to yes).
- [X] T002 Spawn a dedicated subagent to execute Phase 1 tasks.
- [X] T003 Execute iterative review & bug hunt subagent loop for Phase 1.
- [X] T004 Commit Phase 1 changes with a descriptive conventional commit message.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**🚨 CRITICAL**: No user story work can begin until this phase is complete

*(No foundational prerequisites identified for this specific UI fix)*

- [X] T005 Spawn a dedicated subagent to execute Phase 2 tasks.
- [X] T006 Execute iterative review & bug hunt subagent loop for Phase 2.
- [X] T007 Commit Phase 2 changes with a descriptive conventional commit message.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Desktop Layout Optimization (Priority: P1) 🚀 MVP

**Goal**: Update the `group-heading-present` component to display exactly 4 columns on desktop viewports (`lg` and above).

**Independent Test**: Can be fully tested by viewing the "group-heading-present" component on a desktop viewport and verifying it uses a 4-column layout, and scales down correctly on smaller screens.

- [X] T008 Spawn a dedicated subagent to execute Phase 3 tasks.

### Tests for User Story 1 (OPTIONAL - only if tests requested) 🧪

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Write an E2E test or component test in Playwright/Vitest to verify desktop 4-column layout.
  - *Action*: In the test suite for `TenseHubMap` (e.g. `tests/e2e/tenses.spec.ts` or `src/components/tenses/TenseHubMap.test.tsx`), add a test case that checks for the presence of max 4 columns on large viewports.
  - *Verification*: Run the test using `npm run test:e2e` or `npm run test:run` and verify it fails (Red).

### Implementation for User Story 1

- [X] T010 [US1] Update `src/components/tenses/TenseHubMap.tsx` grid layout classes.
  - *Action*: In `src/components/tenses/TenseHubMap.tsx`, locate the `div` element rendering the grid of tense cards.
  - *Code*: Change the `className` string containing the grid responsive column configuration by removing `xl:grid-cols-5` and `2xl:grid-cols-6`. The class list should look like `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6` (or preserve any other existing classes, modifying only the column counts).
  - *Verification*: Run the tests again and ensure they pass (Green). Run `npm run build` to verify no build errors.

- [X] T011 Execute iterative review & bug hunt subagent loop for Phase 3.
- [X] T012 Commit Phase 3 changes with a descriptive conventional commit message.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Final Feature-Level Review

**Purpose**: Holistic, feature-level review encompassing all previous phases to iteratively find/fix bugs.

- [X] T013 Spawn a dedicated subagent to conduct a comprehensive bug hunt and integration review across the entire implemented feature.
- [X] T014 Fix any bugs found and repeat review subagent execution until zero bugs remain.
- [X] T015 Final comprehensive commit to finalize the feature implementation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Final Feature-Level Review (Phase 4)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- None for this specific feature since it involves a single file change.

---

## Parallel Example: User Story 1

```bash
# Launch test task for User Story 1:
Task: "Write an E2E test or component test in Playwright/Vitest to verify desktop 4-column layout"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: Final Feature-Level Review
5. **STOP and VALIDATE**: Test User Story 1 independently
6. Deploy/demo if ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each phase review confirms zero bugs
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
