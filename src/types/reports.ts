// src/types/reports.ts

import type { StudentCertificate } from './certificates'

export interface SkillPerformance {
  skillKey: string
  label: string
  sessionCount: number
  totalQuestions: number
  totalCorrect: number
  accuracyPercent: number
  strengthRating: 'mastered' | 'proficient' | 'developing' | 'needs_practice'
}

export interface SrsBoxMetrics {
  totalCards: number
  box1: number
  box2: number
  box3: number
  box4: number
  box5: number
  masteredCount: number // box 4 + 5
  masteryRatePercent: number
}

export interface StudentDetailedReport {
  studentId: string
  studentName: string
  classroomName: string
  classCode: string
  totalStars: number
  level: number
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  equippedFrameId: string | null
  equippedTitleId: string | null
  totalSessions: number
  overallAccuracyPercent: number
  skills: SkillPerformance[]
  srsMetrics: SrsBoxMetrics
  frequentMistakes: Array<{
    prompt: string
    correctAnswer: string
    mistakeCount: number
    gameType: string
  }>
  automatedTeacherRemark: string
  customTeacherRemarks?: string | null
  certificates: StudentCertificate[]
  generatedAt: string
}
