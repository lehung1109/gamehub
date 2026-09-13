// src/lib/spelling-bee-engine.ts

import { SPELLING_BEE_DIVISIONS } from '@/data/spelling-bee/tournament-divisions'
import type {
  SpellingBeeDivision,
  SpellingBeeResult,
  SpellingBeeTier,
} from '@/types/spelling-bee'

/**
 * Returns all available Spelling Bee tournament divisions.
 */
export function getAllDivisions(): SpellingBeeDivision[] {
  return SPELLING_BEE_DIVISIONS
}

/**
 * Retrieves a tournament division by its unique identifier.
 */
export function getDivisionById(id: string): SpellingBeeDivision | undefined {
  if (!id) return undefined
  const cleanId = id.trim().toLowerCase()
  return SPELLING_BEE_DIVISIONS.find((d) => d.id.toLowerCase() === cleanId)
}

/**
 * Validates whether the spelled string matches the target word.
 * Performs normalization (trimming and uppercase conversion).
 */
export function validateSpellingAttempt(input: string, targetWord: string): boolean {
  if (!input || !targetWord) return false
  const cleanInput = input.trim().toUpperCase()
  const cleanTarget = targetWord.trim().toUpperCase()
  return cleanInput === cleanTarget
}

/**
 * Calculates tournament result summary, score, stars, EXP, and championship status.
 */
export function calculateSpellingBeeScore(
  divisionId: string,
  tier: SpellingBeeTier,
  wordsCorrect: number,
  wordsTotal: number,
  mistakes: number,
  maxMistakes: number
): SpellingBeeResult {
  const safeTotal = Math.max(1, wordsTotal)
  const safeCorrect = Math.max(0, Math.min(wordsCorrect, safeTotal))
  const accuracyPercent = Math.round((safeCorrect / safeTotal) * 100)

  const isEliminated = mistakes >= maxMistakes
  const isChampion = !isEliminated && safeCorrect === safeTotal

  // Calculate stars
  let stars = 0
  if (isChampion) {
    stars = 3
  } else if (accuracyPercent >= 70) {
    stars = 2
  } else if (accuracyPercent >= 40) {
    stars = 1
  }

  // Calculate base score and bonuses
  const baseScore = safeCorrect * 150
  const livesRemaining = Math.max(0, maxMistakes - mistakes)
  const lifeBonus = livesRemaining * 50
  const championBonus = isChampion ? 300 : 0
  const score = baseScore + lifeBonus + championBonus

  // Calculate EXP
  const baseExp = safeCorrect * 25
  const expEarned = isChampion ? baseExp + 100 : baseExp + 20

  return {
    divisionId,
    tier,
    score,
    wordsCorrect: safeCorrect,
    wordsTotal: safeTotal,
    accuracyPercent,
    stars,
    expEarned,
    isChampion,
  }
}
