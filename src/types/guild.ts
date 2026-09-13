// src/types/guild.ts

export type GuildRole = 'leader' | 'officer' | 'member'
export type GuildMascot = 'fox' | 'dragon' | 'owl' | 'lion' | 'tiger'

export interface GuildMember {
  studentId: string
  studentName: string
  role: GuildRole
  avatar: string
  weeklyExpContributed: number
  totalExpContributed: number
  joinedAt: string
}

export interface GuildBossRaid {
  id: string
  bossName: string
  bossAvatar: string
  maxHp: number
  currentHp: number
  targetWeek: string
  rewardsExp: number
  isDefeated: boolean
}

export interface GuildCheerMessage {
  id: string
  senderName: string
  senderAvatar: string
  stickerKey: string
  messageVi: string
  createdAt: string
}

export interface StudentGuild {
  id: string
  name: string
  code: string
  description: string
  mascot: GuildMascot
  mascotAvatar: string
  bannerColor: string
  level: number
  currentExp: number
  weeklyQuestGoalExp: number
  currentWeeklyExp: number
  members: GuildMember[]
  activeBossRaid: GuildBossRaid
  cheerWall: GuildCheerMessage[]
}
