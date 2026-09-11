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
    expect(VALID_GAME_IDS).toHaveLength(19)
    expect(isValidGameId('flashcard')).toBe(true)
    expect(isValidGameId('alphabet')).toBe(true)
    expect(isValidGameId('listening')).toBe(true)
    expect(isValidGameId('spelling')).toBe(true)
    expect(isValidGameId('numbers-colors')).toBe(true)
    expect(isValidGameId('sentences')).toBe(true)
    expect(isValidGameId('reading')).toBe(true)
    expect(isValidGameId('typing')).toBe(true)
    expect(isValidGameId('roleplay')).toBe(true)
    expect(isValidGameId('memory-match')).toBe(true)
    expect(isValidGameId('word-search')).toBe(true)
    expect(isValidGameId('wordle')).toBe(true)
    expect(isValidGameId('word-connect')).toBe(true)
    expect(isValidGameId('odd-one-out')).toBe(true)
    expect(isValidGameId('grammar-detective')).toBe(true)
    expect(isValidGameId('vocab-defense')).toBe(true)
    expect(isValidGameId('crossword')).toBe(true)
    expect(isValidGameId('falling-words')).toBe(true)
    expect(isValidGameId('hangman')).toBe(true)
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

    expect(getDefaultSettings('memory-match')).toEqual({
      topics: ['animals', 'fruits', 'family', 'school', 'body-parts'],
      pairCount: 6,
      autoSpeak: true,
      showTimer: true,
    })

    expect(getDefaultSettings('word-search')).toEqual({
      topics: ['animals', 'fruits', 'family', 'school', 'body-parts'],
      wordCount: 5,
      enableHints: true,
      autoSpeak: true,
      showTimer: true,
    })

    expect(getDefaultSettings('grammar-detective')).toEqual({
      rankTiers: ['intern', 'junior', 'senior', 'chief'],
      allowHints: true,
      showExplanations: true,
    })

    expect(getDefaultSettings('vocab-defense')).toEqual({
      difficulty: 'medium',
      initialHearts: 3,
      showHints: true,
    })

    expect(getDefaultSettings('crossword')).toEqual({
      topics: ['animals', 'fruits', 'school', 'family', 'jobs'],
      gridSize: 'medium',
      allowHints: true,
    })

    expect(getDefaultSettings('falling-words')).toEqual({
      speed: 'medium',
      wordTopics: ['animals', 'fruits', 'school'],
      lives: 3,
    })

    expect(getDefaultSettings('hangman')).toEqual({
      topics: ['animals', 'fruits', 'school', 'sports'],
      maxBalloons: 6,
      allowHints: true,
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
      expect((res.data as unknown as Record<string, unknown>).wordLimit).toBe(0)

      const resInf = validateGameSettings('flashcard', {
        wordLimit: Infinity,
        autoSpeak: false,
      })
      expect(resInf.valid).toBe(true)
      expect((resInf.data as unknown as Record<string, unknown>).wordLimit).toBe(0)
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
      expect((resNaN.data as unknown as Record<string, unknown>).numberRange).toEqual([1, 10])
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

    it('validates memory-match settings with defaults and sanitizes inputs', () => {
      const res = validateGameSettings('memory-match', {
        topics: ['animals', 999, 'fruits'],
        pairCount: 8,
        autoSpeak: false,
        showTimer: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['animals', 'fruits'],
        pairCount: 8,
        autoSpeak: false,
        showTimer: false,
      })

      const resDefault = validateGameSettings('memory-match', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        topics: ['animals', 'fruits', 'family', 'school', 'body-parts'],
        pairCount: 6,
        autoSpeak: true,
        showTimer: true,
      })
    })

    it('validates word-search settings with defaults and sanitizes inputs', () => {
      const res = validateGameSettings('word-search', {
        topics: ['animals', 123, 'fruits'],
        wordCount: 6,
        enableHints: false,
        autoSpeak: false,
        showTimer: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['animals', 'fruits'],
        wordCount: 6,
        enableHints: false,
        autoSpeak: false,
        showTimer: false,
      })

      const resDefault = validateGameSettings('word-search', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        topics: ['animals', 'fruits', 'family', 'school', 'body-parts'],
        wordCount: 5,
        enableHints: true,
        autoSpeak: true,
        showTimer: true,
      })
    })

    it('validates odd-one-out settings with defaults and sanitizes inputs', () => {
      const res = validateGameSettings('odd-one-out', {
        difficulty: ['easy', 'invalid_diff', 'hard'],
        questionCount: 15,
        allowHints: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        difficulty: ['easy', 'hard'],
        questionCount: 15,
        allowHints: false,
      })

      const resDefault = validateGameSettings('odd-one-out', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        difficulty: ['easy', 'medium', 'hard'],
        questionCount: 10,
        allowHints: true,
      })
    })

    it('validates reading settings with clamping and defaults', () => {
      const res = validateGameSettings('reading', {
        difficulty: 2,
        showTranslation: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        difficulty: 2,
        showTranslation: false,
      })

      const resDefault = validateGameSettings('reading', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        difficulty: 1,
        showTranslation: true,
      })
    })

    it('validates typing settings with defaults and sanitizes non-string topics', () => {
      const res = validateGameSettings('typing', {
        topics: ['tech', 123, null, 'daily'],
        timeLimitSeconds: 120,
        showVirtualKeyboard: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['tech', 'daily'],
        timeLimitSeconds: 120,
        showVirtualKeyboard: false,
      })

      const resDefault = validateGameSettings('typing', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        topics: [],
        timeLimitSeconds: 60,
        showVirtualKeyboard: true,
      })
    })

    it('validates roleplay settings with defaults and sanitization', () => {
      const res = validateGameSettings('roleplay', {
        difficulty: 3,
        autoSpeak: false,
        scenarioTopic: 'restaurant',
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        difficulty: 3,
        autoSpeak: false,
        scenarioTopic: 'restaurant',
      })

      const resDefault = validateGameSettings('roleplay', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        difficulty: 1,
        autoSpeak: true,
        scenarioTopic: 'all',
      })
    })

    it('validates grammar-detective settings with tier filtering and defaults', () => {
      const res = validateGameSettings('grammar-detective', {
        rankTiers: ['junior', 'alien-rank', 'chief'],
        allowHints: false,
        showExplanations: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        rankTiers: ['junior', 'chief'],
        allowHints: false,
        showExplanations: false,
      })

      const resDefault = validateGameSettings('grammar-detective', {})
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        rankTiers: ['intern', 'junior', 'senior', 'chief'],
        allowHints: true,
        showExplanations: true,
      })
    })

    it('validates vocab-defense settings with difficulty fallback and hearts clamping', () => {
      const res = validateGameSettings('vocab-defense', {
        difficulty: 'hard',
        initialHearts: 4,
        showHints: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        difficulty: 'hard',
        initialHearts: 4,
        showHints: false,
      })

      const resClamp = validateGameSettings('vocab-defense', {
        difficulty: 'invalid_mode',
        initialHearts: 99,
      })
      expect(resClamp.valid).toBe(true)
      expect(resClamp.data).toEqual({
        difficulty: 'medium',
        initialHearts: 5,
        showHints: true,
      })
    })

    it('validates crossword settings with grid size fallback and defaults', () => {
      const res = validateGameSettings('crossword', {
        topics: ['jobs', 'food'],
        gridSize: 'large',
        allowHints: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['jobs', 'food'],
        gridSize: 'large',
        allowHints: false,
      })

      const resDefault = validateGameSettings('crossword', {
        gridSize: 'super-large',
      })
      expect(resDefault.valid).toBe(true)
      expect(resDefault.data).toEqual({
        topics: ['animals', 'fruits', 'school', 'family', 'jobs'],
        gridSize: 'medium',
        allowHints: true,
      })
    })

    it('validates falling-words settings with speed fallback and lives clamping', () => {
      const res = validateGameSettings('falling-words', {
        speed: 'fast',
        wordTopics: ['animals'],
        lives: 5,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        speed: 'fast',
        wordTopics: ['animals'],
        lives: 5,
      })

      const resClamp = validateGameSettings('falling-words', {
        speed: 'sonic',
        lives: 0,
      })
      expect(resClamp.valid).toBe(true)
      expect(resClamp.data).toEqual({
        speed: 'medium',
        wordTopics: ['animals', 'fruits', 'school'],
        lives: 1,
      })
    })

    it('validates hangman settings with balloons clamping and defaults', () => {
      const res = validateGameSettings('hangman', {
        topics: ['sports'],
        maxBalloons: 4,
        allowHints: false,
      })
      expect(res.valid).toBe(true)
      expect(res.data).toEqual({
        topics: ['sports'],
        maxBalloons: 4,
        allowHints: false,
      })

      const resClamp = validateGameSettings('hangman', {
        maxBalloons: 20,
      })
      expect(resClamp.valid).toBe(true)
      expect(resClamp.data).toEqual({
        topics: ['animals', 'fruits', 'school', 'sports'],
        maxBalloons: 8,
        allowHints: true,
      })
    })
  })
})
