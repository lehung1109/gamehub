// src/types/phonics-magic.ts

export type ElementalTowerId = 'fire' | 'water' | 'air' | 'earth'

export type WizardRank = 'apprentice_wizard' | 'master_sorcerer' | 'grand_archmage'

export interface MagicChallenge {
  targetWord: string
  phonicsFocus: string
  vietnameseMeaning: string
  phoneticBreakdown: string[]
  audioHint: string
  magicalLore: string
  runeScramble: string[]
}

export interface MagicSpell {
  id: string
  towerId: ElementalTowerId
  nameEn: string
  nameVi: string
  spellEmoji: string
  incantationName: string
  manaCost: number
  descriptionVi: string
  challenge: MagicChallenge
}

export interface ElementalTowerDefinition {
  id: ElementalTowerId
  nameEn: string
  nameVi: string
  elementEmoji: string
  themeColor: string
  bgGradient: string
  descriptionVi: string
  requiredSpells: number
}

export interface MagicProgress {
  completedSpellIds: string[]
  currentTower: ElementalTowerId
  manaCrystals: number
  wizardRank: WizardRank
  lastPlayedAt: string
}
