import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Parent Portal Schema Migration Verification', () => {
  const migrationPath = path.resolve(
    'supabase/migrations/20260913120000_parent_portal_tables.sql'
  )

  it('migration file exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  it('defines student_parent_access table with RLS, foreign keys, and indexes', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_parent_access')
    expect(sql).toContain('REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('REFERENCES public.classrooms(id) ON DELETE CASCADE')
    expect(sql).toContain('access_pin VARCHAR(8) NOT NULL')
    expect(sql).toContain('access_token VARCHAR(64) NOT NULL UNIQUE')
    expect(sql).toContain('ALTER TABLE public.student_parent_access ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('idx_student_parent_access_classroom')
    expect(sql).toContain('idx_student_parent_access_pin')
  })

  it('defines classroom_announcements table with strict RLS, categories, and priority constraints', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.classroom_announcements')
    expect(sql).toContain('REFERENCES public.classrooms(id) ON DELETE CASCADE')
    expect(sql).toContain('REFERENCES auth.users(id) ON DELETE CASCADE')
    expect(sql).toContain("CHECK (category IN ('announcement', 'homework', 'reminder', 'kudos'))")
    expect(sql).toContain("CHECK (priority IN ('normal', 'important', 'urgent'))")
    expect(sql).toContain('ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('idx_classroom_announcements_classroom')
    expect(sql).toContain('teacher_id = (SELECT auth.uid())')
    expect(sql).toContain('c.teacher_id = (SELECT auth.uid())')
  })

  it('defines announcement_acknowledgments table with unique constraint and cascade delete', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.announcement_acknowledgments')
    expect(sql).toContain('REFERENCES public.classroom_announcements(id) ON DELETE CASCADE')
    expect(sql).toContain('REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('ALTER TABLE public.announcement_acknowledgments ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CONSTRAINT uq_announcement_student UNIQUE (announcement_id, student_id)')
    expect(sql).toContain('idx_announcement_acknowledgments_student')
  })
})
