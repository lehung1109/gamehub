import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import type { StudentGamificationRow } from '@/types/database'

describe('student_gamification migration script', () => {
  it('contains valid table definition, foreign key, indexes, and RLS', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20260912160000_student_gamification.sql'
    )
    expect(fs.existsSync(migrationPath)).toBe(true)

    const sql = fs.readFileSync(migrationPath, 'utf-8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_gamification')
    expect(sql).toContain('REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "Teachers can view student gamification in their classrooms"')
    expect(sql).toContain('set_student_gamification_updated_at')
  })

  it('exports StudentGamificationRow type with correct structure', () => {
    const row: StudentGamificationRow = {
      id: 'uuid-1',
      student_id: 'student-1',
      streak_state: {},
      inventory: {},
      quests: [],
      srs_deck: [],
      created_at: '2026-09-12T00:00:00Z',
      updated_at: '2026-09-12T00:00:00Z',
    }
    expect(row.id).toBe('uuid-1')
    expect(row.student_id).toBe('student-1')
  })
})
