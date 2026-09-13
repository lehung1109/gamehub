// src/types/phonics-safari.ts

export type SafariBiomeType = 'savanna' | 'rainforest' | 'arctic' | 'ocean'

export type ExplorerRank = 'junior-scout' | 'wild-ranger' | 'safari-master'

export interface SafariAnimalChallenge {
  question: string
  options: string[]
  correctOptionIndex: number
  phoneticRuleVi: string
  funFactVi: string
}

export interface SafariAnimal {
  id: string
  nameEn: string
  nameVi: string
  emoji: string
  biome: SafariBiomeType
  syllables: string[]
  phonicsFocus: string
  audioPronunciation: string
  challenge: SafariAnimalChallenge
}

export interface SafariBiomeDefinition {
  id: SafariBiomeType
  nameEn: string
  nameVi: string
  themeColor: string
  backgroundGradient: string
  descriptionVi: string
  animalIds: string[]
}

export interface SafariProgress {
  photographedAnimalIds: string[]
  completedBiomes: SafariBiomeType[]
  explorerRank: ExplorerRank
  totalPhotosCaptured: number
}
