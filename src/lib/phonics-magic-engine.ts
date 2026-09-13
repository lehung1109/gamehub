// src/lib/phonics-magic-engine.ts

import {
  ElementalTowerId,
  WizardRank,
  ElementalTowerDefinition,
  MagicSpell,
  MagicProgress,
} from '@/types/phonics-magic'
import { ELEMENTAL_TOWERS, MAGIC_SPELLS } from '@/data/magic/spells'

/**
 * Returns all 4 elemental towers in order
 */
export function getAllTowers(): ElementalTowerDefinition[] {
  return [...ELEMENTAL_TOWERS]
}

/**
 * Retrieves a specific elemental tower by its unique ID
 */
export function getTowerById(id: ElementalTowerId): ElementalTowerDefinition | undefined {
  return ELEMENTAL_TOWERS.find((t) => t.id === id)
}

/**
 * Returns all 12 curated elemental spells
 */
export function getAllSpells(): MagicSpell[] {
  return [...MAGIC_SPELLS]
}

/**
 * Retrieves a single spell by its ID
 */
export function getSpellById(id: string): MagicSpell | undefined {
  return MAGIC_SPELLS.find((s) => s.id === id)
}

/**
 * Returns all spells for a specific elemental tower
 */
export function getSpellsByTower(towerId: ElementalTowerId): MagicSpell[] {
  return MAGIC_SPELLS.filter((s) => s.towerId === towerId)
}

/**
 * Calculates wizard rank based on completed spells count
 * - < 4: Apprentice Wizard (Pháp Sư Tập Sự 🪄)
 * - 4 - 8: Master Sorcerer (Phù Thủy Tinh Anh 🔮)
 * - 9 - 12: Grand Archmage (Đại Pháp Sư Tối Cao 🧙‍♂️)
 */
export function calculateWizardRank(completedCount: number): WizardRank {
  if (completedCount >= 9) {
    return 'grand_archmage'
  }
  if (completedCount >= 4) {
    return 'master_sorcerer'
  }
  return 'apprentice_wizard'
}

/**
 * Returns the default initial progress state for magic academy
 */
export function getDefaultMagicProgress(): MagicProgress {
  return {
    completedSpellIds: [],
    currentTower: 'fire',
    manaCrystals: 0,
    wizardRank: 'apprentice_wizard',
    lastPlayedAt: new Date().toISOString(),
  }
}

/**
 * Pure function to complete a spell and update mana crystals, ranks, and state
 */
export function completeMagicSpell(
  progress: MagicProgress,
  spellId: string
): MagicProgress {
  const isAlreadyCompleted = progress.completedSpellIds.includes(spellId)
  if (isAlreadyCompleted) {
    return {
      ...progress,
      lastPlayedAt: new Date().toISOString(),
    }
  }

  const nextCompleted = [...progress.completedSpellIds, spellId]
  const nextMana = progress.manaCrystals + 50
  const nextRank = calculateWizardRank(nextCompleted.length)

  return {
    ...progress,
    completedSpellIds: nextCompleted,
    manaCrystals: nextMana,
    wizardRank: nextRank,
    lastPlayedAt: new Date().toISOString(),
  }
}
