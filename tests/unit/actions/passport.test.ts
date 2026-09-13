// tests/unit/actions/passport.test.ts

import { describe, it, expect } from 'vitest'
import {
  getStudentPassportAction,
  claimPassportStampAction,
  triggerGraduationAction,
  getSharedPassportAction,
} from '@/app/actions/passport'

describe('Passport Server Actions', () => {
  describe('getStudentPassportAction', () => {
    it('returns error when studentId is empty', async () => {
      const res = await getStudentPassportAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('returns student passport when studentId is valid', async () => {
      const res = await getStudentPassportAction('std-test')
      expect(res.success).toBe(true)
      expect(res.data?.studentId).toBe('std-test')
      expect(res.data?.stamps.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('claimPassportStampAction', () => {
    it('returns error on missing params', async () => {
      const res = await claimPassportStampAction('', '')
      expect(res.success).toBe(false)
    })

    it('claims a stamp and marks it as unlocked', async () => {
      const res = await claimPassportStampAction('std-test', 'stamp-streak-master')
      expect(res.success).toBe(true)
      const stamp = res.data?.stamps.find((s) => s.id === 'stamp-streak-master')
      expect(stamp?.isUnlocked).toBe(true)
    })
  })

  describe('triggerGraduationAction', () => {
    it('returns error on empty studentId', async () => {
      const res = await triggerGraduationAction('', '')
      expect(res.success).toBe(false)
    })

    it('generates graduation certificate on valid student', async () => {
      const res = await triggerGraduationAction('std-grad', 'Bé Thảo My')
      expect(res.success).toBe(true)
      expect(res.data?.studentName).toBe('Bé Thảo My')
      expect(res.data?.certificateId).toBeDefined()
      expect(res.data?.totalStars).toBeGreaterThan(0)
    })
  })

  describe('getSharedPassportAction', () => {
    it('returns error on invalid share token', async () => {
      const res = await getSharedPassportAction('INVALID-TOKEN')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Không tìm thấy')
    })

    it('returns shared passport on valid demo token', async () => {
      const res = await getSharedPassportAction('DEMO-PASSPORT-2026')
      expect(res.success).toBe(true)
      expect(res.data?.studentName).toBe('Bé An Nhiên')
    })
  })
})
