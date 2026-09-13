// tests/unit/actions/phonics-chant.test.ts

import { describe, it, expect } from 'vitest'
import {
  getChantDetailsAction,
  submitChantPerformanceAction,
} from '@/app/actions/phonics-chant'

describe('Phonics Chant Server Actions', () => {
  describe('getChantDetailsAction', () => {
    it('returns error when chantId is empty or invalid', async () => {
      const res = await getChantDetailsAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('returns error when chant is not found', async () => {
      const res = await getChantDetailsAction('non-existent')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Không tìm thấy bài vè này')
    })

    it('returns chant data successfully for valid chantId', async () => {
      const res = await getChantDetailsAction('cat-on-the-mat')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('cat-on-the-mat')
      expect(res.data?.titleEn).toBe('The Cat on the Mat')
    })
  })

  describe('submitChantPerformanceAction', () => {
    it('returns error when payload is empty or missing chantId', async () => {
      // @ts-expect-error test invalid payload
      const res = await submitChantPerformanceAction(null)
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('returns error when chantId does not exist', async () => {
      const res = await submitChantPerformanceAction({
        chantId: 'invalid-chant',
        perfectCount: 5,
        greatCount: 5,
        goodCount: 0,
        missCount: 0,
        maxCombo: 10,
        accuracyPercent: 90,
        expGained: 30,
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain('Bài vè không tồn tại')
    })

    it('calculates 3 stars for accuracy >= 85%', async () => {
      const res = await submitChantPerformanceAction({
        chantId: 'cat-on-the-mat',
        perfectCount: 15,
        greatCount: 1,
        goodCount: 0,
        missCount: 0,
        maxCombo: 16,
        accuracyPercent: 95,
        expGained: 38,
      })
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(3)
      expect(res.data?.isHighAccuracy).toBe(true)
      expect(res.data?.expAwarded).toBe(38)
    })

    it('calculates 2 stars for accuracy between 60% and 84%', async () => {
      const res = await submitChantPerformanceAction({
        chantId: 'cat-on-the-mat',
        perfectCount: 8,
        greatCount: 4,
        goodCount: 2,
        missCount: 2,
        maxCombo: 8,
        accuracyPercent: 70,
        expGained: 30,
      })
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(2)
      expect(res.data?.isHighAccuracy).toBe(false)
    })

    it('calculates 1 star for accuracy < 60%', async () => {
      const res = await submitChantPerformanceAction({
        chantId: 'cat-on-the-mat',
        perfectCount: 2,
        greatCount: 2,
        goodCount: 2,
        missCount: 10,
        maxCombo: 2,
        accuracyPercent: 35,
        expGained: 15,
      })
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(1)
    })
  })
})
