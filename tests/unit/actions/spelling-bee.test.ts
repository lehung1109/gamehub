// tests/unit/actions/spelling-bee.test.ts

import { describe, it, expect } from 'vitest'
import {
  getSpellingBeeDivisionAction,
  submitSpellingBeeScoreAction,
} from '@/app/actions/spelling-bee'
import type { SpellingBeeResult } from '@/types/spelling-bee'

describe('Spelling Bee Server Actions', () => {
  describe('getSpellingBeeDivisionAction', () => {
    it('returns division data for a valid divisionId', async () => {
      const res = await getSpellingBeeDivisionAction('bronze-bee')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('bronze-bee')
      expect(res.data?.words.length).toBeGreaterThan(0)
    })

    it('returns error when divisionId is empty or invalid', async () => {
      const res = await getSpellingBeeDivisionAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()

      const notFoundRes = await getSpellingBeeDivisionAction('unknown-division')
      expect(notFoundRes.success).toBe(false)
      expect(notFoundRes.error).toContain('Không tìm thấy')
    })
  })

  describe('submitSpellingBeeScoreAction', () => {
    it('processes champion score and awards 3 stars with bonus exp', async () => {
      const mockResult: SpellingBeeResult = {
        divisionId: 'bronze-bee',
        tier: 'bronze',
        score: 1350,
        wordsCorrect: 6,
        wordsTotal: 6,
        accuracyPercent: 100,
        stars: 3,
        expEarned: 250,
        isChampion: true,
      }

      const res = await submitSpellingBeeScoreAction(mockResult)
      expect(res.success).toBe(true)
      expect(res.data?.isChampion).toBe(true)
      expect(res.data?.stars).toBe(3)
      expect(res.data?.expAwarded).toBe(250)
      expect(res.data?.finalScore).toBe(1350)
      expect(res.data?.accuracyPercent).toBe(100)
    })

    it('clamps accuracy and calculates appropriate stars for partial score', async () => {
      const mockResult: SpellingBeeResult = {
        divisionId: 'silver-bee',
        tier: 'silver',
        score: 650,
        wordsCorrect: 4,
        wordsTotal: 6,
        accuracyPercent: 67,
        stars: 1,
        expEarned: 120,
        isChampion: false,
      }

      const res = await submitSpellingBeeScoreAction(mockResult)
      expect(res.success).toBe(true)
      expect(res.data?.isChampion).toBe(false)
      expect(res.data?.stars).toBe(1)
      expect(res.data?.expAwarded).toBe(120)
    })

    it('rejects invalid or missing divisionId', async () => {
      const invalidResult = {
        divisionId: '',
        tier: 'bronze',
        score: 0,
      } as unknown as SpellingBeeResult

      const res = await submitSpellingBeeScoreAction(invalidResult)
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('rejects nonexistent divisionId', async () => {
      const nonExistentResult: SpellingBeeResult = {
        divisionId: 'phantom-division',
        tier: 'bronze',
        score: 500,
        wordsCorrect: 2,
        wordsTotal: 5,
        accuracyPercent: 40,
        stars: 1,
        expEarned: 50,
        isChampion: false,
      }

      const res = await submitSpellingBeeScoreAction(nonExistentResult)
      expect(res.success).toBe(false)
      expect(res.error).toContain('không tồn tại')
    })
  })
})
