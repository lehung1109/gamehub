-- supabase/migrations/20260913120000_parent_portal_tables.sql
-- Migration for Parent Portal & Classroom Communication Hub

-- 1. Table: student_parent_access
CREATE TABLE IF NOT EXISTS public.student_parent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  access_pin VARCHAR(8) NOT NULL,
  access_token VARCHAR(64) NOT NULL UNIQUE,
  parent_phone TEXT,
  parent_name TEXT,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for student_parent_access (student_id and access_token already indexed by UNIQUE constraints)
CREATE INDEX IF NOT EXISTS idx_student_parent_access_classroom ON public.student_parent_access(classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_parent_access_pin ON public.student_parent_access(access_pin);

-- Enable RLS
ALTER TABLE public.student_parent_access ENABLE ROW LEVEL SECURITY;

-- Teachers can manage parent access for their classrooms
CREATE POLICY "Teachers can manage parent access for their classrooms"
  ON public.student_parent_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_parent_access.classroom_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_parent_access.classroom_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  );

-- 2. Table: classroom_announcements
CREATE TABLE IF NOT EXISTS public.classroom_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- NULL = whole class
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'announcement' CHECK (category IN ('announcement', 'homework', 'reminder', 'kudos')),
  priority VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for classroom_announcements
CREATE INDEX IF NOT EXISTS idx_classroom_announcements_classroom ON public.classroom_announcements(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_announcements_teacher ON public.classroom_announcements(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classroom_announcements_student ON public.classroom_announcements(student_id);

-- Enable RLS
ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY;

-- Teachers can manage announcements strictly for classrooms they own
CREATE POLICY "Teachers can manage announcements for their classrooms"
  ON public.classroom_announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_announcements.classroom_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    teacher_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_announcements.classroom_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  );

-- 3. Table: announcement_acknowledgments
CREATE TABLE IF NOT EXISTS public.announcement_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.classroom_announcements(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_name TEXT,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_announcement_student UNIQUE (announcement_id, student_id)
);

-- Indexes for announcement_acknowledgments (announcement_id covered by uq_announcement_student leading column)
CREATE INDEX IF NOT EXISTS idx_announcement_acknowledgments_student ON public.announcement_acknowledgments(student_id);

-- Enable RLS
ALTER TABLE public.announcement_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Teachers can view acknowledgments for their classrooms
CREATE POLICY "Teachers can view acknowledgments for their classrooms"
  ON public.announcement_acknowledgments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_announcements a
      JOIN public.classrooms c ON c.id = a.classroom_id
      WHERE a.id = announcement_acknowledgments.announcement_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  );
