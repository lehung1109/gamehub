// src/app/actions/parent.ts

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type {
  VerifyParentAccessInput,
  ParentDashboardData,
  ClassroomAnnouncement,
  AnnouncementCategory,
  AnnouncementPriority,
  ParentAccessInfo,
  CreateAnnouncementInput,
} from '@/types/parent'
import {
  computeWeeklyDigest,
  generateParentPin,
  generateParentAccessToken,
} from '@/lib/parent/digest-generator'
import {
  computeStudentSkillBreakdown,
  computeSrsMetrics,
} from '@/lib/reports/generator'

/**
 * Verifies parent credentials via either direct token or classCode + studentName + accessPin
 */
export async function verifyParentAccessAction(
  input: VerifyParentAccessInput
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, error: 'Thông tin xác thực không hợp lệ' }
    }

    const supabase = createAdminClient()

    // Mode 1: Direct token verification (from magic link)
    if (input.token && typeof input.token === 'string' && input.token.trim()) {
      const cleanToken = input.token.trim()
      const { data, error } = await supabase
        .from('student_parent_access')
        .select('id, access_token, student_id')
        .eq('access_token', cleanToken)
        .maybeSingle()

      if (error || !data) {
        return { success: false, error: 'Mã liên kết phụ huynh không tồn tại hoặc đã hết hạn' }
      }

      // Update last accessed time in background
      await supabase
        .from('student_parent_access')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', data.id)

      return { success: true, token: data.access_token }
    }

    // Mode 2: Manual credentials (classCode, studentName, accessPin)
    const { classCode, studentName, accessPin } = input
    if (!classCode?.trim() || !studentName?.trim() || !accessPin?.trim()) {
      return {
        success: false,
        error: 'Vui lòng nhập đầy đủ Mã lớp, Tên học sinh và Mã bảo mật phụ huynh (PIN)',
      }
    }

    const cleanCode = classCode.trim().toUpperCase()
    // Sanitize and escape SQL LIKE/ILIKE wildcards (%, _, \) to prevent wildcard enumeration
    const cleanStudent = studentName.trim().replace(/[%_\\]/g, '\\$&')
    const cleanPin = accessPin.trim().toUpperCase()

    if (cleanStudent.length > 100) {
      return { success: false, error: 'Tên học sinh không hợp lệ' }
    }

    // Find classroom
    const { data: classroom, error: classErr } = await supabase
      .from('classrooms')
      .select('id, is_active')
      .eq('code', cleanCode)
      .maybeSingle()

    if (classErr || !classroom || !classroom.is_active) {
      return { success: false, error: 'Mã lớp không tồn tại hoặc không hoạt động' }
    }

    // Find student in classroom (case-insensitive name match)
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, name')
      .eq('classroom_id', classroom.id)
      .ilike('name', cleanStudent)
      .maybeSingle()

    if (studentErr || !student) {
      return { success: false, error: 'Không tìm thấy học sinh trong lớp' }
    }

    // Look up parent access record
    const { data: accessRecord, error: accessErr } = await supabase
      .from('student_parent_access')
      .select('id, access_token, access_pin')
      .eq('student_id', student.id)
      .maybeSingle()

    if (accessErr || !accessRecord) {
      return {
        success: false,
        error: 'Chưa có thông tin phụ huynh cho học sinh này. Vui lòng liên hệ giáo viên để nhận mã PIN.',
      }
    }

    const normalizedRecordPin = accessRecord.access_pin.trim().toUpperCase()
    const normalizedInputPin = cleanPin.startsWith('P-') ? cleanPin : `P-${cleanPin}`

    if (
      normalizedRecordPin !== cleanPin &&
      normalizedRecordPin !== normalizedInputPin &&
      normalizedRecordPin.replace('P-', '') !== cleanPin.replace('P-', '')
    ) {
      return { success: false, error: 'Mã bảo mật phụ huynh (PIN) không chính xác' }
    }

    // Update last accessed time
    await supabase
      .from('student_parent_access')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', accessRecord.id)

    return { success: true, token: accessRecord.access_token }
  } catch (err: unknown) {
    console.error('[verifyParentAccessAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi xác thực quyền phụ huynh' }
  }
}

/**
 * Fetches comprehensive parent dashboard data for a student via valid parent token
 */
export async function getParentStudentDashboardAction(
  token: string
): Promise<{ success: boolean; data?: ParentDashboardData; error?: string }> {
  try {
    if (!token || typeof token !== 'string' || !token.trim()) {
      return { success: false, error: 'Mã phụ huynh không hợp lệ' }
    }

    const supabase = createAdminClient()

    // 1. Verify parent access token
    const { data: parentAccess, error: accessErr } = await supabase
      .from('student_parent_access')
      .select('id, student_id, classroom_id, access_token, access_pin')
      .eq('access_token', token.trim())
      .maybeSingle()

    if (accessErr || !parentAccess) {
      return { success: false, error: 'Liên kết phụ huynh không tồn tại hoặc đã bị thu hồi' }
    }

    // 2. Fetch student details
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, name, classroom_id')
      .eq('id', parentAccess.student_id)
      .maybeSingle()

    if (studentErr || !student) {
      return { success: false, error: 'Không tìm thấy thông tin học sinh' }
    }

    // 3. Fetch classroom & teacher details
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id, name, code, teacher_id')
      .eq('id', student.classroom_id)
      .maybeSingle()

    let teacherName = 'Giáo viên phụ trách'
    if (classroom?.teacher_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', classroom.teacher_id)
        .maybeSingle()

      if (profile?.display_name) {
        teacherName = profile.display_name
      }
    }

    // 4. Fetch game sessions for weekly digest & skill breakdown
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('id, game_type, score, total_questions, started_at, completed_at')
      .eq('student_id', student.id)
      .order('started_at', { ascending: false })

    // 5. Fetch student gamification state (stars, streak, freeze shields, SRS deck)
    const { data: gamification } = await supabase
      .from('student_gamification')
      .select('streak_state, inventory, srs_deck')
      .eq('student_id', student.id)
      .maybeSingle()

    const streakState = (gamification?.streak_state as Record<string, unknown>) || {}
    const currentStreak = typeof streakState.currentStreak === 'number' ? streakState.currentStreak : 0
    const longestStreak = typeof streakState.longestStreak === 'number' ? streakState.longestStreak : 0
    const freezeCount = typeof streakState.freezeCount === 'number' ? streakState.freezeCount : 0

    const rawSrsDeck = (gamification?.srs_deck as Array<{
      prompt?: string
      correctAnswer?: string
      mistakeCount?: number
      gameType?: string
      box: number
    }>) || []

    // 6. Fetch recent certificates
    const { data: certificates } = await supabase
      .from('student_certificates')
      .select('id, title, certificate_type, issued_at, verification_code')
      .eq('student_id', student.id)
      .order('issued_at', { ascending: false })
      .limit(5)

    // 7. Fetch classroom announcements (whole class or specific to student)
    const { data: announcementsData } = await supabase
      .from('classroom_announcements')
      .select('*')
      .eq('classroom_id', classroom?.id || parentAccess.classroom_id)
      .or(`student_id.is.null,student_id.eq.${student.id}`)
      .order('created_at', { ascending: false })

    // 8. Fetch acknowledgments for these announcements
    const announcementIds = (announcementsData || []).map((a) => a.id)
    let acknowledgedIds = new Set<string>()

    if (announcementIds.length > 0) {
      const { data: acks } = await supabase
        .from('announcement_acknowledgments')
        .select('announcement_id')
        .eq('student_id', student.id)
        .in('announcement_id', announcementIds)

      if (acks) {
        acknowledgedIds = new Set(acks.map((a) => a.announcement_id))
      }
    }

    const announcements: ClassroomAnnouncement[] = (announcementsData || []).map((a) => ({
      id: a.id,
      classroomId: a.classroom_id,
      teacherId: a.teacher_id,
      studentId: a.student_id,
      title: a.title,
      content: a.content,
      category: a.category as AnnouncementCategory,
      priority: a.priority as AnnouncementPriority,
      createdAt: a.created_at,
      acknowledged: acknowledgedIds.has(a.id),
    }))

    // Format raw sessions for skill breakdown
    const rawSessions = (sessions || []).map((s) => ({
      gameType: s.game_type,
      score: s.score,
      totalQuestions: s.total_questions,
    }))

    const totalScore = rawSessions.reduce((acc, s) => acc + (s.score || 0), 0)
    const totalStars = totalScore
    const level = Math.max(1, Math.floor(totalStars / 100) + 1)

    const skillBreakdowns = computeStudentSkillBreakdown(rawSessions)

    // Format skills for parent view
    const skills = skillBreakdowns.map((sk) => ({
      skillKey: sk.skillKey,
      label: sk.label,
      accuracyPercent: sk.accuracyPercent,
      totalQuestions: sk.totalQuestions,
      strengthRating: sk.strengthRating,
    }))

    // Compute weekly digest
    const digest = computeWeeklyDigest({
      sessions: (sessions || []).map((s) => {
        const start = s.started_at ? new Date(s.started_at).getTime() : 0
        const end = s.completed_at ? new Date(s.completed_at).getTime() : 0
        const duration = start && end && end > start ? Math.round((end - start) / 1000) : 120
        return {
          id: s.id,
          created_at: s.completed_at || s.started_at || '',
          duration_seconds: duration,
          score: s.score || 0,
        }
      }),
      currentStreak,
      freezeCount,
      skills,
    })

    // Compute SRS Metrics
    const srsMetrics = computeSrsMetrics(rawSrsDeck)

    const dashboardData: ParentDashboardData = {
      student: {
        id: student.id,
        name: student.name,
        avatar: null,
        classroomId: classroom?.id || parentAccess.classroom_id,
        classroomName: classroom?.name || 'Lớp học',
        classCode: classroom?.code || '',
        teacherName,
        level,
        totalStars,
        currentStreak,
        longestStreak,
      },
      digest,
      skills,
      srsMetrics: {
        totalCards: srsMetrics.totalCards,
        masteredCount: srsMetrics.masteredCount,
        masteryRatePercent: srsMetrics.masteryRatePercent,
      },
      recentCertificates: (certificates || []).map((c) => ({
        id: c.id,
        title: c.title,
        certificateType: c.certificate_type,
        issuedAt: c.issued_at,
        verificationCode: c.verification_code,
      })),
      announcements,
    }

    return { success: true, data: dashboardData }
  } catch (err: unknown) {
    console.error('[getParentStudentDashboardAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi tải trang tổng quan phụ huynh' }
  }
}

/**
 * Acknowledges receipt of a classroom announcement by a parent
 */
export async function acknowledgeAnnouncementAction(
  announcementId: string,
  studentId: string,
  parentName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!announcementId?.trim() || !studentId?.trim()) {
      return { success: false, error: 'Dữ liệu xác nhận không hợp lệ' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('announcement_acknowledgments')
      .upsert(
        {
          announcement_id: announcementId.trim(),
          student_id: studentId.trim(),
          parent_name: parentName?.trim() || null,
          acknowledged_at: new Date().toISOString(),
        },
        { onConflict: 'announcement_id,student_id' }
      )

    if (error) {
      console.error('[acknowledgeAnnouncementAction] Upsert error:', error)
      return { success: false, error: 'Lỗi khi ghi nhận thông báo' }
    }

    revalidatePath('/parent')
    return { success: true }
  } catch (err: unknown) {
    console.error('[acknowledgeAnnouncementAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi xác nhận thông báo' }
  }
}

/**
 * Retrieves the roster of student parent PINs and magic links for a classroom.
 * Automatically generates access credentials for newly enrolled students if missing.
 */
export async function getClassParentsListAction(
  classroomId: string
): Promise<{ success: boolean; list?: ParentAccessInfo[]; error?: string }> {
  try {
    if (!classroomId || typeof classroomId !== 'string' || !classroomId.trim()) {
      return { success: false, error: 'Mã lớp không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để quản lý phụ huynh' }
    }

    // Check classroom ownership
    const { data: classroom, error: classErr } = await supabase
      .from('classrooms')
      .select('id, name, code')
      .eq('id', classroomId.trim())
      .eq('teacher_id', user.id)
      .maybeSingle()

    if (classErr || !classroom) {
      return { success: false, error: 'Không tìm thấy lớp học hoặc không có quyền truy cập' }
    }

    // Get all students in classroom
    const { data: students, error: studErr } = await supabase
      .from('students')
      .select('id, name, classroom_id')
      .eq('classroom_id', classroom.id)
      .order('name', { ascending: true })

    if (studErr) {
      return { success: false, error: 'Lỗi khi tải danh sách học sinh' }
    }

    const adminSupabase = createAdminClient()

    // Get existing parent access records
    const { data: accessRecords, error: accessErr } = await adminSupabase
      .from('student_parent_access')
      .select('*')
      .eq('classroom_id', classroom.id)

    if (accessErr) {
      return { success: false, error: 'Lỗi khi tải thông tin phụ huynh' }
    }

    const accessMap = new Map<string, (typeof accessRecords)[0]>()
    for (const record of accessRecords || []) {
      accessMap.set(record.student_id, record)
    }

    const resultList: ParentAccessInfo[] = []

    for (const stud of students || []) {
      let rec = accessMap.get(stud.id)

      // If student lacks parent access credentials, generate and persist automatically
      if (!rec) {
        const pin = generateParentPin()
        const token = generateParentAccessToken()

        const { data: created, error: insertErr } = await adminSupabase
          .from('student_parent_access')
          .insert({
            student_id: stud.id,
            classroom_id: classroom.id,
            access_pin: pin,
            access_token: token,
          })
          .select()
          .single()

        if (!insertErr && created) {
          rec = created
        }
      }

      if (rec) {
        resultList.push({
          studentId: stud.id,
          studentName: stud.name,
          classroomId: classroom.id,
          classroomName: classroom.name,
          classCode: classroom.code,
          accessPin: rec.access_pin,
          accessToken: rec.access_token,
          parentPhone: rec.parent_phone,
          parentName: rec.parent_name,
          lastAccessedAt: rec.last_accessed_at,
          createdAt: rec.created_at,
        })
      }
    }

    return { success: true, list: resultList }
  } catch (err: unknown) {
    console.error('[getClassParentsListAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi tải danh sách phụ huynh' }
  }
}

/**
 * Creates a classroom announcement broadcasted to all parents or targeted to a specific student
 */
export async function createClassAnnouncementAction(
  input: CreateAnnouncementInput
): Promise<{ success: boolean; announcement?: ClassroomAnnouncement; error?: string }> {
  try {
    if (!input || !input.classroomId?.trim() || !input.title?.trim() || !input.content?.trim()) {
      return { success: false, error: 'Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để tạo thông báo' }
    }

    // Verify classroom ownership
    const { data: classroom, error: classErr } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', input.classroomId.trim())
      .eq('teacher_id', user.id)
      .maybeSingle()

    if (classErr || !classroom) {
      return { success: false, error: 'Không tìm thấy lớp học hoặc không có quyền tạo thông báo' }
    }

    let targetedStudentId: string | null = null
    if (input.studentId?.trim()) {
      const { data: targetStudent, error: targetErr } = await supabase
        .from('students')
        .select('id')
        .eq('id', input.studentId.trim())
        .eq('classroom_id', classroom.id)
        .maybeSingle()

      if (targetErr || !targetStudent) {
        return { success: false, error: 'Học sinh không thuộc lớp học này' }
      }
      targetedStudentId = targetStudent.id
    }

    const { data: announcement, error: insertErr } = await supabase
      .from('classroom_announcements')
      .insert({
        classroom_id: classroom.id,
        teacher_id: user.id,
        student_id: targetedStudentId,
        title: input.title.trim(),
        content: input.content.trim(),
        category: input.category || 'announcement',
        priority: input.priority || 'normal',
      })
      .select()
      .single()

    if (insertErr || !announcement) {
      console.error('[createClassAnnouncementAction] Insert error:', insertErr)
      return { success: false, error: 'Lỗi khi lưu thông báo vào hệ thống' }
    }

    revalidatePath('/admin/parents')
    revalidatePath('/parent')

    return {
      success: true,
      announcement: {
        id: announcement.id,
        classroomId: announcement.classroom_id,
        teacherId: announcement.teacher_id,
        studentId: announcement.student_id,
        title: announcement.title,
        content: announcement.content,
        category: announcement.category as AnnouncementCategory,
        priority: announcement.priority as AnnouncementPriority,
        createdAt: announcement.created_at,
        acknowledged: false,
        acknowledgmentCount: 0,
      },
    }
  } catch (err: unknown) {
    console.error('[createClassAnnouncementAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi tạo thông báo' }
  }
}

/**
 * Deletes a classroom announcement
 */
export async function deleteClassAnnouncementAction(
  announcementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!announcementId?.trim()) {
      return { success: false, error: 'Mã thông báo không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập' }
    }

    // Verify teacher owns this announcement
    const { data: announcement, error: findErr } = await supabase
      .from('classroom_announcements')
      .select('id, classroom_id, teacher_id')
      .eq('id', announcementId.trim())
      .maybeSingle()

    if (findErr || !announcement || announcement.teacher_id !== user.id) {
      return { success: false, error: 'Không tìm thấy thông báo hoặc không có quyền xóa' }
    }

    const { error: deleteErr } = await supabase
      .from('classroom_announcements')
      .delete()
      .eq('id', announcement.id)

    if (deleteErr) {
      console.error('[deleteClassAnnouncementAction] Delete error:', deleteErr)
      return { success: false, error: 'Lỗi khi xóa thông báo' }
    }

    revalidatePath('/admin/parents')
    revalidatePath('/parent')
    return { success: true }
  } catch (err: unknown) {
    console.error('[deleteClassAnnouncementAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi xóa thông báo' }
  }
}

/**
 * Regenerates a student's parent PIN and magic link token
 */
export async function regenerateStudentParentPinAction(
  studentId: string,
  classroomId: string
): Promise<{ success: boolean; accessInfo?: ParentAccessInfo; error?: string }> {
  try {
    if (!studentId?.trim() || !classroomId?.trim()) {
      return { success: false, error: 'Thông tin học sinh hoặc lớp học không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập' }
    }

    // Check classroom ownership
    const { data: classroom, error: classErr } = await supabase
      .from('classrooms')
      .select('id, name, code')
      .eq('id', classroomId.trim())
      .eq('teacher_id', user.id)
      .maybeSingle()

    if (classErr || !classroom) {
      return { success: false, error: 'Không tìm thấy lớp học hoặc không có quyền thực hiện' }
    }

    // Check student exists
    const { data: student, error: studErr } = await supabase
      .from('students')
      .select('id, name')
      .eq('id', studentId.trim())
      .eq('classroom_id', classroom.id)
      .maybeSingle()

    if (studErr || !student) {
      return { success: false, error: 'Không tìm thấy học sinh trong lớp' }
    }

    const adminSupabase = createAdminClient()
    const newPin = generateParentPin()
    const newToken = generateParentAccessToken()

    const { data: updated, error: updateErr } = await adminSupabase
      .from('student_parent_access')
      .upsert(
        {
          student_id: student.id,
          classroom_id: classroom.id,
          access_pin: newPin,
          access_token: newToken,
        },
        { onConflict: 'student_id' }
      )
      .select()
      .single()

    if (updateErr || !updated) {
      console.error('[regenerateStudentParentPinAction] Upsert error:', updateErr)
      return { success: false, error: 'Lỗi khi cấp lại mã bảo mật phụ huynh' }
    }

    revalidatePath('/admin/parents')

    return {
      success: true,
      accessInfo: {
        studentId: student.id,
        studentName: student.name,
        classroomId: classroom.id,
        classroomName: classroom.name,
        classCode: classroom.code,
        accessPin: updated.access_pin,
        accessToken: updated.access_token,
        parentPhone: updated.parent_phone,
        parentName: updated.parent_name,
        lastAccessedAt: updated.last_accessed_at,
        createdAt: updated.created_at,
      },
    }
  } catch (err: unknown) {
    console.error('[regenerateStudentParentPinAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi cấp lại mã PIN' }
  }
}

/**
 * Fetches all announcements for a classroom with acknowledged counters for teachers
 */
export async function getClassAnnouncementsAction(
  classroomId: string
): Promise<{
  success: boolean
  announcements?: (ClassroomAnnouncement & { acknowledgedCount: number })[]
  error?: string
}> {
  try {
    if (!classroomId?.trim()) {
      return { success: false, error: 'Mã lớp học không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập' }
    }

    // Verify ownership
    const { data: classroom, error: classErr } = await supabase
      .from('classrooms')
      .select('id')
      .eq('id', classroomId.trim())
      .eq('teacher_id', user.id)
      .maybeSingle()

    if (classErr || !classroom) {
      return { success: false, error: 'Không tìm thấy lớp học hoặc không có quyền truy cập' }
    }

    const adminSupabase = createAdminClient()
    const { data: announcements, error: annErr } = await adminSupabase
      .from('classroom_announcements')
      .select('*')
      .eq('classroom_id', classroom.id)
      .order('created_at', { ascending: false })

    if (annErr) {
      return { success: false, error: 'Lỗi khi tải thông báo lớp học' }
    }

    // Fetch acknowledgment counts
    const annIds = (announcements || []).map((a: { id: string }) => a.id)
    const countMap = new Map<string, number>()

    if (annIds.length > 0) {
      const { data: acks } = await adminSupabase
        .from('announcement_acknowledgments')
        .select('announcement_id')
        .in('announcement_id', annIds)

      for (const ack of acks || []) {
        countMap.set(ack.announcement_id, (countMap.get(ack.announcement_id) || 0) + 1)
      }
    }

    const formatted = (announcements || []).map((ann: {
      id: string
      classroom_id: string
      teacher_id: string
      student_id: string | null
      title: string
      content: string
      category: string
      priority: string
      created_at: string
    }) => ({
      id: ann.id,
      classroomId: ann.classroom_id,
      teacherId: ann.teacher_id,
      studentId: ann.student_id,
      title: ann.title,
      content: ann.content,
      category: ann.category as AnnouncementCategory,
      priority: ann.priority as AnnouncementPriority,
      createdAt: ann.created_at,
      acknowledged: false,
      acknowledgedCount: countMap.get(ann.id) || 0,
    }))

    return { success: true, announcements: formatted }
  } catch (err: unknown) {
    console.error('[getClassAnnouncementsAction] Error:', err)
    return { success: false, error: 'Lỗi hệ thống khi tải thông báo' }
  }
}

