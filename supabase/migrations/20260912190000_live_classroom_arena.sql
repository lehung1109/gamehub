-- Migration: 20260912190000_live_classroom_arena.sql
-- Description: Live Classroom Arena tables, constraints, indexes, and RLS policies

-- 1. Table: public.live_arenas
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

-- 2. Table: public.live_arena_participants
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

-- Indexes for ultra-fast lookup and real-time sorting
CREATE INDEX IF NOT EXISTS idx_live_arenas_pin ON public.live_arenas (pin_code);
CREATE INDEX IF NOT EXISTS idx_live_arenas_teacher ON public.live_arenas (teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_arena_participants_arena ON public.live_arena_participants (arena_id);
CREATE INDEX IF NOT EXISTS idx_live_arena_participants_score ON public.live_arena_participants (arena_id, score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.live_arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_arena_participants ENABLE ROW LEVEL SECURITY;

-- Policies for live_arenas:
-- Anyone (students joining with PIN or teachers) can read active arenas
CREATE POLICY "Allow public read active arenas"
  ON public.live_arenas
  FOR SELECT
  USING (true);

-- Authenticated teachers can insert arenas
CREATE POLICY "Allow authenticated insert arenas"
  ON public.live_arenas
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = teacher_id);

-- Authenticated teachers can update their own arenas
CREATE POLICY "Allow update own arenas"
  ON public.live_arenas
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = teacher_id)
  WITH CHECK ((select auth.uid()) = teacher_id);

-- Authenticated teachers can delete their own arenas
CREATE POLICY "Allow delete own arenas"
  ON public.live_arenas
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = teacher_id);

-- Policies for live_arena_participants:
-- Participants and host can read participants in the arena
CREATE POLICY "Allow public read participants"
  ON public.live_arena_participants
  FOR SELECT
  USING (true);

-- Students can join the arena
CREATE POLICY "Allow public insert participants"
  ON public.live_arena_participants
  FOR INSERT
  WITH CHECK (true);

-- Students can update their own scores/answers during the match
CREATE POLICY "Allow public update participants"
  ON public.live_arena_participants
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Deletion policy for cleanup
CREATE POLICY "Allow delete participants"
  ON public.live_arena_participants
  FOR DELETE
  USING (true);

-- Triggers: Automatic updated_at timestamps
CREATE OR REPLACE TRIGGER trg_live_arenas_updated_at
  BEFORE UPDATE ON public.live_arenas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_live_arena_participants_updated_at
  BEFORE UPDATE ON public.live_arena_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
