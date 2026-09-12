-- supabase/migrations/20260912200000_student_certificates.sql
-- Migration for Student Progress Certificates & Awards

CREATE TABLE IF NOT EXISTS public.student_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('vocab_master', 'streak_champion', 'arena_victor', 'course_completion', 'custom')),
  title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  achievement_text TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_note TEXT,
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Foreign key indexes and code lookup index
CREATE INDEX IF NOT EXISTS idx_student_certificates_student ON public.student_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_classroom ON public.student_certificates(classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_code ON public.student_certificates(verification_code);

-- Enable RLS
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- Teachers can manage certificates for their classrooms
CREATE POLICY "Teachers can manage certificates for their classrooms"
  ON public.student_certificates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_certificates.classroom_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_certificates.classroom_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  );

-- Public can view valid certificates by verification code or for student verification
CREATE POLICY "Public can view valid certificates"
  ON public.student_certificates
  FOR SELECT
  TO public
  USING (true);
