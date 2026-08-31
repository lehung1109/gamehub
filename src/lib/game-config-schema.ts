// src/lib/game-config-schema.ts

import type {
  GameId,
  FlashcardSettings,
  AlphabetSettings,
  ListeningSettings,
  SpellingSettings,
  NumbersColorsSettings,
  SentencesSettings,
  ReadingSettings,
  TypingSettings,
  GameSettingsMap,
  AnyGameSettings,
} from '@/types/config'

export const VALID_GAME_IDS: readonly GameId[] = [
  'flashcard',
  'alphabet',
  'listening',
  'spelling',
  'numbers-colors',
  'sentences',
  'reading',
  'typing',
] as const

export function isValidGameId(id: string): id is GameId {
  return (VALID_GAME_IDS as readonly string[]).includes(id)
}

export const DEFAULT_SETTINGS: GameSettingsMap = {
  flashcard: {
    topics: [], // empty = all topics
    wordLimit: 0, // 0 = all
    autoSpeak: false,
  },
  alphabet: {
    letterRange: [], // empty = all A-Z
    mode: 'learn',
    autoSpeak: false,
  },
  listening: {
    topics: [],
    questionCount: 0,
    showHint: true,
  },
  spelling: {
    topics: [],
    wordLimit: 0,
    showEmoji: true,
  },
  'numbers-colors': {
    numberRange: [1, 20],
    includeColors: true,
    mode: 'learn',
  },
  sentences: {
    categories: [],
    sentenceCount: 0,
    showVietnamese: true,
  },
  reading: {
    difficulty: 1,
  },
  typing: {
    topics: [],
  },
}

export function getDefaultSettings<T extends GameId>(gameId: T): GameSettingsMap[T] {
  return { ...DEFAULT_SETTINGS[gameId] } as GameSettingsMap[T]
}

export interface ValidationResult<T = AnyGameSettings> {
  valid: boolean
  error?: string
  data?: T
}

function sanitizeInt(
  val: unknown,
  fallback: number,
  min = 0,
  max = Number.MAX_SAFE_INTEGER
): number {
  if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
    return fallback
  }
  const intVal = Math.floor(val)
  return Math.max(min, Math.min(max, intVal))
}

export function validateGameSettings(gameId: string, raw: unknown): ValidationResult {
  if (!isValidGameId(gameId)) {
    return { valid: false, error: `Invalid game ID: "${gameId}"` }
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, error: 'Settings must be a valid JSON object' }
  }

  const obj = raw as Record<string, unknown>

  switch (gameId) {
    case 'flashcard': {
      const topics = Array.isArray(obj.topics)
        ? obj.topics.filter((t): t is string => typeof t === 'string')
        : []
      const wordLimit = sanitizeInt(obj.wordLimit, 0, 0, 100)
      const autoSpeak = Boolean(obj.autoSpeak)

      const validated: FlashcardSettings = { topics, wordLimit, autoSpeak }
      return { valid: true, data: validated }
    }

    case 'alphabet': {
      const letterRange = Array.isArray(obj.letterRange)
        ? obj.letterRange
            .filter((l): l is string => typeof l === 'string' && /^[A-Za-z]$/.test(l))
            .map((l) => l.toUpperCase())
        : []
      const mode = obj.mode === 'quiz' ? 'quiz' : 'learn'
      const autoSpeak = Boolean(obj.autoSpeak)

      const validated: AlphabetSettings = { letterRange, mode, autoSpeak }
      return { valid: true, data: validated }
    }

    case 'listening': {
      const topics = Array.isArray(obj.topics)
        ? obj.topics.filter((t): t is string => typeof t === 'string')
        : []
      const questionCount = sanitizeInt(obj.questionCount, 0, 0, 100)
      const showHint = obj.showHint !== undefined ? Boolean(obj.showHint) : true

      const validated: ListeningSettings = { topics, questionCount, showHint }
      return { valid: true, data: validated }
    }

    case 'spelling': {
      const topics = Array.isArray(obj.topics)
        ? obj.topics.filter((t): t is string => typeof t === 'string')
        : []
      const wordLimit = sanitizeInt(obj.wordLimit, 0, 0, 100)
      const showEmoji = obj.showEmoji !== undefined ? Boolean(obj.showEmoji) : true

      const validated: SpellingSettings = { topics, wordLimit, showEmoji }
      return { valid: true, data: validated }
    }

    case 'numbers-colors': {
      let numberRange: [number, number] = [1, 20]
      if (Array.isArray(obj.numberRange) && obj.numberRange.length === 2) {
        const min = sanitizeInt(obj.numberRange[0], 1, 1, 20)
        const max = sanitizeInt(obj.numberRange[1], 20, 1, 20)
        numberRange = min <= max ? [min, max] : [max, min]
      }
      const includeColors = obj.includeColors !== undefined ? Boolean(obj.includeColors) : true
      const mode = obj.mode === 'quiz' ? 'quiz' : 'learn'

      const validated: NumbersColorsSettings = { numberRange, includeColors, mode }
      return { valid: true, data: validated }
    }

    case 'sentences': {
      const categories = Array.isArray(obj.categories)
        ? obj.categories.filter((c): c is string => typeof c === 'string')
        : []
      const sentenceCount = sanitizeInt(obj.sentenceCount, 0, 0, 100)
      const showVietnamese = obj.showVietnamese !== undefined ? Boolean(obj.showVietnamese) : true

      const validated: SentencesSettings = { categories, sentenceCount, showVietnamese }
      return { valid: true, data: validated }
    }

    case 'reading': {
      const difficulty = sanitizeInt(obj.difficulty, 1, 1, 10)
      const validated: ReadingSettings = { difficulty }
      return { valid: true, data: validated }
    }

    case 'typing': {
      const topics = Array.isArray(obj.topics)
        ? obj.topics.filter((t): t is string => typeof t === 'string')
        : []
      const validated: TypingSettings = { topics }
      return { valid: true, data: validated }
    }

    default:
      return { valid: false, error: `Unhandled game: ${gameId}` }
  }
}
