---
description: "Task list template for feature implementation"
---

# Tasks: Student Progress Tracking

**Input**: Design documents from `/specs/004-student-progress-tracking/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are REQUIRED as per the project constitution (Test-First, Unit & E2E tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Supabase migration SQL file for new tables (classrooms, students, game_sessions, session_details) and RLS policies
- [x] T002 [P] Update `src/types/database.ts` with new Supabase types based on the data model
- [x] T003 [P] Create API route boilerplate for tracking at `src/app/api/track/route.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup `src/lib/supabase/` server and client utilities if not already present
- [x] T005 Create database wrapper functions for class and student queries in `src/lib/supabase/queries.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Giáo viên tạo và quản lý lớp học (Priority: P1) 🎯 MVP

**Goal**: Giáo viên đăng nhập vào admin, tạo một lớp học mới, xem danh sách, và vô hiệu hóa lớp.

**Independent Test**: Có thể kiểm tra hoàn chỉnh bằng cách đăng nhập admin, tạo lớp, xem mã lớp, đổi tên lớp, và vô hiệu hóa lớp.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] E2E test for teacher creating/managing class in `tests/e2e/class-tracking.spec.ts`

### Implementation for User Story 1

- [x] T007 [P] [US1] Create create class form component in `src/components/class/CreateClassForm.tsx`
- [x] T008 [P] [US1] Create class list component in `src/components/class/ClassList.tsx`
- [x] T009 [US1] Implement teacher dashboard classes page in `src/app/admin/dashboard/classes/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Học sinh nhập mã lớp và tên trước khi chơi (Priority: P2)

**Goal**: Hiển thị popup nhập mã lớp + tên học sinh khi mở trang game lần đầu.

**Independent Test**: Mở trang game, xác nhận popup hiện lên, nhập mã hợp lệ, game bắt đầu. Chơi game khác không hỏi lại.

### Tests for User Story 2

- [x] T010 [P] [US2] Unit test for `use-student-session` hook in `tests/unit/use-student-session.test.ts`
- [x] T011 [P] [US2] E2E test for student join flow in `tests/e2e/class-tracking.spec.ts`

### Implementation for User Story 2

- [x] T012 [P] [US2] Implement `use-student-session` hook in `src/hooks/use-student-session.ts` to manage sessionStorage
- [x] T013 [P] [US2] Create Student Popup component in `src/components/student/StudentJoinPopup.tsx`
- [x] T014 [US2] Integrate StudentJoinPopup into main game layout/wrapper to ensure it triggers before gameplay

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Ghi nhận kết quả chi tiết từng câu hỏi (Priority: P3)

**Goal**: Ghi nhận kết quả chi tiết từng câu khi học sinh hoàn thành phiên chơi.

**Independent Test**: Học sinh (đã có session) chơi xong game, kiểm tra database có session và chi tiết.

### Tests for User Story 3

- [x] T015 [P] [US3] Unit test for `use-game-tracking` hook in `tests/unit/use-game-tracking.test.ts`
- [x] T016 [P] [US3] Contract test for `/api/track` in `tests/unit/tracking-api.test.ts`

### Implementation for User Story 3

- [x] T017 [P] [US3] Implement secure POST handler in `src/app/api/track/route.ts` bypassing RLS for unauthenticated students
- [x] T018 [P] [US3] Implement `use-game-tracking` hook in `src/hooks/use-game-tracking.ts`
- [x] T019 [US3] Integrate tracking hook into game components (Listening, Spelling, Flashcard, etc.) to record results silently

**Checkpoint**: All core data entry flows are fully functional

---

## Phase 6: User Story 4 - Dashboard tổng quan lớp cho giáo viên (Priority: P4)

**Goal**: Dashboard thống kê: tổng học sinh, tổng lượt chơi, điểm trung bình theo game, có bộ lọc thời gian.

**Independent Test**: Mở dashboard lớp, xác nhận hiển thị đúng số liệu tổng hợp.

### Tests for User Story 4

- [x] T020 [P] [US4] E2E test for dashboard overview in `tests/e2e/class-tracking.spec.ts`

### Implementation for User Story 4

- [x] T021 [P] [US4] Create stats and overview charts components in `src/components/dashboard/ClassOverview.tsx`
- [x] T022 [US4] Implement class dashboard page in `src/app/admin/dashboard/classes/[classId]/page.tsx`

---

## Phase 7: User Story 5 - Chi tiết tiến trình từng học sinh (Priority: P5)

**Goal**: Giáo viên bấm vào tên học sinh để xem chi tiết lịch sử phiên chơi và từ hay sai nhất.

**Independent Test**: Bấm vào tên học sinh, xem lịch sử phiên chơi và từ hay sai.

### Tests for User Story 5

- [x] T023 [P] [US5] E2E test for viewing student details in `tests/e2e/class-tracking.spec.ts`

### Implementation for User Story 5

- [x] T024 [P] [US5] Create student history components in `src/components/dashboard/StudentDetail.tsx`
- [x] T025 [US5] Implement student detail page in `src/app/admin/dashboard/classes/[classId]/students/[studentId]/page.tsx`

---

## Phase 8: User Story 6 - Phân tích từ khó toàn lớp (Priority: P6)

**Goal**: Bảng phân tích từ/câu khó nhất của cả lớp.

**Independent Test**: Mở trang phân tích từ khó, xác nhận hiển thị đúng tỷ lệ sai.

### Tests for User Story 6

- [x] T026 [P] [US6] Unit test for difficult words calculation logic in `tests/unit/analytics.test.ts`

### Implementation for User Story 6

- [x] T027 [P] [US6] Create Difficult Words analysis component in `src/components/dashboard/DifficultWordsAnalysis.tsx`
- [x] T028 [US6] Integrate Difficult Words table into `src/app/(admin)/dashboard/classes/[classId]/page.tsx`

---

## Phase 9: User Story 7 - Xuất báo cáo CSV (Priority: P7)

**Goal**: Tải xuống file CSV chứa kết quả chi tiết của lớp.

**Independent Test**: Nhấn "Xuất báo cáo", kiểm tra file tải về hiển thị đúng UTF-8 trong Excel.

### Tests for User Story 7

- [x] T029 [P] [US7] Unit test for CSV generation in `tests/unit/export-csv.test.ts`

### Implementation for User Story 7

- [x] T030 [P] [US7] Implement `/api/export-csv` API route for CSV export in `src/app/api/export-csv/route.ts`
- [x] T031 [US7] Add "Export Report" button and trigger in `src/app/(admin)/dashboard/classes/[classId]/page.tsx`

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T032 [P] Run `specs/004-student-progress-tracking/quickstart.md` validation scenarios end-to-end
- [x] T033 Code cleanup, formatting, and check type validations with `npx tsc --noEmit`
- [x] T034 Verify RLS policies are strictly enforced for teachers and completely bypassable ONLY at `/api/track`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P7)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Depends on US2 (Needs `sessionStorage` mechanism to tie records to a student session)
- **User Story 4 (P4)**: Depends on US1 (Classes) and US3 (Data presence)
- **User Story 5 (P5)**: Depends on US4 (needs student list)
- **User Story 6 (P6)**: Depends on US4 (needs aggregate view context)
- **User Story 7 (P7)**: Depends on US4 (needs class dashboard context)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (per Constitution)
- Models/Hooks before UI components
- UI components before Pages/Routes
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch E2E test setup
Task: T006 [P] [US1] E2E test for teacher creating/managing class in tests/e2e/class-tracking.spec.ts

# Concurrently develop UI components
Task: T007 [P] [US1] Create create class form component in src/components/class/CreateClassForm.tsx
Task: T008 [P] [US1] Create class list component in src/components/class/ClassList.tsx
```

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 → Test independently → Student entry flow ready
4. Add User Story 3 → Test independently → Data collection pipeline active
5. Add User Stories 4, 5, 6 → Test independently → Dashboard insights ready
6. Add User Story 7 → CSV export ready
7. Polish & Validate via quickstart.md

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
