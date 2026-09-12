'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { calculateLevel } from '@/lib/levels'

export interface GetClassLeaderboardInput {
  classCode: string
  studentName?: string
}

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  totalStars: number
  sessionsCount: number
  level: number
  levelBadge: string
  levelTitle: string
  isCurrentStudent: boolean
}

export interface ClassLeaderboardResult {
  success: boolean
  classroomName?: string
  classCode?: string
  entries: LeaderboardEntry[]
  currentStudentRank?: number | null
  error?: string
}

export async function getClassLeaderboard(
  input: GetClassLeaderboardInput
): Promise<ClassLeaderboardResult> {
  try {
    const { classCode, studentName } = input || {}

    if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
      return {
        success: false,
        entries: [],
        error: 'Mã lớp không được để trống',
      }
    }

    const cleanCode = classCode.trim().toUpperCase()
    const supabase = createAdminClient()

    // 1. Look up classroom by code and check active status
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, name, is_active')
      .eq('code', cleanCode)
      .single()

    if (classError || !classroom || !classroom.is_active) {
      return {
        success: false,
        entries: [],
        error: 'Mã lớp không hợp lệ hoặc lớp học không hoạt động',
      }
    }

    // 2. Query students in classroom
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, created_at')
      .eq('classroom_id', classroom.id)

    if (studentsError) {
      console.error('[getClassLeaderboard] Error querying students:', studentsError)
      return {
        success: false,
        entries: [],
        error: 'Lỗi khi tải danh sách học sinh',
      }
    }

    if (!students || students.length === 0) {
      return {
        success: true,
        classroomName: classroom.name,
        classCode: cleanCode,
        entries: [],
        currentStudentRank: null,
      }
    }

    // 3. Query game_sessions for those students
    const studentIds = students.map((s) => s.id)
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('student_id, score')
      .in('student_id', studentIds)

    if (sessionsError) {
      console.error('[getClassLeaderboard] Error querying game_sessions:', sessionsError)
      return {
        success: false,
        entries: [],
        error: 'Lỗi khi tải dữ liệu bảng xếp hạng',
      }
    }

    // 4. Group scores by student_id
    const statsMap = new Map<string, { totalStars: number; sessionsCount: number }>()
    for (const student of students) {
      statsMap.set(student.id, { totalStars: 0, sessionsCount: 0 })
    }

    if (sessions) {
      for (const session of sessions) {
        const current = statsMap.get(session.student_id)
        if (current) {
          current.sessionsCount += 1
          const scoreNum =
            typeof session.score === 'number' && !Number.isNaN(session.score)
              ? session.score
              : 0
          if (scoreNum > 0) {
            current.totalStars += scoreNum
          }
        }
      }
    }

    // 4b. Incorporate bonus stars from student_gamification if present
    try {
      const gQuery = supabase.from('student_gamification').select('student_id, inventory')
      if (gQuery && typeof gQuery.in === 'function') {
        const { data: gamificationRows } = await gQuery.in('student_id', studentIds)
        if (gamificationRows) {
          for (const row of gamificationRows) {
            const current = statsMap.get(row.student_id)
            if (current && row.inventory) {
              const inv =
                typeof row.inventory === 'string'
                  ? JSON.parse(row.inventory)
                  : (row.inventory as { bonusStars?: number })
              if (typeof inv?.bonusStars === 'number' && inv.bonusStars > 0) {
                current.totalStars += inv.bonusStars
              }
            }
          }
        }
      }
    } catch {
      // Gracefully continue without bonus stars if table or query is unavailable
    }

    // 5. Build and sort student entries
    const unranked = students.map((student) => {
      const stats = statsMap.get(student.id) || { totalStars: 0, sessionsCount: 0 }
      const levelInfo = calculateLevel(stats.totalStars)
      return {
        studentId: student.id,
        studentName: student.name,
        totalStars: stats.totalStars,
        sessionsCount: stats.sessionsCount,
        level: levelInfo.level,
        levelBadge: levelInfo.badge,
        levelTitle: levelInfo.title,
      }
    })

    // Sort order:
    // 1. totalStars descending
    // 2. sessionsCount descending
    // 3. studentName ascending
    unranked.sort((a, b) => {
      if (b.totalStars !== a.totalStars) {
        return b.totalStars - a.totalStars
      }
      if (b.sessionsCount !== a.sessionsCount) {
        return b.sessionsCount - a.sessionsCount
      }
      return a.studentName.localeCompare(b.studentName)
    })

    // 6. Assign rank and check current student
    const cleanStudentName =
      studentName && typeof studentName === 'string' ? studentName.trim().toLowerCase() : null

    let currentStudentRank: number | null = null

    const entries: LeaderboardEntry[] = unranked.map((item, index) => {
      const rank = index + 1
      const isCurrentStudent =
        !!cleanStudentName && item.studentName.trim().toLowerCase() === cleanStudentName

      if (isCurrentStudent && currentStudentRank === null) {
        currentStudentRank = rank
      }

      return {
        ...item,
        rank,
        isCurrentStudent,
      }
    })

    return {
      success: true,
      classroomName: classroom.name,
      classCode: cleanCode,
      entries,
      currentStudentRank,
    }
  } catch (error) {
    console.error('[getClassLeaderboard] Unexpected error:', error)
    return {
      success: false,
      entries: [],
      error: 'Đã xảy ra lỗi khi tải bảng xếp hạng',
    }
  }
}
