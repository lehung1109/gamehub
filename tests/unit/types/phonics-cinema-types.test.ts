// tests/unit/types/phonics-cinema-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  CinemaCategory,
  CinemaEpisode,
  CinemaScene,
  CinemaInteractivePrompt,
  CinemaResult,
} from '@/types/phonics-cinema'

describe('Interactive Phonics Cinema TypeScript Contracts', () => {
  it('validates a CinemaInteractivePrompt structure', () => {
    const prompt: CinemaInteractivePrompt = {
      id: 'p1',
      questionVi: 'Chú khủng long đang đói, bé hãy chọn món ăn có âm /æ/ nhé!',
      questionEn: 'Help Dino find food with the /æ/ sound!',
      options: [
        { id: 'opt1', text: 'APPLE', icon: '🍎', isCorrect: true, phonicsHint: 'Âm ngắn /æ/' },
        { id: 'opt2', text: 'DOG', icon: '🐶', isCorrect: false, phonicsHint: 'Âm ngắn /ɒ/' },
      ],
      explanationVi: 'Apple bắt đầu bằng âm ngắn /æ/, rất ngon miệng!',
      popcornReward: 50,
    }

    expect(prompt.id).toBe('p1')
    expect(prompt.options).toHaveLength(2)
    expect(prompt.options[0].isCorrect).toBe(true)
    expect(prompt.popcornReward).toBe(50)
  })

  it('validates a CinemaScene and CinemaEpisode structure', () => {
    const scene: CinemaScene = {
      id: 'sc1',
      sceneNumber: 1,
      titleVi: 'Cảnh 1: Khủng long thức giấc',
      narrationEn: 'Rex wakes up with a rumbling tummy!',
      narrationVi: 'Rex thức dậy với cái bụng đói cồn cào!',
      backgroundTheme: 'jungle',
      characterEmoji: '🦖',
      characterAnimation: 'bounce',
    }

    const episode: CinemaEpisode = {
      id: 'the-hungry-dino',
      titleVi: 'Chú Khủng Long Đói Bụng',
      titleEn: 'The Hungry Dino',
      synopsisVi: 'Khám phá rừng nhiệt đới cùng chú khủng long Rex đáng yêu',
      category: 'cvc',
      durationEstimate: '2 phút',
      badgeIcon: '🦖',
      targetPhonics: 'Nguyên âm ngắn /æ/, /ɒ/, /ʌ/',
      scenes: [scene],
    }

    expect(episode.id).toBe('the-hungry-dino')
    expect(episode.category).toBe('cvc')
    expect(episode.scenes[0].backgroundTheme).toBe('jungle')
  })

  it('validates a CinemaResult structure', () => {
    const result: CinemaResult = {
      episodeId: 'the-hungry-dino',
      popcornEarned: 150,
      maxPopcorn: 150,
      correctPrompts: 3,
      totalPrompts: 3,
      stars: 3,
      expEarned: 150,
      completedAt: new Date().toISOString(),
    }

    expect(result.episodeId).toBe('the-hungry-dino')
    expect(result.stars).toBe(3)
    expect(result.popcornEarned).toBe(150)
  })

  it('validates category literals', () => {
    const categories: CinemaCategory[] = ['cvc', 'digraphs', 'vowels']
    expect(categories).toContain('cvc')
    expect(categories).toContain('digraphs')
    expect(categories).toContain('vowels')
  })
})
