// src/app/actions/reports.ts

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  StudentCertificate,
  CertificateType,
  IssueCertificateInput,
} from '@/types/certificates'
import type { StudentDetailedReport } from '@/types/reports'
import type { Database } from '@/types/database'
import {
  generateCertificateVerificationCode,
  computeStudentSkillBreakdown,
  computeSrsMetrics,
  generateAutomatedTeacherRemark,
} from '@/lib/reports/generator'

type CertificateRow = Database['public']['Tables']['student_certificates']['Row']

/**
 * Issue a printable certificate for a student in a classroom
 */
export async function issueStudentCertificateAction(
  input: IssueCertificateInput
): Promise<{
  success: boolean
  certificate?: StudentCertificate
  error?: string
}> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, error: 'Dữ liệu đầu vào không hợp lệ' }
    }

    const {
      studentId,
      classroomId,
      certificateType,
      title,
      recipientName,
      achievementText,
      teacherName,
      teacherNote,
    } = input

    if (!studentId || !classroomId || !title || !recipientName || !achievementText || !teacherName) {
      return { success: false, error: 'Vui lòng điền đầy đủ các thông tin của giấy khen' }
    }

    const VALID_CERTIFICATE_TYPES = [
      'vocab_master',
      'streak_champion',
      'arena_victor',
      'course_completion',
      'custom',
    ]
    if (!VALID_CERTIFICATE_TYPES.includes(certificateType)) {
      return { success: false, error: 'Loại giấy khen không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để cấp giấy khen' }
    }

    // 1. Verify classroom ownership
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', classroomId)
      .eq('teacher_id', user.id)
      .single()

    if (classError || !classroom) {
      return { success: false, error: 'Bạn không có quyền cấp giấy khen cho lớp học này' }
    }

    // 2. Verify student belongs to classroom
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('classroom_id', classroomId)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Học sinh không thuộc lớp học này' }
    }

    const verificationCode = generateCertificateVerificationCode()

    const { data, error } = await supabase
      .from('student_certificates')
      .insert({
        student_id: studentId,
        classroom_id: classroomId,
        certificate_type: certificateType,
        title: title.trim(),
        recipient_name: recipientName.trim(),
        achievement_text: achievementText.trim(),
        teacher_name: teacherName.trim(),
        teacher_note: teacherNote ? teacherNote.trim() : null,
        verification_code: verificationCode,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('[issueStudentCertificateAction] Insert error:', error)
      return { success: false, error: 'Không thể lưu giấy khen vào hệ thống' }
    }

    revalidatePath(`/admin/dashboard/classes/${classroomId}`)
    revalidatePath(`/admin/classes/${classroomId}/reports/${studentId}`)

    const certRow = data as CertificateRow
    const cert: StudentCertificate = {
      id: certRow.id,
      studentId: certRow.student_id,
      classroomId: certRow.classroom_id,
      certificateType: certRow.certificate_type as CertificateType,
      title: certRow.title,
      recipientName: certRow.recipient_name,
      achievementText: certRow.achievement_text,
      teacherName: certRow.teacher_name,
      teacherNote: certRow.teacher_note,
      verificationCode: certRow.verification_code,
      issuedAt: certRow.issued_at,
      createdAt: certRow.created_at,
    }

    return { success: true, certificate: cert }
  } catch (err: unknown) {
    console.error('[issueStudentCertificateAction] Unexpected error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo giấy khen'
    return { success: false, error: msg }
  }
}

/**
 * Public certificate verification by unique code
 */
export async function verifyCertificateAction(
  verificationCode: string
): Promise<{
  success: boolean
  isValid: boolean
  certificate?: StudentCertificate
  classroomName?: string
  error?: string
}> {
  try {
    if (!verificationCode || !verificationCode.trim()) {
      return { success: false, isValid: false, error: 'Mã xác thực không hợp lệ' }
    }

    const cleanCode = verificationCode.trim().toUpperCase()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('student_certificates')
      .select('*, classrooms(name)')
      .eq('verification_code', cleanCode)
      .single()

    if (error || !data) {
      return {
        success: false,
        isValid: false,
        error: 'Không tìm thấy chứng chỉ hoặc mã xác thực không tồn tại',
      }
    }

    const classroomName =
      data.classrooms && typeof data.classrooms === 'object' && 'name' in data.classrooms
        ? (data.classrooms as { name: string }).name
        : undefined

    const certRow = data as unknown as CertificateRow
    const cert: StudentCertificate = {
      id: certRow.id,
      studentId: certRow.student_id,
      classroomId: certRow.classroom_id,
      certificateType: certRow.certificate_type as CertificateType,
      title: certRow.title,
      recipientName: certRow.recipient_name,
      achievementText: certRow.achievement_text,
      teacherName: certRow.teacher_name,
      teacherNote: certRow.teacher_note,
      verificationCode: certRow.verification_code,
      issuedAt: certRow.issued_at,
      createdAt: certRow.created_at,
    }

    return {
      success: true,
      isValid: true,
      certificate: cert,
      classroomName,
    }
  } catch (err: unknown) {
    console.error('[verifyCertificateAction] Unexpected error:', err)
    return { success: false, isValid: false, error: 'Lỗi hệ thống khi tra cứu chứng chỉ' }
  }
}

/**
 * Get all certificates for a student
 */
export async function getStudentCertificatesAction(
  studentId: string
): Promise<{
  success: boolean
  certificates: StudentCertificate[]
  error?: string
}> {
  try {
    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return { success: false, certificates: [], error: 'ID học sinh không hợp lệ' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('student_certificates')
      .select('*')
      .eq('student_id', studentId.trim())
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('[getStudentCertificatesAction] Query error:', error)
      return { success: false, certificates: [], error: 'Lỗi khi tải danh sách giấy khen' }
    }

    const certs: StudentCertificate[] = (data || []).map((d: unknown) => {
      const row = d as CertificateRow
      return {
        id: row.id,
        studentId: row.student_id,
        classroomId: row.classroom_id,
        certificateType: row.certificate_type as CertificateType,
        title: row.title,
        recipientName: row.recipient_name,
        achievementText: row.achievement_text,
        teacherName: row.teacher_name,
        teacherNote: row.teacher_note,
        verificationCode: row.verification_code,
        issuedAt: row.issued_at,
        createdAt: row.created_at,
      }
    })

    return { success: true, certificates: certs }
  } catch (err: unknown) {
    console.error('[getStudentCertificatesAction] Error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống'
    return { success: false, certificates: [], error: msg }
  }
}

/**
 * Fetch certificates for a student by class code and student name (Student Portal)
 */
export async function getMyCertificatesAction(input: {
  classCode: string
  studentName: string
}): Promise<{
  success: boolean
  certificates: StudentCertificate[]
  classroomName?: string
  error?: string
}> {
  try {
    if (
      !input ||
      typeof input !== 'object' ||
      !input.classCode?.trim() ||
      !input.studentName?.trim()
    ) {
      return { success: false, certificates: [], error: 'Thông tin học sinh không hợp lệ' }
    }

    const cleanCode = input.classCode.trim().toUpperCase()
    const cleanName = input.studentName.trim()

    const supabase = createAdminClient()

    const { data: classroom, error: classErr } = await supabase
      .from('classrooms')
      .select('id, name, is_active')
      .eq('code', cleanCode)
      .single()

    if (classErr || !classroom || !classroom.is_active) {
      return { success: false, certificates: [], error: 'Mã lớp không tồn tại hoặc không hoạt động' }
    }

    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('name', cleanName)
      .maybeSingle()

    if (studentErr || !student) {
      return { success: true, certificates: [], classroomName: classroom.name }
    }

    const { data: certsData, error: certsErr } = await supabase
      .from('student_certificates')
      .select('*')
      .eq('student_id', student.id)
      .order('issued_at', { ascending: false })

    if (certsErr) {
      return { success: false, certificates: [], error: certsErr.message }
    }

    const certs: StudentCertificate[] = (certsData || []).map((d) => {
      const row = d as CertificateRow
      return {
        id: row.id,
        studentId: row.student_id,
        classroomId: row.classroom_id,
        certificateType: row.certificate_type as CertificateType,
        title: row.title,
        recipientName: row.recipient_name,
        achievementText: row.achievement_text,
        teacherName: row.teacher_name,
        teacherNote: row.teacher_note,
        verificationCode: row.verification_code,
        issuedAt: row.issued_at,
        createdAt: row.created_at,
      }
    })

    return {
      success: true,
      certificates: certs,
      classroomName: classroom.name,
    }
  } catch (err: unknown) {
    console.error('[getMyCertificatesAction] Error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải giấy khen'
    return { success: false, certificates: [], error: msg }
  }
}

/**
 * Get comprehensive student detailed report
 */
export async function getStudentDetailedReportAction(
  classroomId: string,
  studentId: string
): Promise<{
  success: boolean
  report?: StudentDetailedReport
  error?: string
}> {
  try {
    if (
      !classroomId ||
      typeof classroomId !== 'string' ||
      !classroomId.trim() ||
      !studentId ||
      typeof studentId !== 'string' ||
      !studentId.trim()
    ) {
      return { success: false, error: 'Thông tin lớp học hoặc học sinh không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để xem báo cáo học sinh' }
    }

    // 1. Fetch Student & Classroom
    const [studentRes, classRes] = await Promise.all([
      supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .eq('classroom_id', classroomId)
        .single(),
      supabase
        .from('classrooms')
        .select('*')
        .eq('id', classroomId)
        .eq('teacher_id', user.id)
        .single(),
    ])

    if (classRes.error || !classRes.data) {
      return { success: false, error: 'Không tìm thấy lớp học hoặc bạn không có quyền truy cập' }
    }
    if (studentRes.error || !studentRes.data) {
      return { success: false, error: 'Không tìm thấy thông tin học sinh trong lớp học này' }
    }

    const student = studentRes.data
    const classroom = classRes.data

    // 2. Fetch Game Sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('game_type, score, total_questions')
      .eq('student_id', studentId)

    interface SessionQueryRow {
      game_type: string
      score: number | null
      total_questions: number | null
    }

    const rawSessions = ((sessions || []) as SessionQueryRow[]).map((s) => ({
      gameType: s.game_type,
      score: s.score,
      totalQuestions: s.total_questions,
    }))

    const totalSessions = rawSessions.length
    const totalScore = rawSessions.reduce((acc, s) => acc + (s.score || 0), 0)
    const totalQuestions = rawSessions.reduce((acc, s) => acc + (s.totalQuestions || 0), 0)
    const overallAccuracyPercent =
      totalQuestions > 0
        ? Math.min(100, Math.max(0, Math.round((totalScore / totalQuestions) * 100)))
        : 0

    // 3. Fetch Gamification & SRS deck
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('streak_state, inventory, srs_deck')
      .eq('student_id', studentId)
      .single()

    const streakState = (gamification?.streak_state as Record<string, unknown>) || {}
    const inventory = (gamification?.inventory as Record<string, unknown>) || {}
    const rawSrsDeck = (gamification?.srs_deck as Array<{
      prompt?: string
      correctAnswer?: string
      mistakeCount?: number
      gameType?: string
      box: number
    }>) || []

    const currentStreak = typeof streakState.currentStreak === 'number' ? streakState.currentStreak : 0
    const longestStreak = typeof streakState.longestStreak === 'number' ? streakState.longestStreak : 0
    const totalActiveDays = typeof streakState.totalActiveDays === 'number' ? streakState.totalActiveDays : 0
    const equippedFrameId = typeof inventory.equippedFrameId === 'string' ? inventory.equippedFrameId : null
    const equippedTitleId = typeof inventory.equippedTitleId === 'string' ? inventory.equippedTitleId : null

    // 4. Compute Metrics
    const skills = computeStudentSkillBreakdown(rawSessions)
    const srsMetrics = computeSrsMetrics(rawSrsDeck)

    // Frequent mistakes from SRS deck
    const frequentMistakes = rawSrsDeck
      .filter((card) => (card.mistakeCount || 0) > 0)
      .sort((a, b) => (b.mistakeCount || 0) - (a.mistakeCount || 0))
      .slice(0, 5)
      .map((c) => ({
        prompt: c.prompt || '',
        correctAnswer: c.correctAnswer || '',
        mistakeCount: c.mistakeCount || 0,
        gameType: c.gameType || 'vocab',
      }))

    // Level calculation based on stars
    const totalStars = totalScore
    const level = Math.max(1, Math.floor(totalStars / 100) + 1)

    // Top skill
    const topSkillObj = [...skills].sort((a, b) => b.accuracyPercent - a.accuracyPercent)[0]
    const topSkillLabel = topSkillObj?.label || 'Từ Vựng'

    const automatedTeacherRemark = generateAutomatedTeacherRemark({
      studentName: student.name,
      overallAccuracy: overallAccuracyPercent,
      topSkill: topSkillLabel,
      streakDays: currentStreak,
      masteredWords: srsMetrics.masteredCount,
    })

    // 5. Fetch Certificates
    const { data: certsData } = await supabase
      .from('student_certificates')
      .select('*')
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false })

    const certificates: StudentCertificate[] = ((certsData || []) as CertificateRow[]).map((d) => ({
      id: d.id,
      studentId: d.student_id,
      classroomId: d.classroom_id,
      certificateType: d.certificate_type as CertificateType,
      title: d.title,
      recipientName: d.recipient_name,
      achievementText: d.achievement_text,
      teacherName: d.teacher_name,
      teacherNote: d.teacher_note,
      verificationCode: d.verification_code,
      issuedAt: d.issued_at,
      createdAt: d.created_at,
    }))

    const report: StudentDetailedReport = {
      studentId,
      studentName: student.name,
      classroomName: classroom.name,
      classCode: classroom.code,
      totalStars,
      level,
      currentStreak,
      longestStreak,
      totalActiveDays,
      equippedFrameId,
      equippedTitleId,
      totalSessions,
      overallAccuracyPercent,
      skills,
      srsMetrics,
      frequentMistakes,
      automatedTeacherRemark,
      certificates,
      generatedAt: new Date().toISOString(),
    }

    return { success: true, report }
  } catch (err: unknown) {
    console.error('[getStudentDetailedReportAction] Unexpected error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tổng hợp báo cáo'
    return { success: false, error: msg }
  }
}
