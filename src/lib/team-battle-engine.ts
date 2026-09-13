// src/lib/team-battle-engine.ts

import type {
  TeamId,
  TeamMascotConfig,
  TeamMember,
  TeamState,
  TeamRoundAnswerResult,
  TeamMvp,
} from '@/types/team-battle'

export const TEAM_CONFIGS: Record<TeamId, TeamMascotConfig> = {
  dragons: {
    id: 'dragons',
    nameVi: 'Rồng Lửa',
    mascotEmoji: '🐉',
    primaryColorHex: '#EF4444',
    bgGradientClass: 'from-rose-500 to-red-600',
    borderClass: 'border-red-500',
    textClass: 'text-red-600',
  },
  eagles: {
    id: 'eagles',
    nameVi: 'Đại Bàng Biển',
    mascotEmoji: '🦅',
    primaryColorHex: '#3B82F6',
    bgGradientClass: 'from-blue-500 to-indigo-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
  },
  sharks: {
    id: 'sharks',
    nameVi: 'Cá Mập Xanh',
    mascotEmoji: '🦈',
    primaryColorHex: '#10B981',
    bgGradientClass: 'from-emerald-500 to-teal-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
  },
  tigers: {
    id: 'tigers',
    nameVi: 'Cọp Vàng',
    mascotEmoji: '🐯',
    primaryColorHex: '#F59E0B',
    bgGradientClass: 'from-amber-500 to-yellow-600',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
  },
}

/**
 * Automatically round-robins students into balanced teams
 */
export function autoAssignStudentsToTeams(
  students: Array<{ id: string; name: string; avatar?: string }>,
  activeTeamIds: TeamId[] = ['dragons', 'eagles']
): TeamState[] {
  const teamMembersMap = new Map<TeamId, TeamMember[]>()
  activeTeamIds.forEach((tId) => teamMembersMap.set(tId, []))

  students.forEach((s, idx) => {
    const targetTeamId = activeTeamIds[idx % activeTeamIds.length]
    const members = teamMembersMap.get(targetTeamId) || []
    members.push({
      id: s.id,
      name: s.name,
      avatar: s.avatar || '⭐',
      points: 0,
      streak: 0,
      isOnline: true,
    })
    teamMembersMap.set(targetTeamId, members)
  })

  return activeTeamIds.map((tId, idx) => ({
    id: tId,
    config: TEAM_CONFIGS[tId],
    members: teamMembersMap.get(tId) || [],
    totalScore: 0,
    rank: idx + 1,
    comboMultiplier: 1.0,
  }))
}

/**
 * Calculates Team Combo Multiplier based on round participation accuracy
 * 100% correct -> 1.3x Flawless bonus
 * >= 50% correct -> 1.15x Great teamwork bonus
 * < 50% correct -> 1.0x Base
 */
export function calculateTeamComboMultiplier(
  correctCount: number,
  totalMembers: number
): number {
  if (totalMembers <= 0) return 1.0
  if (correctCount === totalMembers && totalMembers > 0) return 1.3
  if (correctCount / totalMembers >= 0.5) return 1.15
  return 1.0
}

/**
 * Aggregates round answers, computes combo multipliers, and updates team total scores and rankings
 */
export function computeRoundTeamScores(
  answers: Array<{ studentId: string; teamId: TeamId; score: number; isCorrect: boolean }>,
  currentTeams: TeamState[]
): { updatedTeams: TeamState[]; roundResults: TeamRoundAnswerResult[] } {
  const answersByTeam = new Map<
    TeamId,
    Array<{ studentId: string; score: number; isCorrect: boolean }>
  >()

  answers.forEach((ans) => {
    const arr = answersByTeam.get(ans.teamId) || []
    arr.push(ans)
    answersByTeam.set(ans.teamId, arr)
  })

  const roundResults: TeamRoundAnswerResult[] = []

  const updatedTeams = currentTeams.map((team) => {
    const teamAnswers = answersByTeam.get(team.id) || []
    const correctCount = teamAnswers.filter((a) => a.isCorrect).length
    const totalMembers = team.members.length || teamAnswers.length || 1

    const bonusMultiplier = calculateTeamComboMultiplier(correctCount, totalMembers)
    const baseRoundPoints = teamAnswers.reduce((sum, a) => sum + (a.isCorrect ? a.score : 0), 0)
    const pointsEarnedThisRound = Math.round(baseRoundPoints * bonusMultiplier)

    // Update individual member points within the team
    const updatedMembers = team.members.map((member) => {
      const studentAns = teamAnswers.find((a) => a.studentId === member.id)
      if (studentAns && studentAns.isCorrect) {
        return {
          ...member,
          points: member.points + studentAns.score,
          streak: member.streak + 1,
        }
      }
      return {
        ...member,
        streak: studentAns ? 0 : member.streak,
      }
    })

    roundResults.push({
      teamId: team.id,
      correctCount,
      totalMembers,
      accuracyPercentage: Math.round((correctCount / totalMembers) * 100),
      bonusMultiplier,
      pointsEarnedThisRound,
    })

    return {
      ...team,
      members: updatedMembers,
      totalScore: team.totalScore + pointsEarnedThisRound,
      comboMultiplier: bonusMultiplier,
    }
  })

  // Re-rank teams in descending order of totalScore
  updatedTeams.sort((a, b) => b.totalScore - a.totalScore)
  updatedTeams.forEach((team, idx) => {
    team.rank = idx + 1
  })

  return { updatedTeams, roundResults }
}

/**
 * Resolves the top-performing MVP student for each team
 */
export function resolveTeamMvps(teams: TeamState[]): TeamMvp[] {
  const mvps: TeamMvp[] = []

  teams.forEach((team) => {
    if (team.members.length === 0) return

    let topMember = team.members[0]
    team.members.forEach((m) => {
      if (m.points > topMember.points) {
        topMember = m
      }
    })

    mvps.push({
      teamId: team.id,
      studentId: topMember.id,
      studentName: topMember.name,
      avatar: topMember.avatar,
      score: topMember.points,
    })
  })

  return mvps
}
