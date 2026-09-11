# Implementation Plan: Sub-project 3 - Advanced Gamification (Class Leaderboard & Persistent Badges)

**Branch**: `subproject-3-advanced-gamification`
**Spec**: `docs/superpowers/specs/2026-09-11-advanced-gamification-design.md`
**Mode**: Subagent-Driven Development with TDD

---

## Tasks Breakdown

### Task 1: Class Leaderboard Server Action & Unit Tests
- **Files**:
  - `src/app/actions/class-leaderboard.ts` (create)
  - `tests/unit/actions/class-leaderboard.test.ts` (create)
- **TDD Steps**:
  1. Write tests in `tests/unit/actions/class-leaderboard.test.ts` mocking Supabase client.
     - Validate rejection when classCode is empty or invalid.
     - Validate returning active classroom name and student list sorted descending by totalStars.
     - Validate rank assignment and tie breaking.
     - Validate identification of `isCurrentStudent` and `currentStudentRank`.
  2. Implement `src/app/actions/class-leaderboard.ts`.
  3. Run tests and commit.

### Task 2: Badges Catalog & Persistent Evaluation Engine
- **Files**:
  - `src/types/badges.ts` (create)
  - `src/lib/badges.ts` (create)
  - `tests/unit/lib/badges.test.ts` (create)
- **TDD Steps**:
  1. Write tests in `tests/unit/lib/badges.test.ts` testing badge unlocking conditions, local persistence, and unlocked badge querying.
  2. Implement `src/types/badges.ts` and `src/lib/badges.ts`.
  3. Run tests and commit.

### Task 3: Gamification Modal UI & Interactive StudentProfileBadge
- **Files**:
  - `src/components/student/StudentGamificationModal.tsx` (create)
  - `src/components/StudentProfileBadge.tsx` (update)
  - `tests/unit/components/student/StudentGamificationModal.test.tsx` (create)
  - `tests/components/StudentProfileBadge.test.tsx` (update)
- **TDD Steps**:
  1. Write tests for `StudentGamificationModal.tsx` verifying Podium, Leaderboard table, Badges grid, and Level progress.
  2. Implement `StudentGamificationModal.tsx`.
  3. Update `StudentProfileBadge.tsx` to open the modal on click or keypress.
  4. Run vitest and commit.

### Task 4: Playwright E2E Test Suite for Gamification
- **Files**:
  - `tests/e2e/student-gamification.spec.ts` (create)
- **TDD Steps**:
  1. Create E2E test verifying student profile badge interaction, modal opening, tab navigation between Leaderboard, Badges, and Level roadmap.
  2. Run typecheck & lint.
  3. Commit changes.

### Task 5: Final Quality Gate & Verification
- **Checks**:
  1. `npx tsc --noEmit`
  2. `npm run lint`
  3. `npm run test:run`
  4. `npm run build:ci`
