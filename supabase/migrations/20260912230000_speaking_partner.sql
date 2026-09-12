-- supabase/migrations/20260912230000_speaking_partner.sql
-- Migration: AI Speaking Partner & Interactive Speech Practice Sessions

CREATE TABLE IF NOT EXISTS public.student_speaking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  persona_id TEXT NOT NULL DEFAULT 'sunny',
  total_turns INT NOT NULL DEFAULT 0,
  overall_score INT NOT NULL DEFAULT 0,
  pronunciation_score INT NOT NULL DEFAULT 0,
  fluency_score INT NOT NULL DEFAULT 0,
  stars INT NOT NULL DEFAULT 1 CHECK (stars BETWEEN 1 AND 3),
  turns_transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  mispronounced_words JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_speaking_sessions_student ON public.student_speaking_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_speaking_sessions_scenario ON public.student_speaking_sessions(scenario_id);

-- Row Level Security (RLS)
ALTER TABLE public.student_speaking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read speaking sessions"
  ON public.student_speaking_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert speaking sessions"
  ON public.student_speaking_sessions
  FOR INSERT
  WITH CHECK (true);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_speaking_sessions_updated_at ON public.student_speaking_sessions;
CREATE TRIGGER set_speaking_sessions_updated_at
  BEFORE UPDATE ON public.student_speaking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
