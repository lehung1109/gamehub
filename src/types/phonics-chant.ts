// src/types/phonics-chant.ts

export type ChantDifficulty = 'pre-a1' | 'a1' | 'a2'

export interface ChantWordTiming {
  word: string
  beatIndex: number
  phonicsFocus?: string
}

export interface ChantLine {
  id: string
  textEn: string
  textVi: string
  words: ChantWordTiming[]
}

export interface PhonicsChant {
  id: string
  titleEn: string
  titleVi: string
  descriptionVi: string
  difficulty: ChantDifficulty
  phonicsTarget: string
  bpm: number
  totalBeats: number
  lines: ChantLine[]
  themeColor: string
  badgeIcon: string
}

export interface ChantPerformanceScore {
  chantId: string
  perfectCount: number
  greatCount: number
  goodCount: number
  missCount: number
  maxCombo: number
  accuracyPercent: number
  expGained: number
}
