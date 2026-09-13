// tests/unit/lib/team-battle-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  TEAM_CONFIGS,
  autoAssignStudentsToTeams,
  calculateTeamComboMultiplier,
  computeRoundTeamScores,
  resolveTeamMvps,
} from '@/lib/team-battle-engine'
import type { TeamState } from '@/types/team-battle'

describe('Team Battle Engine', () => {
  it('contains configs for all 4 mascots', () => {
    expect(TEAM_CONFIGS.dragons.mascotEmoji).toBe('🐉')
    expect(TEAM_CONFIGS.eagles.mascotEmoji).toBe('🦅')
    expect(TEAM_CONFIGS.sharks.mascotEmoji).toBe('🦈')
    expect(TEAM_CONFIGS.tigers.mascotEmoji).toBe('🐯')
  })

  it('balances student headcount evenly across active teams', () => {
    const students = [
      { id: 's1', name: 'An' },
      { id: 's2', name: 'Bình' },
      { id: 's3', name: 'Cường' },
      { id: 's4', name: 'Dung' },
      { id: 's5', name: 'Em' },
    ]

    const teams = autoAssignStudentsToTeams(students, ['dragons', 'eagles'])

    expect(teams).toHaveLength(2)
    // 5 students across 2 teams -> 3 in first, 2 in second
    expect(teams[0].members.length).toBe(3)
    expect(teams[1].members.length).toBe(2)
    expect(teams[0].members[0].name).toBe('An')
    expect(teams[1].members[0].name).toBe('Bình')
  })

  it('calculates combo multiplier for flawless and great teamwork rounds', () => {
    // 100% correct -> 1.3
    expect(calculateTeamComboMultiplier(4, 4)).toBe(1.3)
    // >= 50% correct -> 1.15
    expect(calculateTeamComboMultiplier(2, 4)).toBe(1.15)
    expect(calculateTeamComboMultiplier(3, 4)).toBe(1.15)
    // < 50% correct -> 1.0
    expect(calculateTeamComboMultiplier(1, 4)).toBe(1.0)
    expect(calculateTeamComboMultiplier(0, 4)).toBe(1.0)
  })

  it('computes round team scores with multiplier and re-ranks teams', () => {
    const initialTeams: TeamState[] = [
      {
        id: 'dragons',
        config: TEAM_CONFIGS.dragons,
        members: [
          { id: 's1', name: 'An', avatar: '🐉', points: 0, streak: 0, isOnline: true },
          { id: 's2', name: 'Bình', avatar: '🐉', points: 0, streak: 0, isOnline: true },
        ],
        totalScore: 0,
        rank: 1,
        comboMultiplier: 1.0,
      },
      {
        id: 'eagles',
        config: TEAM_CONFIGS.eagles,
        members: [
          { id: 's3', name: 'Cường', avatar: '🦅', points: 0, streak: 0, isOnline: true },
          { id: 's4', name: 'Dung', avatar: '🦅', points: 0, streak: 0, isOnline: true },
        ],
        totalScore: 0,
        rank: 2,
        comboMultiplier: 1.0,
      },
    ]

    // Dragons: both correct (1000 + 1000 = 2000 * 1.3 = 2600)
    // Eagles: 1 correct (800 * 1.15 = 920)
    const answers = [
      { studentId: 's1', teamId: 'dragons' as const, score: 1000, isCorrect: true },
      { studentId: 's2', teamId: 'dragons' as const, score: 1000, isCorrect: true },
      { studentId: 's3', teamId: 'eagles' as const, score: 800, isCorrect: true },
      { studentId: 's4', teamId: 'eagles' as const, score: 0, isCorrect: false },
    ]

    const { updatedTeams, roundResults } = computeRoundTeamScores(answers, initialTeams)

    expect(roundResults).toHaveLength(2)

    const dragonTeam = updatedTeams.find((t) => t.id === 'dragons')
    const eagleTeam = updatedTeams.find((t) => t.id === 'eagles')

    expect(dragonTeam?.totalScore).toBe(2600)
    expect(dragonTeam?.rank).toBe(1)
    expect(eagleTeam?.totalScore).toBe(920)
    expect(eagleTeam?.rank).toBe(2)
  })

  it('resolves team MVPs correctly', () => {
    const teams: TeamState[] = [
      {
        id: 'dragons',
        config: TEAM_CONFIGS.dragons,
        members: [
          { id: 's1', name: 'An', avatar: '🐉', points: 500, streak: 1, isOnline: true },
          { id: 's2', name: 'Bình (MVP)', avatar: '🐉', points: 1500, streak: 3, isOnline: true },
        ],
        totalScore: 2000,
        rank: 1,
        comboMultiplier: 1.0,
      },
    ]

    const mvps = resolveTeamMvps(teams)
    expect(mvps).toHaveLength(1)
    expect(mvps[0].studentId).toBe('s2')
    expect(mvps[0].score).toBe(1500)
  })
})
