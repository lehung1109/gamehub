'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  Assignment,
  CreateAssignmentInput,
  AssignmentWithProgress,
  StudentAssignmentItem,
} from '@/types/assignments'

interface AssignmentQueryBuilder {
  select: (columns?: string) => AssignmentQueryBuilder
  insert: (values: unknown) => AssignmentQueryBuilder
  update: (values: unknown) => AssignmentQueryBuilder
  delete: () => AssignmentQueryBuilder
  eq: (column: string, value: unknown) => AssignmentQueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => AssignmentQueryBuilder
  single: () => Promise<{ data: Assignment | null; error: { message: string } | null }>
  then: <TResult1 = { data: Assignment[] | null; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: Assignment[] | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>
}

function getAssignmentsTable(supabase: ReturnType<typeof createAdminClient>): AssignmentQueryBuilder {
  return supabase.from('assignments' as unknown as 'classrooms') as unknown as AssignmentQueryBuilder
}

export async function createAssignment(
  input: CreateAssignmentInput
): Promise<{ success: boolean; data?: Assignment; error?: string }> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, error: 'Dữ liệu không hợp lệ' }
    }

    const {
      classroomId,
      title,
      description = '',
      gameType,
      topic = '',
      configId = null,
      targetScore = 0,
      dueDate,
    } = input

    if (!classroomId || typeof classroomId !== 'string' || !classroomId.trim()) {
      return { success: false, error: 'Mã lớp học không được để trống' }
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return { success: false, error: 'Tiêu đề bài tập không được để trống' }
    }

    if (title.trim().length > 200) {
      return { success: false, error: 'Tiêu đề bài tập không được vượt quá 200 ký tự' }
    }

    if (!gameType || typeof gameType !== 'string' || !gameType.trim()) {
      return { success: false, error: 'Loại trò chơi không được để trống' }
    }

    if (!dueDate || typeof dueDate !== 'string' || isNaN(Date.parse(dueDate))) {
      return { success: false, error: 'Hạn nộp không hợp lệ' }
    }

    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const supabase = createAdminClient()

    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', classroomId.trim())
      .eq('teacher_id', user.id)
      .single()

    if (classError || !classroom) {
      return { success: false, error: 'Bạn không có quyền tạo bài tập cho lớp học này' }
    }

    const { data, error } = await getAssignmentsTable(supabase)
      .insert({
        classroom_id: classroomId.trim(),
        title: title.trim(),
        description: description ? description.trim() : '',
        game_type: gameType.trim(),
        topic: topic ? topic.trim() : '',
        config_id: configId || null,
        target_score: typeof targetScore === 'number' && !isNaN(targetScore) ? Math.max(0, targetScore) : 0,
        due_date: new Date(dueDate).toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Lỗi khi tạo bài tập' }
    }

    return { success: true, data }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Lỗi hệ thống' }
  }
}

export async function getClassAssignments(
  classroomId: string
): Promise<{ success: boolean; data?: AssignmentWithProgress[]; error?: string }> {
  try {
    if (!classroomId || typeof classroomId !== 'string' || !classroomId.trim()) {
      return { success: false, data: [], error: 'Mã lớp học không được để trống' }
    }

    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, data: [], error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const supabase = createAdminClient()

    // Verify teacher owns this classroom
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', classroomId.trim())
      .eq('teacher_id', user.id)
      .single()

    if (classError || !classroom) {
      return { success: false, data: [], error: 'Bạn không có quyền xem bài tập của lớp học này' }
    }

    // 1. Fetch active assignments for classroom
    const { data: assignments, error: assignmentsError } = await getAssignmentsTable(supabase)
      .select('*')
      .eq('classroom_id', classroomId.trim())
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (assignmentsError) {
      return {
        success: false,
        data: [],
        error: assignmentsError.message || 'Lỗi khi tải danh sách bài tập',
      }
    }

    // 2. Fetch students in classroom
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('classroom_id', classroomId.trim())

    if (studentsError) {
      return {
        success: false,
        data: [],
        error: studentsError.message || 'Lỗi khi tải danh sách học sinh',
      }
    }

    const studentList = students || []
    const totalStudentsCount = studentList.length

    if (!assignments || assignments.length === 0) {
      return { success: true, data: [] }
    }

    if (totalStudentsCount === 0) {
      const result: AssignmentWithProgress[] = assignments.map((a) => ({
        ...a,
        completedCount: 0,
        totalStudentsCount: 0,
      }))
      return { success: true, data: result }
    }

    // 3. Fetch game sessions for all students in classroom
    const studentIds = studentList.map((s) => s.id)
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('student_id, game_type, topic, score, config_id, started_at, completed_at')
      .in('student_id', studentIds)

    if (sessionsError) {
      return {
        success: false,
        data: [],
        error: sessionsError.message || 'Lỗi khi tính tiến độ bài tập',
      }
    }

    const sessionList = sessions || []

    // 4. Calculate completedCount for each assignment
    const result: AssignmentWithProgress[] = assignments.map((assignment) => {
      const completedStudentIds = new Set<string>()

      for (const sess of sessionList) {
        if (sess.game_type !== assignment.game_type) continue

        if (assignment.topic && assignment.topic.trim() !== '') {
          if (sess.topic !== assignment.topic) continue
        }

        if (assignment.config_id) {
          if (sess.config_id !== assignment.config_id) continue
        }

        // Only count sessions that took place on or after assignment creation (with 60s clock-skew tolerance)
        const sessTimestamp = (sess as { completed_at?: string; started_at?: string }).completed_at ||
          (sess as { completed_at?: string; started_at?: string }).started_at
        if (sessTimestamp && assignment.created_at) {
          const sessTime = new Date(sessTimestamp).getTime()
          const asgTime = new Date(assignment.created_at).getTime()
          if (!isNaN(sessTime) && !isNaN(asgTime) && sessTime < asgTime - 60000) {
            continue
          }
        }

        const score = typeof sess.score === 'number' && !isNaN(sess.score) ? sess.score : 0
        const target = assignment.target_score ?? 0

        if (score >= target) {
          completedStudentIds.add(sess.student_id)
        }
      }

      return {
        ...assignment,
        completedCount: completedStudentIds.size,
        totalStudentsCount,
      }
    })

    return { success: true, data: result }
  } catch (err) {
    return { success: false, data: [], error: (err as Error).message || 'Lỗi hệ thống' }
  }
}

export async function deleteAssignment(
  assignmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!assignmentId || typeof assignmentId !== 'string' || !assignmentId.trim()) {
      return { success: false, error: 'Mã bài tập không được để trống' }
    }

    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const supabase = createAdminClient()

    // 1. Fetch assignment to check classroom_id
    const { data: assignment, error: fetchError } = await getAssignmentsTable(supabase)
      .select('id, classroom_id')
      .eq('id', assignmentId.trim())
      .single()

    if (fetchError || !assignment) {
      return { success: false, error: 'Không tìm thấy bài tập' }
    }

    // 2. Verify teacher owns that classroom
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', (assignment as unknown as { classroom_id: string }).classroom_id)
      .eq('teacher_id', user.id)
      .single()

    if (classError || !classroom) {
      return { success: false, error: 'Bạn không có quyền xóa bài tập này' }
    }

    const { error } = await getAssignmentsTable(supabase)
      .update({ is_active: false })
      .eq('id', assignmentId.trim())

    if (error) {
      return { success: false, error: error.message || 'Lỗi khi xóa bài tập' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Lỗi hệ thống' }
  }
}

export async function getStudentAssignments(
  classCode: string,
  studentName: string
): Promise<{ success: boolean; data?: StudentAssignmentItem[]; error?: string }> {
  try {
    if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
      return { success: false, data: [], error: 'Mã lớp không được để trống' }
    }
    if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
      return { success: false, data: [], error: 'Tên học sinh không được để trống' }
    }

    const cleanCode = classCode.trim().toUpperCase()
    const cleanName = studentName.trim()

    const supabase = createAdminClient()

    // 1. Find classroom by code
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, is_active')
      .eq('code', cleanCode)
      .single()

    if (classError || !classroom || !classroom.is_active) {
      return {
        success: false,
        data: [],
        error: 'Mã lớp không hợp lệ hoặc lớp học không hoạt động',
      }
    }

    // 2. Find student by name in classroom
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, name')
      .eq('classroom_id', classroom.id)
      .eq('name', cleanName)
      .limit(1)

    if (studentError) {
      return {
        success: false,
        data: [],
        error: 'Lỗi khi tra cứu thông tin học sinh',
      }
    }

    const student = students?.[0]

    // 3. Query active assignments for classroom
    const { data: assignments, error: assignmentsError } = await getAssignmentsTable(supabase)
      .select('*')
      .eq('classroom_id', classroom.id)
      .eq('is_active', true)
      .order('due_date', { ascending: true })

    if (assignmentsError) {
      return {
        success: false,
        data: [],
        error: assignmentsError.message || 'Lỗi khi tải danh sách bài tập',
      }
    }

    if (!assignments || assignments.length === 0) {
      return { success: true, data: [] }
    }

    // 4. Query student's game_sessions
    let sessions: Array<{
      id: string
      game_type: string
      topic: string
      score: number | null
      config_id: string | null
      started_at?: string | null
      completed_at?: string | null
    }> = []

    if (student) {
      const { data: sessData, error: sessError } = await supabase
        .from('game_sessions')
        .select('id, game_type, topic, score, config_id, started_at, completed_at')
        .eq('student_id', student.id)
        .order('completed_at', { ascending: false })

      if (sessError) {
        return {
          success: false,
          data: [],
          error: sessError.message || 'Lỗi khi kiểm tra lịch sử làm bài',
        }
      }
      sessions = sessData || []
    }

    const now = new Date()

    // 5. Compute status for each assignment
    const result: StudentAssignmentItem[] = assignments.map((assignment) => {
      // Find sessions matching game_type (and topic/config_id if specified)
      const matchingSessions = sessions.filter((sess) => {
        if (sess.game_type !== assignment.game_type) return false
        if (assignment.topic && assignment.topic.trim() !== '') {
          if (sess.topic !== assignment.topic) return false
        }
        if (assignment.config_id) {
          if (sess.config_id !== assignment.config_id) return false
        }
        // Only count sessions that took place on or after assignment creation (with 60s clock-skew tolerance)
        const sessTimestamp = sess.completed_at || sess.started_at
        if (sessTimestamp && assignment.created_at) {
          const sessTime = new Date(sessTimestamp).getTime()
          const asgTime = new Date(assignment.created_at).getTime()
          if (!isNaN(sessTime) && !isNaN(asgTime) && sessTime < asgTime - 60000) {
            return false
          }
        }
        return true
      })

      const targetScore = assignment.target_score ?? 0

      // Find any session meeting or exceeding target score
      const completedSessions = matchingSessions.filter((sess) => {
        const score = typeof sess.score === 'number' && !isNaN(sess.score) ? sess.score : 0
        return score >= targetScore
      })

      const isCompleted = completedSessions.length > 0

      let status: 'completed' | 'pending' | 'overdue'
      let studentScore: number | undefined
      let completedAt: string | undefined

      const validScores = matchingSessions
        .map((s) => (typeof s.score === 'number' && !isNaN(s.score) ? s.score : 0))

      if (isCompleted) {
        status = 'completed'
        // Highest score achieved
        studentScore = validScores.length > 0 ? Math.max(...validScores) : 0
        // Completion timestamp: prefer the latest completed_at / started_at of qualifying sessions
        const latestCompletedSession = completedSessions.reduce((latest, current) => {
          const latestTime = new Date(latest.completed_at || latest.started_at || 0).getTime()
          const currentTime = new Date(current.completed_at || current.started_at || 0).getTime()
          return currentTime >= latestTime ? current : latest
        })
        completedAt = latestCompletedSession.completed_at || latestCompletedSession.started_at || undefined
      } else {
        const isOverdue = now > new Date(assignment.due_date)
        status = isOverdue ? 'overdue' : 'pending'
        if (matchingSessions.length > 0) {
          studentScore = validScores.length > 0 ? Math.max(...validScores) : 0
        }
      }

      return {
        ...assignment,
        status,
        studentScore,
        completedAt,
      }
    })

    return { success: true, data: result }
  } catch (err) {
    return { success: false, data: [], error: (err as Error).message || 'Lỗi hệ thống' }
  }
}
