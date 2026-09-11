# Implementation Plan: Sub-project 5 - Homework / Assignment Management with Deadlines

**Branch**: `subproject-5-homework-assignment-management`
**Spec**: `docs/superpowers/specs/2026-09-11-homework-assignments-design.md`
**Mode**: Subagent-Driven Development with TDD

---

## Tasks Breakdown

### Task 1: Database Migration, Types, & Server Actions
- **Files**:
  - `supabase/migrations/20260911100000_assignments.sql` (create)
  - `src/types/assignments.ts` (create)
  - `src/app/actions/assignments.ts` (create)
  - `tests/unit/actions/assignments.test.ts` (create)
- **TDD Steps**:
  1. Write tests in `tests/unit/actions/assignments.test.ts` mocking Supabase client.
     - Validate input validation for createAssignment (title required, valid due_date in future, valid classroom).
     - Test teacher assignment listing and progress calculation.
     - Test student assignment fetching with status computation ('completed', 'pending', 'overdue').
  2. Implement migration, types, and server actions.
  3. Run tests and commit.

### Task 2: Teacher Assignment Manager Component & Class Detail Integration
- **Files**:
  - `src/components/class/AssignmentManager.tsx` (create)
  - `src/components/dashboard/ClassOverview.tsx` (update)
  - `tests/components/class/AssignmentManager.test.tsx` (create)
- **TDD Steps**:
  1. Write tests for `AssignmentManager.tsx` (rendering assignment list, create assignment form dialog, delete handler).
  2. Implement `AssignmentManager.tsx` and integrate it into `ClassOverview.tsx`.
  3. Run tests and commit.

### Task 3: Student Assignments View & Modal Integration
- **Files**:
  - `src/components/student/StudentAssignmentsTab.tsx` (create)
  - `src/components/student/StudentGamificationModal.tsx` (update to include Tab 4)
  - `tests/unit/components/student/StudentAssignmentsTab.test.tsx` (create)
  - `tests/unit/components/student/StudentGamificationModal.test.tsx` (update)
- **TDD Steps**:
  1. Write tests for `StudentAssignmentsTab.tsx` verifying loading state, empty state, and rendering assignments with status badges ('completed', 'pending', 'overdue') and play buttons.
  2. Implement `StudentAssignmentsTab.tsx` and attach it as the 4th tab ("Bài tập về nhà") in `StudentGamificationModal.tsx`.
  3. Run tests and commit.

### Task 4: Playwright E2E Tests for Homework Flow
- **Files**:
  - `tests/e2e/assignments-flow.spec.ts` (create)
- **TDD Steps**:
  1. Write E2E test covering student viewing assigned homework in gamification modal and clicking play to navigate to the game.
  2. Run typecheck & lint.
  3. Commit changes.

### Task 5: Final Quality Gate & Verification
- **Checks**:
  1. `npx tsc --noEmit`
  2. `npm run lint`
  3. `npm run test:run`
  4. `npm run build:ci`
