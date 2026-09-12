// tests/unit/lib/srs-storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getSrsStorageKey,
  parseSrsDeckJson,
  getStoredSrsDeck,
  saveStoredSrsDeck,
} from '@/lib/srs-storage'
import type { SrsCard } from '@/types/srs'

describe('srs-storage', () => {
  const sampleCard: SrsCard = {
    id: 'vocab_apple',
    prompt: 'apple',
    correctAnswer: 'quả táo',
    selectedAnswer: 'quả cam',
    gameType: 'vocab',
    topic: 'fruits',
    box: 1,
    lastReviewedAt: null,
    nextReviewAt: '2026-09-12T12:00:00.000Z',
    mistakeCount: 1,
    successCount: 0,
    isMastered: false,
  }

  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getSrsStorageKey', () => {
    it('generates proper storage key with classCode and studentName', () => {
      const key = getSrsStorageKey('class123', 'John Doe')
      expect(key).toBe('gamehub_srs_deck_v1_CLASS123_john doe')
    })

    it('trims whitespace and handles uppercase/lowercase normalization', () => {
      const key = getSrsStorageKey('  abc_456  ', '  Bé Linh  ')
      expect(key).toBe('gamehub_srs_deck_v1_ABC_456_bé linh')
    })

    it('falls back to ANON and anon when classCode or studentName is missing or empty', () => {
      expect(getSrsStorageKey()).toBe('gamehub_srs_deck_v1_ANON_anon')
      expect(getSrsStorageKey('', '')).toBe('gamehub_srs_deck_v1_ANON_anon')
      expect(getSrsStorageKey('   ', undefined)).toBe('gamehub_srs_deck_v1_ANON_anon')
      expect(getSrsStorageKey(undefined, '   ')).toBe('gamehub_srs_deck_v1_ANON_anon')
    })
  })

  describe('parseSrsDeckJson', () => {
    it('parses valid JSON array of SrsCards', () => {
      const raw = JSON.stringify([sampleCard])
      const result = parseSrsDeckJson(raw)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(sampleCard)
    })

    it('returns empty array for malformed JSON or non-string input', () => {
      expect(parseSrsDeckJson('{ invalid json')).toEqual([])
      expect(parseSrsDeckJson('')).toEqual([])
      // @ts-expect-error testing invalid type
      expect(parseSrsDeckJson(null)).toEqual([])
      // @ts-expect-error testing invalid type
      expect(parseSrsDeckJson(undefined)).toEqual([])
    })

    it('returns empty array if JSON is not an array', () => {
      expect(parseSrsDeckJson('{}')).toEqual([])
      expect(parseSrsDeckJson('123')).toEqual([])
      expect(parseSrsDeckJson('"hello"')).toEqual([])
      expect(parseSrsDeckJson('true')).toEqual([])
    })

    it('filters out invalid cards and sanitizes valid ones', () => {
      const invalidData = [
        sampleCard,
        null,
        {},
        { id: 'only_id' },
        { id: '', prompt: 'p', correctAnswer: 'c' },
        { prompt: 'missing id', correctAnswer: 'c' },
        { id: 'valid_2', prompt: 'cat', correctAnswer: 'con mèo', box: 6, mistakeCount: -2 },
      ]
      const result = parseSrsDeckJson(JSON.stringify(invalidData))
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('vocab_apple')
      expect(result[1].id).toBe('valid_2')
      expect(result[1].box).toBe(1) // clamped or defaulted to valid box 1-5
      expect(result[1].mistakeCount).toBe(0) // clamped to non-negative
    })

    it('deduplicates cards with identical IDs', () => {
      const duplicateData = [sampleCard, { ...sampleCard, prompt: 'duplicate' }]
      const result = parseSrsDeckJson(JSON.stringify(duplicateData))
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(sampleCard.id)
    })
  })

  describe('getStoredSrsDeck and saveStoredSrsDeck', () => {
    it('returns empty array when nothing is stored', () => {
      const deck = getStoredSrsDeck('cls1', 'student1')
      expect(deck).toEqual([])
    })

    it('saves and retrieves deck from localStorage', () => {
      saveStoredSrsDeck('cls1', 'student1', [sampleCard])

      const deck = getStoredSrsDeck('cls1', 'student1')
      expect(deck).toHaveLength(1)
      expect(deck[0]).toEqual(sampleCard)

      const key = getSrsStorageKey('cls1', 'student1')
      expect(window.localStorage.getItem(key)).toBe(JSON.stringify([sampleCard]))
    })

    it('handles corrupted localStorage data by returning empty array', () => {
      const key = getSrsStorageKey('cls1', 'student1')
      window.localStorage.setItem(key, 'not a valid json string')

      const deck = getStoredSrsDeck('cls1', 'student1')
      expect(deck).toEqual([])
    })

    it('operates via in-memory storage fallback when localStorage throws or is unavailable', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: localStorage restricted')
      })
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('SecurityError: localStorage restricted')
      })

      const memCard: SrsCard = { ...sampleCard, id: 'mem_card_1' }
      saveStoredSrsDeck('fallback_class', 'fallback_student', [memCard])

      const retrieved = getStoredSrsDeck('fallback_class', 'fallback_student')
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].id).toBe('mem_card_1')

      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
    })
  })
})
