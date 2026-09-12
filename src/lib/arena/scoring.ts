// src/lib/arena/scoring.ts

import type { LiveArenaParticipant } from '@/types/arena'

export interface CalculateScoreInput {
  isCorrect: boolean
  responseTimeMs: number
  timeLimitSeconds: number
  currentStreak?: number
}

export interface CalculateScoreOutput {
  pointsEarned: number
  newStreak: number
  streakMultiplier: number
  isCorrect: boolean
}

export interface PodiumReward {
  stars: number
  title: string
  medalEmoji: string
}

/**
 * Calculates points awarded based on correctness, response speed, and streak multiplier
 */
export function calculateAnswerScore({
  isCorrect,
  responseTimeMs,
  timeLimitSeconds,
  currentStreak = 0,
}: CalculateScoreInput): CalculateScoreOutput {
  if (!isCorrect) {
    return {
      pointsEarned: 0,
      newStreak: 0,
      streakMultiplier: 1.0,
      isCorrect: false,
    }
  }

  const maxPoints = 1000
  const safeTimeLimitMs = Math.max(timeLimitSeconds * 1000, 1000)
  const clampedResponseMs = Math.max(0, Math.min(responseTimeMs, safeTimeLimitMs))

  // Ratio from 0 (instant) to 1 (last millisecond)
  const timeRatio = clampedResponseMs / safeTimeLimitMs

  // Speed decay: instant is 1000, last second is 500
  const basePoints = Math.round(maxPoints * (1 - timeRatio * 0.5))

  // Streak calculation
  const newStreak = currentStreak + 1
  let streakMultiplier = 1.0

  if (newStreak === 2) {
    streakMultiplier = 1.1
  } else if (newStreak === 3) {
    streakMultiplier = 1.2
  } else if (newStreak === 4) {
    streakMultiplier = 1.3
  } else if (newStreak >= 5) {
    streakMultiplier = 1.5
  }

  const pointsEarned = Math.round(basePoints * streakMultiplier)

  return {
    pointsEarned,
    newStreak,
    streakMultiplier,
    isCorrect: true,
  }
}

/**
 * Calculates end-of-arena podium star rewards and titles
 */
export function calculatePodiumRewards(rank: number): PodiumReward {
  if (rank === 1) {
    return {
      stars: 15,
      title: 'Nhà Vô Địch (Gold Champion)',
      medalEmoji: '🥇',
    }
  }

  if (rank === 2) {
    return {
      stars: 10,
      title: 'Á Quân (Silver Finalist)',
      medalEmoji: '🥈',
    }
  }

  if (rank === 3) {
    return {
      stars: 5,
      title: 'Quý Quân (Bronze Finalist)',
      medalEmoji: '🥉',
    }
  }

  return {
    stars: 2,
    title: 'Chiến Binh Đấu Trường (Finisher)',
    medalEmoji: '🎖️',
  }
}

/**
 * Sorts participants descending by score, breaking ties by earliest updated_at
 */
export function sortArenaLeaderboard(
  participants: LiveArenaParticipant[]
): LiveArenaParticipant[] {
  return [...participants].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return (a.updatedAt || '').localeCompare(b.updatedAt || '')
  })
}
