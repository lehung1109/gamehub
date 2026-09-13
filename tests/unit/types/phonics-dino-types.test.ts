// tests/unit/types/phonics-dino-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  GeologicalEraId,
  DinoDietType,
  PaleontologistRank,
  DinosaurFossil,
  GeologicalEraDefinition,
  DinoProgress,
} from '@/types/phonics-dino'

describe('Phonics Dino Kingdom TypeScript Type Contracts', () => {
  it('validates GeologicalEraId, DinoDietType and PaleontologistRank union types', () => {
    const eras: GeologicalEraId[] = ['triassic', 'jurassic', 'cretaceous', 'iceage']
    expect(eras).toHaveLength(4)

    const diets: DinoDietType[] = ['herbivore', 'carnivore', 'omnivore', 'piscivore']
    expect(diets).toHaveLength(4)

    const ranks: PaleontologistRank[] = ['junior_digger', 'expert_excavator', 'legendary_dino_master']
    expect(ranks).toHaveLength(3)
  })

  it('validates DinosaurFossil interface structure', () => {
    const mockFossil: DinosaurFossil = {
      id: 'triassic-dig',
      eraId: 'triassic',
      nameEn: 'Fossil Dig (DIG)',
      nameVi: 'Khai Quật Hóa Thạch',
      dinoEmoji: '🦴',
      diet: 'carnivore',
      eraNameVi: 'Kỷ Tam Điệp',
      amberReward: 50,
      descriptionVi: 'Khai quật xương hóa thạch đầu tiên dưới tầng đất cổ đại.',
      challenge: {
        targetWord: 'DIG',
        phonicsFocus: 'Short /ɪ/ vowel & CVC excavation',
        vietnameseMeaning: 'Đào bới / Khai quật',
        phoneticBreakdown: ['D', 'I', 'G'],
        audioHint: 'Dig',
        paleoFactVi: 'Các nhà khảo cổ phải dùng cọ mềm để quét sạch cát bụi trên xương khủng long.',
        boneScramble: ['G', 'D', 'I'],
      },
    }

    expect(mockFossil.id).toBe('triassic-dig')
    expect(mockFossil.eraId).toBe('triassic')
    expect(mockFossil.challenge.targetWord).toBe('DIG')
    expect(mockFossil.challenge.phoneticBreakdown).toEqual(['D', 'I', 'G'])
  })

  it('validates GeologicalEraDefinition structure', () => {
    const mockEra: GeologicalEraDefinition = {
      id: 'triassic',
      nameEn: 'Triassic Valley',
      nameVi: 'Thung Lũng Tam Điệp',
      eraEmoji: '🏜️',
      themeColor: 'amber',
      bgGradient: 'from-amber-950/50 via-yellow-950/40 to-stone-950/80',
      descriptionVi: 'Khởi nguồn của các loài khủng long sơ khai.',
      requiredFossils: 0,
    }

    expect(mockEra.id).toBe('triassic')
    expect(mockEra.eraEmoji).toBe('🏜️')
    expect(mockEra.requiredFossils).toBe(0)
  })

  it('validates DinoProgress default structure', () => {
    const initial: DinoProgress = {
      completedFossilIds: [],
      currentEra: 'triassic',
      amberGems: 0,
      paleontologistRank: 'junior_digger',
      lastPlayedAt: '2026-09-13T10:00:00.000Z',
    }

    expect(initial.completedFossilIds).toEqual([])
    expect(initial.currentEra).toBe('triassic')
    expect(initial.amberGems).toBe(0)
    expect(initial.paleontologistRank).toBe('junior_digger')
  })
})
