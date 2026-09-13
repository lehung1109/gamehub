// src/types/spelling-bee.ts

export type SpellingBeeTier = 'bronze' | 'silver' | 'gold'

export interface SpellingBeeWord {
  id: string
  word: string
  phonicsSound: string
  translationVi: string
  definitionVi: string
  exampleSentence: string
  points: number
}

export interface SpellingBeeDivision {
  id: string
  tier: SpellingBeeTier
  titleVi: string
  titleEn: string
  descriptionVi: string
  badgeEmoji: string
  timeLimitPerWord: number
  maxMistakes: number
  words: SpellingBeeWord[]
}

export interface SpellingBeeResult {
  divisionId: string
  tier: SpellingBeeTier
  score: number
  wordsCorrect: number
  wordsTotal: number
  accuracyPercent: number
  stars: number
  expEarned: number
  isChampion: boolean
}
