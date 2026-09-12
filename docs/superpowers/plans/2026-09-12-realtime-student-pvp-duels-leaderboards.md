# Phase 7: Realtime Student 1v1 Duels & Class Leaderboards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time competitive 1v1 student duel arena with speed-decay scoring, room matchmaking, live answer broadcasting, and class/global leaderboards.

**Architecture:**
1. Pure domain scoring engine with speed-decay points, streak multipliers, and tie-breakers.
2. Supabase table `pvp_duels` with open student read/write RLS and Supabase Realtime broadcast channels.
3. Server actions for creating rooms, joining with PIN/link, recording round answers, and aggregating class/global leaderboards.
4. Client duel hub at `/duel`, interactive battle arena at `/duel/[code]`, and podium/leaderboards at `/leaderboard`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 5, Tailwind CSS 4, Lucide React, Supabase (PostgreSQL, Realtime, RLS), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-realtime-student-pvp-duels-leaderboards-design.md`

## Global Constraints
- Framework: Next.js 16 App Router, React 19, Tailwind CSS 4.
- Minimum 16px kid-friendly typography policy (use `text-xs`, `text-sm`, `text-base`; avoid arbitrary sub-16px classes).
- Speed decay calculation: Base score 100 pts + speed bonus up to 100 pts based on $1 - (\text{elapsedMs} / 10000)$.
- Real-time rooms support both authenticated students and guest anonymous players with nickname + avatar.
- Every task strictly follows TDD: failing test -> implementation -> passing test -> commit.

---

### Task 1: Duel Types & Pure Scoring Engine

**Files:**
- Create: `src/types/duels.ts`
- Create: `src/lib/duel-scoring.ts`
- Test: `tests/unit/lib/duel-scoring.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface DuelQuestion {
    id: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanationVi?: string;
  }

  export interface DuelState {
    id: string;
    code: string;
    topic: string;
    status: 'waiting' | 'ready' | 'in_progress' | 'finished' | 'cancelled';
    player1: { name: string; avatar: string; score: number; streak: number };
    player2?: { name: string; avatar: string; score: number; streak: number };
    currentQuestionIndex: number;
    questions: DuelQuestion[];
    winnerName?: string | null;
  }

  export function calculateDuelRoundScore(isCorrect: boolean, elapsedMs: number, currentStreak: number): number;
  export function resolveDuelWinner(player1Score: number, player2Score: number, player1Name: string, player2Name: string): { winnerName: string | null; isTie: boolean };
  ```

- [ ] **Step 1: Write failing test for duel scoring engine**

```typescript
// tests/unit/lib/duel-scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDuelRoundScore, resolveDuelWinner } from '@/lib/duel-scoring';

describe('Duel Scoring Engine', () => {
  it('awards 0 points for incorrect answers', () => {
    expect(calculateDuelRoundScore(false, 1000, 0)).toBe(0);
    expect(calculateDuelRoundScore(false, 500, 5)).toBe(0);
  });

  it('calculates maximum 200 points for instantaneous correct answer without streak', () => {
    expect(calculateDuelRoundScore(true, 0, 0)).toBe(200);
  });

  it('calculates speed decay score correctly at 5 seconds (5000ms)', () => {
    // 100 base + Math.floor(100 * (1 - 5000/10000)) = 100 + 50 = 150
    expect(calculateDuelRoundScore(true, 5000, 0)).toBe(150);
  });

  it('adds streak bonus (+20 pts per streak)', () => {
    // 150 + (2 * 20) = 190
    expect(calculateDuelRoundScore(true, 5000, 2)).toBe(190);
  });

  it('resolves winner and handles ties correctly', () => {
    expect(resolveDuelWinner(500, 400, 'Alice', 'Bob')).toEqual({ winnerName: 'Alice', isTie: false });
    expect(resolveDuelWinner(300, 600, 'Alice', 'Bob')).toEqual({ winnerName: 'Bob', isTie: false });
    expect(resolveDuelWinner(450, 450, 'Alice', 'Bob')).toEqual({ winnerName: null, isTie: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/duel-scoring.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/types/duels.ts` and `src/lib/duel-scoring.ts`**

Implement scoring calculations with bounds clamping (elapsedMs clamped to 0..10000).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/duel-scoring.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/duels.ts src/lib/duel-scoring.ts tests/unit/lib/duel-scoring.test.ts
git commit -m "feat(duel): implement duel scoring engine and TypeScript contracts"
```

---

### Task 2: Supabase Migration and Database Custom Types for `pvp_duels`

**Files:**
- Create: `supabase/migrations/20260912220000_pvp_duels.sql`
- Modify: `scripts/append-database-types.mjs`
- Modify: `src/types/database.ts`
- Test: `tests/unit/migrations/pvp-duels-schema.test.ts`

- [ ] **Step 1: Write failing test verifying schema migration**

```typescript
// tests/unit/migrations/pvp-duels-schema.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PvP Duels Database Schema Migration', () => {
  const migrationPath = path.resolve('supabase/migrations/20260912220000_pvp_duels.sql');

  it('exists and defines pvp_duels table with status constraints and indexes', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.pvp_duels');
    expect(sql).toContain('code VARCHAR(8) NOT NULL UNIQUE');
    expect(sql).toContain('idx_pvp_duels_code');
    expect(sql).toContain('ALTER TABLE public.pvp_duels ENABLE ROW LEVEL SECURITY');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/migrations/pvp-duels-schema.test.ts`
Expected: FAIL

- [ ] **Step 3: Create migration and update database types**

Create `supabase/migrations/20260912220000_pvp_duels.sql` and update `scripts/append-database-types.mjs` and `src/types/database.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/migrations/pvp-duels-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260912220000_pvp_duels.sql scripts/append-database-types.mjs src/types/database.ts tests/unit/migrations/pvp-duels-schema.test.ts
git commit -m "feat(migration): add pvp_duels schema, indexes, and RLS policies"
```

---

### Task 3: Server Actions for Duel Lifecycle (Create, Join, Answer, Rematch)

**Files:**
- Create: `src/app/actions/duels.ts`
- Test: `tests/unit/actions/duels.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export async function createDuelRoomAction(payload: { playerName: string; avatar: string; topic?: string; questionCount?: number }): Promise<{ success: boolean; data?: DuelState; error?: string }>;
  export async function joinDuelRoomAction(payload: { code: string; playerName: string; avatar: string }): Promise<{ success: boolean; data?: DuelState; error?: string }>;
  export async function getDuelStateAction(code: string): Promise<{ success: boolean; data?: DuelState; error?: string }>;
  export async function submitDuelAnswerAction(payload: { duelId: string; playerRole: 'player1' | 'player2'; questionIndex: number; isCorrect: boolean; elapsedMs: number }): Promise<{ success: boolean; data?: DuelState; error?: string }>;
  ```

- [ ] **Step 1: Write failing unit test for duel server actions**

```typescript
// tests/unit/actions/duels.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDuelRoomAction, joinDuelRoomAction } from '@/app/actions/duels';

describe('Duel Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects create room with empty player name', async () => {
    const res = await createDuelRoomAction({ playerName: '', avatar: '🦊' });
    expect(res.success).toBe(false);
  });

  it('rejects join room with invalid code length', async () => {
    const res = await joinDuelRoomAction({ code: '12', playerName: 'Bob', avatar: '🐼' });
    expect(res.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/duels.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/app/actions/duels.ts`**

Generate 6-character uppercase codes, populate questions from curriculum or Word Bank datasets, and calculate real-time score additions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/duels.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/duels.ts tests/unit/actions/duels.test.ts
git commit -m "feat(actions): implement duel room creation, join, and score actions"
```

---

### Task 4: Server Actions for Classroom & Global Leaderboards

**Files:**
- Create: `src/app/actions/leaderboards.ts`
- Test: `tests/unit/actions/leaderboards.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface LeaderboardEntry {
    rank: number;
    studentName: string;
    avatar: string;
    totalStars: number;
    currentStreak: number;
    duelWins: number;
    levelName?: string;
  }

  export async function getClassLeaderboardAction(classCode: string): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }>;
  export async function getGlobalLeaderboardAction(): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }>;
  ```

- [ ] **Step 1: Write failing test for leaderboard actions**

```typescript
// tests/unit/actions/leaderboards.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getClassLeaderboardAction, getGlobalLeaderboardAction } from '@/app/actions/leaderboards';

describe('Leaderboard Server Actions', () => {
  it('rejects empty classCode for class leaderboard', async () => {
    const res = await getClassLeaderboardAction('');
    expect(res.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/leaderboards.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/app/actions/leaderboards.ts`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/leaderboards.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/leaderboards.ts tests/unit/actions/leaderboards.test.ts
git commit -m "feat(actions): implement classroom and global leaderboard actions"
```

---

### Task 5: Main Duel Hub UI (`/duel`) & Matchmaking Client

**Files:**
- Create: `src/components/duel/CreateDuelModal.tsx`
- Create: `src/components/duel/JoinDuelModal.tsx`
- Create: `src/app/duel/page.tsx`
- Modify: `src/app/page.tsx` (add prominent "⚔️ Đấu trường 1v1" button)
- Test: `tests/unit/components/CreateDuelModal.test.tsx`

- [ ] **Step 1: Write failing test for `CreateDuelModal`**

- [ ] **Step 2: Run test to verify failure**

- [ ] **Step 3: Implement duel hub components and page**

- [ ] **Step 4: Run test to verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/duel/ src/app/duel/page.tsx src/app/page.tsx tests/unit/components/CreateDuelModal.test.tsx
git commit -m "feat(ui): implement duel hub, create room, and join room modals"
```

---

### Task 6: Realtime Battle Arena Client (`/duel/[code]`)

**Files:**
- Create: `src/components/duel/DuelScoreBar.tsx`
- Create: `src/components/duel/DuelQuestionCard.tsx`
- Create: `src/components/duel/DuelPodiumModal.tsx`
- Create: `src/app/duel/[code]/page.tsx`
- Test: `tests/unit/components/DuelScoreBar.test.tsx`

- [ ] **Step 1: Write failing test for `DuelScoreBar`**

- [ ] **Step 2: Run test to verify failure**

- [ ] **Step 3: Implement arena UI components and page**

- [ ] **Step 4: Run test to verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/duel/ src/app/duel/[code]/page.tsx tests/unit/components/DuelScoreBar.test.tsx
git commit -m "feat(ui): implement realtime duel arena, question timer, and podium modal"
```

---

### Task 7: Leaderboards Hub (`/leaderboard`)

**Files:**
- Create: `src/components/leaderboard/ClassLeaderboardTable.tsx`
- Create: `src/components/leaderboard/GlobalLeaderboardTable.tsx`
- Create: `src/app/leaderboard/page.tsx`
- Modify: `src/app/page.tsx` (add "🏆 Bảng xếp hạng" link)
- Test: `tests/unit/components/ClassLeaderboardTable.test.tsx`

- [ ] **Step 1: Write failing test for `ClassLeaderboardTable`**

- [ ] **Step 2: Run test to verify failure**

- [ ] **Step 3: Implement leaderboard components and page**

- [ ] **Step 4: Run test to verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/leaderboard/ src/app/leaderboard/page.tsx src/app/page.tsx tests/unit/components/ClassLeaderboardTable.test.tsx
git commit -m "feat(ui): implement classroom and global leaderboard views"
```

---

### Task 8: End-to-End Playwright Verification for PvP Duels & Leaderboards

**Files:**
- Create: `tests/e2e/student-pvp-duels.spec.ts`

- [ ] **Step 1: Write Playwright E2E test**
- [ ] **Step 2: Run test to verify pass: `npx playwright test tests/e2e/student-pvp-duels.spec.ts`**
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/student-pvp-duels.spec.ts
git commit -m "test(e2e): add Playwright verification for PvP duel creation, join, and leaderboards"
```
