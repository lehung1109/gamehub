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

-- Trigger: Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_student_roadmap_progress_updated_at ON public.student_roadmap_progress;
CREATE TRIGGER set_student_roadmap_progress_updated_at
  BEFORE UPDATE ON public.student_roadmap_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
