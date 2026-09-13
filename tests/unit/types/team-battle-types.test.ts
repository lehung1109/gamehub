// tests/unit/types/team-battle-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  TeamId,
  TeamMascotConfig,
  TeamMember,
  TeamState,
  TeamBattleSummary,
} from '@/types/team-battle'

describe('Team Battle Types Contract', () => {
  it('validates TeamId union options', () => {
    const ids: TeamId[] = ['dragons', 'eagles', 'sharks', 'tigers']
    expect(ids).toHaveLength(4)
  })

  it('validates TeamMascotConfig structure', () => {
    const config: TeamMascotConfig = {
      id: 'dragons',
      nameVi: 'Rồng Lửa',
      mascotEmoji: '🐉',
      primaryColorHex: '#EF4444',
      bgGradientClass: 'from-rose-500 to-red-600',
      borderClass: 'border-red-500',
      textClass: 'text-red-600',
    }

    expect(config.id).toBe('dragons')
    expect(config.mascotEmoji).toBe('🐉')
    expect(config.primaryColorHex).toBe('#EF4444')
  })

  it('validates TeamState and TeamMember models', () => {
    const member: TeamMember = {
      id: 'member-1',
      name: 'Bé Khang',
      avatar: '🦊',
      points: 850,
      streak: 3,
      isOnline: true,
    }

    const state: TeamState = {
      id: 'dragons',
      config: {
        id: 'dragons',
        nameVi: 'Rồng Lửa',
        mascotEmoji: '🐉',
        primaryColorHex: '#EF4444',
        bgGradientClass: 'from-rose-500 to-red-600',
        borderClass: 'border-red-500',
        textClass: 'text-red-600',
      },
      members: [member],
      totalScore: 850,
      rank: 1,
      comboMultiplier: 1.15,
    }

    expect(state.members).toHaveLength(1)
    expect(state.totalScore).toBe(850)
    expect(state.comboMultiplier).toBe(1.15)
  })

  it('validates TeamBattleSummary model', () => {
    const state: TeamState = {
      id: 'eagles',
      config: {
        id: 'eagles',
        nameVi: 'Đại Bàng',
        mascotEmoji: '🦅',
        primaryColorHex: '#3B82F6',
        bgGradientClass: 'from-blue-500 to-indigo-600',
        borderClass: 'border-blue-500',
        textClass: 'text-blue-600',
      },
      members: [],
      totalScore: 2400,
      rank: 1,
      comboMultiplier: 1.0,
    }

    const summary: TeamBattleSummary = {
      sessionId: 'sess-arena-101',
      winningTeam: state,
      teamRankings: [state],
      mvps: [
        {
          teamId: 'eagles',
          studentId: 'stu-10',
          studentName: 'Bé Hùng',
          avatar: '🦁',
          score: 1200,
        },
      ],
    }

    expect(summary.sessionId).toBe('sess-arena-101')
    expect(summary.winningTeam.id).toBe('eagles')
    expect(summary.mvps[0].score).toBe(1200)
  })
})
