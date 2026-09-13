// tests/unit/types/phonics-chant-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  ChantDifficulty,
  ChantWordTiming,
  ChantLine,
  PhonicsChant,
  ChantPerformanceScore,
} from '@/types/phonics-chant'

describe('Phonics Chant Types & Contracts', () => {
  it('validates a ChantDifficulty value', () => {
    const difficulties: ChantDifficulty[] = ['pre-a1', 'a1', 'a2']
    expect(difficulties).toHaveLength(3)
  })

  it('validates ChantWordTiming and ChantLine structure', () => {
    const wordTiming: ChantWordTiming = {
      word: 'cat',
      beatIndex: 1,
      phonicsFocus: 'at',
    }
    expect(wordTiming.word).toBe('cat')
    expect(wordTiming.beatIndex).toBe(1)
    expect(wordTiming.phonicsFocus).toBe('at')

    const line: ChantLine = {
      id: 'line-1',
      textEn: 'I see a fat cat.',
      textVi: 'Tôi nhìn thấy một chú mèo mập mạp.',
      words: [wordTiming],
    }
    expect(line.words).toHaveLength(1)
    expect(line.textEn).toContain('fat cat')
  })

  it('validates PhonicsChant full data model', () => {
    const chant: PhonicsChant = {
      id: 'test-chant',
      titleEn: 'The Cat on the Mat',
      titleVi: 'Chú Mèo Trên Tấm Thảm',
      descriptionVi: 'Bài vè luyện phát âm vần -at vui nhộn.',
      difficulty: 'pre-a1',
      phonicsTarget: 'Short vowel /æ/, word family -at',
      bpm: 92,
      totalBeats: 16,
      lines: [
        {
          id: 'l1',
          textEn: 'A cat on a mat',
          textVi: 'Một chú mèo trên tấm thảm',
          words: [
            { word: 'A', beatIndex: 0 },
            { word: 'cat', beatIndex: 1, phonicsFocus: 'at' },
            { word: 'on', beatIndex: 2 },
            { word: 'a', beatIndex: 2.5 },
            { word: 'mat', beatIndex: 3, phonicsFocus: 'at' },
          ],
        },
      ],
      themeColor: 'emerald',
      badgeIcon: '🐱',
    }

    expect(chant.id).toBe('test-chant')
    expect(chant.bpm).toBe(92)
    expect(chant.lines[0].words).toHaveLength(5)
  })

  it('validates ChantPerformanceScore structure', () => {
    const score: ChantPerformanceScore = {
      chantId: 'test-chant',
      perfectCount: 12,
      greatCount: 3,
      goodCount: 1,
      missCount: 0,
      maxCombo: 16,
      accuracyPercent: 95,
      expGained: 30,
    }

    expect(score.accuracyPercent).toBe(95)
    expect(score.expGained).toBe(30)
    expect(score.maxCombo).toBe(16)
  })
})
