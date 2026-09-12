// tests/unit/actions/arena.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createLiveArenaAction,
  getLiveArenaByPinAction,
  getLiveArenaByIdAction,
  joinLiveArenaAction,
  submitArenaAnswerAction,
  advanceArenaStateAction,
  finalizeArenaAction,
} from '@/app/actions/arena'
import * as serverSupabase from '@/lib/supabase/server'
import type { ArenaQuestion } from '@/types/arena'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockQuestions: ArenaQuestion[] = [
  {
    id: 'q1',
    question: 'What is the opposite of hot?',
    options: ['Cold', 'Warm', 'Bright', 'Loud'],
    correctAnswer: 'Cold',
    timeLimitSeconds: 15,
    points: 1000,
  },
]

describe('Live Arena Server Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }

  const mockTeacher = { id: 'teacher-101', email: 'teacher@test.com' }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockTeacher }, error: null }),
      },
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
  })

  describe('createLiveArenaAction', () => {
    it('returns error if teacher is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await createLiveArenaAction({
        title: 'Vòng đấu',
        gameId: 'flashcard',
        questions: mockQuestions,
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('creates arena with 6-digit pin code and lobby status', async () => {
      const mockInsertedArena = {
        id: 'arena-999',
        pin_code: '123456',
        title: 'Vòng đấu Động vật',
        teacher_id: 'teacher-101',
        game_id: 'flashcard',
        config_id: null,
        questions: mockQuestions,
        status: 'lobby',
        current_question_index: 0,
        round_started_at: null,
        is_active: true,
        created_at: '2026-09-12T12:00:00Z',
        updated_at: '2026-09-12T12:00:00Z',
      }

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockInsertedArena, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await createLiveArenaAction({
        title: 'Vòng đấu Động vật',
        gameId: 'flashcard',
        questions: mockQuestions,
      })

      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('arena-999')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          teacher_id: 'teacher-101',
          status: 'lobby',
        })
      )
    })
  })

  describe('getLiveArenaByPinAction', () => {
    it('returns error if pin code is invalid or not found', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      }
      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await getLiveArenaByPinAction('999999')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tồn tại/i)
    })

    it('returns arena and participants for valid pin', async () => {
      const mockArena = {
        id: 'arena-1',
        pin_code: '123456',
        title: 'Room 1',
        teacher_id: 't-1',
        game_id: 'flashcard',
        config_id: null,
        questions: mockQuestions,
        status: 'lobby',
        current_question_index: 0,
        round_started_at: null,
        is_active: true,
        created_at: '2026-09-12T12:00:00Z',
        updated_at: '2026-09-12T12:00:00Z',
      }

      const mockParticipants = [
        {
          id: 'p-1',
          arena_id: 'arena-1',
          student_name: 'Bé An',
          avatar: '🦊',
          score: 100,
          streak: 1,
          answers: [],
          created_at: '2026-09-12T12:00:00Z',
          updated_at: '2026-09-12T12:00:00Z',
        },
      ]

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockArena, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockParticipants, error: null }),
        })

      const res = await getLiveArenaByPinAction('123456')
      expect(res.success).toBe(true)
      expect(res.arena?.pinCode).toBe('123456')
      expect(res.participants).toHaveLength(1)
    })
  })

  describe('getLiveArenaByIdAction', () => {
    it('returns error on empty arenaId', async () => {
      const res = await getLiveArenaByIdAction('')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/mã phòng đấu/i)
    })
  })

  describe('joinLiveArenaAction', () => {
    it('returns error on empty student name', async () => {
      const res = await joinLiveArenaAction({
        pinCode: '123456',
        studentName: '   ',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/tên học sinh/i)
    })

    it('joins participant into arena', async () => {
      const mockArena = {
        id: 'arena-1',
        pin_code: '123456',
        is_active: true,
        status: 'lobby',
        questions: mockQuestions,
      }

      const mockJoined = {
        id: 'p-new',
        arena_id: 'arena-1',
        student_name: 'Bé Minh',
        avatar: '🐼',
        score: 0,
        streak: 0,
        answers: [],
        created_at: '2026-09-12T12:00:00Z',
        updated_at: '2026-09-12T12:00:00Z',
      }

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockArena, error: null }),
        })
        .mockReturnValueOnce({
          upsert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockJoined, error: null }),
        })

      const res = await joinLiveArenaAction({
        pinCode: '123456',
        studentName: 'Bé Minh',
        avatar: '🐼',
      })

      expect(res.success).toBe(true)
      expect(res.participant?.studentName).toBe('Bé Minh')
    })
  })

  describe('submitArenaAnswerAction', () => {
    it('calculates score with speed decay and updates participant', async () => {
      const mockArena = {
        id: 'arena-1',
        questions: mockQuestions,
        status: 'in_progress',
      }

      const mockParticipant = {
        id: 'p-1',
        arena_id: 'arena-1',
        student_name: 'Bé An',
        score: 500,
        streak: 1,
        answers: [],
      }

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockArena, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockParticipant, error: null }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        })

      const res = await submitArenaAnswerAction({
        arenaId: 'arena-1',
        studentName: 'Bé An',
        questionIndex: 0,
        selectedOption: 'Cold', // Correct!
        responseTimeMs: 3000,
      })

      expect(res.success).toBe(true)
      expect(res.isCorrect).toBe(true)
      expect(res.pointsEarned).toBeGreaterThan(0)
      expect(res.newStreak).toBe(2)
    })

    it('rejects duplicate answer submissions for the same question index', async () => {
      const mockArena = {
        id: 'arena-1',
        questions: mockQuestions,
        status: 'in_progress',
      }

      const mockParticipantWithAnswer = {
        id: 'p-1',
        arena_id: 'arena-1',
        student_name: 'Bé An',
        score: 500,
        streak: 1,
        answers: [{ questionIndex: 0, selectedOption: 'Cold', isCorrect: true, pointsEarned: 800, responseTimeMs: 1200 }],
      }

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockArena, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockParticipantWithAnswer, error: null }),
        })

      const res = await submitArenaAnswerAction({
        arenaId: 'arena-1',
        studentName: 'Bé An',
        questionIndex: 0,
        selectedOption: 'Cold',
        responseTimeMs: 3000,
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đã nộp đáp án/i)
    })
  })

  describe('advanceArenaStateAction', () => {
    it('updates arena status when called by host teacher', async () => {
      const mockArena = {
        id: 'arena-1',
        teacher_id: 'teacher-101',
        status: 'lobby',
        current_question_index: 0,
      }

      const mockUpdateBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      mockUpdateBuilder.eq.mockReturnValueOnce(mockUpdateBuilder).mockResolvedValueOnce({ error: null })

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockArena, error: null }),
        })
        .mockReturnValueOnce(mockUpdateBuilder)

      const res = await advanceArenaStateAction('arena-1', 'in_progress', 0)
      expect(res.success).toBe(true)
    })
  })

  describe('finalizeArenaAction', () => {
    it('sets status to finished and returns podium rankings', async () => {
      const mockParticipants = [
        { id: '1', student_name: 'An', score: 2500, avatar: '🦊', answers: [] },
        { id: '2', student_name: 'Bình', score: 2000, avatar: '🐼', answers: [] },
        { id: '3', student_name: 'Chi', score: 1500, avatar: '🐰', answers: [] },
      ]

      const mockUpdateBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      mockUpdateBuilder.eq.mockReturnValueOnce(mockUpdateBuilder).mockResolvedValueOnce({ error: null })

      mockSupabase.from
        .mockReturnValueOnce(mockUpdateBuilder)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockParticipants, error: null }),
        })

      const res = await finalizeArenaAction('arena-1')
      expect(res.success).toBe(true)
      expect(res.podium).toHaveLength(3)
      expect(res.podium?.[0].rank).toBe(1)
      expect(res.podium?.[0].studentName).toBe('An')
      expect(res.podium?.[0].starsAwarded).toBe(15)
    })
  })
})
