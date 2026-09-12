// tests/unit/lib/reports-generator.test.ts

import { describe, it, expect } from 'vitest'
import {
  generateCertificateVerificationCode,
  getCertificateTemplates,
  computeStudentSkillBreakdown,
  computeSrsMetrics,
  generateAutomatedTeacherRemark,
} from '@/lib/reports/generator'

describe('Reports & Certificate Generator Engine', () => {
  describe('generateCertificateVerificationCode', () => {
    it('generates a valid formatted code starting with GH-CERT-', () => {
      const code = generateCertificateVerificationCode()
      expect(code).toMatch(/^GH-CERT-[A-Z0-9]{6}$/)
    })

    it('generates unique random codes on repeated calls', () => {
      const code1 = generateCertificateVerificationCode()
      const code2 = generateCertificateVerificationCode()
      expect(code1).not.toBe(code2)
    })
  })

  describe('getCertificateTemplates', () => {
    it('returns all 5 certificate award templates with valid metadata', () => {
      const templates = getCertificateTemplates()
      expect(templates.length).toBe(5)

      const types = templates.map((t) => t.type)
      expect(types).toContain('vocab_master')
      expect(types).toContain('streak_champion')
      expect(types).toContain('arena_victor')
      expect(types).toContain('course_completion')
      expect(types).toContain('custom')

      const vocabTpl = templates.find((t) => t.type === 'vocab_master')
      expect(vocabTpl?.defaultTitle).toContain('Từ Vựng')
      expect(vocabTpl?.badgeEmoji).toBeDefined()
    })
  })

  describe('computeStudentSkillBreakdown', () => {
    it('categorizes game sessions into educational skill buckets and rates proficiency', () => {
      const mockSessions = [
        { gameType: 'vocab', score: 10, totalQuestions: 10 },
        { gameType: 'flashcards', score: 9, totalQuestions: 10 },
        { gameType: 'grammar-detective', score: 6, totalQuestions: 10 },
        { gameType: 'reading', score: 4, totalQuestions: 10 },
      ]

      const skills = computeStudentSkillBreakdown(mockSessions)
      expect(skills.length).toBeGreaterThan(0)

      const vocabSkill = skills.find((s) => s.skillKey === 'vocabulary')
      expect(vocabSkill).toBeDefined()
      expect(vocabSkill?.sessionCount).toBe(2)
      expect(vocabSkill?.totalQuestions).toBe(20)
      expect(vocabSkill?.totalCorrect).toBe(19)
      expect(vocabSkill?.accuracyPercent).toBe(95)
      expect(vocabSkill?.strengthRating).toBe('mastered')

      const readingSkill = skills.find((s) => s.skillKey === 'reading')
      expect(readingSkill?.accuracyPercent).toBe(40)
      expect(readingSkill?.strengthRating).toBe('needs_practice')
    })

    it('handles empty sessions gracefully with zero counts', () => {
      const skills = computeStudentSkillBreakdown([])
      expect(skills.length).toBe(0)
    })
  })

  describe('computeSrsMetrics', () => {
    it('calculates Leitner box distribution and mastery rate', () => {
      const mockCards = [
        { box: 1 },
        { box: 2 },
        { box: 4 },
        { box: 5 },
      ]

      const metrics = computeSrsMetrics(mockCards)
      expect(metrics.totalCards).toBe(4)
      expect(metrics.box1).toBe(1)
      expect(metrics.box2).toBe(1)
      expect(metrics.box4).toBe(1)
      expect(metrics.box5).toBe(1)
      expect(metrics.masteredCount).toBe(2) // Box 4 & 5
      expect(metrics.masteryRatePercent).toBe(50)
    })

    it('handles empty card deck without division by zero', () => {
      const metrics = computeSrsMetrics([])
      expect(metrics.totalCards).toBe(0)
      expect(metrics.masteredCount).toBe(0)
      expect(metrics.masteryRatePercent).toBe(0)
    })
  })

  describe('generateAutomatedTeacherRemark', () => {
    it('generates high achievement remark when accuracy is high', () => {
      const remark = generateAutomatedTeacherRemark({
        studentName: 'Bé Lan',
        overallAccuracy: 92,
        topSkill: 'Từ Vựng',
        streakDays: 7,
        masteredWords: 45,
      })

      expect(remark).toContain('Bé Lan')
      expect(remark).toContain('xuất sắc')
    })

    it('generates supportive encouragement remark when accuracy needs improvement', () => {
      const remark = generateAutomatedTeacherRemark({
        studentName: 'Bé Minh',
        overallAccuracy: 55,
        topSkill: 'Luyện Đọc',
        streakDays: 2,
        masteredWords: 5,
      })

      expect(remark).toContain('Bé Minh')
      expect(remark).toContain('cố gắng')
    })
  })
})
