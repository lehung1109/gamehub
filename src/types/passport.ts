// src/types/passport.ts

export type StampCategory = 'games' | 'speaking' | 'stories' | 'chants' | 'guilds'

export interface PassportStamp {
  id: string
  category: StampCategory
  titleVi: string
  titleEn: string
  icon: string
  isUnlocked: boolean
  unlockedAt?: string
  criteriaVi: string
}

export interface VoicePortfolioItem {
  id: string
  titleVi: string
  type: 'story-dialogue' | 'phonics-chant' | 'ai-conversation'
  audioSampleText: string
  accuracyPercent: number
  recordedAt: string
  durationSeconds: number
}

export interface GraduationCertificate {
  certificateId: string
  studentName: string
  cefrLevelAchieved: 'Pre-A1' | 'A1' | 'A2'
  totalStars: number
  totalExp: number
  completedQuestsCount: number
  teacherCommendation: string
  issueDate: string
}

export interface StudentPassport {
  studentId: string
  studentName: string
  avatar: string
  gradeLevel: string
  stamps: PassportStamp[]
  voiceRecordings: VoicePortfolioItem[]
  certificate?: GraduationCertificate
  shareToken: string
}
