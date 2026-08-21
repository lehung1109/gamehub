---
description: "Task list template for feature implementation"
---

# Tasks: Quản lý Tài khoản & Cấu hình Game

**Input**: Design documents from `/specs/002-game-config-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included as required by the "Test-First (NON-NEGOTIABLE)" principle in the GameHub Constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Supabase clients in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`
- [x] T002 Generate database types in `src/types/database.ts` using `npm run gen:types`
- [x] T003 Define config interfaces in `src/types/config.ts` (GameSettings, Config entities)
- [x] T004 Create game parameter schemas in `src/lib/game-config-schema.ts`
- [x] T005 [P] Add required dependencies (`@supabase/supabase-js`, `@supabase/ssr`, `nanoid`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Setup Supabase SQL schema, RLS policies, and triggers for `profiles` and `game_configs` (via remote Supabase SQL Editor, no local supabase)
  - Generate `src/lib/supabase/schema.sql` (Tables, RLS, indexes, and Triggers for `auth.users` -> `profiles`).
  - Copy and execute manually in **Remote Supabase Dashboard SQL Editor**.
  - Verify execution before generating types in T002.
- [x] T007 Implement middleware for auth session refresh and route protection in `src/middleware.ts`
- [x] T008 Configure environment variables for Supabase in `.env.local`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin đăng nhập và quản lý tài khoản (Priority: P1) 🎯 MVP

**Goal**: Admin có thể đăng nhập, xem dashboard, và quản lý tài khoản.

**Independent Test**: Truy cập trang đăng nhập, đăng nhập thành công vào dashboard và thay đổi được mật khẩu.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Unit test for auth actions in `tests/unit/actions/auth.test.ts`
- [ ] T010 [P] [US1] E2E test for admin login/logout and profile flow in `tests/e2e/admin-login.spec.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Implement server actions (`login`, `logout`, `updatePassword`) in `src/app/actions/auth.ts`
- [ ] T012 [P] [US1] Create login page UI in `src/app/login/page.tsx`
- [ ] T013 [P] [US1] Create protected admin layout in `src/app/admin/layout.tsx`
- [ ] T014 [US1] Create basic admin dashboard in `src/app/admin/dashboard/page.tsx`
- [ ] T015 [US1] Create account profile and password page in `src/app/admin/account/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Tạo và đặt tên cấu hình cho game (Priority: P1)

**Goal**: Admin có thể chọn game và tạo cấu hình với tham số tùy chỉnh.

**Independent Test**: Tạo một cấu hình mới cho game Flashcard và thấy nó xuất hiện trong danh sách.

### Tests for User Story 2 ⚠️

- [ ] T016 [P] [US2] Unit test for config creation actions in `tests/unit/actions/configs.test.ts`
- [ ] T017 [P] [US2] E2E test for config creation in `tests/e2e/config-management.spec.ts`

### Implementation for User Story 2

- [ ] T018 [US2] Implement `createConfig` action in `src/app/actions/configs.ts`
- [ ] T019 [P] [US2] Create `GameCard` component in `src/components/admin/GameCard.tsx`
- [ ] T020 [P] [US2] Create `ConfigForm` component in `src/components/admin/ConfigForm.tsx`
- [ ] T021 [US2] Update dashboard to fetch and show games with config counts in `src/app/admin/dashboard/page.tsx`
- [ ] T022 [US2] Create game-specific config list page in `src/app/admin/games/[gameId]/page.tsx`
- [ ] T023 [US2] Create "new config" page with form in `src/app/admin/configs/new/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 5 - Học sinh chơi game với cấu hình mặc định (Priority: P1)

**Goal**: Đảm bảo game vẫn hoạt động bình thường cho học sinh không qua link chia sẻ.

**Independent Test**: Truy cập các game từ trang chủ và đảm bảo chơi được đầy đủ nội dung.

### Tests for User Story 5 ⚠️

- [ ] T024 [P] [US5] E2E test verifying default behavior in all games in `tests/e2e/default-games.spec.ts`

### Implementation for User Story 5

- [ ] T025 [US5] Validate existing game logic and add guard clauses to handle undefined config in `src/app/games/*/page.tsx`

**Checkpoint**: Existing user experience is preserved.

---

## Phase 6: User Story 3 - Chỉnh sửa và xóa cấu hình (Priority: P2)

**Goal**: Admin có thể cập nhật thông tin cấu hình hoặc xóa cấu hình cũ.

**Independent Test**: Thay đổi tên cấu hình, lưu và kiểm tra lại. Xóa một cấu hình và xác nhận biến mất.

### Tests for User Story 3 ⚠️

- [ ] T026 [P] [US3] Unit test for update/delete config actions in `tests/unit/actions/configs.test.ts`
- [ ] T027 [P] [US3] Expand E2E test for edit/delete flows in `tests/e2e/config-management.spec.ts`

### Implementation for User Story 3

- [ ] T028 [US3] Implement `updateConfig` and `deleteConfig` actions in `src/app/actions/configs.ts`
- [ ] T029 [P] [US3] Create `ConfigList` component in `src/components/admin/ConfigList.tsx`
- [ ] T030 [P] [US3] Create `DeleteDialog` component in `src/components/admin/DeleteDialog.tsx`
- [ ] T031 [US3] Create edit config page in `src/app/admin/configs/[configId]/page.tsx`
- [ ] T032 [US3] Integrate `ConfigList`, edit link, and `DeleteDialog` into `src/app/admin/games/[gameId]/page.tsx`

**Checkpoint**: Config management CRUD is complete.

---

## Phase 7: User Story 4 - Chia sẻ cấu hình qua link (Priority: P2)

**Goal**: Tạo link truy cập trực tiếp cho cấu hình và học sinh có thể chơi qua link này không cần đăng nhập.

**Independent Test**: Nhấn chia sẻ, lấy link, mở ở tab ẩn danh và vào thẳng game với thiết lập đã chọn.

### Tests for User Story 4 ⚠️

- [ ] T033 [P] [US4] Unit test for slug generation in `tests/unit/lib/slug.test.ts`
- [ ] T034 [P] [US4] E2E test for share link access flow in `tests/e2e/share-link.spec.ts`

### Implementation for User Story 4

- [ ] T035 [US4] Create nanoid helper in `src/lib/slug.ts` and implement `generateShareSlug` in `src/app/actions/configs.ts`
- [ ] T036 [P] [US4] Create `ShareDialog` component in `src/components/admin/ShareDialog.tsx`
- [ ] T037 [US4] Integrate `ShareDialog` into `src/components/admin/ConfigList.tsx`
- [ ] T038 [US4] Implement share link resolver (redirect) in `src/app/play/[slug]/page.tsx`
- [ ] T039 [US4] Update all games to conditionally fetch and apply config via query param in `src/app/games/*/page.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T040 [P] Update `quickstart.md` with new test scenarios and instructions
- [ ] T041 Code cleanup, formatting, and strict type-check verification across all files
- [ ] T042 Security verification of Supabase RLS and zero-tracking constraint

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US5) can proceed first.
  - US3 and US4 depend on US2 (need configs to edit/share).
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent of other stories. Blocks no other stories.
- **User Story 2 (P1)**: Depends on Foundational.
- **User Story 5 (P1)**: Independent. Can run anytime after Foundation to ensure no regressions.
- **User Story 3 (P2)**: Depends on User Story 2 (creating configs).
- **User Story 4 (P2)**: Depends on User Story 2 (creating configs).

### Parallel Opportunities

- Setup tasks and Foundational testing tasks marked `[P]` can run concurrently.
- Tests within a user story can be written concurrently with or before implementation.
- Different user stories can be worked on in parallel once the Foundation is ready (e.g. US1 and US2).

---

## Implementation Strategy

### MVP First (User Story 1, 2, 5)

1. Complete Phase 1 & Phase 2
2. Complete Phase 3 (US1), Phase 4 (US2), and Phase 5 (US5)
3. **STOP and VALIDATE**: Ensure admin can login, create configs, and normal games still work.

### Incremental Delivery

1. Delivery 1: Foundation + Admin Login (US1) -> Verify auth.
2. Delivery 2: Config Creation (US2) + Default Fallback (US5) -> Verify configs can be made.
3. Delivery 3: Edit & Delete (US3) -> Verify config lifecycle.
4. Delivery 4: Sharing (US4) -> Full feature completion.
