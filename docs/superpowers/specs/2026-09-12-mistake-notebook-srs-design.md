# Technical Design Specification: Mistake Notebook & Spaced Repetition System (SRS) (Sub-project 9)

**Feature Branch**: `feat/mistake-notebook-srs`  
**Date**: 2026-09-12  
**Status**: Ready for Implementation Plan  

---

## 1. Executive Summary & Goals

Across GameHub's 20 mini-games, students make mistakes on vocabulary, spelling, grammar, and pronunciation. Currently, these errors are captured in `session_details` for the teacher dashboard, but **students have no way to review their personal mistakes or practice weak words**.

### Objectives
1. **Personalized Mistake Notebook ("Sổ tay từ khó")**:
   Automatically pool all mistakes that a student makes in any game into an organized personal notebook with bilingual labels, audio pronunciation, error history, and mastery status.
2. **Spaced Repetition System (SRS Engine)**:
   Implement the proven Leitner 5-box spaced repetition algorithm (Box 1: 1 day, Box 2: 3 days, Box 3: 7 days, Box 4: 14 days, Box 5: 30 days / Mastered).
3. **Interactive Practice Arena**:
   Allow students to practice their due mistake cards through an interactive flashcard review mode with audio pronunciation, self-grading (Hard / Good / Easy), and bonus star rewards (+3 stars per mastered word).
4. **Cloud Persistence & Historical Backfill**:
   Persist the SRS deck in Supabase (`student_gamification.srs_deck`) with local storage fallback for guest/anonymous players. Automatically backfill mistakes from prior `session_details` so existing students immediately get their mistake history.
5. **Seamless UI Integration**:
   Add a "Sổ tay" tab into `StudentGamificationModal` and a prominent notification badge (`📖 X từ cần ôn`) in the navigation bar when cards are due.

---

## 2. Architecture & Data Model

### 2.1 Database Schema (`supabase/migrations/20260912170000_mistake_notebook_srs.sql`)

```sql
-- Alter student_gamification to support personal SRS mistake decks
ALTER TABLE public.student_gamification 
ADD COLUMN IF NOT EXISTS srs_deck JSONB NOT NULL DEFAULT '[]'::jsonb;
```

### 2.2 TypeScript Data Types (`src/types/srs.ts`)

```typescript
export interface SrsCard {
  id: string; // Deterministic hash: `${gameType}_${normalizedPrompt}`
  prompt: string;
  correctAnswer: string;
  selectedAnswer?: string | null;
  gameType: string;
  topic?: string;
  box: number; // 1 to 5 (Leitner box)
  lastReviewedAt: string | null; // ISO 8601 string
  nextReviewAt: string; // ISO 8601 string
  mistakeCount: number;
  successCount: number;
  isMastered: boolean; // True when reaching Box 5
}

export interface SrsReviewInput {
  cardId: string;
  rating: 'hard' | 'good' | 'easy'; // hard: reset to Box 1; good: +1 box; easy: +2 boxes (or +1 if box >= 4)
}

export interface SrsReviewResult {
  updatedCard: SrsCard;
  earnedStars: number;
  newlyMastered: boolean;
}

export interface MistakeDeckSummary {
  totalCards: number;
  dueCount: number;
  masteredCount: number;
  learningCount: number; // Box 1-2
  reviewingCount: number; // Box 3-4
}
```

### 2.3 Leitner SRS Interval Calculation Rules (`src/lib/srs.ts`)

| Box Level | Interval Duration | Meaning |
| :--- | :--- | :--- |
| **Box 1** | 1 day (24 hours) | Newly made mistake or recently missed |
| **Box 2** | 3 days (72 hours) | Familiar word under initial retention |
| **Box 3** | 7 days (1 week) | Solid recall, medium-term memory |
| **Box 4** | 14 days (2 weeks) | Strong recall, long-term memory |
| **Box 5** | 30 days (1 month) | **Mastered (Thành thạo)** - Awards +3 Bonus Stars! |

- **If student chooses "Hard" (Quên / Khó)**:
  Box resets to 1. `nextReviewAt = now + 1 day`. `successCount = 0`.
- **If student chooses "Good" (Nhớ / Đúng)**:
  `box = Math.min(5, box + 1)`. `successCount += 1`.
  `nextReviewAt = now + interval(box)`.
  If reaching Box 5 and `!isMastered`: Mark `isMastered = true` and award **+3 Bonus Stars**.
- **If student chooses "Easy" (Dễ dàng)**:
  `box = Math.min(5, box + 2)`. `successCount += 1`.
  `nextReviewAt = now + interval(box)`.
  If reaching Box 5 and `!isMastered`: Mark `isMastered = true` and award **+3 Bonus Stars**.

---

## 3. Server Actions & Backend Services (`src/app/actions/srs.ts`)

1. **`getStudentSrsDeck(input: { classCode: string; studentName: string })`**:
   - Queries `student_gamification.srs_deck`.
   - If empty, runs automatic backfill by querying `game_sessions` and `session_details` where `is_correct = false` for this student, converting historical errors into Box 1 cards and saving to cloud!
   - Returns `{ success: true, deck: SrsCard[], summary: MistakeDeckSummary }`.

2. **`submitSrsReviewBatch(input: { classCode: string; studentName: string; reviews: SrsReviewInput[] })`**:
   - Applies Leitner calculations atomically.
   - Calculates total bonus stars earned from newly mastered words.
   - Updates `srs_deck` and `inventory.bonusStars` in `student_gamification`.
   - Returns updated cards and total stars earned.

3. **`syncSrsDeck(input: { classCode: string; studentName: string; deck: SrsCard[] })`**:
   - Full sync for client reconciliation.

---

## 4. Automatic Ingestion on Game Completion

In `useGameTracking` / `/api/track`:
- When a game session completes, all questions with `is_correct === false` are mapped to `SrsCard` format and merged into the student's active deck:
  - If card already exists in deck: `mistakeCount += 1`, `box = 1`, `nextReviewAt = now` (immediately eligible for review).
  - If new: inserted at Box 1.
- Synchronized to Supabase via `syncStudentGamificationState` / SRS background sync.

---

## 5. UI / UX Design

### 5.1 Tab in `StudentGamificationModal` ("Sổ tay")
- **Header KPI cards**:
  - 📖 Tổng số từ: `X`
  - ⏰ Cần ôn hôm nay: `Y`
  - 🏆 Đã thành thạo: `Z`
- **Filter & Search Bar**:
  - Filter by category / game (Tất cả, Từ vựng, Ngữ pháp, Phát âm).
  - Filter by status (Cần ôn, Đang học, Đã thuộc).
  - Search input.
- **Card Item**:
  - Word / Prompt (large, bold).
  - Pronunciation audio button (`SpeakButton`).
  - Correct answer tag + "Lần sai gần nhất: ...".
  - Leitner Box badge (`Hộp 1/5` -> `Hộp 5/5 ⭐`).
  - Action button: "Luyện tập ngay" (Bắt đầu ôn).

### 5.2 Interactive Practice Arena (`SrsPracticeArena.tsx`)
- Full-screen / focused modal mode with 3 steps:
  1. **Prompt side**: Displays word / clue / audio button.
  2. **Flip to reveal**: Displays correct answer and explanation.
  3. **Self-grading buttons**:
     - 🔴 **Khó / Chưa nhớ** (+1 ngày, Về Hộp 1)
     - 🟡 **Nhớ tốt** (+3 ngày hoặc +7 ngày, Lên 1 Hộp)
     - 🟢 **Rất dễ** (+7 ngày hoặc +14 ngày, Lên 2 Hộp)
  4. **Completion celebration**:
     - Confetti / LevelUp modal style celebration showing cards reviewed, accuracy, and bonus stars earned!

---

## 6. Testing & Quality Assurance Plan

1. **Schema test**: Verifies migration adds `srs_deck JSONB` cleanly.
2. **SRS Engine unit tests** (`tests/unit/lib/srs.test.ts`):
   - Correct interval calculation for Boxes 1-5.
   - Rating transitions (hard, good, easy).
   - Card deduplication and mistake count increments.
3. **Server Action unit tests** (`tests/unit/actions/srs.test.ts`):
   - Verification of deck retrieval and historical backfill from `session_details`.
   - Batch review submissions and bonus star accumulation.
4. **Component tests**:
   - `MistakeNotebookTab.test.tsx`: Filters, card rendering, due badges.
   - `SrsPracticeArena.test.tsx`: Card flipping, grade submission, completion screen.
5. **E2E Playwright test**:
   - Student makes mistakes in a game -> opens Mistake Notebook -> reviews words -> receives bonus stars.
