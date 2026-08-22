import { describe, it, expect } from 'vitest'
import {
  encodePreviewSettings,
  decodePreviewSettings,
  buildPreviewUrl,
} from '@/lib/preview'
import type {
  FlashcardSettings,
  AlphabetSettings,
  ListeningSettings,
  SpellingSettings,
  NumbersColorsSettings,
  SentencesSettings,
} from '@/types/config'

describe('Preview Utilities (src/lib/preview.ts)', () => {
  describe('encodePreviewSettings & decodePreviewSettings roundtrip', () => {
    it('roundtrips FlashcardSettings with Unicode Vietnamese text', () => {
      const settings: FlashcardSettings = {
        topics: ['Động vật', 'Trường học', 'Gia đình ❤️'],
        wordLimit: 10,
        autoSpeak: true,
      }
      const encoded = encodePreviewSettings('flashcard', settings)
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
      // Must be URL-safe (no +, /, or =)
      expect(encoded).not.toMatch(/[+/=]/)

      const decoded = decodePreviewSettings(encoded)
      expect(decoded).not.toBeNull()
      expect(decoded?.gameId).toBe('flashcard')
      expect(decoded?.settings).toEqual(settings)
    })

    it('roundtrips AlphabetSettings', () => {
      const settings: AlphabetSettings = {
        letterRange: ['A', 'B', 'C', 'D', 'E'],
        mode: 'quiz',
        autoSpeak: false,
      }
      const encoded = encodePreviewSettings('alphabet', settings)
      const decoded = decodePreviewSettings(encoded)
      expect(decoded).toEqual({
        gameId: 'alphabet',
        settings,
      })
    })

    it('roundtrips ListeningSettings', () => {
      const settings: ListeningSettings = {
        topics: ['fruits', 'colors'],
        questionCount: 8,
        showHint: false,
      }
      const encoded = encodePreviewSettings('listening', settings)
      const decoded = decodePreviewSettings(encoded)
      expect(decoded).toEqual({
        gameId: 'listening',
        settings,
      })
    })

    it('roundtrips SpellingSettings', () => {
      const settings: SpellingSettings = {
        topics: ['animals'],
        wordLimit: 6,
        showEmoji: true,
      }
      const encoded = encodePreviewSettings('spelling', settings)
      const decoded = decodePreviewSettings(encoded)
      expect(decoded).toEqual({
        gameId: 'spelling',
        settings,
      })
    })

    it('roundtrips NumbersColorsSettings', () => {
      const settings: NumbersColorsSettings = {
        numberRange: [1, 20],
        includeColors: true,
        mode: 'learn',
      }
      const encoded = encodePreviewSettings('numbers-colors', settings)
      const decoded = decodePreviewSettings(encoded)
      expect(decoded).toEqual({
        gameId: 'numbers-colors',
        settings,
      })
    })

    it('roundtrips SentencesSettings with Vietnamese sentences', () => {
      const settings: SentencesSettings = {
        categories: ['Chào hỏi', 'Giao tiếp hàng ngày'],
        sentenceCount: 5,
        showVietnamese: true,
      }
      const encoded = encodePreviewSettings('sentences', settings)
      const decoded = decodePreviewSettings(encoded)
      expect(decoded).toEqual({
        gameId: 'sentences',
        settings,
      })
    })
  })

  describe('decodePreviewSettings error handling', () => {
    it('returns null for empty string', () => {
      expect(decodePreviewSettings('')).toBeNull()
    })

    it('returns null for malformed base64', () => {
      expect(decodePreviewSettings('!!!not-valid-base64@@@')).toBeNull()
    })

    it('returns null for valid base64 but invalid JSON', () => {
      // base64 of "hello world"
      const encoded = 'aGVsbG8gd29ybGQ'
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when JSON is not an object (e.g. number or string)', () => {
      // base64 of "123"
      const encoded = 'MTIz'
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when JSON object is missing gameId', () => {
      const invalidJson = JSON.stringify({ settings: { autoSpeak: true } })
      const encoded = Buffer.from(invalidJson).toString('base64url')
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when JSON object is missing settings', () => {
      const invalidJson = JSON.stringify({ gameId: 'flashcard' })
      const encoded = Buffer.from(invalidJson).toString('base64url')
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when JSON payload is an array', () => {
      const invalidJson = JSON.stringify([{ gameId: 'flashcard' }])
      const encoded = Buffer.from(invalidJson).toString('base64url')
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when settings is an array instead of an object', () => {
      const invalidJson = JSON.stringify({ gameId: 'flashcard', settings: [1, 2, 3] })
      const encoded = Buffer.from(invalidJson).toString('base64url')
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when gameId is not a string or settings is not an object', () => {
      const invalidJson = JSON.stringify({ gameId: 123, settings: 'invalid' })
      const encoded = Buffer.from(invalidJson).toString('base64url')
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('returns null when gameId is an unrecognized game name', () => {
      const invalidJson = JSON.stringify({ gameId: 'unknown-game', settings: { foo: 'bar' } })
      const encoded = Buffer.from(invalidJson).toString('base64url')
      expect(decodePreviewSettings(encoded)).toBeNull()
    })

    it('sanitizes and clamps settings during decode for valid gameId', () => {
      // numberRange out of bounds [0, 50] gets clamped to [1, 20]
      const rawJson = JSON.stringify({
        gameId: 'numbers-colors',
        settings: { numberRange: [0, 50], includeColors: true, mode: 'learn' },
      })
      const encoded = Buffer.from(rawJson).toString('base64url')
      const decoded = decodePreviewSettings(encoded)
      expect(decoded).not.toBeNull()
      expect(decoded?.gameId).toBe('numbers-colors')
      expect(decoded?.settings).toEqual({
        numberRange: [1, 20],
        includeColors: true,
        mode: 'learn',
      })
    })
  })

  describe('buildPreviewUrl', () => {
    it('constructs correct relative URL for flashcard', () => {
      const settings: FlashcardSettings = {
        topics: ['animals'],
        wordLimit: 5,
        autoSpeak: false,
      }
      const url = buildPreviewUrl('flashcard', settings)
      expect(url).toMatch(/^\/games\/flashcard\?preview=[A-Za-z0-9_-]+$/)
      const encodedParam = url.split('?preview=')[1]
      const decoded = decodePreviewSettings(encodedParam)
      expect(decoded).toEqual({
        gameId: 'flashcard',
        settings,
      })
    })

    it('constructs correct relative URL for numbers-colors', () => {
      const settings: NumbersColorsSettings = {
        numberRange: [1, 10],
        includeColors: true,
        mode: 'quiz',
      }
      const url = buildPreviewUrl('numbers-colors', settings)
      expect(url).toMatch(/^\/games\/numbers-colors\?preview=[A-Za-z0-9_-]+$/)
    })
  })
})
