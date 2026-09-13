// tests/unit/actions/adaptive-learning.test.ts

import { describe, it, expect } from 'vitest'
import {
  getStudentAdaptivePlanAction,
  completeAdaptiveStepAction,
  getClassDiagnosticHeatmapAction,
} from '@/app/actions/adaptive-learning'

describe('Adaptive Learning Server Actions', () => {
  describe('getStudentAdaptivePlanAction', () => {
    it('returns error when studentId is empty', async () => {
      const res = await getStudentAdaptivePlanAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thiếu mã định danh học sinh.')
    })

    it('generates adaptive plan successfully when valid studentId provided', async () => {
      const res = await getStudentAdaptivePlanAction('student-123', 'Bé Bắp')
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.studentId).toBe('student-123')
      expect(res.data?.steps).toHaveLength(3)
    })
  })

  describe('completeAdaptiveStepAction', () => {
    it('returns error for invalid step number', async () => {
      const res = await completeAdaptiveStepAction('student-123', 'plan-1', 4)
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thông tin bước hoàn thành không hợp lệ.')
    })

    it('awards exp and marks partial completion on step 1', async () => {
      const res = await completeAdaptiveStepAction('student-123', 'plan-1', 1)
      expect(res.success).toBe(true)
      expect(res.data?.stepNumber).toBe(1)
      expect(res.data?.expGained).toBe(10)
      expect(res.data?.isFullyCompleted).toBe(false)
    })

    it('marks full completion on step 3', async () => {
      const res = await completeAdaptiveStepAction('student-123', 'plan-1', 3)
      expect(res.success).toBe(true)
      expect(res.data?.stepNumber).toBe(3)
      expect(res.data?.expGained).toBe(30)
      expect(res.data?.isFullyCompleted).toBe(true)
    })
  })

  describe('getClassDiagnosticHeatmapAction', () => {
    it('returns error when classId is missing', async () => {
      const res = await getClassDiagnosticHeatmapAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thiếu mã lớp học.')
    })

    it('returns diagnostic summary with student tiers and domain averages', async () => {
      const res = await getClassDiagnosticHeatmapAction('class-3a', 'Lớp 3A Nâng Cao')
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.classId).toBe('class-3a')
      expect(res.data?.studentCount).toBeGreaterThan(0)
      expect(res.data?.studentRows.length).toBeGreaterThan(0)
      expect(res.data?.domainAverages.phonics).toBeGreaterThan(0)
    })
  })
})
