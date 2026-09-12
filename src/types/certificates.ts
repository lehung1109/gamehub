// src/types/certificates.ts

export type CertificateType =
  | 'vocab_master'
  | 'streak_champion'
  | 'arena_victor'
  | 'course_completion'
  | 'custom'

export interface StudentCertificate {
  id: string
  studentId: string
  classroomId: string
  certificateType: CertificateType
  title: string
  recipientName: string
  achievementText: string
  teacherName: string
  teacherNote?: string | null
  verificationCode: string
  issuedAt: string
  createdAt: string
}

export interface IssueCertificateInput {
  studentId: string
  classroomId: string
  certificateType: CertificateType
  title: string
  recipientName: string
  achievementText: string
  teacherName: string
  teacherNote?: string
}

export interface CertificateTemplate {
  type: CertificateType
  defaultTitle: string
  defaultAchievementText: string
  badgeEmoji: string
  badgeLabel: string
  accentColor: string
}
