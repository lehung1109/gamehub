import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import type {
  Database,
  StudentRoadmapProgressRow,
  StudentRoadmapProgressInsert,
  StudentRoadmapProgressUpdate,
} from '@/types/database'

describe('Roadmap Database Schema Migration', () => {
  const migrationPath = path.resolve('supabase/migrations/20260912210000_curriculum_roadmap.sql')

  it('exists and defines student_roadmap_progress table with proper constraints and RLS', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_roadmap_progress')
    expect(sql).toContain('student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('stars INTEGER NOT NULL CHECK (stars >= 0 AND stars <= 3)')
    expect(sql).toContain('CONSTRAINT uq_student_roadmap_node UNIQUE (student_id, node_id)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_roadmap_student_id ON public.student_roadmap_progress(student_id)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_roadmap_world_node ON public.student_roadmap_progress(world_id, node_id)')
    expect(sql).toContain('ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "Teachers can view student roadmap progress in their classrooms"')
  })

  it('verifies Database type definitions for student_roadmap_progress', () => {
    type DBTable = Database['public']['Tables']['student_roadmap_progress']
    const row: DBTable['Row'] = {
      id: 'mock-id-1',
      student_id: 'mock-student-1',
      world_id: 'world-1',
      node_id: 'node-1',
      stars: 3,
      high_score: 950,
      attempts: 2,
      is_completed: true,
      completed_at: '2026-09-12T12:00:00Z',
      created_at: '2026-09-12T10:00:00Z',
      updated_at: '2026-09-12T12:00:00Z',
    }
    expect(row.node_id).toBe('node-1')
    expect(row.stars).toBe(3)
    expect(row.is_completed).toBe(true)
  })

  it('exports helper types StudentRoadmapProgressRow, Insert, and Update', () => {
    const row: StudentRoadmapProgressRow = {
      id: 'mock-id-2',
      student_id: 'mock-student-2',
      world_id: 'world-2',
      node_id: 'node-2',
      stars: 1,
      high_score: 500,
      attempts: 1,
      is_completed: false,
      completed_at: null,
      created_at: '2026-09-12T10:00:00Z',
      updated_at: '2026-09-12T10:00:00Z',
    }

    const insert: StudentRoadmapProgressInsert = {
      student_id: 'mock-student-2',
      world_id: 'world-2',
      node_id: 'node-2',
      stars: 1,
    }

    const update: StudentRoadmapProgressUpdate = {
      stars: 2,
      is_completed: true,
    }

    expect(row.stars).toBe(1)
    expect(insert.student_id).toBe('mock-student-2')
    expect(update.stars).toBe(2)
  })
})
