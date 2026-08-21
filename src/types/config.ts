// src/types/config.ts

export interface FlashcardSettings {
  topics: string[]
  wordLimit: number
  autoSpeak: boolean
}

export interface AlphabetSettings {
  letterRange: string[]
  mode: 'learn' | 'quiz'
  autoSpeak: boolean
}

export interface ListeningSettings {
  topics: string[]
  questionCount: number
  showHint: boolean
}

export interface SpellingSettings {
  topics: string[]
  wordLimit: number
  showEmoji: boolean
}

export interface NumbersColorsSettings {
  numberRange: [number, number]
  includeColors: boolean
  mode: 'learn' | 'quiz'
}

export interface SentencesSettings {
  categories: string[]
  sentenceCount: number
  showVietnamese: boolean
}

export interface GameSettingsMap {
  flashcard: FlashcardSettings
  alphabet: AlphabetSettings
  listening: ListeningSettings
  spelling: SpellingSettings
  'numbers-colors': NumbersColorsSettings
  sentences: SentencesSettings
}

export type GameId = keyof GameSettingsMap

export type AnyGameSettings =
  | FlashcardSettings
  | AlphabetSettings
  | ListeningSettings
  | SpellingSettings
  | NumbersColorsSettings
  | SentencesSettings

export type GameSettings =
  | { gameId: 'flashcard'; settings: FlashcardSettings }
  | { gameId: 'alphabet'; settings: AlphabetSettings }
  | { gameId: 'listening'; settings: ListeningSettings }
  | { gameId: 'spelling'; settings: SpellingSettings }
  | { gameId: 'numbers-colors'; settings: NumbersColorsSettings }
  | { gameId: 'sentences'; settings: SentencesSettings }

export interface GameConfig<T = Record<string, unknown>> {
  id: string
  user_id: string
  game_id: string
  name: string
  settings: T
  share_slug: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateConfigInput {
  gameId: string
  name: string
  settings: Record<string, unknown>
}

export interface UpdateConfigInput {
  name?: string
  settings?: Record<string, unknown>
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: string
  created_at: string
  updated_at: string
}
