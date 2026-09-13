// src/types/phonics-cinema.ts

export type CinemaCategory = 'cvc' | 'digraphs' | 'vowels'

export interface CinemaOption {
  id: string
  text: string
  icon: string
  isCorrect: boolean
  phonicsHint: string
}

export interface CinemaInteractivePrompt {
  id: string
  questionVi: string
  questionEn: string
  options: CinemaOption[]
  explanationVi: string
  popcornReward: number
}

export interface CinemaScene {
  id: string
  sceneNumber: number
  titleVi: string
  narrationEn: string
  narrationVi: string
  backgroundTheme: 'jungle' | 'wizard-lab' | 'starry-sky'
  characterEmoji: string
  characterAnimation: 'bounce' | 'fly' | 'wiggle'
  interactivePrompt?: CinemaInteractivePrompt
}

export interface CinemaEpisode {
  id: string
  titleVi: string
  titleEn: string
  synopsisVi: string
  category: CinemaCategory
  durationEstimate: string
  badgeIcon: string
  targetPhonics: string
  scenes: CinemaScene[]
}

export interface CinemaResult {
  episodeId: string
  popcornEarned: number
  maxPopcorn: number
  correctPrompts: number
  totalPrompts: number
  stars: number
  expEarned: number
  completedAt: string
}
