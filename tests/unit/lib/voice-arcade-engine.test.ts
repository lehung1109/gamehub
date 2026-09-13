// tests/unit/lib/voice-arcade-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllArcadeStages,
  getStageById,
  evaluateSpokenWord,
  calculateArcadeScore,
} from '@/lib/voice-arcade-engine'

describe('Voice Arcade Engine Pure Functions', () => {
  it('retrieves all curated arcade stages', () => {
    const stages = getAllArcadeStages()
    expect(stages.length).toBeGreaterThanOrEqual(3)
    expect(stages.some((s) => s.id === 'runner-cvc')).toBe(true)
    expect(stages.some((s) => s.id === 'blaster-blends')).toBe(true)
    expect(stages.some((s) => s.id === 'glider-vowels')).toBe(true)
  })

  it('retrieves stage by id and returns null for invalid id', () => {
    const stage = getStageById('runner-cvc')
    expect(stage).not.toBeNull()
    expect(stage?.titleVi).toBe('Chú Thỏ Bật Nhảy Phonics CVC')

    const notFound = getStageById('invalid-stage')
    expect(notFound).toBeNull()
  })

  it('evaluates spoken words accurately with tolerant matching', () => {
    // Exact match
    expect(evaluateSpokenWord('cat', 'CAT')).toBe(true)
    expect(evaluateSpokenWord('JUMP!', 'jump')).toBe(true)

    // Token inclusion
    expect(evaluateSpokenWord('i see a dog', 'DOG')).toBe(true)

    // Substring
    expect(evaluateSpokenWord('frogs', 'frog')).toBe(true)

    // Negative matches
    expect(evaluateSpokenWord('banana', 'CAT')).toBe(false)
    expect(evaluateSpokenWord('', 'DOG')).toBe(false)
  })

  it('calculates arcade score, stars and EXP correctly', () => {
    // High accuracy (3 stars)
    const result3Stars = calculateArcadeScore('runner-cvc', 'runner', 10, 1, 9, 100)
    expect(result3Stars.score).toBe(10 * 100 + 9 * 50) // 1450
    expect(result3Stars.accuracyPercent).toBe(91) // 10/11
    expect(result3Stars.stars).toBe(3)
    expect(result3Stars.expEarned).toBeGreaterThanOrEqual(45)

    // Medium accuracy (2 stars)
    const result2Stars = calculateArcadeScore('runner-cvc', 'runner', 6, 4, 3, 100)
    expect(result2Stars.accuracyPercent).toBe(60)
    expect(result2Stars.stars).toBe(2)

    // Low accuracy (1 star)
    const result1Star = calculateArcadeScore('runner-cvc', 'runner', 2, 8, 1, 100)
    expect(result1Star.accuracyPercent).toBe(20)
    expect(result1Star.stars).toBe(1)
  })
})
