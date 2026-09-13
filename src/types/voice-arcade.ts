// src/types/voice-arcade.ts

export type ArcadeGameMode = 'runner' | 'blaster' | 'glider'
export type ArcadeDifficulty = 'easy' | 'medium' | 'hard'

export interface ArcadeWordTarget {
  id: string
  word: string
  phonicsSound: string
  translationVi: string
  icon: string
  scoreValue: number
}

export interface ArcadeStage {
  id: string
  gameMode: ArcadeGameMode
  titleVi: string
  titleEn: string
  descriptionVi: string
  difficulty: ArcadeDifficulty
  targetPhonics: string
  words: ArcadeWordTarget[]
  hurdleSpeed: number
  timeLimitSeconds: number
  badgeIcon: string
}

export interface ArcadeGameResult {
  stageId: string
  gameMode: ArcadeGameMode
  score: number
  wordsHit: number
  wordsMissed: number
  accuracyPercent: number
  maxCombo: number
  expEarned: number
  stars: number
}
