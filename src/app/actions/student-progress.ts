'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface GetStudentProgressInput {
  classCode: string
  studentName: string
}

export interface GetStudentProgressOutput {
  success: boolean
  totalStars: number
  error?: string
}

/**
 * Server Action to dynamically calculate total stars for a student
 * without creating new database tables or columns.
 */
export async function getStudentProgress(
  input: GetStudentProgressInput
): Promise<GetStudentProgressOutput> {
  try {
    const { classCode, studentName } = input || {}
    if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
      return { success: false, totalStars: 0, error: 'Mã lớp không được để trống' }
    }
    if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
      return { success: false, totalStars: 0, error: 'Tên học sinh không được để trống' }
    }

    const cleanCode = classCode.trim().toUpperCase()
    const cleanName = studentName.trim()

    const supabase = createAdminClient()

    // 1. Check classroom existence and active state
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, is_active')
      .eq('code', cleanCode)
      .single()

    if (classError || !classroom || !classroom.is_active) {
      return {
        success: false,
        totalStars: 0,
        error: 'Mã lớp không hợp lệ hoặc lớp học không hoạt động',
      }
    }

    // 2. Lookup student in classroom
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('name', cleanName)
      .limit(1)

    if (studentError) {
      console.error('[getStudentProgress] Error querying student:', studentError)
      return {
        success: false,
        totalStars: 0,
        error: 'Lỗi khi tra cứu thông tin học sinh',
      }
    }

    const student = students?.[0]
    if (!student) {
      // Student has not been created yet (first-time session)
      return {
        success: true,
        totalStars: 0,
      }
    }

    // 3. Query all game sessions for scores
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('score')
      .eq('student_id', student.id)

    if (sessionsError) {
      console.error('[getStudentProgress] Error querying game_sessions:', sessionsError)
      return {
        success: false,
        totalStars: 0,
        error: 'Lỗi khi tính điểm học sinh',
      }
    }

    const totalStars = (sessions || []).reduce((acc, sess) => {
      const scoreNum = typeof sess.score === 'number' && !isNaN(sess.score) ? sess.score : 0
      return acc + Math.max(0, scoreNum)
    }, 0)

    return {
      success: true,
      totalStars,
    }
  } catch (err) {
    console.error('[getStudentProgress] Unexpected exception:', err)
    return {
      success: false,
      totalStars: 0,
      error: 'Đã xảy ra lỗi hệ thống không mong muốn',
    }
  }
}
