// tests/unit/lib/phonics-cinema-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllEpisodes,
  getEpisodeById,
  validatePromptAnswer,
  calculateCinemaScore,
} from '@/lib/phonics-cinema-engine'

describe('Phonics Cinema Pure Engine', () => {
  describe('getAllEpisodes', () => {
    it('returns all 3 curated cinema episodes', () => {
      const episodes = getAllEpisodes()
      expect(episodes).toHaveLength(3)
      expect(episodes.map((e) => e.id)).toEqual([
        'the-hungry-dino',
        'the-magic-potion',
        'the-flying-carpet',
      ])
    })
  })

  describe('getEpisodeById', () => {
    it('retrieves episode case-insensitively', () => {
      const ep = getEpisodeById('THE-HUNGRY-DINO')
      expect(ep).toBeDefined()
      expect(ep?.titleEn).toBe('The Hungry Dino')
      expect(ep?.scenes.length).toBe(3)
    })

    it('returns undefined for invalid or missing id', () => {
      expect(getEpisodeById('')).toBeUndefined()
      expect(getEpisodeById('random-episode-404')).toBeUndefined()
    })
  })

  describe('validatePromptAnswer', () => {
    const samplePrompt = {
      id: 'test-p1',
      questionVi: 'Chọn âm đúng',
      questionEn: 'Choose right sound',
      options: [
        { id: 'opt1', text: 'CAT', icon: '🐱', isCorrect: true, phonicsHint: 'Short A' },
        { id: 'opt2', text: 'DOG', icon: '🐶', isCorrect: false, phonicsHint: 'Short O' },
      ],
      explanationVi: 'Đúng rồi',
      popcornReward: 50,
    }

    it('returns true for the correct option id', () => {
      expect(validatePromptAnswer(samplePrompt, 'opt1')).toBe(true)
    })

    it('returns false for the wrong option id or non-existent id', () => {
      expect(validatePromptAnswer(samplePrompt, 'opt2')).toBe(false)
      expect(validatePromptAnswer(samplePrompt, 'opt99')).toBe(false)
    })
  })

  describe('calculateCinemaScore', () => {
    it('awards 3 stars and full bonus EXP when all prompts are correct', () => {
      const result = calculateCinemaScore('the-hungry-dino', 2, 2, 100, 100)
      expect(result.stars).toBe(3)
      expect(result.correctPrompts).toBe(2)
      expect(result.totalPrompts).toBe(2)
      expect(result.popcornEarned).toBe(100)
      // 2 * 30 + 60 = 120 EXP
      expect(result.expEarned).toBe(120)
    })

    it('awards 2 stars for partial accuracy >= 60%', () => {
      const result = calculateCinemaScore('the-hungry-dino', 2, 3, 100, 150)
      expect(result.stars).toBe(2)
      // 2 * 30 + 20 = 80 EXP
      expect(result.expEarned).toBe(80)
    })

    it('awards 1 star for low accuracy', () => {
      const result = calculateCinemaScore('the-hungry-dino', 1, 3, 50, 150)
      expect(result.stars).toBe(1)
    })
  })
})
