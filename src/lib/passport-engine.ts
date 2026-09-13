// src/lib/passport-engine.ts

import { STARTER_PASSPORT_STAMPS, SAMPLE_STUDENT_PASSPORT } from '@/data/passport/sample-passport'
import type { PassportStamp, GraduationCertificate, StudentPassport } from '@/types/passport'

/**
 * Return default starter stamp list for any student passport.
 */
export function getStarterStamps(): PassportStamp[] {
  return STARTER_PASSPORT_STAMPS
}

/**
 * Calculate completion percentage and check if student is eligible for digital graduation ceremony.
 * Eligibility threshold: At least 4 unlocked stamps (or >= 60%).
 */
export function calculatePassportCompletion(stamps: PassportStamp[]): {
  unlockedCount: number
  totalCount: number
  completionPercent: number
  isEligibleForGraduation: boolean
} {
  const totalCount = stamps.length
  if (totalCount === 0) {
    return { unlockedCount: 0, totalCount: 0, completionPercent: 0, isEligibleForGraduation: false }
  }

  const unlockedCount = stamps.filter((s) => s.isUnlocked).length
  const completionPercent = Math.round((unlockedCount / totalCount) * 100)
  const isEligibleForGraduation = unlockedCount >= 4 || completionPercent >= 60

  return {
    unlockedCount,
    totalCount,
    completionPercent,
    isEligibleForGraduation,
  }
}

/**
 * Unlock newly acquired stamps based on list of completed stamp IDs.
 */
export function evaluateNewStamps(
  currentStamps: PassportStamp[],
  newlyUnlockedStampIds: string[]
): PassportStamp[] {
  const idsSet = new Set(newlyUnlockedStampIds)
  return currentStamps.map((stamp) => {
    if (idsSet.has(stamp.id) && !stamp.isUnlocked) {
      return {
        ...stamp,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      }
    }
    return stamp
  })
}

/**
 * Generate official graduation certificate data model.
 */
export function createGraduationCertificate(
  studentName: string,
  stats: {
    stars?: number
    exp?: number
    quests?: number
    commendation?: string
  }
): GraduationCertificate {
  const certSuffix = Math.floor(1000 + Math.random() * 9000)
  const now = new Date().toISOString().split('T')[0]

  return {
    certificateId: `GAMEHUB-GRAD-2026-${certSuffix}`,
    studentName: studentName.trim() || 'Bé Bạn Nhỏ',
    cefrLevelAchieved: (stats.exp || 0) >= 2000 ? 'A1' : 'Pre-A1',
    totalStars: stats.stars || 45,
    totalExp: stats.exp || 2500,
    completedQuestsCount: stats.quests || 16,
    teacherCommendation:
      stats.commendation ||
      'Tốt nghiệp xuất sắc: Hoàn thành tự tin các kỹ năng đọc truyện tranh, hát vè và giao tiếp tiếng Anh!',
    issueDate: now,
  }
}

/**
 * Retrieve public shared passport by unique share token.
 */
export function getPassportByShareToken(token: string): StudentPassport | null {
  if (!token) return null
  if (token.trim().toUpperCase() === SAMPLE_STUDENT_PASSPORT.shareToken.toUpperCase()) {
    return SAMPLE_STUDENT_PASSPORT
  }
  return null
}
