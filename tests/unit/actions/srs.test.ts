import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStudentSrsDeckAction,
  submitSrsReviewBatchAction,
  syncSrsDeckAction,
} from '@/app/actions/srs'
import * as adminSupabase from '@/lib/supabase/admin'
import type { SrsCard, SrsReviewInput } from '@/types/srs'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('SRS Server Actions', () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('Input Validation', () => {
    it('returns error on empty classCode or studentName for getStudentSrsDeckAction', async () => {
      const res1 = await getStudentSrsDeckAction({ classCode: '', studentName: 'Alice' })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/mã lớp/i)

      const res2 = await getStudentSrsDeckAction({ classCode: 'CLASS1', studentName: '   ' })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tên học sinh/i)

      const longName = 'A'.repeat(101)
      const res3 = await getStudentSrsDeckAction({ classCode: 'CLASS1', studentName: longName })
      expect(res3.success).toBe(false)
      expect(res3.error).toMatch(/100 ký tự/i)
    })

    it('returns error on empty classCode or studentName for submitSrsReviewBatchAction', async () => {
      const res1 = await submitSrsReviewBatchAction({
        classCode: '',
        studentName: 'Alice',
        reviews: [{ cardId: 'test', rating: 'good' }],
      })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/mã lớp/i)

      const res2 = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: '',
        reviews: [],
      })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tên học sinh/i)
    })

    it('returns error on non-array reviews for submitSrsReviewBatchAction', async () => {
      const res = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        reviews: null as unknown as SrsReviewInput[],
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đánh giá/i)
    })

    it('returns error on empty classCode or studentName for syncSrsDeckAction', async () => {
      const res1 = await syncSrsDeckAction({
        classCode: '',
        studentName: 'Alice',
        deck: [],
      })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/mã lớp/i)

      const res2 = await syncSrsDeckAction({
        classCode: 'CLASS1',
        studentName: '  ',
        deck: [],
      })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tên học sinh/i)
    })

    it('returns error on non-array deck for syncSrsDeckAction', async () => {
      const res = await syncSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        deck: null as unknown as SrsCard[],
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/bộ thẻ/i)
    })
  })

  describe('Classroom and Student Verification', () => {
    it('returns error when classroom is inactive or does not exist', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      const eqMock = vi.fn().mockReturnValue({ single: singleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

      mockSupabase.from.mockReturnValue({ select: selectMock })

      const res = await getStudentSrsDeckAction({
        classCode: 'INACTIVE_CODE',
        studentName: 'Alice',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/lớp học/i)
    })

    it('creates student record if student does not exist yet', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentLimitMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ limit: studentLimitMock }),
        }),
      })

      const studentInsertSingleMock = vi.fn().mockResolvedValue({ data: { id: 'new-student-id' }, error: null })
      const studentInsertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: studentInsertSingleMock }),
      })

      // Student gamification row lookup
      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'gam-1', srs_deck: [], inventory: {} },
            error: null,
          }),
        }),
      })
      const gamUpdateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      // Session details lookup for historical backfill
      const detailsLimitMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const detailsOrderMock = vi.fn().mockReturnValue({ limit: detailsLimitMock })
      const detailsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ limit: detailsLimitMock, order: detailsOrderMock }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock, insert: studentInsertMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        if (table === 'session_details') return { select: detailsSelectMock }
        return { select: vi.fn() }
      })

      const res = await getStudentSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'New Student',
      })

      expect(res.success).toBe(true)
      expect(studentInsertMock).toHaveBeenCalled()
      expect(res.deck).toEqual([])
      expect(res.summary?.totalCards).toBe(0)
    })
  })

  describe('getStudentSrsDeckAction', () => {
    it('returns existing srs_deck when already populated in student_gamification', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const existingCard: SrsCard = {
        id: 'wordle_apple',
        prompt: 'apple',
        correctAnswer: 'quả táo',
        selectedAnswer: 'quả cam',
        gameType: 'wordle',
        topic: 'fruits',
        box: 2,
        lastReviewedAt: '2026-09-12T10:00:00Z',
        nextReviewAt: '2026-09-15T10:00:00Z',
        mistakeCount: 1,
        successCount: 1,
        isMastered: false,
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [existingCard],
              inventory: {},
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await getStudentSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
      })

      expect(res.success).toBe(true)
      expect(res.deck).toHaveLength(1)
      expect(res.deck?.[0].id).toBe('wordle_apple')
      expect(res.summary?.totalCards).toBe(1)
      expect(res.summary?.learningCount).toBe(1)
    })

    it('automatically backfills from session_details when srs_deck is empty', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      // Empty srs_deck initially
      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [],
              inventory: {},
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      // Historical session_details with 2 errors (1 duplicate prompt)
      const mockDetails = [
        {
          prompt: 'Elephant',
          correct_answer: 'Con voi',
          selected_answer: 'Con hổ',
          is_correct: false,
          game_sessions: {
            id: 'sess-1',
            student_id: 's1',
            game_type: 'flashcards',
            topic: 'animals',
          },
        },
        {
          prompt: 'Elephant',
          correct_answer: 'Con voi',
          selected_answer: 'Con báo',
          is_correct: false,
          game_sessions: {
            id: 'sess-2',
            student_id: 's1',
            game_type: 'flashcards',
            topic: 'animals',
          },
        },
        {
          prompt: 'Giraffe',
          correct_answer: 'Hươu cao cổ',
          selected_answer: null,
          is_correct: false,
          game_sessions: {
            id: 'sess-3',
            student_id: 's1',
            game_type: 'wordle',
            topic: 'animals',
          },
        },
      ]

      const detailsLimitMock = vi.fn().mockResolvedValue({ data: mockDetails, error: null })
      const detailsOrderMock = vi.fn().mockReturnValue({ limit: detailsLimitMock })
      const detailsEqCorrectMock = vi.fn().mockReturnValue({ limit: detailsLimitMock, order: detailsOrderMock })
      const detailsEqStudentMock = vi.fn().mockReturnValue({ eq: detailsEqCorrectMock })
      const detailsSelectMock = vi.fn().mockReturnValue({ eq: detailsEqStudentMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        if (table === 'session_details') return { select: detailsSelectMock }
        return { select: vi.fn() }
      })

      const res = await getStudentSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
      })

      expect(res.success).toBe(true)
      expect(res.deck).toBeDefined()
      // Elephant (deduplicated) + Giraffe = 2 cards
      expect(res.deck).toHaveLength(2)

      const elephantCard = res.deck?.find(c => c.prompt === 'Elephant')
      expect(elephantCard).toBeDefined()
      expect(elephantCard?.box).toBe(1)
      expect(elephantCard?.gameType).toBe('flashcards')

      const giraffeCard = res.deck?.find(c => c.prompt === 'Giraffe')
      expect(giraffeCard).toBeDefined()
      expect(giraffeCard?.box).toBe(1)

      // Verifies update was called with the backfilled deck
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          srs_deck: expect.any(Array),
        })
      )
      expect(gamUpdateEqMock).toHaveBeenCalledWith('student_id', 's1')
      expect(res.summary?.totalCards).toBe(2)
      expect(res.summary?.learningCount).toBe(2)
    })
  })

  describe('submitSrsReviewBatchAction', () => {
    it('processes reviews, advances boxes, and awards bonus stars on graduating to Box 5', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      // Card 1: Box 4 -> 'good' review -> graduates to Box 5 (+3 stars)
      const cardGraduating: SrsCard = {
        id: 'wordle_hello',
        prompt: 'hello',
        correctAnswer: 'xin chào',
        gameType: 'wordle',
        box: 4,
        lastReviewedAt: '2026-09-01T00:00:00Z',
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 2,
        successCount: 4,
        isMastered: false,
      }

      // Card 2: Box 2 -> 'hard' review -> resets to Box 1 (0 stars)
      const cardResetting: SrsCard = {
        id: 'flashcards_world',
        prompt: 'world',
        correctAnswer: 'thế giới',
        gameType: 'flashcards',
        box: 2,
        lastReviewedAt: '2026-09-10T00:00:00Z',
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 1,
        successCount: 2,
        isMastered: false,
      }

      const initialInventory = {
        ownedItemIds: [],
        equippedFrameId: null,
        equippedTitleId: null,
        spentStars: 0,
        bonusStars: 5,
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [cardGraduating, cardResetting],
              inventory: initialInventory,
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      const res = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        reviews: [
          { cardId: 'wordle_hello', rating: 'good' },
          { cardId: 'flashcards_world', rating: 'hard' },
        ],
      })

      expect(res.success).toBe(true)
      expect(res.earnedStars).toBe(3)
      expect(res.updatedCards).toHaveLength(2)

      const updatedGraduated = res.updatedCards?.find(c => c.id === 'wordle_hello')
      expect(updatedGraduated?.box).toBe(5)
      expect(updatedGraduated?.isMastered).toBe(true)
      expect(updatedGraduated?.successCount).toBe(5)

      const updatedReset = res.updatedCards?.find(c => c.id === 'flashcards_world')
      expect(updatedReset?.box).toBe(1)
      expect(updatedReset?.isMastered).toBe(false)
      expect(updatedReset?.mistakeCount).toBe(2)
      expect(updatedReset?.successCount).toBe(0)

      // Inventory bonusStars incremented from 5 to 8 (5 + 3)
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            bonusStars: 8,
          }),
          srs_deck: expect.any(Array),
        })
      )
    })

    it('does not award stars or update inventory if no cards graduated to Box 5', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const card: SrsCard = {
        id: 'wordle_test',
        prompt: 'test',
        correctAnswer: 'kiểm tra',
        gameType: 'wordle',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
      }

      const initialInventory = {
        ownedItemIds: [],
        spentStars: 0,
        bonusStars: 10,
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [card],
              inventory: initialInventory,
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      const res = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        reviews: [{ cardId: 'wordle_test', rating: 'good' }],
      })

      expect(res.success).toBe(true)
      expect(res.earnedStars).toBe(0)
      expect(res.updatedCards?.[0].box).toBe(2)

      // Only srs_deck should be updated, inventory should not need bonusStars update
      expect(gamUpdateMock).toHaveBeenCalledWith({
        srs_deck: expect.any(Array),
      })
    })
  })

  describe('syncSrsDeckAction', () => {
    it('sanitizes cards and updates existing student_gamification record', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'gam-1' },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      const unsanitizedDeck = [
        {
          id: 'card_1',
          prompt: 'Cat',
          correctAnswer: 'Con mèo',
          box: 99, // Should clamp to valid range or default
          mistakeCount: -5, // Should sanitize
          successCount: -2,
        },
        {
          id: '', // Invalid card, should be filtered out
          prompt: '',
          correctAnswer: '',
        },
      ] as unknown as SrsCard[]

      const res = await syncSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        deck: unsanitizedDeck,
      })

      expect(res.success).toBe(true)
      expect(gamUpdateMock).toHaveBeenCalledWith({
        srs_deck: [
          expect.objectContaining({
            id: 'card_1',
            prompt: 'Cat',
            correctAnswer: 'Con mèo',
            box: 1,
            mistakeCount: 0,
            successCount: 0,
          }),
        ],
      })
      expect(gamUpdateEqMock).toHaveBeenCalledWith('student_id', 's1')
    })

    it('inserts new student_gamification record if one does not exist', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      // No gamification row
      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const gamInsertMock = vi.fn().mockResolvedValue({ error: null })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, insert: gamInsertMock }
        return { select: vi.fn() }
      })

      const validDeck: SrsCard[] = [
        {
          id: 'wordle_dog',
          prompt: 'Dog',
          correctAnswer: 'Con chó',
          gameType: 'wordle',
          box: 1,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-12T00:00:00Z',
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
        },
      ]

      const res = await syncSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        deck: validDeck,
      })

      expect(res.success).toBe(true)
      expect(gamInsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          student_id: 's1',
          srs_deck: [
            expect.objectContaining({
              id: 'wordle_dog',
              prompt: 'Dog',
              correctAnswer: 'Con chó',
            }),
          ],
        })
      )
    })
  })

  describe('Edge Cases & Additional Coverage', () => {
    it('supports positional arguments for all actions', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const card: SrsCard = {
        id: 'wordle_test',
        prompt: 'test',
        correctAnswer: 'kiểm tra',
        gameType: 'wordle',
        box: 1,
        lastReviewedAt: null,
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'gam-1', srs_deck: [card], inventory: {} },
            error: null,
          }),
        }),
      })
      const gamUpdateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      // Positional getStudentSrsDeckAction
      const getRes = await getStudentSrsDeckAction('CLASS1', 'Alice')
      expect(getRes.success).toBe(true)
      expect(getRes.deck).toHaveLength(1)

      // Positional submitSrsReviewBatchAction
      const submitRes = await submitSrsReviewBatchAction('CLASS1', 'Alice', [
        { cardId: 'wordle_test', rating: 'good' },
      ])
      expect(submitRes.success).toBe(true)

      // Positional syncSrsDeckAction
      const syncRes = await syncSrsDeckAction('CLASS1', 'Alice', [card])
      expect(syncRes.success).toBe(true)
    })

    it('handles historical backfill query error gracefully', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'gam-1', srs_deck: [], inventory: {} },
            error: null,
          }),
        }),
      })
      const gamUpdateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      // details error
      const detailsLimitMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB read error' } })
      const detailsOrderMock = vi.fn().mockReturnValue({ limit: detailsLimitMock })
      const detailsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ limit: detailsLimitMock, order: detailsOrderMock }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        if (table === 'session_details') return { select: detailsSelectMock }
        return { select: vi.fn() }
      })

      const res = await getStudentSrsDeckAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
      })

      expect(res.success).toBe(true)
      expect(res.deck).toEqual([])
      expect(res.summary?.totalCards).toBe(0)
    })

    it('awards 6 bonus stars when two cards graduate to Box 5 in one batch', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const card1: SrsCard = {
        id: 'wordle_c1',
        prompt: 'card 1',
        correctAnswer: 'thẻ 1',
        gameType: 'wordle',
        box: 4,
        lastReviewedAt: null,
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 1,
        successCount: 3,
        isMastered: false,
      }

      const card2: SrsCard = {
        id: 'wordle_c2',
        prompt: 'card 2',
        correctAnswer: 'thẻ 2',
        gameType: 'wordle',
        box: 3,
        lastReviewedAt: null,
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 1,
        successCount: 2,
        isMastered: false,
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [card1, card2],
              inventory: { bonusStars: 0 },
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      // card1: box 4 + good -> box 5 (+3 stars)
      // card2: box 3 + easy -> box 5 (+3 stars)
      const res = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        reviews: [
          { cardId: 'wordle_c1', rating: 'good' },
          { cardId: 'wordle_c2', rating: 'easy' },
        ],
      })

      expect(res.success).toBe(true)
      expect(res.earnedStars).toBe(6)
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            bonusStars: 6,
          }),
        })
      )
    })

    it('does not re-award stars if card was already mastered in Box 5', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const cardAlreadyBox5: SrsCard = {
        id: 'wordle_c5',
        prompt: 'card 5',
        correctAnswer: 'thẻ 5',
        gameType: 'wordle',
        box: 5,
        lastReviewedAt: '2026-09-01T00:00:00Z',
        nextReviewAt: '2026-09-12T00:00:00Z',
        mistakeCount: 1,
        successCount: 5,
        isMastered: true,
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [cardAlreadyBox5],
              inventory: { bonusStars: 10 },
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      const res = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        reviews: [{ cardId: 'wordle_c5', rating: 'good' }],
      })

      expect(res.success).toBe(true)
      expect(res.earnedStars).toBe(0)
      expect(res.updatedCards?.[0].box).toBe(5)
      expect(res.updatedCards?.[0].isMastered).toBe(true)
      expect(gamUpdateMock).toHaveBeenCalledWith({
        srs_deck: expect.any(Array),
      })
    })

    it('ignores reviews for cards not found in deck', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              srs_deck: [],
              inventory: {},
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, update: gamUpdateMock }
        return { select: vi.fn() }
      })

      const res = await submitSrsReviewBatchAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        reviews: [{ cardId: 'non_existent_card_id', rating: 'good' }],
      })

      expect(res.success).toBe(true)
      expect(res.earnedStars).toBe(0)
      expect(res.updatedCards).toEqual([])
    })
  })
})
