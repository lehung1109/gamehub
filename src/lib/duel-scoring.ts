// src/lib/duel-scoring.ts

import type { DuelScoreResult, DuelWinnerResult } from '@/types/duels'

/**
 * Calculates points awarded in a duel round based on correctness, speed decay, and streak bonus.
 *
 * Scoring breakdown:
 * - Incorrect / timeout: 0 points
 * - Base correct answer: 100 points
 * - Speed bonus: up to 100 points based on elapsed time (clamped between 0ms and 10,000ms)
 *   Math.floor(100 * Math.max(0, 1 - Math.min(10000, Math.max(0, elapsedMs)) / 10000))
 * - Streak bonus: +20 points per current consecutive streak
 */
export function calculateDuelRoundScore(
  isCorrect: boolean,
  elapsedMs: number,
  currentStreak: number
): number {
  if (!isCorrect) {
    return 0
  }

  const baseScore = 100
  const clampedElapsedMs = Math.min(10000, Math.max(0, elapsedMs))
  const speedBonus = Math.floor(100 * Math.max(0, 1 - clampedElapsedMs / 10000))
  const streakBonus = Math.max(0, currentStreak) * 20

  return baseScore + speedBonus + streakBonus
}

/**
 * Determines the winner of a duel match by comparing final scores.
 * Returns the winning player's name, or null if the match ended in a tie.
 */
export function resolveDuelWinner(
  player1Score: number,
  player2Score: number,
  player1Name: string,
  player2Name: string
): DuelWinnerResult {
  if (player1Score > player2Score) {
    return {
      winnerName: player1Name,
      isTie: false,
    }
  }

  if (player2Score > player1Score) {
    return {
      winnerName: player2Name,
      isTie: false,
    }
  }

  return {
    winnerName: null,
    isTie: true,
  }
}

/**
 * Helper to compute both round score and updated streak.
 */
export function calculateDuelAnswer(
  isCorrect: boolean,
  elapsedMs: number,
  currentStreak: number
): DuelScoreResult {
  if (!isCorrect) {
    return {
      pointsEarned: 0,
      newStreak: 0,
      isCorrect: false,
    }
  }

  const pointsEarned = calculateDuelRoundScore(isCorrect, elapsedMs, currentStreak)

  return {
    pointsEarned,
    newStreak: Math.max(0, currentStreak) + 1,
    isCorrect: true,
  }
}
