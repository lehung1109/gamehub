// tests/unit/actions/guilds.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllGuildsAction,
  getGuildDetailsAction,
  joinGuildByCodeAction,
  contributeGuildExpAction,
  postGuildCheerAction,
} from '@/app/actions/guilds'

describe('Guild Server Actions', () => {
  describe('getAllGuildsAction', () => {
    it('returns all starter guilds', async () => {
      const res = await getAllGuildsAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('getGuildDetailsAction', () => {
    it('returns error when guildId is invalid or not found', async () => {
      const res = await getGuildDetailsAction('')
      expect(res.success).toBe(false)

      const notFound = await getGuildDetailsAction('not-a-guild')
      expect(notFound.success).toBe(false)
    })

    it('returns guild data when guildId exists', async () => {
      const res = await getGuildDetailsAction('fire-dragons')
      expect(res.success).toBe(true)
      expect(res.data?.name).toBe('Hiệp Sĩ Rồng Lửa')
      expect(res.data?.code).toBe('DRAGON-99')
    })
  })

  describe('joinGuildByCodeAction', () => {
    it('returns error on invalid code or missing student info', async () => {
      const res1 = await joinGuildByCodeAction('', '', '')
      expect(res1.success).toBe(false)

      const res2 = await joinGuildByCodeAction('std-1', 'Name', 'WRONG-CODE')
      expect(res2.success).toBe(false)
      expect(res2.error).toContain('Mã bang hội không tồn tại')
    })

    it('adds student to guild when code is valid', async () => {
      const res = await joinGuildByCodeAction('std-new-joiner', 'Bé Thảo My', 'OWL-101')
      expect(res.success).toBe(true)
      expect(res.data?.members.some((m) => m.studentId === 'std-new-joiner')).toBe(true)
    })
  })

  describe('contributeGuildExpAction', () => {
    it('returns error when guildId or studentId is invalid', async () => {
      const res = await contributeGuildExpAction('', '', 50)
      expect(res.success).toBe(false)
    })

    it('applies EXP contribution and reduces boss HP', async () => {
      const details = await getGuildDetailsAction('fire-dragons')
      const initialHp = details.data!.activeBossRaid.currentHp

      const res = await contributeGuildExpAction('fire-dragons', 'std-dragon-1', 100)
      expect(res.success).toBe(true)
      expect(res.data?.bossHp).toBe(initialHp - 100)
    })
  })

  describe('postGuildCheerAction', () => {
    it('validates cheer message content and adds cheer to wall', async () => {
      const emptyRes = await postGuildCheerAction('fire-dragons', 'Bé Minh', '')
      expect(emptyRes.success).toBe(false)

      const res = await postGuildCheerAction(
        'fire-dragons',
        'Bé Minh',
        'Hôm nay cả đội làm rất tốt!',
        'cheer-star'
      )
      expect(res.success).toBe(true)
      expect(res.data?.cheerWall[0].messageVi).toBe('Hôm nay cả đội làm rất tốt!')
    })
  })
})
