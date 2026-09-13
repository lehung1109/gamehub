// tests/unit/actions/team-battle.test.ts

import { describe, it, expect } from 'vitest'
import {
  initTeamBattleSessionAction,
  joinTeamAction,
  recordTeamAnswersAction,
} from '@/app/actions/team-battle'
import { TEAM_CONFIGS } from '@/lib/team-battle-engine'
import type { TeamState } from '@/types/team-battle'

describe('Team Battle Server Actions', () => {
  describe('initTeamBattleSessionAction', () => {
    it('returns error when arenaSessionId is missing', async () => {
      const res = await initTeamBattleSessionAction('')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thiếu mã phòng đấu trường.')
    })

    it('initializes 2 teams for head-to-head clash', async () => {
      const res = await initTeamBattleSessionAction('session-100', 2)
      expect(res.success).toBe(true)
      expect(res.data?.teams).toHaveLength(2)
      expect(res.data?.teams[0].id).toBe('dragons')
      expect(res.data?.teams[1].id).toBe('eagles')
    })

    it('initializes 4 teams for quad tournament', async () => {
      const res = await initTeamBattleSessionAction('session-100', 4)
      expect(res.success).toBe(true)
      expect(res.data?.teams).toHaveLength(4)
    })
  })

  describe('joinTeamAction', () => {
    it('returns error when required arguments are missing', async () => {
      const res = await joinTeamAction('', '', '')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Thông tin học sinh không hợp lệ.')
    })

    it('joins preferred team when specified', async () => {
      const res = await joinTeamAction('session-100', 'stu-99', 'Bé Thỏ', '🐰', 'sharks')
      expect(res.success).toBe(true)
      expect(res.data?.assignedTeamId).toBe('sharks')
      expect(res.data?.member.name).toBe('Bé Thỏ')
    })
  })

  describe('recordTeamAnswersAction', () => {
    it('calculates score and returns round summary', async () => {
      const initialTeams: TeamState[] = [
        {
          id: 'dragons',
          config: TEAM_CONFIGS.dragons,
          members: [{ id: 's1', name: 'An', avatar: '🐉', points: 0, streak: 0, isOnline: true }],
          totalScore: 0,
          rank: 1,
          comboMultiplier: 1.0,
        },
      ]

      const answers = [
        { studentId: 's1', teamId: 'dragons' as const, score: 900, isCorrect: true },
      ]

      const res = await recordTeamAnswersAction('session-100', answers, initialTeams)
      expect(res.success).toBe(true)
      expect(res.data?.updatedTeams).toHaveLength(1)
      expect(res.data?.updatedTeams[0].totalScore).toBeGreaterThanOrEqual(900)
      expect(res.data?.roundSummary).toHaveLength(1)
    })
  })
})
