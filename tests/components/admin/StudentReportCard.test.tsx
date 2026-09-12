// tests/components/admin/StudentReportCard.test.tsx

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentReportCard } from '@/components/admin/reports/StudentReportCard'
import type { StudentDetailedReport } from '@/types/reports'
import * as reportsActions from '@/app/actions/reports'

vi.mock('@/app/actions/reports', () => ({
  issueStudentCertificateAction: vi.fn(),
  getStudentCertificatesAction: vi.fn(),
}))

const mockReport: StudentDetailedReport = {
  studentId: 'student-1',
  studentName: 'Bé Tuệ Nhi',
  classroomName: 'Lớp 1A',
  classCode: 'CLASS1A',
  totalStars: 350,
  level: 4,
  currentStreak: 6,
  longestStreak: 8,
  totalActiveDays: 12,
  equippedFrameId: null,
  equippedTitleId: null,
  totalSessions: 15,
  overallAccuracyPercent: 88,
  skills: [
    {
      skillKey: 'vocabulary',
      label: 'Từ Vựng',
      sessionCount: 8,
      totalQuestions: 80,
      totalCorrect: 74,
      accuracyPercent: 93,
      strengthRating: 'mastered',
    },
    {
      skillKey: 'reading',
      label: 'Đọc Hiểu',
      sessionCount: 7,
      totalQuestions: 70,
      totalCorrect: 58,
      accuracyPercent: 83,
      strengthRating: 'proficient',
    },
  ],
  srsMetrics: {
    totalCards: 20,
    box1: 2,
    box2: 4,
    box3: 4,
    box4: 5,
    box5: 5,
    masteredCount: 10,
    masteryRatePercent: 50,
  },
  frequentMistakes: [
    { prompt: 'elephant', correctAnswer: 'con voi', mistakeCount: 2, gameType: 'vocab' },
  ],
  automatedTeacherRemark: 'Bé Tuệ Nhi có tinh thần học tập rất tích cực và đạt kết quả xuất sắc!',
  certificates: [
    {
      id: 'cert-prev',
      studentId: 'student-1',
      classroomId: 'class-1',
      certificateType: 'vocab_master',
      title: 'Chiến Binh Từ Vựng',
      recipientName: 'Bé Tuệ Nhi',
      achievementText: 'Đã hoàn thành 50 từ vựng',
      teacherName: 'Cô Linh',
      verificationCode: 'GH-CERT-OLD123',
      issuedAt: '2026-09-10T12:00:00Z',
      createdAt: '2026-09-10T12:00:00Z',
    },
  ],
  generatedAt: '2026-09-12T12:00:00Z',
}

describe('StudentReportCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(reportsActions.issueStudentCertificateAction).mockResolvedValue({
      success: true,
      certificate: {
        id: 'cert-new',
        studentId: 'student-1',
        classroomId: 'class-1',
        certificateType: 'streak_champion',
        title: 'Ngôi Sao Chăm Chỉ Kiên Trì',
        recipientName: 'Bé Tuệ Nhi',
        achievementText: 'Chuỗi học bền bỉ',
        teacherName: 'Cô Linh',
        verificationCode: 'GH-CERT-NEW456',
        issuedAt: '2026-09-12T12:00:00Z',
        createdAt: '2026-09-12T12:00:00Z',
      },
    })
  })

  it('renders student summary metrics and educational skill breakdown', () => {
    render(
      <StudentReportCard
        initialReport={mockReport}
        classroomId="class-1"
        teacherName="Cô Linh"
      />
    )

    expect(screen.getByText('Bé Tuệ Nhi')).toBeInTheDocument()
    expect(screen.getByText(/Lớp 1A/)).toBeInTheDocument()
    expect(screen.getByText('350')).toBeInTheDocument() // stars
    expect(screen.getByText('Từ Vựng')).toBeInTheDocument()
    expect(screen.getByText('Đọc Hiểu')).toBeInTheDocument()
    expect(screen.getByText('elephant')).toBeInTheDocument() // frequent mistake
    expect(screen.getByText(/Chiến Binh Từ Vựng/)).toBeInTheDocument() // issued cert
  })

  it('opens issue certificate modal when clicking issue button', () => {
    render(
      <StudentReportCard
        initialReport={mockReport}
        classroomId="class-1"
        teacherName="Cô Linh"
      />
    )

    const issueBtn = screen.getByRole('button', { name: /cấp giấy khen/i })
    fireEvent.click(issueBtn)

    expect(
      screen.getByRole('heading', { name: /cấp giấy khen cho/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /xác nhận cấp giấy khen/i })).toBeInTheDocument()
  })
})
