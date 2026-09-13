// tests/unit/types/voice-arcade-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  ArcadeGameMode,
  ArcadeDifficulty,
  ArcadeWordTarget,
  ArcadeStage,
  ArcadeGameResult,
} from '@/types/voice-arcade'

describe('Voice Arcade Types & Contracts', () => {
  it('validates ArcadeGameMode and ArcadeDifficulty values', () => {
    const modes: ArcadeGameMode[] = ['runner', 'blaster', 'glider']
    const difficulties: ArcadeDifficulty[] = ['easy', 'medium', 'hard']
    expect(modes).toHaveLength(3)
    expect(difficulties).toHaveLength(3)
  })

  it('validates ArcadeWordTarget structure', () => {
    const word: ArcadeWordTarget = {
      id: 'target-1',
      word: 'JUMP',
      phonicsSound: '/dʒʌmp/',
      translationVi: 'Nhảy',
      icon: '🦘',
      scoreValue: 100,
    }

    expect(word.word).toBe('JUMP')
    expect(word.scoreValue).toBe(100)
    expect(word.phonicsSound).toBe('/dʒʌmp/')
  })

  it('validates ArcadeStage full structure', () => {
    const stage: ArcadeStage = {
      id: 'runner-cvc',
      gameMode: 'runner',
      titleVi: 'Chú Thỏ Bật Nhảy Phonics',
      titleEn: 'Voice Jump Runner CVC',
      descriptionVi: 'Hô to từ vựng để chú thỏ nhảy qua rào cản!',
      difficulty: 'easy',
      targetPhonics: 'Short Vowels & CVC',
      hurdleSpeed: 1.0,
      timeLimitSeconds: 60,
      badgeIcon: '🐰',
      words: [
        {
          id: 'w1',
          word: 'CAT',
          phonicsSound: '/kæt/',
          translationVi: 'Con mèo',
          icon: '🐱',
          scoreValue: 100,
        },
      ],
    }

    expect(stage.id).toBe('runner-cvc')
    expect(stage.gameMode).toBe('runner')
    expect(stage.words).toHaveLength(1)
  })

  it('validates ArcadeGameResult structure', () => {
    const result: ArcadeGameResult = {
      stageId: 'runner-cvc',
      gameMode: 'runner',
      score: 850,
      wordsHit: 8,
      wordsMissed: 1,
      accuracyPercent: 89,
      maxCombo: 8,
      expEarned: 40,
      stars: 3,
    }

    expect(result.score).toBe(850)
    expect(result.stars).toBe(3)
    expect(result.accuracyPercent).toBe(89)
  })
})
