// tests/unit/types/phonics-magic-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  ElementalTowerId,
  WizardRank,
  MagicSpell,
  ElementalTowerDefinition,
  MagicProgress,
} from '@/types/phonics-magic'

describe('Phonics Magic Academy TypeScript Type Contracts', () => {
  it('validates ElementalTowerId and WizardRank union types', () => {
    const towers: ElementalTowerId[] = ['fire', 'water', 'air', 'earth']
    expect(towers).toHaveLength(4)

    const ranks: WizardRank[] = ['apprentice_wizard', 'master_sorcerer', 'grand_archmage']
    expect(ranks).toHaveLength(3)
  })

  it('validates MagicSpell interface structure', () => {
    const mockSpell: MagicSpell = {
      id: 'fire-hot',
      towerId: 'fire',
      nameEn: 'Blazing Spark (HOT)',
      nameVi: 'Tia Lửa Rực Cháy',
      spellEmoji: '🔥',
      incantationName: 'Ignis Calidus',
      manaCost: 10,
      descriptionVi: 'Triệu hồi ngọn lửa ấm áp và giải mã thần chú CVC rực cháy.',
      challenge: {
        targetWord: 'HOT',
        phonicsFocus: 'Short /ɒ/ vowel & CVC structure',
        vietnameseMeaning: 'Nóng bỏng / Rực cháy',
        phoneticBreakdown: ['H', 'O', 'T'],
        audioHint: 'Hot',
        magicalLore: 'Ngọn lửa sơ khai giúp xua tan bóng tối và thắp sáng lò luyện phép.',
        runeScramble: ['T', 'H', 'O'],
      },
    }

    expect(mockSpell.id).toBe('fire-hot')
    expect(mockSpell.towerId).toBe('fire')
    expect(mockSpell.challenge.targetWord).toBe('HOT')
    expect(mockSpell.challenge.phoneticBreakdown).toEqual(['H', 'O', 'T'])
  })

  it('validates ElementalTowerDefinition structure', () => {
    const mockTower: ElementalTowerDefinition = {
      id: 'fire',
      nameEn: 'Flame Tower',
      nameVi: 'Tháp Lửa (Hỏa Thuật)',
      elementEmoji: '🔥',
      themeColor: 'amber',
      bgGradient: 'from-amber-950/50 via-orange-950/40 to-slate-950/80',
      descriptionVi: 'Nơi rèn luyện những thần chú sơ khai với ngọn lửa nhiệt huyết.',
      requiredSpells: 0,
    }

    expect(mockTower.id).toBe('fire')
    expect(mockTower.elementEmoji).toBe('🔥')
    expect(mockTower.requiredSpells).toBe(0)
  })

  it('validates MagicProgress default structure', () => {
    const initial: MagicProgress = {
      completedSpellIds: [],
      currentTower: 'fire',
      manaCrystals: 0,
      wizardRank: 'apprentice_wizard',
      lastPlayedAt: '2026-09-13T10:00:00.000Z',
    }

    expect(initial.completedSpellIds).toEqual([])
    expect(initial.currentTower).toBe('fire')
    expect(initial.manaCrystals).toBe(0)
    expect(initial.wizardRank).toBe('apprentice_wizard')
  })
})
