'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { calculateLevel } from '@/lib/levels'
import { getShopItemById } from '@/lib/shop'

export interface LeaderboardEntry {
  rank: number
  studentName: string
  avatar: string
  totalStars: number
  currentStreak: number
  duelWins: number
  levelName?: string
  frameClass?: string
  titleName?: string
}

function parseInventoryData(raw: unknown): {
  bonusStars: number
  equippedFrameId: string | null
  equippedTitleId: string | null
} {
  if (!raw) return { bonusStars: 0, equippedFrameId: null, equippedTitleId: null }
  let obj = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch {
      return { bonusStars: 0, equippedFrameId: null, equippedTitleId: null }
    }
  }
  if (typeof obj === 'object' && obj !== null) {
    const rec = obj as Record<string, unknown>
    return {
      bonusStars:
        typeof rec.bonusStars === 'number' && !isNaN(rec.bonusStars)
          ? Math.max(0, rec.bonusStars)
          : 0,
      equippedFrameId:
        typeof rec.equippedFrameId === 'string' && rec.equippedFrameId.trim().length > 0
          ? rec.equippedFrameId.trim()
          : null,
      equippedTitleId:
        typeof rec.equippedTitleId === 'string' && rec.equippedTitleId.trim().length > 0
          ? rec.equippedTitleId.trim()
          : null,
    }
  }
  return { bonusStars: 0, equippedFrameId: null, equippedTitleId: null }
}

function parseStreakData(raw: unknown): { currentStreak: number } {
  if (!raw) return { currentStreak: 0 }
  let obj = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch {
      return { currentStreak: 0 }
    }
  }
  if (typeof obj === 'object' && obj !== null) {
    const rec = obj as Record<string, unknown>
    return {
      currentStreak:
        typeof rec.currentStreak === 'number' && !isNaN(rec.currentStreak)
          ? Math.max(0, rec.currentStreak)
          : 0,
    }
  }
  return { currentStreak: 0 }
}

/**
 * Retrieves classroom leaderboard entries for a given classCode, aggregated with
 * game session stars, streak state, duel wins, and equipped cosmetics.
 */
export async function getClassLeaderboardAction(
  classCode: string
): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
  try {
    if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
      return {
        success: false,
        error: 'Mã lớp không được để trống',
      }
    }

    const cleanCode = classCode.trim().toUpperCase()
    const supabase = createAdminClient()

    // 1. Look up classroom by code
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, name, is_active')
      .eq('code', cleanCode)
      .single()

    if (classError || !classroom || !classroom.is_active) {
      return {
        success: false,
        error: 'Mã lớp không hợp lệ hoặc lớp học không hoạt động',
      }
    }

    // 2. Query students in classroom
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('classroom_id', classroom.id)

    if (studentsError) {
      console.error('[getClassLeaderboardAction] Error querying students:', studentsError)
      return {
        success: false,
        error: 'Lỗi khi tải danh sách học sinh',
      }
    }

    if (!students || students.length === 0) {
      return {
        success: true,
        data: [],
      }
    }

    const studentIds = students.map((s) => s.id)

    // 3. Query game_sessions, student_gamification, and pvp_duels in parallel
    const [sessionsRes, gamificationRes, duelsRes] = await Promise.all([
      supabase
        .from('game_sessions')
        .select('student_id, score')
        .in('student_id', studentIds),
      supabase
        .from('student_gamification')
        .select('student_id, streak_state, inventory')
        .in('student_id', studentIds),
      supabase
        .from('pvp_duels')
        .select('winner_name, player1_name, player1_avatar, player2_name, player2_avatar')
        .eq('status', 'finished'),
    ])

    if (sessionsRes.error) {
      console.error('[getClassLeaderboardAction] Error querying game_sessions:', sessionsRes.error)
      return {
        success: false,
        error: 'Lỗi khi tải dữ liệu điểm học sinh',
      }
    }

    // 4. Map game_sessions scores
    const starsMap = new Map<string, number>()
    for (const s of students) {
      starsMap.set(s.id, 0)
    }
    if (sessionsRes.data) {
      for (const session of sessionsRes.data) {
        const current = starsMap.get(session.student_id) ?? 0
        const score =
          typeof session.score === 'number' && !isNaN(session.score)
            ? Math.max(0, session.score)
            : 0
        starsMap.set(session.student_id, current + score)
      }
    }

    // 5. Map gamification (bonusStars, streaks, cosmetics)
    const gamificationMap = new Map<
      string,
      {
        bonusStars: number
        streak: number
        frameClass?: string
        titleName?: string
      }
    >()

    if (gamificationRes.data) {
      for (const row of gamificationRes.data) {
        const inv = parseInventoryData(row.inventory)
        const streak = parseStreakData(row.streak_state).currentStreak

        const frameItem = inv.equippedFrameId ? getShopItemById(inv.equippedFrameId) : undefined
        const titleItem = inv.equippedTitleId ? getShopItemById(inv.equippedTitleId) : undefined

        gamificationMap.set(row.student_id, {
          bonusStars: inv.bonusStars,
          streak,
          frameClass: frameItem?.cssClass,
          titleName: titleItem?.name,
        })
      }
    }

    // 6. Map duel wins & student avatars from pvp_duels
    const duelWinsMap = new Map<string, number>()
    const avatarMap = new Map<string, string>()

    if (duelsRes.data) {
      for (const duel of duelsRes.data) {
        if (duel.winner_name) {
          const currentWins = duelWinsMap.get(duel.winner_name) || 0
          duelWinsMap.set(duel.winner_name, currentWins + 1)
        }
        if (duel.player1_name && duel.player1_avatar) {
          avatarMap.set(duel.player1_name, duel.player1_avatar)
        }
        if (duel.player2_name && duel.player2_avatar) {
          avatarMap.set(duel.player2_name, duel.player2_avatar)
        }
      }
    }

    // 7. Assemble entries
    const unranked: Omit<LeaderboardEntry, 'rank'>[] = students.map((student) => {
      const baseStars = starsMap.get(student.id) || 0
      const gamif = gamificationMap.get(student.id)
      const totalStars = baseStars + (gamif?.bonusStars || 0)
      const currentStreak = gamif?.streak || 0
      const duelWins = duelWinsMap.get(student.name) || 0
      const avatar = avatarMap.get(student.name) || '🦊'
      const levelInfo = calculateLevel(totalStars)

      return {
        studentName: student.name,
        avatar,
        totalStars,
        currentStreak,
        duelWins,
        levelName: levelInfo.title,
        frameClass: gamif?.frameClass,
        titleName: gamif?.titleName,
      }
    })

    // Sort order:
    // 1. totalStars descending
    // 2. duelWins descending
    // 3. currentStreak descending
    // 4. studentName ascending
    unranked.sort((a, b) => {
      if (b.totalStars !== a.totalStars) {
        return b.totalStars - a.totalStars
      }
      if (b.duelWins !== a.duelWins) {
        return b.duelWins - a.duelWins
      }
      if (b.currentStreak !== a.currentStreak) {
        return b.currentStreak - a.currentStreak
      }
      return a.studentName.localeCompare(b.studentName)
    })

    const rankedEntries: LeaderboardEntry[] = unranked.map((item, index) => ({
      ...item,
      rank: index + 1,
    }))

    return {
      success: true,
      data: rankedEntries,
    }
  } catch (err: unknown) {
    console.error('[getClassLeaderboardAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải bảng xếp hạng',
    }
  }
}

/**
 * Retrieves the global top 20 learners platform-wide.
 * Supports 'weekly' and 'all' timeframe filtering.
 */
export async function getGlobalLeaderboardAction(
  timeframe: 'weekly' | 'all' = 'all'
): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
  try {
    const supabase = createAdminClient()

    // 1. Query all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')

    if (studentsError) {
      console.error('[getGlobalLeaderboardAction] Error querying students:', studentsError)
      return {
        success: false,
        error: 'Lỗi khi tải danh sách học sinh',
      }
    }

    if (!students || students.length === 0) {
      return {
        success: true,
        data: [],
      }
    }

    // 2. Query game_sessions with timeframe filter
    let sessionsQuery = supabase
      .from('game_sessions')
      .select('student_id, score, started_at')

    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      sessionsQuery = sessionsQuery.gte('started_at', oneWeekAgo)
    }

    // 3. Query gamifications and duels in parallel
    const [sessionsRes, gamificationRes, duelsRes] = await Promise.all([
      sessionsQuery,
      supabase.from('student_gamification').select('student_id, streak_state, inventory'),
      supabase
        .from('pvp_duels')
        .select('winner_name, player1_name, player1_avatar, player2_name, player2_avatar')
        .eq('status', 'finished'),
    ])

    if (sessionsRes.error) {
      console.error('[getGlobalLeaderboardAction] Error querying game_sessions:', sessionsRes.error)
      return {
        success: false,
        error: 'Lỗi khi tải dữ liệu phiên chơi',
      }
    }

    // 4. Map game_sessions scores
    const starsMap = new Map<string, number>()
    for (const s of students) {
      starsMap.set(s.id, 0)
    }
    if (sessionsRes.data) {
      for (const session of sessionsRes.data) {
        const current = starsMap.get(session.student_id) ?? 0
        const score =
          typeof session.score === 'number' && !isNaN(session.score)
            ? Math.max(0, session.score)
            : 0
        starsMap.set(session.student_id, current + score)
      }
    }

    // 5. Map gamification
    const gamificationMap = new Map<
      string,
      {
        bonusStars: number
        streak: number
        frameClass?: string
        titleName?: string
      }
    >()

    if (gamificationRes.data) {
      for (const row of gamificationRes.data) {
        const inv = parseInventoryData(row.inventory)
        const streak = parseStreakData(row.streak_state).currentStreak

        const frameItem = inv.equippedFrameId ? getShopItemById(inv.equippedFrameId) : undefined
        const titleItem = inv.equippedTitleId ? getShopItemById(inv.equippedTitleId) : undefined

        gamificationMap.set(row.student_id, {
          bonusStars: inv.bonusStars,
          streak,
          frameClass: frameItem?.cssClass,
          titleName: titleItem?.name,
        })
      }
    }

    // 6. Map duel wins & avatars
    const duelWinsMap = new Map<string, number>()
    const avatarMap = new Map<string, string>()

    if (duelsRes.data) {
      for (const duel of duelsRes.data) {
        if (duel.winner_name) {
          const currentWins = duelWinsMap.get(duel.winner_name) || 0
          duelWinsMap.set(duel.winner_name, currentWins + 1)
        }
        if (duel.player1_name && duel.player1_avatar) {
          avatarMap.set(duel.player1_name, duel.player1_avatar)
        }
        if (duel.player2_name && duel.player2_avatar) {
          avatarMap.set(duel.player2_name, duel.player2_avatar)
        }
      }
    }

    // 7. Assemble entries
    const unranked: Omit<LeaderboardEntry, 'rank'>[] = students.map((student) => {
      const baseStars = starsMap.get(student.id) || 0
      const gamif = gamificationMap.get(student.id)
      const totalStars = baseStars + (gamif?.bonusStars || 0)
      const currentStreak = gamif?.streak || 0
      const duelWins = duelWinsMap.get(student.name) || 0
      const avatar = avatarMap.get(student.name) || '🦊'
      const levelInfo = calculateLevel(totalStars)

      return {
        studentName: student.name,
        avatar,
        totalStars,
        currentStreak,
        duelWins,
        levelName: levelInfo.title,
        frameClass: gamif?.frameClass,
        titleName: gamif?.titleName,
      }
    })

    // Sort:
    unranked.sort((a, b) => {
      if (b.totalStars !== a.totalStars) {
        return b.totalStars - a.totalStars
      }
      if (b.duelWins !== a.duelWins) {
        return b.duelWins - a.duelWins
      }
      if (b.currentStreak !== a.currentStreak) {
        return b.currentStreak - a.currentStreak
      }
      return a.studentName.localeCompare(b.studentName)
    })

    // Take top 20 learners platform-wide
    const top20 = unranked.slice(0, 20).map((item, index) => ({
      ...item,
      rank: index + 1,
    }))

    return {
      success: true,
      data: top20,
    }
  } catch (err: unknown) {
    console.error('[getGlobalLeaderboardAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải bảng xếp hạng',
    }
  }
}
