-- Migration: 20260912220000_pvp_duels.sql
-- Description: Realtime Student 1v1 Duels & Matchmaking table, indexes, and RLS policies

CREATE TABLE IF NOT EXISTS public.pvp_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) NOT NULL UNIQUE,
  topic TEXT NOT NULL DEFAULT 'mixed',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'in_progress', 'finished', 'cancelled')),
  
  -- Player 1 (Creator / Host)
  player1_name TEXT NOT NULL,
  player1_avatar TEXT NOT NULL DEFAULT '🦊',
  player1_score INT NOT NULL DEFAULT 0,
  player1_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Player 2 (Challenger / Opponent)
  player2_name TEXT,
  player2_avatar TEXT DEFAULT '🐼',
  player2_score INT NOT NULL DEFAULT 0,
  player2_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  current_question_index INT NOT NULL DEFAULT 0,
  winner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for room lookup and status matchmaking
CREATE INDEX IF NOT EXISTS idx_pvp_duels_code ON public.pvp_duels(code);
CREATE INDEX IF NOT EXISTS idx_pvp_duels_status ON public.pvp_duels(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pvp_duels ENABLE ROW LEVEL SECURITY;

-- Policies for public room creation, discovery, and state sync
CREATE POLICY "Allow public read duels"
  ON public.pvp_duels FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert duels"
  ON public.pvp_duels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update duels"
  ON public.pvp_duels FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Ensure handle_updated_at helper function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automatic updated_at timestamp
DROP TRIGGER IF EXISTS set_pvp_duels_updated_at ON public.pvp_duels;
CREATE TRIGGER set_pvp_duels_updated_at
  BEFORE UPDATE ON public.pvp_duels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
