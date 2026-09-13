// tests/unit/actions/comic-story.test.ts

import { describe, it, expect } from 'vitest'
import {
  getStoryDetailsAction,
  evaluateStoryVoiceActingAction,
  completeStorySessionAction,
} from '@/app/actions/comic-story'

describe('Comic Story Server Actions', () => {
  describe('getStoryDetailsAction', () => {
    it('returns error when storyId is missing', async () => {
      const res = await getStoryDetailsAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thiếu mã truyện tranh.')
    })

    it('retrieves story details successfully for valid storyId', async () => {
      const res = await getStoryDetailsAction('the-lost-kitten')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('the-lost-kitten')
      expect(res.data?.panels.length).toBeGreaterThan(0)
    })
  })

  describe('evaluateStoryVoiceActingAction', () => {
    it('returns error when targetText is empty', async () => {
      const res = await evaluateStoryVoiceActingAction('', 'hello')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thiếu câu thoại mục tiêu.')
    })

    it('evaluates pronunciation accurately', async () => {
      const res = await evaluateStoryVoiceActingAction('cat', 'cat')
      expect(res.success).toBe(true)
      expect(res.data?.isPassed).toBe(true)
      expect(res.data?.accuracy).toBe(100)
    })
  })

  describe('completeStorySessionAction', () => {
    it('returns error when arguments are missing', async () => {
      const res = await completeStorySessionAction('', '')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thông tin hoàn thành truyện không hợp lệ.')
    })

    it('awards 25 exp and unlocks storyteller badge on completion', async () => {
      const res = await completeStorySessionAction('the-lost-kitten', 'stu-99')
      expect(res.success).toBe(true)
      expect(res.data?.expGained).toBe(25)
      expect(res.data?.isBadgeUnlocked).toBe(true)
    })
  })
})
