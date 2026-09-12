-- supabase/migrations/20260912180000_centralized_word_bank.sql
-- Migration: Centralized Word Bank for Vocabulary Management & AI Content Generator

-- Table: public.word_bank
CREATE TABLE IF NOT EXISTS public.word_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  english TEXT NOT NULL,
  vietnamese TEXT NOT NULL,
  phonetic TEXT,
  part_of_speech TEXT NOT NULL DEFAULT 'noun' CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'phrase')),
  cefr_level TEXT NOT NULL DEFAULT 'A1' CHECK (cefr_level IN ('Pre-A1', 'A1', 'A2', 'B1', 'B2')),
  topic TEXT NOT NULL DEFAULT 'general',
  emoji TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  distractors TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for search, filter, and RLS performance
CREATE INDEX IF NOT EXISTS idx_word_bank_english ON public.word_bank (LOWER(TRIM(english)));
CREATE INDEX IF NOT EXISTS idx_word_bank_topic ON public.word_bank (topic);
CREATE INDEX IF NOT EXISTS idx_word_bank_cefr ON public.word_bank (cefr_level);
CREATE INDEX IF NOT EXISTS idx_word_bank_created_by ON public.word_bank (created_by);

-- Enable Row Level Security
ALTER TABLE public.word_bank ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Read: Any authenticated user can read words
CREATE POLICY "Allow authenticated read word_bank"
  ON public.word_bank
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Insert: Authenticated users can insert their own non-system words
CREATE POLICY "Allow authenticated insert word_bank"
  ON public.word_bank
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by AND is_system = false);

-- 3. Update: Teachers can update words they created (system words protected)
CREATE POLICY "Allow update own words in word_bank"
  ON public.word_bank
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by AND is_system = false)
  WITH CHECK ((select auth.uid()) = created_by AND is_system = false);

-- 4. Delete: Teachers can delete words they created (system words protected)
CREATE POLICY "Allow delete own words in word_bank"
  ON public.word_bank
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by AND is_system = false);

-- Trigger: Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_word_bank_updated_at ON public.word_bank;
CREATE TRIGGER trg_word_bank_updated_at
  BEFORE UPDATE ON public.word_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
