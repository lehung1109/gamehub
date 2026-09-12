export type QuestType = 'play_games' | 'perfect_score' | 'game_category' | 'earn_stars'

export interface Quest {
  id: string
  title: string
  description: string
  icon: string
  type: QuestType
  target: number
  current: number
  rewardStars: number
  rewardFreeze?: number
  isCompleted: boolean
  isClaimed: boolean
  period: 'daily' | 'weekly'
  dateKey: string // YYYY-MM-DD for daily, YYYY-Www for weekly
  categoryFilter?: string // e.g. 'pronunciation', 'grammar', 'vocabulary'
}

export interface QuestSessionInput {
  gameType: string
  score: number // percentage 0-100
  starsEarned: number
}

export interface ClaimRewardResult {
  updatedQuests: Quest[]
  claimedReward: {
    stars: number
    freeze: number
  } | null
  error?: string
}

export interface QuestProgressResult {
  updatedQuests: Quest[]
  newlyCompleted: Quest[]
}
