// src/lib/phonics-chant-engine.ts

import { PHONICS_CHANTS } from '@/data/chants/phonics-chants'
import type { PhonicsChant, ChantPerformanceScore } from '@/types/phonics-chant'

/**
 * Return all curated phonics rhythm chants.
 */
export function getAllChants(): PhonicsChant[] {
  return PHONICS_CHANTS
}

/**
 * Find a phonics chant by unique id.
 */
export function getChantById(id: string): PhonicsChant | null {
  return PHONICS_CHANTS.find((c) => c.id === id) || null
}

/**
 * Convert beats per minute to millisecond duration per quarter note beat.
 */
export function calculateBeatIntervalMs(bpm: number): number {
  if (bpm <= 0) return 600 // fallback 100 BPM
  return (60 / bpm) * 1000
}

/**
 * Evaluate user rhythm tap timing against expected beat target.
 * Tolerance thresholds:
 * - Perfect: within ±150ms
 * - Great: within ±300ms
 * - Good: within ±450ms
 * - Miss: > 450ms
 */
export function calculateRhythmScore(timingDifferenceMs: number): 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS' {
  const diff = Math.abs(timingDifferenceMs)
  if (diff <= 150) return 'PERFECT'
  if (diff <= 300) return 'GREAT'
  if (diff <= 450) return 'GOOD'
  return 'MISS'
}

/**
 * Calculate overall performance summary and accuracy percentage.
 */
export function calculatePerformanceSummary(
  chantId: string,
  perfect: number,
  great: number,
  good: number,
  miss: number,
  maxCombo: number,
  totalBeats: number
): ChantPerformanceScore {
  const totalHits = perfect + great + good + miss
  const denominator = totalHits > 0 ? totalHits : totalBeats || 1

  // Weighted accuracy: Perfect = 1.0, Great = 0.8, Good = 0.5, Miss = 0
  const weightedPoints = perfect * 1.0 + great * 0.8 + good * 0.5
  const rawAccuracy = (weightedPoints / denominator) * 100
  const accuracyPercent = Math.min(100, Math.max(0, Math.round(rawAccuracy)))

  const expGained = calculateChantExp(accuracyPercent)

  return {
    chantId,
    perfectCount: perfect,
    greatCount: great,
    goodCount: good,
    missCount: miss,
    maxCombo,
    accuracyPercent,
    expGained,
  }
}

/**
 * Calculate gamification EXP earned from chant performance.
 * Base 15 XP + up to 25 XP based on accuracy (Max 40 XP).
 */
export function calculateChantExp(accuracyPercent: number): number {
  const clampedAccuracy = Math.min(100, Math.max(0, accuracyPercent))
  const bonus = Math.round((clampedAccuracy / 100) * 25)
  return 15 + bonus
}
