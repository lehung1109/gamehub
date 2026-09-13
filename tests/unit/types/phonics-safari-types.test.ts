// tests/unit/types/phonics-safari-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  SafariBiomeType,
  ExplorerRank,
  SafariAnimal,
  SafariBiomeDefinition,
  SafariProgress,
} from '@/types/phonics-safari'

describe('Phonics Safari TypeScript Type Contracts', () => {
  it('validates SafariBiomeType and ExplorerRank unions', () => {
    const biomes: SafariBiomeType[] = ['savanna', 'rainforest', 'arctic', 'ocean']
    expect(biomes).toHaveLength(4)

    const ranks: ExplorerRank[] = ['junior-scout', 'wild-ranger', 'safari-master']
    expect(ranks).toHaveLength(3)
  })

  it('validates SafariAnimal interface structure', () => {
    const mockAnimal: SafariAnimal = {
      id: 'lion',
      nameEn: 'Lion',
      nameVi: 'Sư Tử',
      emoji: '🦁',
      biome: 'savanna',
      syllables: ['LI', 'ON'],
      phonicsFocus: 'Consonant L & diphthong /aɪ/',
      audioPronunciation: 'Lion',
      challenge: {
        question: 'Which sound starts the word LION?',
        options: ['L', 'M', 'R'],
        correctOptionIndex: 0,
        phoneticRuleVi: 'Âm đầu /l/ như trong Lion, Lamp, Leaf',
        funFactVi: 'Sư tử được mệnh danh là chúa tể thảo nguyên.',
      },
    }

    expect(mockAnimal.id).toBe('lion')
    expect(mockAnimal.biome).toBe('savanna')
    expect(mockAnimal.challenge.options[mockAnimal.challenge.correctOptionIndex]).toBe('L')
  })

  it('validates SafariBiomeDefinition structure', () => {
    const mockBiome: SafariBiomeDefinition = {
      id: 'savanna',
      nameEn: 'African Savanna',
      nameVi: 'Thảo Nguyên Savanna',
      themeColor: 'amber',
      backgroundGradient: 'from-amber-400 to-orange-500',
      descriptionVi: 'Vùng đất rộng lớn với ánh hoàng hôn rực rỡ.',
      animalIds: ['lion', 'elephant', 'giraffe', 'zebra'],
    }

    expect(mockBiome.animalIds).toHaveLength(4)
    expect(mockBiome.id).toBe('savanna')
  })

  it('validates SafariProgress default structure', () => {
    const mockProgress: SafariProgress = {
      photographedAnimalIds: [],
      completedBiomes: [],
      explorerRank: 'junior-scout',
      totalPhotosCaptured: 0,
    }

    expect(mockProgress.photographedAnimalIds).toEqual([])
    expect(mockProgress.explorerRank).toBe('junior-scout')
    expect(mockProgress.totalPhotosCaptured).toBe(0)
  })
})
