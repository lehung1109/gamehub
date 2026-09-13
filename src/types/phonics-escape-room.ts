// src/types/phonics-escape-room.ts

export type EscapeRoomTheme = 'pyramid' | 'library' | 'space-lab'
export type EscapeDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface EscapeClueOption {
  id: string
  text: string
  icon: string
  isCorrect: boolean
  phonicsHint: string
}

export interface EscapeClueHotspot {
  id: string
  titleVi: string
  titleEn: string
  icon: string
  positionX: number // 0 - 100 percentage
  positionY: number // 0 - 100 percentage
  riddleVi: string
  riddleEn: string
  options: EscapeClueOption[]
  explanationVi: string
  unlockedCipherChar: string
}

export interface EscapeRoom {
  id: string
  titleVi: string
  titleEn: string
  synopsisVi: string
  theme: EscapeRoomTheme
  difficulty: EscapeDifficulty
  durationSeconds: number
  badgeIcon: string
  targetPhonics: string
  masterCipherWord: string
  cipherHintVi: string
  hotspots: EscapeClueHotspot[]
}

export interface EscapeResult {
  roomId: string
  keysEarned: number
  cluesSolved: number
  totalClues: number
  timeSpentSeconds: number
  isEscaped: boolean
  expEarned: number
  completedAt: string
}
