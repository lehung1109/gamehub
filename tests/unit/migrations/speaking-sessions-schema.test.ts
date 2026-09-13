// tests/unit/migrations/speaking-sessions-schema.test.ts

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import type {
  Database,
  StudentSpeakingSessionRow,
  StudentSpeakingSessionInsert,
  StudentSpeakingSessionUpdate,
} from '@/types/database'

describe('student_speaking_sessions migration and TypeScript definitions', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20260912230000_speaking_partner.sql'
  )

  it('migration file exists and contains table, indexes, constraints, and RLS policies', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    const normalizedSql = sql.replace(/\s+/g, ' ')

    // Table creation
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_speaking_sessions')

    // Columns & constraints
    expect(sql).toContain('id UUID PRIMARY KEY DEFAULT gen_random_uuid()')
    expect(sql).toContain('student_id UUID REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('scenario_id TEXT NOT NULL')
    expect(sql).toContain("persona_id TEXT NOT NULL DEFAULT 'sunny'")
    expect(sql).toContain('total_turns INT NOT NULL DEFAULT 0')
    expect(sql).toContain('overall_score INT NOT NULL DEFAULT 0')
    expect(sql).toContain('pronunciation_score INT NOT NULL DEFAULT 0')
    expect(sql).toContain('fluency_score INT NOT NULL DEFAULT 0')
    expect(sql).toContain('stars INT NOT NULL DEFAULT 1 CHECK (stars BETWEEN 1 AND 3)')
    expect(sql).toContain("turns_transcript JSONB NOT NULL DEFAULT '[]'::jsonb")
    expect(sql).toContain("mispronounced_words JSONB NOT NULL DEFAULT '[]'::jsonb")
    expect(sql).toContain("created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())")
    expect(sql).toContain("updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())")

    // Indexes
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_speaking_sessions_student ON public.student_speaking_sessions(student_id)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_speaking_sessions_scenario ON public.student_speaking_sessions(scenario_id)')

    // RLS
    expect(sql).toContain('ALTER TABLE public.student_speaking_sessions ENABLE ROW LEVEL SECURITY')
    expect(normalizedSql).toContain('CREATE POLICY "Allow public read speaking sessions" ON public.student_speaking_sessions FOR SELECT USING (true)')
    expect(normalizedSql).toContain('CREATE POLICY "Allow public insert speaking sessions" ON public.student_speaking_sessions FOR INSERT WITH CHECK (true)')

    // Trigger
    expect(sql).toContain('set_speaking_sessions_updated_at')
    expect(sql).toContain('EXECUTE FUNCTION public.handle_updated_at()')
  })

  it('validates Database public Tables includes student_speaking_sessions and helper types', () => {
    type DB = Database['public']['Tables']
    type SpeakingSessionTable = DB['student_speaking_sessions']

    const mockRow: SpeakingSessionTable['Row'] = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      scenario_id: 'cafe_ordering',
      persona_id: 'sunny',
      total_turns: 4,
      overall_score: 92,
      pronunciation_score: 90,
      fluency_score: 94,
      stars: 3,
      turns_transcript: [
        {
          id: 'turn-1',
          sender: 'tutor',
          text: 'Hello! How can I help you today?',
          timestamp: '2026-09-12T23:00:00.000Z',
        },
      ],
      mispronounced_words: ['latte'],
      created_at: '2026-09-12T23:00:00.000Z',
      updated_at: '2026-09-12T23:00:00.000Z',
    }

    const mockInsert: StudentSpeakingSessionInsert = {
      scenario_id: 'cafe_ordering',
      persona_id: 'sunny',
      total_turns: 4,
      overall_score: 92,
      pronunciation_score: 90,
      fluency_score: 94,
      stars: 3,
    }

    const mockUpdate: StudentSpeakingSessionUpdate = {
      overall_score: 95,
      stars: 3,
    }

    const helperRow: StudentSpeakingSessionRow = mockRow

    expect(mockRow.scenario_id).toBe('cafe_ordering')
    expect(mockRow.stars).toBe(3)
    expect(mockInsert.scenario_id).toBe('cafe_ordering')
    expect(mockUpdate.overall_score).toBe(95)
    expect(helperRow.id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})
