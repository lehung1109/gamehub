// tests/unit/lib/passport-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getStarterStamps,
  calculatePassportCompletion,
  evaluateNewStamps,
  createGraduationCertificate,
  getPassportByShareToken,
} from '@/lib/passport-engine'
import type { PassportStamp } from '@/types/passport'

describe('Passport Engine Pure Functions', () => {
  it('retrieves starter stamps list', () => {
    const stamps = getStarterStamps()
    expect(stamps.length).toBeGreaterThanOrEqual(6)
    expect(stamps.some((s) => s.id === 'stamp-game-explorer')).toBe(true)
    expect(stamps.some((s) => s.id === 'stamp-comic-actor')).toBe(true)
  })

  it('calculates passport completion and graduation eligibility', () => {
    const stamps: PassportStamp[] = [
      { id: 's1', category: 'games', titleVi: 'S1', titleEn: 'S1', icon: '⭐', isUnlocked: true, criteriaVi: '' },
      { id: 's2', category: 'stories', titleVi: 'S2', titleEn: 'S2', icon: '⭐', isUnlocked: true, criteriaVi: '' },
      { id: 's3', category: 'chants', titleVi: 'S3', titleEn: 'S3', icon: '⭐', isUnlocked: true, criteriaVi: '' },
      { id: 's4', category: 'speaking', titleVi: 'S4', titleEn: 'S4', icon: '⭐', isUnlocked: true, criteriaVi: '' },
      { id: 's5', category: 'guilds', titleVi: 'S5', titleEn: 'S5', icon: '⭐', isUnlocked: false, criteriaVi: '' },
    ]

    const stats = calculatePassportCompletion(stamps)
    expect(stats.unlockedCount).toBe(4)
    expect(stats.totalCount).toBe(5)
    expect(stats.completionPercent).toBe(80)
    expect(stats.isEligibleForGraduation).toBe(true)
  })

  it('evaluates and unlocks newly earned stamps', () => {
    const initialStamps = getStarterStamps()
    const updated = evaluateNewStamps(initialStamps, ['stamp-streak-master'])

    const streakStamp = updated.find((s) => s.id === 'stamp-streak-master')
    expect(streakStamp?.isUnlocked).toBe(true)
    expect(streakStamp?.unlockedAt).toBeDefined()
  })

  it('creates graduation certificate with correct CEFR level and stats', () => {
    const cert = createGraduationCertificate('Bé Hải Yến', {
      exp: 2800,
      stars: 50,
      quests: 20,
    })

    expect(cert.studentName).toBe('Bé Hải Yến')
    expect(cert.cefrLevelAchieved).toBe('A1')
    expect(cert.certificateId).toContain('GAMEHUB-GRAD-2026')
    expect(cert.totalStars).toBe(50)
  })

  it('retrieves passport by valid share token and returns null for invalid', () => {
    const passport = getPassportByShareToken('DEMO-PASSPORT-2026')
    expect(passport).not.toBeNull()
    expect(passport?.studentName).toBe('Bé An Nhiên')

    const notFound = getPassportByShareToken('INVALID-TOKEN')
    expect(notFound).toBeNull()
  })
})
