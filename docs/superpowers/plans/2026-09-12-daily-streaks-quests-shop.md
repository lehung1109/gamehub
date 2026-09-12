# Daily Streaks, Quests & Rewards Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Daily Habit & Gamification 2.0 system for GameHub featuring a streak tracking engine with freeze protection, deterministic daily & weekly quests, an unlockable avatar frame and title rewards shop, and unified game loop integration.

**Architecture:** Pure deterministic domain engines for streaks, quests, and shop items with dual persistence (localStorage + in-memory fallback), encapsulated React components (`DailyStreakBadge`, `StudentQuestsTab`, `StudentShopTab`), wired into `StudentGamificationModal`, `StudentProfileBadge`, and `useGameTracking`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-12-daily-streaks-quests-shop-design.md`

## Global Constraints
- Target 0 TypeScript errors (`npx tsc --noEmit`).
- Target 0 ESLint errors (`npm run lint`).
- Minimum font size >= 16px (text-base or text-sm for labels/badges) strictly enforced.
- Vitest tests pass 100% (zero regressions on the existing 203 test files).
- Keep changes aligned with existing repository patterns and student session conventions.

---

### Task 1: Daily Streak Engine & Calculation Rules (TDD)

**Files:**
- Create: `src/types/streak.ts`
- Create: `src/lib/streak.ts`
- Create: `tests/lib/streak.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface StreakState {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
    freezeCount: number;
    totalActiveDays: number;
    unlockedMilestones: number[];
  }
  export function calculateStreakUpdate(currentState: StreakState, todayDateStr: string): StreakUpdateResult;
  export function getStoredStreak(classCode?: string, studentName?: string): StreakState;
  export function saveStoredStreak(classCode: string | undefined, studentName: string | undefined, streak: StreakState): void;
  ```

- [ ] **Step 1: Write the failing test for streak evaluation**

Create `tests/lib/streak.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateStreakUpdate,
  getInitialStreakState,
  getStoredStreak,
  saveStoredStreak,
} from '@/lib/streak'
import { StreakState } from '@/types/streak'

describe('Daily Streak Engine', () => {
  it('should start with initial state when playing for the first time', () => {
    const initial = getInitialStreakState()
    const result = calculateStreakUpdate(initial, '2026-09-12')

    expect(result.nextState.currentStreak).toBe(1)
    expect(result.nextState.longestStreak).toBe(1)
    expect(result.nextState.lastActiveDate).toBe('2026-09-12')
    expect(result.streakIncremented).toBe(true)
    expect(result.isNewDay).toBe(true)
  })

  it('should not increment streak on the same day', () => {
    const state: StreakState = {
      currentStreak: 2,
      longestStreak: 2,
      lastActiveDate: '2026-09-12',
      freezeCount: 1,
      totalActiveDays: 2,
      unlockedMilestones: [],
    }

    const result = calculateStreakUpdate(state, '2026-09-12')
    expect(result.nextState.currentStreak).toBe(2)
    expect(result.streakIncremented).toBe(false)
    expect(result.isNewDay).toBe(false)
  })

  it('should increment streak on consecutive day', () => {
    const state: StreakState = {
      currentStreak: 2,
      longestStreak: 2,
      lastActiveDate: '2026-09-12',
      freezeCount: 1,
      totalActiveDays: 2,
      unlockedMilestones: [],
    }

    const result = calculateStreakUpdate(state, '2026-09-13')
    expect(result.nextState.currentStreak).toBe(3)
    expect(result.nextState.longestStreak).toBe(3)
    expect(result.nextState.lastActiveDate).toBe('2026-09-13')
    expect(result.streakIncremented).toBe(true)
    expect(result.milestoneBonusStars).toBe(5) // Day 3 milestone bonus
    expect(result.nextState.unlockedMilestones).toContain(3)
  })

  it('should consume streak freeze if missed 1 day and freezeCount > 0', () => {
    const state: StreakState = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-09-10',
      freezeCount: 1,
      totalActiveDays: 5,
      unlockedMilestones: [3],
    }

    // Missed Sept 11, playing on Sept 12 (diff 2 days)
    const result = calculateStreakUpdate(state, '2026-09-12')
    expect(result.freezeUsed).toBe(true)
    expect(result.nextState.freezeCount).toBe(0)
    expect(result.nextState.currentStreak).toBe(6)
    expect(result.nextState.lastActiveDate).toBe('2026-09-12')
  })

  it('should reset streak to 1 if missed 1 day and freezeCount === 0', () => {
    const state: StreakState = {
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-09-10',
      freezeCount: 0,
      totalActiveDays: 5,
      unlockedMilestones: [3],
    }

    const result = calculateStreakUpdate(state, '2026-09-12')
    expect(result.freezeUsed).toBe(false)
    expect(result.nextState.currentStreak).toBe(1)
    expect(result.nextState.longestStreak).toBe(5)
  })

  it('should persist and retrieve streak from storage', () => {
    const state: StreakState = {
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: '2026-09-12',
      freezeCount: 2,
      totalActiveDays: 4,
      unlockedMilestones: [3],
    }

    saveStoredStreak('CLASS1', 'Bé An', state)
    const loaded = getStoredStreak('CLASS1', 'Bé An')
    expect(loaded.currentStreak).toBe(4)
    expect(loaded.freezeCount).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify failure**
Run `npx vitest run tests/lib/streak.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/streak.ts` & `src/lib/streak.ts`**
Create types and functions with milestone rewards (3, 7, 14, 30 days) and storage helper.

- [ ] **Step 4: Run test to verify pass**
Run `npx vitest run tests/lib/streak.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/types/streak.ts src/lib/streak.ts tests/lib/streak.test.ts
git commit -m "feat(streak): add daily streak engine, freeze calculation, and storage"
```

---

### Task 2: Daily & Weekly Quests Engine (TDD)

**Files:**
- Create: `src/types/quests.ts`
- Create: `src/lib/quests.ts`
- Create: `tests/lib/quests.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface Quest {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'play_games' | 'perfect_score' | 'game_category' | 'earn_stars';
    target: number;
    current: number;
    rewardStars: number;
    rewardFreeze?: number;
    isCompleted: boolean;
    isClaimed: boolean;
    period: 'daily' | 'weekly';
    dateKey: string;
  }
  export function getOrGenerateQuests(dateKey: string, classCode?: string, studentName?: string): Quest[];
  export function recordQuestProgress(quests: Quest[], session: { gameType: string; score: number; starsEarned: number }): { updatedQuests: Quest[]; newlyCompleted: Quest[] };
  export function claimQuestReward(quests: Quest[], questId: string): { updatedQuests: Quest[]; claimedReward: { stars: number; freeze: number } | null };
  ```

- [ ] **Step 1: Write the failing test for quests engine**
Create `tests/lib/quests.test.ts`.

- [ ] **Step 2: Run test to verify failure**
Run `npx vitest run tests/lib/quests.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/quests.ts` & `src/lib/quests.ts`**
Implement deterministic quest generator based on `YYYY-MM-DD` and `YYYY-Www`, progress evaluator, reward claims, and storage.

- [ ] **Step 4: Run test to verify pass**
Run `npx vitest run tests/lib/quests.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/types/quests.ts src/lib/quests.ts tests/lib/quests.test.ts
git commit -m "feat(quests): add deterministic daily and weekly quests engine"
```

---

### Task 3: Rewards & Avatar Shop Engine & Catalog (TDD)

**Files:**
- Create: `src/types/shop.ts`
- Create: `src/lib/shop.ts`
- Create: `tests/lib/shop.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface ShopItem {
    id: string;
    name: string;
    description: string;
    category: 'frame' | 'title' | 'utility';
    cost: number;
    icon: string;
    cssClass?: string;
  }
  export interface StudentInventory {
    ownedItemIds: string[];
    equippedFrameId?: string;
    equippedTitleId?: string;
  }
  export const SHOP_CATALOG: ShopItem[];
  export function getStoredInventory(classCode?: string, studentName?: string): StudentInventory;
  export function saveStoredInventory(classCode: string | undefined, studentName: string | undefined, inventory: StudentInventory): void;
  export function purchaseItem(inventory: StudentInventory, totalStars: number, item: ShopItem): { success: boolean; newInventory: StudentInventory; remainingStars: number; error?: string };
  export function equipItem(inventory: StudentInventory, item: ShopItem): StudentInventory;
  export function unequipItem(inventory: StudentInventory, category: 'frame' | 'title'): StudentInventory;
  ```

- [ ] **Step 1: Write failing test for shop engine**
Create `tests/lib/shop.test.ts` checking catalog, purchase logic, star deduction, and equipping/unequipping.

- [ ] **Step 2: Run test to verify failure**
Run `npx vitest run tests/lib/shop.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/shop.ts` & `src/lib/shop.ts`**
Implement catalog and inventory management functions.

- [ ] **Step 4: Run test to verify pass**
Run `npx vitest run tests/lib/shop.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/types/shop.ts src/lib/shop.ts tests/lib/shop.test.ts
git commit -m "feat(shop): add rewards shop catalog, inventory, and equip engine"
```

---

### Task 4: Daily Streak Flame Badge & Detail Modal UI

**Files:**
- Create: `src/components/student/DailyStreakBadge.tsx`
- Create: `src/components/student/DailyStreakModal.tsx`
- Create: `tests/components/student/DailyStreakBadge.test.tsx`

**Interfaces:**
- Consumes: `useStudentSession`, `StreakState`, `getStoredStreak`.
- Produces: `DailyStreakBadge` button showing flame icon, streak count, tooltip, and opens `DailyStreakModal`.

- [ ] **Step 1: Write failing test for DailyStreakBadge & Modal**
Create `tests/components/student/DailyStreakBadge.test.tsx`.

- [ ] **Step 2: Run test to verify failure**
Run `npx vitest run tests/components/student/DailyStreakBadge.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Implement `DailyStreakBadge.tsx` and `DailyStreakModal.tsx`**
Ensure accessible labels, buttons, minimum font size >= 16px, flame states, and milestone roadmap display.

- [ ] **Step 4: Run test to verify pass**
Run `npx vitest run tests/components/student/DailyStreakBadge.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/student/DailyStreakBadge.tsx src/components/student/DailyStreakModal.tsx tests/components/student/DailyStreakBadge.test.tsx
git commit -m "feat(ui): add DailyStreakBadge and DailyStreakModal components"
```

---

### Task 5: Quests & Shop Tabs in Student Gamification Modal

**Files:**
- Create: `src/components/student/StudentQuestsTab.tsx`
- Create: `src/components/student/StudentShopTab.tsx`
- Modify: `src/components/student/StudentGamificationModal.tsx`
- Create: `tests/components/student/StudentQuestsTab.test.tsx`
- Create: `tests/components/student/StudentShopTab.test.tsx`

**Interfaces:**
- Consumes: `Quest`, `ShopItem`, `StudentInventory`, `getOrGenerateQuests`, `purchaseItem`, `equipItem`.
- Modifies: `StudentGamificationModal` to add `quests` (🎯) and `shop` (🛍️) tabs with badge notification counters.

- [ ] **Step 1: Write failing tests for Quests and Shop tabs**
Create `tests/components/student/StudentQuestsTab.test.tsx` and `tests/components/student/StudentShopTab.test.tsx`.

- [ ] **Step 2: Run tests to verify failure**
Run `npx vitest run tests/components/student/StudentQuestsTab.test.tsx tests/components/student/StudentShopTab.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Implement `StudentQuestsTab`, `StudentShopTab`, and update `StudentGamificationModal`**
Build the tab components and wire them into `StudentGamificationModal`.

- [ ] **Step 4: Run tests to verify pass**
Run `npx vitest run tests/components/student/StudentQuestsTab.test.tsx tests/components/student/StudentShopTab.test.tsx tests/components/student/StudentGamificationModal.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/student/StudentQuestsTab.tsx src/components/student/StudentShopTab.tsx src/components/student/StudentGamificationModal.tsx tests/components/student/StudentQuestsTab.test.tsx tests/components/student/StudentShopTab.test.tsx
git commit -m "feat(ui): add Quests and Shop tabs to StudentGamificationModal"
```

---

### Task 6: Avatar Frame & Custom Title Rendering in Student Profile Badges

**Files:**
- Modify: `src/components/StudentProfileBadge.tsx`
- Modify: `src/components/student/StudentBadge.tsx`
- Create: `tests/components/student/StudentProfileFrames.test.tsx`

**Interfaces:**
- Consumes: `getStoredInventory`, `SHOP_CATALOG`.
- Produces: Displays equipped avatar frame border/glow and custom title badge.

- [ ] **Step 1: Write failing test for frame & title rendering**
Create `tests/components/student/StudentProfileFrames.test.tsx`.

- [ ] **Step 2: Run test to verify failure**
Run `npx vitest run tests/components/student/StudentProfileFrames.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Update `StudentProfileBadge.tsx` and `StudentBadge.tsx`**
Render equipped frame classes and title badge when available.

- [ ] **Step 4: Run test to verify pass**
Run `npx vitest run tests/components/student/StudentProfileFrames.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/StudentProfileBadge.tsx src/components/student/StudentBadge.tsx tests/components/student/StudentProfileFrames.test.tsx
git commit -m "feat(ui): render equipped avatar frames and custom titles in student badges"
```

---

### Task 7: Game Loop Integration (`useGameTracking`)

**Files:**
- Modify: `src/components/game/GameTrackingProvider.tsx` or `src/hooks/use-game-tracking.tsx`
- Modify: `tests/unit/use-game-tracking.test.tsx`

**Interfaces:**
- Consumes: `calculateStreakUpdate`, `saveStoredStreak`, `recordQuestProgress`, `saveStoredQuests`.
- Triggered on: `submitSession` / session completion.

- [ ] **Step 1: Write unit test in `use-game-tracking.test.tsx` asserting streak & quest update**
Assert that upon session completion, streak and quest progress are recorded.

- [ ] **Step 2: Run test to verify failure**
Run `npx vitest run tests/unit/use-game-tracking.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Update `use-game-tracking.tsx` to call streak and quest engines**
Wire the engines into the session completion handler.

- [ ] **Step 4: Run test to verify pass**
Run `npx vitest run tests/unit/use-game-tracking.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/hooks/use-game-tracking.tsx tests/unit/use-game-tracking.test.tsx
git commit -m "feat(tracking): wire daily streak and quest updates into game session completion"
```

---

### Task 8: Top Bar Integration & Quality Gates Verification

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `tests/app/page.test.tsx`

- [ ] **Step 1: Wire `DailyStreakBadge` into `src/app/page.tsx` top bar**
Place `DailyStreakBadge` beside `StudentProfileBadge`.

- [ ] **Step 2: Update `tests/app/page.test.tsx` to verify streak badge rendering**
Verify `DailyStreakBadge` renders without crashing.

- [ ] **Step 3: Run project-wide quality gates**
1. `npm run lint` -> 0 errors
2. `npx tsc --noEmit` -> 0 errors
3. `npm run test:run` -> All test files pass (100%)

- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx tests/app/page.test.tsx
git commit -m "feat(home): embed DailyStreakBadge into homepage top bar"
```
