// tests/unit/actions/phonics-escape-room.test.ts

import { describe, it, expect } from 'vitest'
import {
  getEscapeRoomAction,
  submitEscapeScoreAction,
} from '@/app/actions/phonics-escape-room'
import type { EscapeResult } from '@/types/phonics-escape-room'

describe('Phonics Escape Room Server Actions', () => {
  describe('getEscapeRoomAction', () => {
    it('returns error when roomId is empty or invalid', async () => {
      const res1 = await getEscapeRoomAction('')
      expect(res1.success).toBe(false)
      expect(res1.error).toContain('không hợp lệ')

      const res2 = await getEscapeRoomAction('   ')
      expect(res2.success).toBe(false)
      expect(res2.error).toContain('Không tìm thấy')
    })

    it('returns error when roomId does not exist', async () => {
      const res = await getEscapeRoomAction('unknown-room')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Không tìm thấy')
    })

    it('returns escape room data when roomId is valid', async () => {
      const res = await getEscapeRoomAction('pharaoh-tomb')
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.id).toBe('pharaoh-tomb')
      expect(res.data?.masterCipherWord).toBe('SHIP')
    })
  })

  describe('submitEscapeScoreAction', () => {
    it('returns error when payload is invalid or roomId is missing', async () => {
      const res = await submitEscapeScoreAction({} as EscapeResult)
      expect(res.success).toBe(false)
      expect(res.error).toContain('không hợp lệ')
    })

    it('returns error when room does not exist', async () => {
      const res = await submitEscapeScoreAction({
        roomId: 'unknown-room',
        keysEarned: 3,
        cluesSolved: 4,
        totalClues: 4,
        timeSpentSeconds: 120,
        isEscaped: true,
        expEarned: 200,
        completedAt: new Date().toISOString(),
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain('không tồn tại')
    })

    it('successfully processes and returns escape results', async () => {
      const res = await submitEscapeScoreAction({
        roomId: 'pharaoh-tomb',
        keysEarned: 3,
        cluesSolved: 4,
        totalClues: 4,
        timeSpentSeconds: 150,
        isEscaped: true,
        expEarned: 230,
        completedAt: new Date().toISOString(),
      })

      expect(res.success).toBe(true)
      expect(res.data).toEqual({
        keysEarned: 3,
        expAwarded: 230,
        isEscaped: true,
      })
    })
  })
})
