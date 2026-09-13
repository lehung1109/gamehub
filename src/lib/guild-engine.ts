// src/lib/guild-engine.ts

import { STARTER_GUILDS } from '@/data/guilds/starter-guilds'
import type { StudentGuild, GuildBossRaid, GuildMember, GuildCheerMessage } from '@/types/guild'

/**
 * Retrieve all registered student guilds.
 */
export function getAllGuilds(): StudentGuild[] {
  return STARTER_GUILDS
}

/**
 * Retrieve a guild by its unique ID.
 */
export function getGuildById(id: string): StudentGuild | null {
  return STARTER_GUILDS.find((g) => g.id === id) || null
}

/**
 * Find a guild by its short uppercase code (e.g. "DRAGON-99").
 */
export function getGuildByCode(code: string): StudentGuild | null {
  if (!code) return null
  const normalized = code.trim().toUpperCase()
  return STARTER_GUILDS.find((g) => g.code.toUpperCase() === normalized) || null
}

/**
 * Calculate guild level and progress based on total EXP.
 * Every 1,000 EXP = 1 Level.
 */
export function calculateGuildLevel(totalExp: number): {
  level: number
  expInCurrentLevel: number
  expForNextLevel: number
} {
  const safeExp = Math.max(0, totalExp)
  const level = Math.floor(safeExp / 1000) + 1
  const expInCurrentLevel = safeExp % 1000
  const expForNextLevel = 1000

  return {
    level,
    expInCurrentLevel,
    expForNextLevel,
  }
}

/**
 * Inflict damage on weekly Boss Raid proportional to EXP earned.
 */
export function damageBossRaid(boss: GuildBossRaid, expDamage: number): GuildBossRaid {
  const safeDamage = Math.max(0, expDamage)
  const remainingHp = Math.max(0, boss.currentHp - safeDamage)
  const isDefeated = remainingHp === 0

  return {
    ...boss,
    currentHp: remainingHp,
    isDefeated,
  }
}

/**
 * Contribute EXP to guild: updates member record, clan total EXP, weekly EXP, and damages boss raid.
 */
export function contributeExpToGuild(
  guild: StudentGuild,
  studentId: string,
  expGained: number
): StudentGuild {
  const safeExp = Math.max(0, expGained)
  if (safeExp === 0) return guild

  const updatedMembers: GuildMember[] = guild.members.map((m) => {
    if (m.studentId === studentId) {
      return {
        ...m,
        weeklyExpContributed: m.weeklyExpContributed + safeExp,
        totalExpContributed: m.totalExpContributed + safeExp,
      }
    }
    return m
  })

  // If member wasn't in roster, we keep members as is
  const newCurrentExp = guild.currentExp + safeExp
  const newWeeklyExp = guild.currentWeeklyExp + safeExp
  const levelInfo = calculateGuildLevel(newCurrentExp)
  const updatedBoss = damageBossRaid(guild.activeBossRaid, safeExp)

  return {
    ...guild,
    level: levelInfo.level,
    currentExp: newCurrentExp,
    currentWeeklyExp: newWeeklyExp,
    members: updatedMembers,
    activeBossRaid: updatedBoss,
  }
}

/**
 * Add a new student member to a guild roster.
 */
export function addMemberToGuild(
  guild: StudentGuild,
  newMember: { studentId: string; studentName: string; avatar?: string }
): StudentGuild {
  const exists = guild.members.some((m) => m.studentId === newMember.studentId)
  if (exists) return guild

  const member: GuildMember = {
    studentId: newMember.studentId,
    studentName: newMember.studentName,
    role: 'member',
    avatar: newMember.avatar || '🌟',
    weeklyExpContributed: 0,
    totalExpContributed: 0,
    joinedAt: new Date().toISOString(),
  }

  return {
    ...guild,
    members: [...guild.members, member],
  }
}

/**
 * Append an encouraging cheer message to the guild wall.
 */
export function addCheerToGuild(
  guild: StudentGuild,
  cheer: { senderName: string; senderAvatar?: string; messageVi: string; stickerKey?: string }
): StudentGuild {
  const newCheer: GuildCheerMessage = {
    id: `cheer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    senderName: cheer.senderName,
    senderAvatar: cheer.senderAvatar || '🎉',
    stickerKey: cheer.stickerKey || 'cheer-star',
    messageVi: cheer.messageVi,
    createdAt: new Date().toISOString(),
  }

  return {
    ...guild,
    cheerWall: [newCheer, ...guild.cheerWall].slice(0, 50), // Keep up to 50 recent cheers
  }
}
