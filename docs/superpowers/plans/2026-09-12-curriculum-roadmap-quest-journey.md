# Phase 6: Curriculum Roadmap & Quest Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cohesive, interactive map-based learning adventure (Curriculum Roadmap) linking GameHub's 20 mini-games and grammar modules into 4 CEFR-aligned worlds with 1-3 star ratings, boss checkpoints, cloud/local sync, and teacher analytics.

**Architecture:**
1. Pre-curated JSON dataset representing 4 CEFR worlds and stage nodes mapped to existing mini-game routes and parameters.
2. Pure domain calculation engine for 1-3 star grading, unlock dependencies, and boss checkpoint gating.
3. Supabase table `student_roadmap_progress` with RLS, coupled with server actions for progress retrieval, upserting, offline sync, and class analytics.
4. Interactive client journey UI at `/roadmap` with SVG path connections, animated node states, node preview modal, and teacher overview in `/admin/classes/[id]`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 5, Tailwind CSS 4, Lucide React, Framer Motion, Supabase (PostgreSQL, RLS), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-curriculum-roadmap-quest-journey-design.md`

## Global Constraints
- Framework: Next.js 16 App Router, React 19, Tailwind CSS 4.
- Database mutations must use Supabase server actions with RLS validation.
- All star calculations must use integer percentages: $\ge 60\% \rightarrow 1\text{ star}$, $\ge 80\% \rightarrow 2\text{ stars}$, $100\% \rightarrow 3\text{ stars}$.
- Star progress must never regress: if a student already earned 3 stars, a subsequent attempt with 1 star retains 3 stars and highest score.
- Offline / guest students must be supported via `localStorage` and automatically synced to Supabase when joining a class.
- Every task must strictly follow TDD: failing test $\rightarrow$ verify failure $\rightarrow$ implementation $\rightarrow$ verify pass $\rightarrow$ commit.

---

### Task 1: Curriculum Types and 4-World Static Dataset

**Files:**
- Create: `src/types/roadmap.ts`
- Create: `src/data/curriculum/worlds.json`
- Test: `tests/unit/data/curriculum.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface RoadmapNode {
    id: string;
    worldId: string;
    order: number;
    titleVi: string;
    titleEn: string;
    descriptionVi: string;
    descriptionEn: string;
    gameType: string;
    gameRoute: string;
    gameParams: Record<string, any>;
    targetScore: number;
    xpReward: number;
    bonusStars: number;
    isBossCheckpoint: boolean;
    prerequisites: string[];
  }

  export interface RoadmapWorld {
    id: string;
    order: number;
    titleVi: string;
    titleEn: string;
    levelBadge: string;
    description: string;
    themeColor: string;
    icon: string;
    minStarsToUnlock: number;
    nodes: RoadmapNode[];
  }
  ```

- [ ] **Step 1: Write failing test for curriculum dataset and types**

```typescript
// tests/unit/data/curriculum.test.ts
import { describe, it, expect } from 'vitest';
import worldsData from '@/data/curriculum/worlds.json';
import type { RoadmapWorld } from '@/types/roadmap';

describe('Curriculum Roadmap Dataset', () => {
  const worlds = worldsData as RoadmapWorld[];

  it('contains exactly 4 CEFR-aligned worlds in ascending order', () => {
    expect(worlds).toHaveLength(4);
    expect(worlds.map((w) => w.id)).toEqual(['world-1', 'world-2', 'world-3', 'world-4']);
    expect(worlds[0].levelBadge).toBe('Pre-A1');
    expect(worlds[1].levelBadge).toBe('A1');
    expect(worlds[2].levelBadge).toBe('A2');
    expect(worlds[3].levelBadge).toBe('B1-B2');
  });

  it('ensures each world has at least 5 nodes with valid gameRoutes and unique IDs', () => {
    const allNodeIds = new Set<string>();
    worlds.forEach((world) => {
      expect(world.nodes.length).toBeGreaterThanOrEqual(5);
      const lastNode = world.nodes[world.nodes.length - 1];
      expect(lastNode.isBossCheckpoint).toBe(true);

      world.nodes.forEach((node) => {
        expect(allNodeIds.has(node.id)).toBe(false);
        allNodeIds.add(node.id);
        expect(node.worldId).toBe(world.id);
        expect(node.gameRoute.startsWith('/')).toBe(true);
        expect(node.targetScore).toBeGreaterThanOrEqual(50);
      });
    });
  });

  it('ensures the first node of world-1 has empty prerequisites', () => {
    expect(worlds[0].nodes[0].prerequisites).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/data/curriculum.test.ts`
Expected: FAIL (Cannot find module `@/data/curriculum/worlds.json` or `@/types/roadmap`)

- [ ] **Step 3: Implement `src/types/roadmap.ts` and `src/data/curriculum/worlds.json`**

Create `src/types/roadmap.ts`:
```typescript
export interface RoadmapNode {
  id: string;
  worldId: string;
  order: number;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  gameType: string;
  gameRoute: string;
  gameParams: Record<string, any>;
  targetScore: number;
  xpReward: number;
  bonusStars: number;
  isBossCheckpoint: boolean;
  prerequisites: string[];
}

export interface RoadmapWorld {
  id: string;
  order: number;
  titleVi: string;
  titleEn: string;
  levelBadge: string;
  description: string;
  themeColor: string;
  icon: string;
  minStarsToUnlock: number;
  nodes: RoadmapNode[];
}

export interface StudentNodeProgress {
  nodeId: string;
  worldId: string;
  stars: number;
  highScore: number;
  attempts: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoadmapProgressState {
  totalStars: number;
  completedNodeIds: string[];
  nodesProgress: Record<string, StudentNodeProgress>;
}
```

Create `src/data/curriculum/worlds.json` with 4 complete worlds matching the 20 mini-games (Alphabet, Numbers-Colors, Flashcard, Spelling, Sentences, Memory Match, Word Search, Grammar Detective, Vocab Defense, Crossword, Falling Words, Hangman, Wordle, Word Connect, Odd One Out, Reading, Typing, Roleplay, Pronunciation, Tenses).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/data/curriculum.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/roadmap.ts src/data/curriculum/worlds.json tests/unit/data/curriculum.test.ts
git commit -m "feat(roadmap): define curriculum types and 4-world educational dataset"
```

---

### Task 2: Pure Domain Logic & Star Calculation Engine

**Files:**
- Create: `src/lib/roadmap.ts`
- Test: `tests/unit/lib/roadmap.test.ts`

**Interfaces:**
- Consumes: `RoadmapWorld`, `RoadmapNode`, `StudentNodeProgress`, `RoadmapProgressState` from `@/types/roadmap`
- Produces:
  ```typescript
  export function calculateNodeStars(score: number, totalQuestions: number): number;
  export function isNodeUnlocked(node: RoadmapNode, progressState: RoadmapProgressState): boolean;
  export function isWorldUnlocked(world: RoadmapWorld, worlds: RoadmapWorld[], progressState: RoadmapProgressState): boolean;
  export function mergeNodeProgress(current: StudentNodeProgress | undefined, newScore: number, totalQuestions: number, nodeId: string, worldId: string): StudentNodeProgress;
  ```

- [ ] **Step 1: Write failing test for pure roadmap logic**

```typescript
// tests/unit/lib/roadmap.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateNodeStars,
  isNodeUnlocked,
  isWorldUnlocked,
  mergeNodeProgress,
} from '@/lib/roadmap';
import type { RoadmapNode, RoadmapWorld, RoadmapProgressState } from '@/types/roadmap';

describe('Roadmap Domain Engine', () => {
  describe('calculateNodeStars', () => {
    it('returns 0 stars for score under 60%', () => {
      expect(calculateNodeStars(5, 10)).toBe(0);
      expect(calculateNodeStars(59, 100)).toBe(0);
    });

    it('returns 1 star for score between 60% and 79%', () => {
      expect(calculateNodeStars(6, 10)).toBe(1);
      expect(calculateNodeStars(79, 100)).toBe(1);
    });

    it('returns 2 stars for score between 80% and 99%', () => {
      expect(calculateNodeStars(8, 10)).toBe(2);
      expect(calculateNodeStars(99, 100)).toBe(2);
    });

    it('returns 3 stars for 100% score', () => {
      expect(calculateNodeStars(10, 10)).toBe(3);
      expect(calculateNodeStars(100, 100)).toBe(3);
    });

    it('handles edge case of 0 total questions safely', () => {
      expect(calculateNodeStars(0, 0)).toBe(0);
    });
  });

  describe('isNodeUnlocked', () => {
    const mockNode: RoadmapNode = {
      id: 'w1-n2',
      worldId: 'world-1',
      order: 2,
      titleVi: 'Số 1-10',
      titleEn: 'Numbers 1-10',
      descriptionVi: '',
      descriptionEn: '',
      gameType: 'numbers-colors',
      gameRoute: '/games/numbers-colors',
      gameParams: {},
      targetScore: 60,
      xpReward: 50,
      bonusStars: 5,
      isBossCheckpoint: false,
      prerequisites: ['w1-n1'],
    };

    it('returns false when prerequisite node is not completed', () => {
      const state: RoadmapProgressState = {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      };
      expect(isNodeUnlocked(mockNode, state)).toBe(false);
    });

    it('returns true when prerequisite node is completed with >= 1 star', () => {
      const state: RoadmapProgressState = {
        totalStars: 1,
        completedNodeIds: ['w1-n1'],
        nodesProgress: {
          'w1-n1': {
            nodeId: 'w1-n1',
            worldId: 'world-1',
            stars: 1,
            highScore: 70,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isNodeUnlocked(mockNode, state)).toBe(true);
    });

    it('always unlocks nodes with empty prerequisites', () => {
      const rootNode = { ...mockNode, id: 'w1-n1', prerequisites: [] };
      const emptyState: RoadmapProgressState = {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      };
      expect(isNodeUnlocked(rootNode, emptyState)).toBe(true);
    });
  });

  describe('mergeNodeProgress', () => {
    it('initializes new progress correctly on first pass', () => {
      const progress = mergeNodeProgress(undefined, 8, 10, 'w1-n1', 'world-1');
      expect(progress.stars).toBe(2);
      expect(progress.highScore).toBe(80);
      expect(progress.attempts).toBe(1);
      expect(progress.isCompleted).toBe(true);
    });

    it('preserves higher stars and highScore when replaying with lower score', () => {
      const initial = mergeNodeProgress(undefined, 10, 10, 'w1-n1', 'world-1');
      expect(initial.stars).toBe(3);

      const replay = mergeNodeProgress(initial, 6, 10, 'w1-n1', 'world-1');
      expect(replay.stars).toBe(3); // Does NOT regress to 1
      expect(replay.highScore).toBe(100);
      expect(replay.attempts).toBe(2);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/roadmap.test.ts`
Expected: FAIL (Cannot find module `@/lib/roadmap`)

- [ ] **Step 3: Implement `src/lib/roadmap.ts`**

```typescript
import type { RoadmapNode, RoadmapWorld, RoadmapProgressState, StudentNodeProgress } from '@/types/roadmap';

export function calculateNodeStars(score: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const percentage = Math.floor((score / totalQuestions) * 100);
  if (percentage >= 100) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 60) return 1;
  return 0;
}

export function isNodeUnlocked(node: RoadmapNode, progressState: RoadmapProgressState): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) {
    return true;
  }
  return node.prerequisites.every((prereqId) => {
    const prereq = progressState.nodesProgress[prereqId];
    return prereq && prereq.isCompleted && prereq.stars >= 1;
  });
}

export function isWorldUnlocked(
  world: RoadmapWorld,
  worlds: RoadmapWorld[],
  progressState: RoadmapProgressState
): boolean {
  if (world.order === 1) return true;
  if (progressState.totalStars < world.minStarsToUnlock) return false;

  const previousWorld = worlds.find((w) => w.order === world.order - 1);
  if (!previousWorld) return true;

  const bossNode = previousWorld.nodes.find((n) => n.isBossCheckpoint);
  if (!bossNode) return true;

  const bossProgress = progressState.nodesProgress[bossNode.id];
  return !!bossProgress && bossProgress.isCompleted && bossProgress.stars >= 2;
}

export function mergeNodeProgress(
  current: StudentNodeProgress | undefined,
  newScore: number,
  totalQuestions: number,
  nodeId: string,
  worldId: string
): StudentNodeProgress {
  const percentage = totalQuestions > 0 ? Math.floor((newScore / totalQuestions) * 100) : 0;
  const newStars = calculateNodeStars(newScore, totalQuestions);
  const now = new Date().toISOString();

  if (!current) {
    return {
      nodeId,
      worldId,
      stars: newStars,
      highScore: percentage,
      attempts: 1,
      isCompleted: newStars >= 1,
      completedAt: newStars >= 1 ? now : undefined,
    };
  }

  const isNowCompleted = current.isCompleted || newStars >= 1;
  return {
    ...current,
    stars: Math.max(current.stars, newStars),
    highScore: Math.max(current.highScore, percentage),
    attempts: current.attempts + 1,
    isCompleted: isNowCompleted,
    completedAt: current.completedAt || (newStars >= 1 ? now : undefined),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/roadmap.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roadmap.ts tests/unit/lib/roadmap.test.ts
git commit -m "feat(roadmap): implement pure star calculation and unlock resolution engine"
```

---

### Task 3: Supabase Migration and Database Custom Types

**Files:**
- Create: `supabase/migrations/20260912210000_curriculum_roadmap.sql`
- Modify: `scripts/append-database-types.mjs` (append TypeScript definitions for `student_roadmap_progress`)
- Modify: `src/types/database.ts`
- Test: `tests/unit/migrations/roadmap-schema.test.ts`

**Interfaces:**
- Produces: Database table `student_roadmap_progress` with RLS and updated `Database['public']['Tables']['student_roadmap_progress']`.

- [ ] **Step 1: Write test verifying SQL migration syntax and type definitions**

```typescript
// tests/unit/migrations/roadmap-schema.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Roadmap Database Schema Migration', () => {
  const migrationPath = path.resolve('supabase/migrations/20260912210000_curriculum_roadmap.sql');

  it('exists and defines student_roadmap_progress table with proper constraints and RLS', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_roadmap_progress');
    expect(sql).toContain('CONSTRAINT uq_student_roadmap_node UNIQUE (student_id, node_id)');
    expect(sql).toContain('ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('CREATE POLICY "Teachers can view student roadmap progress in their classrooms"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/migrations/roadmap-schema.test.ts`
Expected: FAIL (file does not exist)

- [ ] **Step 3: Create migration and append custom types**

Create `supabase/migrations/20260912210000_curriculum_roadmap.sql`:
```sql
-- Migration: Curriculum Roadmap & Quest Journey Progress

CREATE TABLE IF NOT EXISTS public.student_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 0 AND stars <= 3),
  high_score INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_student_roadmap_node UNIQUE (student_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_student_id ON public.student_roadmap_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_world_node ON public.student_roadmap_progress(world_id, node_id);

ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view student roadmap progress in their classrooms"
ON public.student_roadmap_progress
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  JOIN public.classrooms c ON c.id = s.classroom_id
  WHERE s.id = student_roadmap_progress.student_id AND c.teacher_id = auth.uid()
));
```

Update `scripts/append-database-types.mjs` to preserve `student_roadmap_progress` definition and append to `src/types/database.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/migrations/roadmap-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260912210000_curriculum_roadmap.sql scripts/append-database-types.mjs src/types/database.ts tests/unit/migrations/roadmap-schema.test.ts
git commit -m "feat(migration): add student_roadmap_progress schema, indexes, and RLS"
```

---

### Task 4: Server Actions for Roadmap Progress & Analytics

**Files:**
- Create: `src/app/actions/roadmap.ts`
- Test: `tests/unit/actions/roadmap.test.ts`

**Interfaces:**
- Consumes: Supabase admin/server client from `@/lib/supabase/admin` and `@/lib/supabase/server`
- Produces:
  ```typescript
  export async function getStudentRoadmapProgressAction(classCode: string, studentName: string): Promise<{ success: boolean; data?: RoadmapProgressState; error?: string }>;
  export async function recordRoadmapNodeCompletionAction(classCode: string, studentName: string, payload: { nodeId: string; worldId: string; score: number; totalQuestions: number }): Promise<{ success: boolean; stars?: number; updatedNode?: StudentNodeProgress; error?: string }>;
  export async function syncLocalRoadmapProgressAction(classCode: string, studentName: string, localProgress: Record<string, StudentNodeProgress>): Promise<{ success: boolean; syncedCount?: number; error?: string }>;
  export async function getClassRoadmapOverviewAction(classroomId: string): Promise<{ success: boolean; data?: ClassRoadmapOverview; error?: string }>;
  ```

- [ ] **Step 1: Write failing test for roadmap server actions**

```typescript
// tests/unit/actions/roadmap.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStudentRoadmapProgressAction,
  recordRoadmapNodeCompletionAction,
  syncLocalRoadmapProgressAction,
} from '@/app/actions/roadmap';

describe('Roadmap Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid student name or class code', async () => {
    const res = await getStudentRoadmapProgressAction('', '');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('rejects record completion with negative or invalid scores', async () => {
    const res = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
      nodeId: 'w1-n1',
      worldId: 'world-1',
      score: -5,
      totalQuestions: 10,
    });
    expect(res.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/roadmap.test.ts`
Expected: FAIL (Cannot find module `@/app/actions/roadmap`)

- [ ] **Step 3: Implement `src/app/actions/roadmap.ts`**

Implement `getStudentRoadmapProgressAction`, `recordRoadmapNodeCompletionAction`, `syncLocalRoadmapProgressAction`, and `getClassRoadmapOverviewAction` with complete input validation, Supabase error handling, gamification star sync, and non-regression guarantees.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/roadmap.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/roadmap.ts tests/unit/actions/roadmap.test.ts
git commit -m "feat(actions): implement roadmap student progress and class overview server actions"
```

---

### Task 5: Client-Side Storage & Student Session Context Sync

**Files:**
- Create: `src/lib/roadmap-storage.ts`
- Modify: `src/contexts/StudentSessionContext.tsx`
- Test: `tests/unit/lib/roadmap-storage.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function getStoredRoadmapProgress(): RoadmapProgressState;
  export function saveStoredRoadmapProgress(state: RoadmapProgressState): void;
  export function recordLocalNodeCompletion(nodeId: string, worldId: string, score: number, totalQuestions: number): { state: RoadmapProgressState; stars: number };
  ```

- [ ] **Step 1: Write failing test for local storage helpers**

```typescript
// tests/unit/lib/roadmap-storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredRoadmapProgress,
  saveStoredRoadmapProgress,
  recordLocalNodeCompletion,
  ROADMAP_STORAGE_KEY,
} from '@/lib/roadmap-storage';

describe('Roadmap LocalStorage Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default empty state when nothing is stored', () => {
    const state = getStoredRoadmapProgress();
    expect(state.totalStars).toBe(0);
    expect(state.completedNodeIds).toEqual([]);
  });

  it('records local completion, updates total stars, and stores in localStorage', () => {
    const { state, stars } = recordLocalNodeCompletion('w1-n1', 'world-1', 10, 10);
    expect(stars).toBe(3);
    expect(state.totalStars).toBe(3);
    expect(state.completedNodeIds).toContain('w1-n1');

    const loaded = getStoredRoadmapProgress();
    expect(loaded.totalStars).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/roadmap-storage.test.ts`
Expected: FAIL (Cannot find module `@/lib/roadmap-storage`)

- [ ] **Step 3: Implement `src/lib/roadmap-storage.ts` and update `StudentSessionContext.tsx`**

Implement `src/lib/roadmap-storage.ts` and update `StudentSessionContext` to expose `roadmapState`, `recordNodeCompletion`, and auto-sync local progress to cloud when `joinClass()` is called.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/roadmap-storage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/roadmap-storage.ts src/contexts/StudentSessionContext.tsx tests/unit/lib/roadmap-storage.test.ts
git commit -m "feat(storage): implement local roadmap progress cache and session sync integration"
```

---

### Task 6: Visual Roadmap Journey UI & Node Modal

**Files:**
- Create: `src/components/roadmap/RoadmapNode.tsx`
- Create: `src/components/roadmap/RoadmapNodeModal.tsx`
- Create: `src/components/roadmap/WorldSelector.tsx`
- Create: `src/components/roadmap/RoadmapMap.tsx`
- Create: `src/app/roadmap/page.tsx`
- Modify: `src/app/page.tsx` (add Roadmap button in header / hero actions)
- Test: `tests/unit/components/RoadmapNode.test.tsx`

**Interfaces:**
- Consumes: `RoadmapWorld`, `RoadmapNode`, `StudentNodeProgress`
- Produces: Visual interactive map at `/roadmap`

- [ ] **Step 1: Write failing test for `RoadmapNode` rendering**

```typescript
// tests/unit/components/RoadmapNode.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoadmapNodeComponent } from '@/components/roadmap/RoadmapNode';
import type { RoadmapNode, StudentNodeProgress } from '@/types/roadmap';

describe('RoadmapNodeComponent', () => {
  const mockNode: RoadmapNode = {
    id: 'w1-n1',
    worldId: 'world-1',
    order: 1,
    titleVi: 'Bảng chữ cái',
    titleEn: 'Alphabet',
    descriptionVi: 'Học 26 chữ cái',
    descriptionEn: '',
    gameType: 'alphabet',
    gameRoute: '/games/alphabet',
    gameParams: {},
    targetScore: 60,
    xpReward: 50,
    bonusStars: 5,
    isBossCheckpoint: false,
    prerequisites: [],
  };

  it('renders completed node with 3 golden stars', () => {
    const progress: StudentNodeProgress = {
      nodeId: 'w1-n1',
      worldId: 'world-1',
      stars: 3,
      highScore: 100,
      attempts: 1,
      isCompleted: true,
    };
    render(<RoadmapNodeComponent node={mockNode} progress={progress} isUnlocked={true} isCurrent={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Bảng chữ cái')).toBeDefined();
    expect(screen.getByTestId('node-stars-3')).toBeDefined();
  });

  it('renders locked state with lock icon when isUnlocked is false', () => {
    render(<RoadmapNodeComponent node={mockNode} progress={undefined} isUnlocked={false} isCurrent={false} onSelect={vi.fn()} />);
    expect(screen.getByTestId('node-locked-icon')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/RoadmapNode.test.tsx`
Expected: FAIL (Cannot find module `@/components/roadmap/RoadmapNode`)

- [ ] **Step 3: Implement roadmap components and `/roadmap` page**

Create:
- `src/components/roadmap/RoadmapNode.tsx`
- `src/components/roadmap/RoadmapNodeModal.tsx`
- `src/components/roadmap/WorldSelector.tsx`
- `src/components/roadmap/RoadmapMap.tsx`
- `src/app/roadmap/page.tsx`
- Update `src/app/page.tsx` with prominent link to `/roadmap`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/RoadmapNode.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/roadmap/ src/app/roadmap/page.tsx src/app/page.tsx tests/unit/components/RoadmapNode.test.tsx
git commit -m "feat(ui): implement interactive curriculum roadmap map, node modal, and navigation"
```

---

### Task 7: Game Completion Integration & Post-Game Celebration

**Files:**
- Create: `src/components/roadmap/RoadmapResultBanner.tsx`
- Modify: `src/hooks/useRoadmapTracking.ts` (new hook to record roadmap node completion on game finished)
- Test: `tests/unit/components/RoadmapResultBanner.test.tsx`

**Interfaces:**
- Consumes: Query param `?roadmapNode=w1-n1`
- Produces: Post-game star celebration and return to roadmap navigation

- [ ] **Step 1: Write failing test for `RoadmapResultBanner`**

```typescript
// tests/unit/components/RoadmapResultBanner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RoadmapResultBanner } from '@/components/roadmap/RoadmapResultBanner';

describe('RoadmapResultBanner', () => {
  it('displays earned stars and unlock message when passed', () => {
    render(<RoadmapResultBanner stars={2} isNewUnlock={true} nextNodeTitle="Đếm số 1-10" />);
    expect(screen.getByText(/Đã mở khóa chặng tiếp theo!/i)).toBeDefined();
    expect(screen.getByText(/Đếm số 1-10/i)).toBeDefined();
  });

  it('displays retry encourage message when failed with 0 stars', () => {
    render(<RoadmapResultBanner stars={0} isNewUnlock={false} />);
    expect(screen.getByText(/Cần đạt tối thiểu 60% để vượt qua chặng này/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/RoadmapResultBanner.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `RoadmapResultBanner.tsx` and `useRoadmapTracking.ts`**

Implement banner with Lucide stars, confetti trigger on 3 stars, and return-to-roadmap button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/RoadmapResultBanner.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/roadmap/RoadmapResultBanner.tsx src/hooks/useRoadmapTracking.ts tests/unit/components/RoadmapResultBanner.test.tsx
git commit -m "feat(roadmap): add post-game result banner and tracking hook"
```

---

### Task 8: Teacher Roadmap Analytics View

**Files:**
- Create: `src/components/class/ClassRoadmapOverview.tsx`
- Modify: `src/app/admin/classes/[id]/page.tsx`
- Test: `tests/unit/components/ClassRoadmapOverview.test.tsx`

**Interfaces:**
- Consumes: `getClassRoadmapOverviewAction(classroomId)`
- Produces: Teacher dashboard tab showing class world progress and milestone matrix

- [ ] **Step 1: Write failing test for `ClassRoadmapOverview`**

```typescript
// tests/unit/components/ClassRoadmapOverview.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ClassRoadmapOverview } from '@/components/class/ClassRoadmapOverview';

describe('ClassRoadmapOverview Component', () => {
  it('renders world progress percentages and summary stats', () => {
    const mockOverview = {
      totalStudents: 20,
      worldProgress: [
        { worldId: 'world-1', titleVi: 'Khám phá mầm non', completionRate: 85, averageStars: 2.4 },
        { worldId: 'world-2', titleVi: 'Xây dựng nền tảng', completionRate: 40, averageStars: 1.8 },
      ],
      bottleneckNodes: [{ nodeId: 'w1-n8', titleVi: 'Đánh vần nâng cao', failRate: 35 }],
    };

    render(<ClassRoadmapOverview overview={mockOverview} />);
    expect(screen.getByText('Khám phá mầm non')).toBeDefined();
    expect(screen.getByText('85%')).toBeDefined();
    expect(screen.getByText(/Đánh vần nâng cao/)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/ClassRoadmapOverview.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `ClassRoadmapOverview.tsx` and integrate into `admin/classes/[id]`**

Implement teacher view with progress bars, student matrix, and bottleneck alerts.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/ClassRoadmapOverview.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/class/ClassRoadmapOverview.tsx src/app/admin/classes/[id]/page.tsx tests/unit/components/ClassRoadmapOverview.test.tsx
git commit -m "feat(admin): add class roadmap analytics and student progress matrix"
```

---

### Task 9: End-to-End Playwright Verification

**Files:**
- Create: `tests/e2e/curriculum-roadmap.spec.ts`

- [ ] **Step 1: Write Playwright E2E test**

```typescript
// tests/e2e/curriculum-roadmap.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Curriculum Roadmap & Quest Journey Flow', () => {
  test('allows student to view roadmap, start stage 1, and earn stars', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.locator('h1')).toContainText(/Lộ trình/i);

    // Verify World 1 is selected by default and Node 1 is unlocked
    const firstNode = page.locator('[data-testid="roadmap-node-w1-n1"]');
    await expect(firstNode).toBeVisible();

    // Click Node 1 to open preview modal
    await firstNode.click();
    const modal = page.locator('[data-testid="roadmap-node-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Bảng chữ cái|Alphabet/i);

    // Click 'Chơi ngay' CTA
    const playBtn = modal.locator('button:has-text("Chơi ngay")');
    await playBtn.click();

    // Verify navigation into the target mini-game with roadmapNode query param
    await expect(page).toHaveURL(/\/games\/alphabet\?roadmapNode=w1-n1/);
  });
});
```

- [ ] **Step 2: Run E2E test to verify**

Run: `npx playwright test tests/e2e/curriculum-roadmap.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/curriculum-roadmap.spec.ts
git commit -m "test(e2e): add Playwright verification for curriculum roadmap journey"
```
