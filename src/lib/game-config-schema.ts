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
  RoleplaySettings,
  MemoryMatchSettings,
  WordSearchSettings,
  WordleSettings,
  WordConnectSettings,
  OddOneOutSettings,
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
  'roleplay',
  'memory-match',
  'word-search',
  'wordle',
  'word-connect',
  'odd-one-out',
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
  roleplay: {
    difficulty: 1,
    autoSpeak: true,
  },
  'memory-match': {
    topics: ['animals', 'fruits', 'family', 'school', 'body-parts'],
    pairCount: 6,
    autoSpeak: true,
    showTimer: true,
  },
  'word-search': {
    topics: ['animals', 'fruits', 'family', 'school', 'body-parts'],
    wordCount: 5,
    enableHints: true,
    autoSpeak: true,
    showTimer: true,
  },
  wordle: {
    allowedLengths: [4, 5, 6],
    categories: ['animals', 'fruits', 'school', 'technology', 'daily-life', 'workplace'],
    maxAttempts: 6,
    allowHints: true,
  },
  'word-connect': {
    difficultyRange: ['easy', 'medium', 'hard'],
    allowHints: true,
    allowShuffle: true,
    enableBonusWords: true,
  },
  'odd-one-out': {
    difficulty: ['easy', 'medium', 'hard'],
    questionCount: 10,
    allowHints: true,
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

    case 'roleplay': {
      const difficulty = sanitizeInt(obj.difficulty, 1, 1, 10)
      const autoSpeak = obj.autoSpeak !== undefined ? Boolean(obj.autoSpeak) : true
      const validated: RoleplaySettings = { difficulty, autoSpeak }
      return { valid: true, data: validated }
    }

    case 'memory-match': {
      const topics = Array.isArray(obj.topics)
        ? obj.topics.filter((t): t is string => typeof t === 'string')
        : ['animals', 'fruits', 'family', 'school', 'body-parts']
      const pairCountRaw = sanitizeInt(obj.pairCount, 6, 4, 8)
      const pairCount: 4 | 6 | 8 = pairCountRaw === 4 || pairCountRaw === 8 ? pairCountRaw : 6
      const autoSpeak = obj.autoSpeak !== undefined ? Boolean(obj.autoSpeak) : true
      const showTimer = obj.showTimer !== undefined ? Boolean(obj.showTimer) : true

      const validated: MemoryMatchSettings = { topics, pairCount, autoSpeak, showTimer }
      return { valid: true, data: validated }
    }

    case 'word-search': {
      const topics = Array.isArray(obj.topics)
        ? obj.topics.filter((t): t is string => typeof t === 'string')
        : ['animals', 'fruits', 'family', 'school', 'body-parts']
      const wordCountRaw = sanitizeInt(obj.wordCount, 5, 4, 6)
      const wordCount: 4 | 5 | 6 = wordCountRaw === 4 || wordCountRaw === 6 ? wordCountRaw : 5
      const enableHints = obj.enableHints !== undefined ? Boolean(obj.enableHints) : true
      const autoSpeak = obj.autoSpeak !== undefined ? Boolean(obj.autoSpeak) : true
      const showTimer = obj.showTimer !== undefined ? Boolean(obj.showTimer) : true

      const validated: WordSearchSettings = { topics, wordCount, enableHints, autoSpeak, showTimer }
      return { valid: true, data: validated }
    }

    case 'wordle': {
      const defaultLengths: (4 | 5 | 6)[] = [4, 5, 6]
      const allowedLengthsRaw = Array.isArray(obj.allowedLengths)
        ? obj.allowedLengths.filter((l): l is 4 | 5 | 6 => l === 4 || l === 5 || l === 6)
        : defaultLengths
      const allowedLengths: (4 | 5 | 6)[] = allowedLengthsRaw.length > 0 ? allowedLengthsRaw : defaultLengths
      const categories = Array.isArray(obj.categories)
        ? obj.categories.filter((c): c is string => typeof c === 'string')
        : ['animals', 'fruits', 'school', 'technology', 'daily-life', 'workplace']
      const maxAttempts = sanitizeInt(obj.maxAttempts, 6, 4, 8)
      const allowHints = obj.allowHints !== undefined ? Boolean(obj.allowHints) : true
      const validated: WordleSettings = { allowedLengths, categories, maxAttempts, allowHints }
      return { valid: true, data: validated }
    }

    case 'word-connect': {
      const validDiffs: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']
      const difficultyRange = Array.isArray(obj.difficultyRange)
        ? obj.difficultyRange.filter((d): d is 'easy' | 'medium' | 'hard' => validDiffs.includes(d))
        : validDiffs
      const allowHints = obj.allowHints !== undefined ? Boolean(obj.allowHints) : true
      const allowShuffle = obj.allowShuffle !== undefined ? Boolean(obj.allowShuffle) : true
      const enableBonusWords = obj.enableBonusWords !== undefined ? Boolean(obj.enableBonusWords) : true
      const validated: WordConnectSettings = {
        difficultyRange: difficultyRange.length > 0 ? difficultyRange : validDiffs,
        allowHints,
        allowShuffle,
        enableBonusWords,
      }
      return { valid: true, data: validated }
    }

    case 'odd-one-out': {
      const validDiffs: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']
      const difficulty = Array.isArray(obj.difficulty)
        ? obj.difficulty.filter((d): d is 'easy' | 'medium' | 'hard' => validDiffs.includes(d))
        : validDiffs
      const questionCount = sanitizeInt(obj.questionCount, 10, 5, 20)
      const allowHints = obj.allowHints !== undefined ? Boolean(obj.allowHints) : true
      const validated: OddOneOutSettings = {
        difficulty: difficulty.length > 0 ? difficulty : validDiffs,
        questionCount,
        allowHints,
      }
      return { valid: true, data: validated }
    }

    default:
      return { valid: false, error: `Unhandled game: ${gameId}` }
  }
}

export interface ConfigFieldDefinition {
  name: string
  label: string
  type: 'number' | 'boolean' | 'string' | 'select' | 'multiselect' | 'array'
  description: string
  defaultValue: unknown
  options?: unknown[]
  min?: number
  max?: number
}

export interface GameConfigSchemaDefinition {
  gameId: string
  title: string
  description: string
  fields: Record<string, ConfigFieldDefinition>
}

export const GAME_CONFIG_SCHEMAS: Record<string, GameConfigSchemaDefinition> = {
  wordle: {
    gameId: 'wordle',
    title: 'Wordle Master',
    description: 'Cấu hình tùy chỉnh Wordle Master cho giáo viên và quản trị viên',
    fields: {
      allowedLengths: {
        name: 'allowedLengths',
        label: 'Độ dài từ cho phép',
        type: 'multiselect',
        description: 'Các độ dài từ học sinh có thể lựa chọn chơi (4, 5, hoặc 6 chữ cái)',
        defaultValue: [4, 5, 6],
        options: [4, 5, 6],
      },
      categories: {
        name: 'categories',
        label: 'Chủ đề từ vựng',
        type: 'multiselect',
        description: 'Các chủ đề từ vựng được kích hoạt trong bài học',
        defaultValue: ['animals', 'fruits', 'school', 'technology', 'daily-life', 'workplace'],
        options: ['animals', 'fruits', 'school', 'technology', 'daily-life', 'workplace'],
      },
      maxAttempts: {
        name: 'maxAttempts',
        label: 'Số lượt đoán tối đa',
        type: 'number',
        description: 'Số lượt thử tối đa cho mỗi màn chơi (từ 4 đến 8)',
        defaultValue: 6,
        min: 4,
        max: 8,
      },
      allowHints: {
        name: 'allowHints',
        label: 'Cho phép trợ giúp',
        type: 'boolean',
        description: 'Bật/tắt các tính năng gợi ý (nghĩa tiếng Việt, mở chữ cái, phát âm bản xứ)',
        defaultValue: true,
      },
    },
  },
  'word-connect': {
    gameId: 'word-connect',
    title: 'Word Connect',
    description: 'Cấu hình tùy chỉnh Word Connect cho giáo viên và quản trị viên',
    fields: {
      difficultyRange: {
        name: 'difficultyRange',
        label: 'Mức độ khó cho phép',
        type: 'multiselect',
        description: 'Các cấp độ khó học sinh có thể trải nghiệm (easy, medium, hard)',
        defaultValue: ['easy', 'medium', 'hard'],
        options: ['easy', 'medium', 'hard'],
      },
      allowHints: {
        name: 'allowHints',
        label: 'Cho phép gợi ý',
        type: 'boolean',
        description: 'Bật/tắt tính năng gợi ý mở chữ cái trên bảng ô chữ',
        defaultValue: true,
      },
      allowShuffle: {
        name: 'allowShuffle',
        label: 'Cho phép xáo trộn',
        type: 'boolean',
        description: 'Bật/tắt tính năng xáo trộn vị trí các chữ cái trên vòng xoay',
        defaultValue: true,
      },
      enableBonusWords: {
        name: 'enableBonusWords',
        label: 'Kích hoạt từ thưởng',
        type: 'boolean',
        description: 'Bật/tắt tính năng tích lũy từ thưởng (Bonus Words) khi tìm được từ hợp lệ ngoài bảng',
        defaultValue: true,
      },
    },
  },
  'odd-one-out': {
    gameId: 'odd-one-out',
    title: 'Odd One Out',
    description: 'Cấu hình tùy chỉnh Truy Tìm Kẻ Lạc Loài cho giáo viên và quản trị viên',
    fields: {
      difficulty: {
        name: 'difficulty',
        label: 'Mức độ khó cho phép',
        type: 'multiselect',
        description: 'Các cấp độ khó câu hỏi được kích hoạt (easy, medium, hard)',
        defaultValue: ['easy', 'medium', 'hard'],
        options: ['easy', 'medium', 'hard'],
      },
      questionCount: {
        name: 'questionCount',
        label: 'Số câu hỏi mỗi lượt chơi',
        type: 'number',
        description: 'Số lượng câu hỏi trong mỗi lượt chơi (từ 5 đến 20)',
        defaultValue: 10,
        min: 5,
        max: 20,
      },
      allowHints: {
        name: 'allowHints',
        label: 'Cho phép trợ giúp',
        type: 'boolean',
        description: 'Bật/tắt tính năng trợ giúp (gợi ý manh mối, loại trừ 50/50)',
        defaultValue: true,
      },
    },
  },
}


