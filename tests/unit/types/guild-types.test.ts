// tests/unit/types/guild-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  GuildRole,
  GuildMascot,
  GuildMember,
  GuildBossRaid,
  GuildCheerMessage,
  StudentGuild,
} from '@/types/guild'

describe('Guild Types & Contracts', () => {
  it('validates GuildRole and GuildMascot enums', () => {
    const roles: GuildRole[] = ['leader', 'officer', 'member']
    const mascots: GuildMascot[] = ['fox', 'dragon', 'owl', 'lion', 'tiger']
    expect(roles).toHaveLength(3)
    expect(mascots).toHaveLength(5)
  })

  it('validates GuildMember structure', () => {
    const member: GuildMember = {
      studentId: 'std-1',
      studentName: 'Bé Minh Anh',
      role: 'leader',
      avatar: '🦊',
      weeklyExpContributed: 350,
      totalExpContributed: 1200,
      joinedAt: '2026-09-01T08:00:00Z',
    }

    expect(member.studentName).toBe('Bé Minh Anh')
    expect(member.role).toBe('leader')
    expect(member.weeklyExpContributed).toBe(350)
  })

  it('validates GuildBossRaid structure and defeat state', () => {
    const boss: GuildBossRaid = {
      id: 'boss-w37',
      bossName: 'Rồng Từ Vựng (Vocab Dragon)',
      bossAvatar: '🐉',
      maxHp: 5000,
      currentHp: 1200,
      targetWeek: '2026-W37',
      rewardsExp: 500,
      isDefeated: false,
    }

    expect(boss.currentHp).toBe(1200)
    expect(boss.isDefeated).toBe(false)
  })

  it('validates GuildCheerMessage structure', () => {
    const cheer: GuildCheerMessage = {
      id: 'cheer-1',
      senderName: 'Bé Hải Đăng',
      senderAvatar: '🦁',
      stickerKey: 'cheer-star',
      messageVi: 'Cùng cố lên các bạn ơi!',
      createdAt: '2026-09-13T10:00:00Z',
    }

    expect(cheer.stickerKey).toBe('cheer-star')
    expect(cheer.messageVi).toContain('Cùng cố lên')
  })

  it('validates StudentGuild complete model', () => {
    const guild: StudentGuild = {
      id: 'fire-dragons',
      name: 'Hiệp Sĩ Rồng Lửa',
      code: 'DRAGON-99',
      description: 'Bang hội dành cho những chiến binh đam mê chinh phục thử thách tiếng Anh!',
      mascot: 'dragon',
      mascotAvatar: '🐲',
      bannerColor: 'amber',
      level: 4,
      currentExp: 3450,
      weeklyQuestGoalExp: 5000,
      currentWeeklyExp: 2150,
      members: [],
      activeBossRaid: {
        id: 'boss-w37',
        bossName: 'Rồng Từ Vựng',
        bossAvatar: '🐉',
        maxHp: 5000,
        currentHp: 2850,
        targetWeek: '2026-W37',
        rewardsExp: 500,
        isDefeated: false,
      },
      cheerWall: [],
    }

    expect(guild.code).toBe('DRAGON-99')
    expect(guild.level).toBe(4)
    expect(guild.mascot).toBe('dragon')
  })
})
