// tests/unit/actions/duels.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createDuelRoomAction,
  joinDuelRoomAction,
  getDuelStateAction,
  submitDuelAnswerAction,
  createRematchAction,
} from '@/app/actions/duels'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Duel Server Actions', () => {
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>
  }

  const sampleQuestions = [
    {
      id: 'q1',
      prompt: 'Từ "Cat" có nghĩa là gì?',
      options: ['Con mèo', 'Con chó', 'Con heo', 'Con vịt'],
      correctAnswer: 'Con mèo',
      explanationVi: '"Cat" /kæt/ có nghĩa là "Con mèo"',
    },
    {
      id: 'q2',
      prompt: 'Từ "Dog" có nghĩa là gì?',
      options: ['Con chó', 'Con mèo', 'Con heo', 'Con vịt'],
      correctAnswer: 'Con chó',
      explanationVi: '"Dog" /dɒɡ/ có nghĩa là "Con chó"',
    },
  ]

  const sampleDuelRow = {
    id: 'duel-uuid-1',
    code: 'ROOM01',
    topic: 'animals',
    questions: sampleQuestions,
    status: 'waiting',
    player1_name: 'Alice',
    player1_avatar: '🦊',
    player1_score: 0,
    player1_answers: [],
    player2_name: null,
    player2_avatar: '🐼',
    player2_score: 0,
    player2_answers: [],
    current_question_index: 0,
    winner_name: null,
    created_at: '2026-09-12T12:00:00Z',
    updated_at: '2026-09-12T12:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('createDuelRoomAction', () => {
    it('rejects create room with empty player name', async () => {
      const res1 = await createDuelRoomAction({ playerName: '', avatar: '🦊' })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/tên người chơi/i)

      const res2 = await createDuelRoomAction({ playerName: '   ', avatar: '🦊' })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tên người chơi/i)
    })

    it('creates a duel room with valid inputs and defaults', async () => {
      const single = vi.fn().mockResolvedValue({
        data: sampleDuelRow,
        error: null,
      })
      const select = vi.fn().mockReturnValue({ single })
      const insert = vi.fn().mockReturnValue({ select })
      mockSupabase.from.mockReturnValue({ insert })

      const res = await createDuelRoomAction({
        playerName: 'Alice',
      })

      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.id).toBe('duel-uuid-1')
      expect(res.data?.player1.name).toBe('Alice')
      expect(res.data?.player1.avatar).toBe('🦊')
      expect(res.data?.player1.score).toBe(0)
      expect(res.data?.status).toBe('waiting')
      expect(mockSupabase.from).toHaveBeenCalledWith('pvp_duels')
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          player1_name: 'Alice',
          player1_avatar: '🦊',
          status: 'waiting',
          current_question_index: 0,
        })
      )
    })

    it('handles database insertion error', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })
      const select = vi.fn().mockReturnValue({ single })
      const insert = vi.fn().mockReturnValue({ select })
      mockSupabase.from.mockReturnValue({ insert })

      const res = await createDuelRoomAction({
        playerName: 'Alice',
      })

      expect(res.success).toBe(false)
      expect(res.error).toBe('Database connection failed')
    })
  })

  describe('joinDuelRoomAction', () => {
    it('rejects join room with invalid code length', async () => {
      const res = await joinDuelRoomAction({ code: '12', playerName: 'Bob', avatar: '🐼' })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/mã phòng/i)
    })

    it('rejects join room with empty player name', async () => {
      const res = await joinDuelRoomAction({ code: 'ROOM01', playerName: '  ', avatar: '🐼' })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/tên người chơi/i)
    })

    it('returns error if room is not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })
      mockSupabase.from.mockReturnValue({ select })

      const res = await joinDuelRoomAction({ code: 'ROOM01', playerName: 'Bob' })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tìm thấy phòng/i)
    })

    it('returns error if room is not in waiting status', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { ...sampleDuelRow, status: 'in_progress' },
        error: null,
      })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })
      mockSupabase.from.mockReturnValue({ select })

      const res = await joinDuelRoomAction({ code: 'ROOM01', playerName: 'Bob' })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đã bắt đầu hoặc đã kết thúc/i)
    })

    it('returns error if player attempts to join their own room as opponent', async () => {
      const single = vi.fn().mockResolvedValue({
        data: sampleDuelRow,
        error: null,
      })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })
      mockSupabase.from.mockReturnValue({ select })

      const res = await joinDuelRoomAction({ code: 'ROOM01', playerName: 'Alice' })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/chủ phòng/i)
    })

    it('successfully joins room and updates player2 details to ready status', async () => {
      // Step 1: select existing room
      const findSingle = vi.fn().mockResolvedValue({
        data: sampleDuelRow,
        error: null,
      })
      const findEq = vi.fn().mockReturnValue({ single: findSingle })
      const select = vi.fn().mockReturnValue({ eq: findEq })

      // Step 2: update room
      const updatedRow = {
        ...sampleDuelRow,
        player2_name: 'Bob',
        player2_avatar: '🐼',
        status: 'ready',
      }
      const updateSingle = vi.fn().mockResolvedValue({
        data: updatedRow,
        error: null,
      })
      const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
      const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
      const update = vi.fn().mockReturnValue({ eq: updateEq })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'pvp_duels') {
          return { select, update }
        }
        return {}
      })

      const res = await joinDuelRoomAction({
        code: 'room01',
        playerName: 'Bob',
        avatar: '🐼',
      })

      expect(res.success).toBe(true)
      expect(res.data?.player2?.name).toBe('Bob')
      expect(res.data?.player2?.avatar).toBe('🐼')
      expect(res.data?.status).toBe('ready')
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          player2_name: 'Bob',
          player2_avatar: '🐼',
          status: 'ready',
        })
      )
    })
  })

  describe('getDuelStateAction', () => {
    it('rejects empty room code', async () => {
      const res = await getDuelStateAction('')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/mã phòng/i)
    })

    it('returns error if room not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })
      mockSupabase.from.mockReturnValue({ select })

      const res = await getDuelStateAction('ROOM01')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tìm thấy phòng/i)
    })

    it('returns duel state with mapped player scores and streaks', async () => {
      const duelWithAnswers = {
        ...sampleDuelRow,
        player2_name: 'Bob',
        player2_avatar: '🐼',
        player1_score: 180,
        player1_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 1000, pointsEarned: 180 },
        ],
        status: 'in_progress',
      }
      const single = vi.fn().mockResolvedValue({ data: duelWithAnswers, error: null })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })
      mockSupabase.from.mockReturnValue({ select })

      const res = await getDuelStateAction('ROOM01')
      expect(res.success).toBe(true)
      expect(res.data?.player1.score).toBe(180)
      expect(res.data?.player1.streak).toBe(1)
      expect(res.data?.player2?.name).toBe('Bob')
      expect(res.data?.player2?.streak).toBe(0)
      expect(res.data?.status).toBe('in_progress')
    })

    it('auto-reconciles and advances question index when both players have answered current question', async () => {
      const desyncedRow = {
        ...sampleDuelRow,
        status: 'in_progress',
        current_question_index: 0,
        player1_score: 180,
        player1_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 1000, pointsEarned: 180 },
        ],
        player2_name: 'Bob',
        player2_score: 160,
        player2_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 2000, pointsEarned: 160 },
        ],
      }

      const reconciledRow = {
        ...desyncedRow,
        current_question_index: 1,
      }

      const single = vi.fn().mockResolvedValue({ data: desyncedRow, error: null })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })

      const updateSingle = vi.fn().mockResolvedValue({ data: reconciledRow, error: null })
      const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
      const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
      const update = vi.fn().mockReturnValue({ eq: updateEq })

      mockSupabase.from.mockReturnValue({ select, update })

      const res = await getDuelStateAction('ROOM01')
      expect(res.success).toBe(true)
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          current_question_index: 1,
          status: 'in_progress',
        })
      )
      expect(res.data?.currentQuestionIndex).toBe(1)
    })
  })

  describe('submitDuelAnswerAction', () => {
    it('validates input parameters', async () => {
      const res1 = await submitDuelAnswerAction({
        duelId: '',
        playerRole: 'player1',
        questionIndex: 0,
        isCorrect: true,
        elapsedMs: 2000,
      })
      expect(res1.success).toBe(false)

      const res2 = await submitDuelAnswerAction({
        duelId: 'duel-1',
        // @ts-expect-error test invalid role
        playerRole: 'spectator',
        questionIndex: 0,
        isCorrect: true,
        elapsedMs: 2000,
      })
      expect(res2.success).toBe(false)

      const res3 = await submitDuelAnswerAction({
        duelId: 'duel-1',
        playerRole: 'player1',
        questionIndex: -1,
        isCorrect: true,
        elapsedMs: 2000,
      })
      expect(res3.success).toBe(false)
    })

    it('returns error if duel is already finished', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { ...sampleDuelRow, status: 'finished' },
        error: null,
      })
      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })
      mockSupabase.from.mockReturnValue({ select })

      const res = await submitDuelAnswerAction({
        duelId: 'duel-uuid-1',
        playerRole: 'player1',
        questionIndex: 0,
        isCorrect: true,
        elapsedMs: 2000,
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/kết thúc/i)
    })

    it('calculates score and records answer for player 1 without advancing if player 2 has not answered', async () => {
      const initialDuel = {
        ...sampleDuelRow,
        status: 'ready',
        player2_name: 'Bob',
        player1_score: 0,
        player1_answers: [],
        player2_answers: [],
      }
      const findSingle = vi.fn().mockResolvedValue({ data: initialDuel, error: null })
      const findEq = vi.fn().mockReturnValue({ single: findSingle })
      const select = vi.fn().mockReturnValue({ eq: findEq })

      const updatedRow = {
        ...initialDuel,
        status: 'in_progress',
        player1_score: 180,
        player1_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 2000, pointsEarned: 180 },
        ],
        current_question_index: 0,
      }
      const updateSingle = vi.fn().mockResolvedValue({ data: updatedRow, error: null })
      const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
      const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
      const update = vi.fn().mockReturnValue({ eq: updateEq })

      mockSupabase.from.mockReturnValue({ select, update })

      const res = await submitDuelAnswerAction({
        duelId: 'duel-uuid-1',
        playerRole: 'player1',
        questionIndex: 0,
        isCorrect: true,
        elapsedMs: 2000,
      })

      expect(res.success).toBe(true)
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          player1_score: 180, // 100 + Math.floor(100 * (1 - 2000/10000)) = 180
          current_question_index: 0,
          status: 'in_progress',
        })
      )
    })

    it('advances current_question_index when both players have answered current question', async () => {
      // Player 1 has already answered index 0
      const initialDuel = {
        ...sampleDuelRow,
        status: 'in_progress',
        player2_name: 'Bob',
        player1_score: 180,
        player1_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 2000, pointsEarned: 180 },
        ],
        player2_score: 0,
        player2_answers: [],
        current_question_index: 0,
      }
      const findSingle = vi.fn().mockResolvedValue({ data: initialDuel, error: null })
      const findEq = vi.fn().mockReturnValue({ single: findSingle })
      const select = vi.fn().mockReturnValue({ eq: findEq })

      const updatedRow = {
        ...initialDuel,
        player2_score: 150,
        player2_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 5000, pointsEarned: 150 },
        ],
        current_question_index: 1, // advanced from 0 to 1!
      }
      const updateSingle = vi.fn().mockResolvedValue({ data: updatedRow, error: null })
      const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
      const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
      const update = vi.fn().mockReturnValue({ eq: updateEq })

      mockSupabase.from.mockReturnValue({ select, update })

      const res = await submitDuelAnswerAction({
        duelId: 'duel-uuid-1',
        playerRole: 'player2',
        questionIndex: 0,
        isCorrect: true,
        elapsedMs: 5000,
      })

      expect(res.success).toBe(true)
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          current_question_index: 1,
          status: 'in_progress',
        })
      )
    })

    it('finishes duel and resolves winner when both players complete the final question', async () => {
      // 2 questions total in sampleDuelRow (indices 0 and 1)
      // On question index 1, Player 1 has answered
      const initialDuel = {
        ...sampleDuelRow,
        status: 'in_progress',
        player2_name: 'Bob',
        player1_score: 300,
        player1_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 1000, pointsEarned: 190 },
          { questionIndex: 1, isCorrect: true, elapsedMs: 3000, pointsEarned: 110 },
        ],
        player2_score: 150,
        player2_answers: [
          { questionIndex: 0, isCorrect: true, elapsedMs: 5000, pointsEarned: 150 },
        ],
        current_question_index: 1,
      }
      const findSingle = vi.fn().mockResolvedValue({ data: initialDuel, error: null })
      const findEq = vi.fn().mockReturnValue({ single: findSingle })
      const select = vi.fn().mockReturnValue({ eq: findEq })

      const updatedRow = {
        ...initialDuel,
        player2_score: 250,
        player2_answers: [
          ...initialDuel.player2_answers,
          { questionIndex: 1, isCorrect: true, elapsedMs: 5000, pointsEarned: 100 },
        ],
        status: 'finished',
        winner_name: 'Alice',
      }
      const updateSingle = vi.fn().mockResolvedValue({ data: updatedRow, error: null })
      const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
      const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
      const update = vi.fn().mockReturnValue({ eq: updateEq })

      mockSupabase.from.mockReturnValue({ select, update })

      const res = await submitDuelAnswerAction({
        duelId: 'duel-uuid-1',
        playerRole: 'player2',
        questionIndex: 1,
        isCorrect: false, // 0 points, Alice wins 300 to 150
        elapsedMs: 2000,
      })

      expect(res.success).toBe(true)
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'finished',
          winner_name: 'Alice',
        })
      )
    })
  })

  describe('createRematchAction', () => {
    it('validates oldDuelId and playerName', async () => {
      const res1 = await createRematchAction('', 'Alice')
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/mã trận đấu/i)

      const res2 = await createRematchAction('duel-1', '   ')
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tên người chơi/i)
    })

    it('creates a new rematch room copying topic and question count', async () => {
      // 1. Fetch old duel
      const oldDuelSingle = vi.fn().mockResolvedValue({
        data: sampleDuelRow,
        error: null,
      })
      const oldDuelEq = vi.fn().mockReturnValue({ single: oldDuelSingle })
      const select = vi.fn().mockReturnValue({ eq: oldDuelEq })

      // 2. Insert new duel room
      const newDuelRow = {
        ...sampleDuelRow,
        id: 'duel-uuid-2',
        code: 'REMT02',
        status: 'waiting',
      }
      const insertSingle = vi.fn().mockResolvedValue({
        data: newDuelRow,
        error: null,
      })
      const insertSelect = vi.fn().mockReturnValue({ single: insertSingle })
      const insert = vi.fn().mockReturnValue({ select: insertSelect })

      mockSupabase.from.mockReturnValue({ select, insert })

      const res = await createRematchAction('duel-uuid-1', 'Alice')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('duel-uuid-2')
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'animals',
          player1_name: 'Alice',
          status: 'waiting',
        })
      )
    })
  })
})
