import { describe, it, expect } from 'vitest'
import type {
  ParentAccessInfo,
  ClassroomAnnouncement,
  WeeklyLearningDigest,
  ParentDashboardData,
  AnnouncementCategory,
  AnnouncementPriority,
  VerifyParentAccessInput,
  CreateAnnouncementInput,
} from '@/types/parent'
import * as TypesIndex from '@/types'

describe('Parent Portal Domain Types & Contracts', () => {
  it('verifies AnnouncementCategory and AnnouncementPriority values', () => {
    const categories: AnnouncementCategory[] = [
      'announcement',
      'homework',
      'reminder',
      'kudos',
    ]
    const priorities: AnnouncementPriority[] = ['normal', 'important', 'urgent']

    expect(categories).toHaveLength(4)
    expect(priorities).toHaveLength(3)
  })

  it('verifies ParentAccessInfo contract structure', () => {
    const accessInfo: ParentAccessInfo = {
      studentId: 'stud-123',
      studentName: 'Bé Lan',
      classroomId: 'class-456',
      classroomName: 'Lớp 3A',
      classCode: 'ABCXYZ',
      accessPin: 'P-9824',
      accessToken: 'tok-abc-123-xyz',
      parentPhone: '0901234567',
      parentName: 'Mẹ Lan',
      lastAccessedAt: '2026-09-13T10:00:00.000Z',
    }

    expect(accessInfo.studentId).toBe('stud-123')
    expect(accessInfo.accessPin).toBe('P-9824')
    expect(accessInfo.accessToken).toBe('tok-abc-123-xyz')
  })

  it('verifies ClassroomAnnouncement structure', () => {
    const announcement: ClassroomAnnouncement = {
      id: 'ann-1',
      classroomId: 'class-456',
      teacherId: 'teacher-789',
      studentId: null,
      title: 'Ôn tập tuần 3',
      content: 'Các bé hoàn thành bài tập thì hiện tại đơn nhé!',
      category: 'homework',
      priority: 'important',
      createdAt: '2026-09-13T10:00:00.000Z',
      acknowledged: false,
      acknowledgmentCount: 12,
    }

    expect(announcement.category).toBe('homework')
    expect(announcement.priority).toBe('important')
    expect(announcement.acknowledgmentCount).toBe(12)
  })

  it('verifies WeeklyLearningDigest and ParentDashboardData contracts', () => {
    const digest: WeeklyLearningDigest = {
      totalMinutesSpent: 45,
      totalGamesPlayed: 8,
      starsEarnedThisWeek: 35,
      streakDays: 4,
      hasFreezeShield: true,
      strongestSkill: { name: 'Từ vựng', accuracyPercent: 95 },
      focusSkill: {
        name: 'Ngữ pháp',
        accuracyPercent: 60,
        suggestedActivity: 'Luyện thêm bài tập nối từ và trắc nghiệm thì hiện tại',
      },
      recommendedHomeTips: [
        'Cùng bé gọi tên 5 đồ vật bằng tiếng Anh trong bữa tối',
      ],
    }

    const dashboard: ParentDashboardData = {
      student: {
        id: 'stud-123',
        name: 'Bé Lan',
        classroomId: 'class-456',
        classroomName: 'Lớp 3A',
        classCode: 'ABCXYZ',
        teacherName: 'Cô Hạnh',
        level: 4,
        totalStars: 120,
        currentStreak: 4,
        longestStreak: 7,
      },
      digest,
      skills: [
        {
          skillKey: 'vocab',
          label: 'Từ vựng',
          accuracyPercent: 92,
          totalQuestions: 40,
          strengthRating: 'mastered',
        },
      ],
      srsMetrics: {
        totalCards: 50,
        masteredCount: 30,
        masteryRatePercent: 60,
      },
      recentCertificates: [
        {
          id: 'cert-1',
          title: 'Chiến Binh Từ Vựng',
          certificateType: 'vocab_master',
          issuedAt: '2026-09-10T08:00:00.000Z',
          verificationCode: 'GH-CERT-123456',
        },
      ],
      announcements: [],
    }

    expect(dashboard.student.name).toBe('Bé Lan')
    expect(dashboard.digest.totalGamesPlayed).toBe(8)
    expect(dashboard.skills[0].strengthRating).toBe('mastered')
  })

  it('verifies VerifyParentAccessInput and CreateAnnouncementInput structures', () => {
    const verifyInput: VerifyParentAccessInput = {
      token: 'tok-123',
      classCode: 'CLASS1',
      studentName: 'Bé Minh',
      accessPin: 'P-1234',
    }

    const createInput: CreateAnnouncementInput = {
      classroomId: 'class-1',
      studentId: null,
      title: 'Thông báo thi đua tuần',
      content: 'Lớp hãy cố gắng luyện tập tiếng Anh mỗi ngày nhé!',
      category: 'kudos',
      priority: 'normal',
    }

    expect(verifyInput.accessPin).toBe('P-1234')
    expect(createInput.category).toBe('kudos')
  })

  it('verifies re-export in src/types/index.ts', () => {
    // Ensuring types module exports or compiles without errors
    expect(TypesIndex).toBeDefined()
  })
})
