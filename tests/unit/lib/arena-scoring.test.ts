// tests/unit/lib/arena-scoring.test.ts

import { describe, it, expect } from 'vitest'
import {
  calculateAnswerScore,
  calculatePodiumRewards,
  sortArenaLeaderboard,
} from '@/lib/arena/scoring'
import type { LiveArenaParticipant } from '@/types/arena'

describe('Arena Scoring & Speed Decay Engine', () => {
  describe('calculateAnswerScore', () => {
    it('returns 0 points and resets streak to 0 on incorrect answer', () => {
      const result = calculateAnswerScore({
        isCorrect: false,
        responseTimeMs: 1500,
        timeLimitSeconds: 15,
        currentStreak: 4,
      })

      expect(result.pointsEarned).toBe(0)
      expect(result.newStreak).toBe(0)
      expect(result.streakMultiplier).toBe(1.0)
      expect(result.isCorrect).toBe(false)
    })

    it('awards max points (1000) for instant correct answers', () => {
      const result = calculateAnswerScore({
        isCorrect: true,
        responseTimeMs: 0,
        timeLimitSeconds: 15,
        currentStreak: 0,
      })

      expect(result.pointsEarned).toBe(1000)
      expect(result.newStreak).toBe(1)
      expect(result.streakMultiplier).toBe(1.0)
    })

    it('applies speed decay smoothly over the time limit', () => {
      // Half time elapsed (7500ms out of 15000ms): base points should be ~750
      const result = calculateAnswerScore({
        isCorrect: true,
        responseTimeMs: 7500,
        timeLimitSeconds: 15,
        currentStreak: 0,
      })

      expect(result.pointsEarned).toBe(750)
      expect(result.newStreak).toBe(1)
    })

    it('guarantees at least 500 base points even when answered at the last second', () => {
      const result = calculateAnswerScore({
        isCorrect: true,
        responseTimeMs: 15000,
        timeLimitSeconds: 15,
        currentStreak: 0,
      })

      expect(result.pointsEarned).toBe(500)
    })

    it('applies streak multipliers up to 1.5x for 5+ streaks', () => {
      // Streak 2 -> 1.1x
      const r2 = calculateAnswerScore({
        isCorrect: true,
        responseTimeMs: 0,
        timeLimitSeconds: 15,
        currentStreak: 1,
      })
      expect(r2.newStreak).toBe(2)
      expect(r2.streakMultiplier).toBe(1.1)
      expect(r2.pointsEarned).toBe(1100)

      // Streak 5 -> 1.5x
      const r5 = calculateAnswerScore({
        isCorrect: true,
        responseTimeMs: 0,
        timeLimitSeconds: 15,
        currentStreak: 4,
      })
      expect(r5.newStreak).toBe(5)
      expect(r5.streakMultiplier).toBe(1.5)
      expect(r5.pointsEarned).toBe(1500)
    })
  })

  describe('calculatePodiumRewards', () => {
    it('awards 15 stars for rank 1 (Gold)', () => {
      const reward = calculatePodiumRewards(1)
      expect(reward.stars).toBe(15)
      expect(reward.medalEmoji).toBe('🥇')
    })

    it('awards 10 stars for rank 2 (Silver)', () => {
      const reward = calculatePodiumRewards(2)
      expect(reward.stars).toBe(10)
      expect(reward.medalEmoji).toBe('🥈')
    })

    it('awards 5 stars for rank 3 (Bronze)', () => {
      const reward = calculatePodiumRewards(3)
      expect(reward.stars).toBe(5)
      expect(reward.medalEmoji).toBe('🥉')
    })

    it('awards 2 stars for participants outside the top 3', () => {
      const reward = calculatePodiumRewards(4)
      expect(reward.stars).toBe(2)
      expect(reward.medalEmoji).toBe('🎖️')
    })
  })

  describe('sortArenaLeaderboard', () => {
    it('sorts participants descending by score', () => {
      const p1: LiveArenaParticipant = {
        id: '1',
        arenaId: 'a',
        studentName: 'An',
        avatar: '🦊',
        score: 1200,
        streak: 2,
        answers: [],
        createdAt: '',
        updatedAt: '',
      }
      const p2: LiveArenaParticipant = {
        id: '2',
        arenaId: 'a',
        studentName: 'Bình',
        avatar: '🐼',
        score: 2400,
        streak: 3,
        answers: [],
        createdAt: '',
        updatedAt: '',
      }
      const p3: LiveArenaParticipant = {
        id: '3',
        arenaId: 'a',
        studentName: 'Cường',
        avatar: '🐯',
        score: 1800,
        streak: 1,
        answers: [],
        createdAt: '',
        updatedAt: '',
      }

      const sorted = sortArenaLeaderboard([p1, p2, p3])
      expect(sorted[0].studentName).toBe('Bình')
      expect(sorted[1].studentName).toBe('Cường')
      expect(sorted[2].studentName).toBe('An')
    })
  })
})
