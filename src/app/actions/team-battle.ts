// src/app/actions/team-battle.ts

'use server'

import type {
  TeamId,
  TeamMember,
  TeamState,
  TeamRoundAnswerResult,
} from '@/types/team-battle'
import {
  TEAM_CONFIGS,
  computeRoundTeamScores,
} from '@/lib/team-battle-engine'

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Initializes a team battle session with 2 or 4 teams
 */
export async function initTeamBattleSessionAction(
  arenaSessionId: string,
  teamCount: 2 | 4 = 2
): Promise<ActionResponse<{ teams: TeamState[] }>> {
  try {
    if (!arenaSessionId) {
      return { success: false, error: 'Thiếu mã phòng đấu trường.' }
    }

    const activeTeamIds: TeamId[] =
      teamCount === 4
        ? ['dragons', 'eagles', 'sharks', 'tigers']
        : ['dragons', 'eagles']

    const teams: TeamState[] = activeTeamIds.map((tId, idx) => ({
      id: tId,
      config: TEAM_CONFIGS[tId],
      members: [],
      totalScore: 0,
      rank: idx + 1,
      comboMultiplier: 1.0,
    }))

    return { success: true, data: { teams } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể khởi tạo chế độ đấu đội.'
    return { success: false, error: message }
  }
}

/**
 * Assigns or joins a student into a team
 */
export async function joinTeamAction(
  arenaSessionId: string,
  studentId: string,
  studentName: string,
  avatar: string = '⭐',
  preferredTeamId?: TeamId
): Promise<ActionResponse<{ assignedTeamId: TeamId; member: TeamMember }>> {
  try {
    if (!arenaSessionId || !studentId || !studentName) {
      return { success: false, error: 'Thông tin học sinh không hợp lệ.' }
    }

    const assignedTeamId: TeamId = preferredTeamId || 'dragons'
    const member: TeamMember = {
      id: studentId,
      name: studentName,
      avatar,
      points: 0,
      streak: 0,
      isOnline: true,
    }

    return {
      success: true,
      data: {
        assignedTeamId,
        member,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi tham gia đội.'
    return { success: false, error: message }
  }
}

/**
 * Records round answers and calculates team combo multipliers and score updates
 */
export async function recordTeamAnswersAction(
  arenaSessionId: string,
  answers: Array<{ studentId: string; teamId: TeamId; score: number; isCorrect: boolean }>,
  currentTeams: TeamState[]
): Promise<ActionResponse<{ updatedTeams: TeamState[]; roundSummary: TeamRoundAnswerResult[] }>> {
  try {
    if (!arenaSessionId || !Array.isArray(answers) || !Array.isArray(currentTeams)) {
      return { success: false, error: 'Dữ liệu vòng đấu không hợp lệ.' }
    }

    const { updatedTeams, roundResults } = computeRoundTeamScores(answers, currentTeams)

    return {
      success: true,
      data: {
        updatedTeams,
        roundSummary: roundResults,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi tính điểm vòng đấu.'
    return { success: false, error: message }
  }
}
