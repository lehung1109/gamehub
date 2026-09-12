// tests/components/dashboard/ClassOverviewGamification.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ClassOverview } from '@/components/dashboard/ClassOverview'
import { StudentDetail } from '@/components/dashboard/StudentDetail'
import type { ClassDashboardData, StudentDashboardData } from '@/app/actions/classes'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('ClassOverview Gamification Badges', () => {
  const mockDataWithGamification = {
    classroom: { id: 'c-1', name: 'Lớp 1A', code: 'ABC1234', is_active: true, teacher_id: 't-1', created_at: '' },
    totalStudents: 1,
    totalSessions: 5,
    overallAvgScorePercent: 90,
    mostPlayedGame: null,
    gameStats: [],
    students: [
      {
        id: 's-1',
        name: 'Nguyen Van A',
        sessionCount: 5,
        avgScorePercent: 90,
        lastActiveAt: null,
        currentStreak: 5,
        equippedTitleId: 'title_speed',
        equippedFrameId: 'frame_gold',
      },
    ],
    recentSessions: [],
    timeframe: 'all' as const,
    difficultWords: [],
  }

  it('renders student streak flames and equipped title when present', () => {
    render(<ClassOverview data={mockDataWithGamification as unknown as ClassDashboardData} />)
    expect(screen.getByText(/5 ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/Thần Tốc Độ/i)).toBeInTheDocument()
  })

  it('renders "Chuỗi học tập đỉnh nhất" highlight card when active streaks exist', () => {
    render(<ClassOverview data={mockDataWithGamification as unknown as ClassDashboardData} />)
    expect(screen.getByText(/Chuỗi học tập đỉnh nhất/i)).toBeInTheDocument()
    expect(screen.getAllByText(/5 ngày/i).length).toBeGreaterThanOrEqual(1)
  })

  it('does not render "Chuỗi học tập đỉnh nhất" card when no students have active streak', () => {
    const mockDataNoStreak = {
      ...mockDataWithGamification,
      students: [
        {
          id: 's-1',
          name: 'Nguyen Van A',
          sessionCount: 5,
          avgScorePercent: 90,
          lastActiveAt: null,
          currentStreak: 0,
          equippedTitleId: null,
          equippedFrameId: null,
        },
      ],
    }
    render(<ClassOverview data={mockDataNoStreak as unknown as ClassDashboardData} />)
    expect(screen.queryByText(/Chuỗi học tập đỉnh nhất/i)).not.toBeInTheDocument()
  })

  it('renders student detail with active streak flame, equipped frame, and title badge', () => {
    const mockStudentData = {
      classroom: { id: 'c-1', name: 'Lớp 1A', code: 'ABC1234', is_active: true, teacher_id: 't-1', created_at: '' },
      student: { id: 's-1', name: 'Nguyen Van A', classroom_id: 'c-1', created_at: '' },
      totalSessions: 5,
      avgScorePercent: 90,
      mostPlayedGame: null,
      lastActiveAt: null,
      sessions: [],
      difficultWords: [],
      timeframe: 'all' as const,
      currentStreak: 5,
      equippedTitleId: 'title_speed',
      equippedFrameId: 'frame_gold',
    }

    render(<StudentDetail data={mockStudentData as unknown as StudentDashboardData} />)
    expect(screen.getByText(/5 ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/Thần Tốc Độ/i)).toBeInTheDocument()
  })
})
