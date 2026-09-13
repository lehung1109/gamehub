// src/types/phonics-town.ts

export type BuildingType =
  | 'bakery'
  | 'zoo'
  | 'hospital'
  | 'library'
  | 'spaceport'
  | 'police-station'

export type BuildingLevel = 1 | 2 | 3
export type MayorRank = 'novice' | 'expert' | 'legendary'

export interface BuildingUpgradeStage {
  level: BuildingLevel
  nameVi: string
  nameEn: string
  costBricks: number
  icon: string
  prosperityReward: number
}

export interface TownResidentQuestOption {
  id: string
  text: string
  icon: string
  isCorrect: boolean
  phonicsHint: string
}

export interface TownResidentQuest {
  id: string
  npcName: string
  npcRoleVi: string
  npcAvatar: string
  greetingVi: string
  greetingEn: string
  riddleVi: string
  riddleEn: string
  options: TownResidentQuestOption[]
  rewardBricks: number
  rewardProsperity: number
}

export interface TownBuildingDefinition {
  type: BuildingType
  categoryNameVi: string
  categoryNameEn: string
  targetPhonics: string
  residentNpc: string
  stages: Record<BuildingLevel, BuildingUpgradeStage>
  quest: TownResidentQuest
}

export interface PlacedBuilding {
  slotIndex: number // 0 to 5
  type: BuildingType
  level: BuildingLevel
  builtAt: string
  isQuestCompletedToday?: boolean
}

export interface TownState {
  buildings: PlacedBuilding[]
  bricks: number
  prosperityStars: number
  mayorRank: MayorRank
  totalQuestsCompleted: number
}
