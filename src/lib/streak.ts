import type { StreakState, StreakUpdateResult, StreakMilestone } from '@/types/streak'

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, bonusStars: 5 },
  { days: 7, bonusStars: 15 },
  { days: 14, bonusStars: 30 },
  { days: 30, bonusStars: 100 },
]

/**
 * Returns default initial streak state for a new student.
 * Defaults to 1 starting streak freeze so students can recover from an initial missed day.
 */
export function getInitialStreakState(): StreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    freezeCount: 1,
    totalActiveDays: 0,
    unlockedMilestones: [],
  }
}

/**
 * Parses YYYY-MM-DD string to UTC midnight timestamp in milliseconds.
 */
function parseDateToUtc(dateStr: string): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return Date.UTC(y, m - 1, d)
}

/**
 * Calculates day difference in calendar days between lastActiveDate and todayDateStr.
 */
export function getDayDifference(lastDateStr: string, todayDateStr: string): number | null {
  const lastUtc = parseDateToUtc(lastDateStr)
  const todayUtc = parseDateToUtc(todayDateStr)
  if (lastUtc === null || todayUtc === null) return null
  return Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24))
}

/**
 * Formats a Date object into YYYY-MM-DD format using local time.
 */
export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Computes effective streak for UI display and status checks.
 * If 2 or more days have elapsed without activity (or 1 missed day without any freeze),
 * the current streak has expired and returns 0.
 * If 1 day was missed and the user has available freezes, the streak is protected and preserved.
 */
export function getEffectiveStreak(
  state: StreakState,
  todayDateStr: string = getTodayDateString()
): StreakState {
  if (!state.lastActiveDate || state.currentStreak <= 0) {
    return { ...state, currentStreak: 0 }
  }

  const diffDays = getDayDifference(state.lastActiveDate, todayDateStr)
  if (diffDays === null || diffDays <= 1) {
    return state
  }

  // Missed exactly 1 day (diffDays === 2): protected if freezes available
  if (diffDays === 2 && state.freezeCount > 0) {
    return state
  }

  // Missed 2+ days, or missed 1 day with 0 freezes: streak expired
  return {
    ...state,
    currentStreak: 0,
  }
}

/**
 * Calculates new streak state when student is active on todayDateStr.
 */
export function calculateStreakUpdate(
  currentState: StreakState,
  todayDateStr: string
): StreakUpdateResult {
  // First time playing
  if (!currentState.lastActiveDate) {
    const currentStreak = 1
    const longestStreak = Math.max(currentState.longestStreak, 1)
    const totalActiveDays = 1
    const freezeCount = currentState.freezeCount
    const freezeUsed = false
    const streakIncremented = true
    const isNewDay = true

    return {
      nextState: {
        currentStreak,
        longestStreak,
        lastActiveDate: todayDateStr,
        freezeCount,
        totalActiveDays,
        unlockedMilestones: [...currentState.unlockedMilestones],
      },
      streakIncremented,
      freezeUsed,
      isNewDay,
      milestoneBonusStars: 0,
      newMilestoneReached: undefined,
    }
  }

  // Already played today or clock went backwards
  if (todayDateStr === currentState.lastActiveDate) {
    return {
      nextState: { ...currentState },
      streakIncremented: false,
      freezeUsed: false,
      isNewDay: false,
      milestoneBonusStars: 0,
      newMilestoneReached: undefined,
    }
  }

  const diffDays = getDayDifference(currentState.lastActiveDate, todayDateStr)

  if (diffDays === null || diffDays <= 0) {
    return {
      nextState: { ...currentState },
      streakIncremented: false,
      freezeUsed: false,
      isNewDay: false,
      milestoneBonusStars: 0,
      newMilestoneReached: undefined,
    }
  }

  let currentStreak = currentState.currentStreak
  let longestStreak = currentState.longestStreak
  let freezeCount = currentState.freezeCount
  let freezeUsed = false
  const totalActiveDays = currentState.totalActiveDays + 1
  const lastActiveDate = todayDateStr
  const streakIncremented = true
  const isNewDay = true

  if (diffDays === 1) {
    // Consecutive day
    currentStreak += 1
    longestStreak = Math.max(longestStreak, currentStreak)
  } else if (diffDays === 2) {
    // Missed exactly 1 day: check if streak freeze can protect
    if (freezeCount > 0) {
      freezeUsed = true
      freezeCount -= 1
      currentStreak += 1
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      freezeUsed = false
      currentStreak = 1
    }
  } else {
    // Missed 2 or more days: streak reset (freezes not consumed for long absences)
    freezeUsed = false
    currentStreak = 1
  }

  // Milestone bonus evaluation
  let milestoneBonusStars = 0
  let newMilestoneReached: number | undefined = undefined
  const updatedMilestones = [...currentState.unlockedMilestones]

  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone.days && !updatedMilestones.includes(milestone.days)) {
      updatedMilestones.push(milestone.days)
      milestoneBonusStars += milestone.bonusStars
      newMilestoneReached = milestone.days
    }
  }
  updatedMilestones.sort((a, b) => a - b)

  const nextState: StreakState = {
    currentStreak,
    longestStreak,
    lastActiveDate,
    freezeCount,
    totalActiveDays,
    unlockedMilestones: updatedMilestones,
  }

  return {
    nextState,
    streakIncremented,
    freezeUsed,
    isNewDay,
    milestoneBonusStars,
    newMilestoneReached,
  }
}

// In-memory storage map for SSR or environments without localStorage
const inMemoryStreakStorage = new Map<string, string>()

function getStreakStorageKey(classCode?: string, studentName?: string): string {
  const code = (classCode?.trim() || 'anon').toUpperCase()
  const student = (studentName?.trim() || 'anon').toLowerCase()
  return `gamehub_streak_v1_${code}_${student}`
}

export function parseStreakState(raw: string): StreakState {
  const initial = getInitialStreakState()
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        currentStreak:
          typeof parsed.currentStreak === 'number' ? parsed.currentStreak : initial.currentStreak,
        longestStreak:
          typeof parsed.longestStreak === 'number' ? parsed.longestStreak : initial.longestStreak,
        lastActiveDate:
          typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : initial.lastActiveDate,
        freezeCount:
          typeof parsed.freezeCount === 'number' ? parsed.freezeCount : initial.freezeCount,
        totalActiveDays:
          typeof parsed.totalActiveDays === 'number' ? parsed.totalActiveDays : initial.totalActiveDays,
        unlockedMilestones: Array.isArray(parsed.unlockedMilestones)
          ? parsed.unlockedMilestones.filter((m: unknown): m is number => typeof m === 'number')
          : initial.unlockedMilestones,
      }
    }
  } catch {
    // Malformed JSON, return initial
  }
  return initial
}

/**
 * Retrieves stored streak state for given classCode and studentName with dual fallback.
 */
export function getStoredStreak(classCode?: string, studentName?: string): StreakState {
  const key = getStreakStorageKey(classCode, studentName)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        return parseStreakState(raw)
      }
      return getInitialStreakState()
    }
  } catch {
    // LocalStorage failed or was restricted, fallback to in-memory store
  }

  const memRaw = inMemoryStreakStorage.get(key)
  return memRaw ? parseStreakState(memRaw) : getInitialStreakState()
}

/**
 * Saves streak state to localStorage and in-memory map.
 */
export function saveStoredStreak(
  classCode: string | undefined,
  studentName: string | undefined,
  streak: StreakState
): void {
  const key = getStreakStorageKey(classCode, studentName)
  const data = JSON.stringify(streak)

  inMemoryStreakStorage.set(key, data)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, data)
    }
  } catch {
    // LocalStorage write failed, in-memory store is already updated
  }
}
