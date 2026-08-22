# Tasks: Preview Game Configuration

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Update PreviewPayload and UseGameConfigResult types in src/types/config.ts
- [X] T002 [P] Create E2E test file skeleton tests/e2e/preview-config.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Write unit tests for preview.ts utilities in src/lib/preview.test.ts
- [ ] T004 Implement encodePreviewSettings, decodePreviewSettings, and buildPreviewUrl in src/lib/preview.ts
- [ ] T005 Write unit tests for useGameConfig preview detection in src/hooks/useGameConfig.test.ts
- [ ] T006 Update useGameConfig in src/hooks/useGameConfig.ts to detect preview param and decode settings

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Preview New Config Before Saving (Priority: P1) 🚀 MVP

**Goal**: Enable admins to test-play new game configurations directly from the creation form.

**Independent Test**: Navigate to create config form, fill out settings, click "Chơi thử", verify game opens in new tab with correct settings.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Write E2E test for create flow preview in tests/e2e/preview-config.spec.ts
- [ ] T008 [P] [US1] Write unit tests for PreviewButton rendering and click handling in src/components/config/PreviewButton.test.tsx

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create PreviewButton component in src/components/config/PreviewButton.tsx (using validateGameSettings and buildPreviewUrl)
- [ ] T010 [US1] Integrate PreviewButton into src/components/config/ConfigCreateForm.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Preview Edited Config Before Saving Changes (Priority: P1)

**Goal**: Enable admins to test-play changes to an existing configuration before overwriting the saved version.

**Independent Test**: Edit an existing config, modify settings, click "Chơi thử", verify preview shows new unsaved changes.

### Tests for User Story 2

- [ ] T011 [P] [US2] Write E2E test for edit flow preview in tests/e2e/preview-config.spec.ts

### Implementation for User Story 2

- [ ] T012 [US2] Integrate PreviewButton into src/components/config/ConfigEditForm.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Settings Validation Before Preview (Priority: P2)

**Goal**: Ensure admins cannot launch a preview with broken/invalid settings.

**Independent Test**: Enter invalid settings, click "Chơi thử", verify validation error appears and no tab opens.

### Tests for User Story 4

- [ ] T013 [P] [US4] Write unit tests for validation behavior in src/components/config/PreviewButton.test.tsx
- [ ] T014 [P] [US4] Update E2E tests in tests/e2e/preview-config.spec.ts to cover validation failures blocking preview

### Implementation for User Story 4

- [ ] T015 [US4] Update PreviewButton.tsx to handle validation failures and display errors (if not already handled in US1)

**Checkpoint**: Preview creation gracefully handles invalid settings

---

## Phase 6: User Story 3 - Visual Distinction in Preview Mode (Priority: P2)

**Goal**: Clearly indicate to admins when they are viewing a temporary, unsaved preview.

**Independent Test**: Open game in preview mode and verify the amber banner is displayed instead of the normal indigo config banner.

### Tests for User Story 3

- [ ] T016 [P] [US3] Write component test for PreviewBanner in src/components/game/PreviewBanner.test.tsx
- [ ] T017 [P] [US3] Add E2E assertions for banner rendering in tests/e2e/preview-config.spec.ts

### Implementation for User Story 3

- [ ] T018 [P] [US3] Create PreviewBanner component in src/components/game/PreviewBanner.tsx using shadcn/ui Badge
- [ ] T019 [US3] Update game pages (src/app/games/) to render PreviewBanner conditionally when isPreview === true

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T020 Run full E2E test suite across all 6 games to ensure universal support
- [ ] T021 Run quickstart.md validation scenarios manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P1 -> P2 -> P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (US1)**: Can start after Foundational
- **User Story 2 (US2)**: Can start after Foundational; assumes PreviewButton is ready
- **User Story 4 (US4)**: Depends on PreviewButton from US1
- **User Story 3 (US3)**: Can start after Foundational; independent of other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Component creation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Foundational utilities and hook tests can run in parallel
- After Foundation, PreviewButton creation (US1) and PreviewBanner creation (US3) can happen in parallel
- E2E test authoring can happen in parallel with component logic tests

---

## Parallel Example: User Story 1

`ash
# Launch tests for User Story 1 together:
Task: "Write E2E test for create flow preview in tests/e2e/preview-config.spec.ts"
Task: "Write unit tests for PreviewButton rendering and click handling in src/components/config/PreviewButton.test.tsx"
`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Deploy/Demo
4. Add User Story 4 -> Deploy/Demo
5. Add User Story 3 -> Deploy/Demo