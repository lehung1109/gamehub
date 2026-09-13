// src/types/phonics-ocean.ts

export type OceanDepthZone = 'sunlight' | 'twilight' | 'midnight' | 'abyss'

export type DiverRank = 'snorkel_cadet' | 'sub_pilot' | 'ocean_master'

export interface OceanChallenge {
  targetWord: string
  phonicsFocus: string
  vietnameseMeaning: string
  phoneticBreakdown: string[]
  audioHint: string
  marineFact: string
  bubbleScramble: string[]
}

export interface OceanMission {
  id: string
  zoneId: OceanDepthZone
  nameEn: string
  nameVi: string
  creatureName: string
  creatureEmoji: string
  depthMeters: number
  descriptionVi: string
  challenge: OceanChallenge
}

export interface OceanZoneDefinition {
  id: OceanDepthZone
  nameEn: string
  nameVi: string
  depthRange: string
  themeColor: string
  bgGradient: string
  descriptionVi: string
  requiredMissions: number
}

export interface OceanProgress {
  completedMissionIds: string[];
  currentZone: OceanDepthZone;
  pearls: number;
  diverRank: DiverRank;
  lastPlayedAt: string;
}
