# Mistake Notebook & Spaced Repetition System (SRS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Mistake Notebook ("Sổ tay từ khó") and Leitner 5-box Spaced Repetition System (SRS) that automatically pools students' wrong answers across all 20 mini-games, schedules smart reviews, and provides an interactive practice arena awarding bonus stars for mastering weak words.

**Architecture:** Database column `srs_deck JSONB` in `public.student_gamification`; pure TypeScript Leitner SRS engine in `src/lib/srs.ts`; Server Actions in `src/app/actions/srs.ts` with historical mistake backfill; hook tracking integration in `use-game-tracking.ts`; and a rich UI tab with interactive card-flipping arena in `StudentGamificationModal.tsx`.

**Tech Stack:** Next.js 16, Supabase, TypeScript, Tailwind CSS, Lucide Icons, Vitest, Testing Library, Playwright.

**Spec:** [docs/superpowers/specs/2026-09-12-mistake-notebook-srs-design.md](file:///F:/projects/gamehub/docs/superpowers/specs/2026-09-12-mistake-notebook-srs-design.md)

## Global Constraints
- Do NOT break anonymous/guest play mode (`isAnonymous = true` must fallback to local storage cache smoothly without server action network calls).
- Preserve existing games and session tracking: question results must continue flowing into `session_details` without regression.
- Audio pronunciation: every vocabulary word card must include standard `SpeakButton` audio playback.
- TDD required: write failing tests before writing implementations for each task.

---

### Task 1: Migration & Data Types for SRS Mistake Deck

**Files:**
- Create: `supabase/migrations/20260912170000_mistake_notebook_srs.sql`
- Create: `src/types/srs.ts`
- Create: `tests/unit/migrations/srs-schema.test.ts`
- Modify: `src/types/database.ts`

**Interfaces:**
- Produces: `srs_deck` column on `public.student_gamification`.
- TypeScript types: `SrsCard`, `SrsReviewInput`, `SrsReviewResult`, `MistakeDeckSummary`.

- [ ] **Step 1: Write failing schema validation test**

```typescript
// tests/unit/migrations/srs-schema.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('mistake_notebook_srs migration script', () => {
  it('contains valid ALTER TABLE adding srs_deck JSONB column', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20260912170000_mistake_notebook_srs.sql'
    )
    expect(fs.existsSync(migrationPath)).toBe(true)

    const sql = fs.readFileSync(migrationPath, 'utf-8')
    expect(sql).toContain('ALTER TABLE public.student_gamification')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS srs_deck JSONB NOT NULL DEFAULT')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/migrations/srs-schema.test.ts`  
Expected: FAIL with file not found.

- [ ] **Step 3: Create migration and types**

Create `supabase/migrations/20260912170000_mistake_notebook_srs.sql` and `src/types/srs.ts`. Update `src/types/database.ts` to include `srs_deck: Json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/migrations/srs-schema.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260912170000_mistake_notebook_srs.sql src/types/srs.ts src/types/database.ts tests/unit/migrations/srs-schema.test.ts
git commit -m "feat(migration): add srs_deck column and TypeScript definitions"
```

---

### Task 2: Core SRS Leitner Calculation & Ingestion Engine

**Files:**
- Create: `src/lib/srs.ts`
- Create: `tests/unit/lib/srs.test.ts`

**Interfaces:**
- Consumes: `SrsCard`, `SrsReviewInput`, `SrsReviewResult`, `MistakeDeckSummary` from `@/types/srs`
- Produces:
  - `calculateNextReview(currentBox: number, rating: 'hard' | 'good' | 'easy', now?: Date): { nextBox: number; nextReviewAt: string; earnedStars: number; isMastered: boolean }`
  - `ingestSessionMistakes(existingDeck: SrsCard[], mistakes: Array<{ prompt: string; correctAnswer: string; selectedAnswer?: string | null; gameType: string; topic?: string }>): SrsCard[]`
  - `getDueCards(deck: SrsCard[], now?: Date): SrsCard[]`
  - `getDeckSummary(deck: SrsCard[], now?: Date): MistakeDeckSummary`

- [ ] **Step 1: Write failing unit test for SRS logic**

Test interval progressions, rating transitions, card updates, and mistake ingestion deduplication.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/srs.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `src/lib/srs.ts`**

Implement:
- Intervals: Box 1 (24h), Box 2 (72h), Box 3 (7d), Box 4 (14d), Box 5 (30d / Mastered).
- Hard rating -> resets to Box 1, due in 24h.
- Good rating -> +1 Box.
- Easy rating -> +2 Boxes (or +1 if Box >= 4).
- Reaching Box 5 awards 3 bonus stars.
- Card ID normalization: `${gameType}_${prompt.trim().toLowerCase()}`.
- Summary metrics calculation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/srs.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/srs.ts tests/unit/lib/srs.test.ts
git commit -m "feat(srs): implement Leitner SRS algorithm and mistake ingestion engine"
```

---

### Task 3: Server Actions for SRS Mistake Deck & Backfill

**Files:**
- Create: `src/app/actions/srs.ts`
- Create: `tests/unit/actions/srs.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` from `@/lib/supabase/admin`, `src/lib/srs.ts`
- Produces:
  - `getStudentSrsDeckAction(input: { classCode: string; studentName: string }): Promise<{ success: boolean; deck: SrsCard[]; summary: MistakeDeckSummary; error?: string }>`
  - `submitSrsReviewBatchAction(input: { classCode: string; studentName: string; reviews: SrsReviewInput[] }): Promise<{ success: boolean; updatedCards: SrsCard[]; earnedStars: number; summary: MistakeDeckSummary; error?: string }>`
  - `syncSrsDeckAction(input: { classCode: string; studentName: string; deck: SrsCard[] }): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Write failing unit tests for SRS server actions**

Test deck retrieval, backfill from `session_details` where `is_correct = false`, and batch reviews with star rewards.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/srs.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `src/app/actions/srs.ts`**

Implement action handlers with classroom validation, student lookup, auto-backfill from historical `session_details`, and bonus stars updates.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/srs.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/srs.ts tests/unit/actions/srs.test.ts
git commit -m "feat(actions): implement SRS deck server actions with historical backfill"
```

---

### Task 4: Automatic Ingestion in Game Tracking & Local Storage Fallback

**Files:**
- Create: `src/lib/srs-storage.ts`
- Modify: `src/hooks/use-game-tracking.ts`
- Create: `tests/unit/lib/srs-storage.test.ts`
- Modify: `tests/unit/use-game-tracking.test.tsx`

**Interfaces:**
- Consumes: `ingestSessionMistakes` from `@/lib/srs`, `syncSrsDeckAction` from `@/app/actions/srs`
- Produces:
  - `getStoredSrsDeck(classCode?: string, studentName?: string): SrsCard[]`
  - `saveStoredSrsDeck(classCode?: string, studentName?: string, deck: SrsCard[]): void`
  - Automatic ingestion of wrong questions into the student's local and cloud SRS deck when submitting game sessions.

- [ ] **Step 1: Write failing test for SRS storage helpers and tracking ingestion**

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/srs-storage.test.ts tests/unit/use-game-tracking.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement `srs-storage.ts` and update `use-game-tracking.ts`**

When `finalDetails.some(d => !d.isCorrect)`:
1. Extract incorrect questions.
2. Ingest into local SRS deck via `ingestSessionMistakes`.
3. Save to local storage cache.
4. If in classroom session, dispatch non-blocking `syncSrsDeckAction`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/srs-storage.test.ts tests/unit/use-game-tracking.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/srs-storage.ts src/hooks/use-game-tracking.ts tests/unit/lib/srs-storage.test.ts tests/unit/use-game-tracking.test.tsx
git commit -m "feat(tracking): ingest wrong questions into SRS mistake deck"
```

---

### Task 5: Mistake Notebook Tab & Interactive Practice Arena

**Files:**
- Create: `src/components/student/MistakeNotebookTab.tsx`
- Create: `src/components/student/SrsPracticeArena.tsx`
- Modify: `src/components/student/StudentGamificationModal.tsx`
- Create: `tests/components/student/MistakeNotebookTab.test.tsx`

**Interfaces:**
- Consumes: `SrsCard`, `submitSrsReviewBatchAction`, `getStudentSrsDeckAction`, `SpeakButton`
- Produces:
  - "Sổ tay" tab in `StudentGamificationModal` with search, filter (game type, mastery status), audio listen button, and "Luyện tập ngay" CTA.
  - Interactive Flashcard Flip practice arena with self-evaluation buttons (Khó / Nhớ tốt / Rất dễ) and celebration screen.

- [ ] **Step 1: Write component tests for MistakeNotebookTab**

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/student/MistakeNotebookTab.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement components and wire into `StudentGamificationModal`**

Implement `MistakeNotebookTab.tsx` and `SrsPracticeArena.tsx`. Add `'notebook'` to `TabType` in `StudentGamificationModal.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/student/MistakeNotebookTab.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/student/MistakeNotebookTab.tsx src/components/student/SrsPracticeArena.tsx src/components/student/StudentGamificationModal.tsx tests/components/student/MistakeNotebookTab.test.tsx
git commit -m "feat(ui): add MistakeNotebookTab and SrsPracticeArena to StudentGamificationModal"
```

---

### Task 6: Due Cards Badge & Playwright E2E Test

**Files:**
- Create: `src/components/student/MistakeNotebookBadge.tsx`
- Modify: `src/app/page.tsx`, `src/app/games/layout.tsx`, `src/app/play/layout.tsx`
- Create: `tests/e2e/mistake-notebook-srs.spec.ts`

**Interfaces:**
- Produces:
  - Top bar shortcut badge `MistakeNotebookBadge` displaying book icon and due card count (e.g. `📖 3 từ cần ôn`) which opens modal directly to the notebook tab.
  - E2E Playwright test validating mistake creation, review flow, and star bonus celebration.

- [ ] **Step 1: Implement `MistakeNotebookBadge.tsx` and embed into layouts**

- [ ] **Step 2: Write Playwright E2E test `tests/e2e/mistake-notebook-srs.spec.ts`**

- [ ] **Step 3: Run full verification**

Run:
- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npx playwright test tests/e2e/mistake-notebook-srs.spec.ts`
Expected: 100% PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/student/MistakeNotebookBadge.tsx src/app/page.tsx src/app/games/layout.tsx src/app/play/layout.tsx tests/e2e/mistake-notebook-srs.spec.ts
git commit -m "feat(ui): add MistakeNotebookBadge and Playwright E2E test suite"
```
