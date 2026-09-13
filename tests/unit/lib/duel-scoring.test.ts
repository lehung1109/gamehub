import { describe, it, expect } from 'vitest'
import {
  calculateDuelRoundScore,
  resolveDuelWinner,
  calculateDuelAnswer,
} from '@/lib/duel-scoring'

describe('Duel Scoring Engine', () => {
  describe('calculateDuelRoundScore', () => {
    it('awards 0 points for incorrect answers', () => {
      expect(calculateDuelRoundScore(false, 1000, 0)).toBe(0)
      expect(calculateDuelRoundScore(false, 500, 5)).toBe(0)
      expect(calculateDuelRoundScore(false, 0, 10)).toBe(0)
    })

    it('calculates maximum 200 points for instantaneous correct answer without streak', () => {
      expect(calculateDuelRoundScore(true, 0, 0)).toBe(200)
    })

    it('calculates speed decay score correctly at 5 seconds (5000ms)', () => {
      // 100 base + Math.floor(100 * (1 - 5000/10000)) = 100 + 50 = 150
      expect(calculateDuelRoundScore(true, 5000, 0)).toBe(150)
    })

    it('adds streak bonus (+20 pts per streak)', () => {
      // 150 + (2 * 20) = 190
      expect(calculateDuelRoundScore(true, 5000, 2)).toBe(190)
    })

    it('handles elapsedMs boundary clamping properly', () => {
      // Negative elapsedMs clamped to 0 -> 200 points
      expect(calculateDuelRoundScore(true, -500, 0)).toBe(200)

      // Exactly 10000ms -> 100 base + 0 speed = 100
      expect(calculateDuelRoundScore(true, 10000, 0)).toBe(100)

      // More than 10000ms -> clamped to 10000ms -> 100 base + 0 speed = 100
      expect(calculateDuelRoundScore(true, 15000, 0)).toBe(100)

      // Negative streak clamped to 0
      expect(calculateDuelRoundScore(true, 5000, -2)).toBe(150)
    })
  })

  describe('resolveDuelWinner', () => {
    it('resolves winner and handles ties correctly', () => {
      expect(resolveDuelWinner(500, 400, 'Alice', 'Bob')).toEqual({
        winnerName: 'Alice',
        isTie: false,
      })
      expect(resolveDuelWinner(300, 600, 'Alice', 'Bob')).toEqual({
        winnerName: 'Bob',
        isTie: false,
      })
      expect(resolveDuelWinner(450, 450, 'Alice', 'Bob')).toEqual({
        winnerName: null,
        isTie: true,
      })
    })
  })

  describe('calculateDuelAnswer', () => {
    it('returns 0 points and resets streak to 0 on incorrect answer', () => {
      const result = calculateDuelAnswer(false, 1500, 4)
      expect(result).toEqual({
        pointsEarned: 0,
        newStreak: 0,
        isCorrect: false,
      })
    })

    it('returns calculated points and increments streak on correct answer', () => {
      const result = calculateDuelAnswer(true, 5000, 2)
      expect(result).toEqual({
        pointsEarned: 190,
        newStreak: 3,
        isCorrect: true,
      })
    })
  })
})
