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

    it('rejects non-object settings', () => {
      const res = validateGameSettings('flashcard', 'not-an-object')
      expect(res.valid).toBe(false)
      expect(res.error).toContain('Settings must be a valid JSON object')
    })

    it('validates and sanitizes flashcard settings', () => {
      const res = validateGameSettings('flashcard', {
        topics: ['animals', 'fruits'],
        wordLimit: 10,
        autoSpeak: true,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['animals', 'fruits'],
        wordLimit: 10,
        autoSpeak: true,
      })
    })

    it('handles partial or malformed flashcard settings safely', () => {
      const res = validateGameSettings('flashcard', {
        topics: [123, 'fruits'],
        wordLimit: -5,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['fruits'],
        wordLimit: 0,
        autoSpeak: false,
      })
    })

    it('validates alphabet settings', () => {
      const res = validateGameSettings('alphabet', {
        letterRange: ['a', 'b', '1', 'C'],
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

    it('validates numbers-colors settings with range ordering and clamp', () => {
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
    })

    it('validates sentences settings', () => {
      const res = validateGameSettings('sentences', {
        categories: ['daily-actions'],
        sentenceCount: 10,
        showVietnamese: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        categories: ['daily-actions'],
        sentenceCount: 10,
        showVietnamese: false,
      })
    })
  })
})
