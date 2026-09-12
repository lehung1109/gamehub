import type {
  Quest,
  QuestSessionInput,
  ClaimRewardResult,
  QuestProgressResult,
} from '@/types/quests'

export const VOCABULARY_GAMES = [
  'flashcard',
  'wordle',
  'word-search',
  'falling-words',
  'memory-match',
  'crossword',
]

export const GRAMMAR_GAMES = [
  'tenses',
  'parts-of-speech',
  'grammar-detective',
  'sentences',
]

/**
 * Parses a YYYY-MM-DD string into a UTC Date.
 */
function parseDateKey(dateKey: string): Date {
  const parts = dateKey.split('-')
  const [y, m, d] = parts.map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/**
 * Calculates the ISO-8601 week string (e.g. "2026-W37") for a date.
 */
export function getWeekKey(input: Date | string = new Date()): string {
  let date: Date
  if (typeof input === 'string') {
    const parts = input.split('-')
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number)
      date = new Date(Date.UTC(y, m - 1, d))
    } else {
      date = new Date(input)
    }
  } else {
    date = new Date(input.getTime())
  }

  // ISO-8601 week number calculation
  const dayOfWeek = date.getUTCDay() || 7 // Make Sunday 7
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

interface CategoryConfig {
  category: 'pronunciation' | 'vocabulary' | 'grammar'
  description: string
}

/**
 * Returns the focus category configuration based on day of week.
 * Sunday (0) & Wednesday (3): Pronunciation
 * Monday (1) & Thursday (4): Vocabulary
 * Tuesday (2), Friday (5), & Saturday (6): Grammar
 */
function getDailyCategoryConfig(dateKey: string): CategoryConfig {
  const date = parseDateKey(dateKey)
  const day = date.getUTCDay()

  if (day === 0 || day === 3) {
    return {
      category: 'pronunciation',
      description: 'Luyện phát âm chuẩn trong Pronunciation Lab',
    }
  }

  if (day === 1 || day === 4) {
    return {
      category: 'vocabulary',
      description: 'Chinh phục từ vựng trong Flashcard hoặc Wordle',
    }
  }

  return {
    category: 'grammar',
    description: 'Thực hành ngữ pháp trong Tenses hoặc Parts of Speech',
  }
}

/**
 * Generates 3 daily quests deterministically based on dateKey (YYYY-MM-DD).
 */
export function generateDailyQuests(dateKey: string): Quest[] {
  const categoryConfig = getDailyCategoryConfig(dateKey)

  return [
    {
      id: `daily_play_games_${dateKey}`,
      title: 'Chăm chỉ mỗi ngày',
      description: 'Hoàn thành 2 lượt chơi bất kỳ',
      icon: '🎮',
      type: 'play_games',
      target: 2,
      current: 0,
      rewardStars: 5,
      period: 'daily',
      isCompleted: false,
      isClaimed: false,
      dateKey,
    },
    {
      id: `daily_high_score_${dateKey}`,
      title: 'Bách phát bách trúng',
      description: 'Đạt điểm số từ 80% trở lên trong một ván chơi',
      icon: '🎯',
      type: 'perfect_score',
      target: 1,
      current: 0,
      rewardStars: 10,
      period: 'daily',
      isCompleted: false,
      isClaimed: false,
      dateKey,
    },
    {
      id: `daily_category_${dateKey}`,
      title: 'Thử thách trọng tâm',
      description: categoryConfig.description,
      icon: '⭐',
      type: 'game_category',
      target: 1,
      current: 0,
      rewardStars: 10,
      period: 'daily',
      isCompleted: false,
      isClaimed: false,
      dateKey,
      categoryFilter: categoryConfig.category,
    },
  ]
}

/**
 * Generates a weekly quest based on weekKey (YYYY-Www).
 */
export function generateWeeklyQuest(weekKey: string): Quest {
  return {
    id: `weekly_warrior_${weekKey}`,
    title: 'Chiến binh tuần lễ',
    description: 'Hoàn thành 6 lượt chơi trong tuần',
    icon: '🏆',
    type: 'play_games',
    target: 6,
    current: 0,
    rewardStars: 35,
    rewardFreeze: 1,
    period: 'weekly',
    isCompleted: false,
    isClaimed: false,
    dateKey: weekKey,
  }
}

/**
 * Storage key helper.
 */
export function getQuestStorageKey(classCode?: string, studentName?: string): string {
  const code = (classCode?.trim() || 'anon').toUpperCase()
  const student = (studentName?.trim() || 'anon').toLowerCase()
  return `gamehub_quests_v1_${code}_${student}`
}

// In-memory storage map fallback for SSR or restricted environments
const inMemoryQuestStorage = new Map<string, string>()

/**
 * Safely parses raw JSON into Quest[].
 */
export function parseQuests(raw: string): Quest[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    // Malformed JSON
  }
  return []
}

/**
 * Retrieves stored quests with dual fallback (localStorage + memory).
 */
export function getStoredQuests(classCode?: string, studentName?: string): Quest[] {
  const key = getQuestStorageKey(classCode, studentName)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        return parseQuests(raw)
      }
      return []
    }
  } catch {
    // Fallback to in-memory
  }

  const memRaw = inMemoryQuestStorage.get(key)
  return memRaw ? parseQuests(memRaw) : []
}

/**
 * Saves quests to localStorage and in-memory map.
 */
export function saveStoredQuests(
  classCode: string | undefined,
  studentName: string | undefined,
  quests: Quest[]
): void {
  const key = getQuestStorageKey(classCode, studentName)
  const data = JSON.stringify(quests)

  inMemoryQuestStorage.set(key, data)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, data)
    }
  } catch {
    // Fallback in-memory already updated
  }
}

/**
 * Retrieves stored quests or generates new ones if outdated or not found.
 */
export function getOrGenerateQuests(
  todayDateStr: string,
  classCode?: string,
  studentName?: string
): Quest[] {
  const weekKey = getWeekKey(todayDateStr)
  const stored = getStoredQuests(classCode, studentName)

  const storedDaily = stored.filter(q => q.period === 'daily')
  const storedWeekly = stored.filter(q => q.period === 'weekly')

  const isDailyValid =
    storedDaily.length === 3 && storedDaily.every(q => q.dateKey === todayDateStr)
  const isWeeklyValid =
    storedWeekly.length > 0 && storedWeekly.every(q => q.dateKey === weekKey)

  const dailyQuests = isDailyValid ? storedDaily : generateDailyQuests(todayDateStr)
  const weeklyQuests = isWeeklyValid ? storedWeekly : [generateWeeklyQuest(weekKey)]

  const combined = [...dailyQuests, ...weeklyQuests]

  // Persist if any generation or refresh occurred
  if (!isDailyValid || !isWeeklyValid || stored.length === 0) {
    saveStoredQuests(classCode, studentName, combined)
  }

  return combined
}

/**
 * Evaluates progress across all quests for a given game session.
 */
export function evaluateQuestProgress(
  quests: Quest[],
  session: QuestSessionInput
): QuestProgressResult {
  const newlyCompleted: Quest[] = []

  const updatedQuests = quests.map(quest => {
    if (quest.isCompleted) {
      return quest
    }

    let newCurrent = quest.current

    switch (quest.type) {
      case 'play_games': {
        newCurrent = Math.min(quest.target, quest.current + 1)
        break
      }
      case 'perfect_score': {
        if (session.score >= 80) {
          newCurrent = Math.min(quest.target, quest.current + 1)
        }
        break
      }
      case 'game_category': {
        let matches = false
        if (quest.categoryFilter === 'pronunciation') {
          matches = session.gameType === 'pronunciation'
        } else if (quest.categoryFilter === 'vocabulary') {
          matches = VOCABULARY_GAMES.includes(session.gameType)
        } else if (quest.categoryFilter === 'grammar') {
          matches = GRAMMAR_GAMES.includes(session.gameType)
        }

        if (matches) {
          newCurrent = Math.min(quest.target, quest.current + 1)
        }
        break
      }
      case 'earn_stars': {
        newCurrent = Math.min(
          quest.target,
          quest.current + Math.max(0, session.starsEarned)
        )
        break
      }
      default:
        break
    }

    const isNowCompleted = newCurrent >= quest.target
    const updatedQuest: Quest = {
      ...quest,
      current: newCurrent,
      isCompleted: isNowCompleted,
    }

    if (isNowCompleted && !quest.isCompleted) {
      newlyCompleted.push(updatedQuest)
    }

    return updatedQuest
  })

  return {
    updatedQuests,
    newlyCompleted,
  }
}

/**
 * Alias for evaluateQuestProgress to support multiple naming conventions.
 */
export const recordQuestProgress = evaluateQuestProgress

/**
 * Claims reward for a completed quest.
 */
export function claimQuestReward(quests: Quest[], questId: string): ClaimRewardResult {
  const quest = quests.find(q => q.id === questId)

  if (!quest) {
    return {
      updatedQuests: quests,
      claimedReward: null,
      error: 'Quest not found',
    }
  }

  if (!quest.isCompleted) {
    return {
      updatedQuests: quests,
      claimedReward: null,
      error: 'Quest is not completed yet',
    }
  }

  if (quest.isClaimed) {
    return {
      updatedQuests: quests,
      claimedReward: null,
      error: 'Quest reward has already been claimed',
    }
  }

  const updatedQuests = quests.map(q =>
    q.id === questId ? { ...q, isClaimed: true } : q
  )

  return {
    updatedQuests,
    claimedReward: {
      stars: quest.rewardStars,
      freeze: quest.rewardFreeze || 0,
    },
  }
}
