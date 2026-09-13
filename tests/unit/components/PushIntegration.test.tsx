// tests/unit/components/PushIntegration.test.tsx

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ParentDashboardView } from '@/components/parent/ParentDashboardView'
import { ParentAccessManager } from '@/components/admin/ParentAccessManager'
import * as pushHook from '@/hooks/usePushNotification'
import type { ParentDashboardData, ParentAccessInfo, ClassroomAnnouncement } from '@/types/parent'

vi.mock('@/hooks/usePushNotification', () => ({
  usePushNotification: vi.fn(),
}))

vi.mock('@/app/actions/push', () => ({
  sendClassAnnouncementPushAction: vi.fn().mockResolvedValue({
    success: true,
    sentCount: 3,
    failedCount: 0,
  }),
}))

const sampleDashboardData: ParentDashboardData = {
  student: {
    id: 'stud-123',
    name: 'Bé An Nhiên',
    avatar: '🐰',
    classroomId: 'class-1',
    classroomName: 'Lớp 2B',
    classCode: 'L2B2026',
    teacherName: 'Cô Mai',
    level: 5,
    totalStars: 420,
    currentStreak: 7,
    longestStreak: 14,
  },
  parentToken: 'token-an-nhien-xyz',
  digest: {
    totalMinutesSpent: 65,
    totalGamesPlayed: 18,
    starsEarnedThisWeek: 95,
    streakDays: 7,
    hasFreezeShield: true,
    strongestSkill: { name: 'Từ vựng Động vật', accuracyPercent: 95 },
    focusSkill: {
      name: 'Số đếm',
      accuracyPercent: 68,
      suggestedActivity: 'Ôn tập thẻ Flashcard Số đếm',
    },
    recommendedHomeTips: ['Cùng bé đếm đồ vật bằng tiếng Anh'],
  },
  skills: [
    {
      skillKey: 'animals',
      label: 'Từ vựng Động vật',
      accuracyPercent: 95,
      totalQuestions: 40,
      strengthRating: 'mastered',
    },
  ],
  srsMetrics: {
    totalCards: 20,
    masteredCount: 16,
    masteryRatePercent: 80,
  },
  recentCertificates: [],
  announcements: [],
}

const sampleParents: ParentAccessInfo[] = [
  {
    studentId: 'stud-1',
    studentName: 'Bé An Nhiên',
    classroomId: 'class-1',
    classroomName: 'Lớp 2B',
    classCode: 'L2B2026',
    accessPin: 'PIN123',
    accessToken: 'token-1',
    lastAccessedAt: '2026-09-13T10:00:00Z',
  },
]

const sampleAnnouncements: (ClassroomAnnouncement & { acknowledgedCount: number })[] = [
  {
    id: 'ann-1',
    classroomId: 'class-1',
    teacherId: 'teacher-1',
    studentId: null,
    title: 'Dặn dò chuẩn bị kiểm tra giữa kỳ',
    content: 'Quý phụ huynh nhắc bé ôn các bài học từ bài 1 đến 5.',
    category: 'reminder',
    priority: 'important',
    createdAt: '2026-09-13T08:00:00Z',
    acknowledgedCount: 1,
  },
]

describe('Push Notifications Shell & Parent/Teacher Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(pushHook.usePushNotification).mockReturnValue({
      isSupported: true,
      permission: 'granted',
      isSubscribed: true,
      isLoading: false,
      subscription: {
        endpoint: 'https://push.com/device1',
        keys: { p256dh: 'k1', auth: 'a1' },
      },
      preferences: {
        daily_streak: true,
        srs_review: true,
        teacher_announcement: true,
        preferred_hour: 19,
      },
      error: null,
      subscribe: vi.fn().mockResolvedValue(true),
      unsubscribe: vi.fn().mockResolvedValue(true),
      updatePreferences: vi.fn().mockResolvedValue(true),
      sendTestPush: vi.fn().mockResolvedValue(true),
      refresh: vi.fn().mockResolvedValue(undefined),
    })
  })

  describe('ParentDashboardView Integration', () => {
    it('renders Section 5 for Push Notification settings with PushPreferencesCard', () => {
      render(<ParentDashboardView initialData={sampleDashboardData} />)

      expect(
        screen.getByRole('heading', { name: /Cài Đặt Nhắc Nhở & Thông Báo Đẩy/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Cài đặt Thông báo & Lời nhắc')
      ).toBeInTheDocument()
      expect(screen.getByText('Đang nhận thông báo')).toBeInTheDocument()
    })
  })

  describe('ParentAccessManager Integration', () => {
    it('renders "Gửi Push" button for published announcements and triggers push broadcast', async () => {
      const onSendPushMock = vi.fn().mockResolvedValue({
        success: true,
        sentCount: 5,
        failedCount: 0,
      })

      render(
        <ParentAccessManager
          classroomId="class-1"
          classroomName="Lớp 2B"
          classCode="L2B2026"
          parents={sampleParents}
          announcements={sampleAnnouncements}
          onSendPushAnnouncement={onSendPushMock}
        />
      )

      const pushBtn = screen.getByRole('button', { name: /Gửi Push/i })
      expect(pushBtn).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(pushBtn)
      })

      expect(onSendPushMock).toHaveBeenCalledWith('ann-1')
      expect(
        screen.getByText('Đã phát thông báo đẩy tới 5 thiết bị phụ huynh!')
      ).toBeInTheDocument()
    })

    it('renders Web Push instant toggle inside announcement creation modal', () => {
      render(
        <ParentAccessManager
          classroomId="class-1"
          classroomName="Lớp 2B"
          classCode="L2B2026"
          parents={sampleParents}
          announcements={sampleAnnouncements}
        />
      )

      const createBtn = screen.getByText('Tạo thông báo mới')
      fireEvent.click(createBtn)

      expect(
        screen.getByText(/Gửi thông báo đẩy \(Web Push\) tới phụ huynh ngay khi đăng/i)
      ).toBeInTheDocument()
    })
  })
})
