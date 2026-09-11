import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  BADGES_CATALOG,
  getBadgeDefinitions,
  evaluateBadges,
  getStoredBadges,
  saveStoredBadges,
} from '@/lib/badges'
import { StudentStatsInput, UnlockedBadge } from '@/types/badges'

describe('Badges Catalog & Definitions', () => {
  it('returns all 8 badge definitions with valid metadata', () => {
    const definitions = getBadgeDefinitions()
    expect(definitions).toHaveLength(8)
    expect(definitions).toEqual(BADGES_CATALOG)

    const expectedIds = [
      'first_step',
      'vocab_explorer',
      'sharp_shooter',
      'speed_demon',
      'detective_master',
      'workplace_pro',
      'super_star',
      'champion',
    ]

    const ids = definitions.map((b) => b.id)
    expect(ids).toEqual(expectedIds)

    const validCategories = ['milestone', 'accuracy', 'exploration', 'honor']
    definitions.forEach((badge) => {
      expect(badge.id).toBeTruthy()
      expect(badge.title).toBeTruthy()
      expect(badge.description).toBeTruthy()
      expect(badge.icon).toBeTruthy()
      expect(validCategories).toContain(badge.category)
    })

    const firstStep = definitions.find((b) => b.id === 'first_step')
    expect(firstStep?.title).toBe('Bước đầu tiên')
    expect(firstStep?.icon).toBe('👟')
    expect(firstStep?.category).toBe('milestone')

    const champion = definitions.find((b) => b.id === 'champion')
    expect(champion?.title).toBe('Chiến binh bảng vàng')
    expect(champion?.icon).toBe('🏆')
    expect(champion?.category).toBe('honor')
  })
})

describe('evaluateBadges Evaluation Engine', () => {
  const baseStats: StudentStatsInput = {
    totalStars: 0,
    totalSessions: 0,
    uniqueGameTypes: [],
  }

  it('unlocks first_step when totalSessions >= 1', () => {
    const res0 = evaluateBadges({ ...baseStats, totalSessions: 0 }, [])
    expect(res0.newlyUnlocked).toHaveLength(0)
    expect(res0.allUnlocked).toHaveLength(0)

    const res1 = evaluateBadges({ ...baseStats, totalSessions: 1 }, [])
    expect(res1.newlyUnlocked.map((b) => b.id)).toContain('first_step')
    expect(res1.allUnlocked.map((b) => b.badgeId)).toContain('first_step')
  })

  it('unlocks vocab_explorer when uniqueGameTypes has at least 3 distinct games', () => {
    const resDuplicates = evaluateBadges(
      { ...baseStats, uniqueGameTypes: ['flashcard', 'flashcard', 'flashcard'] },
      []
    )
    expect(resDuplicates.newlyUnlocked.map((b) => b.id)).not.toContain('vocab_explorer')

    const res3 = evaluateBadges(
      { ...baseStats, uniqueGameTypes: ['flashcard', 'spelling', 'crossword'] },
      []
    )
    expect(res3.newlyUnlocked.map((b) => b.id)).toContain('vocab_explorer')
  })

  it('unlocks sharp_shooter when hasPerfectGame is true', () => {
    const resFalse = evaluateBadges({ ...baseStats, hasPerfectGame: false }, [])
    expect(resFalse.newlyUnlocked.map((b) => b.id)).not.toContain('sharp_shooter')

    const resTrue = evaluateBadges({ ...baseStats, hasPerfectGame: true }, [])
    expect(resTrue.newlyUnlocked.map((b) => b.id)).toContain('sharp_shooter')
  })

  it('unlocks speed_demon when hasTypingGame is true', () => {
    const res = evaluateBadges({ ...baseStats, hasTypingGame: true }, [])
    expect(res.newlyUnlocked.map((b) => b.id)).toContain('speed_demon')
  })

  it('unlocks detective_master when hasDetectiveCase is true', () => {
    const res = evaluateBadges({ ...baseStats, hasDetectiveCase: true }, [])
    expect(res.newlyUnlocked.map((b) => b.id)).toContain('detective_master')
  })

  it('unlocks workplace_pro when hasCompletedPosStage is true', () => {
    const res = evaluateBadges({ ...baseStats, hasCompletedPosStage: true }, [])
    expect(res.newlyUnlocked.map((b) => b.id)).toContain('workplace_pro')
  })

  it('unlocks super_star when totalStars >= 50', () => {
    const res49 = evaluateBadges({ ...baseStats, totalStars: 49 }, [])
    expect(res49.newlyUnlocked.map((b) => b.id)).not.toContain('super_star')

    const res50 = evaluateBadges({ ...baseStats, totalStars: 50 }, [])
    expect(res50.newlyUnlocked.map((b) => b.id)).toContain('super_star')

    const res100 = evaluateBadges({ ...baseStats, totalStars: 100 }, [])
    expect(res100.newlyUnlocked.map((b) => b.id)).toContain('super_star')
  })

  it('unlocks champion when rankInClass is 1, 2, or 3', () => {
    expect(
      evaluateBadges({ ...baseStats, rankInClass: 1 }, []).newlyUnlocked.map((b) => b.id)
    ).toContain('champion')
    expect(
      evaluateBadges({ ...baseStats, rankInClass: 2 }, []).newlyUnlocked.map((b) => b.id)
    ).toContain('champion')
    expect(
      evaluateBadges({ ...baseStats, rankInClass: 3 }, []).newlyUnlocked.map((b) => b.id)
    ).toContain('champion')
    expect(
      evaluateBadges({ ...baseStats, rankInClass: 4 }, []).newlyUnlocked.map((b) => b.id)
    ).not.toContain('champion')
    expect(
      evaluateBadges({ ...baseStats, rankInClass: null }, []).newlyUnlocked.map((b) => b.id)
    ).not.toContain('champion')
    expect(
      evaluateBadges({ ...baseStats, rankInClass: undefined }, []).newlyUnlocked.map((b) => b.id)
    ).not.toContain('champion')
  })

  it('does not duplicate already unlocked badges in newlyUnlocked and preserves timestamps', () => {
    const existingDate = '2026-01-01T00:00:00.000Z'
    const currentlyUnlocked: UnlockedBadge[] = [
      { badgeId: 'first_step', unlockedAt: existingDate },
    ]

    const stats: StudentStatsInput = {
      totalStars: 60,
      totalSessions: 10,
      uniqueGameTypes: ['flashcard', 'spelling', 'crossword'],
    }

    const res = evaluateBadges(stats, currentlyUnlocked)

    // first_step should NOT be in newlyUnlocked
    expect(res.newlyUnlocked.map((b) => b.id)).not.toContain('first_step')
    expect(res.newlyUnlocked.map((b) => b.id)).toEqual(
      expect.arrayContaining(['vocab_explorer', 'super_star'])
    )

    // allUnlocked should contain first_step with the original date
    const foundFirstStep = res.allUnlocked.find((b) => b.badgeId === 'first_step')
    expect(foundFirstStep).toBeDefined()
    expect(foundFirstStep?.unlockedAt).toBe(existingDate)

    // newly unlocked badges should have ISO string timestamps
    const foundSuperStar = res.allUnlocked.find((b) => b.badgeId === 'super_star')
    expect(foundSuperStar).toBeDefined()
    expect(new Date(foundSuperStar!.unlockedAt).getTime()).not.toBeNaN()
  })
})

describe('Badges Local Persistence Engine', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  })

  it('saves and retrieves stored badges correctly', () => {
    const badges: UnlockedBadge[] = [
      { badgeId: 'first_step', unlockedAt: '2026-03-01T10:00:00.000Z' },
      { badgeId: 'super_star', unlockedAt: '2026-03-02T12:00:00.000Z' },
    ]

    saveStoredBadges('CLASS10A', 'Nguyen Van A', badges)
    const loaded = getStoredBadges('CLASS10A', 'Nguyen Van A')

    expect(loaded).toEqual(badges)
  })

  it('normalizes classCode and studentName for consistent keys', () => {
    const badges: UnlockedBadge[] = [
      { badgeId: 'first_step', unlockedAt: '2026-03-01T10:00:00.000Z' },
    ]

    saveStoredBadges('  class10a  ', '  Nguyen Van A  ', badges)
    const loaded = getStoredBadges('CLASS10A', 'nguyen van a')

    expect(loaded).toEqual(badges)
  })

  it('handles empty or undefined classCode and studentName safely', () => {
    const badges: UnlockedBadge[] = [
      { badgeId: 'speed_demon', unlockedAt: '2026-03-01T10:00:00.000Z' },
    ]

    saveStoredBadges(undefined, undefined, badges)
    const loaded = getStoredBadges(undefined, undefined)

    expect(loaded).toEqual(badges)
  })

  it('handles corrupted JSON in localStorage gracefully without throwing', () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('gamehub_badges_v1_CORRUPT_test', '{broken json')
    }

    const loaded = getStoredBadges('CORRUPT', 'test')
    expect(loaded).toEqual([])
  })

  it('falls back seamlessly to in-memory storage when localStorage throws', () => {
    const originalGetItem = window.localStorage.getItem
    const originalSetItem = window.localStorage.setItem

    try {
      // Simulate localStorage failure / security restriction
      window.localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError or SecurityError')
      })
      window.localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Access denied')
      })

      const badges: UnlockedBadge[] = [
        { badgeId: 'champion', unlockedAt: '2026-03-01T10:00:00.000Z' },
      ]

      // Should not throw
      expect(() => {
        saveStoredBadges('FALLBACK_CLASS', 'student_b', badges)
      }).not.toThrow()

      const loaded = getStoredBadges('FALLBACK_CLASS', 'student_b')
      expect(loaded).toEqual(badges)
    } finally {
      window.localStorage.getItem = originalGetItem
      window.localStorage.setItem = originalSetItem
    }
  })
})
