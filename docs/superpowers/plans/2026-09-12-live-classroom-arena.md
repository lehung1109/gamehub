# Implementation Plan: Phase 4 — Live Classroom Arena (Multiplayer / Kahoot-style Real-Time Arena)

**Spec:** `docs/superpowers/specs/2026-09-12-live-classroom-arena-design.md`  
**Branch:** `feat/live-classroom-arena`  

---

### Task 1: Live Arena Database Migration & TypeScript Definitions
**Files:**
- Create: `supabase/migrations/20260912190000_live_classroom_arena.sql`
- Create: `src/types/arena.ts`
- Modify: `src/types/database.ts`
- Create: `tests/unit/migrations/live-classroom-arena-schema.test.ts`

**Interfaces:**
- Produces:
  - `LiveArena`, `LiveArenaParticipant`, `ArenaQuestion`, `ArenaStatus`, `ArenaParticipantAnswer`
  - `Database['public']['Tables']['live_arenas']`
  - `Database['public']['Tables']['live_arena_participants']`

- [ ] **Step 1: Write failing schema tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement migration SQL and TypeScript types**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Arena Scoring & Speed Decay Engine
**Files:**
- Create: `src/lib/arena/scoring.ts`
- Create: `tests/unit/lib/arena-scoring.test.ts`

**Interfaces:**
- Produces:
  - `calculateAnswerScore({ responseTimeMs, timeLimitSeconds, streak, isCorrect })`
  - `calculateStreak(currentStreak, isCorrect)`
  - `calculatePodiumRewards(rank)`

- [ ] **Step 1: Write failing unit tests for scoring engine**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/lib/arena/scoring.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Server Actions for Arena Lifecycle Management
**Files:**
- Create: `src/app/actions/arena.ts`
- Create: `tests/unit/actions/arena.test.ts`

**Interfaces:**
- Produces:
  - `createLiveArenaAction(input)`
  - `getLiveArenaByPinAction(pin)`
  - `getLiveArenaByIdAction(arenaId)`
  - `joinLiveArenaAction(input)`
  - `submitArenaAnswerAction(input)`
  - `advanceArenaStateAction(arenaId, status, questionIndex)`
  - `finalizeArenaAction(arenaId)`

- [ ] **Step 1: Write failing unit tests for arena server actions**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/app/actions/arena.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Student Arena Experience UI
**Files:**
- Create: `src/components/arena/ArenaJoinForm.tsx`
- Create: `src/components/arena/StudentArenaPlay.tsx`
- Create: `src/app/arena/page.tsx`
- Create: `src/app/arena/[pin]/page.tsx`
- Create: `tests/components/arena/StudentArenaPlay.test.tsx`

- [ ] **Step 1: Write failing component tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement student arena components and pages**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Teacher Host Arena Command Center UI
**Files:**
- Create: `src/components/admin/arena/TeacherArenaCreate.tsx`
- Create: `src/components/admin/arena/TeacherArenaHost.tsx`
- Create: `src/components/admin/arena/ArenaPodium.tsx`
- Create: `src/app/admin/arena/new/page.tsx`
- Create: `src/app/admin/arena/[arenaId]/page.tsx`
- Modify: `src/app/admin/layout.tsx`, `src/app/admin/dashboard/page.tsx`
- Create: `tests/components/admin/TeacherArenaHost.test.tsx`

- [ ] **Step 1: Write failing component tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement teacher host components and pages**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: Playwright E2E & Full Regression Verification
**Files:**
- Create: `tests/e2e/live-classroom-arena.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests for Arena join, game rounds, and host flow**
- [ ] **Step 2: Run full regression test suite (`npm run test:run`)**
- [ ] **Step 3: Run TypeScript (`npx tsc --noEmit`) and ESLint (`npm run lint`)**
- [ ] **Step 4: Commit and merge to `main`**
