// tests/unit/types/spelling-bee-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  SpellingBeeTier,
  SpellingBeeWord,
  SpellingBeeDivision,
  SpellingBeeResult,
} from '@/types/spelling-bee'

describe('Spelling Bee TypeScript Contracts', () => {
  it('validates a SpellingBeeWord object structure', () => {
    const sampleWord: SpellingBeeWord = {
      id: 'bee-w1',
      word: 'CAT',
      phonicsSound: '/kæt/',
      translationVi: 'Con mèo',
      definitionVi: 'Loài động vật nuôi bốn chân thích bắt chuột',
      exampleSentence: 'The cat sleeps on the mat.',
      points: 100,
    }

    expect(sampleWord.id).toBe('bee-w1')
    expect(sampleWord.word).toBe('CAT')
    expect(sampleWord.phonicsSound).toBe('/kæt/')
    expect(sampleWord.points).toBe(100)
  })

  it('validates a SpellingBeeDivision object structure', () => {
    const division: SpellingBeeDivision = {
      id: 'bronze-bee',
      tier: 'bronze',
      titleVi: 'Hạng Ong Đồng - Khởi Động',
      titleEn: 'Bronze Bee Division',
      descriptionVi: 'Phù hợp cho bé lớp 1-2 với các từ đơn giản CVC',
      badgeEmoji: '🥉',
      timeLimitPerWord: 45,
      maxMistakes: 3,
      words: [
        {
          id: 'w1',
          word: 'SUN',
          phonicsSound: '/sʌn/',
          translationVi: 'Mặt trời',
          definitionVi: 'Ngôi sao rực sáng ở trung tâm Thái Dương Hệ',
          exampleSentence: 'The sun shines brightly in the morning.',
          points: 100,
        },
      ],
    }

    expect(division.id).toBe('bronze-bee')
    expect(division.tier).toBe('bronze')
    expect(division.words).toHaveLength(1)
    expect(division.maxMistakes).toBe(3)
  })

  it('validates a SpellingBeeResult object structure', () => {
    const result: SpellingBeeResult = {
      divisionId: 'silver-bee',
      tier: 'silver',
      score: 1500,
      wordsCorrect: 5,
      wordsTotal: 5,
      accuracyPercent: 100,
      stars: 3,
      expEarned: 150,
      isChampion: true,
    }

    expect(result.divisionId).toBe('silver-bee')
    expect(result.accuracyPercent).toBe(100)
    expect(result.stars).toBe(3)
    expect(result.isChampion).toBe(true)
  })

  it('validates tiers union literal types', () => {
    const tiers: SpellingBeeTier[] = ['bronze', 'silver', 'gold']
    expect(tiers).toContain('bronze')
    expect(tiers).toContain('silver')
    expect(tiers).toContain('gold')
  })
})
