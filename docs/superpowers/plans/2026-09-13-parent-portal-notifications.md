# Parent Portal & Communication Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frictionless, zero-password Parent Portal and Teacher Notice Board enabling parents to monitor their child's English learning progress, receive tailored home-study tips, and acknowledge classroom announcements.

**Architecture:** A lightweight public portal (`/parent` & `/parent/[token]`) authenticated via unique student PINs and magic tokens, backed by dedicated Supabase tables (`student_parent_access`, `classroom_announcements`, `announcement_acknowledgments`), pure weekly digest calculation engines, and teacher management tools in `/admin/parents`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Supabase (PostgreSQL, RLS), Vitest, Playwright, Tailwind CSS (with strict $\ge 16$px typography enforcement).

**Spec:** [docs/superpowers/specs/2026-09-13-parent-portal-notifications-design.md](file:///F:/projects/gamehub/docs/superpowers/specs/2026-09-13-parent-portal-notifications-design.md)

## Global Constraints

- TypeScript 5 strict mode, no `any`, proper error handling.
- Typography policy: Strictly no sub-16px font sizes in parent and teacher interfaces (no `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`). Minimum font size is 16px (`text-base`, `text-lg`, `text-xl`, etc.).
- RLS policies must allow teachers to manage access for their owned classrooms, while public parent actions query securely using `createAdminClient()` strictly guarded by valid PIN/token match.
- Every task follows Test-Driven Development (TDD): write test -> verify fail -> implement -> verify pass -> commit.

---

### Task 1: TypeScript Contracts & Domain Models

**Files:**
- Create: `src/types/parent.ts`
- Modify: `src/types/index.ts`
- Test: `tests/unit/types/parent-types.test.ts`

**Interfaces:**
- Produces: `ParentAccessInfo`, `ClassroomAnnouncement`, `WeeklyLearningDigest`, `ParentDashboardData`, `AnnouncementCategory`, `AnnouncementPriority`, `VerifyParentAccessInput`, `CreateAnnouncementInput`.

- [ ] **Step 1: Write the failing test**
Create `tests/unit/types/parent-types.test.ts` testing structure and type definitions.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/types/parent-types.test.ts`
Expected: FAIL due to missing module.

- [ ] **Step 3: Write implementation**
Create `src/types/parent.ts` and re-export in `src/types/index.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/types/parent-types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add src/types/parent.ts src/types/index.ts tests/unit/types/parent-types.test.ts && git commit -m "feat(types): define contracts for parent portal and announcements"`

---

### Task 2: Pure Parent Digest & PIN Generation Engine

**Files:**
- Create: `src/lib/parent/digest-generator.ts`
- Test: `tests/unit/lib/parent-digest-generator.test.ts`

**Interfaces:**
- Produces:
  - `generateParentPin(): string`
  - `generateParentAccessToken(): string`
  - `computeWeeklyDigest(sessions, totalStars, currentStreak, freezeCount, skills): WeeklyLearningDigest`
  - `generateHomeLearningTips(weakSkills: Array<{ name: string; rating: string }>): string[]`

- [ ] **Step 1: Write the failing test**
Create comprehensive unit tests in `tests/unit/lib/parent-digest-generator.test.ts` verifying PIN format (6 unambiguous chars), token generation, weekly aggregation, and home learning tip synthesis.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/lib/parent-digest-generator.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3: Write implementation**
Implement pure functions in `src/lib/parent/digest-generator.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/lib/parent-digest-generator.test.ts`
Expected: PASS (100%).

- [ ] **Step 5: Commit**
Run: `git add src/lib/parent/digest-generator.ts tests/unit/lib/parent-digest-generator.test.ts && git commit -m "feat(parent): implement pure weekly digest and PIN generator engine"`

---

### Task 3: Supabase Migration & Database Custom Types

**Files:**
- Create: `supabase/migrations/20260913120000_parent_portal_tables.sql`
- Modify: `scripts/append-database-types.mjs`
- Modify: `src/types/database.ts`
- Test: `tests/unit/migrations/parent-portal-schema.test.ts`

**Interfaces:**
- Produces: PostgreSQL tables `student_parent_access`, `classroom_announcements`, `announcement_acknowledgments` with RLS and indexes. Types exported in `src/types/database.ts`.

- [ ] **Step 1: Write schema validation unit test**
Create `tests/unit/migrations/parent-portal-schema.test.ts` asserting SQL syntax, table constraints, RLS enablement, and cascade deletes.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/migrations/parent-portal-schema.test.ts`
Expected: FAIL due to missing migration file.

- [ ] **Step 3: Create migration and append database types**
Write `supabase/migrations/20260913120000_parent_portal_tables.sql`, run `node scripts/append-database-types.mjs`, and verify `src/types/database.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/migrations/parent-portal-schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add -f supabase/migrations/20260913120000_parent_portal_tables.sql src/types/database.ts scripts/append-database-types.mjs tests/unit/migrations/parent-portal-schema.test.ts && git commit -m "feat(migration): add tables for parent access, announcements, and acknowledgments"`

---

### Task 4: Server Actions for Parent Authentication, Dashboard Data & Acknowledgments

**Files:**
- Create: `src/app/actions/parent.ts`
- Test: `tests/unit/actions/parent-portal.test.ts`

**Interfaces:**
- Produces:
  - `verifyParentAccessAction(input: VerifyParentAccessInput): Promise<{ success: boolean; token?: string; error?: string }>`
  - `getParentStudentDashboardAction(token: string): Promise<{ success: boolean; data?: ParentDashboardData; error?: string }>`
  - `acknowledgeAnnouncementAction(announcementId: string, studentId: string, parentName?: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Write unit tests with Supabase mocks**
Create `tests/unit/actions/parent-portal.test.ts` covering PIN verification, token lookups, invalid credentials, dashboard data hydration, and read receipts.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/actions/parent-portal.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement actions**
Implement the parent-facing server actions in `src/app/actions/parent.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/actions/parent-portal.test.ts`
Expected: PASS (100%).

- [ ] **Step 5: Commit**
Run: `git add src/app/actions/parent.ts tests/unit/actions/parent-portal.test.ts && git commit -m "feat(actions): implement parent authentication, dashboard query, and acknowledgment actions"`

---

### Task 5: Server Actions for Teacher Parent Management & Announcements

**Files:**
- Modify: `src/app/actions/parent.ts`
- Test: `tests/unit/actions/parent-management.test.ts`

**Interfaces:**
- Produces:
  - `getClassParentsListAction(classroomId: string): Promise<{ success: boolean; list?: ParentAccessInfo[]; error?: string }>`
  - `createClassAnnouncementAction(input: CreateAnnouncementInput): Promise<{ success: boolean; announcement?: ClassroomAnnouncement; error?: string }>`
  - `deleteClassAnnouncementAction(announcementId: string): Promise<{ success: boolean; error?: string }>`
  - `regenerateStudentParentPinAction(studentId: string, classroomId: string): Promise<{ success: boolean; accessInfo?: ParentAccessInfo; error?: string }>`

- [ ] **Step 1: Write unit tests**
Create `tests/unit/actions/parent-management.test.ts` verifying teacher ownership check, automatic PIN assignment for newly enrolled students, announcement publishing, and deletion.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/actions/parent-management.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement teacher parent actions**
Add teacher management actions to `src/app/actions/parent.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/actions/parent-management.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add src/app/actions/parent.ts tests/unit/actions/parent-management.test.ts && git commit -m "feat(actions): implement teacher parent roster and announcement management actions"`

---

### Task 6: Parent Portal Authentication & Mobile-Friendly Dashboard Views

**Files:**
- Create: `src/components/parent/ParentAuthForm.tsx`
- Create: `src/components/parent/WeeklyDigestCard.tsx`
- Create: `src/components/parent/ParentNoticeBoard.tsx`
- Create: `src/components/parent/ParentDashboardView.tsx`
- Create: `src/app/parent/page.tsx`
- Create: `src/app/parent/[token]/page.tsx`
- Test: `tests/unit/components/ParentDashboardView.test.tsx`

**Interfaces:**
- Consumes: Server actions from Task 4, types from Task 1.
- Produces: Interactive parent experience with responsive layout, zero sub-16px fonts, ARIA alerts, and acknowledgement triggers.

- [ ] **Step 1: Write unit tests for Parent components**
Create `tests/unit/components/ParentDashboardView.test.tsx` asserting component rendering, typography compliance ($\ge 16$px), acknowledgment click handlers, and weekly digest view.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/components/ParentDashboardView.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Parent views and routes**
Build `ParentAuthForm.tsx`, `WeeklyDigestCard.tsx`, `ParentNoticeBoard.tsx`, `ParentDashboardView.tsx`, `/parent/page.tsx`, and `/parent/[token]/page.tsx`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/components/ParentDashboardView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add src/components/parent/ src/app/parent/ tests/unit/components/ParentDashboardView.test.tsx && git commit -m "feat(ui): implement parent auth form, weekly digest, notice board, and dashboard views"`

---

### Task 7: Teacher Admin Parent Management UI & Navigation Entry Points

**Files:**
- Create: `src/components/admin/ParentAccessManager.tsx`
- Create: `src/app/admin/parents/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`
- Test: `tests/unit/components/ParentAccessManager.test.tsx`

**Interfaces:**
- Consumes: Server actions from Task 5.
- Produces: Full teacher interface for reviewing student parent PINs, copying magic links, posting class announcements, and tracking read receipts.

- [ ] **Step 1: Write unit test for ParentAccessManager**
Create `tests/unit/components/ParentAccessManager.test.tsx` checking table render, copy link button, announcement modal, and typography.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/components/ParentAccessManager.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement ParentAccessManager, admin page and layout integration**
Build `src/components/admin/ParentAccessManager.tsx`, `src/app/admin/parents/page.tsx`, update navigation in `src/app/admin/layout.tsx` and `src/app/admin/dashboard/page.tsx`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/components/ParentAccessManager.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add src/components/admin/ParentAccessManager.tsx src/app/admin/parents/page.tsx src/app/admin/layout.tsx src/app/admin/dashboard/page.tsx tests/unit/components/ParentAccessManager.test.tsx && git commit -m "feat(admin): implement parent access manager, announcements studio, and admin navigation"`

---

### Task 8: End-to-End Verification with Playwright for Phase 10

**Files:**
- Create: `tests/e2e/parent-portal-notifications.spec.ts`
- Test: `npx playwright test tests/e2e/parent-portal-notifications.spec.ts`

**Interfaces:**
- Verifies complete user flows:
  1. Parent navigates to `/parent`, enters class code, student name, and PIN -> redirected to dashboard.
  2. Direct magic link access `/parent/[token]` loads student dashboard with weekly digest and notice board.
  3. Parent acknowledges a teacher announcement -> status updates to acknowledged.
  4. Teacher logs into `/admin/parents` and sees roster and announcements.

- [ ] **Step 1: Write Playwright E2E tests**
Create `tests/e2e/parent-portal-notifications.spec.ts`.

- [ ] **Step 2: Run E2E tests**
Run: `npx playwright test tests/e2e/parent-portal-notifications.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 3: Commit**
Run: `git add tests/e2e/parent-portal-notifications.spec.ts && git commit -m "test(e2e): add playwright tests for parent portal and notification flows"`
