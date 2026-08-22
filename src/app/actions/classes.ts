'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateClassCode } from '@/lib/class-code'
import type { Database } from '@/types/database'

export type Classroom = Database['public']['Tables']['classrooms']['Row']
export type ClassroomWithCount = Classroom & {
  student_count: number
}

export interface GameStat {
  gameType: string
  gameLabel: string
  sessionCount: number
  avgScorePercent: number
  totalScore: number
  totalQuestions: number
}

export interface StudentSummary {
  id: string
  name: string
  sessionCount: number
  avgScorePercent: number
  lastActiveAt: string | null
}

export interface RecentSession {
  id: string
  studentId: string
  studentName: string
  gameType: string
  gameLabel: string
  topic: string
  score: number | null
  totalQuestions: number | null
  scorePercent: number
  completedAt: string | null
}

export interface ClassDashboardData {
  classroom: Classroom
  totalStudents: number
  totalSessions: number
  overallAvgScorePercent: number
  mostPlayedGame: {
    gameType: string
    gameLabel: string
    sessionCount: number
  } | null
  gameStats: GameStat[]
  students: StudentSummary[]
  recentSessions: RecentSession[]
  timeframe: 'all' | '7d' | '30d'
}

export const GAME_LABELS: Record<string, string> = {
  listening: 'Luyện nghe',
  spelling: 'Đánh vần',
  flashcard: 'Thẻ từ vựng',
  alphabet: 'Bảng chữ cái',
  'numbers-colors': 'Số đếm & Màu sắc',
  sentences: 'Ghép câu',
}

export function getGameLabel(gameType: string): string {
  return GAME_LABELS[gameType] || gameType.charAt(0).toUpperCase() + gameType.slice(1)
}

export async function createClassAction(input: {
  name: string
}): Promise<{ data?: Classroom; error?: string }> {
  try {
    if (!input || typeof input !== 'object') {
      return { error: 'Dữ liệu đầu vào không hợp lệ' }
    }

    if (typeof input.name !== 'string') {
      return { error: 'Tên lớp là bắt buộc' }
    }

    const trimmedName = input.name.trim()
    if (!trimmedName) {
      return { error: 'Tên lớp là bắt buộc' }
    }

    if (trimmedName.length > 200) {
      return { error: 'Tên lớp không được vượt quá 200 ký tự' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    // Generate unique class code (with collision retry)
    let created: Classroom | null = null
    let insertError: { message: string; code?: string } | null = null
    let attempts = 0

    while (attempts < 5) {
      attempts++
      const code = generateClassCode(6)

      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          teacher_id: user.id,
          name: trimmedName,
          code,
          is_active: true,
        })
        .select()
        .single()

      if (!error && data) {
        created = data
        insertError = null
        break
      }

      // If duplicate code constraint, retry
      if (error && (error.code === '23505' || error.message.includes('unique'))) {
        insertError = error
        continue
      }

      insertError = error
      break
    }

    if (insertError || !created) {
      if (insertError && (insertError.code === '23505' || insertError.message?.includes('unique'))) {
        return { error: 'Không thể sinh mã lớp ngẫu nhiên duy nhất lúc này. Vui lòng thử lại.' }
      }
      return { error: insertError?.message || 'Không thể tạo lớp học' }
    }

    revalidatePath('/admin/dashboard/classes')
    revalidatePath('/admin/dashboard')

    return { data: created }
  } catch (err) {
    console.error('[createClassAction] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' }
  }
}

export async function getClassesAction(): Promise<{
  data?: ClassroomWithCount[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const { data, error } = await supabase
      .from('classrooms')
      .select('*, students(count)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getClassesAction] Error:', error)
      return { error: error.message }
    }

    const classroomsWithCount: ClassroomWithCount[] = (data || []).map((row) => {
      const studentCount = (row.students as unknown as { count: number }[])?.[0]?.count || 0

      const { students, ...classroomData } = row
      return {
        ...(classroomData as Classroom),
        student_count: studentCount,
      }
    })

    return { data: classroomsWithCount }
  } catch (err) {
    console.error('[getClassesAction] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tải danh sách lớp học.' }
  }
}

export async function updateClassAction(
  id: string,
  updates: { name?: string; is_active?: boolean }
): Promise<{ data?: Classroom; error?: string }> {
  try {
    if (!id || typeof id !== 'string' || !id.trim()) {
      return { error: 'ID lớp học không hợp lệ' }
    }
    const cleanId = id.trim()

    if (!updates || typeof updates !== 'object') {
      return { error: 'Dữ liệu cập nhật không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    type ClassroomUpdate = Database['public']['Tables']['classrooms']['Update']
    const updatePayload: ClassroomUpdate = {}

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string') {
        return { error: 'Tên lớp không hợp lệ' }
      }
      const trimmedName = updates.name.trim()
      if (!trimmedName) {
        return { error: 'Tên lớp là bắt buộc' }
      }
      if (trimmedName.length > 200) {
        return { error: 'Tên lớp không được vượt quá 200 ký tự' }
      }
      updatePayload.name = trimmedName
    }

    if (updates.is_active !== undefined) {
      updatePayload.is_active = Boolean(updates.is_active)
    }

    if (Object.keys(updatePayload).length === 0) {
      return { error: 'Không có dữ liệu thay đổi' }
    }

    const { data, error } = await supabase
      .from('classrooms')
      .update(updatePayload)
      .eq('id', cleanId)
      .eq('teacher_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return { error: error?.message || 'Không thể cập nhật lớp học' }
    }

    revalidatePath('/admin/dashboard/classes')
    revalidatePath(`/admin/dashboard/classes/${cleanId}`)
    revalidatePath('/admin/dashboard')

    return { data }
  } catch (err) {
    console.error('[updateClassAction] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' }
  }
}

export async function deactivateClassAction(
  id: string
): Promise<{ data?: Classroom; error?: string }> {
  return updateClassAction(id, { is_active: false })
}

export async function activateClassAction(
  id: string
): Promise<{ data?: Classroom; error?: string }> {
  return updateClassAction(id, { is_active: true })
}

export async function validateClassCodeAction(code: string): Promise<{
  valid: boolean
  classId?: string
  className?: string
  classCode?: string
  error?: string
}> {
  try {
    if (!code || typeof code !== 'string' || !code.trim()) {
      return { valid: false, error: 'Bé vui lòng nhập mã lớp nhé!' }
    }
    const cleanCode = code.trim().toUpperCase()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('classrooms')
      .select('id, name, code, is_active')
      .eq('code', cleanCode)
      .single()

    if (error || !data || !data.is_active) {
      return {
        valid: false,
        error: 'Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍',
      }
    }

    return {
      valid: true,
      classId: data.id,
      className: data.name,
      classCode: data.code,
    }
  } catch (err) {
    console.error('[validateClassCodeAction] Error:', err)
    return {
      valid: false,
      error: 'Đã xảy ra lỗi khi kiểm tra mã lớp. Bé thử lại sau nhé!',
    }
  }
}

export async function getClassDashboardAction(
  classId: string,
  timeframe: 'all' | '7d' | '30d' = 'all'
): Promise<{ data?: ClassDashboardData; error?: string }> {
  try {
    if (!classId || typeof classId !== 'string' || !classId.trim()) {
      return { error: 'ID lớp học không hợp lệ' }
    }
    const cleanId = classId.trim()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    // 1. Fetch classroom owned by teacher
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', cleanId)
      .eq('teacher_id', user.id)
      .single()

    if (classError || !classroom) {
      return { error: 'Không tìm thấy thông tin lớp học này' }
    }

    // 2. Fetch all students in this classroom
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', cleanId)

    if (studentsError) {
      console.error('[getClassDashboardAction] Error fetching students:', studentsError)
      return { error: 'Lỗi tải danh sách học sinh' }
    }

    const students = studentsData || []
    const studentMap = new Map<string, string>()
    for (const st of students) {
      studentMap.set(st.id, st.name)
    }

    // 3. Fetch game sessions for students in this classroom
    let sessionsQuery = supabase
      .from('game_sessions')
      .select('*, students!inner(id, name, classroom_id)')
      .eq('students.classroom_id', cleanId)

    if (timeframe === '7d') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      sessionsQuery = sessionsQuery.gte('completed_at', sevenDaysAgo)
    } else if (timeframe === '30d') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      sessionsQuery = sessionsQuery.gte('completed_at', thirtyDaysAgo)
    }

    const { data: sessionsData, error: sessionsError } = await sessionsQuery.order('completed_at', {
      ascending: false,
    })

    if (sessionsError) {
      console.error('[getClassDashboardAction] Error fetching sessions:', sessionsError)
      return { error: 'Lỗi tải thống kê phiên chơi' }
    }

    const rawSessions = sessionsData || []

    // 4. Compute aggregations
    const totalSessions = rawSessions.length

    let totalScoreSum = 0
    let totalQuestionsSum = 0
    let totalPercentageSum = 0
    let validScoreCount = 0

    // Game stats map
    const gameStatsMap = new Map<
      string,
      {
        sessionCount: number
        totalScore: number
        totalQuestions: number
        scorePercentages: number[]
      }
    >()

    // Student stats map (keyed by student_id)
    const studentStatsMap = new Map<
      string,
      {
        sessionCount: number
        scorePercentages: number[]
        lastActiveAt: string | null
      }
    >()

    // Initialize studentStatsMap for all registered students
    for (const st of students) {
      studentStatsMap.set(st.id, {
        sessionCount: 0,
        scorePercentages: [],
        lastActiveAt: null,
      })
    }

    const recentSessions: RecentSession[] = []

    for (const sess of rawSessions) {
      const sId = sess.student_id
      const stName = (sess.students as any)?.name || studentMap.get(sId) || 'Học sinh'
      const gType = sess.game_type || 'unspecified'
      const gLabel = getGameLabel(gType)

      const hasScore =
        typeof sess.score === 'number' &&
        typeof sess.total_questions === 'number' &&
        sess.total_questions > 0

      const sScore = sess.score ?? 0
      const sTotalQ = sess.total_questions ?? 0
      const sPercent = hasScore ? Math.round((sess.score! / sess.total_questions!) * 100) : 0

      if (hasScore) {
        totalPercentageSum += sPercent
        totalScoreSum += sScore
        totalQuestionsSum += sTotalQ
        validScoreCount++
      }

      // Game grouping
      if (!gameStatsMap.has(gType)) {
        gameStatsMap.set(gType, {
          sessionCount: 0,
          totalScore: 0,
          totalQuestions: 0,
          scorePercentages: [],
        })
      }
      const gStat = gameStatsMap.get(gType)!
      gStat.sessionCount++
      gStat.totalScore += sScore
      gStat.totalQuestions += sTotalQ
      if (hasScore) {
        gStat.scorePercentages.push(sPercent)
      }

      // Student grouping
      if (!studentStatsMap.has(sId)) {
        studentStatsMap.set(sId, {
          sessionCount: 0,
          scorePercentages: [],
          lastActiveAt: null,
        })
      }
      const stStat = studentStatsMap.get(sId)!
      stStat.sessionCount++
      if (hasScore) {
        stStat.scorePercentages.push(sPercent)
      }
      if (!stStat.lastActiveAt || (sess.completed_at && sess.completed_at > stStat.lastActiveAt)) {
        stStat.lastActiveAt = sess.completed_at || sess.started_at
      }

      // Recent session list item
      if (recentSessions.length < 15) {
        recentSessions.push({
          id: sess.id,
          studentId: sId,
          studentName: stName,
          gameType: gType,
          gameLabel: gLabel,
          topic: sess.topic,
          score: sess.score,
          totalQuestions: sess.total_questions,
          scorePercent: sPercent,
          completedAt: sess.completed_at || sess.started_at,
        })
      }
    }

    const overallAvgScorePercent =
      validScoreCount > 0 ? Math.round(totalPercentageSum / validScoreCount) : 0

    // Transform gameStats
    const gameStats: GameStat[] = Array.from(gameStatsMap.entries())
      .map(([gType, stat]) => {
        const avg =
          stat.scorePercentages.length > 0
            ? Math.round(
                stat.scorePercentages.reduce((a, b) => a + b, 0) / stat.scorePercentages.length
              )
            : 0
        return {
          gameType: gType,
          gameLabel: getGameLabel(gType),
          sessionCount: stat.sessionCount,
          avgScorePercent: avg,
          totalScore: stat.totalScore,
          totalQuestions: stat.totalQuestions,
        }
      })
      .sort((a, b) => b.sessionCount - a.sessionCount)

    // Most played game
    const mostPlayedGame =
      gameStats.length > 0
        ? {
            gameType: gameStats[0].gameType,
            gameLabel: gameStats[0].gameLabel,
            sessionCount: gameStats[0].sessionCount,
          }
        : null

    // Transform students list
    const studentList: StudentSummary[] = Array.from(studentStatsMap.entries())
      .map(([id, stat]) => {
        const avg =
          stat.scorePercentages.length > 0
            ? Math.round(
                stat.scorePercentages.reduce((a, b) => a + b, 0) / stat.scorePercentages.length
              )
            : 0
        return {
          id,
          name: studentMap.get(id) || 'Học sinh',
          sessionCount: stat.sessionCount,
          avgScorePercent: avg,
          lastActiveAt: stat.lastActiveAt,
        }
      })
      .sort((a, b) => b.sessionCount - a.sessionCount || a.name.localeCompare(b.name))

    const dashboardData: ClassDashboardData = {
      classroom,
      totalStudents: students.length,
      totalSessions,
      overallAvgScorePercent,
      mostPlayedGame,
      gameStats,
      students: studentList,
      recentSessions,
      timeframe,
    }

    return { data: dashboardData }
  } catch (err) {
    console.error('[getClassDashboardAction] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ khi tải thống kê.' }
  }
}

