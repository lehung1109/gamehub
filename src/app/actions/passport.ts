// src/app/actions/passport.ts
'use server'

import {
  SAMPLE_STUDENT_PASSPORT,
  STARTER_PASSPORT_STAMPS,
} from '@/data/passport/sample-passport'
import {
  evaluateNewStamps,
  createGraduationCertificate,
  getPassportByShareToken,
} from '@/lib/passport-engine'
import type { StudentPassport, GraduationCertificate } from '@/types/passport'

export interface PassportActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch a student's learning passport state.
 */
export async function getStudentPassportAction(
  studentId: string
): Promise<PassportActionResult<StudentPassport>> {
  if (!studentId) {
    return { success: false, error: 'Mã học sinh không hợp lệ.' }
  }

  // Return sample passport for demo/testing or fallback
  return {
    success: true,
    data: {
      ...SAMPLE_STUDENT_PASSPORT,
      studentId,
    },
  }
}

/**
 * Unlock / claim a specific passport stamp for a student.
 */
export async function claimPassportStampAction(
  studentId: string,
  stampId: string
): Promise<PassportActionResult<StudentPassport>> {
  if (!studentId || !stampId) {
    return { success: false, error: 'Thông tin mở khóa huy hiệu không hợp lệ.' }
  }

  const updatedStamps = evaluateNewStamps(STARTER_PASSPORT_STAMPS, [stampId])

  return {
    success: true,
    data: {
      ...SAMPLE_STUDENT_PASSPORT,
      studentId,
      stamps: updatedStamps,
    },
  }
}

/**
 * Trigger digital graduation ceremony and generate official certificate.
 */
export async function triggerGraduationAction(
  studentId: string,
  studentName: string
): Promise<PassportActionResult<GraduationCertificate>> {
  if (!studentId) {
    return { success: false, error: 'Học sinh không hợp lệ.' }
  }

  const certificate = createGraduationCertificate(studentName || 'Bé Bạn Nhỏ', {
    stars: 48,
    exp: 2850,
    quests: 18,
    commendation:
      'Tốt nghiệp xuất sắc: Hoàn thành tự tin các kỹ năng đọc truyện tranh, hát vè và giao tiếp tiếng Anh!',
  })

  return {
    success: true,
    data: certificate,
  }
}

/**
 * Retrieve public shared passport showcase via share token.
 */
export async function getSharedPassportAction(
  shareToken: string
): Promise<PassportActionResult<StudentPassport>> {
  if (!shareToken) {
    return { success: false, error: 'Mã chia sẻ không hợp lệ.' }
  }

  const passport = getPassportByShareToken(shareToken)
  if (!passport) {
    return { success: false, error: 'Không tìm thấy hồ sơ học tập này.' }
  }

  return {
    success: true,
    data: passport,
  }
}
