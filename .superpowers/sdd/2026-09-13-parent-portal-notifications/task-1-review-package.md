# Task 1 Review Package

## Files Added / Modified
- `src/types/parent.ts` (created)
- `src/types/index.ts` (modified - re-exported `./parent`)
- `tests/unit/types/parent-types.test.ts` (created)

## Content of `src/types/parent.ts`:
```typescript
export type AnnouncementCategory = 'announcement' | 'homework' | 'reminder' | 'kudos'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'

export interface ParentAccessInfo {
  studentId: string
  studentName: string
  classroomId: string
  classroomName: string
  classCode: string
  accessPin: string
  accessToken: string
  parentPhone?: string | null
  parentName?: string | null
  lastAccessedAt?: string | null
  createdAt?: string
}

export interface ClassroomAnnouncement {
  id: string
  classroomId: string
  teacherId: string
  studentId?: string | null
  title: string
  content: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  createdAt: string
  acknowledged?: boolean
  acknowledgedAt?: string | null
  acknowledgmentCount?: number
}

export interface WeeklyLearningDigest {
  totalMinutesSpent: number
  totalGamesPlayed: number
  starsEarnedThisWeek: number
  streakDays: number
  hasFreezeShield: boolean
  strongestSkill: { name: string; accuracyPercent: number }
  focusSkill: { name: string; accuracyPercent: number; suggestedActivity: string }
  recommendedHomeTips: string[]
}

export interface ParentDashboardData {
  student: {
    id: string
    name: string
    avatar?: string | null
    classroomId: string
    classroomName: string
    classCode: string
    teacherName: string
    level: number
    totalStars: number
    currentStreak: number
    longestStreak: number
  }
  digest: WeeklyLearningDigest
  skills: Array<{
    skillKey: string
    label: string
    accuracyPercent: number
    totalQuestions: number
    strengthRating: 'mastered' | 'proficient' | 'developing' | 'needs_practice'
  }>
  srsMetrics: {
    totalCards: number
    masteredCount: number
    masteryRatePercent: number
  }
  recentCertificates: Array<{
    id: string
    title: string
    certificateType: string
    issuedAt: string
    verificationCode: string
  }>
  announcements: ClassroomAnnouncement[]
}

export interface VerifyParentAccessInput {
  token?: string
  classCode?: string
  studentName?: string
  accessPin?: string
}

export interface CreateAnnouncementInput {
  classroomId: string
  studentId?: string | null
  title: string
  content: string
  category?: AnnouncementCategory
  priority?: AnnouncementPriority
}
```

## Vitest Results:
`tests/unit/types/parent-types.test.ts` passed (5/5 tests).
`npx tsc --noEmit` passed with 0 errors.
