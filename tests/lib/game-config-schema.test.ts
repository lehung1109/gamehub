// tests/lib/game-config-schema.test.ts
import { describe, it, expect } from 'vitest'
import {
  VALID_GAME_IDS,
  isValidGameId,
  getDefaultSettings,
  validateGameSettings,
} from '@/lib/game-config-schema'

describe('Game Config Schema', () => {
  it('identifies valid and invalid game IDs', () => {
    expect(VALID_GAME_IDS).toHaveLength(6)
    expect(isValidGameId('flashcard')).toBe(true)
    expect(isValidGameId('alphabet')).toBe(true)
    expect(isValidGameId('listening')).toBe(true)
    expect(isValidGameId('spelling')).toBe(true)
    expect(isValidGameId('numbers-colors')).toBe(true)
    expect(isValidGameId('sentences')).toBe(true)
    expect(isValidGameId('unknown-game')).toBe(false)
    expect(isValidGameId('')).toBe(false)
  })

  it('provides default settings for all games', () => {
    for (const gameId of VALID_GAME_IDS) {
      const defaults = getDefaultSettings(gameId)
      expect(defaults).toBeDefined()
      expect(typeof defaults).toBe('object')
    }

    expect(getDefaultSettings('flashcard')).toEqual({
      topics: [],
      wordLimit: 0,
      autoSpeak: false,
    })

    expect(getDefaultSettings('numbers-colors')).toEqual({
      numberRange: [1, 20],
      includeColors: true,
      mode: 'learn',
    })
  })

  describe('validateGameSettings', () => {
    it('rejects invalid game ID', () => {
      const res = validateGameSettings('invalid_id', {})
      expect(res.valid).toBe(false)
      expect(res.error).toContain('Invalid game ID')
    })

    it('rejects non-object raw settings', () => {
      expect(validateGameSettings('flashcard', null).valid).toBe(false)
      expect(validateGameSettings('flashcard', 'string').valid).toBe(false)
      expect(validateGameSettings('flashcard', [1, 2]).valid).toBe(false)
    })

    it('validates flashcard settings with default fallbacks and sanitizes non-string topics', () => {
      const res = validateGameSettings('flashcard', {
        topics: ['animals', 123, null, 'fruits'],
        wordLimit: 'invalid',
        autoSpeak: 1,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['animals', 'fruits'],
        wordLimit: 0,
        autoSpeak: true,
      })
    })

    it('sanitizes NaN and Infinity in limits', () => {
      const res = validateGameSettings('flashcard', {
        wordLimit: NaN,
        autoSpeak: false,
      })
      expect(res.valid).toBe(true)
      expect((res.data as any).wordLimit).toBe(0)

      const resInf = validateGameSettings('flashcard', {
        wordLimit: Infinity,
        autoSpeak: false,
      })
      expect(resInf.valid).toBe(true)
      expect((resInf.data as any).wordLimit).toBe(0)
    })

    it('validates alphabet settings uppercase and single-letter filtering', () => {
      const res = validateGameSettings('alphabet', {
        letterRange: ['a', 'B', '1', 'hello', 'c'],
        mode: 'quiz',
        autoSpeak: true,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        letterRange: ['A', 'B', 'C'],
        mode: 'quiz',
        autoSpeak: true,
      })
    })

    it('validates listening settings', () => {
      const res = validateGameSettings('listening', {
        topics: ['animals'],
        questionCount: 5,
        showHint: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['animals'],
        questionCount: 5,
        showHint: false,
      })
    })

    it('validates spelling settings', () => {
      const res = validateGameSettings('spelling', {
        topics: ['school'],
        wordLimit: 8,
        showEmoji: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['school'],
        wordLimit: 8,
        showEmoji: false,
      })
    })

    it('validates numbers-colors settings with range ordering, clamp, and NaN protection', () => {
      const res = validateGameSettings('numbers-colors', {
        numberRange: [15, 5],
        includeColors: false,
        mode: 'quiz',
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        numberRange: [5, 15],
        includeColors: false,
        mode: 'quiz',
      })

      const resNaN = validateGameSettings('numbers-colors', {
        numberRange: [NaN, 10],
      })
      expect(resNaN.valid).toBe(true)
      expect((resNaN.data as any).numberRange).toEqual([1, 10])
    })

    it('validates sentences settings', () => {
      const res = validateGameSettings('sentences', {
        categories: ['daily-actions', 'school'],
        sentenceCount: 10,
        showVietnamese: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        categories: ['daily-actions', 'school'],
        sentenceCount: 10,
        showVietnamese: false,
      })
    })
  })
})
