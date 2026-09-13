import { describe, it, expect } from 'vitest'
import {
  generateParentPin,
  generateParentAccessToken,
  computeWeeklyDigest,
  generateHomeLearningTips,
} from '@/lib/parent/digest-generator'

describe('Parent Digest & PIN Generation Engine', () => {
  describe('generateParentPin', () => {
    it('generates a clean uppercase PIN with P- prefix and unambiguous characters', () => {
      const pin = generateParentPin()
      expect(pin).toMatch(/^P-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    })

    it('does not contain confusing characters (0, O, 1, I, L)', () => {
      for (let i = 0; i < 50; i++) {
        const pin = generateParentPin()
        expect(pin).not.toMatch(/[01OIL]/)
      }
    })

    it('generates distinct random PINs', () => {
      const pins = new Set(Array.from({ length: 20 }, () => generateParentPin()))
      expect(pins.size).toBe(20)
    })
  })

  describe('generateParentAccessToken', () => {
    it('generates a secure 32+ character hex string', () => {
      const token = generateParentAccessToken()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThanOrEqual(32)
      expect(token).toMatch(/^[a-f0-9-]+$/)
    })

    it('generates unique tokens', () => {
      const t1 = generateParentAccessToken()
      const t2 = generateParentAccessToken()
      expect(t1).not.toBe(t2)
    })
  })

  describe('generateHomeLearningTips', () => {
    it('provides vocabulary tips when vocabulary needs practice', () => {
      const tips = generateHomeLearningTips([
        { name: 'Từ vựng', rating: 'needs_practice' },
      ])
      expect(tips.length).toBeGreaterThanOrEqual(2)
      expect(tips.some((t) => t.toLowerCase().includes('đồ vật') || t.toLowerCase().includes('từ vựng'))).toBe(true)
    })

    it('provides grammar tips when grammar needs practice', () => {
      const tips = generateHomeLearningTips([
        { name: 'Ngữ pháp', rating: 'developing' },
      ])
      expect(tips.length).toBeGreaterThanOrEqual(2)
      expect(tips.some((t) => t.toLowerCase().includes('câu') || t.toLowerCase().includes('ngữ pháp'))).toBe(true)
    })

    it('provides pronunciation tips when pronunciation is flagged', () => {
      const tips = generateHomeLearningTips([
        { name: 'Phát âm', rating: 'needs_practice' },
      ])
      expect(tips.length).toBeGreaterThanOrEqual(2)
      expect(tips.some((t) => t.toLowerCase().includes('phát âm') || t.toLowerCase().includes('nghe'))).toBe(true)
    })

    it('provides positive reinforcement tips when all skills are mastered', () => {
      const tips = generateHomeLearningTips([
        { name: 'Từ vựng', rating: 'mastered' },
        { name: 'Ngữ pháp', rating: 'mastered' },
      ])
      expect(tips.length).toBeGreaterThanOrEqual(1)
      expect(tips.some((t) => t.includes('Khen ngợi') || t.includes('duy trì'))).toBe(true)
    })
  })

  describe('computeWeeklyDigest', () => {
    const now = new Date('2026-09-13T10:00:00.000Z')

    it('aggregates sessions played in the last 7 days', () => {
      const sampleSessions = [
        {
          id: 's1',
          created_at: '2026-09-12T08:00:00.000Z', // 1 day ago -> within week
          duration_seconds: 600, // 10 mins
          score: 100,
        },
        {
          id: 's2',
          created_at: '2026-09-10T14:00:00.000Z', // 3 days ago -> within week
          duration_seconds: 300, // 5 mins
          score: 80,
        },
        {
          id: 's3',
          created_at: '2026-09-01T10:00:00.000Z', // 12 days ago -> older than 7 days
          duration_seconds: 1200,
          score: 150,
        },
      ]

      const sampleSkills = [
        {
          skillKey: 'vocab',
          label: 'Từ vựng',
          accuracyPercent: 90,
          totalQuestions: 20,
          strengthRating: 'mastered' as const,
        },
        {
          skillKey: 'grammar',
          label: 'Ngữ pháp',
          accuracyPercent: 65,
          totalQuestions: 15,
          strengthRating: 'developing' as const,
        },
      ]

      const digest = computeWeeklyDigest({
        sessions: sampleSessions,
        currentStreak: 5,
        freezeCount: 2,
        skills: sampleSkills,
        referenceDate: now,
      })

      expect(digest.totalGamesPlayed).toBe(2)
      expect(digest.totalMinutesSpent).toBe(15) // 10 + 5 mins
      expect(digest.starsEarnedThisWeek).toBe(18) // score 100 -> 10 stars, score 80 -> 8 stars
      expect(digest.streakDays).toBe(5)
      expect(digest.hasFreezeShield).toBe(true)
      expect(digest.strongestSkill.name).toBe('Từ vựng')
      expect(digest.strongestSkill.accuracyPercent).toBe(90)
      expect(digest.focusSkill.name).toBe('Ngữ pháp')
      expect(digest.focusSkill.accuracyPercent).toBe(65)
      expect(digest.recommendedHomeTips.length).toBeGreaterThanOrEqual(2)
    })

    it('handles zero sessions gracefully', () => {
      const digest = computeWeeklyDigest({
        sessions: [],
        currentStreak: 0,
        freezeCount: 0,
        skills: [],
        referenceDate: now,
      })

      expect(digest.totalGamesPlayed).toBe(0)
      expect(digest.totalMinutesSpent).toBe(0)
      expect(digest.streakDays).toBe(0)
      expect(digest.hasFreezeShield).toBe(false)
      expect(digest.strongestSkill.name).toBe('Đang cập nhật')
      expect(digest.focusSkill.name).toBe('Đang cập nhật')
      expect(digest.recommendedHomeTips.length).toBeGreaterThanOrEqual(1)
    })
  })
})
