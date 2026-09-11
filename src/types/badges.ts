export interface BadgeDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: 'milestone' | 'accuracy' | 'exploration' | 'honor'
}

export interface UnlockedBadge {
  badgeId: string
  unlockedAt: string
}

export interface StudentStatsInput {
  totalStars: number
  totalSessions: number
  uniqueGameTypes: string[]
  hasPerfectGame?: boolean
  hasTypingGame?: boolean
  hasDetectiveCase?: boolean
  hasCompletedPosStage?: boolean
  rankInClass?: number | null
}
