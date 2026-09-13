// src/types/team-battle.ts

export type TeamId = 'dragons' | 'eagles' | 'sharks' | 'tigers'

export interface TeamMascotConfig {
  id: TeamId
  nameVi: string
  mascotEmoji: string
  primaryColorHex: string
  bgGradientClass: string
  borderClass: string
  textClass: string
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  points: number
  streak: number
  isOnline: boolean
}

export interface TeamState {
  id: TeamId
  config: TeamMascotConfig
  members: TeamMember[]
  totalScore: number
  rank: number
  comboMultiplier: number
}

export interface TeamRoundAnswerResult {
  teamId: TeamId
  correctCount: number
  totalMembers: number
  accuracyPercentage: number
  bonusMultiplier: number
  pointsEarnedThisRound: number
}

export interface TeamMvp {
  teamId: TeamId
  studentId: string
  studentName: string
  avatar: string
  score: number
}

export interface TeamBattleSummary {
  sessionId: string
  winningTeam: TeamState
  teamRankings: TeamState[]
  mvps: TeamMvp[]
}
