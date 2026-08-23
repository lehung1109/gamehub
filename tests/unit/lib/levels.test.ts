import { describe, it, expect } from 'vitest'
import { LEVELS, getLevelInfo, calculateLevel } from '@/lib/levels'

describe('Level System (levels.ts)', () => {
  it('should define levels in ascending order of threshold', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(3)
    for (let i = 0; i < LEVELS.length - 1; i++) {
      expect(LEVELS[i].level).toBeLessThan(LEVELS[i + 1].level)
      expect(LEVELS[i].threshold).toBeLessThan(LEVELS[i + 1].threshold)
      expect(LEVELS[i].badge).toBeTruthy()
    }
    expect(LEVELS[0].threshold).toBe(0)
    expect(LEVELS[0].level).toBe(1)
  })

  describe('calculateLevel', () => {
    it('returns Level 1 for 0 stars', () => {
      const level = calculateLevel(0)
      expect(level.level).toBe(1)
      expect(level.badge).toBe(LEVELS[0].badge)
    })

    it('returns Level 1 for stars below Level 2 threshold', () => {
      const level = calculateLevel(49)
      expect(level.level).toBe(1)
    })

    it('returns Level 2 when threshold is exactly met', () => {
      const level = calculateLevel(50)
      expect(level.level).toBe(2)
      expect(level.badge).toBe(LEVELS[1].badge)
    })

    it('returns Level 3 for stars meeting Level 3 threshold', () => {
      const level = calculateLevel(150)
      expect(level.level).toBe(3)
      expect(level.badge).toBe(LEVELS[2].badge)
    })

    it('returns max level for very high stars', () => {
      const maxLevel = LEVELS[LEVELS.length - 1]
      const level = calculateLevel(10000)
      expect(level.level).toBe(maxLevel.level)
      expect(level.badge).toBe(maxLevel.badge)
    })

    it('handles negative, non-finite or invalid numbers by defaulting to Level 1', () => {
      expect(calculateLevel(-10).level).toBe(1)
      expect(calculateLevel(NaN).level).toBe(1)
      expect(calculateLevel(Infinity).level).toBe(1)
      expect(calculateLevel(-Infinity).level).toBe(1)
      expect(calculateLevel(null as unknown as number).level).toBe(1)
      expect(calculateLevel(undefined as unknown as number).level).toBe(1)
    })
  })

  describe('getLevelInfo', () => {
    it('provides correct currentLevel, nextLevel, and progress for Level 1', () => {
      const info = getLevelInfo(25)
      expect(info.currentLevel.level).toBe(1)
      expect(info.nextLevel).not.toBeNull()
      expect(info.nextLevel?.level).toBe(2)
      expect(info.starsToNext).toBe(25) // 50 - 25
      expect(info.progressToNext).toBe(50) // 25 / 50 * 100%
    })

    it('provides correct progress for Level 2', () => {
      // Level 2: 50 -> 150 (range: 100)
      // Stars: 75 -> progress: (75 - 50) / 100 = 25%
      const info = getLevelInfo(75)
      expect(info.currentLevel.level).toBe(2)
      expect(info.nextLevel?.level).toBe(3)
      expect(info.starsToNext).toBe(75) // 150 - 75
      expect(info.progressToNext).toBe(25)
    })

    it('handles max level where nextLevel is null', () => {
      const maxThreshold = LEVELS[LEVELS.length - 1].threshold
      const info = getLevelInfo(maxThreshold + 50)
      expect(info.currentLevel.level).toBe(LEVELS[LEVELS.length - 1].level)
      expect(info.nextLevel).toBeNull()
      expect(info.starsToNext).toBe(0)
      expect(info.progressToNext).toBe(100)
    })

    it('handles 0 stars correctly', () => {
      const info = getLevelInfo(0)
      expect(info.currentLevel.level).toBe(1)
      expect(info.nextLevel?.level).toBe(2)
      expect(info.starsToNext).toBe(LEVELS[1].threshold)
      expect(info.progressToNext).toBe(0)
    })
  })
})
