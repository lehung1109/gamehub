# Technical Design Specification: Phase 4 — Live Classroom Arena (Multiplayer / Kahoot-style Real-Time Arena)

**Date:** 2026-09-12  
**Status:** Approved  
**Author:** Antigravity AI  

---

## 1. Executive Summary

Phase 4 of the autonomous GameHub master roadmap delivers the **Live Classroom Arena**: a real-time, interactive multiplayer competition system designed for English classroom engagement. Teachers can project the arena onto a classroom smartboard or TV, while students join simultaneously from their phones, tablets, or laptops by entering a 6-digit PIN code. 

Key features include:
1. **Teacher Host Command Center** with full-screen projection, live participant lobby, timer controls, answer distribution histograms, and animated 3D-style podium ceremony.
2. **Student Mobile-First Arena Client** featuring 4-color responsive Kahoot-style answer tiles, instant tactile feedback, speed-decay score calculations, and streak multipliers.
3. **Seamless Content Ingestion** directly from Phase 3's Centralized Word Bank or existing Game Configurations (Flashcards, Reading, Grammar Detective).
4. **Gamification Integration** awarding star and XP rewards directly into the student's cloud-synced profile upon podium conclusion.
5. **Dual Architecture (Supabase Realtime + Robust Fallback)** guaranteeing 100% test reliability and offline resilience.

---

## 2. Architecture & Data Flow

```
+------------------------+                        +------------------------+
|      Teacher Host      |                        |     Student Client     |
| (/admin/arena/[id])    |                        | (/arena/[pin])         |
+-----------+------------+                        +-----------+------------+
            |                                                 |
            | 1. Create arena (PIN, questions)                | 2. Join with PIN & Name
            v                                                 v
+--------------------------------------------------------------------------+
|                  Supabase PostgreSQL & Realtime Channel                  |
|  - public.live_arenas (status: lobby -> in_progress -> reveal -> end)    |
|  - public.live_arena_participants (score, streak, answers JSONB)         |
|  - Realtime Channel `arena:{pin}` (Broadcasts: ROUND_START, SUBMIT, etc.)|
+--------------------------------------------------------------------------+
            |                                                 |
            | 3. Broadcast question countdown                 | 4. Submit answer with responseTime
            v                                                 v
+--------------------------------------------------------------------------+
|                Synchronized Reveal & Leaderboard Broadcast               |
|  - Teacher view shows answer distribution graph and top 5 rankers        |
|  - Student view displays personal rank, points earned, streak flame      |
|  - Grand Podium Ceremony (1st, 2nd, 3rd) & Star rewards payout           |
+--------------------------------------------------------------------------+
```

---

## 3. Database Schema Migration

### `supabase/migrations/20260912190000_live_classroom_arena.sql`

```sql
-- Table: public.live_arenas
CREATE TABLE IF NOT EXISTS public.live_arenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL DEFAULT 'flashcard',
  config_id UUID REFERENCES public.game_configs(id) ON DELETE SET NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_progress', 'reveal', 'leaderboard', 'finished', 'cancelled')),
  current_question_index INT NOT NULL DEFAULT 0,
  round_started_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.live_arena_participants
CREATE TABLE IF NOT EXISTS public.live_arena_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arena_id UUID NOT NULL REFERENCES public.live_arenas(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_code TEXT,
  avatar TEXT NOT NULL DEFAULT '🦊',
  score INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_arena_participant UNIQUE (arena_id, student_name)
);

-- Indexes for lightning queries
CREATE INDEX IF NOT EXISTS idx_live_arenas_pin ON public.live_arenas (pin_code);
CREATE INDEX IF NOT EXISTS idx_live_arenas_teacher ON public.live_arenas (teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_arena_participants_arena ON public.live_arena_participants (arena_id);
CREATE INDEX IF NOT EXISTS idx_live_arena_participants_score ON public.live_arena_participants (arena_id, score DESC);

-- Enable RLS
ALTER TABLE public.live_arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_arena_participants ENABLE ROW LEVEL SECURITY;

-- Policies for live_arenas
CREATE POLICY "Allow public read active arenas"
  ON public.live_arenas
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert arenas"
  ON public.live_arenas
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = teacher_id);

CREATE POLICY "Allow update own arenas"
  ON public.live_arenas
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = teacher_id)
  WITH CHECK ((select auth.uid()) = teacher_id);

CREATE POLICY "Allow delete own arenas"
  ON public.live_arenas
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = teacher_id);

-- Policies for live_arena_participants
CREATE POLICY "Allow public read participants"
  ON public.live_arena_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert participants"
  ON public.live_arena_participants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update participants"
  ON public.live_arena_participants
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete participants"
  ON public.live_arena_participants
  FOR DELETE
  USING (true);

-- Updated_at triggers
CREATE OR REPLACE TRIGGER trg_live_arenas_updated_at
  BEFORE UPDATE ON public.live_arenas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_live_arena_participants_updated_at
  BEFORE UPDATE ON public.live_arena_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 4. TypeScript Interfaces (`src/types/arena.ts`)

```typescript
export type ArenaStatus = 'lobby' | 'in_progress' | 'reveal' | 'leaderboard' | 'finished' | 'cancelled';

export interface ArenaQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctAnswer: string;
  explanation?: string;
  timeLimitSeconds: number; // e.g. 15
  points: number; // e.g. 1000
}

export interface ArenaParticipantAnswer {
  questionIndex: number;
  selectedOption: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
}

export interface LiveArenaParticipant {
  id: string;
  arenaId: string;
  studentName: string;
  classCode?: string | null;
  avatar: string;
  score: number;
  streak: number;
  answers: ArenaParticipantAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface LiveArena {
  id: string;
  pinCode: string;
  title: string;
  teacherId?: string | null;
  gameId: string;
  configId?: string | null;
  questions: ArenaQuestion[];
  status: ArenaStatus;
  currentQuestionIndex: number;
  roundStartedAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. Scoring & Streak Engine (`src/lib/arena/scoring.ts`)

1. **Speed Decay Formula**:
   - `maxPoints = 1000`
   - `timeRatio = Math.min(responseTimeMs / (timeLimitSeconds * 1000), 1)`
   - Base points: `Math.round(maxPoints * (1 - (timeRatio * 0.5)))` (ensures at least 500 points for correct answers even at the last second).
2. **Streak Bonus**:
   - 1 correct: 1.0x
   - 2 in a row: 1.1x (+10%)
   - 3 in a row: 1.2x (+20%)
   - 4 in a row: 1.3x (+30%)
   - 5+ in a row: 1.5x (+50% max streak flame)
3. **Podium Star Rewards**:
   - 1st Place: +15 Stars
   - 2nd Place: +10 Stars
   - 3rd Place: +5 Stars
   - All Finishers: +2 Stars

---

## 6. Server Actions & Realtime Sync (`src/app/actions/arena.ts`)

- `createLiveArenaAction(input: CreateArenaInput)`
- `getLiveArenaByPinAction(pinCode: string)`
- `getLiveArenaByIdAction(arenaId: string)`
- `joinLiveArenaAction(input: JoinArenaInput)`
- `submitArenaAnswerAction(input: SubmitAnswerInput)`
- `advanceArenaStateAction(arenaId: string, status: ArenaStatus, questionIndex?: number)`
- `finalizeArenaAction(arenaId: string)`

---

## 7. Plan Outline for SDD

- **Task 1**: Database Migration (`20260912190000_live_classroom_arena.sql`) & TypeScript types (`src/types/arena.ts`).
- **Task 2**: Arena Scoring & State Engine (`src/lib/arena/scoring.ts`) with pure deterministic unit tests.
- **Task 3**: Arena Server Actions (`src/app/actions/arena.ts`) with comprehensive unit tests.
- **Task 4**: Student Arena Experience (`/arena`, `/arena/[pin]`, `ArenaJoinForm.tsx`, `StudentArenaArena.tsx`).
- **Task 5**: Teacher Host Arena Command Center (`/admin/arena/new`, `/admin/arena/[arenaId]`, `TeacherArenaLobby.tsx`, `TeacherArenaHost.tsx`, `ArenaPodium.tsx`).
- **Task 6**: Playwright E2E & Full Regression Verification (`tests/e2e/live-classroom-arena.spec.ts`).
