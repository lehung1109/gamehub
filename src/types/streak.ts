export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string // YYYY-MM-DD
  freezeCount: number // Available streak freezes
  totalActiveDays: number
  unlockedMilestones: number[] // e.g. [3, 7, 14, 30]
}

export interface StreakUpdateResult {
  nextState: StreakState
  streakIncremented: boolean
  freezeUsed: boolean
  isNewDay: boolean
  milestoneBonusStars: number
  newMilestoneReached?: number
}

export interface StreakMilestone {
  days: number
  bonusStars: number
}
