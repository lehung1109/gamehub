// tests/unit/migrations/live-classroom-arena-schema.test.ts

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import type {
  LiveArena,
  LiveArenaParticipant,
  ArenaQuestion,
  ArenaParticipantAnswer,
} from '@/types/arena'
import type { Database } from '@/types/database'

describe('live_classroom_arena migration and TypeScript definitions', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20260912190000_live_classroom_arena.sql'
  )

  it('migration file exists and contains tables, indexes, constraints, and RLS policies', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Table creation
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.live_arenas')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.live_arena_participants')

    // live_arenas columns
    expect(sql).toContain('pin_code TEXT NOT NULL UNIQUE')
    expect(sql).toContain('title TEXT NOT NULL')
    expect(sql).toContain('teacher_id UUID REFERENCES auth.users(id)')
    expect(sql).toContain('game_id TEXT NOT NULL')
    expect(sql).toContain('questions JSONB NOT NULL DEFAULT')
    expect(sql).toContain('status TEXT NOT NULL DEFAULT')
    expect(sql).toContain("CHECK (status IN ('lobby', 'in_progress', 'reveal', 'leaderboard', 'finished', 'cancelled'))")
    expect(sql).toContain('current_question_index INT NOT NULL DEFAULT 0')
    expect(sql).toContain('round_started_at TIMESTAMPTZ')
    expect(sql).toContain('is_active BOOLEAN NOT NULL DEFAULT true')

    // live_arena_participants columns
    expect(sql).toContain('arena_id UUID NOT NULL REFERENCES public.live_arenas(id) ON DELETE CASCADE')
    expect(sql).toContain('student_name TEXT NOT NULL')
    expect(sql).toContain('class_code TEXT')
    expect(sql).toContain('avatar TEXT NOT NULL DEFAULT')
    expect(sql).toContain('score INT NOT NULL DEFAULT 0')
    expect(sql).toContain('streak INT NOT NULL DEFAULT 0')
    expect(sql).toContain('answers JSONB NOT NULL DEFAULT')
    expect(sql).toContain('CONSTRAINT uq_arena_participant UNIQUE (arena_id, student_name)')

    // Indexes
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_live_arenas_pin ON public.live_arenas (pin_code)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_live_arenas_teacher ON public.live_arenas (teacher_id)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_live_arena_participants_arena ON public.live_arena_participants (arena_id)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_live_arena_participants_score ON public.live_arena_participants (arena_id, score DESC)')

    // RLS
    expect(sql).toContain('ALTER TABLE public.live_arenas ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('ALTER TABLE public.live_arena_participants ENABLE ROW LEVEL SECURITY')

    // Security & scalar caching check
    expect(sql).toContain('(select auth.uid()) = teacher_id')

    // Triggers
    expect(sql).toContain('trg_live_arenas_updated_at')
    expect(sql).toContain('trg_live_arena_participants_updated_at')
  })

  it('validates TypeScript arena types compile and match schema', () => {
    const mockQuestion: ArenaQuestion = {
      id: 'q-1',
      question: 'What is a baby cat called?',
      options: ['Kitten', 'Puppy', 'Cub', 'Calf'],
      correctAnswer: 'Kitten',
      explanation: 'A baby cat is called a kitten.',
      timeLimitSeconds: 15,
      points: 1000,
    }

    const mockAnswer: ArenaParticipantAnswer = {
      questionIndex: 0,
      selectedOption: 'Kitten',
      isCorrect: true,
      responseTimeMs: 2500,
      pointsEarned: 950,
    }

    const mockParticipant: LiveArenaParticipant = {
      id: 'part-123',
      arenaId: 'arena-456',
      studentName: 'Bé An',
      classCode: 'CLASS1',
      avatar: '🦊',
      score: 950,
      streak: 1,
      answers: [mockAnswer],
      createdAt: '2026-09-12T12:00:00Z',
      updatedAt: '2026-09-12T12:00:00Z',
    }

    const mockArena: LiveArena = {
      id: 'arena-456',
      pinCode: '749201',
      title: 'Vòng đấu Từ vựng Động vật',
      teacherId: 'teacher-1',
      gameId: 'flashcard',
      configId: null,
      questions: [mockQuestion],
      status: 'in_progress',
      currentQuestionIndex: 0,
      roundStartedAt: '2026-09-12T12:00:00Z',
      isActive: true,
      createdAt: '2026-09-12T12:00:00Z',
      updatedAt: '2026-09-12T12:00:00Z',
    }

    expect(mockArena.pinCode).toBe('749201')
    expect(mockParticipant.studentName).toBe('Bé An')
    expect(mockQuestion.options).toHaveLength(4)
  })

  it('ensures Database public Tables includes live_arenas and live_arena_participants', () => {
    type DB = Database['public']['Tables']
    type ArenasTable = DB['live_arenas']
    type ParticipantsTable = DB['live_arena_participants']

    const checkArenas: keyof ArenasTable['Row'] = 'pin_code'
    const checkParticipants: keyof ParticipantsTable['Row'] = 'student_name'

    expect(checkArenas).toBe('pin_code')
    expect(checkParticipants).toBe('student_name')
  })
})
