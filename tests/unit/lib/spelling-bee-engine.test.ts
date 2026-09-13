// tests/unit/lib/spelling-bee-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllDivisions,
  getDivisionById,
  validateSpellingAttempt,
  calculateSpellingBeeScore,
} from '@/lib/spelling-bee-engine'

describe('Spelling Bee Pure Engine', () => {
  describe('getAllDivisions', () => {
    it('returns all 3 curated divisions', () => {
      const divisions = getAllDivisions()
      expect(divisions).toHaveLength(3)
      expect(divisions.map((d) => d.id)).toEqual(['bronze-bee', 'silver-bee', 'golden-bee'])
    })
  })

  describe('getDivisionById', () => {
    it('retrieves existing division case-insensitively', () => {
      const division = getDivisionById('BRONZE-BEE')
      expect(division).toBeDefined()
      expect(division?.titleEn).toBe('Bronze Bee Championship')
      expect(division?.words.length).toBeGreaterThanOrEqual(5)
    })

    it('returns undefined for invalid division id', () => {
      expect(getDivisionById('')).toBeUndefined()
      expect(getDivisionById('non-existent-division')).toBeUndefined()
    })
  })

  describe('validateSpellingAttempt', () => {
    it('returns true when input matches target ignoring case and padding spaces', () => {
      expect(validateSpellingAttempt('cat', 'CAT')).toBe(true)
      expect(validateSpellingAttempt(' CAT ', 'cat')).toBe(true)
      expect(validateSpellingAttempt('Knight', 'KNIGHT')).toBe(true)
    })

    it('returns false when input differs or is empty', () => {
      expect(validateSpellingAttempt('cot', 'CAT')).toBe(false)
      expect(validateSpellingAttempt('', 'CAT')).toBe(false)
      expect(validateSpellingAttempt('CAT', '')).toBe(false)
    })
  })

  describe('calculateSpellingBeeScore', () => {
    it('awards championship status with 3 stars and champion bonus when all words are correct', () => {
      const result = calculateSpellingBeeScore('bronze-bee', 'bronze', 6, 6, 0, 3)

      expect(result.isChampion).toBe(true)
      expect(result.accuracyPercent).toBe(100)
      expect(result.stars).toBe(3)
      // baseScore: 6*150=900, lifeBonus: 3*50=150, championBonus: 300 => 1350
      expect(result.score).toBe(1350)
      // baseExp: 6*25=150, championBonus: 100 => 250
      expect(result.expEarned).toBe(250)
    })

    it('handles partial performance with remaining lives', () => {
      const result = calculateSpellingBeeScore('silver-bee', 'silver', 4, 6, 2, 3)

      expect(result.isChampion).toBe(false)
      expect(result.accuracyPercent).toBe(67)
      expect(result.stars).toBe(1) // 67% < 70%, >= 40%
      // baseScore: 4*150=600, lifeBonus: (3-2)*50=50, championBonus: 0 => 650
      expect(result.score).toBe(650)
      // exp: 4*25 + 20 = 120
      expect(result.expEarned).toBe(120)
    })

    it('handles elimination when mistakes reach maximum', () => {
      const result = calculateSpellingBeeScore('golden-bee', 'gold', 2, 5, 3, 3)

      expect(result.isChampion).toBe(false)
      expect(result.stars).toBe(1)
      expect(result.score).toBe(300) // 2*150=300, 0 life bonus
    })
  })
})
