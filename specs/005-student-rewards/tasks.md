---
description: "Task list for feature implementation: Student Rewards & Leveling"
---

# Tasks: Student Rewards & Leveling

**Input**: Design documents from `specs/005-student-rewards/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create level system configuration mapping total stars to levels in `src/lib/levels.ts`
- [x] T002 [P] Create unit tests for level calculations in `tests/unit/lib/levels.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement `getStudentProgress` Server Action in `src/app/actions/student-progress.ts`
- [x] T004 [P] Create unit tests for server action in `tests/unit/actions/student-progress.test.ts`
- [x] T005 Implement base `StudentSessionContext` provider in `src/contexts/StudentSessionContext.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Hiển thị thẻ tiến trình (Profile Badge) (Priority: P1) 🎯 MVP

**Goal**: Hiển thị thẻ tiến trình (tên, tổng số sao, huy hiệu) trên thanh điều hướng cho học sinh khi có phiên hoạt động.

**Independent Test**: Học sinh đăng nhập bằng mã lớp và tên hợp lệ, thanh điều hướng hiển thị đúng tên, tổng số sao và huy hiệu hiện tại.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create UI component in `src/components/StudentProfileBadge.tsx`
- [ ] T007 [US1] Update `src/contexts/StudentSessionContext.tsx` to fetch initial progress using `getStudentProgress`
- [ ] T008 [US1] Integrate `StudentSessionProvider` and `StudentProfileBadge` into `src/app/(games)/layout.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Tích lũy sao và lên cấp (Priority: P1)

**Goal**: Cộng sao khi hoàn thành game, xử lý lên cấp và hiển thị hiệu ứng chúc mừng ngay sau màn hình kết thúc game.

**Independent Test**: Hoàn thành game, tổng sao vượt ngưỡng cấp độ tiếp theo, xác nhận màn hình chúc mừng "Lên cấp" xuất hiện kèm huy hiệu mới.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Update `src/app/api/track/route.ts` to support fixed default scores for non-scoring games
- [ ] T010 [P] [US2] Update non-scoring game components to pass `score: 5` to the tracking API
- [ ] T011 [US2] Add level-up detection and celebration UI state in `src/contexts/StudentSessionContext.tsx`
- [ ] T012 [US2] Update game completion flow to trigger progress refresh and level-up celebration in `src/contexts/StudentSessionContext.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Đồng bộ dữ liệu xuyên thiết bị (Priority: P2)

**Goal**: Học sinh chơi trên thiết bị A, khi sang thiết bị B đăng nhập đúng tên và mã lớp sẽ thấy chính xác số sao không bị mất.

**Independent Test**: Đăng nhập bằng mã lớp và tên trên trình duyệt A, chơi game lấy 10 sao. Mở trình duyệt B (hoặc ẩn danh), đăng nhập cùng mã lớp và tên, xác nhận tổng số sao hiển thị là 10.

### Implementation for User Story 3

- [ ] T013 [US3] Ensure `localStorage` hydration correctly sets up credentials and triggers progress fetch in `src/contexts/StudentSessionContext.tsx`
- [ ] T014 [US3] Verify cross-session fetch correctly handles absent or newly registered students in `src/contexts/StudentSessionContext.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T015 [P] Implement E2E tests for gamification flow in `tests/e2e/student-rewards.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 context but can be tested independently
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Validates US1 fetching mechanism

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel (T002 with T001)
- Foundational tasks marked `[P]` can run in parallel (T004 with T003)
- Once Foundational phase completes, user stories can start in parallel
- Component implementation (`StudentProfileBadge.tsx`) can run parallel to Context updates

---

## Parallel Example: User Story 1 & 2

```bash
# Developer A builds the UI components:
Task: "T006 [P] [US1] Create UI component in src/components/StudentProfileBadge.tsx"

# Developer B works on the tracking logic:
Task: "T009 [P] [US2] Update src/app/api/track/route.ts to support fixed default scores for non-scoring games"
Task: "T010 [P] [US2] Update non-scoring game components to pass score: 5 to the tracking API"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE**: Test User Stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
