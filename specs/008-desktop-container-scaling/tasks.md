# Tasks: Desktop Container Scaling

**Feature**: `008-desktop-container-scaling`  
**Input**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md) | [contracts/responsive-contract.md](./contracts/responsive-contract.md) | [research.md](./research.md) | [quickstart.md](./quickstart.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test infrastructure and shared helper setup for responsive viewport testing across Vitest and Playwright.

- [X] T001 Verify baseline test suite and Next.js / Tailwind v4 build environment in `package.json`
  - **Action**: Run `npm run test:run`, `npx tsc --noEmit`, and `npm run lint` to verify that existing unit tests, type checks, and linting pass with zero errors before introducing any changes.
  - **Verification**: Clean exit code 0 across all verification commands.

- [X] T002 [P] Create Playwright viewport helper for multi-screen responsive validation in `tests/e2e/helpers/viewport-helper.ts`
  - **Action**: Create helper utility exporting viewport constants:
    - `VIEWPORT_MOBILE = { width: 375, height: 667 }`
    - `VIEWPORT_TABLET = { width: 768, height: 1024 }`
    - `VIEWPORT_LAPTOP_LG = { width: 1024, height: 768 }`
    - `VIEWPORT_DESKTOP_XL = { width: 1280, height: 800 }`
    - `VIEWPORT_DESKTOP_2XL = { width: 1536, height: 864 }`
    - `VIEWPORT_DESKTOP_FHD = { width: 1920, height: 1080 }`
    - `VIEWPORT_ULTRAWIDE = { width: 3440, height: 1440 }`
    - Helper function `getComputedWidth(page: Page, selector: string): Promise<number>`
    - Helper function `getComputedMaxWidth(page: Page, selector: string): Promise<string>`
  - **Verification**: `npx tsc --noEmit` compiles helper without type errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update the root layout container in `src/app/layout.tsx` to unlock desktop scaling across all child pages.

**⚠️ CRITICAL**: No user story work can be completed or visually validated until this phase is complete.

- [X] T003 Update root layout container max-width tiers in `src/app/layout.tsx`
  - **Action**: Replace `max-w-5xl` in line 31 with responsive breakpoint tiers:
    ```tsx
    // Before:
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
    // After:
    <div className="flex-1 flex flex-col max-w-5xl lg:max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1800px] w-full mx-auto p-4 sm:p-6 md:p-8">
    ```
  - **Verification**: Inspect root layout JSX; ensure classes `max-w-5xl`, `lg:max-w-7xl`, `xl:max-w-[1400px]`, `2xl:max-w-[1800px]` are present.

- [X] T004 [P] Create unit test for root layout container classes in `tests/app/layout.test.tsx`
  - **Action**: Add Vitest unit test verifying `RootLayout` component renders outer container with classes `max-w-5xl`, `lg:max-w-7xl`, `xl:max-w-[1400px]`, and `2xl:max-w-[1800px]`.
  - **Verification**: Run `npm run test:run -- tests/app/layout.test.tsx` and confirm test passes.

**Checkpoint**: Root container ceiling removed; progressive width tiers active across all breakpoints.

---

## Phase 3: User Story 1 - Comfortable Reading on Large Screens (Priority: P1) 🎯 MVP

**Goal**: Expand application content width on 1440px–1920px+ viewports to utilize ≥85% horizontal space while maintaining identical layout on ≤1024px screens.

**Independent Test**: Open the application at 1920px viewport width and verify computed content width reaches 1800px (~93.75% utilization), while at 1024px it stays 1024px (FR-002, SC-001, SC-004).

### Tests for User Story 1 🧪

- [X] T005 [P] [US1] Create E2E test for root container scaling across breakpoints in `tests/e2e/container-scaling.spec.ts`
  - **Action**: Write Playwright test suite testing home page (`/`) and admin dashboard (`/admin/dashboard` with mock auth):
    1. At 1024px viewport width: computed container width is `<= 1024px`
    2. At 1280px viewport width: computed container width is `<= 1280px`
    3. At 1440px viewport width: computed container width is `1400px` (or `1400px - padding`)
    4. At 1920px viewport width: computed container width is `1800px` (or `1800px - padding`), width utilization is `>= 85%` (SC-001)
    5. At 3440px viewport width: computed container width does NOT exceed `1800px` (FR-009)
  - **Verification**: Run `npm run test:e2e -- tests/e2e/container-scaling.spec.ts` (test fails before or verifies against implementation).

### Implementation for User Story 1

- [X] T006 [US1] Validate and fine-tune root layout responsiveness across page wrappers in `src/app/layout.tsx`
  - **Action**: Ensure root layout container classes integrate cleanly with body wrapper and children components without horizontal overflow or margin collapses.
  - **Verification**: Run `npm run test:e2e -- tests/e2e/container-scaling.spec.ts` and confirm all viewport scaling assertions pass.

**Checkpoint**: User Story 1 is complete and independently verified. Content expands properly on large monitors.

---

## Phase 4: User Story 2 - Full Text Visibility on Cards and Lists (Priority: P1)

**Goal**: Relax and remove text truncation on desktop viewports (`xl:` 1280px+) across student badges, game cards, tense cards, admin headers, and stage scenarios so meaningful information is never lost.

**Independent Test**: Render cards and badges with long strings (title 50 chars, name 30 chars, description 150 chars) at ≥1280px; verify text is fully displayed without truncation ellipsis or 1-line cuts (FR-005, FR-006, SC-002, SC-005).

### Tests for User Story 2 🧪

- [X] T007 [P] [US2] Create unit tests for text truncation relaxation in `tests/components/truncation-relaxation.test.tsx`
  - **Action**: Create unit tests testing:
    1. `StudentProfileBadge`: checks `currentLevel.title` element has `xl:max-w-[200px]`
    2. `StudentBadge`: checks `session.studentName` and `session.className` have `xl:max-w-none` and `xl:truncate-none`
    3. `GameCard`: checks description element has `line-clamp-2` and `xl:line-clamp-none`
    4. `TenseCard`: checks description element has `line-clamp-2` and `xl:line-clamp-3`
    5. Stage components (`ConjugationStage`, `ErrorHunterStage`, `SentenceBuilderStage`): check scenario elements have `line-clamp-1` and `xl:line-clamp-2`
  - **Verification**: Run `npm run test:run -- tests/components/truncation-relaxation.test.tsx`.

- [X] T008 [P] [US2] Create E2E test for text visibility on desktop vs mobile in `tests/e2e/text-truncation.spec.ts`
  - **Action**: Write Playwright test verifying:
    1. At 1280px (`xl`): Long game descriptions wrap into multiple lines without hard clipping at 2 lines; student names up to 30 characters render without ellipsis.
    2. At 768px (`md`): Truncation and line-clamp remain intact for compact mobile/tablet views.
  - **Verification**: Run `npm run test:e2e -- tests/e2e/text-truncation.spec.ts`.

### Implementation for User Story 2

- [X] T009 [P] [US2] Update `src/components/StudentProfileBadge.tsx` to relax title truncation on desktop with `xl:max-w-[200px]`
  - **Action**: Update line 52:
    ```tsx
    // Before:
    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate max-w-[90px] sm:max-w-[120px]">
    // After:
    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate max-w-[90px] sm:max-w-[120px] xl:max-w-[200px]">
    ```
  - **Verification**: Run unit test `npm run test:run -- tests/components/truncation-relaxation.test.tsx`.

- [X] T010 [P] [US2] Update `src/components/student/StudentBadge.tsx` to remove name and class truncation on desktop with `xl:max-w-none xl:truncate-none`
  - **Action**: Update lines 37 and 43:
    ```tsx
    // Line 37 Before:
    <span className="truncate max-w-[120px] sm:max-w-[180px]">
    // Line 37 After:
    <span className="truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none xl:truncate-none">

    // Line 43 Before:
    <span className="text-[11px] font-semibold text-amber-700/80 truncate max-w-[120px] sm:max-w-[180px]">
    // Line 43 After:
    <span className="text-[11px] font-semibold text-amber-700/80 truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none xl:truncate-none">
    ```
  - **Verification**: Run unit test `npm run test:run -- tests/components/truncation-relaxation.test.tsx`.

- [X] T011 [P] [US2] Update `src/app/admin/layout.tsx` to remove teacher email truncation on desktop with `xl:max-w-none xl:truncate-none`
  - **Action**: Update line 83:
    ```tsx
    // Before:
    <span className="text-xs text-slate-500 hidden lg:inline-block max-w-[160px] truncate">
    // After:
    <span className="text-xs text-slate-500 hidden lg:inline-block max-w-[160px] truncate xl:max-w-none xl:truncate-none">
    ```
  - **Verification**: Verify in browser or unit test that email is not truncated at ≥1280px.

- [X] T012 [P] [US2] Update `src/components/custom/GameCard.tsx` to remove description clamping on desktop with `xl:line-clamp-none`
  - **Action**: Update line 47:
    ```tsx
    // Before:
    <CardDescription className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed line-clamp-2">
    // After:
    <CardDescription className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed line-clamp-2 xl:line-clamp-none">
    ```
  - **Verification**: Run unit test `npm run test:run -- tests/components/truncation-relaxation.test.tsx`.

- [X] T013 [P] [US2] Update `src/components/tenses/TenseCard.tsx` to expand description clamping on desktop with `xl:line-clamp-3`
  - **Action**: Update lines 42 and 87:
    ```tsx
    // Lines 42 & 87 Before:
    <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
    // Lines 42 & 87 After:
    <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 xl:line-clamp-3 leading-relaxed">
    ```
  - **Verification**: Run unit test `npm run test:run -- tests/components/truncation-relaxation.test.tsx`.

- [X] T014 [P] [US2] Update tense stage scenario headers in `src/components/tenses/stages/ConjugationStage.tsx`, `src/components/tenses/stages/ErrorHunterStage.tsx`, and `src/components/tenses/stages/SentenceBuilderStage.tsx` with `xl:line-clamp-2`
  - **Action**: Update scenario text classes:
    - `ConjugationStage.tsx` line 191: `line-clamp-1` → `line-clamp-1 xl:line-clamp-2`
    - `ErrorHunterStage.tsx` line 158: `line-clamp-1` → `line-clamp-1 xl:line-clamp-2`
    - `SentenceBuilderStage.tsx` line 352: `line-clamp-1` → `line-clamp-1 xl:line-clamp-2`
  - **Verification**: Run unit test `npm run test:run -- tests/components/truncation-relaxation.test.tsx`.

- [X] T015 [P] [US2] Update admin and dashboard list item titles in `src/components/admin/ConfigList.tsx`, `src/components/class/ClassList.tsx`, `src/components/dashboard/ClassOverview.tsx`, `src/components/dashboard/StudentDetail.tsx`, `src/app/admin/dashboard/page.tsx`, and `src/app/admin/configs/new/page.tsx`
  - **Action**: Update card title and description clamps:
    - `ConfigList.tsx` line 106: `line-clamp-1` → `line-clamp-1 xl:line-clamp-none`
    - `ClassList.tsx` line 139: `line-clamp-1` → `line-clamp-1 xl:line-clamp-none`
    - `ClassOverview.tsx` lines 330 & 543: `line-clamp-1` → `line-clamp-1 xl:line-clamp-none`
    - `StudentDetail.tsx` lines 231 & 252: `line-clamp-1` → `line-clamp-1 xl:line-clamp-none`
    - `admin/dashboard/page.tsx` line 146: `line-clamp-2` → `line-clamp-2 xl:line-clamp-3`
    - `admin/configs/new/page.tsx` line 78: `line-clamp-2` → `line-clamp-2 xl:line-clamp-3`
  - **Verification**: Run unit tests and type check `npx tsc --noEmit`.

**Checkpoint**: All text truncation relaxation rules TR-001 through TR-017 implemented and tested.

---

## Phase 5: User Story 3 - Proportionally Sized Content Blocks (Priority: P2)

**Goal**: Expand game play areas and scale grid columns on large desktop screens (`xl:` 1280px, `2xl:` 1536px) so content blocks feel proportional to the display size.

**Independent Test**: Open home page, tense hub, and game play pages at 1536px and 1920px viewports; verify listing grids display ≥4-5 columns, tense hub displays 5-6 columns, and game play areas expand by 14% to 33% (FR-004, FR-007, SC-003, SC-006).

### Tests for User Story 3 🧪

- [X] T016 [P] [US3] Create unit tests for grid column and play area container scaling in `tests/components/container-scaling-unit.test.tsx`
  - **Action**: Create Vitest unit test asserting:
    1. `LetterGrid` contains `xl:grid-cols-11 2xl:grid-cols-13`
    2. `FlashcardStack` contains `max-w-xl xl:max-w-2xl`
    3. `DragDropBoard` contains `max-w-2xl xl:max-w-4xl`
    4. `QuizEngine` contains `max-w-2xl xl:max-w-3xl`
    5. `TenseLessonContainer` contains `max-w-5xl xl:max-w-6xl`
  - **Verification**: Run `npm run test:run -- tests/components/container-scaling-unit.test.tsx`.

- [X] T017 [P] [US3] Create E2E test for grid columns and play area widths in `tests/e2e/grid-and-play-areas.spec.ts`
  - **Action**: Write Playwright test suite verifying:
    1. Home page (`/`): at 1536px viewport, game cards grid has 5 columns (SC-003)
    2. Flashcard topics (`/games/flashcard`): at 1536px viewport, topic cards grid has 5 columns
    3. Tense hub (`/tenses`): at 1536px viewport, tense cards grid has 6 columns
    4. Play area dimensions at 1920px viewport:
       - Flashcard (`/games/flashcard/animals`): play area width is `672px`
       - Sentences (`/games/sentences`): DnD board width is `896px` (+33.3% vs 672px)
       - Quiz (`/games/listening`): quiz container width is `768px`
       - Tenses (`/tenses/present-simple`): stage container width is `1024px`
  - **Verification**: Run `npm run test:e2e -- tests/e2e/grid-and-play-areas.spec.ts`.

### Implementation for User Story 3

- [X] T018 [P] [US3] Update student listing grids in `src/app/page.tsx`, `src/app/games/flashcard/page.tsx`, and `src/components/tenses/TenseHubMap.tsx`
  - **Action**: Update grid classes:
    - `src/app/page.tsx` line 107: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6`
    - `src/app/games/flashcard/page.tsx` line 77: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2` → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-2`
    - `src/components/tenses/TenseHubMap.tsx` line 140: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6` → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6`
  - **Verification**: Run `npm run test:e2e -- tests/e2e/grid-and-play-areas.spec.ts`.

- [X] T019 [P] [US3] Update `src/components/game/LetterGrid.tsx` to add desktop column breakpoints `xl:grid-cols-11 2xl:grid-cols-13`
  - **Action**: Update line 31:
    ```tsx
    // Before:
    "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-2.5 sm:gap-3.5 w-full",
    // After:
    "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 2xl:grid-cols-13 gap-2.5 sm:gap-3.5 w-full",
    ```
  - **Verification**: Run unit test `npm run test:run -- tests/components/container-scaling-unit.test.tsx`.

- [X] T020 [P] [US3] Update game play area components in `src/components/game/FlashcardStack.tsx`, `src/components/game/DragDropBoard.tsx`, and `src/components/game/QuizEngine.tsx`
  - **Action**: Update max-width classes:
    - `src/components/game/FlashcardStack.tsx` line 253: `max-w-xl` → `max-w-xl xl:max-w-2xl`
    - `src/components/game/DragDropBoard.tsx` line 222: `max-w-2xl` → `max-w-2xl xl:max-w-4xl`
    - `src/components/game/QuizEngine.tsx` line 242: `max-w-2xl` → `max-w-2xl xl:max-w-3xl`
  - **Verification**: Run unit test `npm run test:run -- tests/components/container-scaling-unit.test.tsx`.

- [X] T021 [P] [US3] Update tense lesson container and stage wrappers in `src/components/tenses/TenseLessonContainer.tsx`, `src/components/tenses/stages/ConjugationStage.tsx`, `src/components/tenses/stages/ErrorHunterStage.tsx`, `src/components/tenses/stages/SentenceBuilderStage.tsx`, and `src/components/tenses/CompletionDashboard.tsx`
  - **Action**: Update max-width classes:
    - `src/components/tenses/TenseLessonContainer.tsx` line 138: `max-w-5xl` → `max-w-5xl xl:max-w-6xl`
    - `src/components/tenses/stages/ConjugationStage.tsx` line 166: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
    - `src/components/tenses/stages/ErrorHunterStage.tsx` line 133: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
    - `src/components/tenses/stages/SentenceBuilderStage.tsx` line 327: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
    - `src/components/tenses/CompletionDashboard.tsx` line 101: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
  - **Verification**: Run unit test `npm run test:run -- tests/components/container-scaling-unit.test.tsx`.

- [X] T022 [P] [US3] Update game page container wrappers in `src/app/games/flashcard/page.tsx`, `src/app/games/flashcard/[topicId]/page.tsx`, `src/app/games/sentences/page.tsx`, `src/app/games/spelling/page.tsx`, `src/app/games/listening/page.tsx`, `src/app/games/alphabet/page.tsx`, and `src/app/games/numbers-colors/page.tsx`
  - **Action**: Update page container max-widths:
    - `src/app/games/flashcard/page.tsx` line 45: `max-w-5xl` → `max-w-5xl xl:max-w-6xl`
    - `src/app/games/flashcard/[topicId]/page.tsx` line 113: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
    - `src/app/games/sentences/page.tsx` line 264: `max-w-3xl` → `max-w-3xl xl:max-w-4xl`
    - `src/app/games/spelling/page.tsx` line 308: `max-w-3xl` → `max-w-3xl xl:max-w-4xl`
    - `src/app/games/listening/page.tsx` line 181: `max-w-3xl` → `max-w-3xl xl:max-w-4xl`
    - `src/app/games/alphabet/page.tsx` line 177: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
    - `src/app/games/numbers-colors/page.tsx` line 306: `max-w-4xl` → `max-w-4xl xl:max-w-5xl`
  - **Verification**: Run `npm run test:e2e -- tests/e2e/grid-and-play-areas.spec.ts`.

**Checkpoint**: All game play areas and listing grids scale proportionally on desktop.

---

## Phase 6: User Story 4 - Dashboard and Stats Scale for Desktop (Priority: P3)

**Goal**: Admin dashboard, configs list, and class list expand grids and stat layout on wide screens.

**Independent Test**: Open `/admin/dashboard`, `/admin/configs`, `/admin/classes` at 1536px+ and verify grids show 4 columns, card text is readable without truncation, and stat cards arrange proportionally (FR-004, FR-005).

### Tests for User Story 4 🧪

- [X] T023 [P] [US4] Create unit and E2E tests for admin desktop scaling in `tests/e2e/admin-scaling.spec.ts` and `tests/app/admin/dashboard/admin-scaling-unit.test.tsx`
  - **Action**: Write test suite testing:
    1. Admin dashboard games grid at 1280px (`xl`): displays 4 columns
    2. Admin config list grid at 1280px (`xl`): displays 4 columns
    3. Admin class list grid at 1536px (`2xl`): displays 4 columns
  - **Verification**: Run `npm run test:run -- tests/app/admin/dashboard/admin-scaling-unit.test.tsx`.

### Implementation for User Story 4

- [X] T024 [P] [US4] Update admin grids in `src/app/admin/dashboard/page.tsx`, `src/app/admin/configs/new/page.tsx`, `src/components/admin/ConfigList.tsx`, and `src/components/class/ClassList.tsx`
  - **Action**: Update grid classes:
    - `src/app/admin/dashboard/page.tsx` line 110: `md:grid-cols-2 lg:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    - `src/app/admin/configs/new/page.tsx` line 58: `sm:grid-cols-2 lg:grid-cols-3` → `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    - `src/components/admin/ConfigList.tsx` line 91: `md:grid-cols-2 lg:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    - `src/components/class/ClassList.tsx` line 128: `md:grid-cols-2 xl:grid-cols-3` → `md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`
  - **Verification**: Run unit test `npm run test:run -- tests/app/admin/dashboard/admin-scaling-unit.test.tsx`.

- [X] T025 [US4] Update class overview and student detail dashboards in `src/components/dashboard/ClassOverview.tsx` and `src/components/dashboard/StudentDetail.tsx`
  - **Action**: Verify metrics grid (`lg:grid-cols-4`) and student tables expand naturally within widened admin layout without overflow.
  - **Verification**: Run `npx tsc --noEmit` and `npm run test:run`.

**Checkpoint**: Admin management panels and dashboards scale cleanly for desktop viewports.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate edge cases (ultra-wide monitors, backwards compatibility at ≤1024px) and execute all Constitution Quality Gates.

- [X] T026 [P] Create and run ultra-wide monitor safety test (3440px viewport cap) in `tests/e2e/ultrawide-safety.spec.ts`
  - **Action**: Playwright test asserting that at 3440px and 3840px viewport widths:
    1. Root container computed width does NOT exceed `1800px` (FR-009, Contract 5)
    2. Content remains centered with balanced side margins
    3. No horizontal scrollbar (`scrollWidth === clientWidth`)
  - **Verification**: Run `npm run test:e2e -- tests/e2e/ultrawide-safety.spec.ts`.

- [X] T027 [P] Create and run backwards compatibility visual regression test (≤1024px) in `tests/e2e/backwards-compatibility.spec.ts`
  - **Action**: Playwright test verifying that at 375px (mobile), 768px (tablet), and 1024px (laptop):
    1. Home page grid columns: 1 (mobile), 2 (tablet), 3 (1024px) (Contract 2)
    2. Truncation rules: badges and cards retain ellipsis and line clamps (Contract 3)
    3. Zero horizontal scrollbar or visual regressions (FR-008, SC-004)
  - **Verification**: Run `npm run test:e2e -- tests/e2e/backwards-compatibility.spec.ts`.

- [X] T028 Run full test suite and Constitution Quality Gates validation in `package.json`
  - **Action**: Execute all 5 required quality gates:
    1. `npm run lint` — zero errors
    2. `npx tsc --noEmit` — zero type errors
    3. `npm run test:run` — all unit tests pass
    4. `npm run test:e2e` — all E2E tests pass
    5. `npm run build` — production build succeeds
  - **Verification**: All 5 commands exit with code 0.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies — can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1 — **BLOCKS ALL USER STORIES**.
- **Phase 3: User Story 1 (P1 - MVP)**: Depends on Phase 2 completion.
- **Phase 4: User Story 2 (P1)**: Depends on Phase 2 completion; can run in parallel with US1.
- **Phase 5: User Story 3 (P2)**: Depends on Phase 2 completion; builds on widened containers from Phase 3.
- **Phase 6: User Story 4 (P3)**: Depends on Phase 2 completion; builds on admin layout unblocking.
- **Phase 7: Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

```
Phase 1: Setup (T001-T002)
       │
       ▼
Phase 2: Foundational (T003-T004) [Root Container Expansion]
       │
       ├──────────────────────┬──────────────────────┬──────────────────────┐
       ▼                      ▼                      ▼                      ▼
Phase 3: US1 (MVP)      Phase 4: US2           Phase 5: US3           Phase 6: US4
(T005-T006)             (T007-T015)            (T016-T022)            (T023-T025)
Root Scaling            Text Truncation        Play Areas & Grids     Admin Dashboard
       │                      │                      │                      │
       └──────────────────────┴──────────────────────┴──────────────────────┘
                                      │
                                      ▼
                           Phase 7: Polish (T026-T028)
```

### Within Each User Story

1. Tests MUST be written and fail before implementation code is written.
2. Component-level responsive classes applied before integration testing.
3. Verification commands run to confirm completion before moving to next task.

---

## Parallel Execution Opportunities

- **Setup Tasks**: `T002` can run in parallel with `T001`.
- **Foundational Tasks**: `T004` (unit test) can run alongside `T003`.
- **User Story 2 Tasks**: `T007`, `T008`, `T009`, `T010`, `T011`, `T012`, `T013`, `T014`, `T015` modify separate components and can be executed concurrently by subagents.
- **User Story 3 Tasks**: `T016`, `T017`, `T018`, `T019`, `T020`, `T021`, `T022` modify independent files across games and tenses and can be executed concurrently.
- **User Story 4 Tasks**: `T023`, `T024`, `T025` can run in parallel with US2/US3 tasks.
- **Polish Tasks**: `T026` and `T027` can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`, `T002`)
2. Complete Phase 2: Foundational (`T003`, `T004`)
3. Complete Phase 3: User Story 1 (`T005`, `T006`)
4. **STOP and VALIDATE**: Run `npm run test:e2e -- tests/e2e/container-scaling.spec.ts` at 1920px. Content occupies ≥85% width. MVP ready.

### Incremental Delivery

1. **Increment 1 (MVP)**: Root container expansion (US1) → delivers immediate screen-filling benefit across all pages.
2. **Increment 2**: Text truncation relaxation (US2) → eliminates cut-off names, badges, descriptions, and scenario headers.
3. **Increment 3**: Play area and grid scaling (US3) → expands flashcards, DnD boards, quiz engines, and listing columns (4-6 cols).
4. **Increment 4**: Admin dashboard and class scaling (US4) → scales admin grids to 4 columns.
5. **Increment 5**: Ultrawide safety & full regression validation (Polish) → passes all 5 Constitution Quality Gates.
