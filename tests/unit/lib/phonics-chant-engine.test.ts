// tests/unit/lib/phonics-chant-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllChants,
  getChantById,
  calculateBeatIntervalMs,
  calculateRhythmScore,
  calculatePerformanceSummary,
  calculateChantExp,
} from '@/lib/phonics-chant-engine'

describe('Phonics Chant Engine', () => {
  it('retrieves all curated chants', () => {
    const chants = getAllChants()
    expect(chants.length).toBeGreaterThanOrEqual(3)
    expect(chants.some((c) => c.id === 'cat-on-the-mat')).toBe(true)
    expect(chants.some((c) => c.id === 'hop-pop-dont-stop')).toBe(true)
    expect(chants.some((c) => c.id === 'five-little-frogs')).toBe(true)
  })

  it('retrieves a chant by id and returns null for invalid id', () => {
    const found = getChantById('cat-on-the-mat')
    expect(found).not.toBeNull()
    expect(found?.titleVi).toBe('Chú Mèo Trên Tấm Thảm')

    const notFound = getChantById('non-existent')
    expect(notFound).toBeNull()
  })

  it('calculates beat interval in milliseconds from BPM', () => {
    // 60 BPM = 1000ms per beat
    expect(calculateBeatIntervalMs(60)).toBe(1000)
    // 120 BPM = 500ms per beat
    expect(calculateBeatIntervalMs(120)).toBe(500)
    // Fallback for non-positive BPM
    expect(calculateBeatIntervalMs(0)).toBe(600)
  })

  it('evaluates rhythm score correctly based on timing tolerance', () => {
    expect(calculateRhythmScore(50)).toBe('PERFECT')
    expect(calculateRhythmScore(-120)).toBe('PERFECT')
    expect(calculateRhythmScore(200)).toBe('GREAT')
    expect(calculateRhythmScore(-280)).toBe('GREAT')
    expect(calculateRhythmScore(350)).toBe('GOOD')
    expect(calculateRhythmScore(-420)).toBe('GOOD')
    expect(calculateRhythmScore(500)).toBe('MISS')
    expect(calculateRhythmScore(-600)).toBe('MISS')
  })

  it('calculates performance summary and accuracy correctly', () => {
    const summary = calculatePerformanceSummary('cat-on-the-mat', 10, 5, 1, 0, 16, 16)
    expect(summary.chantId).toBe('cat-on-the-mat')
    expect(summary.perfectCount).toBe(10)
    expect(summary.maxCombo).toBe(16)
    // 10*1.0 + 5*0.8 + 1*0.5 = 14.5 / 16 = 90.625% -> 91%
    expect(summary.accuracyPercent).toBe(91)
    expect(summary.expGained).toBeGreaterThanOrEqual(15)
  })

  it('calculates EXP rewards based on accuracy', () => {
    expect(calculateChantExp(100)).toBe(40) // 15 + 25
    expect(calculateChantExp(0)).toBe(15) // 15 + 0
    expect(calculateChantExp(50)).toBe(28) // 15 + 13
  })
})
