// tests/unit/actions/phonics-cinema.test.ts

import { describe, it, expect } from 'vitest'
import {
  getCinemaEpisodeAction,
  submitCinemaScoreAction,
} from '@/app/actions/phonics-cinema'
import type { CinemaResult } from '@/types/phonics-cinema'

describe('Phonics Cinema Server Actions', () => {
  describe('getCinemaEpisodeAction', () => {
    it('returns episode data for a valid episodeId', async () => {
      const res = await getCinemaEpisodeAction('the-hungry-dino')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('the-hungry-dino')
      expect(res.data?.scenes.length).toBe(3)
    })

    it('returns error when episodeId is empty or not found', async () => {
      const emptyRes = await getCinemaEpisodeAction('')
      expect(emptyRes.success).toBe(false)
      expect(emptyRes.error).toBeDefined()

      const notFoundRes = await getCinemaEpisodeAction('non-existent-movie')
      expect(notFoundRes.success).toBe(false)
      expect(notFoundRes.error).toContain('Không tìm thấy')
    })
  })

  describe('submitCinemaScoreAction', () => {
    it('processes perfect episode score and awards 3 stars with popcorn', async () => {
      const mockResult: CinemaResult = {
        episodeId: 'the-hungry-dino',
        popcornEarned: 100,
        maxPopcorn: 100,
        correctPrompts: 2,
        totalPrompts: 2,
        stars: 3,
        expEarned: 120,
        completedAt: new Date().toISOString(),
      }

      const res = await submitCinemaScoreAction(mockResult)
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(3)
      expect(res.data?.popcornAwarded).toBe(100)
      expect(res.data?.expAwarded).toBe(120)
    })

    it('awards 2 stars for partial correctness >= 60%', async () => {
      const mockResult: CinemaResult = {
        episodeId: 'the-magic-potion',
        popcornEarned: 50,
        maxPopcorn: 100,
        correctPrompts: 2,
        totalPrompts: 3,
        stars: 2,
        expEarned: 80,
        completedAt: new Date().toISOString(),
      }

      const res = await submitCinemaScoreAction(mockResult)
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(2)
      expect(res.data?.popcornAwarded).toBe(50)
    })

    it('rejects invalid or missing episodeId', async () => {
      const invalidResult = {
        episodeId: '',
        popcornEarned: 0,
      } as unknown as CinemaResult

      const res = await submitCinemaScoreAction(invalidResult)
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('rejects nonexistent episodeId', async () => {
      const nonExistentResult: CinemaResult = {
        episodeId: 'ghost-movie',
        popcornEarned: 50,
        maxPopcorn: 50,
        correctPrompts: 1,
        totalPrompts: 1,
        stars: 1,
        expEarned: 30,
        completedAt: new Date().toISOString(),
      }

      const res = await submitCinemaScoreAction(nonExistentResult)
      expect(res.success).toBe(false)
      expect(res.error).toContain('không tồn tại')
    })
  })
})
