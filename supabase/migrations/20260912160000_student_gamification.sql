-- supabase/migrations/20260912160000_student_gamification.sql
-- Migration: Cloud-Synced Student Gamification (Streaks, Inventory, Quests)

CREATE TABLE IF NOT EXISTS public.student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  streak_state JSONB NOT NULL DEFAULT '{
    "currentStreak": 0,
    "longestStreak": 0,
    "lastActiveDate": "",
    "freezeCount": 1,
    "totalActiveDays": 0,
    "unlockedMilestones": []
  }'::jsonb,
  inventory JSONB NOT NULL DEFAULT '{
    "ownedItemIds": [],
    "equippedFrameId": null,
    "equippedTitleId": null,
    "spentStars": 0,
    "bonusStars": 0
  }'::jsonb,
  quests JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row Level Security
ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;

-- Teachers can view gamification records of students in their classrooms
CREATE POLICY "Teachers can view student gamification in their classrooms"
ON public.student_gamification
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  JOIN public.classrooms c ON c.id = s.classroom_id
  WHERE s.id = student_gamification.student_id AND c.teacher_id = auth.uid()
));

-- Trigger: Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_student_gamification_updated_at ON public.student_gamification;
CREATE TRIGGER set_student_gamification_updated_at
  BEFORE UPDATE ON public.student_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
