// tests/unit/lib/ai-generator.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateAiVocabulary,
  generateAiReading,
  generateAiGrammar,
} from '@/lib/ai-generator'

describe('AI Content Generator Engine', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.GEMINI_API_KEY
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('generateAiVocabulary', () => {
    it('generates requested number of vocabulary items using offline pedagogical fallback', async () => {
      const result = await generateAiVocabulary({
        topic: 'animals',
        cefrLevel: 'A1',
        count: 5,
      })

      expect(result).toHaveLength(5)
      for (const item of result) {
        expect(item.id).toBeDefined()
        expect(typeof item.english).toBe('string')
        expect(item.english.length).toBeGreaterThan(0)
        expect(typeof item.vietnamese).toBe('string')
        expect(item.vietnamese.length).toBeGreaterThan(0)
        expect(typeof item.phonetic).toBe('string')
        expect(['noun', 'verb', 'adjective', 'adverb', 'phrase']).toContain(item.partOfSpeech)
        expect(item.cefrLevel).toBe('A1')
        expect(item.topic.toLowerCase()).toBe('animals')
        expect(item.emoji).toBeDefined()
        expect(item.exampleSentence.length).toBeGreaterThan(0)
        expect(item.exampleTranslation.length).toBeGreaterThan(0)
        expect(item.distractors.length).toBeGreaterThanOrEqual(3)
        // Ensure distractors do not include the correct vietnamese translation
        expect(item.distractors).not.toContain(item.vietnamese)
      }
    })

    it('supports multiple CEFR levels (Pre-A1, A1, A2, B1, B2)', async () => {
      const levels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2'] as const

      for (const level of levels) {
        const result = await generateAiVocabulary({
          topic: 'school',
          cefrLevel: level,
          count: 3,
        })
        expect(result.length).toBeGreaterThan(0)
        expect(result[0].cefrLevel).toBe(level)
      }
    })

    it('falls back gracefully when given an unknown or novel topic', async () => {
      const result = await generateAiVocabulary({
        topic: 'underwater archaeology',
        cefrLevel: 'B1',
        count: 4,
      })

      expect(result).toHaveLength(4)
      expect(result[0].english).toBeDefined()
      expect(result[0].vietnamese).toBeDefined()
    })
  })

  describe('generateAiReading', () => {
    it('generates reading passage with comprehension questions', async () => {
      const result = await generateAiReading({
        topic: 'nature',
        cefrLevel: 'A2',
        questionCount: 3,
      })

      expect(result.title.length).toBeGreaterThan(0)
      expect(result.passage.length).toBeGreaterThan(20)
      expect(result.vietnameseTranslation.length).toBeGreaterThan(20)
      expect(result.cefrLevel).toBe('A2')
      expect(result.questions).toHaveLength(3)

      for (const q of result.questions) {
        expect(q.id).toBeDefined()
        expect(q.question.length).toBeGreaterThan(0)
        expect(q.options.length).toBeGreaterThanOrEqual(3)
        expect(q.options).toContain(q.correctAnswer)
        expect(q.explanation.length).toBeGreaterThan(0)
      }
    })
  })

  describe('generateAiGrammar', () => {
    it('generates grammar detective items with rules and hints', async () => {
      const result = await generateAiGrammar({
        focusRule: 'subject-verb-agreement',
        count: 4,
      })

      expect(result).toHaveLength(4)
      for (const item of result) {
        expect(item.id).toBeDefined()
        expect(item.incorrectSentence.length).toBeGreaterThan(0)
        expect(item.correctSentence.length).toBeGreaterThan(0)
        expect(item.errorPart.length).toBeGreaterThan(0)
        expect(item.ruleExplanation.length).toBeGreaterThan(0)
        expect(item.hint.length).toBeGreaterThan(0)
      }
    })

    it('generates items for tenses rule', async () => {
      const result = await generateAiGrammar({
        focusRule: 'tenses',
        count: 3,
      })

      expect(result).toHaveLength(3)
      expect(result[0].incorrectSentence).toBeDefined()
      expect(result[0].correctSentence).toBeDefined()
    })
  })

  describe('Gemini API Provider with Fallback', () => {
    it('calls Gemini REST API when GEMINI_API_KEY is present and parses response', async () => {
      process.env.GEMINI_API_KEY = 'mock-key-123'

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify([
                    {
                      english: 'Galaxy',
                      vietnamese: 'Thiên hà',
                      phonetic: '/ˈɡæləksi/',
                      partOfSpeech: 'noun',
                      cefrLevel: 'B1',
                      topic: 'space',
                      emoji: '🌌',
                      exampleSentence: 'The Milky Way is our home galaxy.',
                      exampleTranslation: 'Dải Ngân Hà là thiên hà quê hương của chúng ta.',
                      distractors: ['Hành tinh', 'Ngôi sao', 'Mặt trăng'],
                    },
                  ]),
                },
              ],
            },
          },
        ],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await generateAiVocabulary({
        topic: 'space',
        cefrLevel: 'B1',
        count: 1,
      })

      expect(global.fetch).toHaveBeenCalled()
      expect(result).toHaveLength(1)
      expect(result[0].english).toBe('Galaxy')
      expect(result[0].vietnamese).toBe('Thiên hà')
    })

    it('falls back to offline pedagogical generator if Gemini API returns an error', async () => {
      process.env.GEMINI_API_KEY = 'mock-key-123'

      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection timeout'))

      const result = await generateAiVocabulary({
        topic: 'animals',
        cefrLevel: 'A1',
        count: 3,
      })

      // Should not throw, should fall back cleanly
      expect(result).toHaveLength(3)
      expect(result[0].english.length).toBeGreaterThan(0)
    })
  })
})
