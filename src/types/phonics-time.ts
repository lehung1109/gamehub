// src/types/phonics-time.ts

export type TimeTravelEraId = 'ancient_egypt' | 'ancient_greece' | 'medieval_castle' | 'future_cyber'

export type TimeTravelerRank = 'novice_nomad' | 'chrono_voyager' | 'time_space_master'

export interface TimeChallenge {
  targetWord: string
  phonicsFocus: string
  vietnameseMeaning: string
  phoneticBreakdown: string[]
  audioHint: string
  historyFactVi: string
  runeScramble: string[]
}

export interface TimeRelic {
  id: string
  eraId: TimeTravelEraId
  nameEn: string
  nameVi: string
  relicEmoji: string
  eraNameVi: string
  chronoOrbReward: number
  descriptionVi: string
  challenge: TimeChallenge
}

export interface TimeTravelEraDefinition {
  id: TimeTravelEraId
  nameEn: string
  nameVi: string
  eraEmoji: string
  themeColor: string
  bgGradient: string
  descriptionVi: string
  requiredRelics: number
}

export interface TimeProgress {
  completedRelicIds: string[]
  currentEra: TimeTravelEraId
  chronoOrbs: number
  travelerRank: TimeTravelerRank
  lastPlayedAt: string
}
