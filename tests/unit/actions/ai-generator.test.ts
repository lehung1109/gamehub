// tests/unit/actions/ai-generator.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateAiVocabularyAction,
  generateAiReadingAction,
  generateAiGrammarAction,
  publishAiContentToGameConfigAction,
} from '@/app/actions/ai-generator'
import * as serverSupabase from '@/lib/supabase/server'
import * as aiEngine from '@/lib/ai-generator'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/ai-generator', () => ({
  generateAiVocabulary: vi.fn(),
  generateAiReading: vi.fn(),
  generateAiGrammar: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('AI Content Generator Server Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }

  const mockUser = { id: 'teacher-456', email: 'teacher@test.com' }

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

  describe('generateAiVocabularyAction', () => {
    it('returns error if topic is missing', async () => {
      const res = await generateAiVocabularyAction({
        topic: '   ',
        cefrLevel: 'A1',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/chủ đề/i)
    })

    it('returns error if cefrLevel is invalid', async () => {
      const res = await generateAiVocabularyAction({
        topic: 'animals',
        cefrLevel: 'C2' as unknown as 'A1',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/cefr/i)
    })

    it('calls engine and returns vocabulary items', async () => {
      const mockItems = [
        {
          id: 'v1',
          english: 'Lion',
          vietnamese: 'Sư tử',
          phonetic: '/ˈlaɪ.ən/',
          partOfSpeech: 'noun' as const,
          cefrLevel: 'A1' as const,
          topic: 'animals',
          emoji: '🦁',
          exampleSentence: 'A lion is brave.',
          exampleTranslation: 'Sư tử rất dũng cảm.',
          distractors: ['Hổ', 'Báo', 'Sói'],
        },
      ]
      vi.mocked(aiEngine.generateAiVocabulary).mockResolvedValue(mockItems)

      const res = await generateAiVocabularyAction({
        topic: 'animals',
        cefrLevel: 'A1',
        count: 1,
      })

      expect(res.success).toBe(true)
      expect(res.data).toEqual(mockItems)
      expect(aiEngine.generateAiVocabulary).toHaveBeenCalledWith({
        topic: 'animals',
        cefrLevel: 'A1',
        count: 1,
        customPrompt: undefined,
      })
    })
  })

  describe('generateAiReadingAction', () => {
    it('validates topic and calls engine', async () => {
      const mockPassage = {
        title: 'Spring Day',
        passage: 'Flowers bloom in the garden.',
        vietnameseTranslation: 'Hoa nở trong vườn.',
        cefrLevel: 'A1' as const,
        topic: 'nature',
        questions: [],
      }
      vi.mocked(aiEngine.generateAiReading).mockResolvedValue(mockPassage)

      const res = await generateAiReadingAction({
        topic: 'nature',
        cefrLevel: 'A1',
        questionCount: 3,
      })

      expect(res.success).toBe(true)
      expect(res.data).toEqual(mockPassage)
      expect(aiEngine.generateAiReading).toHaveBeenCalledWith({
        topic: 'nature',
        cefrLevel: 'A1',
        questionCount: 3,
        customPrompt: undefined,
      })
    })
  })

  describe('generateAiGrammarAction', () => {
    it('calls engine and returns grammar items', async () => {
      const mockGrammar = [
        {
          id: 'g1',
          incorrectSentence: 'She don’t know.',
          correctSentence: 'She doesn’t know.',
          errorPart: 'don’t',
          ruleExplanation: 'Use does for 3rd person singular.',
          hint: 'Look at subject she',
        },
      ]
      vi.mocked(aiEngine.generateAiGrammar).mockResolvedValue(mockGrammar)

      const res = await generateAiGrammarAction({
        focusRule: 'subject-verb-agreement',
        count: 1,
      })

      expect(res.success).toBe(true)
      expect(res.data).toEqual(mockGrammar)
    })
  })

  describe('publishAiContentToGameConfigAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await publishAiContentToGameConfigAction({
        gameId: 'flashcard',
        name: 'Flashcard Test',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('returns error if name is empty', async () => {
      const res = await publishAiContentToGameConfigAction({
        gameId: 'flashcard',
        name: '   ',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/tên cấu hình/i)
    })

    it('returns error if gameId is invalid', async () => {
      const res = await publishAiContentToGameConfigAction({
        gameId: 'unknown-game' as unknown as 'flashcard',
        name: 'My Game',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/game/i)
    })

    it('saves vocab to word_bank if saveToWordBank is true, and publishes game config', async () => {
      const mockInsertResult = { id: 'cfg-created-123', game_id: 'flashcard' }

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockInsertResult, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const vocabItems = [
        {
          id: 'v1',
          english: 'Solar',
          vietnamese: 'Mặt trời',
          phonetic: '/ˈsoʊlər/',
          partOfSpeech: 'adjective' as const,
          cefrLevel: 'A2' as const,
          topic: 'space',
          emoji: '☀️',
          exampleSentence: 'Solar energy is renewable.',
          exampleTranslation: 'Năng lượng mặt trời có thể tái tạo.',
          distractors: ['Gió', 'Nước', 'Điện'],
        },
      ]

      const res = await publishAiContentToGameConfigAction({
        gameId: 'flashcard',
        name: 'Solar System Flashcards',
        vocabItems,
        saveToWordBank: true,
      })

      expect(res.success).toBe(true)
      expect(res.configId).toBe('cfg-created-123')
      expect(mockSupabase.from).toHaveBeenCalledWith('word_bank')
      expect(mockSupabase.from).toHaveBeenCalledWith('game_configs')
    })
  })
})
