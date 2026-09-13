// tests/unit/lib/guild-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllGuilds,
  getGuildById,
  getGuildByCode,
  calculateGuildLevel,
  damageBossRaid,
  contributeExpToGuild,
  addMemberToGuild,
  addCheerToGuild,
} from '@/lib/guild-engine'
import type { GuildBossRaid } from '@/types/guild'

describe('Guild Engine Pure Functions', () => {
  it('retrieves all starter guilds', () => {
    const guilds = getAllGuilds()
    expect(guilds.length).toBeGreaterThanOrEqual(3)
    expect(guilds.some((g) => g.code === 'DRAGON-99')).toBe(true)
    expect(guilds.some((g) => g.code === 'OWL-101')).toBe(true)
    expect(guilds.some((g) => g.code === 'FOX-88')).toBe(true)
  })

  it('retrieves guild by id and returns null when not found', () => {
    const found = getGuildById('fire-dragons')
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Hiệp Sĩ Rồng Lửa')

    const notFound = getGuildById('non-existent')
    expect(notFound).toBeNull()
  })

  it('retrieves guild by case-insensitive code', () => {
    const found = getGuildByCode('dragon-99')
    expect(found).not.toBeNull()
    expect(found?.id).toBe('fire-dragons')

    const notFound = getGuildByCode('INVALID-CODE')
    expect(notFound).toBeNull()
  })

  it('calculates guild level and progress correctly', () => {
    // 0 XP -> Level 1, 0 / 1000
    expect(calculateGuildLevel(0)).toEqual({
      level: 1,
      expInCurrentLevel: 0,
      expForNextLevel: 1000,
    })

    // 2500 XP -> Level 3, 500 / 1000
    expect(calculateGuildLevel(2500)).toEqual({
      level: 3,
      expInCurrentLevel: 500,
      expForNextLevel: 1000,
    })
  })

  it('damages boss raid and triggers isDefeated when HP drops to 0', () => {
    const boss: GuildBossRaid = {
      id: 'b1',
      bossName: 'Test Boss',
      bossAvatar: '👾',
      maxHp: 1000,
      currentHp: 400,
      targetWeek: '2026-W37',
      rewardsExp: 200,
      isDefeated: false,
    }

    const damaged = damageBossRaid(boss, 150)
    expect(damaged.currentHp).toBe(250)
    expect(damaged.isDefeated).toBe(false)

    const defeated = damageBossRaid(damaged, 300)
    expect(defeated.currentHp).toBe(0)
    expect(defeated.isDefeated).toBe(true)
  })

  it('contributes EXP to guild, updates member, guild level and boss raid HP', () => {
    const baseGuild = getGuildById('fire-dragons')!
    const memberId = baseGuild.members[0].studentId
    const initialMemberWeeklyExp = baseGuild.members[0].weeklyExpContributed
    const initialBossHp = baseGuild.activeBossRaid.currentHp

    const updated = contributeExpToGuild(baseGuild, memberId, 100)

    const updatedMember = updated.members.find((m) => m.studentId === memberId)
    expect(updatedMember?.weeklyExpContributed).toBe(initialMemberWeeklyExp + 100)
    expect(updated.currentExp).toBe(baseGuild.currentExp + 100)
    expect(updated.activeBossRaid.currentHp).toBe(initialBossHp - 100)
  })

  it('adds member to guild and prevents duplicates', () => {
    const baseGuild = getGuildById('swift-foxes')!
    const updated = addMemberToGuild(baseGuild, {
      studentId: 'new-student-99',
      studentName: 'Bé Khải Nguyên',
      avatar: '🚀',
    })

    expect(updated.members.some((m) => m.studentId === 'new-student-99')).toBe(true)

    // Second add should not duplicate
    const duplicated = addMemberToGuild(updated, {
      studentId: 'new-student-99',
      studentName: 'Bé Khải Nguyên',
    })
    expect(duplicated.members.filter((m) => m.studentId === 'new-student-99')).toHaveLength(1)
  })

  it('adds cheer message to guild cheerWall', () => {
    const baseGuild = getGuildById('wise-owls')!
    const initialCount = baseGuild.cheerWall.length

    const updated = addCheerToGuild(baseGuild, {
      senderName: 'Bé An Nhiên',
      senderAvatar: '🌸',
      messageVi: 'Chúc các bạn ngày mới học vui!',
      stickerKey: 'cheer-flower',
    })

    expect(updated.cheerWall.length).toBe(initialCount + 1)
    expect(updated.cheerWall[0].senderName).toBe('Bé An Nhiên')
    expect(updated.cheerWall[0].messageVi).toContain('ngày mới học vui')
  })
})
