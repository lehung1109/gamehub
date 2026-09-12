// tests/unit/actions/word-bank.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getWordBankWordsAction,
  createWordBankWordAction,
  bulkCreateWordBankWordsAction,
  deleteWordBankWordAction,
} from '@/app/actions/word-bank'
import * as serverSupabase from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Word Bank Server Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }

  const mockUser = { id: 'teacher-123', email: 'teacher@test.com' }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
  })

  describe('getWordBankWordsAction', () => {
    it('returns error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await getWordBankWordsAction({})
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('queries word bank with filters and returns mapped items', async () => {
      const mockRows = [
        {
          id: 'wb-1',
          english: 'Galaxy',
          vietnamese: 'Thiên hà',
          phonetic: '/ˈɡæləksi/',
          part_of_speech: 'noun',
          cefr_level: 'B1',
          topic: 'space',
          emoji: '🌌',
          example_sentence: 'Our galaxy is huge.',
          example_translation: 'Thiên hà của chúng ta rất rộng lớn.',
          distractors: ['Hành tinh', 'Sao chổi'],
          created_by: 'teacher-123',
          is_system: false,
          created_at: '2026-09-12T10:00:00Z',
          updated_at: '2026-09-12T10:00:00Z',
        },
      ]

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockRows, count: 1, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await getWordBankWordsAction({
        search: 'gal',
        topic: 'space',
        cefrLevel: 'B1',
        partOfSpeech: 'noun',
        page: 1,
        pageSize: 10,
      })

      expect(res.success).toBe(true)
      expect(res.data).toHaveLength(1)
      expect(res.data?.[0]).toEqual({
        id: 'wb-1',
        english: 'Galaxy',
        vietnamese: 'Thiên hà',
        phonetic: '/ˈɡæləksi/',
        partOfSpeech: 'noun',
        cefrLevel: 'B1',
        topic: 'space',
        emoji: '🌌',
        exampleSentence: 'Our galaxy is huge.',
        exampleTranslation: 'Thiên hà của chúng ta rất rộng lớn.',
        distractors: ['Hành tinh', 'Sao chổi'],
        createdBy: 'teacher-123',
        isSystem: false,
        createdAt: '2026-09-12T10:00:00Z',
        updatedAt: '2026-09-12T10:00:00Z',
      })
      expect(res.total).toBe(1)
    })
  })

  describe('createWordBankWordAction', () => {
    it('returns error on invalid or empty fields', async () => {
      const res1 = await createWordBankWordAction({ english: '', vietnamese: 'Từ' })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/từ tiếng Anh/i)

      const res2 = await createWordBankWordAction({ english: 'Hello', vietnamese: '' })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/nghĩa tiếng Việt/i)

      const res3 = await createWordBankWordAction({
        english: 'Hello',
        vietnamese: 'Xin chào',
        cefrLevel: 'INVALID' as unknown as 'A1',
      })
      expect(res3.success).toBe(false)
      expect(res3.error).toMatch(/CEFR/i)
    })

    it('inserts new word with created_by set to authenticated user', async () => {
      const insertedRow = {
        id: 'new-id',
        english: 'Universe',
        vietnamese: 'Vũ trụ',
        phonetic: '/ˈjuː.nɪ.vɜːs/',
        part_of_speech: 'noun',
        cefr_level: 'B1',
        topic: 'space',
        emoji: '✨',
        example_sentence: 'The universe is expanding.',
        example_translation: 'Vũ trụ đang giãn nở.',
        distractors: ['Trái đất', 'Hệ mặt trời'],
        created_by: 'teacher-123',
        is_system: false,
        created_at: '2026-09-12T10:00:00Z',
        updated_at: '2026-09-12T10:00:00Z',
      }

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: insertedRow, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await createWordBankWordAction({
        english: 'Universe',
        vietnamese: 'Vũ trụ',
        phonetic: '/ˈjuː.nɪ.vɜːs/',
        partOfSpeech: 'noun',
        cefrLevel: 'B1',
        topic: 'space',
        emoji: '✨',
        exampleSentence: 'The universe is expanding.',
        exampleTranslation: 'Vũ trụ đang giãn nở.',
        distractors: ['Trái đất', 'Hệ mặt trời'],
      })

      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('new-id')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          english: 'Universe',
          created_by: 'teacher-123',
          is_system: false,
        })
      )
    })
  })

  describe('bulkCreateWordBankWordsAction', () => {
    it('returns error if words array is empty or exceeds 50', async () => {
      const resEmpty = await bulkCreateWordBankWordsAction([])
      expect(resEmpty.success).toBe(false)
      expect(resEmpty.error).toMatch(/danh sách/i)

      const largeList = Array(51).fill({ english: 'test', vietnamese: 'thử' })
      const resLarge = await bulkCreateWordBankWordsAction(largeList)
      expect(resLarge.success).toBe(false)
      expect(resLarge.error).toMatch(/50/i)
    })

    it('inserts words in bulk and returns count', async () => {
      const mockQueryBuilder = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await bulkCreateWordBankWordsAction([
        { english: 'Sun', vietnamese: 'Mặt trời', cefrLevel: 'A1', topic: 'space' },
        { english: 'Moon', vietnamese: 'Mặt trăng', cefrLevel: 'A1', topic: 'space' },
      ])

      expect(res.success).toBe(true)
      expect(res.count).toBe(2)
      expect(mockQueryBuilder.insert).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteWordBankWordAction', () => {
    it('returns error when wordId is missing or empty', async () => {
      const res = await deleteWordBankWordAction('')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/id/i)
    })

    it('deletes the word for current user where is_system is false', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      // Chain: from('word_bank').delete().eq('id', wordId).eq('created_by', user.id).eq('is_system', false)
      mockQueryBuilder.eq
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockResolvedValueOnce({ error: null })

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await deleteWordBankWordAction('wb-target')
      expect(res.success).toBe(true)
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
    })
  })
})
