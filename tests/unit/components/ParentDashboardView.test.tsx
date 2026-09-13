import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ParentDashboardView } from '@/components/parent/ParentDashboardView'
import { WeeklyDigestCard } from '@/components/parent/WeeklyDigestCard'
import { ParentNoticeBoard } from '@/components/parent/ParentNoticeBoard'
import { ParentAuthForm } from '@/components/parent/ParentAuthForm'
import type { ParentDashboardData } from '@/types/parent'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}))

describe('Parent Portal UI Components', () => {
  const sampleDashboardData: ParentDashboardData = {
    student: {
      id: 'stud-1',
      name: 'Bé Linh Đan',
      avatar: null,
      classroomId: 'class-1',
      classroomName: 'Lớp 3A',
      classCode: 'ABC123',
      teacherName: 'Cô Thu Hằng',
      level: 4,
      totalStars: 180,
      currentStreak: 5,
      longestStreak: 8,
    },
    digest: {
      totalMinutesSpent: 45,
      totalGamesPlayed: 9,
      starsEarnedThisWeek: 45,
      streakDays: 5,
      hasFreezeShield: true,
      strongestSkill: { name: 'Từ vựng', accuracyPercent: 92 },
      focusSkill: {
        name: 'Ngữ pháp',
        accuracyPercent: 65,
        suggestedActivity: 'Luyện tập thêm bài tập đặt câu hỏi thì hiện tại đơn',
      },
      recommendedHomeTips: [
        'Cùng bé gọi tên 5 món đồ trong phòng khách bằng tiếng Anh',
        'Luyện phát âm từ mới 5 phút trước giờ ngủ',
      ],
    },
    skills: [
      {
        skillKey: 'vocab',
        label: 'Từ Vựng',
        accuracyPercent: 92,
        totalQuestions: 40,
        strengthRating: 'mastered',
      },
      {
        skillKey: 'grammar',
        label: 'Ngữ Pháp',
        accuracyPercent: 65,
        totalQuestions: 20,
        strengthRating: 'developing',
      },
    ],
    srsMetrics: {
      totalCards: 60,
      masteredCount: 38,
      masteryRatePercent: 63,
    },
    recentCertificates: [
      {
        id: 'cert-1',
        title: 'Chiến Binh Từ Vựng',
        certificateType: 'vocab_master',
        issuedAt: '2026-09-10T08:00:00.000Z',
        verificationCode: 'GH-CERT-998877',
      },
    ],
    announcements: [
      {
        id: 'ann-1',
        classroomId: 'class-1',
        teacherId: 'teacher-1',
        studentId: null,
        title: 'Ôn tập chủ đề Gia đình',
        content: 'Các bé hoàn thành các bài học trước thứ Sáu nhé!',
        category: 'homework',
        priority: 'important',
        createdAt: '2026-09-12T10:00:00.000Z',
        acknowledged: false,
      },
      {
        id: 'ann-2',
        classroomId: 'class-1',
        teacherId: 'teacher-1',
        studentId: 'stud-1',
        title: 'Khen ngợi bé Linh Đan',
        content: 'Bé đã rất tích cực phát biểu trong tiết học hôm nay!',
        category: 'kudos',
        priority: 'normal',
        createdAt: '2026-09-11T09:00:00.000Z',
        acknowledged: true,
      },
    ],
  }

  describe('WeeklyDigestCard', () => {
    it('renders weekly summary metrics, streak, and pedagogical tips', () => {
      render(<WeeklyDigestCard digest={sampleDashboardData.digest} />)

      expect(screen.getByText('Tổng thời gian')).toBeInTheDocument()
      expect(screen.getByText('45 phút')).toBeInTheDocument()
      expect(screen.getByText('9 ván')).toBeInTheDocument()
      expect(screen.getByText('5 ngày')).toBeInTheDocument()
      expect(screen.getByText('Từ vựng')).toBeInTheDocument()
      expect(screen.getByText('Ngữ pháp')).toBeInTheDocument()
      expect(
        screen.getByText(/Cùng bé gọi tên 5 món đồ trong phòng khách/i)
      ).toBeInTheDocument()
    })
  })

  describe('ParentNoticeBoard', () => {
    it('renders announcements with category badges and acknowledgment buttons', async () => {
      const onAcknowledge = vi.fn()
      render(
        <ParentNoticeBoard
          announcements={sampleDashboardData.announcements}
          studentId="stud-1"
          onAcknowledge={onAcknowledge}
        />
      )

      expect(screen.getByText('Ôn tập chủ đề Gia đình')).toBeInTheDocument()
      expect(screen.getByText('Khen ngợi bé Linh Đan')).toBeInTheDocument()
      expect(screen.getByText('Bài tập về nhà')).toBeInTheDocument()
      expect(screen.getByText('Khen thưởng')).toBeInTheDocument()

      // One is unacknowledged, one is acknowledged
      expect(screen.getByRole('button', { name: /Xác nhận đã đọc/i })).toBeInTheDocument()
      expect(screen.getByText(/Đã xác nhận/i)).toBeInTheDocument()

      await React.act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Xác nhận đã đọc/i }))
      })
      expect(onAcknowledge).toHaveBeenCalledWith('ann-1')
    })
  })

  describe('ParentDashboardView', () => {
    it('renders child info, teacher attribution, digest, skills, and notice board', () => {
      render(<ParentDashboardView initialData={sampleDashboardData} />)

      expect(screen.getByText('Bé Linh Đan')).toBeInTheDocument()
      expect(screen.getByText('Lớp 3A')).toBeInTheDocument()
      expect(screen.getByText(/Cô Thu Hằng/i)).toBeInTheDocument()
      expect(screen.getByText('Chiến Binh Từ Vựng')).toBeInTheDocument()
      expect(screen.getByText('GH-CERT-998877')).toBeInTheDocument()
      expect(screen.getAllByText(/Trí nhớ dài hạn/i).length).toBeGreaterThan(0)
    })

    it('complies strictly with the min-16px font size policy (no sub-16px typography)', () => {
      const { container } = render(
        <ParentDashboardView initialData={sampleDashboardData} />
      )

      // Regex matching any prohibited sub-16px class
      const prohibitedRegex = /\b(text-xs|text-sm|text-\[1[0-4]px\]|text-\[[0-9]px\])\b/
      const allElements = container.querySelectorAll('*')

      const violations: string[] = []
      allElements.forEach((el) => {
        const className = el.getAttribute('class') || ''
        if (prohibitedRegex.test(className)) {
          violations.push(`${el.tagName}: ${className}`)
        }
      })

      expect(violations).toEqual([])
    })
  })

  describe('ParentAuthForm', () => {
    it('renders input fields for PIN login and toggles to token mode', () => {
      render(<ParentAuthForm />)

      expect(screen.getByLabelText(/Mã Lớp Học/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tên Của Bé/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Mã Bảo Mật Phụ Huynh/i)).toBeInTheDocument()

      // Toggle to token mode
      fireEvent.click(screen.getByRole('button', { name: /Mã Liên Kết Trực Tiếp/i }))
      expect(screen.getByLabelText(/Mã Liên Kết Hoặc Đường Link/i)).toBeInTheDocument()
    })

    it('complies strictly with the min-16px font size policy', () => {
      const { container } = render(<ParentAuthForm />)

      const prohibitedRegex = /\b(text-xs|text-sm|text-\[1[0-4]px\]|text-\[[0-9]px\])\b/
      const allElements = container.querySelectorAll('*')

      const violations: string[] = []
      allElements.forEach((el) => {
        const className = el.getAttribute('class') || ''
        if (prohibitedRegex.test(className)) {
          violations.push(`${el.tagName}: ${className}`)
        }
      })

      expect(violations).toEqual([])
    })
  })
})
