// tests/unit/actions/voice-arcade.test.ts

import { describe, it, expect } from 'vitest'
import {
  getArcadeStageAction,
  submitArcadeScoreAction,
} from '@/app/actions/voice-arcade'

describe('Voice Arcade Server Actions', () => {
  describe('getArcadeStageAction', () => {
    it('returns error when stageId is empty or invalid', async () => {
      const res = await getArcadeStageAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('returns error when stage is not found', async () => {
      const res = await getArcadeStageAction('non-existent-stage')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Không tìm thấy')
    })

    it('returns stage data when stage exists', async () => {
      const res = await getArcadeStageAction('runner-cvc')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('runner-cvc')
      expect(res.data?.titleVi).toBe('Chú Thỏ Bật Nhảy Phonics CVC')
    })
  })

  describe('submitArcadeScoreAction', () => {
    it('returns error when result is empty or invalid', async () => {
      // @ts-expect-error test invalid payload
      const res = await submitArcadeScoreAction(null)
      expect(res.success).toBe(false)
    })

    it('returns error when stageId does not exist', async () => {
      const res = await submitArcadeScoreAction({
        stageId: 'invalid-stage',
        gameMode: 'runner',
        score: 500,
        wordsHit: 5,
        wordsMissed: 0,
        accuracyPercent: 100,
        maxCombo: 5,
        expEarned: 50,
        stars: 3,
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain('Màn chơi không tồn tại')
    })

    it('awards 3 stars for accuracy >= 80%', async () => {
      const res = await submitArcadeScoreAction({
        stageId: 'runner-cvc',
        gameMode: 'runner',
        score: 1200,
        wordsHit: 10,
        wordsMissed: 1,
        accuracyPercent: 91,
        maxCombo: 10,
        expEarned: 48,
        stars: 3,
      })
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(3)
      expect(res.data?.finalScore).toBe(1200)
    })

    it('awards 2 stars for accuracy between 50% and 79%', async () => {
      const res = await submitArcadeScoreAction({
        stageId: 'runner-cvc',
        gameMode: 'runner',
        score: 600,
        wordsHit: 6,
        wordsMissed: 4,
        accuracyPercent: 60,
        maxCombo: 3,
        expEarned: 35,
        stars: 2,
      })
      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(2)
    })
  })
})
