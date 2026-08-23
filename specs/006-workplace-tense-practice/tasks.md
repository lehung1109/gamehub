# Tasks: Workplace English Tense Practice - Present Simple

**Input**: Design documents from `specs/006-workplace-tense-practice/` (`plan.md`, `spec.md`, `data-model.md`, `research.md`, `contracts/`, `quickstart.md`)

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, type definitions, and standalone dataset preparation.

- [X] T001 Create dedicated TypeScript interfaces for 12-Tenses system in `src/types/tenses.ts`
- [X] T002 [P] Create 12-Tenses master catalog dataset in `src/data/tenses/index.json`
- [X] T003 [P] Create complete Present Simple lesson data (5 rule cards, 8 conjugation items, 6 error hunter items, 6 sentence builder items) in `src/data/tenses/present-simple.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation utilities, storage persistence, and schema integrity tests that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Implement data validation and text normalization utilities in `src/lib/tenses/validation.ts`
- [X] T005 [P] Create unit tests for validation utilities in `tests/unit/tenses/validation.test.ts`
- [X] T006 [P] Implement LocalStorage progress persistence and hydration helper in `src/lib/tenses/storage.ts`
- [X] T007 [P] Create unit tests for storage helper in `tests/unit/tenses/storage.test.ts`
- [X] T008 [P] Create schema and data integrity tests in `tests/unit/data/tenses-schema.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Khám phá Hub 12 Thì và Vào Học Thì Hiện Tại Đơn (Priority: P1) 🎯 MVP

**Goal**: Cung cấp lối vào từ trang chủ tới Hub 12 Thì (`/tenses`), hiển thị bản đồ 12 thì phân nhóm Present/Past/Future, và điều hướng mượt mà vào bài học Thì Hiện Tại Đơn (`/tenses/present-simple`).

**Independent Test**: Mở trang chủ, nhấp vào banner "Luyện Thì Tiếng Anh Cho Người Đi Làm", xác nhận trang `/tenses` hiển thị đủ 12 thì với 3 nhóm thời gian, thẻ "Thì Hiện Tại Đơn" ở trạng thái Active, và nhấp vào mở trang `/tenses/present-simple`.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create `TenseCard` component with active and coming-soon status indicators in `src/components/tenses/TenseCard.tsx`
- [ ] T010 [P] [US1] Create `TenseHubMap` component grouping tenses into Present, Past, and Future sections in `src/components/tenses/TenseHubMap.tsx`
- [ ] T011 [P] [US1] Create unit test for `TenseHubMap` and `TenseCard` rendering in `tests/unit/tenses/TenseHubMap.test.tsx`
- [ ] T012 [US1] Implement SSG Server Component for 12-Tenses Hub page in `src/app/tenses/page.tsx`
- [ ] T013 [US1] Add prominent workplace tense practice banner/card to homepage in `src/app/page.tsx`
- [ ] T014 [P] [US1] Create `LessonHeader` component with breadcrumbs, stage progress bar, and audio indicator in `src/components/tenses/LessonHeader.tsx`
- [ ] T015 [US1] Create client container `TenseLessonContainer` managing tabs and stages in `src/components/tenses/TenseLessonContainer.tsx`
- [ ] T016 [US1] Implement dynamic SSG lesson page with `generateStaticParams` in `src/app/tenses/[slug]/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Tra Cứu Quy Tắc Ngữ Pháp Nhanh & Tình Huống Công Sở (Priority: P1)

**Goal**: Cung cấp tab "Quy Tắc Cốt Lõi (Quick Rules)" hiển thị lý thuyết cô đọng: To Be, Động từ thường, Thêm s/es, Trạng từ tần suất, và Ứng dụng công sở kèm ví dụ thực tế và phát âm Web Speech API.

**Independent Test**: Truy cập tab "Quy Tắc Cốt Lõi" trong bài học Thì Hiện Tại Đơn, kiểm tra các thẻ lý thuyết hiển thị đầy đủ công thức và bản dịch tiếng Việt, nhấp nút loa để nghe phát âm câu ví dụ chuẩn xác.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Implement `QuickRulesTab` displaying formula cards, spelling rules, adverbs table, workplace tips, and Web Speech audio buttons in `src/components/tenses/QuickRulesTab.tsx`
- [ ] T018 [P] [US2] Create unit tests for `QuickRulesTab` rule rendering and audio pronunciation in `tests/unit/tenses/QuickRulesTab.test.tsx`
- [ ] T019 [US2] Integrate `QuickRulesTab` into `TenseLessonContainer` in `src/components/tenses/TenseLessonContainer.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Thử Thách 1: Chia Động Từ & Điền Email Công Sở (Priority: P1)

**Goal**: Xây dựng Chặng 1 luyện tập chia động từ trong bối cảnh email và trao đổi công việc thực tế (8 câu hỏi), hỗ trợ cả trắc nghiệm và nhập trực tiếp, kiểm tra ngay lập tức kèm giải thích ngữ pháp chi tiết.

**Independent Test**: Vào Chặng 1, làm các bài tập chia động từ trong khung email, nộp đáp án đúng/sai và xác nhận hệ thống hiển thị giải thích ngữ pháp tức thì, cập nhật điểm số và cho phép chuyển câu.

### Implementation for User Story 3

- [ ] T020 [P] [US3] Implement `ConjugationStage` (Stage 1) with email context card, multiple-choice options, direct text input, instant feedback, and grammar explanations in `src/components/tenses/stages/ConjugationStage.tsx`
- [ ] T021 [P] [US3] Create unit tests for `ConjugationStage` interaction and grading in `tests/unit/tenses/ConjugationStage.test.tsx`
- [ ] T022 [US3] Wire `ConjugationStage` into `TenseLessonContainer` practice flow in `src/components/tenses/TenseLessonContainer.tsx`

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently.

---

## Phase 6: User Story 4 - Thử Thách 2: Săn Lỗi Sai Văn Phòng (Workplace Error Hunter) (Priority: P2)

**Goal**: Xây dựng Chặng 2 rèn luyện kỹ năng proofreading với 6 câu tiếng Anh công sở có lỗi sai, cho phép người học bấm chọn từ sai và chọn phương án sửa đúng kèm giải thích nguyên nhân và tác động trong giao tiếp công việc.

**Independent Test**: Vào Chặng 2, bấm vào từ bị sai trong câu, chọn phương án sửa đúng từ menu/popover và kiểm tra hệ thống ghi nhận kết quả, đổi màu câu hoàn chỉnh và hiển thị phân tích lỗi.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Implement `ErrorHunterStage` (Stage 2) with interactive token chips, target error selection, replacement dropdown/popover, and workplace impact explanations in `src/components/tenses/stages/ErrorHunterStage.tsx`
- [ ] T024 [P] [US4] Create unit tests for `ErrorHunterStage` proofreading interactions in `tests/unit/tenses/ErrorHunterStage.test.tsx`
- [ ] T025 [US4] Wire `ErrorHunterStage` into `TenseLessonContainer` practice flow in `src/components/tenses/TenseLessonContainer.tsx`

**Checkpoint**: At this point, User Stories 1, 2, 3, and 4 should all work independently.

---

## Phase 7: User Story 5 - Thử Thách 3: Ghép Câu Lịch Trình & Giao Tiếp Công Sở (Priority: P2)

**Goal**: Xây dựng Chặng 3 luyện phản xạ trật tự từ và vị trí trạng từ chỉ tần suất trong câu công sở (6 câu hỏi), kết hợp kéo thả `@dnd-kit/core` và thao tác chạm/nhấn tap-to-place trên mobile, tự động phát âm khi hoàn thành câu.

**Independent Test**: Vào Chặng 3, tương tác ghép từ bằng cả chuột và cảm ứng touch, nộp câu và xác nhận trật tự từ được đánh giá chính xác kèm phát âm mẫu và mẹo ngữ pháp.

### Implementation for User Story 5

- [ ] T026 [P] [US5] Implement `SentenceBuilderStage` (Stage 3) using `@dnd-kit/core` with `PointerSensor` & `KeyboardSensor`, tap-to-place token bank, audio pronunciation on success, and grammar tips in `src/components/tenses/stages/SentenceBuilderStage.tsx`
- [ ] T027 [P] [US5] Create unit tests for `SentenceBuilderStage` dnd and tap interactions in `tests/unit/tenses/SentenceBuilderStage.test.tsx`
- [ ] T028 [US5] Wire `SentenceBuilderStage` into `TenseLessonContainer` practice flow in `src/components/tenses/TenseLessonContainer.tsx`

**Checkpoint**: All 3 challenge stages should now be independently functional.

---

## Phase 8: User Story 6 - Xem Tổng Kết Bài Học & Lưu Tiến Độ Tự Động (Priority: P3)

**Goal**: Hiển thị màn hình Tổng Kết (Completion Dashboard) sau khi hoàn thành 3 chặng với tỉ lệ chính xác, bảng điểm từng chặng, hỗ trợ luyện tập lại và tự động lưu tiến độ vào `localStorage` để cập nhật huy hiệu trên Hub 12 Thì.

**Independent Test**: Hoàn thành 3 chặng bài học, kiểm tra màn hình tổng kết hiển thị điểm chính xác, quay lại Hub 12 Thì và xác nhận thẻ Thì Hiện Tại Đơn hiển thị badge "Đã hoàn thành", tải lại trang (F5) để kiểm tra tiến độ vẫn được lưu.

### Implementation for User Story 6

- [ ] T029 [P] [US6] Implement `CompletionDashboard` showing stage-by-stage scores, accuracy percentage, stage replay buttons, and return-to-hub navigation in `src/components/tenses/CompletionDashboard.tsx`
- [ ] T030 [US6] Integrate `CompletionDashboard` and local progress saving via `storage.ts` in `src/components/tenses/TenseLessonContainer.tsx`
- [ ] T031 [US6] Connect `TenseHubMap` progress badges with dynamic LocalStorage hydration in `src/components/tenses/TenseHubMap.tsx`

**Checkpoint**: Complete learning loop is fully operational and persisted across browser sessions.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end test coverage, responsive design verification across viewports (mobile 360px+, tablet, desktop), and code quality checks.

- [ ] T032 [P] Create end-to-end integration test suite covering the full user flow in `tests/e2e/tenses-flow.spec.ts`
- [ ] T033 Verify responsive layouts (mobile 360px+, tablet, desktop) and touch targets across all tense components
- [ ] T034 Run TypeScript typecheck, ESLint, and test suite to ensure zero regressions across the codebase

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion (`src/types/tenses.ts`, `src/data/tenses/`) - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel or sequentially in priority order (P1 → P2 → P3).
- **Polish (Phase 9)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 1 & 2. Enables Hub navigation and base lesson container.
- **User Story 2 (P1)**: Depends on Phase 1 & 2 + US1 container (`TenseLessonContainer`).
- **User Story 3 (P1)**: Depends on Phase 1 & 2 + US1 container (`TenseLessonContainer`).
- **User Story 4 (P2)**: Depends on Phase 1 & 2 + US1 container (`TenseLessonContainer`).
- **User Story 5 (P2)**: Depends on Phase 1 & 2 + US1 container (`TenseLessonContainer`).
- **User Story 6 (P3)**: Depends on Stages 1-3 implementation (US3, US4, US5) + US1 Hub (`TenseHubMap`).

### Within Each User Story

- Types and data contracts defined before component implementation.
- Unit tests created alongside or immediately after component implementation.
- Client stage components wired into `TenseLessonContainer`.
- Story complete and validated before moving to next priority.

### Parallel Opportunities

- In **Phase 1**: `T002` (catalog) and `T003` (lesson data) can run in parallel.
- In **Phase 2**: `T004` (validation), `T006` (storage), and `T008` (schema tests) can run in parallel.
- In **Phase 3**: `T009` (TenseCard), `T010` (TenseHubMap), `T011` (unit test), `T014` (LessonHeader) can run in parallel.
- In **Phase 4-7**: Each stage component (`QuickRulesTab`, `ConjugationStage`, `ErrorHunterStage`, `SentenceBuilderStage`) and its corresponding unit test can be developed in parallel by separate developers once the foundation is set.

---

## Parallel Execution Examples

### Parallel Example: User Story 1 (Hub & Layout)
```bash
# Launch components and unit tests for US1 in parallel:
Task: "Create TenseCard component with active and coming-soon status indicators in src/components/tenses/TenseCard.tsx" (T009)
Task: "Create TenseHubMap component grouping tenses into Present, Past, and Future sections in src/components/tenses/TenseHubMap.tsx" (T010)
Task: "Create LessonHeader component with breadcrumbs, stage progress bar, and audio indicator in src/components/tenses/LessonHeader.tsx" (T014)
```

### Parallel Example: User Story 3, 4, 5 (Practice Stages)
```bash
# Once TenseLessonContainer is ready, all 3 stages can be built simultaneously:
Task: "Implement ConjugationStage (Stage 1) in src/components/tenses/stages/ConjugationStage.tsx" (T020)
Task: "Implement ErrorHunterStage (Stage 2) in src/components/tenses/stages/ErrorHunterStage.tsx" (T023)
Task: "Implement SentenceBuilderStage (Stage 3) in src/components/tenses/stages/SentenceBuilderStage.tsx" (T026)
```

---

## Implementation Strategy

### MVP First (User Story 1, 2, 3 Only)

1. Complete **Phase 1: Setup** (Types & Data JSON).
2. Complete **Phase 2: Foundational** (Validation & Storage helpers).
3. Complete **Phase 3: User Story 1** (Hub Map & Lesson Page container).
4. Complete **Phase 4: User Story 2** (Quick Rules tab) & **Phase 5: User Story 3** (Stage 1 Conjugation).
5. **STOP and VALIDATE**: Verify end-to-end learning flow for Stage 1.

### Incremental Delivery

1. **Sprint 1 (Foundation & MVP)**: Setup + Foundational + Hub (`/tenses`) + Present Simple Shell + Quick Rules + Stage 1 (Conjugation).
2. **Sprint 2 (Enhanced Practice)**: Add Stage 2 (Error Hunter) + Stage 3 (Sentence Builder).
3. **Sprint 3 (Gamification & Polish)**: Add Completion Dashboard + LocalStorage progress reflection on Hub + E2E Playwright tests.

---

## Notes

- `[P]` tasks = different files, no dependencies.
- `[Story]` label (`[US1]` - `[US6]`) maps task to specific user story for full traceability.
- All tense data is strictly isolated in `src/data/tenses/` and `src/types/tenses.ts` to ensure zero coupling with legacy kids games.
- All UI components adhere to Tailwind CSS 4, shadcn/ui design tokens, and minimum 44px touch targets.
