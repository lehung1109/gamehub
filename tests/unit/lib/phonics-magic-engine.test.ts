// tests/unit/lib/phonics-magic-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllTowers,
  getTowerById,
  getAllSpells,
  getSpellById,
  getSpellsByTower,
  calculateWizardRank,
  getDefaultMagicProgress,
  completeMagicSpell,
} from '@/lib/phonics-magic-engine'
import type { ElementalTowerId } from '@/types/phonics-magic'

describe('Phonics Magic Engine Pure Functions', () => {
  it('returns all 4 elemental towers in correct order', () => {
    const towers = getAllTowers()
    expect(towers).toHaveLength(4)
    expect(towers.map((t) => t.id)).toEqual(['fire', 'water', 'air', 'earth'])
  })

  it('retrieves specific tower by ID and handles invalid input', () => {
    const fire = getTowerById('fire')
    expect(fire).toBeDefined()
    expect(fire?.nameEn).toContain('Flame Tower')
    expect(fire?.elementEmoji).toBe('🔥')

    const invalid = getTowerById('invalid' as unknown as ElementalTowerId)
    expect(invalid).toBeUndefined()
  })

  it('returns all 12 curated magic spells with valid structure', () => {
    const spells = getAllSpells()
    expect(spells).toHaveLength(12)

    spells.forEach((s) => {
      expect(s.id).toBeTruthy()
      expect(s.towerId).toBeTruthy()
      expect(s.challenge.targetWord).toBeTruthy()
      expect(s.challenge.phoneticBreakdown.length).toBeGreaterThan(0)
      expect(s.challenge.runeScramble.length).toBeGreaterThanOrEqual(
        s.challenge.phoneticBreakdown.length
      )
      expect(s.challenge.magicalLore).toBeTruthy()
    })
  })

  it('filters spells by elemental tower and retrieves individual spell', () => {
    const fireSpells = getSpellsByTower('fire')
    expect(fireSpells).toHaveLength(3)
    expect(fireSpells.every((s) => s.towerId === 'fire')).toBe(true)

    const hotSpell = getSpellById('fire-hot')
    expect(hotSpell).toBeDefined()
    expect(hotSpell?.challenge.targetWord).toBe('HOT')

    const missing = getSpellById('non-existent')
    expect(missing).toBeUndefined()
  })

  it('calculates wizard rank based on completed spells count', () => {
    expect(calculateWizardRank(0)).toBe('apprentice_wizard')
    expect(calculateWizardRank(3)).toBe('apprentice_wizard')
    expect(calculateWizardRank(4)).toBe('master_sorcerer')
    expect(calculateWizardRank(8)).toBe('master_sorcerer')
    expect(calculateWizardRank(9)).toBe('grand_archmage')
    expect(calculateWizardRank(12)).toBe('grand_archmage')
  })

  it('manages default progress and completes spells immutably', () => {
    const initial = getDefaultMagicProgress()
    expect(initial.completedSpellIds).toEqual([])
    expect(initial.manaCrystals).toBe(0)
    expect(initial.wizardRank).toBe('apprentice_wizard')

    // Complete first spell
    const after1 = completeMagicSpell(initial, 'fire-hot')
    expect(after1.completedSpellIds).toEqual(['fire-hot'])
    expect(after1.manaCrystals).toBe(50)
    expect(after1.wizardRank).toBe('apprentice_wizard')

    // Completing duplicate spell does not award duplicate crystals
    const duplicate = completeMagicSpell(after1, 'fire-hot')
    expect(duplicate.completedSpellIds).toEqual(['fire-hot'])
    expect(duplicate.manaCrystals).toBe(50)

    // Complete 4 spells to elevate rank to master_sorcerer
    let progress = after1
    progress = completeMagicSpell(progress, 'fire-red')
    progress = completeMagicSpell(progress, 'fire-sun')
    progress = completeMagicSpell(progress, 'water-splash')
    expect(progress.completedSpellIds).toHaveLength(4)
    expect(progress.manaCrystals).toBe(200)
    expect(progress.wizardRank).toBe('master_sorcerer')
  })
})
