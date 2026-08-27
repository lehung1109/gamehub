# Tasks: Đảm bảo Font Size không nhỏ hơn 16px Toàn Ứng Dụng (Global Minimum 16px Font Size)

**Feature**: `015-min-font-size-16px`  
**Input**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md) | [contracts/typography-contract.md](./contracts/typography-contract.md) | [research.md](./research.md) | [quickstart.md](./quickstart.md)

---

## Phase 1: Setup & Workspace Isolation

**Purpose**: Establish workspace isolation and verify baseline environment integrity before making any changes.

- [ ] T001 Initialize git worktree or branch workspace for `015-min-font-size-16px` isolation per Constitution Principle VI
  - **Action**: Verify active branch is `015-min-font-size-16px` or create isolated worktree with `git checkout -b 015-min-font-size-16px`.
  - **Verification**: Run `git status` and confirm clean working directory on feature branch.

- [ ] T002 Verify baseline test suite, TypeScript compilation, and linting in `package.json`
  - **Action**: Run `npm run lint`, `npx tsc --noEmit`, and `npm run test:run` to confirm 0 errors.
  - **Verification**: Clean exit code 0 across all verification commands.

- [ ] T003 Spawn review subagent to verify Phase 1 setup integrity
  - **Action**: Review environment state and confirm ready for Phase 2.
  - **Verification**: Zero issues reported.

---

## Phase 2: Foundational (Global Theme & Typography Base Scale)

**Purpose**: Configure Tailwind CSS v4 `@theme inline` font-size overrides and base `@layer base` typography rules in `src/app/globals.css` so `text-xs`, `text-sm`, and `text-base` evaluate to $\ge 16\text{px}$ (`1rem`) globally.

**⚠️ CRITICAL**: No user story UI adjustments can proceed until this phase is complete and verified.

- [ ] T004 Start a dedicated subagent for Phase 2 execution
  - **Action**: Launch dedicated subagent context for Phase 2 tasks.
  - **Verification**: Dedicated subagent initialized.

- [ ] T005 [P] Write failing unit tests for typography theme tokens in `tests/unit/typography-theme.test.ts`
  - **Action**: Create Vitest test asserting:
    1. `src/app/globals.css` defines `--text-xs: 1rem;` with line height `1.5rem;`
    2. `src/app/globals.css` defines `--text-sm: 1rem;` with line height `1.5rem;`
    3. `src/app/globals.css` defines `--text-base: 1rem;` with line height `1.5rem;`
    4. `@layer base` specifies `html { font-size: 16px; }` and `body { font-size: 1rem; line-height: 1.5rem; }`
  - **Verification**: Run `npm run test:run -- tests/unit/typography-theme.test.ts` and confirm failure prior to implementation.

- [ ] T006 Implement font size scale overrides and base rules in `src/app/globals.css`
  - **Action**: Update `@theme inline` block and `@layer base` block:
    ```css
    @theme inline {
      /* Minimum 16px typography scale */
      --text-xs: 1rem;
      --text-xs--line-height: 1.5rem;
      --text-sm: 1rem;
      --text-sm--line-height: 1.5rem;
      --text-base: 1rem;
      --text-base--line-height: 1.5rem;
      ...
    }

    @layer base {
      html {
        font-size: 16px;
        scrollbar-gutter: stable;
      }
      * {
        @apply border-border outline-ring/50;
      }
      body {
        @apply bg-background text-foreground;
        font-size: 1rem;
        line-height: 1.5rem;
      }
    }
    ```
  - **Verification**: Run `npm run test:run -- tests/unit/typography-theme.test.ts` and confirm all tests pass.

- [ ] T007 Spawn review subagent to conduct code review and bug hunting for Phase 2
  - **Action**: Run code review subagent on `src/app/globals.css` and `tests/unit/typography-theme.test.ts`.
  - **Verification**: Review subagent confirms zero bugs.

- [ ] T008 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
  - **Action**: Fix any syntax or CSS ordering issues if identified.
  - **Verification**: Zero remaining issues.

- [ ] T009 Commit Phase 2 changes with descriptive conventional commit message
  - **Action**: `git commit -m "feat(theme): enforce minimum 16px font size scale in globals.css"`
  - **Verification**: `git log -1` confirms commit created.

**Checkpoint**: Foundation ready — global font size floor is locked at 16px (1rem).

---

## Phase 3: User Story 3 - Shared UI Components Typography & Touch Sizing (Priority: P3)

**Goal**: Standardize shared UI primitives (`Button`, `Toggle`, `Badge`, `Tooltip`) so compact variants use `text-sm` (16px) with adjusted vertical height (`h-8`) and padding (`px-3`) to prevent text clipping and provide child-friendly touch targets.

**Independent Test**: Render `Button`, `Toggle`, `Badge`, and `Tooltip` in unit tests; verify all variants render with $\ge 16\text{px}$ text and touch heights $\ge 32\text{px}$ without layout distortion.

- [ ] T010 Start a dedicated subagent for Phase 3 execution
  - **Action**: Launch dedicated subagent context for Phase 3.
  - **Verification**: Dedicated subagent initialized.

- [ ] T011 [P] [US3] Write failing unit tests for UI component sizing in `tests/components/ui-components-typography.test.tsx`
  - **Action**: Write Vitest unit tests testing:
    1. `Button` with `size="sm"` renders with `text-sm` and `h-8` (replacing `text-[0.8rem]` and `h-7`)
    2. `Toggle` with `size="sm"` renders with `text-sm` and `h-8`
    3. `Badge` renders with `text-xs` (16px) and proper padding
    4. `Tooltip` renders with `text-xs` (16px)
  - **Verification**: Run `npm run test:run -- tests/components/ui-components-typography.test.tsx` and confirm failure.

- [ ] T012 [P] [US3] Update `Button` component small variant in `src/components/ui/button.tsx`
  - **Action**: In `buttonVariants` object, replace `sm` size definition:
    ```tsx
    // Before:
    sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
    // After:
    sm: "h-8 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
    ```
  - **Verification**: Run `npm run test:run -- tests/components/ui-components-typography.test.tsx`.

- [ ] T013 [P] [US3] Update `Toggle` component small variant in `src/components/ui/toggle.tsx`
  - **Action**: In `toggleVariants` object, replace `sm` size definition:
    ```tsx
    // Before:
    sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
    // After:
    sm: "h-8 min-w-8 rounded-[min(var(--radius-md),12px)] px-3 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
    ```
  - **Verification**: Run `npm run test:run -- tests/components/ui-components-typography.test.tsx`.

- [ ] T014 [P] [US3] Update `Badge` and `Tooltip` components in `src/components/ui/badge.tsx` and `src/components/ui/tooltip.tsx`
  - **Action**: Ensure `badge.tsx` and `tooltip.tsx` use `text-xs` (now 16px) with clean padding (`px-2.5 py-0.5` for badge, `px-3 py-1.5` for tooltip) and leading-normal to avoid vertical text clipping.
  - **Verification**: Run `npm run test:run -- tests/components/ui-components-typography.test.tsx` and confirm all tests pass.

- [ ] T015 Spawn review subagent to conduct code review and bug hunting for Phase 3
  - **Action**: Review all modified files in `src/components/ui/`.
  - **Verification**: Review subagent confirms zero bugs.

- [ ] T016 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
  - **Action**: Fix any identified issues.
  - **Verification**: Zero remaining issues.

- [ ] T017 Commit Phase 3 changes with descriptive conventional commit message
  - **Action**: `git commit -m "feat(ui): update button, toggle, badge, and tooltip typography to 16px"`
  - **Verification**: `git log -1` confirms commit created.

**Checkpoint**: Shared UI primitives comply with the 16px minimum contract without clipping.

---

## Phase 4: User Story 1 - Student & Game Interfaces Font Size Normalization (Priority: P1) 🎯 MVP

**Goal**: Replace all hardcoded sub-16px arbitrary classes across student badges, profile widgets, and game modules (Alphabet, Flashcard, Numbers & Colors, Spelling, Listening, Sentences, Workplace Tenses).

**Independent Test**: Load all student games and widgets; verify all text, labels, status pills, and score indicators render at $\ge 16\text{px}$ without overflow or overlap.

- [ ] T018 Start a dedicated subagent for Phase 4 execution
  - **Action**: Launch dedicated subagent context for Phase 4.
  - **Verification**: Dedicated subagent initialized.

- [ ] T019 [P] [US1] Write failing unit tests for student badge and game typography in `tests/components/student-game-typography.test.tsx`
  - **Action**: Write Vitest unit tests verifying:
    1. `StudentProfileBadge` does not contain `text-[10px]` and uses `text-xs` (16px)
    2. `StudentBadge` does not contain `text-[10px]` or `text-[11px]` and uses `text-xs` (16px)
    3. `QuickRulesTab` and `TenseLessonContainer` do not contain sub-16px arbitrary classes
  - **Verification**: Run `npm run test:run -- tests/components/student-game-typography.test.tsx` and confirm failure.

- [ ] T020 [P] [US1] Update `StudentProfileBadge` in `src/components/StudentProfileBadge.tsx`
  - **Action**: Replace `text-[10px]` on lines 51 and 73 with `text-xs font-bold`:
    ```tsx
    // Line 51:
    <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">•</span>
    // Line 73:
    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Tối đa</span>
    ```
  - **Verification**: Run `npm run test:run -- tests/components/student-game-typography.test.tsx`.

- [ ] T021 [P] [US1] Update `StudentBadge` in `src/components/student/StudentBadge.tsx`
  - **Action**: Replace `text-[11px]` on line 43 and `text-[10px]` on line 66 with `text-xs font-semibold` and `text-xs font-bold`:
    ```tsx
    // Line 43:
    <span className="text-xs font-semibold text-amber-700/80 truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none xl:truncate-none">
    // Line 66:
    <span className="text-xs text-amber-600 font-bold ml-0.5 underline">
    ```
  - **Verification**: Run `npm run test:run -- tests/components/student-game-typography.test.tsx`.

- [ ] T022 [P] [US1] Update Workplace Tenses components in `src/components/tenses/TenseLessonContainer.tsx` and `src/components/tenses/QuickRulesTab.tsx`
  - **Action**:
    1. In `TenseLessonContainer.tsx` lines 326 & 331: replace `text-[10px]` with `text-xs font-medium`.
    2. In `QuickRulesTab.tsx` lines 141, 181, 205, 224, 229: replace `text-[10px]` and `text-[11px]` with `text-xs` or `text-sm`.
  - **Verification**: Run `npm run test:run -- tests/components/student-game-typography.test.tsx`.

- [ ] T023 [P] [US1] Update Numbers & Colors game in `src/app/games/numbers-colors/page.tsx`
  - **Action**: In `page.tsx` line 481: replace `text-[10px] sm:text-xs` with `text-sm sm:text-base`.
  - **Verification**: Run `npx tsc --noEmit` and `npm run test:run`.

- [ ] T024 Spawn review subagent to conduct code review and bug hunting for Phase 4
  - **Action**: Run review subagent across all updated game and student badge files.
  - **Verification**: Review subagent confirms zero bugs.

- [ ] T025 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
  - **Action**: Address any review feedback.
  - **Verification**: Zero remaining issues.

- [ ] T026 Commit Phase 4 changes with descriptive conventional commit message
  - **Action**: `git commit -m "feat(games): standardize student badges and game typography to minimum 16px"`
  - **Verification**: `git log -1` confirms commit created.

**Checkpoint**: User Story 1 complete — all student and game views display text at $\ge 16\text{px}$.

---

## Phase 5: User Story 2 - Admin Dashboard & Forms Typography Verification (Priority: P2)

**Goal**: Ensure all admin dashboard tables, config forms, modals, helper text, and student detail views display legible text at $\ge 16\text{px}$ without column overflow.

**Independent Test**: Load `/admin/dashboard`, `/admin/configs/new`, `/admin/classes/[classId]`; verify table data, form labels, helper text, and action buttons render at $\ge 16\text{px}$.

- [ ] T027 Start a dedicated subagent for Phase 5 execution
  - **Action**: Launch dedicated subagent context for Phase 5.
  - **Verification**: Dedicated subagent initialized.

- [ ] T028 [P] [US2] Write unit tests for admin layout and config forms typography in `tests/app/admin/admin-typography.test.tsx`
  - **Action**: Write Vitest unit test asserting admin header text, table rows, and form helper text inherit $\ge 16\text{px}$ typography rules.
  - **Verification**: Run `npm run test:run -- tests/app/admin/admin-typography.test.tsx`.

- [ ] T029 [US2] Verify and fine-tune admin form helper text and table cells in `src/components/config/*.tsx` and `src/components/dashboard/*.tsx`
  - **Action**: Check `ConfigCreateForm.tsx`, `ConfigEditForm.tsx`, `ClassOverview.tsx`, `StudentDetail.tsx`, and `DifficultWordsAnalysis.tsx` for clean column wrapping and spacing with 16px text.
  - **Verification**: Run `npx tsc --noEmit` and `npm run test:run`.

- [ ] T030 Spawn review subagent to conduct code review and bug hunting for Phase 5
  - **Action**: Review admin and dashboard components.
  - **Verification**: Review subagent confirms zero bugs.

- [ ] T031 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
  - **Action**: Address any feedback.
  - **Verification**: Zero remaining issues.

- [ ] T032 Commit Phase 5 changes with descriptive conventional commit message
  - **Action**: `git commit -m "feat(admin): verify and refine admin dashboard and form typography for 16px scale"`
  - **Verification**: `git log -1` confirms commit created.

**Checkpoint**: User Story 2 complete — admin screens and forms render clearly at 16px.

---

## Phase 6: Static Invariant & Regression Validation

**Purpose**: Execute static analysis, regex grep invariant validation, unit tests, and production build checks.

- [ ] T033 [P] Run static invariant regex check for sub-16px classes across entire `src/` directory
  - **Action**: Execute:
    ```powershell
    git grep -n -E "text-\[(1[0-5]|[0-9])px\]" src/
    git grep -n -E "text-\[0\.[0-9]+rem\]" src/
    ```
  - **Verification**: Confirm 0 matches returned (Exit code 1 for git grep when no matches).

- [ ] T034 [P] Run linter and strict TypeScript typecheck
  - **Action**: Execute `npm run lint` and `npx tsc --noEmit`.
  - **Verification**: 0 errors, 0 warnings.

- [ ] T035 [P] Run complete Vitest unit test suite
  - **Action**: Execute `npm run test:run`.
  - **Verification**: 100% of unit test suites pass.

- [ ] T036 Run production Next.js static build check
  - **Action**: Execute `npm run build:ci`.
  - **Verification**: Next.js build succeeds with zero errors.

---

## Phase 7: Final Feature-Level Review & Completion Phase (Constitution Principle VI)

**Purpose**: Perform a holistic, cross-phase code review and bug hunt subagent loop across the entire feature before the final commit.

- [ ] T037 Spawn final feature-level review subagent for holistic review and bug hunt
  - **Action**: Spawn dedicated review subagent to evaluate all modified files across Phases 1–6 against `spec.md`, `plan.md`, and `contracts/typography-contract.md`.
  - **Verification**: Review subagent provides detailed audit of all changes.

- [ ] T038 Resolve any remaining issues found in feature-level review, and iteratively re-review until zero bugs
  - **Action**: Fix any remaining discrepancies or styling inconsistencies.
  - **Verification**: Final re-review confirms zero bugs and 100% spec compliance.

- [ ] T039 Create final comprehensive feature commit and push to remote
  - **Action**: Commit all verified changes with conventional commit: `git commit -m "feat(typography): complete 015-min-font-size-16px feature with minimum 16px scale"`
  - **Verification**: `git status` shows clean tree, `git log -1` confirms final commit.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001-T003)
       │
       ▼
Phase 2: Foundational Theme (T004-T009) [globals.css Theme Scale]
       │
       ├────────────────────────────────────────┐
       ▼                                        ▼
Phase 3: US3 UI Components (T010-T017)    Phase 4: US1 Games & Badges (T018-T026)
       │                                        │
       └───────────────────┬────────────────────┘
                           ▼
Phase 5: US2 Admin Dashboard (T027-T032)
                           │
                           ▼
Phase 6: Static Invariant & Regression (T033-T036)
                           │
                           ▼
Phase 7: Final Feature-Level Review (T037-T039)
```

### Parallel Opportunities

- In Phase 2: `T005` (unit test) runs before `T006`.
- In Phase 3: `T012` (`button.tsx`), `T013` (`toggle.tsx`), `T014` (`badge.tsx`/`tooltip.tsx`) can be modified concurrently.
- In Phase 4: `T020` (`StudentProfileBadge.tsx`), `T021` (`StudentBadge.tsx`), `T022` (`tenses`), `T023` (`numbers-colors`) can be modified in parallel.
- In Phase 6: `T033`, `T034`, `T035` can execute in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 & Foundational)
1. Complete Phase 1 & Phase 2 (Global theme scale locked at $\ge 16\text{px}$)
2. Complete Phase 3 (UI primitives updated)
3. Complete Phase 4 (Student widgets & games updated)
4. **VALIDATE MVP**: All student game screens display text at $\ge 16\text{px}$ without overflow.

### Full Delivery
1. Complete Phase 5 (Admin dashboard verification)
2. Complete Phase 6 (Static analysis, lint, full unit tests, build)
3. Complete Phase 7 (Holistic review subagent loop and final feature commit)
