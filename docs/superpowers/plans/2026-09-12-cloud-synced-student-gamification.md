# Cloud-Synced Student Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist and synchronize student gamification data (streaks, freezes, shop inventory, equipped frames/titles, and quests) to Supabase, enabling cross-device access with dual-layer offline/cache fallback and teacher visibility.

**Architecture:** A dedicated `student_gamification` Supabase table linked to `students` via foreign key; Server Actions using `createAdminClient()` with classroom verification; dual-layer client synchronization in `StudentSessionContext` with local cache fallback; and teacher classroom roster display of active streaks and equipped cosmetics.

**Tech Stack:** Next.js 16 (App Router), Supabase (@supabase/ssr, PostgreSQL, RLS), React 19, TypeScript, Vitest, Testing Library.

**Spec:** [docs/superpowers/specs/2026-09-12-cloud-synced-student-gamification-design.md](file:///F:/projects/gamehub/docs/superpowers/specs/2026-09-12-cloud-synced-student-gamification-design.md)

## Global Constraints
- Do NOT break anonymous/guest play mode (`isAnonymous = true` must fallback to local storage cleanly without console errors or failed network requests).
- Students do NOT have Supabase Auth email/password accounts; student server actions must authenticate via `classCode` and `studentName` verified against `classrooms` and `students` tables.
- UI render must be instant (no flash of unstyled frame or zero stars); hydrate immediately from local cache, then reconcile with cloud in background.
- Existing local storage data must be seamlessly migrated on the student's next join without overwriting newer progress.

---

### Task 1: Database Migration for Student Gamification

**Files:**
- Create: `supabase/migrations/20260912160000_student_gamification.sql`
- Create: `tests/unit/migrations/student-gamification-schema.test.ts`
- Modify: `src/types/database.ts`

**Interfaces:**
- Produces: `student_gamification` PostgreSQL table with fields `id`, `student_id`, `streak_state`, `inventory`, `quests`, `created_at`, `updated_at`.
- TypeScript type `StudentGamificationRow` in `src/types/database.ts`.

- [ ] **Step 1: Write failing schema validation test**

```typescript
// tests/unit/migrations/student-gamification-schema.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('student_gamification migration script', () => {
  it('contains valid table definition, foreign key, indexes, and RLS', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20260912160000_student_gamification.sql'
    )
    expect(fs.existsSync(migrationPath)).toBe(true)

    const sql = fs.readFileSync(migrationPath, 'utf-8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_gamification')
    expect(sql).toContain('REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('idx_student_gamification_student_id')
    expect(sql).toContain('ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "Teachers can view student gamification in their classrooms"')
    expect(sql).toContain('set_student_gamification_updated_at')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/migrations/student-gamification-schema.test.ts`  
Expected: FAIL with missing file.

- [ ] **Step 3: Create migration SQL file**

```sql
-- supabase/migrations/20260912160000_student_gamification.sql
-- Migration: Cloud-Synced Student Gamification (Streaks, Inventory, Quests)

CREATE TABLE IF NOT EXISTS public.student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  streak_state JSONB NOT NULL DEFAULT '{
    "currentStreak": 0,
    "longestStreak": 0,
    "lastActiveDate": "",
    "freezeCount": 1,
    "totalActiveDays": 0,
    "unlockedMilestones": []
  }'::jsonb,
  inventory JSONB NOT NULL DEFAULT '{
    "ownedItemIds": [],
    "equippedFrameId": null,
    "equippedTitleId": null,
    "spentStars": 0,
    "bonusStars": 0
  }'::jsonb,
  quests JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for instant single-record student lookups
CREATE INDEX IF NOT EXISTS idx_student_gamification_student_id 
  ON public.student_gamification(student_id);

-- Row Level Security
ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;

-- Teachers can view gamification records of students in their classrooms
CREATE POLICY "Teachers can view student gamification in their classrooms"
ON public.student_gamification
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  JOIN public.classrooms c ON c.id = s.classroom_id
  WHERE s.id = student_gamification.student_id AND c.teacher_id = auth.uid()
));

-- Trigger: Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_student_gamification_updated_at ON public.student_gamification;
CREATE TRIGGER set_student_gamification_updated_at
  BEFORE UPDATE ON public.student_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/migrations/student-gamification-schema.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260912160000_student_gamification.sql tests/unit/migrations/student-gamification-schema.test.ts
git commit -m "feat(migration): add student_gamification schema with RLS and triggers"
```

---

### Task 2: Server Actions for Student Gamification

**Files:**
- Create: `src/app/actions/student-gamification.ts`
- Create: `tests/unit/actions/student-gamification.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` from `@/lib/supabase/admin`, `StreakState`, `StudentInventory`, `Quest`.
- Produces:
  - `getStudentGamificationProfile(input: { classCode: string; studentName: string })`
  - `syncStudentGamificationState(input: { classCode: string; studentName: string; streakState?: StreakState; inventory?: StudentInventory; quests?: Quest[] })`
  - `purchaseShopItemAction(input: { classCode: string; studentName: string; itemId: string })`
  - `equipShopItemAction(input: { classCode: string; studentName: string; itemId: string; category: 'frame' | 'title' })`
  - `claimQuestRewardAction(input: { classCode: string; studentName: string; questId: string })`

- [ ] **Step 1: Write failing unit tests for Server Actions**

```typescript
// tests/unit/actions/student-gamification.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStudentGamificationProfile,
  syncStudentGamificationState,
  purchaseShopItemAction,
  equipShopItemAction,
  claimQuestRewardAction,
} from '@/app/actions/student-gamification'

describe('student-gamification server actions', () => {
  it('returns error when classCode or studentName is missing', async () => {
    const res = await getStudentGamificationProfile({ classCode: '', studentName: '' })
    expect(res.success).toBe(false)
    expect(res.error).toBeDefined()
  })

  it('rejects purchase when item does not exist', async () => {
    const res = await purchaseShopItemAction({
      classCode: 'TEST01',
      studentName: 'Alice',
      itemId: 'invalid_item_id_xyz',
    })
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/không tồn tại/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/student-gamification.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/app/actions/student-gamification.ts`**

Implement complete CRUD and atomic state handlers with `createAdminClient()`, checking classroom active status, finding/creating student, querying/upserting `student_gamification`, validating item costs from `getShopCatalog()`, and managing star balances.

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `npx vitest run tests/unit/actions/student-gamification.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/student-gamification.ts tests/unit/actions/student-gamification.test.ts
git commit -m "feat(actions): implement cloud student gamification server actions"
```

---

### Task 3: Dual-Layer Client Synchronization in `StudentSessionContext`

**Files:**
- Modify: `src/contexts/StudentSessionContext.tsx`
- Modify: `src/lib/shop.ts`, `src/lib/streak.ts`, `src/lib/quests.ts`
- Create: `tests/unit/contexts/student-session-context-cloud.test.tsx`

**Interfaces:**
- Consumes: `getStudentGamificationProfile`, `syncStudentGamificationState` from `@/app/actions/student-gamification`.
- Produces:
  - Extended `StudentSessionContextValue` with:
    - `streakState: StreakState`
    - `inventory: StudentInventory`
    - `quests: Quest[]`
    - `buyItem: (itemId: string) => Promise<boolean>`
    - `equipItem: (itemId: string, category: 'frame' | 'title') => Promise<void>`
    - `claimReward: (questId: string) => Promise<boolean>`
    - `syncGamification: () => Promise<void>`

- [ ] **Step 1: Write failing test for context hydration and cloud reconciliation**

```typescript
// tests/unit/contexts/student-session-context-cloud.test.tsx
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StudentSessionProvider, useStudentSession } from '@/contexts/StudentSessionContext'

describe('StudentSessionContext Cloud Sync', () => {
  it('exposes streakState, inventory, and quests with default values', () => {
    const { result } = renderHook(() => useStudentSession(), {
      wrapper: ({ children }) => <StudentSessionProvider>{children}</StudentSessionProvider>,
    })

    expect(result.current.streakState).toBeDefined()
    expect(result.current.inventory).toBeDefined()
    expect(result.current.quests).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/contexts/student-session-context-cloud.test.tsx`  
Expected: FAIL (fields not defined on context)

- [ ] **Step 3: Update `StudentSessionContext.tsx`**

1. Add `streakState`, `inventory`, `quests` states.
2. When `session` is active, immediately populate from `getStoredInventory`, `getStoredStreakState`, `getStoredQuests` (local cache for 0ms latency).
3. Concurrently invoke `getStudentGamificationProfile({ classCode, studentName })`.
4. On cloud response, merge any local-only bonus stars or higher streaks, save to local cache, and update state.
5. Provide `buyItem`, `equipItem`, `claimReward` methods that update optimistic state locally and dispatch Server Action in background.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/contexts/student-session-context-cloud.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/contexts/StudentSessionContext.tsx tests/unit/contexts/student-session-context-cloud.test.tsx
git commit -m "feat(context): integrate cloud synchronization and state reconciliation"
```

---

### Task 4: Connect Game Tracking to Cloud Gamification

**Files:**
- Modify: `src/hooks/use-game-tracking.ts`
- Modify: `tests/unit/use-game-tracking.test.tsx`

**Interfaces:**
- Consumes: `syncStudentGamificationState`
- Produces: Automatic cloud sync of streak and quest progress immediately after `POST /api/track` succeeds.

- [ ] **Step 1: Update `use-game-tracking.test.tsx` with cloud sync assertion**

Verify that on successful tracking of a completed game session in classroom mode, cloud sync is triggered.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/use-game-tracking.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Update `use-game-tracking.ts`**

In `trackGameSession`, after `fetch('/api/track')` returns 200:
Trigger `syncStudentGamificationState({ classCode, studentName, streakState, quests, inventory })` in a non-blocking Promise.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/use-game-tracking.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-game-tracking.ts tests/unit/use-game-tracking.test.tsx
git commit -m "feat(tracking): dispatch cloud gamification sync on session completion"
```

---

### Task 5: Teacher Classroom Dashboard Gamification Display

**Files:**
- Modify: `src/app/actions/classes.ts`
- Modify: `src/components/dashboard/ClassOverview.tsx`
- Modify: `src/components/dashboard/StudentDetail.tsx`
- Create: `tests/components/dashboard/ClassOverviewGamification.test.tsx`

**Interfaces:**
- Consumes: `student_gamification` records linked to classroom students.
- Produces:
  - Roster view displaying active streak flame (`🔥 X ngày`), equipped avatar frame, and title badge.
  - Classroom highlight card: "Chuỗi học tập đỉnh nhất" (Highest Active Streak).

- [ ] **Step 1: Write test for ClassOverview gamification indicators**

```typescript
// tests/components/dashboard/ClassOverviewGamification.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ClassOverview } from '@/components/dashboard/ClassOverview'

describe('ClassOverview Gamification Badges', () => {
  it('renders student streak flames and equipped cosmetics when present', () => {
    const mockStudents = [
      {
        id: 's-1',
        name: 'Nguyen Van A',
        totalSessions: 12,
        avgScore: 92,
        currentStreak: 5,
        equippedTitle: 'Thần Tốc Độ',
      },
    ]

    render(<ClassOverview students={mockStudents as any} />)
    expect(screen.getByText(/5 ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/Thần Tốc Độ/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/dashboard/ClassOverviewGamification.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Update `src/app/actions/classes.ts` and `ClassOverview.tsx`**

1. In `getClassDetails(classId)`, perform left join or batch query `student_gamification` for all students in the class.
2. In `ClassOverview.tsx`, render streak flame badges and equipped title pill tags beside student names.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/dashboard/ClassOverviewGamification.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/classes.ts src/components/dashboard/ClassOverview.tsx tests/components/dashboard/ClassOverviewGamification.test.tsx
git commit -m "feat(teacher): display student streaks and titles in class dashboard"
```

---

### Task 6: Full Regression Testing & E2E Validation

**Files:**
- Create: `tests/e2e/student-cloud-sync.spec.ts`

- [ ] **Step 1: Write Playwright E2E test for cross-device / refresh persistence**

Simulate student joining, earning stars, buying a frame in the shop, checking that the frame remains equipped after page reload and in a separate incognito context with the same class code and name.

- [ ] **Step 2: Run all unit and component tests**

Run: `npm test`  
Expected: All test suites PASS without regressions.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/student-cloud-sync.spec.ts
git commit -m "test(e2e): add end-to-end verification for cloud synced gamification"
```
