// src/types/phonics-space.ts

export type SpaceSectorType = 'mars' | 'saturn' | 'neptune' | 'galaxy'

export type AstronautRank = 'cadet-explorer' | 'fleet-commander' | 'star-lord'

export interface SpaceMissionChallenge {
  targetWord: string
  promptVi: string
  options: string[]
  correctOptionIndex: number
  phoneticRuleVi: string
}

export interface SpaceMission {
  id: string
  nameEn: string
  nameVi: string
  emoji: string
  sector: SpaceSectorType
  targetPhonics: string
  audioPronunciation: string
  storyVi: string
  challenge: SpaceMissionChallenge
}

export interface SpaceSectorDefinition {
  id: SpaceSectorType
  nameEn: string
  nameVi: string
  themeColor: string
  backgroundGradient: string
  descriptionVi: string
  missionIds: string[]
}

export interface SpaceProgress {
  completedMissionIds: string[]
  cosmicCrystals: number
  astronautRank: AstronautRank
  completedSectors: SpaceSectorType[]
}
