// src/app/actions/reports.ts

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  StudentCertificate,
  IssueCertificateInput,
} from '@/types/certificates'
import type { StudentDetailedReport } from '@/types/reports'
import {
  generateCertificateVerificationCode,
  computeStudentSkillBreakdown,
  computeSrsMetrics,
  generateAutomatedTeacherRemark,
} from '@/lib/reports/generator'

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
    const {
      studentId,
      classroomId,
      certificateType,
      title,
      recipientName,
      achievementText,
      teacherName,
      teacherNote,
    } = input || {}

    if (!studentId || !classroomId || !title || !recipientName || !achievementText || !teacherName) {
      return { success: false, error: 'Vui lòng điền đầy đủ các thông tin của giấy khen' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để cấp giấy khen' }
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

    const cert: StudentCertificate = {
      id: data.id,
      studentId: data.student_id,
      classroomId: data.classroom_id,
      certificateType: data.certificate_type as any,
      title: data.title,
      recipientName: data.recipient_name,
      achievementText: data.achievement_text,
      teacherName: data.teacher_name,
      teacherNote: data.teacher_note,
      verificationCode: data.verification_code,
      issuedAt: data.issued_at,
      createdAt: data.created_at,
    }

    return { success: true, certificate: cert }
  } catch (err: any) {
    console.error('[issueStudentCertificateAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Lỗi hệ thống khi tạo giấy khen' }
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

    const cert: StudentCertificate = {
      id: data.id,
      studentId: data.student_id,
      classroomId: data.classroom_id,
      certificateType: data.certificate_type as any,
      title: data.title,
      recipientName: data.recipient_name,
      achievementText: data.achievement_text,
      teacherName: data.teacher_name,
      teacherNote: data.teacher_note,
      verificationCode: data.verification_code,
      issuedAt: data.issued_at,
      createdAt: data.created_at,
    }

    return {
      success: true,
      isValid: true,
      certificate: cert,
      classroomName,
    }
  } catch (err: any) {
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('student_certificates')
      .select('*')
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('[getStudentCertificatesAction] Query error:', error)
      return { success: false, certificates: [], error: 'Lỗi khi tải danh sách giấy khen' }
    }

    const certs: StudentCertificate[] = (data || []).map((d: any) => ({
      id: d.id,
      studentId: d.student_id,
      classroomId: d.classroom_id,
      certificateType: d.certificate_type,
      title: d.title,
      recipientName: d.recipient_name,
      achievementText: d.achievement_text,
      teacherName: d.teacher_name,
      teacherNote: d.teacher_note,
      verificationCode: d.verification_code,
      issuedAt: d.issued_at,
      createdAt: d.created_at,
    }))

    return { success: true, certificates: certs }
  } catch (err: any) {
    console.error('[getStudentCertificatesAction] Error:', err)
    return { success: false, certificates: [], error: err?.message || 'Lỗi hệ thống' }
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
    const supabase = await createClient()

    // 1. Fetch Student & Classroom
    const [studentRes, classRes] = await Promise.all([
      supabase.from('students').select('*').eq('id', studentId).single(),
      supabase.from('classrooms').select('*').eq('id', classroomId).single(),
    ])

    if (studentRes.error || !studentRes.data) {
      return { success: false, error: 'Không tìm thấy thông tin học sinh' }
    }
    if (classRes.error || !classRes.data) {
      return { success: false, error: 'Không tìm thấy lớp học' }
    }

    const student = studentRes.data
    const classroom = classRes.data

    // 2. Fetch Game Sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('game_type, score, total_questions')
      .eq('student_id', studentId)

    const rawSessions = (sessions || []).map((s: any) => ({
      gameType: s.game_type,
      score: s.score,
      totalQuestions: s.total_questions,
    }))

    const totalSessions = rawSessions.length
    const totalScore = rawSessions.reduce((acc: number, s: any) => acc + (s.score || 0), 0)
    const totalQuestions = rawSessions.reduce((acc: number, s: any) => acc + (s.totalQuestions || 0), 0)
    const overallAccuracyPercent =
      totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

    // 3. Fetch Gamification & SRS deck
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('streak_state, inventory, srs_deck')
      .eq('student_id', studentId)
      .single()

    const streakState = (gamification?.streak_state as any) || {}
    const inventory = (gamification?.inventory as any) || {}
    const rawSrsDeck = (gamification?.srs_deck as any[]) || []

    const currentStreak = streakState.currentStreak || 0
    const longestStreak = streakState.longestStreak || 0
    const totalActiveDays = streakState.totalActiveDays || 0
    const equippedFrameId = inventory.equippedFrameId || null
    const equippedTitleId = inventory.equippedTitleId || null

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

    const certificates: StudentCertificate[] = (certsData || []).map((d: any) => ({
      id: d.id,
      studentId: d.student_id,
      classroomId: d.classroom_id,
      certificateType: d.certificate_type,
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
  } catch (err: any) {
    console.error('[getStudentDetailedReportAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Lỗi hệ thống khi tổng hợp báo cáo' }
  }
}
